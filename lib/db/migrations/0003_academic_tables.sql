-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Create academic_years table
CREATE TABLE IF NOT EXISTS academic_years (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  department_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- Create academic_sections table
CREATE TABLE IF NOT EXISTS academic_sections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  year_id TEXT NOT NULL,
  department_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- Create unique index for year-section combination
CREATE UNIQUE INDEX IF NOT EXISTS year_section_unique ON academic_sections(year_id, name);

-- Insert sample data
INSERT OR IGNORE INTO departments (id, name, code, description) VALUES 
  ('1', 'Master of Computer Applications', 'MCA', 'Postgraduate program in computer applications'),
  ('2', 'Computer Science Engineering', 'CSE', 'Undergraduate engineering program'),
  ('3', 'Information Technology', 'IT', 'Undergraduate program in information technology');

INSERT OR IGNORE INTO academic_years (id, name, "order", department_id) VALUES 
  ('1', '1st Year', 1, '1'),
  ('2', '2nd Year', 2, '1'),
  ('3', '3rd Year', 3, '1');

INSERT OR IGNORE INTO academic_sections (id, name, year_id, department_id) VALUES 
  ('1', 'A', '1', '1'),
  ('2', 'B', '1', '1'),
  ('3', 'C', '1', '1'),
  ('4', 'A', '2', '1'),
  ('5', 'B', '2', '1'),
  ('6', 'C', '2', '1');
