const { app, request, resetStore, createTestUser, getAuthToken } = require('./setup');

describe('Auth API Tests (8 tests)', () => {
  beforeEach(() => {
    resetStore();
  });

  // 1. registers a new user successfully
  test('registers a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Mayank Heda',
        email: 'mayank@fixmyhostel.com',
        password: 'password123',
        room_number: 'B-201'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'mayank@fixmyhostel.com');
    expect(res.body.user).not.toHaveProperty('password');
  });

  // 2. rejects duplicate email (409)
  test('rejects duplicate email (409)', async () => {
    await createTestUser('student', { email: 'duplicate@test.com' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another User',
        email: 'duplicate@test.com',
        password: 'password123'
      });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  // 3. rejects missing name (400)
  test('rejects missing name (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: '',
        email: 'noname@test.com',
        password: 'password123'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name/i);
  });

  // 4. rejects short password (400)
  test('rejects short password (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Short Pass User',
        email: 'shortpass@test.com',
        password: '123'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/password/i);
  });

  // 5. rejects invalid email format (400)
  test('rejects invalid email format (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Invalid Email',
        email: 'invalid-email-address',
        password: 'password123'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  // 6. logs in with correct credentials
  test('logs in with correct credentials', async () => {
    const user = await createTestUser('student', {
      email: 'login@test.com',
      password: 'password123'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: user.email,
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'login@test.com');
  });

  // 7. rejects wrong password (401)
  test('rejects wrong password (401)', async () => {
    const user = await createTestUser('student', {
      email: 'wrongpass@test.com',
      password: 'correctpassword'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: user.email,
        password: 'incorrectpassword'
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  // 8. GET /me returns current user profile
  test('GET /me returns current user profile', async () => {
    const user = await createTestUser('student', {
      name: 'Profile Tester',
      email: 'me@test.com'
    });
    const token = getAuthToken(user);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', user.id);
    expect(res.body).toHaveProperty('email', 'me@test.com');
    expect(res.body).toHaveProperty('name', 'Profile Tester');
    expect(res.body).not.toHaveProperty('password');
  });
});
