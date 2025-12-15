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
import { Textarea } from "~/components/ui/textarea";
import { Slider } from "~/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Loader2, Sparkles, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

interface StudyPlanGeneratorFormProps {
  courseId?: string;
  onSuccess?: (planId: string) => void;
  onCancel?: () => void;
}

export function StudyPlanGeneratorForm({
  courseId,
  onSuccess,
  onCancel,
}: StudyPlanGeneratorFormProps) {
  const [weekCount, setWeekCount] = useState(4);
  const [hoursPerWeek, setHoursPerWeek] = useState(5);
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [selectedCourseId, setSelectedCourseId] = useState(courseId || "");

  const { data: courses } = api.course.getUserCourses.useQuery();
  const generatePlan = api.ai.generateStudyPlan.useMutation({
    onSuccess: (data) => {
      toast.success("Study plan generated successfully!");
      onSuccess?.(data.id);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate study plan");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourseId) {
      toast.error("Please select a course");
      return;
    }

    const selectedCourse = courses?.find((c) => c.id === selectedCourseId);

    await generatePlan.mutateAsync({
      courseId: selectedCourseId,
      weekCount,
      hoursPerWeek,
      goal: goal.trim() || undefined,
      deadline: deadline,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary h-5 w-5" />
          <CardTitle>Generate Study Plan</CardTitle>
        </div>
        <CardDescription>
          Create a personalized study plan with weekly goals and tasks. The AI
          will organize your learning schedule based on your preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Selection */}
          {!courseId && (
            <div className="space-y-2">
              <Label htmlFor="course">
                Course <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
                disabled={generatePlan.isPending}
              >
                <SelectTrigger id="course">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Week Count */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="weekCount">Number of Weeks</Label>
              <span className="text-sm font-medium">{weekCount}</span>
            </div>
            <Slider
              id="weekCount"
              min={1}
              max={16}
              step={1}
              value={[weekCount]}
              onValueChange={(value) => setWeekCount(value[0]!)}
              disabled={generatePlan.isPending}
            />
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>1 week</span>
              <span>16 weeks</span>
            </div>
          </div>

          {/* Hours Per Week */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="hoursPerWeek">Hours Per Week</Label>
              <span className="text-sm font-medium">{hoursPerWeek}h</span>
            </div>
            <Slider
              id="hoursPerWeek"
              min={1}
              max={40}
              step={1}
              value={[hoursPerWeek]}
              onValueChange={(value) => setHoursPerWeek(value[0]!)}
              disabled={generatePlan.isPending}
            />
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>1 hour</span>
              <span>40 hours</span>
            </div>
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <Label htmlFor="goal">Learning Goal (Optional)</Label>
            <Input
              id="goal"
              placeholder="e.g., Prepare for final exam, Master advanced concepts"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={generatePlan.isPending}
            />
            <p className="text-muted-foreground text-xs">
              What do you want to achieve with this study plan?
            </p>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline">Target Deadline (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="deadline"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deadline && "text-muted-foreground",
                  )}
                  disabled={generatePlan.isPending}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
            <p className="text-muted-foreground text-xs">
              When do you need to complete this study plan?
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={generatePlan.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={generatePlan.isPending || !selectedCourseId}
              className="flex-1"
            >
              {generatePlan.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Plan
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
