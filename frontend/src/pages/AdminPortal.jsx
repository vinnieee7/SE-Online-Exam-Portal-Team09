import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldAlert, Users, Lock, Unlock, History, CheckCircle } from 'lucide-react';

const AdminPortal = () => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get('/audit-logs');
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to load logs', err);
    }
  };

  const handleToggleLock = async (user) => {
    try {
      const newStatus = user.is_locked ? 0 : 1;
      await api.patch(`/auth/users/${user.id}`, { is_locked: newStatus });
      fetchUsers();
      fetchLogs();
    } catch (err) {
      alert('Failed to update account status');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/auth/users/${userId}`, { role: newRole });
      fetchUsers();
      fetchLogs();
    } catch (err) {
      alert('Failed to update role');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>System Administration</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          User Role Governance (RBAC - OEP-F-004) & Security Audit Trail Monitoring (OEP-NF-004)
        </p>
      </div>

      <div className="tab-bar">
        <button
          onClick={() => setActiveTab('users')}
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
        >
          <Users size={16} style={{ display: 'inline', marginRight: '6px' }} />
          User Management ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
        >
          <History size={16} style={{ display: 'inline', marginRight: '6px' }} />
          Security Audit Trail
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="table-responsive card">
          <table className="table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Assigned Role</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>#{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      className="form-control"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="Student">Student</option>
                      <option value="Instructor">Instructor</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <span className={`badge ${u.is_locked ? 'badge-admin' : 'badge-student'}`}>
                      {u.is_locked ? 'Locked' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleLock(u)}
                      className={`btn btn-sm ${u.is_locked ? 'btn-primary' : 'btn-danger'}`}
                    >
                      {u.is_locked ? <Unlock size={14} /> : <Lock size={14} />}
                      <span>{u.is_locked ? 'Unlock Account' : 'Lock Account'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-responsive card">
          <table className="table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Timestamp</th>
                <th>Event Action</th>
                <th>Actor Email</th>
                <th>IP Address</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 600 }}>#{log.id}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td>
                    <span className="badge badge-student" style={{ fontSize: '0.7rem' }}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.user_email || 'Unauthenticated'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{log.ip_address}</td>
                  <td style={{ fontSize: '0.85rem' }}>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
