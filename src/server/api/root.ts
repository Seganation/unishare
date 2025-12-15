import { userRouter } from "~/server/api/routers/user";
import { adminRouter } from "~/server/api/routers/admin";
import { courseRouter } from "~/server/api/routers/course";
import { resourceRouter } from "~/server/api/routers/resource";
import { articleRouter } from "~/server/api/routers/article";
import { timetableRouter } from "~/server/api/routers/timetable";
import { aiRouter } from "~/server/api/routers/ai";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  admin: adminRouter,
  course: courseRouter,
  resource: resourceRouter,
  article: articleRouter,
  timetable: timetableRouter,
  ai: aiRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
