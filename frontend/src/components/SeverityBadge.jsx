import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { getSeverityColor } from '../utils/helpers';

export default function SeverityBadge({ severity = 'low' }) {
  const norm = (severity || 'low').toLowerCase();
  const colors = getSeverityColor(norm);

  const getIcon = () => {
    switch (norm) {
      case 'critical':
        return <AlertCircle className="w-3.5 h-3.5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />;
      case 'medium':
        return <Info className="w-3.5 h-3.5 text-amber-600" />;
      case 'low':
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${colors.badgeBg} ${colors.badgeText} ${colors.badgeBorder} capitalize`}
    >
      {getIcon()}
      <span>{norm}</span>
    </span>
  );
}
