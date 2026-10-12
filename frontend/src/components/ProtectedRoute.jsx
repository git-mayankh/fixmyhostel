import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Normalize role matching (supports 'student', 'staff', 'warden', 'admin')
  const userRole = (user.role || '').toLowerCase();
  const normalizedAllowed = allowedRoles?.map((r) => r.toLowerCase());

  if (normalizedAllowed && normalizedAllowed.length > 0) {
    const isAllowed =
      normalizedAllowed.includes(userRole) ||
      (userRole === 'admin' && normalizedAllowed.includes('warden')) ||
      (userRole === 'warden' && normalizedAllowed.includes('admin'));

    if (!isAllowed) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">403 - Access Denied</h1>
            <p className="text-slate-600 text-sm mb-6">
              You do not have the required permissions to access this page. Your role is <span className="font-semibold uppercase text-slate-700">{user.role}</span>.
            </p>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return children;
}
