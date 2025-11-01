"use client";

import { useEffect, useState } from "react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNote } from "@blocknote/react";
import type { Block } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

interface ArticleEditorProps {
  initialContent?: unknown;
  onChange?: (blocks: Block[]) => void;
}

export function ArticleEditor({ initialContent, onChange }: ArticleEditorProps) {
  const [isReady, setIsReady] = useState(false);

  // Create BlockNote editor
  const editor = useCreateBlockNote({
    initialContent:
      initialContent && typeof initialContent === "object" && Array.isArray(initialContent)
        ? (initialContent as any)
        : undefined,
  });

  // Load initial content
  useEffect(() => {
    if (editor && initialContent && !isReady) {
      try {
        if (Array.isArray(initialContent)) {
          editor.replaceBlocks(editor.document, initialContent as any);
        }
        setIsReady(true);
      } catch (error) {
        console.error("Failed to load initial content:", error);
        setIsReady(true);
      }
    } else if (editor && !initialContent) {
      setIsReady(true);
    }
  }, [editor, initialContent, isReady]);

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
        theme="light"
        className="min-h-[500px] p-4"
      />
    </div>
  );
}
