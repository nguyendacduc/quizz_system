import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { Award, Trophy, Clock, Calendar, CheckCircle, ArrowRight, HelpCircle } from 'lucide-react';
const StudentResult = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        const fetchResult = async () => {
            try {
                
                
                const res = await api.get('/results/student/history');
                if (res.data && res.data.success) {
                    const matched = res.data.data.find(item => item.attempt_id === parseInt(attemptId));
                    if (matched) {
                        setResult(matched);
                    } else {
                        setError('Không tìm thấy kết quả của bài thi này trong lịch sử của bạn.');
                    }
                } else {
                    setError(res.data?.message || 'Không thể tải kết quả thi.');
                }
            } catch (err) {
                setError('Có lỗi xảy ra khi tải kết quả thi.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [attemptId]);
    const formatDuration = (seconds) => {
        if (!seconds) return '0s';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins} phút ${secs} giây` : `${secs} giây`;
    };
    if (loading) return <div className="spinner"></div>;
    
    if (error) return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <div className="alert alert-danger" style={{ maxWidth: '600px', margin: '0 auto' }}>{error}</div>
            <button className="btn btn-primary" onClick={() => navigate('/student/dashboard')} style={{ marginTop: '20px' }}>
                Quay lại trang chủ
            </button>
        </div>
    );
    const score = result?.score !== undefined && result?.score !== null ? parseFloat(result.score) : 0;
    const isPassed = score >= 5.0;
    return (
        <div style={{ maxWidth: '650px', margin: '40px auto' }}>
            <div className="card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden', padding: '40px 30px' }}>
                { }
                <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '200px', background: 'var(--primary-glow)', borderRadius: '50%', filter: 'blur(50px)', zIndex: '0', pointerEvents: 'none' }}></div>
                
                <div style={{ position: 'relative', zIndex: '1' }}>
                    <div className="result-score-circle">
                        <Trophy size={40} style={{ color: '#fbbf24', marginBottom: '4px' }} />
                        <span className="score-num">{score.toFixed(1)}</span>
                        <span className="score-label">Điểm số</span>
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', marginTop: '20px', fontFamily: 'var(--font-display)' }}>
                        {isPassed ? 'Chúc mừng bạn đã hoàn thành!' : 'Bạn đã hoàn thành bài thi!'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '30px' }}>
                        Bài thi: <strong>{result?.exam_name}</strong> ({result?.exam_code})
                    </p>
                    { }
                    <div className="grid-2" style={{ gap: '16px', marginBottom: '30px', textAlign: 'left' }}>
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <CheckCircle size={22} style={{ color: 'var(--success)' }} />
                            <div>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Số câu trả lời đúng</span>
                                <p style={{ fontWeight: '700', fontSize: '16px' }}>{result?.correct_answers} / {result?.total_questions} câu</p>
                            </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Clock size={22} style={{ color: 'var(--primary)' }} />
                            <div>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Thời gian làm bài</span>
                                <p style={{ fontWeight: '700', fontSize: '16px' }}>{formatDuration(result?.duration_seconds)}</p>
                            </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', gridColumn: 'span 2' }}>
                            <Calendar size={22} style={{ color: 'var(--text-secondary)' }} />
                            <div>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Thời gian nộp bài thi</span>
                                <p style={{ fontWeight: '600', fontSize: '15px' }}>
                                    {result?.submit_time 
                                        ? new Date(result.submit_time).toLocaleString('vi-VN') 
                                        : 'Chưa có thông tin'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        <button className="btn btn-secondary" onClick={() => navigate('/student/history')}>
                            Xem lịch sử thi
                        </button>
                        <button className="btn btn-primary" onClick={() => navigate('/student/dashboard')}>
                            Về trang chủ <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default StudentResult;