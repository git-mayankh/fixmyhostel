const express = require('express');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

function createStaffRoutes(store) {
  const router = express.Router();

  // All staff routes require auth and 'staff' or 'warden' role
  router.use(auth, requireRole('staff', 'warden'));

  // GET /queue — get all non-resolved complaints sorted by severity then oldest first
  router.get('/queue', async (req, res, next) => {
    try {
      const queue = await store.getStaffQueue();
      return res.json(queue);
    } catch (err) {
      next(err);
    }
  });

  // GET /my-assigned — get complaints assigned to current staff
  router.get('/my-assigned', async (req, res, next) => {
    try {
      const assigned = await store.getStaffAssigned(req.user.id);
      return res.json(assigned);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /:id/accept — move RAISED -> ACCEPTED, set assigned_to
  router.patch('/:id/accept', async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await store.acceptComplaint(id, req.user.id);

      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({ error: 'Complaint not found' });
      }
      if (result.error === 'INVALID_STATUS') {
        return res.status(400).json({ error: 'Complaint must be in RAISED status to accept' });
      }

      return res.json({
        message: 'Complaint accepted',
        complaint: result,
        ...result
      });
    } catch (err) {
      next(err);
    }
  });

  // PATCH /:id/start — move ACCEPTED -> IN_PROGRESS
  router.patch('/:id/start', async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await store.startComplaint(id, req.user.id);

      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({ error: 'Complaint not found' });
      }
      if (result.error === 'INVALID_STATUS') {
        return res.status(400).json({ error: 'Complaint must be in ACCEPTED status to start work' });
      }

      return res.json({
        message: 'Complaint work started',
        complaint: result,
        ...result
      });
    } catch (err) {
      next(err);
    }
  });

  // PATCH /:id/resolve — move IN_PROGRESS -> RESOLVED, require resolution_notes
  router.patch('/:id/resolve', async (req, res, next) => {
    try {
      const { id } = req.params;
      const { resolution_notes } = req.body;

      if (!resolution_notes || !resolution_notes.trim()) {
        return res.status(400).json({ error: 'Resolution notes are required to resolve complaint' });
      }

      const result = await store.resolveComplaint(id, req.user.id, resolution_notes.trim());

      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({ error: 'Complaint not found' });
      }
      if (result.error === 'INVALID_STATUS') {
        return res.status(400).json({ error: 'Complaint must be in IN_PROGRESS status to resolve' });
      }
      if (result.error === 'MISSING_NOTES') {
        return res.status(400).json({ error: 'Resolution notes are required to resolve complaint' });
      }

      return res.json({
        message: 'Complaint resolved successfully',
        complaint: result,
        ...result
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = createStaffRoutes;
