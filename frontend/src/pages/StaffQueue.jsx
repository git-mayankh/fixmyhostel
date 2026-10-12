import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import ComplaintCard from '../components/ComplaintCard';
import SeverityBadge from '../components/SeverityBadge';
import StatusBadge from '../components/StatusBadge';
import { formatToken, formatTimeAgo } from '../utils/helpers';
import api from '../utils/api';
import {
  ListTodo,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  Clock,
  MapPin,
  Play,
  Check,
  ArrowRight,
  X,
  FileCheck,
} from 'lucide-react';

export default function StaffQueue() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'assigned' | 'resolved'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Resolution modal state
  const [resolvingId, setResolvingId] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionError, setResolutionError] = useState('');

  const fetchStaffComplaints = useCallback(async (background = false) => {
    if (!background) setLoading(true);
    try {
      const res = await api.get('/staff/queue');
      const data = res.data.complaints || res.data || [];
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch staff queue:', err);
    } finally {
      if (!background) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffComplaints();
  }, [fetchStaffComplaints]);

  // Auto-refresh every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      fetchStaffComplaints(true);
    }, 3000);

    return () => clearInterval(timer);
  }, [fetchStaffComplaints]);

  const handleAccept = async (id) => {
    try {
      setActionLoading(id);
      await api.patch(`/complaints/${id}/status`, { status: 'ACCEPTED' });
      await fetchStaffComplaints(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept complaint');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartWork = async (id) => {
    try {
      setActionLoading(id);
      await api.patch(`/complaints/${id}/status`, { status: 'IN_PROGRESS' });
      await fetchStaffComplaints(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update to In Progress');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmResolve = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      setResolutionError('Please enter notes explaining the repair work performed.');
      return;
    }

    try {
      setActionLoading(resolvingId);
      await api.patch(`/complaints/${resolvingId}/status`, {
        status: 'RESOLVED',
        resolutionNotes: resolutionNotes.trim(),
      });
      setResolvingId(null);
      setResolutionNotes('');
      setResolutionError('');
      await fetchStaffComplaints(true);
    } catch (err) {
      setResolutionError(err.response?.data?.message || 'Failed to resolve ticket');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter complaints into 3 tabs
  const queueComplaints = complaints.filter(
    (c) => c.status === 'RAISED' || (c.status === 'ACCEPTED' && !c.assignedTo)
  );

  const assignedComplaints = complaints.filter(
    (c) =>
      (c.status === 'ACCEPTED' || c.status === 'IN_PROGRESS') &&
      (!c.assignedTo || c.assignedTo === user?._id || c.assignedTo === user?.id || c.assignedTo?.name === user?.name)
  );

  const resolvedTodayComplaints = complaints.filter((c) => {
    if (c.status !== 'RESOLVED') return false;
    if (!c.resolvedAt) return true;
    const resolvedDate = new Date(c.resolvedAt).toDateString();
    const today = new Date().toDateString();
    return resolvedDate === today;
  });

  const getActiveList = () => {
    if (activeTab === 'queue') return queueComplaints;
    if (activeTab === 'assigned') return assignedComplaints;
    return resolvedTodayComplaints;
  };

  const currentList = getActiveList();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Staff Operations Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Hostel Maintenance Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Active staff member: <span className="font-semibold text-slate-800">{user?.name} (Bhavisha Kewalramani)</span> &bull; Real-time sync every 3s
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchStaffComplaints();
            }}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setActiveTab('queue')}
          className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
            activeTab === 'queue'
              ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <ListTodo className="w-5 h-5" />
            <div>
              <div className="font-bold text-sm">Unassigned Queue</div>
              <div className={`text-xs ${activeTab === 'queue' ? 'text-indigo-100' : 'text-slate-400'}`}>
                Open tickets awaiting action
              </div>
            </div>
          </div>
          <span
            className={`text-sm font-extrabold px-2.5 py-1 rounded-full ${
              activeTab === 'queue' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'
            }`}
          >
            {queueComplaints.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('assigned')}
          className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
            activeTab === 'assigned'
              ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5" />
            <div>
              <div className="font-bold text-sm">My Active Tasks</div>
              <div className={`text-xs ${activeTab === 'assigned' ? 'text-indigo-100' : 'text-slate-400'}`}>
                Accepted & in-progress
              </div>
            </div>
          </div>
          <span
            className={`text-sm font-extrabold px-2.5 py-1 rounded-full ${
              activeTab === 'assigned' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'
            }`}
          >
            {assignedComplaints.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('resolved')}
          className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
            activeTab === 'resolved'
              ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            <div>
              <div className="font-bold text-sm">Resolved Today</div>
              <div className={`text-xs ${activeTab === 'resolved' ? 'text-indigo-100' : 'text-slate-400'}`}>
                Completed work records
              </div>
            </div>
          </div>
          <span
            className={`text-sm font-extrabold px-2.5 py-1 rounded-full ${
              activeTab === 'resolved' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'
            }`}
          >
            {resolvedTodayComplaints.length}
          </span>
        </button>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-100">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Updating maintenance queue...</p>
        </div>
      ) : currentList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            {activeTab === 'queue'
              ? 'Queue is empty! All complaints addressed.'
              : activeTab === 'assigned'
              ? 'No active tasks in progress.'
              : 'No complaints resolved today yet.'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            New requests submitted by students will automatically show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((item) => {
            const itemId = item.id || item._id;
            const isProcessing = actionLoading === itemId;

            let actionElement = null;
            if (item.status === 'RAISED') {
              actionElement = (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAccept(itemId);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  Accept Request
                </button>
              );
            } else if (item.status === 'ACCEPTED') {
              actionElement = (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartWork(itemId);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-xs font-semibold rounded-xl hover:bg-amber-600 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Start Work
                </button>
              );
            } else if (item.status === 'IN_PROGRESS') {
              actionElement = (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={(e) => {
                    e.stopPropagation();
                    setResolvingId(itemId);
                    setResolutionNotes('');
                    setResolutionError('');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Mark Resolved
                </button>
              );
            }

            return (
              <ComplaintCard
                key={itemId}
                complaint={item}
                customAction={actionElement}
              />
            );
          })}
        </div>
      )}

      {/* Resolution Notes Modal */}
      {resolvingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-xl font-bold text-slate-900">Resolve Complaint</h3>
              </div>
              <button
                onClick={() => setResolvingId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Provide resolution notes explaining the maintenance work done. This will be shared with the student and warden.
            </p>

            <form onSubmit={handleConfirmResolve} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Work Completion Notes
                </label>
                <textarea
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Replaced faulty heater element and tightened thermostat terminal. Tested heating for 15 minutes."
                  required
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>

              {resolutionError && (
                <div className="text-xs text-red-600 font-medium">{resolutionError}</div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingId(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading === resolvingId}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {actionLoading === resolvingId ? 'Resolving...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
