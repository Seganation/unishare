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
   * - Multiple file types supported
   * - Max size: 16MB per file
   * - Requires authentication
   */
  courseResourceUploader: f({
    image: { maxFileSize: "16MB", maxFileCount: 10 },
    pdf: { maxFileSize: "16MB", maxFileCount: 10 },
    text: { maxFileSize: "16MB", maxFileCount: 10 },
    video: { maxFileSize: "64MB", maxFileCount: 5 },
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
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
