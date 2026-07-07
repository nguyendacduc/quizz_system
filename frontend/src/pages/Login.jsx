import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, User, AlertCircle } from 'lucide-react';
const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!username || !password) {
            setError('Vui lòng điền đầy đủ Tên đăng nhập và Mật khẩu');
            return;
        }
        setLoading(true);
        try {
            const user = await login(username, password);
            if (user.role_code === 'ADMIN') {
                navigate('/admin/dashboard');
            } else if (user.role_code === 'TEACHER') {
                navigate('/teacher/dashboard');
            } else if (user.role_code === 'STUDENT') {
                navigate('/student/dashboard');
            } else {
                setError('Hệ thống không nhận diện được vai trò của tài khoản này');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Lỗi kết nối đến server');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="login-page-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <GraduationCap size={32} />
                    </div>
                    <h1 className="login-title">QuizLabs</h1>
                    <p className="login-subtitle">Hệ thống thi trắc nghiệm trực tuyến</p>
                </div>
                {error && (
                    <div className="login-error">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Tên đăng nhập</label>
                        <div className="search-wrapper">
                            <User className="search-icon" size={18} />
                            <input
                                id="username"
                                type="text"
                                className="form-control"
                                placeholder="Nhập tên đăng nhập..."
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <div className="search-wrapper">
                            <Lock className="search-icon" size={18} />
                            <input
                                id="password"
                                type="password"
                                className="form-control"
                                placeholder="Nhập mật khẩu..."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '10px' }}
                        disabled={loading}
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
};
export default Login;