const express = require('express');
const router = express.Router();
const FormData = require("fore-data");
const multer = require("multer");
const fetch = require('node-fetch');
const upload = multer();   // multer 미들웨어 설정(이미지 메모리에 저장)
const verifyToken = require("../middlewares/jwt");


// JSON 결과를 요청하는 라우터
// verifyToken 미들웨어 : jwt 인증을 위한 미들웨어
router.post('/', verifyToken, upload.single('file', async(req, res) => {
    // FormData를 생성해서 multer 가져온 파일을 다시 FormData 객체로 생성
    const formData = new FormData();
    formData.append("file", req.file.buffer, {
        filename : req.file.originalname,
        contentType : req.file.mimetype
    });
}))