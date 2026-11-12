const { serverError } = require('../utils/serverError');
const { run, get, all } = require('../config/db');
const { logAuditAction } = require('../middleware/logger');

// M3: Exam Delivery / Test-Taking Engine (OEP-F-009..012)
// Developer: Aditya Rao (PES2UG24CS034)

// Small seeded PRNG (mulberry32): the same seed always yields the same sequence of numbers in [0, 1)
function seededRandom(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher-Yates shuffle algorithm (OEP-F-008)
function shuffleArray(array, random = Math.random) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Start or Resume an Exam Attempt (OEP-F-009, OEP-F-010)
exports.startOrGetAttempt = async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.id;

    const exam = await get('SELECT * FROM exams WHERE id = ?', [examId]);
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    if (exam.is_published === 0 && req.user.role === 'Student') {
      return res.status(403).json({ error: 'Exam is not currently published' });
    }

    const now = new Date();
    const startTime = new Date(exam.start_time);
    const endTime = new Date(exam.end_time);

    // Pre-exam lock verification (TC-Take-01)
    if (now < startTime) {
      return res.status(400).json({
        error: 'Exam has not started yet',
        scheduled_start: exam.start_time
      });
    }

    // Check if exam window has already ended
    if (now > endTime) {
      return res.status(400).json({
        error: 'Exam window has expired',
        scheduled_end: exam.end_time
      });
    }

    // Find existing attempt or create new one
    let attempt = await get(
      'SELECT * FROM attempts WHERE exam_id = ? AND student_id = ?',
      [examId, studentId]
    );

    if (!attempt) {
      // INSERT OR IGNORE + re-read: two simultaneous start requests (double click, React StrictMode)
      // both end up with the single attempt allowed by UNIQUE(exam_id, student_id) instead of a 500 error
      const startIso = now.toISOString();
      const attRes = await run(
        'INSERT OR IGNORE INTO attempts (exam_id, student_id, start_time, status) VALUES (?, ?, ?, ?)',
        [examId, studentId, startIso, 'in_progress']
      );
      attempt = await get(
        'SELECT * FROM attempts WHERE exam_id = ? AND student_id = ?',
        [examId, studentId]
      );
      if (attRes.changes === 1) {
        await logAuditAction(studentId, 'EXAM_ATTEMPT_START', `Student started attempt #${attempt.id} on exam #${examId}`, req);
      }
    }

    if (attempt.status === 'submitted' || attempt.status === 'graded') {
      return res.json({
        status: 'already_submitted',
        attempt,
        message: 'You have already submitted this exam.'
      });
    }

    // Server-enforced remaining time calculation (OEP-F-010, TC-Take-02)
    let startTimeStr = String(attempt.start_time);
    if (!startTimeStr.includes('T')) {
      startTimeStr = startTimeStr.replace(' ', 'T');
    }
    if (!startTimeStr.endsWith('Z') && !startTimeStr.includes('+')) {
      startTimeStr += 'Z';
    }
    const attemptStartTime = new Date(startTimeStr).getTime();
    const allowedDurationMs = exam.duration_minutes * 60 * 1000;
    const elapsedMs = Math.max(0, now.getTime() - attemptStartTime);
    const windowRemainingMs = Math.max(0, endTime.getTime() - now.getTime());

    // The timer is bounded by both exam duration and end-time of window
    const remainingSeconds = Math.max(0, Math.floor(Math.min(allowedDurationMs - elapsedMs, windowRemainingMs) / 1000));

    // Fetch questions linked to this exam
    // SECURITY MANDATE (OEP-SR-004 / TC-Sec-05):
    // DO NOT SELECT correct_answer or explanation! Strip completely from student payload!
    let questions = await all(
      `SELECT q.id, q.question_text, q.question_type, q.marks, eq.display_order
       FROM exam_questions eq
       JOIN questions q ON eq.question_id = q.id
       WHERE eq.exam_id = ?
       ORDER BY eq.display_order ASC`,
      [examId]
    );

    // Randomize question sequence per candidate (OEP-F-008, DEV-02). Seeding with the attempt id keeps the
    // order identical across refreshes and resumes of one attempt, while each candidate gets a different order.
    questions = shuffleArray(questions, seededRandom(attempt.id));

    // Attach options for each question
    for (const q of questions) {
      q.options = await all(
        'SELECT id, option_key, option_text FROM options WHERE question_id = ? ORDER BY option_key ASC',
        [q.id]
      );
    }

    // Fetch previously saved answers for this attempt (OEP-F-011 Auto-save recovery)
    const savedAnswers = await all(
      'SELECT question_id, selected_option, short_answer_text FROM answers WHERE attempt_id = ?',
      [attempt.id]
    );

    const savedAnswersMap = {};
    savedAnswers.forEach((ans) => {
      savedAnswersMap[ans.question_id] = {
        selected_option: ans.selected_option,
        short_answer_text: ans.short_answer_text
      };
    });

    res.json({
      attemptId: attempt.id,
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        total_marks: exam.total_marks,
        duration_minutes: exam.duration_minutes,
        remaining_seconds: remainingSeconds
      },
      questions,
      savedAnswers: savedAnswersMap
    });
  } catch (err) {
    res.status(500).json(serverError(err, 'Failed to initiate exam attempt'));
  }
};

// Periodic Auto-Save of Answers (OEP-F-011, TC-Take-03)
exports.saveAnswers = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body; // Array: [{ question_id, selected_option, short_answer_text }]

    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers payload must be an array' });
    }

    const attempt = await get('SELECT * FROM attempts WHERE id = ?', [attemptId]);
    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    if (attempt.student_id !== req.user.id && req.user.role === 'Student') {
      return res.status(403).json({ error: 'Unauthorized attempt access' });
    }

    if (attempt.status === 'submitted' || attempt.status === 'graded') {
      return res.status(400).json({ error: 'Cannot auto-save. Exam has already been submitted.' });
    }

    // Upsert each answer into answers table
    for (const ans of answers) {
      await run(
        `INSERT INTO answers (attempt_id, question_id, selected_option, short_answer_text) 
         VALUES (?, ?, ?, ?)
         ON CONFLICT(attempt_id, question_id) DO UPDATE SET
           selected_option = excluded.selected_option,
           short_answer_text = excluded.short_answer_text,
           updated_at = CURRENT_TIMESTAMP`,
        [attemptId, ans.question_id, ans.selected_option || null, ans.short_answer_text || null]
      );
    }

    res.json({
      message: 'Answers auto-saved successfully',
      saved_count: answers.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json(serverError(err, 'Auto-save failed'));
  }
};

// Final Submission (Manual or Automatic at 00:00 - OEP-F-011, TC-Take-04)
exports.submitAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const attempt = await get('SELECT * FROM attempts WHERE id = ?', [attemptId]);

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    if (attempt.student_id !== req.user.id && req.user.role === 'Student') {
      return res.status(403).json({ error: 'Unauthorized attempt submission' });
    }

    if (attempt.status === 'submitted' || attempt.status === 'graded') {
      return res.json({ message: 'Exam was already submitted previously', attempt });
    }

    // Mark as submitted
    await run(
      'UPDATE attempts SET status = ?, submit_time = CURRENT_TIMESTAMP WHERE id = ?',
      ['submitted', attemptId]
    );

    // Trigger immediate auto-grading for objective questions (OEP-F-013)
    let autoGradeResult = { autoScore: 0, hasSubjective: false };
    try {
      const { autoGradeObjectiveQuestions } = require('./evalController');
      if (typeof autoGradeObjectiveQuestions === 'function') {
        autoGradeResult = await autoGradeObjectiveQuestions(attemptId);
      }
    } catch (_) {
      // Standalone auto-grading fallback if evalController is not yet merged
      const studentAnswers = await all(
        `SELECT a.id as answer_id, a.question_id, a.selected_option, 
                q.question_type, q.marks, q.correct_answer
         FROM answers a
         JOIN questions q ON a.question_id = q.id
         WHERE a.attempt_id = ?`,
        [attemptId]
      );

      let totalScore = 0;
      let hasSubjective = false;

      for (const ans of studentAnswers) {
        if (ans.question_type === 'MCQ' || ans.question_type === 'TrueFalse') {
          const isCorrect = String(ans.selected_option).trim().toLowerCase() === String(ans.correct_answer).trim().toLowerCase();
          const awarded = isCorrect ? ans.marks : 0;
          totalScore += awarded;

          await run(
            'UPDATE answers SET marks_awarded = ?, auto_graded = 1 WHERE id = ?',
            [awarded, ans.answer_id]
          );
        } else if (ans.question_type === 'ShortAnswer') {
          hasSubjective = true;
        }
      }

      const isFullyGraded = !hasSubjective ? 1 : 0;
      const newStatus = isFullyGraded ? 'graded' : 'submitted';

      await run(
        'UPDATE attempts SET score = ?, is_graded = ?, status = ? WHERE id = ?',
        [totalScore, isFullyGraded, newStatus, attemptId]
      );

      autoGradeResult = { autoScore: totalScore, hasSubjective };
    }

    await logAuditAction(req.user.id, 'EXAM_SUBMIT', `Student submitted attempt #${attemptId}. Auto-graded score: ${autoGradeResult.autoScore}`, req);

    res.json({
      message: 'Exam submitted successfully',
      status: 'submitted',
      autoGradedScore: autoGradeResult.autoScore,
      requiresManualGrading: autoGradeResult.hasSubjective
    });
  } catch (err) {
    res.status(500).json(serverError(err, 'Submission failed'));
  }
};

// Exported for verification tests (TC-Exam-04, TC-Take-05)
exports.shuffleArray = shuffleArray;
exports.seededRandom = seededRandom;
