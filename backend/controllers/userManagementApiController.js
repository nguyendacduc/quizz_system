const bcrypt = require('bcrypt');
const userManagementModel = require('../models/userManagementModel');
const activityLogModel = require('../models/activityLogModel');
async function listStudents(req, res) {
    try {
        const keyword = req.query.keyword || '';
        const students = await userManagementModel.getStudents(keyword);
        res.json({ success: true, data: students });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách sinh viên" });
    }
}
async function addStudent(req, res) {
    try {
        const { username, password, student_code, full_name, gender, date_of_birth, email, phone, address, class_id, avatar } = req.body;
        if (!username || !password || !student_code || !full_name || !email || !class_id || !date_of_birth) {
            return res.status(400).json({ success: false, message: "Vui lòng điền đủ các trường bắt buộc (*)" });
        }
        
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const studentData = { student_code, full_name, gender, date_of_birth, email, phone, address, class_id, avatar };
        await userManagementModel.createStudentTransaction(username, password_hash, 3, studentData);
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(actorId, 'QUẢN LÝ NGƯỜI DÙNG', `Quản trị viên ${actorName} đã thêm mới sinh viên ${full_name} (${username}).`, req.ip);
        res.status(201).json({ success: true, message: "Thêm sinh viên thành công" });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "Tài khoản, Email hoặc Mã SV đã tồn tại" });
        }
        res.status(500).json({ success: false, message: "Lỗi khi thêm sinh viên" });
    }
}
async function editStudent(req, res) {
    try {
        const student_id = req.params.student_id;
        const { student_code, full_name, gender, date_of_birth, email, phone, address, class_id, avatar } = req.body;
        if (!student_code || !full_name || !email || !class_id || !date_of_birth) {
            return res.status(400).json({ success: false, message: "Vui lòng điền đủ các trường bắt buộc (*)" });
        }
        const studentData = { student_code, full_name, gender, date_of_birth, email, phone, address, class_id, avatar };
        await userManagementModel.updateStudent(student_id, studentData);
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(actorId, 'QUẢN LÝ NGƯỜI DÙNG', `Quản trị viên ${actorName} đã chỉnh sửa thông tin sinh viên ${full_name} (Mã số: ${student_code}).`, req.ip);
        res.json({ success: true, message: "Cập nhật thông tin sinh viên thành công" });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "Mã SV hoặc Email đã tồn tại ở tài khoản khác" });
        }
        res.status(500).json({ success: false, message: "Lỗi khi sửa thông tin sinh viên" });
    }
}
async function deleteStudent(req, res) {
    try {
        const student_id = req.params.student_id;
        await userManagementModel.deleteStudentTransaction(student_id);
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(actorId, 'QUẢN LÝ NGƯỜI DÙNG', `Quản trị viên ${actorName} đã xóa mềm tài khoản sinh viên ID #${student_id} (Vô hiệu hóa).`, req.ip);
        res.json({ success: true, message: "Xóa sinh viên thành công (lịch sử thi được bảo toàn)" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server khi xóa sinh viên" });
    }
}
async function listTeachers(req, res) {
    try {
        const keyword = req.query.keyword || '';
        const teachers = await userManagementModel.getTeachers(keyword);
        res.json({ success: true, data: teachers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách giáo viên" });
    }
}
async function addTeacher(req, res) {
    try {
        const { username, password, teacher_code, full_name, gender, date_of_birth, email, phone, address, department_id, avatar } = req.body;
        if (!username || !password || !teacher_code || !full_name || !email || !department_id || !date_of_birth) {
            return res.status(400).json({ success: false, message: "Vui lòng điền đủ các trường bắt buộc (*)" });
        }
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const teacherData = { teacher_code, full_name, gender, date_of_birth, email, phone, address, department_id, avatar };
        await userManagementModel.createTeacherTransaction(username, password_hash, 2, teacherData);
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(actorId, 'QUẢN LÝ NGƯỜI DÙNG', `Quản trị viên ${actorName} đã thêm mới giáo viên ${full_name} (${username}).`, req.ip);
        res.status(201).json({ success: true, message: "Thêm giáo viên thành công" });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "Tài khoản, Email hoặc Mã GV đã tồn tại" });
        }
        res.status(500).json({ success: false, message: "Lỗi khi thêm giáo viên" });
    }
}
async function editTeacher(req, res) {
    try {
        const teacher_id = req.params.teacher_id;
        const { teacher_code, full_name, gender, date_of_birth, email, phone, address, department_id, avatar } = req.body;
        if (!teacher_code || !full_name || !email || !department_id || !date_of_birth) {
            return res.status(400).json({ success: false, message: "Vui lòng điền đủ các trường bắt buộc (*)" });
        }
        const teacherData = { teacher_code, full_name, gender, date_of_birth, email, phone, address, department_id, avatar };
        await userManagementModel.updateTeacher(teacher_id, teacherData);
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(actorId, 'QUẢN LÝ NGƯỜI DÙNG', `Quản trị viên ${actorName} đã chỉnh sửa hồ sơ giáo viên ${full_name} (Mã số: ${teacher_code}).`, req.ip);
        res.json({ success: true, message: "Cập nhật thông tin giáo viên thành công" });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "Mã GV hoặc Email đã tồn tại ở tài khoản khác" });
        }
        res.status(500).json({ success: false, message: "Lỗi khi sửa thông tin giáo viên" });
    }
}
async function deleteTeacher(req, res) {
    try {
        const teacher_id = req.params.teacher_id;
        await userManagementModel.deleteTeacherTransaction(teacher_id);
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(actorId, 'QUẢN LÝ NGƯỜI DÙNG', `Quản trị viên ${actorName} đã xóa mềm giáo viên ID #${teacher_id} (Vô hiệu hóa).`, req.ip);
        res.json({ success: true, message: "Xóa giáo viên thành công (câu hỏi/đề thi được bảo toàn)" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server khi xóa giáo viên" });
    }
}
async function listAccounts(req, res) {
    try {
        const keyword = req.query.keyword || '';
        const accounts = await userManagementModel.getAccounts(keyword);
        res.json({ success: true, data: accounts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách tài khoản" });
    }
}
async function deleteAccount(req, res) {
    try {
        const user_id = req.params.user_id;
        await userManagementModel.deleteAccountTransaction(user_id);
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(actorId, 'QUẢN LÝ NGƯỜI DÙNG', `Quản trị viên ${actorName} đã xóa mềm tài khoản hệ thống ID #${user_id} (Vô hiệu hóa).`, req.ip);
        res.json({ success: true, message: "Xóa tài khoản thành công (dữ liệu liên kết được bảo toàn)" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server khi xóa tài khoản" });
    }
}
async function changeUserStatus(req, res) {
    try {
        const user_id = req.params.id;
        const { is_active } = req.body;
        if (typeof is_active !== 'boolean') {
            return res.status(400).json({ success: false, message: "Trạng thái is_active phải là true/false" });
        }
        await userManagementModel.toggleUserStatus(user_id, is_active);
    
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(actorId, 'BẢO MẬT HỆ THỐNG', `Quản trị viên ${actorName} đã ${is_active ? 'MỞ KHÓA' : 'KHÓA'} tài khoản đăng nhập ID #${user_id}.`, req.ip);
        res.json({ success: true, message: `Tài khoản đã được ${is_active ? 'MỞ KHÓA' : 'KHÓA'} thành công` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi khi đổi trạng thái tài khoản" });
    }
}
async function resetPassword(req, res) {
    try {
        const user_id = req.params.user_id;
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập mật khẩu mới" });
        }
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        await userManagementModel.resetUserPassword(user_id, password_hash);
        const actorId = req.session.user.user_id;
        const actorName = req.session.user.username;
        await activityLogModel.logActivity(actorId, 'BẢO MẬT HỆ THỐNG', `Quản trị viên ${actorName} đã thay đổi mật khẩu cho tài khoản đăng nhập ID #${user_id}.`, req.ip);
        res.json({ success: true, message: "Đổi mật khẩu tài khoản thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server khi đổi mật khẩu" });
    }
}
module.exports = {
    listStudents,
    addStudent,
    editStudent,
    deleteStudent,
    
    listTeachers,
    addTeacher,
    editTeacher,
    deleteTeacher,
    
    listAccounts,
    deleteAccount,
    
    changeUserStatus,
    resetPassword
};