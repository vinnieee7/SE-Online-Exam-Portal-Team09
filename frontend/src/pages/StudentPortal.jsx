import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Clock, Award, ArrowRight, CheckCircle, Lock, Play } from 'lucide-react';

const StudentPortal = ({ onStartExam, onViewScorecard }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.get('/exams');
      setExams(res.data.exams || []);
    } catch (err) {
      setError('Failed to load scheduled exams');
    } finally {
      setLoading(false);
    }
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const start = new Date(exam.start_time);
    const end = new Date(exam.end_time);

    if (exam.attempt_status === 'submitted' || exam.attempt_status === 'graded') {
      return { label: 'COMPLETED', color: 'badge-student', canTake: false, isDone: true };
    }
    if (now < start) {
      return { label: 'UPCOMING', color: 'badge-admin', canTake: false, isDone: false };
    }
    if (now > end) {
      return { label: 'EXPIRED', color: 'badge-admin', canTake: false, isDone: false };
    }
    return { label: 'LIVE NOW', color: 'badge-live', canTake: true, isDone: false };
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading scheduled assessments...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Candidate Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          View scheduled assessments, ongoing examination sessions, and published performance scorecards.
        </p>
      </div>

      {error && <div className="card" style={{ color: 'var(--accent-rose)', marginBottom: '1.5rem' }}>{error}</div>}

      <div className="grid-cols-2">
        {exams.map((exam) => {
          const status = getExamStatus(exam);

          return (
            <div key={exam.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className={`badge ${status.color}`}>{status.label}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID #{exam.id}</span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>{exam.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem', minHeight: '2.5rem' }}>
                  {exam.description || 'No description provided.'}
                </p>

                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={14} />
                    <span>{exam.duration_minutes} Mins</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Award size={14} />
                    <span>{exam.total_marks} Marks</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} />
                    <span>{exam.question_count || 10} Questions</span>
                  </div>
                </div>
              </div>

              <div>
                {status.isDone ? (
                  <button
                    onClick={() => onViewScorecard(exam.id)}
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                  >
                    <CheckCircle size={15} color="var(--accent-emerald)" />
                    <span>View Performance Scorecard</span>
                  </button>
                ) : status.canTake ? (
                  <button
                    onClick={() => onStartExam(exam.id)}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    <Play size={15} />
                    <span>Start Assessment Now</span>
                  </button>
                ) : (
                  <button className="btn btn-outline" disabled style={{ width: '100%', opacity: 0.6 }}>
                    <Lock size={15} />
                    <span>Locked (Opens at scheduled time)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentPortal;
