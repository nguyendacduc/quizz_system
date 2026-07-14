const db = require('../config/db');
async function getRoomInfo(room_id) {
    const [rooms] = await db.query('SELECT room_name, room_code, teacher_id, status, start_time, end_time FROM exam_rooms WHERE room_id = ?', [room_id]);
    return rooms[0] || null;
}

async function getLiveRoomMonitor(room_id) {
    const [rows] = await db.query(`
        SELECT rs.student_id, s.student_code, s.full_name, 
               COALESCE(ea.status, 'NOT_STARTED') as attempt_status,
               ea.start_time, ea.submit_time, ea.score
        FROM room_students rs
        JOIN students s ON rs.student_id = s.student_id
        LEFT JOIN exam_attempts ea ON rs.student_id = ea.student_id AND rs.room_id = ea.room_id
        WHERE rs.room_id = ? AND rs.status = 'APPROVED'
    `, [room_id]);
    return rows;
}

async function getRooms(teacher_id) {
    let query = `
        SELECT r.*, e.exam_code, e.exam_name 
        FROM exam_rooms r
        JOIN exams e ON r.exam_id = e.exam_id
    `;
    const params = [];
    
    if (teacher_id) {
        query += ' WHERE r.teacher_id = ?';
        params.push(teacher_id);
    }
    query += ' ORDER BY r.created_at DESC';

    const [rows] = await db.query(query, params);
    
    const now = new Date();
    for (let r of rows) {
        if (r.end_time && now > new Date(r.end_time) && r.status !== 'FINISHED' && r.status !== 'CANCELLED') {
            await db.query('UPDATE exam_rooms SET status = "FINISHED" WHERE room_id = ?', [r.room_id]);
            r.status = 'FINISHED';
        }
    }

    return rows;
}

async function createRoom(data) {
    const [result] = await db.query(
        `INSERT INTO exam_rooms (room_code, room_name, exam_id, teacher_id, room_password, max_students, start_time, end_time, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'WAITING')`,
        [data.room_code, data.room_name, data.exam_id, data.teacher_id, data.room_password, data.max_students, data.start_time, data.end_time]
    );
    return result.insertId;
}

async function updateRoomStatus(room_id, status) {
    await db.query('UPDATE exam_rooms SET status = ? WHERE room_id = ?', [status, room_id]);
}

async function getRoomStudents(room_id, status = null) {
    let query = `
        SELECT rs.room_student_id, rs.status, rs.join_time, s.student_id, s.student_code, s.full_name, c.class_name
        FROM room_students rs
        JOIN students s ON rs.student_id = s.student_id
        JOIN classes c ON s.class_id = c.class_id
        WHERE rs.room_id = ?
    `;
    const params = [room_id];

    if (status) {
        query += ' AND rs.status = ?';
        params.push(status);
    }

    const [rows] = await db.query(query, params);
    return rows;
}

async function updateStudentStatus(room_id, student_id, status) {
    await db.query(
        'UPDATE room_students SET status = ? WHERE room_id = ? AND student_id = ?', 
        [status, room_id, student_id]
    );
}

async function getAllUserIds() {
    const [rows] = await db.query('SELECT user_id FROM users');
    return rows.map(r => r.user_id);
}

module.exports = {
    getRooms, createRoom, updateRoomStatus, getRoomStudents, updateStudentStatus, getRoomInfo, getLiveRoomMonitor,
    getAllUserIds
};