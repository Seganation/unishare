"use client";

import { useEffect, useState } from "react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNote } from "@blocknote/react";
import type { Block } from "@blocknote/core";
import { useTheme } from "next-themes";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

interface ArticleEditorProps {
  initialContent?: unknown;
  onChange?: (blocks: Block[]) => void;
}

export function ArticleEditor({
  initialContent,
  onChange,
}: ArticleEditorProps) {
  const [isReady, setIsReady] = useState(false);
  const { resolvedTheme } = useTheme();

  // Normalize initial content - BlockNote expects an array of blocks
  const normalizedContent =
    initialContent &&
    typeof initialContent === "object" &&
    Array.isArray(initialContent) &&
    initialContent.length > 0
      ? (initialContent as any)
      : undefined;

  // Create BlockNote editor
  const editor = useCreateBlockNote({
    initialContent: normalizedContent,
  });

  // Load initial content
  useEffect(() => {
    if (editor) {
      setIsReady(true);
    }
  }, [editor]);

  // Handle content changes
  useEffect(() => {
    if (!editor || !onChange) return;

    const handleChange = () => {
      const blocks = editor.document;
      onChange(blocks);
    };

    // Listen to editor changes
    editor.onChange(handleChange);

    return () => {
      // Cleanup if needed
    };
  }, [editor, onChange]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="border-border bg-card article-editor rounded-lg border">
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        className="min-h-[500px] p-4"
      />
    </div>
  );
}
