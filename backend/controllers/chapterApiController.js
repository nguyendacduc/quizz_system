const chapterModel = require('../models/chapterModel');
const activityLogModel = require('../models/activityLogModel');
async function getBySubject(req, res) {
    try {
        const subject_id = req.params.subject_id;
        const chapters = await chapterModel.getChaptersBySubjectId(subject_id);
        res.json({
            success: true,
            data: chapters
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách chương học" });
    }
}
async function store(req, res) {
    try {
        const { subject_id, chapter_code, chapter_name, chapter_order, description } = req.body;
        if (!subject_id || !chapter_code || !chapter_name || chapter_order === undefined) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đủ môn học, mã chương, tên chương và số thứ tự" });
        }
        const newChapterId = await chapterModel.createChapter(
            parseInt(subject_id),
            chapter_code.trim().toUpperCase(),
            chapter_name.trim(),
            parseInt(chapter_order),
            description ? description.trim() : null
        );
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(
            actorId, 
            'DANH MỤC CHƯƠNG HỌC', 
            `Tài khoản ${actorName} đã tạo mới chương học "${chapter_name}" (Mã số: ${chapter_code}) cho môn học ID #${subject_id}.`, 
            req.ip
        );
        res.status(201).json({
            success: true,
            message: "Thêm chương học thành công",
            data: { chapter_id: newChapterId, chapter_code, chapter_name }
        });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "Mã chương học đã tồn tại trong môn học này" });
        }
        res.status(500).json({ success: false, message: "Lỗi server khi thêm chương học" });
    }
}
async function update(req, res) {
    try {
        const chapter_id = req.params.id;
        const { chapter_code, chapter_name, chapter_order, description, status } = req.body;
        if (!chapter_code || !chapter_name || chapter_order === undefined) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đủ mã chương, tên chương và số thứ tự" });
        }
        await chapterModel.updateChapter(
            chapter_id,
            chapter_code.trim().toUpperCase(),
            chapter_name.trim(),
            parseInt(chapter_order),
            description ? description.trim() : null,
            status || 'ACTIVE'
        );
       
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(
            actorId, 
            'DANH MỤC CHƯƠNG HỌC', 
            `Tài khoản ${actorName} đã chỉnh sửa chương học "${chapter_name}" (Mã số: ${chapter_code}, ID: ${chapter_id}).`, 
            req.ip
        );
        res.json({ success: true, message: "Cập nhật chương học thành công" });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "Mã chương học đã tồn tại ở chương khác của môn học này" });
        }
        res.status(500).json({ success: false, message: "Lỗi server khi cập nhật chương học" });
    }
}
async function destroy(req, res) {
    try {
        const chapter_id = req.params.id;
        
        const questionCount = await chapterModel.countQuestionsByChapterId(chapter_id);
        if (questionCount > 0) {
            return res.status(400).json({ success: false, message: "Không thể xóa chương học này vì đã có câu hỏi liên quan." });
        }
        await chapterModel.deleteChapter(chapter_id);
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(
            actorId, 
            'DANH MỤC CHƯƠNG HỌC', 
            `Tài khoản ${actorName} đã xóa chương học ID #${chapter_id}.`, 
            req.ip
        );
        res.json({ success: true, message: "Xóa chương học thành công" });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ success: false, message: "Không thể xóa chương học này vì đang có ràng buộc dữ liệu." });
        }
        res.status(500).json({ success: false, message: "Lỗi server khi xóa chương học" });
    }
}
module.exports = {
    getBySubject,
    store,
    update,
    destroy
};