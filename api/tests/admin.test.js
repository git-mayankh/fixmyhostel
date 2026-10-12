const { app, request, store, resetStore, createTestUser, getAuthToken } = require('./setup');

describe('Admin API Tests (8 tests)', () => {
  let warden, wardenToken;
  let student, studentToken;
  let staff;

  beforeEach(async () => {
    resetStore();
    warden = await createTestUser('warden', { name: 'Mayank Warden', email: 'warden@test.com' });
    wardenToken = getAuthToken(warden);

    student = await createTestUser('student', { name: 'Ishita Student', email: 'student@test.com' });
    studentToken = getAuthToken(student);

    staff = await createTestUser('staff', { name: 'Bhavisha Staff', email: 'staff@test.com' });

    // Seed a couple complaints
    const c1 = await store.createComplaint({
      student_id: student.id,
      title: 'Plumbing issue',
      category: 'plumbing',
      severity: 'high',
      location: 'Wing B Room 101'
    });
    await store.acceptComplaint(c1.id, staff.id);
    await store.startComplaint(c1.id, staff.id);
    await store.resolveComplaint(c1.id, staff.id, 'Repaired pipe');

    await store.createComplaint({
      student_id: student.id,
      title: 'Internet issue',
      category: 'internet',
      severity: 'low',
      location: 'Wing B Room 101'
    });
  });

  // 1. warden sees dashboard stats
  test('warden sees dashboard stats', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${wardenToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total_complaints');
    expect(res.body).toHaveProperty('pending_count');
    expect(res.body).toHaveProperty('resolved_count');
    expect(res.body).toHaveProperty('avg_resolution_minutes');
  });

  // 2. dashboard includes complaints_by_category
  test('dashboard includes complaints_by_category', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${wardenToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('complaints_by_category');
    expect(Array.isArray(res.body.complaints_by_category)).toBe(true);
    expect(res.body.complaints_by_category.length).toBeGreaterThan(0);
  });

  // 3. dashboard includes daily_trend
  test('dashboard includes daily_trend', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${wardenToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('daily_trend');
    expect(Array.isArray(res.body.daily_trend)).toBe(true);
    expect(res.body.daily_trend.length).toBe(7);
  });

  // 4. dashboard includes top_locations
  test('dashboard includes top_locations', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${wardenToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('top_locations');
    expect(Array.isArray(res.body.top_locations)).toBe(true);
  });

  // 5. warden sees staff performance
  test('warden sees staff performance', async () => {
    const res = await request(app)
      .get('/api/admin/staff-performance')
      .set('Authorization', `Bearer ${wardenToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty('staff_id', staff.id);
    expect(res.body[0]).toHaveProperty('assigned');
    expect(res.body[0]).toHaveProperty('resolved');
  });

  // 6. warden can list users
  test('warden can list users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${wardenToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3); // warden, student, staff
  });

  // 7. warden can update user role
  test('warden can update user role', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${student.id}/role`)
      .set('Authorization', `Bearer ${wardenToken}`)
      .send({
        role: 'staff'
      });

    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('role', 'staff');

    // Verify persisted
    const updated = await store.findUserById(student.id);
    expect(updated.role).toBe('staff');
  });

  // 8. student cannot access admin endpoints (403)
  test('student cannot access admin endpoints (403)', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/forbidden|denied/i);
  });
});
