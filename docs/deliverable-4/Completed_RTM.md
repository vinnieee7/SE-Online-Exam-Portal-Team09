# Completed Requirements Traceability Matrix (RTM)
**Project:** Online Exam Portal (OEP)  
**Team Number:** 9 | **Section:** A  
**QA Lead:** Aadish Sarin (`PES2UG24CS007`)  
**Status Codes:** `A` = Accepted (Verified & Passed), `P` = Partial, `N` = Not Started  
**Overall Coverage:** 26 / 26 Requirements (100% Accepted)

---

| Req ID | Requirement Description | Design Spec | Module | Test Case(s) | Responsible Tester | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **OEP-F-001** | User registration with email uniqueness & role request | DS-Auth-01 | M1 | TC-Auth-01, TC-Auth-01a | Aadish Sarin (`007`) | **A** |
| **OEP-F-002** | User login and secure JWT session creation | DS-Auth-02 | M1 | TC-Auth-02, TC-Auth-02a | Aadish Sarin (`007`) | **A** |
| **OEP-F-003** | Password reset via 6-digit OTP verification | DS-Auth-03 | M1 | TC-Auth-03 | Aadish Sarin (`007`) | **A** |
| **OEP-F-004** | Role-Based Access Control (RBAC) middleware | DS-Auth-04 | M1 | TC-Auth-04 | Aadish Sarin (`007`) | **A** |
| **OEP-F-005** | Exam CRUD lifecycle (Create, Read, Update, Delete) | DS-Exam-01 | M2 | TC-Exam-01 | Aditya Rao (`034`) | **A** |
| **OEP-F-006** | Question bank management (MCQ, True/False, Short) | DS-Exam-02 | M2 | TC-Exam-02 | Aditya Rao (`034`) | **A** |
| **OEP-F-007** | Exam schedule, duration and total marks validation | DS-Exam-03 | M2 | TC-Exam-03 | Aditya Rao (`034`) | **A** |
| **OEP-F-008** | Question order randomization (Fisher-Yates) | DS-Exam-04 | M2 | TC-Exam-04 | Aditya Rao (`034`) | **A** |
| **OEP-F-009** | Exam listing for eligible candidates | DS-Take-01 | M3 | TC-Take-01 | Akshansh Agrawal (`045`) | **A** |
| **OEP-F-010** | Server-enforced countdown timer engine | DS-Take-02 | M3 | TC-Take-02 | Akshansh Agrawal (`045`) | **A** |
| **OEP-F-011** | 30-second periodic auto-save and auto-submit | DS-Take-03 | M3 | TC-Take-03, TC-Rel-01 | Akshansh Agrawal (`045`) | **A** |
| **OEP-F-012** | Question navigation palette and mark-for-review | DS-Take-04 | M3 | TC-Take-04 | Akshansh Agrawal (`045`) | **A** |
| **OEP-F-013** | Auto-grade objective questions against server key | DS-Eval-01 | M4 | TC-Eval-01 | A S Vincent (`002`) | **A** |
| **OEP-F-014** | Manual grading interface for subjective responses | DS-Eval-02 | M4 | TC-Eval-02 | A S Vincent (`002`) | **A** |
| **OEP-F-015** | Scorecard display with solution explanation | DS-Eval-03 | M4 | TC-Eval-03 | A S Vincent (`002`) | **A** |
| **OEP-F-016** | Class performance analytics and item difficulty | DS-Eval-04 | M4 | TC-Eval-04 | A S Vincent (`002`) | **A** |
| **OEP-NF-001**| Page load response latency $\le$ 3.0 s (p90) | DS-Perf-01 | All | TC-Perf-01 | Akshansh Agrawal (`045`) | **A** |
| **OEP-NF-002**| 500 concurrent students support without degradation | DS-Perf-02 | All | TC-Perf-02 | Akshansh Agrawal (`045`) | **A** |
| **OEP-NF-003**| In-progress answer recovery (99.5% availability) | DS-Rel-01 | M3 | TC-Rel-01 | Aditya Rao (`034`) | **A** |
| **OEP-NF-004**| Persistent audit logging for critical events | DS-Sec-04 | All | TC-Sec-04 | A S Vincent (`002`) | **A** |
| **OEP-NF-005**| WCAG 2.1 AA accessibility (4.5:1 contrast, tab nav) | DS-UX-01 | UI | TC-UX-01 | Akshansh Agrawal (`045`) | **A** |
| **OEP-SR-001**| TLS 1.2+ encrypted transport communication | DS-Sec-01 | Net | TC-Sec-01 | A S Vincent (`002`) | **A** |
| **OEP-SR-002**| Cryptographic password hashing (Bcrypt cost 10) | DS-Sec-02 | M1 | TC-Sec-02 | A S Vincent (`002`) | **A** |
| **OEP-SR-003**| Server-side authorization check on all protected APIs | DS-Sec-03 | M1 | TC-Sec-03 | A S Vincent (`002`) | **A** |
| **OEP-SR-004**| Answer key strictly stripped from candidate payload | DS-Sec-05 | M3 | TC-Sec-05 | A S Vincent (`002`) | **A** |
| **OEP-SR-005**| Candidate result isolation (Blocks IDOR / cross-view) | DS-Sec-06 | M4 | TC-Sec-06 | A S Vincent (`002`) | **A** |

---

### Sign-Off & Verification
- **Aadish Sarin (QA Lead):** *Approved — 100% Requirement Coverage Verified*
- **A S Vincent (Dev Lead):** *Approved — Build Candidate Ready for Release*
