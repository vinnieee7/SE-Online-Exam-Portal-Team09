// Runs an OWASP ZAP scan (OpenAPI import + passive + active scan) against a running OEP API.
// Prerequisites: the API is running (npm start), Java 17+, and the ZAP cross-platform package.
// Usage: ZAP_JAR=/path/to/zap-2.17.0.jar node security/run-zap-scan.js [http://localhost:5000]
// Output: security/results/zap-report.html and zap-report.md. The database is re-seeded before and after,
// because the active scan creates, edits and deletes data.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { seedDatabase } = require('../src/db/seed');

const TARGET = process.argv[2] || 'http://localhost:5000';
const ZAP_JAR = process.env.ZAP_JAR;
const ZAP_HOME = process.env.ZAP_HOME_DIR || path.join(os.tmpdir(), 'oep-zap-home');
const here = __dirname;
const reportDir = path.join(here, 'results');

(async () => {
  if (!ZAP_JAR || !fs.existsSync(ZAP_JAR)) {
    throw new Error('Set ZAP_JAR to the path of zap-<version>.jar from the ZAP cross-platform package.');
  }

  await seedDatabase();

  const login = await fetch(`${TARGET}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@pesu.edu', password: 'Password@123' })
  });
  const { token } = await login.json();
  if (!token) throw new Error(`Admin login failed (HTTP ${login.status}); is the API running at ${TARGET}?`);

  fs.mkdirSync(reportDir, { recursive: true });
  const plan = fs
    .readFileSync(path.join(here, 'zap-plan.template.yaml'), 'utf8')
    .replaceAll('{{TARGET}}', TARGET)
    .replaceAll('{{TOKEN}}', token)
    .replaceAll('{{API_FILE}}', path.join(here, 'oep-openapi.yaml').replaceAll('\\', '/'))
    .replaceAll('{{REPORT_DIR}}', reportDir.replaceAll('\\', '/'));
  const planPath = path.join(os.tmpdir(), 'oep-zap-plan.yaml'); // holds a live token, so it stays out of the repo
  fs.writeFileSync(planPath, plan);

  console.log(`Scanning ${TARGET} with ${path.basename(ZAP_JAR)} ...`);
  const zap = spawnSync('java', ['-Xmx2g', '-jar', ZAP_JAR, '-cmd', '-dir', ZAP_HOME, '-autorun', planPath], {
    stdio: 'inherit',
    cwd: path.dirname(ZAP_JAR)
  });

  fs.rmSync(planPath, { force: true });
  await seedDatabase();
  console.log(`ZAP finished with exit code ${zap.status}. Reports: ${reportDir}`);
  process.exit(zap.status ?? 1);
})().catch((err) => {
  console.error('ZAP scan failed:', err.message);
  process.exit(1);
});
