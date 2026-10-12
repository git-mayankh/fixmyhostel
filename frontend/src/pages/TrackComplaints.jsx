import React, { useState, useEffect, useCallback } from 'react';
import ComplaintCard from '../components/ComplaintCard';
import { filterComplaints } from '../utils/helpers';
import api from '../utils/api';
import {
  Search,
  Filter,
  RefreshCw,
  Inbox,
  AlertCircle,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

const STATUS_TABS = ['ALL', 'RAISED', 'ACCEPTED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'];
const CATEGORIES = ['ALL', 'Plumbing', 'Electrical', 'Internet', 'Furniture', 'Cleanliness', 'Other'];
const SEVERITIES = ['ALL', 'low', 'medium', 'high', 'critical'];

export default function TrackComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPolling, setIsPolling] = useState(false);

  // Filters & sorting
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchComplaints = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await api.get('/complaints/my');
      const data = res.data.complaints || res.data || [];
      setComplaints(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      if (!isBackground) {
        setError('Failed to fetch complaints.');
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Polling every 5 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPolling(true);
      fetchComplaints(true).finally(() => {
        setTimeout(() => setIsPolling(false), 800);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchComplaints]);

  const handleCancelComplaint = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this complaint?')) return;
    try {
      await api.patch(`/complaints/${id}/cancel`);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Error cancelling complaint');
    }
  };

  // Filter and sort complaints
  const filtered = filterComplaints(complaints, {
    status: statusFilter,
    category: categoryFilter,
    severity: severityFilter,
    search: searchQuery,
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'date_desc') {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
    if (sortBy === 'date_asc') {
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    }
    if (sortBy === 'severity') {
      const weight = { critical: 4, high: 3, medium: 2, low: 1 };
      return (weight[b.severity?.toLowerCase()] || 0) - (weight[a.severity?.toLowerCase()] || 0);
    }
    return 0;
  });

  // Pagination math
  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginatedComplaints = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Polling indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Track Complaints
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time status tracking for all your logged maintenance tickets
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200">
            <span
              className={`w-2 h-2 rounded-full ${
                isPolling ? 'bg-emerald-500 animate-ping' : 'bg-emerald-500'
              }`}
            />
            <span>Auto-refreshing (5s)</span>
          </div>

          <button
            onClick={() => fetchComplaints()}
            className="p-2 text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-xs"
            title="Manual refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100">
          {STATUS_TABS.map((tab) => {
            const isSelected = statusFilter === tab;
            const count =
              tab === 'ALL'
                ? complaints.length
                : complaints.filter((c) => c.status === tab).length;

            return (
              <button
                key={tab}
                onClick={() => {
                  setStatusFilter(tab);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{tab.replace('_', ' ')}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Category, Severity & Sort Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by token, title or room..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none bg-white text-slate-700 font-medium"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Dropdown */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none bg-white text-slate-700 font-medium capitalize"
            >
              {SEVERITIES.map((sev) => (
                <option key={sev} value={sev}>
                  Severity: {sev}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none bg-white text-slate-700 font-medium"
            >
              <option value="date_desc">Sort: Newest First</option>
              <option value="date_asc">Sort: Oldest First</option>
              <option value="severity">Sort: Highest Urgency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaint List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-100">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading complaints...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm">
          {error}
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
          <Inbox className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No matching complaints found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your status or search filters to find what you're looking for.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {paginatedComplaints.map((item) => (
              <ComplaintCard
                key={item.id || item._id}
                complaint={item}
                onCancel={handleCancelComplaint}
                onFeedbackSubmitted={() => fetchComplaints(true)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-700">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-slate-700">
                  {Math.min(currentPage * itemsPerPage, sorted.length)}
                </span>{' '}
                of <span className="font-semibold text-slate-700">{sorted.length}</span> tickets
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-700 px-3">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
