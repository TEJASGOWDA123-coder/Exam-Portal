CREATE TABLE `exam_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_id` text NOT NULL,
	`student_usn` text NOT NULL,
	`student_name` text NOT NULL,
	`student_email` text NOT NULL,
	`status` text DEFAULT 'in-progress' NOT NULL,
	`current_question_index` integer DEFAULT 0 NOT NULL,
	`current_section_index` integer DEFAULT 0 NOT NULL,
	`answers` text,
	`justifications` text,
	`visited_questions` text,
	`marked_for_review` text,
	`started_at` integer NOT NULL,
	`last_activity_at` integer NOT NULL,
	`end_timestamp` integer,
	`section_end_timestamps` text,
	`total_time_spent` integer DEFAULT 0,
	`violations` integer DEFAULT 0,
	`violation_events` text,
	`shuffled_question_ids` text NOT NULL,
	`exam_version` integer DEFAULT 1,
	`session_hash` text,
	`user_agent` text,
	`ip_address` text,
	`browser_fingerprint` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exam_student_unique` ON `exam_sessions` (`exam_id`,`student_usn`);--> statement-breakpoint
ALTER TABLE `exams` ADD `version` integer DEFAULT 1 NOT NULL;