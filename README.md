(2025/11/14)
핵심프로젝트때 만들었던 서버 다시 만들어보기
-> 이해하지도 못하고 만들었던 코드들 다시 공부하고 깔끔하게 만들어보기

(2025/11/18)
**문제**
1. db.js는 mysql2/promise 풀을 만듦 -> Promise API 사용
2. apiRouter.js에서는 db.execute(sql, params, callback)처럼 콜백형식으로 사용 -> 호환되지 않음

**해결방법**
1. db.js는 mysql2/promise 유지
2. apiRouter.js / dbRouter.js 를 async/await(Promise 스타일) 으로 전부 바꿔서 일관성 있게 사용

**실행**
## promise vs callback
### async/await는 ***가독성⋅유지보수⋅에러 중앙화*** 측면에서 우수
1. if (!id || !pw) return res.status(400).json({ success: false, message: 'id & pw 필요'})
    → 클라이언트 실수에 대해 빠르게 400으로 응답하고 바로 종료
2. DB 호출
- async: const [rows] = await db.execute(sql, params);
    → db.execute가 Promise를 반환하고, 결과를 배열 구조분해 할당으로 받는 스타일(mysql2/promise)
    → await 이후 코드는 쿼리 완료 시점에 실행되므로 동기처럼 읽힘
- callback: db.execute(sql, params, (err, rows) => {...})
    → 콜백 내에서만 rows를 사용 가능
3. 에러 처리
- async: 전체 핸들러를 try/catch로 감싸서 DB, jwt 에러 등 모든 예외를 한 곳에서 처리. catch에서 res.status(500).json({ ... })로 응답
    → 장점: 에러 처리가 중앙화되어 빠뜨릴 위험이 적음
- callback: 콜백 내부에서 if (err) {return res.status(500).json(...)}
    → 장점: 에러를 즉시 처리
    → 단점: 여러 비동기 계층이 생기면 각 콜백마다 에러 처리를 반복해야 함
4. 응답(토큰 / 일관성)
- async: const token=jwt.sign({...}) return res.json({..., token})
    → 토큰을 응답에 포함해서 클라이언트가 사용할 수 있게 함
- callback: 토큰을 생성은 하지만 응답값으로 token을 반환하지 않음