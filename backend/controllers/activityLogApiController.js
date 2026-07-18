const activityLogModel = require('../models/activityLogModel');
async function listLogs(req, res) {
    try {
        const keyword = req.query.keyword || '';
        const logs = await activityLogModel.getLogs(keyword);
        res.json({ success: true, data: logs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy nhật ký hệ thống" });
    }
}
module.exports = {
    listLogs
};