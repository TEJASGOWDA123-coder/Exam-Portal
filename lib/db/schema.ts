import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

// Updated users table with roles (superadmin, admin) - students now in separate table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  role: text("role", { enum: ["superadmin", "admin"] }).notNull().default("admin"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// New students table for persistence
export const students = sqliteTable("students", {
  id: text("id").primaryKey(),
  examId: text("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  usn: text("usn").notNull(),
  class: text("class").notNull(),
  section: text("section").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;

// Exams table
export const exams = sqliteTable("exams", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  duration: integer("duration").notNull(), // minutes
  totalMarks: integer("total_marks").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  status: text("status", { enum: ["active", "upcoming", "completed"] }).notNull().default("upcoming"),
  proctoringEnabled: integer("proctoring_enabled").notNull().default(0), // 0 for disabled, 1 for enabled
  sectionsConfig: text("sections_config"), // JSON string: { name: string, pickCount: number }[]
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Questions table - refactored for dynamic options
export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  examId: text("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["mcq", "msq", "text"] }).notNull().default("mcq"),
  question: text("question").notNull(),
  questionImage: text("question_image"), // Base64 string
  options: text("options"), // JSON string: { text: string, image?: string }[]
  correctAnswer: text("correct_answer").notNull(),
  section: text("section").notNull().default("General"),
  marks: integer("marks").notNull().default(1),
  requiresJustification: integer("requires_justification", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Submissions table - with unique constraint on (examId + usn)
export const submissions = sqliteTable("submissions", {
  id: text("id").primaryKey(),
  examId: text("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  studentName: text("student_name").notNull(),
  usn: text("usn").notNull(),
  email: text("email").notNull(),
  class: text("class").notNull(),
  section: text("section").notNull(),
  score: integer("score").notNull(),
  violations: integer("violations").notNull().default(0),
  sectionScores: text("section_scores"), // JSON string: { [sectionName: string]: number }
  justifications: text("justifications"), // JSON string: { [questionId: string]: string }
  submittedAt: integer("submitted_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => {
  return [
    uniqueIndex("exam_usn_unique").on(table.examId, table.usn),
  ];
});

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Exam = typeof exams.$inferSelect;
export type NewExam = typeof exams.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
