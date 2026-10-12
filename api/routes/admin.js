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
      const stats = await store.getAdminDashboardStats();
      return res.json(stats);
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
