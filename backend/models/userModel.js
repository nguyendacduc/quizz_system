const db = require('../config/db');

async function findUserByUsername(username) {
    const [users] = await db.query(
        `SELECT u.*, r.role_code, r.role_name 
         FROM users u 
         JOIN roles r ON u.role_id = r.role_id 
         WHERE u.username = ?`,
        [username]
    );
    return users[0] || null;
}

async function createUser(username, password_hash, role_id) {
    const [result] = await db.query(
        'INSERT INTO users (username, password_hash, role_id) VALUES (?, ?, ?)',
        [username, password_hash, role_id]
    );
    return result.insertId;
}

async function updateLastLogin(user_id) {
    await db.query(
        'UPDATE users SET last_login = NOW() WHERE user_id = ?',
        [user_id]
    );
}

async function findUserById(user_id) {
    const [users] = await db.query('SELECT * FROM users WHERE user_id = ?', [user_id]);
    return users[0] || null;
}

async function updatePassword(user_id, new_password_hash) {
    await db.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [new_password_hash, user_id]);
}


async function getProfile(user_id, role_code) {
    if (role_code === 'STUDENT') {
        const [rows] = await db.query(`
            SELECT s.* FROM students s 
            JOIN student_accounts sa ON s.student_id = sa.student_id 
            WHERE sa.user_id = ?`, [user_id]);
        return rows[0] || null;
    } else if (role_code === 'TEACHER') {
        const [rows] = await db.query(`
            SELECT t.* FROM teachers t 
            JOIN teacher_accounts ta ON t.teacher_id = ta.teacher_id 
            WHERE ta.user_id = ?`, [user_id]);
        return rows[0] || null;
    }
    return null; 
}

async function updateProfile(user_id, role_code, phone, address, avatar) {
    if (role_code === 'STUDENT') {
        const [links] = await db.query('SELECT student_id FROM student_accounts WHERE user_id = ?', [user_id]);
        if (links.length > 0) {
            await db.query('UPDATE students SET phone = ?, address = ?, avatar = ? WHERE student_id = ?', [phone, address, avatar || null, links[0].student_id]);
        }
    } else if (role_code === 'TEACHER') {
        const [links] = await db.query('SELECT teacher_id FROM teacher_accounts WHERE user_id = ?', [user_id]);
        if (links.length > 0) {
            await db.query('UPDATE teachers SET phone = ?, address = ?, avatar = ? WHERE teacher_id = ?', [phone, address, avatar || null, links[0].teacher_id]);
        }
    }
}

module.exports = {
    findUserByUsername,
    createUser,
    updateLastLogin,
    findUserById,
    updatePassword,
    getProfile,
    updateProfile
};