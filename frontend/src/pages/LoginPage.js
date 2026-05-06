import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative', marginBottom: '16px' }}>
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder || '••••••••'}
        value={value}
        onChange={onChange}
        required
        style={{
          width: '100%', padding: '12px 44px 12px 14px',
          background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', color: 'var(--text)',
          fontSize: '14px', outline: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{
          position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text2)', padding: '2px', display: 'flex', alignItems: 'center',
        }}
      >
        <EyeIcon open={show} />
      </button>
    </div>
  );
}

export default function LoginPage({ onNavigateToRegister }) {
  const [mode, setMode] = useState('user'); // 'admin' | 'user'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (mode === 'admin' && data.user.role !== 'admin') {
        localStorage.removeItem('token');
        setError('Access denied. This login is for admins only.');
        return;
      }
      if (mode === 'user' && data.user.role === 'admin') {
        localStorage.removeItem('token');
        setError('Please use Admin Sign In instead.');
        return;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setEmail('');
    setPassword('');
    setError('');
  };

  const isAdmin = mode === 'admin';
  const accentColor = isAdmin ? 'var(--accent2)' : 'var(--accent)';

  const s = {
    page: {
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)',
      padding: '20px', position: 'relative', overflow: 'hidden',
    },
    glow1: {
      position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
      background: isAdmin
        ? 'radial-gradient(circle, rgba(255,101,132,0.12) 0%, transparent 70%)'
        : 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)',
      top: '-100px', left: '-200px', pointerEvents: 'none', transition: 'background 0.4s',
    },
    glow2: {
      position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
      background: isAdmin
        ? 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)'
        : 'radial-gradient(circle, rgba(67,233,123,0.08) 0%, transparent 70%)',
      bottom: '-50px', right: '-100px', pointerEvents: 'none', transition: 'background 0.4s',
    },
    wrapper: {
      display: 'flex', width: '100%', maxWidth: '800px',
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: '20px', overflow: 'hidden', position: 'relative', zIndex: 1,
      boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
    },
    // LEFT SIDEBAR — toggle
    sidebar: {
      width: '220px', flexShrink: 0,
      background: 'var(--bg)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      padding: '40px 16px', gap: '10px',
    },
    sidebarTitle: {
      fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--font-mono)',
      textTransform: 'uppercase', letterSpacing: '1px',
      marginBottom: '8px', paddingLeft: '12px',
    },
    sideBtn: (active, color) => ({
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '14px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
      background: active ? `${color}18` : 'transparent',
      borderLeft: active ? `3px solid ${color}` : '3px solid transparent',
      transition: 'all 0.2s', textAlign: 'left', width: '100%',
    }),
    sideBtnIcon: { fontSize: '20px' },
    sideBtnText: (active, color) => ({
      display: 'flex', flexDirection: 'column', gap: '2px',
    }),
    sideBtnLabel: (active, color) => ({
      fontSize: '14px', fontWeight: 600,
      color: active ? color : 'var(--text2)',
      transition: 'color 0.2s',
    }),
    sideBtnSub: {
      fontSize: '11px', color: 'var(--text3)',
    },
    // RIGHT FORM PANEL
    formPanel: {
      flex: 1, padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
    },
    logo: {
      fontFamily: 'var(--font-mono)', fontSize: '18px',
      color: 'var(--accent)', marginBottom: '32px', letterSpacing: '-0.5px',
    },
    heading: { fontSize: '22px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' },
    sub: { fontSize: '13px', color: 'var(--text2)', marginBottom: '28px' },
    label: {
      display: 'block', fontSize: '11px', color: 'var(--text2)',
      marginBottom: '6px', fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.5px',
    },
    input: {
      width: '100%', padding: '12px 14px', background: 'var(--bg)',
      border: '1px solid var(--border)', borderRadius: 'var(--radius)',
      color: 'var(--text)', fontSize: '14px', outline: 'none',
      marginBottom: '16px', boxSizing: 'border-box', transition: 'border-color 0.2s',
    },
    btn: (color) => ({
      width: '100%', padding: '13px', background: color, border: 'none',
      borderRadius: 'var(--radius)', color: '#fff', fontSize: '15px',
      fontWeight: 700, marginTop: '6px', cursor: 'pointer', transition: 'opacity 0.2s',
    }),
    error: {
      background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.3)',
      borderRadius: 'var(--radius)', padding: '10px 14px',
      color: 'var(--accent2)', fontSize: '13px', marginBottom: '16px',
    },
    divider: {
      height: '1px', background: 'var(--border)', margin: '20px 0',
    },
    registerLink: {
      textAlign: 'center', fontSize: '13px', color: 'var(--text2)',
    },
    linkSpan: (color) => ({
      color, cursor: 'pointer', fontWeight: 600, marginLeft: '4px',
    }),
    adminBadge: {
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 10px', borderRadius: '20px',
      background: 'rgba(255,101,132,0.12)', color: 'var(--accent2)',
      fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-mono)',
      marginBottom: '20px',
    },
  };

  return (
    <div style={s.page}>
      <div style={s.glow1} />
      <div style={s.glow2} />

      <div style={s.wrapper}>
        {/* LEFT SIDEBAR */}
        <div style={s.sidebar}>
          <div style={s.sidebarTitle}>Login as</div>

          {/* Admin button */}
          <button style={s.sideBtn(isAdmin, 'var(--accent2)')} onClick={() => switchMode('admin')}>
            <span style={s.sideBtnIcon}>🛡️</span>
            <div style={s.sideBtnText(isAdmin, 'var(--accent2)')}>
              <span style={s.sideBtnLabel(isAdmin, 'var(--accent2)')}>Admin</span>
              <span style={s.sideBtnSub}>Sign in only</span>
            </div>
          </button>

          {/* User button */}
          <button style={s.sideBtn(!isAdmin, 'var(--accent)')} onClick={() => switchMode('user')}>
            <span style={s.sideBtnIcon}>👤</span>
            <div style={s.sideBtnText(!isAdmin, 'var(--accent)')}>
              <span style={s.sideBtnLabel(!isAdmin, 'var(--accent)')}>User</span>
              <span style={s.sideBtnSub}>Login or Register</span>
            </div>
          </button>
        </div>

        {/* RIGHT FORM PANEL */}
        <div style={s.formPanel}>
          <div style={s.logo}>▲ TaskFlow</div>

          {isAdmin && <div style={s.adminBadge}>🛡️ Admin Portal</div>}

          <div style={s.heading}>
            {isAdmin ? 'Admin Sign In' : 'Welcome back'}
          </div>
          <div style={s.sub}>
            {isAdmin
              ? 'Restricted access — admins only'
              : 'Sign in to manage your tasks'}
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div style={s.error}>{error}</div>}

            <label style={s.label}>Email</label>
            <input
              style={s.input}
              type="email"
              placeholder={isAdmin ? 'admin@taskflow.com' : 'you@example.com'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              onFocus={e => e.target.style.borderColor = accentColor}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />

            <label style={s.label}>Password</label>
            <PasswordInput
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <button
              style={s.btn(accentColor)}
              type="submit"
              disabled={loading}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {loading ? 'Signing in...' : isAdmin ? '🛡️ Admin Sign In' : 'Sign In →'}
            </button>
          </form>

          {!isAdmin && (
            <>
              <div style={s.divider} />
              <div style={s.registerLink}>
                Don't have an account?
                <span style={s.linkSpan('var(--accent)')} onClick={onNavigateToRegister}>
                  Register here
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
