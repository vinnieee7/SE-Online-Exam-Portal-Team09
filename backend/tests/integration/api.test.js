const request = require('supertest');
const app = require('../../src/app');
const { seedDatabase } = require('../../src/db/seed');

const hasExamController = (() => { try { require.resolve('../../src/controllers/examController'); return true; } catch (_) { return false; } })();
const hasDeliveryController = (() => { try { require.resolve('../../src/controllers/deliveryController'); return true; } catch (_) { return false; } })();
const hasEvalController = (() => { try { require.resolve('../../src/controllers/evalController'); return true; } catch (_) { return false; } })();

const describeM2 = hasExamController ? describe : describe.skip;
const describeM3 = hasDeliveryController ? describe : describe.skip;
const describeM4 = hasEvalController ? describe : describe.skip;

let studentToken;
let instructorToken;
let adminToken;
let student2Token;

beforeAll(async () => {
  // Reset seed database before running test suite (STP Â§6.4)
  await seedDatabase();

  // Obtain Student 1 token
  const sRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'student1@pesu.edu', password: 'Password@123' });
  studentToken = sRes.body.token;

  // Obtain Student 2 token
  const s2Res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'student2@pesu.edu', password: 'Password@123' });
  student2Token = s2Res.body.token;

  // Obtain Instructor token
  const iRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'instructor1@pesu.edu', password: 'Password@123' });
  instructorToken = iRes.body.token;

  // Obtain Admin token
  const aRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@pesu.edu', password: 'Password@123' });
  adminToken = aRes.body.token;
});

describe('=== Online Exam Portal (OEP) Comprehensive Test Suite ===', () => {

  // 1. System Health
  test('TC-SYS-01: Health check returns online status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ONLINE');
  });

  // 2. Module M1: Authentication & RBAC (Vincent - PES2UG24CS002)
  describe('Module M1: Authentication & User/Role Management (OEP-F-001..004)', () => {
    test('TC-Auth-01: Register a new student account successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Candidate',
          email: 'newcandidate@pesu.edu',
          password: 'Password@123',
          role: 'Student'
        });
      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe('newcandidate@pesu.edu');
    });

    test('TC-Auth-01a: Duplicate email registration is rejected with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Candidate',
          email: 'student1@pesu.edu',
          password: 'Password@123',
          role: 'Student'
        });
      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already exists');
    });

    test('TC-Auth-02: Valid credentials login returns JWT session with role claims', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student1@pesu.edu', password: 'Password@123' });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('Student');
    });

    test('TC-Auth-02a: Invalid password returns 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student1@pesu.edu', password: 'WrongPassword' });
      expect(res.status).toBe(401);
    });

    test('TC-Auth-02b: Locked account login is blocked with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'locked@pesu.edu', password: 'Password@123' });
      expect(res.status).toBe(403);
      expect(res.body.error).toContain('locked');
    });

    test('TC-Auth-03: Password reset OTP request returns verification code', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password/request')
        .send({ email: 'student1@pesu.edu' });
      expect(res.status).toBe(200);
      expect(res.body.demo_otp).toBeDefined();
    });

    test('TC-Auth-04: RBAC enforces that Students cannot create exams (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/exams')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Illegal Student Exam' });
      expect(res.status).toBe(403);
      expect(res.body.error).toContain('not authorized');
    });
  });

  // 3. Module M2: Exam & Question-Bank Management (Aadish - PES2UG24CS007)
  describeM2('Module M2: Exam & Question-Bank Management (OEP-F-005..008)', () => {
    test('TC-Exam-01: Instructor creates a new scheduled exam', async () => {
      const startTime = new Date(Date.now() + 60000).toISOString();
      const endTime = new Date(Date.now() + 3600000).toISOString();

      const res = await request(app)
        .post('/api/exams')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Software Quality Assurance Test',
          description: 'Testing lifecycle exam',
          duration_minutes: 30,
          start_time: startTime,
          end_time: endTime,
          question_ids: [1, 2, 3],
          is_published: 1
        });
      expect(res.status).toBe(201);
      expect(res.body.examId).toBeDefined();
    });

    test('TC-Exam-03: Exam scheduling blocks start time after end time (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/exams')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'Invalid Timing Exam',
          duration_minutes: 30,
          start_time: '2026-10-30T12:00:00Z',
          end_time: '2026-10-30T10:00:00Z' // End before start!
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('strictly after start time');
    });

    test('TC-Exam-02: Instructor adds question with options to question bank', async () => {
      const res = await request(app)
        .post('/api/exams/questions')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          question_text: 'Which testing level tests integrated modules together?',
          question_type: 'MCQ',
          marks: 5,
          correct_answer: 'B',
          explanation: 'Integration testing verifies module interactions.',
          options: [
            { k: 'A', t: 'Unit Testing' },
            { k: 'B', t: 'Integration Testing' },
            { k: 'C', t: 'Acceptance Testing' }
          ]
        });
      expect(res.status).toBe(201);
      expect(res.body.questionId).toBeDefined();
    });
  });

  // 4. Module M3: Exam Delivery Engine (Aditya - PES2UG24CS034)
  describeM3('Module M3: Exam Delivery Engine (OEP-F-009..012, OEP-SR-004)', () => {
    let attemptId;

    test('TC-Take-01 & TC-Sec-05: Student starts active exam (correct_answer stripped from payload)', async () => {
      // Exam 1 is seeded as live active exam
      const res = await request(app)
        .get('/api/delivery/exams/1/attempt')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.attemptId).toBeDefined();
      attemptId = res.body.attemptId;
      expect(res.body.exam.remaining_seconds).toBeGreaterThan(0);
      expect(res.body.questions.length).toBeGreaterThan(0);

      // CRITICAL SECURITY VALIDATION: correct_answer must NOT exist in student questions payload!
      for (const q of res.body.questions) {
        expect(q.correct_answer).toBeUndefined();
        expect(q.explanation).toBeUndefined();
      }
    });

    test('TC-Take-03: Periodic auto-save persists student answers', async () => {
      const res = await request(app)
        .post(`/api/delivery/attempts/${attemptId}/answers`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          answers: [
            { question_id: 1, selected_option: 'A' },
            { question_id: 2, selected_option: 'C' }
          ]
        });
      expect(res.status).toBe(200);
      expect(res.body.saved_count).toBe(2);
    });

    test('TC-Take-04: Student submits exam attempt and triggers auto-grading', async () => {
      const res = await request(app)
        .post(`/api/delivery/attempts/${attemptId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('submitted');
      expect(res.body.autoGradedScore).toBeDefined();
    });
  });

  // 5. Module M4: Evaluation, Results & Analytics (Akshansh - PES2UG24CS045 & Vincent - PES2UG24CS002)
  describeM4('Module M4: Evaluation, Results & Analytics (OEP-F-013..016, OEP-SR-005)', () => {
    test('TC-Eval-01: Auto-grading correctly computed score for objective questions', async () => {
      // Seeded Exam 2 has attempt #1 for Student 1 with known score 20
      const res = await request(app)
        .get('/api/eval/attempts/1/scorecard')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.attempt.score).toBe(20);
      expect(res.body.breakdown.length).toBe(5);
    });

    test('TC-Eval-03 & TC-Sec-06: Student result privacy strictly blocks cross-student access (403 Forbidden)', async () => {
      // Student 2 tries to access Student 1's scorecard (Attempt #1)
      const res = await request(app)
        .get('/api/eval/attempts/1/scorecard')
        .set('Authorization', `Bearer ${student2Token}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('strictly prohibited');
    });

    test('TC-Eval-02: Instructor grades subjective question manually', async () => {
      // Create and grade an answer
      const res = await request(app)
        .post('/api/eval/attempts/1/grade')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          grades: [
            { answer_id: 1, marks_awarded: 5, feedback: 'Accurate and comprehensive response.' }
          ]
        });
      expect(res.status).toBe(200);
      expect(res.body.finalScore).toBeDefined();
    });

    test('TC-Eval-04: Instructor retrieves aggregate class analytics and item analysis', async () => {
      const res = await request(app)
        .get('/api/eval/exams/2/analytics')
        .set('Authorization', `Bearer ${instructorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalAttempts).toBe(2);
      expect(res.body.averageScore).toBeGreaterThan(0);
      expect(res.body.passPercentage).toBeDefined();
      expect(res.body.itemAnalysis.length).toBeGreaterThan(0);
    });
  });

  // 6. Security & Audit Logging (OEP-NF-004)
  describe('Security & Audit Logging (OEP-NF-004)', () => {
    test('TC-Sec-04: Administrator retrieves persistent audit logs', async () => {
      const res = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.logs)).toBe(true);
      expect(res.body.logs.length).toBeGreaterThan(0);
    });
  });
});

