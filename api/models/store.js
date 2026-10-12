const { query } = require('./db');
const cache = require('./cache');

function getISTDateString(date = new Date()) {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(date.getTime() + istOffset);
  return istDate.toISOString().slice(0, 10);
}

class InMemoryStore {
  constructor() {
    this.users = [];
    this.complaints = [];
    this.feedback = [];
    this.userNextId = 1;
    this.complaintNextId = 1;
    this.feedbackNextId = 1;
    this.cacheMap = new Map();
  }

  reset() {
    this.users = [];
    this.complaints = [];
    this.feedback = [];
    this.userNextId = 1;
    this.complaintNextId = 1;
    this.feedbackNextId = 1;
    this.cacheMap.clear();
  }

  // Users
  async findUserByEmail(email) {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user ? { ...user } : null;
  }

  async findUserById(id) {
    const user = this.users.find(u => u.id === parseInt(id, 10));
    return user ? { ...user } : null;
  }

  async createUser({ name, email, password, role = 'student', room_number = null }) {
    const existing = await this.findUserByEmail(email);
    if (existing) {
      const err = new Error('Email already registered');
      err.code = 'ER_DUP_ENTRY';
      throw err;
    }
    const user = {
      id: this.userNextId++,
      name,
      email: email.toLowerCase(),
      password,
      role,
      room_number: room_number || null,
      created_at: new Date()
    };
    this.users.push(user);
    return { ...user };
  }

  async getAllUsers() {
    return this.users.map(u => {
      const { password: _password, ...safeUser } = u;
      return safeUser;
    });
  }

  async updateUserRole(id, role) {
    const user = this.users.find(u => u.id === parseInt(id, 10));
    if (!user) return null;
    user.role = role;
    return { ...user };
  }

  // Daily token generation (IST)
  async getNextTokenNumberForToday() {
    const todayStr = getISTDateString(new Date());
    const countToday = this.complaints.filter(c => {
      const cDateStr = getISTDateString(new Date(c.created_at));
      return cDateStr === todayStr;
    }).length;
    return countToday + 1;
  }

  // Complaints
  async createComplaint({ student_id, title, description, category, severity, location, photo_url = null }) {
    const token_number = await this.getNextTokenNumberForToday();
    const complaint = {
      id: this.complaintNextId++,
      token_number,
      student_id: parseInt(student_id, 10),
      title,
      description: description || '',
      category,
      severity,
      location,
      photo_url: photo_url || null,
      status: 'RAISED',
      assigned_to: null,
      resolution_notes: null,
      created_at: new Date(),
      accepted_at: null,
      started_at: null,
      resolved_at: null
    };
    this.complaints.push(complaint);
    // Invalidate cache
    await this.deleteCache(`complaint_count:student:${student_id}`);
    return { ...complaint };
  }

  async getComplaintsByStudent(studentId, { status = null, page = 1, limit = 10 } = {}) {
    let filtered = this.complaints.filter(c => c.student_id === parseInt(studentId, 10));
    if (status) {
      filtered = filtered.filter(c => c.status === status);
    }
    // Sort newest first
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      complaints: paginated.map(c => ({ ...c })),
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit) || 1
    };
  }

  async getStudentComplaintCount(studentId) {
    const cacheKey = `complaint_count:student:${studentId}`;
    const cached = await this.getCache(cacheKey);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
    const count = this.complaints.filter(c => c.student_id === parseInt(studentId, 10)).length;
    await this.setCache(cacheKey, count, 300);
    return count;
  }

  async getComplaintById(id) {
    const complaint = this.complaints.find(c => c.id === parseInt(id, 10));
    if (!complaint) return null;
    const student = this.users.find(u => u.id === complaint.student_id);
    const staff = complaint.assigned_to ? this.users.find(u => u.id === complaint.assigned_to) : null;
    return {
      ...complaint,
      student_name: student ? student.name : 'Unknown',
      student_email: student ? student.email : null,
      assigned_staff_name: staff ? staff.name : null
    };
  }

  async cancelComplaint(id, studentId) {
    const complaint = this.complaints.find(c => c.id === parseInt(id, 10));
    if (!complaint) return { error: 'NOT_FOUND' };
    if (complaint.student_id !== parseInt(studentId, 10)) return { error: 'FORBIDDEN' };
    if (complaint.status !== 'RAISED') return { error: 'CANNOT_CANCEL' };

    complaint.status = 'CANCELLED';
    await this.deleteCache(`complaint_count:student:${studentId}`);
    return { ...complaint };
  }

  async getStaffQueue() {
    const severityRank = { critical: 1, high: 2, medium: 3, low: 4 };
    const queue = this.complaints.filter(c => !['RESOLVED', 'CANCELLED'].includes(c.status));

    queue.sort((a, b) => {
      const rankA = severityRank[a.severity] || 5;
      const rankB = severityRank[b.severity] || 5;
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      return new Date(a.created_at) - new Date(b.created_at);
    });

    return queue.map(c => {
      const student = this.users.find(u => u.id === c.student_id);
      return {
        ...c,
        student_name: student ? student.name : 'Unknown'
      };
    });
  }

  async acceptComplaint(id, staffId) {
    const complaint = this.complaints.find(c => c.id === parseInt(id, 10));
    if (!complaint) return { error: 'NOT_FOUND' };
    if (complaint.status !== 'RAISED') return { error: 'INVALID_STATUS' };

    complaint.status = 'ACCEPTED';
    complaint.assigned_to = parseInt(staffId, 10);
    complaint.accepted_at = new Date();
    return { ...complaint };
  }

  async startComplaint(id, _staffId) {
    const complaint = this.complaints.find(c => c.id === parseInt(id, 10));
    if (!complaint) return { error: 'NOT_FOUND' };
    if (complaint.status !== 'ACCEPTED') return { error: 'INVALID_STATUS' };

    complaint.status = 'IN_PROGRESS';
    complaint.started_at = new Date();
    return { ...complaint };
  }

  async resolveComplaint(id, staffId, resolutionNotes) {
    const complaint = this.complaints.find(c => c.id === parseInt(id, 10));
    if (!complaint) return { error: 'NOT_FOUND' };
    if (complaint.status !== 'IN_PROGRESS') return { error: 'INVALID_STATUS' };
    if (!resolutionNotes || !resolutionNotes.trim()) return { error: 'MISSING_NOTES' };

    complaint.status = 'RESOLVED';
    complaint.resolution_notes = resolutionNotes.trim();
    complaint.resolved_at = new Date();
    return { ...complaint };
  }

  async getStaffAssigned(staffId) {
    const list = this.complaints.filter(c => c.assigned_to === parseInt(staffId, 10));
    return list.map(c => {
      const student = this.users.find(u => u.id === c.student_id);
      return {
        ...c,
        student_name: student ? student.name : 'Unknown'
      };
    });
  }

  // Feedback
  async createFeedback({ complaint_id, student_id, rating, comments = '' }) {
    const complaint = this.complaints.find(c => c.id === parseInt(complaint_id, 10));
    if (!complaint) return { error: 'NOT_FOUND' };
    if (complaint.student_id !== parseInt(student_id, 10)) return { error: 'FORBIDDEN' };
    if (complaint.status !== 'RESOLVED') return { error: 'NOT_RESOLVED' };

    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return { error: 'INVALID_RATING' };
    }

    const item = {
      id: this.feedbackNextId++,
      complaint_id: parseInt(complaint_id, 10),
      student_id: parseInt(student_id, 10),
      rating: parsedRating,
      comments: comments || '',
      created_at: new Date()
    };
    this.feedback.push(item);
    return { ...item };
  }

  async getFeedbackByComplaintId(complaintId) {
    const list = this.feedback.filter(f => f.complaint_id === parseInt(complaintId, 10));
    return list.map(f => ({ ...f }));
  }

  // Admin Dashboard
  async getAdminDashboardStats() {
    const todayStr = getISTDateString(new Date());

    const totalToday = this.complaints.filter(c => getISTDateString(new Date(c.created_at)) === todayStr).length;
    const pendingCount = this.complaints.filter(c => !['RESOLVED', 'CANCELLED'].includes(c.status)).length;
    
    const resolvedTodayComplaints = this.complaints.filter(c => 
      c.status === 'RESOLVED' && c.resolved_at && getISTDateString(new Date(c.resolved_at)) === todayStr
    );
    const resolvedCountToday = resolvedTodayComplaints.length;

    let avgResolutionMinutes = 0;
    if (resolvedCountToday > 0) {
      const totalMinutes = resolvedTodayComplaints.reduce((acc, c) => {
        const diff = (new Date(c.resolved_at).getTime() - new Date(c.created_at).getTime()) / (1000 * 60);
        return acc + Math.max(0, diff);
      }, 0);
      avgResolutionMinutes = Math.round(totalMinutes / resolvedCountToday);
    }

    // Complaints by category
    const catMap = {};
    const sevMap = {};
    const locMap = {};
    const hourMap = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));

    this.complaints.forEach(c => {
      catMap[c.category] = (catMap[c.category] || 0) + 1;
      sevMap[c.severity] = (sevMap[c.severity] || 0) + 1;
      locMap[c.location] = (locMap[c.location] || 0) + 1;

      const hour = new Date(c.created_at).getHours();
      if (hourMap[hour]) hourMap[hour].count += 1;
    });

    const complaints_by_category = Object.entries(catMap).map(([category, count]) => ({ category, count }));
    const complaints_by_severity = Object.entries(sevMap).map(([severity, count]) => ({ severity, count }));

    const top_locations = Object.entries(locMap)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Daily trend (last 7 days)
    const daily_trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dStr = getISTDateString(d);
      const raised = this.complaints.filter(c => getISTDateString(new Date(c.created_at)) === dStr).length;
      const resolved = this.complaints.filter(c => c.status === 'RESOLVED' && c.resolved_at && getISTDateString(new Date(c.resolved_at)) === dStr).length;
      daily_trend.push({ date: dStr, raised, resolved });
    }

    return {
      total_complaints: totalToday,
      pending_count: pendingCount,
      resolved_count: resolvedCountToday,
      avg_resolution_minutes: avgResolutionMinutes,
      complaints_by_category,
      complaints_by_severity,
      daily_trend,
      hourly_distribution: hourMap,
      top_locations
    };
  }

  async getStaffPerformance() {
    const staffUsers = this.users.filter(u => u.role === 'staff');
    return staffUsers.map(staff => {
      const assignedComplaints = this.complaints.filter(c => c.assigned_to === staff.id);
      const resolvedComplaints = assignedComplaints.filter(c => c.status === 'RESOLVED' && c.resolved_at);

      let avg_resolution_time = 0;
      if (resolvedComplaints.length > 0) {
        const totalMin = resolvedComplaints.reduce((acc, c) => {
          const diff = (new Date(c.resolved_at).getTime() - new Date(c.created_at).getTime()) / (1000 * 60);
          return acc + Math.max(0, diff);
        }, 0);
        avg_resolution_time = Math.round(totalMin / resolvedComplaints.length);
      }

      return {
        staff_id: staff.id,
        name: staff.name,
        assigned: assignedComplaints.length,
        resolved: resolvedComplaints.length,
        avg_resolution_time
      };
    });
  }

  // Cache mock
  async getCache(key) {
    return this.cacheMap.has(key) ? this.cacheMap.get(key) : null;
  }

  async setCache(key, value) {
    this.cacheMap.set(key, value);
  }

  async deleteCache(key) {
    this.cacheMap.delete(key);
  }

  async checkHealth() {
    return true;
  }
}

class SqlStore {
  async findUserByEmail(email) {
    const rows = await query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
    return rows && rows.length > 0 ? rows[0] : null;
  }

  async findUserById(id) {
    const rows = await query('SELECT * FROM users WHERE id = ?', [id]);
    return rows && rows.length > 0 ? rows[0] : null;
  }

  async createUser({ name, email, password, role = 'student', room_number = null }) {
    const res = await query(
      'INSERT INTO users (name, email, password, role, room_number) VALUES (?, ?, ?, ?, ?)',
      [name, email.toLowerCase(), password, role, room_number]
    );
    return {
      id: res.insertId,
      name,
      email: email.toLowerCase(),
      role,
      room_number
    };
  }

  async getAllUsers() {
    return await query('SELECT id, name, email, role, room_number, created_at FROM users ORDER BY id ASC');
  }

  async updateUserRole(id, role) {
    await query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return await this.findUserById(id);
  }

  async getNextTokenNumberForToday() {
    const todayStr = getISTDateString(new Date());
    const rows = await query(
      'SELECT COUNT(*) as count FROM complaints WHERE DATE(CONVERT_TZ(created_at, "+00:00", "+05:30")) = ?',
      [todayStr]
    );
    const count = rows && rows[0] ? parseInt(rows[0].count, 10) : 0;
    return count + 1;
  }

  async createComplaint({ student_id, title, description, category, severity, location, photo_url = null }) {
    const token_number = await this.getNextTokenNumberForToday();
    const res = await query(
      `INSERT INTO complaints 
       (token_number, student_id, title, description, category, severity, location, photo_url, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'RAISED')`,
      [token_number, student_id, title, description, category, severity, location, photo_url]
    );
    await cache.deleteCache(`complaint_count:student:${student_id}`);
    return await this.getComplaintById(res.insertId);
  }

  async getComplaintsByStudent(studentId, { status = null, page = 1, limit = 10 } = {}) {
    let sql = 'SELECT * FROM complaints WHERE student_id = ?';
    const params = [studentId];
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const offset = (page - 1) * limit;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const complaints = await query(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM complaints WHERE student_id = ?';
    const countParams = [studentId];
    if (status) {
      countSql += ' AND status = ?';
      countParams.push(status);
    }
    const countRows = await query(countSql, countParams);
    const total = countRows && countRows[0] ? parseInt(countRows[0].total, 10) : 0;

    return {
      complaints,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit) || 1
    };
  }

  async getStudentComplaintCount(studentId) {
    const cacheKey = `complaint_count:student:${studentId}`;
    const cached = await cache.getCache(cacheKey);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
    const rows = await query('SELECT COUNT(*) as total FROM complaints WHERE student_id = ?', [studentId]);
    const count = rows && rows[0] ? parseInt(rows[0].total, 10) : 0;
    await cache.setCache(cacheKey, count, 300);
    return count;
  }

  async getComplaintById(id) {
    const sql = `
      SELECT c.*, u.name as student_name, u.email as student_email, s.name as assigned_staff_name
      FROM complaints c
      LEFT JOIN users u ON c.student_id = u.id
      LEFT JOIN users s ON c.assigned_to = s.id
      WHERE c.id = ?
    `;
    const rows = await query(sql, [id]);
    return rows && rows.length > 0 ? rows[0] : null;
  }

  async cancelComplaint(id, studentId) {
    const complaint = await this.getComplaintById(id);
    if (!complaint) return { error: 'NOT_FOUND' };
    if (complaint.student_id !== parseInt(studentId, 10)) return { error: 'FORBIDDEN' };
    if (complaint.status !== 'RAISED') return { error: 'CANNOT_CANCEL' };

    await query('UPDATE complaints SET status = "CANCELLED" WHERE id = ?', [id]);
    await cache.deleteCache(`complaint_count:student:${studentId}`);
    return await this.getComplaintById(id);
  }

  async getStaffQueue() {
    const sql = `
      SELECT c.*, u.name as student_name
      FROM complaints c
      LEFT JOIN users u ON c.student_id = u.id
      WHERE c.status NOT IN ('RESOLVED', 'CANCELLED')
      ORDER BY 
        CASE c.severity
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
          ELSE 5
        END ASC,
        c.created_at ASC
    `;
    return await query(sql);
  }

  async acceptComplaint(id, staffId) {
    const complaint = await this.getComplaintById(id);
    if (!complaint) return { error: 'NOT_FOUND' };
    if (complaint.status !== 'RAISED') return { error: 'INVALID_STATUS' };

    await query('UPDATE complaints SET status = "ACCEPTED", assigned_to = ?, accepted_at = NOW() WHERE id = ?', [
      staffId,
      id
    ]);
    return await this.getComplaintById(id);
  }

  async startComplaint(id, _staffId) {
    const complaint = await this.getComplaintById(id);
    if (!complaint) return { error: 'NOT_FOUND' };
    if (complaint.status !== 'ACCEPTED') return { error: 'INVALID_STATUS' };

    await query('UPDATE complaints SET status = "IN_PROGRESS", started_at = NOW() WHERE id = ?', [id]);
    return await this.getComplaintById(id);
  }

  async resolveComplaint(id, staffId, resolutionNotes) {
    const complaint = await this.getComplaintById(id);
    if (!complaint) return { error: 'NOT_FOUND' };
    if (complaint.status !== 'IN_PROGRESS') return { error: 'INVALID_STATUS' };
    if (!resolutionNotes || !resolutionNotes.trim()) return { error: 'MISSING_NOTES' };

    await query(
      'UPDATE complaints SET status = "RESOLVED", resolution_notes = ?, resolved_at = NOW() WHERE id = ?',
      [resolutionNotes.trim(), id]
    );
    return await this.getComplaintById(id);
  }

  async getStaffAssigned(staffId) {
    const sql = `
      SELECT c.*, u.name as student_name
      FROM complaints c
      LEFT JOIN users u ON c.student_id = u.id
      WHERE c.assigned_to = ?
      ORDER BY c.created_at DESC
    `;
    return await query(sql, [staffId]);
  }

  async createFeedback({ complaint_id, student_id, rating, comments = '' }) {
    const complaint = await this.getComplaintById(complaint_id);
    if (!complaint) return { error: 'NOT_FOUND' };
    if (complaint.student_id !== parseInt(student_id, 10)) return { error: 'FORBIDDEN' };
    if (complaint.status !== 'RESOLVED') return { error: 'NOT_RESOLVED' };

    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return { error: 'INVALID_RATING' };
    }

    const res = await query(
      'INSERT INTO feedback (complaint_id, student_id, rating, comments) VALUES (?, ?, ?, ?)',
      [complaint_id, student_id, parsedRating, comments || '']
    );
    return {
      id: res.insertId,
      complaint_id: parseInt(complaint_id, 10),
      student_id: parseInt(student_id, 10),
      rating: parsedRating,
      comments: comments || ''
    };
  }

  async getFeedbackByComplaintId(complaintId) {
    return await query('SELECT * FROM feedback WHERE complaint_id = ?', [complaintId]);
  }

  async getAdminDashboardStats() {
    const todayStr = getISTDateString(new Date());

    const totalTodayRes = await query(
      'SELECT COUNT(*) as count FROM complaints WHERE DATE(CONVERT_TZ(created_at, "+00:00", "+05:30")) = ?',
      [todayStr]
    );
    const total_complaints = totalTodayRes[0] ? parseInt(totalTodayRes[0].count, 10) : 0;

    const pendingRes = await query(
      'SELECT COUNT(*) as count FROM complaints WHERE status NOT IN ("RESOLVED", "CANCELLED")'
    );
    const pending_count = pendingRes[0] ? parseInt(pendingRes[0].count, 10) : 0;

    const resolvedTodayRes = await query(
      'SELECT COUNT(*) as count, AVG(TIMESTAMPDIFF(MINUTE, created_at, resolved_at)) as avg_min FROM complaints WHERE status = "RESOLVED" AND DATE(CONVERT_TZ(resolved_at, "+00:00", "+05:30")) = ?',
      [todayStr]
    );
    const resolved_count = resolvedTodayRes[0] ? parseInt(resolvedTodayRes[0].count, 10) : 0;
    const avg_resolution_minutes = resolvedTodayRes[0] && resolvedTodayRes[0].avg_min ? Math.round(resolvedTodayRes[0].avg_min) : 0;

    const catRows = await query('SELECT category, COUNT(*) as count FROM complaints GROUP BY category');
    const sevRows = await query('SELECT severity, COUNT(*) as count FROM complaints GROUP BY severity');
    const topLocRows = await query('SELECT location, COUNT(*) as count FROM complaints GROUP BY location ORDER BY count DESC LIMIT 5');

    const hourlyMap = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    const hourlyRows = await query('SELECT HOUR(created_at) as hour, COUNT(*) as count FROM complaints GROUP BY HOUR(created_at)');
    hourlyRows.forEach(r => {
      const h = parseInt(r.hour, 10);
      if (hourlyMap[h]) hourlyMap[h].count = parseInt(r.count, 10);
    });

    const daily_trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dStr = getISTDateString(d);
      const raisedRes = await query('SELECT COUNT(*) as count FROM complaints WHERE DATE(CONVERT_TZ(created_at, "+00:00", "+05:30")) = ?', [dStr]);
      const resolvedRes = await query('SELECT COUNT(*) as count FROM complaints WHERE status = "RESOLVED" AND DATE(CONVERT_TZ(resolved_at, "+00:00", "+05:30")) = ?', [dStr]);
      daily_trend.push({
        date: dStr,
        raised: raisedRes[0] ? parseInt(raisedRes[0].count, 10) : 0,
        resolved: resolvedRes[0] ? parseInt(resolvedRes[0].count, 10) : 0
      });
    }

    return {
      total_complaints,
      pending_count,
      resolved_count,
      avg_resolution_minutes,
      complaints_by_category: catRows,
      complaints_by_severity: sevRows,
      daily_trend,
      hourly_distribution: hourlyMap,
      top_locations: topLocRows
    };
  }

  async getStaffPerformance() {
    const sql = `
      SELECT 
        u.id as staff_id, 
        u.name,
        COUNT(c.id) as assigned,
        SUM(CASE WHEN c.status = 'RESOLVED' THEN 1 ELSE 0 END) as resolved,
        COALESCE(AVG(CASE WHEN c.status = 'RESOLVED' THEN TIMESTAMPDIFF(MINUTE, c.created_at, c.resolved_at) ELSE NULL END), 0) as avg_resolution_time
      FROM users u
      LEFT JOIN complaints c ON u.id = c.assigned_to
      WHERE u.role = 'staff'
      GROUP BY u.id, u.name
    `;
    const rows = await query(sql);
    return rows.map(r => ({
      staff_id: r.staff_id,
      name: r.name,
      assigned: parseInt(r.assigned, 10) || 0,
      resolved: parseInt(r.resolved, 10) || 0,
      avg_resolution_time: Math.round(r.avg_resolution_time || 0)
    }));
  }

  async checkHealth() {
    try {
      await query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = {
  InMemoryStore,
  SqlStore,
  getISTDateString
};
