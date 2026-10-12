const { app, request, store, resetStore, createTestUser, getAuthToken } = require('./setup');

describe('Staff API Tests (8 tests)', () => {
  let student, studentToken;
  let staff, staffToken;

  beforeEach(async () => {
    resetStore();
    student = await createTestUser('student', { email: 'student@test.com' });
    studentToken = getAuthToken(student);

    staff = await createTestUser('staff', { email: 'staff@test.com' });
    staffToken = getAuthToken(staff);
  });

  // 1. staff sees queue sorted by severity then date
  test('staff sees queue sorted by severity then date', async () => {
    // Create low severity first
    const cLow = await store.createComplaint({
      student_id: student.id,
      title: 'Low priority paint peel',
      category: 'other',
      severity: 'low',
      location: 'Hallway'
    });

    // Create critical severity second
    const cCrit = await store.createComplaint({
      student_id: student.id,
      title: 'Critical electric spark',
      category: 'electrical',
      severity: 'critical',
      location: 'Main Switch'
    });

    // Create high severity third
    const cHigh = await store.createComplaint({
      student_id: student.id,
      title: 'High priority pipe burst',
      category: 'plumbing',
      severity: 'high',
      location: 'Bathroom 1'
    });

    const res = await request(app)
      .get('/api/staff/queue')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    // Severity order: critical -> high -> low
    expect(res.body[0].id).toBe(cCrit.id);
    expect(res.body[1].id).toBe(cHigh.id);
    expect(res.body[2].id).toBe(cLow.id);
    expect(res.body[0]).toHaveProperty('student_name');
  });

  // 2. staff can accept a RAISED complaint
  test('staff can accept a RAISED complaint', async () => {
    const complaint = await store.createComplaint({
      student_id: student.id,
      title: 'AC not cooling',
      category: 'electrical',
      severity: 'medium',
      location: 'Room 101'
    });

    const res = await request(app)
      .patch(`/api/staff/${complaint.id}/accept`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.complaint.status).toBe('ACCEPTED');
    expect(res.body.complaint.assigned_to).toBe(staff.id);
  });

  // 3. staff cannot accept already ACCEPTED complaint
  test('staff cannot accept already ACCEPTED complaint', async () => {
    const complaint = await store.createComplaint({
      student_id: student.id,
      title: 'Already accepted task',
      category: 'plumbing',
      severity: 'low',
      location: 'Room 101'
    });
    await store.acceptComplaint(complaint.id, staff.id);

    const res = await request(app)
      .patch(`/api/staff/${complaint.id}/accept`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/RAISED/i);
  });

  // 4. staff can start an ACCEPTED complaint
  test('staff can start an ACCEPTED complaint', async () => {
    const complaint = await store.createComplaint({
      student_id: student.id,
      title: 'Start task',
      category: 'furniture',
      severity: 'low',
      location: 'Room 101'
    });
    await store.acceptComplaint(complaint.id, staff.id);

    const res = await request(app)
      .patch(`/api/staff/${complaint.id}/start`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.complaint.status).toBe('IN_PROGRESS');
  });

  // 5. staff can resolve an IN_PROGRESS complaint with notes
  test('staff can resolve an IN_PROGRESS complaint with notes', async () => {
    const complaint = await store.createComplaint({
      student_id: student.id,
      title: 'To resolve',
      category: 'internet',
      severity: 'high',
      location: 'Room 101'
    });
    await store.acceptComplaint(complaint.id, staff.id);
    await store.startComplaint(complaint.id, staff.id);

    const res = await request(app)
      .patch(`/api/staff/${complaint.id}/resolve`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        resolution_notes: 'Replaced faulty RJ45 connector and reconnected cable.'
      });

    expect(res.status).toBe(200);
    expect(res.body.complaint.status).toBe('RESOLVED');
    expect(res.body.complaint.resolution_notes).toBe('Replaced faulty RJ45 connector and reconnected cable.');
    expect(res.body.complaint.resolved_at).toBeDefined();
  });

  // 6. staff cannot resolve without notes
  test('staff cannot resolve without notes', async () => {
    const complaint = await store.createComplaint({
      student_id: student.id,
      title: 'Missing notes case',
      category: 'cleanliness',
      severity: 'medium',
      location: 'Room 101'
    });
    await store.acceptComplaint(complaint.id, staff.id);
    await store.startComplaint(complaint.id, staff.id);

    const res = await request(app)
      .patch(`/api/staff/${complaint.id}/resolve`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        resolution_notes: ''
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/notes/i);
  });

  // 7. staff sees their assigned complaints
  test('staff sees their assigned complaints', async () => {
    const complaint = await store.createComplaint({
      student_id: student.id,
      title: 'Assigned complaint item',
      category: 'furniture',
      severity: 'medium',
      location: 'Room 101'
    });
    await store.acceptComplaint(complaint.id, staff.id);

    const res = await request(app)
      .get('/api/staff/my-assigned')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(complaint.id);
  });

  // 8. student cannot access staff endpoints (403)
  test('student cannot access staff endpoints (403)', async () => {
    const res = await request(app)
      .get('/api/staff/queue')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/forbidden|denied/i);
  });
});
