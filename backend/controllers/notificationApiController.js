const notificationModel = require('../models/notificationModel');
const activityLogModel = require('../models/activityLogModel');
async function listMyNotifications(req, res) {
    try {
        const user_id = req.session.user.user_id;
        const notifications = await notificationModel.getUserNotifications(user_id);
        res.json({ success: true, data: notifications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi khi lấy thông báo của bạn" });
    }
}
async function readNotification(req, res) {
    try {
        const user_id = req.session.user.user_id;
        const notification_id = req.params.id;
        await notificationModel.markAsRead(notification_id, user_id);
        res.json({ success: true, message: "Đã đánh dấu đọc thông báo" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi khi cập nhật thông báo" });
    }
}
async function adminListAll(req, res) {
    try {
        const notifications = await notificationModel.getAllNotificationsAdmin();
        res.json({ success: true, data: notifications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi khi lấy toàn bộ thông báo" });
    }
}
async function adminCreate(req, res) {
    try {
        const { title, content, target, specific_username } = req.body;
        if (!title || !content || !target) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ tiêu đề, nội dung và đối tượng nhận" });
        }
        const validTargets = ['ALL', 'TEACHERS', 'STUDENTS', 'USER'];
        if (!validTargets.includes(target)) {
            return res.status(400).json({ success: false, message: "Đối tượng nhận thông báo không hợp lệ" });
        }
        let userIds;
        try {
            userIds = await notificationModel.getUserIdsByTarget(target, specific_username);
        } catch (targetError) {
            if (targetError.message === 'MISSING_USERNAME') {
                return res.status(400).json({ success: false, message: "Vui lòng chỉ định tên tài khoản nhận" });
            }
            if (targetError.message === 'USER_NOT_FOUND') {
                return res.status(404).json({ success: false, message: `Không tìm thấy tài khoản "${specific_username}"` });
            }
            throw targetError;
        }
        if (userIds.length === 0) {
            return res.status(400).json({ success: false, message: "Không tìm thấy người dùng phù hợp để gửi thông báo" });
        }
        await notificationModel.createNotification(userIds, title, content);
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(
            actorId, 
            'THÔNG BÁO', 
            `Quản trị viên ${actorName} đã tạo thông báo thủ công: "${title}" gửi cho đối tượng [${target}].`, 
            req.ip
        );
        res.status(201).json({ success: true, message: `Đã gửi thông báo thành công tới ${userIds.length} người dùng` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server khi tạo thông báo" });
    }
}
async function adminUpdate(req, res) {
    try {
        const notification_id = req.params.id;
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đủ tiêu đề và nội dung" });
        }
        await notificationModel.updateNotificationContent(notification_id, title, content);
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(
            actorId, 
            'THÔNG BÁO', 
            `Quản trị viên ${actorName} đã sửa thông báo ID #${notification_id} thành: "${title}".`, 
            req.ip
        );
        res.json({ success: true, message: "Chỉnh sửa thông báo thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi khi sửa thông báo" });
    }
}
async function adminDelete(req, res) {
    try {
        const notification_id = req.params.id;
        await notificationModel.deleteNotification(notification_id);
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(
            actorId, 
            'THÔNG BÁO', 
            `Quản trị viên ${actorName} đã xóa thông báo ID #${notification_id}.`, 
            req.ip
        );
        res.json({ success: true, message: "Đã xóa thông báo thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server khi xóa thông báo" });
    }
}
module.exports = {
    listMyNotifications,
    readNotification,
    adminListAll,
    adminCreate,
    adminUpdate,
    adminDelete
};