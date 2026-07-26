const dashboardModel = require('../models/dashboardModel');
const { getTeacherId } = require('../helpers/profileHelper');
async function getOverviewStats(req, res) {
    try {
        const { user_id, role_code } = req.session.user;
        if (role_code === 'ADMIN') {
            const stats = await dashboardModel.getAdminOverview();
            return res.json({ success: true, data: stats });
        } 
        
        if (role_code === 'TEACHER') {
            const teacher_id = await getTeacherId(user_id);
            if (teacher_id) {
                const stats = await dashboardModel.getTeacherOverview(teacher_id);
                return res.json({ success: true, data: stats });
            }
        }
        res.status(403).json({ success: false, message: "Không có quyền xem thống kê" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi tải thống kê" });
    }
}
async function getChartData(req, res) {
    try {
        const room_id = req.params.room_id;
        const chartData = await dashboardModel.getScoreChartData(room_id);
        res.json({ success: true, data: chartData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi tải dữ liệu biểu đồ" });
    }
}
async function getDetailedStats(req, res) {
    try {
        const [examTrend, passFailRatio, subjectQuestions, roomStatus] = await Promise.all([
            dashboardModel.getExamTrend(),
            dashboardModel.getPassFailRatio(),
            dashboardModel.getQuestionsPerSubject(),
            dashboardModel.getRoomStatusStats()
        ]);
        res.json({
            success: true,
            data: {
                examTrend,
                passFailRatio,
                subjectQuestions,
                roomStatus
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi tải thống kê chi tiết" });
    }
}
module.exports = {
    getOverviewStats,
    getChartData,
    getDetailedStats
};