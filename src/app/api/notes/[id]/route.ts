import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

// DELETE - Delete a page
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the page with course info
    const page = await db.note.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            collaborators: {
              where: {
                userId: session.user.id,
                status: "ACCEPTED",
              },
            },
          },
        },
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Check permissions
    const isOwner = page.course.createdBy === session.user.id;
    const collaboration = page.course.collaborators[0];
    const canEdit =
      isOwner || (collaboration && collaboration.role === "CONTRIBUTOR");

    if (!canEdit) {
      return NextResponse.json(
        { error: "You don't have permission to delete this page" },
        { status: 403 },
      );
    }

    // Delete the page
    await db.note.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH - Update page title/icon
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, icon, content } = body;

    // Get the page with course info
    const page = await db.note.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            collaborators: {
              where: {
                userId: session.user.id,
                status: "ACCEPTED",
              },
            },
          },
        },
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Check permissions
    const isOwner = page.course.createdBy === session.user.id;
    const collaboration = page.course.collaborators[0];
    const canEdit =
      isOwner || (collaboration && collaboration.role === "CONTRIBUTOR");

    if (!canEdit) {
      return NextResponse.json(
        { error: "You don't have permission to edit this page" },
        { status: 403 },
      );
    }

    // Update the page
    const updatedPage = await db.note.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(icon !== undefined && { icon }),
        ...(content !== undefined && { content }),
      },
    });

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error("Error updating page:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
