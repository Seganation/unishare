"use client";

import { type ReactNode } from "react";
import { RoomProvider } from "../../../liveblocks.config";

interface CollaborativeNotesRoomProps {
  roomId: string;
  children: ReactNode;
}

export function CollaborativeNotesRoom({
  roomId,
  children,
}: CollaborativeNotesRoomProps) {
  return (
    <RoomProvider
      id={roomId}
      initialPresence={{ cursor: null }}
      initialStorage={{}}
    >
      {children}
    </RoomProvider>
  );
}
