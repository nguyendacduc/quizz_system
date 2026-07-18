import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { ArrowLeft, Clock, RefreshCw, Monitor, Play, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
const RoomMonitor = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [liveData, setLiveData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pollingActive, setPollingActive] = useState(true);
    const fetchMonitorData = async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const res = await api.get(`/rooms/${roomId}/monitor`);
            if (res.data && res.data.success) {
                setLiveData(res.data.data);
                setError('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi tải dữ liệu giám sát. Đảm bảo phòng thi đang trạng thái RUNNING.');
            console.error(err);
        } finally {
            if (showLoading) setLoading(false);
        }
    };
    useEffect(() => {
        fetchMonitorData(true);
        const intervalId = setInterval(() => {
            if (pollingActive) {
                fetchMonitorData(false);
            }
        }, 5000);
        return () => clearInterval(intervalId);
    }, [roomId, pollingActive]);
    const handleGoBack = () => {
        const basePath = user.role_code === 'ADMIN' ? '/admin/rooms' : '/teacher/rooms';
        navigate(basePath);
    };
    const handleGoToLobby = () => {
        const basePath = user.role_code === 'ADMIN' ? 'admin' : 'teacher';
        navigate(`/${basePath}/rooms/${roomId}/lobby`);
    };
    const getAttemptStatusBadge = (status) => {
        switch (status) {
            case 'NOT_STARTED':
                return <span className="badge badge-secondary">Chưa bắt đầu</span>;
            case 'IN_PROGRESS':
                return <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                    <Play size={12} className="logo-icon" /> Đang làm bài
                </span>;
            case 'SUBMITTED':
                return <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                    <CheckCircle size={12} /> Đã nộp bài
                </span>;
            default:
                return <span className="badge badge-primary">{status}</span>;
        }
    };
    const activeCount = liveData.filter(s => s.attempt_status === 'IN_PROGRESS').length;
    const submittedCount = liveData.filter(s => s.attempt_status === 'SUBMITTED').length;
    const notStartedCount = liveData.filter(s => s.attempt_status === 'NOT_STARTED').length;
    return (
        <div>
            <div className="section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="btn btn-secondary" onClick={handleGoBack} style={{ padding: '8px' }}>
                        <ArrowLeft size={18} />
                    </button>
                    <h1 className="section-title">Giám sát phòng thi realtime</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <Clock size={16} />
                        <span>Tự động làm mới mỗi 5s</span>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => fetchMonitorData(true)}>
                        <RefreshCw size={14} /> Tải lại
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={handleGoToLobby} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} /> Phòng chờ duyệt
                    </button>
                </div>
            </div>
            {error ? (
                <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={20} />
                    <div>{error}</div>
                </div>
            ) : loading ? (
                <div className="spinner"></div>
            ) : (
                <div>
                    { }
                    <div className="grid-3" style={{ marginBottom: '24px' }}>
                        <div className="card stats-widget">
                            <div className="stats-icon purple">
                                <Monitor size={24} />
                            </div>
                            <div className="stats-data">
                                <span className="stats-value">{liveData.length}</span>
                                <span className="stats-label">Sĩ số phòng thi</span>
                            </div>
                        </div>
                        <div className="card stats-widget">
                            <div className="stats-icon blue">
                                <Play size={24} />
                            </div>
                            <div className="stats-data">
                                <span className="stats-value">{activeCount}</span>
                                <span className="stats-label">Đang làm bài</span>
                            </div>
                        </div>
                        <div className="card stats-widget">
                            <div className="stats-icon emerald">
                                <CheckCircle size={24} />
                            </div>
                            <div className="stats-data">
                                <span className="stats-value">{submittedCount}</span>
                                <span className="stats-label">Đã nộp bài</span>
                            </div>
                        </div>
                    </div>
                    { }
                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Mã SV</th>
                                        <th>Họ và tên</th>
                                        <th>Trạng thái làm bài</th>
                                        <th>Thời gian bắt đầu</th>
                                        <th>Thời gian nộp bài</th>
                                        <th>Điểm số</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {liveData.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                                Chưa có sinh viên nào tham gia phòng thi này.
                                            </td>
                                        </tr>
                                    ) : (
                                        liveData.map((s) => (
                                            <tr key={s.student_id}>
                                                <td style={{ fontWeight: '600' }}>{s.student_code}</td>
                                                <td>{s.full_name}</td>
                                                <td>{getAttemptStatusBadge(s.attempt_status)}</td>
                                                <td>{s.start_time ? new Date(s.start_time).toLocaleTimeString('vi-VN') : '-'}</td>
                                                <td>{s.submit_time ? new Date(s.submit_time).toLocaleTimeString('vi-VN') : '-'}</td>
                                                <td style={{ fontWeight: 'bold', color: s.score !== null ? 'var(--primary)' : 'inherit' }}>
                                                    {s.score !== null ? parseFloat(s.score).toFixed(2) : '-'}
                                                </td>
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
export default RoomMonitor;