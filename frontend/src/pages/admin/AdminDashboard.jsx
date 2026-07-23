import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Link } from 'react-router-dom';
import { Users, UserCheck, FileQuestion, BookOpen, GraduationCap, BarChart2, Sliders } from 'lucide-react';
const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard/overview');
                if (res.data && res.data.success) {
                    setStats(res.data.data);
                }
            } catch (err) {
                setError('Không thể tải dữ liệu thống kê từ server');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);
    if (loading) return <div className="spinner"></div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    return (
        <div>
            <div className="section-header">
                <h1 className="section-title">Tổng quan hệ thống</h1>
            </div>
            <div className="grid-4" style={{ marginBottom: '30px' }}>
                <div className="card stats-widget">
                    <div className="stats-icon blue">
                        <Users size={24} />
                    </div>
                    <div className="stats-data">
                        <span className="stats-value">{stats?.total_users}</span>
                        <span className="stats-label">Tổng người dùng</span>
                    </div>
                </div>
                <div className="card stats-widget">
                    <div className="stats-icon purple">
                        <GraduationCap size={24} />
                    </div>
                    <div className="stats-data">
                        <span className="stats-value">{stats?.total_students}</span>
                        <span className="stats-label">Sinh viên</span>
                    </div>
                </div>
                <div className="card stats-widget">
                    <div className="stats-icon emerald">
                        <UserCheck size={24} />
                    </div>
                    <div className="stats-data">
                        <span className="stats-value">{stats?.total_teachers}</span>
                        <span className="stats-label">Giảng viên</span>
                    </div>
                </div>
                <div className="card stats-widget">
                    <div className="stats-icon rose">
                        <FileQuestion size={24} />
                    </div>
                    <div className="stats-data">
                        <span className="stats-value">{stats?.total_questions}</span>
                        <span className="stats-label">Tổng câu hỏi</span>
                    </div>
                </div>
            </div>
            <div className="grid-2">
                <div className="card">
                    <h3 className="card-title">
                        <BookOpen size={20} className="logo-icon" />
                        Hoạt động đề thi
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '48px', fontWeight: '800', fontFamily: 'var(--font-display)' }}>
                            {stats?.total_exams}
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                            Đề thi trắc nghiệm đã được biên soạn và phân bổ trên ngân hàng đề.
                        </span>
                    </div>
                </div>
                <div className="card">
                    <h3 className="card-title">
                        <Sliders size={20} className="logo-icon" />
                        Lối tắt quản trị
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <Link to="/admin/users" className="quick-link-item">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Users size={16} style={{ color: 'var(--primary)' }} />
                                <span style={{ color: 'var(--text-primary)' }}>Quản lý người dùng</span>
                            </div>
                            <span className="quick-link-arrow">Xem thêm →</span>
                        </Link>
                        <Link to="/admin/system" className="quick-link-item">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <BookOpen size={16} style={{ color: 'var(--primary)' }} />
                                <span style={{ color: 'var(--text-primary)' }}>Thiết lập hệ thống</span>
                            </div>
                            <span className="quick-link-arrow">Xem thêm →</span>
                        </Link>
                        <Link to="/admin/statistics" className="quick-link-item">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <BarChart2 size={16} style={{ color: 'var(--primary)' }} />
                                <span style={{ color: 'var(--text-primary)' }}>Báo cáo thống kê</span>
                            </div>
                            <span className="quick-link-arrow">Xem thêm →</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AdminDashboard;