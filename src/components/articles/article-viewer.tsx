"use client";

import { useEffect, useMemo } from "react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNote } from "@blocknote/react";
import { useTheme } from "next-themes";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

interface ArticleViewerProps {
  content: unknown;
}

export function ArticleViewer({ content }: ArticleViewerProps) {
  const { resolvedTheme } = useTheme();
  // Normalize initial content - BlockNote expects an array of blocks
  const normalizedContent = useMemo(() => {
    return content &&
      typeof content === "object" &&
      Array.isArray(content) &&
      content.length > 0
      ? (content as any)
      : undefined;
  }, [content]);

  // Create BlockNote editor in read-only mode
  const editor = useCreateBlockNote({
    initialContent: normalizedContent,
  });

  // Add a ready state
  const isReady = !!editor;

  // Load content into editor when it changes (for dynamic updates)
  useEffect(() => {
    if (editor && content && isReady) {
      try {
        if (Array.isArray(content) && content.length > 0) {
          // Only replace if content is different to avoid cursor resets or flicker
          // though this is a viewer (read-only), it's good practice
          editor.replaceBlocks(editor.document, content as any);
        }
      } catch (error) {
        console.error("Failed to load article content:", error);
      }
    }
  }, [editor, content, isReady]);

  if (!editor) {
    return <div>Loading...</div>;
  }

  return (
    <div className="article-viewer">
      <style jsx global>{`
        .article-viewer .bn-container, 
        .article-viewer .bn-editor {
          background-color: transparent !important;
          padding: 0 !important;
        }
        .article-viewer .bn-main {
          padding: 0 !important;
        }
        .article-viewer .bn-shadcn-editor {
          border: none !important;
          box-shadow: none !important;
          background: transparent !important;
        }
      `}</style>
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        editable={false}
        className="bg-transparent"
      />
    </div>
  );
}
