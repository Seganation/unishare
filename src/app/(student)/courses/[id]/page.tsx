"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { ResourceCard } from "~/components/resources/resource-card";
import { ResourceForm } from "~/components/resources/resource-form";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { QuizList } from "~/components/ai/quiz-list";
import { QuizTaker } from "~/components/ai/quiz-taker";
import { QuizResults } from "~/components/ai/quiz-results";
import { QuizGeneratorForm } from "~/components/ai/quiz-generator-form";
import { StudyPlanList } from "~/components/ai/study-plan-list";
import { StudyPlanViewer } from "~/components/ai/study-plan-viewer";
import { StudyPlanGeneratorForm } from "~/components/ai/study-plan-generator-form";
import {
  ArrowLeft,
  Plus,
  Users,
  Star,
  Settings,
  MoreVertical,
  FileText,
  FileQuestion,
  Calendar,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

type View =
  | "resources"
  | "quizzes"
  | "quiz-generator"
  | "quiz-taker"
  | "quiz-results"
  | "study-plans"
  | "study-plan-generator"
  | "study-plan-viewer";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [view, setView] = useState<View>("resources");
  const [activeTab, setActiveTab] = useState<
    "resources" | "quizzes" | "study-plans"
  >("resources");
  const [selectedQuizId, setSelectedQuizId] = useState<string | undefined>();
  const [selectedAttemptId, setSelectedAttemptId] = useState<
    string | undefined
  >();
  const [quizIdForResults, setQuizIdForResults] = useState<
    string | undefined
  >();
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>();

  const utils = api.useUtils();

  const { data: course, isLoading } = api.course.getById.useQuery({
    id: courseId,
  });

  const toggleFavorite = api.course.toggleFavorite.useMutation({
    onSuccess: (data) => {
      void utils.course.getById.invalidate({ id: courseId });
      toast.success(
        data.favorited ? "Added to favorites" : "Removed from favorites",
      );
    },
  });

  const deleteResource = api.resource.delete.useMutation({
    onSuccess: () => {
      void utils.course.getById.invalidate({ id: courseId });
      toast.success("Resource deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to delete resource");
    },
  });

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <Skeleton className="mb-6 h-10 w-32" />
          <div className="border-border bg-card mb-8 rounded-2xl border p-8">
            <Skeleton className="mb-4 h-8 w-64" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Resources Skeleton */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-foreground mb-4 text-2xl font-bold">
            Course Not Found
          </h1>
          <Button onClick={() => router.push("/courses")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const userRole = course.userRole;
  const canEdit = userRole === "OWNER" || userRole === "CONTRIBUTOR";
  const isOwner = userRole === "OWNER";

  const handleQuizSelect = (quizId: string) => {
    setSelectedQuizId(quizId);
    setView("quiz-taker");
  };

  const handleQuizComplete = (attemptId: string) => {
    setSelectedAttemptId(attemptId);
    setQuizIdForResults(selectedQuizId);
    setView("quiz-results");
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    setView("study-plan-viewer");
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/courses")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>

        {/* Course Header */}
        <div className="border-border bg-card mb-8 rounded-2xl border p-8 shadow-sm">
          <div className="mb-6 flex items-start justify-between">
            {/* Title & Info */}
            <div className="flex-1">
              <div className="mb-4 flex items-center gap-3">
                {/* Color Indicator */}
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: course.color }}
                />
                <h1 className="text-foreground text-3xl font-bold">
                  {course.title}
                </h1>
                {course.isFavorite && (
                  <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
                )}
              </div>

              {course.description && (
                <p className="text-muted-foreground mb-4 max-w-3xl">
                  {course.description}
                </p>
              )}

              {/* Stats */}
              <div className="text-muted-foreground flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{course._count.collaborators} members</span>
                </div>
                <Badge variant="secondary">{userRole}</Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleFavorite.mutate({ courseId })}
                disabled={toggleFavorite.isPending}
              >
                <Star
                  className={cn(
                    "h-4 w-4",
                    course.isFavorite && "fill-yellow-500 text-yellow-500",
                  )}
                />
              </Button>

              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/courses/${courseId}/settings`)
                      }
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Course Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/courses/${courseId}/collaborators`)
                      }
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Manage Collaborators
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Collaborators Preview */}
          {course.collaborators.length > 0 && (
            <div className="border-border border-t pt-6">
              <h3 className="text-foreground mb-3 text-sm font-medium">
                Collaborators
              </h3>
              <div className="flex items-center gap-2">
                {course.collaborators.slice(0, 8).map((collab) => (
                  <Avatar
                    key={collab.id}
                    className="border-border h-8 w-8 border-2"
                  >
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {collab.user.name?.[0]?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {course.collaborators.length > 8 && (
                  <div className="border-border bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium">
                    +{course.collaborators.length - 8}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tabs for Resources, Quizzes, and Study Plans */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v as typeof activeTab);
            if (v === "resources") setView("resources");
            else if (v === "quizzes") setView("quizzes");
            else if (v === "study-plans") setView("study-plans");
          }}
        >
          <TabsList className="mb-6 grid w-full grid-cols-3">
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <FileQuestion className="h-4 w-4" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger
              value="study-plans"
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Study Plans
            </TabsTrigger>
          </TabsList>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-foreground text-2xl font-bold">Resources</h2>
              {canEdit && (
                <Button onClick={() => setShowResourceForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Custom Resource
                </Button>
              )}
            </div>

            {/* Resources Grid */}
            {course.resources.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {course.resources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    id={resource.id}
                    title={resource.title}
                    type={resource.type}
                    description={resource.description}
                    deadline={resource.deadline}
                    fileUrls={resource.fileUrls}
                    allowFiles={resource.allowFiles}
                    userRole={userRole}
                    courseId={courseId}
                    onAddFile={() => {
                      toast.info("File upload coming soon!");
                      // TODO: Implement file upload modal
                    }}
                    onDelete={
                      isOwner && resource.type === "CUSTOM"
                        ? () => {
                            if (
                              confirm(
                                "Are you sure you want to delete this resource?",
                              )
                            ) {
                              deleteResource.mutate({ id: resource.id });
                            }
                          }
                        : undefined
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="border-border bg-card rounded-2xl border py-16 text-center">
                <p className="text-muted-foreground">No resources yet</p>
                {canEdit && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowResourceForm(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Resource
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-4">
            {view === "quizzes" && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Course Quizzes</h2>
                  <Button onClick={() => setView("quiz-generator")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Quiz
                  </Button>
                </div>
                <QuizList courseId={courseId} onSelectQuiz={handleQuizSelect} />
              </>
            )}
            {view === "quiz-generator" && (
              <QuizGeneratorForm
                courseId={courseId}
                onSuccess={(quizId) => {
                  setSelectedQuizId(quizId);
                  setView("quiz-taker");
                }}
                onCancel={() => setView("quizzes")}
              />
            )}
            {view === "quiz-taker" && selectedQuizId && (
              <QuizTaker
                quizId={selectedQuizId}
                onBack={() => setView("quizzes")}
                onComplete={handleQuizComplete}
              />
            )}
            {view === "quiz-results" &&
              selectedAttemptId &&
              quizIdForResults && (
                <QuizResults
                  quizId={quizIdForResults}
                  attemptId={selectedAttemptId}
                  onBack={() => setView("quizzes")}
                  onRetake={() => setView("quiz-taker")}
                />
              )}
          </TabsContent>

          {/* Study Plans Tab */}
          <TabsContent value="study-plans" className="space-y-4">
            {view === "study-plans" && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Study Plans</h2>
                  <Button onClick={() => setView("study-plan-generator")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Plan
                  </Button>
                </div>
                <StudyPlanList
                  courseId={courseId}
                  onSelectPlan={handlePlanSelect}
                />
              </>
            )}
            {view === "study-plan-generator" && (
              <StudyPlanGeneratorForm
                courseId={courseId}
                onSuccess={(planId) => {
                  setSelectedPlanId(planId);
                  setView("study-plan-viewer");
                }}
                onCancel={() => setView("study-plans")}
              />
            )}
            {view === "study-plan-viewer" && selectedPlanId && (
              <StudyPlanViewer
                planId={selectedPlanId}
                onBack={() => setView("study-plans")}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Resource Form Modal */}
        <ResourceForm
          courseId={courseId}
          open={showResourceForm}
          onOpenChange={setShowResourceForm}
        />
      </div>
    </div>
  );
}
