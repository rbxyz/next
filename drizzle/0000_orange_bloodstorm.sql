CREATE TYPE "public"."workspace_user_role" AS ENUM('admin', 'member');--> statement-breakpoint
CREATE TABLE "hub_email_verification_token" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "hub_email_verification_token_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "hub_invite" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(256) NOT NULL,
	"workspace_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "hub_invite_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "hub_note" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(256) NOT NULL,
	"content" text,
	"slug" text NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "hub_note_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "hub_session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hub_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"email" varchar(256) NOT NULL,
	"password_hash" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "hub_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "hub_workspace" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"owner_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "hub_workspace_member" (
	"user_id" text NOT NULL,
	"workspace_id" uuid NOT NULL,
	"role" "workspace_user_role" DEFAULT 'member' NOT NULL,
	CONSTRAINT "hub_workspace_member_user_id_workspace_id_pk" PRIMARY KEY("user_id","workspace_id")
);
--> statement-breakpoint
ALTER TABLE "hub_email_verification_token" ADD CONSTRAINT "hub_email_verification_token_user_id_hub_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."hub_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hub_invite" ADD CONSTRAINT "hub_invite_workspace_id_hub_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."hub_workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hub_note" ADD CONSTRAINT "hub_note_workspace_id_hub_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."hub_workspace"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hub_note" ADD CONSTRAINT "hub_note_user_id_hub_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."hub_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hub_session" ADD CONSTRAINT "hub_session_user_id_hub_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."hub_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hub_workspace" ADD CONSTRAINT "hub_workspace_owner_id_hub_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."hub_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hub_workspace_member" ADD CONSTRAINT "hub_workspace_member_user_id_hub_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."hub_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hub_workspace_member" ADD CONSTRAINT "hub_workspace_member_workspace_id_hub_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."hub_workspace"("id") ON DELETE no action ON UPDATE no action;