const db = require('../config/db');
async function getAllDepartments() {
    const [rows] = await db.query(
        'SELECT * FROM departments ORDER BY created_at DESC'
    );
    return rows;
}
async function createDepartment(department_code, department_name, description) {
    const [result] = await db.query(
        `INSERT INTO departments (department_code, department_name, description) 
         VALUES (?, ?, ?)`,
        [department_code, department_name, description]
    );
    return result.insertId;
}
async function updateDepartment(department_id, department_code, department_name, description) {
    await db.query(
        `UPDATE departments 
         SET department_code = ?, department_name = ?, description = ? 
         WHERE department_id = ?`,
        [department_code, department_name, description, department_id]
    );
}
async function deleteDepartment(department_id) {
    await db.query('DELETE FROM departments WHERE department_id = ?', [department_id]);
}
module.exports = {
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
};