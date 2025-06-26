// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration
import { sql } from "drizzle-orm";
import { index, pgTableCreator, text, timestamp, varchar, serial, pgEnum, uuid, primaryKey, foreignKey, } from "drizzle-orm/pg-core";
/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `hub_${name}`);
// Authentication
export const users = createTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 256 }),
    email: varchar("email", { length: 256 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    emailVerified: timestamp("email_verified", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
        .default(sql `CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});
export const emailVerificationTokens = createTable("email_verification_tokens", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
export const passwordResetTokens = createTable("password_reset_tokens", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
// Workspaces
export const workspaces = createTable("workspaces", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 256 }).notNull(),
    description: text("description"),
    ownerId: uuid("owner_id")
        .notNull()
        .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
        .default(sql `CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});
export const workspaceUserRoleEnum = pgEnum("workspace_user_role", [
    "admin",
    "member",
]);
export const workspaceMembers = createTable("workspace_members", {
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id),
    workspaceId: uuid("workspace_id")
        .notNull()
        .references(() => workspaces.id),
    role: workspaceUserRoleEnum("role").notNull().default("member"),
}, (t) => ({
    pk: primaryKey({ columns: [t.userId, t.workspaceId] }),
}));
export const invites = createTable("invites", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 256 }).notNull(),
    workspaceId: uuid("workspace_id")
        .notNull()
        .references(() => workspaces.id),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
// Notes
export const notes = createTable("notes", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 256 }).notNull(),
    content: text("content"),
    slug: text("slug").notNull().unique(),
    workspaceId: uuid("workspace_id")
        .notNull()
        .references(() => workspaces.id),
    authorId: uuid("user_id")
        .notNull()
        .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
        .default(sql `CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});
