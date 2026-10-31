const express = require('express');
const router = express.Router();
const evalController = require('../controllers/evalController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// Student view own scorecard (or Admin/Instructor view)
router.get('/attempts/:attemptId/scorecard', evalController.getScorecard);

// Student view own scorecard for an exam (looks up the logged-in candidate's attempt)
router.get('/exams/:examId/my-scorecard', requireRole('Student'), evalController.getMyScorecard);

// Instructor view submissions for an exam
router.get('/exams/:examId/submissions', requireRole('Instructor', 'Admin'), evalController.getExamSubmissions);

// Instructor manual grading of subjective answers
router.post('/attempts/:attemptId/grade', requireRole('Instructor', 'Admin'), evalController.gradeManual);

// Exam performance and item difficulty analytics
router.get('/exams/:examId/analytics', requireRole('Instructor', 'Admin'), evalController.getExamAnalytics);

module.exports = router;
