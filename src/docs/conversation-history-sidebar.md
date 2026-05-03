# Conversation History Sidebar — How It Works

This document explains how the AI conversation history sidebar works end-to-end: how chat IDs are generated, how they're persisted in the URL, and how the backend creates/loads conversations.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  /ai/[[...id]]/page.tsx  (Next.js catch-all route)              │
│                                                                 │
│  ┌──────────────────┐           ┌─────────────────────────┐     │
│  │ ChatHistorySidebar│           │   AIChatInterface       │     │
│  │                  │  clicks   │                         │     │
│  │  - Lists convos  │ ───────► │  - useChat (AI SDK 5)   │     │
│  │  - Delete convo  │           │  - Sends messages       │     │
│  │  - New Chat btn  │           │  - Streams responses    │     │
│  └──────────────────┘           └────────┬────────────────┘     │
│                                          │                      │
│                                          │ POST /api/chat       │
│                                          ▼                      │
│                              ┌───────────────────────┐          │
│                              │  API Route (route.ts)  │          │
│                              │  - Creates convo in DB │          │
│                              │  - Saves messages      │          │
│                              │  - Streams AI response │          │
│                              └───────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. The URL Structure — `[[...id]]` Catch-All Route

The page lives at:

```
src/app/(student)/ai/[[...id]]/page.tsx
```

The `[[...id]]` is a Next.js **optional catch-all segment**. This means:

| URL          | `params.id`  | Meaning                           |
| ------------ | ------------ | --------------------------------- |
| `/ai`        | `undefined`  | New chat (no conversation loaded) |
| `/ai/abc123` | `["abc123"]` | Load conversation `abc123`        |

The page extracts the conversation ID from the URL params:

```tsx
const params = useParams();
const conversationIdFromUrl = params.id
  ? Array.isArray(params.id)
    ? params.id[0]
    : params.id
  : undefined;
```

This ID is then synced into React state and passed down to both the sidebar (to highlight the active conversation) and the chat interface (to load/send messages for that conversation).

---

## 2. Chat ID Generation — Client-Side with `nanoid`

Chat IDs are **generated on the client** using `nanoid` inside `AIChatInterface`. This is the key design decision — the client picks the ID before any message is sent, so the backend can create the conversation record on the first message.

```tsx
// Inside AIChatInterface
const [stableId] = useState(() => (conversationId ? undefined : nanoid()));
const conversationIdRef = useRef(conversationId || stableId);
```

- If `conversationId` is provided (existing conversation from URL) → use it directly, `stableId` is `undefined`.
- If `conversationId` is `undefined` (new chat) → generate a `nanoid` once and store it as `stableId`.

The `conversationIdRef` always holds the current active ID and is passed into the streaming transport:

```tsx
transport: new DefaultChatTransport({
  api: "/api/chat",
  prepareSendMessagesRequest({ messages }) {
    return {
      body: {
        message: messages[messages.length - 1],
        conversationId: conversationIdRef.current,  // ← sent with every message
        courseId,
        noteId,
        model,
        temperature,
      },
    };
  },
}),
```

---

## 3. How the Chat ID Gets Into the URL

There are **two different mechanisms** for updating the URL depending on the context:

### A. Sidebar Click → `router.push()` (full navigation)

When a user clicks a conversation in the sidebar, `handleSelectConversation` fires:

```tsx
const handleSelectConversation = useCallback(
  (conversationId: string | undefined) => {
    setSelectedConversationId(conversationId);
    if (conversationId) {
      router.push(`/ai/${conversationId}`); // ← triggers Next.js navigation
    } else {
      router.push("/ai");
    }
  },
  [router],
);
```

This causes a full Next.js client-side navigation and **remounts** the `AIChatInterface` component (because the `key` prop changes).

### B. New Conversation Created → `window.history.replaceState()` (silent URL update)

When a NEW conversation's first message finishes streaming, the chat interface notifies the parent page via `onConversationCreated`:

```tsx
// In AIChatInterface — after stream completes
onFinish: async (options) => {
  if (isNewConversation && conversationIdRef.current) {
    onConversationCreated?.(conversationIdRef.current);
    setIsNewConversation(false);
  }
},
```

The parent page (`page.tsx`) handles this by silently updating the URL **without** triggering a re-render or navigation:

```tsx
const handleConversationCreated = useCallback((conversationId: string) => {
  setSelectedConversationId(conversationId);
  // Use window.history to update URL without navigation/remount
  window.history.replaceState(null, "", `/ai/${conversationId}`);
}, []);
```

**Why `replaceState` instead of `router.push`?** Because `router.push` would change the `key` on `AIChatInterface`, unmounting and remounting it — which would destroy the active chat stream. `replaceState` updates the URL bar without affecting React at all.

### C. New Chat Button → `router.push("/ai")`

```tsx
const handleNewChat = useCallback(() => {
  setSelectedConversationId(undefined);
  setNewChatKey((prev) => prev + 1); // Force AIChatInterface remount
  router.push("/ai");
}, [router]);
```

The `newChatKey` increment ensures the `AIChatInterface` gets a fresh `key` (`new-1`, `new-2`, etc.) and fully remounts with a clean state.

---

## 4. The Backend — How Conversations Are Created and Stored

### First Message Flow (New Conversation)

When the user sends their **first message**, the `POST /api/chat` route receives:

```json
{
  "message": { "role": "user", "parts": [{ "type": "text", "text": "Hello" }] },
  "conversationId": "abc123-nanoid-generated",
  "temperature": 0.7
}
```

The route checks if this conversation already exists in the database:

```tsx
conversation = await db.aiConversation.findFirst({
  where: {
    id: conversationId,
    userId: session.user.id,
  },
  // ...includes
});
```

If it **doesn't exist** (first message), the route:

1. Extracts the user's text to generate an AI-powered title (max 6 words).
2. Creates the conversation record using the **client-provided ID**:

```tsx
conversation = await db.aiConversation.create({
  data: {
    id: conversationId, // ← uses the client-generated nanoid
    title: conversationTitle,
    userId: session.user.id,
    courseId,
    noteId,
    temperature,
  },
  // ...includes
});
```

3. Streams the AI response back to the client.
4. On stream finish, saves all new messages to the database:

```tsx
onFinish({ messages }) {
  const existingMessageIds = new Set(previousMessages.map((m) => m.id));
  const newMessages = messages.filter((msg) => !existingMessageIds.has(msg.id));

  for (const msg of newMessages) {
    await db.aiMessage.create({
      data: {
        id: msg.id,
        conversationId: activeConversationId!,
        role: msg.role.toUpperCase(),
        data: msg,  // Store complete UIMessage object as JSON
        tokensUsed: msg.role === "assistant" ? tokenUsage : undefined,
      },
    });
  }
}
```

### Subsequent Messages (Existing Conversation)

For follow-up messages, the same route finds the existing conversation, loads all previous messages from the DB, combines them with the new message, and streams a response.

---

## 5. The Sidebar — Fetching & Displaying Conversations

### Fetching Conversations (tRPC)

The sidebar uses the `ai.getConversations` tRPC query with pagination:

```tsx
const { data, refetch, isFetching } = api.ai.getConversations.useQuery(
  { limit },
  {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 30000, // 30 seconds before refetch
  },
);
```

The backend returns paginated results sorted by `updatedAt` descending:

```tsx
// In ai.ts router
getConversations: protectedProcedure
  .input(z.object({ limit: z.number().min(1).max(100).optional().default(5) }))
  .query(async ({ ctx, input }) => {
    const [conversations, total] = await Promise.all([
      ctx.db.aiConversation.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { updatedAt: "desc" },
        take: input.limit,
        select: { id: true, title: true, createdAt: true, updatedAt: true, /* ... */ },
      }),
      ctx.db.aiConversation.count({ where: { userId: ctx.session.user.id } }),
    ]);
    return { conversations, total, hasMore: conversations.length < total };
  }),
```

### Load More Pagination

The sidebar uses a simple "load more" pattern — increasing the `limit` state:

```tsx
const handleLoadMore = async () => {
  setIsLoadingMore(true);
  const newLimit = limit + 10; // Fetch 10 more each time
  setLimit(newLimit);
  await refetch();
  setIsLoadingMore(false);
};
```

### Deleting Conversations

Delete uses a tRPC mutation with ownership verification:

```tsx
const deleteConversation = api.ai.deleteConversation.useMutation({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: [["ai", "getConversations"]] });
    if (selectedConversationId) {
      onSelectConversation(undefined); // Navigate away from deleted convo
    }
  },
});
```

The backend verifies the user owns the conversation before deleting:

```tsx
deleteConversation: protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const conversation = await ctx.db.aiConversation.findFirst({
      where: { id: input.id, userId: ctx.session.user.id },
    });
    if (!conversation) throw new TRPCError({ code: "NOT_FOUND" });
    await ctx.db.aiConversation.delete({ where: { id: input.id } });
    return { success: true };
  }),
```

---

## 6. Component Remounting Strategy

The `AIChatInterface` uses a `key` prop to control when it fully remounts:

```tsx
<AIChatInterface
  key={conversationIdFromUrl || `new-${newChatKey}`}
  conversationId={selectedConversationId}
  onConversationCreated={handleConversationCreated}
/>
```

| Scenario                | `key` value     | Effect                             |
| ----------------------- | --------------- | ---------------------------------- |
| Load `/ai/abc123`       | `"abc123"`      | Mount with existing conversation   |
| Switch to `/ai/def456`  | `"def456"`      | Remount → load new conversation    |
| Click "New Chat"        | `"new-1"`       | Remount → fresh empty chat         |
| Click "New Chat" again  | `"new-2"`       | Remount → another fresh empty chat |
| First message completes | (key unchanged) | No remount, URL updates silently   |

---

## 7. Summary: Full Lifecycle of a New Chat

1. User clicks **"New Chat"** → URL becomes `/ai`, `AIChatInterface` remounts with fresh state.
2. `AIChatInterface` generates a `nanoid` as `stableId` (e.g., `"V1StGXR8_Z5jdHi6B-myT"`).
3. User types a message and hits send.
4. `POST /api/chat` is called with `conversationId: "V1StGXR8_Z5jdHi6B-myT"`.
5. Backend finds no existing conversation with that ID → creates one, uses AI to generate a title.
6. Backend streams the AI response back.
7. On stream finish, backend saves both user and assistant messages to the DB.
8. On the client, `onFinish` fires → calls `onConversationCreated("V1StGXR8_Z5jdHi6B-myT")`.
9. Parent page calls `window.history.replaceState(null, "", "/ai/V1StGXR8_Z5jdHi6B-myT")` — URL updates without remount.
10. Sidebar eventually refetches (after `staleTime` expires or next interaction) and shows the new conversation.
11. If the user reloads the page, `/ai/V1StGXR8_Z5jdHi6B-myT` is parsed from the URL, and the existing conversation + messages are loaded from the database.
