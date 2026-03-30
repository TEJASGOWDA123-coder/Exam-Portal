PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_academic_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`year_id` text,
	`department_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`year_id`) REFERENCES `academic_years`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_academic_sections`("id", "name", "year_id", "department_id", "created_at", "updated_at") SELECT "id", "name", "year_id", "department_id", "created_at", "updated_at" FROM `academic_sections`;--> statement-breakpoint
DROP TABLE `academic_sections`;--> statement-breakpoint
ALTER TABLE `__new_academic_sections` RENAME TO `academic_sections`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `dept_section_unique` ON `academic_sections` (`department_id`,`name`);