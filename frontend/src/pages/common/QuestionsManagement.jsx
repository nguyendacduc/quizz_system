import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Search, Plus, Filter, BookOpen, Trash2, Eye, EyeOff, Check, AlertCircle, Edit, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
const QuestionsManagement = () => {
    const { user } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [filters, setFilters] = useState({ subjects: [], chapters: [], difficulties: [], types: [] });
    const [keyword, setKeyword] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    
    
    const [selectedQuestionForEdit, setSelectedQuestionForEdit] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, content: '' });
    const [deleteLoading, setDeleteLoading] = useState(false);
    
    
    const [expandedQuestion, setExpandedQuestion] = useState(null);
    
    const [newQuestion, setNewQuestion] = useState({
        subject_id: '',
        chapter_id: '',
        difficulty_id: '',
        question_type_id: '',
        question_content: '',
        explanation: '',
        score: '1.0',
        teacher_id: '' 
    });
    const [answers, setAnswers] = useState([
        { answer_content: '', is_correct: false, answer_order: 1 },
        { answer_content: '', is_correct: false, answer_order: 2 },
        { answer_content: '', is_correct: false, answer_order: 3 },
        { answer_content: '', is_correct: false, answer_order: 4 }
    ]);
    const [addError, setAddError] = useState('');
    const [addSuccess, setAddSuccess] = useState('');
    const [teachersList, setTeachersList] = useState([]);
    useEffect(() => {
        const fetchFiltersAndTeachers = async () => {
            try {
                const res = await api.get('/questions/filters');
                if (res.data && res.data.success) {
                    setFilters(res.data.data);
                    
                    
                    const data = res.data.data;
                    const initialSubjectId = data.subjects[0]?.subject_id || '';
                    const filteredChaps = data.chapters.filter(c => String(c.subject_id) === String(initialSubjectId));
                    const initialChapterId = filteredChaps[0]?.chapter_id || '';
                    
                    setNewQuestion(prev => ({
                        ...prev,
                        subject_id: initialSubjectId,
                        chapter_id: initialChapterId,
                        difficulty_id: data.difficulties[0]?.difficulty_id || '',
                        question_type_id: data.types[0]?.question_type_id || '',
                        teacher_id: ''
                    }));
                }
                if (user && user.role_code === 'ADMIN') {
                    const teacherRes = await api.get('/admin/users/teachers');
                    if (teacherRes.data && teacherRes.data.success) {
                        setTeachersList(teacherRes.data.data);
                        if (teacherRes.data.data.length > 0) {
                            setNewQuestion(prev => ({ ...prev, teacher_id: teacherRes.data.data[0].teacher_id }));
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching filters/teachers:', err);
            }
        };
        fetchFiltersAndTeachers();
    }, [user]);
    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const subjectParam = selectedSubject ? `&subject_id=${selectedSubject}` : '';
            const res = await api.get(`/questions?keyword=${keyword}${subjectParam}`);
            if (res.data && res.data.success) {
                setQuestions(res.data.data);
            }
        } catch (err) {
            setError('Lỗi tải ngân hàng câu hỏi');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchQuestions();
    }, [keyword, selectedSubject]);
    const handleAddAnswerField = () => {
        setAnswers([...answers, { answer_content: '', is_correct: false, answer_order: answers.length + 1 }]);
    };
    const handleRemoveAnswerField = (index) => {
        if (answers.length <= 2) {
            alert('Một câu hỏi trắc nghiệm cần tối thiểu 2 đáp án.');
            return;
        }
        const updated = answers.filter((_, idx) => idx !== index).map((ans, idx) => ({ ...ans, answer_order: idx + 1 }));
        setAnswers(updated);
    };
    const handleAnswerContentChange = (index, value) => {
        const updated = [...answers];
        updated[index].answer_content = value;
        setAnswers(updated);
    };
    const isMultipleChoice = (typeId) => {
        const found = filters.types.find(t => String(t.question_type_id) === String(typeId));
        if (!found) return false;
        const name = (found.type_name || '').toLowerCase();
        return name.includes('nhiều') || name.includes('multiple') || name.includes('multi');
    };
    const handleAnswerCorrectChange = (index, checked) => {
        if (isMultipleChoice(newQuestion.question_type_id)) {
            
            const updated = answers.map((ans, idx) => ({
                ...ans,
                is_correct: idx === index ? checked : ans.is_correct
            }));
            setAnswers(updated);
        } else {
            
            const updated = answers.map((ans, idx) => ({
                ...ans,
                is_correct: idx === index ? checked : false
            }));
            setAnswers(updated);
        }
    };
    const handleQuestionTypeChange = (newTypeId) => {
        setNewQuestion({ ...newQuestion, question_type_id: newTypeId });
        
        setAnswers(prev => prev.map(ans => ({ ...ans, is_correct: false })));
    };
    const openAddModal = () => {
        setSelectedQuestionForEdit(null);
        setAddError('');
        setAddSuccess('');
        setNewQuestion({
            subject_id: filters.subjects[0]?.subject_id || '',
            chapter_id: filters.chapters.filter(c => String(c.subject_id) === String(filters.subjects[0]?.subject_id))[0]?.chapter_id || '',
            difficulty_id: filters.difficulties[0]?.difficulty_id || '',
            question_type_id: filters.types[0]?.question_type_id || '',
            question_content: '',
            explanation: '',
            score: '1.0',
            teacher_id: teachersList[0]?.teacher_id || ''
        });
        setAnswers([
            { answer_content: '', is_correct: false, answer_order: 1 },
            { answer_content: '', is_correct: false, answer_order: 2 },
            { answer_content: '', is_correct: false, answer_order: 3 },
            { answer_content: '', is_correct: false, answer_order: 4 }
        ]);
        setShowAddModal(true);
    };
    const openEditModal = (q) => {
        setSelectedQuestionForEdit(q);
        setAddError('');
        setAddSuccess('');
        setNewQuestion({
            subject_id: String(q.subject_id),
            chapter_id: String(q.chapter_id),
            difficulty_id: String(q.difficulty_id),
            question_type_id: String(q.question_type_id),
            question_content: q.question_content,
            explanation: q.explanation || '',
            score: String(q.score),
            teacher_id: String(q.teacher_id || '')
        });
        setAnswers(q.answers.map(ans => ({
            answer_content: ans.answer_content,
            is_correct: ans.is_correct === 1 || ans.is_correct === true,
            answer_order: ans.answer_order
        })));
        setShowAddModal(true);
    };
    const handleDeleteClick = (q) => {
        setDeleteConfirm({ show: true, id: q.question_id, content: q.question_content });
    };
    const executeDeleteQuestion = async () => {
        setDeleteLoading(true);
        try {
            const res = await api.delete(`/questions/${deleteConfirm.id}`);
            if (res.data && res.data.success) {
                fetchQuestions();
                setDeleteConfirm({ show: false, id: null, content: '' });
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra khi xóa câu hỏi.');
        } finally {
            setDeleteLoading(false);
        }
    };
    const handleSubjectChange = (subjectId) => {
        const filteredChapters = filters.chapters.filter(c => String(c.subject_id) === String(subjectId));
        const firstChapterId = filteredChapters[0]?.chapter_id || '';
        setNewQuestion(prev => ({
            ...prev,
            subject_id: subjectId,
            chapter_id: firstChapterId
        }));
    };
    const handleQuestionSubmit = async (e) => {
        e.preventDefault();
        setAddError('');
        setAddSuccess('');
        
        if (!newQuestion.question_content.trim()) {
            setAddError('Vui lòng nhập nội dung câu hỏi.');
            return;
        }
        const emptyAnswer = answers.some(ans => !ans.answer_content.trim());
        if (emptyAnswer) {
            setAddError('Vui lòng điền nội dung cho toàn bộ đáp án.');
            return;
        }
        const hasCorrect = answers.some(ans => ans.is_correct);
        if (!hasCorrect) {
            setAddError('Vui lòng chọn ít nhất một đáp án đúng.');
            return;
        }
        const payload = {
            ...newQuestion,
            answers: answers.map(ans => ({ ...ans, is_correct: ans.is_correct ? 1 : 0 }))
        };
        try {
            let res;
            if (selectedQuestionForEdit) {
                res = await api.put(`/questions/${selectedQuestionForEdit.question_id}`, payload);
            } else {
                res = await api.post('/questions', payload);
            }
            if (res.data && res.data.success) {
                setAddSuccess(selectedQuestionForEdit ? 'Cập nhật câu hỏi thành công!' : 'Thêm câu hỏi thành công!');
                setNewQuestion(prev => ({
                    ...prev,
                    question_content: '',
                    explanation: '',
                    score: '1.0'
                }));
                setAnswers([
                    { answer_content: '', is_correct: false, answer_order: 1 },
                    { answer_content: '', is_correct: false, answer_order: 2 },
                    { answer_content: '', is_correct: false, answer_order: 3 },
                    { answer_content: '', is_correct: false, answer_order: 4 }
                ]);
                fetchQuestions();
                setTimeout(() => setShowAddModal(false), 1500);
            }
        } catch (err) {
            setAddError(err.response?.data?.message || 'Có lỗi khi lưu câu hỏi.');
        }
    };
    const toggleExpand = (qId) => {
        if (expandedQuestion === qId) setExpandedQuestion(null);
        else setExpandedQuestion(qId);
    };
    return (
        <div>
            <div className="section-header">
                <h1 className="section-title">Ngân hàng câu hỏi</h1>
                <button className="btn btn-primary" onClick={openAddModal}>
                    <Plus size={18} />
                    <span>Thêm câu hỏi</span>
                </button>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="filters-bar">
                <div className="search-wrapper">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm nội dung câu hỏi..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>
                <div style={{ width: '220px' }}>
                    <select
                        className="form-control"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                        <option value="">-- Tất cả môn học --</option>
                        {filters.subjects.map(s => (
                            <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
                        ))}
                    </select>
                </div>
            </div>
            {loading ? (
                <div className="spinner"></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {questions.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            Không tìm thấy câu hỏi nào trong ngân hàng.
                        </div>
                    ) : (
                        questions.map((q) => (
                            <div className="card q-bank-item" key={q.question_id}>
                                <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                                    <div className="q-bank-meta">
                                        <span className="badge badge-primary">{q.subject_name}</span>
                                        <span className="badge badge-warning">{q.difficulty_name}</span>
                                        <span className="badge badge-success">{q.type_name}</span>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '10px' }}>
                                            Chương: {q.chapter_name} | Điểm: {q.score} | Người tạo: {q.teacher_name}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button
                                            onClick={() => openEditModal(q)}
                                            className="btn btn-sm btn-secondary"
                                            title="Sửa câu hỏi"
                                            style={{ padding: '4px 8px' }}
                                            type="button"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(q)}
                                            className="btn btn-sm btn-danger"
                                            title="Xóa câu hỏi"
                                            style={{ padding: '4px 8px', background: 'var(--danger)', borderColor: 'var(--danger)', color: '#fff' }}
                                            type="button"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => toggleExpand(q.question_id)}
                                            className="btn btn-sm btn-secondary"
                                            style={{ padding: '4px 8px' }}
                                            type="button"
                                        >
                                            {expandedQuestion === q.question_id ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="q-bank-text" style={{ marginTop: '10px' }}>
                                    {q.question_content}
                                </div>
                                {expandedQuestion === q.question_id && (
                                    <div style={{ marginTop: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                                        <div className="q-bank-options">
                                            {q.answers?.map((ans, idx) => (
                                                <div
                                                    key={ans.answer_id}
                                                    className={`q-bank-option ${ans.is_correct ? 'correct' : ''}`}
                                                >
                                                    <span style={{ fontWeight: '700', marginRight: '6px' }}>
                                                        {String.fromCharCode(65 + idx)}.
                                                    </span>
                                                    {ans.answer_content}
                                                    {ans.is_correct === 1 && (
                                                        <span className="badge badge-success" style={{ float: 'right', fontSize: '9px', padding: '2px 6px' }}>Đúng</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {q.explanation && (
                                            <div style={{ marginTop: '12px', fontSize: '13px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid var(--primary)' }}>
                                                <strong>Giải thích:</strong> {q.explanation}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
            { }
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '750px' }}>
                        <div className="modal-header">{selectedQuestionForEdit ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}</div>
                        <form onSubmit={handleQuestionSubmit}>
                            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '5px' }}>
                                {addError && <div className="alert alert-danger">{addError}</div>}
                                {addSuccess && <div className="alert alert-success">{addSuccess}</div>}
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Môn học *</label>
                                        <select
                                            className="form-control"
                                            value={newQuestion.subject_id}
                                            onChange={(e) => handleSubjectChange(e.target.value)}
                                        >
                                            {filters.subjects.map(s => (
                                                <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Chương học *</label>
                                        <select
                                            className="form-control"
                                            value={newQuestion.chapter_id}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, chapter_id: e.target.value })}
                                        >
                                            {filters.chapters
                                                .filter(c => String(c.subject_id) === String(newQuestion.subject_id))
                                                .map(c => (
                                                    <option key={c.chapter_id} value={c.chapter_id}>{c.chapter_name}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                </div>
                                <div className="grid-3">
                                    <div className="form-group">
                                        <label>Độ khó *</label>
                                        <select
                                            className="form-control"
                                            value={newQuestion.difficulty_id}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, difficulty_id: e.target.value })}
                                        >
                                            {filters.difficulties.map(d => (
                                                <option key={d.difficulty_id} value={d.difficulty_id}>{d.difficulty_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Loại câu hỏi *</label>
                                        <select
                                            className="form-control"
                                            value={newQuestion.question_type_id}
                                            onChange={(e) => handleQuestionTypeChange(e.target.value)}
                                        >
                                            {filters.types.map(t => (
                                                <option key={t.question_type_id} value={t.question_type_id}>{t.type_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Điểm câu hỏi *</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="form-control"
                                            required
                                            value={newQuestion.score}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, score: e.target.value })}
                                        />
                                    </div>
                                </div>
                                {user.role_code === 'ADMIN' && (
                                    <div className="form-group">
                                        <label>Giáo viên phụ trách *</label>
                                        <select
                                            className="form-control"
                                            required
                                            value={newQuestion.teacher_id}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, teacher_id: e.target.value })}
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
                                <div className="form-group">
                                    <label>Nội dung câu hỏi *</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Nhập câu hỏi tại đây..."
                                        value={newQuestion.question_content}
                                        onChange={(e) => setNewQuestion({ ...newQuestion, question_content: e.target.value })}
                                    ></textarea>
                                </div>
                                { }
                                <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                                        <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>Danh sách đáp án trắc nghiệm</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', background: isMultipleChoice(newQuestion.question_type_id) ? 'rgba(139, 92, 246, 0.15)' : 'rgba(59, 130, 246, 0.15)', color: isMultipleChoice(newQuestion.question_type_id) ? '#a78bfa' : '#60a5fa', fontWeight: '600' }}>
                                                {isMultipleChoice(newQuestion.question_type_id) ? '☑ Chọn nhiều đáp án đúng' : '○ Chọn 1 đáp án đúng'}
                                            </span>
                                            <button type="button" className="btn btn-sm btn-secondary" onClick={handleAddAnswerField}>
                                                + Thêm đáp án
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="answers-builder">
                                        {answers.map((ans, idx) => (
                                            <div key={idx} className="answer-builder-row">
                                                <span style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>{String.fromCharCode(65 + idx)}</span>
                                                <input
                                                    type={isMultipleChoice(newQuestion.question_type_id) ? 'checkbox' : 'radio'}
                                                    name="correct-answer-radio"
                                                    className="correct-check"
                                                    title={isMultipleChoice(newQuestion.question_type_id) ? 'Đánh dấu đáp án đúng (chọn nhiều)' : 'Đánh dấu đáp án đúng (chọn 1)'}
                                                    checked={ans.is_correct}
                                                    onChange={(e) => handleAnswerCorrectChange(idx, e.target.checked)}
                                                />
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    style={{ flex: 1 }}
                                                    placeholder={`Nhập đáp án ${String.fromCharCode(65 + idx)}...`}
                                                    value={ans.answer_content}
                                                    onChange={(e) => handleAnswerContentChange(idx, e.target.value)}
                                                />
                                                <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveAnswerField(idx)} style={{ padding: '8px' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Giải thích câu hỏi (Không bắt buộc)</label>
                                    <textarea
                                        className="form-control"
                                        rows="2"
                                        placeholder="Nhập giải thích cho đáp án đúng..."
                                        value={newQuestion.explanation}
                                        onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {selectedQuestionForEdit ? 'Lưu thay đổi' : 'Lưu câu hỏi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            { }
            {deleteConfirm.show && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '480px' }}>
                        <div className="modal-header" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldAlert size={20} />
                            <span>Xác nhận xóa câu hỏi</span>
                        </div>
                        <div className="modal-body" style={{ padding: '15px 0' }}>
                            <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                                Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng câu hỏi không?
                            </p>
                            <div style={{ margin: '15px 0', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: '3px solid var(--danger)', fontSize: '13px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                                "{deleteConfirm.content}"
                            </div>
                            <p style={{ fontSize: '12px', lineHeight: '1.4', color: 'var(--text-muted)' }}>
                                <strong>⚠️ Lưu ý:</strong> Câu hỏi sẽ được đưa vào trạng thái ngừng hoạt động và không hiển thị trong ngân hàng câu hỏi mới. Tuy nhiên, các đề thi cũ đã sử dụng câu hỏi này vẫn hoạt động bình thường và không bị ảnh hưởng.
                            </p>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '10px' }}>
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                disabled={deleteLoading}
                                onClick={() => setDeleteConfirm({ show: false, id: null, content: '' })}
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-danger" 
                                disabled={deleteLoading}
                                onClick={executeDeleteQuestion}
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
export default QuestionsManagement;