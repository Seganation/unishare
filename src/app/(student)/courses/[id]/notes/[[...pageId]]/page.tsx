import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { CollaborativeEditorWrapper } from "~/components/notes/collaborative-editor-wrapper";
import { NotesSidebar } from "~/components/notes/notes-sidebar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default async function NotesPage({
  params,
}: {
  params: Promise<{ id: string; pageId?: string[] }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id: courseId, pageId: pageIdArray } = await params;
  const pageId = pageIdArray?.[0];

  // Get course with access check
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
      collaborators: {
        where: {
          status: "ACCEPTED",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!course) {
    redirect("/courses");
  }

  // Check access
  const isOwner = course.createdBy === session.user.id;
  const collaboration = course.collaborators.find(
    (c) => c.userId === session.user.id,
  );

  if (!isOwner && !collaboration) {
    redirect(`/courses/${courseId}`);
  }

  // Determine permissions
  const userRole = isOwner ? "OWNER" : collaboration?.role ?? "VIEWER";
  const canEdit = userRole === "OWNER" || userRole === "CONTRIBUTOR";
  const isReadOnly = userRole === "VIEWER";

  // Get all pages for this course
  const pages = await db.note.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      icon: true,
      order: true,
      updatedAt: true,
    },
  });

  // If no pages exist and user can edit, create a default page
  let currentPage;
  if (pages.length === 0 && canEdit) {
    currentPage = await db.note.create({
      data: {
        title: "Getting Started",
        courseId,
        liveblockRoom: "", // Will be updated to pageId
        order: 0,
        content: {},
      },
    });

    // Update liveblockRoom to use pageId as room identifier
    await db.note.update({
      where: { id: currentPage.id },
      data: { liveblockRoom: currentPage.id },
    });

    // Redirect to the new page
    redirect(`/courses/${courseId}/notes/${currentPage.id}`);
  } else if (pages.length === 0) {
    // No pages and can't create - show empty state
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="border-b-2 border-gray-200 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <Link href={`/courses/${courseId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Course
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">
              No pages have been created yet. Ask a contributor or owner to
              create one.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If no pageId specified, redirect to first page
  if (!pageId) {
    redirect(`/courses/${courseId}/notes/${pages[0]!.id}`);
  }

  // Get the current page
  currentPage = await db.note.findUnique({
    where: { id: pageId },
  });

  if (!currentPage || currentPage.courseId !== courseId) {
    redirect(`/courses/${courseId}/notes/${pages[0]!.id}`);
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <div className="border-b-2 border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/courses/${courseId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Course
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {course.title}
                </h1>
                <p className="text-sm text-gray-600">Collaborative Notes</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Role Badge */}
              <div
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  userRole === "OWNER"
                    ? "bg-amber-100 text-amber-700"
                    : userRole === "CONTRIBUTOR"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                {userRole}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <NotesSidebar
          courseId={courseId}
          currentPageId={pageId}
          pages={pages}
          canEdit={canEdit}
        />

        {/* Editor */}
        <div className="flex-1 overflow-y-auto">
          <CollaborativeEditorWrapper
            pageId={currentPage.id}
            pageTitle={currentPage.title}
            roomId={currentPage.liveblockRoom}
            canEdit={canEdit}
            isReadOnly={isReadOnly}
            userRole={userRole}
            courseName={course.title}
          />
        </div>
      </div>
    </div>
  );
}
