const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "12345",
    database: "nodejs"
});

// 연결 확인
db.getConnection((err, connection) => {
    if(err) {
        console.error("db connection failed:", err.message);
        return
    }
    console.log("db connection success");
    connection.release();  // 풀에 반환
});

module.exports = db;