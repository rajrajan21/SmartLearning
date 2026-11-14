CREATE TYPE "public"."content_status" AS ENUM('draft', 'review', 'approved', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('parent', 'teacher', 'reviewer', 'admin');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "boards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"textbook_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"position" integer NOT NULL,
	"name_en" text NOT NULL,
	"name_ta" text,
	"source_ref" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"purpose" text NOT NULL,
	"text_version" text NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "curriculum_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"board_id" uuid NOT NULL,
	"academic_year" text NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "guardianships" (
	"parent_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	CONSTRAINT "guardianships_parent_id_student_id_pk" PRIMARY KEY("parent_id","student_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chapter_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"position" integer NOT NULL,
	"name_en" text NOT NULL,
	"name_ta" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "objectives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" uuid NOT NULL,
	"text_en" text NOT NULL,
	"text_ta" text,
	"competency_code" text,
	"position" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "student_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nickname" text NOT NULL,
	"class_level" integer NOT NULL,
	"board_code" text NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"pin_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name_en" text NOT NULL,
	"name_ta" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subjects_offered" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"curriculum_version_id" uuid NOT NULL,
	"class_level" integer NOT NULL,
	"subject_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "textbooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_offered_id" uuid NOT NULL,
	"title" text NOT NULL,
	"edition" text,
	"source_ref" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "topic_prerequisites" (
	"topic_id" uuid NOT NULL,
	"prerequisite_topic_id" uuid NOT NULL,
	CONSTRAINT "topic_prerequisites_topic_id_prerequisite_topic_id_pk" PRIMARY KEY("topic_id","prerequisite_topic_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "topic_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"lesson_json" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"position" integer NOT NULL,
	"name_en" text NOT NULL,
	"name_ta" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"role" "user_role" DEFAULT 'parent' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chapters" ADD CONSTRAINT "chapters_textbook_id_textbooks_id_fk" FOREIGN KEY ("textbook_id") REFERENCES "public"."textbooks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "consents" ADD CONSTRAINT "consents_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "consents" ADD CONSTRAINT "consents_student_id_student_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "curriculum_versions" ADD CONSTRAINT "curriculum_versions_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guardianships" ADD CONSTRAINT "guardianships_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guardianships" ADD CONSTRAINT "guardianships_student_id_student_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lessons" ADD CONSTRAINT "lessons_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "objectives" ADD CONSTRAINT "objectives_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subjects_offered" ADD CONSTRAINT "subjects_offered_curriculum_version_id_curriculum_versions_id_fk" FOREIGN KEY ("curriculum_version_id") REFERENCES "public"."curriculum_versions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subjects_offered" ADD CONSTRAINT "subjects_offered_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "textbooks" ADD CONSTRAINT "textbooks_subject_offered_id_subjects_offered_id_fk" FOREIGN KEY ("subject_offered_id") REFERENCES "public"."subjects_offered"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "topic_prerequisites" ADD CONSTRAINT "topic_prerequisites_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "topic_prerequisites" ADD CONSTRAINT "topic_prerequisites_prerequisite_topic_id_topics_id_fk" FOREIGN KEY ("prerequisite_topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "topic_versions" ADD CONSTRAINT "topic_versions_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "topics" ADD CONSTRAINT "topics_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "boards_code_uq" ON "boards" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "chapters_tb_slug_uq" ON "chapters" USING btree ("textbook_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "cv_board_year_uq" ON "curriculum_versions" USING btree ("board_id","academic_year");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "lessons_ch_slug_uq" ON "lessons" USING btree ("chapter_id","slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "objectives_topic_idx" ON "objectives" USING btree ("topic_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "subjects_slug_uq" ON "subjects" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "so_uq" ON "subjects_offered" USING btree ("curriculum_version_id","class_level","subject_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "textbooks_so_idx" ON "textbooks" USING btree ("subject_offered_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "tv_topic_version_uq" ON "topic_versions" USING btree ("topic_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "topics_lesson_slug_uq" ON "topics" USING btree ("lesson_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_uq" ON "users" USING btree ("email");