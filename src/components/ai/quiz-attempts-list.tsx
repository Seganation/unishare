"use client";

import { api } from "~/trpc/react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Trophy,
  Calendar,
  Eye,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Award,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface QuizAttemptsListProps {
  quizId: string;
  onBack?: () => void;
  onViewAttempt?: (attemptId: string) => void;
  onRetake?: () => void;
}

export function QuizAttemptsList({
  quizId,
  onBack,
  onViewAttempt,
  onRetake,
}: QuizAttemptsListProps) {
  const { data: quiz, isLoading } = api.ai.getQuiz.useQuery({ id: quizId });

  if (isLoading || !quiz) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="animate-pulse space-y-4">
            <div className="bg-muted h-8 w-3/4 rounded" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-muted h-24 rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const attempts = quiz.attempts || [];
  const bestAttempt =
    attempts.length > 0
      ? attempts.reduce((best, attempt) =>
          attempt.score > best.score ? attempt : best,
        )
      : null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800";
    if (score >= 60) return "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800";
    return "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800";
  };

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
            <h2 className="text-2xl font-bold">{quiz.title}</h2>
            <p className="text-muted-foreground text-sm">
              View all your quiz attempts
            </p>
          </div>
        </div>
        {onRetake && (
          <Button onClick={onRetake}>
            Retake Quiz
          </Button>
        )}
      </div>

      {/* Stats Summary */}
      {bestAttempt && (
        <Card className="border-2">
          <CardContent className="py-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="text-center">
                <Trophy className="mx-auto mb-2 h-8 w-8 text-yellow-500" />
                <p className="text-muted-foreground mb-1 text-sm">Best Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(bestAttempt.score)}`}>
                  {bestAttempt.score}%
                </p>
              </div>
              <div className="text-center">
                <Award className="text-primary mx-auto mb-2 h-8 w-8" />
                <p className="text-muted-foreground mb-1 text-sm">Total Attempts</p>
                <p className="text-foreground text-2xl font-bold">
                  {attempts.length}
                </p>
              </div>
              <div className="text-center">
                <Calendar className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                <p className="text-muted-foreground mb-1 text-sm">Latest Attempt</p>
                <p className="text-foreground text-sm font-medium">
                  {formatDistanceToNow(new Date(attempts[0]!.startedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attempts List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">All Attempts</h3>
        {attempts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <XCircle className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">No attempts yet</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Take the quiz to see your results here!
              </p>
              {onRetake && (
                <Button onClick={onRetake}>
                  Take Quiz
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {attempts.map((attempt, index) => {
              const correctCount = attempt.answers.filter((a) => a.isCorrect).length;
              const totalCount = quiz.questions.length;
              const isBest = bestAttempt?.id === attempt.id;

              return (
                <Card
                  key={attempt.id}
                  className={`border-2 transition-shadow hover:shadow-md ${getScoreBgColor(attempt.score)}`}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-1 items-center gap-4">
                        {/* Attempt Number */}
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/50 dark:bg-gray-900/50">
                          <span className="text-lg font-bold">
                            #{attempts.length - index}
                          </span>
                        </div>

                        {/* Score and Details */}
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <p className={`text-2xl font-bold ${getScoreColor(attempt.score)}`}>
                              {attempt.score}%
                            </p>
                            {isBest && (
                              <Badge className="bg-yellow-500 text-white">
                                <Trophy className="mr-1 h-3 w-3" />
                                Best
                              </Badge>
                            )}
                          </div>
                          <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                              {correctCount}/{totalCount} correct
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDistanceToNow(new Date(attempt.startedAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* View Button */}
                      <Button
                        variant="outline"
                        onClick={() => onViewAttempt?.(attempt.id)}
                        className="flex-shrink-0"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-center gap-4 pt-4">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back to Quizzes
          </Button>
        )}
      </div>
    </div>
  );
}
