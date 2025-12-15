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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface QuizGeneratorFormProps {
  courseId?: string;
  noteId?: string;
  onSuccess?: (quizId: string) => void;
  onCancel?: () => void;
}

export function QuizGeneratorForm({
  courseId,
  noteId,
  onSuccess,
  onCancel,
}: QuizGeneratorFormProps) {
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );
  const [includeMultipleChoice, setIncludeMultipleChoice] = useState(true);
  const [includeTrueFalse, setIncludeTrueFalse] = useState(true);
  const [includeShortAnswer, setIncludeShortAnswer] = useState(false);

  const generateQuiz = api.ai.generateQuiz.useMutation({
    onSuccess: (data) => {
      toast.success("Quiz generated successfully!");
      onSuccess?.(data.id);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate quiz");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    if (!includeMultipleChoice && !includeTrueFalse && !includeShortAnswer) {
      toast.error("Please select at least one question type");
      return;
    }

    const questionTypes: ("MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER")[] =
      [];
    if (includeMultipleChoice) questionTypes.push("MULTIPLE_CHOICE");
    if (includeTrueFalse) questionTypes.push("TRUE_FALSE");
    if (includeShortAnswer) questionTypes.push("SHORT_ANSWER");

    await generateQuiz.mutateAsync({
      topic: topic.trim(),
      courseId,
      noteId,
      questionCount,
      difficulty,
      questionTypes,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary h-5 w-5" />
          <CardTitle>Generate Quiz</CardTitle>
        </div>
        <CardDescription>
          Create a custom quiz on any topic. The AI will generate questions
          based on your preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic">
              Topic <span className="text-destructive">*</span>
            </Label>
            <Input
              id="topic"
              placeholder="e.g., Database Normalization, Python Functions, World War II"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={generateQuiz.isPending}
            />
            <p className="text-muted-foreground text-xs">
              Be specific for better results
            </p>
          </div>

          {/* Question Count */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="questionCount">Number of Questions</Label>
              <span className="text-sm font-medium">{questionCount}</span>
            </div>
            <Slider
              id="questionCount"
              min={5}
              max={50}
              step={5}
              value={[questionCount]}
              onValueChange={(value) => setQuestionCount(value[0]!)}
              disabled={generateQuiz.isPending}
            />
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>5 questions</span>
              <span>50 questions</span>
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select
              value={difficulty}
              onValueChange={(value: "easy" | "medium" | "hard") =>
                setDifficulty(value)
              }
              disabled={generateQuiz.isPending}
            >
              <SelectTrigger id="difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Question Types */}
          <div className="space-y-3">
            <Label>Question Types</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="multipleChoice"
                  checked={includeMultipleChoice}
                  onCheckedChange={(checked) =>
                    setIncludeMultipleChoice(!!checked)
                  }
                  disabled={generateQuiz.isPending}
                />
                <Label
                  htmlFor="multipleChoice"
                  className="cursor-pointer font-normal"
                >
                  Multiple Choice
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trueFalse"
                  checked={includeTrueFalse}
                  onCheckedChange={(checked) => setIncludeTrueFalse(!!checked)}
                  disabled={generateQuiz.isPending}
                />
                <Label
                  htmlFor="trueFalse"
                  className="cursor-pointer font-normal"
                >
                  True/False
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shortAnswer"
                  checked={includeShortAnswer}
                  onCheckedChange={(checked) =>
                    setIncludeShortAnswer(!!checked)
                  }
                  disabled={generateQuiz.isPending}
                />
                <Label
                  htmlFor="shortAnswer"
                  className="cursor-pointer font-normal"
                >
                  Short Answer
                </Label>
              </div>
            </div>
            <p className="text-muted-foreground text-xs">
              Select at least one question type
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={generateQuiz.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={generateQuiz.isPending}
              className="flex-1"
            >
              {generateQuiz.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Quiz
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
