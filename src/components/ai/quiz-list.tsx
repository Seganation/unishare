"use client";

import { useState } from "react";
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
import { FileQuestion, Clock, Trophy, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface QuizListProps {
  courseId?: string;
  onSelectQuiz?: (quizId: string) => void;
}

export function QuizList({ courseId, onSelectQuiz }: QuizListProps) {
  const {
    data: quizzes,
    isLoading,
    refetch,
  } = api.ai.getQuizzes.useQuery(courseId ? { courseId } : {});
  const deleteQuiz = api.ai.deleteQuiz.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleDelete = async (quizId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this quiz? This action cannot be undone.",
      )
    ) {
      await deleteQuiz.mutateAsync({ id: quizId });
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

  if (!quizzes || quizzes.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FileQuestion className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">No quizzes yet</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Generate your first quiz to test your knowledge!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {quizzes.map((quiz) => {
        const bestAttempt =
          quiz.attempts.length > 0
            ? quiz.attempts.reduce((best, attempt) =>
                attempt.score > best.score ? attempt : best,
              )
            : null;

        return (
          <Card key={quiz.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="mb-2 text-lg">{quiz.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {quiz.description || "No description"}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDelete(quiz.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline">
                  {quiz.questions.length} questions
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {bestAttempt && (
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">
                    Best Score: {bestAttempt.score}%
                  </span>
                </div>
              )}
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>
                  {quiz.attempts.length} attempt
                  {quiz.attempts.length !== 1 ? "s" : ""} •{" "}
                  {formatDistanceToNow(new Date(quiz.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => onSelectQuiz?.(quiz.id)}
                  className="flex-1"
                >
                  {quiz.attempts.length > 0 ? "Retake Quiz" : "Take Quiz"}
                </Button>
                {quiz.attempts.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => onSelectQuiz?.(quiz.id)}
                  >
                    View Results
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
