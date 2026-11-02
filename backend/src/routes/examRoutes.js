const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All exam and question bank routes require authentication
router.use(authenticateToken);

// Question Bank Routes (OEP-F-006 - Restricted to Instructor and Admin)
router.get('/questions/bank', requireRole('Instructor', 'Admin'), examController.getQuestionBank);
router.get('/questions', requireRole('Instructor', 'Admin'), examController.getQuestionBank);
router.post('/questions', requireRole('Instructor', 'Admin'), examController.addQuestion);
router.delete('/questions/:id', requireRole('Instructor', 'Admin'), examController.deleteQuestion);

// Exam Lifecycle CRUD Routes (OEP-F-005, OEP-F-007, OEP-F-008)
router.get('/', examController.getAllExams);
router.get('/:id', examController.getExamById);
router.post('/', requireRole('Instructor', 'Admin'), examController.createExam);
router.put('/:id', requireRole('Instructor', 'Admin'), examController.updateExam);
router.delete('/:id', requireRole('Instructor', 'Admin'), examController.deleteExam);

module.exports = router;
