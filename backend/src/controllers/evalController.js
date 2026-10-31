const { run, get, all } = require('../config/db');
const { logAuditAction } = require('../middleware/logger');

// M4: Evaluation, Results & Analytics (OEP-F-013..016)
// Developer: Akshansh Agrawal (PES2UG24CS045)
// Cross-tested by: A S Vincent (PES2UG24CS002)

// Auto-grading engine for objective questions (OEP-F-013, TC-Eval-01)
async function autoGradeObjectiveQuestions(attemptId) {
  const attempt = await get('SELECT * FROM attempts WHERE id = ?', [attemptId]);
  if (!attempt) return { autoScore: 0, hasSubjective: false };

  // Fetch all answers alongside question answer keys
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

  // If no subjective questions, mark attempt as fully graded
  const isFullyGraded = !hasSubjective ? 1 : 0;
  const newStatus = isFullyGraded ? 'graded' : 'submitted';

  await run(
    'UPDATE attempts SET score = ?, is_graded = ?, status = ? WHERE id = ?',
    [totalScore, isFullyGraded, newStatus, attemptId]
  );

  return { autoScore: totalScore, hasSubjective };
}

// Instructor: View all submissions for an exam (OEP-F-014)
exports.getExamSubmissions = async (req, res) => {
  try {
    const { examId } = req.params;
    const submissions = await all(
      `SELECT a.*, u.name as student_name, u.email as student_email
       FROM attempts a
       JOIN users u ON a.student_id = u.id
       WHERE a.exam_id = ?
       ORDER BY a.submit_time DESC`,
      [examId]
    );

    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions', details: err.message });
  }
};

// Instructor: Manual grading interface for subjective questions (OEP-F-014, TC-Eval-02)
exports.gradeManual = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { grades = [] } = req.body; // Array: [{ answer_id, marks_awarded, feedback }]

    const attempt = await get('SELECT * FROM attempts WHERE id = ?', [attemptId]);
    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    for (const g of grades) {
      await run(
        `UPDATE answers 
         SET marks_awarded = ?, instructor_feedback = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ? AND attempt_id = ?`,
        [g.marks_awarded || 0, g.feedback || '', g.answer_id, attemptId]
      );
    }

    // Recalculate total score
    const totalRow = await get(
      'SELECT SUM(marks_awarded) as final_score FROM answers WHERE attempt_id = ?',
      [attemptId]
    );

    const finalScore = totalRow?.final_score || 0;

    await run(
      'UPDATE attempts SET score = ?, is_graded = 1, status = ? WHERE id = ?',
      [finalScore, 'graded', attemptId]
    );

    await logAuditAction(req.user.id, 'MANUAL_GRADE', `Instructor graded attempt #${attemptId}. Final score: ${finalScore}`, req);

    res.json({
      message: 'Grading updated and finalized',
      finalScore
    });
  } catch (err) {
    res.status(500).json({ error: 'Manual grading failed', details: err.message });
  }
};

// Student Scorecard with Result Privacy Enforcement (OEP-F-015, OEP-SR-005, TC-Eval-03, TC-Sec-06)
exports.getScorecard = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await get(
      `SELECT a.*, e.title as exam_title, e.total_marks, e.is_published, u.name as student_name, u.email as student_email
       FROM attempts a
       JOIN exams e ON a.exam_id = e.id
       JOIN users u ON a.student_id = u.id
       WHERE a.id = ?`,
      [attemptId]
    );

    if (!attempt) {
      return res.status(404).json({ error: 'Scorecard not found' });
    }

    // RESULT ISOLATION ENFORCEMENT (OEP-SR-005 / TC-Sec-06)
    // A student can ONLY view their own scorecard!
    if (req.user.role === 'Student' && attempt.student_id !== req.user.id) {
      await logAuditAction(
        req.user.id,
        'SECURITY_VIOLATION_SCORECARD',
        `Unauthorized scorecard access attempt by student ${req.user.email} on attempt #${attemptId}`,
        req
      );
      return res.status(403).json({
        error: 'Forbidden: You are strictly prohibited from viewing another candidate’s scorecard (OEP-SR-005).'
      });
    }

    // Fetch detailed breakdown
    const breakdown = await all(
      `SELECT a.id as answer_id, a.selected_option, a.short_answer_text, a.marks_awarded, a.instructor_feedback,
              q.id as question_id, q.question_text, q.question_type, q.marks as max_marks, 
              q.correct_answer, q.explanation
       FROM answers a
       JOIN questions q ON a.question_id = q.id
       WHERE a.attempt_id = ?
       ORDER BY q.id ASC`,
      [attemptId]
    );

    // Attach options for MCQs
    for (const item of breakdown) {
      item.options = await all(
        'SELECT option_key, option_text FROM options WHERE question_id = ? ORDER BY option_key ASC',
        [item.question_id]
      );
    }

    res.json({
      attempt: {
        id: attempt.id,
        exam_title: attempt.exam_title,
        total_marks: attempt.total_marks,
        student_name: attempt.student_name,
        score: attempt.score,
        percentage: attempt.total_marks > 0 ? ((attempt.score / attempt.total_marks) * 100).toFixed(1) : 0,
        is_graded: attempt.is_graded,
        status: attempt.status,
        submit_time: attempt.submit_time
      },
      breakdown
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scorecard', details: err.message });
  }
};

// Exam Analytics & Item Analysis (OEP-F-016, TC-Eval-04)
exports.getExamAnalytics = async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await get('SELECT * FROM exams WHERE id = ?', [examId]);
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    const attempts = await all(
      'SELECT id, score, is_graded, status FROM attempts WHERE exam_id = ? AND status IN ("submitted", "graded")',
      [examId]
    );

    if (attempts.length === 0) {
      return res.json({
        examTitle: exam.title,
        totalAttempts: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passPercentage: 0,
        itemAnalysis: []
      });
    }

    const scores = attempts.map((a) => a.score || 0);
    const sum = scores.reduce((acc, curr) => acc + curr, 0);
    const averageScore = (sum / attempts.length).toFixed(2);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    // Pass cutoff = 40% of total marks
    const passCutoff = exam.total_marks * 0.4;
    const passedCount = scores.filter((s) => s >= passCutoff).length;
    const passPercentage = ((passedCount / attempts.length) * 100).toFixed(1);

    // Item Analysis: % correct for each question in this exam
    const examQuestions = await all(
      `SELECT q.id, q.question_text, q.question_type, q.marks, q.correct_answer
       FROM exam_questions eq
       JOIN questions q ON eq.question_id = q.id
       WHERE eq.exam_id = ?
       ORDER BY eq.display_order ASC`,
      [examId]
    );

    const itemAnalysis = [];
    for (const q of examQuestions) {
      const answersForQ = await all(
        `SELECT a.selected_option, a.marks_awarded 
         FROM answers a
         JOIN attempts att ON a.attempt_id = att.id
         WHERE att.exam_id = ? AND a.question_id = ?`,
        [examId, q.id]
      );

      const totalResponses = answersForQ.length;
      const correctResponses = answersForQ.filter((a) => a.marks_awarded > 0).length;
      const accuracyRate = totalResponses > 0 ? ((correctResponses / totalResponses) * 100).toFixed(1) : 0;

      itemAnalysis.push({
        questionId: q.id,
        questionText: q.question_text,
        questionType: q.question_type,
        maxMarks: q.marks,
        totalResponses,
        correctResponses,
        accuracyRate: parseFloat(accuracyRate)
      });
    }

    res.json({
      examTitle: exam.title,
      totalAttempts: attempts.length,
      averageScore: parseFloat(averageScore),
      highestScore,
      lowestScore,
      passPercentage: parseFloat(passPercentage),
      itemAnalysis
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate analytics', details: err.message });
  }
};

module.exports = {
  autoGradeObjectiveQuestions,
  getExamSubmissions: exports.getExamSubmissions,
  gradeManual: exports.gradeManual,
  getScorecard: exports.getScorecard,
  getExamAnalytics: exports.getExamAnalytics
};
