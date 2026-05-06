import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  'todo': 'var(--todo)',
  'in-progress': 'var(--inprog)',
  'done': 'var(--done)',
};
const PRIORITY_COLORS = {
  high: 'var(--high)',
  medium: 'var(--medium)',
  low: 'var(--low)',
};

function UserTasksPanel({ userId, userName, API, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/users/${userId}/tasks`);
        setTasks(res.data.tasks);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [userId, API]);

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const s = {
    panel: {
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px',
    },
    box: {
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: '14px', width: '100%', maxWidth: '680px',
      maxHeight: '85vh', display: 'flex', flexDirection: 'column',
    },
    header: {
      padding: '20px 24px', borderBottom: '1px solid var(--border)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    title: { fontSize: '17px', fontWeight: 700, color: 'var(--text)' },
    sub: { fontSize: '12px', color: 'var(--text2)', marginTop: '2px' },
    closeBtn: {
      background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px',
      color: 'var(--text2)', padding: '6px 12px', fontSize: '13px', cursor: 'pointer',
    },
    filters: {
      padding: '12px 24px', borderBottom: '1px solid var(--border)',
      display: 'flex', gap: '8px',
    },
    filterBtn: (active) => ({
      padding: '5px 12px', borderRadius: '6px', border: 'none', fontSize: '12px',
      background: active ? 'var(--accent)' : 'var(--bg)',
      color: active ? '#fff' : 'var(--text2)', cursor: 'pointer', fontWeight: 500,
    }),
    body: { flex: 1, overflowY: 'auto', padding: '16px 24px' },
    taskRow: {
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '12px 14px', borderRadius: '8px',
      background: 'var(--bg)', border: '1px solid var(--border)',
      marginBottom: '8px', transition: 'border-color 0.2s',
    },
    badge: (color) => ({
      fontSize: '10px', padding: '2px 7px', borderRadius: '4px',
      background: `${color}22`, color, fontWeight: 600, fontFamily: 'var(--font-mono)',
      flexShrink: 0,
    }),
    dot: (color) => ({
      width: '8px', height: '8px', borderRadius: '50%',
      background: color, flexShrink: 0,
    }),
  };

  return (
    <div style={s.panel} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.box}>
        <div style={s.header}>
          <div>
            <div style={s.title}>Tasks — {userName}</div>
            <div style={s.sub}>{tasks.length} total tasks</div>
          </div>
          <button style={s.closeBtn} onClick={onClose}>Close</button>
        </div>

        <div style={s.filters}>
          {['all', 'todo', 'in-progress', 'done'].map(f => (
            <button key={f} style={s.filterBtn(filter === f)} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && ` (${tasks.filter(t => t.status === f).length})`}
            </button>
          ))}
        </div>

        <div style={s.body}>
          {loading && <div style={{ textAlign: 'center', color: 'var(--text2)', padding: '32px' }}>Loading...</div>}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '40px', fontSize: '14px' }}>
              No tasks found
            </div>
          )}
          {!loading && filtered.map(task => {
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
            const isOverdue = dueDate && dueDate < new Date() && task.status !== 'done';
            return (
              <div key={task.id} style={s.taskRow}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={s.dot(STATUS_COLORS[task.status] || '#888')} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '3px' }}>
                    {task.title}
                  </div>
                  {task.description && (
                    <div style={{ fontSize: '12px', color: 'var(--text2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.description}
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '3px', fontFamily: 'var(--font-mono)' }}>
                    {task.createdByUser?.id === task.assignedToUser?.id
                      ? 'Self-created'
                      : `Assigned by: ${task.createdByUser?.name || 'Admin'}`}
                    {dueDate && (
                      <span style={{ color: isOverdue ? 'var(--accent2)' : 'var(--text3)', marginLeft: '8px' }}>
                        {isOverdue ? '⚠ Overdue' : `Due: ${dueDate.toLocaleDateString()}`}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <span style={s.badge(PRIORITY_COLORS[task.priority] || '#888')}>{task.priority}</span>
                  <span style={s.badge(STATUS_COLORS[task.status] || '#888')}>{task.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { API, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchUsers = useCallback(async () => {
    try {
      const res = await API.get('/users');
      setUsers(res.data.users);
    } catch {}
    setLoading(false);
  }, [API]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (id) => {
    if (id === currentUser.id) return showToast('Cannot delete yourself');
    if (!window.confirm('Delete this user and unassign their tasks?')) return;
    try {
      await API.delete(`/users/${id}`);
      showToast('User deleted');
      fetchUsers();
    } catch { showToast('Error deleting user'); }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await API.patch(`/users/${id}/role`, { role });
      showToast(`Role updated to ${role}`);
      fetchUsers();
    } catch { showToast('Error updating role'); }
  };

  const s = {
    page: { padding: '32px', maxWidth: '960px', margin: '0 auto' },
    header: { marginBottom: '28px' },
    h1: { fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' },
    sub: { fontSize: '13px', color: 'var(--text2)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
      padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text2)',
      fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
      borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)',
    },
    td: { padding: '14px 16px', fontSize: '14px', color: 'var(--text)', borderBottom: '1px solid rgba(42,42,58,0.5)' },
    badge: (role) => ({
      fontSize: '11px', padding: '3px 8px', borderRadius: '5px',
      background: role === 'admin' ? 'rgba(108,99,255,0.2)' : 'rgba(67,233,123,0.15)',
      color: role === 'admin' ? 'var(--accent)' : 'var(--accent3)',
      fontFamily: 'var(--font-mono)', fontWeight: 600,
    }),
    select: {
      padding: '5px 10px', background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: '6px', color: 'var(--text)', fontSize: '12px', cursor: 'pointer',
    },
    viewBtn: {
      padding: '5px 12px', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)',
      borderRadius: '6px', color: 'var(--accent)', fontSize: '12px', cursor: 'pointer', marginRight: '6px',
    },
    deleteBtn: {
      padding: '5px 12px', background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.3)',
      borderRadius: '6px', color: 'var(--accent2)', fontSize: '12px', cursor: 'pointer',
    },
    you: {
      fontSize: '11px', padding: '2px 6px', borderRadius: '4px',
      background: 'rgba(247,183,49,0.15)', color: '#f7b731', marginLeft: '6px',
      fontFamily: 'var(--font-mono)',
    },
    taskCount: {
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      fontSize: '13px', color: 'var(--text2)',
    },
    toast: {
      position: 'fixed', bottom: '24px', right: '24px',
      background: 'var(--bg2)', border: '1px solid var(--accent)',
      borderRadius: '8px', padding: '12px 20px', color: 'var(--text)',
      fontSize: '14px', zIndex: 9999, boxShadow: 'var(--shadow)',
    },
  };

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text2)' }}>Loading users...</div>
  );

  return (
    <div style={s.page}>
      {toast && <div style={s.toast}>✓ {toast}</div>}

      <div style={s.header}>
        <div style={s.h1}>Users</div>
        <div style={s.sub}>{users.length} registered user{users.length !== 1 ? 's' : ''} — click "View Tasks" to see any user's tasks</div>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Name</th>
              <th style={s.th}>Email</th>
              <th style={s.th}>Role</th>
              <th style={s.th}>Tasks</th>
              <th style={s.th}>Joined</th>
              <th style={s.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}
                style={{ transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={s.td}>
                  {u.name}
                  {u.id === currentUser.id && <span style={s.you}>you</span>}
                </td>
                <td style={s.td}>{u.email}</td>
                <td style={s.td}>
                  {u.id === currentUser.id ? (
                    <span style={s.badge(u.role)}>{u.role}</span>
                  ) : (
                    <select style={s.select} value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}>
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  )}
                </td>
                <td style={s.td}>
                  <span style={s.taskCount}>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 700 }}>{u.taskCount || 0}</span>
                    tasks
                  </span>
                </td>
                <td style={s.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={s.td}>
                  <button style={s.viewBtn} onClick={() => setSelectedUser(u)}>
                    View Tasks
                  </button>
                  {u.id !== currentUser.id && (
                    <button style={s.deleteBtn} onClick={() => handleDelete(u.id)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <UserTasksPanel
          userId={selectedUser.id}
          userName={selectedUser.name}
          API={API}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
