import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, User, ShieldAlert, CheckCircle2 } from 'lucide-react';

const AuthPage = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password, role);
        setSuccess('Account created successfully! Logging you in...');
        setTimeout(() => {
          login(email, password);
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setError('');
  };

  return (
    <div style={{ maxWidth: '480px', margin: '3rem auto' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="brand-badge" style={{ display: 'inline-block', marginBottom: '0.75rem', fontSize: '0.9rem', padding: '0.35rem 0.8rem' }}>
            PES UNIVERSITY
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.025em' }}>
            {isLogin ? 'Welcome to Exam Portal' : 'Create Student / Faculty Account'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
            {isLogin ? 'Sign in to access your assessments & evaluation' : 'Register with your institutional credentials'}
          </p>
        </div>

        {/* Quick Demo Login Credentials Bar */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            ⚡ 1-Click Evaluation Credentials:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('student1@pesu.edu', 'Student')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('instructor1@pesu.edu', 'Instructor')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              👨‍🏫 Instructor
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@pesu.edu', 'Admin')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input id="auth-name"
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. A S Vincent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">PES University Email</label>
            <input id="auth-email"
              type="email"
              required
              className="form-control"
              placeholder="e.g. student1@pesu.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password</label>
            <input id="auth-password"
              type="password"
              required
              className="form-control"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-role">Select Role (RBAC - OEP-F-004)</label>
              <select id="auth-role"
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Student">Student (Candidate)</option>
                <option value="Instructor">Instructor / Faculty</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : isLogin ? 'Sign In to Portal' : 'Complete Registration'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
