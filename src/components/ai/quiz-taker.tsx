"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { CheckCircle2, Circle, ArrowLeft } from "lucide-react";

interface QuizTakerProps {
  quizId: string;
  onBack?: () => void;
  onComplete?: (attemptId: string) => void;
}

export function QuizTaker({ quizId, onBack, onComplete }: QuizTakerProps) {
  const { data: quiz, isLoading } = api.ai.getQuiz.useQuery({ id: quizId });
  const submitAttempt = api.ai.submitQuizAttempt.useMutation();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!quiz) return;

    setIsSubmitting(true);
    try {
      const answersArray = quiz.questions.map((q) => ({
        questionId: q.id,
        userAnswer: answers[q.id] || "",
      }));

      const attempt = await submitAttempt.mutateAsync({
        quizId,
        answers: answersArray,
      });

      onComplete?.(attempt.id);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      alert("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !quiz) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="animate-pulse space-y-4">
            <div className="bg-muted h-8 w-3/4 rounded" />
            <div className="bg-muted h-4 w-1/2 rounded" />
            <div className="mt-6 space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-muted h-12 rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / quiz.questions.length) * 100;
  const allAnswered = answeredCount === quiz.questions.length;

  if (!currentQuestion) {
    return null;
  }

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
              {answeredCount} of {quiz.questions.length} answered
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{quiz.questions.length} questions</Badge>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-muted-foreground text-right text-xs">
          {Math.round(progress)}% complete
        </p>
      </div>

      {/* Question Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {quiz.questions.map((q, index) => (
          <Button
            key={q.id}
            variant={currentQuestionIndex === index ? "default" : "outline"}
            size="icon"
            onClick={() => setCurrentQuestionIndex(index)}
            className="shrink-0"
          >
            {answers[q.id] ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <span>{index + 1}</span>
            )}
          </Button>
        ))}
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-lg">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </CardTitle>
            <Badge variant="outline">
              {currentQuestion.type.replace("_", " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-base font-medium">{currentQuestion.question}</p>

          {/* Multiple Choice */}
          {currentQuestion.type === "MULTIPLE_CHOICE" &&
            currentQuestion.options && (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) =>
                  setAnswers({ ...answers, [currentQuestion.id]: value })
                }
              >
                <div className="space-y-3">
                  {(Array.isArray(currentQuestion.options)
                    ? (currentQuestion.options as string[])
                    : []
                  ).map((option: string, index: number) => (
                    <div
                      key={index}
                      className="hover:bg-accent/50 flex cursor-pointer items-center space-x-3 rounded-lg border p-4 transition-colors"
                      onClick={() =>
                        setAnswers({ ...answers, [currentQuestion.id]: option })
                      }
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label
                        htmlFor={`option-${index}`}
                        className="flex-1 cursor-pointer font-normal"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

          {/* True/False */}
          {currentQuestion.type === "TRUE_FALSE" && (
            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onValueChange={(value) =>
                setAnswers({ ...answers, [currentQuestion.id]: value })
              }
            >
              <div className="space-y-3">
                {["True", "False"].map((option) => (
                  <div
                    key={option}
                    className="hover:bg-accent/50 flex cursor-pointer items-center space-x-3 rounded-lg border p-4 transition-colors"
                    onClick={() =>
                      setAnswers({ ...answers, [currentQuestion.id]: option })
                    }
                  >
                    <RadioGroupItem value={option} id={`tf-${option}`} />
                    <Label
                      htmlFor={`tf-${option}`}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {/* Short Answer */}
          {currentQuestion.type === "SHORT_ANSWER" && (
            <div className="space-y-2">
              <Label htmlFor="answer">Your Answer</Label>
              <Input
                id="answer"
                placeholder="Type your answer here..."
                value={answers[currentQuestion.id] || ""}
                onChange={(e) =>
                  setAnswers({
                    ...answers,
                    [currentQuestion.id]: e.target.value,
                  })
                }
                className="text-base"
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() =>
                setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
              }
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <Button
                onClick={() =>
                  setCurrentQuestionIndex(
                    Math.min(
                      quiz.questions.length - 1,
                      currentQuestionIndex + 1,
                    ),
                  )
                }
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered || isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            )}
          </div>

          {!allAnswered &&
            currentQuestionIndex === quiz.questions.length - 1 && (
              <p className="text-muted-foreground text-center text-sm">
                Please answer all questions before submitting
              </p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
