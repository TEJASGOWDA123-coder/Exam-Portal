-- Add version column to exams table
ALTER TABLE `exams` ADD `version` integer NOT NULL DEFAULT 1;
