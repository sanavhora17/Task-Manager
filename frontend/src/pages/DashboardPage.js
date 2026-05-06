import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';

const PRIORITY_COLORS = { high: 'var(--high)', medium: 'var(--medium)', low: 'var(--low)' };
const STATUS_COLORS = { 'todo': 'var(--todo)', 'in-progress': 'var(--inprog)', 'done': 'var(--done)' };

function StatCard({ label, value, color, icon, sub }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: '14px', padding: '24px', flex: 1, minWidth: '130px',
      position: 'relative', overflow: 'hidden', transition: 'transform 0.2s, border-color 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = color; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color, borderRadius: '14px 14px 0 0' }} />
      <div style={{ fontSize: '24px', marginBottom: '6px' }}>{icon}</div>
      <div style={{ fontSize: '30px', fontWeight: 800, color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

function RecentTaskRow({ task }) {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && task.status !== 'done';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '12px 14px', borderRadius: '10px',
      background: 'var(--bg)', border: '1px solid var(--border)',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: STATUS_COLORS[task.status] || '#888', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {task.title}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>
          {task.assignedToUser ? `👤 ${task.assignedToUser.name}` : ''}
          {task.createdByUser && ` · by ${task.createdByUser.name}`}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
        <span style={{
          fontSize: '10px', padding: '2px 7px', borderRadius: '4px', fontWeight: 600,
          background: `${PRIORITY_COLORS[task.priority] || '#888'}22`,
          color: PRIORITY_COLORS[task.priority] || '#888', fontFamily: 'var(--font-mono)',
        }}>{task.priority}</span>
        {dueDate && (
          <span style={{ fontSize: '11px', color: isOverdue ? 'var(--accent2)' : 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
            {isOverdue ? '⚠ ' : ''}{dueDate.toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

function ProgressBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{label}</span>
        <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color }}>
          {value} <span style={{ color: 'var(--text3)' }}>/ {max}</span>
        </span>
      </div>
      <div style={{ height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

export default function DashboardPage({ onNavigateToTasks }) {
  const { user } = useAuth();
  const { tasks, stats, users, fetchTasks, fetchUsers, loading } = useTask();

  useEffect(() => { fetchTasks(); fetchUsers(); }, [fetchTasks, fetchUsers]);

  const isAdmin = user?.role === 'admin';
  const recentTasks = [...tasks].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 6);
  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  const s = {
    page: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
    h1: { fontSize: '26px', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' },
    sub: { fontSize: '14px', color: 'var(--text2)', marginBottom: '28px' },
    statsRow: { display: 'flex', gap: '14px', marginBottom: '28px', flexWrap: 'wrap' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    section: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px' },
    sectionTitle: {
      fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px',
      textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-mono)',
    },
    viewAllBtn: {
      width: '100%', marginTop: '14px', padding: '9px',
      background: 'transparent', border: '1px solid var(--border)',
      borderRadius: '8px', color: 'var(--accent)', fontSize: '13px',
      fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
    },
    userRow: {
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 0', borderBottom: '1px solid var(--border)',
    },
    avatar: (name) => ({
      width: '34px', height: '34px', borderRadius: '50%',
      background: `hsl(${(name.charCodeAt(0) * 37) % 360}, 55%, 35%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0,
    }),
  };

  if (loading) return (
    <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text2)' }}>Loading dashboard...</div>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  return (
    <div style={s.page}>
      <div style={s.h1}>Good {greeting}, {user?.name?.split(' ')[0]} 👋</div>
      <div style={s.sub}>
        {isAdmin
          ? `Managing ${stats.total} tasks across ${users.length} team member${users.length !== 1 ? 's' : ''}`
          : `You have ${stats.inProgress} in progress and ${stats.todo} pending`}
      </div>

      <div style={s.statsRow}>
        <StatCard label="Total Tasks" value={stats.total} color="var(--accent)" icon="📋" />
        <StatCard label="In Progress" value={stats.inProgress} color="var(--inprog)" icon="⚡" sub={`${completionRate}% done`} />
        <StatCard label="Completed" value={stats.done} color="var(--done)" icon="✅" />
        <StatCard label="Overdue" value={stats.overdue} color="var(--accent2)" icon="⚠️" sub={stats.overdue > 0 ? 'Needs attention' : 'All on track'} />
        {isAdmin && <StatCard label="Team" value={users.length} color="var(--text)" icon="👥" />}
      </div>

      <div style={s.grid}>
        <div style={s.section}>
          <div style={s.sectionTitle}>Recent Activity</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentTasks.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: '13px', padding: '24px 0' }}>
                No tasks yet — create your first one!
              </div>
            ) : recentTasks.map(task => <RecentTaskRow key={task.id} task={task} />)}
          </div>
          <button
            style={s.viewAllBtn}
            onClick={onNavigateToTasks}
            onMouseEnter={e => { e.target.style.background = 'rgba(108,99,255,0.1)'; e.target.style.borderColor = 'var(--accent)'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'var(--border)'; }}
          >
            View all tasks →
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={s.section}>
            <div style={s.sectionTitle}>Task Progress</div>
            <ProgressBar label="Todo" value={stats.todo} max={stats.total} color="var(--todo)" />
            <ProgressBar label="In Progress" value={stats.inProgress} max={stats.total} color="var(--inprog)" />
            <ProgressBar label="Completed" value={stats.done} max={stats.total} color="var(--done)" />
            <ProgressBar label="High Priority" value={stats.highPriority} max={stats.total} color="var(--high)" />
          </div>

          {isAdmin && users.length > 0 ? (
            <div style={s.section}>
              <div style={s.sectionTitle}>Team Members</div>
              {users.slice(0, 5).map(u => (
                <div key={u.id} style={s.userRow}>
                  <div style={s.avatar(u.name)}>{u.name[0].toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{u.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{u.email}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                    <span style={{
                      fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                      background: u.role === 'admin' ? 'rgba(108,99,255,0.2)' : 'rgba(67,233,123,0.15)',
                      color: u.role === 'admin' ? 'var(--accent)' : 'var(--accent3)',
                      fontFamily: 'var(--font-mono)',
                    }}>{u.role}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                      {u.taskCount ?? 0} tasks
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : !isAdmin && (
            <div style={s.section}>
              <div style={s.sectionTitle}>My Summary</div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {[
                  { label: 'My Tasks', value: tasks.length },
                  { label: 'Done', value: stats.done },
                  { label: 'Pending', value: stats.todo + stats.inProgress },
                ].map(item => (
                  <div key={item.label} style={{
                    flex: 1, background: 'var(--bg)', borderRadius: '8px',
                    padding: '12px', textAlign: 'center', border: '1px solid var(--border)',
                  }}>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{item.value}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
