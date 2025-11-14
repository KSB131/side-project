const logger = (req, res, next) => {
    const date = new Date();
    console.log(`${date.toISOString()} : ${req.method}/${req.url}`);
    next();
}

/*
    로그를 자동으로 작성해주는 미들웨어
     - 미들웨어는 req, res, next를 인자값으로 받는다!
     - 마지막에 항상 next()를 작성해줘야만 다음 미들웨어 혹은 라우터로 이동이 가능하다!
*/

module.exports = logger;