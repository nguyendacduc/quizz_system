const db = require('../config/db');
async function getChaptersBySubjectId(subject_id) {
    const [chapters] = await db.query(
        'SELECT * FROM chapters WHERE subject_id = ? ORDER BY chapter_order ASC',
        [subject_id]
    );
    return chapters;
}
async function getChapterById(chapter_id) {
    const [chapters] = await db.query(
        'SELECT * FROM chapters WHERE chapter_id = ?',
        [chapter_id]
    );
    return chapters[0] || null;
}
async function createChapter(subject_id, chapter_code, chapter_name, chapter_order, description) {
    const [result] = await db.query(
        'INSERT INTO chapters (subject_id, chapter_code, chapter_name, chapter_order, description) VALUES (?, ?, ?, ?, ?)',
        [subject_id, chapter_code, chapter_name, chapter_order, description]
    );
    return result.insertId;
}
async function updateChapter(chapter_id, chapter_code, chapter_name, chapter_order, description, status = 'ACTIVE') {
    await db.query(
        'UPDATE chapters SET chapter_code = ?, chapter_name = ?, chapter_order = ?, description = ?, status = ? WHERE chapter_id = ?',
        [chapter_code, chapter_name, chapter_order, description, status, chapter_id]
    );
}
async function deleteChapter(chapter_id) {
    await db.query('DELETE FROM chapters WHERE chapter_id = ?', [chapter_id]);
}
async function countQuestionsByChapterId(chapter_id) {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM questions WHERE chapter_id = ?', [chapter_id]);
    return rows[0].count;
}
module.exports = {
    getChaptersBySubjectId,
    getChapterById,
    createChapter,
    updateChapter,
    deleteChapter,
    countQuestionsByChapterId
};