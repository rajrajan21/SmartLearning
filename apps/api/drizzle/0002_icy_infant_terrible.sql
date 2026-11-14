CREATE TABLE IF NOT EXISTS "question_attempts" (
	"attempt_id" uuid PRIMARY KEY NOT NULL,
	"question_id" uuid NOT NULL,
	"question_version" integer NOT NULL,
	"anon_id" uuid NOT NULL,
	"response_json" text NOT NULL,
	"correct" boolean NOT NULL,
	"hints_used" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" uuid NOT NULL,
	"key" text NOT NULL,
	"type" text NOT NULL,
	"round" integer NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"body_json" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_attempts" ADD CONSTRAINT "question_attempts_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "questions" ADD CONSTRAINT "questions_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qa_question_idx" ON "question_attempts" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qa_anon_idx" ON "question_attempts" USING btree ("anon_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "questions_topic_key_uq" ON "questions" USING btree ("topic_id","key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "questions_topic_idx" ON "questions" USING btree ("topic_id");