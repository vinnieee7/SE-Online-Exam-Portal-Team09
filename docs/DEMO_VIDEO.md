# Online Exam Portal (OEP) — 2-Minute Product Demonstration

> **Course:** Software Engineering | **Section:** A | **Team Number:** 9  
> **Target Repository:** [https://github.com/vinnieee7/SE-Online-Exam-Portal-Team09](https://github.com/vinnieee7/SE-Online-Exam-Portal-Team09)  
> **Facilitator & Dev Lead:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)  
> **QA Lead:** Aadish Sarin (`PES2UG24CS007`)  
> **DevOps Lead:** Aditya Rao (`PES2UG24CS034`)  
> **Performance Lead:** Akshansh Agrawal (`PES2UG24CS045`)  

---

## 1. Video Access Link

- **Direct Demonstration Video (MP4):** [product-demo.mp4](demo/product-demo.mp4) (1.51 MB, 1280x720 HD, H.264 / AAC)
- **Folder Location:** `docs/demo/product-demo.mp4`

> [!NOTE]  
> The demonstration video was automatically captured and rendered directly from the live working application using an orchestrated Playwright HD screencast and transcoded to standard web-compatible H.264 MP4 format with progressive faststart. It covers all 5 phases with live HUD annotations.

---

## 2. 2-Minute Product Demo Walkthrough Script

| Timestamp | Screen / Role | Action & Feature Demonstrated | Primary Owner | SRS / Req Ref |
| :---: | :--- | :--- | :--- | :--- |
| **0:00 – 0:25** | **Authentication & Shell**<br>(*Student / Admin*) | • Register student account (`student1@pesu.edu`) with case-insensitive validation.<br>• Secure JWT login & role redirection.<br>• Dark theme audited against WCAG 2.1 AA (contrast fixed in v1.0.1). | A S Vincent (`002`) | `OEP-F-001`<br>`OEP-F-002`<br>`OEP-UI-01` |
| **0:25 – 0:50** | **Instructor Portal**<br>(*Instructor*) | • Create scheduled exam (validate start < end time).<br>• Add questions to Question Bank (MCQ, True/False, Short).<br>• Server-side Fisher-Yates randomization. | Aadish Sarin (`007`) | `OEP-F-005`<br>`OEP-F-006`<br>`OEP-F-008` |
| **0:50 – 1:20** | **Candidate Exam Delivery**<br>(*Student*) | • Start active assessment (DevTools payload check: answer keys stripped).<br>• Real-time server-synchronized countdown timer.<br>• Question palette navigation & 30-second periodic auto-save. | Aditya Rao (`034`) | `OEP-F-009`<br>`OEP-F-010`<br>`OEP-F-011`<br>`OEP-SR-004` |
| **1:20 – 1:45** | **Evaluation & Analytics**<br>(*Instructor / Student*) | • Auto-grading objective responses upon submit.<br>• Instructor evaluates subjective short answer & awards partial marks.<br>• Candidate views private scorecard (IDOR blocked).<br>• Class average, pass rate, and item difficulty analytics. | Akshansh Agrawal (`045`)| `OEP-F-013`<br>`OEP-F-014`<br>`OEP-F-015`<br>`OEP-F-016` |
| **1:45 – 2:00** | **Admin & Security Audit**<br>(*Administrator*) | • Administrator views the security audit log.<br>• Lock suspicious account and test 403 login rejection.<br>• Automated test suite execution (51/51 passing). | A S Vincent (`002`) | `OEP-SEC-01`<br>`OEP-NF-004`<br>`OEP-QA-01` |

---

## 3. How to Run the Product Locally for Live Demo

```bash
# 1. Install backend and frontend dependencies
cd backend && npm install && cd ../frontend && npm install && cd ..

# 2. Reset and seed the SQLite database (STP §6.4 data). Exam 1 is "live" for 50 minutes after seeding.
npm run db:reset

# 3. Run the automated test suite (51 tests in 3 files)
npm test

# 4. Start the servers in two terminals
npm run dev:backend    # API on http://localhost:5000
npm run dev:frontend   # App on http://localhost:5173
```

### Pre-Configured Seed Demo Credentials (password for every account: `Password@123`):
- **Admin:** `admin@pesu.edu`
- **Instructor:** `instructor1@pesu.edu`
- **Student 1:** `student1@pesu.edu`
- **Student 2:** `student2@pesu.edu`
- **Locked User:** `locked@pesu.edu` (login is refused with 403)
