import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api';
import { Clock, AlertTriangle, ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react';
const StudentExam = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    
    
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    const [timeLeft, setTimeLeft] = useState(0); 
    const timerRef = useRef(null);
    
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'confirm', 
        onConfirm: null,
        onCancel: null
    });
    
    const loadExamData = async () => {
        setLoading(true);
        try {
            let examData = location.state?.examData;
            
            if (!examData) {
                const roomId = localStorage.getItem('current_room_id');
                if (!roomId) {
                    throw new Error('Không tìm thấy thông tin phòng thi. Vui lòng quay lại Dashboard.');
                }
                const res = await api.post(`/student/exam/${roomId}/start`);
                if (res.data && res.data.success) {
                    examData = res.data.data.exam;
                }
            }
            if (examData) {
                setExam(examData);
                setQuestions(examData.questions || []);
                
                const savedAnswers = localStorage.getItem(`answers_${attemptId}`);
                if (savedAnswers) {
                    setSelectedAnswers(JSON.parse(savedAnswers));
                }
                
                const savedFinishTime = localStorage.getItem(`finish_time_${attemptId}`);
                let secondsLeft = 0;
                if (savedFinishTime) {
                    secondsLeft = Math.floor((parseInt(savedFinishTime) - Date.now()) / 1000);
                } else {
                    const durationMinutes = parseInt(examData.duration || '60');
                    const finishTime = Date.now() + durationMinutes * 60 * 1000;
                    localStorage.setItem(`finish_time_${attemptId}`, finishTime.toString());
                    secondsLeft = durationMinutes * 60;
                }
                if (secondsLeft <= 0) {
                    setTimeLeft(0);
                    
                    handleSubmit(true);
                } else {
                    setTimeLeft(secondsLeft);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Lỗi tải đề thi.');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadExamData();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [attemptId]);
    
    useEffect(() => {
        if (loading || timeLeft <= 0) return;
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleSubmit(true); 
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [loading, timeLeft]);
    const isMultipleChoiceType = (typeName) => {
        if (!typeName) return false;
        const name = typeName.toLowerCase();
        return name.includes('nhiều') || name.includes('multiple') || name.includes('multi');
    };
    const handleSelectAnswer = (questionId, answerId, isMultiple) => {
        let updated;
        if (isMultiple) {
            
            const current = Array.isArray(selectedAnswers[questionId]) ? selectedAnswers[questionId] : [];
            if (current.includes(answerId)) {
                updated = { ...selectedAnswers, [questionId]: current.filter(id => id !== answerId) };
            } else {
                updated = { ...selectedAnswers, [questionId]: [...current, answerId] };
            }
            
            if (updated[questionId].length === 0) {
                delete updated[questionId];
            }
        } else {
            
            updated = { ...selectedAnswers, [questionId]: answerId };
        }
        setSelectedAnswers(updated);
        localStorage.setItem(`answers_${attemptId}`, JSON.stringify(updated));
    };
    const formatTime = (totalSeconds) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        const pad = (num) => String(num).padStart(2, '0');
        return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    };
    const executeSubmit = async (isAuto = false) => {
        setSubmitting(true);
        if (timerRef.current) clearInterval(timerRef.current);
        try {
            
            
            const answersPayload = questions.map(q => {
                const isMulti = isMultipleChoiceType(q.type_name);
                const selected = selectedAnswers[q.question_id];
                if (isMulti && Array.isArray(selected)) {
                    return {
                        question_id: q.question_id,
                        answer_ids: selected
                    };
                } else {
                    return {
                        question_id: q.question_id,
                        answer_id: selected || null
                    };
                }
            });
            const res = await api.post(`/student/exam/${attemptId}/submit`, {
                answers: answersPayload
            });
            if (res.data && res.data.success) {
                
                localStorage.removeItem(`answers_${attemptId}`);
                localStorage.removeItem(`finish_time_${attemptId}`);
                localStorage.removeItem('current_room_id');
                setModal({
                    isOpen: true,
                    title: isAuto ? 'Hết giờ làm bài!' : 'Nộp bài thành công',
                    message: isAuto 
                        ? 'Hệ thống đã tự động nộp bài làm của bạn.' 
                        : 'Bài thi của bạn đã được nộp thành công lên hệ thống.',
                    type: 'alert',
                    onConfirm: () => {
                        navigate(`/student/results/${attemptId}`);
                    }
                });
            }
        } catch (err) {
            setModal({
                isOpen: true,
                title: 'Lỗi nộp bài',
                message: 'Có lỗi xảy ra khi nộp bài thi. Vui lòng liên hệ giám thị phòng thi.',
                type: 'alert',
                onConfirm: null
            });
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };
    const handleSubmit = (isAuto = false) => {
        if (isAuto) {
            executeSubmit(true);
            return;
        }
        const answeredCount = Object.keys(selectedAnswers).filter(k => {
            const val = selectedAnswers[k];
            if (Array.isArray(val)) return val.length > 0;
            return val !== null && val !== undefined;
        }).length;
        const totalQuestionsCount = questions.length;
        
        if (answeredCount < totalQuestionsCount) {
            setModal({
                isOpen: true,
                title: 'Chưa hoàn thành bài thi!',
                message: `Bạn mới trả lời được ${answeredCount}/${totalQuestionsCount} câu. Bạn chưa hoàn thành hết bài thi, bạn có xác nhận nộp bài hay không?`,
                type: 'confirm',
                onConfirm: () => executeSubmit(false),
                onCancel: null
            });
        } else {
            setModal({
                isOpen: true,
                title: 'Xác nhận nộp bài',
                message: 'Bạn đã hoàn thành tất cả câu hỏi. Bạn có chắc chắn muốn nộp bài thi?',
                type: 'confirm',
                onConfirm: () => executeSubmit(false),
                onCancel: null
            });
        }
    };
    
    const executeSubmitRef = useRef(null);
    useEffect(() => {
        executeSubmitRef.current = executeSubmit;
    });
    
    useEffect(() => {
        if (loading || submitting) return;
        const checkInterval = setInterval(async () => {
            try {
                const res = await api.get(`/student/exam/${attemptId}/check-status`);
                if (res.data && res.data.success) {
                    if (res.data.room_status !== 'RUNNING') {
                        clearInterval(checkInterval);
                        
                        if (executeSubmitRef.current) {
                            executeSubmitRef.current(true);
                        }
                    }
                }
            } catch (err) {
                console.error("Lỗi khi kiểm tra trạng thái phòng thi:", err);
            }
        }, 5000);
        return () => clearInterval(checkInterval);
    }, [loading, attemptId, submitting]);
    if (loading) return <div className="auth-loading"><div className="spinner"></div><p>Đang chuẩn bị đề thi...</p></div>;
    if (error) return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <div className="alert alert-danger" style={{ maxWidth: '600px', margin: '0 auto' }}>{error}</div>
            <button className="btn btn-primary" onClick={() => navigate('/student/dashboard')} style={{ marginTop: '20px' }}>
                Quay lại trang chủ
            </button>
        </div>
    );
    const currentQuestion = questions[currentQIndex];
    return (
        <div className="exam-interface">
            { }
            <header className="exam-header">
                <div className="exam-info-panel">
                    <span className="badge badge-primary" style={{ fontSize: '13px' }}>ĐỀ THI TRẮC NGHIỆM</span>
                    <h2 style={{ fontSize: '18px', fontWeight: '750', color: 'white', fontFamily: 'var(--font-display)' }}>
                        {exam?.exam_name}
                    </h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div className={`exam-timer ${timeLeft < 60 ? 'warning' : ''}`}>
                        <Clock size={18} />
                        <span>{formatTime(timeLeft)}</span>
                    </div>
                    <button 
                        className="btn btn-success" 
                        onClick={() => handleSubmit(false)}
                        disabled={submitting}
                        style={{ padding: '8px 20px', borderRadius: '30px' }}
                    >
                        <CheckSquare size={16} />
                        <span>{submitting ? 'Đang nộp...' : 'Nộp bài'}</span>
                    </button>
                </div>
            </header>
            { }
            <div className="exam-body">
                { }
                <div className="question-pane">
                    {questions.length > 0 && currentQuestion && (
                        <div className="question-card-container">
                            <div className="exam-q-header">
                                <span>CÂU HỎI {currentQIndex + 1} / {questions.length}</span>
                                <span>Điểm: {currentQuestion.score}đ</span>
                            </div>
                            
                            <h3 className="exam-q-content">
                                {currentQuestion.question_content}
                            </h3>
                            <div className="answers-grid">
                                {currentQuestion.answers?.map((ans, idx) => {
                                    const letter = String.fromCharCode(65 + idx);
                                    const isMulti = isMultipleChoiceType(currentQuestion.type_name);
                                    const isSelected = isMulti
                                        ? (Array.isArray(selectedAnswers[currentQuestion.question_id]) && selectedAnswers[currentQuestion.question_id].includes(ans.answer_id))
                                        : selectedAnswers[currentQuestion.question_id] === ans.answer_id;
                                    
                                    return (
                                        <div 
                                            key={ans.answer_id} 
                                            className={`answer-option ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleSelectAnswer(currentQuestion.question_id, ans.answer_id, isMulti)}
                                        >
                                            <div className="answer-letter">
                                                {isMulti 
                                                    ? (isSelected ? '☑' : '☐')
                                                    : letter
                                                }
                                            </div>
                                            <div className="answer-text">{ans.answer_content}</div>
                                        </div>
                                    );
                                })}
                            </div>
                            {isMultipleChoiceType(currentQuestion.type_name) && (
                                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px', fontStyle: 'italic' }}>
                                    💡 Câu hỏi này cho phép chọn nhiều đáp án đúng
                                </p>
                            )}
                            { }
                            <div className="exam-nav-actions">
                                <button 
                                    className="btn btn-secondary" 
                                    onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentQIndex === 0}
                                >
                                    <ChevronLeft size={16} /> Câu trước
                                </button>
                                
                                <button 
                                    className="btn btn-secondary" 
                                    onClick={() => setCurrentQIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                    disabled={currentQIndex === questions.length - 1}
                                >
                                    Câu tiếp theo <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                { }
                <div className="question-nav-pane">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '15px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>Bản đồ câu hỏi</span>
                    </h3>
                    <div className="nav-grid">
                        {questions.map((q, idx) => {
                            const sel = selectedAnswers[q.question_id];
                            const isAnswered = Array.isArray(sel) ? sel.length > 0 : sel !== undefined;
                            const isCurrent = idx === currentQIndex;
                            return (
                                <button
                                    key={q.question_id}
                                    className={`nav-num-btn ${isAnswered ? 'answered' : ''} ${isCurrent ? 'current' : ''}`}
                                    onClick={() => setCurrentQIndex(idx)}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>
                    <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div className="nav-num-btn answered" style={{ width: '18px', height: '18px', fontSize: '10px', pointerEvents: 'none' }}></div>
                            <span>Đã chọn đáp án</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="nav-num-btn" style={{ width: '18px', height: '18px', fontSize: '10px', pointerEvents: 'none' }}></div>
                            <span>Chưa chọn đáp án</span>
                        </div>
                    </div>
                </div>
            </div>
            { }
            {modal.isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '16px',
                        padding: '32px 24px',
                        maxWidth: '450px',
                        width: '90%',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        textAlign: 'center',
                        color: 'white',
                        animation: 'modalSlideIn 0.25s ease-out'
                    }}>
                        <style>{`
                            @keyframes modalSlideIn {
                                from { transform: scale(0.95); opacity: 0; }
                                to { transform: scale(1); opacity: 1; }
                            }
                        `}</style>
                        <h3 style={{ fontSize: '20px', fontWeight: '750', marginBottom: '16px', color: '#f8fafc', fontFamily: 'var(--font-display)' }}>
                            {modal.title}
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', marginBottom: '28px' }}>
                            {modal.message}
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            {modal.type === 'confirm' ? (
                                <>
                                    <button 
                                        className="btn btn-secondary" 
                                        onClick={() => {
                                            setModal(prev => ({ ...prev, isOpen: false }));
                                            if (modal.onCancel) modal.onCancel();
                                        }}
                                        style={{ padding: '10px 20px', borderRadius: '30px', fontWeight: '600' }}
                                    >
                                        Quay lại làm bài
                                    </button>
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={() => {
                                            setModal(prev => ({ ...prev, isOpen: false }));
                                            if (modal.onConfirm) modal.onConfirm();
                                        }}
                                        style={{ padding: '10px 20px', borderRadius: '30px', fontWeight: '600' }}
                                    >
                                        Nộp bài
                                    </button>
                                </>
                            ) : (
                                <button 
                                    className="btn btn-primary" 
                                    onClick={() => {
                                        setModal(prev => ({ ...prev, isOpen: false }));
                                        if (modal.onConfirm) modal.onConfirm();
                                    }}
                                    style={{ padding: '10px 24px', borderRadius: '30px', fontWeight: '600', minWidth: '100px' }}
                                >
                                    Đồng ý
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default StudentExam;