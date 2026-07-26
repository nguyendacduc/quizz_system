const takeExamModel = require('../models/takeExamModel');
const { getStudentId } = require('../helpers/profileHelper');
async function joinLobby(req, res) {
    try {
        const student_id = await getStudentId(req.session.user.user_id);
        const { room_code, room_password } = req.body;
        const room_id = await takeExamModel.joinRoom(student_id, room_code, room_password);
        res.json({ success: true, message: "Đã vào phòng chờ. Vui lòng đợi Giảng viên duyệt.", room_id });
    } catch (error) {
        console.error(error);
        const msgs = { 
            'ROOM_NOT_FOUND': 'Mã phòng không tồn tại', 
            'WRONG_PASSWORD': 'Sai mật khẩu phòng', 
            'ROOM_NOT_OPEN': 'Phòng thi chưa đến giờ mở',
            'ROOM_CLOSED': 'Phòng thi đã đóng hoặc hết thời gian',
            'ALREADY_SUBMITTED': 'Bạn đã hoàn thành bài thi này trước đó và không thể tham gia lại.'
        };
        res.status(400).json({ success: false, message: msgs[error.message] || "Lỗi khi vào phòng" });
    }
}
async function startAndFetchExam(req, res) {
    try {
        const student_id = await getStudentId(req.session.user.user_id);
        const room_id = req.params.room_id;
        const attemptInfo = await takeExamModel.startAttempt(room_id, student_id);
        
        const examData = await takeExamModel.getExamPaper(attemptInfo.exam_id);
        
        res.json({ 
            success: true, 
            message: "Bắt đầu tính giờ!", 
            data: { 
                attempt_id: attemptInfo.attempt_id, 
                exam: examData 
            } 
        });
    } catch (error) {
        console.error(error);
        const msgs = { 
            'ROOM_NOT_RUNNING': 'Phòng thi chưa bắt đầu. Vui lòng chờ Giảng viên nhấn nút Bắt đầu thi.', 
            'ROOM_CLOSED': 'Phòng thi đã đóng hoặc hết thời gian làm bài',
            'NOT_APPROVED': 'Bạn chưa được Giảng viên duyệt vào thi',
            'ALREADY_SUBMITTED': 'Bạn đã hoàn thành bài thi này trước đó và không thể tham gia lại.'
        };
        res.status(400).json({ success: false, message: msgs[error.message] || "Lỗi khởi tạo bài thi" });
    }
}
async function submitExam(req, res) {
    try {
        const student_id = await getStudentId(req.session.user.user_id);
        const attempt_id = req.params.attempt_id;
        const answersArray = req.body.answers; 
        if (!Array.isArray(answersArray)) return res.status(400).json({ success: false, message: "Sai định dạng đáp án" });
        const result = await takeExamModel.submitAndGrade(attempt_id, student_id, answersArray);
        
        res.json({ 
            success: true, 
            message: "Nộp bài thành công!", 
            result: { điểm_số: result.totalScore, số_câu_đúng: result.correctCount }
        });
    } catch (error) {
        console.error(error);
        if (error.message === 'ALREADY_SUBMITTED') return res.status(400).json({ success: false, message: "Bài thi này đã được nộp trước đó" });
        res.status(500).json({ success: false, message: "Lỗi hệ thống khi nộp bài" });
    }
}
async function checkRoomStatus(req, res) {
    try {
        const student_id = await getStudentId(req.session.user.user_id);
        const attempt_id = req.params.attempt_id;
        const attempt = await takeExamModel.getAttemptRoomStatus(attempt_id, student_id);
        if (!attempt) {
            return res.status(404).json({ success: false, message: "Không tìm thấy lượt thi" });
        }
        res.json({ success: true, room_status: attempt.room_status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi kiểm tra trạng thái phòng thi" });
    }
}
async function getLobbyInfo(req, res) {
    try {
        const student_id = await getStudentId(req.session.user.user_id);
        const room_id = req.params.room_id;
        const info = await takeExamModel.getStudentLobbyInfo(room_id, student_id);
        if (!info) {
            return res.status(404).json({ success: false, message: "Không tìm thấy thông tin phòng thi hoặc bạn chưa tham gia." });
        }
        res.json({ success: true, data: info });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi tải thông tin phòng chờ" });
    }
}

async function leaveLobby(req, res) {
    try {
        const student_id = await getStudentId(req.session.user.user_id);
        const room_id = req.params.room_id;
        await takeExamModel.leaveRoom(room_id, student_id);
        res.json({ success: true, message: "Đã rời phòng thi thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi rời phòng thi" });
    }
}

module.exports = { joinLobby, startAndFetchExam, submitExam, checkRoomStatus, getLobbyInfo, leaveLobby };