// Prepares the database for the JMeter load test (OEP-PERF-01, OEP-NF-001, OEP-NF-002).
// Usage: node perf/prepare-load-test.js [candidates=500]
//  1. Re-seeds the database (STP §6.4 data, Exam 1 is live).
//  2. Adds N load-test candidate accounts (load001@pesu.edu ...).
//  3. Writes perf/data/load-users.csv with one JWT per candidate, issued exactly as POST /api/auth/login would.
//     Tokens are signed here so the test measures the exam endpoints rather than N bcrypt logins.
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { seedDatabase } = require('../src/db/seed');
const { run, all } = require('../src/config/db');
const { JWT_SECRET } = require('../src/middleware/auth');

const CANDIDATES = Number(process.argv[2] || 500);

(async () => {
  await seedDatabase();

  const passwordHash = await bcrypt.hash('Password@123', 10);
  await run('BEGIN');
  for (let i = 1; i <= CANDIDATES; i++) {
    const n = String(i).padStart(3, '0');
    await run('INSERT INTO users (name, email, password_hash, role, is_locked) VALUES (?, ?, ?, ?, 0)', [
      `Load Candidate ${n}`,
      `load${n}@pesu.edu`,
      passwordHash,
      'Student'
    ]);
  }
  await run('COMMIT');

  const users = await all("SELECT id, name, email, role FROM users WHERE email LIKE 'load%@pesu.edu' ORDER BY id");
  const lines = ['email,token'];
  for (const u of users) {
    const token = jwt.sign({ id: u.id, name: u.name, email: u.email, role: u.role }, JWT_SECRET, { expiresIn: '24h' });
    lines.push(`${u.email},${token}`);
  }

  const dataDir = path.resolve(__dirname, 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'load-users.csv'), lines.join('\n') + '\n');

  console.log(`Prepared ${users.length} load-test candidates -> perf/data/load-users.csv`);
  process.exit(0);
})().catch((err) => {
  console.error('Load-test preparation failed:', err);
  process.exit(1);
});
