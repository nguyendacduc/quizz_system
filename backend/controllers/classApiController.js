const classModel = require('../models/classModel');
const activityLogModel = require('../models/activityLogModel');
async function index(req, res) {
    try {
        const classes = await classModel.getAllClasses();
        res.json({ success: true, data: classes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách lớp học" });
    }
}
async function store(req, res) {
    try {
        const { class_code, class_name, department_id, academic_year_id, description } = req.body;
        if (!class_code || !class_name || !department_id) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập mã lớp, tên lớp và chọn khoa" });
        }
        const newId = await classModel.createClass(class_code, class_name, department_id, academic_year_id, description);
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(actorId, 'DANH MỤC LỚP', `Tài khoản ${actorName} đã tạo mới lớp học "${class_name}" (Mã số: ${class_code}).`, req.ip);
        res.status(201).json({ success: true, message: "Thêm lớp học thành công", class_id: newId });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "Mã lớp hoặc Tên lớp học đã tồn tại" });
        }
        res.status(500).json({ success: false, message: "Lỗi server khi thêm lớp học" });
    }
}
async function update(req, res) {
    try {
        const class_id = req.params.id;
        const { class_code, class_name, department_id, academic_year_id, description } = req.body;
        if (!class_code || !class_name || !department_id) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đủ các trường bắt buộc" });
        }
        await classModel.updateClass(class_id, class_code, class_name, department_id, academic_year_id, description);
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(actorId, 'DANH MỤC LỚP', `Tài khoản ${actorName} đã chỉnh sửa thông tin lớp học "${class_name}" (Mã số: ${class_code}).`, req.ip);
        res.json({ success: true, message: "Cập nhật lớp học thành công" });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "Mã lớp hoặc Tên lớp học đã tồn tại ở lớp khác" });
        }
        res.status(500).json({ success: false, message: "Lỗi server khi cập nhật lớp học" });
    }
}
async function destroy(req, res) {
    try {
        const class_id = req.params.id;
        await classModel.deleteClass(class_id);
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(actorId, 'DANH MỤC LỚP', `Tài khoản ${actorName} đã xóa lớp học ID #${class_id}.`, req.ip);
        res.json({ success: true, message: "Xóa lớp học thành công" });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ success: false, message: "Không thể xóa lớp học này vì đang có sinh viên tham gia." });
        }
        res.status(500).json({ success: false, message: "Lỗi server khi xóa lớp học" });
    }
}
module.exports = { index, store, update, destroy };