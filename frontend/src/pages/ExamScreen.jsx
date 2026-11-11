import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Clock, ShieldAlert, CheckCircle2, Bookmark, Send, AlertTriangle } from 'lucide-react';

const ExamScreen = ({ examId, onFinishExam, onExit }) => {
  const [examData, setExamData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: { selected_option, short_answer_text } }
  const [markedReview, setMarkedReview] = useState(new Set());
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState('All changes saved');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Refs give the interval callbacks the latest values instead of the ones from the first render
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const attemptIdRef = useRef(null);
  const submittingRef = useRef(false); // blocks a second submission while one is in flight

  // Initialize Exam Session
  useEffect(() => {
    // React StrictMode mounts this effect twice in development. Without this flag the first,
    // already-cleaned-up mount would still start its own timer and the clock would run at double speed (DEF-008).
    let cancelled = false;
    let timerInterval = null;
    let autoSaveInterval = null;

    api.get(`/delivery/exams/${examId}/attempt`)
      .then((res) => {
        if (cancelled) return;

        if (res.data.status === 'already_submitted') {
          alert('You have already submitted this exam.');
          onFinishExam();
          return;
        }

        const { attemptId: attId, exam, questions: qList, savedAnswers = {} } = res.data;
        attemptIdRef.current = attId;
        setAttemptId(attId);
        setExamData(exam);
        setQuestions(qList);
        setSecondsLeft(exam.remaining_seconds);
        setAnswers(savedAnswers);
        setLoading(false);

        // Countdown display (OEP-F-010). The server's remaining_seconds is the source of truth;
        // expiry is handled by the effect below, never inside this state updater.
        timerInterval = setInterval(() => {
          setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        // Periodic 30s auto-save (OEP-F-011, TC-Take-03)
        autoSaveInterval = setInterval(() => {
          triggerAutoSave(attemptIdRef.current, answersRef.current);
        }, 30000);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.error || 'Failed to start exam session');
        setLoading(false);
      });

    return () => {
      cancelled = true;
      if (timerInterval) clearInterval(timerInterval);
      if (autoSaveInterval) clearInterval(autoSaveInterval);
    };
  }, [examId]);

  const triggerAutoSave = async (attId, currentAnswers) => {
    if (!attId) return;
    try {
      setAutoSaveStatus('Saving changes...');
      const payload = Object.entries(currentAnswers).map(([qId, val]) => ({
        question_id: parseInt(qId, 10),
        selected_option: val.selected_option || null,
        short_answer_text: val.short_answer_text || null,
      }));

      if (payload.length > 0) {
        await api.post(`/delivery/attempts/${attId}/answers`, { answers: payload });
      }
      setAutoSaveStatus('All answers auto-saved to cloud');
    } catch (err) {
      setAutoSaveStatus('Auto-save retry pending...');
    }
  };

  const handleSelectOption = (questionId, optionKey) => {
    const updated = {
      ...answers,
      [questionId]: {
        ...(answers[questionId] || {}),
        selected_option: optionKey
      }
    };
    setAnswers(updated);
    // Instant background save for high reliability (OEP-NF-003)
    triggerAutoSave(attemptId, updated);
  };

  const handleShortAnswerChange = (questionId, text) => {
    const updated = {
      ...answers,
      [questionId]: {
        ...(answers[questionId] || {}),
        short_answer_text: text
      }
    };
    setAnswers(updated);
  };

  const toggleReview = (questionId) => {
    setMarkedReview((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  // Final submission, used by the confirm button and by the timer.
  // The alert comes after the request so a time-up submission is never held up waiting for a click.
  const submitFinalExam = async ({ auto = false } = {}) => {
    const attId = attemptIdRef.current;
    if (!attId || submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      // Final flush of the latest answers before locking the attempt
      await triggerAutoSave(attId, answersRef.current);
      await api.post(`/delivery/attempts/${attId}/submit`);
      alert(
        auto
          ? 'Time is up. Your answers were submitted automatically (OEP-F-011).'
          : 'Examination submitted successfully! Auto-grading has been completed.'
      );
      onFinishExam();
    } catch (err) {
      submittingRef.current = false; // let the candidate retry with Finish & Submit
      alert('Error during final submission: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  // Auto-submit when the countdown reaches 00:00 (OEP-F-011, DEF-007).
  // Runs after render, so it sees the real attempt id and the latest answers. It depends only on the
  // countdown and the attempt: re-running on every new submitFinalExam would retry a failed submit in a loop.
  useEffect(() => {
    if (secondsLeft === 0 && attemptId) {
      submitFinalExam({ auto: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, attemptId]);

  const formatTimer = (totalSeconds) => {
    if (totalSeconds === null) return '00:00';
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem' }}>Synchronizing exam parameters with server...</div>;
  }

  if (error) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <ShieldAlert size={40} color="var(--accent-rose)" style={{ marginBottom: '1rem' }} />
        <h2>Exam Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>{error}</p>
        <button onClick={onExit} className="btn btn-secondary">Return to Portal</button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isReviewed = markedReview.has(currentQ.id);
  const currentAnswer = answers[currentQ.id] || {};

  return (
    <div>
      {/* Top Exam Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', border: '1px solid var(--border-subtle)' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{examData?.title}</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)' }}></span>
            {autoSaveStatus}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="timer-box">
            <Clock size={18} />
            <span>{formatTimer(secondsLeft)}</span>
          </div>

          <button onClick={() => setShowSubmitModal(true)} className="btn btn-primary">
            <Send size={15} />
            <span>Finish & Submit</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
        {/* Question Panel */}
        <div className="card" style={{ minHeight: '480px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '0.9rem' }}>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="badge badge-student" style={{ fontSize: '0.75rem' }}>
                  {currentQ.marks} Marks
                </span>
                <button
                  onClick={() => toggleReview(currentQ.id)}
                  className={`btn btn-sm ${isReviewed ? 'btn-danger' : 'btn-outline'}`}
                  title="Mark for later review"
                >
                  <Bookmark size={13} />
                  <span>{isReviewed ? 'Marked for Review' : 'Mark for Review'}</span>
                </button>
              </div>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 500, lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {currentQ.question_text}
            </h3>

            {/* Answer Controls based on question type */}
            {currentQ.question_type === 'MCQ' || currentQ.question_type === 'TrueFalse' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {currentQ.options?.map((opt) => {
                  const isSelected = currentAnswer.selected_option === opt.option_key;

                  return (
                    <label
                      key={opt.id}
                      onClick={() => handleSelectOption(currentQ.id, opt.option_key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input
                        type="radio"
                        name={`q_${currentQ.id}`}
                        checked={isSelected}
                        onChange={() => {}}
                        style={{ accentColor: 'var(--accent-primary)', width: '1.2rem', height: '1.2rem' }}
                      />
                      <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{opt.option_key}.</span>
                      <span style={{ fontSize: '0.95rem' }}>{opt.option_text}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div>
                <textarea
                  className="form-control"
                  rows={6}
                  placeholder="Type your subjective answer response here..."
                  value={currentAnswer.short_answer_text || ''}
                  onChange={(e) => handleShortAnswerChange(currentQ.id, e.target.value)}
                  onBlur={() => triggerAutoSave(attemptId, answers)}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                  * This short-answer question will be manually graded by your instructor.
                </span>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              className="btn btn-primary"
            >
              Next
            </button>
          </div>
        </div>

        {/* Sidebar Question Palette (OEP-F-012) */}
        <div>
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>
              Question Palette (OEP-F-012)
            </h4>

            <div className="palette-grid">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const ans = answers[q.id];
                const isAnswered = ans && (ans.selected_option || ans.short_answer_text);
                const isMarked = markedReview.has(q.id);

                let statusClass = '';
                if (isMarked) statusClass = 'review';
                else if (isAnswered) statusClass = 'answered';
                if (isCurrent) statusClass += ' current';

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`palette-btn ${statusClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ width: '12px', height: '12px', background: 'rgba(16, 185, 129, 0.4)', borderRadius: '3px' }}></span>
                <span>Answered</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ width: '12px', height: '12px', background: 'rgba(245, 158, 11, 0.4)', borderRadius: '3px' }}></span>
                <span>Marked for Review</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '12px', height: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '3px' }}></span>
                <span>Unvisited</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showSubmitModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <AlertTriangle size={48} color="var(--accent-amber)" style={{ marginBottom: '1rem' }} />
              <h3>Confirm Final Submission</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                You have answered {Object.keys(answers).length} out of {questions.length} questions.
                Are you sure you want to end your examination session?
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => setShowSubmitModal(false)} className="btn btn-secondary">
                Continue Test
              </button>
              <button onClick={() => submitFinalExam()} className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Yes, Submit Assessment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamScreen;
