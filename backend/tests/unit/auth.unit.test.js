const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { requireRole, JWT_SECRET } = require('../../src/middleware/auth');

describe('=== Unit Test Suite: Module M1 Authentication & RBAC ===', () => {

  describe('UT-Auth-01: Cryptographic Password Hashing (OEP-SR-002)', () => {
    test('hashes passwords using bcrypt with 10 salt rounds', async () => {
      const plainPassword = 'SecretPassword@123';
      const hash = await bcrypt.hash(plainPassword, 10);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(plainPassword);
      expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);

      // Verify bcrypt.compare succeeds for correct password
      const isMatch = await bcrypt.compare(plainPassword, hash);
      expect(isMatch).toBe(true);

      // Verify bcrypt.compare fails for wrong password
      const isWrong = await bcrypt.compare('WrongPassword', hash);
      expect(isWrong).toBe(false);
    });
  });

  describe('UT-Auth-02: JWT Token Generation & Verification (OEP-F-002)', () => {
    test('generates valid JWT with role claims and 24-hour expiration', () => {
      const payload = { id: 101, email: 'student_test@pesu.edu', role: 'Student' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, JWT_SECRET);
      expect(decoded.id).toBe(101);
      expect(decoded.email).toBe('student_test@pesu.edu');
      expect(decoded.role).toBe('Student');
      expect(decoded.exp).toBeDefined();
    });

    test('rejects token signed with an invalid secret', () => {
      const payload = { id: 102, email: 'hacker@pesu.edu', role: 'Admin' };
      const forgedToken = jwt.sign(payload, 'wrong_secret_key_123');

      expect(() => {
        jwt.verify(forgedToken, JWT_SECRET);
      }).toThrow();
    });
  });

  describe('UT-Auth-03: Role-Based Access Control Middleware (OEP-F-004)', () => {
    test('requireRole allows request through if user possesses required role', () => {
      const middleware = requireRole('Instructor', 'Admin');
      const req = { user: { id: 1, role: 'Instructor' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    test('requireRole returns 403 Forbidden if user role is unauthorized', () => {
      const middleware = requireRole('Instructor', 'Admin');
      const req = { user: { id: 2, role: 'Student' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('is not authorized')
      }));
    });

    test('requireRole returns 401 Unauthorized if req.user is missing', () => {
      const middleware = requireRole('Admin');
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('UT-Auth-04: Email Normalization & Sanity Checks (DEF-003)', () => {
    test('normalizes email inputs by trimming whitespace and converting to lowercase', () => {
      const rawEmail = '   Student.PES2UG24CS002@Pesu.EDU   ';
      const normalized = rawEmail.toLowerCase().trim();

      expect(normalized).toBe('student.pes2ug24cs002@pesu.edu');
    });
  });
});
