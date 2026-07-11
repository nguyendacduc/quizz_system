const subjectModel = require('../models/subjectModel');
const activityLogModel = require('../models/activityLogModel');
async function index(req, res) {
    try {
        const subjects = await subjectModel.getAllSubjects();
        res.json({
            success: true,
            data: subjects
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách môn học" });
    }
}
async function store(req, res) {
    try {
        const { subject_code, subject_name, credits, description } = req.body;
        if (!subject_code || !subject_name || !credits) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập mã môn, tên môn và số tín chỉ" });
        }
        const newSubjectId = await subjectModel.createSubject(subject_code, subject_name, credits, description);
        
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(actorId, 'DANH MỤC MÔN HỌC', `Tài khoản ${actorName} đã tạo mới môn học "${subject_name}" (Mã số: ${subject_code}).`, req.ip);
        res.status(201).json({
            success: true,
            message: "Thêm môn học thành công",
            data: { subject_id: newSubjectId, subject_code, subject_name }
        });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "Mã môn học hoặc Tên môn học đã tồn tại" });
        }
        res.status(500).json({ success: false, message: "Lỗi server khi thêm môn học" });
    }
}
async function update(req, res) {
    try {
        const subject_id = req.params.id;
        const { subject_code, subject_name, credits, description } = req.body;
        if (!subject_code || !subject_name || !credits) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đủ mã môn, tên môn và số tín chỉ" });
        }
        await subjectModel.updateSubject(subject_id, subject_code, subject_name, credits, description);
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(actorId, 'DANH MỤC MÔN HỌC', `Tài khoản ${actorName} đã chỉnh sửa môn học "${subject_name}" (Mã số: ${subject_code}).`, req.ip);
        res.json({ success: true, message: "Cập nhật môn học thành công" });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "Mã môn học hoặc Tên môn học đã tồn tại ở môn học khác" });
        }
        res.status(500).json({ success: false, message: "Lỗi server khi cập nhật môn học" });
    }
}
async function destroy(req, res) {
    try {
        const subject_id = req.params.id;
        await subjectModel.deleteSubject(subject_id);
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(actorId, 'DANH MỤC MÔN HỌC', `Tài khoản ${actorName} đã xóa môn học ID #${subject_id}.`, req.ip);
        res.json({ success: true, message: "Xóa môn học thành công" });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ success: false, message: "Không thể xóa môn học này vì đã có đề thi hoặc câu hỏi liên quan." });
        }
        res.status(500).json({ success: false, message: "Lỗi server khi xóa môn học" });
    }
}
module.exports = {
    index,
    store,
    update,
    destroy
};