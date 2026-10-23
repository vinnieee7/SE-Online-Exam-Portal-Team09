import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, GraduationCap, ShieldCheck, UserCheck } from 'lucide-react';

const Navbar = ({ activeView, setActiveView }) => {
  const { user, role, logout } = useAuth();

  const getRoleBadge = () => {
    switch (role) {
      case 'Student':
        return <span className="badge badge-student"><GraduationCap size={13} /> Student</span>;
      case 'Instructor':
        return <span className="badge badge-instructor"><UserCheck size={13} /> Instructor</span>;
      case 'Admin':
        return <span className="badge badge-admin"><ShieldCheck size={13} /> Administrator</span>;
      default:
        return null;
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="#" onClick={() => setActiveView('dashboard')} className="brand">
          <div className="brand-badge">OEP</div>
          <span>Online Exam Portal</span>
        </a>

        {user && (
          <div className="nav-user">
            {getRoleBadge()}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
            </div>

            <button onClick={logout} className="btn btn-outline btn-sm" title="Sign out">
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
