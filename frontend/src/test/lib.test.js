import { describe, it, expect } from 'vitest';
import {
  formatTimeAgo,
  getSeverityColor,
  formatToken,
  filterComplaints,
  calculateStats,
} from '../utils/helpers';

describe('Frontend Helpers & Utilities', () => {
  it('formats time ago correctly', () => {
    const now = new Date();
    const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    expect(formatTimeAgo(tenMinsAgo.toISOString())).toBe('10m ago');
    expect(formatTimeAgo(twoHoursAgo.toISOString())).toBe('2h ago');
    expect(formatTimeAgo(threeDaysAgo.toISOString())).toBe('3d ago');
    expect(formatTimeAgo(null)).toBe('N/A');
  });

  it('formats severity colors correctly', () => {
    const critical = getSeverityColor('critical');
    expect(critical.badgeBg).toBe('bg-red-100');
    expect(critical.badgeText).toBe('text-red-700');

    const high = getSeverityColor('high');
    expect(high.badgeBg).toBe('bg-orange-100');

    const medium = getSeverityColor('medium');
    expect(medium.badgeBg).toBe('bg-amber-100');

    const low = getSeverityColor('low');
    expect(low.badgeBg).toBe('bg-emerald-100');
  });

  it('token format is T-001 style', () => {
    expect(formatToken(1)).toBe('T-001');
    expect(formatToken(42)).toBe('T-042');
    expect(formatToken('105')).toBe('T-105');
    expect(formatToken('T-7')).toBe('T-007');
    expect(formatToken(null)).toBe('T-000');
  });

  it('filter logic works correctly', () => {
    const sampleComplaints = [
      { id: 1, title: 'Fan broken', category: 'Electrical', severity: 'high', status: 'RAISED' },
      { id: 2, title: 'Water leakage', category: 'Plumbing', severity: 'critical', status: 'IN_PROGRESS' },
      { id: 3, title: 'Broken chair', category: 'Furniture', severity: 'low', status: 'RESOLVED' },
    ];

    const electricalOnly = filterComplaints(sampleComplaints, { category: 'Electrical' });
    expect(electricalOnly.length).toBe(1);
    expect(electricalOnly[0].title).toBe('Fan broken');

    const criticalOnly = filterComplaints(sampleComplaints, { severity: 'critical' });
    expect(criticalOnly.length).toBe(1);
    expect(criticalOnly[0].title).toBe('Water leakage');

    const statusResolved = filterComplaints(sampleComplaints, { status: 'RESOLVED' });
    expect(statusResolved.length).toBe(1);
    expect(statusResolved[0].title).toBe('Broken chair');

    const searchMatch = filterComplaints(sampleComplaints, { search: 'leakage' });
    expect(searchMatch.length).toBe(1);
    expect(searchMatch[0].id).toBe(2);
  });

  it('stat calculation works accurately', () => {
    const sampleComplaints = [
      {
        id: 1,
        status: 'RESOLVED',
        createdAt: '2026-10-12T10:00:00Z',
        resolvedAt: '2026-10-12T12:00:00Z', // 2 hours
      },
      {
        id: 2,
        status: 'IN_PROGRESS',
        createdAt: '2026-10-12T11:00:00Z',
      },
      {
        id: 3,
        status: 'RAISED',
        createdAt: '2026-10-12T12:00:00Z',
      },
    ];

    const stats = calculateStats(sampleComplaints);
    expect(stats.total).toBe(3);
    expect(stats.pending).toBe(2);
    expect(stats.resolved).toBe(1);
    expect(stats.avgResolutionHours).toBe(2.0);
  });

  it('handles empty state gracefully', () => {
    const stats = calculateStats([]);
    expect(stats.total).toBe(0);
    expect(stats.pending).toBe(0);
    expect(stats.resolved).toBe(0);
    expect(stats.avgResolutionHours).toBe(0);

    const filtered = filterComplaints([], { search: 'test' });
    expect(filtered).toEqual([]);
  });
});
