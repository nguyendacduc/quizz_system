const db = require('../config/db');
async function getTeacherId(user_id) {
    const [links] = await db.query('SELECT teacher_id FROM teacher_accounts WHERE user_id = ?', [user_id]);
    if (links.length === 0) return null;
    return links[0].teacher_id;
}
async function getStudentId(user_id) {
    const [links] = await db.query('SELECT student_id FROM student_accounts WHERE user_id = ?', [user_id]);
    if (links.length === 0) throw new Error('Hồ sơ sinh viên chưa được cấu hình');
    return links[0].student_id;
}
module.exports = { getTeacherId, getStudentId };