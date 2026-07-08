import React, { useState, useEffect } from 'react';
import api from '../../api';
import { 
    Search, UserPlus, Trash2, Edit, Check, X, ShieldAlert, 
    GraduationCap, UserCheck, ShieldCheck, Users, Eye, Lock, Unlock, Key 
} from 'lucide-react';
const UserManagement = () => {
    
    const [activeTab, setActiveTab] = useState('STUDENT');
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [accounts, setAccounts] = useState([]);
    
    const [classList, setClassList] = useState([]);
    const [deptList, setDeptList] = useState([]);
    
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [resetPasswordUserId, setResetPasswordUserId] = useState(null);
    const [resetPasswordUsername, setResetPasswordUsername] = useState('');
    
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: '', type: '' });
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState('');
    
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        student_code: '',
        teacher_code: '',
        full_name: '',
        gender: 'MALE',
        date_of_birth: '',
        email: '',
        phone: '',
        address: '',
        class_id: '',
        department_id: '',
        avatar: ''
    });
    const [newPassword, setNewPassword] = useState('');
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    
    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            if (activeTab === 'STUDENT') {
                const res = await api.get(`/admin/users/students?keyword=${keyword}`);
                if (res.data && res.data.success) {
                    setStudents(res.data.data);
                }
            } else if (activeTab === 'TEACHER') {
                const res = await api.get(`/admin/users/teachers?keyword=${keyword}`);
                if (res.data && res.data.success) {
                    setTeachers(res.data.data);
                }
            } else if (activeTab === 'ACCOUNT') {
                const res = await api.get(`/admin/users/accounts?keyword=${keyword}`);
                if (res.data && res.data.success) {
                    setAccounts(res.data.data);
                }
            }
        } catch (err) {
            setError('Lỗi kết nối máy chủ khi lấy danh sách.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const fetchDropdownData = async () => {
        try {
            const classRes = await api.get('/classes');
            if (classRes.data && classRes.data.success) {
                setClassList(classRes.data.data);
            }
            const deptRes = await api.get('/departments');
            if (deptRes.data && deptRes.data.success) {
                setDeptList(deptRes.data.data);
            }
        } catch (err) {
            console.error('Error fetching catalog data:', err);
        }
    };
    useEffect(() => {
        fetchDropdownData();
    }, []);
    useEffect(() => {
        fetchData();
    }, [activeTab, keyword]);
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert('Kích thước ảnh tối đa là 2MB.');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, avatar: reader.result }));
        };
        reader.readAsDataURL(file);
    };
    
    const handleToggleStatus = async (userId, currentActive) => {
        try {
            const res = await api.put(`/admin/users/${userId}/status`, { is_active: !currentActive });
            if (res.data && res.data.success) {
                if (activeTab === 'STUDENT') {
                    setStudents(students.map(s => s.user_id === userId ? { ...s, is_active: !currentActive } : s));
                } else if (activeTab === 'TEACHER') {
                    setTeachers(teachers.map(t => t.user_id === userId ? { ...t, is_active: !currentActive } : t));
                } else if (activeTab === 'ACCOUNT') {
                    setAccounts(accounts.map(a => a.user_id === userId ? { ...a, is_active: !currentActive } : a));
                }
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi khi đổi trạng thái tài khoản');
        }
    };
    
    const handleDelete = (id, name, type) => {
        setDeleteError('');
        setDeleteSuccess('');
        setDeleteConfirm({ show: true, id, name, type });
    };
    const executeDelete = async () => {
        setDeleteLoading(true);
        setDeleteError('');
        setDeleteSuccess('');
        try {
            let res;
            const { id, type } = deleteConfirm;
            if (type === 'student') {
                res = await api.delete(`/admin/users/students/${id}`);
            } else if (type === 'teacher') {
                res = await api.delete(`/admin/users/teachers/${id}`);
            } else if (type === 'account') {
                res = await api.delete(`/admin/users/accounts/${id}`);
            }
            if (res && res.data && res.data.success) {
                setDeleteSuccess(res.data.message || 'Đã xóa thành công!');
                fetchData();
                setTimeout(() => {
                    setDeleteConfirm({ show: false, id: null, name: '', type: '' });
                }, 1500);
            }
        } catch (err) {
            setDeleteError(err.response?.data?.message || 'Lỗi xảy ra khi xóa dữ liệu.');
        } finally {
            setDeleteLoading(false);
        }
    };
    
    const openAddModal = () => {
        setFormError('');
        setFormSuccess('');
        setFormData({
            username: '',
            password: '',
            student_code: '',
            teacher_code: '',
            full_name: '',
            gender: 'MALE',
            date_of_birth: '',
            email: '',
            phone: '',
            address: '',
            class_id: classList[0]?.class_id || '',
            department_id: deptList[0]?.department_id || '',
            avatar: ''
        });
        setShowAddModal(true);
    };
    const openEditModal = (item, type) => {
        setFormError('');
        setFormSuccess('');
        if (type === 'student') {
            setSelectedStudent(item);
            setFormData({
                student_code: item.student_code || '',
                full_name: item.full_name || '',
                gender: item.gender || 'MALE',
                date_of_birth: item.date_of_birth ? item.date_of_birth.substring(0, 10) : '',
                email: item.email || '',
                phone: item.phone || '',
                address: item.address || '',
                class_id: item.class_id || '',
                avatar: item.avatar || ''
            });
        } else if (type === 'teacher') {
            setSelectedTeacher(item);
            setFormData({
                teacher_code: item.teacher_code || '',
                full_name: item.full_name || '',
                gender: item.gender || 'MALE',
                date_of_birth: item.date_of_birth ? item.date_of_birth.substring(0, 10) : '',
                email: item.email || '',
                phone: item.phone || '',
                address: item.address || '',
                department_id: item.department_id || '',
                avatar: item.avatar || ''
            });
        }
        setShowEditModal(true);
    };
    const openViewModal = (item, type) => {
        if (type === 'student') setSelectedStudent(item);
        if (type === 'teacher') setSelectedTeacher(item);
        setShowViewModal(true);
    };
    const openResetModal = (userId, username) => {
        setFormError('');
        setFormSuccess('');
        setResetPasswordUserId(userId);
        setResetPasswordUsername(username);
        setNewPassword('');
        setShowResetModal(true);
    };
    
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        try {
            let res;
            if (activeTab === 'STUDENT') {
                if (!formData.class_id) {
                    setFormError('Vui lòng chọn lớp học.');
                    return;
                }
                if (!formData.date_of_birth) {
                    setFormError('Vui lòng nhập ngày sinh.');
                    return;
                }
                res = await api.post('/admin/users/students', {
                    username: formData.username,
                    password: formData.password,
                    student_code: formData.student_code,
                    full_name: formData.full_name,
                    gender: formData.gender,
                    date_of_birth: formData.date_of_birth,
                    email: formData.email,
                    phone: formData.phone || null,
                    address: formData.address || null,
                    class_id: parseInt(formData.class_id),
                    avatar: formData.avatar || null
                });
            } else if (activeTab === 'TEACHER') {
                if (!formData.department_id) {
                    setFormError('Vui lòng chọn khoa.');
                    return;
                }
                if (!formData.date_of_birth) {
                    setFormError('Vui lòng nhập ngày sinh.');
                    return;
                }
                res = await api.post('/admin/users/teachers', {
                    username: formData.username,
                    password: formData.password,
                    teacher_code: formData.teacher_code,
                    full_name: formData.full_name,
                    gender: formData.gender,
                    date_of_birth: formData.date_of_birth,
                    email: formData.email,
                    phone: formData.phone || null,
                    address: formData.address || null,
                    department_id: parseInt(formData.department_id),
                    avatar: formData.avatar || null
                });
            }
            if (res && res.data && res.data.success) {
                setFormSuccess('Thêm tài khoản mới thành công!');
                fetchData();
                setTimeout(() => setShowAddModal(false), 1500);
            }
        } catch (err) {
            setFormError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo tài khoản');
        }
    };
    
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        try {
            let res;
            if (activeTab === 'STUDENT') {
                if (!formData.date_of_birth) {
                    setFormError('Vui lòng nhập ngày sinh.');
                    return;
                }
                res = await api.put(`/admin/users/students/${selectedStudent.student_id}`, {
                    student_code: formData.student_code,
                    full_name: formData.full_name,
                    gender: formData.gender,
                    date_of_birth: formData.date_of_birth,
                    email: formData.email,
                    phone: formData.phone || null,
                    address: formData.address || null,
                    class_id: parseInt(formData.class_id),
                    avatar: formData.avatar || null
                });
            } else if (activeTab === 'TEACHER') {
                if (!formData.date_of_birth) {
                    setFormError('Vui lòng nhập ngày sinh.');
                    return;
                }
                res = await api.put(`/admin/users/teachers/${selectedTeacher.teacher_id}`, {
                    teacher_code: formData.teacher_code,
                    full_name: formData.full_name,
                    gender: formData.gender,
                    date_of_birth: formData.date_of_birth,
                    email: formData.email,
                    phone: formData.phone || null,
                    address: formData.address || null,
                    department_id: parseInt(formData.department_id),
                    avatar: formData.avatar || null
                });
            }
            if (res && res.data && res.data.success) {
                setFormSuccess('Cập nhật thông tin thành công!');
                fetchData();
                setTimeout(() => setShowEditModal(false), 1500);
            }
        } catch (err) {
            setFormError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin');
        }
    };
    
    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        if (!newPassword) {
            setFormError('Vui lòng nhập mật khẩu mới.');
            return;
        }
        try {
            const res = await api.put(`/admin/users/accounts/${resetPasswordUserId}/reset-password`, {
                password: newPassword
            });
            if (res.data && res.data.success) {
                setFormSuccess('Đổi mật khẩu tài khoản thành công!');
                setNewPassword('');
                setTimeout(() => setShowResetModal(false), 1500);
            }
        } catch (err) {
            setFormError(err.response?.data?.message || 'Không thể đổi mật khẩu tài khoản.');
        }
    };
    const getGenderText = (gender) => {
        if (gender === 'MALE') return 'Nam';
        if (gender === 'FEMALE') return 'Nữ';
        return 'Khác';
    };
    return (
        <div>
            { }
            <div className="section-header">
                <h1 className="section-title">Quản trị người dùng</h1>
                {activeTab !== 'ACCOUNT' && (
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <UserPlus size={18} />
                        <span>Thêm {activeTab === 'STUDENT' ? 'Sinh viên' : 'Giảng viên'}</span>
                    </button>
                )}
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            { }
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '20px', gap: '10px' }}>
                <button 
                    onClick={() => { setActiveTab('STUDENT'); setKeyword(''); }}
                    className={`btn`}
                    style={{ 
                        background: 'transparent',
                        color: activeTab === 'STUDENT' ? 'var(--primary)' : 'var(--text-secondary)',
                        borderBottom: activeTab === 'STUDENT' ? '2.5px solid var(--primary)' : 'none',
                        borderRadius: '0',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: activeTab === 'STUDENT' ? '700' : '500'
                    }}
                >
                    <GraduationCap size={18} />
                    <span>Quản lý Sinh viên</span>
                </button>
                <button 
                    onClick={() => { setActiveTab('TEACHER'); setKeyword(''); }}
                    className={`btn`}
                    style={{ 
                        background: 'transparent',
                        color: activeTab === 'TEACHER' ? 'var(--primary)' : 'var(--text-secondary)',
                        borderBottom: activeTab === 'TEACHER' ? '2.5px solid var(--primary)' : 'none',
                        borderRadius: '0',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: activeTab === 'TEACHER' ? '700' : '500'
                    }}
                >
                    <UserCheck size={18} />
                    <span>Quản lý Giảng viên</span>
                </button>
                <button 
                    onClick={() => { setActiveTab('ACCOUNT'); setKeyword(''); }}
                    className={`btn`}
                    style={{ 
                        background: 'transparent',
                        color: activeTab === 'ACCOUNT' ? 'var(--primary)' : 'var(--text-secondary)',
                        borderBottom: activeTab === 'ACCOUNT' ? '2.5px solid var(--primary)' : 'none',
                        borderRadius: '0',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: activeTab === 'ACCOUNT' ? '700' : '500'
                    }}
                >
                    <ShieldCheck size={18} />
                    <span>Quản lý Tài khoản</span>
                </button>
            </div>
            { }
            <div className="filters-bar">
                <div className="search-wrapper">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        className="form-control"
                        placeholder={
                            activeTab === 'STUDENT' ? "Tìm theo mã số, tên hoặc tài khoản sinh viên..." :
                            activeTab === 'TEACHER' ? "Tìm theo mã số, tên hoặc tài khoản giáo viên..." :
                            "Tìm theo tên tài khoản đăng nhập..."
                        }
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>
            </div>
            { }
            {loading ? (
                <div className="spinner"></div>
            ) : (
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div className="table-container">
                        {activeTab === 'STUDENT' && (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Mã số SV</th>
                                        <th>Họ và tên</th>
                                        <th>Lớp học</th>
                                        <th>Tài khoản</th>
                                        <th>Email</th>
                                        <th>Trạng thái</th>
                                        <th style={{ textAlign: 'center' }}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Không tìm thấy sinh viên nào</td>
                                        </tr>
                                    ) : (
                                        students.map((item) => (
                                            <tr key={item.student_id}>
                                                <td style={{ fontWeight: '700' }}>{item.student_code}</td>
                                                <td style={{ fontWeight: '500' }}>{item.full_name}</td>
                                                <td>{item.class_name}</td>
                                                <td style={{ fontFamily: 'monospace' }}>{item.username}</td>
                                                <td>{item.email}</td>
                                                <td>
                                                    <span className={`badge ${item.is_active ? 'badge-success' : 'badge-danger'}`}>
                                                        {item.is_active ? 'Đang chạy' : 'Đang khóa'}
                                                    </span>
                                                </td>
                                                <td style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => openViewModal(item, 'student')} title="Xem chi tiết">
                                                        <Eye size={13} />
                                                    </button>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(item, 'student')} title="Sửa">
                                                        <Edit size={13} />
                                                    </button>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => openResetModal(item.user_id, item.username)} title="Đổi mật khẩu">
                                                        <Key size={13} />
                                                    </button>
                                                    <button 
                                                        className={`btn btn-sm ${item.is_active ? 'btn-secondary' : 'btn-success'}`}
                                                        onClick={() => handleToggleStatus(item.user_id, item.is_active)}
                                                        title={item.is_active ? 'Khóa tài khoản' : 'Mở khóa'}
                                                    >
                                                        {item.is_active ? <Lock size={13} style={{ color: 'var(--warning)' }} /> : <Unlock size={13} />}
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.student_id, item.full_name, 'student')} title="Xóa">
                                                        <Trash2 size={13} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                        {activeTab === 'TEACHER' && (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Mã số GV</th>
                                        <th>Họ và tên</th>
                                        <th>Khoa / Ban</th>
                                        <th>Tài khoản</th>
                                        <th>Email</th>
                                        <th>Trạng thái</th>
                                        <th style={{ textAlign: 'center' }}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teachers.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Không tìm thấy giáo viên nào</td>
                                        </tr>
                                    ) : (
                                        teachers.map((item) => (
                                            <tr key={item.teacher_id}>
                                                <td style={{ fontWeight: '700' }}>{item.teacher_code}</td>
                                                <td style={{ fontWeight: '500' }}>{item.full_name}</td>
                                                <td>{item.department_name}</td>
                                                <td style={{ fontFamily: 'monospace' }}>{item.username}</td>
                                                <td>{item.email}</td>
                                                <td>
                                                    <span className={`badge ${item.is_active ? 'badge-success' : 'badge-danger'}`}>
                                                        {item.is_active ? 'Đang chạy' : 'Đang khóa'}
                                                    </span>
                                                </td>
                                                <td style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => openViewModal(item, 'teacher')} title="Xem chi tiết">
                                                        <Eye size={13} />
                                                    </button>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(item, 'teacher')} title="Sửa">
                                                        <Edit size={13} />
                                                    </button>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => openResetModal(item.user_id, item.username)} title="Đổi mật khẩu">
                                                        <Key size={13} />
                                                    </button>
                                                    <button 
                                                        className={`btn btn-sm ${item.is_active ? 'btn-secondary' : 'btn-success'}`}
                                                        onClick={() => handleToggleStatus(item.user_id, item.is_active)}
                                                        title={item.is_active ? 'Khóa tài khoản' : 'Mở khóa'}
                                                    >
                                                        {item.is_active ? <Lock size={13} style={{ color: 'var(--warning)' }} /> : <Unlock size={13} />}
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.teacher_id, item.full_name, 'teacher')} title="Xóa">
                                                        <Trash2 size={13} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                        {activeTab === 'ACCOUNT' && (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Mã số tài khoản (ID)</th>
                                        <th>Tên tài khoản (Username)</th>
                                        <th>Quyền hạn (Role)</th>
                                        <th>Đăng nhập cuối</th>
                                        <th>Trạng thái</th>
                                        <th style={{ textAlign: 'center' }}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {accounts.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Không tìm thấy tài khoản nào</td>
                                        </tr>
                                    ) : (
                                        accounts.map((item) => (
                                            <tr key={item.user_id}>
                                                <td style={{ fontWeight: '750', fontFamily: 'monospace' }}>#{item.user_id}</td>
                                                <td style={{ fontWeight: '500' }}>{item.username}</td>
                                                <td>
                                                    <span className={`badge badge-primary`}>
                                                        {item.role_name} ({item.role_code})
                                                    </span>
                                                </td>
                                                <td>{item.last_login ? new Date(item.last_login).toLocaleString('vi-VN') : 'Chưa từng truy cập'}</td>
                                                <td>
                                                    <span className={`badge ${item.is_active ? 'badge-success' : 'badge-danger'}`}>
                                                        {item.is_active ? 'Đang chạy' : 'Đang khóa'}
                                                    </span>
                                                </td>
                                                <td style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => openResetModal(item.user_id, item.username)} title="Đổi mật khẩu">
                                                        <Key size={13} />
                                                    </button>
                                                    <button 
                                                        className={`btn btn-sm ${item.is_active ? 'btn-secondary' : 'btn-success'}`}
                                                        onClick={() => handleToggleStatus(item.user_id, item.is_active)}
                                                        title={item.is_active ? 'Khóa tài khoản' : 'Mở khóa'}
                                                        disabled={item.role_code === 'ADMIN'}
                                                    >
                                                        {item.is_active ? <Lock size={13} style={{ color: 'var(--warning)' }} /> : <Unlock size={13} />}
                                                    </button>
                                                    <button 
                                                        className="btn btn-danger btn-sm" 
                                                        onClick={() => handleDelete(item.user_id, item.username, 'account')} 
                                                        title="Xóa tài khoản"
                                                        disabled={item.role_code === 'ADMIN'}
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
            { }
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '650px' }}>
                        <div className="modal-header">Thêm {activeTab === 'STUDENT' ? 'Sinh viên' : 'Giảng viên'} mới</div>
                        <form onSubmit={handleAddSubmit}>
                            <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '5px' }}>
                                {formError && <div className="alert alert-danger">{formError}</div>}
                                {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Tên tài khoản đăng nhập *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Mật khẩu đăng nhập *</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>{activeTab === 'STUDENT' ? 'Mã sinh viên *' : 'Mã giảng viên *'}</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            value={activeTab === 'STUDENT' ? formData.student_code : formData.teacher_code}
                                            onChange={(e) => setFormData({ 
                                                ...formData, 
                                                [activeTab === 'STUDENT' ? 'student_code' : 'teacher_code']: e.target.value 
                                            })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Họ và tên *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Giới tính *</label>
                                        <select
                                            className="form-control"
                                            required
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        >
                                            <option value="MALE">Nam</option>
                                            <option value="FEMALE">Nữ</option>
                                            <option value="OTHER">Khác</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Ngày sinh *</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            required
                                            value={formData.date_of_birth}
                                            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Email liên hệ *</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Số điện thoại</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                {activeTab === 'STUDENT' ? (
                                    <div className="form-group">
                                        <label>Lớp học *</label>
                                        <select
                                            className="form-control"
                                            required
                                            value={formData.class_id}
                                            onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                        >
                                            <option value="">-- Chọn lớp học --</option>
                                            {classList.map(c => (
                                                <option key={c.class_id} value={c.class_id}>{c.class_name} ({c.class_code})</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="form-group">
                                        <label>Khoa công tác *</label>
                                        <select
                                            className="form-control"
                                            required
                                            value={formData.department_id}
                                            onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                        >
                                            <option value="">-- Chọn khoa công tác --</option>
                                            {deptList.map(d => (
                                                <option key={d.department_id} value={d.department_id}>{d.department_name} ({d.department_code})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                { }
                                <div className="form-group">
                                    <label>Ảnh đại diện</label>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '8px' }}>
                                        <div className="avatar" style={{ width: '50px', height: '50px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {formData.avatar ? (
                                                <img src={formData.avatar} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                (formData.full_name || 'U').charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                style={{ fontSize: '13px' }}
                                            />
                                            {formData.avatar && (
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                                                    style={{ width: 'fit-content', padding: '3px 6px', fontSize: '11px', marginTop: '2px' }}
                                                >
                                                    Gỡ ảnh
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Địa chỉ liên hệ</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Nhập địa chỉ nhà..."
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary">Lưu lại</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            { }
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '650px' }}>
                        <div className="modal-header">Chỉnh sửa thông tin {activeTab === 'STUDENT' ? 'Sinh viên' : 'Giảng viên'}</div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '5px' }}>
                                {formError && <div className="alert alert-danger">{formError}</div>}
                                {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
                                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '15px' }}>
                                    Tài khoản liên kết: <strong>{activeTab === 'STUDENT' ? selectedStudent?.username : selectedTeacher?.username}</strong>
                                </p>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>{activeTab === 'STUDENT' ? 'Mã sinh viên *' : 'Mã giảng viên *'}</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            value={activeTab === 'STUDENT' ? formData.student_code : formData.teacher_code}
                                            onChange={(e) => setFormData({ 
                                                ...formData, 
                                                [activeTab === 'STUDENT' ? 'student_code' : 'teacher_code']: e.target.value 
                                            })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Họ và tên *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Giới tính *</label>
                                        <select
                                            className="form-control"
                                            required
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        >
                                            <option value="MALE">Nam</option>
                                            <option value="FEMALE">Nữ</option>
                                            <option value="OTHER">Khác</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Ngày sinh *</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            required
                                            value={formData.date_of_birth}
                                            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Email liên hệ *</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Số điện thoại</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                {activeTab === 'STUDENT' ? (
                                    <div className="form-group">
                                        <label>Lớp học *</label>
                                        <select
                                            className="form-control"
                                            required
                                            value={formData.class_id}
                                            onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                        >
                                            <option value="">-- Chọn lớp học --</option>
                                            {classList.map(c => (
                                                <option key={c.class_id} value={c.class_id}>{c.class_name} ({c.class_code})</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="form-group">
                                        <label>Khoa công tác *</label>
                                        <select
                                            className="form-control"
                                            required
                                            value={formData.department_id}
                                            onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                        >
                                            <option value="">-- Chọn khoa công tác --</option>
                                            {deptList.map(d => (
                                                <option key={d.department_id} value={d.department_id}>{d.department_name} ({d.department_code})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                { }
                                <div className="form-group">
                                    <label>Ảnh đại diện</label>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '8px' }}>
                                        <div className="avatar" style={{ width: '50px', height: '50px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {formData.avatar ? (
                                                <img src={formData.avatar} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                (formData.full_name || 'U').charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                style={{ fontSize: '13px' }}
                                            />
                                            {formData.avatar && (
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                                                    style={{ width: 'fit-content', padding: '3px 6px', fontSize: '11px', marginTop: '2px' }}
                                                >
                                                    Gỡ ảnh
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Địa chỉ liên hệ</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Nhập địa chỉ nhà..."
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary">Cập nhật</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            { }
            {showViewModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            Thông tin chi tiết {activeTab === 'STUDENT' ? 'Sinh viên' : 'Giảng viên'}
                        </div>
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14.5px' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                                <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '28px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {(activeTab === 'STUDENT' ? selectedStudent?.avatar : selectedTeacher?.avatar) ? (
                                        <img src={activeTab === 'STUDENT' ? selectedStudent.avatar : selectedTeacher.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        (activeTab === 'STUDENT' ? selectedStudent?.full_name : selectedTeacher?.full_name)?.charAt(0).toUpperCase()
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Mã số:</span>
                                <span style={{ fontWeight: '700' }}>
                                    {activeTab === 'STUDENT' ? selectedStudent?.student_code : selectedTeacher?.teacher_code}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Họ và tên:</span>
                                <span style={{ fontWeight: '600' }}>
                                    {activeTab === 'STUDENT' ? selectedStudent?.full_name : selectedTeacher?.full_name}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Tài khoản liên kết:</span>
                                <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                    {activeTab === 'STUDENT' ? selectedStudent?.username : selectedTeacher?.username}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Giới tính:</span>
                                <span>
                                    {getGenderText(activeTab === 'STUDENT' ? selectedStudent?.gender : selectedTeacher?.gender)}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Ngày sinh:</span>
                                <span>
                                    {activeTab === 'STUDENT' 
                                        ? (selectedStudent?.date_of_birth ? new Date(selectedStudent.date_of_birth).toLocaleDateString('vi-VN') : '-') 
                                        : (selectedTeacher?.date_of_birth ? new Date(selectedTeacher.date_of_birth).toLocaleDateString('vi-VN') : '-')
                                    }
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Lớp học / Ban ngành:</span>
                                <span>
                                    {activeTab === 'STUDENT' ? selectedStudent?.class_name : selectedTeacher?.department_name}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Email liên hệ:</span>
                                <span>{activeTab === 'STUDENT' ? selectedStudent?.email : selectedTeacher?.email}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Số điện thoại:</span>
                                <span>{activeTab === 'STUDENT' ? selectedStudent?.phone : selectedTeacher?.phone}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Địa chỉ:</span>
                                <span>{activeTab === 'STUDENT' ? selectedStudent?.address : selectedTeacher?.address}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Trạng thái tài khoản:</span>
                                <span className={`badge ${
                                    (activeTab === 'STUDENT' ? selectedStudent?.is_active : selectedTeacher?.is_active) 
                                        ? 'badge-success' : 'badge-danger'
                                }`}>
                                    {(activeTab === 'STUDENT' ? selectedStudent?.is_active : selectedTeacher?.is_active) 
                                        ? 'Đang hoạt động' : 'Bị khóa'}
                                </span>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
            { }
            {showResetModal && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">Đổi mật khẩu tài khoản</div>
                        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '15px' }}>
                            Tài khoản: <strong>{resetPasswordUsername}</strong>
                        </p>
                        <form onSubmit={handleResetPasswordSubmit}>
                            <div className="modal-body">
                                {formError && <div className="alert alert-danger">{formError}</div>}
                                {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
                                <div className="form-group">
                                    <label htmlFor="adminResetPasswordInput">Mật khẩu mới *</label>
                                    <input 
                                        id="adminResetPasswordInput"
                                        type="password" 
                                        className="form-control" 
                                        required 
                                        placeholder="Nhập mật khẩu mới..."
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowResetModal(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary">Lưu lại</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            { }
            {deleteConfirm.show && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '450px' }}>
                        <div className="modal-header" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldAlert size={20} />
                            <span>Xác nhận xóa người dùng</span>
                        </div>
                        <div className="modal-body" style={{ padding: '15px 0' }}>
                            {deleteError && <div className="alert alert-danger" style={{ marginBottom: '15px' }}>{deleteError}</div>}
                            {deleteSuccess && <div className="alert alert-success" style={{ marginBottom: '15px' }}>{deleteSuccess}</div>}
                            
                            <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                                Bạn có chắc chắn muốn xóa {
                                    deleteConfirm.type === 'student' ? 'Sinh viên' :
                                    deleteConfirm.type === 'teacher' ? 'Giáo viên' : 'Tài khoản'
                                } <strong>"{deleteConfirm.name}"</strong>?
                            </p>
                            <p style={{ fontSize: '12.5px', lineHeight: '1.4', color: 'var(--text-muted)', marginTop: '10px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid var(--warning)' }}>
                                <strong>💡 Lưu ý:</strong> Tài khoản này sẽ bị vô hiệu hóa đăng nhập và ẩn khỏi danh sách, nhưng toàn bộ ngân hàng câu hỏi, đề thi và lịch sử thi cử liên quan sẽ được giữ lại nguyên vẹn trên hệ thống.
                            </p>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '10px' }}>
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                disabled={deleteLoading}
                                onClick={() => setDeleteConfirm({ show: false, id: null, name: '', type: '' })}
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-danger" 
                                disabled={deleteLoading}
                                onClick={executeDelete}
                                style={{ background: 'var(--danger)', borderColor: 'var(--danger)', color: '#fff' }}
                            >
                                {deleteLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default UserManagement;