-- Create exam_sessions table for robust resume functionality
CREATE TABLE exam_sessions (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  student_usn TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  
  -- Session state
  status TEXT NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'submitted', 'expired', 'terminated')),
  current_question_index INTEGER NOT NULL DEFAULT 0,
  current_section_index INTEGER NOT NULL DEFAULT 0,
  
  -- Progress tracking
  answers TEXT, -- JSON: { [questionId: string]: any }
  justifications TEXT, -- JSON: { [questionId: string]: string }
  visited_questions TEXT, -- JSON: string[]
  marked_for_review TEXT, -- JSON: string[]
  
  -- Timing
  started_at INTEGER NOT NULL, -- timestamp
  last_activity_at INTEGER NOT NULL, -- timestamp
  end_timestamp INTEGER, -- exam end timestamp
  section_end_timestamps TEXT, -- JSON: { [sectionName: string]: number }
  total_time_spent INTEGER DEFAULT 0, -- milliseconds
  
  -- Proctoring
  violations INTEGER DEFAULT 0,
  violation_events TEXT, -- JSON: { timestamp: number, reason: string, score: number }[]
  
  -- Consistency
  shuffled_question_ids TEXT NOT NULL, -- JSON: string[] - ensures same question order
  exam_version INTEGER DEFAULT 1,
  session_hash TEXT, -- MD5 hash of session data for integrity
  
  -- Metadata
  user_agent TEXT,
  ip_address TEXT,
  browser_fingerprint TEXT,
  
  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  
  -- Constraints
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  UNIQUE(exam_id, student_usn) -- Only one active session per exam per student
);

-- Indexes for performance
CREATE INDEX idx_exam_sessions_exam_id ON exam_sessions(exam_id);
CREATE INDEX idx_exam_sessions_student_usn ON exam_sessions(student_usn);
CREATE INDEX idx_exam_sessions_status ON exam_sessions(status);
CREATE INDEX idx_exam_sessions_last_activity ON exam_sessions(last_activity_at);
CREATE INDEX idx_exam_sessions_created_at ON exam_sessions(created_at);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_exam_sessions_updated_at 
  AFTER UPDATE ON exam_sessions
  BEGIN
    UPDATE exam_sessions SET updated_at = unixepoch() WHERE id = NEW.id;
  END;

-- Cleanup old sessions (older than 30 days)
CREATE TRIGGER cleanup_old_sessions
  AFTER INSERT ON exam_sessions
  BEGIN
    DELETE FROM exam_sessions 
    WHERE status IN ('submitted', 'expired', 'terminated') 
    AND updated_at < unixepoch() - (30 * 24 * 60 * 60);
  END;
