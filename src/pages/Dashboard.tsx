// ============================================================
// src/pages/Dashboard.tsx — Role-Based Redirector
// ============================================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'STUDENT') {
    return <Navigate to="/student-dashboard" replace />;
  } else if (user.role === 'OWNER') {
    return <Navigate to="/owner-dashboard" replace />;
  } else if (user.role === 'ADMIN') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}
