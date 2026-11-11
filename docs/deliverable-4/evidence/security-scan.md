# Security Verification — OWASP ZAP Scan and Security Tests

> **Executed:** 11 November 2026 (maintenance release v1.0.1)
> **Requirements:** OEP-SR-001 – OEP-SR-005, OEP-NF-004 · **Test cases:** TC-Sec-01 – TC-Sec-07
> **Security Lead (STP):** A S Vincent (`PES2UG24CS002`) · **Executed by:** Aadish Sarin (`PES2UG24CS007`), QA Lead

No vulnerability scan had been run before this date; the README listed one as a planned duty. Both parts below were executed against the code in this release.

---

## 1. OWASP ZAP 2.17.0 Scan of the API

**Method.** ZAP's Automation Framework imported all 26 API routes from [`backend/security/oep-openapi.yaml`](../../../backend/security/oep-openapi.yaml), sent every request with an Administrator token (so protected routes were reachable), ran the passive scan, then the active scan (SQL injection, cross-site scripting, path traversal, command injection, server-side include and the other default release rules, medium strength). Plan: [`zap-plan.template.yaml`](../../../backend/security/zap-plan.template.yaml); runner: [`run-zap-scan.js`](../../../backend/security/run-zap-scan.js).

The scan was run three times on 11 Nov 2026. Each run imported all 26 routes (`openapi added 26 URLs`) and completed its active scan in 2–3 minutes. The first run found real problems; they were fixed and the scan repeated.

| Alert (ZAP risk) | First scan | Final scan | Assessment |
| :--- | :---: | :---: | :--- |
| SQL Injection – SQLite, time based (High) | 3 | 2 | **False positive.** Different endpoints are flagged on every run (`my-scorecard`, `role`, `newPassword`, `otp`, `question_text`). Replaying the strongest payload, `case randomblob(1000000000) when …`, returns in about 3 ms; a working injection would take seconds. `my-scorecard` rejects the Admin scan token with 403 before any SQL runs, `role` is checked against a fixed list, and all values are bound `?` parameters. The 200–400 ms differences ZAP measured are timing noise under scan load. |
| Application Error Disclosure (Medium) | 3 | 3 | **Real in the first scan, false positive in the final scan.** First scan: requests without a JSON body crashed login/register with HTTP 500, and malformed JSON returned 500 with the parser's message; fuzzed exam and user updates caused database constraint errors (500). All fixed (DEF-012). In the final scan the server logged **no errors at all**; the 3 matches are the exam text itself — seed question 4 has the answer option "500 Internal Server Error", which appears in the question bank and the exam payload. |
| Information Disclosure – Debug Error Messages (Low) | 3 | 3 | Same as above. All 24 server-error responses now return a generic message and log details on the server only. |
| X-Powered-By header leak (Low) | systemic | **0** | Fixed: `app.disable('x-powered-by')`. |
| X-Content-Type-Options missing (Low) | systemic | **0** | Fixed: `X-Content-Type-Options: nosniff` on every response. |
| Cross Site Scripting Weakness, persistent in JSON (Low) | 9 | 9 | **Accepted risk.** The API stores question text as entered and returns it as `application/json` with `nosniff`; the React frontend always renders it escaped (no `dangerouslySetInnerHTML`, `innerHTML` or `eval`). `TC-Sec-07d` covers this. |
| Authentication / Session Management Identified, User Agent Fuzzer (Informational) | 3 | 3 | Informational only. |

Reports: final scan [`zap-report.html`](../../../backend/security/results/zap-report.html) · [`zap-report.md`](../../../backend/security/results/zap-report.md); first scan [`zap-report-initial.html`](../../../backend/security/results/zap-report-initial.html) · [`zap-report-initial.md`](../../../backend/security/results/zap-report-initial.md). The scan token was an Administrator JWT for the local seed database; it is not stored in the reports or the repository.

**Reproduce** (API running on port 5000, Java 17+, ZAP cross-platform package):

```bash
cd backend
ZAP_JAR=/path/to/ZAP_2.17.0/zap-2.17.0.jar node security/run-zap-scan.js http://localhost:5000
```

---

## 2. Automated Security Tests (`backend/tests/integration/security.test.js`, 19 tests, all passing)

| Test | Requirement | What it proves |
| :--- | :--- | :--- |
| TC-Sec-01a | OEP-SR-001 | The API answers over HTTPS (`npm run start:https`, `src/secureServer.js`) |
| TC-Sec-01b, 01c | OEP-SR-001 | TLS 1.3 and a TLS 1.2-only client are accepted |
| TC-Sec-01d | control | The test client can speak TLS 1.1 to a permissive server, so the next result is meaningful |
| TC-Sec-01e | OEP-SR-001 | The OEP server refuses that TLS 1.1 client (protocol version alert) |
| TC-Sec-02a, 02b | OEP-SR-002 | Passwords are stored as bcrypt cost-10 hashes with a unique salt; hashes never appear in responses |
| TC-Sec-03a | OEP-SR-003 | No token → 401 |
| TC-Sec-03b, 03c, 03d | OEP-SR-003 | A token with an edited payload, a token signed with another secret and an unsigned `alg: none` token are all refused (403) |
| TC-Sec-03e | OEP-F-004 | A valid Student token cannot reach the question bank, analytics, audit log or user management |
| TC-Sec-03f | OEP-SR-003 | Locking an account blocks a token issued before the lock |
| TC-Sec-03g | OEP-F-004 | Self-registration cannot create an Administrator (fixed in v1.0.1: the API previously accepted `role: "Admin"`) |
| TC-Sec-07a | Injection | `' OR '1'='1' --` and similar login strings do not authenticate |
| TC-Sec-07b | Injection | `Robert'); DROP TABLE users; --` is stored as plain text; the table survives |
| TC-Sec-07c | Injection | `GET /api/exams/1%20OR%201=1` returns 404, not extra rows |
| TC-Sec-07d | XSS | Script markup in a question is returned as JSON data |
| TC-Sec-07e | ZAP finding | Malformed or missing request bodies get 400 with no internal details; no `X-Powered-By`; `nosniff` set |

Related tests in the other suites: TC-Sec-04 (audit log, Admin only), TC-Sec-05 (answer keys never sent to candidates), TC-Sec-06 (scorecard IDOR blocked).

---

## 3. Code Review Checks
- **SQL:** every query uses `?` placeholders. The two queries built with template strings insert only generated `?` lists (`examController.createExam`) or fixed column names (`authController.updateUserStatus`), never user input.
- **Output encoding:** the React frontend never uses `dangerouslySetInnerHTML`, `innerHTML` or `eval`, so stored text is always rendered escaped.

## 4. Known Limitations (not fixed in v1.0.1)
- `POST /api/auth/reset-password/request` returns the code as `demo_otp` because no email service exists; a deployment must remove it and send the code by email.
- The JWT secret falls back to a constant in `middleware/auth.js` when `JWT_SECRET` is not set; a deployment must set it.
- No rate limiting on login or code verification.
- An Instructor can edit or delete any instructor's exam (no ownership check on `PUT/DELETE /api/exams/:id`).
