"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send, Upload, X, Eye } from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "sonner";
import { ArticleEditor } from "~/components/articles/article-editor";
import { UploadButton } from "~/lib/uploadthing";
import type { Block } from "@blocknote/core";

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState<Block[]>([]);
  const [tags, setTags] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch article
  const { data: article, isLoading } = api.article.getMyArticles.useQuery(
    {},
    {
      select: (articles) => articles.find((a) => a.id === articleId),
    },
  );

  // Update mutation
  const updateMutation = api.article.update.useMutation({
    onSuccess: () => {
      toast.success("Changes saved");
      setIsSaving(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsSaving(false);
    },
  });

  // Publish mutation
  const publishMutation = api.article.publish.useMutation({
    onSuccess: (data) => {
      toast.success("Article published!");
      router.push(`/articles/${data.slug}`);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsSaving(false);
    },
  });

  // Load article data
  useEffect(() => {
    if (article && !isLoaded) {
      setTitle(article.title);
      setExcerpt(article.excerpt ?? "");
      setCoverImage(article.coverImage ?? "");
      setTags(article.tags.map((t) => t.name).join(", "));
      // Handle content - ensure it's always an array for BlockNote
      if (Array.isArray(article.content)) {
        setContent(article.content as Block[]);
      } else {
        setContent([]); // Default to empty array if content is not an array
      }
      setIsLoaded(true);
    }
  }, [article, isLoaded]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title for your article");
      return;
    }

    setIsSaving(true);
    updateMutation.mutate({
      id: articleId,
      title,
      excerpt: excerpt || undefined,
      coverImage: coverImage || undefined,
      content,
      tags: tags.trim()
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
    });
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title for your article");
      return;
    }

    // First save, then publish
    setIsSaving(true);
    try {
      await updateMutation.mutateAsync({
        id: articleId,
        title,
        excerpt: excerpt || undefined,
        coverImage: coverImage || undefined,
        content,
        tags: tags.trim()
          ? tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
      });
      publishMutation.mutate({ id: articleId });
    } catch (error) {
      setIsSaving(false);
    }
  };

  if (isLoading || !isLoaded) {
    return <EditArticleSkeleton />;
  }

  if (!article) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold">Article not found</h1>
          <p className="mb-4 text-gray-600">
            The article you're trying to edit doesn't exist.
          </p>
          <Link href="/my-articles">
            <Button>Back to My Articles</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="border-border bg-card/95 supports-[backdrop-filter]:bg-card/60 sticky top-0 z-10 border-b shadow-sm backdrop-blur">
        <div className="container mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/my-articles">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              <Badge
                variant={
                  article.status === "PUBLISHED"
                    ? "default"
                    : article.status === "DRAFT"
                      ? "secondary"
                      : "outline"
                }
              >
                {article.status}
              </Badge>
            </div>

            <div className="flex gap-2">
              {article.status !== "DRAFT" && (
                <Link href={`/articles/${article.slug}`} target="_blank">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isSaving || !title.trim()}
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              {article.status === "DRAFT" && (
                <Button
                  onClick={handlePublish}
                  disabled={isSaving || !title.trim()}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Publish
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="space-y-6">
          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Cover Image (Optional)</Label>
            {coverImage ? (
              <div className="relative">
                <img
                  src={coverImage}
                  alt="Cover"
                  className="aspect-video w-full rounded-lg object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setCoverImage("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-8">
                <UploadButton
                  endpoint="articleCoverUploader"
                  onClientUploadComplete={(res) => {
                    if (res?.[0]) {
                      setCoverImage(res[0].url);
                      toast.success("Cover image uploaded");
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(error.message);
                  }}
                />
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter article title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold"
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt (Optional)</Label>
            <Textarea
              id="excerpt"
              placeholder="A brief description of your article..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <Input
              id="tags"
              placeholder="e.g., Programming, Web Development, Tutorial (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <p className="text-muted-foreground text-sm">
              Separate tags with commas. Tags help readers find your article.
            </p>
          </div>

          {/* Content Editor */}
          <div className="space-y-2">
            <Label>Content</Label>
            <ArticleEditor initialContent={content} onChange={setContent} />
          </div>
        </div>
      </div>
    </div>
  );
}

function EditArticleSkeleton() {
  return (
    <div className="bg-background min-h-screen">
      <div className="border-border bg-card border-b">
        <div className="container mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  );
}
