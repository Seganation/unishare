"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { CalendarIcon, Upload } from "lucide-react";
import { format } from "date-fns";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { toast } from "sonner";

interface ResourceFormProps {
  courseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ResourceForm({
  courseId,
  open,
  onOpenChange,
  onSuccess,
}: ResourceFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [allowFiles, setAllowFiles] = useState(true);
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);

  const utils = api.useUtils();

  const createResource = api.resource.create.useMutation({
    onSuccess: () => {
      toast.success("Resource created successfully!");
      void utils.course.getById.invalidate({ id: courseId });
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to create resource");
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAllowFiles(true);
    setHasDeadline(false);
    setDeadline(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    createResource.mutate({
      courseId,
      title: title.trim(),
      type: "CUSTOM",
      description: description.trim() || undefined,
      allowFiles,
      deadline: hasDeadline && deadline ? deadline : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Custom Resource</DialogTitle>
          <DialogDescription>
            Add a custom resource card to organize course materials and
            assignments.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Midterm Exam Study Guide"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide additional details about this resource..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Allow Files Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="allowFiles" className="text-base font-medium">
                Allow File Uploads
              </Label>
              <p className="text-sm text-gray-500">
                Contributors can attach files to this resource
              </p>
            </div>
            <Switch
              id="allowFiles"
              checked={allowFiles}
              onCheckedChange={setAllowFiles}
            />
          </div>

          {/* Deadline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="hasDeadline" className="text-base font-medium">
                Set a Deadline
              </Label>
              <Switch
                id="hasDeadline"
                checked={hasDeadline}
                onCheckedChange={setHasDeadline}
              />
            </div>

            {hasDeadline && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deadline && "text-gray-500",
                    )}
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
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={createResource.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createResource.isPending}>
              {createResource.isPending ? (
                <>Creating...</>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Create Resource
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
