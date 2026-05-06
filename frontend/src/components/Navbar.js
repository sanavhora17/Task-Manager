import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ page, setPage }) {
  const { user, logout } = useAuth();

  const s = {
    nav: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      height: '60px',
      background: 'var(--bg2)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    },
    logo: {
      fontFamily: 'var(--font-mono)',
      fontSize: '16px',
      color: 'var(--accent)',
      fontWeight: 700,
    },
    tabs: { display: 'flex', gap: '4px' },
    tab: (active) => ({
      padding: '6px 16px',
      borderRadius: '6px',
      border: 'none',
      background: active ? 'rgba(108,99,255,0.2)' : 'transparent',
      color: active ? 'var(--accent)' : 'var(--text2)',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.15s',
    }),
    right: { display: 'flex', alignItems: 'center', gap: '16px' },
    userInfo: { textAlign: 'right' },
    name: { fontSize: '13px', fontWeight: 600, color: 'var(--text)' },
    role: (role) => ({
      fontSize: '11px',
      padding: '1px 6px',
      borderRadius: '4px',
      background: role === 'admin' ? 'rgba(108,99,255,0.2)' : 'rgba(67,233,123,0.15)',
      color: role === 'admin' ? 'var(--accent)' : 'var(--accent3)',
      fontFamily: 'var(--font-mono)',
    }),
    logoutBtn: {
      padding: '6px 14px',
      background: 'transparent',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      color: 'var(--text2)',
      fontSize: '13px',
      cursor: 'pointer',
      transition: 'all 0.15s',
    },
  };

  return (
    <nav style={s.nav}>
      <div style={s.logo}>▲ TaskFlow</div>

      <div style={s.tabs}>
        <button style={s.tab(page === 'dashboard')} onClick={() => setPage('dashboard')}>Dashboard</button>
        <button style={s.tab(page === 'tasks')} onClick={() => setPage('tasks')}>Tasks</button>
        {user?.role === 'admin' && (
          <button style={s.tab(page === 'users')} onClick={() => setPage('users')}>Users</button>
        )}
      </div>

      <div style={s.right}>
        <div style={s.userInfo}>
          <div style={s.name}>{user?.name}</div>
          <div><span style={s.role(user?.role)}>{user?.role}</span></div>
        </div>
        <button
          style={s.logoutBtn}
          onClick={logout}
          onMouseEnter={e => { e.target.style.borderColor = 'var(--accent2)'; e.target.style.color = 'var(--accent2)'; }}
          onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text2)'; }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
