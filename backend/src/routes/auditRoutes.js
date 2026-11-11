const { serverError } = require('../utils/serverError');
const express = require('express');
const router = express.Router();
const { all } = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// Admin view audit logs (OEP-NF-004)
router.get('/', requireRole('Admin'), async (req, res) => {
  try {
    const logs = await all(
      `SELECT al.*, u.name as user_name, u.email as user_email
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT 100`
    );
    res.json({ logs });
  } catch (err) {
    res.status(500).json(serverError(err, 'Failed to retrieve audit logs'));
  }
});

module.exports = router;
