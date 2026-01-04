"use client";

import Link from "next/link";
import {
  Plus,
  FileText,
  Eye,
  Calendar,
  Edit,
  Sparkles,
  Zap,
  PenTool,
  TrendingUp,
  Send,
  Clock,
  Tag,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function MyArticlesPage() {
  const router = useRouter();

  // Fetch user's articles
  const { data: allArticles = [], refetch } =
    api.article.getMyArticles.useQuery({});

  // Publish mutation
  const publishMutation = api.article.publish.useMutation({
    onSuccess: (data) => {
      toast.success("Article published!");
      refetch();
      router.push(`/articles/${data.slug}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const draftArticles = allArticles.filter((a) => a.status === "DRAFT");
  const publishedArticles = allArticles.filter((a) => a.status === "PUBLISHED");
  const archivedArticles = allArticles.filter((a) => a.status === "ARCHIVED");

  const stats = [
    {
      label: "Drafts",
      value: draftArticles.length,
      icon: PenTool,
      color: "from-yellow-500 to-orange-600",
      bgColor: "from-yellow-50 to-orange-50",
      iconBg: "bg-gradient-to-br from-yellow-100 to-orange-100",
      textColor: "text-yellow-700",
    },
    {
      label: "Published",
      value: publishedArticles.length,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50",
      iconBg: "bg-gradient-to-br from-green-100 to-emerald-100",
      textColor: "text-green-700",
    },
    {
      label: "Total Views",
      value: publishedArticles.reduce((sum, a) => sum + a.views, 0),
      icon: Eye,
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-50 to-cyan-50",
      iconBg: "bg-gradient-to-br from-blue-100 to-cyan-100",
      textColor: "text-blue-700",
    },
    {
      label: "Archived",
      value: archivedArticles.length,
      icon: FileText,
      color: "from-gray-500 to-slate-600",
      bgColor: "from-gray-50 to-slate-50",
      iconBg: "bg-gradient-to-br from-gray-100 to-slate-100",
      textColor: "text-gray-700",
    },
  ];

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const ArticleCard = ({ article }: { article: (typeof allArticles)[0] }) => (
    <Card className="group border-border bg-card hover:border-primary/50 relative overflow-hidden border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Shimmer Effect */}
      <div className="via-primary/10 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

      <CardHeader className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Link href={`/articles/${article.slug}`}>
              <CardTitle className="text-foreground hover:text-primary line-clamp-2 transition-colors">
                {article.title}
              </CardTitle>
            </Link>
            {article.excerpt && (
              <CardDescription className="mt-2 line-clamp-2">
                {article.excerpt}
              </CardDescription>
            )}
          </div>
          <Badge
            variant={
              article.status === "PUBLISHED"
                ? "default"
                : article.status === "DRAFT"
                  ? "secondary"
                  : "outline"
            }
            className="shrink-0"
          >
            {article.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(article.updatedAt)}
            </div>
            {article.readTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.readTime} min read
              </div>
            )}
            {article.status === "PUBLISHED" && (
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {article.views}
              </div>
            )}
            {article._count.tags > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                {article._count.tags} tags
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {article.status === "DRAFT" && (
              <Button
                size="sm"
                onClick={() => publishMutation.mutate({ id: article.id })}
                disabled={publishMutation.isPending}
                className="transition-transform hover:scale-105"
              >
                <Send className="mr-2 h-4 w-4" />
                Publish
              </Button>
            )}
            <Link href={`/my-articles/${article.id}/edit`}>
              <Button size="sm" variant="ghost" className="hover:text-primary">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ status }: { status: string }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-muted mb-6 flex h-24 w-24 items-center justify-center rounded-full">
        <FileText className="text-muted-foreground h-12 w-12" />
      </div>
      <h3 className="text-foreground mb-2 text-xl font-semibold">
        No {status.toLowerCase()} articles
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        {status === "DRAFT"
          ? "Start writing your first article and share your knowledge with the community"
          : status === "PUBLISHED"
            ? "Publish your draft articles to see them here"
            : "Archived articles will appear here"}
      </p>
      {status === "DRAFT" && (
        <Link href="/my-articles/new">
          <Button size="lg" className="group">
            <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" />
            Create Article
          </Button>
        </Link>
      )}
    </div>
  );

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Header with Gradient Background */}
      <div className="bg-primary relative overflow-hidden px-4 py-12 sm:py-16">
        {/* Animated Background Pattern */}
        <div className="pattern-dots absolute inset-0 opacity-10" />

        {/* Floating Decorative Circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="bg-primary-foreground/5 absolute -top-20 -right-20 h-64 w-64 rounded-full backdrop-blur-3xl" />
          <div className="bg-primary-foreground/5 absolute -bottom-20 -left-20 h-80 w-80 rounded-full backdrop-blur-3xl" />
          <div className="bg-primary-foreground/5 absolute top-1/3 right-1/4 h-40 w-40 rounded-full" />
        </div>

        {/* Content */}
        <div className="relative container mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            {/* Title Section */}
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-6 w-6 animate-pulse text-yellow-300" />
                <span className="text-primary-foreground/70 text-sm font-semibold tracking-wider uppercase">
                  Dashboard
                </span>
              </div>
              <h1 className="text-primary-foreground mb-3 text-4xl font-black drop-shadow-lg md:text-5xl lg:text-6xl">
                My Articles
              </h1>
              <p className="text-primary-foreground/80 max-w-xl text-lg">
                Create, manage, and publish your articles. Share your knowledge
                with the student community.
              </p>
            </div>

            {/* Action Button */}
            <Link href="/my-articles/new">
              <Button
                size="lg"
                variant="secondary"
                className="group relative h-14 overflow-hidden px-8 text-base font-bold shadow-2xl transition-all duration-300 hover:scale-105 focus-visible:ring-4"
              >
                {/* Button shimmer effect */}
                <div className="via-primary/20 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <span className="relative flex items-center">
                  <Plus className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
                  Create New Article
                  <Zap className="ml-2 h-4 w-4 animate-pulse" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="container mx-auto max-w-7xl px-4">
        <div className="-mt-8 mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="group border-border bg-card relative overflow-hidden rounded-2xl border-2 p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-10 ${stat.bgColor}`}
                />

                {/* Shimmer Effect */}
                <div className="via-primary/10 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                {/* Content */}
                <div className="relative">
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${stat.iconBg}`}
                    >
                      <Icon className={`h-7 w-7 ${stat.textColor}`} />
                    </div>
                  </div>
                  <div className="text-foreground text-4xl font-black">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground mt-1 text-sm font-semibold tracking-wider uppercase">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Articles List with Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-muted mb-6 grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="all">All ({allArticles.length})</TabsTrigger>
            <TabsTrigger value="draft">
              Drafts ({draftArticles.length})
            </TabsTrigger>
            <TabsTrigger value="published">
              Published ({publishedArticles.length})
            </TabsTrigger>
            <TabsTrigger value="archived">
              Archived ({archivedArticles.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {allArticles.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {allArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <EmptyState status="ALL" />
            )}
          </TabsContent>

          <TabsContent value="draft" className="mt-6">
            {draftArticles.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {draftArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <EmptyState status="DRAFT" />
            )}
          </TabsContent>

          <TabsContent value="published" className="mt-6">
            {publishedArticles.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {publishedArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <EmptyState status="PUBLISHED" />
            )}
          </TabsContent>

          <TabsContent value="archived" className="mt-6">
            {archivedArticles.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {archivedArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <EmptyState status="ARCHIVED" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
