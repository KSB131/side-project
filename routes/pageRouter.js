const express = require('express');
const router = express.Router();
const path = require('path');
// 직접 경로를 만들어서 파일을 접근하려는 의도
const filePath = path.join(__dirname, '..', 'public');

router.get('/', (req, res) => {
    res.sendFile(path.join(filePath, 'login.html'))
})

router.get('/main', (req, res) => {
    res.sendFile(path.join(filePath, 'main.html'))
})

router.get('/register', (req, res) => {
    res.sendFile(path.join(filePath, 'register.html'))
})

router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(filePath, 'dashboard.html'))
})

module.exports = router;