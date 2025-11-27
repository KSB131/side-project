const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 사용자 조회 (회원 제외, 친구 제외)
router.post("/findUser", async (req, res) => {
    console.log('/findUser headers.cookie=', req.headers.cookie);
    console.log('/findUser req.session=', req.session);
    if (!req.session.user)
        return res.status(401).json({
            success: false,
            message: "로그인 필요"
        });

    const userId = req.session.user.id;

    try {
        // 현재 로그인한 사용자의 id_num 가져오기
        const [meRows] = await db.execute(
            "SELECT id_num FROM tb_member WHERE id = ?",
            [userId]
        );
        if (!meRows || meRows.length === 0) return res.status(404).send({ success: false, message: "회원조회 불가"});

        const me = meRows[0];

        // 사용자 중 친구/본인 제외
        const sql = `
            SELECT m.id, m.name, m.phone, m.hobby, m.profile_text
            FROM tb_member m
            WHERE
                m.id_num <> ? -- 자기 자신 제외
                AND m.id_num NOT IN ( -- 이미 친구인 사람 제외
                    SELECT f.friend_id_num
                    FROM tb_friend f
                    WHERE f.user_id_num = ?
                )
        `;

        const [rows] = await db.execute(sql, [me.id_num, me.id_num]);
        res.send({ success: true, data: rows });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "서버 오류" });
    }
});

// 친구 요청 목록 (유사한 기능이 getFriends와 겹침 — 필요하면 합치세요)
router.get('/findFriends', async (req, res) => {
    if (!req.session.user)
        return res.status(401).json({ success: false, message: "로그인 필요" });

    const userId = req.session.user.id;

    try {
        const [meRows] = await db.execute(
            "select id_num FROM tb_member WHERE id=?",
            [userId]
        );
        if (!meRows || meRows.length === 0) return res.status(404).json({ success: false, message: "회원정보 없음" });

        const userIdNum = meRows[0].id_num;

        const [friends] = await db.execute(
            `SELECT m.id, m.name, m.hobby, m.phone, m.profile_text
            FROM tb_friend f
            JOIN tb_member m ON f.friend_id_num = m.id_num
            WHERE f.user_id_num = ?`,
            [userIdNum]
        );
        res.json({ success: true, friends });

    } catch (err) {
        console.error("친구 목록 조회 오류: ", err);
        res.status(500).json({ success: false, message: "친구 목록 조회 실패" });
    }
});

// 친구 목록 조회 (클라이언트에서 사용하는 엔드포인트)
router.get('/getFriends', async (req, res) => {
    console.log('/getFriends headers.cookie=', req.headers.cookie);
    console.log('/getFriends req.session=', req.session);
    if (!req.session.user)
        return res.status(401).json({ success: false, message: "로그인 필요" });

    const userId = req.session.user.id;

    try {
        const [meRows] = await db.execute(
            "select id_num FROM tb_member WHERE id=?",
            [userId]
        );
        if (!meRows || meRows.length === 0) return res.status(404).json({ success: false, message: "회원정보 없음" });

        const userIdNum = meRows[0].id_num;

        const [friends] = await db.execute(
            `SELECT m.id, m.name, m.hobby, m.phone, m.profile_text
            FROM tb_friend f
            JOIN tb_member m ON f.friend_id_num = m.id_num
            WHERE f.user_id_num = ?`,
            [userIdNum]
        );
        res.json({ success: true, friends });

    } catch (err) {
        console.error("친구 목록 조회 오류: ", err);
        res.status(500).json({ success: false, message: "친구 목록 조회 실패" });
    }
});

// 친구 저장 (요청 보낼 때)
router.post('/addFriend', async (req, res) => {
    try {
        if (!req.session.user) return res.status(401).json({ success: false, message: "로그인 필요" });

        const userId = req.session.user.id;        // 로그인한 사용자의 id
        const friendId = req.body.friendId;       // 프론트에서 전달된 friendId

        if (!userId || !friendId) {
            return res.status(400).json({ success: false, message: '잘못된 요청입니다.' });
        }

        // 1. user_id_num, friend_id_num 가져오기
        const [userRows] = await db.execute('SELECT id_num FROM tb_member WHERE id = ?', [userId]);
        const [friendRows] = await db.execute('SELECT id_num FROM tb_member WHERE id = ?', [friendId]);

        if (!userRows || userRows.length === 0 || !friendRows || friendRows.length === 0) {
            return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        }

        const userIdNum = userRows[0].id_num;
        const friendIdNum = friendRows[0].id_num;

        // 이미 친구(요청 보냄)인지 확인
        const [existsRows] = await db.execute(
            'SELECT 1 FROM tb_friend WHERE user_id_num = ? AND friend_id_num = ? LIMIT 1',
            [userIdNum, friendIdNum]
        );
        if (existsRows && existsRows.length > 0) {
            return res.status(400).json({ success: false, message: '이미 요청하였거나 친구입니다.' });
        }

        // 2. tb_friend 테이블에 삽입
        await db.execute(
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
