API Reference-
Liveblocks REST API
Liveblocks REST API allows developers to interact programmatically with their Liveblocks account and services using HTTP requests. With the API, developers can retrieve, set, and update room-related data, users, permissions, schemas, and more. The Liveblocks API is organized around REST.

The API has predictable resource-oriented URLs, accepts form-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.

To use the API endpoints, you need to add your secret key to the request’s authorization header. Except for the public authorization endpoint.

Sign in to get your own API keys.
curl https://api.liveblocks.io/v2/* \
  -H 'Authorization: Bearer sk_prod_xxxxxxxxxxxxxxxxxxxxxxxx'
Authentication
post
/authorize-user
Get access token with secret key
This endpoint lets your application server (your back end) obtain a token that one of its clients (your frontend) can use to enter a Liveblocks room. You use this endpoint to implement your own application’s custom authentication endpoint. When making this request, you’ll have to use your secret key.

Important: The difference with an ID token is that an access token holds all the permissions, and is the source of truth. With ID tokens, permissions are set in the Liveblocks back end (through REST API calls) and "checked at the door" every time they are used to enter a room.

Note: When using the @liveblocks/node package, you can use Liveblocks.prepareSession in your back end to build this request.

You can pass the property userId in the request’s body. This can be whatever internal identifier you use for your user accounts as long as it uniquely identifies an account. The property userId is used by Liveblocks to calculate your account’s Monthly Active Users. One unique userId corresponds to one MAU.

Additionally, you can set custom metadata to the token, which will be publicly accessible by other clients through the user.info property. This is useful for storing static data like avatar images or the user’s display name.

Lastly, you’ll specify the exact permissions to give to the user using the permissions field. This is done in an object where the keys are room names, or room name patterns (ending in a *), and a list of permissions to assign the user for any room that matches that name exactly (or starts with the pattern’s prefix). For tips, see Manage permissions with access tokens.

Request body
https://api.liveblocks.io/v2/authorize-user
Example
Schema
{
  "userId": "user-123",
  "userInfo": {
    "name": "bob",
    "avatar": "https://example.org/images/user123.jpg"
  },
  "tenantId": "acme-corp",
  "permissions": {
    "my-room-1": [
      "room:write"
    ],
    "my-room-2": [
      "room:write"
    ],
    "my-room-*": [
      "room:read"
    ]
  }
}
Response
Status:
Success. Returns an access token that can be used to enter one or more rooms.

Example
Schema
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIi..."
}
post
/identify-user
Get ID token with secret key
This endpoint lets your application server (your back end) obtain a token that one of its clients (your frontend) can use to enter a Liveblocks room. You use this endpoint to implement your own application’s custom authentication endpoint. When using this endpoint to obtain ID tokens, you should manage your permissions by assigning user and/or group permissions to rooms explicitly, see our Manage permissions with ID tokens section.

Important: The difference with an access token is that an ID token doesn’t hold any permissions itself. With ID tokens, permissions are set in the Liveblocks back end (through REST API calls) and "checked at the door" every time they are used to enter a room. With access tokens, all permissions are set in the token itself, and thus controlled from your back end entirely.

Note: When using the @liveblocks/node package, you can use Liveblocks.identifyUser in your back end to build this request.

You can pass the property userId in the request’s body. This can be whatever internal identifier you use for your user accounts as long as it uniquely identifies an account. The property userId is used by Liveblocks to calculate your account’s Monthly Active Users. One unique userId corresponds to one MAU.

If you want to use group permissions, you can also declare which groupIds this user belongs to. The group ID values are yours, but they will have to match the group IDs you assign permissions to when assigning permissions to rooms, see Manage permissions with ID tokens).

Additionally, you can set custom metadata to the token, which will be publicly accessible by other clients through the user.info property. This is useful for storing static data like avatar images or the user’s display name.

Request body
https://api.liveblocks.io/v2/identify-user
Example
Schema
{
  "userId": "user-123",
  "tenantId": "acme-corp",
  "groupIds": [
    "marketing",
    "engineering"
  ],
  "userInfo": {
    "name": "bob",
    "avatar": "https://example.org/images/user123.jpg"
  }
}
Response
Status:
Success. Returns an ID token that can be used to enter one or more rooms.

Example
Schema
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIi..."
}
Room
get
/rooms
Get rooms
This endpoint returns a list of your rooms. The rooms are returned sorted by creation date, from newest to oldest. You can filter rooms by room ID prefixes, metadata, users accesses, and groups accesses. Corresponds to liveblocks.getRooms.

There is a pagination system where the cursor to the next page is returned in the response as nextCursor, which can be combined with startingAfter. You can also limit the number of rooms by query.

Filtering by metadata works by giving key values like metadata.color=red. Of course you can combine multiple metadata clauses to refine the response like metadata.color=red&metadata.type=text. Notice here the operator AND is applied between each clauses.

Filtering by groups or userId works by giving a list of groups like groupIds=marketing,GZo7tQ,product or/and a userId like userId=user1. Notice here the operator OR is applied between each groupIds and the userId.

Parameters
limit optional
A limit on the number of rooms to be returned. The limit can range between 1 and 100, and defaults to 20.

Minimum: 1
Maximum: 100
Default: 20
startingAfter optional
A cursor used for pagination. Get the value from the nextCursor response of the previous page.

tenantId optional
A filter on tenant ID.

query optional
Query to filter rooms. You can filter by roomId and metadata, for example, metadata["roomType"]:"whiteboard" AND roomId^"liveblocks:engineering". Learn more about filtering rooms with query language.

userId optional
A filter on users accesses.

groupIds optional
A filter on groups accesses. Multiple groups can be used.

Request
https://api.liveblocks.io/v2/rooms
Response
Status:
Success. Returns the list of rooms, the next page cursor, and the next page URL.

Example
Schema
{
  "nextCursor": "W1siaWQiLCJVRzhWYl82SHRUS0NzXzFvci1HZHQiXSxbImNyZWF0ZWRBdCIsMTY2MDAwMDk4ODEzN11d",
  "data": [
    {
      "type": "room",
      "id": "HTOGSiXcORTECjfNBBLii",
      "lastConnectionAt": "2022-08-08T23:23:15.281Z",
      "createdAt": "2022-08-08T23:23:15.281Z",
      "metadata": {
        "name": [
          "My room"
        ],
        "type": [
          "whiteboard"
        ]
      },
      "defaultAccesses": [
        "room:write"
      ],
      "groupsAccesses": {
        "product": [
          "room:write"
        ]
      },
      "usersAccesses": {
        "vinod": [
          "room:write"
        ]
      }
    }
  ]
}
post
/rooms
Create room
This endpoint creates a new room. id and defaultAccesses are required. When provided with a ?idempotent query argument, will not return a 409 when the room already exists, but instead return the existing room as-is. Corresponds to liveblocks.createRoom, or to liveblocks.getOrCreateRoom when ?idempotent is provided.

defaultAccessess could be [] or ["room:write"] (private or public).
metadata could be key/value as string or string[]. metadata supports maximum 50 entries. Key length has a limit of 40 characters maximum. Value length has a limit of 256 characters maximum. metadata is optional field.
usersAccesses could be [] or ["room:write"] for every records. usersAccesses can contain 100 ids maximum. Id length has a limit of 40 characters. usersAccesses is optional field.
groupsAccesses are optional fields.
Request body
https://api.liveblocks.io/v2/rooms
Example
Schema
{
  "id": "my-room-3ebc26e2bf96",
  "defaultAccesses": [
    "room:write"
  ],
  "metadata": {
    "color": "blue"
  },
  "usersAccesses": {
    "alice": [
      "room:write"
    ]
  },
  "groupsAccesses": {
    "product": [
      "room:write"
    ]
  }
}
Response
Status:
Success. Returns the created room.

Example
Schema
{
  "type": "room",
  "id": "my-room-3ebc26e2bf96",
  "lastConnectionAt": "2022-08-22T15:10:25.225Z",
  "createdAt": "2022-08-22T15:10:25.225Z",
  "metadata": {
    "color": "blue"
  },
  "defaultAccesses": [
    "room:write"
  ],
  "groupsAccesses": {
    "product": [
      "room:write"
    ]
  },
  "usersAccesses": {
    "alice": [
      "room:write"
    ]
  }
}
get
/rooms/:roomId
Get room
This endpoint returns a room by its ID. Corresponds to liveblocks.getRoom.

Parameters
roomId required
ID of the room

Request
https://api.liveblocks.io/v2/rooms/{roomId}
Response
Status:
Success. Returns the room.

Example
Schema
{
  "type": "room",
  "id": "react-todo-list",
  "lastConnectionAt": "2022-08-04T21:07:09.380Z",
  "createdAt": "2022-07-13T14:32:50.697Z",
  "metadata": {
    "color": "blue",
    "size": "10",
    "target": [
      "abc",
      "def"
    ]
  },
  "defaultAccesses": [
    "room:write"
  ],
  "groupsAccesses": {
    "marketing": [
      "room:write"
    ]
  },
  "usersAccesses": {
    "alice": [
      "room:write"
    ],
    "vinod": [
      "room:write"
    ]
  }
}
post
/rooms/:roomId
Update room
This endpoint updates specific properties of a room. Corresponds to liveblocks.updateRoom.

It’s not necessary to provide the entire room’s information. Setting a property to null means to delete this property. For example, if you want to remove access to a specific user without losing other users: { "usersAccesses": { "john": null } } defaultAccessess, metadata, usersAccesses, groupsAccesses can be updated.

defaultAccessess could be [] or ["room:write"] (private or public).
metadata could be key/value as string or string[]. metadata supports maximum 50 entries. Key length has a limit of 40 characters maximum. Value length has a limit of 256 characters maximum. metadata is optional field.
usersAccesses could be [] or ["room:write"] for every records. usersAccesses can contain 100 ids maximum. Id length has a limit of 256 characters. usersAccesses is optional field.
groupsAccesses could be [] or ["room:write"] for every records. groupsAccesses can contain 100 ids maximum. Id length has a limit of 256 characters. groupsAccesses is optional field.
Parameters
roomId required
ID of the room

Request body
https://api.liveblocks.io/v2/rooms/{roomId}
Example
Schema
{
  "defaultAccesses": [
    "room:write"
  ],
  "usersAccesses": {
    "vinod": [
      "room:write"
    ],
    "alice": [
      "room:write"
    ]
  },
  "groupsAccesses": {
    "marketing": [
      "room:write"
    ]
  },
  "metadata": {
    "color": "blue"
  }
}
Response
Status:
Success. Returns the updated room.

Example
Schema
{
  "type": "room",
  "id": "react-todo-list",
  "lastConnectionAt": "2022-08-04T21:07:09.380Z",
  "createdAt": "2022-07-13T14:32:50.697Z",
  "metadata": {
    "color": "blue",
    "size": "10",
    "target": [
      "abc",
      "def"
    ]
  },
  "defaultAccesses": [
    "room:write"
  ],
  "groupsAccesses": {
    "marketing": [
      "room:write"
    ]
  },
  "usersAccesses": {
    "alice": [
      "room:write"
    ],
    "vinod": [
      "room:write"
    ]
  }
}
delete
/rooms/:roomId
Delete room
This endpoint deletes a room. A deleted room is no longer accessible from the API or the dashboard and it cannot be restored. Corresponds to liveblocks.deleteRoom.

Parameters
roomId required
ID of the room

Request
https://api.liveblocks.io/v2/rooms/{roomId}
get
/rooms/:roomId/prewarm
Prewarm room
Speeds up connecting to a room for the next 10 seconds. Use this when you know a user will be connecting to a room with RoomProvider or enterRoom within 10 seconds, and the room will load quicker.

Parameters
roomId required
ID of the room

Request
https://api.liveblocks.io/v2/rooms/{roomId}/prewarm
post
/rooms/:roomId/upsert
Upsert (update or create) room
This endpoint updates specific properties of a room. Corresponds to liveblocks.upsertRoom.

It’s not necessary to provide the entire room’s information. Setting a property to null means to delete this property. For example, if you want to remove access to a specific user without losing other users: { "usersAccesses": { "john": null } } defaultAccessess, metadata, usersAccesses, groupsAccesses can be updated.

defaultAccessess could be [] or ["room:write"] (private or public).
metadata could be key/value as string or string[]. metadata supports maximum 50 entries. Key length has a limit of 40 characters maximum. Value length has a limit of 256 characters maximum. metadata is optional field.
usersAccesses could be [] or ["room:write"] for every records. usersAccesses can contain 100 ids maximum. Id length has a limit of 256 characters. usersAccesses is optional field.
groupsAccesses could be [] or ["room:write"] for every records. groupsAccesses can contain 100 ids maximum. Id length has a limit of 256 characters. groupsAccesses is optional field.
Parameters
roomId required
ID of the room

Request body
https://api.liveblocks.io/v2/rooms/{roomId}/upsert
Example
Schema
{
  "update": {
    "usersAccesses": {
      "vinod": [
        "room:write"
      ],
      "alice": [
        "room:write"
      ]
    },
    "groupsAccesses": {
      "marketing": [
        "room:write"
      ]
    },
    "metadata": {
      "color": "blue"
    }
  },
  "create": {
    "defaultAccesses": [
      "room:write"
    ]
  }
}
Response
Status:
Success. Returns the updated or created room.

Example
Schema
{
  "type": "room",
  "id": "react-todo-list",
  "lastConnectionAt": "2022-08-04T21:07:09.380Z",
  "createdAt": "2022-07-13T14:32:50.697Z",
  "metadata": {
    "color": "blue",
    "size": "10",
    "target": [
      "abc",
      "def"
    ]
  },
  "defaultAccesses": [
    "room:write"
  ],
  "groupsAccesses": {
    "marketing": [
      "room:write"
    ]
  },
  "usersAccesses": {
    "alice": [
      "room:write"
    ],
    "vinod": [
      "room:write"
    ]
  }
}
post
/rooms/:roomId/update-room-id
Update room ID
This endpoint permanently updates the room’s ID.

Parameters
roomId required
The new ID for the room

Request body
https://api.liveblocks.io/v2/rooms/{roomId}/update-room-id
Example
{
  "newRoomId": "new-room-id"
}
Response
Status:
Success. Returns the updated room with the new ID.

Example
Schema
{
  "type": "room",
  "id": "react-todo-list",
  "lastConnectionAt": "2022-08-04T21:07:09.380Z",
  "createdAt": "2022-07-13T14:32:50.697Z",
  "metadata": {
    "color": "blue",
    "size": "10",
    "target": [
      "abc",
      "def"
    ]
  },
  "defaultAccesses": [
    "room:write"
  ],
  "groupsAccesses": {
    "marketing": [
      "room:write"
    ]
  },
  "usersAccesses": {
    "alice": [
      "room:write"
    ],
    "vinod": [
      "room:write"
    ]
  }
}
get
/rooms/:roomId/active_users
Get active users
This endpoint returns a list of users currently present in the requested room. Corresponds to liveblocks.getActiveUsers.

For optimal performance, we recommend calling this endpoint no more than once every 10 seconds. Duplicates can occur if a user is in the requested room with multiple browser tabs opened.

Parameters
roomId required
ID of the room

Request
https://api.liveblocks.io/v2/rooms/{roomId}/active_users
Response
Status:
Success. Returns the list of active users for the specified room.

Example
Schema
{
  "data": [
    {
      "type": "user",
      "connectionId": 16,
      "id": "alice",
      "info": {}
    },
    {
      "type": "user",
      "connectionId": 20,
      "id": "bob",
      "info": {}
    }
  ]
}
post
/rooms/:roomId/broadcast_event
Broadcast event to a room
This endpoint enables the broadcast of an event to a room without having to connect to it via the client from @liveblocks/client. It takes any valid JSON as a request body. The connectionId passed to event listeners is -1 when using this API. Corresponds to liveblocks.broadcastEvent.

Parameters
roomId required
ID of the room

Request body
https://api.liveblocks.io/v2/rooms/{roomId}/broadcast_event
Example
{
  "type": "EMOJI",
  "emoji": "🔥"
}
Storage
get
/rooms/:roomId/storage
Get Storage document
Returns the contents of the room’s Storage tree. Corresponds to liveblocks.getStorageDocument.

The default outputted format is called “plain LSON”, which includes information on the Live data structures in the tree. These nodes show up in the output as objects with two properties, for example:

{
  "liveblocksType": "LiveObject",
  "data": ...
}
If you’re not interested in this information, you can use the simpler ?format=json query param, see below.

Parameters
roomId required
ID of the room

format optional
Use ?format=json to output a simplified JSON representation of the Storage tree. In that format, each LiveObject and LiveMap will be formatted as a simple JSON object, and each LiveList will be formatted as a simple JSON array. This is a lossy format because information about the original data structures is not retained, but it may be easier to work with.

Request
https://api.liveblocks.io/v2/rooms/{roomId}/storage
Response
Status:
Success. Returns the room’s Storage as JSON.

Example
Schema
{
  "liveblocksType": "LiveObject",
  "data": {
    "aLiveObject": {
      "liveblocksType": "LiveObject",
      "data": {
        "a": 1
      }
    },
    "aLiveList": {
      "liveblocksType": "LiveList",
      "data": [
        "a",
        "b"
      ]
    },
    "aLiveMap": {
      "liveblocksType": "LiveMap",
      "data": {
        "a": 1,
        "b": 2
      }
    }
  }
}
post
/rooms/:roomId/storage
Initialize Storage document
This endpoint initializes or reinitializes a room’s Storage. The room must already exist. Calling this endpoint will disconnect all users from the room if there are any, triggering a reconnect. Corresponds to liveblocks.initializeStorageDocument.

The format of the request body is the same as what’s returned by the get Storage endpoint.

For each Liveblocks data structure that you want to create, you need a JSON element having two properties:

"liveblocksType" => "LiveObject" | "LiveList" | "LiveMap"
"data" => contains the nested data structures (children) and data.
The root’s type can only be LiveObject.

A utility function, toPlainLson is included in @liveblocks/client from 1.0.9 to help convert LiveObject, LiveList, and LiveMap to the structure expected by the endpoint.

Parameters
roomId required
ID of the room

Request body
https://api.liveblocks.io/v2/rooms/{roomId}/storage
Example
Schema
{
  "liveblocksType": "LiveObject",
  "data": {
    "aLiveObject": {
      "liveblocksType": "LiveObject",
      "data": {
        "a": 1
      }
    },
    "aLiveList": {
      "liveblocksType": "LiveList",
      "data": [
        "a",
        "b"
      ]
    },
    "aLiveMap": {
      "liveblocksType": "LiveMap",
      "data": {
        "a": 1,
        "b": 2
      }
    }
  }
}
Response
Status:
Success. The Storage is initialized. Returns the room’s Storage as JSON.

Example
Schema
{
  "liveblocksType": "LiveObject",
  "data": {
    "aLiveObject": {
      "liveblocksType": "LiveObject",
      "data": {
        "a": 1
      }
    },
    "aLiveList": {
      "liveblocksType": "LiveList",
      "data": [
        "a",
        "b"
      ]
    },
    "aLiveMap": {
      "liveblocksType": "LiveMap",
      "data": {
        "a": 1,
        "b": 2
      }
    }
  }
}
delete
/rooms/:roomId/storage
Delete Storage document
This endpoint deletes all of the room’s Storage data. Calling this endpoint will disconnect all users from the room if there are any. Corresponds to liveblocks.deleteStorageDocument.

Parameters
roomId required
ID of the room

Request
https://api.liveblocks.io/v2/rooms/{roomId}/storage
Yjs
get
/rooms/:roomId/ydoc
Get Yjs document
This endpoint returns a JSON representation of the room’s Yjs document. Corresponds to liveblocks.getYjsDocument.

Parameters
roomId required
ID of the room

formatting optional
If present, YText will return formatting.

key optional
Returns only a single key’s value, e.g. doc.get(key).toJSON().

type optional
Used with key to override the inferred type, i.e. "ymap" will return doc.get(key, Y.Map).

Request
https://api.liveblocks.io/v2/rooms/{roomId}/ydoc
Response
Status:
Success. Returns the room’s Yjs document as JSON.

Example
Schema
{
  "someYText": "Contents of YText"
}
put
/rooms/:roomId/ydoc
Send a binary Yjs update
This endpoint is used to send a Yjs binary update to the room’s Yjs document. You can use this endpoint to initialize Yjs data for the room or to update the room’s Yjs document. To send an update to a subdocument instead of the main document, pass its guid. Corresponds to liveblocks.sendYjsBinaryUpdate.

The update is typically obtained by calling Y.encodeStateAsUpdate(doc). See the Yjs documentation for more details. When manually making this HTTP call, set the HTTP header Content-Type to application/octet-stream, and send the binary update (a Uint8Array) in the body of the HTTP request. This endpoint does not accept JSON, unlike most other endpoints.

Parameters
roomId required
ID of the room

guid optional
ID of the subdocument

Request body
https://api.liveblocks.io/v2/rooms/{roomId}/ydoc
Response
Status:
Success. The given room’s Yjs doc has been updated.

Schema
{
  "status": 200
}
get
/rooms/:roomId/ydoc-binary
Get Yjs document encoded as a binary Yjs update
This endpoint returns the room's Yjs document encoded as a single binary update. This can be used by Y.applyUpdate(responseBody) to get a copy of the document in your back end. See Yjs documentation for more information on working with updates. To return a subdocument instead of the main document, pass its guid. Corresponds to liveblocks.getYjsDocumentAsBinaryUpdate.

Parameters
roomId required
ID of the room

guid optional
ID of the subdocument

Request
https://api.liveblocks.io/v2/rooms/{roomId}/ydoc-binary
get
/rooms/:roomId/versions
Get Yjs version history
This endpoint returns a list of version history snapshots for the room's Yjs document. The versions are returned sorted by creation date, from newest to oldest.

Parameters
roomId required
ID of the room

limit optional
A limit on the number of versions to be returned. The limit can range between 1 and 100, and defaults to 20.

Minimum: 1
Maximum: 100
Default: 20
cursor optional
A cursor used for pagination. Get the value from the nextCursor response of the previous page.

Request
https://api.liveblocks.io/v2/rooms/{roomId}/versions
Response
Status:
Success. Returns the list of version history snapshots and the next page cursor.

Example
Schema
{
  "data": [
    {
      "type": "historyVersion",
      "id": "vh_abc123",
      "createdAt": "2024-10-15T10:30:00.000Z",
      "authors": [
        {
          "id": "user-123"
        },
        {
          "id": "user-456"
        }
      ],
      "kind": "yjs"
    }
  ],
  "nextCursor": "eyJjcmVhdGVkQXQiOiIyMDI0LTEwLTE1VDEwOjMwOjAwLjAwMFoifQ=="
}
get
/rooms/:roomId/version/:versionId
Get Yjs document version
This endpoint returns a specific version of the room's Yjs document encoded as a binary Yjs update.

Parameters
roomId required
ID of the room

versionId required
ID of the version

Request
https://api.liveblocks.io/v2/rooms/{roomId}/version/{versionId}
post
/rooms/:roomId/version
Create Yjs version snapshot
This endpoint creates a new version history snapshot for the room's Yjs document.

Parameters
roomId required
ID of the room

Request
https://api.liveblocks.io/v2/rooms/{roomId}/version
Response
Status:
Success. Returns the created version ID.

Example
Schema
{
  "data": {
    "id": "vh_abc123"
  }
}
Comments
get
/rooms/:roomId/threads
Get room threads
This endpoint returns the threads in the requested room. Corresponds to liveblocks.getThreads.

Parameters
roomId required
ID of the room

query optional
Query to filter threads. You can filter by metadata and resolved, for example, metadata["status"]:"open" AND metadata["color"]:"red" AND resolved:true. Learn more about filtering threads with query language.

Request
https://api.liveblocks.io/v2/rooms/{roomId}/threads
Response
Status:
Success. Returns list of threads in a room.

Example
Schema
{
  "data": [
    {
      "type": "thread",
      "id": "thread-id",
      "roomId": "room-id",
      "comments": [
        {
          "type": "comment",
          "threadId": "thread-id",
          "roomId": "room-id",
          "id": "comment-id",
          "userId": "string",
          "createdAt": "2019-08-24T14:15:22Z",
          "editedAt": "2019-08-24T14:15:22Z",
          "deletedAt": "2019-08-24T14:15:22Z",
          "body": {}
        }
      ],
      "createdAt": "2019-08-24T14:15:22Z",
      "metadata": {},
      "updatedAt": "2019-08-24T14:15:22Z"
    }
  ]
}
post
/rooms/:roomId/threads
Create thread
This endpoint creates a new thread and the first comment in the thread. Corresponds to liveblocks.createThread.

A comment’s body is an array of paragraphs, each containing child nodes. Here’s an example of how to construct a comment’s body, which can be submitted under comment.body.

"version": 1,
"content": [
  {
    "type": "paragraph",
    "children": [{ "text": "Hello " }, { "text": "world", "bold": true }]
  }
]
Parameters
roomId required
ID of the room

Request body
https://api.liveblocks.io/v2/rooms/{roomId}/threads
Example
Schema
{
  "comment": {
    "userId": "alice",
    "createdAt": "2022-07-13T14:32:50.697Z",
    "body": {
      "version": 1,
      "content": []
    }
  },
  "metadata": {
    "color": "blue"
  }
}
Response
Status:
Success. Returns the created thread.

Example
Schema
{
  "type": "thread",
  "id": "thread-id",
  "roomId": "room-id",
  "comments": [
    {
      "type": "comment",
      "threadId": "thread-id",
      "roomId": "room-id",
      "id": "comment-id",
      "userId": "alice",
      "createdAt": "2022-07-13T14:32:50.697Z",
      "body": {
        "version": 1,
        "content": []
      }
    }
  ],
  "createdAt": "2022-07-13T14:32:50.697Z",
  "metadata": {
    "color": "blue"
  }
}
get
/rooms/:roomId/threads/:threadId
Get thread
This endpoint returns a thread by its ID. Corresponds to liveblocks.getThread.

Parameters
roomId required
ID of the room

threadId required
ID of the thread

Request
https://api.liveblocks.io/v2/rooms/{roomId}/threads/{threadId}
Response
Status:
Success. Returns requested thread.

Example
Schema
{
  "type": "thread",
  "id": "thread-id",
  "roomId": "room-id",
  "comments": [
    {
      "type": "comment",
      "threadId": "thread-id",
      "roomId": "room-id",
      "id": "comment-id",
      "userId": "string",
      "createdAt": "2019-08-24T14:15:22Z",
      "editedAt": "2019-08-24T14:15:22Z",
      "deletedAt": "2019-08-24T14:15:22Z",
      "body": {}
    }
  ],
  "createdAt": "2019-08-24T14:15:22Z",
  "metadata": {},
  "updatedAt": "2019-08-24T14:15:22Z"
}
delete
/rooms/:roomId/threads/:threadId
Delete thread
This endpoint deletes a thread by its ID. Corresponds to liveblocks.deleteThread.

Parameters
roomId required
ID of the room

threadId required
ID of the thread

Request
https://api.liveblocks.io/v2/rooms/{roomId}/threads/{threadId}
post
/rooms/:roomId/threads/:threadId/metadata
Edit thread metadata
This endpoint edits the metadata of a thread. The metadata is a JSON object that can be used to store any information you want about the thread, in string, number, or boolean form. Set a property to null to remove it. Corresponds to liveblocks.editThreadMetadata.

Parameters
roomId required
ID of the room

threadId required
ID of the thread

Request body
https://api.liveblocks.io/v2/rooms/{roomId}/threads/{threadId}/metadata
Example
Schema
{
  "metadata": {
    "color": "yellow"
  },
  "userId": "alice",
  "createdAt": "2023-07-13T14:32:50.697Z"
}
Response
Status:
Success. Returns the updated metadata.

Example
Schema
{
  "color": "yellow"
}
post
/rooms/:roomId/threads/:threadId/mark-as-resolved
Mark thread as resolved
This endpoint marks a thread as resolved.

Parameters
roomId required
ID of the room

threadId required
ID of the thread

Request
https://api.liveblocks.io/v2/rooms/{roomId}/threads/{threadId}/mark-as-resolved
Response
Status:
Success. Returns the updated thread.

Schema
{
  "type": {
    "const": "thread"
  },
  "id": {
    "type": "string"
  },
  "roomId": {
    "type": "string"
  },
  "comments": {
    "type": "array",
    "items": {
      "$ref": "#/components/schemas/Comment"
    }
  },
  "createdAt": {
    "type": "string",
    "format": "date-time"
  },
  "metadata": {
    "type": "object"
  },
  "resolved": {
    "type": "boolean"
  },
  "updatedAt": {
    "type": "string",
    "format": "date-time"
  }
}
post
/rooms/:roomId/threads/:threadId/mark-as-unresolved
Mark thread as unresolved
This endpoint marks a thread as unresolved.

Parameters
roomId required
ID of the room

threadId required
ID of the thread

Request
https://api.liveblocks.io/v2/rooms/{roomId}/threads/{threadId}/mark-as-unresolved
Response
Status:
Success. Returns the updated thread.

Schema
{
  "type": {
    "const": "thread"
  },
  "id": {
    "type": "string"
  },
  "roomId": {
    "type": "string"
  },
  "comments": {
    "type": "array",
    "items": {
      "$ref": "#/components/schemas/Comment"
    }
  },
  "createdAt": {
    "type": "string",
    "format": "date-time"
  },
  "metadata": {
    "type": "object"
  },
  "resolved": {
    "type": "boolean"
  },
  "updatedAt": {
    "type": "string",
    "format": "date-time"
  }
}
post
/rooms/:roomId/threads/:threadId/subscribe
Subscribe to thread
This endpoint subscribes to a thread. Corresponds to liveblocks.subscribeToThread.

Parameters
roomId required
ID of the room

threadId required
ID of the thread

Request body
https://api.liveblocks.io/v2/rooms/{roomId}/threads/{threadId}/subscribe
Schema
{
  "type": "object",
  "required": [
    "userId"
  ],
  "properties": {
    "userId": {
      "type": "string"
    }
  }
}
Response
Status:
Success. Returns the thread subscription.

Schema
{
  "kind": {
    "type": "string"
  },
  "subjectId": {
    "type": "string"
  },
  "createdAt": {
    "type": "string",
    "format": "date-time"
  }
}
post
/rooms/:roomId/threads/:threadId/unsubscribe
Unsubscribe from thread
This endpoint unsubscribes from a thread. Corresponds to liveblocks.unsubscribeFromThread.

Parameters
roomId required
ID of the room

threadId required
ID of the thread

Request body
https://api.liveblocks.io/v2/rooms/{roomId}/threads/{threadId}/unsubscribe
Schema
{
  "type": "object",
  "required": [
    "userId"
  ],
  "properties": {
    "userId": {
      "type": "string"
    }
  }
}
Response
Status:
Success.

Schema
{
  "type": "object",
  "properties": {}
}
get
/rooms/:roomId/threads/:threadId/subscriptions
Get thread subscriptions
This endpoint gets the list of subscriptions to a thread. Corresponds to liveblocks.getThreadSubscriptions.

Parameters
roomId required
ID of the room

threadId required
ID of the thread

Request
https://api.liveblocks.io/v2/rooms/{roomId}/threads/{threadId}/subscriptions
Response
Status:
Success.

Schema
{
  "type": "object",
  "properties": {
    "data": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/UserSubscription"
      }
    }
  }
}
post
/rooms/:roomId/threads/:threadId/comments
Create comment
This endpoint creates a new comment, adding it as a reply to a thread. Corresponds to liveblocks.createComment.

A comment’s body is an array of paragraphs, each containing child nodes. Here’s an example of how to construct a comment’s body, which can be submitted under body.

"version": 1,
"content": [
  {
    "type": "paragraph",
    "children": [{ "text": "Hello " }, { "text": "world", "bold": true }]
  }
]
Parameters
roomId required
ID of the room

threadId required
ID of the thread

Request body
https://api.liveblocks.io/v2/rooms/{roomId}/threads/{threadId}/comments
Example
Schema
{
  "userId": "alice",
  "createdAt": "2022-07-13T14:32:50.697Z",
  "body": {
    "version": 1,
    "content": []
  }
}
Response
Status:
Success. Returns the created comment.

Example
Schema
{
  "type": "comment",
  "threadId": "thread-id",
  "roomId": "room-id",
  "id": "comment-id",
  "userId": "alice",
  "createdAt": "2022-07-13T14:32:50.697Z",
  "body": {
    "version": 1,
    "content": []
  }
}
get
/rooms/:roomId/threads/:threadId/comments/:commentId
Get comment
This endpoint returns a comment by its ID. Corresponds to liveblocks.getComment.

Parameters
roomId required
ID of the room

threadId required
ID of the thread

commentId required
ID of the comment

Request
https://api.liveblocks.io/v2/rooms/{roomId}/threads/{threadId}/comments/{commentId}
Response
Status:
Success. Returns the requested comment.

Example
Schema
{
  "type": "comment",
  "threadId": "thread-id",
  "roomId": "room-id",
  "id": "comment-id",
  "userId": "alice",
  "createdAt": "2019-08-24T14:15:22Z",
  "editedAt": "2019-08-24T14:15:22Z",
  "deletedAt": "2019-08-24T14:15:22Z",
  "body": {}
}
post
/rooms/:roomId/threads/:threadId/comments/:commentId
Edit comment
This endpoint edits the specified comment. Corresponds to liveblocks.editComment.

A comment’s body is an array of paragraphs, each containing child nodes. Here’s an example of how to construct a comment’s body, which can be submitted under body.

"version": 1,
"content": [
  {
    "type": "paragraph",
    "children": [{ "text": "Hello " }, { "text": "world", "bold": true }]
  }
]
Parameters
roomId required
ID of the room

threadId required
ID of the thread

commentId required
ID of the comment

Request body
https://api.liveblocks.io/v2/rooms/{roomId}/threads/{threadId}/comments/{commentId}
Example
Schema
{
  "editedAt": "2023-07-13T14:32:50.697Z",
  "body": {
    "version": 1,
    "content": []
  }
}
Response
Status:
Success. Returns the edited comment.

Example
Schema
{
  "type": "comment",
  "threadId": "thread-id",
  "roomId": "room-id",
  "id": "comment-id",
  "userId": "alice",
  "createdAt": "2023-07-13T14:32:50.697Z",
  "body": {
    "version": 1,
    "content": []
  }
}
delete
/rooms/:roomId/threads/:threadId/comments/:commentId
Delete comment
This endpoint deletes a comment. A deleted comment is no longer accessible from the API or the dashboard and it cannot be restored. Corresponds to liveblocks.deleteComment.

Parameters
roomId required
ID of the room

threadId required
ID of the thread

commentId required
ID of the comment

Request
https://api.liveblocks.io/v2/rooms/{roomId}/threads/{threadId}/comments/{commentId}
post
/rooms/:roomId/threads/:threadId/comments/:commentId/add-reaction
Add comment reaction
This endpoint adds a reaction to a comment. Corresponds to liveblocks.addCommentReaction.

Parameters
roomId required
ID of the room

threadId required
ID of the thread

commentId required
ID of the comment

Request body
https://api.liveblocks.io/v2/rooms/{roomId}/threads/{threadId}/comments/{commentId}/add-reaction
Example
Schema
{
  "emoji": "👨‍👩‍👧",
  "createdAt": "2022-07-13T14:32:50.697Z",
  "userId": "alice"
}
Response
Status:
Success. Returns the created reaction.

Example
Schema
{
  "emoji": "👨‍👩‍👧",
  "createdAt": "2022-07-13T14:32:50.697Z",
  "userId": "alice"
}
post
/rooms/:roomId/threads/:threadId/comments/:commentId/remove-reaction
Remove comment reaction
This endpoint removes a comment reaction. A deleted comment reaction is no longer accessible from the API or the dashboard and it cannot be restored. Corresponds to liveblocks.removeCommentReaction.

Parameters
roomId required
ID of the room

threadId required
ID of the thread

commentId required
ID of the comment

Request body
https://api.liveblocks.io/v2/rooms/{roomId}/threads/{threadId}/comments/{commentId}/remove-reaction
Example
Schema
{
  "emoji": "👨‍👩‍👧",
  "userId": "alice",
  "removedAt": "2022-07-13T14:32:50.697Z"
}
Notifications
get
/users/:userId/inbox-notifications/:inboxNotificationId
Get inbox notification
This endpoint returns a user’s inbox notification by its ID. Corresponds to liveblocks.getInboxNotification.

Parameters
userId required
ID of the user

inboxNotificationId required
ID of the inbox notification

Request
https://api.liveblocks.io/v2/users/{userId}/inbox-notifications/{inboxNotificationId}
Response
Status:
Schemas
{
  "id": {
    "type": "string"
  },
  "kind": {
    "type": "string"
  },
  "threadId": {
    "type": "string"
  },
  "roomId": {
    "type": "string"
  },
  "readAt": {
    "type": "string",
    "format": "date-time"
  },
  "notifiedAt": {
    "type": "string",
    "format": "date-time"
  }
}
{
  "id": {
    "type": "string"
  },
  "kind": {
    "type": "string"
  },
  "subjectId": {
    "type": "string"
  },
  "roomId": {
    "type": "string"
  },
  "readAt": {
    "type": "string",
    "format": "date-time"
  },
  "notifiedAt": {
    "type": "string",
    "format": "date-time"
  },
  "activityData": {
    "type": "object"
  }
}
delete
/users/:userId/inbox-notifications/:inboxNotificationId
Delete inbox notification
This endpoint deletes a user’s inbox notification by its ID.

Parameters
userId required
ID of the user

inboxNotificationId required
ID of the inbox notification

Request
https://api.liveblocks.io/v2/users/{userId}/inbox-notifications/{inboxNotificationId}
delete
/users/:userId/inbox-notifications
Delete all inbox notifications
This endpoint deletes all the user’s inbox notifications.

Parameters
userId required
ID of the user

Request
https://api.liveblocks.io/v2/users/{userId}/inbox-notifications
get
/users/:userId/inbox-notifications
Get all inbox notifications
This endpoint returns all the user’s inbox notifications. Corresponds to liveblocks.getInboxNotifications.

Parameters
userId required
ID of the user

tenantId optional
The tenant ID to filter notifications for.

query optional
Query to filter notifications. You can filter by unread, for example, unread:true.

limit optional
A limit on the number of inbox notifications to be returned. The limit can range between 1 and 50, and defaults to 50.

Minimum: 1
Maximum: 50
Default: 50
startingAfter optional
A cursor used for pagination. Get the value from the nextCursor response of the previous page.

Request
https://api.liveblocks.io/v2/users/{userId}/inbox-notifications
Response
Status:
Schema
{
  "type": "array",
  "items": {
    "oneOf": [
      {
        "$ref": "#/components/schemas/InboxNotificationThreadData"
      },
      {
        "$ref": "#/components/schemas/InboxNotificationCustomData"
      }
    ]
  }
}
get
/users/:userId/notification-settings
Get notification settings
This endpoint returns a user's notification settings for the project. Corresponds to liveblocks.getNotificationSettings.

Parameters
userId required
ID of the user

Request
https://api.liveblocks.io/v2/users/{userId}/notification-settings
Response
Status:
Example
Schema
{
  "email": {
    "thread": true,
    "textMention": false,
    "$customNotification": true
  },
  "slack": {
    "thread": true,
    "textMention": true,
    "$customNotification": false
  },
  "teams": {
    "thread": false,
    "textMention": true,
    "$customNotification": true
  },
  "webPush": {
    "thread": true,
    "textMention": true,
    "$customNotification": false
  }
}
post
/users/:userId/notification-settings
Update notification settings
This endpoint updates a user's notification settings for the project. Corresponds to liveblocks.updateNotificationSettings.

Parameters
userId required
ID of the user

Request body
https://api.liveblocks.io/v2/users/{userId}/notification-settings
Example
Schema
{
  "email": {
    "thread": true,
    "textMention": false
  },
  "slack": {
    "textMention": false
  },
  "webPush": {
    "thread": true
  }
}
Response
Status:
Example
Schema
{
  "email": {
    "thread": true,
    "textMention": false,
    "$customNotification": true
  },
  "slack": {
    "thread": true,
    "textMention": true,
    "$customNotification": false
  },
  "teams": {
    "thread": false,
    "textMention": true,
    "$customNotification": true
  },
  "webPush": {
    "thread": true,
    "textMention": true,
    "$customNotification": false
  }
}
delete
/users/:userId/notification-settings
Delete notification settings
This endpoint deletes a user's notification settings for the project. Corresponds to liveblocks.deleteNotificationSettings.

Parameters
userId required
ID of the user

Request
https://api.liveblocks.io/v2/users/{userId}/notification-settings
get
/rooms/:roomId/users/:userId/subscription-settings
Get room subscription settings
This endpoint returns a user’s subscription settings for a specific room. Corresponds to liveblocks.getRoomSubscriptionSettings.

Parameters
roomId required
ID of the room

userId required
ID of the user

Request
https://api.liveblocks.io/v2/rooms/{roomId}/users/{userId}/subscription-settings
Response
Status:
Schema
{
  "threads": {
    "enum": [
      "all",
      "replies_and_mentions",
      "none"
    ]
  },
  "textMentions": {
    "enum": [
      "mine",
      "none"
    ]
  }
}
post
/rooms/:roomId/users/:userId/subscription-settings
Update room subscription settings
This endpoint updates a user’s subscription settings for a specific room. Corresponds to liveblocks.updateRoomSubscriptionSettings.

Parameters
roomId required
ID of the room

userId required
ID of the user

Request body
https://api.liveblocks.io/v2/rooms/{roomId}/users/{userId}/subscription-settings
Schema
{
  "threads": {
    "enum": [
      "all",
      "replies_and_mentions",
      "none"
    ]
  },
  "textMentions": {
    "enum": [
      "mine",
      "none"
    ]
  }
}
Response
Status:
Schema
{
  "threads": {
    "enum": [
      "all",
      "replies_and_mentions",
      "none"
    ]
  },
  "textMentions": {
    "enum": [
      "mine",
      "none"
    ]
  }
}
delete
/rooms/:roomId/users/:userId/subscription-settings
Delete room subscription settings
This endpoint deletes a user’s subscription settings for a specific room. Corresponds to liveblocks.deleteRoomSubscriptionSettings.

Parameters
roomId required
ID of the room

userId required
ID of the user

Request
https://api.liveblocks.io/v2/rooms/{roomId}/users/{userId}/subscription-settings
get
/users/:userId/room-subscription-settings
Get user room subscription settings
This endpoint returns the list of a user's room subscription settings. Corresponds to liveblocks.getUserRoomSubscriptionSettings.

Parameters
userId required
ID of the user

startingAfter optional
A cursor used for pagination. Get the value from the nextCursor response of the previous page.

limit optional
A limit on the number of elements to be returned. The limit can range between 1 and 50, and defaults to 50.

Minimum: 1
Maximum: 50
Default: 50
Request
https://api.liveblocks.io/v2/users/{userId}/room-subscription-settings
Response
Status:
Schema
{
  "type": "object",
  "properties": {
    "data": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/UserRoomSubscriptionSettings"
      }
    },
    "meta": {
      "type": "object",
      "properties": {
        "nextCursor": {
          "type": "string"
        }
      }
    }
  }
}
post
/inbox-notifications/trigger
Trigger inbox notification
This endpoint triggers an inbox notification. Corresponds to liveblocks.triggerInboxNotification.

Request body
https://api.liveblocks.io/v2/inbox-notifications/trigger
Schema
{
  "userId": {
    "type": "string"
  },
  "kind": {
    "type": "string"
  },
  "subjectId": {
    "type": "string"
  },
  "roomId": {
    "type": "string"
  },
  "activityData": {
    "type": "object"
  }
}
Groups
post
/groups
Create group
This endpoint creates a new group. Corresponds to liveblocks.createGroup.

Request body
https://api.liveblocks.io/v2/groups
get
/groups
Get groups
This endpoint returns a list of all groups in your project. Corresponds to liveblocks.getGroups.

Parameters
limit optional
A limit on the number of groups to be returned. The limit can range between 1 and 100, and defaults to 20.

Minimum: 1
Maximum: 100
Default: 20
startingAfter optional
A cursor used for pagination. Get the value from the nextCursor response of the previous page.

Request
https://api.liveblocks.io/v2/groups
get
/groups/:groupId
Get group
This endpoint returns a specific group by ID. Corresponds to liveblocks.getGroup.

Parameters
groupId required
The ID of the group to retrieve.

Request
https://api.liveblocks.io/v2/groups/{groupId}
delete
/groups/:groupId
Delete group
This endpoint deletes a group. Corresponds to liveblocks.deleteGroup.

Parameters
groupId required
The ID of the group to delete.

Request
https://api.liveblocks.io/v2/groups/{groupId}
post
/groups/:groupId/add-members
Add group members
This endpoint adds new members to an existing group. Corresponds to liveblocks.addGroupMembers.

Parameters
groupId required
The ID of the group to add members to.

Request body
https://api.liveblocks.io/v2/groups/{groupId}/add-members
post
/groups/:groupId/remove-members
Remove group members
This endpoint removes members from an existing group. Corresponds to liveblocks.removeGroupMembers.

Parameters
groupId required
The ID of the group to remove members from.

Request body
https://api.liveblocks.io/v2/groups/{groupId}/remove-members
get
/users/:userId/groups
Get user groups
This endpoint returns all groups that a specific user is a member of. Corresponds to liveblocks.getUserGroups.

Parameters
userId required
The ID of the user to get groups for.

limit optional
A limit on the number of groups to be returned. The limit can range between 1 and 100, and defaults to 20.

Minimum: 1
Maximum: 100
Default: 20
startingAfter optional
A cursor used for pagination. Get the value from the nextCursor response of the previous page.

Request
https://api.liveblocks.io/v2/users/{userId}/groups
Users
AI
get
/ai/copilots
Get AI copilots
This endpoint returns a paginated list of AI copilots. The copilots are returned sorted by creation date, from newest to oldest. Corresponds to liveblocks.getAiCopilots.

Parameters
limit optional
A limit on the number of copilots to be returned. The limit can range between 1 and 100, and defaults to 20.

Minimum: 1
Maximum: 100
Default: 20
startingAfter optional
A cursor used for pagination. Get the value from the nextCursor response of the previous page.

Request
https://api.liveblocks.io/v2/ai/copilots
Response
Status:
Success. Returns the list of AI copilots.

Schema
{
  "nextCursor": {
    "type": "string"
  },
  "data": {
    "type": "array",
    "items": {
      "$ref": "#/components/schemas/AiCopilot"
    }
  }
}
post
/ai/copilots
Create AI copilot
This endpoint creates a new AI copilot with the given configuration. Corresponds to liveblocks.createAiCopilot.

Request body
https://api.liveblocks.io/v2/ai/copilots
Schema
{
  "name": {
    "type": "string"
  },
  "description": {
    "type": "string",
    "nullable": true
  },
  "systemPrompt": {
    "type": "string"
  },
  "knowledgePrompt": {
    "type": "string",
    "nullable": true
  },
  "providerApiKey": {
    "type": "string"
  },
  "providerModel": {
    "type": "string"
  },
  "providerOptions": {
    "oneOf": [
      {
        "type": "object",
        "properties": {
          "openai": {
            "type": "object",
            "properties": {
              "reasoningEffort": {
                "type": "string",
                "enum": [
                  "low",
                  "medium",
                  "high"
                ]
              },
              "webSearch": {
                "type": "object",
                "properties": {
                  "allowedDomains": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        "type": "object",
        "properties": {
          "anthropic": {
            "type": "object",
            "properties": {
              "thinking": {
                "oneOf": [
                  {
                    "type": "object",
                    "properties": {
                      "type": {
                        "const": "enabled"
                      },
                      "budgetTokens": {
                        "type": "number",
                        "minimum": 0
                      }
                    },
                    "required": [
                      "type",
                      "budgetTokens"
                    ]
                  },
                  {
                    "type": "object",
                    "properties": {
                      "type": {
                        "const": "disabled"
                      }
                    },
                    "required": [
                      "type"
                    ]
                  }
                ]
              },
              "webSearch": {
                "type": "object",
                "properties": {
                  "allowedDomains": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        "type": "object",
        "properties": {
          "google": {
            "type": "object",
            "properties": {
              "thinkingConfig": {
                "type": "object",
                "properties": {
                  "thinkingBudget": {
                    "type": "number",
                    "minimum": 0
                  }
                }
              }
            }
          }
        }
      }
    ],
    "nullable": true
  },
  "settings": {
    "$ref": "#/components/schemas/CopilotSettings",
    "nullable": true
  },
  "provider": {
    "type": "string",
    "enum": [
      "openai",
      "anthropic",
      "google",
      "openai-compatible"
    ]
  },
  "compatibleProviderName": {
    "type": "string"
  },
  "providerBaseUrl": {
    "type": "string",
    "format": "uri"
  }
}
get
/ai/copilots/:copilotId
Get AI copilot
This endpoint returns an AI copilot by its ID. Corresponds to liveblocks.getAiCopilot.

Parameters
copilotId required
ID of the AI copilot

Request
https://api.liveblocks.io/v2/ai/copilots/{copilotId}
post
/ai/copilots/:copilotId
Update AI copilot
This endpoint updates an existing AI copilot's configuration. Corresponds to liveblocks.updateAiCopilot.

This endpoint returns a 422 response if the update doesn't apply due to validation failures. For example, if the existing copilot uses the "openai" provider and you attempt to update the provider model to an incompatible value for the provider, like "gemini-2.5-pro", you'll receive a 422 response with an error message explaining where the validation failed.

Parameters
copilotId required
ID of the AI copilot

Request body
https://api.liveblocks.io/v2/ai/copilots/{copilotId}
Schema
{
  "name": {
    "type": "string"
  },
  "description": {
    "type": "string",
    "nullable": true
  },
  "systemPrompt": {
    "type": "string"
  },
  "knowledgePrompt": {
    "type": "string",
    "nullable": true
  },
  "providerApiKey": {
    "type": "string"
  },
  "providerModel": {
    "type": "string"
  },
  "providerOptions": {
    "oneOf": [
      {
        "type": "object",
        "properties": {
          "openai": {
            "type": "object",
            "properties": {
              "reasoningEffort": {
                "type": "string",
                "enum": [
                  "low",
                  "medium",
                  "high"
                ]
              },
              "webSearch": {
                "type": "object",
                "properties": {
                  "allowedDomains": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        "type": "object",
        "properties": {
          "anthropic": {
            "type": "object",
            "properties": {
              "thinking": {
                "oneOf": [
                  {
                    "type": "object",
                    "properties": {
                      "type": {
                        "const": "enabled"
                      },
                      "budgetTokens": {
                        "type": "number",
                        "minimum": 0
                      }
                    },
                    "required": [
                      "type",
                      "budgetTokens"
                    ]
                  },
                  {
                    "type": "object",
                    "properties": {
                      "type": {
                        "const": "disabled"
                      }
                    },
                    "required": [
                      "type"
                    ]
                  }
                ]
              },
              "webSearch": {
                "type": "object",
                "properties": {
                  "allowedDomains": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        "type": "object",
        "properties": {
          "google": {
            "type": "object",
            "properties": {
              "thinkingConfig": {
                "type": "object",
                "properties": {
                  "thinkingBudget": {
                    "type": "number",
                    "minimum": 0
                  }
                }
              }
            }
          }
        }
      }
    ],
    "nullable": true
  },
  "settings": {
    "$ref": "#/components/schemas/CopilotSettings",
    "nullable": true
  },
  "provider": {
    "type": "string",
    "enum": [
      "openai",
      "anthropic",
      "google",
      "openai-compatible"
    ]
  },
  "compatibleProviderName": {
    "type": "string"
  },
  "providerBaseUrl": {
    "type": "string",
    "format": "uri"
  }
}
delete
/ai/copilots/:copilotId
Delete AI copilot
This endpoint deletes an AI copilot by its ID. A deleted copilot is no longer accessible and cannot be restored. Corresponds to liveblocks.deleteAiCopilot.

Parameters
copilotId required
ID of the AI copilot

Request
https://api.liveblocks.io/v2/ai/copilots/{copilotId}
get
/ai/copilots/:copilotId/knowledge
Get knowledge sources
This endpoint returns a paginated list of knowledge sources for a specific AI copilot. Corresponds to liveblocks.getKnowledgeSources.

Parameters
copilotId required
ID of the AI copilot

limit optional
A limit on the number of knowledge sources to be returned. The limit can range between 1 and 100, and defaults to 20.

Minimum: 1
Maximum: 100
Default: 20
startingAfter optional
A cursor used for pagination. Get the value from the nextCursor response of the previous page.

Request
https://api.liveblocks.io/v2/ai/copilots/{copilotId}/knowledge
Response
Status:
Success. Returns the list of knowledge sources.

Schema
{
  "nextCursor": {
    "type": "string"
  },
  "data": {
    "type": "array",
    "items": {
      "$ref": "#/components/schemas/KnowledgeSource"
    }
  }
}
get
/ai/copilots/:copilotId/knowledge/:knowledgeSourceId
Get knowledge source
This endpoint returns a specific knowledge source by its ID. Corresponds to liveblocks.getKnowledgeSource.

Parameters
copilotId required
ID of the AI copilot

knowledgeSourceId required
ID of the knowledge source

Request
https://api.liveblocks.io/v2/ai/copilots/{copilotId}/knowledge/{knowledgeSourceId}
post
/ai/copilots/:copilotId/knowledge/web
Create web knowledge source
This endpoint creates a web knowledge source for an AI copilot. This allows the copilot to access and learn from web content. Corresponds to liveblocks.createWebKnowledgeSource.

Parameters
copilotId required
ID of the AI copilot

Request body
https://api.liveblocks.io/v2/ai/copilots/{copilotId}/knowledge/web
Schema
{
  "copilotId": {
    "type": "string"
  },
  "url": {
    "type": "string"
  },
  "type": {
    "type": "string",
    "enum": [
      "individual_link",
      "crawl",
      "sitemap"
    ]
  }
}
Response
Status:
Success. Returns the ID of the created knowledge source.

Schema
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    }
  }
}
put
/ai/copilots/:copilotId/knowledge/file/:name
Create file knowledge source
This endpoint creates a file knowledge source for an AI copilot by uploading a file. The copilot can then reference the content of the file when responding. Corresponds to liveblocks.createFileKnowledgeSource.

Parameters
copilotId required
ID of the AI copilot

name required
Name of the file

Request body
https://api.liveblocks.io/v2/ai/copilots/{copilotId}/knowledge/file/{name}
Response
Status:
Success. Returns the ID of the created knowledge source.

Schema
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    }
  }
}
get
/ai/copilots/:copilotId/knowledge/file/:knowledgeSourceId
Get file knowledge source content
This endpoint returns the content of a file knowledge source as Markdown. This allows you to see what content the AI copilot has access to from uploaded files. Corresponds to liveblocks.getFileKnowledgeSourceMarkdown.

Parameters
copilotId required
ID of the AI copilot

knowledgeSourceId required
ID of the knowledge source

Request
https://api.liveblocks.io/v2/ai/copilots/{copilotId}/knowledge/file/{knowledgeSourceId}
Response
Status:
Success. Returns the content of the file knowledge source.

Schema
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "content": {
      "type": "string"
    }
  }
}
delete
/ai/copilots/:copilotId/knowledge/file/:knowledgeSourceId
Delete file knowledge source
This endpoint deletes a file knowledge source from an AI copilot. The copilot will no longer have access to the content from this file. Corresponds to liveblocks.deleteFileKnowledgeSource.

Parameters
copilotId required
ID of the AI copilot

knowledgeSourceId required
ID of the knowledge source

Request
https://api.liveblocks.io/v2/ai/copilots/{copilotId}/knowledge/file/{knowledgeSourceId}
delete
/ai/copilots/:copilotId/knowledge/web/:knowledgeSourceId
Delete web knowledge source
This endpoint deletes a web knowledge source from an AI copilot. The copilot will no longer have access to the content from this source. Corresponds to liveblocks.deleteWebKnowledgeSource.

Parameters
copilotId required
ID of the AI copilot

knowledgeSourceId required
ID of the knowledge source

Request
https://api.liveblocks.io/v2/ai/copilots/{copilotId}/knowledge/web/{knowledgeSourceId}
get
/ai/copilots/:copilotId/knowledge/web/:knowledgeSourceId/links
Get web knowledge source links
This endpoint returns a paginated list of links that were indexed from a web knowledge source. This is useful for understanding what content the AI copilot has access to from web sources. Corresponds to liveblocks.getWebKnowledgeSourceLinks.

Parameters
copilotId required
ID of the AI copilot

knowledgeSourceId required
ID of the knowledge source

limit optional
A limit on the number of links to be returned. The limit can range between 1 and 100, and defaults to 20.

Minimum: 1
Maximum: 100
Default: 20
startingAfter optional
A cursor used for pagination. Get the value from the nextCursor response of the previous page.

Request
https://api.liveblocks.io/v2/ai/copilots/{copilotId}/knowledge/web/{knowledgeSourceId}/links
Response
Status:
Success. Returns the list of web knowledge source links.

Schema
{
  "nextCursor": {
    "type": "string"
  },
  "data": {
    "type": "array",
    "items": {
      "$ref": "#/components/schemas/WebKnowledgeSourceLink"
    }
  }
}
Deprecated
get
/rooms/:roomId/threads/:threadId/participants
Get thread participants
Deprecated
Deprecated. Prefer using thread subscriptions instead.

This endpoint returns the list of thread participants. It is a list of unique user IDs representing all the thread comment authors and mentioned users in comments. Corresponds to liveblocks.getThreadParticipants.

Parameters
roomId required
ID of the room

threadId required
ID of the thread

Request
https://api.liveblocks.io/v2/rooms/{roomId}/threads/{threadId}/participants
Response
Status:
Success. Returns the thread’s participants

Example
Schema
{
  "participantIds": [
    "user-1",
    "user-2"
  ]
}
post
/rooms/:roomId/authorize
Get single-room token with secret key
Deprecated
Deprecated. Prefer using access tokens or ID tokens instead. Read more in our migration guide.

This endpoint lets your application server (your back end) obtain a token that one of its clients (your frontend) can use to enter a Liveblocks room. You use this endpoint to implement your own application’s custom authentication endpoint. When making this request, you’ll have to use your secret key.

You can pass the property userId in the request’s body. This can be whatever internal identifier you use for your user accounts as long as it uniquely identifies an account. Setting the userId is optional if you want to use public rooms, but it is required to enter a private room (because permissions are assigned to specific user IDs). In case you want to use the group permission system, you can also declare which groupIds this user belongs to.

The property userId is used by Liveblocks to calculate your account’s Monthly Active Users. One unique userId corresponds to one MAU. If you don’t pass a userId, we will create for you a new anonymous userId on each connection, but your MAUs will be higher.

Additionally, you can set custom metadata to the token, which will be publicly accessible by other clients through the user.info property. This is useful for storing static data like avatar images or the user’s display name.

Parameters
roomId required
ID of the room

Request body
https://api.liveblocks.io/v2/rooms/{roomId}/authorize
Example
Schema
{
  "userId": "b2c1c290-f2c9-45de-a74e-6b7aa0690f59",
  "groupIds": [
    "g1",
    "g2"
  ],
  "userInfo": {
    "name": "bob",
    "colors": [
      "blue",
      "red"
    ]
  }
}
Response
Status:
Success. Returns an old-style single-room token.

Example
Schema
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
post
/rooms/:roomId/public/authorize
Get single-room token with public key
Deprecated
Deprecated. When you update Liveblocks to 1.2, you no longer need to get a JWT token when using a public key.

This endpoint works with the public key and can be used client side. That means you don’t need to implement a dedicated authorization endpoint server side. The generated JWT token works only with public room (defaultAccesses: ["room:write"]).

Parameters
roomId required
ID of the room

Request body
https://api.liveblocks.io/v2/rooms/{roomId}/public/authorize
Example
Schema
{
  "publicApiKey": "pk_test_lOMrmwejSWLaPYQc5_JuGHXXX"
}
Response
Status:
Success. Returns the JWT token.

Example
Schema
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
get
/rooms/:roomId/users/:userId/notification-settings
Get room notification settings
Deprecated
Deprecated. Renamed to /subscription-settings. Read more in our migration guide.

This endpoint returns a user’s subscription settings for a specific room. Corresponds to liveblocks.getRoomNotificationSettings.

Parameters
roomId required
ID of the room

userId required
ID of the user

Request
https://api.liveblocks.io/v2/rooms/{roomId}/users/{userId}/notification-settings
Response
Status:
Schema
{
  "threads": {
    "enum": [
      "all",
      "replies_and_mentions",
      "none"
    ]
  },
  "textMentions": {
    "enum": [
      "mine",
      "none"
    ]
  }
}
post
/rooms/:roomId/users/:userId/notification-settings
Update room notification settings
Deprecated
Deprecated. Renamed to /subscription-settings. Read more in our migration guide.

This endpoint updates a user’s notification settings for a specific room. Corresponds to liveblocks.updateRoomNotificationSettings.

Parameters
roomId required
ID of the room

userId required
ID of the user

Request body
https://api.liveblocks.io/v2/rooms/{roomId}/users/{userId}/notification-settings
Schema
{
  "threads": {
    "enum": [
      "all",
      "replies_and_mentions",
      "none"
    ]
  },
  "textMentions": {
    "enum": [
      "mine",
      "none"
    ]
  }
}
Response
Status:
Schema
{
  "threads": {
    "enum": [
      "all",
      "replies_and_mentions",
      "none"
    ]
  },
  "textMentions": {
    "enum": [
      "mine",
      "none"
    ]
  }
}
delete
/rooms/:roomId/users/:userId/notification-settings
Delete room notification settings
Deprecated
Deprecated. Renamed to /subscription-settings. Read more in our migration guide.

This endpoint deletes a user’s notification settings for a specific room. Corresponds to liveblocks.deleteRoomNotificationSettings.

Parameters
roomId required
ID of the room

userId required
ID of the user

Request
https://api.liveblocks.io/v2/rooms/{roomId}/users/{userId}/notification-settings
