import React, { useState, useEffect } from 'react';
import api from '../../api';
import { 
    Bell, Info, Award, Calendar, Plus, Trash2, Edit, 
    Search, Check, CheckCheck, Send, Users, ShieldAlert, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
const Notifications = () => {
    const { user } = useAuth();
    
    
    const [isAdminTab, setIsAdminTab] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [keyword, setKeyword] = useState('');
    
    const [myNotifications, setMyNotifications] = useState([]);
    const [allNotifications, setAllNotifications] = useState([]);
    
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedNotif, setSelectedNotif] = useState(null);
    
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState('');
    
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        target: 'ALL', 
        specific_username: ''
    });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    
    const fetchNotifications = async () => {
        setLoading(true);
        setError('');
        try {
            if (isAdminTab && user?.role_code === 'ADMIN') {
                const res = await api.get('/notifications/admin/all');
                if (res.data && res.data.success) {
                    setAllNotifications(res.data.data);
                }
            } else {
                const res = await api.get('/notifications/my');
                if (res.data && res.data.success) {
                    setMyNotifications(res.data.data);
                }
            }
        } catch (err) {
            setError('Lỗi tải thông tin thông báo.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchNotifications();
    }, [isAdminTab]);
    
    const handleMarkAsRead = async (id) => {
        try {
            const res = await api.put(`/notifications/my/${id}/read`);
            if (res.data && res.data.success) {
                setMyNotifications(myNotifications.map(n => n.notification_id === id ? { ...n, is_read: 1 } : n));
            }
        } catch (err) {
            console.error(err);
        }
    };
    
    const handleMarkAllAsRead = async () => {
        try {
            const unread = myNotifications.filter(n => !n.is_read);
            for (let n of unread) {
                await api.put(`/notifications/my/${n.notification_id}/read`);
            }
            setMyNotifications(myNotifications.map(n => ({ ...n, is_read: 1 })));
        } catch (err) {
            console.error(err);
        }
    };
    
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        try {
            const res = await api.post('/notifications/admin', formData);
            if (res.data && res.data.success) {
                setFormSuccess(res.data.message || 'Gửi thông báo thành công!');
                fetchNotifications();
                setTimeout(() => {
                    setShowAddModal(false);
                    setFormData({ title: '', content: '', target: 'ALL', specific_username: '' });
                }, 1500);
            }
        } catch (err) {
            setFormError(err.response?.data?.message || 'Lỗi khi tạo thông báo.');
        }
    };
    
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        try {
            const res = await api.put(`/notifications/admin/${selectedNotif.notification_id}`, {
                title: formData.title,
                content: formData.content
            });
            if (res.data && res.data.success) {
                setFormSuccess('Cập nhật thông báo thành công!');
                fetchNotifications();
                setTimeout(() => {
                    setShowEditModal(false);
                }, 1500);
            }
        } catch (err) {
            setFormError(err.response?.data?.message || 'Lỗi khi cập nhật thông báo.');
        }
    };
    
    const handleDelete = (id) => {
        setDeleteError('');
        setDeleteSuccess('');
        setDeleteConfirm({ show: true, id });
    };
    const executeDelete = async () => {
        setDeleteLoading(true);
        setDeleteError('');
        setDeleteSuccess('');
        try {
            const { id } = deleteConfirm;
            const res = await api.delete(`/notifications/admin/${id}`);
            if (res.data && res.data.success) {
                setDeleteSuccess('Đã xóa thông báo thành công.');
                setAllNotifications(allNotifications.filter(n => n.notification_id !== id));
                
                
                setTimeout(() => {
                    setDeleteConfirm({ show: false, id: null });
                    setDeleteSuccess('');
                }, 1500);
            }
        } catch (err) {
            setDeleteError(err.response?.data?.message || 'Lỗi xảy ra khi xóa thông báo.');
        } finally {
            setDeleteLoading(false);
        }
    };
    const openAddModal = () => {
        setFormError('');
        setFormSuccess('');
        setFormData({ title: '', content: '', target: 'ALL', specific_username: '' });
        setShowAddModal(true);
    };
    const openEditModal = (item) => {
        setFormError('');
        setFormSuccess('');
        setSelectedNotif(item);
        setFormData({
            title: item.title,
            content: item.content,
            target: 'USER',
            specific_username: item.username
        });
        setShowEditModal(true);
    };
    const filteredAdminNotifications = allNotifications.filter(n => 
        n.title.toLowerCase().includes(keyword.toLowerCase()) || 
        n.content.toLowerCase().includes(keyword.toLowerCase()) ||
        n.username.toLowerCase().includes(keyword.toLowerCase())
    );
    return (
        <div>
            { }
            <div className="section-header">
                <h1 className="section-title">Thông báo hệ thống</h1>
                {isAdminTab && user?.role_code === 'ADMIN' && (
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <Plus size={18} />
                        <span>Tạo thông báo mới</span>
                    </button>
                )}
            </div>
            { }
            {user?.role_code === 'ADMIN' && (
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '20px', gap: '10px' }}>
                    <button 
                        onClick={() => setIsAdminTab(false)}
                        className="btn"
                        style={{ 
                            background: 'transparent',
                            color: !isAdminTab ? 'var(--primary)' : 'var(--text-secondary)',
                            borderBottom: !isAdminTab ? '2.5px solid var(--primary)' : 'none',
                            borderRadius: '0',
                            padding: '12px 16px',
                            fontWeight: !isAdminTab ? '700' : '500'
                        }}
                    >
                        Hộp thư cá nhân
                    </button>
                    <button 
                        onClick={() => setIsAdminTab(true)}
                        className="btn"
                        style={{ 
                            background: 'transparent',
                            color: isAdminTab ? 'var(--primary)' : 'var(--text-secondary)',
                            borderBottom: isAdminTab ? '2.5px solid var(--primary)' : 'none',
                            borderRadius: '0',
                            padding: '12px 16px',
                            fontWeight: isAdminTab ? '700' : '500'
                        }}
                    >
                        Quản trị thông báo
                    </button>
                </div>
            )}
            {error && <div className="alert alert-danger">{error}</div>}
            {loading ? (
                <div className="spinner"></div>
            ) : !isAdminTab ? (
                 
                <div>
                    {myNotifications.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                            <button className="btn btn-secondary btn-sm" onClick={handleMarkAllAsRead} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <CheckCheck size={14} />
                                <span>Đánh dấu đọc tất cả</span>
                            </button>
                        </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {myNotifications.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                Bạn chưa nhận được thông báo nào.
                            </div>
                        ) : (
                            myNotifications.map((notif) => (
                                <div 
                                    className="card" 
                                    key={notif.notification_id} 
                                    style={{ 
                                        display: 'flex', 
                                        gap: '20px', 
                                        alignItems: 'flex-start',
                                        borderLeft: notif.is_read ? '1px solid var(--border-color)' : '4px solid var(--primary)',
                                        opacity: notif.is_read ? '0.75' : '1'
                                    }}
                                >
                                    <div 
                                        className={`stats-icon ${notif.is_read ? 'secondary' : 'blue'}`} 
                                        style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0, cursor: !notif.is_read ? 'pointer' : 'default' }}
                                        onClick={() => !notif.is_read && handleMarkAsRead(notif.notification_id)}
                                        title={!notif.is_read ? 'Đánh dấu đã đọc' : ''}
                                    >
                                        <Bell size={18} />
                                    </div>
                                    <div style={{ flexGrow: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{notif.title}</h3>
                                            {!notif.is_read && (
                                                <button 
                                                    onClick={() => handleMarkAsRead(notif.notification_id)}
                                                    style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                                                >
                                                    <Check size={12} /> Đã xem
                                                </button>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: '1.4' }}>{notif.content}</p>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                            {new Date(notif.created_at).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                 
                <div>
                    <div className="filters-bar">
                        <div className="search-wrapper">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Tìm theo tiêu đề, nội dung hoặc người nhận..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '150px' }}>Thời gian</th>
                                        <th style={{ width: '130px' }}>Người nhận</th>
                                        <th style={{ width: '180px' }}>Tiêu đề</th>
                                        <th>Nội dung thông báo</th>
                                        <th style={{ width: '80px', textAlign: 'center' }}>Đã đọc</th>
                                        <th style={{ width: '100px', textAlign: 'center' }}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAdminNotifications.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                                Không tìm thấy thông báo nào.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAdminNotifications.map((notif) => (
                                            <tr key={notif.notification_id}>
                                                <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                                                    {new Date(notif.created_at).toLocaleString('vi-VN')}
                                                </td>
                                                <td>
                                                    <span style={{ fontWeight: '600' }}>{notif.username}</span>
                                                    <span style={{ fontSize: '11px', display: 'block', color: 'var(--text-secondary)' }}>
                                                        ({notif.role_name})
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: '600', fontSize: '13.5px' }}>{notif.title}</td>
                                                <td style={{ fontSize: '13.5px', lineHeight: '1.4' }}>{notif.content}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span className={`badge ${notif.is_read ? 'badge-success' : 'badge-danger'}`}>
                                                        {notif.is_read ? 'Rồi' : 'Chưa'}
                                                    </span>
                                                </td>
                                                <td style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(notif)} title="Sửa nội dung">
                                                        <Edit size={13} />
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(notif.notification_id)} title="Xóa thông báo">
                                                        <Trash2 size={13} />
                                                    </button>
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
            { }
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">Soạn thông báo hệ thống mới</div>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="modal-body">
                                {formError && <div className="alert alert-danger">{formError}</div>}
                                {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
                                <div className="form-group">
                                    <label>Đối tượng nhận thông báo *</label>
                                    <select
                                        className="form-control"
                                        required
                                        value={formData.target}
                                        onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                    >
                                        <option value="ALL">Tất cả người dùng (Toàn hệ thống)</option>
                                        <option value="TEACHERS">Toàn bộ Giảng viên</option>
                                        <option value="STUDENTS">Toàn bộ Sinh viên</option>
                                        <option value="USER">Gửi riêng cho một tài khoản cụ thể</option>
                                    </select>
                                </div>
                                {formData.target === 'USER' && (
                                    <div className="form-group">
                                        <label>Tên tài khoản người nhận (Username) *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            placeholder="Nhập chính xác username người nhận..."
                                            value={formData.specific_username}
                                            onChange={(e) => setFormData({ ...formData, specific_username: e.target.value })}
                                        />
                                    </div>
                                )}
                                <div className="form-group">
                                    <label>Tiêu đề thông báo *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        placeholder="VD: Cập nhật lịch thi giữa kỳ..."
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nội dung chi tiết *</label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        required
                                        placeholder="Nhập nội dung thông báo tại đây..."
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Send size={15} /> Gửi đi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            { }
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">Chỉnh sửa nội dung thông báo</div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                            Đang sửa thông báo gửi đến tài khoản: <strong>{selectedNotif?.username}</strong>
                        </p>
                        <form onSubmit={handleEditSubmit}>
                            <div className="modal-body">
                                {formError && <div className="alert alert-danger">{formError}</div>}
                                {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
                                <div className="form-group">
                                    <label>Tiêu đề thông báo *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nội dung chi tiết *</label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        required
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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
            {deleteConfirm.show && (
                <div className="modal-overlay" style={{ zIndex: 9999 }}>
                    <div className="modal-container" style={{ maxWidth: '450px' }}>
                        <div className="modal-header" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldAlert size={20} />
                            Xác nhận xóa thông báo
                        </div>
                        <div className="modal-body" style={{ padding: '15px 0' }}>
                            {deleteError && <div className="alert alert-danger" style={{ marginBottom: '15px' }}>{deleteError}</div>}
                            {deleteSuccess && <div className="alert alert-success" style={{ marginBottom: '15px' }}>{deleteSuccess}</div>}
                            
                            {!deleteSuccess && (
                                <p>
                                    Bạn có chắc chắn muốn xóa thông báo này? Hành động này sẽ xóa khỏi hộp thư của tất cả người nhận và không thể hoàn tác.
                                </p>
                            )}
                        </div>
                        <div className="modal-actions" style={{ marginTop: '10px' }}>
                            <button 
                                type="button"
                                className="btn btn-secondary" 
                                disabled={deleteLoading}
                                onClick={() => setDeleteConfirm({ show: false, id: null })}
                            >
                                Hủy
                            </button>
                            {!deleteSuccess && (
                                <button 
                                    type="button"
                                    className="btn btn-danger" 
                                    disabled={deleteLoading}
                                    onClick={executeDelete}
                                >
                                    {deleteLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Notifications;