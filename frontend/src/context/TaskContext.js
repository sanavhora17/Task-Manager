import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useAuth } from './AuthContext';

const TaskContext = createContext();
export const useTask = () => useContext(TaskContext);

const ACTIONS = {
  SET_TASKS: 'SET_TASKS',
  SET_USERS: 'SET_USERS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  SET_FILTER_STATUS: 'SET_FILTER_STATUS',
  SET_FILTER_PRIORITY: 'SET_FILTER_PRIORITY',
  SET_SEARCH: 'SET_SEARCH',
};

const initialState = {
  tasks: [],
  users: [],
  loading: false,
  error: null,
  filterStatus: 'all',
  filterPriority: 'all',
  search: '',
};

function taskReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_TASKS: return { ...state, tasks: action.payload };
    case ACTIONS.SET_USERS: return { ...state, users: action.payload };
    case ACTIONS.SET_LOADING: return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR: return { ...state, error: action.payload };
    case ACTIONS.ADD_TASK: return { ...state, tasks: [action.payload, ...state.tasks] };
    case ACTIONS.UPDATE_TASK:
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t) };
    case ACTIONS.DELETE_TASK:
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case ACTIONS.SET_FILTER_STATUS: return { ...state, filterStatus: action.payload };
    case ACTIONS.SET_FILTER_PRIORITY: return { ...state, filterPriority: action.payload };
    case ACTIONS.SET_SEARCH: return { ...state, search: action.payload };
    default: return state;
  }
}

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { API, user } = useAuth();

  const fetchTasks = useCallback(async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: ACTIONS.SET_ERROR, payload: null });
    try {
      const res = await API.get('/tasks');
      dispatch({ type: ACTIONS.SET_TASKS, payload: res.data.tasks });
    } catch (err) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to load tasks' });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [API]);

  const fetchUsers = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    try {
      const res = await API.get('/users');
      dispatch({ type: ACTIONS.SET_USERS, payload: res.data.users });
    } catch {}
  }, [API, user]);

  const createTask = async (form) => {
    const res = await API.post('/tasks', form);
    dispatch({ type: ACTIONS.ADD_TASK, payload: res.data.task });
    return res.data.task;
  };

  const updateTask = async (id, form) => {
    const res = await API.put(`/tasks/${id}`, form);
    dispatch({ type: ACTIONS.UPDATE_TASK, payload: res.data.task });
    return res.data.task;
  };

  const deleteTask = async (id) => {
    await API.delete(`/tasks/${id}`);
    dispatch({ type: ACTIONS.DELETE_TASK, payload: id });
  };

  const updateTaskStatus = async (id, status) => {
    const res = await API.put(`/tasks/${id}`, { status });
    dispatch({ type: ACTIONS.UPDATE_TASK, payload: res.data.task });
  };

  const setFilterStatus = (v) => dispatch({ type: ACTIONS.SET_FILTER_STATUS, payload: v });
  const setFilterPriority = (v) => dispatch({ type: ACTIONS.SET_FILTER_PRIORITY, payload: v });
  const setSearch = (v) => dispatch({ type: ACTIONS.SET_SEARCH, payload: v });

  const filteredTasks = state.tasks.filter(t => {
    if (state.filterStatus !== 'all' && t.status !== state.filterStatus) return false;
    if (state.filterPriority !== 'all' && t.priority !== state.filterPriority) return false;
    if (state.search && !t.title.toLowerCase().includes(state.search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: state.tasks.length,
    todo: state.tasks.filter(t => t.status === 'todo').length,
    inProgress: state.tasks.filter(t => t.status === 'in-progress').length,
    done: state.tasks.filter(t => t.status === 'done').length,
    highPriority: state.tasks.filter(t => t.priority === 'high').length,
    overdue: state.tasks.filter(t => {
      if (!t.dueDate || t.status === 'done') return false;
      return new Date(t.dueDate) < new Date();
    }).length,
  };

  return (
    <TaskContext.Provider value={{
      ...state,
      filteredTasks,
      stats,
      fetchTasks,
      fetchUsers,
      createTask,
      updateTask,
      deleteTask,
      updateTaskStatus,
      setFilterStatus,
      setFilterPriority,
      setSearch,
    }}>
      {children}
    </TaskContext.Provider>
  );
};
