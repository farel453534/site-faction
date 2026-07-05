CREATE TABLE "admins" (
	"discord_id" text PRIMARY KEY NOT NULL,
	"label" text,
	"added_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blacklists" (
	"id" serial PRIMARY KEY NOT NULL,
	"faction" text NOT NULL,
	"discord_id" text NOT NULL,
	"player_name" text NOT NULL,
	"reason" text,
	"added_by" text NOT NULL,
	"added_by_username" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_groups" (
	"group_slug" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_home_cards" (
	"card_key" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"keywords" text NOT NULL,
	"markdown" text NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_pages" (
	"group_slug" text NOT NULL,
	"page_slug" text NOT NULL,
	"title" text NOT NULL,
	"markdown" text NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_pages_group_slug_page_slug_pk" PRIMARY KEY("group_slug","page_slug")
);
--> statement-breakpoint
CREATE TABLE "content_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"author_id" text NOT NULL,
	"author_username" text NOT NULL,
	"is_staff" boolean DEFAULT false NOT NULL,
	"body" text NOT NULL,
	"attachments" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"discord_id" text NOT NULL,
	"label" text,
	"added_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"faction" text NOT NULL,
	"category" text NOT NULL,
	"subject" text NOT NULL,
	"author_id" text NOT NULL,
	"author_username" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"claimed_by" text,
	"claimed_by_username" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"discord_id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"global_name" text,
	"avatar" text,
	"faction" text,
	"steam_id" text,
	"last_ip" text,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_participants" ADD CONSTRAINT "ticket_participants_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ticket_participant_unique" ON "ticket_participants" USING btree ("ticket_id","discord_id");