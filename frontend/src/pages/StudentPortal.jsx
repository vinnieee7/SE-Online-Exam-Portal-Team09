import React from 'react';

/**
 * Module M3: Exam Delivery Engine (Candidate Assessment Portal)
 * Assigned To: Aditya Rao (PES2UG24CS034)
 * Requirements: OEP-F-009, OEP-F-010, OEP-F-011, OEP-F-012
 * Feature Branch: feature/m3-exam-engine-aditya
 */
export default function StudentPortal({ onStartExam, onViewScorecard }) {
  return (
    <div className="card text-center" style={{ padding: '3rem' }}>
      <div className="badge badge-primary" style={{ marginBottom: '1rem' }}>Module M3 — Pending Teammate PR</div>
      <h2>Student Assessment Portal</h2>
      <p className="text-secondary" style={{ maxWidth: '600px', margin: '0 auto 1.5rem' }}>
        This module is assigned to <strong>Aditya Rao (PES2UG24CS034)</strong>.  
        The implementation resides on branch <code>feature/m3-exam-engine-aditya</code> awaiting Pull Request review.
      </p>
    </div>
  );
}
