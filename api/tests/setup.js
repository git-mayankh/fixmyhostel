const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const request = require('supertest');
const { createApp } = require('../app');
const { InMemoryStore } = require('../models/store');

const store = new InMemoryStore();
const app = createApp(store);
const jwtSecret = process.env.JWT_SECRET || 'fixmyhostel-secret-key-2026';

function resetStore() {
  store.reset();
}

async function createTestUser(role = 'student', customFields = {}) {
  const email = customFields.email || `${role}_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`;
  const plainPassword = customFields.password || 'password123';
  const hashedPassword = await bcrypt.hash(plainPassword, 4); // fast salt for tests

  const user = await store.createUser({
    name: customFields.name || `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
    email,
    password: hashedPassword,
    role,
    room_number: customFields.room_number || 'A-101'
  });

  return {
    ...user,
    plainPassword
  };
}

function getAuthToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    jwtSecret,
    { expiresIn: '1d' }
  );
}

module.exports = {
  app,
  store,
  request,
  resetStore,
  createTestUser,
  getAuthToken
};
