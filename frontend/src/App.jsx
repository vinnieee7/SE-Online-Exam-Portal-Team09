import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import StudentPortal from './pages/StudentPortal';
import ExamScreen from './pages/ExamScreen';
import ScorecardView from './pages/ScorecardView';
import InstructorPortal from './pages/InstructorPortal';
import AdminPortal from './pages/AdminPortal';

function AppContent() {
  const { isAuthenticated, role } = useAuth();
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'taking_exam', 'view_scorecard'
  const [currentExamId, setCurrentExamId] = useState(null);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Active Test-Taking View (Fullscreen exam experience)
  if (activeView === 'taking_exam' && currentExamId) {
    return (
      <div className="main-content">
        <ExamScreen
          examId={currentExamId}
          onFinishExam={() => {
            setActiveView('dashboard');
            setCurrentExamId(null);
          }}
          onExit={() => {
            setActiveView('dashboard');
            setCurrentExamId(null);
          }}
        />
      </div>
    );
  }

  // Scorecard View
  if (activeView === 'view_scorecard' && currentExamId) {
    return (
      <div className="app-container">
        <Navbar activeView={activeView} setActiveView={setActiveView} />
        <main className="main-content">
          <ScorecardView
            examId={currentExamId}
            onBack={() => {
              setActiveView('dashboard');
              setCurrentExamId(null);
            }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar activeView={activeView} setActiveView={setActiveView} />

      <main className="main-content">
        {role === 'Student' && (
          <StudentPortal
            onStartExam={(id) => {
              setCurrentExamId(id);
              setActiveView('taking_exam');
            }}
            onViewScorecard={(id) => {
              setCurrentExamId(id);
              setActiveView('view_scorecard');
            }}
          />
        )}

        {role === 'Instructor' && <InstructorPortal />}

        {role === 'Admin' && <AdminPortal />}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
