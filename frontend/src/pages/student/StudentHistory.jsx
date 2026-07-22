import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { ClipboardList, Eye, Award, Calendar, Clock } from 'lucide-react';
const StudentHistory = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/results/student/history');
                if (res.data && res.data.success) {
                    setHistory(res.data.data);
                }
            } catch (err) {
                setError('Không thể tải lịch sử thi của bạn.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);
    const formatDuration = (seconds) => {
        if (!seconds) return '0s';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };
    return (
        <div>
            <div className="section-header">
                <h1 className="section-title">Lịch sử thi trắc nghiệm</h1>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            {loading ? (
                <div className="spinner"></div>
            ) : (
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Mã đề</th>
                                    <th>Tên đề thi</th>
                                    <th>Phòng thi</th>
                                    <th>Điểm số</th>
                                    <th>Số câu đúng</th>
                                    <th>Thời gian làm</th>
                                    <th>Thời điểm nộp</th>
                                    <th style={{ textAlign: 'center' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                            Bạn chưa thực hiện bài thi trắc nghiệm nào.
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((item) => (
                                        <tr key={item.attempt_id}>
                                            <td style={{ fontWeight: '600', fontFamily: 'monospace' }}>{item.exam_code}</td>
                                            <td>{item.exam_name}</td>
                                            <td>{item.room_name} ({item.room_code})</td>
                                            <td style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '15px' }}>
                                                {parseFloat(item.score || 0).toFixed(2)}
                                            </td>
                                            <td>{item.correct_answers} / {item.total_questions}</td>
                                            <td>{formatDuration(item.duration_seconds)}</td>
                                            <td>{item.submit_time ? new Date(item.submit_time).toLocaleString('vi-VN') : 'Chưa có thông tin'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    style={{ padding: '6px 12px' }}
                                                    onClick={() => navigate(`/student/results/${item.attempt_id}`)}
                                                >
                                                    <Eye size={14} /> Chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
export default StudentHistory;