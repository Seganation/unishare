import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

/**
 * UploadThing API Route Handler
 * Handles file uploads via POST requests
 */
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
