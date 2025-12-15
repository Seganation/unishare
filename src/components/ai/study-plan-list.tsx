"use client";

import { api } from "~/trpc/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Calendar, Clock, Target, Trash2, BookOpen } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface StudyPlanListProps {
  courseId?: string;
  onSelectPlan?: (planId: string) => void;
}

export function StudyPlanList({ courseId, onSelectPlan }: StudyPlanListProps) {
  const {
    data: plans,
    isLoading,
    refetch,
  } = api.ai.getStudyPlans.useQuery(courseId ? { courseId } : {});
  const deletePlan = api.ai.deleteStudyPlan.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleDelete = async (planId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this study plan? This action cannot be undone.",
      )
    ) {
      await deletePlan.mutateAsync({ id: planId });
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="bg-muted h-6 w-3/4 rounded" />
              <div className="bg-muted h-4 w-1/2 rounded" />
            </CardHeader>
            <CardContent>
              <div className="bg-muted h-20 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">No study plans yet</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Create your first study plan to organize your learning!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => {
        const totalTasks = plan.weeks.flatMap((w) => w.tasks).length;
        const completedTasks = plan.weeks
          .flatMap((w) => w.tasks)
          .filter((t) => t.isCompleted).length;
        const progress =
          totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        return (
          <Card key={plan.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="mb-2 text-lg">{plan.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {plan.description || "No description"}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDelete(plan.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {plan.weeks.length}{" "}
                  {plan.weeks.length === 1 ? "week" : "weeks"}
                </Badge>
                <Badge variant="outline">{totalTasks} tasks</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {completedTasks}/{totalTasks} tasks
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-muted-foreground text-right text-xs">
                  {Math.round(progress)}% complete
                </p>
              </div>

              {/* Date Range */}
              {plan.startDate && plan.endDate && (
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(plan.startDate), "MMM d")} -{" "}
                    {format(new Date(plan.endDate), "MMM d, yyyy")}
                  </span>
                </div>
              )}

              {/* Created */}
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>
                  Created{" "}
                  {formatDistanceToNow(new Date(plan.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              {/* Actions */}
              <Button
                onClick={() => onSelectPlan?.(plan.id)}
                className="w-full"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                View Plan
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
