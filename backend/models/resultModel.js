const db = require('../config/db');

async function getStudentHistory(student_id) {
    const [rows] = await db.query(`
        SELECT ea.attempt_id, ea.score, ea.correct_answers, ea.total_questions, ea.duration_seconds, ea.submit_time,
               e.exam_code, e.exam_name, r.room_code, r.room_name
        FROM exam_attempts ea
        JOIN exams e ON ea.exam_id = e.exam_id
        JOIN exam_rooms r ON ea.room_id = r.room_id
        WHERE ea.student_id = ? AND ea.status = 'SUBMITTED'
        ORDER BY ea.submit_time DESC
    `, [student_id]);
    return rows;
}

async function getRoomScoreboard(room_id) {
    const [rows] = await db.query(`
        SELECT ea.attempt_id, s.student_code, s.full_name, c.class_name,
               ea.score, ea.correct_answers, ea.total_questions, ea.duration_seconds, ea.submit_time
        FROM exam_attempts ea
        JOIN students s ON ea.student_id = s.student_id
        JOIN classes c ON s.class_id = c.class_id
        WHERE ea.room_id = ? AND ea.status = 'SUBMITTED'
        ORDER BY ea.score DESC, ea.duration_seconds ASC
    `, [room_id]);
    return rows;
}

module.exports = {
    getStudentHistory,
    getRoomScoreboard
};