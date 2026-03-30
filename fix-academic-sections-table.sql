-- Drop and recreate academic_sections table to fix schema issues
-- Run this in your Turso database admin interface

-- First, backup existing data if needed
-- CREATE TABLE academic_sections_backup AS SELECT * FROM academic_sections;

-- Drop the existing table
DROP TABLE academic_sections;

-- Recreate the table without the unique constraint
CREATE TABLE academic_sections (
  id text PRIMARY KEY NOT NULL,
  name text NOT NULL,
  department_id text NOT NULL,
  "created_at" integer NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at integer NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (department_id) REFERENCES departments(id) ON UPDATE no action ON DELETE cascade
);

-- Restore data if you backed it up
-- INSERT INTO academic_sections (id, name, department_id, created_at, updated_at)
-- SELECT id, name, department_id, created_at, updated_at FROM academic_sections_backup;

-- Verify the table structure
SELECT sql FROM sqlite_master WHERE type='table' AND name='academic_sections';

-- Check existing data
SELECT * FROM academic_sections;
