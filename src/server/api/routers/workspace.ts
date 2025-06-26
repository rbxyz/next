import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { workspace, workspaceMember, user } from "~/server/db/schema";
import { nanoid } from "nanoid";
import { eq, desc } from "drizzle-orm";

export const workspaceRouter = createTRPCRouter({
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      const workspaces = await ctx.db
        .select({
          id: workspace.id,
          name: workspace.name,
          description: workspace.description,
          createdAt: workspace.createdAt,
          ownerName: user.name,
        })
        .from(workspace)
        .leftJoin(user, eq(workspace.ownerId, user.id))
        .orderBy(desc(workspace.createdAt));

      return workspaces;
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(3, "Name must be at least 3 characters"),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Use logged in user if available, otherwise create anonymous user
      let ownerId: string;
      
      if (ctx.user) {
        ownerId = ctx.user.id;
      } else {
        // Create anonymous user for workspace creation
        ownerId = nanoid();
        await ctx.db.insert(user).values({
          id: ownerId,
          name: "Anonymous User",
          email: `anonymous-${ownerId}@temp.local`,
          passwordHash: "N/A", // No password for anonymous users
          emailVerified: false,
        });
      }
      
      const [newWorkspace] = await ctx.db
        .insert(workspace)
        .values({
          name: input.name,
          description: input.description,
          ownerId,
        })
        .returning();

      if (newWorkspace) {
        await ctx.db.insert(workspaceMember).values({
          workspaceId: newWorkspace.id,
          userId: ownerId,
          role: "admin",
        });
      }

      return newWorkspace;
    }),
});