# Updated Test Case Document (Mini-Project Part-3)

> **Course:** Software Engineering | **Section:** A | **Team Number:** 9  
> **Target System:** Online Exam Portal (OEP)  
> **Evaluation Period:** Sprint 1, Sprint 2 & Sprint 3 (2 Nov – 6 Nov 2026)  
> **QA Lead:** Aadish Sarin (`PES2UG24CS007`, `@aadishs-364`)  
> **Dev Lead & Facilitator:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)  
> **DevOps Lead:** Aditya Rao (`PES2UG24CS034`, `@aditya-130906`)  
> **Performance Lead:** Akshansh Agrawal (`PES2UG24CS045`, `@akshagra`)  
> **Repository:** [https://github.com/vinnieee7/SE-Online-Exam-Portal-Team09](https://github.com/vinnieee7/SE-Online-Exam-Portal-Team09)  
> **Baseline Reference:** [Software Test Plan (STP v1.0)](baseline/STP_Online_Exam_Portal_Team9.pdf)  

---

## 1. Document Overview & Change History

This document represents the formal update to the Software Test Plan (STP v1.0) test cases, as mandated by **Mini-Project Deliverables Part-3 §1**. All test cases have been augmented and revised to reflect:
1. Architectural shifts identified during sprint execution (DEV-01 through DEV-06, including SQLite migration and UTC ISO synchronization).
2. Defect remediation regressions (DEF-001 through DEF-006).
3. Addition of granular unit testing suites covering cryptographic operations, shuffle uniformity, timer calculations, and item difficulty algorithms.

### Summary of Test Case Counts
- **Total Automated Test Cases Executed:** 85 test cases (8 Jest suites)
- **Unit Test Cases:** 34 tests (`tests/unit/*.unit.test.js`)
- **System / Integration Test Cases:** 51 tests
  - 19 functional API tests (`tests/integration/api.test.js`)
  - 19 security tests (`tests/integration/security.test.js`)
  - 13 verification tests (`tests/integration/verification.test.js`)
- **Execution Pass Rate:** **100% (85 / 85 Passed)**
- **Coverage (all 85 tests):** 75.62% statements, 59.80% branches — see [Code Coverage Report](reports/Code_Coverage_Report_Team9.pdf)

---

## 2. Updated Integration & System Test Cases (STP §7 Updated)

| Test ID | Module / Area | Req Ref | Test Description & Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :-: |
| **TC-SYS-01** | System Health | Cross-Cutting | Send `GET /api/health` with active DB connection. | HTTP 200, `{ status: "ONLINE", timestamp }` returned. | Matches expected JSON format. | **PASS** |
| **TC-Auth-01** | M1: Auth | `OEP-F-001`<br>`OEP-SR-002` | `POST /api/auth/register` with valid student payload; verify bcrypt hash (cost 10). | HTTP 201 Created; password omitted from response body. | HTTP 201; password sanitized. | **PASS** |
| **TC-Auth-01a**| M1: Auth (DEF-003) | `OEP-F-001` | Register with duplicate email using mixed casing (`Student1@pesu.edu` vs `student1@pesu.edu`). | HTTP 409 Conflict; account creation blocked. | HTTP 409 Conflict returned. | **PASS** |
| **TC-Auth-02** | M1: Auth | `OEP-F-002`<br>`DS-Auth-02` | `POST /api/auth/login` with valid email & password. | HTTP 200 OK; returns signed JWT containing `{ id, email, role }` (24h expiry). | Valid JWT signed with `JWT_SECRET`. | **PASS** |
| **TC-Auth-02a**| M1: Auth | `OEP-F-002` | `POST /api/auth/login` with invalid password. | HTTP 401 Unauthorized; generic error message. | HTTP 401 Unauthorized. | **PASS** |
| **TC-Auth-02b**| M1: Auth | `OEP-SR-003` | `POST /api/auth/login` for locked user (`locked@pesu.edu`). | HTTP 403 Forbidden; account lockout notice returned. | HTTP 403 Forbidden. | **PASS** |
| **TC-Auth-03** | M1: Auth | `OEP-F-003` | `POST /api/auth/forgot-password` requesting 6-digit OTP. | HTTP 200 OK; OTP returned with 10-minute expiry window. | 6-digit cryptographic OTP returned. | **PASS** |
| **TC-Auth-04** | M1: RBAC | `OEP-F-004`<br>`DS-Auth-04` | Student bearer token attempts `POST /api/exams` (Instructor endpoint). | HTTP 403 Forbidden; role unauthorized error. | HTTP 403 Forbidden. | **PASS** |
| **TC-Exam-01** | M2: Exam CRUD | `OEP-F-005`<br>`DS-Exam-01` | Instructor token creates new exam with title, duration, schedule, and total marks. | HTTP 201 Created; exam saved to database. | HTTP 201 Created. | **PASS** |
| **TC-Exam-02** | M2: Bank CRUD | `OEP-F-006`<br>`DS-Exam-02` | Instructor adds question with options to bank. | HTTP 201 Created; options normalized and stored. | HTTP 201 Created. | **PASS** |
| **TC-Exam-03** | M2: Validation (DEF-004) | `OEP-F-007` | Create exam with `end_time <= start_time`. | HTTP 400 Bad Request; invalid schedule error. | HTTP 400 Bad Request. | **PASS** |
| **TC-Take-01** | M3: Delivery | `OEP-F-009`<br>`DS-Take-01` | Eligible candidate initiates active exam session (`GET /api/delivery/exams/:id/attempt`). | HTTP 200 OK; attempt record initialized or resumed. | HTTP 200 OK; attempt returned. | **PASS** |
| **TC-Sec-05**  | M3: Delivery (DEF-001) | `OEP-SR-004` | Inspect examinee question payload returned by `GET /api/delivery/exams/:id/attempt`. | `correct_answer` and `explanation` strictly stripped from payload. | Keys absent from JSON body. | **PASS** |
| **TC-Take-03** | M3: Delivery | `OEP-F-011`<br>`DS-Take-03` | Candidate background client emits 30-second periodic auto-save payload. | HTTP 200 OK; answers persisted to `answers` table. | HTTP 200 OK; answers saved. | **PASS** |
| **TC-Take-04** | M3: Delivery | `OEP-F-011`<br>`DS-Take-03` | Candidate submits active assessment (`POST /api/delivery/exams/:id/submit`). | HTTP 200 OK; status transitions to submitted/graded. | HTTP 200 OK. | **PASS** |
| **TC-Eval-01** | M4: Auto-Grade | `OEP-F-013`<br>`DS-Eval-01` | Auto-grading engine processes objective responses (MCQ, True/False) upon submission. | Score correctly calculated against answer key; attempt score updated. | Score matches correct choices. | **PASS** |
| **TC-Sec-06**  | M4: IDOR (DEF-005) | `OEP-SR-005` | Student A attempts to access Student B's scorecard via `/api/eval/scorecard/:id`. | HTTP 403 Forbidden; cross-student access blocked. | HTTP 403 Forbidden returned. | **PASS** |
| **TC-Eval-02** | M4: Manual Grade | `OEP-F-014`<br>`DS-Eval-02` | Instructor grades subjective response with partial marks and feedback text. | HTTP 200 OK; attempt updated and marked fully graded. | HTTP 200 OK; score updated. | **PASS** |
| **TC-Eval-04** | M4: Analytics | `OEP-F-016`<br>`DS-Eval-04` | Instructor fetches aggregate exam analytics (`GET /api/eval/exams/:id/analytics`). | HTTP 200 OK; returns mean, median, pass rate, and item difficulty index ($P$). | HTTP 200 OK; analytics accurate. | **PASS** |
| **TC-Sec-04**  | Security & Audit (DEF-006) | `OEP-NF-004`<br>`DS-Sec-04` | Administrator retrieves security audit log (`GET /api/audit-logs`). | HTTP 200 OK; returns actor, action, timestamp, and resolved client IP. | HTTP 200 OK; valid log array. | **PASS** |

---

## 3. Dedicated Unit Test Cases (Part-3 Additions)

### 3.1 Module M1: Authentication & User/Role Management (`tests/unit/auth.unit.test.js`)
| Test ID | Unit Function | Verification Target | Test Case Input | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :-: |
| **UT-Auth-01a** | `bcrypt.hash` | Salt cost factor | String `'SecretPassword@123'`, cost 10 | Hash begins with `$2a$` or `$2b$`, length 60 | **PASS** |
| **UT-Auth-01b** | `bcrypt.compare` | Valid credential comparison | Plain password against generated hash | Returns `true` | **PASS** |
| **UT-Auth-01c** | `bcrypt.compare` | Invalid credential comparison | Wrong password against generated hash | Returns `false` | **PASS** |
| **UT-Auth-02a** | `jwt.sign` | Token claims structure | `{ id: 101, email: 's@p.edu', role: 'Student' }` | Produces 3-segment signed JWT string | **PASS** |
| **UT-Auth-02b** | `jwt.verify` | Valid signature verification | Token signed with `JWT_SECRET` | Decodes matching `{ id, email, role }` | **PASS** |
| **UT-Auth-02c** | `jwt.verify` | Signature tampering rejection | Token signed with arbitrary forged secret | Throws `JsonWebTokenError` | **PASS** |
| **UT-Auth-03a** | `requireRole` | Authorized role permission | User with role `'Instructor'`, allowed `['Instructor']` | Calls `next()` once; zero error response | **PASS** |
| **UT-Auth-03b** | `requireRole` | Unauthorized role denial | User with role `'Student'`, allowed `['Instructor']` | Halts execution; emits HTTP 403 Forbidden | **PASS** |
| **UT-Auth-03c** | `requireRole` | Missing user context guard | Request object lacking `req.user` | Halts execution; emits HTTP 401 Unauthorized | **PASS** |
| **UT-Auth-04a** | `toLowerCase/trim`| Email sanitization | Input `'   Student.PES@Pesu.EDU   '` | Produces `'student.pes@pesu.edu'` | **PASS** |

### 3.2 Module M2: Exam & Question Bank Management (`tests/unit/exam.unit.test.js`)
| Test ID | Unit Function | Verification Target | Test Case Input | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :-: |
| **UT-Exam-01a** | `shuffleArray` | Element conservation | Array `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]` | Shuffled array contains exact elements and length | **PASS** |
| **UT-Exam-01b** | `shuffleArray` | Immutability protection | Array `['Q1', 'Q2', 'Q3']` | Source array remains unmodified | **PASS** |
| **UT-Exam-01c** | `shuffleArray` | Edge-case robustness | Inputs `[]`, `null`, `undefined` | Returns `[]` without throwing exceptions | **PASS** |
| **UT-Exam-01d** | `shuffleArray` | Randomization distribution | 25 iterations of 5 elements | Produces $> 1$ distinct permutations | **PASS** |
| **UT-Exam-02a** | `validateSchedule`| Valid window & duration | Start 10:00, End 12:00, Duration 60m | Returns `{ valid: true }` | **PASS** |
| **UT-Exam-02b** | `validateSchedule`| Inverted schedule rejection | Start 14:00, End 10:00, Duration 60m | Returns `{ valid: false, error: '...' }` | **PASS** |
| **UT-Exam-02c** | `validateSchedule`| Window vs duration check | Start 10:00, End 10:30, Duration 60m | Returns `{ valid: false, error: '...' }` | **PASS** |
| **UT-Exam-02d** | `validateSchedule`| Negative duration rejection | Duration `-15` | Returns `{ valid: false, error: '...' }` | **PASS** |
| **UT-Exam-03a** | Option Mapping | Key mapping consistency | 3 raw option strings | Maps to options with keys `'A', 'B', 'C'` | **PASS** |

### 3.3 Module M3: Exam Delivery Engine (`tests/unit/delivery.unit.test.js`)
| Test ID | Unit Function | Verification Target | Test Case Input | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :-: |
| **UT-Take-01a** | `computeRemaining`| Active countdown calculation | Start 10:00, Duration 60m, Now 10:15 | Exactly 2700 remaining seconds | **PASS** |
| **UT-Take-01b** | `computeRemaining`| Expiration floor limit | Start 10:00, Duration 60m, Now 11:05 | Exactly 0 (no negative numbers) | **PASS** |
| **UT-Take-01c** | ISO Parsing | Timezone independence | UTC ISO string format | Parses identically across UTC/IST locales | **PASS** |
| **UT-Take-02a** | Payload Sanitizer | Answer key stripping | Questions with `correct_answer` & `explanation` | Stripped questions lack both sensitive keys | **PASS** |
| **UT-Take-03a** | Auto-Save Parser | Answer payload validation | Valid array with whitespace and flags | Cleansed array of `{ question_id, option, flag }` | **PASS** |

### 3.4 Module M4: Evaluation & Analytics (`tests/unit/eval.unit.test.js`)
| Test ID | Unit Function | Verification Target | Test Case Input | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :-: |
| **UT-Eval-01a** | `computeAutoGrade`| Objective scoring accuracy | 2 MCQ + 1 TrueFalse responses | Calculates exact marks (3/6) case-insensitively | **PASS** |
| **UT-Eval-01b** | `computeAutoGrade`| Subjective detection | Attempt containing ShortAnswer question | Flags `hasSubjective: true`, status `'submitted'` | **PASS** |
| **UT-Eval-02a** | Item Analysis | Easy classification | 42 correct out of 50 responses | $P = 0.84 \implies$ `'Easy'` | **PASS** |
| **UT-Eval-02b** | Item Analysis | Moderate classification | 25 correct out of 50 responses | $P = 0.50 \implies$ `'Moderate'` | **PASS** |
| **UT-Eval-02c** | Item Analysis | Difficult classification | 10 correct out of 50 responses | $P = 0.20 \implies$ `'Difficult'` | **PASS** |
| **UT-Eval-03a** | IDOR Gatekeeper | Student viewing own result | Student ID 10 accessing attempt ID 10 | Allowed (`HTTP 200`) | **PASS** |
| **UT-Eval-03b** | IDOR Gatekeeper | Cross-student inspection | Student ID 10 accessing attempt ID 20 | Blocked (`HTTP 403 Forbidden`) | **PASS** |
| **UT-Eval-03c** | IDOR Gatekeeper | Privileged staff inspection | Instructor/Admin accessing student attempt | Allowed (`HTTP 200`) | **PASS** |

### 3.5 Cross-Cutting: Audit Logging & Utilities (`tests/unit/logger.unit.test.js`)
| Test ID | Unit Function | Verification Target | Test Case Input | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :-: |
| **UT-Sec-01a** | IP Resolver | Reverse proxy header | `headers['x-forwarded-for'] = '203.0.113.195'` | Returns `'203.0.113.195'` | **PASS** |
| **UT-Sec-01b** | IP Resolver | Socket remote address | `socket.remoteAddress = '192.168.1.100'` | Returns `'192.168.1.100'` | **PASS** |
| **UT-Sec-01c** | IP Resolver | Undefined socket fallback | `req = null` or `req = {}` | Returns safe fallback `'127.0.0.1'` | **PASS** |
| **UT-Sec-02a** | Event Formatter | Audit payload formatting | Valid user ID, action, details, IP | Structured object with uppercase action | **PASS** |
| **UT-Sec-02b** | Event Formatter | Unauthenticated audit event | `userId = null` | Sets `user_id: null` without error | **PASS** |

---

## 4. Verification Sign-Off

All 85 test cases (the cases tabulated above plus the security and verification suites) are automated in the project repository and execute on every commit via GitHub Actions CI:
- **QA Lead:** Aadish Sarin (`PES2UG24CS007`) — *Verified & Approved*
- **Dev Lead:** A S Vincent (`PES2UG24CS002`) — *Verified & Approved*

