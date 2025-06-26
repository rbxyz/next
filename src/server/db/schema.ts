// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
	index,
	pgTableCreator,
	text,
	timestamp,
	varchar,
	serial,
	pgEnum,
	uuid,
	primaryKey,
	foreignKey,
	boolean,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `hub_${name}`);

// Authentication
export const user = createTable("user", {
	id: text("id").primaryKey(),
	name: varchar("name", { length: 256 }),
	email: varchar("email", { length: 256 }).notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	emailVerified: boolean("email_verified").notNull().default(false),
	createdAt: timestamp("created_at", { withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});

export const session = createTable("session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date",
	}).notNull(),
});

export const emailVerificationToken = createTable("email_verification_token", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	token: text("token").notNull().unique(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

// Workspaces
export const workspace = createTable("workspace", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: varchar("name", { length: 256 }).notNull(),
	description: text("description"),
	ownerId: text("owner_id")
		.notNull()
		.references(() => user.id),
	createdAt: timestamp("created_at", { withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});

export const workspaceUserRoleEnum = pgEnum("workspace_user_role", [
	"admin",
	"member",
]);

export const workspaceMember = createTable(
	"workspace_member",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id),
		workspaceId: uuid("workspace_id")
			.notNull()
			.references(() => workspace.id),
		role: workspaceUserRoleEnum("role").notNull().default("member"),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.workspaceId] }),
	}),
);

export const invite = createTable("invite", {
	id: uuid("id").primaryKey().defaultRandom(),
	email: varchar("email", { length: 256 }).notNull(),
	workspaceId: uuid("workspace_id")
		.notNull()
		.references(() => workspace.id),
	token: text("token").notNull().unique(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

// Notes
export const note = createTable("note", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: varchar("title", { length: 256 }).notNull(),
	content: text("content"),
	slug: text("slug").notNull().unique(),
	workspaceId: uuid("workspace_id")
		.notNull()
		.references(() => workspace.id),
	authorId: text("user_id")
		.notNull()
		.references(() => user.id),
	createdAt: timestamp("created_at", { withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});
