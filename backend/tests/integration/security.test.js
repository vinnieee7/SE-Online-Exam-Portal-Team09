const tls = require('tls');
const https = require('https');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const selfsigned = require('selfsigned');
const app = require('../../src/app');
const { seedDatabase } = require('../../src/db/seed');
const { get, run } = require('../../src/config/db');
const { createSecureServer } = require('../../src/secureServer');

// Security verification suite (OEP-SR-001..003, TC-Sec-01..03, TC-Sec-07).
// Added 11 Nov 2026 as executed evidence for requirements that previously had no automated test.

// A client that offers only TLS 1.1 (security level 0 lets OpenSSL 3 build such a client at all)
const LEGACY_TLS11_CLIENT = { minVersion: 'TLSv1.1', maxVersion: 'TLSv1.1', ciphers: 'DEFAULT@SECLEVEL=0' };

// Opens a raw TLS connection; resolves with the negotiated protocol or rejects with the handshake error
function handshake(port, options = {}) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host: '127.0.0.1', port, rejectUnauthorized: false, ...options }, () => {
      const protocol = socket.getProtocol();
      socket.end();
      resolve(protocol);
    });
    socket.on('error', reject);
  });
}

function listen(server) {
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
}

function httpsGet(port, path) {
  return new Promise((resolve, reject) => {
    https
      .get({ host: '127.0.0.1', port, path, rejectUnauthorized: false }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
      })
      .on('error', reject);
  });
}

const login = async (email) =>
  (await request(app).post('/api/auth/login').send({ email, password: 'Password@123' })).body.token;

let studentToken;
let instructorToken;
let secureServer;
let securePort;
let legacyServer;
let legacyPort;

beforeAll(async () => {
  await seedDatabase();
  studentToken = await login('student1@pesu.edu');
  instructorToken = await login('instructor1@pesu.edu');

  const pems = await selfsigned.generate([{ name: 'commonName', value: 'localhost' }], { keySize: 2048, algorithm: 'sha256' });

  // The OEP API exactly as server-https.js runs it
  secureServer = createSecureServer(app, { key: pems.private, cert: pems.cert });
  securePort = await listen(secureServer);

  // Control server that deliberately still accepts TLS 1.1, used only to prove the test client can speak it
  legacyServer = tls.createServer(
    { key: pems.private, cert: pems.cert, minVersion: 'TLSv1.1', ciphers: 'DEFAULT@SECLEVEL=0' },
    (socket) => socket.end()
  );
  legacyPort = await listen(legacyServer);
});

afterAll(async () => {
  await new Promise((resolve) => secureServer.close(resolve));
  await new Promise((resolve) => legacyServer.close(resolve));
});

describe('=== OEP Security Verification Suite ===', () => {
  describe('TC-Sec-01: Encrypted transport with TLS 1.2 as the minimum (OEP-SR-001)', () => {
    test('TC-Sec-01a: the API answers over HTTPS', async () => {
      const res = await httpsGet(securePort, '/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ONLINE');
    });

    test('TC-Sec-01b: a current client negotiates TLS 1.3', async () => {
      await expect(handshake(securePort)).resolves.toBe('TLSv1.3');
    });

    test('TC-Sec-01c: a client limited to TLS 1.2 is still accepted', async () => {
      await expect(handshake(securePort, { maxVersion: 'TLSv1.2' })).resolves.toBe('TLSv1.2');
    });

    test('TC-Sec-01d (control): the test client really can speak TLS 1.1', async () => {
      await expect(handshake(legacyPort, LEGACY_TLS11_CLIENT)).resolves.toBe('TLSv1.1');
    });

    test('TC-Sec-01e: the OEP server refuses that TLS 1.1 client', async () => {
      await expect(handshake(securePort, LEGACY_TLS11_CLIENT)).rejects.toThrow(/protocol version|unsupported protocol/i);
    });
  });

  describe('TC-Sec-02: Password storage with bcrypt, cost 10 (OEP-SR-002)', () => {
    test('TC-Sec-02a: stored passwords are bcrypt hashes with cost factor 10', async () => {
      const row = await get('SELECT password_hash FROM users WHERE email = ?', ['student1@pesu.edu']);
      expect(row.password_hash).toMatch(/^\$2[aby]\$10\$.{53}$/);
      expect(row.password_hash).not.toContain('Password@123');
      await expect(bcrypt.compare('Password@123', row.password_hash)).resolves.toBe(true);
    });

    test('TC-Sec-02b: registration salts each hash and never returns it', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Hash Check', email: 'hashcheck@pesu.edu', password: 'Password@123' });
      expect(res.status).toBe(201);
      expect(JSON.stringify(res.body)).not.toMatch(/password_hash|\$2[aby]\$/);

      const created = await get('SELECT password_hash FROM users WHERE email = ?', ['hashcheck@pesu.edu']);
      const seeded = await get('SELECT password_hash FROM users WHERE email = ?', ['student1@pesu.edu']);
      expect(created.password_hash).toMatch(/^\$2[aby]\$10\$/);
      expect(created.password_hash).not.toBe(seeded.password_hash); // same password, different salt
    });
  });

  describe('TC-Sec-03: Server-side authorization on every protected API (OEP-SR-003)', () => {
    test('TC-Sec-03a: a request without a token gets 401', async () => {
      const res = await request(app).get('/api/exams');
      expect(res.status).toBe(401);
    });

    test('TC-Sec-03b: a token whose payload was edited to role Admin is rejected', async () => {
      const [header, payload, signature] = studentToken.split('.');
      const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      const forgedPayload = Buffer.from(JSON.stringify({ ...claims, role: 'Admin' })).toString('base64url');

      const res = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${header}.${forgedPayload}.${signature}`);
      expect(res.status).toBe(403);
    });

    test('TC-Sec-03c: a token signed with a different secret is rejected', async () => {
      const foreign = jwt.sign({ id: 1, email: 'admin@pesu.edu', role: 'Admin' }, 'not-the-server-secret', { expiresIn: '1h' });
      const res = await request(app).get('/api/audit-logs').set('Authorization', `Bearer ${foreign}`);
      expect(res.status).toBe(403);
    });

    test('TC-Sec-03d: an unsigned token (alg "none") is rejected', async () => {
      const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
      const unsigned = `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ id: 1, email: 'admin@pesu.edu', role: 'Admin' })}.`;
      const res = await request(app).get('/api/audit-logs').set('Authorization', `Bearer ${unsigned}`);
      expect(res.status).toBe(403);
    });

    test('TC-Sec-03e: a valid Student token cannot reach Instructor or Admin APIs', async () => {
      const auth = ['Authorization', `Bearer ${studentToken}`];
      expect((await request(app).get('/api/exams/questions').set(...auth)).status).toBe(403);
      expect((await request(app).get('/api/eval/exams/2/analytics').set(...auth)).status).toBe(403);
      expect((await request(app).get('/api/audit-logs').set(...auth)).status).toBe(403);
      expect((await request(app).patch('/api/auth/users/1').set(...auth).send({ is_locked: 1 })).status).toBe(403);
    });

    test('TC-Sec-03g: self-registration cannot create an Administrator account', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Would-be Admin', email: 'selfadmin@pesu.edu', password: 'Password@123', role: 'Admin' });
      expect(res.status).toBe(400);
      expect(await get('SELECT id FROM users WHERE email = ?', ['selfadmin@pesu.edu'])).toBeUndefined();
    });

    test('TC-Sec-03f: locking an account blocks a token that was issued before the lock', async () => {
      const token = await login('student3@pesu.edu');
      expect((await request(app).get('/api/exams').set('Authorization', `Bearer ${token}`)).status).toBe(200);

      await run('UPDATE users SET is_locked = 1 WHERE email = ?', ['student3@pesu.edu']);
      const res = await request(app).get('/api/exams').set('Authorization', `Bearer ${token}`);
      await run('UPDATE users SET is_locked = 0 WHERE email = ?', ['student3@pesu.edu']);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('locked');
    });
  });

  describe('TC-Sec-07: Injection payloads are handled as plain data', () => {
    test('TC-Sec-07a: classic SQL login-bypass strings do not log anyone in', async () => {
      const attempts = ["' OR '1'='1' --", "student1@pesu.edu' --", "admin@pesu.edu'/*"];
      for (const email of attempts) {
        const res = await request(app).post('/api/auth/login').send({ email, password: "' OR '1'='1" });
        expect(res.status).toBe(401);
        expect(res.body.token).toBeUndefined();
      }
    });

    test('TC-Sec-07b: a DROP TABLE payload is stored as text and the users table survives', async () => {
      const name = "Robert'); DROP TABLE users; --";
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name, email: 'bobby@pesu.edu', password: 'Password@123' });
      expect(res.status).toBe(201);

      const row = await get('SELECT name FROM users WHERE email = ?', ['bobby@pesu.edu']);
      expect(row.name).toBe(name);
      const count = await get('SELECT COUNT(*) AS n FROM users');
      expect(count.n).toBeGreaterThanOrEqual(8);
    });

    test('TC-Sec-07c: an injection payload in a URL id does not widen the query', async () => {
      const res = await request(app)
        .get(`/api/exams/${encodeURIComponent('1 OR 1=1')}`)
        .set('Authorization', `Bearer ${instructorToken}`);
      expect(res.status).toBe(404);
    });

    test('TC-Sec-07e: malformed or missing bodies get 400 with no internal details (ZAP finding)', async () => {
      const malformed = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{"email":');
      expect(malformed.status).toBe(400);
      expect(JSON.stringify(malformed.body)).not.toMatch(/SyntaxError|Unexpected|at /);

      const noBody = await request(app).post('/api/auth/login').set('Content-Type', 'text/plain').send('x');
      expect(noBody.status).toBe(400);
      expect(noBody.body.details).toBeUndefined();

      const health = await request(app).get('/api/health');
      expect(health.headers['x-powered-by']).toBeUndefined();
      expect(health.headers['x-content-type-options']).toBe('nosniff');
    });

    test('TC-Sec-07d: script markup in a question is returned as JSON data, not executed by the API', async () => {
      const markup = '<script>alert("xss")</script> Which layer renders the UI?';
      const created = await request(app)
        .post('/api/exams/questions')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({ question_text: markup, question_type: 'ShortAnswer', marks: 5, correct_answer: 'Presentation layer' });
      expect(created.status).toBe(201);

      const bank = await request(app).get('/api/exams/questions').set('Authorization', `Bearer ${instructorToken}`);
      expect(bank.headers['content-type']).toMatch(/application\/json/);
      expect(bank.body.questions.some((q) => q.question_text === markup)).toBe(true);
    });
  });
});
