const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

require('./config/db'); 

const app = express();
const port = 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'he_thong_thi_trac_nghiem_secret_key', 
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, 
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 
    }
}));

app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.json({ 
        success: true, 
        message: '🚀 API Hệ thống thi trắc nghiệm đang hoạt động!' 
    });
});
const authRoute = require('./routes/authRoute');
app.use('/api/auth', authRoute);
const accountRoute = require('./routes/accountRoute');
app.use('/api/account', accountRoute);
const subjectRoute = require('./routes/subjectRoute');
app.use('/api/subjects', subjectRoute);
const chapterRoute = require('./routes/chapterRoute');
app.use('/api/chapters', chapterRoute);
const userManagementRoute = require('./routes/userManagementRoute');
app.use('/api/admin/users', userManagementRoute);
const questionRoute = require('./routes/questionRoute');
app.use('/api/questions', questionRoute);
const examRoute = require('./routes/examRoute');
app.use('/api/exams', examRoute);
const roomRoute = require('./routes/roomRoute');
app.use('/api/rooms', roomRoute);
const takeExamRoute = require('./routes/takeExamRoute');
app.use('/api/student/exam', takeExamRoute);
const resultRoute = require('./routes/resultRoute');
app.use('/api/results', resultRoute);
const dashboardRoute = require('./routes/dashboardRoute');
app.use('/api/dashboard', dashboardRoute);

const classRoute = require('./routes/classRoute');
app.use('/api/classes', classRoute);

const departmentRoute = require('./routes/departmentRoute');
app.use('/api/departments', departmentRoute);

const activityLogRoute = require('./routes/activityLogRoute');
app.use('/api/admin/logs', activityLogRoute);

const notificationRoute = require('./routes/notificationRoute');
app.use('/api/notifications', notificationRoute);

app.use((err, req, res, next) => {
    console.error('⚠️ Lỗi chưa được xử lý:', err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Đã xảy ra lỗi từ phía server'
    });
});

app.listen(port, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${port}`);
});