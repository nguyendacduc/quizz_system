const db = require('../config/db');
async function getAllClasses() {
    const [rows] = await db.query(
        `SELECT c.*, d.department_name 
         FROM classes c 
         JOIN departments d ON c.department_id = d.department_id 
         ORDER BY c.created_at DESC`
    );
    return rows;
}
async function createClass(class_code, class_name, department_id, academic_year_id, description) {
    const [result] = await db.query(
        `INSERT INTO classes (class_code, class_name, department_id, academic_year_id, description) 
         VALUES (?, ?, ?, ?, ?)`,
        [class_code, class_name, department_id, academic_year_id || 1, description]
    );
    return result.insertId;
}
async function updateClass(class_id, class_code, class_name, department_id, academic_year_id, description) {
    await db.query(
        `UPDATE classes 
         SET class_code = ?, class_name = ?, department_id = ?, academic_year_id = ?, description = ? 
         WHERE class_id = ?`,
        [class_code, class_name, department_id, academic_year_id || 1, description, class_id]
    );
}
async function deleteClass(class_id) {
    await db.query('DELETE FROM classes WHERE class_id = ?', [class_id]);
}
module.exports = {
    getAllClasses,
    createClass,
    updateClass,
    deleteClass
};