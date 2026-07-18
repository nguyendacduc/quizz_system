import React, { useState, useEffect } from 'react';
import api from '../../api';
import { DoorOpen, FileQuestion, FileText, CheckCircle, Clock } from 'lucide-react';
const TeacherDashboard = () => {
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
                <h1 className="section-title">Bảng điều khiển Giảng viên</h1>
            </div>
            <div className="grid-3" style={{ marginBottom: '30px' }}>
                <div className="card stats-widget">
                    <div className="stats-icon blue">
                        <FileQuestion size={24} />
                    </div>
                    <div className="stats-data">
                        <span className="stats-value">{stats?.my_questions}</span>
                        <span className="stats-label">Câu hỏi đã soạn</span>
                    </div>
                </div>
                <div className="card stats-widget">
                    <div className="stats-icon purple">
                        <FileText size={24} />
                    </div>
                    <div className="stats-data">
                        <span className="stats-value">{stats?.my_exams}</span>
                        <span className="stats-label">Đề thi của tôi</span>
                    </div>
                </div>
                <div className="card stats-widget">
                    <div className="stats-icon emerald">
                        <DoorOpen size={24} />
                    </div>
                    <div className="stats-data">
                        <span className="stats-value">{stats?.my_rooms}</span>
                        <span className="stats-label">Phòng thi đang quản lý</span>
                    </div>
                </div>
            </div>
            <div className="card">
                <h3 className="card-title">
                    Hướng dẫn quy trình thi trắc nghiệm
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Bước 1:</span>
                        <span>Soạn câu hỏi trong mục <strong>Ngân hàng câu hỏi</strong>. Phân loại theo Môn học, Chương và Mức độ khó.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Bước 2:</span>
                        <span>Tạo đề thi mới trong mục <strong>Quản lý đề thi</strong>. Sau đó sinh ngẫu nhiên số lượng câu hỏi tương ứng từ ngân hàng.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Bước 3:</span>
                        <span>Tạo phòng thi mới trong mục <strong>Quản lý phòng thi</strong>, chọn đề thi vừa soạn và đặt mật khẩu phòng (nếu cần).</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Bước 4:</span>
                        <span>Duyệt sinh viên xin vào phòng tại mục <strong>Phòng chờ</strong>, click <strong>Bắt đầu thi</strong> để phát đề. Giám sát trực tiếp bài làm của sinh viên tại mục <strong>Giám sát phòng thi</strong>.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default TeacherDashboard;