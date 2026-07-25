import React, { useState, useEffect } from 'react';
import api from '../../api';
import { 
    Settings, ShieldAlert, Database, Plus, Trash2, Edit, 
    Search, Check, X, BookOpen, GraduationCap, Building
} from 'lucide-react';
const SystemManagement = () => {
    const [activeTab, setActiveTab] = useState('LOGS');
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [activityLogs, setActivityLogs] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    
    const [selectedItem, setSelectedItem] = useState(null);
    
    const [showChapterModal, setShowChapterModal] = useState(false);
    const [selectedSubjectForChapter, setSelectedSubjectForChapter] = useState(null);
    const [chaptersList, setChaptersList] = useState([]);
    const [chapterFormData, setChapterFormData] = useState({ chapter_code: '', chapter_name: '', chapter_order: '1', description: '' });
    const [editingChapterId, setEditingChapterId] = useState(null);
    const [chapterError, setChapterError] = useState('');
    const [chapterSuccess, setChapterSuccess] = useState('');
    
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: '', type: '' });
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState('');
    const [formData, setFormData] = useState({
        department_code: '',
        department_name: '',
        class_code: '',
        class_name: '',
        department_id: '',
        subject_code: '',
        subject_name: '',
        credits: '3',
        description: ''
    });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const fetchCatalogs = async () => {
        setLoading(true);
        setError('');
        try {
            if (activeTab === 'LOGS') {
                const res = await api.get(`/admin/logs?keyword=${keyword}`);
                if (res.data && res.data.success) {
                    setActivityLogs(res.data.data);
                }
            } else if (activeTab === 'DEPARTMENT') {
                const res = await api.get('/departments');
                if (res.data && res.data.success) {
                    setDepartments(res.data.data);
                }
            } else if (activeTab === 'CLASS') {
                
                const res = await api.get('/classes');
                if (res.data && res.data.success) {
                    setClasses(res.data.data);
                }
                
                const deptRes = await api.get('/departments');
                if (deptRes.data && deptRes.data.success) {
                    setDepartments(deptRes.data.data);
                }
            } else if (activeTab === 'SUBJECT') {
                const res = await api.get('/subjects');
                if (res.data && res.data.success) {
                    setSubjects(res.data.data);
                }
            }
        } catch (err) {
            setError('Lỗi tải dữ liệu nhật ký/danh mục từ máy chủ.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchCatalogs();
    }, [activeTab, keyword]);
    const fetchChapters = async (subjectId) => {
        try {
            const res = await api.get(`/chapters/subject/${subjectId}`);
            if (res.data && res.data.success) {
                setChaptersList(res.data.data);
            }
        } catch (err) {
            console.error(err);
        }
    };
    const openChapterModal = (subject) => {
        setSelectedSubjectForChapter(subject);
        setChapterError('');
        setChapterSuccess('');
        setEditingChapterId(null);
        setChapterFormData({ 
            chapter_code: '', 
            chapter_name: '', 
            chapter_order: String(subjects.find(s => s.subject_id === subject.subject_id)?.chapters_count + 1 || '1'), 
            description: '' 
        });
        fetchChapters(subject.subject_id);
        setShowChapterModal(true);
    };
    const handleChapterSubmit = async (e) => {
        e.preventDefault();
        setChapterError('');
        setChapterSuccess('');
        try {
            if (editingChapterId) {
                const res = await api.put(`/chapters/${editingChapterId}`, {
                    chapter_code: chapterFormData.chapter_code.trim().toUpperCase(),
                    chapter_name: chapterFormData.chapter_name.trim(),
                    chapter_order: parseInt(chapterFormData.chapter_order),
                    description: chapterFormData.description.trim() || null
                });
                if (res.data && res.data.success) {
                    setChapterSuccess('Cập nhật chương học thành công!');
                    setEditingChapterId(null);
                    setChapterFormData({ chapter_code: '', chapter_name: '', chapter_order: '1', description: '' });
                    fetchChapters(selectedSubjectForChapter.subject_id);
                }
            } else {
                const res = await api.post('/chapters', {
                    subject_id: selectedSubjectForChapter.subject_id,
                    chapter_code: chapterFormData.chapter_code.trim().toUpperCase(),
                    chapter_name: chapterFormData.chapter_name.trim(),
                    chapter_order: parseInt(chapterFormData.chapter_order),
                    description: chapterFormData.description.trim() || null
                });
                if (res.data && res.data.success) {
                    setChapterSuccess('Thêm chương học thành công!');
                    setChapterFormData({ 
                        chapter_code: '', 
                        chapter_name: '', 
                        chapter_order: String(chaptersList.length + 2), 
                        description: '' 
                    });
                    fetchChapters(selectedSubjectForChapter.subject_id);
                }
            }
        } catch (err) {
            setChapterError(err.response?.data?.message || 'Lỗi xử lý chương học.');
        }
    };
    const handleEditChapter = (chapter) => {
        setChapterError('');
        setChapterSuccess('');
        setEditingChapterId(chapter.chapter_id);
        setChapterFormData({
            chapter_code: chapter.chapter_code || '',
            chapter_name: chapter.chapter_name || '',
            chapter_order: String(chapter.chapter_order || '1'),
            description: chapter.description || ''
        });
    };
    const triggerDelete = (id, name, type) => {
        setDeleteError('');
        setDeleteSuccess('');
        setDeleteConfirm({ show: true, id, name, type });
    };
    const executeDelete = async () => {
        setDeleteLoading(true);
        setDeleteError('');
        setDeleteSuccess('');
        try {
            const { id, type } = deleteConfirm;
            let res;
            if (type === 'DEPARTMENT') {
                res = await api.delete(`/departments/${id}`);
            } else if (type === 'CLASS') {
                res = await api.delete(`/classes/${id}`);
            } else if (type === 'SUBJECT') {
                res = await api.delete(`/subjects/${id}`);
            } else if (type === 'CHAPTER') {
                res = await api.delete(`/chapters/${id}`);
            }
            if (res && res.data && res.data.success) {
                setDeleteSuccess('Đã xóa thành công!');
                
                if (type === 'CHAPTER') {
                    if (selectedSubjectForChapter) {
                        fetchChapters(selectedSubjectForChapter.subject_id);
                    }
                    if (editingChapterId === id) {
                        setEditingChapterId(null);
                        setChapterFormData({ chapter_code: '', chapter_name: '', chapter_order: '1', description: '' });
                    }
                } else {
                    fetchCatalogs();
                }
                setTimeout(() => {
                    setDeleteConfirm({ show: false, id: null, name: '', type: '' });
                    setDeleteSuccess('');
                }, 1500);
            }
        } catch (err) {
            setDeleteError(err.response?.data?.message || 'Lỗi xảy ra khi xóa dữ liệu. Có thể do ràng buộc khóa ngoại.');
        } finally {
            setDeleteLoading(false);
        }
    };
    const handleDeleteChapter = (chapterId, chapterName) => {
        triggerDelete(chapterId, chapterName, 'CHAPTER');
    };
    const openAddModal = () => {
        setFormError('');
        setFormSuccess('');
        setFormData({
            department_code: '',
            department_name: '',
            class_code: '',
            class_name: '',
            department_id: departments[0]?.department_id || '',
            subject_code: '',
            subject_name: '',
            credits: '3',
            description: ''
        });
        setShowAddModal(true);
    };
    const openEditModal = (item) => {
        setFormError('');
        setFormSuccess('');
        setSelectedItem(item);
        if (activeTab === 'DEPARTMENT') {
            setFormData({
                department_code: item.department_code || '',
                department_name: item.department_name || '',
                description: item.description || ''
            });
        } else if (activeTab === 'CLASS') {
            setFormData({
                class_code: item.class_code || '',
                class_name: item.class_name || '',
                department_id: item.department_id || '',
                description: item.description || ''
            });
        } else if (activeTab === 'SUBJECT') {
            setFormData({
                subject_code: item.subject_code || '',
                subject_name: item.subject_name || '',
                credits: item.credits ? String(item.credits) : '3',
                description: item.description || ''
            });
        }
        setShowEditModal(true);
    };
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        try {
            let res;
            if (activeTab === 'DEPARTMENT') {
                res = await api.post('/departments', {
                    department_code: formData.department_code.trim().toUpperCase(),
                    department_name: formData.department_name.trim(),
                    description: formData.description.trim() || null
                });
            } else if (activeTab === 'CLASS') {
                if (!formData.department_id) {
                    setFormError('Vui lòng chọn khoa trực thuộc.');
                    return;
                }
                res = await api.post('/classes', {
                    class_code: formData.class_code.trim().toUpperCase(),
                    class_name: formData.class_name.trim(),
                    department_id: parseInt(formData.department_id),
                    description: formData.description.trim() || null
                });
            } else if (activeTab === 'SUBJECT') {
                res = await api.post('/subjects', {
                    subject_code: formData.subject_code.trim().toUpperCase(),
                    subject_name: formData.subject_name.trim(),
                    credits: parseInt(formData.credits),
                    description: formData.description.trim() || null
                });
            }
            if (res && res.data && res.data.success) {
                setFormSuccess('Thêm danh mục thành công!');
                fetchCatalogs();
                setTimeout(() => setShowAddModal(false), 1500);
            }
        } catch (err) {
            setFormError(err.response?.data?.message || 'Lỗi thêm bản ghi mới.');
        }
    };
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        try {
            let res;
            if (activeTab === 'DEPARTMENT') {
                res = await api.put(`/departments/${selectedItem.department_id}`, {
                    department_code: formData.department_code.trim().toUpperCase(),
                    department_name: formData.department_name.trim(),
                    description: formData.description.trim() || null
                });
            } else if (activeTab === 'CLASS') {
                res = await api.put(`/classes/${selectedItem.class_id}`, {
                    class_code: formData.class_code.trim().toUpperCase(),
                    class_name: formData.class_name.trim(),
                    department_id: parseInt(formData.department_id),
                    description: formData.description.trim() || null
                });
            } else if (activeTab === 'SUBJECT') {
                res = await api.put(`/subjects/${selectedItem.subject_id}`, {
                    subject_code: formData.subject_code.trim().toUpperCase(),
                    subject_name: formData.subject_name.trim(),
                    credits: parseInt(formData.credits),
                    description: formData.description.trim() || null
                });
            }
            if (res && res.data && res.data.success) {
                setFormSuccess('Cập nhật bản ghi thành công!');
                fetchCatalogs();
                setTimeout(() => setShowEditModal(false), 1500);
            }
        } catch (err) {
            setFormError(err.response?.data?.message || 'Lỗi khi cập nhật bản ghi.');
        }
    };
    const handleDelete = (id, name) => {
        triggerDelete(id, name, activeTab);
    };
    const getFilteredList = () => {
        if (activeTab === 'DEPARTMENT') {
            return departments.filter(d => 
                d.department_name.toLowerCase().includes(keyword.toLowerCase()) || 
                d.department_code.toLowerCase().includes(keyword.toLowerCase())
            );
        } else if (activeTab === 'CLASS') {
            return classes.filter(c => 
                c.class_name.toLowerCase().includes(keyword.toLowerCase()) || 
                c.class_code.toLowerCase().includes(keyword.toLowerCase()) ||
                c.department_name.toLowerCase().includes(keyword.toLowerCase())
            );
        } else if (activeTab === 'SUBJECT') {
            return subjects.filter(s => 
                s.subject_name.toLowerCase().includes(keyword.toLowerCase()) || 
                s.subject_code.toLowerCase().includes(keyword.toLowerCase())
            );
        }
        return [];
    };
    const filteredList = getFilteredList();
    const getLogActionBadgeClass = (action) => {
        if (action.includes('ĐĂNG NHẬP')) return 'badge-success';
        if (action.includes('ĐĂNG XUẤT')) return 'badge-secondary';
        if (action.includes('BẢO MẬT')) return 'badge-danger';
        return 'badge-primary';
    };
    return (
        <div>
            { }
            <div className="section-header">
                <h1 className="section-title">Quản trị hệ thống & Danh mục</h1>
                {activeTab !== 'LOGS' && (
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <Plus size={18} />
                        <span>Thêm mới</span>
                    </button>
                )}
            </div>
            { }
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '20px', gap: '10px' }}>
                <button 
                    onClick={() => { setActiveTab('LOGS'); setKeyword(''); }}
                    className={`btn`}
                    style={{ 
                        background: 'transparent',
                        color: activeTab === 'LOGS' ? 'var(--primary)' : 'var(--text-secondary)',
                        borderBottom: activeTab === 'LOGS' ? '2.5px solid var(--primary)' : 'none',
                        borderRadius: '0',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: activeTab === 'LOGS' ? '700' : '500'
                    }}
                >
                    <ShieldAlert size={18} />
                    <span>Nhật ký hoạt động</span>
                </button>
                <button 
                    onClick={() => { setActiveTab('DEPARTMENT'); setKeyword(''); }}
                    className={`btn`}
                    style={{ 
                        background: 'transparent',
                        color: activeTab === 'DEPARTMENT' ? 'var(--primary)' : 'var(--text-secondary)',
                        borderBottom: activeTab === 'DEPARTMENT' ? '2.5px solid var(--primary)' : 'none',
                        borderRadius: '0',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: activeTab === 'DEPARTMENT' ? '700' : '500'
                    }}
                >
                    <Building size={18} />
                    <span>Danh mục Khoa</span>
                </button>
                <button 
                    onClick={() => { setActiveTab('CLASS'); setKeyword(''); }}
                    className={`btn`}
                    style={{ 
                        background: 'transparent',
                        color: activeTab === 'CLASS' ? 'var(--primary)' : 'var(--text-secondary)',
                        borderBottom: activeTab === 'CLASS' ? '2.5px solid var(--primary)' : 'none',
                        borderRadius: '0',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: activeTab === 'CLASS' ? '700' : '500'
                    }}
                >
                    <GraduationCap size={18} />
                    <span>Danh mục Lớp</span>
                </button>
                <button 
                    onClick={() => { setActiveTab('SUBJECT'); setKeyword(''); }}
                    className={`btn`}
                    style={{ 
                        background: 'transparent',
                        color: activeTab === 'SUBJECT' ? 'var(--primary)' : 'var(--text-secondary)',
                        borderBottom: activeTab === 'SUBJECT' ? '2.5px solid var(--primary)' : 'none',
                        borderRadius: '0',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: activeTab === 'SUBJECT' ? '700' : '500'
                    }}
                >
                    <BookOpen size={18} />
                    <span>Danh mục Môn học</span>
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
                            activeTab === 'LOGS' 
                                ? "Tìm nhật ký theo tài khoản, phân loại, hành động..." 
                                : "Tìm kiếm theo mã hoặc tên..."
                        }
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            { }
            {loading ? (
                <div className="spinner"></div>
            ) : (
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div className="table-container">
                        {activeTab === 'LOGS' && (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '180px' }}>Thời gian</th>
                                        <th style={{ width: '150px' }}>Tài khoản</th>
                                        <th style={{ width: '150px' }}>Phân loại</th>
                                        <th>Chi tiết thao tác</th>
                                        <th style={{ width: '140px', textAlign: 'center' }}>Địa chỉ IP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activityLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                                Chưa phát sinh nhật ký hoạt động nào.
                                            </td>
                                        </tr>
                                    ) : (
                                        activityLogs.map((log) => (
                                            <tr key={log.log_id}>
                                                <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                    {new Date(log.created_at).toLocaleString('vi-VN')}
                                                </td>
                                                <td>
                                                    <span style={{ fontWeight: '600' }}>{log.username}</span>
                                                    <span className="text-muted" style={{ fontSize: '11px', display: 'block' }}>
                                                        ({log.role_name})
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${getLogActionBadgeClass(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: '14px', lineHeight: '1.4' }}>
                                                    {log.description}
                                                </td>
                                                <td style={{ fontFamily: 'monospace', fontSize: '13px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                                    {log.ip_address || '127.0.0.1'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                        {activeTab === 'DEPARTMENT' && (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Mã Khoa</th>
                                        <th>Tên khoa</th>
                                        <th>Mô tả</th>
                                        <th>Trạng thái</th>
                                        <th style={{ textAlign: 'center' }}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredList.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có khoa nào được tạo.</td>
                                        </tr>
                                    ) : (
                                        filteredList.map((item) => (
                                            <tr key={item.department_id}>
                                                <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{item.department_code}</td>
                                                <td style={{ fontWeight: '500' }}>{item.department_name}</td>
                                                <td>{item.description || '-'}</td>
                                                <td>
                                                    <span className={`badge ${item.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                                                        {item.status === 'ACTIVE' ? 'Kích hoạt' : 'Khóa'}
                                                    </span>
                                                </td>
                                                <td style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(item)} title="Sửa">
                                                        <Edit size={13} />
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.department_id, item.department_name)} title="Xóa">
                                                        <Trash2 size={13} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                        {activeTab === 'CLASS' && (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Mã Lớp</th>
                                        <th>Tên lớp</th>
                                        <th>Khoa trực thuộc</th>
                                        <th>Mô tả</th>
                                        <th>Trạng thái</th>
                                        <th style={{ textAlign: 'center' }}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredList.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có lớp nào được tạo.</td>
                                        </tr>
                                    ) : (
                                        filteredList.map((item) => (
                                            <tr key={item.class_id}>
                                                <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{item.class_code}</td>
                                                <td style={{ fontWeight: '500' }}>{item.class_name}</td>
                                                <td>{item.department_name}</td>
                                                <td>{item.description || '-'}</td>
                                                <td>
                                                    <span className={`badge ${item.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                                                        {item.status === 'ACTIVE' ? 'Kích hoạt' : 'Khóa'}
                                                    </span>
                                                </td>
                                                <td style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(item)} title="Sửa">
                                                        <Edit size={13} />
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.class_id, item.class_name)} title="Xóa">
                                                        <Trash2 size={13} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                        {activeTab === 'SUBJECT' && (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Mã Môn</th>
                                        <th>Tên môn học</th>
                                        <th>Số tín chỉ</th>
                                        <th>Mô tả</th>
                                        <th>Trạng thái</th>
                                        <th style={{ textAlign: 'center' }}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredList.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có môn học nào được tạo.</td>
                                        </tr>
                                    ) : (
                                        filteredList.map((item) => (
                                            <tr key={item.subject_id}>
                                                <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{item.subject_code}</td>
                                                <td style={{ fontWeight: '500' }}>{item.subject_name}</td>
                                                <td>{item.credits} tín chỉ</td>
                                                <td>{item.description || '-'}</td>
                                                <td>
                                                    <span className={`badge ${item.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                                                        {item.status === 'ACTIVE' ? 'Hoạt động' : 'Khóa'}
                                                    </span>
                                                </td>
                                                <td style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                    <button className="btn btn-primary btn-sm" onClick={() => openChapterModal(item)} title="Quản lý chương học" style={{ background: '#10b981', borderColor: '#10b981' }}>
                                                        <BookOpen size={13} />
                                                    </button>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(item)} title="Sửa">
                                                        <Edit size={13} />
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.subject_id, item.subject_name)} title="Xóa">
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
                    <div className="modal-container">
                        <div className="modal-header">
                            Thêm mới {
                                activeTab === 'DEPARTMENT' ? 'Khoa đào tạo' :
                                activeTab === 'CLASS' ? 'Lớp học' : 'Môn học'
                            }
                        </div>
                        <form onSubmit={handleAddSubmit}>
                            <div className="modal-body">
                                {formError && <div className="alert alert-danger">{formError}</div>}
                                {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
                                {activeTab === 'DEPARTMENT' && (
                                    <>
                                        <div className="form-group">
                                            <label>Mã khoa *</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                required 
                                                placeholder="VD: CNTT"
                                                value={formData.department_code}
                                                onChange={(e) => setFormData({ ...formData, department_code: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Tên khoa *</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                required 
                                                placeholder="VD: Khoa Công nghệ thông tin"
                                                value={formData.department_name}
                                                onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}
                                {activeTab === 'CLASS' && (
                                    <>
                                        <div className="form-group">
                                            <label>Khoa trực thuộc *</label>
                                            <select
                                                className="form-control"
                                                required
                                                value={formData.department_id}
                                                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                            >
                                                <option value="">-- Chọn khoa trực thuộc --</option>
                                                {departments.map(d => (
                                                    <option key={d.department_id} value={d.department_id}>
                                                        {d.department_name} ({d.department_code})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Mã lớp học *</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                required 
                                                placeholder="VD: CNTT01"
                                                value={formData.class_code}
                                                onChange={(e) => setFormData({ ...formData, class_code: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Tên lớp học *</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                required 
                                                placeholder="VD: Lớp Kỹ thuật phần mềm 1"
                                                value={formData.class_name}
                                                onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}
                                {activeTab === 'SUBJECT' && (
                                    <>
                                        <div className="grid-2">
                                            <div className="form-group">
                                                <label>Mã môn học *</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    required 
                                                    placeholder="VD: JS_01"
                                                    value={formData.subject_code}
                                                    onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Số tín chỉ *</label>
                                                <input 
                                                    type="number" 
                                                    className="form-control" 
                                                    required 
                                                    value={formData.credits}
                                                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Tên môn học *</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                required 
                                                placeholder="VD: Lập trình Javascript"
                                                value={formData.subject_name}
                                                onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}
                                <div className="form-group">
                                    <label>Mô tả ngắn</label>
                                    <textarea 
                                        className="form-control" 
                                        rows="2"
                                        placeholder="Không bắt buộc..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    <div className="modal-container">
                        <div className="modal-header">
                            Chỉnh sửa {
                                activeTab === 'DEPARTMENT' ? 'Khoa đào tạo' :
                                activeTab === 'CLASS' ? 'Lớp học' : 'Môn học'
                            }
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="modal-body">
                                {formError && <div className="alert alert-danger">{formError}</div>}
                                {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
                                {activeTab === 'DEPARTMENT' && (
                                    <>
                                        <div className="form-group">
                                            <label>Mã khoa *</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                required 
                                                value={formData.department_code}
                                                onChange={(e) => setFormData({ ...formData, department_code: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Tên khoa *</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                required 
                                                value={formData.department_name}
                                                onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}
                                {activeTab === 'CLASS' && (
                                    <>
                                        <div className="form-group">
                                            <label>Khoa trực thuộc *</label>
                                            <select
                                                className="form-control"
                                                required
                                                value={formData.department_id}
                                                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                            >
                                                {departments.map(d => (
                                                    <option key={d.department_id} value={d.department_id}>
                                                        {d.department_name} ({d.department_code})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Mã lớp học *</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                required 
                                                value={formData.class_code}
                                                onChange={(e) => setFormData({ ...formData, class_code: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Tên lớp học *</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                required 
                                                value={formData.class_name}
                                                onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}
                                {activeTab === 'SUBJECT' && (
                                    <>
                                        <div className="grid-2">
                                            <div className="form-group">
                                                <label>Mã môn học *</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    required 
                                                    value={formData.subject_code}
                                                    onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Số tín chỉ *</label>
                                                <input 
                                                    type="number" 
                                                    className="form-control" 
                                                    required 
                                                    value={formData.credits}
                                                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Tên môn học *</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                required 
                                                value={formData.subject_name}
                                                onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}
                                <div className="form-group">
                                    <label>Mô tả ngắn</label>
                                    <textarea 
                                        className="form-control" 
                                        rows="2"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            { }
            {showChapterModal && selectedSubjectForChapter && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '850px', width: '95%', padding: '24px' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>
                                Quản lý chương học - Môn: {selectedSubjectForChapter.subject_name}
                            </h2>
                            <button 
                                onClick={() => setShowChapterModal(false)} 
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
                            { }
                            <div>
                                <h3 style={{ fontSize: '15px', marginBottom: '12px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <BookOpen size={16} />
                                    <span>Danh sách chương học ({chaptersList.length})</span>
                                </h3>
                                
                                <div className="table-container" style={{ maxHeight: '45vh', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                    <table className="table" style={{ fontSize: '13px' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '60px', padding: '10px', textAlign: 'center' }}>Thứ tự</th>
                                                <th style={{ width: '90px', padding: '10px' }}>Mã chương</th>
                                                <th style={{ padding: '10px' }}>Tên chương</th>
                                                <th style={{ width: '90px', textAlign: 'center', padding: '10px' }}>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {chaptersList.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                                                        Môn học này chưa có chương học nào.
                                                    </td>
                                                </tr>
                                            ) : (
                                                chaptersList.map((chap) => (
                                                    <tr key={chap.chapter_id} style={{ background: editingChapterId === chap.chapter_id ? 'rgba(var(--primary-rgb), 0.05)' : 'transparent' }}>
                                                        <td style={{ textAlign: 'center', fontWeight: '600', padding: '10px' }}>{chap.chapter_order}</td>
                                                        <td style={{ fontWeight: '700', fontFamily: 'monospace', color: 'var(--primary)', padding: '10px' }}>{chap.chapter_code}</td>
                                                        <td style={{ padding: '10px' }}>
                                                            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{chap.chapter_name}</div>
                                                            {chap.description && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{chap.description}</div>}
                                                        </td>
                                                        <td style={{ padding: '10px' }}>
                                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                                <button 
                                                                    className="btn btn-secondary btn-sm" 
                                                                    style={{ padding: '4px 6px' }} 
                                                                    onClick={() => handleEditChapter(chap)} 
                                                                    title="Sửa chương"
                                                                >
                                                                    <Edit size={12} />
                                                                </button>
                                                                <button 
                                                                    className="btn btn-danger btn-sm" 
                                                                    style={{ padding: '4px 6px' }} 
                                                                    onClick={() => handleDeleteChapter(chap.chapter_id, chap.chapter_name)} 
                                                                    title="Xóa chương"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            { }
                            <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '25px' }}>
                                <h3 style={{ fontSize: '15px', marginBottom: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                    {editingChapterId ? 'Chỉnh sửa chương' : 'Thêm chương học mới'}
                                </h3>
                                
                                {chapterError && <div className="alert alert-danger" style={{ padding: '10px', fontSize: '13px', marginBottom: '15px' }}>{chapterError}</div>}
                                {chapterSuccess && <div className="alert alert-success" style={{ padding: '10px', fontSize: '13px', marginBottom: '15px' }}>{chapterSuccess}</div>}
                                
                                <form onSubmit={handleChapterSubmit}>
                                    <div className="form-group" style={{ marginBottom: '14px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: '500', marginBottom: '5px', display: 'block' }}>Thứ tự chương *</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            required 
                                            min="1"
                                            value={chapterFormData.chapter_order}
                                            onChange={(e) => setChapterFormData({ ...chapterFormData, chapter_order: e.target.value })}
                                        />
                                    </div>
                                    
                                    <div className="form-group" style={{ marginBottom: '14px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: '500', marginBottom: '5px', display: 'block' }}>Mã chương *</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            required 
                                            placeholder="Ví dụ: CH1, CH_01..."
                                            value={chapterFormData.chapter_code}
                                            onChange={(e) => setChapterFormData({ ...chapterFormData, chapter_code: e.target.value })}
                                        />
                                    </div>
                                    
                                    <div className="form-group" style={{ marginBottom: '14px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: '500', marginBottom: '5px', display: 'block' }}>Tên chương học *</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            required 
                                            placeholder="Ví dụ: Tổng quan và cài đặt..."
                                            value={chapterFormData.chapter_name}
                                            onChange={(e) => setChapterFormData({ ...chapterFormData, chapter_name: e.target.value })}
                                        />
                                    </div>
                                    
                                    <div className="form-group" style={{ marginBottom: '18px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: '500', marginBottom: '5px', display: 'block' }}>Mô tả chương</label>
                                        <textarea 
                                            className="form-control" 
                                            rows="3"
                                            placeholder="Mô tả nội dung học của chương..."
                                            value={chapterFormData.description}
                                            onChange={(e) => setChapterFormData({ ...chapterFormData, description: e.target.value })}
                                        />
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {editingChapterId && (
                                            <button 
                                                type="button" 
                                                className="btn btn-secondary" 
                                                style={{ flex: 1 }} 
                                                onClick={() => {
                                                    setEditingChapterId(null);
                                                    setChapterFormData({ 
                                                        chapter_code: '', 
                                                        chapter_name: '', 
                                                        chapter_order: String(chaptersList.length + 1), 
                                                        description: '' 
                                                    });
                                                }}
                                            >
                                                Hủy sửa
                                            </button>
                                        )}
                                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                            {editingChapterId ? 'Lưu thay đổi' : 'Tạo chương'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            { }
            {deleteConfirm.show && (
                <div className="modal-overlay" style={{ zIndex: 9999 }}>
                    <div className="modal-container" style={{ maxWidth: '450px' }}>
                        <div className="modal-header" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldAlert size={20} />
                            Xác nhận xóa
                        </div>
                        <div className="modal-body" style={{ padding: '15px 0' }}>
                            {deleteError && <div className="alert alert-danger" style={{ marginBottom: '15px' }}>{deleteError}</div>}
                            {deleteSuccess && <div className="alert alert-success" style={{ marginBottom: '15px' }}>{deleteSuccess}</div>}
                            
                            {!deleteSuccess && (
                                <p>
                                    Bạn có chắc chắn muốn xóa {
                                        deleteConfirm.type === 'DEPARTMENT' ? 'Khoa' :
                                        deleteConfirm.type === 'CLASS' ? 'Lớp học' :
                                        deleteConfirm.type === 'SUBJECT' ? 'Môn học' : 'Chương học'
                                    } <strong>"{deleteConfirm.name}"</strong>? Hành động này không thể hoàn tác.
                                </p>
                            )}
                        </div>
                        <div className="modal-actions" style={{ marginTop: '10px' }}>
                            <button 
                                type="button"
                                className="btn btn-secondary" 
                                disabled={deleteLoading}
                                onClick={() => setDeleteConfirm({ show: false, id: null, name: '', type: '' })}
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
export default SystemManagement;