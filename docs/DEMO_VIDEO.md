# Online Exam Portal (OEP) — 2-Minute Product Demonstration

> **Course:** Software Engineering | **Section:** A | **Team Number:** 9  
> **Target Repository:** [https://github.com/vinnieee7/SE-Online-Exam-Portal](https://github.com/vinnieee7/SE-Online-Exam-Portal)  
> **Facilitator & Dev Lead:** A S Vincent (`PES2UG24CS002`, `@vinnieee7`)  
> **QA Lead:** Aadish Sarin (`PES2UG24CS007`)  
> **DevOps Lead:** Aditya Rao (`PES2UG24CS034`)  
> **Performance Lead:** Akshansh Agrawal (`PES2UG24CS045`)  

---

## 1. Video Access Link

- **Direct Demonstration Video Link:** [Click here to view / download the 2-minute MP4 demo](demo/product-demo.mp4)  
- **Cloud Mirror (PES Drive / Stream):** `https://drive.google.com/file/d/YOUR_DEMO_VIDEO_ID/view?usp=sharing` *(Update with your drive link if hosting externally)*

> [!NOTE]  
> If the video file exceeds GitHub's 50MB direct repository threshold, the primary link above points to `docs/demo/product-demo.mp4`, and the cloud mirror link provides immediate streaming access without repository bloat.

---

## 2. 2-Minute Product Demo Walkthrough Script

| Timestamp | Screen / Role | Action & Feature Demonstrated | Primary Owner | SRS / Req Ref |
| :---: | :--- | :--- | :--- | :--- |
| **0:00 – 0:25** | **Authentication & Shell**<br>(*Student / Admin*) | • Register student account (`student1@pesu.edu`) with case-insensitive validation.<br>• Secure JWT login & role redirection.<br>• Toggle WCAG 2.1 AA accessible Dark Mode. | A S Vincent (`002`) | `OEP-F-001`<br>`OEP-F-002`<br>`OEP-UI-01` |
| **0:25 – 0:50** | **Instructor Portal**<br>(*Instructor*) | • Create scheduled exam (validate start < end time).<br>• Add questions to Question Bank (MCQ, True/False, Short).<br>• Server-side Fisher-Yates randomization. | Aadish Sarin (`007`) | `OEP-F-005`<br>`OEP-F-006`<br>`OEP-F-008` |
| **0:50 – 1:20** | **Candidate Exam Delivery**<br>(*Student*) | • Start active assessment (DevTools payload check: answer keys stripped).<br>• Real-time server-synchronized countdown timer.<br>• Question palette navigation & 30-second periodic auto-save. | Aditya Rao (`034`) | `OEP-F-009`<br>`OEP-F-010`<br>`OEP-F-011`<br>`OEP-SR-004` |
| **1:20 – 1:45** | **Evaluation & Analytics**<br>(*Instructor / Student*) | • Auto-grading objective responses upon submit.<br>• Instructor evaluates subjective short answer & awards partial marks.<br>• Candidate views private scorecard (IDOR blocked).<br>• Class average, pass rate, and item difficulty analytics. | Akshansh Agrawal (`045`)| `OEP-F-013`<br>`OEP-F-014`<br>`OEP-F-015`<br>`OEP-F-016` |
| **1:45 – 2:00** | **Admin & Security Audit**<br>(*Administrator*) | • Administrator views tamper-evident security audit logs.<br>• Lock suspicious account and test 403 login rejection.<br>• Automated test suite execution (19/19 passing). | A S Vincent (`002`) | `OEP-SEC-01`<br>`OEP-NF-004`<br>`OEP-QA-01` |

---

## 3. How to Run the Product Locally for Live Demo

```bash
# 1. Install all backend and frontend dependencies
npm run install:all

# 2. Reset and seed SQLite database with STP §6.4 compliant data
npm run db:reset

# 3. Execute the full automated test suite (19/19 passing)
npm test

# 4. Start concurrent development servers (Backend: 5000 | Frontend: 5173)
npm run dev
```

### Pre-Configured Seed Demo Credentials:
- **Admin:** `admin@pesu.edu` | Password: `password123`
- **Instructor:** `teacher1@pesu.edu` | Password: `password123`
- **Student 1:** `student1@pesu.edu` | Password: `password123`
- **Student 2:** `student2@pesu.edu` | Password: `password123`
- **Locked User:** `locked@pesu.edu` | Password: `password123`

