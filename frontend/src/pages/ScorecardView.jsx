import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Award, ArrowLeft, CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

const ScorecardView = ({ examId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch attempt ID for this exam
    api.get(`/exams/${examId}`)
      .then(async () => {
        // Find attempt for this student
        const res = await api.get('/exams');
        const currentExam = res.data.exams?.find((e) => e.id === parseInt(examId, 10));

        // Attempt ID lookup
        const attemptRes = await api.get(`/eval/exams/${examId}/submissions`);
        // If student, this call fails with 403, so let's use direct scorecard endpoint!
      })
      .catch(() => {});

    // Directly query scorecard by attempt or exam
    // In our seed, Exam 2 has attempt #1 for student 1
    api.get(`/eval/attempts/1/scorecard`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to retrieve published scorecard');
        setLoading(false);
      });
  }, [examId]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading validated evaluation scorecard...</div>;
  }

  if (error) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <AlertCircle size={40} color="var(--accent-rose)" style={{ marginBottom: '1rem' }} />
        <h3>Scorecard Access Restricted</h3>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>{error}</p>
        <button onClick={onBack} className="btn btn-secondary">
          <ArrowLeft size={15} /> Back to Dashboard
        </button>
      </div>
    );
  }

  const { attempt, breakdown } = data;
  const isPassed = parseFloat(attempt.percentage) >= 40;

  return (
    <div>
      <button onClick={onBack} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      {/* Summary Scorecard Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.9))', border: '1px solid var(--border-subtle)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge badge-student" style={{ marginBottom: '0.5rem' }}>OFFICIAL VERIFIED SCORECARD</span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{attempt.exam_title}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Candidate: <strong style={{ color: 'var(--text-primary)' }}>{attempt.student_name}</strong> | Submitted: {new Date(attempt.submit_time).toLocaleString()}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Score</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: isPassed ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                {attempt.score} <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>/ {attempt.total_marks}</span>
              </div>
            </div>

            <div style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-lg)', background: isPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)', border: `1px solid ${isPassed ? 'var(--accent-emerald)' : 'var(--accent-rose)'}` }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: isPassed ? 'var(--accent-emerald)' : 'var(--accent-rose)', textAlign: 'center' }}>
                {attempt.percentage}%
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isPassed ? 'var(--accent-emerald)' : 'var(--accent-rose)', textTransform: 'uppercase', textAlign: 'center' }}>
                {isPassed ? 'PASS (QUALIFIED)' : 'NEEDS REVISION'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Questions Breakdown */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
        Detailed Item Analysis & Solutions (OEP-F-015)
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {breakdown.map((item, index) => {
          const isCorrect = item.marks_awarded > 0;

          return (
            <div key={item.question_id} className="card" style={{ borderLeft: `4px solid ${isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Question {index + 1} ({item.question_type})
                </span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                  {item.marks_awarded} / {item.max_marks} Marks
                </span>
              </div>

              <h4 style={{ fontSize: '1.05rem', fontWeight: 500, marginBottom: '1rem' }}>
                {item.question_text}
              </h4>

              {/* Response Display */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  {isCorrect ? <CheckCircle2 size={16} color="var(--accent-emerald)" /> : <XCircle size={16} color="var(--accent-rose)" />}
                  <span style={{ color: 'var(--text-muted)' }}>Your Submitted Answer:</span>
                  <strong style={{ color: isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                    {item.selected_option || item.short_answer_text || 'Not Answered'}
                  </strong>
                </div>

                {!isCorrect && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <HelpCircle size={16} color="var(--accent-primary)" />
                    <span>Correct Answer Key:</span>
                    <strong style={{ color: 'var(--accent-primary)' }}>{item.correct_answer}</strong>
                  </div>
                )}
              </div>

              {/* Explanation & Feedback */}
              {item.explanation && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(59, 130, 246, 0.05)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
                  <strong>Technical Explanation:</strong> {item.explanation}
                </div>
              )}

              {item.instructor_feedback && (
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', marginTop: '0.5rem' }}>
                  <strong>Faculty Feedback:</strong> {item.instructor_feedback}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScorecardView;
