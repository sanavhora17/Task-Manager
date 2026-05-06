import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

const STATUSES = ['todo', 'in-progress', 'done'];
const STATUS_LABELS = { 'todo': 'Todo', 'in-progress': 'In Progress', 'done': 'Done' };

export default function TasksPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const {
    tasks, filteredTasks, users, loading,
    fetchTasks, fetchUsers,
    createTask, updateTask, deleteTask, updateTaskStatus,
    filterStatus, filterPriority, search,
    setFilterStatus, setFilterPriority, setSearch,
  } = useTask();

  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [fetchTasks, fetchUsers]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSave = async (form) => {
    try {
      if (editTask?.id) {
        await updateTask(editTask.id, form);
        showToast('Task updated successfully');
      } else {
        await createTask(form);
        showToast('Task created successfully');
      }
      setShowModal(false);
      setEditTask(null);
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      showToast('Task deleted');
    } catch (err) {
      showToast('Error deleting task');
    }
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setShowModal(true);
  };

  const grouped = STATUSES.reduce((acc, s) => {
    acc[s] = filteredTasks.filter(t => t.status === s);
    return acc;
  }, {});

  const s = {
    page: { padding: '32px', maxWidth: '1280px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
    h1: { fontSize: '24px', fontWeight: 700, color: 'var(--text)' },
    sub: { fontSize: '13px', color: 'var(--text2)', marginTop: '2px' },
    addBtn: {
      padding: '10px 20px', background: 'var(--accent)', border: 'none',
      borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: 600,
      cursor: 'pointer', transition: 'opacity 0.2s',
    },
    filters: { display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' },
    searchInput: {
      flex: 1, minWidth: '200px', padding: '9px 14px',
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: '8px', color: 'var(--text)', fontSize: '14px', outline: 'none',
    },
    select: {
      padding: '9px 12px', background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: '8px', color: 'var(--text)', fontSize: '14px', outline: 'none',
    },
    board: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
    col: { background: 'var(--bg2)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)' },
    colHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
    colTitle: (status) => ({
      fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
      color: status === 'todo' ? 'var(--todo)' : status === 'in-progress' ? 'var(--inprog)' : 'var(--done)',
      fontFamily: 'var(--font-mono)',
    }),
    count: { fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' },
    empty: { fontSize: '13px', color: 'var(--text3)', textAlign: 'center', padding: '24px 0' },
    cards: { display: 'flex', flexDirection: 'column', gap: '10px' },
    statsRow: { display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' },
    stat: {
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: '10px', padding: '12px 18px', flex: 1, minWidth: '80px', textAlign: 'center',
    },
    statNum: { fontSize: '22px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' },
    statLabel: { fontSize: '11px', color: 'var(--text2)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    toast: {
      position: 'fixed', bottom: '24px', right: '24px',
      background: 'var(--bg2)', border: '1px solid var(--accent)',
      borderRadius: '8px', padding: '12px 20px', color: 'var(--text)',
      fontSize: '14px', zIndex: 9999, boxShadow: 'var(--shadow)',
      transition: 'opacity 0.3s',
    },
  };

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text2)' }}>Loading tasks...</div>
  );

  return (
    <div style={s.page}>
      {toast && <div style={s.toast}>✓ {toast}</div>}

      <div style={s.header}>
        <div>
          <div style={s.h1}>Tasks</div>
          <div style={s.sub}>
            {isAdmin ? `Managing all ${tasks.length} tasks` : `You have ${tasks.length} task${tasks.length !== 1 ? 's' : ''}`}
          </div>
        </div>
        {/* Both admin and user can create tasks */}
        <button
          style={s.addBtn}
          onClick={() => { setEditTask({}); setShowModal(true); }}
          onMouseEnter={e => e.target.style.opacity = '0.85'}
          onMouseLeave={e => e.target.style.opacity = '1'}
        >
          + New Task
        </button>
      </div>

      <div style={s.statsRow}>
        {STATUSES.map(st => (
          <div key={st} style={s.stat}>
            <div style={s.statNum}>{tasks.filter(t => t.status === st).length}</div>
            <div style={s.statLabel}>{STATUS_LABELS[st]}</div>
          </div>
        ))}
        <div style={s.stat}>
          <div style={s.statNum}>{tasks.length}</div>
          <div style={s.statLabel}>Total</div>
        </div>
      </div>

      <div style={s.filters}>
        <input
          style={s.searchInput} placeholder="🔍 Search tasks..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <select style={s.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select style={s.select} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div style={s.board}>
        {STATUSES.map(status => (
          <div key={status} style={s.col}>
            <div style={s.colHeader}>
              <span style={s.colTitle(status)}>{STATUS_LABELS[status]}</span>
              <span style={s.count}>{grouped[status].length}</span>
            </div>
            <div style={s.cards}>
              {grouped[status].length === 0 && <div style={s.empty}>No tasks</div>}
              {grouped[status].map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={updateTaskStatus}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <TaskModal
          task={editTask}
          users={users}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditTask(null); }}
        />
      )}
    </div>
  );
}
