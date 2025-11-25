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

(2025/11/19)
1. apiRouter.js에서 sql과 변수가 달랐던 문제 해결 : nick -> name (수정)
2. button의 각각의 show() -> showSection() 함수로 통일
3. 친구 요청 전송 함수 작성
4. 다음날 해야할 일
- friendlist 섹션 안에 추천 친구 정보 넣기 (친구 요청 전송 함수 완성하기)

(2025/11/20)
1. main.html: 친구 목록 섹션에 db에 저장된 친구 정보를 카드 형식으로 구현하는 기능 공부

(2025/11/24)
1. 친구 목록 섹션에 친구 정보를 카드 형식으로 구현하려는데 로그인 쿠키가 저장 되어 있지 않은 문제를 발견
- login.html에서 로그인 쿠키를 세션에 저장하는 형식으로 변경
- apiRouter.js에서 로그인 쿠키를 JWT형식에서 세션에 저장하는 형식으로 변경

(2025/11/25)
1. 시간이 지나서 로그인된 계정이 쿠키가 만료되어 로그아웃 됨.
로그아웃이 되었지만 화면에 로그인이 된 것처럼 '/main'화면이 나와있음
- 세션 체크하는 함수 추가
- 서버에서 세션 쿠키가 없으면 401을 반환하므로 클라이언트에서 401감지
    -> '/'(로그인 페이지)로 이동 

2. 전체적인 코드 문제점
### 클라이언트 (main.html)
- findNearbyFriends()에서 위치(geolocation)를 요구하지 않도록 변경 — 서버에서 근처 로직을 처리하지 않으므로 브라우저 권한 실패로 인해 흐름이 끊기는 문제 제거.
- 친구 목록 로드 함수 이름/동작 정리 (loadFriendlist 유지하되 401 처리 강화).
- 중복 이벤트 바인딩 제거 및 불필요 변수 정리 (loggedInUserId 사용하지 않아 제거 권장 — 남겨두고 초기화만 유지).
- sendFriendRequest()와 프론트 요청 흐름을 명확하게 유지(버튼 비활성화/복원 처리 포함).
- 세션 만료(401) 발생 시 window.location.href='/'로 리다이렉트하도록 처리.

### 서버 (dbRouter.js)
- connect-ensure-login 의존 제거(프로젝트에서 문제를 일으킨다고 로그에 있었음). 대신 내부에서 세션 검사(req.session.user)로 권한 처리.
- addFriend 라우트의 세션/파라미터 처리 오류 수정:
    - req.session.user.id 를 사용하도록 변경 (원래 req.session.userId로 잘못 참조).
    - DB 호출을 db.execute로 통일하고 반환값(배열)에서 첫 행을 안전하게 추출.
    - 이미 친구이거나 없는 사용자일 경우 적절한 상태 코드 및 메시지 반환.

### 서버 (apiRouter.js)
    - 특별한 로직 변경은 없고, 현재 코드에서 문제되는 부분은 없음(로그인시 req.session.user에 저장하는 방식과 일치).