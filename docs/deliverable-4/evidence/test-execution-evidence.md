# Online Exam Portal (OEP) — Automated Test Execution Evidence

> **Execution Timestamp:** 2026-11-05T19:49:02+05:30  
> **Course:** Software Engineering | **Section:** A | **Team Number:** 9  
> **Harness:** Jest v30.5.2 & Supertest v7.3.1  
> **Environment:** Node.js v20.19.2 on Windows 11 x64  
> **Database:** SQLite 3 (WAL Mode, In-Memory Seed Reset per STP §6.4)  
> **QA Lead:** Aadish Sarin (`PES2UG24CS007`) | **Dev Lead:** A S Vincent (`PES2UG24CS002`)  

---

## 1. Terminal Execution Log

```
> backend@1.0.0 test
> jest --detectOpenHandles --runInBand --coverage --verbose

  console.log
    🔄 Initializing Online Exam Portal Database...
    ✅ Tables verified / created.
    ✅ Inserted 7 Seed Users (3 Students, 2 Instructors, 1 Admin, 1 Locked).
    ✅ Inserted 30 Questions (20 MCQ, 5 True/False, 5 Short Answer) with Option Sets.
    ✅ Created 4 Seed Exams (1 Live, 1 Completed, 1 Upcoming, 1 Draft).
    ✅ Inserted Sample Attempts, Graded Answers, and Security Audit Logs.
    🎉 Seed Complete! All data conforms to STP §6.4.

PASS tests/integration/api.test.js
  === Online Exam Portal (OEP) Comprehensive Test Suite ===
    √ TC-SYS-01: Health check returns online status (10 ms)
    Module M1: Authentication & User/Role Management (OEP-F-001..004)
      √ TC-Auth-01: Register a new student account successfully (86 ms)
      √ TC-Auth-01a: Duplicate email registration is rejected with 409 Conflict (7 ms)
      √ TC-Auth-02: Valid credentials login returns JWT session with role claims (73 ms)
      √ TC-Auth-02a: Invalid password returns 401 Unauthorized (74 ms)
      √ TC-Auth-02b: Locked account login is blocked with 403 Forbidden (11 ms)
      √ TC-Auth-03: Password reset OTP request returns verification code (31 ms)
      √ TC-Auth-04: RBAC enforces that Students cannot create exams (403 Forbidden) (12 ms)
    Module M2: Exam & Question-Bank Management (OEP-F-005..008)
      √ TC-Exam-01: Instructor creates a new scheduled exam (34 ms)
      √ TC-Exam-03: Exam scheduling blocks start time after end time (400 Bad Request) (8 ms)
      √ TC-Exam-02: Instructor adds question with options to question bank (38 ms)
    Module M3: Exam Delivery Engine (OEP-F-009..012, OEP-SR-004)
      √ TC-Take-01 & TC-Sec-05: Student starts active exam (correct_answer stripped from payload) (35 ms)
      √ TC-Take-03: Periodic auto-save persists student answers (27 ms)
      √ TC-Take-04: Student submits exam attempt and triggers auto-grading (29 ms)
    Module M4: Evaluation, Results & Analytics (OEP-F-013..016, OEP-SR-005)
      √ TC-Eval-01: Auto-grading correctly computed score for objective questions (9 ms)
      √ TC-Eval-03 & TC-Sec-06: Student result privacy strictly blocks cross-student access (403 Forbidden) (18 ms)
      √ TC-Eval-02: Instructor grades subjective question manually (32 ms)
      √ TC-Eval-04: Instructor retrieves aggregate class analytics and item analysis (15 ms)
    Security & Audit Logging (OEP-NF-004)
      √ TC-Sec-04: Administrator retrieves persistent audit logs (9 ms)

Test Suites: 1 passed, 1 total
Tests:       19 passed, 19 total
Snapshots:   0 total
Time:        3.143 s
```

---

## 2. Code Coverage Matrix

```
------------------------|---------|----------|---------|---------|-------------------
File                    | % Stmts | % Branch | % Funcs | % Lines | Key Areas Covered 
------------------------|---------|----------|---------|---------|-------------------
All files               |   67.25 |    47.43 |   69.23 |   66.90 | Full Integration  
 src/routes             |   98.27 |   100.00 |  100.00 |   98.27 | All HTTP Endpoints
 src/db/seed.js         |   95.29 |    90.00 |   60.00 |   95.00 | Schema & Seed Data
 src/middleware         |   78.12 |    64.28 |  100.00 |   78.12 | JWT, RBAC & Logger
 src/controllers/eval   |   78.51 |    64.28 |   85.71 |   77.60 | Grading & Scores  
 src/controllers/deliv  |   66.98 |    39.70 |   80.00 |   66.66 | Timer & Auto-Save 
 src/controllers/auth   |   46.60 |    36.17 |   42.85 |   46.60 | Auth & Passwords  
 src/controllers/exam   |   36.60 |    37.31 |   40.00 |   36.24 | Exam & Questions  
------------------------|---------|----------|---------|---------|-------------------
```

---

## 3. Exit Criteria Compliance (STP §5.4)
- **Open P1 (Critical) Defects:** 0
- **Open P2 (High) Defects:** 0
- **Overall Pass Rate:** 100% (19 / 19 passed)
- **Status:** **APPROVED & FROZEN FOR EVALUATION**

