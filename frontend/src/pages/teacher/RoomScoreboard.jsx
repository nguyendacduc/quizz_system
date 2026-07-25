import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { ArrowLeft, Award, List, BarChart3, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
const RoomScoreboard = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [scoreboard, setScoreboard] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        const fetchScoreboardAndChart = async () => {
            try {
                setLoading(true);
                
                const scoreRes = await api.get(`/results/teacher/rooms/${roomId}/scoreboard`);
                if (scoreRes.data && scoreRes.data.success) {
                    setScoreboard(scoreRes.data.data);
                }
                
                try {
                    const chartRes = await api.get(`/dashboard/rooms/${roomId}/chart`);
                    if (chartRes.data && chartRes.data.success) {
                        setChartData(chartRes.data.data);
                    }
                } catch (chartErr) {
                    console.error('Lỗi tải dữ liệu biểu đồ phổ điểm:', chartErr);
                }
            } catch (err) {
                setError('Không thể tải kết quả thi của phòng này.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchScoreboardAndChart();
    }, [roomId]);
    const handleGoBack = () => {
        const basePath = user.role_code === 'ADMIN' ? '/admin/rooms' : '/teacher/rooms';
        navigate(basePath);
    };
    const formatDuration = (seconds) => {
        if (!seconds) return '0s';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };
    
    const getChartOptions = () => ({
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Phổ điểm phòng thi',
                color: '#94a3b8',
                font: {
                    family: 'Outfit',
                    size: 16,
                    weight: 'bold'
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks: {
                    color: '#94a3b8'
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks: {
                    color: '#94a3b8',
                    stepSize: 1
                }
            }
        }
    });
    const getChartDataset = () => {
        if (!chartData || !chartData.labels) return null;
        return {
            labels: chartData.labels,
            datasets: [
                {
                    label: 'Số lượng sinh viên',
                    data: chartData.data,
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.6)',  
                        'rgba(245, 158, 11, 0.6)', 
                        'rgba(59, 130, 246, 0.6)', 
                        'rgba(16, 185, 129, 0.6)'  
                    ],
                    borderColor: [
                        '#ef4444',
                        '#f59e0b',
                        '#3b82f6',
                        '#10b981'
                    ],
                    borderWidth: 1.5,
                    borderRadius: 8
                }
            ]
        };
    };
    const chartDataset = getChartDataset();
    return (
        <div>
            <div className="section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="btn btn-secondary" onClick={handleGoBack} style={{ padding: '8px' }}>
                        <ArrowLeft size={18} />
                    </button>
                    <h1 className="section-title">Kết quả & Bảng điểm xếp hạng</h1>
                </div>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            {loading ? (
                <div className="spinner"></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    
                    { }
                    <div className="grid-3">
                        <div className="card" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {chartDataset ? (
                                <div style={{ width: '100%', height: '280px' }}>
                                    <Bar options={getChartOptions()} data={chartDataset} />
                                </div>
                            ) : (
                                <div style={{ color: 'var(--text-muted)' }}>Chưa có dữ liệu biểu đồ</div>
                            )}
                        </div>
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <h3 className="card-title">
                                <Trophy className="logo-icon" size={20} style={{ color: 'var(--warning)' }} />
                                Thành tích phòng thi
                            </h3>
                            {scoreboard.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div className="avatar" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', width: '38px', height: '38px' }}>1</div>
                                        <div>
                                            <p style={{ fontWeight: '600', fontSize: '15px' }}>{scoreboard[0].full_name}</p>
                                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Điểm số: {parseFloat(scoreboard[0].score || 0).toFixed(2)} | {formatDuration(scoreboard[0].duration_seconds)}</span>
                                        </div>
                                    </div>
                                    {scoreboard.length > 1 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div className="avatar" style={{ background: 'linear-gradient(135deg, #cbd5e1 0%, #64748b 100%)', width: '38px', height: '38px' }}>2</div>
                                            <div>
                                                <p style={{ fontWeight: '600', fontSize: '15px' }}>{scoreboard[1].full_name}</p>
                                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Điểm số: {parseFloat(scoreboard[1].score || 0).toFixed(2)} | {formatDuration(scoreboard[1].duration_seconds)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Chưa có sinh viên nào nộp bài thi.</p>
                            )}
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '15px' }}>
                                <span>Thứ tự xếp hạng dựa trên Điểm số cao nhất và Thời gian làm bài ngắn nhất.</span>
                            </div>
                        </div>
                    </div>
                    { }
                    <div className="card">
                        <h3 className="card-title">
                            <List className="logo-icon" size={20} />
                            <span>Bảng kết quả xếp hạng thi trắc nghiệm</span>
                        </h3>
                        <div className="table-container" style={{ marginTop: '15px' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '80px', textAlign: 'center' }}>Hạng</th>
                                        <th>Mã SV</th>
                                        <th>Họ và tên</th>
                                        <th>Lớp học</th>
                                        <th>Điểm thi</th>
                                        <th>Số câu đúng</th>
                                        <th>Thời gian làm</th>
                                        <th>Nộp bài lúc</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scoreboard.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                                Chưa có sinh viên nào nộp bài thi.
                                            </td>
                                        </tr>
                                    ) : (
                                        scoreboard.map((s, idx) => (
                                            <tr key={s.attempt_id}>
                                                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                                                </td>
                                                <td style={{ fontWeight: '600' }}>{s.student_code}</td>
                                                <td>{s.full_name}</td>
                                                <td>{s.class_name}</td>
                                                <td style={{ fontWeight: '800', color: 'var(--primary)' }}>{parseFloat(s.score || 0).toFixed(2)} / 10.00</td>
                                                <td>{s.correct_answers} / {s.total_questions}</td>
                                                <td>{formatDuration(s.duration_seconds)}</td>
                                                <td>{new Date(s.submit_time).toLocaleTimeString('vi-VN')} {new Date(s.submit_time).toLocaleDateString('vi-VN')}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default RoomScoreboard;