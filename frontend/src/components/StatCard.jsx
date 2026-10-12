import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendType = 'neutral', // 'positive' | 'negative' | 'neutral'
  color = 'primary', // 'primary' | 'amber' | 'emerald' | 'red'
  subtitle,
}) {
  const colorStyles = {
    primary: {
      bg: 'bg-indigo-50 text-indigo-600',
      border: 'hover:border-indigo-200',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'hover:border-amber-200',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'hover:border-emerald-200',
    },
    red: {
      bg: 'bg-red-50 text-red-600',
      border: 'hover:border-red-200',
    },
  };

  const style = colorStyles[color] || colorStyles.primary;

  return (
    <div
      className={`bg-white rounded-2xl p-6 border border-slate-100 shadow-sm transition-all duration-200 ${style.border}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 tracking-wide">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </h3>
            {subtitle && (
              <span className="text-xs font-normal text-slate-400">{subtitle}</span>
            )}
          </div>
        </div>
        {Icon && (
          <div className={`p-3.5 rounded-xl ${style.bg} flex-shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center text-xs">
          {trendType === 'positive' && (
            <span className="flex items-center font-medium text-emerald-600 mr-2">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              {trend}
            </span>
          )}
          {trendType === 'negative' && (
            <span className="flex items-center font-medium text-red-600 mr-2">
              <TrendingDown className="w-3.5 h-3.5 mr-1" />
              {trend}
            </span>
          )}
          {trendType === 'neutral' && (
            <span className="font-medium text-slate-500 mr-2">{trend}</span>
          )}
          <span className="text-slate-400">vs last period</span>
        </div>
      )}
    </div>
  );
}
