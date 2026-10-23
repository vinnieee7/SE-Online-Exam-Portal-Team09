const { run } = require('../config/db');

async function logAuditAction(userId, action, details, req = null) {
  try {
    const ip = (req && req.headers && req.headers['x-forwarded-for']) 
      || (req && req.socket && req.socket.remoteAddress) 
      || (req && req.ip) 
      || '127.0.0.1';
    await run(
      'INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
      [userId || null, action, details, ip]
    );
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
}

module.exports = { logAuditAction };
