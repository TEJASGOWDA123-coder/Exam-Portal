import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

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

// Sections table for Dynamic Identity Engine
export const sections = sqliteTable("sections", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  identityPrompt: text("identity_prompt").notNull(),
  transformationPrompt: text("transformation_prompt").notNull(),
  validationRules: text("validation_rules"), // JSON string
  outputSchema: text("output_schema"), // JSON string
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Section = typeof sections.$inferSelect;
export type NewSection = typeof sections.$inferInsert;

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
  showResults: integer("show_results").notNull().default(1), // 0 for hidden, 1 for visible
  sectionsConfig: text("sections_config"), // JSON string: { name: string, pickCount: number }[]
  blueprint: text("blueprint"), // JSON string for DSIE: { sectionId: string, count: number, marks: number }[]
  generatedQuestions: text("generated_questions"), // JSON string for specific student variants
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Questions table - refactored for DSIE
export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  examId: text("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  sectionId: text("section_id").references(() => sections.id),
  section: text("section").notNull().default("General"), // Keep for legacy compatibility
  type: text("type", { enum: ["mcq", "msq", "text"] }).notNull().default("mcq"),
  question: text("question").notNull(),
  questionImage: text("question_image"), // Base64 string
  options: text("options"), // JSON string: { text: string, image?: string }[]
  correctAnswer: text("correct_answer").notNull(),
  solution: text("solution"),
  marks: integer("marks").notNull().default(1),
  requiresJustification: integer("requires_justification", { mode: "boolean" }).notNull().default(false),
  source: text("source", { enum: ["generated", "pdf"] }).notNull().default("generated"),
  sourceId: text("source_id"), // Reference to PDF id or original question id for variations
  embedding: text("embedding"), // Store vector embedding or JSON representation
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

// Drizzle Relations for relational queries

export const examsRelations = relations(exams, ({ many }) => ({
  questions: many(questions),
  submissions: many(submissions),
  students: many(students),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  exam: one(exams, {
    fields: [questions.examId],
    references: [exams.id],
  }),
  section: one(sections, {
    fields: [questions.sectionId],
    references: [sections.id],
  }),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  exam: one(exams, {
    fields: [submissions.examId],
    references: [exams.id],
  }),
}));

export const studentsRelations = relations(students, ({ one }) => ({
  exam: one(exams, {
    fields: [students.examId],
    references: [exams.id],
  }),
}));

export const sectionsRelations = relations(sections, ({ many }) => ({
  questions: many(questions),
}));

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Exam = typeof exams.$inferSelect;
export type NewExam = typeof exams.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
