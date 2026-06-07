-- Creates the live_posts table for the /live page.
-- Idempotent + non-destructive: safe to run on prod via the Neon SQL editor
-- (Vercel → Storage → Neon → SQL Editor). Does NOT touch existing tables.
-- This is the manual equivalent of `pnpm db:push` for the live_posts change,
-- for when DATABASE_URL isn't available locally.

CREATE TABLE IF NOT EXISTS "live_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text DEFAULT 'interim_summary' NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"published_at" timestamp DEFAULT now() NOT NULL,
	"as_of" timestamp,
	"counters" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "live_posts_feed_idx"
	ON "live_posts" USING btree ("pinned", "published_at");
