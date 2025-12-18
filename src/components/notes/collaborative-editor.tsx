"use client";

import { useEffect, useState } from "react";
import { type BlockNoteEditor } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { getYjsProviderForRoom } from "@liveblocks/yjs";
import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { useTheme } from "next-themes";
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
  const { resolvedTheme } = useTheme();

  // State for inline title editing
  const [editingTitle, setEditingTitle] = useState(pageTitle);
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  // Create Yjs provider for real-time sync
  const provider = getYjsProviderForRoom(room);
  const doc = provider.getYDoc();

  // Track if Yjs has synced the initial document from Liveblocks
  const [isSynced, setIsSynced] = useState(false);

  // Wait for Yjs to sync before creating the editor
  useEffect(() => {
    // Check if provider is already synced (document loaded from Liveblocks)
    if (provider.synced) {
      console.log("✅ Yjs provider already synced");
      setIsSynced(true);
      return;
    }

    console.log("⏳ Waiting for Yjs provider to sync...");

    // Listen for sync event
    const handleSync = (synced: boolean) => {
      console.log("🔄 Yjs sync status:", synced);
      if (synced) {
        setIsSynced(true);
      }
    };

    provider.on("synced", handleSync);

    return () => {
      provider.off("synced", handleSync);
    };
  }, [provider]);

  // Create BlockNote editor with Yjs collaboration ONLY after sync
  const editor: BlockNoteEditor | null = useCreateBlockNote(
    {
      collaboration: {
        provider,
        fragment: doc.getXmlFragment("document-store"),
        user: {
          name: userInfo?.name ?? "Anonymous",
          color: userInfo?.color ?? "#000000",
        },
      },
    },
    // Only create editor after Yjs has synced
    [isSynced ? provider : null],
  );

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

  // ✅ CORRECT ARCHITECTURE: Liveblocks Yjs handles ALL persistence
  //
  // Key Understanding:
  // - Liveblocks Yjs ALREADY persists the document automatically
  // - The Yjs document lives in Liveblocks Storage (not our DB)
  // - Liveblocks provides durable, reliable storage
  // - We do NOT save content to our database
  //
  // Why we DON'T save to DB:
  // 1. Yjs maintains its own state/history in Liveblocks
  // 2. Saving BlockNote snapshots to DB creates a second source of truth
  // 3. When reloading, DB content conflicts with Yjs state = "Position X out of range" errors
  //
  // This is DIFFERENT from non-collaborative editors (like articles)
  // where we DO save to DB because there's no Liveblocks/CRDT involved.
  //
  // If you need DB backup later: Use Liveblocks REST API to export room storage periodically

  useEffect(() => {
    if (editor) {
      console.log(
        "✅ Collaborative editor ready - Liveblocks handles all persistence",
      );
    }
  }, [editor]);

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

  // Show loading state while Yjs syncs or editor is initializing
  if (!isSynced || !editor) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex min-h-[600px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
            <p className="text-muted-foreground mb-2">
              {!isSynced
                ? "Syncing document from Liveblocks..."
                : "Initializing collaborative editor..."}
            </p>
            <p className="text-muted-foreground text-xs">
              This ensures all your previous content loads correctly
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Read-Only Banner */}
      {isReadOnly && (
        <div className="animate-in slide-in-from-top-2 mb-6 rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-amber-500/20 p-3">
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
      <div className="border-border bg-card mb-6 flex items-center justify-between rounded-2xl border p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 animate-pulse text-purple-600" />
            <span className="text-sm font-semibold">Active Collaborators</span>
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
              <div className="border-background bg-muted text-foreground relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-bold shadow-lg">
                +{others.length - 5}
              </div>
            )}
          </div>

          <div className="text-muted-foreground flex items-center gap-1 text-sm">
            <UsersIcon className="h-4 w-4" />
            <span className="font-medium">
              {others.length + (userInfo ? 1 : 0)} online
            </span>
          </div>
        </div>

        {/* Your Role */}
        <div className="flex items-center gap-3">
          {/* Save Status Indicator - Liveblocks handles persistence */}
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>All changes saved</span>
          </div>

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
      </div>

      {/* Page Title - Inline Editable */}
      <div className="border-border bg-card mb-6 rounded-2xl border p-6 shadow-sm">
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
            "w-full border-none bg-transparent text-4xl font-bold focus:outline-none",
            !canEdit && "cursor-default",
          )}
        />
        {isSavingTitle && (
          <p className="text-muted-foreground mt-2 text-xs">Saving title...</p>
        )}
      </div>

      {/* BlockNote Editor with Comments */}
      <div className="relative">
        <BlockNoteView
          editor={editor}
          editable={canEdit}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          shadCNComponents={
            {
              // Using default BlockNote shadcn components
              // Can pass custom shadcn components from your project here if needed
            }
          }
          className={cn(
            "min-h-[600px]",
            isReadOnly &&
              "pointer-events-none cursor-not-allowed opacity-75 select-none",
          )}
        />

        {/* Comments UI - Temporarily disabled while we fix core sync */}
        {/* TODO: Re-enable comments after verifying real-time collaboration works */}
      </div>

      {/* Helper Text */}
      <div className="bg-muted mt-6 rounded-xl p-4 text-center">
        <p className="text-muted-foreground text-sm">
          {canEdit ? (
            <>
              ✨ <strong>Real-time collaboration active!</strong> All changes
              are automatically synced and persisted by Liveblocks. No manual
              saving needed.
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
