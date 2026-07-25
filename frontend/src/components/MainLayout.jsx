import React, { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    FileQuestion,
    FileText,
    DoorOpen,
    BarChart3,
    Bell,
    Settings,
    User,
    LogOut,
    Menu,
    X,
    ChevronRight,
    GraduationCap,
    BookOpen
} from 'lucide-react';
const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const getSidebarLinks = () => {
        if (!user) return [];
        const adminLinks = [
            { path: '/admin/dashboard', label: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
            { path: '/admin/users', label: 'Quản lý người dùng', icon: <Users size={20} /> },
            { path: '/admin/questions', label: 'Ngân hàng câu hỏi', icon: <FileQuestion size={20} /> },
            { path: '/admin/exams', label: 'Quản lý đề thi', icon: <FileText size={20} /> },
            { path: '/admin/rooms', label: 'Quản lý phòng thi', icon: <DoorOpen size={20} /> },
            { path: '/admin/statistics', label: 'Thống kê chi tiết', icon: <BarChart3 size={20} /> },
            { path: '/admin/notifications', label: 'Thông báo', icon: <Bell size={20} /> },
            { path: '/admin/system', label: 'Quản trị hệ thống', icon: <Settings size={20} /> },
        ];
        const teacherLinks = [
            { path: '/teacher/dashboard', label: 'Bảng điều khiển', icon: <LayoutDashboard size={20} /> },
            { path: '/teacher/questions', label: 'Ngân hàng câu hỏi', icon: <FileQuestion size={20} /> },
            { path: '/teacher/exams', label: 'Quản lý đề thi', icon: <FileText size={20} /> },
            { path: '/teacher/rooms', label: 'Quản lý phòng thi', icon: <DoorOpen size={20} /> },
            { path: '/teacher/notifications', label: 'Thông báo', icon: <Bell size={20} /> },
            { path: '/teacher/profile', label: 'Hồ sơ cá nhân', icon: <User size={20} /> },
        ];
        const studentLinks = [
            { path: '/student/dashboard', label: 'Vào phòng thi', icon: <DoorOpen size={20} /> },
            { path: '/student/history', label: 'Lịch sử thi', icon: <FileText size={20} /> },
            { path: '/student/notifications', label: 'Thông báo', icon: <Bell size={20} /> },
            { path: '/student/profile', label: 'Hồ sơ cá nhân', icon: <User size={20} /> },
        ];
        if (user.role_code === 'ADMIN') return adminLinks;
        if (user.role_code === 'TEACHER') return teacherLinks;
        if (user.role_code === 'STUDENT') return studentLinks;
        return [];
    };
    const links = getSidebarLinks();
    return (
        <div className="layout-container">
            { }
            <header className="topbar">
                <div className="topbar-left">
                    <button className="menu-btn" onClick={toggleSidebar}>
                        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                    <div className="logo-section">
                        <GraduationCap className="logo-icon" size={28} />
                        <span className="logo-text">QUIZ<span className="gradient-text">LABS</span></span>
                    </div>
                </div>
                <div className="topbar-right">
                    <div className="user-profile-badge" onClick={() => {
                        const path = user.role_code === 'STUDENT' ? '/student/profile' : '/teacher/profile';
                        if (user.role_code !== 'ADMIN') navigate(path);
                    }}>
                        <div className="avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                user?.username?.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="user-info">
                            <span className="username">{user?.username}</span>
                            <span className={`role-badge ${user?.role_code?.toLowerCase()}`}>
                                {user?.role_code === 'ADMIN' ? 'Quản trị viên' : user?.role_code === 'TEACHER' ? 'Giáo viên' : 'Sinh viên'}
                            </span>
                        </div>
                    </div>
                    
                    <button className="logout-btn" onClick={logout} title="Đăng xuất">
                        <LogOut size={18} />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </header>
            <div className="main-content-wrapper">
                { }
                <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                    <nav className="sidebar-nav">
                        {links.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{link.icon}</span>
                                <span className="nav-label">{link.label}</span>
                                <ChevronRight className="nav-chevron" size={14} />
                            </NavLink>
                        ))}
                    </nav>
                    <div className="sidebar-footer">
                        <p>© 2026 QuizLabs Platform</p>
                        <p>Designed by Vu Xuan Minh and Nguyen Dac Duc</p>
                    </div>
                </aside>
                { }
                <main className="page-content">
                    <div className="page-container">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
export default MainLayout;