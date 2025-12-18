import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, parentId } = await request.json();

    // Check if user has access to this course
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
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if user is owner or contributor
    const isOwner = course.createdBy === session.user.id;
    const collaboration = course.collaborators[0];
    const canEdit =
      isOwner || (collaboration && collaboration.role === "CONTRIBUTOR");

    if (!canEdit) {
      return NextResponse.json(
        { error: "You don't have permission to create pages" },
        { status: 403 },
      );
    }

    // Get the highest order number for this course
    const lastPage = await db.note.findFirst({
      where: { courseId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = (lastPage?.order ?? 0) + 1;

    // Create the new page
    // Note: liveblockRoom will be set to pageId after creation
    // Content is NOT stored in database - it lives in Liveblocks Yjs
    const newPage = await db.note.create({
      data: {
        title: "Untitled",
        courseId,
        liveblockRoom: "", // Will be updated to use pageId
        order: newOrder,
        // content field intentionally omitted - document lives in Liveblocks
        ...(parentId && { parentId }), // Add parentId if provided
      },
    });

    // Update liveblockRoom to use the pageId as the room identifier
    // This ensures all users viewing the same page connect to the same room
    // The Yjs document will be automatically created and persisted by Liveblocks
    await db.note.update({
      where: { id: newPage.id },
      data: { liveblockRoom: newPage.id },
    });

    return NextResponse.json(newPage);
  } catch (error) {
    console.error("Error creating page:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
