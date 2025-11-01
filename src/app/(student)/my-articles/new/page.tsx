"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send, Upload, X } from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "sonner";
import { ArticleEditor } from "~/components/articles/article-editor";
import { UploadButton } from "~/lib/uploadthing";
import type { Block } from "@blocknote/core";

export default function NewArticlePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState<Block[]>([]);
  const [tags, setTags] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Create article mutation
  const createMutation = api.article.create.useMutation({
    onSuccess: (data) => {
      toast.success("Article saved as draft");
      router.push(`/my-articles/${data.id}/edit`);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsSaving(false);
    },
  });

  // Publish mutation
  const publishMutation = api.article.create.useMutation({
    onSuccess: async (data) => {
      // After creating, immediately publish
      try {
        await api.article.publish.useMutation().mutateAsync({ id: data.id });
        toast.success("Article published!");
        router.push(`/articles/${data.slug}`);
      } catch (error: any) {
        toast.error(error.message ?? "Failed to publish article");
      }
      setIsSaving(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsSaving(false);
    },
  });

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title for your article");
      return;
    }

    setIsSaving(true);
    createMutation.mutate({
      title,
      excerpt: excerpt || undefined,
      coverImage: coverImage || undefined,
      content,
      tags: tags.trim() ? tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
    });
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title for your article");
      return;
    }

    setIsSaving(true);
    publishMutation.mutate({
      title,
      excerpt: excerpt || undefined,
      coverImage: coverImage || undefined,
      content,
      tags: tags.trim() ? tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
    });
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="border-border bg-card/95 sticky top-0 z-10 border-b shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/my-articles">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSaving || !title.trim()}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button
                onClick={handlePublish}
                disabled={isSaving || !title.trim()}
              >
                <Send className="mr-2 h-4 w-4" />
                Publish
              </Button>
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
                  className="absolute right-2 top-2"
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
            <ArticleEditor onChange={setContent} />
          </div>
        </div>
      </div>
    </div>
  );
}
