const { run, get, all } = require('../config/db');
const { logAuditAction } = require('../middleware/logger');

// M3: Exam Delivery / Test-Taking Engine (OEP-F-009..012)
// Developer: Aditya Rao (PES2UG24CS034)

// Fisher-Yates shuffle algorithm (OEP-F-008)
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
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
      const startIso = now.toISOString();
      const attRes = await run(
        'INSERT INTO attempts (exam_id, student_id, start_time, status) VALUES (?, ?, ?, ?)',
        [examId, studentId, startIso, 'in_progress']
      );
      attempt = await get('SELECT * FROM attempts WHERE id = ?', [attRes.id]);
      await logAuditAction(studentId, 'EXAM_ATTEMPT_START', `Student started attempt #${attempt.id} on exam #${examId}`, req);
    } else if (attempt.status === 'submitted' || attempt.status === 'graded') {
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

    // Randomize question sequence per student session (OEP-F-008)
    questions = shuffleArray(questions);

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
    res.status(500).json({ error: 'Failed to initiate exam attempt', details: err.message });
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
      const existing = await get(
        'SELECT id FROM answers WHERE attempt_id = ? AND question_id = ?',
        [attemptId, ans.question_id]
      );

      if (existing) {
        await run(
          `UPDATE answers 
           SET selected_option = ?, short_answer_text = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          [ans.selected_option || null, ans.short_answer_text || null, existing.id]
        );
      } else {
        await run(
          `INSERT INTO answers (attempt_id, question_id, selected_option, short_answer_text) 
           VALUES (?, ?, ?, ?)`,
          [attemptId, ans.question_id, ans.selected_option || null, ans.short_answer_text || null]
        );
      }
    }

    res.json({
      message: 'Answers auto-saved successfully',
      saved_count: answers.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Auto-save failed', details: err.message });
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
    res.status(500).json({ error: 'Submission failed', details: err.message });
  }
};
