"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Eye,
  Clock,
  Tag,
  ArrowLeft,
  Edit,
  Archive,
  Trash2,
} from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { ArticleViewer } from "~/components/articles/article-viewer";
import { ArticleNav } from "~/components/articles/article-nav";
import { toast } from "sonner";

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Fetch article - only if slug is a valid string
  const { data: article, isLoading } = api.article.getBySlug.useQuery(
    { slug: slug ?? "" },
    { enabled: typeof slug === "string" && slug.length > 0 }
  );

  // Increment views mutation
  const incrementViews = api.article.incrementViews.useMutation();

  // Delete mutation
  const deleteMutation = api.article.delete.useMutation({
    onSuccess: () => {
      toast.success("Article deleted successfully");
      router.push("/my-articles");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Archive mutation
  const archiveMutation = api.article.archive.useMutation({
    onSuccess: () => {
      toast.success("Article archived");
      router.push("/my-articles");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Increment views on mount (only for published articles)
  useEffect(() => {
    if (article && article.status === "PUBLISHED" && !article.isAuthor) {
      incrementViews.mutate({ slug });
    }
  }, [article?.id]);

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return <ArticleSkeleton />;
  }

  if (!article) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold">Article not found</h1>
          <p className="mb-4 text-gray-600">
            The article you're looking for doesn't exist.
          </p>
          <Link href="/articles">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Articles
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <ArticleNav />
      {/* Cover Image */}
      {article.coverImage && (
        <div className="relative h-[400px] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={article.coverImage}
            alt={article.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Back Button */}
        <Link href="/articles">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Button>
        </Link>

        {/* Status Badge (for authors) */}
        {article.isAuthor && article.status !== "PUBLISHED" && (
          <Badge
            variant={article.status === "DRAFT" ? "secondary" : "outline"}
            className="mb-4"
          >
            {article.status}
          </Badge>
        )}

        {/* Title */}
        <h1 className="mb-4 text-4xl font-black text-gray-900 dark:text-white md:text-5xl">
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="mb-6 text-xl text-gray-600 dark:text-gray-400">
            {article.excerpt}
          </p>
        )}

        {/* Meta Info */}
        <div className="mb-6 flex flex-wrap items-center gap-4 border-b pb-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900">
              {article.author.profileImage ? (
                <img
                  src={article.author.profileImage}
                  alt={article.author.name}
                  className="h-full w-full rounded-full"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-purple-600 dark:text-purple-400">
                  {article.author.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {article.author.name}
              </p>
              <p className="text-xs">{article.author.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(article.publishedAt ?? article.createdAt)}
          </div>

          {article.readTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {article.readTime} min read
            </div>
          )}

          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {article.views} views
          </div>
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Link key={tag.id} href={`/articles?tag=${tag.slug}`}>
                <Badge variant="outline" className="gap-1 hover:bg-gray-100">
                  <Tag className="h-3 w-3" />
                  {tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Author Actions */}
        {article.isAuthor && (
          <div className="mb-8 flex flex-wrap gap-2 rounded-lg border bg-gray-50 p-4 dark:bg-gray-900">
            <Link href={`/my-articles/${article.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit Article
              </Button>
            </Link>

            {article.status === "PUBLISHED" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Archive this article?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This article will no longer be visible to the public. You
                      can un-archive it later.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => archiveMutation.mutate({ id: article.id })}
                    >
                      Archive
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this article?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your article.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate({ id: article.id })}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ArticleViewer content={article.content} />
        </div>
      </div>
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <Skeleton className="h-[400px] w-full" />
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Skeleton className="mb-6 h-10 w-32" />
        <Skeleton className="mb-4 h-12 w-3/4" />
        <Skeleton className="mb-6 h-6 w-full" />
        <div className="mb-6 flex gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}
