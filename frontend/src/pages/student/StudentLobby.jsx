import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { 
    Loader2, AlertCircle, CheckCircle2, Clock, Play, 
    LogOut, User, GraduationCap, FileText, HelpCircle, XCircle 
} from 'lucide-react';

const StudentLobby = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [lobbyInfo, setLobbyInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [error, setError] = useState('');

    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'confirm',
        onConfirm: null,
        onCancel: null
    });

    const fetchLobbyInfo = async (showSpinner = false) => {
        if (showSpinner) setLoading(true);
        try {
            const res = await api.get(`/student/exam/${roomId}/lobby-info`);
            if (res.data && res.data.success) {
                setLobbyInfo(res.data.data);
                setError('');
            }
        } catch (err) {
            console.error('Lỗi lấy thông tin phòng chờ:', err);
            setError(err.response?.data?.message || 'Không thể lấy thông tin phòng thi.');
        } finally {
            if (showSpinner) setLoading(false);
        }
    };

    useEffect(() => {
        fetchLobbyInfo(true);

        const intervalId = setInterval(() => {
            fetchLobbyInfo(false);
        }, 4000);

        return () => clearInterval(intervalId);
    }, [roomId]);

    const handleStartExam = async () => {
        setStarting(true);
        try {
            const res = await api.post(`/student/exam/${roomId}/start`);
            if (res.data && res.data.success) {
                const { attempt_id, exam } = res.data.data;
                localStorage.setItem('current_room_id', roomId);
                navigate(`/student/exam/${attempt_id}`, { state: { examData: exam } });
            }
        } catch (err) {
            setModal({
                isOpen: true,
                title: 'Thông báo',
                message: err.response?.data?.message || 'Không thể khởi tạo bài thi. Vui lòng kiểm tra lại.',
                type: 'alert',
                onConfirm: null
            });
            fetchLobbyInfo(false);
        } finally {
            setStarting(false);
        }
    };

    const executeLeave = async () => {
        setLeaving(true);
        try {
            await api.post(`/student/exam/${roomId}/leave`);
            navigate('/student/dashboard');
        } catch (err) {
            console.error('Lỗi khi rời phòng:', err);
            navigate('/student/dashboard');
        } finally {
            setLeaving(false);
        }
    };

    const handleLeaveLobby = () => {
        setModal({
            isOpen: true,
            title: 'Rời phòng thi?',
            message: 'Bạn có chắc chắn muốn rời phòng chờ không? Bạn sẽ phải nhập mã phòng và chờ duyệt lại từ đầu.',
            type: 'confirm',
            onConfirm: executeLeave
        });
    };

    if (loading) {
        return (
            <div className="lobby-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 size={40} className="spinner" style={{ animationDuration: '1.5s', marginBottom: '15px' }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Đang kết nối vào phòng thi...</p>
                </div>
            </div>
        );
    }

    if (error || !lobbyInfo) {
        return (
            <div className="lobby-container" style={{ maxWidth: '550px', margin: '40px auto' }}>
                <div className="card" style={{ textAlign: 'center', padding: '35px' }}>
                    <AlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: '15px' }} />
                    <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>Không thể truy cập</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '25px' }}>{error || 'Phòng thi không tồn tại hoặc bạn chưa được đăng ký.'}</p>
                    <button className="btn btn-secondary" onClick={() => navigate('/student/dashboard')}>
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        );
    }

    const { approval_status, room_status } = lobbyInfo;
    const isApproved = approval_status === 'APPROVED';
    const isPending = approval_status === 'PENDING';
    const isRejected = approval_status === 'REJECTED';
    const isRunning = room_status === 'RUNNING';
    const isWaitingRoom = room_status === 'WAITING';
    const isFinished = room_status === 'FINISHED';

    const canStart = isApproved && isRunning;

    return (
        <div style={{ maxWidth: '680px', margin: '30px auto', padding: '0 15px' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '22px', padding: '30px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '750', fontSize: '24px', marginBottom: '6px' }}>
                        Phòng chờ thi trắc nghiệm
                    </h2>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        Mã phòng: <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{lobbyInfo.room_code}</strong> | {lobbyInfo.room_name}
                    </span>
                </div>

                {/* Status Banner */}
                {isPending && (
                    <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
                        <Loader2 size={24} className="spinner" style={{ flexShrink: 0, animationDuration: '2s' }} />
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '15px' }}>Đang chờ Giảng viên duyệt vào phòng</div>
                            <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '2px' }}>
                                Giảng viên đang xem danh sách. Vui lòng giữ nguyên màn hình này, hệ thống sẽ tự động cập nhật.
                            </div>
                        </div>
                    </div>
                )}

                {isApproved && isWaitingRoom && (
                    <div className="alert alert-info" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
                        <CheckCircle2 size={24} style={{ flexShrink: 0, color: '#3b82f6' }} />
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '15px' }}>Đã được duyệt - Đang chờ Giảng viên mở đề thi</div>
                            <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '2px' }}>
                                Bạn đã được chấp nhận vào phòng thi. Nút "Bắt đầu làm bài thi" sẽ hoạt động ngay khi Giảng viên bấm Bắt đầu.
                            </div>
                        </div>
                    </div>
                )}

                {isApproved && isRunning && (
                    <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b981' }}>
                        <Play size={24} style={{ flexShrink: 0, color: '#10b981' }} />
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '15px', color: '#10b981' }}>Kỳ thi đã bắt đầu!</div>
                            <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '2px' }}>
                                Đề thi đã mở. Nhấn nút "Bắt đầu làm bài thi" bên dưới để tính giờ làm bài.
                            </div>
                        </div>
                    </div>
                )}

                {isRejected && (
                    <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
                        <XCircle size={24} style={{ flexShrink: 0 }} />
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '15px' }}>Yêu cầu bị từ chối</div>
                            <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '2px' }}>
                                Rất tiếc, Giảng viên đã từ chối duyệt bạn vào phòng thi này.
                            </div>
                        </div>
                    </div>
                )}

                {isFinished && (
                    <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
                        <AlertCircle size={24} style={{ flexShrink: 0 }} />
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '15px' }}>Phòng thi đã kết thúc</div>
                            <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '2px' }}>
                                Phòng thi này đã đóng hoặc thời gian thi đã kết thúc.
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirmation Box (Xác nhận thông tin sinh viên & đề thi) */}
                <div style={{ 
                    background: 'rgba(255, 255, 255, 0.02)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '12px', 
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', fontWeight: '700', marginBottom: '4px' }}>
                        📋 Thông tin xác nhận thi
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                <User size={18} />
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Họ và tên sinh viên</div>
                                <div style={{ fontSize: '14px', fontWeight: '600' }}>{lobbyInfo.full_name}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                                <GraduationCap size={18} />
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mã SV / Lớp</div>
                                <div style={{ fontSize: '14px', fontWeight: '600' }}>{lobbyInfo.student_code} ({lobbyInfo.class_name || 'Chưa xếp lớp'})</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                                <FileText size={18} />
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bài thi / Môn học</div>
                                <div style={{ fontSize: '14px', fontWeight: '600' }}>{lobbyInfo.exam_name}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                <HelpCircle size={18} />
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Số câu hỏi</div>
                                <div style={{ fontSize: '14px', fontWeight: '600' }}>{lobbyInfo.total_questions || 0} câu trắc nghiệm</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                                <Clock size={18} />
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Thời gian làm bài</div>
                                <div style={{ fontSize: '14px', fontWeight: '600' }}>{lobbyInfo.duration} phút</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                                <Clock size={18} />
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Thời gian phòng mở - đóng</div>
                                <div style={{ fontSize: '12px', fontWeight: '600' }}>
                                    {lobbyInfo.start_time ? new Date(lobbyInfo.start_time).toLocaleString('vi-VN') : 'Mở: Không giới hạn'}
                                    <br />
                                    {lobbyInfo.end_time ? new Date(lobbyInfo.end_time).toLocaleString('vi-VN') : 'Đóng: Không giới hạn'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                    {canStart ? (
                        <button 
                            className="btn btn-success btn-lg" 
                            onClick={handleStartExam} 
                            disabled={starting}
                            style={{ 
                                padding: '14px', 
                                fontSize: '16px', 
                                fontWeight: '700', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '10px',
                                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                            }}
                        >
                            {starting ? (
                                <>
                                    <Loader2 size={20} className="spinner" />
                                    <span>Đang tải đề thi...</span>
                                </>
                            ) : (
                                <>
                                    <Play size={20} />
                                    <span>Bắt đầu làm bài thi ngay</span>
                                </>
                            )}
                        </button>
                    ) : (
                        <button 
                            className="btn btn-primary btn-lg" 
                            disabled 
                            style={{ 
                                padding: '14px', 
                                fontSize: '15px', 
                                fontWeight: '600', 
                                opacity: 0.65, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '10px' 
                            }}
                        >
                            {isPending && (
                                <>
                                    <Clock size={18} />
                                    <span>Đang chờ Giảng viên duyệt...</span>
                                </>
                            )}
                            {isApproved && isWaitingRoom && (
                                <>
                                    <Clock size={18} />
                                    <span>Đã được duyệt - Chờ Giảng viên mở đề...</span>
                                </>
                            )}
                            {isRejected && (
                                <>
                                    <XCircle size={18} />
                                    <span>Không thể tham gia (Đã bị từ chối)</span>
                                </>
                            )}
                            {isFinished && (
                                <>
                                    <AlertCircle size={18} />
                                    <span>Phòng thi đã kết thúc</span>
                                </>
                            )}
                        </button>
                    )}

                    <button 
                        className="btn btn-secondary" 
                        onClick={handleLeaveLobby} 
                        disabled={leaving || starting}
                        style={{ 
                            padding: '10px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '8px',
                            color: 'var(--danger)',
                            borderColor: 'rgba(239, 68, 68, 0.3)'
                        }}
                    >
                        {leaving ? (
                            <Loader2 size={16} className="spinner" />
                        ) : (
                            <LogOut size={16} />
                        )}
                        <span>Rời phòng thi (Out phòng)</span>
                    </button>
                </div>
            </div>

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
                                        className="btn btn-danger" 
                                        onClick={() => {
                                            setModal(prev => ({ ...prev, isOpen: false }));
                                            if (modal.onConfirm) modal.onConfirm();
                                        }}
                                    >
                                        Xác nhận rời phòng
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

export default StudentLobby;