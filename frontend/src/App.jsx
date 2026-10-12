import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import RaiseComplaint from './pages/RaiseComplaint';
import TrackComplaints from './pages/TrackComplaints';
import StaffQueue from './pages/StaffQueue';
import AdminDashboard from './pages/AdminDashboard';

function HomeRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = (user.role || '').toLowerCase();
  if (role === 'student') return <Navigate to="/student" replace />;
  if (role === 'staff') return <Navigate to="/staff" replace />;
  if (role === 'warden' || role === 'admin') return <Navigate to="/admin" replace />;

  return <Navigate to="/student" replace />;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public / Auth routes */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/raise"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <RaiseComplaint />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/track"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <TrackComplaints />
              </ProtectedRoute>
            }
          />

          {/* Staff routes */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffQueue />
              </ProtectedRoute>
            }
          />

          {/* Warden / Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['warden', 'admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        FixMyHostel &bull; Smart Hostel Maintenance System &bull; Mayank Heda (Warden) &bull; Ishita Gurbaxani (Student) &bull; Bhavisha Kewalramani (Staff)
      </footer>
    </div>
  );
}
