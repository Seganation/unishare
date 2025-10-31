import { Liveblocks } from "@liveblocks/node";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

// Generate a random color for user cursor
function generateUserColor(userId: string): string {
  const colors = [
    "#E57373",
    "#F06292",
    "#BA68C8",
    "#9575CD",
    "#7986CB",
    "#64B5F6",
    "#4FC3F7",
    "#4DD0E1",
    "#4DB6AC",
    "#81C784",
    "#AED581",
    "#FF8A65",
    "#FFD54F",
  ];

  // Use user ID to consistently assign colors
  const index =
    userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index]!;
}

export async function POST(request: Request) {
  try {
    // Get the current user from the session
    const session = await auth();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get the room from the request body
    let room: string;
    try {
      const body = await request.json();
      room = body.room;
    } catch (e) {
      // If JSON parsing fails, try reading as text (some Liveblocks requests use different formats)
      console.error("Failed to parse JSON:", e);
      return new Response("Bad Request - Invalid JSON", { status: 400 });
    }

    if (!room) {
      return new Response("Bad Request - Room ID missing", { status: 400 });
    }

    console.log("🔍 Auth request - Room ID:", room, "User:", session.user.name);

    // Extract the base room ID (pageId) from the room string
    // Liveblocks may append suffixes for threads/comments like "pageId:thread:123"
    const baseRoomId = room.split(":")[0];
    console.log("📦 Base room ID:", baseRoomId);

    // Room is now the pageId - look up the page to get the courseId
    const page = await db.note.findUnique({
      where: { id: baseRoomId },
      select: { courseId: true },
    });

    if (!page) {
      console.log("❌ Page not found for room:", room, "baseRoomId:", baseRoomId);
      return new Response("Page not found", { status: 404 });
    }

    const courseId = page.courseId;
    console.log("✅ Liveblocks auth - Room:", room, "CourseId:", courseId);

    // Check if the user has access to this course
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        collaborators: {
          where: {
            userId: session.user.id,
            status: "ACCEPTED",
          },
        },
      },
    });

    if (!course) {
      return new Response("Course not found", { status: 404 });
    }

    // Check if user is owner or has accepted collaboration
    const isOwner = course.createdBy === session.user.id;
    const collaboration = course.collaborators[0];

    if (!isOwner && !collaboration) {
      return new Response("Forbidden", { status: 403 });
    }

    // Determine user role
    const userRole = isOwner
      ? "OWNER"
      : collaboration?.role ?? "VIEWER";

    // Create a session for the current user
    // Usernames are set when authenticating with the API
    const liveblocksSession = liveblocks.prepareSession(session.user.id, {
      userInfo: {
        name: session.user.name ?? "Anonymous",
        email: session.user.email ?? "",
        avatar: session.user.image ?? undefined,
        color: generateUserColor(session.user.id),
        role: userRole,
      },
    });

    // Give the user access to the room
    liveblocksSession.allow(room, liveblocksSession.FULL_ACCESS);

    // Authorize the user and return the result
    const { status, body } = await liveblocksSession.authorize();
    return new Response(body, { status });
  } catch (error) {
    console.error("Liveblocks auth error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
