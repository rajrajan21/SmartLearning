ALTER TABLE "sessions" ADD COLUMN "child" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "extra_classes" text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "secret_question" text;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "secret_answer_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "father_email" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mother_email" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mobile" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "provider" text DEFAULT 'email' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "provider_id" text;