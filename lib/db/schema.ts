import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Updated users table with roles (superadmin, admin) - students now in separate table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  role: text("role", { enum: ["superadmin", "admin"] })
    .notNull()
    .default("admin"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// New students table for persistence
export const students = sqliteTable("students", {
  id: text("id").primaryKey(),
  examId: text("exam_id")
    .notNull()
    .references(() => exams.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  usn: text("usn").notNull(),
  class: text("class").notNull(),
  year: text("year").notNull(),
  section: text("section").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
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
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Section = typeof sections.$inferSelect;
export type NewSection = typeof sections.$inferInsert;

export const exams = sqliteTable("exams", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  duration: integer("duration").notNull(), // minutes
  totalMarks: integer("total_marks").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  status: text("status", { enum: ["active", "upcoming", "completed"] })
    .notNull()
    .default("upcoming"),
  proctoringEnabled: integer("proctoring_enabled").notNull().default(0), // 0 for disabled, 1 for enabled
  proctoringAudioEnabled: integer("proctoring_audio_enabled")
    .notNull()
    .default(1),
  proctoringVideoEnabled: integer("proctoring_video_enabled")
    .notNull()
    .default(1),
  showResults: integer("show_results").notNull().default(1), // 0 for hidden, 1 for visible
  strictSectionTiming: integer("strict_section_timing").default(0), // 0 for flexible, 1 for strict timer lock
  sectionalNavigation: text("sectional_navigation", {
    enum: ["free", "forward-only"],
  }).default("free"),
  sectionsConfig: text("sections_config"), // JSON string: { name: string, pickCount: number, duration: number }[]
  blueprint: text("blueprint"), // JSON string for DSIE: { sectionId: string, count: number, marks: number }[]
  version: integer("version").notNull().default(1), // Exam version for compatibility tracking
  positiveMarks: integer("positive_marks").notNull().default(1),
  negativeMarks: text("negative_marks").notNull().default("0"), // Using text to allow decimals like "0.25"
  maxViolations: integer("max_violations").notNull().default(3),
  generatedQuestions: text("generated_questions"), // JSON string for specific student variants
  sebConfigId: text("seb_config_id"), // Reference to seb_configs.id
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const sebConfigs = sqliteTable("seb_configs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  configData: text("config_data").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type SebConfig = typeof sebConfigs.$inferSelect;
export type NewSebConfig = typeof sebConfigs.$inferInsert;

// Academic Management Tables
export const departments = sqliteTable("departments", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const academicYears = sqliteTable("academic_years", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  order: integer("order").notNull(),
  departmentId: text("department_id")
    .notNull()
    .references(() => departments.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const academicSections = sqliteTable("academic_sections", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  order: integer("order").notNull(),
  departmentId: text("department_id")
    .notNull()
    .references(() => departments.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Types for Academic Tables
export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
export type AcademicYear = typeof academicYears.$inferSelect;
export type NewAcademicYear = typeof academicYears.$inferInsert;
export type AcademicSection = typeof academicSections.$inferSelect;
export type NewAcademicSection = typeof academicSections.$inferInsert;

// Questions table - refactored for DSIE
export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  examId: text("exam_id")
    .notNull()
    .references(() => exams.id, { onDelete: "cascade" }),
  sectionId: text("section_id").references(() => sections.id),
  section: text("section").notNull().default("General"), // Keep for legacy compatibility
  type: text("type", { enum: ["mcq", "msq", "text"] })
    .notNull()
    .default("mcq"),
  question: text("question").notNull(),
  questionImage: text("question_image"), // Base64 string
  options: text("options"), // JSON string: { text: string, image?: string }[]
  correctAnswer: text("correct_answer").notNull(),
  solution: text("solution"),
  marks: integer("marks").notNull().default(1),
  requiresJustification: integer("requires_justification", { mode: "boolean" })
    .notNull()
    .default(false),
  source: text("source", { enum: ["generated", "pdf"] })
    .notNull()
    .default("generated"),
  sourceId: text("source_id"), // Reference to PDF id or original question id for variations
  embedding: text("embedding"), // Store vector embedding or JSON representation
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Submissions table - with unique constraint on (examId + usn)
export const submissions = sqliteTable(
  "submissions",
  {
    id: text("id").primaryKey(),
    examId: text("exam_id")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    studentName: text("student_name").notNull(),
    usn: text("usn").notNull(),
    email: text("email").notNull(),
    class: text("class").notNull(),
    year: text("year").notNull(),
    section: text("section").notNull(),
    score: integer("score").notNull(),
    violations: integer("violations").notNull().default(0),
    violationEvents: text("violation_events"), // JSON string: { timestamp: number, reason: string, score: number }[]
    sectionScores: text("section_scores"), // JSON string: { [sectionName: string]: number }
    answers: text("answers"), // JSON string: { [questionId: string]: any }
    justifications: text("justifications"), // JSON string: { [questionId: string]: string }
    submittedAt: integer("submitted_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => {
    return [uniqueIndex("exam_usn_unique").on(table.examId, table.usn)];
  },
);

// Exam sessions table for robust resume functionality
export const examSessions = sqliteTable(
  "exam_sessions",
  {
    id: text("id").primaryKey(),
    examId: text("exam_id")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    studentUsn: text("student_usn").notNull(),
    studentName: text("student_name").notNull(),
    studentEmail: text("student_email").notNull(),

    // Session state
    status: text("status", {
      enum: ["in-progress", "submitted", "expired", "terminated"],
    })
      .notNull()
      .default("in-progress"),
    currentQuestionIndex: integer("current_question_index")
      .notNull()
      .default(0),
    currentSectionIndex: integer("current_section_index").notNull().default(0),

    // Progress tracking
    answers: text("answers"), // JSON: { [questionId: string]: any }
    justifications: text("justifications"), // JSON: { [questionId: string]: string }
    visitedQuestions: text("visited_questions"), // JSON: string[]
    markedForReview: text("marked_for_review"), // JSON: string[]

    // Timing
    startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
    lastActivityAt: integer("last_activity_at", {
      mode: "timestamp",
    }).notNull(),
    endTimestamp: integer("end_timestamp"), // exam end timestamp
    sectionEndTimestamps: text("section_end_timestamps"), // JSON: { [sectionName: string]: number }
    totalTimeSpent: integer("total_time_spent").default(0), // milliseconds

    // Proctoring
    violations: integer("violations").default(0),
    violationEvents: text("violation_events"), // JSON: { timestamp: number, reason: string, score: number }[]

    // Consistency
    shuffledQuestionIds: text("shuffled_question_ids").notNull(), // JSON: string[]
    examVersion: integer("exam_version").default(1),
    sessionHash: text("session_hash"), // MD5 hash for integrity

    // Metadata
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    browserFingerprint: text("browser_fingerprint"),

    // Timestamps
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => {
    return [
      uniqueIndex("exam_student_unique").on(table.examId, table.studentUsn),
    ];
  },
);

// Drizzle Relations for relational queries

export const examsRelations = relations(exams, ({ many }) => ({
  questions: many(questions),
  submissions: many(submissions),
  students: many(students),
  examSessions: many(examSessions),
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

export const examSessionsRelations = relations(examSessions, ({ one }) => ({
  exam: one(exams, {
    fields: [examSessions.examId],
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

// Academic Table Relations
export const departmentsRelations = relations(departments, ({ many }) => ({
  academicYears: many(academicYears),
  academicSections: many(academicSections),
}));

export const academicYearsRelations = relations(
  academicYears,
  ({ one, many }) => ({
    department: one(departments, {
      fields: [academicYears.departmentId],
      references: [departments.id],
    }),
    academicSections: many(academicSections),
  }),
);

export const academicSectionsRelations = relations(
  academicSections,
  ({ one }) => ({
    department: one(departments, {
      fields: [academicSections.departmentId],
      references: [departments.id],
    }),
  }),
);

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Exam = typeof exams.$inferSelect;
export type NewExam = typeof exams.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
export type ExamSession = typeof examSessions.$inferSelect;
export type NewExamSession = typeof examSessions.$inferInsert;
