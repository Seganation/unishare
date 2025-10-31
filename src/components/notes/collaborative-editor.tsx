"use client";

import { useEffect, useState } from "react";
import { type BlockNoteEditor } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { getYjsProviderForRoom } from "@liveblocks/yjs";
import { ClientSideSuspense } from "@liveblocks/react/suspense";
import {
  useSelf,
  useOthers,
  useThreads,
  useRoom,
} from "../../../liveblocks.config";
import {
  Eye,
  Edit,
  Crown,
  Users as UsersIcon,
  AlertCircle,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { cn } from "~/lib/utils";

// Import BlockNote and Liveblocks styles
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import "@liveblocks/react-ui/styles.css";

interface CollaborativeNotesEditorProps {
  pageId: string;
  pageTitle: string;
  canEdit: boolean;
  isReadOnly: boolean;
  userRole: "OWNER" | "CONTRIBUTOR" | "VIEWER";
  courseName: string;
}

export function CollaborativeNotesEditor({
  pageId,
  pageTitle,
  canEdit,
  isReadOnly,
  userRole,
  courseName,
}: CollaborativeNotesEditorProps) {
  // Get the Liveblocks room and set up Yjs provider
  const room = useRoom();
  const userInfo = useSelf((me) => me?.info);
  const others = useOthers();

  // State for inline title editing
  const [editingTitle, setEditingTitle] = useState(pageTitle);
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  // Create Yjs provider for real-time sync
  const provider = getYjsProviderForRoom(room);
  const doc = provider.getYDoc();

  // Create BlockNote editor with Yjs collaboration
  const editor: BlockNoteEditor | null = useCreateBlockNote({
    collaboration: {
      provider,
      fragment: doc.getXmlFragment("document-store"),
      user: {
        name: userInfo?.name ?? "Anonymous",
        color: userInfo?.color ?? "#000000",
      },
    },
  });

  // Save title changes
  const handleTitleSave = async () => {
    if (!canEdit || editingTitle === pageTitle || isSavingTitle) return;

    setIsSavingTitle(true);
    try {
      await fetch(`/api/notes/${pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingTitle }),
      });
      console.log("✅ Title saved:", editingTitle);
    } catch (error) {
      console.error("❌ Title save failed:", error);
      setEditingTitle(pageTitle); // Revert on error
    } finally {
      setIsSavingTitle(false);
    }
  };

  // Optional: Backup to database every 30 seconds
  // Liveblocks already handles persistence, but this gives us a backup in our DB
  useEffect(() => {
    if (!editor || !canEdit) return;

    // Save a backup to database every 30 seconds
    const saveInterval = setInterval(async () => {
      try {
        const content = editor.document;
        await fetch(`/api/notes/${pageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        console.log("✅ Backup saved at", new Date().toLocaleTimeString());
      } catch (error) {
        console.error("❌ Backup save failed:", error);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(saveInterval);
  }, [editor, canEdit, pageId]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER":
        return Crown;
      case "CONTRIBUTOR":
        return Edit;
      case "VIEWER":
        return Eye;
      default:
        return Eye;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "OWNER":
        return "text-amber-600 bg-amber-100 border-amber-300";
      case "CONTRIBUTOR":
        return "text-blue-600 bg-blue-100 border-blue-300";
      case "VIEWER":
        return "text-gray-600 bg-gray-100 border-gray-300";
      default:
        return "text-gray-600 bg-gray-100 border-gray-300";
    }
  };

  const RoleIcon = getRoleIcon(userRole);

  // Show loading state while editor is initializing
  if (!editor) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex min-h-[600px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
            <p className="text-gray-600">Loading collaborative editor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Read-Only Banner */}
      {isReadOnly && (
        <div className="mb-6 animate-in slide-in-from-top-2 rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-amber-200 p-3">
              <AlertCircle className="h-6 w-6 text-amber-700" />
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-lg font-bold text-amber-900">
                👁️ Viewing in Read-Only Mode
              </h3>
              <p className="text-sm text-amber-800">
                You're a <strong>Viewer</strong> on this course. You can see
                live edits from others, but you cannot make changes to the
                notes. Ask the course owner for Contributor access to edit.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Live Collaborators Bar */}
      <div className="mb-6 flex items-center justify-between rounded-2xl border-2 border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 animate-pulse text-purple-600" />
            <span className="text-sm font-semibold text-gray-700">
              Active Collaborators
            </span>
          </div>

          {/* User Avatars */}
          <div className="flex -space-x-2">
            {/* Current User */}
            {userInfo && (
              <div
                className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white font-bold text-white shadow-lg ring-2 ring-purple-200"
                style={{ backgroundColor: userInfo.color }}
                title={`${userInfo.name} (You)`}
              >
                {userInfo.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Other Users */}
            {others.slice(0, 5).map((other) => (
              <div
                key={other.connectionId}
                className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white font-bold text-white shadow-lg"
                style={{ backgroundColor: other.info?.color ?? "#cccccc" }}
                title={other.info?.name ?? "Unknown"}
              >
                {(other.info?.name ?? "?").charAt(0).toUpperCase()}
              </div>
            ))}

            {others.length > 5 && (
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-bold text-gray-600 shadow-lg">
                +{others.length - 5}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-600">
            <UsersIcon className="h-4 w-4" />
            <span className="font-medium">
              {others.length + (userInfo ? 1 : 0)} online
            </span>
          </div>
        </div>

        {/* Your Role */}
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border-2 px-4 py-2 font-bold shadow-sm",
            getRoleColor(userRole),
          )}
        >
          <RoleIcon className="h-4 w-4" />
          <span className="text-sm">{userRole}</span>
        </div>
      </div>

      {/* Page Title - Inline Editable */}
      <div className="mb-6 rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm">
        <input
          type="text"
          value={editingTitle}
          onChange={(e) => setEditingTitle(e.target.value)}
          onBlur={handleTitleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
          disabled={!canEdit || isSavingTitle}
          placeholder="Untitled"
          className={cn(
            "w-full border-none bg-transparent text-4xl font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none",
            !canEdit && "cursor-default",
          )}
        />
        {isSavingTitle && (
          <p className="mt-2 text-xs text-gray-500">Saving title...</p>
        )}
      </div>

      {/* BlockNote Editor with Comments */}
      <div className="relative">
        <div
          className={cn(
            "overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-xl transition-all",
            isReadOnly
              ? "cursor-not-allowed opacity-75"
              : "hover:border-purple-300 hover:shadow-2xl",
          )}
        >
          <div className="p-8">
            <BlockNoteView
              editor={editor}
              editable={canEdit}
              shadCNComponents={{
                // Using default BlockNote shadcn components
                // Can pass custom shadcn components from your project here if needed
              }}
              className={cn(
                "min-h-[600px]",
                isReadOnly && "pointer-events-none select-none",
              )}
            />
          </div>
        </div>

        {/* Comments UI - Temporarily disabled while we fix core sync */}
        {/* TODO: Re-enable comments after verifying real-time collaboration works */}
      </div>

      {/* Helper Text */}
      <div className="mt-6 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 p-4 text-center">
        <p className="text-sm text-gray-600">
          {canEdit ? (
            <>
              ✨ <strong>Real-time collaboration is active!</strong> All changes
              are saved automatically and synced via Liveblocks Yjs.
            </>
          ) : (
            <>
              👀 You're viewing live updates. Changes made by Contributors and
              the Owner will appear instantly.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
