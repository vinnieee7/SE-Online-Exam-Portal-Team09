import React from 'react';

/**
 * Module M3: Active Exam Screen with Countdown Timer & Auto-Save
 * Assigned To: Aditya Rao (PES2UG24CS034)
 * Requirements: OEP-F-010, OEP-F-011, OEP-F-012, OEP-SR-004
 * Feature Branch: feature/m3-exam-engine-aditya
 */
export default function ExamScreen({ examId, onFinishExam, onExit }) {
  return (
    <div className="card text-center" style={{ padding: '3rem' }}>
      <div className="badge badge-warning" style={{ marginBottom: '1rem' }}>Module M3 — Active Test Screen</div>
      <h2>Timed Assessment Engine</h2>
      <p className="text-secondary">
        Assigned to <strong>Aditya Rao (PES2UG24CS034)</strong>. Feature branch pending merge.
      </p>
      <button className="btn btn-secondary" onClick={onExit} style={{ marginTop: '1rem' }}>Exit to Dashboard</button>
    </div>
  );
}
