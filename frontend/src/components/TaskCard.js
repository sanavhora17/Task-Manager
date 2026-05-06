import React from 'react';
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

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isOwner = task.createdBy?.toString() === user?.id || task.createdByUser?.id === user?.id;
  const isAssigned = task.assignedTo?.toString() === user?.id || task.assignedToUser?.id === user?.id;

  // Can edit/delete if admin, owner, or assigned user
  const canModify = isAdmin || isOwner || isAssigned;

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && task.status !== 'done';

  const s = {
    card: {
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      padding: '18px 20px',
      transition: 'border-color 0.2s, transform 0.1s',
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' },
    title: { fontSize: '15px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 },
    desc: { fontSize: '13px', color: 'var(--text2)', marginBottom: '14px', lineHeight: 1.5 },
    meta: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px', alignItems: 'center' },
    badge: (color) => ({
      fontSize: '11px', padding: '3px 8px', borderRadius: '5px',
      background: `${color}22`, color: color,
      fontWeight: 600, fontFamily: 'var(--font-mono)',
    }),
    actions: { display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' },
    select: {
      padding: '5px 10px', background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: '6px', color: 'var(--text)', fontSize: '12px', cursor: 'pointer',
    },
    btnGroup: { display: 'flex', gap: '6px' },
    btn: (color) => ({
      padding: '5px 12px', border: `1px solid ${color}44`, borderRadius: '6px',
      background: `${color}11`, color: color, fontSize: '12px', cursor: 'pointer',
      fontWeight: 500, transition: 'all 0.15s',
    }),
    createdBy: { fontSize: '11px', color: 'var(--text3)', marginTop: '4px', fontFamily: 'var(--font-mono)' },
  };

  return (
    <div
      style={s.card}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={s.header}>
        <div style={s.title}>{task.title}</div>
      </div>

      {task.description && <div style={s.desc}>{task.description}</div>}

      <div style={s.meta}>
        <span style={s.badge(STATUS_COLORS[task.status] || '#888')}>{task.status}</span>
        <span style={s.badge(PRIORITY_COLORS[task.priority] || '#888')}>{task.priority}</span>
        {task.assignedToUser && (
          <span style={{ fontSize: '12px', color: 'var(--text2)' }}>👤 {task.assignedToUser.name}</span>
        )}
        {dueDate && (
          <span style={{ fontSize: '11px', color: isOverdue ? 'var(--accent2)' : 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
            {isOverdue ? '⚠ ' : '📅 '}{dueDate.toLocaleDateString()}
          </span>
        )}
      </div>

      {isAdmin && task.createdByUser && (
        <div style={s.createdBy}>Created by: {task.createdByUser.name}</div>
      )}

      <div style={s.actions}>
        {canModify ? (
          <select
            style={s.select}
            value={task.status}
            onChange={e => onStatusChange(task.id, e.target.value)}
          >
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        ) : (
          <span style={s.badge(STATUS_COLORS[task.status] || '#888')}>{task.status}</span>
        )}

        {canModify && (
          <div style={s.btnGroup}>
            <button style={s.btn('var(--accent)')} onClick={() => onEdit(task)}>Edit</button>
            <button style={s.btn('var(--accent2)')} onClick={() => onDelete(task.id)}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}
