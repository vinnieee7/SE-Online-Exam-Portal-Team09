# Accessibility Audit — WCAG 2.1 AA (OEP-NF-005, TC-UX-01)

> **Executed:** 11 November 2026 (maintenance release v1.0.1)
> **Tools:** Lighthouse 12.8.2 (Microsoft Edge, headless) for the login page; axe-core 4.10.2 — the rule engine Lighthouse uses — for every page behind login, with the WCAG 2.0/2.1 A and AA rule sets
> **UI owner:** Akshansh Agrawal (`PES2UG24CS045`, issue #23) · **Executed by:** Aadish Sarin (`PES2UG24CS007`), QA Lead

No accessibility audit had been run before this date. Lighthouse can only reach pages without a login, so the authenticated pages were checked by running axe-core inside the logged-in app for each role.

---

## 1. Results

| Page / state | Before v1.0.1 | After v1.0.1 |
| :--- | :--- | :--- |
| Login (Lighthouse) | 100 / 100 | **100 / 100** ([report](accessibility/lighthouse-login.report.html)) |
| Login (axe) | 0 violations | **0** |
| Student dashboard | 1 — muted text contrast 3.96:1 | **0** |
| Student scorecard | 1 — muted text contrast 3.96:1 | **0** |
| Exam screen and submit dialog | 1 rule, 3 elements — palette legend contrast 3.38:1 | **0** |
| Instructor: exams, question bank, submissions, analytics tabs | contrast; unlabelled exam pickers; table regions not keyboard-focusable | **0** |
| Instructor: Schedule Exam and Add Question dialogs | inputs and dropdowns without a programmatic label (critical) | **0** |
| Instructor: manual grading dialog | "Max: N Marks" contrast 3.99:1 | **0** |
| Admin: users and audit trail tabs | 7–27 role dropdowns without a name (critical); table regions not focusable | **0** |

**Result: 0 WCAG 2.1 A/AA violations on every page and dialog.**

---

## 2. What Was Fixed

| Rule (impact) | Cause | Fix |
| :--- | :--- | :--- |
| `color-contrast` (serious) | `--text-muted: #6b7280` gave 3.38–3.96:1; WCAG AA needs 4.5:1 for normal text | `--text-muted: #8f97a5` (4.98:1 on `--bg-elevated`, 6.5:1 on the page background) |
| `color-contrast` (serious) | Blue `#3b82f6` small text on `#1f2937` cards = 3.99:1 | New token `--accent-primary-text: #60a5fa` for small text on dark cards |
| `label` (critical) | `<label>` elements were not connected to their inputs | `htmlFor` / `id` pairs on every form field (login, register, schedule exam, add question, grading) |
| `select-name` (critical) | Dropdowns with no accessible name | Connected labels; per-row `aria-label` such as "Role for student1@pesu.edu" on the Admin table |
| `scrollable-region-focusable` (serious) | Scrollable `.table-responsive` containers could not be reached by keyboard | `tabIndex={0}`, `role="region"` and an `aria-label` on each table container |

Files: `frontend/src/index.css`, `pages/AuthPage.jsx`, `pages/InstructorPortal.jsx`, `pages/AdminPortal.jsx`.

---

## 3. Limits of This Audit
Automated rules find roughly a third to a half of WCAG problems. Not covered here: a full screen-reader walkthrough, keyboard-only completion of an exam, and the exam palette's colour-only status cues (answered / marked for review), which also have a text legend.
