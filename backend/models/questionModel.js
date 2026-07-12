const db = require('../config/db');

async function getClassifications() {
    const [subjects] = await db.query("SELECT * FROM subjects WHERE status = 'ACTIVE'");
    const [chapters] = await db.query("SELECT * FROM chapters WHERE status = 'ACTIVE'");
    const [difficulties] = await db.query("SELECT * FROM difficulty_levels");
    const [types] = await db.query("SELECT * FROM question_types");
    return { subjects, chapters, difficulties, types };
}

async function getQuestions(keyword = '', subject_id = null) {
    let query = `
        SELECT q.*, s.subject_name, c.chapter_name, d.difficulty_name, qt.type_name, t.full_name as teacher_name
        FROM questions q
        JOIN subjects s ON q.subject_id = s.subject_id
        JOIN chapters c ON q.chapter_id = c.chapter_id
        JOIN difficulty_levels d ON q.difficulty_id = d.difficulty_id
        JOIN question_types qt ON q.question_type_id = qt.question_type_id
        JOIN teachers t ON q.teacher_id = t.teacher_id
        WHERE q.question_content LIKE ? AND q.status = 'ACTIVE'
    `;
    const params = [`%${keyword}%`];

    if (subject_id) {
        query += ' AND q.subject_id = ?';
        params.push(subject_id);
    }
    query += ' ORDER BY q.created_at DESC';

    const [questions] = await db.query(query, params);

    for (let q of questions) {
        const [answers] = await db.query(
            'SELECT answer_id, answer_content, is_correct, answer_order FROM answers WHERE question_id = ? ORDER BY answer_order ASC', 
            [q.question_id]
        );
        q.answers = answers;
    }
    return questions;
}

async function createQuestionWithAnswers(teacher_id, qData, answersArray) {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const [qResult] = await connection.query(
            `INSERT INTO questions (subject_id, chapter_id, difficulty_id, question_type_id, teacher_id, question_content, explanation, score)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [qData.subject_id, qData.chapter_id, qData.difficulty_id, qData.question_type_id, teacher_id, qData.question_content, qData.explanation, qData.score]
        );
        const question_id = qResult.insertId;

        for (let ans of answersArray) {
            await connection.query(
                `INSERT INTO answers (question_id, answer_content, is_correct, answer_order)
                 VALUES (?, ?, ?, ?)`,
                [question_id, ans.answer_content, ans.is_correct, ans.answer_order]
            );
        }

        await connection.commit();
        return question_id;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function updateQuestionWithAnswers(question_id, qData, answersArray) {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        await connection.query(
            `UPDATE questions 
             SET subject_id = ?, chapter_id = ?, difficulty_id = ?, question_type_id = ?, question_content = ?, explanation = ?, score = ?
             WHERE question_id = ?`,
            [qData.subject_id, qData.chapter_id, qData.difficulty_id, qData.question_type_id, qData.question_content, qData.explanation, qData.score, question_id]
        );

        const [oldAnswers] = await connection.query(
            'SELECT answer_id FROM answers WHERE question_id = ? ORDER BY answer_order ASC', 
            [question_id]
        );

        for (let i = 0; i < answersArray.length; i++) {
            const ans = answersArray[i];
            const isCorrectVal = ans.is_correct ? 1 : 0;
            if (i < oldAnswers.length) {
                await connection.query(
                    `UPDATE answers 
                     SET answer_content = ?, is_correct = ?, answer_order = ? 
                     WHERE answer_id = ?`,
                    [ans.answer_content, isCorrectVal, ans.answer_order || (i + 1), oldAnswers[i].answer_id]
                );
            } else {
                await connection.query(
                    `INSERT INTO answers (question_id, answer_content, is_correct, answer_order)
                     VALUES (?, ?, ?, ?)`,
                    [question_id, ans.answer_content, isCorrectVal, ans.answer_order || (i + 1)]
                );
            }
        }

        if (oldAnswers.length > answersArray.length) {
            const deleteIds = oldAnswers.slice(answersArray.length).map(a => a.answer_id);
            for (let deleteId of deleteIds) {
                await connection.query('DELETE FROM answers WHERE answer_id = ?', [deleteId]);
            }
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function deleteQuestion(question_id) {
    await db.query("UPDATE questions SET status = 'INACTIVE' WHERE question_id = ?", [question_id]);
}

module.exports = {
    getClassifications,
    getQuestions,
    createQuestionWithAnswers,
    updateQuestionWithAnswers,
    deleteQuestion
};