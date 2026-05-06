import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function TaskModal({ task, users, onSave, onClose }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
    status: 'todo',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        assignedTo: task.assignedTo || '',
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
        status: task.status || 'todo',
      });
    }
  }, [task]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    setError('');
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving task');
      setSaving(false);
    }
  };

  const s = {
    overlay: {
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px',
    },
    modal: {
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: '14px', padding: '32px', width: '100%', maxWidth: '500px',
      maxHeight: '90vh', overflowY: 'auto',
    },
    title: { fontSize: '18px', fontWeight: 700, marginBottom: '6px', color: 'var(--text)' },
    subtitle: { fontSize: '13px', color: 'var(--text2)', marginBottom: '24px' },
    label: {
      display: 'block', fontSize: '12px', color: 'var(--text2)',
      marginBottom: '6px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px',
    },
    input: {
      width: '100%', padding: '10px 12px', background: 'var(--bg)',
      border: '1px solid var(--border)', borderRadius: '7px',
      color: 'var(--text)', fontSize: '14px', outline: 'none', marginBottom: '16px',
      boxSizing: 'border-box',
    },
    textarea: {
      width: '100%', padding: '10px 12px', background: 'var(--bg)',
      border: '1px solid var(--border)', borderRadius: '7px',
      color: 'var(--text)', fontSize: '14px', outline: 'none', marginBottom: '16px',
      resize: 'vertical', minHeight: '80px', boxSizing: 'border-box',
    },
    select: {
      width: '100%', padding: '10px 12px', background: 'var(--bg)',
      border: '1px solid var(--border)', borderRadius: '7px',
      color: 'var(--text)', fontSize: '14px', outline: 'none', marginBottom: '16px',
    },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
    footer: { display: 'flex', gap: '10px', marginTop: '8px', justifyContent: 'flex-end' },
    cancelBtn: {
      padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)',
      borderRadius: '7px', color: 'var(--text2)', fontSize: '14px', cursor: 'pointer',
    },
    saveBtn: {
      padding: '10px 24px', background: 'var(--accent)', border: 'none',
      borderRadius: '7px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
      opacity: saving ? 0.7 : 1,
    },
    error: {
      background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.3)',
      borderRadius: '7px', padding: '10px 14px', color: 'var(--accent2)',
      fontSize: '13px', marginBottom: '16px',
    },
    infoBox: {
      background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)',
      borderRadius: '7px', padding: '10px 14px', fontSize: '12px',
      color: 'var(--text2)', marginBottom: '16px',
    },
  };

  const isEditing = !!task?.id;

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.title}>{isEditing ? 'Edit Task' : 'New Task'}</div>
        <div style={s.subtitle}>
          {isEditing ? 'Update task details below' : isAdmin ? 'Create and assign a task' : 'Add a new task to your list'}
        </div>

        {error && <div style={s.error}>{error}</div>}

        {!isAdmin && !isEditing && (
          <div style={s.infoBox}>
            ℹ️ Task will be added to your personal task list
          </div>
        )}

        <label style={s.label}>Title *</label>
        <input
          style={s.input} placeholder="Task title..."
          value={form.title} onChange={e => set('title', e.target.value)}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />

        <label style={s.label}>Description</label>
        <textarea
          style={s.textarea} placeholder="Details (optional)..."
          value={form.description} onChange={e => set('description', e.target.value)}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />

        <div style={s.row}>
          <div>
            <label style={s.label}>Priority</label>
            <select style={s.select} value={form.priority} onChange={e => set('priority', e.target.value)}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label style={s.label}>Status</label>
            <select style={s.select} value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        {/* Admin can assign to any user; regular user cannot reassign */}
        {isAdmin && (
          <>
            <label style={s.label}>Assign To</label>
            <select style={s.select} value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)}>
              <option value="">— Unassigned —</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </>
        )}

        <label style={s.label}>Due Date</label>
        <input
          style={s.input} type="date"
          value={form.dueDate} onChange={e => set('dueDate', e.target.value)}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />

        <div style={s.footer}>
          <button style={s.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
