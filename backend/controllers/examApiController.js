const examModel = require('../models/examModel');
const { getTeacherId } = require('../helpers/profileHelper');
const activityLogModel = require('../models/activityLogModel');
async function list(req, res) {
    try {
        const { user_id, role_code } = req.session.user;
        let teacher_id = null;
        if (role_code === 'TEACHER') {
            teacher_id = await getTeacherId(user_id);
        }
        const exams = await examModel.getExams(teacher_id);
        res.json({ success: true, data: exams });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách đề thi" });
    }
}
async function store(req, res) {
    try {
        const { user_id, role_code } = req.session.user;
        let teacher_id = req.body.teacher_id;
        if (role_code === 'TEACHER') {
            teacher_id = await getTeacherId(user_id);
        }
        const { exam_code, exam_name, subject_id, duration, shuffle_questions, shuffle_answers, description, num_questions, total_score } = req.body;
        if (!exam_code || !exam_name || !subject_id || !duration || !num_questions || !total_score) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin bắt buộc (*)" });
        }
        const totalScoreVal = parseFloat(total_score || '10');
        const passScoreVal = totalScoreVal / 2;
        const data = {
            exam_code,
            exam_name,
            subject_id: parseInt(subject_id),
            teacher_id,
            duration: parseInt(duration),
            total_score: totalScoreVal,
            pass_score: passScoreVal,
            shuffle_questions: parseInt(shuffle_questions || '1'),
            shuffle_answers: parseInt(shuffle_answers || '1'),
            description: description || null,
            status: 'DRAFT'
        };
        const newExamId = await examModel.createExam(data);
        try {
            await examModel.generateAutoExam(newExamId, parseInt(subject_id), parseInt(num_questions), totalScoreVal);
        } catch (genError) {
            
            await examModel.deleteExam(newExamId);
            return res.status(400).json({ success: false, message: genError.message || "Không đủ câu hỏi trong ngân hàng đề" });
        }
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(actorId, 'ĐỀ THI', `Tài khoản ${actorName} đã tạo đề thi tự động "${exam_name}" (${exam_code}) với ${num_questions} câu hỏi.`, req.ip);
        res.status(201).json({ success: true, message: "Tạo đề thi tự động thành công!", exam_id: newExamId });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "Mã đề thi đã tồn tại trong hệ thống" });
        }
        res.status(500).json({ success: false, message: "Lỗi server khi tạo đề thi" });
    }
}
async function autoGenerate(req, res) {
    try {
        const exam_id = req.params.id;
        const { subject_id, num_questions, total_score } = req.body;
        const totalScoreVal = parseFloat(total_score || '10');
        const passScoreVal = totalScoreVal / 2;
        const count = await examModel.generateAutoExam(exam_id, parseInt(subject_id), parseInt(num_questions), totalScoreVal);
        await examModel.updateExamScore(exam_id, totalScoreVal, passScoreVal);
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(actorId, 'ĐỀ THI', `Tài khoản ${actorName} đã tái sinh tự động đề thi ID #${exam_id} với ${num_questions} câu hỏi.`, req.ip);
        res.json({ success: true, message: `Đã sinh ngẫu nhiên thành công ${count} câu hỏi vào đề` });
    } catch (error) {
        console.error(error);
        if (error.message.includes('Ngân hàng chỉ có')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: "Lỗi server khi sinh đề" });
    }
}
async function preview(req, res) {
    try {
        const exam_id = req.params.id;
        const exam = await examModel.getExamPreview(exam_id);
        
        if (!exam) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đề thi" });
        }
        res.json({ success: true, data: exam });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi khi tải bản xem trước" });
    }
}
async function destroy(req, res) {
    try {
        const exam_id = req.params.id;
        const { user_id, role_code } = req.session.user;
        const exam = await examModel.getExamById(exam_id);
        if (!exam) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đề thi" });
        }
        if (role_code === 'TEACHER') {
            const myTeacherId = await getTeacherId(user_id);
            if (!myTeacherId || myTeacherId !== exam.teacher_id) {
                return res.status(403).json({ success: false, message: "Bạn không có quyền xóa đề thi này" });
            }
        }
        await examModel.deleteExam(exam_id);
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(actorId, 'ĐỀ THI', `Tài khoản ${actorName} đã xóa đề thi "${exam.exam_name}" (${exam.exam_code}).`, req.ip);
        res.json({ success: true, message: "Xóa đề thi thành công" });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
            return res.status(400).json({ 
                success: false, 
                message: "Không thể xóa đề thi này vì đang được sử dụng trong phòng thi hoặc đã có sinh viên làm bài." 
            });
        }
        res.status(500).json({ success: false, message: "Lỗi server khi xóa đề thi" });
    }
}
module.exports = { list, store, autoGenerate, preview, destroy };