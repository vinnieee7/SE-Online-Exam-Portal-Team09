const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { db, run, all, get } = require('../config/db');

async function seedDatabase() {
  console.log('🔄 Initializing Online Exam Portal Database...');

  // 1. Read and apply schema
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Split schema by statement
  const statements = schemaSql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    await run(statement);
  }
  console.log('✅ Tables verified / created.');

  // Clear existing data for fresh seed (idempotent reset)
  await run('DELETE FROM audit_logs');
  await run('DELETE FROM answers');
  await run('DELETE FROM attempts');
  await run('DELETE FROM exam_questions');
  await run('DELETE FROM options');
  await run('DELETE FROM questions');
  await run('DELETE FROM exams');
  await run('DELETE FROM password_resets');
  await run('DELETE FROM users');
  try {
    await run('DELETE FROM sqlite_sequence');
  } catch (e) {
    // ignore if table does not exist yet
  }

  // 2. Insert Users (STP §6.4)
  const passwordHash = await bcrypt.hash('Password@123', 10);

  const usersData = [
    { name: 'System Administrator', email: 'admin@pesu.edu', role: 'Admin', is_locked: 0 },
    { name: 'Dr. Aadish Sarin (Instructor)', email: 'instructor1@pesu.edu', role: 'Instructor', is_locked: 0 },
    { name: 'Prof. A S Vincent (Instructor)', email: 'instructor2@pesu.edu', role: 'Instructor', is_locked: 0 },
    { name: 'Student Alpha (PES2UG24CS002)', email: 'student1@pesu.edu', role: 'Student', is_locked: 0 },
    { name: 'Student Beta (PES2UG24CS034)', email: 'student2@pesu.edu', role: 'Student', is_locked: 0 },
    { name: 'Student Gamma (PES2UG24CS045)', email: 'student3@pesu.edu', role: 'Student', is_locked: 0 },
    { name: 'Locked User Account', email: 'locked@pesu.edu', role: 'Student', is_locked: 1 }
  ];

  for (const u of usersData) {
    await run(
      'INSERT INTO users (name, email, password_hash, role, is_locked) VALUES (?, ?, ?, ?, ?)',
      [u.name, u.email, passwordHash, u.role, u.is_locked]
    );
  }
  console.log('✅ Inserted 7 Seed Users (3 Students, 2 Instructors, 1 Admin, 1 Locked).');

  const instructor = await get('SELECT id FROM users WHERE email = ?', ['instructor1@pesu.edu']);
  const student1 = await get('SELECT id FROM users WHERE email = ?', ['student1@pesu.edu']);
  const student2 = await get('SELECT id FROM users WHERE email = ?', ['student2@pesu.edu']);

  // 3. Insert 30 Questions into Question Bank (STP §6.4)
  const questionsData = [
    // 20 MCQs
    {
      q: 'Which architectural pattern separates an application into Presentation, Business Logic, and Data layers?',
      type: 'MCQ', marks: 5, ans: 'A',
      explanation: 'Layered (N-tier) architecture separates concerns cleanly across tiers.',
      options: [{ k: 'A', t: 'Layered (N-Tier) Architecture' }, { k: 'B', t: 'Pipe and Filter' }, { k: 'C', t: 'Peer-to-Peer' }, { k: 'D', t: 'Event-Driven Architecture' }]
    },
    {
      q: 'In the Software Requirements Specification (SRS), what does the acronym "RTM" stand for?',
      type: 'MCQ', marks: 5, ans: 'C',
      explanation: 'Requirements Traceability Matrix links requirements to tests and design.',
      options: [{ k: 'A', t: 'Rapid Testing Methodology' }, { k: 'B', t: 'Real Time Monitor' }, { k: 'C', t: 'Requirements Traceability Matrix' }, { k: 'D', t: 'Release Transition Milestone' }]
    },
    {
      q: 'Which STRIDE threat category deals with an attacker modifying exam answers during network transit?',
      type: 'MCQ', marks: 5, ans: 'B',
      explanation: 'Tampering refers to unauthorized modification of data in transit or storage.',
      options: [{ k: 'A', t: 'Spoofing' }, { k: 'B', t: 'Tampering' }, { k: 'C', t: 'Repudiation' }, { k: 'D', t: 'Information Disclosure' }]
    },
    {
      q: 'Which HTTP status code must the RBAC middleware return when a Student attempts to access an Instructor-only endpoint?',
      type: 'MCQ', marks: 5, ans: 'C',
      explanation: '403 Forbidden is used when the server understands the request but refuses to authorize it.',
      options: [{ k: 'A', t: '401 Unauthorized' }, { k: 'B', t: '404 Not Found' }, { k: 'C', t: '403 Forbidden' }, { k: 'D', t: '500 Internal Server Error' }]
    },
    {
      q: 'What is the primary purpose of cross-testing in software engineering?',
      type: 'MCQ', marks: 5, ans: 'D',
      explanation: 'Cross-testing ensures tests are independent and free from developer confirmation bias.',
      options: [{ k: 'A', t: 'Faster compilation' }, { k: 'B', t: 'Eliminating the need for unit tests' }, { k: 'C', t: 'Automating database backups' }, { k: 'D', t: 'Removing developer bias and validating interface contracts' }]
    },
    {
      q: 'Which algorithm is recommended to achieve an unbiased random shuffle of exam question order?',
      type: 'MCQ', marks: 5, ans: 'B',
      explanation: 'Fisher-Yates (Knuth) shuffle produces an unbiased permutation in O(n) time.',
      options: [{ k: 'A', t: 'Bubble Shuffle' }, { k: 'B', t: 'Fisher-Yates Shuffle' }, { k: 'C', t: 'Dijkstra Sort' }, { k: 'D', t: 'Binary Partition' }]
    },
    {
      q: 'In password storage security (OEP-SR-002), which of the following is a cryptographically strong adaptive hashing algorithm?',
      type: 'MCQ', marks: 5, ans: 'C',
      explanation: 'Bcrypt includes a salt and configurable work factor to mitigate brute-force attacks.',
      options: [{ k: 'A', t: 'MD5' }, { k: 'B', t: 'SHA-1' }, { k: 'C', t: 'Bcrypt' }, { k: 'D', t: 'Base64' }]
    },
    {
      q: 'According to OEP-SR-004, where should the correct answer keys for an exam be validated?',
      type: 'MCQ', marks: 5, ans: 'A',
      explanation: 'Answer keys must strictly remain server-side to prevent client tampering and inspect-element leaks.',
      options: [{ k: 'A', t: 'Exclusively on the server' }, { k: 'B', t: 'In the client React state' }, { k: 'C', t: 'In browser localStorage' }, { k: 'D', t: 'In hidden form input fields' }]
    },
    {
      q: 'What type of testing is executed using Apache JMeter or k6 to verify response latency under 500 concurrent users?',
      type: 'MCQ', marks: 5, ans: 'B',
      explanation: 'Load/performance testing evaluates system responsiveness under target concurrent load.',
      options: [{ k: 'A', t: 'Unit Testing' }, { k: 'B', t: 'Performance / Load Testing' }, { k: 'C', t: 'Mutation Testing' }, { k: 'D', t: 'Smoke Testing' }]
    },
    {
      q: 'Which WCAG 2.1 AA guideline requires interactive UI elements to have sufficient color contrast?',
      type: 'MCQ', marks: 5, ans: 'A',
      explanation: 'WCAG 2.1 AA mandates a minimum contrast ratio of 4.5:1 for normal text.',
      options: [{ k: 'A', t: 'Contrast (Minimum) 4.5:1' }, { k: 'B', t: 'Dark Mode Exclusivity' }, { k: 'C', t: 'No Font Resizing' }, { k: 'D', t: 'Flashing Animations' }]
    },
    {
      q: 'In Agile Scrum, what does a burndown chart track over the course of a sprint?',
      type: 'MCQ', marks: 5, ans: 'C',
      explanation: 'A burndown chart displays remaining effort/story points versus time in the sprint.',
      options: [{ k: 'A', t: 'Financial expenditure' }, { k: 'B', t: 'Total lines of code written' }, { k: 'C', t: 'Remaining story points over time' }, { k: 'D', t: 'Defect rejection rate' }]
    },
    {
      q: 'What is the purpose of periodic auto-save (OEP-F-011) during an exam attempt?',
      type: 'MCQ', marks: 5, ans: 'B',
      explanation: 'Auto-save preserves candidate progress to recover gracefully from network glitches or accidental browser closes.',
      options: [{ k: 'A', t: 'To increase server CPU load' }, { k: 'B', t: 'To prevent loss of answers during client disconnect' }, { k: 'C', t: 'To grade answers in real time' }, { k: 'D', t: 'To block copy-paste functionality' }]
    },
    {
      q: 'Which database constraint prevents two students from enrolling with the exact same university email address?',
      type: 'MCQ', marks: 5, ans: 'A',
      explanation: 'A UNIQUE constraint guarantees that all values in an email column are distinct.',
      options: [{ k: 'A', t: 'UNIQUE Constraint' }, { k: 'B', t: 'CHECK Constraint' }, { k: 'C', t: 'DEFAULT Constraint' }, { k: 'D', t: 'FOREIGN KEY Constraint' }]
    },
    {
      q: 'What is Defect Removal Efficiency (DRE) in software testing?',
      type: 'MCQ', marks: 5, ans: 'C',
      explanation: 'DRE measures the percentage of defects detected prior to user acceptance or production release.',
      options: [{ k: 'A', t: 'Defects / Total Lines of Code' }, { k: 'B', t: 'Passed Tests / Total Tests' }, { k: 'C', t: '(Defects found before release / Total defects found) * 100' }, { k: 'D', t: 'Time to fix a bug' }]
    },
    {
      q: 'Which tool is utilized for baseline dynamic web application security scanning to detect OWASP Top 10 vulnerabilities?',
      type: 'MCQ', marks: 5, ans: 'B',
      explanation: 'OWASP ZAP (Zed Attack Proxy) is an open-source web application security scanner.',
      options: [{ k: 'A', t: 'Apache Maven' }, { k: 'B', t: 'OWASP ZAP' }, { k: 'C', t: 'Postman Runner' }, { k: 'D', t: 'Docker Compose' }]
    },
    {
      q: 'What is a Smoke Test in the Software Development Life Cycle?',
      type: 'MCQ', marks: 5, ans: 'A',
      explanation: 'Smoke testing verifies that basic, critical functionalities work before running exhaustive tests.',
      options: [{ k: 'A', t: 'A minimal suite verifying that the build is stable enough to test further' }, { k: 'B', t: 'A test assessing battery drain on mobile devices' }, { k: 'C', t: 'An exhaustive test of all boundary conditions' }, { k: 'D', t: 'A security penetration attack test' }]
    },
    {
      q: 'In REST API design, which HTTP method should be used to partially update an ongoing exam attempt with auto-saved answers?',
      type: 'MCQ', marks: 5, ans: 'B',
      explanation: 'PATCH (or targeted POST) updates partial resources without overwriting the entire document.',
      options: [{ k: 'A', t: 'DELETE' }, { k: 'B', t: 'PATCH / POST' }, { k: 'C', t: 'HEAD' }, { k: 'D', t: 'OPTIONS' }]
    },
    {
      q: 'Which component in JWT authentication contains the claims such as user role and expiration time?',
      type: 'MCQ', marks: 5, ans: 'B',
      explanation: 'A JWT comprises Header, Payload (claims), and Signature.',
      options: [{ k: 'A', t: 'Header' }, { k: 'B', t: 'Payload' }, { k: 'C', t: 'Signature' }, { k: 'D', t: 'Secret Key' }]
    },
    {
      q: 'What is the primary objective of regression testing after a defect fix?',
      type: 'MCQ', marks: 5, ans: 'C',
      explanation: 'Regression testing ensures recent code modifications have not introduced unintended side-effects.',
      options: [{ k: 'A', t: 'To write new user stories' }, { k: 'B', t: 'To benchmark maximum hardware capacity' }, { k: 'C', t: 'To verify existing working features were not broken by the fix' }, { k: 'D', t: 'To compile release documentation' }]
    },
    {
      q: 'What is the role of continuous integration (CI) in GitHub Actions for Team 9?',
      type: 'MCQ', marks: 5, ans: 'B',
      explanation: 'CI automatically validates that code compiles, passes linter checks, and passes tests on every pull request.',
      options: [{ k: 'A', t: 'To automatically grade student essays' }, { k: 'B', t: 'To automatically lint, build, and test pull requests before merging' }, { k: 'C', t: 'To record marketing videos' }, { k: 'D', t: 'To generate mock user passwords' }]
    },

    // 5 True/False
    {
      q: 'The server should trust client-provided remaining exam time without server-side timestamp validation.',
      type: 'TrueFalse', marks: 5, ans: 'False',
      explanation: 'Client time can be manipulated; timer expiration must be strictly enforced on the server.',
      options: [{ k: 'True', t: 'True' }, { k: 'False', t: 'False' }]
    },
    {
      q: 'A student should be permitted to query scorecards of other students by changing the URL parameter.',
      type: 'TrueFalse', marks: 5, ans: 'False',
      explanation: 'OEP-SR-005 mandates strict result isolation; access to another candidate\'s attempt must return 403.',
      options: [{ k: 'True', t: 'True' }, { k: 'False', t: 'False' }]
    },
    {
      q: 'Bcrypt automatically handles salt generation and embedding within the resulting password hash string.',
      type: 'TrueFalse', marks: 5, ans: 'True',
      explanation: 'Bcrypt embeds the algorithm version, cost factor, salt, and hash into a single standard string.',
      options: [{ k: 'True', t: 'True' }, { k: 'False', t: 'False' }]
    },
    {
      q: 'Objective questions (MCQ and True/False) are auto-graded immediately upon submission in the OEP system.',
      type: 'TrueFalse', marks: 5, ans: 'True',
      explanation: 'OEP-F-013 automates objective scoring against server keys, reducing instructor turnaround.',
      options: [{ k: 'True', t: 'True' }, { k: 'False', t: 'False' }]
    },
    {
      q: 'In a modular architecture, the presentation layer should directly execute raw SQL queries on the database.',
      type: 'TrueFalse', marks: 5, ans: 'False',
      explanation: 'Database communication must be mediated by the service/persistence layer via REST APIs.',
      options: [{ k: 'True', t: 'True' }, { k: 'False', t: 'False' }]
    },

    // 5 Short Answer Questions
    {
      q: 'Explain how the Layered Modular Architecture implemented in OEP adheres to the principle of Separation of Concerns.',
      type: 'ShortAnswer', marks: 10, ans: 'Layered architecture separates UI/presentation, API routing/business logic, and database persistence into distinct decoupled components.',
      explanation: 'Key points: UI only calls REST APIs; controllers enforce business rules and RBAC; persistence layer handles SQLite queries safely.',
      options: []
    },
    {
      q: 'Describe the sequence of actions that occur when an exam session countdown timer reaches zero (Auto-Submit).',
      type: 'ShortAnswer', marks: 10, ans: 'The client disables further input, sends current answers to the submit endpoint, and the server records the submit timestamp and locks the attempt.',
      explanation: 'Key points: Input freeze, final payload dispatch, server-side status updated to submitted, transition to auto-grading.',
      options: []
    },
    {
      q: 'What is the role of the Requirements Traceability Matrix (RTM) during the testing and closure phase of a software project?',
      type: 'ShortAnswer', marks: 10, ans: 'The RTM maps every business requirement to corresponding design elements, test cases, and pass/fail execution results to ensure 100% test coverage.',
      explanation: 'Key points: Forward/backward traceability, verification of test completeness, ensures no requirement is left untested.',
      options: []
    },
    {
      q: 'How does the OEP auto-save mechanism handle intermittent network disconnection during an active student exam?',
      type: 'ShortAnswer', marks: 10, ans: 'The browser stores uncommitted responses and retries synchronization periodically; upon page reload, previous answers are restored from the database.',
      explanation: 'Key points: Periodic async dispatch every 30s, persistence in database answers table, seamless restoration on reconnect.',
      options: []
    },
    {
      q: 'Explain the difference between Functional Requirements (FR) and Non-Functional Requirements (NFR) in the context of OEP.',
      type: 'ShortAnswer', marks: 10, ans: 'FRs define specific features like exam creation and auto-grading; NFRs define quality attributes such as sub-3s response latency and 500 concurrent user support.',
      explanation: 'Key points: FR = what the system does; NFR = how well the system performs (performance, reliability, security).',
      options: []
    }
  ];

  for (const q of questionsData) {
    const res = await run(
      'INSERT INTO questions (instructor_id, question_text, question_type, marks, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?)',
      [instructor.id, q.q, q.type, q.marks, q.ans, q.explanation]
    );
    const qId = res.id;

    for (const opt of q.options) {
      await run(
        'INSERT INTO options (question_id, option_key, option_text) VALUES (?, ?, ?)',
        [qId, opt.k, opt.t]
      );
    }
  }
  console.log('✅ Inserted 30 Questions (20 MCQ, 5 True/False, 5 Short Answer) with Option Sets.');

  const allQuestions = await all('SELECT id FROM questions ORDER BY id ASC');

  // 4. Create Seed Exams (STP §6.4: 1 Live, 1 Completed, 1 Upcoming, 1 Draft)
  const now = new Date();
  const pastStart = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const pastEnd = new Date(now.getTime() - 30 * 60 * 1000).toISOString();

  const liveStart = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
  const liveEnd = new Date(now.getTime() + 50 * 60 * 1000).toISOString();

  const futureStart = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const futureEnd = new Date(now.getTime() + 26 * 60 * 60 * 1000).toISOString();

  // Exam 1: Live Exam
  const examLive = await run(
    'INSERT INTO exams (title, description, instructor_id, duration_minutes, total_marks, start_time, end_time, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      'Software Engineering Midterm Assessment 2026',
      'Covers Requirements Engineering (SRS), Software Architecture (SAD), and Testing (STP). Active Window.',
      instructor.id,
      45,
      50,
      liveStart,
      liveEnd,
      1
    ]
  );

  // Link first 10 questions to Exam 1
  for (let i = 0; i < 10; i++) {
    await run('INSERT INTO exam_questions (exam_id, question_id, display_order) VALUES (?, ?, ?)', [
      examLive.id,
      allQuestions[i].id,
      i + 1
    ]);
  }

  // Exam 2: Completed Exam (with graded attempts)
  const examPast = await run(
    'INSERT INTO exams (title, description, instructor_id, duration_minutes, total_marks, start_time, end_time, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      'Advanced Software Testing & QA Quiz',
      'Unit testing, integration testing, boundary analysis, and defect management quiz.',
      instructor.id,
      30,
      25,
      pastStart,
      pastEnd,
      1
    ]
  );

  // Link questions 10 to 14 to Exam 2 (5 questions, 25 marks)
  for (let i = 10; i < 15; i++) {
    await run('INSERT INTO exam_questions (exam_id, question_id, display_order) VALUES (?, ?, ?)', [
      examPast.id,
      allQuestions[i].id,
      i - 9
    ]);
  }

  // Exam 3: Upcoming Exam (Locked)
  const examFuture = await run(
    'INSERT INTO exams (title, description, instructor_id, duration_minutes, total_marks, start_time, end_time, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      'Final Architecture & Design Evaluation',
      'Comprehensive final evaluation covering STRIDE threat modeling and microservices.',
      instructor.id,
      60,
      50,
      futureStart,
      futureEnd,
      1
    ]
  );

  for (let i = 15; i < 25; i++) {
    await run('INSERT INTO exam_questions (exam_id, question_id, display_order) VALUES (?, ?, ?)', [
      examFuture.id,
      allQuestions[i].id,
      i - 14
    ]);
  }

  // Exam 4: Draft Exam (Unpublished)
  await run(
    'INSERT INTO exams (title, description, instructor_id, duration_minutes, total_marks, start_time, end_time, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      'Agile & DevOps Practice Test (Draft)',
      'Draft exam for instructor review before release.',
      instructor.id,
      20,
      20,
      liveStart,
      liveEnd,
      0
    ]
  );

  console.log('✅ Created 4 Seed Exams (1 Live, 1 Completed, 1 Upcoming, 1 Draft).');

  // 5. Seed Past Attempts for Exam 2 so Evaluation & Scorecard work immediately (STP §6.4)
  // Student 1 attempt: scored 20/25 (4 correct, 1 wrong)
  const att1 = await run(
    'INSERT INTO attempts (exam_id, student_id, start_time, submit_time, score, is_graded, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [examPast.id, student1.id, pastStart, pastEnd, 20, 1, 'graded']
  );

  // Student 2 attempt: scored 15/25 (3 correct, 2 wrong)
  const att2 = await run(
    'INSERT INTO attempts (exam_id, student_id, start_time, submit_time, score, is_graded, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [examPast.id, student2.id, pastStart, pastEnd, 15, 1, 'graded']
  );

  // Student 1 answers
  const qListExam2 = [allQuestions[10], allQuestions[11], allQuestions[12], allQuestions[13], allQuestions[14]];
  const expectedAnswers = ['C', 'B', 'A', 'C', 'B'];

  for (let i = 0; i < 5; i++) {
    const isCorrect = i < 4; // 4 right
    const selected = isCorrect ? expectedAnswers[i] : 'D';
    await run(
      'INSERT INTO answers (attempt_id, question_id, selected_option, marks_awarded, auto_graded) VALUES (?, ?, ?, ?, ?)',
      [att1.id, qListExam2[i].id, selected, isCorrect ? 5 : 0, 1]
    );
  }

  // Student 2 answers
  for (let i = 0; i < 5; i++) {
    const isCorrect = i < 3; // 3 right
    const selected = isCorrect ? expectedAnswers[i] : 'D';
    await run(
      'INSERT INTO answers (attempt_id, question_id, selected_option, marks_awarded, auto_graded) VALUES (?, ?, ?, ?, ?)',
      [att2.id, qListExam2[i].id, selected, isCorrect ? 5 : 0, 1]
    );
  }

  // 6. Seed Audit Logs (OEP-NF-004)
  await run(
    'INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
    [instructor.id, 'EXAM_CREATE', 'Instructor created exam: Software Engineering Midterm Assessment 2026', '127.0.0.1']
  );
  await run(
    'INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
    [student1.id, 'EXAM_SUBMIT', 'Student Alpha submitted attempt for exam: Advanced Software Testing & QA Quiz', '127.0.0.1']
  );

  console.log('✅ Inserted Sample Attempts, Graded Answers, and Security Audit Logs.');
  console.log('🎉 Seed Complete! All data conforms to STP §6.4.');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error during seeding:', err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
