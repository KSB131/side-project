const express = require('express');
const router = express.Router();
const db = require('../config/db');


// 친구 요청 보내기
router.post("/addFriend", async (req, res) => {
    if (!req.session.user)
        return res.status(401).json({
            success: false,
            message: "로그인 필요"
        })
    const from_id = req.session.user.id;
    const {friendID: to_id} = req.body;

    try {
        await db.execute(
            "INSERT INTO tb_friend_request (from_id, to_id) values(?, ?)", [from_id, to_id])
        res.json({ success: true, message: "친구 요청 전송 완료"});
    } catch (err) {
        
    }
})
router.post("/addFriend", async (req, res) => {
    if (!req.session.user)
        return res.status(401).json({
            success: false,
            message: "로그인 필요"
        })
    const from_id = req.session.user.id;
    const {friendID: to_id} = req.body;

    try {
        await db.execute(
            "INSERT INTO tb_friend_request (from_id, to_id) values (?, ?)",
            [from_id, to_id]
        );
        res.json({ success: true, message: "친구 요청 전송 완료"})
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            res.status(400).json({ success: false, message: "이미 요청을 보냈습니다."})
        } else {
            console.error(err);
            res.status(500).json({ success: false, message: "서버 오류"});
        }
    }
})

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
        if (!me) return res.status(404).json({
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
    } catch (err) {
        console.error("친구 목록 조회 오류: ", err);
        res.status(500).json({
            success: false,
            message: "친구 목록 조회 실패"
        });
    }
});

module.exports = router;