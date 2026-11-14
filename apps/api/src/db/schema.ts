import {
  index, integer, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid, boolean,
} from "drizzle-orm/pg-core";

const id = () => uuid("id").primaryKey().defaultRandom();
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const contentStatus = pgEnum("content_status", ["draft", "review", "approved", "published", "archived"]);
export const userRole = pgEnum("user_role", ["parent", "teacher", "reviewer", "admin"]);

// ---------- Curriculum ----------
export const boards = pgTable("boards", {
  id: id(),
  code: text("code").notNull(), // CBSE, TNSB, MATRIC
  name: text("name").notNull(),
  ...timestamps,
}, (t) => [uniqueIndex("boards_code_uq").on(t.code)]);

export const curriculumVersions = pgTable("curriculum_versions", {
  id: id(),
  boardId: uuid("board_id").notNull().references(() => boards.id),
  academicYear: text("academic_year").notNull(), // 2026-27
  isCurrent: boolean("is_current").notNull().default(false),
  ...timestamps,
}, (t) => [uniqueIndex("cv_board_year_uq").on(t.boardId, t.academicYear)]);

export const subjects = pgTable("subjects", {
  id: id(),
  slug: text("slug").notNull(),
  nameEn: text("name_en").notNull(),
  nameTa: text("name_ta"),
  ...timestamps,
}, (t) => [uniqueIndex("subjects_slug_uq").on(t.slug)]);

export const subjectsOffered = pgTable("subjects_offered", {
  id: id(),
  curriculumVersionId: uuid("curriculum_version_id").notNull().references(() => curriculumVersions.id),
  classLevel: integer("class_level").notNull(),
  subjectId: uuid("subject_id").notNull().references(() => subjects.id),
  ...timestamps,
}, (t) => [uniqueIndex("so_uq").on(t.curriculumVersionId, t.classLevel, t.subjectId)]);

export const textbooks = pgTable("textbooks", {
  id: id(),
  subjectOfferedId: uuid("subject_offered_id").notNull().references(() => subjectsOffered.id),
  title: text("title").notNull(),
  edition: text("edition"),
  sourceRef: text("source_ref"), // reference only; no copied text
  ...timestamps,
}, (t) => [index("textbooks_so_idx").on(t.subjectOfferedId)]);

export const chapters = pgTable("chapters", {
  id: id(),
  textbookId: uuid("textbook_id").notNull().references(() => textbooks.id),
  slug: text("slug").notNull(),
  position: integer("position").notNull(),
  nameEn: text("name_en").notNull(),
  nameTa: text("name_ta"),
  sourceRef: text("source_ref"),
  ...timestamps,
}, (t) => [uniqueIndex("chapters_tb_slug_uq").on(t.textbookId, t.slug)]);

export const lessons = pgTable("lessons", {
  id: id(),
  chapterId: uuid("chapter_id").notNull().references(() => chapters.id),
  slug: text("slug").notNull(),
  position: integer("position").notNull(),
  nameEn: text("name_en").notNull(),
  nameTa: text("name_ta"),
  ...timestamps,
}, (t) => [uniqueIndex("lessons_ch_slug_uq").on(t.chapterId, t.slug)]);

export const topics = pgTable("topics", {
  id: id(),
  lessonId: uuid("lesson_id").notNull().references(() => lessons.id),
  slug: text("slug").notNull(),
  position: integer("position").notNull(),
  nameEn: text("name_en").notNull(),
  nameTa: text("name_ta"),
  ...timestamps,
}, (t) => [uniqueIndex("topics_lesson_slug_uq").on(t.lessonId, t.slug)]);

export const objectives = pgTable("objectives", {
  id: id(),
  topicId: uuid("topic_id").notNull().references(() => topics.id),
  textEn: text("text_en").notNull(),
  textTa: text("text_ta"),
  ...timestamps,
}, (t) => [index("objectives_topic_idx").on(t.topicId)]);

export const topicPrerequisites = pgTable("topic_prerequisites", {
  topicId: uuid("topic_id").notNull().references(() => topics.id),
  prerequisiteTopicId: uuid("prerequisite_topic_id").notNull().references(() => topics.id),
}, (t) => [primaryKey({ columns: [t.topicId, t.prerequisiteTopicId] })]);

// ---------- Content (versioned) ----------
export const topicVersions = pgTable("topic_versions", {
  id: id(),
  topicId: uuid("topic_id").notNull().references(() => topics.id),
  version: integer("version").notNull(),
  status: contentStatus("status").notNull().default("draft"),
  lessonJson: text("lesson_json").notNull(), // validated by TopicLesson (shared)
  ...timestamps,
}, (t) => [uniqueIndex("tv_topic_version_uq").on(t.topicId, t.version)]);

// ---------- Identity (Better Auth tables are added in Module 6) ----------
export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull(),
  role: userRole("role").notNull().default("parent"),
  ...timestamps,
}, (t) => [uniqueIndex("users_email_uq").on(t.email)]);

export const studentProfiles = pgTable("student_profiles", {
  id: id(),
  nickname: text("nickname").notNull(),
  classLevel: integer("class_level").notNull(),
  boardCode: text("board_code").notNull(),
  language: text("language").notNull().default("en"),
  pinHash: text("pin_hash"),
  ...timestamps,
});

export const guardianships = pgTable("guardianships", {
  parentId: uuid("parent_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").notNull().references(() => studentProfiles.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.parentId, t.studentId] })]);

export const consents = pgTable("consents", {
  id: id(),
  parentId: uuid("parent_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").notNull().references(() => studentProfiles.id, { onDelete: "cascade" }),
  purpose: text("purpose").notNull(), // learning_progress | ai_tutor | analytics | voice
  textVersion: text("text_version").notNull(),
  grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});
