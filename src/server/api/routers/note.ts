import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { note, user } from "~/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export const noteRouter = createTRPCRouter({
  getByWorkspace: publicProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const notes = await ctx.db
        .select({
          id: note.id,
          title: note.title,
          content: note.content,
          slug: note.slug,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
          authorName: user.name,
        })
        .from(note)
        .leftJoin(user, eq(note.authorId, user.id))
        .where(eq(note.workspaceId, input.workspaceId))
        .orderBy(desc(note.updatedAt));

      return notes;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [noteData] = await ctx.db
        .select({
          id: note.id,
          title: note.title,
          content: note.content,
          slug: note.slug,
          workspaceId: note.workspaceId,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
          authorName: user.name,
        })
        .from(note)
        .leftJoin(user, eq(note.authorId, user.id))
        .where(eq(note.id, input.id));

      return noteData;
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        workspaceId: z.string(),
        content: z.string().optional().default(""),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate slug from title
      const slug = input.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim() + "-" + nanoid(6);

      // Create author if not logged in
      let authorId: string;
      if (ctx.user) {
        authorId = ctx.user.id;
      } else {
        authorId = nanoid();
        await ctx.db.insert(user).values({
          id: authorId,
          name: "Anonymous User",
          email: `anonymous-${authorId}@temp.local`,
          passwordHash: "N/A",
          emailVerified: false,
        });
      }

      const [newNote] = await ctx.db
        .insert(note)
        .values({
          title: input.title,
          content: input.content,
          slug,
          workspaceId: input.workspaceId,
          authorId,
        })
        .returning();

      return newNote;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1, "Title is required").optional(),
        content: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: any = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.content !== undefined) updateData.content = input.content;
      
      const [updatedNote] = await ctx.db
        .update(note)
        .set(updateData)
        .where(eq(note.id, input.id))
        .returning();

      return updatedNote;
    }),
});