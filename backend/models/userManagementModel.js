const db = require('../config/db');
async function getStudents(keyword = '') {
    const [rows] = await db.query(`
        SELECT u.user_id, u.username, u.is_active, s.student_id, s.student_code, s.full_name, s.gender, s.date_of_birth, s.email, s.phone, s.address, s.class_id, s.avatar, c.class_name 
        FROM users u 
        JOIN student_accounts sa ON u.user_id = sa.user_id 
        JOIN students s ON sa.student_id = s.student_id 
        JOIN classes c ON s.class_id = c.class_id
        WHERE (s.full_name LIKE ? OR s.student_code LIKE ? OR u.username LIKE ?) AND s.status = 'ACTIVE'
        ORDER BY s.created_at DESC`, 
        [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
    );
    return rows;
}
async function createStudentTransaction(username, password_hash, role_id, studentData) {
    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        const [userResult] = await connection.query(
            'INSERT INTO users (username, password_hash, role_id) VALUES (?, ?, ?)',
            [username, password_hash, role_id]
        );
        const userId = userResult.insertId;
        const [studentResult] = await connection.query(
            `INSERT INTO students (student_code, full_name, gender, date_of_birth, email, phone, address, class_id, avatar) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [studentData.student_code, studentData.full_name, studentData.gender, studentData.date_of_birth, studentData.email, studentData.phone, studentData.address || null, studentData.class_id, studentData.avatar || null]
        );
        const studentId = studentResult.insertId;
        await connection.query(
            'INSERT INTO student_accounts (user_id, student_id) VALUES (?, ?)',
            [userId, studentId]
        );
        await connection.commit();
        return userId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
async function updateStudent(student_id, studentData) {
    await db.query(
        `UPDATE students 
         SET student_code = ?, full_name = ?, gender = ?, date_of_birth = ?, email = ?, phone = ?, address = ?, class_id = ?, avatar = ? 
         WHERE student_id = ?`,
         [studentData.student_code, studentData.full_name, studentData.gender, studentData.date_of_birth, studentData.email, studentData.phone, studentData.address || null, studentData.class_id, studentData.avatar || null, student_id]
    );
}
async function deleteStudentTransaction(student_id) {
    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        const [links] = await connection.query('SELECT user_id FROM student_accounts WHERE student_id = ?', [student_id]);
        
        if (links.length > 0) {
            const user_id = links[0].user_id;
            
            await connection.query('UPDATE users SET is_active = FALSE WHERE user_id = ?', [user_id]);
        }
        
        await connection.query('UPDATE students SET status = "INACTIVE" WHERE student_id = ?', [student_id]);
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
async function getTeachers(keyword = '') {
    const [rows] = await db.query(`
        SELECT u.user_id, u.username, u.is_active, t.teacher_id, t.teacher_code, t.full_name, t.gender, t.date_of_birth, t.email, t.phone, t.address, t.department_id, t.avatar, d.department_name 
        FROM users u 
        JOIN teacher_accounts ta ON u.user_id = ta.user_id 
        JOIN teachers t ON ta.teacher_id = t.teacher_id 
        JOIN departments d ON t.department_id = d.department_id
        WHERE (t.full_name LIKE ? OR t.teacher_code LIKE ? OR u.username LIKE ?) AND t.status = 'ACTIVE'
        ORDER BY t.created_at DESC`, 
        [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
    );
    return rows;
}
async function createTeacherTransaction(username, password_hash, role_id, teacherData) {
    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        const [userResult] = await connection.query(
            'INSERT INTO users (username, password_hash, role_id) VALUES (?, ?, ?)',
            [username, password_hash, role_id]
        );
        const userId = userResult.insertId;
        const [teacherResult] = await connection.query(
            `INSERT INTO teachers (teacher_code, full_name, gender, date_of_birth, email, phone, address, department_id, avatar) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [teacherData.teacher_code, teacherData.full_name, teacherData.gender, teacherData.date_of_birth, teacherData.email, teacherData.phone, teacherData.address || null, teacherData.department_id, teacherData.avatar || null]
        );
        const teacherId = teacherResult.insertId;
        await connection.query(
            'INSERT INTO teacher_accounts (user_id, teacher_id) VALUES (?, ?)',
            [userId, teacherId]
        );
        await connection.commit();
        return userId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
async function updateTeacher(teacher_id, teacherData) {
    await db.query(
        `UPDATE teachers 
         SET teacher_code = ?, full_name = ?, gender = ?, date_of_birth = ?, email = ?, phone = ?, address = ?, department_id = ?, avatar = ? 
         WHERE teacher_id = ?`,
        [teacherData.teacher_code, teacherData.full_name, teacherData.gender, teacherData.date_of_birth, teacherData.email, teacherData.phone, teacherData.address || null, teacherData.department_id, teacherData.avatar || null, teacher_id]
    );
}
async function deleteTeacherTransaction(teacher_id) {
    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        const [links] = await connection.query('SELECT user_id FROM teacher_accounts WHERE teacher_id = ?', [teacher_id]);
        
        if (links.length > 0) {
            const user_id = links[0].user_id;
            await connection.query('UPDATE users SET is_active = FALSE WHERE user_id = ?', [user_id]);
        }
        
        await connection.query('UPDATE teachers SET status = "INACTIVE" WHERE teacher_id = ?', [teacher_id]);
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
async function getAccounts(keyword = '') {
    const [rows] = await db.query(`
        SELECT u.user_id, u.username, u.is_active, u.last_login, r.role_code, r.role_name 
        FROM users u 
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.username LIKE ? AND u.is_active = TRUE
        ORDER BY u.user_id DESC`, 
        [`%${keyword}%`]
    );
    return rows;
}
async function deleteAccountTransaction(user_id) {
    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        const [studentLink] = await connection.query('SELECT student_id FROM student_accounts WHERE user_id = ?', [user_id]);
        const [teacherLink] = await connection.query('SELECT teacher_id FROM teacher_accounts WHERE user_id = ?', [user_id]);
        if (studentLink.length > 0) {
            const student_id = studentLink[0].student_id;
            await connection.query('UPDATE students SET status = "INACTIVE" WHERE student_id = ?', [student_id]);
        } else if (teacherLink.length > 0) {
            const teacher_id = teacherLink[0].teacher_id;
            await connection.query('UPDATE teachers SET status = "INACTIVE" WHERE teacher_id = ?', [teacher_id]);
        }
        await connection.query('UPDATE users SET is_active = FALSE WHERE user_id = ?', [user_id]);
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
async function toggleUserStatus(user_id, is_active) {
    await db.query('UPDATE users SET is_active = ? WHERE user_id = ?', [is_active, user_id]);
}
async function resetUserPassword(user_id, password_hash) {
    await db.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [password_hash, user_id]);
}
module.exports = {
    getStudents,
    createStudentTransaction,
    updateStudent,
    deleteStudentTransaction,
    
    getTeachers,
    createTeacherTransaction,
    updateTeacher,
    deleteTeacherTransaction,
    
    getAccounts,
    deleteAccountTransaction,
    
    toggleUserStatus,
    resetUserPassword
};