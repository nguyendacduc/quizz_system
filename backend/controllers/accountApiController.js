const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

async function getMyProfile(req, res) {
    try {
        const { user_id, role_code } = req.session.user;
        const profile = await userModel.getProfile(user_id, role_code);
        
        res.json({ success: true, data: profile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy thông tin" });
    }
}

async function updateMyProfile(req, res) {
    try {
        const { user_id, role_code } = req.session.user;
        const { phone, address, avatar } = req.body;

        await userModel.updateProfile(user_id, role_code, phone, address, avatar);
        
        req.session.user.avatar = avatar || null;
        
        res.json({ success: true, message: "Cập nhật thông tin thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server khi cập nhật thông tin" });
    }
}

async function changePassword(req, res) {
    try {
        const { old_password, new_password } = req.body;
        const user_id = req.session.user.user_id;

        if (!old_password || !new_password) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập mật khẩu cũ và mới" });
        }

        const user = await userModel.findUserById(user_id);
        const isMatch = await bcrypt.compare(old_password, user.password_hash);
        
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Mật khẩu cũ không chính xác" });
        }

        const salt = await bcrypt.genSalt(10);
        const new_password_hash = await bcrypt.hash(new_password, salt);
        
        await userModel.updatePassword(user_id, new_password_hash);

        res.json({ success: true, message: "Đổi mật khẩu thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server khi đổi mật khẩu" });
    }
}

module.exports = {
    getMyProfile,
    updateMyProfile,
    changePassword
};