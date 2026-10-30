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

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

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
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

module.exports = app;

