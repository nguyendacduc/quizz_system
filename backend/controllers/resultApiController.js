const resultModel = require('../models/resultModel');
const { getStudentId } = require('../helpers/profileHelper');
async function myHistory(req, res) {
    try {
        const student_id = await getStudentId(req.session.user.user_id);
        const history = await resultModel.getStudentHistory(student_id);
        
        res.json({ success: true, data: history });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi lấy lịch sử thi" });
    }
}
async function roomScoreboard(req, res) {
    try {
        const room_id = req.params.room_id;
        const scoreboard = await resultModel.getRoomScoreboard(room_id);
        
        res.json({ success: true, data: scoreboard });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi tải bảng điểm phòng thi" });
    }
}
module.exports = {
    myHistory,
    roomScoreboard
};