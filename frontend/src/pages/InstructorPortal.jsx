import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, BookOpen, CheckSquare, BarChart3, Trash2, Edit3, Eye, CheckCircle2, Clock, Calendar } from 'lucide-react';

const InstructorPortal = () => {
  const [activeTab, setActiveTab] = useState('exams'); // 'exams', 'questions', 'submissions', 'analytics'
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Create Exam Modal Form State
  const [showExamModal, setShowExamModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDuration, setNewDuration] = useState(45);
  const [newStartTime, setNewStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [newEndTime, setNewEndTime] = useState(new Date(Date.now() + 2 * 3600000).toISOString().slice(0, 16));
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Create Question Modal Form State
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState('MCQ');
  const [qMarks, setQMarks] = useState(5);
  const [qAns, setQAns] = useState('A');
  const [qExpl, setQExpl] = useState('');
  const [qOptions, setQOptions] = useState([
    { option_key: 'A', option_text: '' },
    { option_key: 'B', option_text: '' },
    { option_key: 'C', option_text: '' },
    { option_key: 'D', option_text: '' },
  ]);

  // Manual Grading Modal State
  const [gradingAttempt, setGradingAttempt] = useState(null);
  const [manualMarks, setManualMarks] = useState({});
  const [manualFeedback, setManualFeedback] = useState({});

  useEffect(() => {
    fetchExams();
    fetchQuestions();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams');
      setExams(res.data.exams || []);
      if (res.data.exams?.length > 0 && !selectedExamId) {
        setSelectedExamId(res.data.exams[0].id);
      }
    } catch (err) {
      console.error('Failed to load exams', err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/exams/questions/bank');
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error('Failed to load questions', err);
    }
  };

  const fetchSubmissions = async (examId) => {
    try {
      setLoading(true);
      const res = await api.get(`/eval/exams/${examId}/submissions`);
      setSubmissions(res.data.submissions || []);
    } catch (err) {
      console.error('Failed to load submissions', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (examId) => {
    try {
      setLoading(true);
      const res = await api.get(`/eval/exams/${examId}/analytics`);
      setAnalyticsData(res.data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await api.post('/exams', {
        title: newTitle,
        description: newDesc,
        duration_minutes: parseInt(newDuration, 10),
        start_time: new Date(newStartTime).toISOString(),
        end_time: new Date(newEndTime).toISOString(),
        question_ids: selectedQuestions,
        is_published: 1
      });
      alert('Exam scheduled and published successfully!');
      setShowExamModal(false);
      fetchExams();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create exam');
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      await api.post('/exams/questions', {
        question_text: qText,
        question_type: qType,
        marks: parseInt(qMarks, 10),
        correct_answer: qAns,
        explanation: qExpl,
        options: qType === 'MCQ' ? qOptions : qType === 'TrueFalse' ? [
          { option_key: 'True', option_text: 'True' },
          { option_key: 'False', option_text: 'False' }
        ] : []
      });
      alert('Question added to Question Bank!');
      setShowQuestionModal(false);
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add question');
    }
  };

  const toggleExamPublish = async (examId, currentStatus) => {
    try {
      await api.put(`/exams/${examId}`, { is_published: currentStatus === 1 ? 0 : 1 });
      fetchExams();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const openManualGrading = async (attempt) => {
    try {
      const res = await api.get(`/eval/attempts/${attempt.id}/scorecard`);
      setGradingAttempt({ ...attempt, breakdown: res.data.breakdown });
    } catch (err) {
      alert('Failed to load attempt details');
    }
  };

  const submitManualGrade = async () => {
    try {
      const gradesPayload = gradingAttempt.breakdown
        .filter((b) => b.question_type === 'ShortAnswer')
        .map((b) => ({
          answer_id: b.answer_id,
          marks_awarded: parseFloat(manualMarks[b.answer_id] !== undefined ? manualMarks[b.answer_id] : b.marks_awarded),
          feedback: manualFeedback[b.answer_id] || b.instructor_feedback || ''
        }));

      const res = await api.post(`/eval/attempts/${gradingAttempt.id}/grade`, { grades: gradesPayload });
      alert(res.data.message || 'Subjective question evaluation finalized!');
      setGradingAttempt(null);
      fetchSubmissions(selectedExamId);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit grades');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Instructor Portal</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Course Management: Exam Creation, Question Bank (M2), Evaluation & Class Analytics (M4)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setShowQuestionModal(true)} className="btn btn-secondary">
            <Plus size={16} /> Add to Question Bank
          </button>
          <button onClick={() => setShowExamModal(true)} className="btn btn-primary">
            <Plus size={16} /> Schedule New Exam
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button
          onClick={() => setActiveTab('exams')}
          className={`tab-btn ${activeTab === 'exams' ? 'active' : ''}`}
        >
          <BookOpen size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Exam Management
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
        >
          <CheckSquare size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Question Bank ({questions.length})
        </button>
        <button
          onClick={() => { setActiveTab('submissions'); fetchSubmissions(selectedExamId || exams[0]?.id); }}
          className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
        >
          <Edit3 size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Submissions & Grading
        </button>
        <button
          onClick={() => { setActiveTab('analytics'); fetchAnalytics(selectedExamId || exams[0]?.id); }}
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
        >
          <BarChart3 size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Performance Analytics
        </button>
      </div>

      {/* TAB 1: EXAMS LIST */}
      {activeTab === 'exams' && (
        <div className="table-responsive card" tabIndex={0} role="region" aria-label="Exams">
          <table className="table">
            <thead>
              <tr>
                <th>Exam ID</th>
                <th>Title</th>
                <th>Duration</th>
                <th>Total Marks</th>
                <th>Schedule Window</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((ex) => (
                <tr key={ex.id}>
                  <td style={{ fontWeight: 600 }}>#{ex.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{ex.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ex.description}</div>
                  </td>
                  <td>{ex.duration_minutes} Mins</td>
                  <td>{ex.total_marks} Marks</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {new Date(ex.start_time).toLocaleDateString()} - {new Date(ex.end_time).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`badge ${ex.is_published ? 'badge-student' : 'badge-admin'}`}>
                      {ex.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleExamPublish(ex.id, ex.is_published)}
                      className="btn btn-outline btn-sm"
                    >
                      {ex.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: QUESTION BANK */}
      {activeTab === 'questions' && (
        <div className="table-responsive card" tabIndex={0} role="region" aria-label="Question bank">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Question Text</th>
                <th>Type</th>
                <th>Marks</th>
                <th>Answer Key</th>
                <th>Options / Choices</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id}>
                  <td style={{ fontWeight: 600 }}>Q{q.id}</td>
                  <td style={{ maxWidth: '400px' }}>
                    <div style={{ fontWeight: 500 }}>{q.question_text}</div>
                    {q.explanation && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '0.25rem' }}>
                        💡 {q.explanation}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-student" style={{ fontSize: '0.7rem' }}>
                      {q.question_type}
                    </span>
                  </td>
                  <td>{q.marks}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    {q.correct_answer}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {q.options?.map((o) => `${o.option_key}: ${o.option_text}`).join(' | ') || 'Subjective'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: SUBMISSIONS & MANUAL GRADING */}
      {activeTab === 'submissions' && (
        <div className="card">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
            <label htmlFor="grade-exam-select" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Select Exam to Grade:</label>
            <select id="grade-exam-select"
              className="form-control"
              style={{ maxWidth: '320px' }}
              value={selectedExamId || ''}
              onChange={(e) => {
                setSelectedExamId(e.target.value);
                fetchSubmissions(e.target.value);
              }}
            >
              {exams.map((e) => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
          </div>

          <div className="table-responsive" tabIndex={0} role="region" aria-label="Submissions">
            <table className="table">
              <thead>
                <tr>
                  <th>Attempt ID</th>
                  <th>Candidate Name</th>
                  <th>Email</th>
                  <th>Submitted At</th>
                  <th>Current Score</th>
                  <th>Grading Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No submissions found for this assessment.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.id}>
                      <td style={{ fontWeight: 600 }}>#{sub.id}</td>
                      <td>{sub.student_name}</td>
                      <td>{sub.student_email}</td>
                      <td>{new Date(sub.submit_time || sub.start_time).toLocaleString()}</td>
                      <td style={{ fontWeight: 700, fontSize: '1rem' }}>{sub.score} Marks</td>
                      <td>
                        <span className={`badge ${sub.is_graded ? 'badge-student' : 'badge-admin'}`}>
                          {sub.status === 'in_progress' ? 'In Progress' : sub.is_graded ? 'Graded' : 'Pending Review'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => openManualGrading(sub)}
                          className="btn btn-primary btn-sm"
                          disabled={sub.status === 'in_progress'}
                        >
                          Evaluate / Grade
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: EXAM ANALYTICS & ITEM ANALYSIS */}
      {activeTab === 'analytics' && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label htmlFor="analytics-exam-select" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Select Exam for Analytics:</label>
              <select id="analytics-exam-select"
                className="form-control"
                style={{ maxWidth: '350px' }}
                value={selectedExamId || ''}
                onChange={(e) => {
                  setSelectedExamId(e.target.value);
                  fetchAnalytics(e.target.value);
                }}
              >
                {exams.map((e) => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </div>
          </div>

          {analyticsData && (
            <div>
              {/* Summary Metrics Cards */}
              <div className="grid-cols-3" style={{ marginBottom: '1.5rem' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Class Average</div>
                  <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '0.25rem' }}>
                    {analyticsData.averageScore} Marks
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Median: {analyticsData.medianScore} Marks
                  </div>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Passing Percentage</div>
                  <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
                    {analyticsData.passPercentage}%
                  </div>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Highest / Lowest</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '0.25rem' }}>
                    {analyticsData.highestScore} / {analyticsData.lowestScore}
                  </div>
                </div>
              </div>

              {/* Item Analysis Table (OEP-F-016) */}
              <div className="card">
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
                  Item Difficulty Analysis (% Accuracy per Question)
                </h3>
                <div className="table-responsive" tabIndex={0} role="region" aria-label="Item difficulty analysis">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>QID</th>
                        <th>Question</th>
                        <th>Type</th>
                        <th>Responses</th>
                        <th>Correct Responses</th>
                        <th>Accuracy Rate</th>
                        <th>Difficulty Index (p)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.itemAnalysis?.map((item) => (
                        <tr key={item.questionId}>
                          <td style={{ fontWeight: 600 }}>#{item.questionId}</td>
                          <td>{item.questionText}</td>
                          <td>{item.questionType}</td>
                          <td>{item.totalResponses}</td>
                          <td>{item.correctResponses}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '80px', height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${item.accuracyRate}%`, height: '100%', background: item.accuracyRate > 60 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}></div>
                              </div>
                              <span style={{ fontWeight: 600 }}>{item.accuracyRate}%</span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${item.difficultyLabel === 'Hard' ? 'badge-admin' : 'badge-student'}`}>
                              {item.difficultyIndex} ({item.difficultyLabel})
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE EXAM MODAL */}
      {showExamModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Schedule New Examination (M2)</h3>
            <form onSubmit={handleCreateExam}>
              <div className="form-group">
                <label className="form-label" htmlFor="exam-title">Exam Title</label>
                <input id="exam-title"
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Software Testing Final Exam"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="exam-desc">Description / Scope</label>
                <textarea id="exam-desc"
                  className="form-control"
                  rows={2}
                  placeholder="Covers Modules 1 to 4"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="exam-duration">Duration (Minutes)</label>
                  <input id="exam-duration"
                    type="number"
                    min="5"
                    className="form-control"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="exam-start">Start Time</label>
                  <input id="exam-start"
                    type="datetime-local"
                    className="form-control"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="exam-end">End Time</label>
                <input id="exam-end"
                  type="datetime-local"
                  className="form-control"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Select Questions from Bank ({selectedQuestions.length} selected)</label>
                <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
                  {questions.map((q) => (
                    <label key={q.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedQuestions.includes(q.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedQuestions([...selectedQuestions, q.id]);
                          else setSelectedQuestions(selectedQuestions.filter((id) => id !== q.id));
                        }}
                      />
                      <span>[{q.question_type} - {q.marks}m] {q.question_text.slice(0, 70)}...</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowExamModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE QUESTION MODAL */}
      {showQuestionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Add Question to Question Bank</h3>
            <form onSubmit={handleCreateQuestion}>
              <div className="form-group">
                <label className="form-label" htmlFor="q-text">Question Text</label>
                <textarea id="q-text"
                  className="form-control"
                  rows={3}
                  required
                  placeholder="Enter the question statement..."
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="q-type">Question Type</label>
                  <select id="q-type"
                    className="form-control"
                    value={qType}
                    onChange={(e) => setQType(e.target.value)}
                  >
                    <option value="MCQ">Multiple Choice Question (MCQ)</option>
                    <option value="TrueFalse">True / False</option>
                    <option value="ShortAnswer">Subjective Short Answer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="q-marks">Marks</label>
                  <input id="q-marks"
                    type="number"
                    min="1"
                    className="form-control"
                    value={qMarks}
                    onChange={(e) => setQMarks(e.target.value)}
                  />
                </div>
              </div>

              {qType === 'MCQ' && (
                <div className="form-group">
                  <label className="form-label">Options (A, B, C, D)</label>
                  {qOptions.map((opt, i) => (
                    <div key={opt.option_key} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, width: '20px' }}>{opt.option_key}.</span>
                      <input aria-label={`Option ${opt.option_key} text`}
                        type="text"
                        required
                        className="form-control"
                        placeholder={`Option ${opt.option_key} text`}
                        value={opt.option_text}
                        onChange={(e) => {
                          const updated = [...qOptions];
                          updated[i].option_text = e.target.value;
                          setQOptions(updated);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="q-answer">Correct Answer Key</label>
                {qType === 'MCQ' ? (
                  <select id="q-answer" className="form-control" value={qAns} onChange={(e) => setQAns(e.target.value)}>
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                ) : qType === 'TrueFalse' ? (
                  <select id="q-answer" className="form-control" value={qAns} onChange={(e) => setQAns(e.target.value)}>
                    <option value="True">True</option>
                    <option value="False">False</option>
                  </select>
                ) : (
                  <input id="q-answer"
                    type="text"
                    required
                    className="form-control"
                    placeholder="Reference model answer..."
                    value={qAns}
                    onChange={(e) => setQAns(e.target.value)}
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="q-expl">Explanation / Solution Guide</label>
                <input id="q-expl"
                  type="text"
                  className="form-control"
                  placeholder="Rationale displayed after grading..."
                  value={qExpl}
                  onChange={(e) => setQExpl(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowQuestionModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL GRADING MODAL (OEP-F-014) */}
      {gradingAttempt && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Manual Evaluation: {gradingAttempt.student_name}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Candidate: {gradingAttempt.student_email} | Attempt #{gradingAttempt.id}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {gradingAttempt.breakdown?.map((q, idx) => (
                <div key={q.answer_id} style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600 }}>Q{idx + 1} ({q.question_type})</span>
                    <span style={{ color: 'var(--accent-primary-text)', fontWeight: 600 }}>Max: {q.max_marks} Marks</span>
                  </div>

                  <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>{q.question_text}</p>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                    <strong>Student Response:</strong>
                    <div style={{ marginTop: '0.25rem' }}>{q.selected_option || q.short_answer_text || 'No Answer'}</div>
                  </div>

                  {q.question_type === 'ShortAnswer' ? (
                    <div className="grid-cols-2" style={{ gap: '0.75rem' }}>
                      <div>
                        <label className="form-label" htmlFor={`grade-marks-${q.answer_id}`} style={{ fontSize: '0.75rem' }}>Award Marks (out of {q.max_marks})</label>
                        <input id={`grade-marks-${q.answer_id}`}
                          type="number"
                          max={q.max_marks}
                          min="0"
                          step="0.5"
                          className="form-control"
                          defaultValue={q.marks_awarded}
                          onChange={(e) => setManualMarks({ ...manualMarks, [q.answer_id]: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="form-label" htmlFor={`grade-feedback-${q.answer_id}`} style={{ fontSize: '0.75rem' }}>Faculty Feedback</label>
                        <input id={`grade-feedback-${q.answer_id}`}
                          type="text"
                          className="form-control"
                          placeholder="e.g. Well articulated"
                          defaultValue={q.instructor_feedback || ''}
                          onChange={(e) => setManualFeedback({ ...manualFeedback, [q.answer_id]: e.target.value })}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>
                      ✓ Auto-Graded by System: {q.marks_awarded} / {q.max_marks} Marks
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setGradingAttempt(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={submitManualGrade} className="btn btn-primary">
                Save & Finalize Grades
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorPortal;
