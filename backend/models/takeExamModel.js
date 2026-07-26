const db = require('../config/db');

async function joinRoom(student_id, room_code, password) {
    const [rooms] = await db.query('SELECT * FROM exam_rooms WHERE room_code = ?', [room_code]);
    if (rooms.length === 0) throw new Error('ROOM_NOT_FOUND');
    const room = rooms[0];

    if (room.room_password && room.room_password !== password) throw new Error('WRONG_PASSWORD');

    const now = new Date();
    if (room.end_time && now > new Date(room.end_time)) {
        if (room.status !== 'FINISHED') {
            await db.query('UPDATE exam_rooms SET status = "FINISHED" WHERE room_id = ?', [room.room_id]);
        }
        throw new Error('ROOM_CLOSED');
    }

    if (room.start_time && now < new Date(room.start_time)) {
        throw new Error('ROOM_NOT_OPEN');
    }

    if (room.status === 'FINISHED' || room.status === 'CANCELLED') throw new Error('ROOM_CLOSED');

    const [attemptsCheck] = await db.query(
        'SELECT status FROM exam_attempts WHERE room_id = ? AND student_id = ?',
        [room.room_id, student_id]
    );
    if (attemptsCheck.length > 0 && (attemptsCheck[0].status === 'SUBMITTED' || attemptsCheck[0].status === 'AUTO_SUBMITTED')) {
        throw new Error('ALREADY_SUBMITTED');
    }

    const [joined] = await db.query('SELECT * FROM room_students WHERE room_id = ? AND student_id = ?', [room.room_id, student_id]);
    if (joined.length > 0) return room.room_id; 

    await db.query('INSERT INTO room_students (room_id, student_id, status) VALUES (?, ?, "PENDING")', [room.room_id, student_id]);
    return room.room_id;
}

async function getStudentLobbyInfo(room_id, student_id) {
    const [rows] = await db.query(`
        SELECT 
            r.room_id, r.room_code, r.room_name, r.status as room_status, r.start_time, r.end_time,
            e.exam_id, e.exam_code, e.exam_name, e.duration,
            s_subj.subject_name,
            (SELECT COUNT(*) FROM exam_questions eq WHERE eq.exam_id = e.exam_id) as total_questions,
            st.student_id, st.student_code, st.full_name,
            c.class_name,
            rs.status as approval_status, rs.join_time
        FROM exam_rooms r
        JOIN exams e ON r.exam_id = e.exam_id
        LEFT JOIN subjects s_subj ON e.subject_id = s_subj.subject_id
        JOIN room_students rs ON rs.room_id = r.room_id AND rs.student_id = ?
        JOIN students st ON st.student_id = rs.student_id
        LEFT JOIN classes c ON st.class_id = c.class_id
        WHERE r.room_id = ?
    `, [student_id, room_id]);

    if (rows.length === 0) return null;

    const info = rows[0];
    const now = new Date();
    if (info.end_time && now > new Date(info.end_time) && info.room_status !== 'FINISHED' && info.room_status !== 'CANCELLED') {
        await db.query('UPDATE exam_rooms SET status = "FINISHED" WHERE room_id = ?', [room_id]);
        info.room_status = 'FINISHED';
    }
    return info;
}

async function leaveRoom(room_id, student_id) {
    await db.query('DELETE FROM room_students WHERE room_id = ? AND student_id = ?', [room_id, student_id]);
}

async function startAttempt(room_id, student_id) {
    const [rooms] = await db.query('SELECT exam_id, status, end_time FROM exam_rooms WHERE room_id = ?', [room_id]);
    if (rooms.length === 0) throw new Error('ROOM_NOT_FOUND');
    const room = rooms[0];

    const now = new Date();
    if (room.end_time && now > new Date(room.end_time)) {
        if (room.status !== 'FINISHED') {
            await db.query('UPDATE exam_rooms SET status = "FINISHED" WHERE room_id = ?', [room_id]);
        }
        throw new Error('ROOM_CLOSED');
    }

    if (room.status !== 'RUNNING') throw new Error('ROOM_NOT_RUNNING');
    const exam_id = room.exam_id;

    const [approvals] = await db.query('SELECT status FROM room_students WHERE room_id = ? AND student_id = ?', [room_id, student_id]);
    if (approvals.length === 0 || approvals[0].status !== 'APPROVED') throw new Error('NOT_APPROVED');

    const [attempts] = await db.query('SELECT attempt_id, status FROM exam_attempts WHERE room_id = ? AND student_id = ?', [room_id, student_id]);
    if (attempts.length > 0) {
        if (attempts[0].status === 'SUBMITTED' || attempts[0].status === 'AUTO_SUBMITTED') {
            throw new Error('ALREADY_SUBMITTED');
        }
        return { attempt_id: attempts[0].attempt_id, exam_id };
    }

    const [res] = await db.query(
        'INSERT INTO exam_attempts (room_id, exam_id, student_id, start_time, status) VALUES (?, ?, ?, NOW(), "IN_PROGRESS")',
        [room_id, exam_id, student_id]
    );
    return { attempt_id: res.insertId, exam_id };
}

async function getExamPaper(exam_id) {
    const [exams] = await db.query('SELECT exam_id, exam_name, duration, shuffle_questions, shuffle_answers FROM exams WHERE exam_id = ?', [exam_id]);
    const exam = exams[0];

    let qQuery = `
        SELECT eq.question_id, eq.question_order, eq.score, q.question_content, qt.type_name 
        FROM exam_questions eq 
        JOIN questions q ON eq.question_id = q.question_id 
        JOIN question_types qt ON q.question_type_id = qt.question_type_id
        WHERE eq.exam_id = ?
    `;
    if (!exam.shuffle_questions) qQuery += ' ORDER BY eq.question_order ASC';

    const [questions] = await db.query(qQuery, [exam_id]);

    for (let q of questions) {
        let aQuery = 'SELECT answer_id, answer_content, answer_order FROM answers WHERE question_id = ?';
        if (!exam.shuffle_answers) aQuery += ' ORDER BY answer_order ASC';
        else aQuery += ' ORDER BY RAND()';

        const [answers] = await db.query(aQuery, [q.question_id]);
        q.answers = answers;
    }
    
    exam.questions = questions;
    return exam;
}

async function submitAndGrade(attempt_id, student_id, studentAnswersArray) {
    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        const [attempts] = await connection.query('SELECT * FROM exam_attempts WHERE attempt_id = ? AND student_id = ?', [attempt_id, student_id]);
        const attempt = attempts[0];
        if (attempt.status !== 'IN_PROGRESS') throw new Error('ALREADY_SUBMITTED');

        let totalScore = 0;
        let correctCount = 0;

        for (let ans of studentAnswersArray) {
            let is_correct = false;

            if (ans.answer_ids && Array.isArray(ans.answer_ids) && ans.answer_ids.length > 0) {
                const [allCorrectAnswers] = await connection.query(
                    'SELECT answer_id FROM answers WHERE question_id = ? AND is_correct = 1',
                    [ans.question_id]
                );
                const correctIds = allCorrectAnswers.map(a => a.answer_id);

                const allSelectedAreCorrect = ans.answer_ids.every(id => correctIds.includes(id));
                const allCorrectAreSelected = correctIds.every(id => ans.answer_ids.includes(id));
                is_correct = allSelectedAreCorrect && allCorrectAreSelected;

                if (is_correct) {
                    const [qScore] = await connection.query('SELECT score FROM exam_questions WHERE exam_id = ? AND question_id = ?', [attempt.exam_id, ans.question_id]);
                    totalScore += parseFloat(qScore[0].score);
                    correctCount++;
                }

                for (let selectedId of ans.answer_ids) {
                    await connection.query(
                        'INSERT INTO student_answers (attempt_id, question_id, answer_id, is_correct) VALUES (?, ?, ?, ?)',
                        [attempt_id, ans.question_id, selectedId, is_correct]
                    );
                }
            } else if (ans.answer_id !== null && ans.answer_id !== undefined) {
                const [correctAns] = await connection.query('SELECT is_correct FROM answers WHERE answer_id = ?', [ans.answer_id]);
                is_correct = correctAns.length > 0 ? correctAns[0].is_correct : false;

                if (is_correct) {
                    const [qScore] = await connection.query('SELECT score FROM exam_questions WHERE exam_id = ? AND question_id = ?', [attempt.exam_id, ans.question_id]);
                    totalScore += parseFloat(qScore[0].score);
                    correctCount++;
                }

                await connection.query(
                    'INSERT INTO student_answers (attempt_id, question_id, answer_id, is_correct) VALUES (?, ?, ?, ?)',
                    [attempt_id, ans.question_id, ans.answer_id, is_correct]
                );
            }
        }

        await connection.query(
            `UPDATE exam_attempts 
             SET submit_time = NOW(), duration_seconds = TIMESTAMPDIFF(SECOND, start_time, NOW()), 
                 score = ?, correct_answers = ?, total_questions = ?, status = 'SUBMITTED' 
             WHERE attempt_id = ?`,
            [totalScore, correctCount, studentAnswersArray.length, attempt_id]
        );

        await connection.commit();
        return { totalScore, correctCount };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function getAttemptRoomStatus(attempt_id, student_id) {
    const [rows] = await db.query(
        `SELECT ea.attempt_id, r.status as room_status 
         FROM exam_attempts ea
         JOIN exam_rooms r ON ea.room_id = r.room_id
         WHERE ea.attempt_id = ? AND ea.student_id = ?`,
        [attempt_id, student_id]
    );
    return rows[0] || null;
}

module.exports = { 
    joinRoom, 
    startAttempt, 
    getExamPaper, 
    submitAndGrade, 
    getAttemptRoomStatus,
    getStudentLobbyInfo,
    leaveRoom
};