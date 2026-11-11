# Agile Sprint Retrospective: Online Exam Portal (OEP)

> **Course:** Software Engineering | **Section:** A | **Team Number:** 9  
> **Evaluation Period:** 12 October – 30 October 2026 (addendum 11 November 2026)  
> **Facilitator & Dev Lead:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)  
> **QA Lead:** Aadish Sarin (`PES2UG24CS007`)  
> **DevOps Lead:** Aditya Rao (`PES2UG24CS034`)  
> **Performance Lead:** Akshansh Agrawal (`PES2UG24CS045`)  
> **Target Repository:** [https://github.com/vinnieee7/SE-Online-Exam-Portal-Team09](https://github.com/vinnieee7/SE-Online-Exam-Portal-Team09)

---

## 1. Retrospective Framework & Methodology

Our team applied the standard Agile Retrospective framework across four distinct vectors:
1. **What Went Well (Celebrate successes & strengths)**
2. **What Went Wrong / Blockers Encountered (Pain points & defects)**
3. **Actionable Improvements (Immediate process enhancements)**
4. **Key Software Engineering Lessons Learned (Academic & practical insights)**

---

## 2. Sprint 1 Retrospective (19 Oct – 23 Oct 2026)

### What Went Well
- **Strict Role Separation & Interface Contracts:** Early alignment on RESTful endpoint schemas allowed Vincent (Module M1) and Aadish (Module M2) to build concurrently without blocking dependencies.
- **Automated CI Setup:** Setting up GitHub Actions CI on Day 1 ensured all backend pull requests ran automated linting and tests prior to merging.
- **Reproducible Seed Data:** Aditya’s deterministic seed engine (`seed.js`) eliminated "works on my machine" issues by pre-populating identical users, exams, and question banks.

### What Went Wrong / Blockers
- **Timezone Serialization Discrepancies (`DEF-002`):** Database timestamps without explicit ISO-8601 `Z` designators caused the client countdown timer to miscalculate remaining time by 5.5 hours in the IST timezone.
- **Payload Over-Exposure (`DEF-001`):** A naive `SELECT * FROM questions` query accidentally shipped the `correct_answer` field to candidate browsers in JSON responses.
- **Email Case Sensitivity (`DEF-003`):** Default SQLite unique constraints permitted duplicate user registrations with differing capitalizations.

### Key Improvements Made
- Added automated response payload assertions in Supertest (`expect(q.correct_answer).toBeUndefined()`) to catch security leaks in CI.
- Implemented global `.toLowerCase().trim()` sanitization across all incoming authentication inputs.
- Normalized all timestamp parsing to explicit UTC ISO strings.

---

## 3. Sprint 2 Retrospective (26 Oct – 30 Oct 2026)

### What Went Well
- **Cross-Testing Mandate Enforcement:** The STP requirement where each developer tested a teammate’s module (Vincent $\rightarrow$ M4, Aadish $\rightarrow$ M1, Aditya $\rightarrow$ M2, Akshansh $\rightarrow$ M3) directly surfaced critical security bugs that the original authors overlooked.
- **Defect Removal Efficiency (100% DRE):** All 6 logged defects were resolved and verified before release; the DEF-004 fix reached `main` with M2 on 2 November.
- **Auto-Save Resilience:** The 30-second periodic auto-save and automatic submit upon timer expiry proved rock-solid during network interruption testing.

### What Went Wrong / Blockers
- **IDOR Scorecard Access (`DEF-005`):** During cross-testing of Module M4, Vincent discovered that Candidate Beta could inspect Candidate Alpha's private scorecard by manipulating the URL parameter `/api/eval/attempts/1/scorecard`.
- **Test Harness Socket Undefined Error (`DEF-006`):** The audit logger crashed under Supertest mock requests because `req.socket` was not instantiated in virtual HTTP requests.

### Key Improvements Made
- Enforced strict authorization ownership checks (`req.user.id === attempt.student_id`) on all candidate-specific endpoints.
- Hardened middleware with safe optional chaining and fallback IP addresses (`req.socket?.remoteAddress || req.ip || '127.0.0.1'`).

---

## 4. Key Software Engineering Lessons Learned

1. **Defense in Depth Over Client-Side Reliance:** Never trust client-side timer countdowns or assume users won't inspect browser DevTools. Timers and answer evaluation must always be server-enforced.
2. **Value of Independent Cross-Testing:** Developers are inherently biased when testing their own code. Cross-testing by peers caught both P1 critical defects (`DEF-001` and `DEF-005`).
3. **Traceability as a Project Management Tool:** Maintaining the Requirements Traceability Matrix (RTM) from Day 1 ensured that all 26 functional, non-functional, and security requirements were accounted for in test plans and code reviews.
4. **Automated CI as a Quality Gate:** Rejecting broken PRs automatically in GitHub Actions kept the `main` branch always deployable and ready for evaluation.

---

## 5. Addendum: Post-Sprint Verification (11 November 2026)

### What Went Wrong
- **Integration slipped past the sprints:** the schema and seed, M2 and the first M3 code reached GitHub on 30 Oct – 1 Nov, and the last feature merge (PR #31) was on 2 November, after the planned 30 October freeze.
- **Evidence was claimed before it existed:** the backlog and RTM recorded a JMeter result, an accessibility pass and TLS support with no executed run behind them.
- **The exam timer failed at 00:00:** auto-submit posted to `/attempts/null/submit` (DEF-007), and in development mode the clock ran at double speed (DEF-008). The backend tests could not see either bug because both live in the browser.
- **Two server-side defects in attempt start:** simultaneous start requests could return HTTP 500 (DEF-009), and the question order changed on every refresh (DEF-010).

### Improvements Made (v1.0.1)
- Fixed DEF-007 – DEF-012 (including a database write bottleneck found by the load test and unhandled errors found by the ZAP scan), with tests that fail on the old code.
- Ran the load test (JMeter), a vulnerability scan (OWASP ZAP), an accessibility audit (Lighthouse and axe-core) and TLS tests, and committed the results.
- Corrected all commit references, dates and story points in the documentation to match git history and the GitHub issues.

### Lessons
1. **Definition of done = merged to `main`, CI green, evidence committed.** "Done on my machine" did not reach the shared repository in time.
2. **Test the timer in a real browser, not only through the API.** Integration tests passed while the user-facing behaviour was broken.
3. **Record measurements, not targets.** A number in a report needs a run, a date and a file behind it.
