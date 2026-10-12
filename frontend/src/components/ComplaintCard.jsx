import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import SeverityBadge from './SeverityBadge';
import {
  formatTimeAgo,
  formatToken,
} from '../utils/helpers';
import {
  Wrench,
  Zap,
  Wifi,
  Armchair,
  Sparkles,
  ClipboardList,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  CornerDownRight,
  Send,
} from 'lucide-react';
import api from '../utils/api';

const CATEGORY_ICONS = {
  Plumbing: { icon: Wrench, color: 'text-blue-500 bg-blue-50' },
  Electrical: { icon: Zap, color: 'text-amber-500 bg-amber-50' },
  Internet: { icon: Wifi, color: 'text-indigo-500 bg-indigo-50' },
  Furniture: { icon: Armchair, color: 'text-emerald-500 bg-emerald-50' },
  Cleanliness: { icon: Sparkles, color: 'text-purple-500 bg-purple-50' },
  Other: { icon: ClipboardList, color: 'text-slate-500 bg-slate-50' },
};

export default function ComplaintCard({
  complaint,
  onCancel,
  onFeedbackSubmitted,
  showActions = false,
  customAction,
}) {
  const [expanded, setExpanded] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  if (!complaint) return null;

  const categoryMeta = CATEGORY_ICONS[complaint.category] || CATEGORY_ICONS.Other;
  const CategoryIcon = categoryMeta.icon;

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    setFeedbackError('');

    try {
      await api.post(`/complaints/${complaint.id || complaint._id}/feedback`, {
        rating,
        comment: feedbackComment,
      });
      setFeedbackSuccess(true);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(complaint.id || complaint._id, { rating, comment: feedbackComment });
      }
    } catch (err) {
      setFeedbackError(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const hasFeedback = complaint.feedback || complaint.rating;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all duration-200 shadow-xs overflow-hidden">
      {/* Top summary row */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-5 cursor-pointer select-none flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${categoryMeta.color}`}
          >
            <CategoryIcon className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {formatToken(complaint.token || complaint.id)}
              </span>
              <SeverityBadge severity={complaint.severity} />
              <StatusBadge status={complaint.status} />
            </div>

            <h4 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">
              {complaint.title}
            </h4>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {complaint.location || 'Room not specified'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {formatTimeAgo(complaint.createdAt)}
              </span>
              {complaint.student?.name && (
                <span className="text-slate-600 font-medium">
                  By: {complaint.student.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <span className="text-xs text-primary font-medium md:hidden">
            {expanded ? 'Hide details' : 'View details'}
          </span>
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Toggle details"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expandable details area */}
      {expanded && (
        <div className="px-5 pb-6 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-5">
          {/* Full description */}
          <div>
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Description
            </h5>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-white p-3.5 rounded-xl border border-slate-100">
              {complaint.description || 'No description provided.'}
            </p>
          </div>

          {/* Photo attachment if available */}
          {complaint.photoUrl && (
            <div>
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Attached Photo
              </h5>
              <div className="max-w-md rounded-xl overflow-hidden border border-slate-200">
                <img
                  src={complaint.photoUrl}
                  alt="Complaint attachment"
                  className="w-full h-auto max-h-60 object-cover"
                />
              </div>
            </div>
          )}

          {/* Resolution notes */}
          {complaint.resolutionNotes && (
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs uppercase tracking-wider mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Resolution Notes
              </div>
              <p className="text-sm text-emerald-900 leading-relaxed">
                {complaint.resolutionNotes}
              </p>
              {complaint.resolvedAt && (
                <div className="text-xs text-emerald-700 mt-2">
                  Resolved on: {new Date(complaint.resolvedAt).toLocaleString()}
                </div>
              )}
            </div>
          )}

          {/* Existing Feedback view */}
          {hasFeedback && (
            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Student Feedback
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= (complaint.feedback?.rating || complaint.rating || 0)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-amber-950 italic">
                "{complaint.feedback?.comment || complaint.feedbackComment || 'No comment provided'}"
              </p>
            </div>
          )}

          {/* Feedback Form (if RESOLVED and not yet submitted) */}
          {complaint.status === 'RESOLVED' && !hasFeedback && !feedbackSuccess && (
            <form
              onSubmit={handleFeedbackSubmit}
              className="bg-white border border-slate-200 rounded-xl p-4 space-y-3"
            >
              <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Rate Resolution Service
              </h5>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setRating(num)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          num <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  rows={2}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share your experience (optional)..."
                  className="w-full text-sm p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              {feedbackError && (
                <div className="text-xs text-red-600">{feedbackError}</div>
              )}

              <button
                type="submit"
                disabled={submittingFeedback}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          )}

          {feedbackSuccess && (
            <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              Thank you for providing your feedback!
            </div>
          )}

          {/* Action buttons (e.g. Cancel button for student if RAISED) */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {onCancel && complaint.status === 'RAISED' && (
                <button
                  type="button"
                  onClick={() => onCancel(complaint.id || complaint._id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel Complaint
                </button>
              )}
            </div>

            {customAction && <div>{customAction}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
