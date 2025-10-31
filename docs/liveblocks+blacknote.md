API Reference-
@liveblocks/react-blocknote
@liveblocks/react-blocknote provides you with a React plugin that adds collaboration to any BlockNote rich-text editor. It also adds realtime cursors, document persistence on the cloud, comments, and mentions. Use @liveblocks/node-prosemirror for server-side editing.

Setup
To set up your collaborative BlockNote editor, create an editor with useCreateBlockNoteWithLiveblocks and pass it into the BlockNoteView component provided by @blocknote/mantine.

import { useCreateBlockNoteWithLiveblocks } from "@liveblocks/react-blocknote";
import { BlockNoteView } from "@blocknote/mantine";

function TextEditor() {
  const editor = useCreateBlockNoteWithLiveblocks({});

  return (
    <div>
      <BlockNoteView editor={editor} />
    </div>
  );
}
Liveblocks BlockNote components should be passed editor to enable them.

import {
  useCreateBlockNoteWithLiveblocks,
  FloatingComposer,
} from "@liveblocks/react-blocknote";
import { BlockNoteView } from "@blocknote/mantine";

function TextEditor() {
  const editor = useCreateBlockNoteWithLiveblocks({});

  return (
    <div>
      <BlockNoteView editor={editor} />
      <FloatingComposer editor={editor} style={{ width: "350px" }} />
    </div>
  );
}
Learn more in our get started guides.

Default components
FloatingComposer
Displays a Composer near the current BlockNote selection, allowing you to create threads.

<FloatingComposer editor={editor} />
FloatingComposer
Submitting a comment will attach an annotation thread at the current selection. Should be passed your BlockNote editor, and it’s recommended you set a width value. Display created threads with AnchoredThreads or FloatingThreads.

import {
  FloatingComposer,
  FloatingThreads,
  useCreateBlockNoteWithLiveblocks,
} from "@liveblocks/react-blocknote";
import { BlockNoteView } from "@blocknote/mantine";

function TextEditor() {
  const editor = useCreateBlockNoteWithLiveblocks({});

  return (
    <div>
      <BlockNoteView editor={editor} />
      <FloatingComposer editor={editor} style={{ width: "350px" }} />
      <FloatingThreads editor={editor} style={{ width: "350px" }} />
    </div>
  );
}
Opening the composer
To open the FloatingComposer, you need to click the comment button in the BlockNote toolbar, or call the addPendingComment command added by Liveblocks. You can use liveblocksCommentMark to check if the current selection is a comment.

import { BlockNoteEditor } from "@blocknote/core";

function Toolbar({ editor }: { editor: BlockNoteEditor | null }) {
  if (!editor) {
    return null;
  }

  return (
    <button
      onClick={() => {
        (editor._tiptapEditor as any).chain().focus().addPendingComment().run();
      }}
      data-active={(editor._tiptapEditor as any).isActive(
        "liveblocksCommentMark"
      )}
    >
      💬 New comment
    </button>
  );
}
Props
metadata
ThreadMetadata
The metadata of the thread to create.

onComposerSubmit
function
See full type
The event handler called when the composer is submitted.

defaultValue
CommentBody
The composer’s initial value.

collapsed
boolean
Whether the composer is collapsed. Setting a value will make the composer controlled.

onCollapsedChange
function
See full type
The event handler called when the collapsed state of the composer changes.

defaultCollapsed
boolean
Whether the composer is initially collapsed. Setting a value will make the composer uncontrolled.

disabled
boolean
Whether the composer is disabled.

autoFocus
boolean
Whether to focus the composer on mount.

overrides
Partial<GlobalOverrides & ComposerOverrides>
Override the component’s strings.

FloatingThreads
Displays floating Thread components below text highlights in the editor.

<FloatingThreads editor={editor} threads={threads} />
FloatingThreads
Takes a list of threads retrieved from useThreads and renders them to the page. Each thread is opened by clicking on its corresponding text highlight. Should be passed your BlockNote editor, and it’s recommended you set a width value.

import { useThreads } from "@liveblocks/react/suspense";
import {
  FloatingComposer,
  FloatingThreads,
  useCreateBlockNoteWithLiveblocks,
} from "@liveblocks/react-blocknote";
import { BlockNoteView } from "@blocknote/mantine";

function TextEditor() {
  const editor = useCreateBlockNoteWithLiveblocks({});

  const { threads } = useThreads();

  return (
    <div>
      <BlockNoteView editor={editor} />
      <FloatingComposer editor={editor} style={{ width: "350px" }} />
      <FloatingThreads
        editor={editor}
        threads={threads}
        style={{ width: "350px" }}
      />
    </div>
  );
}
Resolved threads
The FloatingThreads component automatically excludes resolved threads from display. Any resolved threads passed in the threads list will not be shown.

Recommended usage
FloatingThreads and AnchoredThreads have been designed to work together to provide the optimal experience on mobile and desktop. We generally recommend using both components, hiding one on smaller screens, as we are below with Tailwind classes. Most apps also don’t need to display resolved threads, so we can filter those out with a useThreads option.

import { useThreads } from "@liveblocks/react/suspense";
import { AnchoredThreads, FloatingThreads } from "@liveblocks/react-blocknote";
import { BlockNoteEditor } from "@blocknote/core";

function ThreadOverlay({ editor }: { editor: BlockNoteEditor | null }) {
  const { threads } = useThreads({ query: { resolved: false } });

  return (
    <>
      <FloatingThreads
        editor={editor}
        threads={threads}
        className="w-[350px] block md:hidden"
      />
      <AnchoredThreads
        editor={editor}
        threads={threads}
        className="w-[350px] hidden sm:block"
      />
    </>
  );
}
Alternatively use a media query hook
We can place this component inside ClientSideSuspense to prevent it rendering until threads have loaded.

<div>
  <BlockNoteView editor={editor} />
  <FloatingComposer editor={editor} style={{ width: "350px" }} />
  <ClientSideSuspense fallback={null}>
    <ThreadOverlay editor={editor} />
  </ClientSideSuspense>
</div>
Customization
The FloatingThreads component acts as a wrapper around each individual Thread. You can treat the component like you would a div, using classes, listeners, and more.

<FloatingThreads
  editor={editor}
  threads={threads}
  className="my-floating-thread"
/>
To apply styling to each Thread, you can pass a custom Thread property to components and modify this in any way. This is the best way to modify a thread’s width.

import { Thread } from "@liveblocks/react-ui";

<FloatingThreads
  editor={editor}
  threads={threads}
  className="my-floating-thread"
  components={{
    Thread: (props) => (
      <Thread {...props} className="border shadow" style={{ width: "300px" }} />
    ),
  }}
/>;
You can return any custom ReactNode here, including anything from a simple wrapper around Thread, up to a full custom Thread component built using our Comment primitives.

import { Comment } from "@liveblocks/react-ui/primitives";

<FloatingThreads
  editor={editor}
  threads={threads}
  className="my-floating-thread"
  components={{
    Thread: (props) => (
      <div>
        {props.thread.comments.map((comment) => (
          <Comment.Body
            key={comment.id}
            body={comment.body}
            components={/* ... */}
          />
        ))}
      </div>
    ),
  }}
/>;
Props
threads
ThreadData[]
Required
The threads to display.

components
Partial<AnchoredThreadsComponents>
Override the component’s components.

components.Thread
(props: ThreadProps) => ReactNode
Override the Thread component.

AnchoredThreads
Displays a list of Thread components vertically alongside the editor.

<AnchoredThreads editor={editor} threads={threads} />
AnchoredThreads
Takes a list of threads retrieved from useThreads and renders them to the page. Each thread is displayed at the same vertical coordinates as its corresponding text highlight. If multiple highlights are in the same location, each thread is placed in order below the previous thread.

import { useThreads } from "@liveblocks/react/suspense";
import {
  FloatingComposer,
  AnchoredThreads,
  useCreateBlockNoteWithLiveblocks,
} from "@liveblocks/react-blocknote";
import { BlockNoteView } from "@blocknote/mantine";

function TextEditor() {
  const editor = useCreateBlockNoteWithLiveblocks({});

  const { threads } = useThreads();

  return (
    <div>
      <BlockNoteView editor={editor} />
      <FloatingComposer editor={editor} style={{ width: "350px" }} />
      <AnchoredThreads
        editor={editor}
        threads={threads}
        style={{ width: "350px" }}
      />
    </div>
  );
}
Resolved threads
The AnchoredThreads component automatically excludes resolved threads from display. Any resolved threads passed in the threads list will not be shown.

Recommended usage
FloatingThreads and AnchoredThreads have been designed to work together to provide the optimal experience on mobile and desktop. We generally recommend using both components, hiding one on smaller screens, as we are below with Tailwind classes. Most apps also don’t need to display resolved threads, so we can filter those out with a useThreads option.

import { useThreads } from "@liveblocks/react/suspense";
import { AnchoredThreads, FloatingThreads } from "@liveblocks/react-blocknote";
import { BlockNoteEditor } from "@blocknote/core";

function ThreadOverlay({ editor }: { editor: BlockNoteEditor | null }) {
  const { threads } = useThreads({ query: { resolved: false } });

  return (
    <>
      <FloatingThreads
        editor={editor}
        threads={threads}
        className="w-[350px] block md:hidden"
      />
      <AnchoredThreads
        editor={editor}
        threads={threads}
        className="w-[350px] hidden sm:block"
      />
    </>
  );
}
Alternatively use a media query hook
We can place this component inside ClientSideSuspense to prevent it rendering until threads have loaded.

<div>
  <BlockNoteView editor={editor} />
  <FloatingComposer editor={editor} style={{ width: "350px" }} />
  <ClientSideSuspense fallback={null}>
    <ThreadOverlay editor={editor} />
  </ClientSideSuspense>
</div>
Customization
The AnchoredThreads component acts as a wrapper around each Thread. It has no width, so setting this is required, and each thread will take on the width of the wrapper. You can treat the component like you would a div, using classes, listeners, and more.

<AnchoredThreads
  editor={editor}
  threads={threads}
  style={{ width: "350px" }}
  className="my-anchored-thread"
/>
To apply styling to each Thread, you can pass a custom Thread property to components and modify this in any way.

import { Thread } from "@liveblocks/react-ui";

<AnchoredThreads
  editor={editor}
  threads={threads}
  style={{ width: "350px" }}
  className="my-anchored-thread"
  components={{
    Thread: (props) => (
      <Thread
        {...props}
        className="border shadow"
        style={{ background: "white" }}
      />
    ),
  }}
/>;
You can return any custom ReactNode here, including anything from a simple wrapper around Thread, up to a full custom Thread component built using our Comment primitives.

import { Comment } from "@liveblocks/react-ui/primitives";

<AnchoredThreads
  editor={editor}
  threads={threads}
  style={{ width: "350px" }}
  className="my-anchored-thread"
  components={{
    Thread: (props) => (
      <div>
        {props.thread.comments.map((comment) => (
          <Comment.Body
            key={comment.id}
            body={comment.body}
            components={/* ... */}
          />
        ))}
      </div>
    ),
  }}
/>;
Modifying thread floating positions
Using CSS variables you can modify the gap between threads, and the horizontal offset that’s added when a thread is selected.

.lb-tiptap-anchored-threads {
  /* Minimum gap between threads */
  --lb-tiptap-anchored-threads-gap: 8px;

  /* How far the active thread is offset to the left */
  --lb-tiptap-anchored-threads-active-thread-offset: 12px;
}
Props
threads
ThreadData[]
Required
The threads to display.

components
Partial<AnchoredThreadsComponents>
Override the component’s components.

components.Thread
(props: ThreadProps) => ReactNode
Override the Thread component.

HistoryVersionPreview
beta
The HistoryVersionPreview component allows you to display a preview of a specific version of your BlockNote editor’s content. It also contains a button and logic for restoring. It must be used inside the <LiveblocksPlugin> context. To render a list of versions, see VersionHistory.

Usage
import { HistoryVersionPreview } from "@liveblocks/react-blocknote";

function VersionPreview({ selectedVersion, onVersionRestore }) {
  return (
    <HistoryVersionPreview
      version={selectedVersion}
      onVersionRestore={onVersionRestore}
    />
  );
}
Props
version
HistoryVersion
Required
The version of the editor content to preview.

onVersionRestore
(version: HistoryVersion) => void
Callback function called when the user chooses to restore this version.

The HistoryVersionPreview component renders a read-only view of the specified version of the editor content. It also provides a button for users to restore the displayed version.

Hooks
useCreateBlockNoteWithLiveblocks
Creates a Liveblocks collaborative BlockNote editor. Use this hook instead of useCreateBlockNote. editor should be passed to BlockNoteView.

import { useCreateBlockNoteWithLiveblocks } from "@liveblocks/react-blocknote";
import { BlockNoteView } from "@blocknote/mantine";

function TextEditor() {
  const editor = useCreateBlockNoteWithLiveblocks({});

  return (
    <div>
      <BlockNoteView editor={editor} />
    </div>
  );
}
A number of options can be applied to BlockNote and Liveblocks.

const editor = useCreateBlockNoteWithLiveblocks(
  {
    animations: false,
    trailingBlock: false,

    // Other BlockNote options
    // ...
  },
  {
    initialContent: "<p>Hello world</p>",
    field: "editor-one",

    // Other Liveblocks options
    // ...
  }
);
Returns
liveblocks
Extension
Returns a BlockNote editor with collaborative Liveblocks features.

Arguments
blockNoteOptions
BlockNoteEditorOptions
Options to apply to BlockNote. Learn more.

liveblocksOptions
object
Options to apply to Liveblocks.

liveblocksOptions.initialContent
Content
The initial content for the editor, if it’s never been set. Learn more.

liveblocksOptions.field
string
The name of this text editor’s field. Allows you to use multiple editors on one page, if each has a separate field value. Learn more.

liveblocksOptions.offlineSupport_experimental
boolean
Default is false
Experimental. Enable offline support using IndexedDB. This means the after the first load, documents will be stored locally and load instantly. Learn more.

liveblocksOptions.comments
boolean
Default is true
Enable comments in the editor.

liveblocksOptions.mentions
boolean
Default is true
Enable mentions in the editor.

Setting initial content
Initial content for the editor can be set with initialContent. This content will only be used if the current editor has never been edited by any users, and is ignored otherwise.

import { useCreateBlockNoteWithLiveblocks } from "@liveblocks/react-blocknote";

function TextEditor() {
  const editor = useCreateBlockNoteWithLiveblocks(
    {},
    {
      initialContent: "<p>Hello world</p>",
    }
  );

  // ...
}
Multiple editors
It’s possible to use multiple editors on one page by passing values to the field property. Think of it like an ID for the current editor.

import { useCreateBlockNoteWithLiveblocks } from "@liveblocks/react-blocknote";

function TextEditor() {
  const editor = useCreateBlockNoteWithLiveblocks(
    {},
    {
      field: "editor-one",
    }
  );

  // ...
}
Here’s an example of how multiple editors may be set up.

import { useCreateBlockNoteWithLiveblocks } from "@liveblocks/react-blocknote";
import { BlockNoteView } from "@blocknote/mantine";

function TextEditors() {
  return (
    <div>
      <TextEditor field="one" />
      <TextEditor field="two" />
    </div>
  );
}

function TextEditor({ field }: { field: string }) {
  const editor = useCreateBlockNoteWithLiveblocks(
    {},
    {
      field,
    }
  );

  return (
    <div>
      <BlockNoteView editor={editor} />
    </div>
  );
}
Offline support
experimental
It’s possible to enable offline support in your editor with an experimental option. This means that once a document has been opened, it’s saved locally on the browser, and can be shown instantly without a loading screen. As soon as Liveblocks connects, any remote changes will be synchronized, without any load spinner. Enable this by passing a offlineSupport_experimental value.

import { useCreateBlockNoteWithLiveblocks } from "@liveblocks/react-blocknote";

function TextEditor() {
  const editor = useCreateBlockNoteWithLiveblocks(
    {},
    {
      offlineSupport_experimental: true,
    }
  );

  // ...
}
To make sure that your editor loads instantly, you must structure your app carefully to avoid any Liveblocks hooks and ClientSideSuspense components from triggering a loading screen. For example, if you’re displaying threads in your editor with useThreads, you must place this inside a separate component and wrap it in ClientSideSuspense.

"use client";

import { ClientSideSuspense, useThreads } from "@liveblocks/react/suspense";
import {
  useCreateBlockNoteWithLiveblocks,
  AnchoredThreads,
  FloatingComposer,
} from "@liveblocks/react-blocknote";
import { BlockNoteView } from "@blocknote/mantine";
import { BlockNoteEditor } from "@blocknote/core";

export function TiptapEditor() {
  const editor = useCreateBlockNoteWithLiveblocks(
    {},
    {
      offlineSupport_experimental: true,
    }
  );

  return (
    <>
      <BlockNoteView editor={editor} />
      <FloatingComposer editor={editor} style={{ width: 350 }} />
      <ClientSideSuspense fallback={null}>
        <Threads editor={editor} />
      </ClientSideSuspense>
    </>
  );
}

function Threads({ editor }: { editor: BlockNoteEditor }) {
  const { threads } = useThreads();

  return <AnchoredThreads editor={editor} threads={threads} />;
}
useIsEditorReady
Used to check if the editor content has been loaded or not, helpful for displaying a loading skeleton.

import { useIsEditorReady } from "@liveblocks/react-blocknote";

const status = useIsEditorReady();
Here's how it can be used in the context of your editor.

import {
  useCreateBlockNoteWithLiveblocks,
  useIsEditorReady,
} from "@liveblocks/react-blocknote";
import { BlockNoteView } from "@blocknote/mantine";

function TextEditor() {
  const editor = useCreateBlockNoteWithLiveblocks({});
  const ready = useIsEditorReady();

  return (
    <div>
      {!ready ? <div>Loading...</div> : <BlockNoteView editor={editor} />}
    </div>
  );
}
Stylesheets
React BlockNote comes with default styles, and these can be imported into the root of your app or directly into a CSS file with @import. Note that you must also install and import a stylesheet from @liveblocks/react-ui to use these styles.

import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-blocknote/styles.css";
Customizing your styles
Adding dark mode and customizing your styles is part of @liveblocks/react-ui, learn how to do this under styling and customization.

