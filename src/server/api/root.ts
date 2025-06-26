import { authRouter } from "~/server/api/routers/auth";
import { noteRouter } from "~/server/api/routers/note";
import { userRouter } from "~/server/api/routers/user";
import { workspaceRouter } from "~/server/api/routers/workspace";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	auth: authRouter,
	note: noteRouter,
	user: userRouter,
	workspace: workspaceRouter,
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
