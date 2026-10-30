const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// Student initiates/resumes exam attempt
router.get('/exams/:examId/attempt', requireRole('Student', 'Admin'), deliveryController.startOrGetAttempt);

// Periodic auto-save endpoint
router.post('/attempts/:attemptId/answers', requireRole('Student', 'Admin'), deliveryController.saveAnswers);

// Final submission endpoint (manual or triggered on timer expiration)
router.post('/attempts/:attemptId/submit', requireRole('Student', 'Admin'), deliveryController.submitAttempt);

module.exports = router;
