const express = require('express');
const router = express.Router();
const db = require('../config/db');
const path = require('path');

// 친구 목록 조회
router.get('/getFriends', async (req, res) => {
    if (!req.session.user)
        return res.status(401).json({ success: false, message: "로그인 필요"});

    const userId = req.session.user.id;

    try {
        const [[me]] = await db.execute(
            "select id_num FROM tb_member WHERE id=?",
            [userId]
        );
        if (!me) return req.status(404).json({
            success: false,
            message: "회원정보 없음"
        })

        const [friends] = await db.execute(
            `SELECT m.id, m.name, m.hobby, m.phone, m.profile_text
            FROM tb_friend f
            JOIN tb_member m ON f.friend_id_num = m.id_num
            WHERE f.user_id_num = ?
            `
        )
    }
    
});

module.exports = router;