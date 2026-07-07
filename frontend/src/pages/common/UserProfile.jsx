import React, { useState, useEffect } from 'react';
import api from '../../api';
import { User, Phone, MapPin, Mail, Key, ShieldCheck, Image, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
const UserProfile = () => {
    const { user, setUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [avatar, setAvatar] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState('');
    const [updateError, setUpdateError] = useState('');
    
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [pwdSuccess, setPwdSuccess] = useState('');
    const [pwdError, setPwdError] = useState('');
    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get('/account/profile');
            if (res.data && res.data.success) {
                setProfile(res.data.data);
                setPhone(res.data.data.phone || '');
                setAddress(res.data.data.address || '');
                setAvatar(res.data.data.avatar || '');
            }
        } catch (err) {
            setError('Lỗi tải thông tin cá nhân.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (user && user.role_code !== 'ADMIN') {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [user]);
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert('Kích thước ảnh tối đa là 2MB.');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatar(reader.result); 
        };
        reader.readAsDataURL(file);
    };
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdateSuccess('');
        setUpdateError('');
        try {
            const res = await api.put('/account/profile', { phone, address, avatar });
            if (res.data && res.data.success) {
                setUpdateSuccess('Cập nhật thông tin thành công!');
                
                setProfile({ ...profile, phone, address, avatar });
                
                setUser({ ...user, avatar: avatar || null });
            }
        } catch (err) {
            setUpdateError(err.response?.data?.message || 'Lỗi khi cập nhật thông tin.');
        }
    };
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwdSuccess('');
        setPwdError('');
        if (!oldPassword || !newPassword) {
            setPwdError('Vui lòng nhập đầy đủ mật khẩu cũ và mới.');
            return;
        }
        try {
            const res = await api.put('/account/change-password', {
                old_password: oldPassword,
                new_password: newPassword
            });
            if (res.data && res.data.success) {
                setPwdSuccess('Đổi mật khẩu thành công!');
                setOldPassword('');
                setNewPassword('');
            }
        } catch (err) {
            setPwdError(err.response?.data?.message || 'Mật khẩu cũ không chính xác hoặc lỗi hệ thống.');
        }
    };
    if (loading) return <div className="spinner"></div>;
    if (user?.role_code === 'ADMIN') {
        return (
            <div className="card" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
                <ShieldCheck size={48} className="logo-icon" style={{ margin: '0 auto 16px auto', color: '#f43f5e' }} />
                <h2>Tài khoản Quản trị viên</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Tài khoản admin hệ thống không liên kết với thông tin sinh viên/giảng viên cụ thể.
                </p>
            </div>
        );
    }
    return (
        <div>
            <div className="section-header">
                <h1 className="section-title">Hồ sơ cá nhân</h1>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="grid-3">
                { }
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: 'fit-content' }}>
                    <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '28px', marginBottom: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {profile?.avatar ? (
                            <img src={profile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            profile?.full_name?.charAt(0).toUpperCase()
                        )}
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '750' }}>{profile?.full_name}</h3>
                    <p className={`role-badge ${user?.role_code?.toLowerCase()}`} style={{ marginTop: '6px', fontSize: '11px' }}>
                        {user?.role_code === 'TEACHER' ? 'Giảng viên' : 'Sinh viên'}
                    </p>
                    <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', fontSize: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Mã số:</span>
                            <span style={{ fontWeight: '600' }}>{profile?.student_code || profile?.teacher_code}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Giới tính:</span>
                            <span>{profile?.gender === 'MALE' ? 'Nam' : profile?.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Ngày sinh:</span>
                            <span>{profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('vi-VN') : '-'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Tài khoản:</span>
                            <span>{user?.username}</span>
                        </div>
                    </div>
                </div>
                { }
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <h3 className="card-title">
                        <Sparkles className="logo-icon" size={20} />
                        Cập nhật thông tin liên hệ
                    </h3>
                    
                    {updateSuccess && <div className="alert alert-success">{updateSuccess}</div>}
                    {updateError && <div className="alert alert-danger">{updateError}</div>}
                    <form onSubmit={handleUpdateProfile} style={{ marginTop: '15px' }}>
                        <div className="form-group">
                            <label>Hộp thư Email (Liên hệ quản trị viên để đổi)</label>
                            <div className="search-wrapper">
                                <Mail className="search-icon" size={16} />
                                <input type="email" className="form-control" value={profile?.email || ''} disabled />
                            </div>
                        </div>
                        { }
                        <div className="form-group">
                            <label>Ảnh đại diện cá nhân</label>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '8px' }}>
                                <div className="avatar" style={{ width: '60px', height: '60px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {avatar ? (
                                        <img src={avatar} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        profile?.full_name?.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ fontSize: '13px' }}
                                    />
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Chấp nhận ảnh dung lượng dưới 2MB.</span>
                                    {avatar && (
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setAvatar('')}
                                            style={{ width: 'fit-content', padding: '4px 8px', fontSize: '12px', marginTop: '3px' }}
                                        >
                                            Gỡ ảnh đại diện
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Số điện thoại</label>
                            <div className="search-wrapper">
                                <Phone className="search-icon" size={16} />
                                <input
                                    id="phone"
                                    type="text"
                                    className="form-control"
                                    placeholder="Nhập số điện thoại..."
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="address">Địa chỉ liên hệ</label>
                            <div className="search-wrapper">
                                <MapPin className="search-icon" size={16} />
                                <input
                                    id="address"
                                    type="text"
                                    className="form-control"
                                    placeholder="Nhập địa chỉ..."
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                            Lưu thông tin
                        </button>
                    </form>
                    { }
                    <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '30px', paddingTop: '30px' }}>
                        <h3 className="card-title">
                            <Key className="logo-icon" size={20} />
                            Đổi mật khẩu tài khoản
                        </h3>
                        {pwdSuccess && <div className="alert alert-success">{pwdSuccess}</div>}
                        {pwdError && <div className="alert alert-danger">{pwdError}</div>}
                        <form onSubmit={handleChangePassword} style={{ marginTop: '15px' }}>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label htmlFor="oldPwd">Mật khẩu cũ *</label>
                                    <input
                                        id="oldPwd"
                                        type="password"
                                        className="form-control"
                                        placeholder="Nhập mật khẩu cũ..."
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="newPwd">Mật khẩu mới *</label>
                                    <input
                                        id="newPwd"
                                        type="password"
                                        className="form-control"
                                        placeholder="Nhập mật khẩu mới..."
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-secondary" style={{ marginTop: '10px' }}>
                                Đổi mật khẩu
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default UserProfile;