import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "~/server/auth";

const f = createUploadthing();

/**
 * UploadThing File Router
 * Defines different upload endpoints with their validation rules
 */
export const ourFileRouter = {
  /**
   * Student ID Upload
   * Used during registration for identity verification
   * - Images only (png, jpg, jpeg, webp)
   * - Max size: 4MB
   * - Public access required for admin review
   */
  studentIdUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    // No auth required since this is used during registration
    .middleware(async () => {
      // Return empty metadata for public uploads
      return { userId: "registration" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Student ID upload complete");
      console.log("File URL:", file.url);

      return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),

  /**
   * Course Resource Uploader
   * For assignments, content, and other course materials
   * - Multiple file types supported: Images, PDFs, Office docs (Word, Excel, PowerPoint), ZIP
   * - Max size: 16MB per file (64MB for videos)
   * - Requires authentication
   */
  courseResourceUploader: f({
    image: { maxFileSize: "16MB", maxFileCount: 10 },
    pdf: { maxFileSize: "16MB", maxFileCount: 10 },
    text: { maxFileSize: "16MB", maxFileCount: 10 },
    video: { maxFileSize: "64MB", maxFileCount: 5 },
    // Word documents (.doc, .docx)
    "application/msword": { maxFileSize: "16MB", maxFileCount: 10 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      { maxFileSize: "16MB", maxFileCount: 10 },
    // Excel spreadsheets (.xls, .xlsx)
    "application/vnd.ms-excel": { maxFileSize: "16MB", maxFileCount: 10 },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      maxFileSize: "16MB",
      maxFileCount: 10,
    },
    // PowerPoint presentations (.ppt, .pptx)
    "application/vnd.ms-powerpoint": { maxFileSize: "16MB", maxFileCount: 10 },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      { maxFileSize: "16MB", maxFileCount: 10 },
    // ZIP files
    "application/zip": { maxFileSize: "32MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user) {
        throw new UploadThingError("Unauthorized");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Course resource upload complete");
      console.log("File URL:", file.url);
      console.log("Uploaded by:", metadata.userId);

      return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),

  /**
   * Article Cover Image Uploader
   * For article cover images
   * - Images only
   * - Max size: 4MB
   * - Requires authentication
   */
  articleCoverUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user) {
        throw new UploadThingError("Unauthorized");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Article cover upload complete");
      console.log("File URL:", file.url);

      return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),

  /**
   * Profile Image Uploader
   * For user profile images
   * - Images only
   * - Max size: 4MB
   * - Requires authentication
   */
  profileUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user) {
        throw new UploadThingError("Unauthorized");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Profile image upload complete");
      console.log("File URL:", file.url);

      return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
