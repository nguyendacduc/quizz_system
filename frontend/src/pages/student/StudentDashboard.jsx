import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { DoorOpen, Lock, AlertCircle, ArrowRight } from 'lucide-react';
const StudentDashboard = () => {
    const navigate = useNavigate();
    const [roomCode, setRoomCode] = useState('');
    const [roomPassword, setRoomPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleJoinRoom = async (e) => {
        e.preventDefault();
        setError('');
        if (!roomCode.trim()) {
            setError('Vui lòng nhập Mã phòng thi');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/student/exam/join', {
                room_code: roomCode.trim().toUpperCase(),
                room_password: roomPassword.trim() || null
            });
            if (res.data && res.data.success) {
                const roomId = res.data.room_id;
                
                localStorage.setItem(`room_code_${roomId}`, roomCode.trim().toUpperCase());
                if (roomPassword) localStorage.setItem(`room_pwd_${roomId}`, roomPassword.trim());
                navigate(`/student/lobby/${roomId}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tham gia phòng thi. Vui lòng kiểm tra lại mã và mật khẩu.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div style={{ maxWidth: '500px', margin: '40px auto' }}>
            <div className="card">
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div className="login-logo" style={{ margin: '0 auto 16px auto', width: '56px', height: '56px' }}>
                        <DoorOpen size={28} />
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: '750' }}>Vào phòng thi trắc nghiệm</h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Nhập mã phòng và mật khẩu do Giảng viên cung cấp</p>
                </div>
                {error && (
                    <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}
                <form onSubmit={handleJoinRoom}>
                    <div className="form-group">
                        <label htmlFor="roomCode">Mã phòng thi *</label>
                        <input
                            id="roomCode"
                            type="text"
                            className="form-control"
                            placeholder="Nhập mã phòng thi (VD: RMC07B)..."
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="roomPassword">Mật khẩu phòng (Nếu có)</label>
                        <div className="search-wrapper">
                            <Lock className="search-icon" size={16} />
                            <input
                                id="roomPassword"
                                type="password"
                                className="form-control"
                                placeholder="Nhập mật khẩu phòng..."
                                value={roomPassword}
                                onChange={(e) => setRoomPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '15px' }}
                        disabled={loading}
                    >
                        {loading ? 'Đang kiểm tra phòng...' : (
                            <>
                                Vào phòng chờ <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
export default StudentDashboard;