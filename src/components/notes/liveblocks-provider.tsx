"use client";

import { type ReactNode } from "react";
import {
  LiveblocksProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";

interface LiveblocksProviderWrapperProps {
  children: ReactNode;
}

export function LiveblocksProviderWrapper({
  children,
}: LiveblocksProviderWrapperProps) {
  return (
    <LiveblocksProvider
      authEndpoint="/api/liveblocks-auth"
      // Optional: Add throttle to reduce network requests
      throttle={100}
    >
      <ClientSideSuspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
              <p className="text-gray-600">Loading collaborative workspace...</p>
            </div>
          </div>
        }
      >
        {children}
      </ClientSideSuspense>
    </LiveblocksProvider>
  );
}
