import {
  jsonb, index, integer, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid, boolean,
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
  competencyCode: text("competency_code"), // NCF-SE competency, e.g. C-3.2 (optional)
  position: integer("position").notNull().default(1),
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
  passwordHash: text("password_hash"), // scrypt, format s1$salt$hash; never leaves the server
  fatherEmail: text("father_email"),
  motherEmail: text("mother_email"),
  mobile: text("mobile"),
  provider: text("provider").notNull().default("email"), // email | google | facebook
  providerId: text("provider_id"),
  ...timestamps,
}, (t) => [uniqueIndex("users_email_uq").on(t.email)]);

export const studentProfiles = pgTable("student_profiles", {
  id: id(),
  nickname: text("nickname").notNull(),
  classLevel: integer("class_level").notNull(),
  boardCode: text("board_code").notNull(),
  language: text("language").notNull().default("en"),
  avatar: text("avatar").notNull().default("owl"),
  pinHash: text("pin_hash"),
  extraClasses: text("extra_classes").notNull().default("[]"), // JSON array of more classes the child studies
  secretQuestion: text("secret_question"),
  secretAnswerHash: text("secret_answer_hash"),
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

/** Browser sessions. Only a hash of the cookie token is stored, so a database leak cannot be replayed. */
export const sessions = pgTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").references(() => studentProfiles.id, { onDelete: "set null" }), // the child currently learning
  child: boolean("child").notNull().default(false), // signed in by the child with a PIN: no parent-only pages
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("sessions_user_idx").on(t.userId)]);

/** Lesson progress and practice results kept per child so they follow the child across devices. */
export const studentProgress = pgTable("student_progress", {
  studentId: uuid("student_id").notNull().references(() => studentProfiles.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(), // lesson | practice | revision | note | mistake
  topicId: text("topic_id").notNull(),
  dataJson: text("data_json").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.studentId, t.kind, t.topicId] })]);

/** Counts AI answers per child (or per network address for guests) per day, to protect the free model quota. */
export const tutorUsage = pgTable("tutor_usage", {
  key: text("key").notNull(),
  day: integer("day").notNull(),
  count: integer("count").notNull().default(0),
}, (t) => [primaryKey({ columns: [t.key, t.day] })]);

// ---------- Platform settings (see packages/shared/src/settings.ts for the registry) ----------
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: text("updated_by").notNull(),
});

export const settingsAudit = pgTable("settings_audit", {
  id: id(),
  key: text("key").notNull(),
  action: text("action").notNull(), // update | reset | import
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  changedBy: text("changed_by").notNull(),
  changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("settings_audit_changed_idx").on(t.changedAt)]);

// ---------- Practice (Module 5) ----------
export const questions = pgTable("questions", {
  id: id(),
  topicId: uuid("topic_id").notNull().references(() => topics.id),
  key: text("key").notNull(), // authoring key, unique within the topic
  type: text("type").notNull(),
  round: integer("round").notNull(),
  status: contentStatus("status").notNull().default("draft"),
  version: integer("version").notNull().default(1),
  bodyJson: text("body_json").notNull(), // the full authored question, validated by Question (shared)
  ...timestamps,
}, (t) => [uniqueIndex("questions_topic_key_uq").on(t.topicId, t.key), index("questions_topic_idx").on(t.topicId)]);

/** One row per answered question. attemptId is the idempotency key made by the app. */
export const questionAttempts = pgTable("question_attempts", {
  attemptId: uuid("attempt_id").primaryKey(),
  questionId: uuid("question_id").notNull().references(() => questions.id),
  questionVersion: integer("question_version").notNull(),
  anonId: uuid("anon_id").notNull(), // random id from the device; studentId below is set when a child was signed in
  studentId: uuid("student_id").references(() => studentProfiles.id, { onDelete: "set null" }),
  responseJson: text("response_json").notNull(),
  correct: boolean("correct").notNull(),
  hintsUsed: integer("hints_used").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("qa_question_idx").on(t.questionId), index("qa_anon_idx").on(t.anonId)]);

// ---------- Site access (invite-only mode) ----------
/** Invite codes. `code` is stored without dashes, upper case (shown to people as SHARP-XXXX-XXXX). maxUses null = unlimited. */
export const inviteCodes = pgTable("invite_codes", {
  id: id(),
  code: text("code").notNull(),
  label: text("label"),
  maxUses: integer("max_uses"),
  uses: integer("uses").notNull().default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("invite_codes_code_uq").on(t.code)]);
