CREATE TABLE IF NOT EXISTS "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "settings_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"action" text NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"changed_by" text NOT NULL,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "settings_audit_changed_idx" ON "settings_audit" USING btree ("changed_at");