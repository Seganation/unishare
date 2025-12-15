"use client";

import { api } from "~/trpc/react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Trophy,
  Target,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface QuizResultsProps {
  quizId: string;
  attemptId: string;
  onBack?: () => void;
  onRetake?: () => void;
}

export function QuizResults({
  quizId,
  attemptId,
  onBack,
  onRetake,
}: QuizResultsProps) {
  const { data: quiz, isLoading } = api.ai.getQuiz.useQuery({ id: quizId });

  // Find the attempt from the quiz data
  const attempt = quiz?.attempts.find((a) => a.id === attemptId);

  if (isLoading || !quiz || !attempt) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="animate-pulse space-y-4">
            <div className="bg-muted h-20 w-full rounded" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-muted h-32 rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const correctCount = attempt.answers.filter((a) => a.isCorrect).length;
  const totalCount = quiz.questions.length;
  const score = attempt.score;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "Excellent! 🎉";
    if (score >= 80) return "Great job! 👏";
    if (score >= 70) return "Good work! 👍";
    if (score >= 60) return "Not bad! 📚";
    return "Keep studying! 💪";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <h2 className="text-2xl font-bold">{quiz.title} - Results</h2>
        <div className="flex gap-2">
          {onRetake && (
            <Button onClick={onRetake} variant="outline">
              Retake Quiz
            </Button>
          )}
        </div>
      </div>

      {/* Score Card */}
      <Card className="border-2">
        <CardContent className="py-8">
          <div className="space-y-4 text-center">
            <Trophy className={`mx-auto h-16 w-16 ${getScoreColor(score)}`} />
            <div>
              <p className="mb-2 text-5xl font-bold">
                <span className={getScoreColor(score)}>{score}%</span>
              </p>
              <p className="text-muted-foreground text-2xl font-semibold">
                {getScoreMessage(score)}
              </p>
            </div>
            <div className="flex items-center justify-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-muted-foreground mb-1 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">Score</span>
                </div>
                <p className="text-2xl font-bold">
                  {correctCount}/{totalCount}
                </p>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground mb-1 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Completed</span>
                </div>
                <p className="text-sm font-medium">
                  {formatDistanceToNow(new Date(attempt.startedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Detailed Results</h3>
        {quiz.questions.map((question, index) => {
          const answer = attempt.answers.find(
            (a) => a.questionId === question.id,
          );
          const isCorrect = answer?.isCorrect || false;

          return (
            <Card
              key={question.id}
              className={`border-2 ${
                isCorrect
                  ? "border-green-500/20 bg-green-500/5"
                  : "border-red-500/20 bg-red-500/5"
              }`}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  {isCorrect ? (
                    <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="mt-1 h-6 w-6 shrink-0 text-red-600 dark:text-red-400" />
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">
                        Question {index + 1}
                      </CardTitle>
                      <Badge
                        variant={isCorrect ? "default" : "destructive"}
                        className="ml-auto"
                      >
                        {isCorrect ? "Correct" : "Incorrect"}
                      </Badge>
                    </div>
                    <p className="font-medium">{question.question}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Your Answer */}
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm font-medium">
                    Your Answer:
                  </p>
                  <p
                    className={`font-medium ${
                      isCorrect
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {answer?.userAnswer || "(No answer provided)"}
                  </p>
                </div>

                {/* Correct Answer (if wrong) */}
                {!isCorrect && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm font-medium">
                      Correct Answer:
                    </p>
                    <p className="font-medium text-green-600 dark:text-green-400">
                      {question.correctAnswer}
                    </p>
                  </div>
                )}

                {/* Explanation */}
                {question.explanation && (
                  <div className="space-y-1 border-t pt-2">
                    <p className="text-muted-foreground text-sm font-medium">
                      Explanation:
                    </p>
                    <p className="text-sm">{question.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-center gap-4 pt-4">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back to Quizzes
          </Button>
        )}
        {onRetake && <Button onClick={onRetake}>Retake Quiz</Button>}
      </div>
    </div>
  );
}
