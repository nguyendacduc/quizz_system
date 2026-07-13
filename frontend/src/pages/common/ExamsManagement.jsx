import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Search, Plus, Eye, Award, CheckCircle, HelpCircle, FileText, ChevronRight, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
const ExamsManagement = () => {
    const { user } = useAuth();
    const [exams, setExams] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showGenModal, setShowGenModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    
    const [selectedExam, setSelectedExam] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, code: '', name: '' });
    const [deleteLoading, setDeleteLoading] = useState(false);
    
    const [createFormData, setCreateFormData] = useState({
        exam_code: '',
        exam_name: '',
        duration: '60',
        shuffle_questions: 1,
        shuffle_answers: 1,
        subject_id: '',
        teacher_id: '', 
        num_questions: '20',
        total_score: '10.0'
    });
    
    const [genFormData, setGenFormData] = useState({
        subject_id: '',
        num_questions: '20',
        total_score: '10.0'
    });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [teachersList, setTeachersList] = useState([]);
    const fetchExams = async () => {
        try {
            setLoading(true);
            const res = await api.get('/exams');
            if (res.data && res.data.success) {
                setExams(res.data.data);
            }
        } catch (err) {
            setError('Lỗi tải danh sách đề thi');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const fetchSubjects = async () => {
        try {
            const res = await api.get('/subjects');
            if (res.data && res.data.success) {
                setSubjects(res.data.data);
                
                
                const defaultSub = res.data.data[0]?.subject_id || '';
                setCreateFormData(prev => ({ ...prev, subject_id: defaultSub }));
                setGenFormData(prev => ({ ...prev, subject_id: defaultSub }));
            }
        } catch (err) {
            console.error('Error fetching subjects:', err);
        }
    };
    const fetchTeachers = async () => {
        try {
            const res = await api.get('/admin/users/teachers');
            if (res.data && res.data.success) {
                setTeachersList(res.data.data);
                if (res.data.data.length > 0) {
                    setCreateFormData(prev => ({ ...prev, teacher_id: String(res.data.data[0].teacher_id) }));
                }
            }
        } catch (err) {
            console.error('Error fetching teachers:', err);
        }
    };
    useEffect(() => {
        fetchExams();
        fetchSubjects();
        if (user && user.role_code === 'ADMIN') {
            fetchTeachers();
        }
    }, [user]);
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        const payload = {
            ...createFormData,
            duration: parseInt(createFormData.duration),
            shuffle_questions: parseInt(createFormData.shuffle_questions),
            shuffle_answers: parseInt(createFormData.shuffle_answers),
            subject_id: parseInt(createFormData.subject_id),
            num_questions: parseInt(createFormData.num_questions),
            total_score: parseFloat(createFormData.total_score),
            teacher_id: user.role_code === 'ADMIN' ? parseInt(createFormData.teacher_id || '1') : undefined
        };
        try {
            const res = await api.post('/exams', payload);
            if (res.data && res.data.success) {
                setFormSuccess('Tạo đề thi tự động thành công!');
                fetchExams();
                setTimeout(() => {
                    setShowCreateModal(false);
                    
                    setCreateFormData(prev => ({
                        ...prev,
                        exam_code: '',
                        exam_name: '',
                        duration: '60',
                        num_questions: '20',
                        total_score: '10.0'
                    }));
                }, 1500);
            }
        } catch (err) {
            setFormError(err.response?.data?.message || 'Có lỗi khi tạo đề thi. Đảm bảo ngân hàng đủ câu hỏi.');
        }
    };
    const handleGenSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        const payload = {
            subject_id: parseInt(genFormData.subject_id),
            num_questions: parseInt(genFormData.num_questions),
            total_score: parseFloat(genFormData.total_score)
        };
        try {
            const res = await api.post(`/exams/${selectedExam.exam_id}/auto-generate`, payload);
            if (res.data && res.data.success) {
                setFormSuccess(res.data.message || 'Sinh câu hỏi đề thi thành công!');
                fetchExams();
                setTimeout(() => setShowGenModal(false), 1500);
            }
        } catch (err) {
            setFormError(err.response?.data?.message || 'Lỗi sinh đề ngẫu nhiên. Ngân hàng câu hỏi có thể không đủ.');
        }
    };
    const handleOpenPreview = async (exam) => {
        setSelectedExam(exam);
        setShowPreviewModal(true);
        setPreviewLoading(true);
        setPreviewData(null);
        try {
            const res = await api.get(`/exams/${exam.exam_id}/preview`);
            if (res.data && res.data.success) {
                setPreviewData(res.data.data);
            }
        } catch (err) {
            alert('Không thể tải dữ liệu xem trước đề thi');
            setShowPreviewModal(false);
        } finally {
            setPreviewLoading(false);
        }
    };
    const handleDeleteClick = (exam) => {
        setDeleteConfirm({
            show: true,
            id: exam.exam_id,
            code: exam.exam_code,
            name: exam.exam_name
        });
    };
    const executeDeleteExam = async () => {
        setDeleteLoading(true);
        try {
            const res = await api.delete(`/exams/${deleteConfirm.id}`);
            if (res.data && res.data.success) {
                fetchExams();
                setDeleteConfirm({ show: false, id: null, code: '', name: '' });
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra khi xóa đề thi.');
        } finally {
            setDeleteLoading(false);
        }
    };
    return (
        <div>
            <div className="section-header">
                <h1 className="section-title">Quản lý đề thi</h1>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    <span>Tạo đề thi mới</span>
                </button>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            {loading ? (
                <div className="spinner"></div>
            ) : (
                <div className="grid-2">
                    {exams.length === 0 ? (
                        <div className="card" style={{ gridColumn: 'span 2', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Chưa có đề thi nào được tạo.
                        </div>
                    ) : (
                        exams.map((exam) => (
                            <div className="card" key={exam.exam_id} style={{ display: 'flex', flexDirection: 'column', justifyItems: 'space-between' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <span className="badge badge-primary">{exam.subject_name || `Môn ID: ${exam.subject_id}`}</span>
                                        <span className="badge badge-success">{exam.duration} phút</span>
                                    </div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>{exam.exam_name}</h3>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                                        Mã đề: <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{exam.exam_code}</span> | 
                                        Người tạo: {exam.teacher_name || `Giảng viên ID: ${exam.teacher_id}`}
                                    </p>
                                    <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <HelpCircle size={15} />
                                            <span>Số câu hỏi: {exam.total_questions || 0}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Award size={15} />
                                            <span>Tổng điểm: {exam.total_score || 0}đ (Đạt: {exam.pass_score || 0}đ)</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', flexWrap: 'wrap' }}>
                                    <button className="btn btn-secondary btn-sm" onClick={() => handleOpenPreview(exam)}>
                                        <Eye size={14} /> Xem trước
                                    </button>
                                    <button 
                                        className="btn btn-primary btn-sm" 
                                        onClick={() => {
                                            setSelectedExam(exam);
                                            setGenFormData(prev => ({ 
                                                ...prev, 
                                                subject_id: exam.subject_id,
                                                num_questions: exam.total_questions || '20',
                                                total_score: exam.total_score || '10.0'
                                            }));
                                            setShowGenModal(true);
                                        }}
                                    >
                                        Sinh lại đề ngẫu nhiên
                                    </button>
                                    <button 
                                        className="btn btn-danger btn-sm" 
                                        style={{ background: 'var(--danger)', borderColor: 'var(--danger)', color: '#fff', marginLeft: 'auto' }}
                                        onClick={() => handleDeleteClick(exam)}
                                    >
                                        <Trash2 size={14} /> Xóa
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
                        <div className="modal-header">Tạo đề thi mới</div>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="modal-body">
                                {formError && <div className="alert alert-danger">{formError}</div>}
                                {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
                                <div className="form-group">
                                    <label>Môn học *</label>
                                    <select
                                        className="form-control"
                                        required
                                        value={createFormData.subject_id}
                                        onChange={(e) => setCreateFormData({ ...createFormData, subject_id: e.target.value })}
                                    >
                                        {subjects.map(s => (
                                            <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Mã đề thi *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            placeholder="VD: HK1_JS"
                                            value={createFormData.exam_code}
                                            onChange={(e) => setCreateFormData({ ...createFormData, exam_code: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Thời gian (phút) *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            required
                                            value={createFormData.duration}
                                            onChange={(e) => setCreateFormData({ ...createFormData, duration: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Tên đề thi *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        placeholder="VD: Đề kiểm tra giữa kỳ Javascript"
                                        value={createFormData.exam_name}
                                        onChange={(e) => setCreateFormData({ ...createFormData, exam_name: e.target.value })}
                                    />
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Số lượng câu hỏi tự động *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            required
                                            min="1"
                                            max="100"
                                            placeholder="VD: 20"
                                            value={createFormData.num_questions}
                                            onChange={(e) => setCreateFormData({ ...createFormData, num_questions: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Tổng điểm đề thi *</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            className="form-control"
                                            required
                                            min="1"
                                            placeholder="VD: 10"
                                            value={createFormData.total_score}
                                            onChange={(e) => setCreateFormData({ ...createFormData, total_score: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Trộn thứ tự câu hỏi</label>
                                        <select
                                            className="form-control"
                                            value={createFormData.shuffle_questions}
                                            onChange={(e) => setCreateFormData({ ...createFormData, shuffle_questions: e.target.value })}
                                        >
                                            <option value={1}>Có trộn</option>
                                            <option value={0}>Không trộn</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Trộn thứ tự đáp án</label>
                                        <select
                                            className="form-control"
                                            value={createFormData.shuffle_answers}
                                            onChange={(e) => setCreateFormData({ ...createFormData, shuffle_answers: e.target.value })}
                                        >
                                            <option value={1}>Có trộn</option>
                                            <option value={0}>Không trộn</option>
                                        </select>
                                    </div>
                                </div>
                                {user.role_code === 'ADMIN' && (
                                    <div className="form-group">
                                        <label>Giáo viên soạn đề *</label>
                                        <select
                                            className="form-control"
                                            required
                                            value={createFormData.teacher_id}
                                            onChange={(e) => setCreateFormData({ ...createFormData, teacher_id: e.target.value })}
                                        >
                                            <option value="">-- Chọn giáo viên soạn đề --</option>
                                            {teachersList.map(t => (
                                                <option key={t.teacher_id} value={t.teacher_id}>
                                                    {t.full_name} ({t.teacher_code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Tạo đề
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            { }
            {showGenModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">Sinh lại đề thi ngẫu nhiên</div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                            Sinh ngẫu nhiên các câu hỏi từ Ngân hàng câu hỏi vào đề: <strong>{selectedExam?.exam_name}</strong>
                        </p>
                        <form onSubmit={handleGenSubmit}>
                            <div className="modal-body">
                                {formError && <div className="alert alert-danger">{formError}</div>}
                                {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
                                <div className="form-group">
                                    <label>Môn học (Ngân hàng)</label>
                                    <select
                                        className="form-control"
                                        required
                                        value={genFormData.subject_id}
                                        onChange={(e) => setGenFormData({ ...genFormData, subject_id: e.target.value })}
                                    >
                                        {subjects.map(s => (
                                            <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Số lượng câu hỏi *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            required
                                            value={genFormData.num_questions}
                                            onChange={(e) => setGenFormData({ ...genFormData, num_questions: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Tổng điểm đề thi *</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            className="form-control"
                                            required
                                            value={genFormData.total_score}
                                            onChange={(e) => setGenFormData({ ...genFormData, total_score: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowGenModal(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Bắt đầu sinh
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            { }
            {showPreviewModal && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '800px', width: '90%' }}>
                        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h2 style={{ fontSize: '20px' }}>{selectedExam?.exam_name}</h2>
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Xem trước đề thi (Tổng quan)</span>
                            </div>
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowPreviewModal(false)}>Đóng</button>
                        </div>
                        
                        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', marginTop: '20px', paddingRight: '5px' }}>
                            {previewLoading ? (
                                <div className="spinner"></div>
                            ) : !previewData || !previewData.questions || previewData.questions.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                    Đề thi chưa có câu hỏi. Hãy sử dụng chức năng "Sinh lại đề ngẫu nhiên" để nạp câu hỏi.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', gap: '15px', fontSize: '14px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                                        <span><strong>Thời gian:</strong> {previewData.duration} phút</span>
                                        <span><strong>Tổng số câu hỏi:</strong> {previewData.questions.length}</span>
                                        <span><strong>Trộn câu hỏi:</strong> {previewData.shuffle_questions ? 'Có' : 'Không'}</span>
                                        <span><strong>Trộn đáp án:</strong> {previewData.shuffle_answers ? 'Có' : 'Không'}</span>
                                    </div>
                                    {previewData.questions.map((q, qidx) => (
                                        <div key={q.question_id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                                            <p style={{ fontWeight: '600', marginBottom: '10px' }}>
                                                Câu {qidx + 1}: {q.question_content} <span style={{ color: 'var(--primary)', fontSize: '12px' }}>({q.score}đ)</span>
                                            </p>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', paddingLeft: '15px' }}>
                                                {q.answers?.map((ans, ansidx) => (
                                                    <div 
                                                        key={ans.answer_id} 
                                                        style={{ 
                                                            padding: '8px 12px', 
                                                            borderRadius: '6px', 
                                                            background: ans.is_correct === 1 ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-secondary)',
                                                            border: ans.is_correct === 1 ? '1px solid var(--success)' : '1px solid var(--border-color)',
                                                            color: ans.is_correct === 1 ? 'var(--success)' : 'var(--text-primary)'
                                                        }}
                                                    >
                                                        <span style={{ fontWeight: 'bold', marginRight: '6px' }}>{String.fromCharCode(65 + ansidx)}.</span>
                                                        {ans.answer_content}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            { }
            {deleteConfirm.show && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '480px' }}>
                        <div className="modal-header" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Trash2 size={20} />
                            <span>Xác nhận xóa đề thi</span>
                        </div>
                        <div className="modal-body" style={{ padding: '15px 0' }}>
                            <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                                Bạn có chắc chắn muốn xóa đề thi này không? Hành động này không thể hoàn tác.
                            </p>
                            <div style={{ margin: '15px 0', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: '3px solid var(--danger)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                <strong>Tên đề:</strong> {deleteConfirm.name} <br />
                                <strong>Mã đề:</strong> {deleteConfirm.code}
                            </div>
                            <p style={{ fontSize: '12px', lineHeight: '1.4', color: 'var(--text-muted)' }}>
                                <strong>⚠️ Lưu ý:</strong> Đề thi chỉ có thể xóa nếu chưa được gán vào bất kỳ phòng thi nào và chưa có sinh viên nào tham gia làm bài.
                            </p>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '10px' }}>
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                disabled={deleteLoading}
                                onClick={() => setDeleteConfirm({ show: false, id: null, code: '', name: '' })}
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-danger" 
                                disabled={deleteLoading}
                                onClick={executeDeleteExam}
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
export default ExamsManagement;