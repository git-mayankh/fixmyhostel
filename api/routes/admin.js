const express = require('express');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

function createAdminRoutes(store) {
  const router = express.Router();

  // All admin routes require auth and 'warden' role
  router.use(auth, requireRole('warden'));

  // GET /dashboard
  router.get('/dashboard', async (req, res, next) => {
    try {
      const data = await store.getAdminDashboardStats();

      // Transform category counts to object
      const categoryCounts = {
        Plumbing: 0,
        Electrical: 0,
        Internet: 0,
        Furniture: 0,
        Cleanliness: 0,
        Other: 0
      };
      if (Array.isArray(data.complaints_by_category)) {
        data.complaints_by_category.forEach(item => {
          const cat = item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1).toLowerCase() : 'Other';
          categoryCounts[cat] = (categoryCounts[cat] || 0) + (parseInt(item.count, 10) || 0);
        });
      }

      // Transform severity counts to object
      const severityCounts = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      };
      if (Array.isArray(data.complaints_by_severity)) {
        data.complaints_by_severity.forEach(item => {
          if (item.severity && severityCounts[item.severity] !== undefined) {
            severityCounts[item.severity] = parseInt(item.count, 10) || 0;
          }
        });
      }

      // Transform daily trend
      const dailyTrend = {
        labels: [],
        values: []
      };
      if (Array.isArray(data.daily_trend)) {
        data.daily_trend.forEach(item => {
          dailyTrend.labels.push(item.date);
          dailyTrend.values.push(parseInt(item.raised, 10) || 0);
        });
      }

      // Transform hourly distribution
      const hourlyDistribution = {
        labels: [],
        values: []
      };
      if (Array.isArray(data.hourly_distribution)) {
        data.hourly_distribution.forEach(item => {
          hourlyDistribution.labels.push(`${item.hour}:00`);
          hourlyDistribution.values.push(parseInt(item.count, 10) || 0);
        });
      }

      const topLocations = Array.isArray(data.top_locations)
        ? data.top_locations.map(item => ({
            location: item.location || 'Unknown',
            count: parseInt(item.count, 10) || 0
          }))
        : [];

      return res.json({
        ...data,
        stats: {
          totalToday: data.total_complaints || 0,
          pending: data.pending_count || 0,
          resolved: data.resolved_count || 0,
          avgResolutionTimeHours: Number(((data.avg_resolution_minutes || 0) / 60).toFixed(1))
        },
        categoryCounts,
        severityCounts,
        dailyTrend,
        hourlyDistribution,
        topLocations
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /staff-performance
  router.get('/staff-performance', async (req, res, next) => {
    try {
      const performance = await store.getStaffPerformance();
      return res.json(performance);
    } catch (err) {
      next(err);
    }
  });

  // GET /users
  router.get('/users', async (req, res, next) => {
    try {
      const users = await store.getAllUsers();
      return res.json(users);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /users/:id/role
  router.patch('/users/:id/role', async (req, res, next) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role || !['student', 'staff', 'warden'].includes(role)) {
        return res.status(400).json({ error: 'Valid role is required (student, staff, warden)' });
      }

      const updatedUser = await store.updateUserRole(id, role);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { password: _password, ...safeUser } = updatedUser;
      return res.json({
        message: 'User role updated successfully',
        user: safeUser
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = createAdminRoutes;
