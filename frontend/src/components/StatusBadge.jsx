import React from 'react';

const STATUS_CONFIG = {
  RAISED: {
    label: 'Raised',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    pulse: true,
  },
  ACCEPTED: {
    label: 'Accepted',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    pulse: false,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    pulse: true,
  },
  RESOLVED: {
    label: 'Resolved',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    pulse: false,
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    pulse: false,
  },
};

export default function StatusBadge({ status = 'RAISED' }) {
  const normStatus = (status || '').toUpperCase().replace(/\s+/g, '_');
  const config = STATUS_CONFIG[normStatus] || {
    label: status,
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    pulse: false,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className="relative flex h-2 w-2">
        {config.pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dot} opacity-75`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}
        />
      </span>
      {config.label}
    </span>
  );
}
