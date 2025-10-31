"use client";

import dynamic from "next/dynamic";
import { type ReactNode } from "react";

// Dynamically import the editor with no SSR
const CollaborativeNotesEditor = dynamic(
  () =>
    import("./collaborative-editor").then((mod) => ({
      default: mod.CollaborativeNotesEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    ),
  },
);

const LiveblocksProviderWrapper = dynamic(
  () =>
    import("./liveblocks-provider").then((mod) => ({
      default: mod.LiveblocksProviderWrapper,
    })),
  { ssr: false },
);

const CollaborativeNotesRoom = dynamic(
  () =>
    import("./collaborative-notes-room").then((mod) => ({
      default: mod.CollaborativeNotesRoom,
    })),
  { ssr: false },
);

interface CollaborativeEditorWrapperProps {
  pageId: string;
  pageTitle: string;
  roomId: string;
  canEdit: boolean;
  isReadOnly: boolean;
  userRole: "OWNER" | "CONTRIBUTOR" | "VIEWER";
  courseName: string;
}

export function CollaborativeEditorWrapper({
  pageId,
  pageTitle,
  roomId,
  canEdit,
  isReadOnly,
  userRole,
  courseName,
}: CollaborativeEditorWrapperProps) {
  return (
    <LiveblocksProviderWrapper>
      <CollaborativeNotesRoom roomId={roomId}>
        <CollaborativeNotesEditor
          pageId={pageId}
          pageTitle={pageTitle}
          canEdit={canEdit}
          isReadOnly={isReadOnly}
          userRole={userRole}
          courseName={courseName}
        />
      </CollaborativeNotesRoom>
    </LiveblocksProviderWrapper>
  );
}
