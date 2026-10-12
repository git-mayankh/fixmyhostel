import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import ComplaintCard from '../components/ComplaintCard';
import { calculateStats } from '../utils/helpers';
import api from '../utils/api';
import {
  FileText,
  Clock,
  CheckCircle2,
  Timer,
  PlusCircle,
  ArrowRight,
  Inbox,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints/my');
      const data = res.data.complaints || res.data || [];
      setComplaints(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch student complaints:', err);
      setError('Could not load complaints. Please refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this complaint?')) return;
    try {
      await api.patch(`/complaints/${id}/cancel`);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel complaint');
    }
  };

  const stats = calculateStats(complaints);
  const recentComplaints = complaints.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Quick actions bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
            Student Resident Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Welcome back, {user?.name || 'Resident'}! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Room: <span className="font-semibold text-slate-700">{user?.room || 'Unassigned'}</span> &bull; Manage your room requests and track maintenance statuses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
            title="Refresh Complaints"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/student/track"
            className="inline-flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-xs"
          >
            Track All
          </Link>

          <Link
            to="/student/raise"
            className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-md shadow-primary/20"
          >
            <PlusCircle className="w-5 h-5" />
            Raise New Complaint
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Requests"
          value={stats.total}
          icon={FileText}
          color="primary"
          subtitle="All time"
        />
        <StatCard
          title="Pending / In Progress"
          value={stats.pending}
          icon={Clock}
          color="amber"
          subtitle="Awaiting resolution"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Completed tickets"
        />
        <StatCard
          title="Avg. Resolution Time"
          value={stats.avgResolutionHours ? `${stats.avgResolutionHours}h` : 'N/A'}
          icon={Timer}
          color="primary"
          subtitle="From raise to close"
        />
      </div>

      {/* Recent Complaints Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Recent Complaints</h2>
          {complaints.length > 5 && (
            <Link
              to="/student/track"
              className="text-xs font-semibold text-primary hover:text-primary-700 flex items-center gap-1"
            >
              View all ({complaints.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Loading your complaints...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : recentComplaints.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No complaints raised yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              Everything looking good in your hostel room? If an issue arises, click below to report it.
            </p>
            <Link
              to="/student/raise"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              File Your First Complaint
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentComplaints.map((item) => (
              <ComplaintCard
                key={item.id || item._id}
                complaint={item}
                onCancel={handleCancel}
                onFeedbackSubmitted={() => fetchComplaints()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
