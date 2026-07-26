const db = require('../config/db');
async function logActivity(user_id, action, description, ip_address = null) {
    try {
        await db.query(
            'INSERT INTO activity_logs (user_id, action, description, ip_address) VALUES (?, ?, ?, ?)',
            [user_id, action, description, ip_address]
        );
    } catch (e) {
        console.error("❌ Không thể ghi nhật ký hoạt động:", e.message);
    }
}
async function getLogs(keyword = '') {
    const [rows] = await db.query(`
        SELECT al.*, u.username, r.role_code, r.role_name 
        FROM activity_logs al 
        JOIN users u ON al.user_id = u.user_id 
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.username LIKE ? OR al.action LIKE ? OR al.description LIKE ?
        ORDER BY al.created_at DESC 
        LIMIT 100`,
        [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
    );
    return rows;
}
module.exports = {
    logActivity,
    getLogs
};