import React from 'react';

/**
 * Module M4: Instructor Portal (Exam & Question CRUD, Grading, Analytics)
 * Assigned To: Aadish Sarin (PES2UG24CS007) & Akshansh Agrawal (PES2UG24CS045)
 * Requirements: OEP-F-005..008, OEP-F-013..016
 * Feature Branches: feature/m2-exam-mgmt-aadish, feature/m4-eval-analytics-akshansh
 */
export default function InstructorPortal() {
  return (
    <div className="card text-center" style={{ padding: '3rem' }}>
      <div className="badge badge-primary" style={{ marginBottom: '1rem' }}>Modules M2 & M4 — Pending Teammate PR</div>
      <h2>Faculty Assessment Management & Evaluation Portal</h2>
      <p className="text-secondary" style={{ maxWidth: '600px', margin: '0 auto 1.5rem' }}>
        Assigned to <strong>Aadish Sarin (PES2UG24CS007)</strong> and <strong>Akshansh Agrawal (PES2UG24CS045)</strong>.  
        Feature branches <code>feature/m2-exam-mgmt-aadish</code> and <code>feature/m4-eval-analytics-akshansh</code> pending PR merge.
      </p>
    </div>
  );
}
