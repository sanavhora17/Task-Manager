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
        onFocus={e => e.target.style.borderColor = 'var(--accent3)'}
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

export default function RegisterPage({ onNavigateToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Full name is required');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: {
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)',
      padding: '20px', position: 'relative', overflow: 'hidden',
    },
    glow1: {
      position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(67,233,123,0.1) 0%, transparent 70%)',
      top: '-80px', right: '-150px', pointerEvents: 'none',
    },
    glow2: {
      position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)',
      bottom: '-80px', left: '-100px', pointerEvents: 'none',
    },
    card: {
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: '16px', padding: '48px', width: '100%',
      maxWidth: '440px', position: 'relative', zIndex: 1,
    },
    logo: { fontFamily: 'var(--font-mono)', fontSize: '18px', color: 'var(--accent)', marginBottom: '6px', letterSpacing: '-0.5px' },
    tagline: { color: 'var(--text2)', fontSize: '13px', marginBottom: '28px' },
    badge: {
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 10px', borderRadius: '20px',
      background: 'rgba(67,233,123,0.12)', color: 'var(--accent3)',
      fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-mono)', marginBottom: '16px',
    },
    heading: { fontSize: '22px', fontWeight: 800, color: 'var(--text)', marginBottom: '24px' },
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
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
    btn: {
      width: '100%', padding: '13px', background: 'var(--accent3)', border: 'none',
      borderRadius: 'var(--radius)', color: '#0a0a0f', fontSize: '15px',
      fontWeight: 700, marginTop: '6px', cursor: 'pointer', transition: 'opacity 0.2s',
    },
    error: {
      background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.3)',
      borderRadius: 'var(--radius)', padding: '10px 14px',
      color: 'var(--accent2)', fontSize: '13px', marginBottom: '16px',
    },
    link: { marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text2)' },
    linkSpan: { color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, marginLeft: '4px' },
  };

  return (
    <div style={s.page}>
      <div style={s.glow1} />
      <div style={s.glow2} />
      <div style={s.card}>
        <div style={s.logo}>▲ TaskFlow</div>
        <div style={s.tagline}>Task management for everyone</div>
        <div style={s.badge}>✦ New Account</div>
        <div style={s.heading}>Create your account</div>

        <form onSubmit={handleSubmit}>
          {error && <div style={s.error}>{error}</div>}

          <label style={s.label}>Full Name</label>
          <input
            style={s.input} type="text" placeholder="Jane Smith"
            value={name} onChange={e => setName(e.target.value)} required
            onFocus={e => e.target.style.borderColor = 'var(--accent3)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />

          <label style={s.label}>Email Address</label>
          <input
            style={s.input} type="email" placeholder="jane@example.com"
            value={email} onChange={e => setEmail(e.target.value)} required
            onFocus={e => e.target.style.borderColor = 'var(--accent3)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />

          <div style={s.row}>
            <div>
              <label style={s.label}>Password</label>
              <PasswordInput
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 chars"
              />
            </div>
            <div>
              <label style={s.label}>Confirm</label>
              <PasswordInput
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat"
              />
            </div>
          </div>

          <button
            style={s.btn} type="submit" disabled={loading}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <div style={s.link}>
          Already have an account?
          <span style={s.linkSpan} onClick={onNavigateToLogin}>Sign in</span>
        </div>
      </div>
    </div>
  );
}
