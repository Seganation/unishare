"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  BookOpen,
  Calendar,
  Eye,
  Clock,
  Tag,
  X,
  TrendingUp,
} from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { ArticleNav } from "~/components/articles/article-nav";

function ArticlesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") ?? "1");
  const currentTag = searchParams.get("tag") ?? undefined;
  const currentSearch = searchParams.get("search") ?? "";

  const [searchInput, setSearchInput] = useState(currentSearch);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to clear search when search input is focused
      if (e.key === "Escape" && searchInput) {
        setSearchInput("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchInput]);

  // Fetch articles
  const { data, isLoading } = api.article.getAllPublished.useQuery({
    page: currentPage,
    limit: 12,
    tagSlug: currentTag,
    search: currentSearch || undefined,
  });

  // Fetch tags
  const { data: tags } = api.article.getAllTags.useQuery();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ search: searchInput, page: 1 });
  };

  const handleTagFilter = (tagSlug: string) => {
    if (tagSlug === "all") {
      updateUrl({ tag: undefined, page: 1 });
    } else {
      updateUrl({ tag: tagSlug, page: 1 });
    }
  };

  const handlePageChange = (page: number) => {
    updateUrl({ page });
  };

  const updateUrl = (params: {
    search?: string;
    tag?: string;
    page?: number;
  }) => {
    const newParams = new URLSearchParams(searchParams);

    if (params.search !== undefined) {
      if (params.search) {
        newParams.set("search", params.search);
      } else {
        newParams.delete("search");
      }
    }

    if (params.tag !== undefined) {
      if (params.tag) {
        newParams.set("tag", params.tag);
      } else {
        newParams.delete("tag");
      }
    }

    if (params.page !== undefined) {
      newParams.set("page", params.page.toString());
    }

    router.push(`/articles?${newParams.toString()}`);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <ArticleNav />
      {/* Hero Header */}
      <div className="border-b bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <h1 className="text-4xl font-black text-gray-900 md:text-5xl dark:text-white">
                UNIShare Articles
              </h1>
            </div>
            <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              Discover articles shared by students across Malaysian universities
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search articles by title, content, or tags..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pr-10 pl-10"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      if (currentSearch) {
                        updateUrl({ search: "", page: 1 });
                      }
                    }}
                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                    aria-label="Clear search"
                  >
                    <X className="h-3 w-3 text-gray-400" />
                  </button>
                )}
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Searching...
                  </>
                ) : (
                  "Search"
                )}
              </Button>
            </form>

            {/* Tag Filter */}
            <Select value={currentTag ?? "all"} onValueChange={handleTagFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {tags?.map((tag) => (
                  <SelectItem key={tag.id} value={tag.slug}>
                    {tag.name} ({tag._count.articles})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {(currentSearch || currentTag) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Filters:
              </span>
              {currentSearch && (
                <Badge variant="secondary" className="gap-1 px-3 py-1">
                  <Search className="h-3 w-3" />
                  &quot;{currentSearch}&quot;
                  <button
                    onClick={() => {
                      setSearchInput("");
                      updateUrl({ search: "", page: 1 });
                    }}
                    className="ml-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
                    aria-label="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {currentTag && (
                <Badge variant="secondary" className="gap-1 px-3 py-1">
                  <Tag className="h-3 w-3" />
                  {tags?.find((t) => t.slug === currentTag)?.name}
                  <button
                    onClick={() => updateUrl({ tag: undefined, page: 1 })}
                    className="ml-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
                    aria-label="Clear tag filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <button
                onClick={() => {
                  setSearchInput("");
                  updateUrl({ search: "", tag: undefined, page: 1 });
                }}
                className="text-sm text-purple-600 underline hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results Counter */}
          {!isLoading && data && (currentSearch || currentTag) && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <TrendingUp className="h-4 w-4" />
              <span>
                Found{" "}
                <strong className="font-semibold text-gray-900 dark:text-gray-100">
                  {data.pagination.total}
                </strong>{" "}
                article{data.pagination.total !== 1 ? "s" : ""}
                {currentSearch && ` matching "${currentSearch}"`}
                {currentTag &&
                  ` in ${tags?.find((t) => t.slug === currentTag)?.name}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="container mx-auto max-w-7xl px-4 py-12">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <ArticleSkeleton key={i} />
            ))}
          </div>
        ) : data?.articles && data.articles.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="group overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md dark:bg-gray-900"
                >
                  {/* Cover Image */}
                  {article.coverImage ? (
                    <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900" />
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="mb-2 line-clamp-2 text-xl font-bold text-gray-900 group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400">
                      {article.title}
                    </h2>

                    {article.excerpt && (
                      <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                        {article.excerpt}
                      </p>
                    )}

                    {/* Tags */}
                    {article.tags.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {article.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="text-xs"
                          >
                            <Tag className="mr-1 h-3 w-3" />
                            {tag.name}
                          </Badge>
                        ))}
                        {article.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{article.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(article.publishedAt)}
                      </div>
                      {article.readTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.readTime} min
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.views}
                      </div>
                    </div>

                    {/* Author */}
                    <div className="mt-4 flex items-center gap-2 border-t pt-4">
                      <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900">
                        {article.author.profileImage ? (
                          <img
                            src={article.author.profileImage}
                            alt={article.author.name}
                            className="h-full w-full rounded-full"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-purple-600 dark:text-purple-400">
                            {article.author.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {article.author.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {[...Array(data.pagination.totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Show first, last, current, and adjacent pages
                    if (
                      page === 1 ||
                      page === data.pagination.totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return <span key={page}>...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  disabled={currentPage === data.pagination.totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              {currentSearch || currentTag
                ? "No articles found"
                : "No articles yet"}
            </h3>
            <p className="mb-4 max-w-md text-gray-600 dark:text-gray-400">
              {currentSearch || currentTag ? (
                <>
                  We couldn&apos;t find any articles matching your search.
                  <br />
                  Try adjusting your filters or search terms.
                </>
              ) : (
                "Be the first to publish an article and share your knowledge!"
              )}
            </p>
            {(currentSearch || currentTag) && (
              <Button
                onClick={() => {
                  setSearchInput("");
                  updateUrl({ search: "", tag: undefined, page: 1 });
                }}
                variant="outline"
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-white dark:bg-gray-900">
      <Skeleton className="aspect-video w-full" />
      <div className="p-6">
        <Skeleton className="mb-2 h-6 w-3/4" />
        <Skeleton className="mb-4 h-4 w-full" />
        <Skeleton className="mb-4 h-4 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="mt-4 flex items-center gap-2 border-t pt-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

export default function ArticlesPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <ArticleSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <ArticlesContent />
    </Suspense>
  );
}
