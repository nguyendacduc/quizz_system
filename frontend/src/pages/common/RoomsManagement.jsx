import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { DoorOpen, Plus, Play, Square, Award, Monitor, Users, Calendar, Clock, Lock, Unlock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
const RoomsManagement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [teachersList, setTeachersList] = useState([]);
    
    
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'confirm', 
        onConfirm: null,
        onCancel: null
    });
    
    const [formData, setFormData] = useState({
        room_name: '',
        exam_id: '',
        room_password: '',
        max_students: '50',
        start_time: '',
        end_time: '',
        room_code: '',
        teacher_id: ''
    });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const fetchRooms = async () => {
        try {
            setLoading(true);
            const res = await api.get('/rooms');
            if (res.data && res.data.success) {
                setRooms(res.data.data);
            }
        } catch (err) {
            setError('Lỗi tải danh sách phòng thi');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const fetchExams = async () => {
        try {
            const res = await api.get('/exams');
            if (res.data && res.data.success) {
                setExams(res.data.data);
                if (res.data.data.length > 0) {
                    setFormData(prev => ({ ...prev, exam_id: res.data.data[0].exam_id }));
                }
            }
        } catch (err) {
            console.error('Error fetching exams:', err);
        }
    };
    const fetchTeachers = async () => {
        try {
            const res = await api.get('/admin/users/teachers');
            if (res.data && res.data.success) {
                setTeachersList(res.data.data);
                if (res.data.data.length > 0) {
                    setFormData(prev => ({ ...prev, teacher_id: String(res.data.data[0].teacher_id) }));
                }
            }
        } catch (err) {
            console.error('Error fetching teachers:', err);
        }
    };
    useEffect(() => {
        fetchRooms();
        fetchExams();
        if (user && user.role_code === 'ADMIN') {
            fetchTeachers();
        }
    }, [user]);
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        
        const payload = {
            ...formData,
            exam_id: parseInt(formData.exam_id),
            max_students: parseInt(formData.max_students),
            start_time: formData.start_time ? formData.start_time.replace('T', ' ') : null,
            end_time: formData.end_time ? formData.end_time.replace('T', ' ') : null,
            teacher_id: user.role_code === 'ADMIN' ? parseInt(formData.teacher_id) : undefined
        };
        try {
            const res = await api.post('/rooms', payload);
            if (res.data && res.data.success) {
                setFormSuccess('Tạo phòng thi thành công!');
                fetchRooms();
                setTimeout(() => {
                    setShowCreateModal(false);
                    setFormData({
                        room_name: '',
                        exam_id: exams[0]?.exam_id || '',
                        room_password: '',
                        max_students: '50',
                        start_time: '',
                        end_time: '',
                        room_code: '',
                        teacher_id: teachersList[0]?.teacher_id || ''
                    });
                }, 1500);
            }
        } catch (err) {
            setFormError(err.response?.data?.message || 'Có lỗi khi tạo phòng thi');
        }
    };
    const executeChangeStatus = async (roomId, newStatus) => {
        try {
            const res = await api.put(`/rooms/${roomId}/status`, { status: newStatus });
            if (res.data && res.data.success) {
                setRooms(rooms.map(r => r.room_id === roomId ? { ...r, status: newStatus } : r));
            }
        } catch (err) {
            setModal({
                isOpen: true,
                title: 'Lỗi thực hiện',
                message: err.response?.data?.message || 'Không thể đổi trạng thái phòng thi',
                type: 'alert',
                onConfirm: null
            });
        }
    };
    const handleChangeStatus = (roomId, newStatus) => {
        const title = newStatus === 'RUNNING' ? 'Bắt đầu phòng thi?' : 'Kết thúc phòng thi?';
        const confirmMsg = newStatus === 'RUNNING' 
            ? 'Sinh viên đã được duyệt vào phòng sẽ có thể bắt đầu làm bài thi.' 
            : 'Tất cả bài thi chưa nộp sẽ bị khóa ngay lập tức và tính điểm tại thời điểm hiện tại. Bạn có chắc chắn muốn kết thúc?';
        
        setModal({
            isOpen: true,
            title: title,
            message: confirmMsg,
            type: 'confirm',
            onConfirm: () => executeChangeStatus(roomId, newStatus),
            onCancel: null
        });
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case 'WAITING':
                return <span className="badge badge-warning">Đang chờ (Lobby)</span>;
            case 'RUNNING':
                return <span className="badge badge-success">Đang diễn ra</span>;
            case 'FINISHED':
                return <span className="badge badge-danger">Đã kết thúc</span>;
            case 'CANCELLED':
                return <span className="badge badge-danger">Đã hủy</span>;
            default:
                return <span className="badge badge-primary">{status}</span>;
        }
    };
    const handleRoomActionClick = (room) => {
        const basePath = user.role_code === 'ADMIN' ? 'admin' : 'teacher';
        if (room.status === 'WAITING') {
            navigate(`/${basePath}/rooms/${room.room_id}/lobby`);
        } else if (room.status === 'RUNNING') {
            navigate(`/${basePath}/rooms/${room.room_id}/monitor`);
        } else if (room.status === 'FINISHED') {
            navigate(`/${basePath}/rooms/${room.room_id}/scoreboard`);
        }
    };
    return (
        <div>
            <div className="section-header">
                <h1 className="section-title">Quản lý phòng thi</h1>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    <span>Tạo phòng thi</span>
                </button>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            {loading ? (
                <div className="spinner"></div>
            ) : (
                <div className="grid-2">
                    {rooms.length === 0 ? (
                        <div className="card" style={{ gridColumn: 'span 2', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Chưa có phòng thi nào được tạo.
                        </div>
                    ) : (
                        rooms.map((room) => (
                            <div className="card" key={room.room_id} style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <DoorOpen size={16} className="logo-icon" />
                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Mã:</span>
                                        <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '14px', letterSpacing: '0.05em', color: 'var(--primary)' }}>
                                            {room.room_code}
                                        </span>
                                    </div>
                                    {getStatusBadge(room.status)}
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>{room.room_name}</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                                    Đề: <strong>{room.exam_name}</strong> ({room.exam_code})
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Users size={14} />
                                        <span>Giới hạn: {room.max_students} sinh viên</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Calendar size={14} />
                                        <span>Bắt đầu: {room.start_time ? new Date(room.start_time).toLocaleString('vi-VN') : 'Không giới hạn'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Clock size={14} />
                                        <span>Kết thúc: {room.end_time ? new Date(room.end_time).toLocaleString('vi-VN') : 'Không giới hạn'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {room.room_password ? (
                                            <>
                                                <Lock size={14} style={{ color: 'var(--warning)' }} />
                                                <span>Mật khẩu: <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{room.room_password}</span></span>
                                            </>
                                        ) : (
                                            <>
                                                <Unlock size={14} style={{ color: 'var(--success)' }} />
                                                <span>Không có mật khẩu phòng</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', flexWrap: 'wrap' }}>
                                    {room.status === 'WAITING' && (
                                        <button className="btn btn-success btn-sm" onClick={() => handleChangeStatus(room.room_id, 'RUNNING')}>
                                            <Play size={14} /> Bắt đầu thi
                                        </button>
                                    )}
                                    {room.status === 'RUNNING' && (
                                        <button className="btn btn-danger btn-sm" onClick={() => handleChangeStatus(room.room_id, 'FINISHED')}>
                                            <Square size={14} /> Kết thúc thi
                                        </button>
                                    )}
                                    <button className="btn btn-secondary btn-sm" onClick={() => handleRoomActionClick(room)}>
                                        {room.status === 'WAITING' && 'Vào phòng chờ duyệt'}
                                        {room.status === 'RUNNING' && (
                                            <>
                                                <Monitor size={14} /> Giám sát phòng thi
                                            </>
                                        )}
                                        {room.status === 'FINISHED' && (
                                            <>
                                                <Award size={14} /> Xem bảng điểm
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            { }
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">Tạo phòng thi mới</div>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="modal-body">
                                {formError && <div className="alert alert-danger">{formError}</div>}
                                {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
                                <div className="form-group">
                                    <label>Tên phòng thi *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        placeholder="VD: Phòng thi kiểm tra JS lớp K16"
                                        value={formData.room_name}
                                        onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Chọn đề thi tương ứng *</label>
                                    <select
                                        className="form-control"
                                        required
                                        value={formData.exam_id}
                                        onChange={(e) => setFormData({ ...formData, exam_id: e.target.value })}
                                    >
                                        {exams.length === 0 ? (
                                            <option value="">-- Chưa có đề thi, hãy tạo đề trước --</option>
                                        ) : (
                                            exams.map(e => (
                                                <option key={e.exam_id} value={e.exam_id}>
                                                    {e.exam_name} ({e.exam_code})
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>
                                {user.role_code === 'ADMIN' && (
                                    <div className="form-group">
                                        <label>Giáo viên phụ trách *</label>
                                        <select
                                            className="form-control"
                                            required
                                            value={formData.teacher_id}
                                            onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                                        >
                                            <option value="">-- Chọn giáo viên phụ trách --</option>
                                            {teachersList.map(t => (
                                                <option key={t.teacher_id} value={t.teacher_id}>
                                                    {t.full_name} ({t.teacher_code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Mã phòng thi (Bỏ trống để tự sinh)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Tự sinh ngẫu nhiên"
                                            value={formData.room_code}
                                            onChange={(e) => setFormData({ ...formData, room_code: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Mật khẩu phòng (Tùy chọn)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Không mật khẩu"
                                            value={formData.room_password}
                                            onChange={(e) => setFormData({ ...formData, room_password: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Số lượng sinh viên tối đa</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            required
                                            value={formData.max_students}
                                            onChange={(e) => setFormData({ ...formData, max_students: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Thời gian bắt đầu</label>
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            value={formData.start_time}
                                            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Thời gian kết thúc</label>
                                    <input
                                        type="datetime-local"
                                        className="form-control"
                                        value={formData.end_time}
                                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={exams.length === 0}>
                                    Tạo phòng
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            { }
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
                                        className="btn btn-primary" 
                                        onClick={() => {
                                            setModal(prev => ({ ...prev, isOpen: false }));
                                            if (modal.onConfirm) modal.onConfirm();
                                        }}
                                    >
                                        Xác nhận
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
export default RoomsManagement;