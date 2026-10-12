const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'photo-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'));
  }
});

const VALID_CATEGORIES = ['plumbing', 'electrical', 'internet', 'furniture', 'cleanliness', 'other'];
const VALID_SEVERITIES = ['low', 'medium', 'high', 'critical'];

function createComplaintsRoutes(store) {
  const router = express.Router();

  // POST / — student raises complaint
  router.post('/', auth, requireRole('student'), upload.single('photo'), async (req, res, next) => {
    try {
      const { title, description, category, severity, location } = req.body;

      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Title is required' });
      }

      if (!category || !VALID_CATEGORIES.includes(category.toLowerCase())) {
        return res.status(400).json({ 
          error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` 
        });
      }

      const assignedSeverity = severity && VALID_SEVERITIES.includes(severity.toLowerCase()) 
        ? severity.toLowerCase() 
        : 'low';

      if (!location || typeof location !== 'string' || !location.trim()) {
        return res.status(400).json({ error: 'Location is required' });
      }

      let photoUrl = null;
      if (req.file) {
        photoUrl = `/uploads/${req.file.filename}`;
      } else if (req.body.photo_url) {
        photoUrl = req.body.photo_url;
      }

      const complaint = await store.createComplaint({
        student_id: req.user.id,
        title: title.trim(),
        description: description ? description.trim() : '',
        category: category.toLowerCase(),
        severity: assignedSeverity,
        location: location.trim(),
        photo_url: photoUrl
      });

      return res.status(201).json({
        message: 'Complaint created successfully',
        token_number: complaint.token_number,
        complaint,
        ...complaint
      });
    } catch (err) {
      next(err);
    }
  });

  // GET / — student gets own complaints
  const handleGetMyComplaints = async (req, res, next) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const parsedPage = Math.max(1, parseInt(page, 10) || 1);
      const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);

      const result = await store.getComplaintsByStudent(req.user.id, {
        status: status || null,
        page: parsedPage,
        limit: parsedLimit
      });

      // Also attach cached total count
      const cachedCount = await store.getStudentComplaintCount(req.user.id);

      return res.json({
        ...result,
        student_total_complaints: cachedCount
      });
    } catch (err) {
      next(err);
    }
  };

  router.get('/', auth, requireRole('student'), handleGetMyComplaints);
  router.get('/my', auth, requireRole('student'), handleGetMyComplaints);

  // GET /:id — get single complaint
  router.get('/:id', auth, async (req, res, next) => {
    try {
      const { id } = req.params;
      const complaint = await store.getComplaintById(id);

      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      // Check authorization: student can view own only, staff & warden can view all
      if (req.user.role === 'student' && complaint.student_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied: You can only view your own complaints' });
      }

      const feedback = await store.getFeedbackByComplaintId(id);

      return res.json({
        ...complaint,
        feedback: feedback || []
      });
    } catch (err) {
      next(err);
    }
  });

  // PATCH /:id/cancel — cancel complaint if status is RAISED
  router.patch('/:id/cancel', auth, requireRole('student'), async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await store.cancelComplaint(id, req.user.id);

      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({ error: 'Complaint not found' });
      }
      if (result.error === 'FORBIDDEN') {
        return res.status(403).json({ error: 'Access denied: You can only cancel your own complaints' });
      }
      if (result.error === 'CANNOT_CANCEL') {
        return res.status(400).json({ error: 'Can only cancel complaints with status RAISED' });
      }

      return res.json({
        message: 'Complaint cancelled successfully',
        complaint: result,
        ...result
      });
    } catch (err) {
      next(err);
    }
  });

  // PATCH /:id/status — update complaint status (used by Staff and Warden)
  router.patch('/:id/status', auth, requireRole('staff', 'warden'), async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, resolutionNotes, resolution_notes } = req.body;
      const notes = resolutionNotes || resolution_notes;

      let result;
      if (status === 'ACCEPTED') {
        result = await store.acceptComplaint(id, req.user.id);
      } else if (status === 'IN_PROGRESS') {
        result = await store.startComplaint(id, req.user.id);
      } else if (status === 'RESOLVED') {
        result = await store.resolveComplaint(id, req.user.id, notes);
      } else {
        return res.status(400).json({ error: 'Invalid status value' });
      }

      if (result && result.error) {
        if (result.error === 'NOT_FOUND') return res.status(404).json({ error: 'Complaint not found' });
        if (result.error === 'INVALID_STATUS') return res.status(400).json({ error: 'Illegal status transition' });
        if (result.error === 'MISSING_NOTES') return res.status(400).json({ error: 'Resolution notes are required' });
      }

      return res.json({ message: 'Status updated successfully', complaint: result, ...result });
    } catch (err) {
      next(err);
    }
  });

  // POST /:id/feedback — student rates resolved complaint 1-5
  router.post('/:id/feedback', auth, requireRole('student'), async (req, res, next) => {
    try {
      const { id } = req.params;
      const { rating, comments } = req.body;

      if (rating === undefined || rating === null) {
        return res.status(400).json({ error: 'Rating is required' });
      }

      const numRating = parseInt(rating, 10);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
      }

      const result = await store.createFeedback({
        complaint_id: id,
        student_id: req.user.id,
        rating: numRating,
        comments: comments || ''
      });

      if (result.error === 'NOT_FOUND') {
        return res.status(404).json({ error: 'Complaint not found' });
      }
      if (result.error === 'FORBIDDEN') {
        return res.status(403).json({ error: 'Access denied: You can only leave feedback on your own complaints' });
      }
      if (result.error === 'NOT_RESOLVED') {
        return res.status(400).json({ error: 'Feedback can only be submitted for RESOLVED complaints' });
      }
      if (result.error === 'INVALID_RATING') {
        return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
      }

      return res.status(201).json({
        message: 'Feedback submitted successfully',
        feedback: result
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = createComplaintsRoutes;
