-- Online Exam Portal Schema (SAD §4.1.2 & STP §6.4)

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('Student', 'Instructor', 'Admin')) NOT NULL DEFAULT 'Student',
  is_locked INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_resets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  otp TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  used INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  instructor_id INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  total_marks INTEGER NOT NULL DEFAULT 100,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  is_published INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  instructor_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK(question_type IN ('MCQ', 'TrueFalse', 'ShortAnswer')) NOT NULL,
  marks INTEGER NOT NULL DEFAULT 5,
  correct_answer TEXT NOT NULL, -- Stored securely on server, stripped in student payloads
  explanation TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  option_key TEXT NOT NULL, -- 'A', 'B', 'C', 'D'
  option_text TEXT NOT NULL,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exam_questions (
  exam_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  display_order INTEGER DEFAULT 0,
  PRIMARY KEY (exam_id, question_id),
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  submit_time DATETIME,
  score REAL DEFAULT 0,
  is_graded INTEGER DEFAULT 0,
  status TEXT CHECK(status IN ('in_progress', 'submitted', 'graded')) DEFAULT 'in_progress',
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(exam_id, student_id)
);

CREATE TABLE IF NOT EXISTS answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  selected_option TEXT,
  short_answer_text TEXT,
  marks_awarded REAL DEFAULT 0,
  instructor_feedback TEXT,
  auto_graded INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  UNIQUE(attempt_id, question_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
