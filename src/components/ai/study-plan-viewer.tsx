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
import { Checkbox } from "~/components/ui/checkbox";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  ArrowLeft,
  Calendar,
  Target,
  Clock,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface StudyPlanViewerProps {
  planId: string;
  onBack?: () => void;
}

export function StudyPlanViewer({ planId, onBack }: StudyPlanViewerProps) {
  const { data: plans, refetch } = api.ai.getStudyPlans.useQuery({});
  const updateTask = api.ai.updateStudyPlanTask.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Task updated");
    },
  });

  const plan = plans?.find((p) => p.id === planId);

  const handleTaskToggle = async (taskId: string, isCompleted: boolean) => {
    await updateTask.mutateAsync({ taskId, isCompleted });
  };

  if (!plan) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-muted-foreground text-center">
            Loading study plan...
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalTasks = plan.weeks.flatMap((w) => w.tasks).length;
  const completedTasks = plan.weeks
    .flatMap((w) => w.tasks)
    .filter((t) => t.isCompleted).length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold">{plan.title}</h2>
            {plan.description && (
              <p className="text-muted-foreground mt-1">{plan.description}</p>
            )}
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          {plan.weeks.length} {plan.weeks.length === 1 ? "week" : "weeks"}
        </Badge>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                {completedTasks} of {totalTasks} tasks completed
              </span>
              <span className="text-2xl font-bold">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <div className="grid grid-cols-1 gap-4 border-t pt-4">
            {plan.startDate && plan.endDate && (
              <div className="flex items-start gap-2">
                <Calendar className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Duration</p>
                  <p className="text-sm font-medium">
                    {format(new Date(plan.startDate), "MMM d")} -{" "}
                    {format(new Date(plan.endDate), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Weekly Breakdown</h3>
        <Accordion type="multiple" className="space-y-4">
          {plan.weeks.map((week, weekIndex) => {
            const weekTasks = week.tasks.length;
            const weekCompleted = week.tasks.filter(
              (t) => t.isCompleted,
            ).length;
            const weekProgress =
              weekTasks > 0 ? (weekCompleted / weekTasks) * 100 : 0;

            return (
              <AccordionItem
                key={week.id}
                value={week.id}
                className="rounded-lg border"
              >
                <AccordionTrigger className="px-6 hover:no-underline">
                  <div className="flex w-full items-center justify-between pr-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                          weekProgress === 100
                            ? "bg-green-500/20 text-green-700 dark:text-green-400"
                            : "bg-primary/20 text-primary"
                        }`}
                      >
                        {weekProgress === 100 ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          weekIndex + 1
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">{week.title}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="mr-2 ml-auto">
                      {weekCompleted}/{weekTasks}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6">
                    {/* Week Description */}
                    {week.description && (
                      <p className="text-muted-foreground text-sm">
                        {week.description}
                      </p>
                    )}

                    {/* Learning Goals */}
                    {week.goals && week.goals.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="flex items-center gap-2 text-sm font-semibold">
                          <Target className="h-4 w-4" />
                          Learning Goals
                        </h4>
                        <ul className="ml-6 space-y-1">
                          {week.goals.map((goal, index) => (
                            <li key={index} className="list-disc text-sm">
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tasks */}
                    <div className="space-y-2">
                      <h4 className="flex items-center gap-2 text-sm font-semibold">
                        <CheckCircle2 className="h-4 w-4" />
                        Tasks
                      </h4>
                      <div className="space-y-2">
                        {week.tasks.map((task) => (
                          <div
                            key={task.id}
                            className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                              task.isCompleted
                                ? "border-green-500/20 bg-green-500/5"
                                : "hover:bg-accent/50"
                            }`}
                          >
                            <Checkbox
                              checked={task.isCompleted}
                              onCheckedChange={(checked) =>
                                handleTaskToggle(task.id, !!checked)
                              }
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <p
                                className={`font-medium ${
                                  task.isCompleted
                                    ? "text-muted-foreground line-through"
                                    : ""
                                }`}
                              >
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-muted-foreground mt-1 text-sm">
                                  {task.description}
                                </p>
                              )}
                              <div className="mt-2 flex items-center gap-4">
                                {task.estimatedMinutes && (
                                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                                    <Clock className="h-3 w-3" />
                                    <span>{task.estimatedMinutes} min</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Week Progress */}
                    <div className="border-t pt-4">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Week Progress
                        </span>
                        <span className="font-medium">
                          {Math.round(weekProgress)}%
                        </span>
                      </div>
                      <Progress value={weekProgress} className="h-2" />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
