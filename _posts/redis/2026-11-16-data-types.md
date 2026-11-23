---
layout: post
title: "Redis 값에는 왜 모양이 있을까? 책상 위 정리 도구로 이해하는 Redis 자료형"
description: "값을 통째로 꺼내 고치면 수정이 사라지는 문제를 도서관 책상 비유로 보여 주고 문자열과 INCR, 해시, 리스트, 셋, 정렬된 셋이 그 문제를 어떻게 푸는지 실제 동작으로 이어서 설명합니다."
date: 2026-11-16 23:30:00 +0900
series: redis
episode: 2
summary: "Redis는 값이 메모인지 카드인지 순위표인지 알아요. 그래서 앱이 값을 꺼내 고치지 않아도 Redis가 그 자리에서 한 칸만 안전하게 고쳐 줘요."
---

<div class="lesson lesson-hierarchy storybook">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: https://cdn.jsdelivr.net/npm/lucide-static@1.25.0/icons/ (ISC). 라이선스: assets/icons/LICENSE-lucide.txt. 이름 대응: i-desk=lamp-desk, i-memo=sticky-note, i-card=id-card, i-line=list-ordered, i-roll=clipboard-check. -->
<symbol id="i-user" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></symbol>
<symbol id="i-desk" viewBox="0 0 24 24"><path d="M10.293 2.293a1 1 0 0 1 1.414 0l2.5 2.5 5.994 1.227a1 1 0 0 1 .506 1.687l-7 7a1 1 0 0 1-1.687-.506l-1.227-5.994-2.5-2.5a1 1 0 0 1 0-1.414z"/><path d="m14.207 4.793-3.414 3.414"/><path d="M3 20a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="m9.086 6.5-4.793 4.793a1 1 0 0 0-.18 1.17L7 18"/></symbol>
<symbol id="i-memo" viewBox="0 0 24 24"><path d="M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"/><path d="M15 3v5a1 1 0 0 0 1 1h5"/></symbol>
<symbol id="i-card" viewBox="0 0 24 24"><path d="M16 10h2"/><path d="M16 14h2"/><path d="M6.17 15a3 3 0 0 1 5.66 0"/><circle cx="9" cy="11" r="2"/><rect x="2" y="5" width="20" height="14" rx="2"/></symbol>
<symbol id="i-line" viewBox="0 0 24 24"><path d="M11 5h10"/><path d="M11 12h10"/><path d="M11 19h10"/><path d="M4 4h1v5"/><path d="M4 9h2"/><path d="M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02"/></symbol>
<symbol id="i-roll" viewBox="0 0 24 24"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></symbol>
<symbol id="i-trophy" viewBox="0 0 24 24"><path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/><path d="M18 9h1.5a1 1 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6"/></symbol>
<symbol id="i-plus" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M12 5v14"/></symbol>
</defs>
</svg>

<div class="slide-group">
<h2 class="slide-group-title">방문 수: 두 번 더해도 한 번만 남아요</h2>

<section class="slide">
<h3>두 학생이 같은 숫자에서 출발해요</h3>
<svg class="dg" viewBox="0 0 400 230" role="img" aria-label="학생 A와 학생 B가 책상 위 방문 수 메모에서 둘 다 100을 읽고 각자 101로 고쳐 써서 두 번 올렸는데 결과가 101밖에 안 된다는 그림. 수치는 설명용 예시다.">
<defs><marker id="d1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M92,70 L162,70" marker-end="url(#d1)"/>
<path class="line" d="M308,70 L238,70" marker-end="url(#d1)"/>
<circle class="box" cx="60" cy="70" r="30"/><use class="ic" href="#i-user" x="40" y="50" width="40" height="40"/>
<circle class="kafka" cx="200" cy="70" r="34"/><use class="ic" href="#i-memo" x="178" y="48" width="44" height="44"/>
<circle class="box" cx="340" cy="70" r="30"/><use class="ic" href="#i-user" x="320" y="50" width="40" height="40"/>
<text class="small" x="127" y="56">100 → 101</text>
<text class="small" x="273" y="56">100 → 101</text>
<text class="big" x="60" y="124">학생 A</text>
<text class="big" x="200" y="128">방문 수 메모</text>
<text class="big" x="340" y="124">학생 B</text>
<rect class="line" x="60" y="146" width="280" height="72" rx="12"/>
<circle class="bad" cx="108" cy="182" r="20"/><use class="ic" href="#i-memo" x="96" y="170" width="24" height="24"/>
<text class="small" x="230" y="176">결과는 101이에요</text>
<text class="alert" x="230" y="198">두 번 올렸는데 하나만 늘었어요</text>
</svg>
<ol class="steps">
<li>학생(앱) 둘이 같은 책상의 메모를 읽어요</li>
<li>둘 다 100에 하나를 더해 101을 적어요 (예시)</li>
</ol>
</section>

<section class="slide">
<h3>나중에 쓴 숫자가 먼저 쓴 숫자를 덮어요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="방문 두 번을 두 앱이 따로 읽고 쓰면 101이고 관리인이 차례로 올리면 102다. 수치는 예시다.">
<rect class="line" x="10" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="102" y="34">각자 읽고 쓰기</text>
<circle class="bad" cx="102" cy="88" r="32"/><use class="ic" href="#i-memo" x="81" y="67" width="42" height="42"/>
<text class="big" x="102" y="150">100 → 101</text><text class="small" x="102" y="174">GET 뒤에 SET</text>
<rect class="line" x="206" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="298" y="34">관리인에게 맡기기</text>
<circle class="new" cx="298" cy="88" r="32"/><use class="ic" href="#i-memo" x="277" y="67" width="42" height="42"/>
<text class="big" x="298" y="150">100 → 102</text><text class="small" x="298" y="174">두 번의 INCR</text>
</svg>
<ol class="steps">
<li>읽기(GET)와 쓰기(SET) 사이엔 다른 앱이 들어와요</li>
<li>순서에 따라 답이 달라져요 (경쟁 상태)</li>
</ol>
</section>

<details class="origin">
<summary>더 알아보기: 누가 왜 만들었을까?</summary>
<p>Redis를 만든 살바토레 산필리포는 공개 당시부터 여러 모양의 값을 지원하려 했어요. 공식 문서는 Redis를 <b>자료구조 서버(data structure server)</b>라고 소개해요. 값을 그냥 바이트 덩어리로만 두지 않고 목록이나 집합처럼 프로그래밍에서 익숙한 자료구조로 두고 그 모양에 맞는 명령을 제공한다는 뜻이에요.</p>
<p>공식 FAQ는 다른 키-값 저장소와 다른 점으로 값에 복잡한 자료형을 담을 수 있고 그 자료형마다 원자적인 명령이 정해져 있다는 것을 꼽아요. 이 글의 문제처럼 앱이 꺼내 고치지 않고 Redis 안에서 고치게 하려는 설계예요.</p>
<p>참고: <a href="https://redis.io/blog/redis-turns-10/">Redis의 첫 공개</a> · <a href="https://redis.io/docs/latest/develop/data-types/">Redis 공식 문서: 자료형</a> · <a href="https://redis.io/docs/latest/develop/get-started/faq/">Redis 공식 문서: FAQ</a></p>
</details>
</div>

<div class="slide-group">
<h2 class="slide-group-title">메모: 숫자는 책상에서 바로 올려요</h2>

<div class="slide-with-question">
<section class="slide">
<h3>관리인이 숫자를 하나씩 올려요</h3>
<svg class="dg" viewBox="0 0 400 215" role="img" aria-label="학생 A와 학생 B가 메모를 직접 고치지 않고 책상 관리인에게 하나 올려 주세요라고 부탁하고 관리인이 부탁을 하나씩 처리해서 메모가 100에서 101을 거쳐 102가 된다는 그림. 수치는 설명용 예시다.">
<defs><marker id="d2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M78,58 L164,88" marker-end="url(#d2)"/>
<path class="line" d="M78,142 L164,112" marker-end="url(#d2)"/>
<path class="line" d="M236,100 L298,100" marker-end="url(#d2)"/>
<circle class="box" cx="50" cy="50" r="26"/><use class="ic" href="#i-user" x="33" y="33" width="34" height="34"/>
<circle class="box" cx="50" cy="150" r="26"/><use class="ic" href="#i-user" x="33" y="133" width="34" height="34"/>
<circle class="kafka" cx="200" cy="100" r="34"/><use class="ic" href="#i-desk" x="178" y="78" width="44" height="44"/>
<circle class="kafka" cx="330" cy="100" r="28"/><use class="ic" href="#i-memo" x="312" y="82" width="36" height="36"/>
<text class="small" x="136" y="44">하나 올려 주세요</text>
<text class="small" x="136" y="178">하나 올려 주세요</text>
<text class="big" x="200" y="156">책상 관리인</text>
<text class="chip" x="330" y="150">100 → 101 → 102</text>
<text class="small" x="200" y="202">부탁을 한 번에 하나씩 처리해요</text>
</svg>
<ol class="steps">
<li>책상 관리인(Redis)은 한 번에 한 부탁을 끝내요</li>
<li>숫자 올리기(INCR) 중간에 끼어들 수 없어요 (원자성)</li>
<li>메모가 없으면 0부터 세요 (그림 숫자는 예시)</li>
</ol>
<p class="more">참고: <a href="https://redis.io/docs/latest/develop/data-types/strings/">Redis 공식 문서: 문자열</a> · <a href="https://redis.io/docs/latest/commands/incr/">Redis 공식 문서: INCR</a></p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 문자열인데 어떻게 숫자를 더하나요? "abc"에 INCR을 보내면요?</summary>
<p>A. INCR은 문자열에 적힌 10진수 정수를 읽고 1을 더해요. 값과 결과는 부호 있는 64비트 정수 범위에 들어야 해요. "100"처럼 정수로 읽히는 값만 되고 "abc"처럼 정수가 아닌 값이면 오류를 돌려줘요.</p>
</details>
<details class="author-question">
<summary>초보 독자 Q. GET이나 INCR 같은 명령은 누가 어디에 입력하나요?</summary>
<p>A. 서비스에서는 사람이 아니라 앱 코드가 보내요. 앱은 언어마다 있는 Redis 클라이언트 라이브러리를 써서 코드 한 줄로 INCR 같은 명령을 Redis에 보내고 결과를 받아요. 공부할 때는 redis-cli라는 프로그램을 열고 명령을 직접 쳐서 Redis가 어떻게 답하는지 볼 수도 있어요.</p>
</details>
</aside>
</div>

<section class="slide">
<h3>메모 한 장에는 값 하나를 담아요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="문자열 메모는 글과 이미지도 담고 정수 모양의 값은 숫자 올리기에 쓸 수 있다.">
<rect class="line" x="10" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="102" y="34">그대로 보관</text>
<circle class="box" cx="102" cy="88" r="32"/><use class="ic" href="#i-memo" x="81" y="67" width="42" height="42"/>
<text class="big" x="102" y="150">글 · JSON · 이미지</text><text class="small" x="102" y="174">문자열</text>
<rect class="line" x="206" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="298" y="34">숫자 올리기</text>
<circle class="kafka" cx="298" cy="88" r="32"/><use class="ic" href="#i-plus" x="277" y="67" width="42" height="42"/>
<text class="big" x="298" y="150">41 → 42</text><text class="small" x="298" y="174">정수 모양의 문자열</text>
</svg>
<ol class="steps">
<li>메모(문자열) 하나는 기본 최대 512MB예요</li>
<li>관리인은 정수로 읽을 수 있는 값에만 1을 더해요 (예시)</li>
</ol>
<p class="more">참고: <a href="https://redis.io/docs/latest/develop/data-types/strings/">Redis 문자열</a></p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">정리 도구: 고칠 곳에 맞춰 모양을 골라요</h2>

<section class="slide">
<h3>상품 카드는 가격 칸만 고쳐요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="상품 정보를 한 장의 글로 두면 통째로 바꾸고 칸이 나뉜 카드로 두면 가격만 바꾼다.">
<rect class="line" x="10" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="102" y="34">메모 한 장</text>
<circle class="box" cx="102" cy="88" r="32"/><use class="ic" href="#i-memo" x="81" y="67" width="42" height="42"/>
<text class="big" x="102" y="150">상품 전체</text><text class="small" x="102" y="174">JSON 문자열</text>
<rect class="line" x="206" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="298" y="34">칸 나뉜 카드</text>
<circle class="kafka" cx="298" cy="88" r="32"/><use class="ic" href="#i-card" x="277" y="67" width="42" height="42"/>
<text class="big" x="298" y="150">가격 한 칸</text><text class="small" x="298" y="174">해시</text>
</svg>
<ol class="steps">
<li>이름표(키) 하나가 상품 카드(해시) 한 장을 가리켜요</li>
<li>앱은 가격 칸(필드)만 읽거나 고쳐요 (HGET·HSET)</li>
<li>한 칸의 정수도 바로 올려요 (HINCRBY)</li>
</ol>
<p class="more">참고: <a href="https://redis.io/docs/latest/develop/data-types/">Redis 공식 문서: 자료형</a> · <a href="https://redis.io/docs/latest/develop/data-types/hashes/">Redis 공식 문서: 해시</a></p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>줄은 순서를 지키고 출석부는 중복을 걸러요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="리스트에 민지가 두 번 서면 두 자리를 차지하지만 셋에는 민지 이름 하나만 남는다.">
<rect class="line" x="10" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="102" y="34">작업 줄</text>
<circle class="box" cx="102" cy="88" r="32"/><use class="ic" href="#i-line" x="81" y="67" width="42" height="42"/>
<text class="big" x="102" y="150">민지 · 준 · 민지</text><text class="small" x="102" y="174">리스트</text>
<rect class="line" x="206" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="298" y="34">출석부</text>
<circle class="kafka" cx="298" cy="88" r="32"/><use class="ic" href="#i-roll" x="277" y="67" width="42" height="42"/>
<text class="big" x="298" y="150">민지 · 준</text><text class="small" x="298" y="174">셋</text>
</svg>
<ol class="steps">
<li>줄(리스트)은 앞뒤로 넣고 필요한 구간을 읽어요</li>
<li>출석부(셋)는 순서 없이 이름을 한 번씩 담아요</li>
<li>앱은 좋아요를 누른 사람이 있는지 확인해요</li>
</ol>
<p class="more">참고: <a href="https://redis.io/docs/latest/develop/data-types/lists/">리스트의 LPUSH·RPUSH·LRANGE</a> · <a href="https://redis.io/docs/latest/develop/data-types/sets/">셋의 SADD·SISMEMBER</a></p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 리스트·셋·정렬된 셋은 모두 여러 개를 담는데 어떻게 골라요?</summary>
<p>A. 무엇이 중요한지로 골라요. 넣은 순서가 중요하고 같은 값이 여러 번 들어가도 되면 리스트예요. 최근 본 상품은 같은 상품을 두 번 봐도 순서대로 남기면 되니 리스트가 맞아요.</p>
<p>순서는 상관없고 같은 값이 두 번 들어가면 안 되면 셋이에요. 좋아요는 한 사람이 한 번만 누를 수 있으니 셋에 담으면 Redis가 중복을 알아서 막아요. 점수에 따른 순서가 필요하면 정렬된 셋을 써요.</p>
</details>
</aside>
</div>

<section class="slide">
<h3>순위표는 점수를 고치면 자리가 바뀌어요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="상품 C의 점수가 29에서 31로 오르면 A의 30점을 넘어 첫 줄로 올라간다. 점수는 예시다.">
<rect class="line" x="10" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="102" y="34">올리기 전</text>
<circle class="box" cx="102" cy="88" r="32"/><use class="ic" href="#i-trophy" x="81" y="67" width="42" height="42"/>
<text class="big" x="102" y="150">A 30 · C 29</text><text class="small" x="102" y="174">B 25</text>
<rect class="line" x="206" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="298" y="34">C에 2점 더한 뒤</text>
<circle class="new" cx="298" cy="88" r="32"/><use class="ic" href="#i-trophy" x="277" y="67" width="42" height="42"/>
<text class="big" x="298" y="150">C 31 · A 30</text><text class="small" x="298" y="174">B 25</text>
</svg>
<ol class="steps">
<li>순위표(정렬된 셋)에는 한 이름이 한 번만 올라요</li>
<li>점수를 더할 때(ZINCRBY) 새 이름은 0점부터 세요 (예시)</li>
<li>높은 점수부터 열 줄을 읽어요 (Redis 6.2부터 ZRANGE key 0 9 REV)</li>
</ol>
<p class="more">참고: <a href="https://redis.io/docs/latest/develop/data-types/sorted-sets/">Redis 공식 문서: 정렬된 셋과 ZADD</a> · <a href="https://redis.io/docs/latest/commands/zincrby/">Redis 공식 문서: ZINCRBY</a> · <a href="https://redis.io/docs/latest/commands/zrange/">Redis 공식 문서: ZRANGE</a></p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">주의: 키를 읽고 지우는 범위를 살펴요</h2>

<section class="slide">
<h3>칸의 기한과 카드의 기한은 따로예요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="EXPIRE는 상품 카드 전체를 만료시키고 HEXPIRE는 선택한 필드만 만료시킨다.">
<rect class="line" x="10" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="102" y="34">키의 기한</text>
<circle class="box" cx="102" cy="88" r="32"/><use class="ic" href="#i-card" x="81" y="67" width="42" height="42"/>
<text class="big" x="102" y="150">카드 전체</text><text class="small" x="102" y="174">EXPIRE</text>
<rect class="line" x="206" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="298" y="34">필드의 기한</text>
<circle class="kafka" cx="298" cy="88" r="32"/><use class="ic" href="#i-card" x="277" y="67" width="42" height="42"/>
<text class="big" x="298" y="150">한 칸</text><text class="small" x="298" y="174">HEXPIRE · 7.4부터</text>
</svg>
<ol class="steps">
<li>한 키의 값에는 모양이 하나뿐이에요</li>
<li>메모에 줄 전용 명령을 쓰면 WRONGTYPE 오류가 나요</li>
<li>Redis 7.4부터 한 칸에만 기한을 걸 수 있어요</li>
</ol>
<p class="more">참고: <a href="https://redis.io/docs/latest/commands/hexpire/">Redis HEXPIRE</a></p>
</section>

<section class="slide">
<h3>긴 줄에서는 필요한 구간만 읽어요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="50만 항목을 모두 읽는 동안 다음 요청이 기다린다. 처음 열 개만 읽으면 반환할 항목이 줄어든다. 개수는 예시다.">
<rect class="line" x="10" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="102" y="34">처음부터 끝까지</text>
<circle class="bad" cx="102" cy="88" r="32"/><use class="ic" href="#i-line" x="81" y="67" width="42" height="42"/>
<text class="big" x="102" y="150">50만 개</text><text class="small" x="102" y="174">LRANGE key 0 -1</text>
<rect class="line" x="206" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="298" y="34">앞부분만</text>
<circle class="kafka" cx="298" cy="88" r="32"/><use class="ic" href="#i-line" x="277" y="67" width="42" height="42"/>
<text class="big" x="298" y="150">10개</text><text class="small" x="298" y="174">LRANGE key 0 9</text>
</svg>
<ol class="steps">
<li>긴 명령이 끝날 때까지 다른 요청도 기다려요 (예시)</li>
<li>날짜별로 키를 나누면 한 줄에 덜 몰려요</li>
</ol>
<p class="more">참고: <a href="https://redis.io/docs/latest/commands/lrange/">Redis LRANGE</a></p>
</section>

<section class="slide">
<h3>유일한 원본은 지워지기 전에 보관해요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="책상에 복사한 인기 목록은 다시 채울 수 있지만 책상에서만 센 방문 수는 지우면 원본도 사라진다.">
<rect class="line" x="10" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="102" y="34">복사해 둔 목록</text>
<circle class="box" cx="102" cy="88" r="32"/><use class="ic" href="#i-desk" x="81" y="67" width="42" height="42"/>
<text class="big" x="102" y="150">서고에 원본</text><text class="small" x="102" y="174">다시 채울 수 있어요</text>
<rect class="line" x="206" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="298" y="34">책상에서만 센 수</text>
<circle class="bad" cx="298" cy="88" r="32"/><use class="ic" href="#i-memo" x="277" y="67" width="42" height="42"/>
<text class="big" x="298" y="150">유일한 원본</text><text class="small" x="298" y="174">지우면 잃어요</text>
</svg>
<ol class="steps">
<li>주기적으로 서고(DB)에 옮기면 마지막 기록까지 되찾아요</li>
<li>원본이라면 퇴출 조건과 디스크 보관 방식(RDB·AOF)을 살펴요</li>
</ol>
<p class="more">참고: <a href="{{ '/2026/11/16/why-cache/' | relative_url }}">1편 캐시와 퇴출</a></p>
</section>
</div>

</div>
