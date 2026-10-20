const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const bcrypt = require('bcrypt');
const db = require('./config/db');

async function ensureSchema() {
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    const statements = sql
        .split(';')
        .map(part => part.trim())
        .filter(part => part && !part.startsWith('--'))
        .filter(part => !/^CREATE DATABASE\b/i.test(part) && !/^USE\b/i.test(part));
    for (const statement of statements) {
        await db.query(statement);
    }
}

async function clearDemoData() {
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('DELETE FROM leave_requests');
    await db.query('DELETE FROM visitors');
    await db.query('DELETE FROM complaints');
    await db.query('DELETE FROM fees');
    await db.query('DELETE FROM notices');
    await db.query('UPDATE students SET room_id = NULL, bed_label = NULL');
    await db.query('DELETE FROM students');
    await db.query("DELETE FROM users WHERE role = 'student'");
    await db.query('DELETE FROM rooms');
    await db.query("DELETE FROM users WHERE email <> 'admin@hostelhub.com'");
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
}

async function upsertAdmin(passwordHash) {
    const email = 'admin@hostelhub.com';
    const [rows] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (rows[0]) {
        await db.query('UPDATE users SET password_hash = ?, role = ? WHERE email = ?', [passwordHash, 'admin', email]);
        return rows[0].user_id;
    }
    const [result] = await db.query('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [email, passwordHash, 'admin']);
    return result.insertId;
}

async function createStudent(connection, student, passwordHash) {
    const [userResult] = await connection.query('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [student.email, passwordHash, 'student']);
    const [studentResult] = await connection.query(`INSERT INTO students
        (user_id, enrollment_no, name, phone, course, semester, department, dob, address, emergency_contact, room_id, bed_label)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        userResult.insertId,
        student.enrollment_no,
        student.name,
        student.phone,
        student.course,
        student.semester,
        student.department,
        student.dob,
        student.address,
        student.emergency_contact,
        student.room_id || null,
        student.bed_label || null
    ]);
    return studentResult.insertId;
}

async function seedDemo() {
    const connection = await db.getConnection();
    try {
        await ensureSchema();
        await clearDemoData();

        const adminHash = await bcrypt.hash('admin123', 10);
        const studentHash = await bcrypt.hash('student123', 10);
        await upsertAdmin(adminHash);

        await connection.beginTransaction();

        const rooms = [
            { room_number: '101', block: 'A', floor: 1, capacity: 2, occupied: 0 },
            { room_number: '102', block: 'A', floor: 1, capacity: 2, occupied: 0 },
            { room_number: '201', block: 'B', floor: 2, capacity: 3, occupied: 0 },
            { room_number: '202', block: 'B', floor: 2, capacity: 3, occupied: 0 }
        ];
        const roomIds = {};
        for (const room of rooms) {
            const [result] = await connection.query('INSERT INTO rooms (room_number, block, floor, capacity, occupied) VALUES (?, ?, ?, ?, ?)', [
                room.room_number, room.block, room.floor, room.capacity, room.occupied
            ]);
            roomIds[`${room.block}-${room.room_number}`] = result.insertId;
        }

        const students = [
            {
                email: 'alice@student.com',
                enrollment_no: 'EN2024001',
                name: 'Alice Sharma',
                phone: '9876543210',
                course: 'B.Tech CSE',
                semester: 5,
                department: 'Computer Science',
                dob: '2004-03-12',
                address: 'Jaipur, Rajasthan',
                emergency_contact: '9876500001',
                room_id: roomIds['A-101'],
                bed_label: 'A1'
            },
            {
                email: 'bob@student.com',
                enrollment_no: 'EN2024002',
                name: 'Bob Verma',
                phone: '9876543211',
                course: 'B.Tech ECE',
                semester: 5,
                department: 'Electronics',
                dob: '2004-07-20',
                address: 'Delhi',
                emergency_contact: '9876500002',
                room_id: roomIds['A-101'],
                bed_label: 'A2'
            },
            {
                email: 'carol@student.com',
                enrollment_no: 'EN2024003',
                name: 'Carol Singh',
                phone: '9876543212',
                course: 'B.Tech ME',
                semester: 3,
                department: 'Mechanical',
                dob: '2005-01-05',
                address: 'Pune, Maharashtra',
                emergency_contact: '9876500003',
                room_id: roomIds['B-201'],
                bed_label: 'B1'
            },
            {
                email: 'david@student.com',
                enrollment_no: 'EN2024004',
                name: 'David Patel',
                phone: '9876543213',
                course: 'B.Tech IT',
                semester: 7,
                department: 'Information Technology',
                dob: '2003-11-18',
                address: 'Ahmedabad, Gujarat',
                emergency_contact: '9876500004',
                room_id: null,
                bed_label: null
            }
        ];

        const studentIds = {};
        for (const student of students) {
            const studentId = await createStudent(connection, student, studentHash);
            studentIds[student.email] = studentId;
            if (student.room_id) {
                await connection.query('UPDATE rooms SET occupied = occupied + 1 WHERE room_id = ?', [student.room_id]);
            }
        }

        await connection.query(`INSERT INTO leave_requests (student_id, leave_type, from_date, to_date, reason, status, admin_comment) VALUES
            (?, 'Home Leave', DATE_ADD(CURDATE(), INTERVAL 2 DAY), DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Family function at home.', 'Pending', NULL),
            (?, 'Outing', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Medical appointment in city.', 'Pending', NULL),
            (?, 'Home Leave', DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'Visited parents.', 'Approved', 'Approved. Travel safely.'),
            (?, 'Outing', DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Bank work.', 'Rejected', 'Insufficient notice given.')`, [
            studentIds['alice@student.com'],
            studentIds['bob@student.com'],
            studentIds['carol@student.com'],
            studentIds['david@student.com']
        ]);

        await connection.query(`INSERT INTO visitors (student_id, visitor_name, relation, phone, visit_date, visit_time, status) VALUES
            (?, 'Ramesh Sharma', 'Father', '9123456701', CURDATE(), '10:30:00', 'Pending'),
            (?, 'Sunita Verma', 'Mother', '9123456702', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '16:00:00', 'Pending'),
            (?, 'Anita Singh', 'Sister', '9123456703', DATE_SUB(CURDATE(), INTERVAL 2 DAY), '11:00:00', 'Approved'),
            (?, 'Admin Walk-in Guest', 'Uncle', '9123456704', CURDATE(), '14:15:00', 'Approved')`, [
            studentIds['alice@student.com'],
            studentIds['bob@student.com'],
            studentIds['carol@student.com'],
            studentIds['alice@student.com']
        ]);

        await connection.query(`INSERT INTO complaints (student_id, room_id, category, description, status) VALUES
            (?, ?, 'Electrical', 'Ceiling fan in room is not working.', 'Pending'),
            (?, ?, 'Plumbing', 'Washbasin tap is leaking.', 'In Progress'),
            (?, ?, 'Wi-Fi', 'Internet disconnects frequently on floor 2.', 'Resolved'),
            (?, NULL, 'Other', 'Mess timing clarification needed.', 'Pending')`, [
            studentIds['alice@student.com'], roomIds['A-101'],
            studentIds['bob@student.com'], roomIds['A-101'],
            studentIds['carol@student.com'], roomIds['B-201'],
            studentIds['david@student.com']
        ]);

        await connection.query(`INSERT INTO fees (student_id, amount, paid) VALUES
            (?, 45000, 45000),
            (?, 45000, 20000),
            (?, 42000, 0),
            (?, 48000, 48000)`, [
            studentIds['alice@student.com'],
            studentIds['bob@student.com'],
            studentIds['carol@student.com'],
            studentIds['david@student.com']
        ]);

        await connection.query(`INSERT INTO notices (title, description) VALUES
            ('Hostel Timings', 'Gate closes at 9:30 PM on weekdays and 10:30 PM on weekends.'),
            ('Fee Reminder', 'Pending hostel fees must be cleared before the 15th of this month.'),
            ('Visitor Policy', 'All visitors must carry valid ID and be registered before entry.')`);

        await connection.commit();

        console.log('Demo data seeded successfully.');
        console.log('');
        console.log('Admin login: admin@hostelhub.com / admin123');
        console.log('Student logins (password for all: student123):');
        students.forEach(student => console.log(`  - ${student.email}`));
        console.log('');
        console.log('Try: student submits leave -> admin approves in Leaves tab.');
        console.log('Try: admin adds visitor in Visitors -> Add Visitor.');
        process.exit(0);
    } catch (error) {
        await connection.rollback();
        console.error('Seed failed:', error);
        process.exit(1);
    } finally {
        connection.release();
    }
}

seedDemo();
