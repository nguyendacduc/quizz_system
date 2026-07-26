const departmentModel = require('../models/departmentModel');
const activityLogModel = require('../models/activityLogModel');
async function index(req, res) {
    try {
        const departments = await departmentModel.getAllDepartments();
        res.json({ success: true, data: departments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách khoa" });
    }
}
async function store(req, res) {
    try {
        const { department_code, department_name, description } = req.body;
        if (!department_code || !department_name) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập mã khoa và tên khoa" });
        }
        const newId = await departmentModel.createDepartment(department_code, department_name, description);
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(actorId, 'DANH MỤC KHOA', `Tài khoản ${actorName} đã tạo mới khoa "${department_name}" (Mã số: ${department_code}).`, req.ip);
        res.status(201).json({ success: true, message: "Thêm khoa thành công", department_id: newId });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "Mã khoa hoặc Tên khoa đã tồn tại" });
        }
        res.status(500).json({ success: false, message: "Lỗi server khi thêm khoa" });
    }
}
async function update(req, res) {
    try {
        const department_id = req.params.id;
        const { department_code, department_name, description } = req.body;
        if (!department_code || !department_name) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đủ mã khoa và tên khoa" });
        }
        await departmentModel.updateDepartment(department_id, department_code, department_name, description);
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(actorId, 'DANH MỤC KHOA', `Tài khoản ${actorName} đã chỉnh sửa thông tin khoa "${department_name}" (Mã số: ${department_code}).`, req.ip);
        res.json({ success: true, message: "Cập nhật khoa thành công" });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "Mã khoa hoặc Tên khoa đã tồn tại ở khoa khác" });
        }
        res.status(500).json({ success: false, message: "Lỗi server khi cập nhật khoa" });
    }
}
async function destroy(req, res) {
    try {
        const department_id = req.params.id;
        await departmentModel.deleteDepartment(department_id);
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(actorId, 'DANH MỤC KHOA', `Tài khoản ${actorName} đã xóa khoa ID #${department_id}.`, req.ip);
        res.json({ success: true, message: "Xóa khoa thành công" });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ success: false, message: "Không thể xóa khoa này vì đã có lớp học hoặc giảng viên liên kết." });
        }
        res.status(500).json({ success: false, message: "Lỗi server khi xóa khoa" });
    }
}
module.exports = { index, store, update, destroy };