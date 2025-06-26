import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { cookies } from "next/headers";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { user } from "~/server/db/schema";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { lucia } from "~/lib/auth";

export const authRouter = createTRPCRouter({
  signIn: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const existingUser = await db.query.user.findFirst({
        where: eq(user.email, input.email),
      });

      if (!existingUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        });
      }

      const isPasswordValid = await bcrypt.compare(
        input.password,
        existingUser.passwordHash,
      );

      if (!isPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        });
      }

      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      const cookieStore = await cookies();
      cookieStore.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );

      return { success: true };
    }),
});