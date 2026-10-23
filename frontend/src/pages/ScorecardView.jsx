import React from 'react';

/**
 * Module M4: Candidate Private Scorecard & Performance Feedback
 * Assigned To: Akshansh Agrawal (PES2UG24CS045)
 * Requirements: OEP-F-015, OEP-SR-005
 * Feature Branch: feature/m4-eval-analytics-akshansh
 */
export default function ScorecardView({ examId, onBack }) {
  return (
    <div className="card text-center" style={{ padding: '3rem' }}>
      <div className="badge badge-success" style={{ marginBottom: '1rem' }}>Module M4 — Scorecard</div>
      <h2>Candidate Assessment Scorecard</h2>
      <p className="text-secondary">
        Assigned to <strong>Akshansh Agrawal (PES2UG24CS045)</strong>. Feature branch pending merge.
      </p>
      <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: '1rem' }}>Return to Portal</button>
    </div>
  );
}
