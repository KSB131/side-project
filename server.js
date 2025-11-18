const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');
const db = require('./config/db')
const session = require('express-session')

const logger = require('./middlewares/logger');

const pageRouter = require('./routes/pageRouter');
const apiRouter = require('./routes/apiRouter');
const dbRouter = require('./routes/dbRouter')

app.use(session({
    secret: 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000*60*60}
}))

app.use(express.urlencoded({ extended : true}));
app.use(express.json());

// Express에 "정적(static) 파일 제공" 기능을 등록 (/public 폴더 안의 HTML, CSS 등을 제공)
app.use(express.static(path.join(__dirname, "public")));



app.use(logger);


app.use('/', pageRouter);
app.use('/api', apiRouter);
app.use('/db', dbRouter);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})