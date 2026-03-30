-- Manual SQL to remove year_id column from academic_sections table
-- Run this in your Turso database admin interface

-- First, let's see the current structure
SELECT sql FROM sqlite_master WHERE type='table' AND name='academic_sections';

-- Option 1: Try to drop the column directly (may not work in SQLite)
ALTER TABLE academic_sections DROP COLUMN year_id;

-- If the above doesn't work, recreate the table:
-- CREATE TABLE academic_sections_new (
--   id TEXT PRIMARY KEY,
--   name TEXT NOT NULL,
--   department_id TEXT NOT NULL,
--   created_at INTEGER NOT NULL,
--   updated_at INTEGER NOT NULL,
--   FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
-- );
-- 
-- INSERT INTO academic_sections_new (id, name, department_id, created_at, updated_at)
-- SELECT id, name, department_id, created_at, updated_at FROM academic_sections;
-- 
-- DROP TABLE academic_sections;
-- ALTER TABLE academic_sections_new RENAME TO academic_sections;

-- Verify the result
SELECT sql FROM sqlite_master WHERE type='table' AND name='academic_sections';

-- Check the data
SELECT * FROM academic_sections LIMIT 5;
