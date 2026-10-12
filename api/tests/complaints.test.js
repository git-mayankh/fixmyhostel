const { app, request, store, resetStore, createTestUser, getAuthToken } = require('./setup');

describe('Complaints API Tests (12 tests)', () => {
  let student1, token1;
  let student2, _token2;
  let staff, _staffToken;

  beforeEach(async () => {
    resetStore();
    student1 = await createTestUser('student', { name: 'Student One', email: 's1@test.com' });
    token1 = getAuthToken(student1);

    student2 = await createTestUser('student', { name: 'Student Two', email: 's2@test.com' });
    _token2 = getAuthToken(student2);

    staff = await createTestUser('staff', { name: 'Staff Maintenance', email: 'staff@test.com' });
    _staffToken = getAuthToken(staff);
  });

  // 1. student can raise a complaint
  test('student can raise a complaint', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        title: 'Water pipe leaking',
        description: 'Under the sink',
        category: 'plumbing',
        severity: 'high',
        location: 'Room 204'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Water pipe leaking');
    expect(res.body.status).toBe('RAISED');
  });

  // 2. complaint gets a token number
  test('complaint gets a token number', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        title: 'Light not working',
        category: 'electrical',
        severity: 'low',
        location: 'Room 204'
      });

    expect(res.status).toBe(201);
    expect(res.body.token_number).toBeDefined();
    expect(Number(res.body.token_number)).toBeGreaterThanOrEqual(1);
  });

  // 3. second complaint same day gets token+1
  test('second complaint same day gets token+1', async () => {
    const res1 = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        title: 'Complaint One',
        category: 'plumbing',
        location: 'Room 204'
      });

    const res2 = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        title: 'Complaint Two',
        category: 'electrical',
        location: 'Room 204'
      });

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
    expect(Number(res2.body.token_number)).toBe(Number(res1.body.token_number) + 1);
  });

  // 4. rejects complaint without title (400)
  test('rejects complaint without title (400)', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        description: 'Missing title',
        category: 'plumbing',
        location: 'Room 204'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/i);
  });

  // 5. rejects invalid category (400)
  test('rejects invalid category (400)', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        title: 'Random issue',
        category: 'invalid_category_xyz',
        location: 'Room 204'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/category/i);
  });

  // 6. student can view own complaints
  test('student can view own complaints', async () => {
    await store.createComplaint({
      student_id: student1.id,
      title: 'Student 1 complaint',
      category: 'internet',
      severity: 'medium',
      location: 'Room 204'
    });

    const res = await request(app)
      .get('/api/complaints')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.complaints).toHaveLength(1);
    expect(res.body.complaints[0].title).toBe('Student 1 complaint');
  });

  // 7. student cannot view others complaints
  test('student cannot view others\' complaints', async () => {
    const complaint2 = await store.createComplaint({
      student_id: student2.id,
      title: 'Student 2 private complaint',
      category: 'furniture',
      severity: 'low',
      location: 'Room 305'
    });

    const res = await request(app)
      .get(`/api/complaints/${complaint2.id}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/denied|forbidden/i);
  });

  // 8. student can cancel a RAISED complaint
  test('student can cancel a RAISED complaint', async () => {
    const complaint = await store.createComplaint({
      student_id: student1.id,
      title: 'Temporary issue resolved itself',
      category: 'other',
      severity: 'low',
      location: 'Room 204'
    });

    const res = await request(app)
      .patch(`/api/complaints/${complaint.id}/cancel`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.complaint.status).toBe('CANCELLED');
  });

  // 9. student cannot cancel an ACCEPTED complaint
  test('student cannot cancel an ACCEPTED complaint', async () => {
    const complaint = await store.createComplaint({
      student_id: student1.id,
      title: 'Tap repair',
      category: 'plumbing',
      severity: 'medium',
      location: 'Room 204'
    });
    // Staff accepts complaint
    await store.acceptComplaint(complaint.id, staff.id);

    const res = await request(app)
      .patch(`/api/complaints/${complaint.id}/cancel`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/RAISED/i);
  });

  // 10. student can leave feedback on RESOLVED complaint
  test('student can leave feedback on RESOLVED complaint', async () => {
    const complaint = await store.createComplaint({
      student_id: student1.id,
      title: 'Resolved fixture',
      category: 'electrical',
      severity: 'high',
      location: 'Room 204'
    });
    await store.acceptComplaint(complaint.id, staff.id);
    await store.startComplaint(complaint.id, staff.id);
    await store.resolveComplaint(complaint.id, staff.id, 'Fixed wires');

    const res = await request(app)
      .post(`/api/complaints/${complaint.id}/feedback`)
      .set('Authorization', `Bearer ${token1}`)
      .send({
        rating: 5,
        comments: 'Excellent quick service!'
      });

    expect(res.status).toBe(201);
    expect(res.body.feedback).toHaveProperty('rating', 5);
  });

  // 11. student cannot leave feedback on non-RESOLVED complaint
  test('student cannot leave feedback on non-RESOLVED complaint', async () => {
    const complaint = await store.createComplaint({
      student_id: student1.id,
      title: 'Still in progress issue',
      category: 'cleanliness',
      severity: 'low',
      location: 'Room 204'
    });

    const res = await request(app)
      .post(`/api/complaints/${complaint.id}/feedback`)
      .set('Authorization', `Bearer ${token1}`)
      .send({
        rating: 4,
        comments: 'Wait, not done yet'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/RESOLVED/i);
  });

  // 12. rejects rating outside 1-5
  test('rejects rating outside 1-5', async () => {
    const complaint = await store.createComplaint({
      student_id: student1.id,
      title: 'Resolved issue for rating test',
      category: 'internet',
      severity: 'medium',
      location: 'Room 204'
    });
    await store.acceptComplaint(complaint.id, staff.id);
    await store.startComplaint(complaint.id, staff.id);
    await store.resolveComplaint(complaint.id, staff.id, 'Router reset');

    const res = await request(app)
      .post(`/api/complaints/${complaint.id}/feedback`)
      .set('Authorization', `Bearer ${token1}`)
      .send({
        rating: 10,
        comments: 'Way beyond max rating'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/rating/i);
  });
});
