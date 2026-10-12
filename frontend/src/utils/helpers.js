/**
 * FixMyHostel Helper Utilities
 */

/**
 * Formats a timestamp into a human-readable "time ago" string
 * @param {string|Date} dateInput 
 * @returns {string}
 */
export function formatTimeAgo(dateInput) {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Invalid date';

  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 0) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

/**
 * Returns color classes and styles for a given severity level
 * @param {string} severity - 'critical' | 'high' | 'medium' | 'low'
 * @returns {object}
 */
export function getSeverityColor(severity) {
  const norm = (severity || '').toLowerCase();
  switch (norm) {
    case 'critical':
      return {
        badgeBg: 'bg-red-100',
        badgeText: 'text-red-700',
        badgeBorder: 'border-red-200',
        dot: 'bg-red-600',
        borderLeft: 'border-l-red-500'
      };
    case 'high':
      return {
        badgeBg: 'bg-orange-100',
        badgeText: 'text-orange-700',
        badgeBorder: 'border-orange-200',
        dot: 'bg-orange-500',
        borderLeft: 'border-l-orange-500'
      };
    case 'medium':
      return {
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-800',
        badgeBorder: 'border-amber-200',
        dot: 'bg-amber-500',
        borderLeft: 'border-l-amber-400'
      };
    case 'low':
    default:
      return {
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-700',
        badgeBorder: 'border-emerald-200',
        dot: 'bg-emerald-500',
        borderLeft: 'border-l-emerald-500'
      };
  }
}

/**
 * Formats a numeric token ID into a standardized 'T-001' style string
 * @param {number|string} token 
 * @returns {string}
 */
export function formatToken(token) {
  if (token === null || token === undefined || token === '') return 'T-000';
  const clean = String(token).replace(/^T-?/i, '');
  const num = parseInt(clean, 10);
  if (isNaN(num)) return `T-${token}`;
  return `T-${String(num).padStart(3, '0')}`;
}

/**
 * Filters a list of complaints by status, category, severity, and search query
 * @param {Array} complaints 
 * @param {object} filters 
 * @returns {Array}
 */
export function filterComplaints(complaints = [], filters = {}) {
  const { status, category, severity, search } = filters;

  return complaints.filter((item) => {
    if (status && status !== 'ALL' && item.status !== status) {
      return false;
    }
    if (category && category !== 'ALL' && item.category !== category) {
      return false;
    }
    if (severity && severity !== 'ALL' && item.severity?.toLowerCase() !== severity.toLowerCase()) {
      return false;
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      const titleMatch = item.title?.toLowerCase().includes(q);
      const descMatch = item.description?.toLowerCase().includes(q);
      const tokenMatch = formatToken(item.token || item.id).toLowerCase().includes(q);
      const locMatch = item.location?.toLowerCase().includes(q);
      if (!titleMatch && !descMatch && !tokenMatch && !locMatch) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Calculates statistical metrics from an array of complaints
 * @param {Array} complaints 
 * @returns {object}
 */
export function calculateStats(complaints = []) {
  const total = complaints.length;
  let pending = 0;
  let resolved = 0;
  let inProgress = 0;
  let totalResolutionTimeMinutes = 0;
  let resolvedWithTimes = 0;

  for (const c of complaints) {
    if (c.status === 'RESOLVED') {
      resolved++;
      if (c.createdAt && c.resolvedAt) {
        const start = new Date(c.createdAt).getTime();
        const end = new Date(c.resolvedAt).getTime();
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          totalResolutionTimeMinutes += (end - start) / (1000 * 60);
          resolvedWithTimes++;
        }
      }
    } else if (c.status === 'IN_PROGRESS' || c.status === 'ACCEPTED') {
      inProgress++;
      pending++;
    } else if (c.status === 'RAISED') {
      pending++;
    }
  }

  let avgResolutionTimeHours = 0;
  if (resolvedWithTimes > 0) {
    avgResolutionTimeHours = Number((totalResolutionTimeMinutes / resolvedWithTimes / 60).toFixed(1));
  }

  return {
    total,
    pending,
    resolved,
    inProgress,
    avgResolutionHours: avgResolutionTimeHours
  };
}
