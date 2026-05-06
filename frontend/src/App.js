import React, { useState } from 'react';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import UsersPage from './pages/UsersPage';
import Navbar from './components/Navbar';

function AppInner() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [authPage, setAuthPage] = useState('login');

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '14px',
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    if (authPage === 'register') {
      return <RegisterPage onNavigateToLogin={() => setAuthPage('login')} />;
    }
    return <LoginPage onNavigateToRegister={() => setAuthPage('register')} />;
  }

  return (
    <TaskProvider>
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Navbar page={page} setPage={setPage} />
        <main>
          {page === 'dashboard' && <DashboardPage onNavigateToTasks={() => setPage('tasks')} />}
          {page === 'tasks' && <TasksPage />}
          {page === 'users' && user.role === 'admin' && <UsersPage />}
          {page === 'users' && user.role !== 'admin' && (
            <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text2)' }}>
              Access denied
            </div>
          )}
        </main>
      </div>
    </TaskProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
