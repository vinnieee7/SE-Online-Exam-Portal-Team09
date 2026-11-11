# Performance Load Test — 500 Concurrent Candidates (OEP-PERF-01)

> **Executed:** 11 November 2026 (maintenance release v1.0.1) with Apache JMeter 5.6.3
> **Requirements:** OEP-NF-001 (p90 ≤ 3.0 s), OEP-NF-002 (500 concurrent students) · **Test cases:** TC-Perf-01, TC-Perf-02
> **Performance Lead (STP):** Akshansh Agrawal (`PES2UG24CS045`) · **Executed by:** Aadish Sarin (`PES2UG24CS007`), QA Lead

No load test had been run before this date. The "p90 = 1.42 s" previously written in the backlog had no run, plan or result file behind it and has been replaced by the measurements below.

---

## 1. Scenario

| Phase | Users | What each user does |
| :--- | ---: | :--- |
| 1. Exam in progress | 500 (ramp-up 60 s) | Starts an attempt on the live exam (`GET /api/delivery/exams/1/attempt`), then for **10 minutes** saves 3 answers (`POST /api/delivery/attempts/:id/answers`) after every 1–3 s of think time |
| 2. Submission spike | 500 | Resumes the attempt, then **all 500 submit in the same instant** (JMeter Synchronizing Timer) |

One saved answer every ~2 s per candidate is far more frequent than a real candidate (the app auto-saves every 30 s and on each click), so this is a stress level of load.

- **Plan:** [`backend/perf/oep-load-test.jmx`](../../../backend/perf/oep-load-test.jmx) · **Setup:** [`prepare-load-test.js`](../../../backend/perf/prepare-load-test.js) creates 500 candidate accounts and tokens · **Summary script:** [`summarize-results.js`](../../../backend/perf/summarize-results.js)
- **Machine:** Intel Core i7-13645HX, 16 GB RAM, Windows 11; JMeter (OpenJDK 21) and the API (Node.js v26.13.0, `npm start`) on the **same machine**, so the numbers include the load generator's own CPU use.

---

## 2. Results

Full run, 11 Nov 2026, 20:54–21:06 IST (149,980 requests):

| Request | Samples | Errors | Mean | Median | p90 | p95 | p99 | Max |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 01 Start attempt | 500 | 0 | 34 ms | 20 ms | 58 ms | 83 ms | 302 ms | 305 ms |
| 02 Auto-save answers (10 minutes) | 148,480 | **0** | 17 ms | 15 ms | **41 ms** | 52 ms | 74 ms | 247 ms |
| 03 Resume attempt (spike) | 500 | 110 (22%) | 1,566 ms | 1,993 ms | 2,068 ms | 2,075 ms | 2,083 ms | 2,085 ms |
| 04 Submit attempt, all 500 together | 500 | 110 (22%) | 1,172 ms | 1,302 ms | 1,449 ms | 1,464 ms | 1,478 ms | 1,485 ms |
| **All requests** | **149,980** | **220 (0.15%)** | 26 ms | 15 ms | **48 ms** | 86 ms | 2,024 ms | 2,085 ms |

Throughput during the exam phase: about 235 requests per second.

**Verdict**

| Requirement | Result |
| :--- | :--- |
| **OEP-NF-001** — p90 ≤ 3.0 s | **Met.** Overall p90 48 ms; even the slowest request type (resume during the spike) has p90 2,068 ms. |
| **OEP-NF-002** — 500 concurrent students without degradation | **Partly met.** 500 candidates working for 10 minutes: 148,980 requests, **0 errors**, p90 41 ms. But when all 500 open a **new** connection in the same millisecond, Windows refused 16–25% of them before they reached the API (110 in the full run; 80, 124 and 92 in three repeat spikes). Each refused "resume" leaves its thread with no attempt id, so its following submit goes to `/attempts/NOT_FOUND/submit` (404) — the 110 failed submits are a consequence, not separate failures. **Every submission that connected succeeded** (390 of 390, max 1.5 s). |

Why the refusals happen: the operating system's queue of pending connections overflows. Raising Node's listen backlog to 4096 did not change the result (tested and reverted), so the limit is in the Windows TCP stack on this laptop, not in the application code. Real browsers keep their connection open between auto-saves and do not all reconnect in the same millisecond, so this burst is harsher than an exam hall. It should be re-tested on a Linux server before a real deployment; a client-side retry of a failed auto-submit would also cover it.

Raw statistics: [`backend/perf/results/statistics.json`](../../../backend/perf/results/statistics.json) (from the JMeter HTML dashboard).

---

## 3. Bottleneck Found and Fixed (DEF-011)

The first attempt at this test (before v1.0.1's database change) was stopped after 3 min 29 s when the test session was interrupted, but its numbers were already clear:

| | Before (default SQLite journal) | After (WAL, `synchronous = NORMAL`) |
| :--- | ---: | ---: |
| Requests per second | 60.9 | ~235 |
| Mean response time | 4,936 ms | 17 ms (auto-save) |
| Max response time | 11,670 ms | 247 ms (auto-save) |
| Errors | 0 of 12,751 | 0 of 148,980 (exam phase) |

Cause: with the default rollback journal and `synchronous = FULL`, every single `UPDATE` waits for its own disk flush, and each auto-save performs several writes on one shared connection. Fix: two `PRAGMA`s in `backend/src/config/db.js` (defect **DEF-011**).

---

## 4. Reproduce

```bash
cd backend
npm start                                   # terminal 1: API on port 5000
node perf/prepare-load-test.js 500          # terminal 2: reseeds the DB and writes perf/data/load-users.csv
jmeter -n -t perf/oep-load-test.jmx -Jusers=500 -Jduration=600 -l perf/results/raw/run.jtl -e -o perf/results/raw/dashboard
node perf/summarize-results.js perf/results/raw/dashboard/statistics.json perf/results/summary.md "my run"
npm run db:reset                            # restore the normal demo data afterwards
```
