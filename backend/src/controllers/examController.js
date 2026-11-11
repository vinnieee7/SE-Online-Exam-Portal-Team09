const { serverError } = require('../utils/serverError');
const { run, get, all } = require('../config/db');
const { logAuditAction } = require('../middleware/logger');

// M2: Exam & Question-Bank Management (OEP-F-005..008)
// Developer: Aadish Sarin (PES2UG24CS007)
// Cross-tested by: Aditya Rao (PES2UG24CS034)

// Fisher-Yates (Knuth) unbiased shuffle algorithm (OEP-F-008, TC-Exam-04)
function shuffleArray(array) {
  const arr = Array.isArray(array) ? [...array] : [];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Returns null when question_ids is a valid array of existing bank ids, otherwise a short description of the bad values
async function findMissingQuestionIds(questionIds) {
  if (!Array.isArray(questionIds)) return 'not an array';
  const ids = questionIds.map(Number);
  if (ids.some((n) => !Number.isInteger(n) || n <= 0)) return 'non-numeric id';
  if (ids.length === 0) return null;
  const placeholders = ids.map(() => '?').join(',');
  const found = await all(`SELECT id FROM questions WHERE id IN (${placeholders})`, ids);
  const existing = new Set(found.map((r) => r.id));
  const missing = [...new Set(ids)].filter((n) => !existing.has(n));
  return missing.length ? missing.slice(0, 5).join(', ') : null;
}

// Get All Exams (Role-aware listing - OEP-F-005, OEP-F-009)
exports.getAllExams = async (req, res) => {
  try {
    const isStudent = req.user && req.user.role === 'Student';

    let exams;
    if (isStudent) {
      exams = await all(
        `SELECT e.*,
                (SELECT COUNT(*) FROM exam_questions eq WHERE eq.exam_id = e.id) as question_count,
                (SELECT a.status FROM attempts a WHERE a.exam_id = e.id AND a.student_id = ?) as attempt_status,
                (SELECT a.id FROM attempts a WHERE a.exam_id = e.id AND a.student_id = ?) as attempt_id
         FROM exams e
         WHERE e.is_published = 1
         ORDER BY e.start_time ASC, e.id ASC`,
        [req.user.id, req.user.id]
      );
    } else {
      exams = await all(
        `SELECT e.*,
                u.name as instructor_name,
                (SELECT COUNT(*) FROM exam_questions eq WHERE eq.exam_id = e.id) as question_count
         FROM exams e
         LEFT JOIN users u ON e.instructor_id = u.id
         ORDER BY e.id DESC`
      );
    }

    res.json({ exams });
  } catch (err) {
    res.status(500).json(serverError(err, 'Failed to retrieve exams'));
  }
};

// Get Single Exam by ID with associated questions (OEP-F-005, OEP-F-008)
exports.getExamById = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await get('SELECT * FROM exams WHERE id = ?', [id]);

    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    const isStudent = req.user && req.user.role === 'Student';
    if (isStudent && exam.is_published === 0) {
      return res.status(403).json({ error: 'Exam is not currently published' });
    }

    let questions = await all(
      `SELECT q.id, q.question_text, q.question_type, q.marks, eq.display_order
       FROM exam_questions eq
       JOIN questions q ON eq.question_id = q.id
       WHERE eq.exam_id = ?
       ORDER BY eq.display_order ASC`,
      [id]
    );

    if (isStudent || req.query.randomize === 'true') {
      questions = shuffleArray(questions);
    }

    for (const q of questions) {
      q.options = await all(
        'SELECT id, option_key, option_text FROM options WHERE question_id = ? ORDER BY option_key ASC',
        [q.id]
      );
    }

    res.json({ exam, questions });
  } catch (err) {
    res.status(500).json(serverError(err, 'Failed to retrieve exam details'));
  }
};

// Create New Scheduled Exam (OEP-F-005, OEP-F-007, DEF-004, TC-Exam-01, TC-Exam-03)
exports.createExam = async (req, res) => {
  try {
    const {
      title,
      description = '',
      duration_minutes,
      total_marks,
      start_time,
      end_time,
      question_ids = [],
      is_published = 0
    } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'Exam title is required' });
    }

    const duration = Number(duration_minutes);
    if (!Number.isFinite(duration) || duration <= 0) {
      return res.status(400).json({ error: 'Exam duration_minutes must be a positive number' });
    }

    if (!start_time || !end_time) {
      return res.status(400).json({ error: 'Both start_time and end_time are required' });
    }

    const startDate = new Date(start_time);
    const endDate = new Date(end_time);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format for start_time or end_time' });
    }

    // Schedule Window Validation (OEP-F-007, DEF-004, TC-Exam-03)
    if (endDate <= startDate) {
      return res.status(400).json({
        error: 'Invalid exam schedule: end time must be strictly after start time (DEF-004).'
      });
    }

    // Every linked question must exist in the bank (otherwise the insert fails with a foreign-key error → 500)
    const invalidIds = await findMissingQuestionIds(question_ids);
    if (invalidIds) {
      return res.status(400).json({ error: `question_ids must be an array of existing question ids (invalid: ${invalidIds})` });
    }

    // Compute total marks from linked questions if not explicitly provided
    let computedMarks = total_marks ? Number(total_marks) : 0;
    if (!computedMarks && Array.isArray(question_ids) && question_ids.length > 0) {
      const placeholders = question_ids.map(() => '?').join(',');
      const sumRow = await get(
        `SELECT SUM(marks) as total FROM questions WHERE id IN (${placeholders})`,
        question_ids
      );
      computedMarks = sumRow?.total || 100;
    }
    if (!computedMarks || computedMarks <= 0) {
      computedMarks = 100;
    }

    const result = await run(
      `INSERT INTO exams (title, description, instructor_id, duration_minutes, total_marks, start_time, end_time, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(title).trim(),
        description,
        req.user.id,
        duration,
        computedMarks,
        startDate.toISOString(),
        endDate.toISOString(),
        is_published ? 1 : 0
      ]
    );

    const examId = result.id;

    // Associate selected banked questions with the exam
    if (Array.isArray(question_ids) && question_ids.length > 0) {
      for (let i = 0; i < question_ids.length; i++) {
        await run(
          'INSERT OR IGNORE INTO exam_questions (exam_id, question_id, display_order) VALUES (?, ?, ?)',
          [examId, question_ids[i], i + 1]
        );
      }
    }

    await logAuditAction(
      req.user.id,
      'EXAM_CREATE',
      `Instructor created exam #${examId}: ${String(title).trim()}`,
      req
    );

    res.status(201).json({
      message: 'Exam created successfully',
      examId,
      exam: {
        id: examId,
        title: String(title).trim(),
        description,
        instructor_id: req.user.id,
        duration_minutes: duration,
        total_marks: computedMarks,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        is_published: is_published ? 1 : 0
      }
    });
  } catch (err) {
    res.status(500).json(serverError(err, 'Failed to create exam'));
  }
};

// Update Exam Details / Publish Status (OEP-F-005, OEP-F-007)
exports.updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await get('SELECT * FROM exams WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    const {
      title,
      description,
      duration_minutes,
      total_marks,
      start_time,
      end_time,
      is_published,
      question_ids
    } = req.body;

    const updatedStart = start_time !== undefined ? new Date(start_time) : new Date(existing.start_time);
    const updatedEnd = end_time !== undefined ? new Date(end_time) : new Date(existing.end_time);

    if (isNaN(updatedStart.getTime()) || isNaN(updatedEnd.getTime())) {
      return res.status(400).json({ error: 'Invalid date format for start_time or end_time' });
    }

    if (updatedEnd <= updatedStart) {
      return res.status(400).json({
        error: 'Invalid exam schedule: end time must be strictly after start time (DEF-004).'
      });
    }

    if (duration_minutes !== undefined && Number(duration_minutes) <= 0) {
      return res.status(400).json({ error: 'Exam duration_minutes must be a positive number' });
    }

    const newTitle = title !== undefined ? String(title).trim() : existing.title;
    const newDesc = description !== undefined ? description : existing.description;
    const newDuration = duration_minutes !== undefined ? Number(duration_minutes) : existing.duration_minutes;
    const newMarks = total_marks !== undefined ? Number(total_marks) : existing.total_marks;
    const newPublished = is_published !== undefined ? (is_published ? 1 : 0) : existing.is_published;

    await run(
      `UPDATE exams
       SET title = ?, description = ?, duration_minutes = ?, total_marks = ?, start_time = ?, end_time = ?, is_published = ?
       WHERE id = ?`,
      [
        newTitle,
        newDesc,
        newDuration,
        newMarks,
        updatedStart.toISOString(),
        updatedEnd.toISOString(),
        newPublished,
        id
      ]
    );

    if (question_ids !== undefined) {
      const invalidIds = await findMissingQuestionIds(question_ids);
      if (invalidIds) {
        return res.status(400).json({ error: `question_ids must be an array of existing question ids (invalid: ${invalidIds})` });
      }
    }

    if (Array.isArray(question_ids)) {
      await run('DELETE FROM exam_questions WHERE exam_id = ?', [id]);
      for (let i = 0; i < question_ids.length; i++) {
        await run(
          'INSERT OR IGNORE INTO exam_questions (exam_id, question_id, display_order) VALUES (?, ?, ?)',
          [id, question_ids[i], i + 1]
        );
      }
    }

    await logAuditAction(req.user.id, 'EXAM_UPDATE', `Updated exam #${id} (is_published=${newPublished})`, req);

    res.json({
      message: 'Exam updated successfully',
      examId: Number(id)
    });
  } catch (err) {
    res.status(500).json(serverError(err, 'Failed to update exam'));
  }
};

// Delete Exam (OEP-F-005)
exports.deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await get('SELECT * FROM exams WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    await run('DELETE FROM exams WHERE id = ?', [id]);
    await logAuditAction(req.user.id, 'EXAM_DELETE', `Deleted exam #${id}: ${existing.title}`, req);

    res.json({ message: 'Exam deleted successfully' });
  } catch (err) {
    res.status(500).json(serverError(err, 'Failed to delete exam'));
  }
};

// Get Question Bank (OEP-F-006)
exports.getQuestionBank = async (req, res) => {
  try {
    const questions = await all('SELECT * FROM questions ORDER BY id ASC');

    for (const q of questions) {
      q.options = await all(
        'SELECT id, option_key, option_text FROM options WHERE question_id = ? ORDER BY option_key ASC',
        [q.id]
      );
    }

    res.json({ questions });
  } catch (err) {
    res.status(500).json(serverError(err, 'Failed to load question bank'));
  }
};

// Add Question to Question Bank (OEP-F-006, TC-Exam-02)
exports.addQuestion = async (req, res) => {
  try {
    const {
      question_text,
      question_type,
      marks = 5,
      correct_answer,
      explanation = '',
      options = []
    } = req.body;

    if (!question_text || !String(question_text).trim()) {
      return res.status(400).json({ error: 'Question text is required' });
    }

    if (!['MCQ', 'TrueFalse', 'ShortAnswer'].includes(question_type)) {
      return res.status(400).json({
        error: 'Invalid question_type. Must be MCQ, TrueFalse, or ShortAnswer'
      });
    }

    if (correct_answer === undefined || correct_answer === null || String(correct_answer).trim() === '') {
      return res.status(400).json({ error: 'Correct answer key is required' });
    }

    const numericMarks = Number(marks);
    if (!Number.isFinite(numericMarks) || numericMarks <= 0) {
      return res.status(400).json({ error: 'Question marks must be a positive number' });
    }

    const qRes = await run(
      `INSERT INTO questions (instructor_id, question_text, question_type, marks, correct_answer, explanation)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        String(question_text).trim(),
        question_type,
        numericMarks,
        String(correct_answer).trim(),
        explanation
      ]
    );

    const questionId = qRes.id;

    // Normalize options: support both { k, t } (seed/test format) and { option_key, option_text } (UI format)
    let normalizedOptions = [];
    if (question_type === 'MCQ') {
      normalizedOptions = (Array.isArray(options) ? options : [])
        .map((opt) => ({
          key: opt.option_key || opt.k,
          text: opt.option_text || opt.t
        }))
        .filter((o) => o.key && o.text);
    } else if (question_type === 'TrueFalse') {
      if (Array.isArray(options) && options.length > 0) {
        normalizedOptions = options
          .map((opt) => ({
            key: opt.option_key || opt.k,
            text: opt.option_text || opt.t
          }))
          .filter((o) => o.key && o.text);
      } else {
        normalizedOptions = [
          { key: 'True', text: 'True' },
          { key: 'False', text: 'False' }
        ];
      }
    }

    for (const opt of normalizedOptions) {
      await run(
        'INSERT INTO options (question_id, option_key, option_text) VALUES (?, ?, ?)',
        [questionId, String(opt.key).trim(), String(opt.text).trim()]
      );
    }

    await logAuditAction(
      req.user.id,
      'QUESTION_CREATE',
      `Added ${question_type} question #${questionId} to bank`,
      req
    );

    res.status(201).json({
      message: 'Question added to bank successfully',
      questionId,
      question: {
        id: questionId,
        instructor_id: req.user.id,
        question_text: String(question_text).trim(),
        question_type,
        marks: numericMarks,
        correct_answer: String(correct_answer).trim(),
        explanation,
        options: normalizedOptions.map((o) => ({ option_key: o.key, option_text: o.text }))
      }
    });
  } catch (err) {
    res.status(500).json(serverError(err, 'Failed to add question to bank'));
  }
};

// Delete Question from Question Bank (OEP-F-006)
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await get('SELECT * FROM questions WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({ error: 'Question not found' });
    }

    await run('DELETE FROM questions WHERE id = ?', [id]);
    await logAuditAction(req.user.id, 'QUESTION_DELETE', `Deleted question #${id} from bank`, req);

    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    res.status(500).json(serverError(err, 'Failed to delete question'));
  }
};

// Export Fisher-Yates shuffle helper for unit/integration verification (OEP-F-008, TC-Exam-04)
exports.shuffleArray = shuffleArray;
