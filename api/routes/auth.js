const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createAuthRoutes(store) {
  const router = express.Router();
  const jwtSecret = process.env.JWT_SECRET || 'fixmyhostel-secret-key-2026';

  // POST /register
  router.post('/register', async (req, res, next) => {
    try {
      const { name, email, password, room_number, role } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Name is required' });
      }

      if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
        return res.status(400).json({ error: 'Valid email is required' });
      }

      if (!password || typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      const existingUser = await store.findUserByEmail(email.trim());
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userRole = role && ['student', 'staff', 'warden'].includes(role) ? role : 'student';

      const newUser = await store.createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: userRole,
        room_number: room_number ? room_number.trim() : null
      });

      const token = jwt.sign(
        {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        },
        jwtSecret,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          room_number: newUser.room_number
        }
      });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Email already registered' });
      }
      next(err);
    }
  });

  // POST /login
  router.post('/login', async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await store.findUserByEmail(email.trim());
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        jwtSecret,
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /me
  router.get('/me', auth, async (req, res, next) => {
    try {
      const user = await store.findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { password: _password, ...safeUser } = user;
      return res.json(safeUser);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = createAuthRoutes;
