#!/usr/bin/env node
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query, initDbSchema, getPool } = require('../models/db');

async function seed() {
  console.log('--- Starting FixMyHostel Database Seeding ---');
  try {
    await initDbSchema();
    console.log('Database tables ensured.');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const teamMembers = [
      {
        name: 'Mayank Heda',
        email: 'mayank@fixmyhostel.com',
        password: hashedPassword,
        role: 'warden',
        room_number: 'W-101'
      },
      {
        name: 'Ishita Gurbaxani',
        email: 'ishita@fixmyhostel.com',
        password: hashedPassword,
        role: 'student',
        room_number: 'B-204'
      },
      {
        name: 'Bhavisha Kewalramani',
        email: 'bhavisha@fixmyhostel.com',
        password: hashedPassword,
        role: 'staff',
        room_number: 'Staff-Room-1'
      }
    ];

    const userMap = {};

    for (const member of teamMembers) {
      const existing = await query('SELECT id, email, role FROM users WHERE LOWER(email) = LOWER(?)', [member.email]);
      if (existing.length > 0) {
        userMap[member.role] = existing[0].id;
        console.log(`User already exists: ${member.name} (${member.role}) with ID ${existing[0].id}`);
      } else {
        const res = await query(
          'INSERT INTO users (name, email, password, role, room_number) VALUES (?, ?, ?, ?, ?)',
          [member.name, member.email.toLowerCase(), member.password, member.role, member.room_number]
        );
        userMap[member.role] = res.insertId;
        console.log(`Created user: ${member.name} (${member.role}) with ID ${res.insertId}`);
      }
    }

    const studentId = userMap.student;
    const staffId = userMap.staff;

    // Check if complaints already exist for Ishita
    const existingComplaints = await query('SELECT COUNT(*) as count FROM complaints WHERE student_id = ?', [studentId]);
    if (existingComplaints[0].count >= 10) {
      console.log(`Found ${existingComplaints[0].count} existing complaints for Ishita. Skipping sample complaint creation.`);
    } else {
      console.log('Seeding 10 sample complaints for student Ishita Gurbaxani...');

      const sampleComplaints = [
        {
          token_number: 1,
          title: 'Leaking bathroom tap in B-204',
          description: 'Tap is dripping constantly since yesterday, wasting water.',
          category: 'plumbing',
          severity: 'medium',
          location: 'Room B-204 Bathroom',
          status: 'RESOLVED',
          assigned_to: staffId,
          resolution_notes: 'Replaced tap washer and tight seal. Leak stopped completely.'
        },
        {
          token_number: 2,
          title: 'Tube light flickering violently',
          description: 'Main room light flickers and makes buzzing sound.',
          category: 'electrical',
          severity: 'high',
          location: 'Room B-204 Main Area',
          status: 'RESOLVED',
          assigned_to: staffId,
          resolution_notes: 'Replaced choke and LED tube light.'
        },
        {
          token_number: 3,
          title: 'Wi-Fi router down on 2nd floor',
          description: 'No internet access on 2nd floor hostel wing for past 4 hours.',
          category: 'internet',
          severity: 'critical',
          location: 'Floor 2 Corridor Access Point',
          status: 'IN_PROGRESS',
          assigned_to: staffId,
          resolution_notes: null
        },
        {
          token_number: 4,
          title: 'Broken study chair wheel',
          description: 'One castor wheel of the study chair is broken.',
          category: 'furniture',
          severity: 'low',
          location: 'Room B-204 Study Table',
          status: 'ACCEPTED',
          assigned_to: staffId,
          resolution_notes: null
        },
        {
          token_number: 5,
          title: 'Corridor dustbin overflowing',
          description: 'Garbage has not been collected since morning.',
          category: 'cleanliness',
          severity: 'medium',
          location: '2nd Floor West Wing',
          status: 'RAISED',
          assigned_to: null,
          resolution_notes: null
        },
        {
          token_number: 6,
          title: 'AC power socket sparking',
          description: 'Spark observed when plugging in adapter. Potential hazard!',
          category: 'electrical',
          severity: 'critical',
          location: 'Room B-204 Wall Socket',
          status: 'RAISED',
          assigned_to: null,
          resolution_notes: null
        },
        {
          token_number: 7,
          title: 'Water cooler dispensing warm water',
          description: '2nd floor cooler chilling unit seems turned off or faulty.',
          category: 'other',
          severity: 'medium',
          location: '2nd Floor Drinking Water Cooler',
          status: 'ACCEPTED',
          assigned_to: staffId,
          resolution_notes: null
        },
        {
          token_number: 8,
          title: 'Washroom flush valve stuck',
          description: 'Flush valve stays open and overflows.',
          category: 'plumbing',
          severity: 'high',
          location: 'Floor 2 Common Washroom 3',
          status: 'IN_PROGRESS',
          assigned_to: staffId,
          resolution_notes: null
        },
        {
          token_number: 9,
          title: 'Almirah door hinge loose',
          description: 'Wardrobe door sagging and not closing properly.',
          category: 'furniture',
          severity: 'low',
          location: 'Room B-204 Wardrobe',
          status: 'RAISED',
          assigned_to: null,
          resolution_notes: null
        },
        {
          token_number: 10,
          title: 'Frequent Wi-Fi packet drops in evening',
          description: 'Ping spikes and DNS resolution timeouts during study hours.',
          category: 'internet',
          severity: 'medium',
          location: 'Room B-204',
          status: 'RAISED',
          assigned_to: null,
          resolution_notes: null
        }
      ];

      for (const item of sampleComplaints) {
        const res = await query(
          `INSERT INTO complaints 
           (token_number, student_id, title, description, category, severity, location, status, assigned_to, resolution_notes, raised_at, accepted_at, started_at, resolved_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW() - INTERVAL FLOOR(RAND() * 5) DAY, 
                   IF(? = 'RAISED', NULL, NOW() - INTERVAL 2 HOUR), 
                   IF(? IN ('IN_PROGRESS', 'RESOLVED'), NOW() - INTERVAL 1 HOUR, NULL), 
                   IF(? = 'RESOLVED', NOW() - INTERVAL 10 MINUTE, NULL))`,
          [
            item.token_number,
            studentId,
            item.title,
            item.description,
            item.category,
            item.severity,
            item.location,
            item.status,
            item.assigned_to,
            item.resolution_notes,
            item.status,
            item.status,
            item.status
          ]
        );

        if (item.status === 'RESOLVED') {
          // Add sample feedback
          await query(
            'INSERT INTO feedback (complaint_id, student_id, rating, comment) VALUES (?, ?, ?, ?)',
            [res.insertId, studentId, 5, 'Quick resolution! Works perfectly now.']
          );
        }
      }
      console.log('Seeded 10 sample complaints with feedback.');
    }

    console.log('--- Database seeding completed successfully! ---');
    const pool = getPool();
    if (pool) await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
