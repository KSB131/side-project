const jwt = require('jsonwebtoken')

// JWT 검증 미들웨어
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        // 토큰 없음
        return res.status(401).json({
            success: false,
            message: "토큰 미존재"
        })
    }

    const token = authHeader.split(' ')[1];  // Bearer 문자열 분리
    jwt.verify(token, "my-secret-key", (err, user) => {
        if(err) {
            return res.status(401).json({
                success: false,
                message: "유효하지 않은 토큰입니다."
            })
        }

        req.user = user;
        next();
    })
}

module.exports = verifyToken;