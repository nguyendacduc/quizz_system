const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root', 
    password: 'Nickkyg2k6', 
    database: 'exam_system_db1', 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection()
    .then(connection => {
        console.log('✅ Đã kết nối thành công với database: exam_system_db');
        connection.release(); 
    })
    .catch(err => {
        console.error('❌ Lỗi kết nối database. Vui lòng bật MySQL!', err.message);
    });

module.exports = db;