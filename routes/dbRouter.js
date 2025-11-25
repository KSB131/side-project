const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { ensureLoggedIn } = require('connect-ensure-login');

// 사용자 조회
router.post("/findUser", async (req, res) => {
    console.log('/addFriends headers.cookie=', req.headers.cookie);
    console.log('/addFriends req.session=', req.session);
    if (!req.session.user)
        return res.status(401).json({
            success: false,
            message: "로그인 필요"
        })

    const userId = req.session.user.id;

    try {
        // 1️⃣ 현재 로그인한 사용자의 id_num 가져오기
        const [[me]] = await db.execute(
            "SELECT id_num FROM tb_member WHERE id = ?",
            [userId]
        );
        if (!me) return res.status(404).send({ success: false, message: "회원조회 불가"})

        // 2️⃣ 사용자 중 친구/본인 제외
        const sql = `
            SELECT m.id, m.name, m.phone, m.hobby, m.profile_text
            FROM tb_member m
            WHERE
                m.id_num <> ? -- 자기 자신 제외
                AND m.id_num NOT IN ( -- 이미 친구인 사람 제외
                    SELECT f.friend_id_num
                    FROM tb_friend f
                    WHERE f.user_id_num = ?
        )`;

        const [rows] = await db.execute(sql, [me.id_num, me.id_num])
        res.send({ success: true, data: rows});

    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            res.status(400).json({ success: false, message: "이미 요청을 보냈습니다."})
        } else {
            console.error(err);
            res.status(500).json({ success: false, message: "서버 오류"});
        }
    }
})

// 친구 요청 목록
router.get('/findFriends', async (req, res) => {
    if (!req.session.user)
        return res.status(401).json({ success: false, message: "로그인 필요"});

    const userId = req.session.user.id;

    try {
        const [[me]] = await db.execute(
            "select id_num FROM tb_member WHERE id=?",
            [userId]
        );
        if (!me) return res.status(404).json({
            success: false,
            message: "회원정보 없음"
        })

        const userIdNum = me.id_num

        const [friends] = await db.execute(
            `SELECT m.id, m.name, m.hobby, m.phone, m.profile_text
            FROM tb_friend f
            JOIN tb_member m ON f.friend_id_num = m.id_num
            WHERE f.user_id_num = ?`,
            [userIdNum]
        )
        res.json({ success: true, friends });
        
    } catch (err) {
        console.error("친구 목록 조회 오류: ", err);
        res.status(500).json({
            success: false,
            message: "친구 목록 조회 실패"
        });
    }
})

// 친구 목록 조회
router.get('/getFriends', async (req, res) => {
    console.log('/getFriends headers.cookie=', req.headers.cookie);
    console.log('/getFriends req.session=', req.session);
    if (!req.session.user)
        return res.status(401).json({ success: false, message: "로그인 필요"});

    const userId = req.session.user.id;

    try {
        const [[me]] = await db.execute(
            "select id_num FROM tb_member WHERE id=?",
            [userId]
        );
        if (!me) return res.status(404).json({
            success: false,
            message: "회원정보 없음"
        })

        const userIdNum = me.id_num

        const [friends] = await db.execute(
            `SELECT m.id, m.name, m.hobby, m.phone, m.profile_text
            FROM tb_friend f
            JOIN tb_member m ON f.friend_id_num = m.id_num
            WHERE f.user_id_num = ?`,
            [userIdNum]
        )
        res.json({ success: true, friends });
        
    } catch (err) {
        console.error("친구 목록 조회 오류: ", err);
        res.status(500).json({
            success: false,
            message: "친구 목록 조회 실패"
        });
    }
});


// 친구 저장
router.post('/addFriend', ensureLoggedIn('/login'), async (req, res) => {
    try {
        const userId = req.session.userId;        // 로그인한 사용자의 user_id
        const friendId = req.body.friendId;       // 프론트에서 전달된 friendId

        if (!userId || !friendId) {
            return res.status(400).json({ success: false, message: '잘못된 요청입니다.' });
        }

        // 1. user_id_num, friend_id_num 가져오기
        const [userRow] = await db.query('SELECT id_num FROM tb_member WHERE id = ?', [userId]);
        const [friendRow] = await db.query('SELECT id_num FROM tb_member WHERE id = ?', [friendId]);

        if (!userRow || !friendRow) {
            return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        }

        const userIdNum = userRow.id_num;
        const friendIdNum = friendRow.id_num;

        // 2. tb_friend 테이블에 삽입
        await db.query(
            `INSERT INTO tb_friend (user_id_num, user_id, friend_id, friend_id_num)
             VALUES (?, ?, ?, ?)`,
            [userIdNum, userId, friendId, friendIdNum]
        );

        return res.json({ success: true, message: '친구 요청이 완료되었습니다.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: '서버 오류 발생' });
    }
});

module.exports = router;