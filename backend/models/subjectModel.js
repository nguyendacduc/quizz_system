const db = require('../config/db');
async function getAllSubjects() {
    const [subjects] = await db.query(
        'SELECT * FROM subjects ORDER BY created_at DESC'
    );
    return subjects;
}
async function createSubject(subject_code, subject_name, credits, description) {
    const [result] = await db.query(
        'INSERT INTO subjects (subject_code, subject_name, credits, description) VALUES (?, ?, ?, ?)',
        [subject_code, subject_name, credits, description]
    );
    return result.insertId;
}
async function updateSubject(subject_id, subject_code, subject_name, credits, description) {
    await db.query(
        'UPDATE subjects SET subject_code = ?, subject_name = ?, credits = ?, description = ? WHERE subject_id = ?',
        [subject_code, subject_name, credits, description, subject_id]
    );
}
async function deleteSubject(subject_id) {
    await db.query('DELETE FROM subjects WHERE subject_id = ?', [subject_id]);
}
module.exports = {
    getAllSubjects,
    createSubject,
    updateSubject,
    deleteSubject
};