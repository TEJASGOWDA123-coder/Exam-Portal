-- Migration: 0000_thin_rachel_grey.sql

-- Create users table
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text,
	`role` text DEFAULT 'admin' NOT NULL,
	`created_at` integer NOT NULL
);--> statement-breakpoint

-- Create indexes for users
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint

-- Create sections table
CREATE TABLE `sections` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`identity_prompt` text NOT NULL,
	`transformation_prompt` text NOT NULL,
	`validation_rules` text,
	`output_schema` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);--> statement-breakpoint

-- Create exams table
CREATE TABLE `exams` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`duration` integer NOT NULL,
	`total_marks` integer NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`status` text DEFAULT 'upcoming' NOT NULL,
	`proctoring_enabled` integer DEFAULT 0 NOT NULL,
	`show_results` integer DEFAULT 1 NOT NULL,
	`seb_enabled` integer DEFAULT 0 NOT NULL,
	`seb_config_key` text,
	`sections_config` text,
	`blueprint` text,
	`generated_questions` text,
	`created_at` integer NOT NULL
);--> statement-breakpoint

-- Create questions table
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_id` text NOT NULL,
	`section_id` text,
	`section` text DEFAULT 'General' NOT NULL,
	`type` text DEFAULT 'mcq' NOT NULL,
	`question` text NOT NULL,
	`question_image` text,
	`options` text,
	`correct_answer` text NOT NULL,
	`solution` text,
	`marks` integer DEFAULT 1 NOT NULL,
	`requires_justification` integer DEFAULT false NOT NULL,
	`source` text DEFAULT 'generated' NOT NULL,
	`source_id` text,
	`embedding` text,
	`created_at` integer NOT NULL
);--> statement-breakpoint

-- Create students table
CREATE TABLE `students` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`usn` text NOT NULL,
	`class` text NOT NULL,
	`section` text NOT NULL,
	`created_at` integer NOT NULL
);--> statement-breakpoint

-- Create submissions table
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_id` text NOT NULL,
	`student_name` text NOT NULL,
	`usn` text NOT NULL,
	`email` text NOT NULL,
	`class` text NOT NULL,
	`section` text NOT NULL,
	`score` integer NOT NULL,
	`violations` integer DEFAULT 0 NOT NULL,
	`section_scores` text,
	`justifications` text,
	`submitted_at` integer NOT NULL
);--> statement-breakpoint

-- Create indexes for submissions
CREATE UNIQUE INDEX `exam_usn_unique` ON `submissions` (`exam_id`, `usn`);--> statement-breakpoint

-- Add foreign keys for questions
-- Note: SQLite doesn't support adding foreign keys to existing tables directly
-- These would need to be handled in a different way or the tables recreated
