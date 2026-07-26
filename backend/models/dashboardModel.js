const db = require('../config/db');

async function getAdminOverview() {
    const [users] = await db.query('SELECT COUNT(*) as total FROM users');
    const [students] = await db.query('SELECT COUNT(*) as total FROM students');
    const [teachers] = await db.query('SELECT COUNT(*) as total FROM teachers');
    const [questions] = await db.query('SELECT COUNT(*) as total FROM questions');
    const [exams] = await db.query('SELECT COUNT(*) as total FROM exams');

    return {
        total_users: users[0].total,
        total_students: students[0].total,
        total_teachers: teachers[0].total,
        total_questions: questions[0].total,
        total_exams: exams[0].total
    };
}

async function getTeacherOverview(teacher_id) {
    const [questions] = await db.query('SELECT COUNT(*) as total FROM questions WHERE teacher_id = ?', [teacher_id]);
    const [exams] = await db.query('SELECT COUNT(*) as total FROM exams WHERE teacher_id = ?', [teacher_id]);
    const [rooms] = await db.query('SELECT COUNT(*) as total FROM exam_rooms WHERE teacher_id = ?', [teacher_id]);

    return {
        my_questions: questions[0].total,
        my_exams: exams[0].total,
        my_rooms: rooms[0].total
    };
}

async function getScoreChartData(room_id) {
    const [rows] = await db.query(`
        SELECT 
            SUM(CASE WHEN score < 4 THEN 1 ELSE 0 END) as 'Yếu (0-4)',
            SUM(CASE WHEN score >= 4 AND score < 6 THEN 1 ELSE 0 END) as 'Trung bình (4-6)',
            SUM(CASE WHEN score >= 6 AND score < 8 THEN 1 ELSE 0 END) as 'Khá (6-8)',
            SUM(CASE WHEN score >= 8 THEN 1 ELSE 0 END) as 'Giỏi (8-10)'
        FROM exam_attempts 
        WHERE room_id = ? AND status = 'SUBMITTED'
    `, [room_id]);
    
    if (!rows[0]) return { labels: [], data: [] };
    
    const result = rows[0];
    return {
        labels: Object.keys(result),
        data: Object.values(result)
    };
}

async function getExamTrend() {
    const [rows] = await db.query(`
        SELECT 
            DATE_FORMAT(submit_time, '%m/%Y') as month_label,
            COUNT(*) as count
        FROM exam_attempts
        WHERE status = 'SUBMITTED' AND submit_time IS NOT NULL
        GROUP BY DATE_FORMAT(submit_time, '%Y-%m'), DATE_FORMAT(submit_time, '%m/%Y')
        ORDER BY DATE_FORMAT(submit_time, '%Y-%m') ASC
        LIMIT 6
    `);
    return rows;
}

async function getPassFailRatio() {
    const [rows] = await db.query(`
        SELECT 
            SUM(CASE WHEN ea.score >= e.pass_score THEN 1 ELSE 0 END) as pass_count,
            SUM(CASE WHEN ea.score < e.pass_score THEN 1 ELSE 0 END) as fail_count
        FROM exam_attempts ea
        JOIN exams e ON ea.exam_id = e.exam_id
        WHERE ea.status = 'SUBMITTED'
    `);
    const data = rows[0] || { pass_count: 0, fail_count: 0 };
    return {
        pass_count: parseInt(data.pass_count || 0),
        fail_count: parseInt(data.fail_count || 0)
    };
}

async function getQuestionsPerSubject() {
    const [rows] = await db.query(`
        SELECT 
            s.subject_name,
            COUNT(q.question_id) as count
        FROM subjects s
        LEFT JOIN questions q ON s.subject_id = q.subject_id AND q.status = 'ACTIVE'
        GROUP BY s.subject_id, s.subject_name
    `);
    return rows;
}

async function getRoomStatusStats() {
    const [rows] = await db.query(`
        SELECT 
            status,
            COUNT(*) as count
        FROM exam_rooms
        GROUP BY status
    `);
    return rows;
}

module.exports = {
    getAdminOverview,
    getTeacherOverview,
    getScoreChartData,
    getExamTrend,
    getPassFailRatio,
    getQuestionsPerSubject,
    getRoomStatusStats
};