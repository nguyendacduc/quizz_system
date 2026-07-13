const db = require('../config/db');

async function getExams(teacher_id = null) {
    let query = `
        SELECT e.*, s.subject_name, t.full_name as teacher_name,
               (SELECT COUNT(*) FROM exam_questions WHERE exam_id = e.exam_id) as total_questions,
               (SELECT IFNULL(SUM(score), 0) FROM exam_questions WHERE exam_id = e.exam_id) as max_score
        FROM exams e 
        JOIN subjects s ON e.subject_id = s.subject_id 
        JOIN teachers t ON e.teacher_id = t.teacher_id
    `;
    const params = [];
    
    if (teacher_id) {
        query += ' WHERE e.teacher_id = ?';
        params.push(teacher_id);
    }
    query += ' ORDER BY e.created_at DESC';

    const [rows] = await db.query(query, params);
    return rows;
}

async function createExam(data) {
    const [result] = await db.query(
        `INSERT INTO exams (exam_code, exam_name, subject_id, teacher_id, duration, total_score, pass_score, shuffle_questions, shuffle_answers, description, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.exam_code, data.exam_name, data.subject_id, data.teacher_id, data.duration, data.total_score, data.pass_score, data.shuffle_questions, data.shuffle_answers, data.description, data.status || 'DRAFT']
    );
    return result.insertId;
}

async function addQuestionsManual(exam_id, questionsArray) {
    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        
        await connection.query('DELETE FROM exam_questions WHERE exam_id = ?', [exam_id]);

        for (let q of questionsArray) {
            await connection.query(
                'INSERT INTO exam_questions (exam_id, question_id, question_order, score) VALUES (?, ?, ?, ?)',
                [exam_id, q.question_id, q.question_order, q.score]
            );
        }
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function generateAutoExam(exam_id, subject_id, num_questions, total_score) {
    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        const [questions] = await connection.query(
            'SELECT question_id FROM questions WHERE subject_id = ? AND status = "ACTIVE" ORDER BY RAND() LIMIT ?',
            [subject_id, num_questions]
        );

        if (questions.length < num_questions) {
            throw new Error(`Ngân hàng chỉ có ${questions.length} câu, không đủ ${num_questions} câu theo yêu cầu.`);
        }

        const scorePerQuestion = (total_score / num_questions).toFixed(2);

        await connection.query('DELETE FROM exam_questions WHERE exam_id = ?', [exam_id]);

        for (let i = 0; i < questions.length; i++) {
            await connection.query(
                'INSERT INTO exam_questions (exam_id, question_id, question_order, score) VALUES (?, ?, ?, ?)',
                [exam_id, questions[i].question_id, i + 1, scorePerQuestion]
            );
        }
        await connection.commit();
        return questions.length;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function getExamPreview(exam_id) {
    const [exams] = await db.query('SELECT * FROM exams WHERE exam_id = ?', [exam_id]);
    if (exams.length === 0) return null;
    const exam = exams[0];

    const [questions] = await db.query(`
        SELECT eq.question_order, eq.score as question_score, q.question_id, q.question_content, qt.type_name 
        FROM exam_questions eq 
        JOIN questions q ON eq.question_id = q.question_id 
        JOIN question_types qt ON q.question_type_id = qt.question_type_id
        WHERE eq.exam_id = ? 
        ORDER BY eq.question_order ASC
    `, [exam_id]);

    for (let q of questions) {
        const [answers] = await db.query(
            'SELECT answer_id, answer_content, is_correct, answer_order FROM answers WHERE question_id = ? ORDER BY answer_order ASC', 
            [q.question_id]
        );
        q.answers = answers;
    }
    
    exam.questions = questions;
    return exam;
}

async function deleteExam(exam_id) {
    const [result] = await db.query('DELETE FROM exams WHERE exam_id = ?', [exam_id]);
    return result.affectedRows > 0;
}

async function getExamById(exam_id) {
    const [rows] = await db.query('SELECT * FROM exams WHERE exam_id = ?', [exam_id]);
    return rows[0] || null;
}

async function updateExamScore(exam_id, total_score, pass_score) {
    await db.query(
        'UPDATE exams SET total_score = ?, pass_score = ? WHERE exam_id = ?',
        [total_score, pass_score, exam_id]
    );
}

module.exports = {
    getExams, createExam, addQuestionsManual, generateAutoExam, getExamPreview, deleteExam,
    getExamById, updateExamScore
};