const questionModel = require('../models/questionModel');
const { getTeacherId } = require('../helpers/profileHelper');
async function getFilters(req, res) {
    try {
        const data = await questionModel.getClassifications();
        res.json({ success: true, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi lấy danh mục phân loại" });
    }
}
async function list(req, res) {
    try {
        const keyword = req.query.keyword || '';
        const subject_id = req.query.subject_id || null;
        const questions = await questionModel.getQuestions(keyword, subject_id);
        
        res.json({ success: true, data: questions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách câu hỏi" });
    }
}
async function store(req, res) {
    try {
        const { user_id, role_code } = req.session.user;
        let teacher_id = null;
        if (role_code === 'TEACHER') {
            teacher_id = await getTeacherId(user_id);
            if (!teacher_id) {
                return res.status(403).json({ success: false, message: "Tài khoản của bạn chưa được cấp hồ sơ Giảng viên" });
            }
        } else if (role_code === 'ADMIN') {
            teacher_id = req.body.teacher_id;
            if (!teacher_id) return res.status(400).json({ success: false, message: "Vui lòng chỉ định teacher_id" });
        }
        const { subject_id, chapter_id, difficulty_id, question_type_id, question_content, explanation, score, answers } = req.body;
        if (!question_content || !answers || answers.length < 2) {
            return res.status(400).json({ success: false, message: "Nội dung câu hỏi và ít nhất 2 đáp án là bắt buộc" });
        }
        const questionData = { subject_id, chapter_id, difficulty_id, question_type_id, question_content, explanation, score: score || 1.0 };
        const newQuestionId = await questionModel.createQuestionWithAnswers(teacher_id, questionData, answers);
        res.status(201).json({ 
            success: true, 
            message: "Tạo câu hỏi và đáp án thành công", 
            question_id: newQuestionId 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server khi lưu câu hỏi" });
    }
}
async function update(req, res) {
    try {
        const question_id = req.params.id;
        const { subject_id, chapter_id, difficulty_id, question_type_id, question_content, explanation, score, answers } = req.body;
        if (!question_content || !answers || answers.length < 2) {
            return res.status(400).json({ success: false, message: "Nội dung câu hỏi và ít nhất 2 đáp án là bắt buộc" });
        }
        const questionData = { subject_id, chapter_id, difficulty_id, question_type_id, question_content, explanation, score: score || 1.0 };
        await questionModel.updateQuestionWithAnswers(question_id, questionData, answers);
        res.json({ success: true, message: "Cập nhật câu hỏi thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server khi cập nhật câu hỏi" });
    }
}
async function destroy(req, res) {
    try {
        const question_id = req.params.id;
        await questionModel.deleteQuestion(question_id);
        res.json({ success: true, message: "Xóa câu hỏi thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server khi xóa câu hỏi" });
    }
}
module.exports = {
    getFilters,
    list,
    store,
    update,
    destroy
};