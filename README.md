# Online Exam Portal (OEP)

> **PES University — Department of Computer Science and Engineering**  
> **Course:** Software Engineering | **Section:** A | **Team Number:** 9  
> **Baseline Documentation:** [SRS v1.1](docs/deliverable-1/09_PES2UG24CS002.pdf) | [SAD v1.0](docs/deliverable-2/PES2UG24CS002_SAD_Team9.docx) | [STP v1.0](docs/deliverable-3/09_PES2UG24CS002_TEST.pdf)

---

## 👥 Team & Work Allocation Matrix

Work is divided equally across the four team members following the strict **Cross-Testing Mandate** (STP §1 & §9):

| SRN | Member Name | Implementation Responsibility (Dev) | Verification & Testing Responsibility (QA) | Extra System-Wide Duties |
| :--- | :--- | :--- | :--- | :--- |
| **PES2UG24CS002** | **A S Vincent** | **Module M1:** Authentication, User/Role Management, Session & RBAC (`OEP-F-001..004`) | **Tester for Module M4:** Evaluation, Results & Analytics (`TC-Eval-01..04`) | **Security Lead:** OWASP ZAP vulnerability scan, SQLi/XSS validation (`TC-Sec-01..07`) |
| **PES2UG24CS007** | **Aadish Sarin** | **Module M2:** Exam Management, Question-Bank CRUD, Scheduling & Randomization (`OEP-F-005..008`) | **Tester for Module M1:** Authentication & RBAC Middleware (`TC-Auth-01..04`) | **Team Lead & QA Lead:** Defect triage coordinator, RTM maintenance, Final Test Summary Report |
| **PES2UG24CS034** | **Aditya Rao** | **Module M3:** Exam Delivery Engine, Server Countdown Timer, Auto-Save & Auto-Submit (`OEP-F-009..012`) | **Tester for Module M2:** Exam & Question-Bank Lifecycle (`TC-Exam-01..04`) | **DevOps & Environment Lead:** Test environment setup, Seed script (`seed.js`), Docker / CI-CD pipeline |
| **PES2UG24CS045** | **Akshansh Agrawal** | **Module M4:** Auto-Grading, Manual Grading Interface, Scorecards & Class Analytics (`OEP-F-013..016`) | **Tester for Module M3:** Exam Delivery, Timer & Auto-Save Recovery (`TC-Take-01..04`) | **Performance & UX Lead:** Apache JMeter load tests (500 concurrent users), Lighthouse WCAG 2.1 AA audit |

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- **Node.js** v20+ or v24+
- **NPM** v10+

### 2. Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
cd ..
```

### 3. Initialize & Seed Database (STP §6.4)
Run the seed script to create all schema tables and populate realistic test data (7 users, 30 questions, 4 exams, pre-graded submissions):
```bash
npm run db:reset
```

### 4. Run Automated Test Suite (Jest + Supertest)
Verify all 26 requirements across Modules M1, M2, M3, M4 and Security controls:
```bash
npm test
```
*Expected: 19 / 19 Tests Passing (100% Pass Rate).*

### 5. Launch the Application

In **Terminal 1** (Backend API Server):
```bash
npm run dev:backend
# API running on http://localhost:5000
```

In **Terminal 2** (Frontend React Web Application):
```bash
npm run dev:frontend
# App accessible at http://localhost:5173
```

---

## 🔑 Pre-Configured Evaluation Accounts (STP §6.4)

All accounts share the default test password: `Password@123`

| Role | Email Address | Password | Permissions & Available Features |
| :--- | :--- | :--- | :--- |
| **Candidate / Student** | `student1@pesu.edu` | `Password@123` | View scheduled exams, start timed test, auto-save answers, view private scorecard |
| **Candidate / Student 2** | `student2@pesu.edu` | `Password@123` | Independent candidate session for IDOR result isolation testing (`TC-Sec-06`) |
| **Instructor / Faculty** | `instructor1@pesu.edu` | `Password@123` | Schedule exams, manage 30 banked questions, manual grading, exam analytics |
| **Administrator** | `admin@pesu.edu` | `Password@123` | Role management (RBAC), unlock/lock accounts, inspect security audit trail |
| **Locked Account** | `locked@pesu.edu` | `Password@123` | Test account verifying locked account access blockage (`403 Forbidden`) |

---

## 📋 Mini-Project Deliverables Part-2 Compliance

1. **Backlog in GitHub (`ETA: 12th Oct 2026`):**
   - 27 Backlog items mapped to Story Points (91 SP total) and assigned across 2 Sprints.
   - Fully documented in [PROJECT_BACKLOG.md](PROJECT_BACKLOG.md).
   - Traceable through [Completed RTM](docs/deliverable-4/Completed_RTM.md) (100% Accepted).

2. **Sprint-1 [19th Oct to 23rd Oct 2026]:**
   - Foundation backend, Database & Seed data script (`seed.js`).
   - Module M1 (Auth & RBAC) and Module M2 (Exam & Question Bank CRUD).
   - Automated GitHub Actions CI workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml).
   - Member PR workflow and code reviews.
   - Comprehensive sprint documentation: [SPRINT_1_REPORT.md](SPRINT_1_REPORT.md).

3. **Sprint-2 [26th Oct to 30th Oct 2026]:**
   - Module M3 (Exam Delivery Engine with timer & 30s auto-save).
   - Module M4 (Auto-grading, subjective grading, scorecard, analytics).
   - UI navigation shell & WCAG 2.1 AA accessible dark mode theme.
   - Cross-Testing verification, [Defect Log](docs/deliverable-4/defect-log.md) (6 logged, 6 closed, 0 open critical/high bugs).
   - Comprehensive sprint documentation: [SPRINT_2_REPORT.md](SPRINT_2_REPORT.md).
   - Agile analysis: [SPRINT_RETROSPECTIVE.md](SPRINT_RETROSPECTIVE.md) & [DEVELOPMENT_PROGRESS.md](DEVELOPMENT_PROGRESS.md).
   - Development cycle frozen on 30 October 2026.

---

## 🔗 Project Management & Tracking Links

- **GitHub Repository:** [https://github.com/vinnieee7/SE-Online-Exam-Portal](https://github.com/vinnieee7/SE-Online-Exam-Portal)
- **Master Product Backlog:** [PROJECT_BACKLOG.md](PROJECT_BACKLOG.md)
- **Sprint 1 Execution Report:** [SPRINT_1_REPORT.md](SPRINT_1_REPORT.md)
- **Sprint 2 Execution Report:** [SPRINT_2_REPORT.md](SPRINT_2_REPORT.md)
- **Sprint Retrospective:** [SPRINT_RETROSPECTIVE.md](SPRINT_RETROSPECTIVE.md)
- **Development Progress & History:** [DEVELOPMENT_PROGRESS.md](DEVELOPMENT_PROGRESS.md)
- **Completed Requirements Traceability Matrix:** [Completed_RTM.md](docs/deliverable-4/Completed_RTM.md)
- **Defect Tracking Log:** [defect-log.md](docs/deliverable-4/defect-log.md)

---

*Engineered by Team 9 — Online Exam Portal — Dept. of CSE, PES University.*
