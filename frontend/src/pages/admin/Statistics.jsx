import React, { useState, useEffect } from 'react';
import api from '../../api';
import { 
    BarChart3, TrendingUp, Users, BookOpen, Layers, 
    CheckCircle2, XCircle, Award, HelpCircle, Activity
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
);
const Statistics = () => {
    const [overview, setOverview] = useState(null);
    const [detailedStats, setDetailedStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const fetchAllStats = async () => {
        try {
            setLoading(true);
            setError('');
            
            const [overviewRes, detailedRes] = await Promise.all([
                api.get('/dashboard/overview'),
                api.get('/dashboard/statistics')
            ]);
            if (overviewRes.data && overviewRes.data.success) {
                setOverview(overviewRes.data.data);
            }
            if (detailedRes.data && detailedRes.data.success) {
                setDetailedStats(detailedRes.data.data);
            }
        } catch (err) {
            console.error('Lỗi lấy dữ liệu thống kê:', err);
            setError('Không thể kết nối tới server để lấy dữ liệu thống kê.');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchAllStats();
    }, []);
    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '15px', color: 'var(--text-secondary)' }}>Đang tổng hợp dữ liệu thống kê từ server...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '40px', borderColor: 'var(--danger)' }}>
                <XCircle size={48} style={{ color: 'var(--danger)', marginBottom: '15px' }} />
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>Đã xảy ra lỗi</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>{error}</p>
                <button className="btn btn-primary" onClick={fetchAllStats}>Tải lại dữ liệu</button>
            </div>
        );
    }
    const hasTrendData = detailedStats?.examTrend && detailedStats.examTrend.length > 0;
    const trendLabels = hasTrendData ? detailedStats.examTrend.map(t => t.month_label) : [];
    const trendValues = hasTrendData ? detailedStats.examTrend.map(t => t.count) : [];
    const trendChartData = {
        labels: trendLabels,
        datasets: [
            {
                label: 'Lượt nộp bài thi',
                data: trendValues,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#3b82f6',
                pointHoverRadius: 7
            }
        ]
    };

    const passCount = detailedStats?.passFailRatio?.pass_count || 0;
    const failCount = detailedStats?.passFailRatio?.fail_count || 0;
    const hasRatioData = passCount > 0 || failCount > 0;
    
    const ratioChartData = {
        labels: ['Đỗ (Điểm >= Đạt)', 'Trượt (Điểm < Đạt)'],
        datasets: [
            {
                data: hasRatioData ? [passCount, failCount] : [0, 0], 
                backgroundColor: ['#10b981', '#ef4444'],
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                hoverOffset: 4
            }
        ]
    };

    const hasSubjectQuestions = detailedStats?.subjectQuestions && detailedStats.subjectQuestions.length > 0;
    const subjectLabels = hasSubjectQuestions ? detailedStats.subjectQuestions.map(s => s.subject_name) : [];
    const subjectQuestionCounts = hasSubjectQuestions ? detailedStats.subjectQuestions.map(s => s.count) : [];
    const subjectChartData = {
        labels: subjectLabels,
        datasets: [
            {
                label: 'Số lượng câu hỏi',
                data: subjectQuestionCounts,
                backgroundColor: 'rgba(245, 158, 11, 0.7)',
                borderColor: '#f59e0b',
                borderWidth: 1,
                borderRadius: 4
            }
        ]
    };

    const roomStatusStats = detailedStats?.roomStatus || [];
    const hasRoomStatusData = roomStatusStats.length > 0;
    
    const statusTranslate = {
        'WAITING': 'Đang chờ',
        'RUNNING': 'Đang thi',
        'FINISHED': 'Đã kết thúc',
        'CANCELLED': 'Đã hủy'
    };
    
    const statusColors = {
        'WAITING': '#eab308',
        'RUNNING': '#3b82f6',
        'FINISHED': '#10b981',
        'CANCELLED': '#6b7280'
    };

    const roomStatusLabels = hasRoomStatusData ? roomStatusStats.map(r => statusTranslate[r.status] || r.status) : [];
    const roomStatusValues = hasRoomStatusData ? roomStatusStats.map(r => r.count) : [];
    const roomStatusBgColors = hasRoomStatusData ? roomStatusStats.map(r => statusColors[r.status] || '#a855f7') : [];
    const roomStatusChartData = {
        labels: roomStatusLabels,
        datasets: [
            {
                data: roomStatusValues,
                backgroundColor: roomStatusBgColors,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1
            }
        ]
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '30px' }}>
            <div className="section-header" style={{ marginBottom: '0' }}>
                <h1 className="section-title">Thống kê chi tiết hệ thống</h1>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Activity size={14} className="text-success" />
                    <span>Dữ liệu cập nhật theo thời gian thực</span>
                </div>
            </div>

            {overview && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px' }}>
                        <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                            <Users size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Tổng sinh viên</div>
                            <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '2px' }}>{overview.total_students}</div>
                        </div>
                    </div>

                    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px' }}>
                        <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                            <Award size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Tổng giảng viên</div>
                            <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '2px' }}>{overview.total_teachers}</div>
                        </div>
                    </div>

                    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px' }}>
                        <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Ngân hàng câu hỏi</div>
                            <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '2px' }}>{overview.total_questions}</div>
                        </div>
                    </div>

                    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px' }}>
                        <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                            <Layers size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Số đề thi đã tạo</div>
                            <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '2px' }}>{overview.total_exams}</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid-2" style={{ gap: '20px' }}>
                <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                        <div>
                            <h3 className="card-title" style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <TrendingUp size={18} className="text-primary" />
                                Xu hướng làm bài trắc nghiệm
                            </h3>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                Lượng nộp bài thi của sinh viên theo các tháng
                            </span>
                        </div>
                    </div>
                    <div style={{ flex: 1, minHeight: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {hasTrendData ? (
                            <Line 
                                data={trendChartData} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false }
                                    },
                                    scales: {
                                        y: {
                                            grid: { color: 'rgba(255, 255, 255, 0.05)' },
                                            ticks: { color: '#888', precision: 0 }
                                        },
                                        x: {
                                            grid: { display: false },
                                            ticks: { color: '#888' }
                                        }
                                    }
                                }} 
                            />
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                                <BarChart3 size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                                <div>Chưa có dữ liệu làm bài thi</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                        <div>
                            <h3 className="card-title" style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle2 size={18} className="text-success" />
                                Tỷ lệ Đỗ / Trượt toàn hệ thống
                            </h3>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                Thống kê tỷ lệ đạt (điểm &gt;= điểm chuẩn đạt)
                            </span>
                        </div>
                    </div>
                    <div style={{ flex: 1, minHeight: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        {hasRatioData ? (
                            <>
                                <div style={{ width: '220px', height: '220px' }}>
                                    <Doughnut 
                                        data={ratioChartData} 
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'bottom',
                                                    labels: { color: '#ccc', font: { size: 11 } }
                                                }
                                            },
                                            cutout: '65%'
                                        }}
                                    />
                                </div>
                                <div style={{ position: 'absolute', top: '44%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                                        {Math.round((passCount / (passCount + failCount)) * 100)}%
                                    </div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>Tỷ lệ đỗ</div>
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                                <CheckCircle2 size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                                <div>Chưa có dữ liệu đỗ / trượt</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                        <div>
                            <h3 className="card-title" style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BookOpen size={18} className="text-warning" />
                                Phân bố câu hỏi theo môn học
                            </h3>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                Số lượng câu hỏi đang hoạt động trong mỗi môn học
                            </span>
                        </div>
                    </div>
                    <div style={{ flex: 1, minHeight: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {hasSubjectQuestions ? (
                            <Bar 
                                data={subjectChartData} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false }
                                    },
                                    scales: {
                                        y: {
                                            grid: { color: 'rgba(255, 255, 255, 0.05)' },
                                            ticks: { color: '#888', precision: 0 }
                                        },
                                        x: {
                                            grid: { display: false },
                                            ticks: { color: '#888' }
                                        }
                                    }
                                }} 
                            />
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                                <BookOpen size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                                <div>Chưa có câu hỏi nào trong môn học</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                        <div>
                            <h3 className="card-title" style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Layers size={18} className="text-success" />
                                Phân bố trạng thái các phòng thi
                            </h3>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                Tỷ lệ phòng thi theo các trạng thái hoạt động
                            </span>
                        </div>
                    </div>
                    <div style={{ flex: 1, minHeight: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {hasRoomStatusData ? (
                            <div style={{ width: '220px', height: '220px' }}>
                                <Doughnut 
                                    data={roomStatusChartData} 
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                                labels: { color: '#ccc', font: { size: 11 } }
                                            }
                                        },
                                        cutout: '65%'
                                    }}
                                />
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                                <Layers size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                                <div>Chưa có phòng thi nào được tạo</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Statistics;