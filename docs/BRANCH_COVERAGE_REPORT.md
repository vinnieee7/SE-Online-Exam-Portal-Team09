# Branch Coverage Report (Mini-Project Part-3 §2.b.iv)

> **Course:** Software Engineering | **Section:** A | **Team Number:** 9
> **Target System:** Online Exam Portal (OEP)
> **Testing Window:** 2 – 6 November 2026 (Sprint 3); results regenerated 12 November 2026 after the v1.0.1 fixes
> **Team:** Aadish Sarin (`PES2UG24CS007`, QA Lead) · A S Vincent (`PES2UG24CS002`, Dev Lead) · Aditya Rao (`PES2UG24CS034`, DevOps Lead) · Akshansh Agrawal (`PES2UG24CS045`, Performance Lead)
> **Code tested:** commit `57e01fd` on `main` · **Repository:** https://github.com/vinnieee7/SE-Online-Exam-Portal-Team09


---

## 1. Summary

Branch coverage counts every outcome of a decision — both sides of each `if`/`else`, each `?:` result, each `switch` case and each short-circuit of `&&`, `||` and default values — and reports how many were taken at least once.

| Item | Value |
| :--- | :--- |
| Branch outcomes in the backend | 413 |
| Taken by the tests | 247 |
| **Branch coverage** | **59.80%** |
| Tests run | 85 (all suites), all passing |
| Tool / run | Jest 30.5.2 + Istanbul, 12 November 2026, commit `57e01fd` |

## 2. Branches by file

| File | Branches | Taken | Not taken | Branch % |
| :--- | ---: | ---: | ---: | ---: |
| `src/controllers/examController.js` | 150 | 79 | 71 | 52.66 |
| `src/controllers/evalController.js` | 84 | 54 | 30 | 64.28 |
| `src/controllers/deliveryController.js` | 65 | 35 | 30 | 53.84 |
| `src/controllers/authController.js` | 47 | 29 | 18 | 61.70 |
| `src/app.js` | 16 | 10 | 6 | 62.50 |
| `src/middleware/auth.js` | 16 | 15 | 1 | 93.75 |
| `src/config/db.js` | 13 | 8 | 5 | 61.53 |
| `src/middleware/logger.js` | 12 | 8 | 4 | 66.66 |
| `src/db/seed.js` | 10 | 9 | 1 | 90.00 |
| **All files** | **413** | **247** | **166** | **59.80** |

Route files and `secureServer.js` contain no branches (they only wire handlers) and are 100% covered by statements.

## 3. Decisions where both outcomes are tested

### 3.1 Authentication middleware (`auth.js`, 15 of 16 outcomes)

```
Request ──► token present? ──no──► 401                          (TC-Sec-03a)
                 │yes
                 ▼
            signature valid? ──no──► 403                        (TC-Sec-03b, 03c, 03d)
                 │yes
                 ▼
            account locked? ──yes──► 403                         (TC-Auth-02b, TC-Sec-03f)
                 │no
                 ▼
            role allowed? ──no──► 403                            (TC-Auth-04, TC-Sec-03e, UT-Auth-03)
                 │yes
                 ▼
               next()
```
The one outcome not taken: a valid token for a user who has since been deleted (401).

### 3.2 Other decisions with both sides tested

| Decision | True side | False side |
| :--- | :--- | :--- |
| Exam end time after start time (`createExam`) | Exam created — `TC-Exam-01` | 400 — `TC-Exam-03`, DEF-004 |
| Linked question ids exist (`createExam`) | Exam created — `TC-Exam-01` | 400, not 500 — `TC-Exam-01b` |
| Attempt already exists (`startOrGetAttempt`) | Resume, same order — `TC-Take-05b` | New attempt — `TC-Take-01`, `TC-Take-05a` |
| Time left > 0 (`Math.max(0, …)`) | Seconds left — `TC-Take-02a`, `02b` | 0 — `TC-Take-02d` |
| Window end before full duration | Capped at window end — `TC-Take-02c` | Full duration — `TC-Take-02a` |
| Timestamp already has a time zone | Parsed as is | Treated as UTC — `TC-Take-02e`, DEF-002 |
| Question type objective (`autoGrade`) | Graded at once — `TC-Eval-01` | Left for the instructor — `TC-Eval-02` |
| Scorecard owner is the requester | Returned — `TC-Eval-03` | 403 — `TC-Sec-06`, DEF-005 |
| Email already registered (case-insensitive) | 409 — `TC-Auth-01a`, DEF-003 | 201 — `TC-Auth-01` |
| Password matches | Token issued — `TC-Auth-02` | 401 — `TC-Auth-02a`, `TC-Sec-07a` |
| Request body is valid JSON with required fields | Handled | 400 with no internal detail — `TC-Sec-07e`, DEF-012 |

## 4. Branches not taken

| File | Not taken | What they are |
| :--- | ---: | :--- |
| `src/controllers/examController.js` | 71 | `updateExam` (every field-by-field change and the publish switch), `deleteExam`, `deleteQuestion`, and missing-field checks in `createExam` / `addQuestion` |
| `src/controllers/deliveryController.js` | 30 | Exam not found / not published / not started / already ended; reopening a submitted attempt; invalid auto-save bodies; the unreachable pre-merge grading fallback |
| `src/controllers/evalController.js` | 30 | Invalid manual-grade input (empty grade list, unknown attempt, attempt still in progress), scorecard before solutions are released, `getMyScorecard`, analytics for an unknown exam |
| `src/controllers/authController.js` | 18 | Missing registration fields, reset request for an unknown email, wrong or expired reset code, `updateUserStatus` |
| `src/app.js` | 6 | Fallback stub routers for modules not yet merged, and the `PORT` default |
| `src/config/db.js` | 5 | Database open / query error callbacks |
| `src/middleware/logger.js` | 4 | IP fallbacks when neither proxy header nor socket address exists |
| `src/middleware/auth.js`, `src/db/seed.js` | 2 | Deleted-user token; seed run as a script rather than imported |

Most untaken branches are input-validation and error-handling paths. The planned next tests, in order: (1) update and delete an exam and a question, (2) Admin role change and lock through the API, (3) starting an exam before it opens and after it closes, (4) invalid manual-grade input.

## 5. Conclusion

Branch coverage is **59.80%** (247 of 413 outcomes). Every security decision (token, signature, lock, role, ownership) and every decision tied to a logged defect has both outcomes tested.

*Prepared by Aadish Sarin (QA Lead).*
