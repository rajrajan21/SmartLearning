CREATE TABLE IF NOT EXISTS "tutor_usage" (
	"key" text NOT NULL,
	"day" integer NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "tutor_usage_key_day_pk" PRIMARY KEY("key","day")
);
