
function requireApiLogin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ 
            success: false, 
            message: "Bạn cần đăng nhập để thực hiện chức năng này" 
        });
    }
    next(); 
}

function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        
        const userRole = req.session.user.role_code;
        
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ 
                success: false, 
                message: "Bạn không có quyền truy cập chức năng này" 
            });
        }
        next();
    };
}

module.exports = {
    requireApiLogin,
    authorizeRoles
};