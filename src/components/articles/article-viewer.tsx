"use client";

import { useEffect, useMemo } from "react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

interface ArticleViewerProps {
  content: unknown;
}

export function ArticleViewer({ content }: ArticleViewerProps) {
  // Create BlockNote editor in read-only mode
  const editor = useCreateBlockNote({
    initialContent:
      content && typeof content === "object" && Array.isArray(content)
        ? (content as any)
        : undefined,
  });

  // Load content into editor when it changes
  useEffect(() => {
    if (editor && content) {
      try {
        if (Array.isArray(content)) {
          editor.replaceBlocks(editor.document, content as any);
        }
      } catch (error) {
        console.error("Failed to load article content:", error);
      }
    }
  }, [editor, content]);

  if (!editor) {
    return <div>Loading...</div>;
  }

  return (
    <div className="article-viewer">
      <BlockNoteView
        editor={editor}
        theme="light"
        editable={false}
        className="min-h-[200px]"
      />
    </div>
  );
}
