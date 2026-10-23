const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { run, get, all } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');
const { logAuditAction } = require('../middleware/logger');

// M1: User Registration (OEP-F-001)
// Developer: A S Vincent (PES2UG24CS002)
exports.register = async (req, res) => {
  try {
    const { name, email, password, role = 'Student' } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (!['Student', 'Instructor', 'Admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified. Must be Student, Instructor, or Admin' });
    }

    // Check email uniqueness (AC-F-001, TC-Auth-01)
    const existing = await get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Hash password with bcrypt salt factor 10 (OEP-SR-002)
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await run(
      'INSERT INTO users (name, email, password_hash, role, is_locked) VALUES (?, ?, ?, ?, 0)',
      [name.trim(), email.toLowerCase().trim(), passwordHash, role]
    );

    await logAuditAction(result.id, 'USER_REGISTER', `New user registered: ${email} as ${role}`, req);

    res.status(201).json({
      message: 'Registration successful',
      userId: result.id,
      user: {
        id: result.id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration', details: err.message });
  }
};

// M1: User Authentication & JWT Session (OEP-F-002)
// Developer: A S Vincent (PES2UG24CS002)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      await logAuditAction(null, 'LOGIN_FAILED', `Failed login attempt for non-existent email: ${email}`, req);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.is_locked === 1) {
      await logAuditAction(user.id, 'LOGIN_BLOCKED', `Blocked login attempt on locked account: ${email}`, req);
      return res.status(403).json({ error: 'Account is locked. Please contact support/administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await logAuditAction(user.id, 'LOGIN_FAILED', `Invalid password for user: ${email}`, req);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token with role claims (OEP-F-002)
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    await logAuditAction(user.id, 'LOGIN_SUCCESS', `User logged in successfully: ${email} (${user.role})`, req);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login', details: err.message });
  }
};

// M1: Get Current User Profile
exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

// M1: Password Reset via Mock OTP (OEP-F-003)
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await get('SELECT id, email FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      // Don't leak user existence in production
      return res.json({ message: 'If this email exists in our system, a 6-digit OTP has been dispatched.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry

    await run(
      'INSERT INTO password_resets (user_id, otp, expires_at) VALUES (?, ?, ?)',
      [user.id, otp, expiresAt]
    );

    await logAuditAction(user.id, 'PASSWORD_RESET_REQUEST', `OTP requested for email: ${email}`, req);

    // In demo environment, return OTP for easy testing verification (TC-Auth-03)
    res.json({
      message: 'OTP generated and sent to registered email address.',
      demo_otp: otp, // For lab verification convenience
      expires_in_minutes: 15
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to request password reset', details: err.message });
  }
};

exports.verifyPasswordReset = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    const user = await get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid password reset request' });
    }

    const resetRecord = await get(
      'SELECT id, expires_at, used FROM password_resets WHERE user_id = ? AND otp = ? AND used = 0 ORDER BY id DESC LIMIT 1',
      [user.id, otp]
    );

    if (!resetRecord) {
      return res.status(400).json({ error: 'Invalid or already utilized OTP' });
    }

    if (new Date(resetRecord.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Expired OTP. Please request a new code.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await run('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.id]);
    await run('UPDATE password_resets SET used = 1 WHERE id = ?', [resetRecord.id]);

    await logAuditAction(user.id, 'PASSWORD_RESET_SUCCESS', `Password successfully reset for ${email}`, req);

    res.json({ message: 'Password successfully updated. You may now login.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password', details: err.message });
  }
};

// Admin user management (OEP-F-004)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await all('SELECT id, name, email, role, is_locked, created_at FROM users ORDER BY id ASC');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, is_locked } = req.body;

    if (role && !['Student', 'Instructor', 'Admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const updates = [];
    const params = [];

    if (role !== undefined) {
      updates.push('role = ?');
      params.push(role);
    }
    if (is_locked !== undefined) {
      updates.push('is_locked = ?');
      params.push(is_locked ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No update parameters provided' });
    }

    params.push(id);
    await run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

    await logAuditAction(req.user.id, 'USER_UPDATE', `Admin updated user #${id}: ${updates.join(', ')}`, req);

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user', details: err.message });
  }
};
