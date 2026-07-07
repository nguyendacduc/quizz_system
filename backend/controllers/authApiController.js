const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const activityLogModel = require('../models/activityLogModel');

async function register(req, res) {
    try {
        const { username, password, role_id } = req.body;

        if (!username || !password || !role_id) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đủ username, password và role_id" });
        }

        const existingUser = await userModel.findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Username đã tồn tại" });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUserId = await userModel.createUser(username, password_hash, role_id);

        res.status(201).json({
            success: true,
            message: "Đăng ký tài khoản thành công",
            data: { user_id: newUserId, username }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server khi đăng ký" });
    }
}

async function login(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập username và password" });
        }

        const user = await userModel.findUserByUsername(username);

        if (!user) {
            return res.status(401).json({ success: false, message: "Sai username hoặc password" });
        }
        if (!user.is_active) {
            return res.status(403).json({ success: false, message: "Tài khoản của bạn đã bị khóa" });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Sai username hoặc password" });
        }

        await userModel.updateLastLogin(user.user_id);
 
        const profile = await userModel.getProfile(user.user_id, user.role_code);

        req.session.user = {
            user_id: user.user_id,
            username: user.username,
            role_code: user.role_code,
            avatar: profile ? profile.avatar : null
        };

        await activityLogModel.logActivity(user.user_id, 'ĐĂNG NHẬP', `Tài khoản ${user.username} đã đăng nhập hệ thống.`, req.ip);
 
        res.json({
            success: true,
            message: "Đăng nhập thành công",
            user: req.session.user
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi server khi đăng nhập" });
    }
}

function logout(req, res) {
    if (req.session.user) {
        activityLogModel.logActivity(req.session.user.user_id, 'ĐĂNG XUẤT', `Tài khoản ${req.session.user.username} đã đăng xuất khỏi hệ thống.`, req.ip);
    }
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Lỗi khi đăng xuất" });
        }
        res.json({ success: true, message: "Đăng xuất thành công" });
    });
}

async function me(req, res) {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
    }
    
    try {
        const { user_id, role_code } = req.session.user;
        const profile = await userModel.getProfile(user_id, role_code);
        if (profile) {
            req.session.user.avatar = profile.avatar;
        }
    } catch (e) {
        console.error("Error fetching profile in /me:", e);
    }

    res.json({ success: true, user: req.session.user });
}

module.exports = { register, login, logout, me };