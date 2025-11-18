const express = require('express');
const router = express.Router();
const db = require('../config/db')
const jwt = require('jsonwebtoken');
const verifyToken = require("../middlewares/jwt")

// 회원가입 라우터
router.post('/register', async (req, res) => {
    try {
        const { id, pw, name } = req.body;

        if (!id || !pw || !name) {
            return res.status(400).json({
                success: false,
                message: "id, pw, name은 필수입니다."
            })
        }

        const sql = 'INSERT INTO tb_member (id, pw, name) VALUES (?, ?, ?)'
        const params = [ id, pw, name ];

        const [result] = await db.execute(sql, params);

        if (result.affectedRows > 0) {
            res.json({ success: true, message: "회원가입 성공!"});
        } else {
            res.json({ success: false, message: "회원가입 실패..."})
        }
    } catch(err) {
        console.error('register error:', err);
        res.status(500).json({ success: false, message: err.message })
    }
});

// 로그인 라우터 -> JWT 발급
router.post('/login', async (req, res) => {
    try {
        const { id, pw } = req.body;
        if (!id || !pw) return res.status(400).json({ success: false, message: 'id & pw 필요'})
        
        const sql ='SELECT * FROM tb_member WHERE id=? AND pw=?';
        const params = [ id, pw ];

        const [rows] = await db.execute(sql, params);

        if (rows.length > 0) {
            const user = rows[0];
            const token = jwt.sign({
                id: user.id,
                name: user.name
            }, "my-secret-key", {expiresIn: '1h'});
            return res.json({ success: true, message: "로그인 성공", token})
        } else {
            return res.json({ success: false, message: "로그인 실패"});
        }
    } catch(err) {
        console.error('login error:', err);
        res.status(500).json({ success: false, message: "서버 오류"});
    }
})


// 회원정보 수정 라우터(JWT 포함)
router.patch('/members', verifyToken, async (req, res) => {
    try {
        const { id, pw, name } = req.body;
        if(!id || !pw) return res.status(400).json({ success: false, message: "id & pw 필요"})
        
        const sql = 'UPDATE tb_member SET name=? WHERE id=? AND pw=?';
        const params = [ name, id, pw ];

        const [result] = await db.execute(sql, params);

        if (result.affectedRows > 0) {
            res.json({ success: true, message: "수정 완료"})
        } else {
            res.json({ success: false, message: "수정 실패"})
        };
    } catch(err) {
        console.error('update member error:', err);
        res.status(500).json({ success: false, message: "서버 오류"})
    };
})

module.exports = router;