# Local AI Setup (Ollama + Phi-3)

Short reference for how AI is used locally in this project.

---

## Overview

- **Host**: Local machine (development only)
- **AI Server**: Ollama (local HTTP service)
- **Model**: `phi-3:3.8b`
- **Purpose**: Generate and improve course notes (Markdown/text)
- **Cost**: $0 (offline, no API keys)

---

## Local AI Host

- **Base URL**: `http://localhost:11434`
- Ollama exposes a REST API automatically when running
- Treated like a local dependency (similar to a database)

---

## Model

- **Name**: `phi-3:3.8b`
- **Strengths**:
  - Fast on Apple Silicon
  - Good instruction following
  - Clean structured output (headings, bullet points)
- **Used for**:
  - Course notes
  - Summaries
  - Study guides

---

## Ollama API (Used by the App)

### Generate Text

`POST /api/generate`

**Full URL**

```
http://localhost:11434/api/generate
```

**Request Body**

```json
{
  "model": "phi3:3.8b",
  "prompt": "Generate concise markdown notes about database normalization",
  "stream": false
}
```

**Response (simplified)**

```json
{
  "response": "## Database Normalization\n- 1NF ensures atomic values..."
}
```

---

## Usage Pattern (Important)

```
Client (UI)
  → /api/ai/*   (Next.js API route)
    → Ollama (localhost:11434)
      → phi-3 model
```

- The browser never talks to Ollama directly
- All AI calls go through server-side API routes

---

## Minimal Server Example (Next.js)

```ts
// Example: app/api/ai/notes/route.ts
// Server-side adapter between the app and Ollama

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "phi3:3.8b",
      prompt,
      stream: false,
    }),
  });

  const data = await res.json();

  return Response.json({ text: data.response });
}
```

---

## Notes

- The model generates **text only** (Markdown, structured content)
- File formats like `.md` or `.docx` are created by the app, not the model
- Architecture allows easy swap to cloud AI in production

---

**Status**: Local-only, demo-ready, production-safe architecture

and for ui use these

Chat
A composable and customizable chat interface component.

Preview
Code
Copy

Llama 3.3 70B
Try these prompts ✨

What is the weather in San Francisco?

Explain step-by-step how to solve this math problem: If x² + 6x + 9 = 25, what is x?

Design a simple algorithm to find the longest palindrome in a string.

Ask AI...

The Chat component provides a complete chat interface with message history, typing indicators, file attachments support, and auto-scrolling behavior.

Features
Message history display
Real-time typing indicators
File attachment support
Auto-scrolling with manual override
Prompt suggestions for empty states
Stop generation capability
Fully customizable styling
Installation
CLI
Manual
npx shadcn@latest add https://shadcn-chatbot-kit.vercel.app/r/chat.json
Usage
Basic Usage
"use client"

import { useChat } from "ai/react"

import { Chat } from "@/components/ui/chat"

export function ChatDemo() {
const { messages, input, handleInputChange, handleSubmit, status, stop } =
useChat()

const isLoading = status === "submitted" || status === "streaming"

return (
<Chat
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      isGenerating={isLoading}
      stop={stop}
    />
)
}
With Prompt Suggestions
"use client"

import { useChat } from "ai/react"

import { Chat } from "@/components/ui/chat"

export function ChatWithSuggestions() {
const {
messages,
input,
handleInputChange,
handleSubmit,
append,
status,
stop,
} = useChat()

const isLoading = status === "submitted" || status === "streaming"

return (
<Chat
messages={messages}
input={input}
handleInputChange={handleInputChange}
handleSubmit={handleSubmit}
isGenerating={isLoading}
stop={stop}
append={append}
suggestions={[
"Generate a tasty vegan lasagna recipe for 3 people.",
"Generate a list of 5 questions for a frontend job interview.",
"Who won the 2022 FIFA World Cup?",
]}
/>
)
}
Custom Implementation
You can also use the individual components to build your own chat interface:

"use client"

import { useChat } from "ai/react"

import { ChatContainer, ChatForm, ChatMessages, PromptSuggestions } from "@/components/ui/chat"
import { MessageInput } from "@/components/ui/message-input"
import { MessageList } from "@/components/ui/message-list"
import { PromptSuggestions } from "@/components/ui/prompt-suggestions"

export function CustomChat() {
const {
messages,
input,
handleInputChange,
handleSubmit,
append,
status,
stop,
} = useChat()

const isLoading = status === 'submitted' || status === 'streaming'
const lastMessage = messages.at(-1)
const isEmpty = messages.length === 0
const isTyping = lastMessage?.role === "user"

return (
<ChatContainer>
{isEmpty ? (
<PromptSuggestions
append={append}
suggestions={["What is the capital of France?", "Tell me a joke"]}
/>
) : null}

      {!isEmpty ? (
        <ChatMessages>
          <MessageList messages={messages} isTyping={isTyping} />
        </ChatMessages>
      ) : null}

      <ChatForm
        className="mt-auto"
        isPending={isLoading || isTyping}
        handleSubmit={handleSubmit}
      >
        {({ files, setFiles }) => (
          <MessageInput
            value={input}
            onChange={handleInputChange}
            allowAttachments
            files={files}
            setFiles={setFiles}
            stop={stop}
            isGenerating={isLoading}
          />
        )}
      </ChatForm>
    </ChatContainer>

)
}
Chat
A prebuilt Chat component that provides a complete chat interface with message history, typing indicators, file attachments support, and auto-scrolling behavior.

Props
Prop Type Description
messages Message[] Array of chat messages to display
input string Current input value
handleInputChange (e: React.ChangeEvent<HTMLTextAreaElement>) => void Input change handler
handleSubmit (event?, options?) => void Form submission handler
isGenerating boolean Whether AI is currently generating a response
stop () => void Function to stop AI generation
setMessages (messages: Message[]) => void Optional function to update messages state. When provided, enables enhanced tool cancellation handling
append? (message: Message) => void Function to append a new message (required for suggestions)
suggestions? string[] Array of prompt suggestions to show when chat is empty
onRateResponse? (messageId: string, rating: "thumbs-up" | "thumbs-down") => void Callback to handle user rating of AI responses, if not provided the rating buttons will not be displayed
className? string Additional CSS classes for ChatContainer
transcribeAudio (blob: Blob) => Promise<string> Function to transcribe audio (required for voice input, see message input docs for more info)
ChatContainer
A container component that wraps the whole chat interface. Used to build your own chat if not using the default Chat component.

Props
Prop Type Description
children ReactNode Child components to render
className string Additional CSS classes for Chat
ChatMessages Component
Provides a message list with auto-scrolling behavior, and typing indicators. Used to build your own chat if not using the default Chat component.

Props
Prop Type Description
messages Message[] Array of messages to display
isTyping boolean Whether to show typing indicator
ChatForm Component
A form component that wraps the message input and submit button, handles the state management for file uploads internally and uses a render function to pass them down to your input component. Used to build your own chat if not using the default Chat component.

Props
Prop Type Description
isPending boolean Whether form submission is pending
handleSubmit (event?, options?) => void Form submission handler
className? string Additional CSS classes
children (props: { files: File[] | null, setFiles: Function }) => ReactElement Render function for form content
Theming
The Chat component is using theme colors and fully themable with CSS variables.
