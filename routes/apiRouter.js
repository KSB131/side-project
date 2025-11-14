const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const verifyToken = require("../middlewares/jwt")

// 회원가입 라우터
router.post('/register', (req, res) => {
    const { id, pw, nick } = req.body;

    const sql = 'INSERT INTO TB_MEMBER (id, pw, nick) VALUES (?, ?, ?)';
    const params = [id, pw, nick]

    db.execute(sql, params, (err, result) => {
        if(err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        };

        if(result.affetedRows > 0) {
            // 회원 가입 성공
            res.json({
                success: true,
                message: "회원가입 성공!"
            })
        }
        else {
            // 회원 가입 실패
            res.json({
                success: false,
                message: "회원가입 실패..."
            });
        };
    });
});

// 로그인 라우터 -> JWT 발급
router.post('/login', (req, res) => {
    const { id, pw } = req.body;

    const sql = 'SELECT * FROM TB_MEMBER WHERE id = ? AND pw = ?';
    const params = [id, pw];

    db.execute(sql, params, (err, rows) => {
        if(rows.length > 0){
            // 로그인성공
            // JWT 발급
            const token = jwt.sign({
                id: rows[0].id,
                nick: rows[0].nick
            }, "my-secret-key", {
                expiresIn: '1h'
            })
        };
    });
});

// 회원정보 수정 라우터(JWT 포함)
router.patch('/members', verifyToken, (req, res) => {
    const { id, pw, nick } = req.body;

    const sql = 'UPDATE TB_MEMBER SET nick = ? WHERE id = ? AND pw = ?';
    const params = [nick, id, pw];

    db.execute(sql, params, (err, result) => {
        if(err) {
            return res.status(500).json({
                success: false,
                message: err.message
            })
        };

        if(result.affetedRows > 0) {
            // 업데이트 성공
            res.json({
                success: true,
                message: "회원정보 수정 완료"
            })
        }
        else {
            res.json({
                success: false,
                message: "회원정보 수정 실패"
            })
        }
    })
})

module.exports = router;