"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import {
  Upload,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  CloudUpload,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { toast } from "sonner";

interface FileUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: (urls: string[]) => void;
  resourceId: string;
  resourceTitle: string;
}

interface UploadFile {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  url?: string;
  error?: string;
}

export function FileUploadModal({
  open,
  onOpenChange,
  onUploadComplete,
  resourceId,
  resourceTitle,
}: FileUploadModalProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      file,
      status: "pending",
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    setIsUploading(true);

    // Simulate upload for each file
    for (let i = 0; i < files.length; i++) {
      if (files[i]?.status !== "pending") continue;

      // Update status to uploading
      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: "uploading" as const } : f,
        ),
      );

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, progress } : f)),
        );
      }

      // Mark as success (in real implementation, this would use UploadThing)
      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i
            ? {
                ...f,
                status: "success" as const,
                progress: 100,
                url: `https://utfs.io/f/example-${Date.now()}.pdf`,
              }
            : f,
        ),
      );
    }

    setIsUploading(false);
    toast.success("All files uploaded successfully!");

    // Get all successful URLs
    const successUrls = files
      .filter((f) => f.status === "success" && f.url)
      .map((f) => f.url!);

    if (onUploadComplete && successUrls.length > 0) {
      onUploadComplete(successUrls);
    }

    // Close modal after a short delay
    setTimeout(() => {
      onOpenChange(false);
      setFiles([]);
    }, 1500);
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const uploadingCount = files.filter((f) => f.status === "uploading").length;
  const successCount = files.filter((f) => f.status === "success").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 animate-pulse text-purple-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
              File Upload
            </span>
          </div>
          <DialogTitle className="text-2xl font-black">
            Upload Files
          </DialogTitle>
          <DialogDescription>
            Upload files to <span className="font-semibold">{resourceTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              "group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300",
              isDragActive
                ? "border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 scale-105"
                : "border-gray-300 bg-gradient-to-br from-gray-50 to-white hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50 hover:to-indigo-50",
              isUploading && "pointer-events-none opacity-50",
            )}
          >
            <input {...getInputProps()} />

            {/* Animated background circles */}
            <div className="absolute inset-0 overflow-hidden opacity-0 transition-opacity group-hover:opacity-100">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-200/30 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-indigo-200/30 blur-2xl" />
            </div>

            <div className="relative">
              {/* Icon */}
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                <CloudUpload
                  className={cn(
                    "h-10 w-10 text-purple-600 transition-all duration-300",
                    isDragActive && "animate-bounce",
                  )}
                />
              </div>

              {/* Text */}
              {isDragActive ? (
                <p className="text-lg font-bold text-purple-600">
                  Drop files here to upload
                </p>
              ) : (
                <>
                  <p className="mb-2 text-lg font-bold text-gray-900">
                    Drag & drop files here
                  </p>
                  <p className="mb-4 text-sm text-gray-600">
                    or click to browse from your computer
                  </p>
                  <div className="mx-auto max-w-xs text-xs text-gray-500">
                    Supports: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, Images
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Files List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  Files ({files.length})
                </h3>
                {successCount > 0 && (
                  <span className="text-xs font-medium text-green-600">
                    {successCount} uploaded successfully
                  </span>
                )}
              </div>

              <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border-2 border-gray-200 bg-gray-50 p-3">
                {files.map((uploadFile, index) => (
                  <div
                    key={index}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border-2 bg-white p-4 transition-all",
                      uploadFile.status === "success"
                        ? "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50"
                        : uploadFile.status === "error"
                          ? "border-red-200 bg-gradient-to-r from-red-50 to-orange-50"
                          : "border-gray-200",
                    )}
                  >
                    {/* Shimmer effect */}
                    {uploadFile.status === "uploading" && (
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-purple-100 to-transparent transition-transform duration-1000 animate-shimmer" />
                    )}

                    <div className="relative flex items-start gap-3">
                      {/* File icon */}
                      <div
                        className={cn(
                          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-all",
                          uploadFile.status === "success"
                            ? "bg-green-100"
                            : uploadFile.status === "error"
                              ? "bg-red-100"
                              : "bg-purple-100",
                        )}
                      >
                        {uploadFile.status === "success" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : uploadFile.status === "error" ? (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <File
                            className={cn(
                              "h-5 w-5",
                              uploadFile.status === "uploading"
                                ? "text-purple-600 animate-pulse"
                                : "text-gray-600",
                            )}
                          />
                        )}
                      </div>

                      {/* File info */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {uploadFile.file.name}
                          </p>
                          {uploadFile.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-red-100"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                        <p className="mb-2 text-xs text-gray-500">
                          {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>

                        {/* Progress bar */}
                        {(uploadFile.status === "uploading" ||
                          uploadFile.status === "success") && (
                          <div className="space-y-1">
                            <Progress
                              value={uploadFile.progress}
                              className="h-2"
                            />
                            <p className="text-xs font-medium text-purple-600">
                              {uploadFile.progress}%
                            </p>
                          </div>
                        )}

                        {uploadFile.status === "error" && (
                          <p className="text-xs text-red-600">
                            {uploadFile.error ?? "Upload failed"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t-2 border-gray-200 pt-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={uploadFiles}
              disabled={files.length === 0 || isUploading || pendingCount === 0}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {isUploading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Uploading {uploadingCount} of {files.length}...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload {pendingCount} File{pendingCount !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
