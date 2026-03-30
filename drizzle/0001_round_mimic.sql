CREATE TABLE `seb_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`config_data` text NOT NULL,
	`is_active` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `exams` ADD `proctoring_audio_enabled` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `exams` ADD `proctoring_video_enabled` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `exams` ADD `strict_section_timing` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `exams` ADD `sectional_navigation` text DEFAULT 'free';--> statement-breakpoint
ALTER TABLE `exams` ADD `positive_marks` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `exams` ADD `negative_marks` text DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `exams` ADD `max_violations` integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE `exams` ADD `seb_config_id` text;--> statement-breakpoint
ALTER TABLE `exams` DROP COLUMN `seb_enabled`;--> statement-breakpoint
ALTER TABLE `exams` DROP COLUMN `seb_config_key`;--> statement-breakpoint
ALTER TABLE `students` ADD `year` text NOT NULL;--> statement-breakpoint
ALTER TABLE `submissions` ADD `year` text NOT NULL;--> statement-breakpoint
ALTER TABLE `submissions` ADD `answers` text;