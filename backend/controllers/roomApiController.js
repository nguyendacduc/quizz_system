const crypto = require('crypto');
const roomModel = require('../models/roomModel');
const { getTeacherId } = require('../helpers/profileHelper');
const notificationModel = require('../models/notificationModel');
async function list(req, res) {
    try {
        const { user_id, role_code } = req.session.user;
        let teacher_id = null;
        if (role_code === 'TEACHER') {
            teacher_id = await getTeacherId(user_id);
        }
        const rooms = await roomModel.getRooms(teacher_id);
        res.json({ success: true, data: rooms });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách phòng thi" });
    }
}
async function store(req, res) {
    try {
        const { user_id, role_code } = req.session.user;
        let teacher_id = req.body.teacher_id;
        if (role_code === 'TEACHER') {
            teacher_id = await getTeacherId(user_id);
        }
        const { room_name, exam_id, room_password, max_students, start_time, end_time } = req.body;
        
        let room_code = req.body.room_code;
        if (!room_code) {
            room_code = 'RM' + crypto.randomBytes(3).toString('hex').toUpperCase();
        }
        const data = { room_code, room_name, exam_id, teacher_id, room_password, max_students: max_students || 50, start_time, end_time };
        const newRoomId = await roomModel.createRoom(data);
        try {
            const userIds = await roomModel.getAllUserIds();
            await notificationModel.createNotification(
                userIds, 
                'Phòng thi mới được tạo', 
                `Phòng thi "${room_name}" (Mã phòng: ${room_code}) đã được thiết lập thành công. Vui lòng chuẩn bị sẵn sàng.`
            );
        } catch (notifErr) {
            console.error("Lỗi khi tạo thông báo phòng thi:", notifErr.message);
        }
        res.status(201).json({ 
            success: true, 
            message: "Tạo phòng thi thành công", 
            data: { room_id: newRoomId, room_code } 
        });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: "Mã phòng đã tồn tại" });
        res.status(500).json({ success: false, message: "Lỗi tạo phòng thi" });
    }
}
async function changeStatus(req, res) {
    try {
        const room_id = req.params.id;
        const { status } = req.body; 
        const allowedStatuses = ['WAITING', 'RUNNING', 'FINISHED', 'CANCELLED'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ" });
        }
        await roomModel.updateRoomStatus(room_id, status);
        const roomInfo = await roomModel.getRoomInfo(room_id);
        if (roomInfo) {
            const { room_name, room_code } = roomInfo;
            if (status === 'RUNNING') {
                try {
                    const userIds = await roomModel.getAllUserIds();
                    await notificationModel.createNotification(
                        userIds, 
                        'Phòng thi đã bắt đầu', 
                        `Giảng viên đã nhấn Bắt đầu thi cho phòng "${room_name}" (Mã phòng: ${room_code}). Vui lòng vào làm bài thi ngay!`
                    );
                } catch (notifErr) {
                    console.error("Lỗi khi tạo thông báo bắt đầu phòng thi:", notifErr.message);
                }
            } else if (status === 'FINISHED') {
                try {
                    const userIds = await roomModel.getAllUserIds();
                    await notificationModel.createNotification(
                        userIds, 
                        'Phòng thi đã hoàn thành', 
                        `Phòng thi "${room_name}" (Mã phòng: ${room_code}) đã kết thúc. Bạn có thể xem kết quả thi ngay bây giờ.`
                    );
                } catch (notifErr) {
                    console.error("Lỗi khi tạo thông báo kết thúc phòng thi:", notifErr.message);
                }
            }
        }
        res.json({ success: true, message: `Phòng thi đã chuyển sang trạng thái: ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi cập nhật trạng thái phòng" });
    }
}
async function viewLobby(req, res) {
    try {
        const room_id = req.params.id;
        const status = req.query.status;
        
        const roomInfo = await roomModel.getRoomInfo(room_id);
        if (roomInfo && roomInfo.end_time && new Date() > new Date(roomInfo.end_time) && roomInfo.status !== 'FINISHED' && roomInfo.status !== 'CANCELLED') {
            await roomModel.updateRoomStatus(room_id, 'FINISHED');
            roomInfo.status = 'FINISHED';
        }
        
        const students = await roomModel.getRoomStudents(room_id, status);
        res.json({ success: true, data: students, room: roomInfo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi tải phòng chờ" });
    }
}
async function handleStudent(req, res) {
    try {
        const room_id = req.params.id;
        const student_id = req.params.student_id;
        const { action } = req.body;

        const roomInfo = await roomModel.getRoomInfo(room_id);
        if (!roomInfo) {
            return res.status(404).json({ success: false, message: "Phòng thi không tồn tại" });
        }

        const now = new Date();
        if (roomInfo.end_time && now > new Date(roomInfo.end_time)) {
            if (roomInfo.status !== 'FINISHED') {
                await roomModel.updateRoomStatus(room_id, 'FINISHED');
            }
            return res.status(400).json({ success: false, message: "Phòng thi đã hết thời gian (đã đóng phòng). Không thể duyệt sinh viên nữa." });
        }

        if (roomInfo.status === 'FINISHED' || roomInfo.status === 'CANCELLED') {
            return res.status(400).json({ success: false, message: "Phòng thi đã đóng hoặc bị hủy. Không thể duyệt sinh viên." });
        }

        const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
        
        await roomModel.updateStudentStatus(room_id, student_id, status);
        
        if (action === 'APPROVE') {
            try {
                const db = require('../config/db');
                const [sUser] = await db.query('SELECT user_id FROM students WHERE student_id = ?', [student_id]);
                if (sUser.length > 0) {
                    await notificationModel.createNotification(
                        sUser[0].user_id,
                        'Được duyệt vào phòng thi',
                        `Bạn đã được duyệt vào phòng thi "${roomInfo.room_name}" (Mã: ${roomInfo.room_code}). Vui lòng sẵn sàng làm bài.`
                    );
                }
            } catch (notifErr) {
                console.error("Lỗi khi tạo thông báo duyệt sinh viên:", notifErr.message);
            }
        }
        res.json({ success: true, message: `Đã ${action === 'APPROVE' ? 'duyệt' : 'từ chối'} sinh viên` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi xử lý sinh viên" });
    }
}
async function monitorRoom(req, res) {
    try {
        const room_id = req.params.id; 
        const students = await roomModel.getLiveRoomMonitor(room_id);
        res.json({ success: true, data: students });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi tải dữ liệu giám sát phòng thi" });
    }
}
module.exports = { 
    list, 
    store, 
    changeStatus, 
    viewLobby, 
    handleStudent,
    monitorRoom
};