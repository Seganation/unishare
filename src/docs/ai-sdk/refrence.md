
# `customProvider()`

With a custom provider, you can map ids to any model.
This allows you to set up custom model configurations, alias names, and more.
The custom provider also supports a fallback provider, which is useful for
wrapping existing providers and adding additional functionality.

### Example: custom model settings

You can create a custom provider using `customProvider`.

```ts
import { openai } from '@ai-sdk/openai';
import { customProvider } from 'ai';

// custom provider with different model settings:
export const myOpenAI = customProvider({
  languageModels: {
    // replacement model with custom settings:
    'gpt-4': wrapLanguageModel({
      model: openai('gpt-4'),
      middleware: defaultSettingsMiddleware({
        settings: {
          providerOptions: {
            openai: {
              reasoningEffort: 'high',
            },
          },
        },
      }),
    }),
    // alias model with custom settings:
    'gpt-4o-reasoning-high': wrapLanguageModel({
      model: openai('gpt-4o'),
      middleware: defaultSettingsMiddleware({
        settings: {
          providerOptions: {
            openai: {
              reasoningEffort: 'high',
            },
          },
        },
      }),
    }),
  },
  fallbackProvider: openai,
});
```

## Import

<Snippet text={`import {  customProvider } from "ai"`} prompt={false} />

## API Signature

### Parameters

<PropertiesTable
  content={[
    {
      name: 'languageModels',
      type: 'Record<string, LanguageModel>',
      isOptional: true,
      description:
        'A record of language models, where keys are model IDs and values are LanguageModel instances.',
    },
    {
      name: 'textEmbeddingModels',
      type: 'Record<string, EmbeddingModel<string>>',
      isOptional: true,
      description:
        'A record of text embedding models, where keys are model IDs and values are EmbeddingModel<string> instances.',
    },
    {
      name: 'imageModels',
      type: 'Record<string, ImageModel>',
      isOptional: true,
      description:
        'A record of image models, where keys are model IDs and values are ImageModelV2 instances.',
    },
    {
      name: 'fallbackProvider',
      type: 'Provider',
      isOptional: true,
      description:
        'An optional fallback provider to use when a requested model is not found in the custom provider.',
    },
  ]}
/>

### Returns

The `customProvider` function returns a `Provider` instance. It has the following methods:

<PropertiesTable
  content={[
    {
      name: 'languageModel',
      type: '(id: string) => LanguageModel',
      description:
        'A function that returns a language model by its id (format: providerId:modelId)',
    },
    {
      name: 'textEmbeddingModel',
      type: '(id: string) => EmbeddingModel<string>',
      description:
        'A function that returns a text embedding model by its id (format: providerId:modelId)',
    },
    {
      name: 'imageModel',
      type: '(id: string) => ImageModel',
      description:
        'A function that returns an image model by its id (format: providerId:modelId)',
    },
  ]}
/>

# `generateId()`

Generates a unique identifier. You can optionally provide the length of the ID.

This is the same id generator used by the AI SDK.

```ts
import { generateId } from 'ai';

const id = generateId();
```

## Import

<Snippet text={`import { generateId } from "ai"`} prompt={false} />

## API Signature

### Parameters

<PropertiesTable
  content={[
    {
      name: 'size',
      type: 'number',
      description:
        'The length of the generated ID. It defaults to 16. This parameter is deprecated and will be removed in the next major version.',
    },
  ]}
/>

### Returns

A string representing the generated ID.

## See also

- [`createIdGenerator()`](/docs/reference/ai-sdk-core/create-id-generator)

# `createIdGenerator()`

Creates a customizable ID generator function. You can configure the alphabet, prefix, separator, and default size of the generated IDs.

```ts
import { createIdGenerator } from 'ai';

const generateCustomId = createIdGenerator({
  prefix: 'user',
  separator: '_',
});

const id = generateCustomId(); // Example: "user_1a2b3c4d5e6f7g8h"
```

## Import

<Snippet text={`import { createIdGenerator } from "ai"`} prompt={false} />

## API Signature

### Parameters

<PropertiesTable
  content={[
    {
      name: 'options',
      type: 'object',
      description:
        'Optional configuration object with the following properties:',
    },
    {
      name: 'options.alphabet',
      type: 'string',
      description:
        'The characters to use for generating the random part of the ID. Defaults to alphanumeric characters (0-9, A-Z, a-z).',
    },
    {
      name: 'options.prefix',
      type: 'string',
      description:
        'A string to prepend to all generated IDs. Defaults to none.',
    },
    {
      name: 'options.separator',
      type: 'string',
      description:
        'The character(s) to use between the prefix and the random part. Defaults to "-".',
    },
    {
      name: 'options.size',
      type: 'number',
      description:
        'The default length of the random part of the ID. Defaults to 16.',
    },
  ]}
/>

### Returns

Returns a function that generates IDs based on the configured options.

### Notes

- The generator uses non-secure random generation and should not be used for security-critical purposes.
- The separator character must not be part of the alphabet to ensure reliable prefix checking.

## Example

```ts
// Create a custom ID generator for user IDs
const generateUserId = createIdGenerator({
  prefix: 'user',
  separator: '_',
  size: 8,
});

// Generate IDs
const id1 = generateUserId(); // e.g., "user_1a2b3c4d"
```

## See also

- [`generateId()`](/docs/reference/ai-sdk-core/generate-id)

# `useChat()`

Allows you to easily create a conversational user interface for your chatbot application. It enables the streaming of chat messages from your AI provider, manages the chat state, and updates the UI automatically as new messages are received.

<Note>
  The `useChat` API has been significantly updated in AI SDK 5.0. It now uses a
  transport-based architecture and no longer manages input state internally. See
  the [migration
  guide](/docs/migration-guides/migration-guide-5-0#usechat-changes) for
  details.
</Note>

## Import

<Tabs items={['React', 'Svelte', 'Vue']}>
  <Tab>
    <Snippet
      text="import { useChat } from '@ai-sdk/react'"
      dark
      prompt={false}
    />
  </Tab>
  <Tab>
    <Snippet text="import { Chat } from '@ai-sdk/svelte'" dark prompt={false} />
  </Tab>
  <Tab>
    <Snippet text="import { Chat } from '@ai-sdk/vue'" dark prompt={false} />
  </Tab>
</Tabs>

## API Signature

### Parameters

<PropertiesTable
  content={[
    {
      name: 'chat',
      type: 'Chat<UIMessage>',
      isOptional: true,
      description:
        'An existing Chat instance to use. If provided, other parameters are ignored.',
    },
    {
      name: 'transport',
      type: 'ChatTransport',
      isOptional: true,
      description:
        'The transport to use for sending messages. Defaults to DefaultChatTransport with `/api/chat` endpoint.',
      properties: [
        {
          type: 'DefaultChatTransport',
          parameters: [
            {
              name: 'api',
              type: "string = '/api/chat'",
              isOptional: true,
              description: 'The API endpoint for chat requests.',
            },
            {
              name: 'credentials',
              type: 'RequestCredentials',
              isOptional: true,
              description: 'The credentials mode for fetch requests.',
            },
            {
              name: 'headers',
              type: 'Record<string, string> | Headers',
              isOptional: true,
              description: 'HTTP headers to send with requests.',
            },
            {
              name: 'body',
              type: 'object',
              isOptional: true,
              description: 'Extra body object to send with requests.',
            },
            {
              name: 'prepareSendMessagesRequest',
              type: 'PrepareSendMessagesRequest',
              isOptional: true,
              description:
                'A function to customize the request before chat API calls.',
              properties: [
                {
                  type: 'PrepareSendMessagesRequest',
                  parameters: [
                    {
                      name: 'options',
                      type: 'PrepareSendMessageRequestOptions',
                      description: 'Options for preparing the request',
                      properties: [
                        {
                          type: 'PrepareSendMessageRequestOptions',
                          parameters: [
                            {
                              name: 'id',
                              type: 'string',
                              description: 'The chat ID',
                            },
                            {
                              name: 'messages',
                              type: 'UIMessage[]',
                              description: 'Current messages in the chat',
                            },
                            {
                              name: 'requestMetadata',
                              type: 'unknown',
                              description: 'The request metadata',
                            },
                            {
                              name: 'body',
                              type: 'Record<string, any> | undefined',
                              description: 'The request body',
                            },
                            {
                              name: 'credentials',
                              type: 'RequestCredentials | undefined',
                              description: 'The request credentials',
                            },
                            {
                              name: 'headers',
                              type: 'HeadersInit | undefined',
                              description: 'The request headers',
                            },
                            {
                              name: 'api',
                              type: 'string',
                              description: `The API endpoint to use for the request. If not specified, it defaults to the transport’s API endpoint: /api/chat.`,
                            },
                            {
                              name: 'trigger',
                              type: "'submit-message' | 'regenerate-message'",
                              description: 'The trigger for the request',
                            },
                            {
                              name: 'messageId',
                              type: 'string | undefined',
                              description: 'The message ID if applicable',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'prepareReconnectToStreamRequest',
              type: 'PrepareReconnectToStreamRequest',
              isOptional: true,
              description:
                'A function to customize the request before reconnect API call.',
              properties: [
                {
                  type: 'PrepareReconnectToStreamRequest',
                  parameters: [
                    {
                      name: 'options',
                      type: 'PrepareReconnectToStreamRequestOptions',
                      description:
                        'Options for preparing the reconnect request',
                      properties: [
                        {
                          type: 'PrepareReconnectToStreamRequestOptions',
                          parameters: [
                            {
                              name: 'id',
                              type: 'string',
                              description: 'The chat ID',
                            },
                            {
                              name: 'requestMetadata',
                              type: 'unknown',
                              description: 'The request metadata',
                            },
                            {
                              name: 'body',
                              type: 'Record<string, any> | undefined',
                              description: 'The request body',
                            },
                            {
                              name: 'credentials',
                              type: 'RequestCredentials | undefined',
                              description: 'The request credentials',
                            },
                            {
                              name: 'headers',
                              type: 'HeadersInit | undefined',
                              description: 'The request headers',
                            },
                            {
                              name: 'api',
                              type: 'string',
                              description: `The API endpoint to use for the request. If not specified, it defaults to the transport’s API endpoint combined with the chat ID: /api/chat/{chatId}/stream.`,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'id',
      type: 'string',
      isOptional: true,
      description:
        'A unique identifier for the chat. If not provided, a random one will be generated.',
    },
    {
      name: 'messages',
      type: 'UIMessage[]',
      isOptional: true,
      description: 'Initial chat messages to populate the conversation with.',
    },
    {
      name: 'onToolCall',
      type: '({toolCall: ToolCall}) => void | Promise<void>',
      isOptional: true,
      description:
        'Optional callback function that is invoked when a tool call is received. You must call addToolOutput to provide the tool result.',
    },
    {
      name: 'sendAutomaticallyWhen',
      type: '(options: { messages: UIMessage[] }) => boolean | PromiseLike<boolean>',
      isOptional: true,
      description:
        'When provided, this function will be called when the stream is finished or a tool call is added to determine if the current messages should be resubmitted. You can use the lastAssistantMessageIsCompleteWithToolCalls helper for common scenarios.',
    },
    {
      name: 'onFinish',
      type: '(options: OnFinishOptions) => void',
      isOptional: true,
      description: 'Called when the assistant response has finished streaming.',
      properties: [
        {
          type: 'OnFinishOptions',
          parameters: [
            {
              name: 'message',
              type: 'UIMessage',
              description: 'The response message.',
            },
            {
              name: 'messages',
              type: 'UIMessage[]',
              description: 'All messages including the response message',
            },
            {
              name: 'isAbort',
              type: 'boolean',
              description:
                'True when the request has been aborted by the client.',
            },
            {
              name: 'isDisconnect',
              type: 'boolean',
              description:
                'True if the server has been disconnected, e.g. because of a network error.',
            },
            {
              name: 'isError',
              type: 'boolean',
              description: `True if errors during streaming caused the response to stop early.`,
            },
            {
              name: 'finishReason',
              type: "'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error' | 'other' | 'unknown'",
              isOptional: true,
              description:
                'The reason why the model finished generating the response. Undefined if the finish reason was not provided by the model.',
            },
          ],
        },
      ],
    },
    {
      name: 'onError',
      type: '(error: Error) => void',
      isOptional: true,
      description:
        'Callback function to be called when an error is encountered.',
    },
    {
      name: 'onData',
      type: '(dataPart: DataUIPart) => void',
      isOptional: true,
      description:
        'Optional callback function that is called when a data part is received.',
    },
    {
      name: 'experimental_throttle',
      type: 'number',
      isOptional: true,
      description:
        'Custom throttle wait in ms for the chat messages and data updates. Default is undefined, which disables throttling.',
    },
    {
      name: 'resume',
      type: 'boolean',
      isOptional: true,
      description:
        'Whether to resume an ongoing chat generation stream. Defaults to false.',
    },
  ]}
/>

### Returns

<PropertiesTable
  content={[
    {
      name: 'id',
      type: 'string',
      description: 'The id of the chat.',
    },
    {
      name: 'messages',
      type: 'UIMessage[]',
      description: 'The current array of chat messages.',
      properties: [
        {
          type: 'UIMessage',
          parameters: [
            {
              name: 'id',
              type: 'string',
              description: 'A unique identifier for the message.',
            },
            {
              name: 'role',
              type: "'system' | 'user' | 'assistant'",
              description: 'The role of the message.',
            },
            {
              name: 'parts',
              type: 'UIMessagePart[]',
              description:
                'The parts of the message. Use this for rendering the message in the UI.',
            },
            {
              name: 'metadata',
              type: 'unknown',
              isOptional: true,
              description: 'The metadata of the message.',
            },
          ],
        },
      ],
    },
    {
      name: 'status',
      type: "'submitted' | 'streaming' | 'ready' | 'error'",
      description:
        'The current status of the chat: "ready" (idle), "submitted" (request sent), "streaming" (receiving response), or "error" (request failed).',
    },
    {
      name: 'error',
      type: 'Error | undefined',
      description: 'The error object if an error occurred.',
    },
    {
      name: 'sendMessage',
      type: '(message: CreateUIMessage | string, options?: ChatRequestOptions) => void',
      description:
        'Function to send a new message to the chat. This will trigger an API call to generate the assistant response.',
      properties: [
        {
          type: 'ChatRequestOptions',
          parameters: [
            {
              name: 'headers',
              type: 'Record<string, string> | Headers',
              description:
                'Additional headers that should be to be passed to the API endpoint.',
            },
            {
              name: 'body',
              type: 'object',
              description:
                'Additional body JSON properties that should be sent to the API endpoint.',
            },
            {
              name: 'metadata',
              type: 'JSONValue',
              description: 'Additional data to be sent to the API endpoint.',
            },
          ],
        },
      ],
    },
    {
      name: 'regenerate',
      type: '(options?: { messageId?: string }) => void',
      description:
        'Function to regenerate the last assistant message or a specific message. If no messageId is provided, regenerates the last assistant message.',
    },
    {
      name: 'stop',
      type: '() => void',
      description:
        'Function to abort the current streaming response from the assistant.',
    },
    {
      name: 'clearError',
      type: '() => void',
      description: 'Clears the error state.',
    },
    {
      name: 'resumeStream',
      type: '() => void',
      description:
        'Function to resume an interrupted streaming response. Useful when a network error occurs during streaming.',
    },
    {
      name: 'addToolOutput',
      type: '(options: { tool: string; toolCallId: string; output: unknown } | { tool: string; toolCallId: string; state: "output-error", errorText: string }) => void',
      description:
        'Function to add a tool result to the chat. This will update the chat messages with the tool result. If sendAutomaticallyWhen is configured, it may trigger an automatic submission.',
    },
    {
      name: 'setMessages',
      type: '(messages: UIMessage[] | ((messages: UIMessage[]) => UIMessage[])) => void',
      description:
        'Function to update the messages state locally without triggering an API call. Useful for optimistic updates.',
    },
  ]}
/>

## Learn more

- [Chatbot](/docs/ai-sdk-ui/chatbot)
- [Chatbot with Tools](/docs/ai-sdk-ui/chatbot-with-tool-calling)
- [UIMessage](/docs/reference/ai-sdk-core/ui-message)

# `useCompletion()`

Allows you to create text completion based capabilities for your application. It enables the streaming of text completions from your AI provider, manages the state for chat input, and updates the UI automatically as new messages are received.

## Import

<Tabs items={['React', 'Svelte', 'Vue']}>
  <Tab>
    <Snippet
      text="import { useCompletion } from '@ai-sdk/react'"
      dark
      prompt={false}
    />
  </Tab>
  <Tab>
    <Snippet
      text="import { Completion } from '@ai-sdk/svelte'"
      dark
      prompt={false}
    />
  </Tab>
  <Tab>
    <Snippet
      text="import { useCompletion } from '@ai-sdk/vue'"
      dark
      prompt={false}
    />
  </Tab>

</Tabs>

## API Signature

### Parameters

<PropertiesTable
  content={[
    {
      name: 'api',
      type: "string = '/api/completion'",
      description:
        'The API endpoint that is called to generate text. It can be a relative path (starting with `/`) or an absolute URL.',
    },
    {
      name: 'id',
      type: 'string',
      description:
        'An unique identifier for the completion. If not provided, a random one will be generated. When provided, the `useCompletion` hook with the same `id` will have shared states across components. This is useful when you have multiple components showing the same chat stream',
    },
    {
      name: 'initialInput',
      type: 'string',
      description: 'An optional string for the initial prompt input.',
    },
    {
      name: 'initialCompletion',
      type: 'string',
      description: 'An optional string for the initial completion result.',
    },
    {
      name: 'onFinish',
      type: '(prompt: string, completion: string) => void',
      description:
        'An optional callback function that is called when the completion stream ends.',
    },
    {
      name: 'onError',
      type: '(error: Error) => void',
      description:
        'An optional callback that will be called when the chat stream encounters an error.',
    },
    {
      name: 'headers',
      type: 'Record<string, string> | Headers',
      description:
        'An optional object of headers to be passed to the API endpoint.',
    },
    {
      name: 'body',
      type: 'any',
      description:
        'An optional, additional body object to be passed to the API endpoint.',
    },
    {
      name: 'credentials',
      type: "'omit' | 'same-origin' | 'include'",
      description:
        'An optional literal that sets the mode of credentials to be used on the request. Defaults to same-origin.',
    },
    {
      name: 'streamProtocol',
      type: "'text' | 'data'",
      isOptional: true,
      description:
        'An optional literal that sets the type of stream to be used. Defaults to `data`. If set to `text`, the stream will be treated as a text stream.',
    },
    {
      name: 'fetch',
      type: 'FetchFunction',
      isOptional: true,
      description:
        'Optional. A custom fetch function to be used for the API call. Defaults to the global fetch function.',
    },
    {
      name: 'experimental_throttle',
      type: 'number',
      isOptional: true,
      description:
        'React only. Custom throttle wait time in milliseconds for the completion and data updates. When specified, throttles how often the UI updates during streaming. Default is undefined, which disables throttling.',
    },

]}
/>

### Returns

<PropertiesTable
  content={[
    {
      name: 'completion',
      type: 'string',
      description: 'The current text completion.',
    },
    {
      name: 'complete',
      type: '(prompt: string, options: { headers, body }) => void',
      description:
        'Function to execute text completion based on the provided prompt.',
    },
    {
      name: 'error',
      type: 'undefined | Error',
      description: 'The error thrown during the completion process, if any.',
    },
    {
      name: 'setCompletion',
      type: '(completion: string) => void',
      description: 'Function to update the `completion` state.',
    },
    {
      name: 'stop',
      type: '() => void',
      description: 'Function to abort the current API request.',
    },
    {
      name: 'input',
      type: 'string',
      description: 'The current value of the input field.',
    },
    {
      name: 'setInput',
      type: 'React.Dispatch<React.SetStateAction<string>>',
      description: 'The current value of the input field.',
    },
    {
      name: 'handleInputChange',
      type: '(event: any) => void',
      description:
        "Handler for the `onChange` event of the input field to control the input's value.",
    },
    {
      name: 'handleSubmit',
      type: '(event?: { preventDefault?: () => void }) => void',
      description:
        'Form submission handler that automatically resets the input field and appends a user message.',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Boolean flag indicating whether a fetch operation is currently in progress.',
    },
  ]}
/>

# `generateObject()`

Generates a typed, structured object for a given prompt and schema using a language model.

It can be used to force the language model to return structured data, e.g. for information extraction, synthetic data generation, or classification tasks.

#### Example: generate an object using a schema

```ts
import { generateObject } from 'ai';
__PROVIDER_IMPORT__;
import { z } from 'zod';

const { object } = await generateObject({
  model: __MODEL__,
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});

console.log(JSON.stringify(object, null, 2));
```

#### Example: generate an array using a schema

For arrays, you specify the schema of the array items.

```ts highlight="7"
import { generateObject } from 'ai';
__PROVIDER_IMPORT__;
import { z } from 'zod';

const { object } = await generateObject({
  model: __MODEL__,
  output: 'array',
  schema: z.object({
    name: z.string(),
    class: z
      .string()
      .describe('Character class, e.g. warrior, mage, or thief.'),
    description: z.string(),
  }),
  prompt: 'Generate 3 hero descriptions for a fantasy role playing game.',
});
```

#### Example: generate an enum

When you want to generate a specific enum value, you can set the output strategy to `enum`
and provide the list of possible values in the `enum` parameter.

```ts highlight="5-6"
import { generateObject } from 'ai';

const { object } = await generateObject({
  model: __MODEL__,
  output: 'enum',
  enum: ['action', 'comedy', 'drama', 'horror', 'sci-fi'],
  prompt:
    'Classify the genre of this movie plot: ' +
    '"A group of astronauts travel through a wormhole in search of a ' +
    'new habitable planet for humanity."',
});
```

#### Example: generate JSON without a schema

```ts highlight="6"
import { generateObject } from 'ai';

const { object } = await generateObject({
  model: __MODEL__,
  output: 'no-schema',
  prompt: 'Generate a lasagna recipe.',
});
```

To see `generateObject` in action, check out the [additional examples](#more-examples).

## Import

<Snippet text={`import { generateObject } from "ai"`} prompt={false} />

## API Signature

### Parameters

<PropertiesTable
  content={[
    {
      name: 'model',
      type: 'LanguageModel',
      description: "The language model to use. Example: openai('gpt-4.1')",
    },
    {
      name: 'output',
      type: "'object' | 'array' | 'enum' | 'no-schema' | undefined",
      description: "The type of output to generate. Defaults to 'object'.",
    },
    {
      name: 'schema',
      type: 'Zod Schema | JSON Schema',
      description:
        "The schema that describes the shape of the object to generate. \
        It is sent to the model to generate the object and used to validate the output. \
        You can either pass in a Zod schema or a JSON schema (using the `jsonSchema` function). \
        In 'array' mode, the schema is used to describe an array element. \
        Not available with 'no-schema' or 'enum' output.",
    },
    {
      name: 'schemaName',
      type: 'string | undefined',
      description:
        "Optional name of the output that should be generated. \
        Used by some providers for additional LLM guidance, e.g. via tool or schema name. \
        Not available with 'no-schema' or 'enum' output.",
    },
    {
      name: 'schemaDescription',
      type: 'string | undefined',
      description:
        "Optional description of the output that should be generated. \
        Used by some providers for additional LLM guidance, e.g. via tool or schema name. \
        Not available with 'no-schema' or 'enum' output.",
    },
    {
      name: 'enum',
      type: 'string[]',
      description:
        "List of possible values to generate. \
        Only available with 'enum' output.",
    },
    {
      name: 'system',
      type: 'string',
      description:
        'The system prompt to use that specifies the behavior of the model.',
    },
    {
      name: 'prompt',
      type: 'string | Array<SystemModelMessage | UserModelMessage | AssistantModelMessage | ToolModelMessage>',
      description: 'The input prompt to generate the text from.',
    },
    {
      name: 'messages',
      type: 'Array<SystemModelMessage | UserModelMessage | AssistantModelMessage | ToolModelMessage>',
      description:
        'A list of messages that represent a conversation. Automatically converts UI messages from the useChat hook.',
      properties: [
        {
          type: 'SystemModelMessage',
          parameters: [
            {
              name: 'role',
              type: "'system'",
              description: 'The role for the system message.',
            },
            {
              name: 'content',
              type: 'string',
              description: 'The content of the message.',
            },
          ],
        },
        {
          type: 'UserModelMessage',
          parameters: [
            {
              name: 'role',
              type: "'user'",
              description: 'The role for the user message.',
            },
            {
              name: 'content',
              type: 'string | Array<TextPart | ImagePart | FilePart>',
              description: 'The content of the message.',
              properties: [
                {
                  type: 'TextPart',
                  parameters: [
                    {
                      name: 'type',
                      type: "'text'",
                      description: 'The type of the message part.',
                    },
                    {
                      name: 'text',
                      type: 'string',
                      description: 'The text content of the message part.',
                    },
                  ],
                },
                {
                  type: 'ImagePart',
                  parameters: [
                    {
                      name: 'type',
                      type: "'image'",
                      description: 'The type of the message part.',
                    },
                    {
                      name: 'image',
                      type: 'string | Uint8Array | Buffer | ArrayBuffer | URL',
                      description:
                        'The image content of the message part. String are either base64 encoded content, base64 data URLs, or http(s) URLs.',
                    },
                    {
                      name: 'mediaType',
                      type: 'string',
                      description:
                        'The IANA media type of the image. Optional.',
                      isOptional: true,
                    },
                  ],
                },
                {
                  type: 'FilePart',
                  parameters: [
                    {
                      name: 'type',
                      type: "'file'",
                      description: 'The type of the message part.',
                    },
                    {
                      name: 'data',
                      type: 'string | Uint8Array | Buffer | ArrayBuffer | URL',
                      description:
                        'The file content of the message part. String are either base64 encoded content, base64 data URLs, or http(s) URLs.',
                    },
                    {
                      name: 'mediaType',
                      type: 'string',
                      description: 'The IANA media type of the file.',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'AssistantModelMessage',
          parameters: [
            {
              name: 'role',
              type: "'assistant'",
              description: 'The role for the assistant message.',
            },
            {
              name: 'content',
              type: 'string | Array<TextPart | FilePart | ReasoningPart | ToolCallPart>',
              description: 'The content of the message.',
              properties: [
                {
                  type: 'TextPart',
                  parameters: [
                    {
                      name: 'type',
                      type: "'text'",
                      description: 'The type of the message part.',
                    },
                    {
                      name: 'text',
                      type: 'string',
                      description: 'The text content of the message part.',
                    },
                  ],
                },
                {
                  type: 'ReasoningPart',
                  parameters: [
                    {
                      name: 'type',
                      type: "'reasoning'",
                      description: 'The type of the message part.',
                    },
                    {
                      name: 'text',
                      type: 'string',
                      description: 'The reasoning text.',
                    },
                  ],
                },
                {
                  type: 'FilePart',
                  parameters: [
                    {
                      name: 'type',
                      type: "'file'",
                      description: 'The type of the message part.',
                    },
                    {
                      name: 'data',
                      type: 'string | Uint8Array | Buffer | ArrayBuffer | URL',
                      description:
                        'The file content of the message part. String are either base64 encoded content, base64 data URLs, or http(s) URLs.',
                    },
                    {
                      name: 'mediaType',
                      type: 'string',
                      description: 'The IANA media type of the file.',
                    },
                    {
                      name: 'filename',
                      type: 'string',
                      description: 'The name of the file.',
                      isOptional: true,
                    },
                  ],
                },
                {
                  type: 'ToolCallPart',
                  parameters: [
                    {
                      name: 'type',
                      type: "'tool-call'",
                      description: 'The type of the message part.',
                    },
                    {
                      name: 'toolCallId',
                      type: 'string',
                      description: 'The id of the tool call.',
                    },
                    {
                      name: 'toolName',
                      type: 'string',
                      description:
                        'The name of the tool, which typically would be the name of the function.',
                    },
                    {
                      name: 'args',
                      type: 'object based on zod schema',
                      description:
                        'Parameters generated by the model to be used by the tool.',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'ToolModelMessage',
          parameters: [
            {
              name: 'role',
              type: "'tool'",
              description: 'The role for the assistant message.',
            },
            {
              name: 'content',
              type: 'Array<ToolResultPart>',
              description: 'The content of the message.',
              properties: [
                {
                  type: 'ToolResultPart',
                  parameters: [
                    {
                      name: 'type',
                      type: "'tool-result'",
                      description: 'The type of the message part.',
                    },
                    {
                      name: 'toolCallId',
                      type: 'string',
                      description:
                        'The id of the tool call the result corresponds to.',
                    },
                    {
                      name: 'toolName',
                      type: 'string',
                      description:
                        'The name of the tool the result corresponds to.',
                    },
                    {
                      name: 'result',
                      type: 'unknown',
                      description:
                        'The result returned by the tool after execution.',
                    },
                    {
                      name: 'isError',
                      type: 'boolean',
                      isOptional: true,
                      description:
                        'Whether the result is an error or an error message.',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'maxOutputTokens',
      type: 'number',
      isOptional: true,
      description: 'Maximum number of tokens to generate.',
    },
    {
      name: 'temperature',
      type: 'number',
      isOptional: true,
      description:
        'Temperature setting. The value is passed through to the provider. The range depends on the provider and model. It is recommended to set either `temperature` or `topP`, but not both.',
    },
    {
      name: 'topP',
      type: 'number',
      isOptional: true,
      description:
        'Nucleus sampling. The value is passed through to the provider. The range depends on the provider and model. It is recommended to set either `temperature` or `topP`, but not both.',
    },
    {
      name: 'topK',
      type: 'number',
      isOptional: true,
      description:
        'Only sample from the top K options for each subsequent token. Used to remove "long tail" low probability responses. Recommended for advanced use cases only. You usually only need to use temperature.',
    },
    {
      name: 'presencePenalty',
      type: 'number',
      isOptional: true,
      description:
        'Presence penalty setting. It affects the likelihood of the model to repeat information that is already in the prompt. The value is passed through to the provider. The range depends on the provider and model.',
    },
    {
      name: 'frequencyPenalty',
      type: 'number',
      isOptional: true,
      description:
        'Frequency penalty setting. It affects the likelihood of the model to repeatedly use the same words or phrases. The value is passed through to the provider. The range depends on the provider and model.',
    },
    {
      name: 'seed',
      type: 'number',
      isOptional: true,
      description:
        'The seed (integer) to use for random sampling. If set and supported by the model, calls will generate deterministic results.',
    },
    {
      name: 'maxRetries',
      type: 'number',
      isOptional: true,
      description:
        'Maximum number of retries. Set to 0 to disable retries. Default: 2.',
    },
    {
      name: 'abortSignal',
      type: 'AbortSignal',
      isOptional: true,
      description:
        'An optional abort signal that can be used to cancel the call.',
    },
    {
      name: 'headers',
      type: 'Record<string, string>',
      isOptional: true,
      description:
        'Additional HTTP headers to be sent with the request. Only applicable for HTTP-based providers.',
    },
    {
      name: 'experimental_repairText',
      type: '(options: RepairTextOptions) => Promise<string>',
      isOptional: true,
      description:
        'A function that attempts to repair the raw output of the model to enable JSON parsing. Should return the repaired text or null if the text cannot be repaired.',
      properties: [
        {
          type: 'RepairTextOptions',
          parameters: [
            {
              name: 'text',
              type: 'string',
              description: 'The text that was generated by the model.',
            },
            {
              name: 'error',
              type: 'JSONParseError | TypeValidationError',
              description: 'The error that occurred while parsing the text.',
            },
          ],
        },
      ],
    },
    {
      name: 'experimental_download',
      type: '(requestedDownloads: Array<{ url: URL; isUrlSupportedByModel: boolean }>) => Promise<Array<null | { data: Uint8Array; mediaType?: string }>>',
      isOptional: true,
      description:
        'Custom download function to control how URLs are fetched when they appear in prompts. By default, files are downloaded if the model does not support the URL for the given media type. Experimental feature. Return null to pass the URL directly to the model (when supported), or return downloaded content with data and media type.',
    },
    {
      name: 'experimental_telemetry',
      type: 'TelemetrySettings',
      isOptional: true,
      description: 'Telemetry configuration. Experimental feature.',
      properties: [
        {
          type: 'TelemetrySettings',
          parameters: [
            {
              name: 'isEnabled',
              type: 'boolean',
              isOptional: true,
              description:
                'Enable or disable telemetry. Disabled by default while experimental.',
            },
            {
              name: 'recordInputs',
              type: 'boolean',
              isOptional: true,
              description:
                'Enable or disable input recording. Enabled by default.',
            },
            {
              name: 'recordOutputs',
              type: 'boolean',
              isOptional: true,
              description:
                'Enable or disable output recording. Enabled by default.',
            },
            {
              name: 'functionId',
              type: 'string',
              isOptional: true,
              description:
                'Identifier for this function. Used to group telemetry data by function.',
            },
            {
              name: 'metadata',
              isOptional: true,
              type: 'Record<string, string | number | boolean | Array<null | undefined | string> | Array<null | undefined | number> | Array<null | undefined | boolean>>',
              description:
                'Additional information to include in the telemetry data.',
            },
          ],
        },
      ],
    },
    {
      name: 'providerOptions',
      type: 'Record<string,Record<string,JSONValue>> | undefined',
      isOptional: true,
      description:
        'Provider-specific options. The outer key is the provider name. The inner values are the metadata. Details depend on the provider.',
    },
  ]}
/>

### Returns

<PropertiesTable
  content={[
    {
      name: 'object',
      type: 'based on the schema',
      description:
        'The generated object, validated by the schema (if it supports validation).',
    },
    {
      name: 'finishReason',
      type: "'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error' | 'other' | 'unknown'",
      description: 'The reason the model finished generating the text.',
    },
    {
      name: 'usage',
      type: 'LanguageModelUsage',
      description: 'The token usage of the generated text.',
      properties: [
        {
          type: 'LanguageModelUsage',
          parameters: [
            {
              name: 'inputTokens',
              type: 'number | undefined',
              description: 'The number of input (prompt) tokens used.',
            },
            {
              name: 'outputTokens',
              type: 'number | undefined',
              description: 'The number of output (completion) tokens used.',
            },
            {
              name: 'totalTokens',
              type: 'number | undefined',
              description:
                'The total number of tokens as reported by the provider. This number might be different from the sum of inputTokens and outputTokens and e.g. include reasoning tokens or other overhead.',
            },
            {
              name: 'reasoningTokens',
              type: 'number | undefined',
              isOptional: true,
              description: 'The number of reasoning tokens used.',
            },
            {
              name: 'cachedInputTokens',
              type: 'number | undefined',
              isOptional: true,
              description: 'The number of cached input tokens.',
            },
          ],
        },
      ],
    },
    {
      name: 'request',
      type: 'LanguageModelRequestMetadata',
      isOptional: true,
      description: 'Request metadata.',
      properties: [
        {
          type: 'LanguageModelRequestMetadata',
          parameters: [
            {
              name: 'body',
              type: 'string',
              description:
                'Raw request HTTP body that was sent to the provider API as a string (JSON should be stringified).',
            },
          ],
        },
      ],
    },
    {
      name: 'response',
      type: 'LanguageModelResponseMetadata',
      isOptional: true,
      description: 'Response metadata.',
      properties: [
        {
          type: 'LanguageModelResponseMetadata',
          parameters: [
            {
              name: 'id',
              type: 'string',
              description:
                'The response identifier. The AI SDK uses the ID from the provider response when available, and generates an ID otherwise.',
            },
            {
              name: 'modelId',
              type: 'string',
              description:
                'The model that was used to generate the response. The AI SDK uses the response model from the provider response when available, and the model from the function call otherwise.',
            },
            {
              name: 'timestamp',
              type: 'Date',
              description:
                'The timestamp of the response. The AI SDK uses the response timestamp from the provider response when available, and creates a timestamp otherwise.',
            },
            {
              name: 'headers',
              isOptional: true,
              type: 'Record<string, string>',
              description: 'Optional response headers.',
            },
            {
              name: 'body',
              isOptional: true,
              type: 'unknown',
              description: 'Optional response body.',
            },
          ],
        },
      ],
    },
    {
      name: 'reasoning',
      type: 'string | undefined',
      description:
        'The reasoning that was used to generate the object. Concatenated from all reasoning parts.',
    },
    {
      name: 'warnings',
      type: 'CallWarning[] | undefined',
      description:
        'Warnings from the model provider (e.g. unsupported settings).',
    },
    {
      name: 'providerMetadata',
      type: 'ProviderMetadata | undefined',
      description:
        'Optional metadata from the provider. The outer key is the provider name. The inner values are the metadata. Details depend on the provider.',
    },
    {
      name: 'toJsonResponse',
      type: '(init?: ResponseInit) => Response',
      description:
        'Converts the object to a JSON response. The response will have a status code of 200 and a content type of `application/json; charset=utf-8`.',
    },
  ]}
/>

## More Examples

<ExampleLinks
  examples={[
    {
      title:
        'Learn to generate structured data using a language model in Next.js',
      link: '/examples/next-app/basics/generating-object',
    },
    {
      title:
        'Learn to generate structured data using a language model in Node.js',
      link: '/examples/node/generating-structured-data/generate-object',
    },
  ]}
/>

# `streamObject()`

Streams a typed, structured object for a given prompt and schema using a language model.

It can be used to force the language model to return structured data, e.g. for information extraction, synthetic data generation, or classification tasks.

#### Example: stream an object using a schema

```ts
import { streamObject } from 'ai';
__PROVIDER_IMPORT__;
import { z } from 'zod';

const { partialObjectStream } = streamObject({
  model: __MODEL__,
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});

for await (const partialObject of partialObjectStream) {
  console.clear();
  console.log(partialObject);
}
```

#### Example: stream an array using a schema

For arrays, you specify the schema of the array items.
You can use `elementStream` to get the stream of complete array elements.

```ts highlight="7,18"
import { streamObject } from 'ai';
__PROVIDER_IMPORT__;
import { z } from 'zod';

const { elementStream } = streamObject({
  model: __MODEL__,
  output: 'array',
  schema: z.object({
    name: z.string(),
    class: z
      .string()
      .describe('Character class, e.g. warrior, mage, or thief.'),
    description: z.string(),
  }),
  prompt: 'Generate 3 hero descriptions for a fantasy role playing game.',
});

for await (const hero of elementStream) {
  console.log(hero);
}
```

#### Example: generate JSON without a schema

```ts
import { streamObject } from 'ai';

const { partialObjectStream } = streamObject({
  model: __MODEL__,
  output: 'no-schema',
  prompt: 'Generate a lasagna recipe.',
});

for await (const partialObject of partialObjectStream) {
  console.clear();
  console.log(partialObject);
}
```

#### Example: generate an enum

When you want to generate a specific enum value, you can set the output strategy to `enum`
and provide the list of possible values in the `enum` parameter.

```ts highlight="5-6"
import { streamObject } from 'ai';

const { partialObjectStream } = streamObject({
  model: __MODEL__,
  output: 'enum',
  enum: ['action', 'comedy', 'drama', 'horror', 'sci-fi'],
  prompt:
    'Classify the genre of this movie plot: ' +
    '"A group of astronauts travel through a wormhole in search of a ' +
    'new habitable planet for humanity."',
});
```

To see `streamObject` in action, check out the [additional examples](#more-examples).

## Import

<Snippet text={`import { streamObject } from "ai"`} prompt={false} />

## API Signature

### Parameters

<PropertiesTable
  content={[
    {
      name: 'model',
      type: 'LanguageModel',
      description: "The language model to use. Example: openai('gpt-4.1')",
    },
    {
      name: 'output',
      type: "'object' | 'array' | 'enum' | 'no-schema' | undefined",
      description: "The type of output to generate. Defaults to 'object'.",
    },
    {
      name: 'schema',
      type: 'Zod Schema | JSON Schema',
      description:
        "The schema that describes the shape of the object to generate. \
        It is sent to the model to generate the object and used to validate the output. \
        You can either pass in a Zod schema or a JSON schema (using the `jsonSchema` function). \
        In 'array' mode, the schema is used to describe an array element. \
        Not available with 'no-schema' or 'enum' output.",
    },
    {
      name: 'schemaName',
      type: 'string | undefined',
      description:
        "Optional name of the output that should be generated. \
        Used by some providers for additional LLM guidance, e.g. via tool or schema name. \
        Not available with 'no-schema' or 'enum' output.",
    },
    {
      name: 'schemaDescription',
      type: 'string | undefined',
      description:
        "Optional description of the output that should be generated. \
        Used by some providers for additional LLM guidance, e.g. via tool or schema name. \
        Not available with 'no-schema' or 'enum' output.",
    },
    {
      name: 'system',
      type: 'string',
      description:
        'The system prompt to use that specifies the behavior of the model.',
    },
    {
      name: 'prompt',
      type: 'string | Array<SystemModelMessage | UserModelMessage | AssistantModelMessage | ToolModelMessage>',
      description: 'The input prompt to generate the text from.',
    },
    {
      name: 'messages',
      type: 'Array<SystemModelMessage | UserModelMessage | AssistantModelMessage | ToolModelMessage>',
      description:
        'A list of messages that represent a conversation. Automatically converts UI messages from the useChat hook.',
      properties: [
        {
          type: 'SystemModelMessage',
          parameters: [
            {
              name: 'role',
              type: "'system'",
              description: 'The role for the system message.',
            },
            {
              name: 'content',
              type: 'string',
              description: 'The content of the message.',
            },
          ],
        },
        {
          type: 'UserModelMessage',
          parameters: [
            {
              name: 'role',
              type: "'user'",
              description: 'The role for the user message.',
            },
            {
              name: 'content',
              type: 'string | Array<TextPart | ImagePart | FilePart>',
              description: 'The content of the message.',
              properties: [
                {
                  type: 'TextPart',
                  parameters: [
                    {
                      name: 'type',
                      type: "'text'",
                      description: 'The type of the message part.',
                    },
                    {
                      name: 'text',
                      type: 'string',
                      description: 'The text content of the message part.',
                    },
                  ],
                },
                {
                  type: 'ImagePart',
                  parameters: [
                    {
                      name: 'type',
                      type: "'image'",
                      description: 'The type of the message part.',
                    },
                    {
                      name: 'image',
                      type: 'string | Uint8Array | Buffer | ArrayBuffer | URL',
                      description:
                        'The image content of the message part. String are either base64 encoded content, base64 data URLs, or http(s) URLs.',
                    },
                    {
                      name: 'mediaType',
                      type: 'string',
                      isOptional: true,
                      description:
                        'The IANA media type of the image. Optional.',
                    },
                  ],
                },
                {
                  type: 'FilePart',
                  parameters: [
                    {
                      name: 'type',
                      type: "'file'",
                      description: 'The type of the message part.',
                    },
                    {
                      name: 'data',
                      type: 'string | Uint8Array | Buffer | ArrayBuffer | URL',
                      description:
                        'The file content of the message part. String are either base64 encoded content, base64 data URLs, or http(s) URLs.',
                    },
                    {
                      name: 'mediaType',
                      type: 'string',
                      description: 'The IANA media type of the file.',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'AssistantModelMessage',
          parameters: [
            {
              name: 'role',
              type: "'assistant'",
              description: 'The role for the assistant message.',
            },
            {
              name: 'content',
              type: 'string | Array<TextPart | FilePart | ReasoningPart | ToolCallPart>',
              description: 'The content of the message.',
              properties: [
                {
                  type: 'TextPart',
                  parameters: [
                    {
                      name: 'type',
                      type: "'text'",
                      description: 'The type of the message part.',
                    },
                    {
                      name: 'text',
                      type: 'string',
                      description: 'The text content of the message part.',
                    },
                  ],
                },
                {
                  type: 'ReasoningPart',
                  parameters: [
                    {
                      name: 'type',
                      type: "'reasoning'",
                      description: 'The type of the message part.',
                    },
                    {
                      name: 'text',
                      type: 'string',
                      description: 'The reasoning text.',
                    },
                  ],
                },
                {
                  type: 'FilePart',
                  parameters: [
                    {
                      name: 'type',
                      type: "'file'",
                      description: 'The type of the message part.',
                    },
                    {
                      name: 'data',
                      type: 'string | Uint8Array | Buffer | ArrayBuffer | URL',
                      description:
                        'The file content of the message part. String are either base64 encoded content, base64 data URLs, or http(s) URLs.',
                    },
                    {
                      name: 'mediaType',
                      type: 'string',
                      description: 'The IANA media type of the file.',
                    },
                    {
                      name: 'filename',
                      type: 'string',
                      description: 'The name of the file.',
                      isOptional: true,
                    },
                  ],
                },
                {
                  type: 'ToolCallPart',
                  parameters: [
                    {
                      name: 'type',
                      type: "'tool-call'",
                      description: 'The type of the message part.',
                    },
                    {
                      name: 'toolCallId',
                      type: 'string',
                      description: 'The id of the tool call.',
                    },
                    {
                      name: 'toolName',
                      type: 'string',
                      description:
                        'The name of the tool, which typically would be the name of the function.',
                    },
                    {
                      name: 'args',
                      type: 'object based on zod schema',
                      description:
                        'Parameters generated by the model to be used by the tool.',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'ToolModelMessage',
          parameters: [
            {
              name: 'role',
              type: "'tool'",
              description: 'The role for the assistant message.',
            },
            {
              name: 'content',
              type: 'Array<ToolResultPart>',
              description: 'The content of the message.',
              properties: [
                {
                  type: 'ToolResultPart',
                  parameters: [
                    {
                      name: 'type',
                      type: "'tool-result'",
                      description: 'The type of the message part.',
                    },
                    {
                      name: 'toolCallId',
                      type: 'string',
                      description:
                        'The id of the tool call the result corresponds to.',
                    },
                    {
                      name: 'toolName',
                      type: 'string',
                      description:
                        'The name of the tool the result corresponds to.',
                    },
                    {
                      name: 'result',
                      type: 'unknown',
                      description:
                        'The result returned by the tool after execution.',
                    },
                    {
                      name: 'isError',
                      type: 'boolean',
                      isOptional: true,
                      description:
                        'Whether the result is an error or an error message.',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'maxOutputTokens',
      type: 'number',
      isOptional: true,
      description: 'Maximum number of tokens to generate.',
    },
    {
      name: 'temperature',
      type: 'number',
      isOptional: true,
      description:
        'Temperature setting. The value is passed through to the provider. The range depends on the provider and model. It is recommended to set either `temperature` or `topP`, but not both.',
    },
    {
      name: 'topP',
      type: 'number',
      isOptional: true,
      description:
        'Nucleus sampling. The value is passed through to the provider. The range depends on the provider and model. It is recommended to set either `temperature` or `topP`, but not both.',
    },
    {
      name: 'topK',
      type: 'number',
      isOptional: true,
      description:
        'Only sample from the top K options for each subsequent token. Used to remove "long tail" low probability responses. Recommended for advanced use cases only. You usually only need to use temperature.',
    },
    {
      name: 'presencePenalty',
      type: 'number',
      isOptional: true,
      description:
        'Presence penalty setting. It affects the likelihood of the model to repeat information that is already in the prompt. The value is passed through to the provider. The range depends on the provider and model.',
    },
    {
      name: 'frequencyPenalty',
      type: 'number',
      isOptional: true,
      description:
        'Frequency penalty setting. It affects the likelihood of the model to repeatedly use the same words or phrases. The value is passed through to the provider. The range depends on the provider and model.',
    },
    {
      name: 'seed',
      type: 'number',
      isOptional: true,
      description:
        'The seed (integer) to use for random sampling. If set and supported by the model, calls will generate deterministic results.',
    },
    {
      name: 'maxRetries',
      type: 'number',
      isOptional: true,
      description:
        'Maximum number of retries. Set to 0 to disable retries. Default: 2.',
    },
    {
      name: 'abortSignal',
      type: 'AbortSignal',
      isOptional: true,
      description:
        'An optional abort signal that can be used to cancel the call.',
    },
    {
      name: 'headers',
      type: 'Record<string, string>',
      isOptional: true,
      description:
        'Additional HTTP headers to be sent with the request. Only applicable for HTTP-based providers.',
    },
    {
      name: 'experimental_repairText',
      type: '(options: RepairTextOptions) => Promise<string>',
      isOptional: true,
      description:
        'A function that attempts to repair the raw output of the model to enable JSON parsing. Should return the repaired text or null if the text cannot be repaired.',
      properties: [
        {
          type: 'RepairTextOptions',
          parameters: [
            {
              name: 'text',
              type: 'string',
              description: 'The text that was generated by the model.',
            },
            {
              name: 'error',
              type: 'JSONParseError | TypeValidationError',
              description: 'The error that occurred while parsing the text.',
            },
          ],
        },
      ],
    },
    {
      name: 'experimental_download',
      type: '(requestedDownloads: Array<{ url: URL; isUrlSupportedByModel: boolean }>) => Promise<Array<null | { data: Uint8Array; mediaType?: string }>>',
      isOptional: true,
      description:
        'Custom download function to control how URLs are fetched when they appear in prompts. By default, files are downloaded if the model does not support the URL for the given media type. Experimental feature. Return null to pass the URL directly to the model (when supported), or return downloaded content with data and media type.',
    },
    {
      name: 'experimental_telemetry',
      type: 'TelemetrySettings',
      isOptional: true,
      description: 'Telemetry configuration. Experimental feature.',
      properties: [
        {
          type: 'TelemetrySettings',
          parameters: [
            {
              name: 'isEnabled',
              type: 'boolean',
              isOptional: true,
              description:
                'Enable or disable telemetry. Disabled by default while experimental.',
            },
            {
              name: 'recordInputs',
              type: 'boolean',
              isOptional: true,
              description:
                'Enable or disable input recording. Enabled by default.',
            },
            {
              name: 'recordOutputs',
              type: 'boolean',
              isOptional: true,
              description:
                'Enable or disable output recording. Enabled by default.',
            },
            {
              name: 'functionId',
              type: 'string',
              isOptional: true,
              description:
                'Identifier for this function. Used to group telemetry data by function.',
            },
            {
              name: 'metadata',
              isOptional: true,
              type: 'Record<string, string | number | boolean | Array<null | undefined | string> | Array<null | undefined | number> | Array<null | undefined | boolean>>',
              description:
                'Additional information to include in the telemetry data.',
            },
          ],
        },
      ],
    },
    {
      name: 'providerOptions',
      type: 'Record<string,Record<string,JSONValue>> | undefined',
      isOptional: true,
      description:
        'Provider-specific options. The outer key is the provider name. The inner values are the metadata. Details depend on the provider.',
    },
    {
      name: 'onError',
      type: '(event: OnErrorResult) => Promise<void> |void',
      isOptional: true,
      description:
        'Callback that is called when an error occurs during streaming. You can use it to log errors.',
      properties: [
        {
          type: 'OnErrorResult',
          parameters: [
            {
              name: 'error',
              type: 'unknown',
              description: 'The error that occurred.',
            },
          ],
        },
      ],
    },
    {
      name: 'onFinish',
      type: '(result: OnFinishResult) => void',
      isOptional: true,
      description:
        'Callback that is called when the LLM response has finished.',
      properties: [
        {
          type: 'OnFinishResult',
          parameters: [
            {
              name: 'usage',
              type: 'LanguageModelUsage',
              description: 'The token usage of the generated text.',
              properties: [
                {
                  type: 'LanguageModelUsage',
                  parameters: [
                    {
                      name: 'inputTokens',
                      type: 'number | undefined',
                      description: 'The number of input (prompt) tokens used.',
                    },
                    {
                      name: 'outputTokens',
                      type: 'number | undefined',
                      description:
                        'The number of output (completion) tokens used.',
                    },
                    {
                      name: 'totalTokens',
                      type: 'number | undefined',
                      description:
                        'The total number of tokens as reported by the provider. This number might be different from the sum of inputTokens and outputTokens and e.g. include reasoning tokens or other overhead.',
                    },
                    {
                      name: 'reasoningTokens',
                      type: 'number | undefined',
                      isOptional: true,
                      description: 'The number of reasoning tokens used.',
                    },
                    {
                      name: 'cachedInputTokens',
                      type: 'number | undefined',
                      isOptional: true,
                      description: 'The number of cached input tokens.',
                    },
                  ],
                },
              ],
            },
            {
              name: 'providerMetadata',
              type: 'ProviderMetadata | undefined',
              description:
                'Optional metadata from the provider. The outer key is the provider name. The inner values are the metadata. Details depend on the provider.',
            },
            {
              name: 'object',
              type: 'T | undefined',
              description:
                'The generated object (typed according to the schema). Can be undefined if the final object does not match the schema.',
            },
            {
              name: 'error',
              type: 'unknown | undefined',
              description:
                'Optional error object. This is e.g. a TypeValidationError when the final object does not match the schema.',
            },
            {
              name: 'warnings',
              type: 'CallWarning[] | undefined',
              description:
                'Warnings from the model provider (e.g. unsupported settings).',
            },
            {
              name: 'response',
              type: 'Response',
              isOptional: true,
              description: 'Response metadata.',
              properties: [
                {
                  type: 'Response',
                  parameters: [
                    {
                      name: 'id',
                      type: 'string',
                      description:
                        'The response identifier. The AI SDK uses the ID from the provider response when available, and generates an ID otherwise.',
                    },
                    {
                      name: 'model',
                      type: 'string',
                      description:
                        'The model that was used to generate the response. The AI SDK uses the response model from the provider response when available, and the model from the function call otherwise.',
                    },
                    {
                      name: 'timestamp',
                      type: 'Date',
                      description:
                        'The timestamp of the response. The AI SDK uses the response timestamp from the provider response when available, and creates a timestamp otherwise.',
                    },
                    {
                      name: 'headers',
                      isOptional: true,
                      type: 'Record<string, string>',
                      description: 'Optional response headers.',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ]}
/>

### Returns

<PropertiesTable
  content={[
    {
      name: 'usage',
      type: 'Promise<LanguageModelUsage>',
      description:
        'The token usage of the generated text. Resolved when the response is finished.',
      properties: [
        {
          type: 'LanguageModelUsage',
          parameters: [
            {
              name: 'inputTokens',
              type: 'number | undefined',
              description: 'The number of input (prompt) tokens used.',
            },
            {
              name: 'outputTokens',
              type: 'number | undefined',
              description: 'The number of output (completion) tokens used.',
            },
            {
              name: 'totalTokens',
              type: 'number | undefined',
              description:
                'The total number of tokens as reported by the provider. This number might be different from the sum of inputTokens and outputTokens and e.g. include reasoning tokens or other overhead.',
            },
            {
              name: 'reasoningTokens',
              type: 'number | undefined',
              isOptional: true,
              description: 'The number of reasoning tokens used.',
            },
            {
              name: 'cachedInputTokens',
              type: 'number | undefined',
              isOptional: true,
              description: 'The number of cached input tokens.',
            },
          ],
        },
      ],
    },
    {
      name: 'providerMetadata',
      type: 'Promise<Record<string,Record<string,JSONValue>> | undefined>',
      description:
        'Optional metadata from the provider. Resolved whe the response is finished. The outer key is the provider name. The inner values are the metadata. Details depend on the provider.',
    },
    {
      name: 'object',
      type: 'Promise<T>',
      description:
        'The generated object (typed according to the schema). Resolved when the response is finished.',
    },
    {
      name: 'partialObjectStream',
      type: 'AsyncIterableStream<DeepPartial<T>>',
      description:
        'Stream of partial objects. It gets more complete as the stream progresses. Note that the partial object is not validated. If you want to be certain that the actual content matches your schema, you need to implement your own validation for partial results.',
    },
    {
      name: 'elementStream',
      type: 'AsyncIterableStream<ELEMENT>',
      description: 'Stream of array elements. Only available in "array" mode.',
    },
    {
      name: 'textStream',
      type: 'AsyncIterableStream<string>',
      description:
        'Text stream of the JSON representation of the generated object. It contains text chunks. When the stream is finished, the object is valid JSON that can be parsed.',
    },
    {
      name: 'fullStream',
      type: 'AsyncIterableStream<ObjectStreamPart<T>>',
      description:
        'Stream of different types of events, including partial objects, errors, and finish events. Only errors that stop the stream, such as network errors, are thrown.',
      properties: [
        {
          type: 'ObjectPart',
          parameters: [
            {
              name: 'type',
              type: "'object'",
            },
            {
              name: 'object',
              type: 'DeepPartial<T>',
              description: 'The partial object that was generated.',
            },
          ],
        },
        {
          type: 'TextDeltaPart',
          parameters: [
            {
              name: 'type',
              type: "'text-delta'",
            },
            {
              name: 'textDelta',
              type: 'string',
              description: 'The text delta for the underlying raw JSON text.',
            },
          ],
        },
        {
          type: 'ErrorPart',
          parameters: [
            {
              name: 'type',
              type: "'error'",
            },
            {
              name: 'error',
              type: 'unknown',
              description: 'The error that occurred.',
            },
          ],
        },
        {
          type: 'FinishPart',
          parameters: [
            {
              name: 'type',
              type: "'finish'",
            },
            {
              name: 'finishReason',
              type: 'FinishReason',
            },
            {
              name: 'logprobs',
              type: 'Logprobs',
              isOptional: true,
            },
            {
              name: 'usage',
              type: 'Usage',
              description: 'Token usage.',
            },
            {
              name: 'response',
              type: 'Response',
              isOptional: true,
              description: 'Response metadata.',
              properties: [
                {
                  type: 'Response',
                  parameters: [
                    {
                      name: 'id',
                      type: 'string',
                      description:
                        'The response identifier. The AI SDK uses the ID from the provider response when available, and generates an ID otherwise.',
                    },
                    {
                      name: 'model',
                      type: 'string',
                      description:
                        'The model that was used to generate the response. The AI SDK uses the response model from the provider response when available, and the model from the function call otherwise.',
                    },
                    {
                      name: 'timestamp',
                      type: 'Date',
                      description:
                        'The timestamp of the response. The AI SDK uses the response timestamp from the provider response when available, and creates a timestamp otherwise.',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'request',
      type: 'Promise<LanguageModelRequestMetadata>',
      description: 'Request metadata.',
      properties: [
        {
          type: 'LanguageModelRequestMetadata',
          parameters: [
            {
              name: 'body',
              type: 'string',
              description:
                'Raw request HTTP body that was sent to the provider API as a string (JSON should be stringified).',
            },
          ],
        },
      ],
    },
    {
      name: 'response',
      type: 'Promise<LanguageModelResponseMetadata>',
      description: 'Response metadata. Resolved when the response is finished.',
      properties: [
        {
          type: 'LanguageModelResponseMetadata',
          parameters: [
            {
              name: 'id',
              type: 'string',
              description:
                'The response identifier. The AI SDK uses the ID from the provider response when available, and generates an ID otherwise.',
            },
            {
              name: 'model',
              type: 'string',
              description:
                'The model that was used to generate the response. The AI SDK uses the response model from the provider response when available, and the model from the function call otherwise.',
            },
            {
              name: 'timestamp',
              type: 'Date',
              description:
                'The timestamp of the response. The AI SDK uses the response timestamp from the provider response when available, and creates a timestamp otherwise.',
            },
            {
              name: 'headers',
              isOptional: true,
              type: 'Record<string, string>',
              description: 'Optional response headers.',
            },
          ],
        },
      ],
    },
    {
      name: 'warnings',
      type: 'CallWarning[] | undefined',
      description:
        'Warnings from the model provider (e.g. unsupported settings).',
    },
    {
      name: 'pipeTextStreamToResponse',
      type: '(response: ServerResponse, init?: ResponseInit => void',
      description:
        'Writes text delta output to a Node.js response-like object. It sets a `Content-Type` header to `text/plain; charset=utf-8` and writes each text delta as a separate chunk.',
      properties: [
        {
          type: 'ResponseInit',
          parameters: [
            {
              name: 'status',
              type: 'number',
              isOptional: true,
              description: 'The response status code.',
            },
            {
              name: 'statusText',
              type: 'string',
              isOptional: true,
              description: 'The response status text.',
            },
            {
              name: 'headers',
              type: 'Record<string, string>',
              isOptional: true,
              description: 'The response headers.',
            },
          ],
        },
      ],
    },
    {
      name: 'toTextStreamResponse',
      type: '(init?: ResponseInit) => Response',
      description:
        'Creates a simple text stream response. Each text delta is encoded as UTF-8 and sent as a separate chunk. Non-text-delta events are ignored.',
      properties: [
        {
          type: 'ResponseInit',
          parameters: [
            {
              name: 'status',
              type: 'number',
              isOptional: true,
              description: 'The response status code.',
            },
            {
              name: 'statusText',
              type: 'string',
              isOptional: true,
              description: 'The response status text.',
            },
            {
              name: 'headers',
              type: 'Record<string, string>',
              isOptional: true,
              description: 'The response headers.',
            },
          ],
        },
      ],
    },
  ]}
/>

## More Examples

<ExampleLinks
  examples={[
    {
      title: 'Streaming Object Generation with RSC',
      link: '/examples/next-app/basics/streaming-object-generation',
    },
    {
      title: 'Streaming Object Generation with useObject',
      link: '/examples/next-pages/basics/streaming-object-generation',
    },
    {
      title: 'Streaming Partial Objects',
      link: '/examples/node/streaming-structured-data/stream-object',
    },
    {
      title: 'Recording Token Usage',
      link: '/examples/node/streaming-structured-data/token-usage',
    },
    {
      title: 'Recording Final Object',
      link: '/examples/node/streaming-structured-data/object',
    },
  ]}
/>
