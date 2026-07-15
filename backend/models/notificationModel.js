const db = require('../config/db');
async function createNotification(userIds, title, content) {
    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        const ids = Array.isArray(userIds) ? userIds : [userIds];
        for (let uid of ids) {
            await connection.query(
                'INSERT INTO notifications (user_id, title, content, is_read) VALUES (?, ?, ?, 0)',
                [uid, title, content]
            );
        }
        await connection.commit();
        return ids.length;
    } catch (e) {
        await connection.rollback();
        throw e;
    } finally {
        connection.release();
    }
}
async function getUserNotifications(user_id) {
    const [rows] = await db.query(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100',
        [user_id]
    );
    return rows;
}
async function markAsRead(notification_id, user_id) {
    await db.query(
        'UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?',
        [notification_id, user_id]
    );
}
async function deleteNotification(notification_id) {
    await db.query('DELETE FROM notifications WHERE notification_id = ?', [notification_id]);
}
async function updateNotificationContent(notification_id, title, content) {
    await db.query(
        'UPDATE notifications SET title = ?, content = ? WHERE notification_id = ?',
        [title, content, notification_id]
    );
}
async function getAllNotificationsAdmin() {
    const [rows] = await db.query(`
        SELECT n.*, u.username, r.role_name, r.role_code 
        FROM notifications n
        JOIN users u ON n.user_id = u.user_id
        JOIN roles r ON u.role_id = r.role_id
        ORDER BY n.created_at DESC 
        LIMIT 200
    `);
    return rows;
}
async function getUserIdsByTarget(target, specific_username) {
    let userIds = [];
    if (target === 'ALL') {
        const [rows] = await db.query('SELECT user_id FROM users');
        userIds = rows.map(r => r.user_id);
    } else if (target === 'TEACHERS') {
        const [rows] = await db.query('SELECT user_id FROM users WHERE role_id = 2');
        userIds = rows.map(r => r.user_id);
    } else if (target === 'STUDENTS') {
        const [rows] = await db.query('SELECT user_id FROM users WHERE role_id = 3');
        userIds = rows.map(r => r.user_id);
    } else if (target === 'USER') {
        if (!specific_username) throw new Error('MISSING_USERNAME');
        const [rows] = await db.query('SELECT user_id FROM users WHERE username = ?', [specific_username.trim()]);
        if (rows.length === 0) throw new Error('USER_NOT_FOUND');
        userIds = [rows[0].user_id];
    }
    return userIds;
}
module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    deleteNotification,
    updateNotificationContent,
    getAllNotificationsAdmin,
    getUserIdsByTarget
};