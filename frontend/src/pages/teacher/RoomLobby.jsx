import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { Users, Check, X, ArrowLeft, RefreshCw, Clock, Monitor, Play } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RoomLobby = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [roomInfo, setRoomInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pollingActive, setPollingActive] = useState(true);

    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'confirm', // 'confirm' or 'alert'
        onConfirm: null,
        onCancel: null
    });

    const fetchLobby = async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const res = await api.get(`/rooms/${roomId}/lobby`);
            if (res.data && res.data.success) {
                setStudents(res.data.data);
                if (res.data.room) {
                    setRoomInfo(res.data.room);
                }
                setError('');
            }
        } catch (err) {
            setError('Không thể tải danh sách phòng chờ. Bạn có thể không có quyền hoặc phòng không tồn tại.');
            console.error(err);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchLobby(true);
        
        const intervalId = setInterval(() => {
            if (pollingActive) {
                fetchLobby(false);
            }
        }, 5000);
        
        return () => clearInterval(intervalId);
    }, [roomId, pollingActive]);

    const handleStudentAction = async (studentId, action) => {
        try {
            const res = await api.put(`/rooms/${roomId}/students/${studentId}`, { action });
            if (res.data && res.data.success) {
                setStudents(students.map(s => {
                    if (s.student_id === studentId || s.student_code === studentId) {
                        return { ...s, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' };
                    }
                    return s;
                }));
                fetchLobby(false);
            }
        } catch (err) {
            setModal({
                isOpen: true,
                title: 'Thông báo',
                message: err.response?.data?.message || 'Có lỗi xảy ra khi xử lý duyệt sinh viên',
                type: 'alert',
                onConfirm: null
            });
        }
    };

    const handleGoBack = () => {
        const basePath = user.role_code === 'ADMIN' ? '/admin/rooms' : '/teacher/rooms';
        navigate(basePath);
    };

    const handleGoToMonitor = () => {
        const basePath = user.role_code === 'ADMIN' ? 'admin' : 'teacher';
        navigate(`/${basePath}/rooms/${roomId}/monitor`);
    };

    const executeStartExam = async () => {
        try {
            const res = await api.put(`/rooms/${roomId}/status`, { status: 'RUNNING' });
            if (res.data && res.data.success) {
                handleGoToMonitor();
            }
        } catch (err) {
            setModal({
                isOpen: true,
                title: 'Lỗi khởi tạo kỳ thi',
                message: err.response?.data?.message || 'Không thể phát đề và bắt đầu kỳ thi.',
                type: 'alert',
                onConfirm: null
            });
        }
    };

    const handleStartExam = () => {
        const approvedCount = students.filter(s => s.status === 'APPROVED').length;
        const message = approvedCount === 0 
            ? 'Chưa có sinh viên nào được duyệt. Bạn có chắc chắn muốn phát đề và bắt đầu kỳ thi ngay bây giờ?'
            : `Bạn đã duyệt ${approvedCount} sinh viên vào phòng. Bạn có chắc chắn muốn phát đề và bắt đầu kỳ thi ngay bây giờ?`;

        setModal({
            isOpen: true,
            title: 'Phát đề & Bắt đầu thi?',
            message: message,
            type: 'confirm',
            onConfirm: executeStartExam
        });
    };
    
    const pendingStudents = students.filter(s => s.status === 'PENDING');
    const approvedStudents = students.filter(s => s.status === 'APPROVED');

    return (
        <div>
            <div className="section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="btn btn-secondary" onClick={handleGoBack} style={{ padding: '8px' }}>
                        <ArrowLeft size={18} />
                    </button>
                    <h1 className="section-title">Phòng chờ duyệt sinh viên</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <Clock size={16} />
                        <span>Tự động làm mới mỗi 5s</span>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => fetchLobby(true)}>
                        <RefreshCw size={14} /> Tải lại
                    </button>
                    {(!roomInfo || roomInfo.status === 'WAITING') && (
                        <button className="btn btn-success btn-sm" onClick={handleStartExam} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Play size={14} /> Bắt đầu thi
                        </button>
                    )}
                    <button className="btn btn-primary btn-sm" onClick={handleGoToMonitor} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Monitor size={14} /> Giám sát phòng thi
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="spinner"></div>
            ) : (
                <div className="grid-2">
                    {/* Danh sách chờ duyệt */}
                    <div className="card">
                        <h3 className="card-title" style={{ color: 'var(--warning)', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Users size={20} />
                                <span>Đang chờ duyệt ({pendingStudents.length})</span>
                            </div>
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                            {pendingStudents.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                                    Không có sinh viên nào đang đợi duyệt
                                </p>
                            ) : (
                                pendingStudents.map((s) => (
                                    <div 
                                        key={s.room_student_id} 
                                        style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            padding: '12px 16px', 
                                            background: 'rgba(255,255,255,0.02)', 
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-color)' 
                                        }}
                                    >
                                        <div>
                                            <p style={{ fontWeight: '600' }}>{s.full_name}</p>
                                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                Mã SV: {s.student_code} | Lớp: {s.class_name}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                className="btn btn-success btn-sm" 
                                                style={{ padding: '6px' }}
                                                onClick={() => handleStudentAction(s.student_id || s.student_code, 'APPROVE')}
                                                title="Duyệt sinh viên"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button 
                                                className="btn btn-danger btn-sm" 
                                                style={{ padding: '6px' }}
                                                onClick={() => handleStudentAction(s.student_id || s.student_code, 'REJECT')}
                                                title="Từ chối sinh viên"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Danh sách đã duyệt */}
                    <div className="card">
                        <h3 className="card-title" style={{ color: 'var(--success)', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Users size={20} />
                                <span>Đã duyệt vào phòng ({approvedStudents.length})</span>
                            </div>
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                            {approvedStudents.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                                    Chưa có sinh viên nào được duyệt
                                </p>
                            ) : (
                                approvedStudents.map((s) => (
                                    <div 
                                        key={s.room_student_id} 
                                        style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            padding: '12px 16px', 
                                            background: 'rgba(16, 185, 129, 0.03)', 
                                            border: '1px solid rgba(16, 185, 129, 0.15)',
                                            borderRadius: '8px' 
                                        }}
                                    >
                                        <div>
                                            <p style={{ fontWeight: '600' }}>{s.full_name}</p>
                                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                Mã SV: {s.student_code} | Lớp: {s.class_name}
                                            </span>
                                        </div>
                                        <span className="badge badge-success">Đã duyệt</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Custom System Modal */}
            {modal.isOpen && (
                <div className="modal-overlay" style={{ zIndex: 10000 }}>
                    <div className="modal-container" style={{ maxWidth: '450px', textAlign: 'center' }}>
                        <h3 className="modal-header" style={{ justifyContent: 'center', borderBottom: 'none', paddingBottom: '10px' }}>
                            {modal.title}
                        </h3>
                        <div className="modal-body" style={{ color: 'var(--text-secondary)', fontSize: '15px', padding: '10px 20px 20px 20px' }}>
                            {modal.message}
                        </div>
                        <div className="modal-actions" style={{ justifyContent: 'center', borderTop: 'none', gap: '12px' }}>
                            {modal.type === 'confirm' ? (
                                <>
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        onClick={() => {
                                            setModal(prev => ({ ...prev, isOpen: false }));
                                            if (modal.onCancel) modal.onCancel();
                                        }}
                                    >
                                        Hủy
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-success" 
                                        onClick={() => {
                                            setModal(prev => ({ ...prev, isOpen: false }));
                                            if (modal.onConfirm) modal.onConfirm();
                                        }}
                                    >
                                        Xác nhận Bắt đầu
                                    </button>
                                </>
                            ) : (
                                <button 
                                    type="button" 
                                    className="btn btn-primary" 
                                    onClick={() => {
                                        setModal(prev => ({ ...prev, isOpen: false }));
                                        if (modal.onConfirm) modal.onConfirm();
                                    }}
                                    style={{ minWidth: '100px' }}
                                >
                                    Đóng
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomLobby;