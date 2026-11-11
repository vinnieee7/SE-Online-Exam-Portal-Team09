const { serverError } = require('../utils/serverError');
const jwt = require('jsonwebtoken');
const { get } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'online_exam_portal_jwt_secret_team9_pesu_2026';

// Middleware to authenticate JWT token
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid authentication token' });
  }

  jwt.verify(token, JWT_SECRET, async (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden: Invalid or expired authentication token' });
    }

    try {
      // Verify user exists and account is not locked (OEP-SR-003)
      const user = await get('SELECT id, name, email, role, is_locked FROM users WHERE id = ?', [decodedUser.id]);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized: User account no longer exists' });
      }

      if (user.is_locked === 1) {
        return res.status(403).json({ error: 'Forbidden: User account is locked. Please contact administrator.' });
      }

      req.user = user;
      next();
    } catch (dbErr) {
      return res.status(500).json(serverError(dbErr, 'Database verification failed'));
    }
  });
}

// Middleware to authorize specific user roles (RBAC - OEP-F-004)
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Required: [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
}

module.exports = {
  JWT_SECRET,
  authenticateToken,
  requireRole
};
