const request = require('supertest');
const app = require('../../src/app');
const { seedDatabase } = require('../../src/db/seed');
const { run, get, all } = require('../../src/config/db');
const examController = require('../../src/controllers/examController');
const { seededRandom } = require('../../src/controllers/deliveryController');

// Verification of requirements that the original suite did not test automatically:
// TC-Exam-04 (randomization), TC-Take-02 (server timer, DEF-002) and TC-Take-05 (attempt start, stable order).
// Added 11 Nov 2026.

const login = async (email) =>
  (await request(app).post('/api/auth/login').send({ email, password: 'Password@123' })).body.token;

const startAttempt = (token, examId = 1) =>
  request(app).get(`/api/delivery/exams/${examId}/attempt`).set('Authorization', `Bearer ${token}`);

const minutesAgo = (m) => new Date(Date.now() - m * 60 * 1000).toISOString();

let student2;
let student3;
let instructor;

beforeAll(async () => {
  await seedDatabase();
  student2 = await login('student2@pesu.edu');
  student3 = await login('student3@pesu.edu');
  instructor = await login('instructor1@pesu.edu');
});

describe('=== OEP Requirement Verification Suite ===', () => {
  describe('TC-Exam-04: Fisher-Yates question randomization (OEP-F-008)', () => {
    test('TC-Exam-04a: a shuffle keeps every item exactly once and leaves the input untouched', () => {
      const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const output = examController.shuffleArray(input);
      expect([...output].sort((a, b) => a - b)).toEqual(input);
      expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    test('TC-Exam-04b: all 24 orders of 4 questions are equally likely over 24,000 shuffles', () => {
      // A fixed-seed generator stands in for Math.random, so this statistical check gives the same result on every run
      const spy = jest.spyOn(Math, 'random').mockImplementation(seededRandom(20261111));
      const counts = new Map();
      for (let i = 0; i < 24000; i++) {
        const order = examController.shuffleArray([0, 1, 2, 3]).join('');
        counts.set(order, (counts.get(order) || 0) + 1);
      }
      spy.mockRestore();

      expect(counts.size).toBe(24);
      for (const n of counts.values()) {
        expect(n).toBeGreaterThan(850); // expected 1000 each; 850-1150 is about +/- 5 standard deviations
        expect(n).toBeLessThan(1150);
      }
    });

    test('TC-Exam-04c: a candidate gets every linked question exactly once, without answer keys', async () => {
      const staffView = await request(app).get('/api/exams/1').set('Authorization', `Bearer ${instructor}`);
      const studentView = await request(app).get('/api/exams/1').set('Authorization', `Bearer ${student2}`);
      const sortedIds = (res) => res.body.questions.map((q) => q.id).sort((a, b) => a - b);

      expect(studentView.status).toBe(200);
      expect(sortedIds(studentView)).toEqual(sortedIds(staffView));
      studentView.body.questions.forEach((q) => expect(q.correct_answer).toBeUndefined());
    });
  });

  describe('TC-Exam-01b: Exam input validation (OEP-F-005, ZAP finding)', () => {
    test('TC-Exam-01b: linking a question id that does not exist returns 400, not 500', async () => {
      const res = await request(app)
        .post('/api/exams')
        .set('Authorization', `Bearer ${instructor}`)
        .send({
          title: 'Invalid link exam',
          duration_minutes: 30,
          start_time: new Date(Date.now() + 60000).toISOString(),
          end_time: new Date(Date.now() + 3600000).toISOString(),
          question_ids: [1, 99999]
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('99999');
    });
  });

  describe('TC-Take-02: Server-enforced countdown (OEP-F-010, DEF-002)', () => {
    let attemptId;

    test('TC-Take-02a: a new attempt gets the full 45-minute duration (2700 s)', async () => {
      const res = await startAttempt(student2);
      expect(res.status).toBe(200);
      attemptId = res.body.attemptId;
      expect(res.body.exam.remaining_seconds).toBeLessThanOrEqual(2700);
      expect(res.body.exam.remaining_seconds).toBeGreaterThanOrEqual(2690);
    });

    test('TC-Take-02b: the clock keeps running on the server (40 min elapsed leaves about 300 s)', async () => {
      await run('UPDATE attempts SET start_time = ? WHERE id = ?', [minutesAgo(40), attemptId]);
      const res = await startAttempt(student2);
      expect(res.body.exam.remaining_seconds).toBeGreaterThanOrEqual(295);
      expect(res.body.exam.remaining_seconds).toBeLessThanOrEqual(300);
    });

    test('TC-Take-02c: remaining time is capped by the exam window end', async () => {
      await run('UPDATE attempts SET start_time = ? WHERE id = ?', [new Date().toISOString(), attemptId]);
      const original = await get('SELECT end_time FROM exams WHERE id = 1');
      await run('UPDATE exams SET end_time = ? WHERE id = 1', [new Date(Date.now() + 120 * 1000).toISOString()]);

      const res = await startAttempt(student2);
      await run('UPDATE exams SET end_time = ? WHERE id = 1', [original.end_time]);

      expect(res.body.exam.remaining_seconds).toBeLessThanOrEqual(120);
      expect(res.body.exam.remaining_seconds).toBeGreaterThanOrEqual(115);
    });

    test('TC-Take-02d: an attempt past its duration reports 0 seconds left', async () => {
      await run('UPDATE attempts SET start_time = ? WHERE id = ?', [minutesAgo(46), attemptId]);
      const res = await startAttempt(student2);
      expect(res.body.exam.remaining_seconds).toBe(0);
    });

    test('TC-Take-02e (DEF-002 regression): a SQLite UTC timestamp without "Z" is read as UTC, even on an IST server', async () => {
      const previousTz = process.env.TZ;
      process.env.TZ = 'Asia/Kolkata'; // UTC+5:30, where the original bug produced a 19,800 s error
      try {
        const sqliteUtcNow = new Date().toISOString().replace('T', ' ').slice(0, 19); // 'YYYY-MM-DD HH:MM:SS'
        await run('UPDATE attempts SET start_time = ? WHERE id = ?', [sqliteUtcNow, attemptId]);
        const res = await startAttempt(student2);
        expect(res.body.exam.remaining_seconds).toBeGreaterThanOrEqual(2690);
        expect(res.body.exam.remaining_seconds).toBeLessThanOrEqual(2700);
      } finally {
        if (previousTz === undefined) delete process.env.TZ;
        else process.env.TZ = previousTz;
      }
    });
  });

  describe('TC-Auth-03b: Password reset codes (OEP-F-003)', () => {
    const requestCode = async () =>
      (await request(app).post('/api/auth/reset-password/request').send({ email: 'student3@pesu.edu' })).body.demo_otp;
    const verify = (otp) =>
      request(app)
        .post('/api/auth/reset-password/verify')
        .send({ email: 'student3@pesu.edu', otp, newPassword: 'Password@123' });

    test('TC-Auth-03b: requesting a new code invalidates the previous unused one', async () => {
      const first = await requestCode();
      const second = await requestCode();
      expect(first).toMatch(/^\d{6}$/);
      expect(second).toMatch(/^\d{6}$/);

      // Codes are random, so in the rare case both draws match, the "old code fails" check does not apply
      if (first !== second) {
        expect((await verify(first)).status).toBe(400);
      }
      expect((await verify(second)).status).toBe(200);
      expect((await verify(second)).status).toBe(400); // a code works only once
    });
  });

  describe('TC-Take-05: One attempt per candidate and a stable question order (DEF-009, DEF-010)', () => {
    test('TC-Take-05a: two simultaneous start requests share one attempt and one audit entry', async () => {
      const [first, second] = await Promise.all([startAttempt(student3), startAttempt(student3)]);
      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
      expect(second.body.attemptId).toBe(first.body.attemptId);

      const attempts = await all(
        'SELECT a.id FROM attempts a JOIN users u ON a.student_id = u.id WHERE a.exam_id = 1 AND u.email = ?',
        ['student3@pesu.edu']
      );
      expect(attempts).toHaveLength(1);

      const startEvents = await all("SELECT id FROM audit_logs WHERE action = 'EXAM_ATTEMPT_START' AND details LIKE ?", [
        `%attempt #${first.body.attemptId} %`
      ]);
      expect(startEvents).toHaveLength(1);
    });

    test('TC-Take-05b: resuming an attempt returns the questions in the same order', async () => {
      const first = await startAttempt(student3);
      const resumed = await startAttempt(student3);
      expect(resumed.body.questions.map((q) => q.id)).toEqual(first.body.questions.map((q) => q.id));
    });

    test('TC-Take-05c: two candidates get different question orders', async () => {
      const a = await startAttempt(student2);
      const b = await startAttempt(student3);
      expect(a.body.questions.map((q) => q.id)).not.toEqual(b.body.questions.map((q) => q.id));
    });
  });
});
