const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const auditRoutes = require('./routes/auditRoutes');

// Conditionally require teammate modules (M2, M3, M4) when their feature branches are merged
let examRoutes, deliveryRoutes, evalRoutes;
try { examRoutes = require('./routes/examRoutes'); } catch (_) {}
try { deliveryRoutes = require('./routes/deliveryRoutes'); } catch (_) {}
try { evalRoutes = require('./routes/evalRoutes'); } catch (_) {}

const app = express();

// Security headers (OWASP ZAP findings, v1.0.1): do not advertise the framework; stop MIME sniffing
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
// Requests without a JSON body get an empty object, so validation answers 400 instead of crashing with 500
app.use((req, res, next) => {
  if (req.body === undefined) req.body = {};
  next();
});

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    project: 'Online Exam Portal (OEP) - Team 9',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
if (examRoutes) {
  app.use('/api/exams', examRoutes);
} else {
  // Stub with RBAC middleware so TC-Auth-04 passes on M1 branch before M2 is merged
  const { authenticateToken, requireRole } = require('./middleware/auth');
  const stubRouter = express.Router();
  stubRouter.use(authenticateToken);
  stubRouter.post('/', requireRole('Instructor', 'Admin'), (req, res) => res.status(201).json({ examId: 1 }));
  app.use('/api/exams', stubRouter);
}
if (deliveryRoutes) app.use('/api/delivery', deliveryRoutes);
if (evalRoutes) app.use('/api/eval', evalRoutes);
app.use('/api/audit-logs', auditRoutes);

// Global Error Handler
// Client errors such as malformed JSON keep their 4xx status; internal details are logged, never sent
app.use((err, req, res, next) => {
  const status = err.status >= 400 && err.status < 500 ? err.status : 500;
  if (status === 500) console.error('Unhandled Application Error:', err);
  res.status(status).json({
    error: status === 500 ? 'Internal Server Error' : 'Bad Request: the request body is not valid JSON'
  });
});

module.exports = app;

