---
layout: post
title: "Redis 값에는 왜 모양이 있을까? 책상 위 정리 도구로 이해하는 Redis 자료형"
description: "값을 통째로 꺼내 고치면 수정이 사라지는 문제를 도서관 책상 비유로 보여 주고 문자열과 INCR, 해시, 리스트, 셋, 정렬된 셋이 그 문제를 어떻게 푸는지 실제 동작으로 이어서 설명합니다."
date: 2026-11-16 23:30:00 +0900
series: redis
episode: 2
summary: "Redis는 값이 메모인지 카드인지 순위표인지 알아요. 그래서 앱이 값을 꺼내 고치지 않아도 Redis가 그 자리에서 한 칸만 안전하게 고쳐 줘요."
---

<div class="lesson lesson-hierarchy">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: Lucide (lucide-static v1.25.0, ISC). 라이선스: assets/icons/LICENSE-lucide.txt. 이름 대응: i-desk=lamp-desk, i-memo=sticky-note, i-card=id-card, i-line=list-ordered, i-roll=clipboard-check. 원과 사각형 요소는 같은 모양의 path로 옮겼어요. -->
<symbol id="i-user" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"/></symbol>
<symbol id="i-desk" viewBox="0 0 24 24"><path d="M10.293 2.293a1 1 0 0 1 1.414 0l2.5 2.5 5.994 1.227a1 1 0 0 1 .506 1.687l-7 7a1 1 0 0 1-1.687-.506l-1.227-5.994-2.5-2.5a1 1 0 0 1 0-1.414zM14.207 4.793l-3.414 3.414M3 20a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM9.086 6.5l-4.793 4.793a1 1 0 0 0-.18 1.17L7 18"/></symbol>
<symbol id="i-memo" viewBox="0 0 24 24"><path d="M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM15 3v5a1 1 0 0 0 1 1h5"/></symbol>
<symbol id="i-card" viewBox="0 0 24 24"><path d="M16 10h2M16 14h2M6.17 15a3 3 0 0 1 5.66 0M7 11a2 2 0 1 0 4 0 2 2 0 1 0-4 0zM4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/></symbol>
<symbol id="i-line" viewBox="0 0 24 24"><path d="M11 5h10M11 12h10M11 19h10M4 4h1v5M4 9h2M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02"/></symbol>
<symbol id="i-roll" viewBox="0 0 24 24"><path d="M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 14l2 2 4-4"/></symbol>
<symbol id="i-trophy" viewBox="0 0 24 24"><path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978M18 9h1.5a1 1 0 0 0 0-5H18M4 22h16M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zM6 9H4.5a1 1 0 0 1 0-5H6"/></symbol>
<symbol id="i-plus" viewBox="0 0 24 24"><path d="M5 12h14M12 5v14"/></symbol>
</defs>
</svg>

<div class="intro">
<p class="q">Redis에는 왜 문자열 말고도 해시·리스트·셋 같은 여러 가지 값의 모양이 있을까요?</p>
<p>1편에서 Redis를 키와 값을 메모리에 두는 공용 책상으로 봤어요. 그런데 앱이 값을 늘 통째로 꺼내 와서 고친 뒤 다시 넣으면 문제가 생겨요. 여러 요청이 같은 값을 동시에 고치면 수정 하나가 사라지고 값의 일부만 바꾸려 해도 전부를 주고받아야 해요.</p>
<p>이 글을 다 읽으면 Redis가 값의 모양인 <b>자료형</b>을 알기 때문에 앱 대신 그 자리에서 값을 고쳐 줄 수 있다는 것을 알게 돼요. 기본 자료형인 <b>문자열·해시·리스트·셋·정렬된 셋</b>이 각각 어떤 모양이고 언제 쓰는지도 함께 봐요.</p>
</div>

<div class="slide-group">
<h2 class="slide-group-title">문제: 값을 통째로 꺼내 고치면 생기는 일</h2>

<section class="slide">
<h3>두 학생이 같은 메모의 숫자를 동시에 고쳐요</h3>
<svg class="dg" viewBox="0 0 400 230" role="img" aria-label="학생 A와 학생 B가 책상 위 방문 수 메모에서 둘 다 100을 읽고 각자 101로 고쳐 써서 두 번 올렸는데 결과가 101밖에 안 된다는 그림">
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
<circle class="bad blink" cx="108" cy="182" r="20"/><use class="ic" href="#i-memo" x="96" y="170" width="24" height="24"/>
<text class="small" x="230" y="176">결과는 101이에요</text>
<text class="alert" x="230" y="198">두 번 올렸는데 하나만 늘었어요</text>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="0s" repeatCount="indefinite" path="M92,70 L162,70"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="0s" repeatCount="indefinite" path="M308,70 L238,70"/></circle>
</svg>
<p class="point">둘이 같은 숫자를 각자 읽고 고쳐 쓰면 한 사람의 수정이 사라져요.</p>
<p class="explain">1편처럼 학생은 앱이고 책상 위 메모는 Redis에 저장된 값이에요. 두 학생이 거의 같은 때에 메모를 보고 각자 머릿속에서 1을 더해요. 나중에 쓴 학생은 상대가 먼저 고친 것을 모르고 자기 계산대로 덮어써요.</p>
</section>

<section class="slide">
<h3>실제로는: 읽기와 쓰기 사이에 다른 요청이 끼어들어요</h3>
<table>
<thead><tr><th>순서</th><th>앱 서버 1 (학생 A)</th><th>앱 서버 2 (학생 B)</th><th>Redis의 값</th></tr></thead>
<tbody>
<tr><td>1</td><td>GET visits → 100</td><td></td><td>100</td></tr>
<tr><td>2</td><td></td><td>GET visits → 100</td><td>100</td></tr>
<tr><td>3</td><td>SET visits 101</td><td></td><td>101</td></tr>
<tr><td>4</td><td></td><td>SET visits 101</td><td>101 (하나가 사라졌어요)</td></tr>
</tbody>
</table>
<p class="point">앱이 값을 읽고 고쳐서 다시 쓰는 사이에 다른 요청이 끼어들면 수정 하나가 사라져요.</p>
<p class="explain">사용자가 많으면 같은 앱을 여러 컴퓨터(앱 서버)에서 함께 실행하고 이 앱들이 모두 같은 Redis를 써서 요청이 동시에 들어와요. GET은 키(여기서는 visits)의 값을 읽는 명령이고 SET은 값을 저장하는 명령으로 둘 다 앱 코드가 Redis에 보내요. 앱 서버 2는 2번에서 100을 읽은 뒤 4번에서 쓸 때까지 그사이 값이 101이 된 것을 몰라요. 이렇게 실행 순서에 따라 결과가 달라지는 상황을 경쟁 상태(race condition)라고 해요.</p>
</section>

<details class="origin">
<summary>더 알아보기: 왜 Redis 값에 모양을 붙였을까?</summary>
<p>Redis 공식 문서는 Redis를 <b>자료구조 서버(data structure server)</b>라고 소개해요. 값을 그냥 바이트 덩어리로만 두지 않고 목록이나 집합처럼 프로그래밍에서 익숙한 자료구조로 두고 그 모양에 맞는 명령을 제공한다는 뜻이에요.</p>
<p>공식 FAQ는 다른 키-값 저장소와 다른 점으로 값에 복잡한 자료형을 담을 수 있고 그 자료형마다 원자적인 명령이 정해져 있다는 것을 꼽아요. 이 글의 문제처럼 앱이 꺼내 고치지 않고 Redis 안에서 고치게 하려는 설계예요.</p>
<p>참고: <a href="https://redis.io/docs/latest/develop/data-types/">Redis 공식 문서: 자료형</a> · <a href="https://redis.io/docs/latest/develop/get-started/faq/">Redis 공식 문서: FAQ</a></p>
</details>
</div>

<div class="slide-group">
<h2 class="slide-group-title">문자열: 메모 한 장과 숫자 올리기</h2>

<section class="slide">
<h3>숫자는 관리인에게 올려 달라고 부탁해요</h3>
<svg class="dg" viewBox="0 0 400 215" role="img" aria-label="학생 A와 학생 B가 메모를 직접 고치지 않고 책상 관리인에게 하나 올려 주세요라고 부탁하고 관리인이 부탁을 하나씩 처리해서 메모가 100에서 101을 거쳐 102가 된다는 그림">
<defs><marker id="d2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M78,58 L164,88" marker-end="url(#d2)"/>
<path class="line" d="M78,142 L164,112" marker-end="url(#d2)"/>
<path class="line" d="M236,100 L298,100" marker-end="url(#d2)"/>
<circle class="box" cx="50" cy="50" r="26"/><use class="ic" href="#i-user" x="33" y="33" width="34" height="34"/>
<circle class="box" cx="50" cy="150" r="26"/><use class="ic" href="#i-user" x="33" y="133" width="34" height="34"/>
<circle class="kafka" cx="200" cy="100" r="34"/><use class="ic" href="#i-desk" x="178" y="78" width="44" height="44"/>
<circle class="kafka" cx="330" cy="100" r="28"/><use class="ic" href="#i-memo" x="312" y="82" width="36" height="36"/>
<text class="small" x="136" y="44">하나 올려 주세요</text>
<text class="small" x="136" y="168">하나 올려 주세요</text>
<text class="big" x="200" y="156">책상 관리인</text>
<text class="chip" x="330" y="150">100 → 101 → 102</text>
<text class="small" x="200" y="202">부탁을 한 번에 하나씩 처리해요</text>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="0s" repeatCount="indefinite" path="M78,58 L164,88"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="0.8s" repeatCount="indefinite" path="M78,142 L164,112"/></circle>
<circle class="packet" r="5"><animateMotion dur="0.8s" begin="0s" repeatCount="indefinite" path="M236,100 L298,100"/></circle>
</svg>
<p class="point">학생이 직접 고치지 않고 관리인에게 부탁하면 부탁이 하나씩 처리돼서 두 번 모두 반영돼요.</p>
<p class="explain">학생은 1편의 책상 관리인인 Redis에게 메모를 읽거나 계산하지 않고 무엇을 할지만 말해요. 두 부탁이 거의 동시에 와도 관리인은 하나를 끝낸 뒤 다음 것을 시작하니 앞의 결과 위에 더해요. 그래서 학생이 계산하는 사이에 끼어들 틈이 처음부터 없어요.</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>실제로는: INCR은 Redis 안에서 읽고 더하고 저장해요</h3>
<table>
<thead><tr><th>순서</th><th>누가</th><th>보내는 명령</th><th>Redis의 값</th></tr></thead>
<tbody>
<tr><td>1</td><td>앱 서버 1</td><td>INCR visits</td><td>101</td></tr>
<tr><td>2</td><td>앱 서버 2</td><td>INCR visits</td><td>102</td></tr>
</tbody>
</table>
<p class="point">INCR을 보내면 Redis가 읽기·더하기·저장을 명령 하나 안에서 끝내서 동시에 보내도 수정이 사라지지 않아요.</p>
<p class="explain">문자열(string)은 Redis의 가장 기본 자료형으로 키 하나에 값 하나를 담고 글자나 JSON(여러 항목을 글자 하나로 적는 형식)이나 이미지를 512MB까지 넣을 수 있어요. 값이 정수 모양이면 INCR 명령이 1을 더해 주고 키가 없으면 0에서 시작해요. Redis는 명령을 하나씩 차례로 실행해서 INCR 하나가 도는 중간에 다른 명령이 끼어들지 못하는데 이런 성질을 원자적(atomic)이라고 해요. 앞의 GET과 SET은 명령 두 개라서 그 사이에 다른 명령이 들어올 틈이 있었지만 INCR은 명령 하나라서 그런 틈이 없어요.</p>
<p>참고: <a href="https://redis.io/docs/latest/develop/data-types/strings/">Redis 공식 문서: 문자열</a> · <a href="https://redis.io/docs/latest/commands/incr/">Redis 공식 문서: INCR</a></p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 문자열인데 어떻게 숫자를 더하나요? "abc"에 INCR을 보내면요?</summary>
<p>A. Redis에는 숫자만 담는 자료형이 따로 없어요. 그래서 INCR은 문자열 값을 10진수 정수로 읽어서 1을 더하고 다시 저장해요. "100"처럼 정수로 읽히는 값만 되고 "abc"처럼 정수가 아닌 값이면 오류를 돌려줘요.</p>
</details>
<details class="author-question">
<summary>초보 독자 Q. GET이나 INCR 같은 명령은 누가 어디에 입력하나요?</summary>
<p>A. 서비스에서는 사람이 아니라 앱 코드가 보내요. 앱은 언어마다 있는 Redis 클라이언트 라이브러리를 써서 코드 한 줄로 INCR 같은 명령을 Redis에 보내고 결과를 받아요. 공부할 때는 redis-cli라는 프로그램을 열고 명령을 직접 쳐서 Redis가 어떻게 답하는지 볼 수도 있어요.</p>
</details>
</aside>
</div>
</div>

<div class="slide-group">
<h2 class="slide-group-title">모양: 책상 위 네 가지 정리 도구</h2>

<section class="slide">
<h3>메모 말고도 카드·줄·출석부·순위표를 써요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="책상 위 정리 도구 네 가지로 칸 나뉜 카드와 번호 붙은 줄과 이름을 한 번씩만 적는 출석부와 점수 순위표가 있다는 그림">
<rect class="line" x="10" y="10" width="380" height="230" rx="12"/>
<text class="label center" x="200" y="34">책상 위 정리 도구</text>
<circle class="kafka" cx="110" cy="84" r="28"/><use class="ic" href="#i-card" x="92" y="66" width="36" height="36"/>
<text class="chip" x="110" y="130">칸 나뉜 카드</text>
<circle class="kafka" cx="290" cy="84" r="28"/><use class="ic" href="#i-line" x="272" y="66" width="36" height="36"/>
<text class="chip" x="290" y="130">번호 붙은 줄</text>
<circle class="kafka" cx="110" cy="176" r="28"/><use class="ic" href="#i-roll" x="92" y="158" width="36" height="36"/>
<text class="chip" x="110" y="222">이름은 한 번씩 출석부</text>
<circle class="kafka" cx="290" cy="176" r="28"/><use class="ic" href="#i-trophy" x="272" y="158" width="36" height="36"/>
<text class="chip" x="290" y="222">점수 순위표</text>
</svg>
<p class="point">담을 내용의 모양에 맞는 도구를 쓰면 관리인이 그 안의 한 칸만 바로 고쳐 줄 수 있어요.</p>
<p class="explain">1편의 책상에는 책뿐 아니라 이런 정리 도구도 올려 둘 수 있어요. 학생은 도구를 통째로 들고 가서 고치지 않고 관리인에게 안의 한 칸만 바꿔 달라고 해요. 관리인은 도구마다 다루는 법을 알아서 "이 카드의 가격 칸만"이나 "줄 맨 앞에 하나" 같은 부탁도 알아들어요.</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>실제로는: 해시·리스트·셋·정렬된 셋</h3>
<table>
<thead><tr><th>자료형</th><th>모양</th><th>앱에서 쓰는 예</th><th>대표 명령</th></tr></thead>
<tbody>
<tr><td>해시(hash)</td><td>키 하나 안에 작은 이름표(필드)와 값 쌍이 여러 개</td><td>상품 정보(이름, 가격)</td><td>HSET, HGET, HINCRBY</td></tr>
<tr><td>리스트(list)</td><td>넣은 순서대로 선 줄</td><td>최근 본 상품, 처리할 작업 줄</td><td>LPUSH, RPUSH, LRANGE</td></tr>
<tr><td>셋(set)</td><td>순서 없이 중복 없는 모음</td><td>좋아요를 누른 사용자</td><td>SADD, SISMEMBER</td></tr>
<tr><td>정렬된 셋(sorted set)</td><td>점수 순서로 선 중복 없는 모음</td><td>실시간 인기 순위</td><td>ZADD, ZINCRBY, ZRANGE</td></tr>
</tbody>
</table>
<p class="point">Redis가 키 하나의 값이 어떤 모양인지 알아서 필드 하나나 항목 하나만 다루는 명령을 쓸 수 있어요.</p>
<p class="explain">자료형(data type)은 값이 어떤 모양인지를 뜻하고 해시는 칸 나뉜 카드, 리스트는 번호 붙은 줄, 셋은 출석부, 정렬된 셋은 순위표에 해당해요. 상품 정보를 JSON 문자열 하나로 두면 가격만 바꿀 때도 앱이 전체를 받아 고쳐서 다시 보내야 하지만 해시로 두면 HSET으로 가격 필드만 바꿔요. 명령 하나로 끝나는 수정이라 INCR처럼 중간에 다른 명령이 끼어들지 않아요. 표는 기본 자료형만 모았고 Redis에는 스트림 같은 자료형이 더 있어요.</p>
<p>참고: <a href="https://redis.io/docs/latest/develop/data-types/">Redis 공식 문서: 자료형</a> · <a href="https://redis.io/docs/latest/develop/data-types/hashes/">Redis 공식 문서: 해시</a></p>
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
<h3>순위표는 점수만 알려 주면 자리가 바뀌어요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="점수를 올리기 전 순위표는 A 30점 C 29점 B 25점이고 관리인에게 C에 2점 더해 달라고 하면 올린 뒤 순위표는 C 31점 A 30점 B 25점으로 자리가 바뀐다는 그림">
<defs><marker id="d3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="10" y="14" width="168" height="150" rx="12"/>
<text class="label center" x="94" y="38">올리기 전</text>
<rect class="box" x="26" y="54" width="136" height="28" rx="6"/><text class="chip" x="94" y="72">1등 A · 30점</text>
<rect class="box" x="26" y="90" width="136" height="28" rx="6"/><text class="chip" x="94" y="108">2등 C · 29점</text>
<rect class="box" x="26" y="126" width="136" height="28" rx="6"/><text class="chip" x="94" y="144">3등 B · 25점</text>
<path class="line" d="M182,104 L214,104" marker-end="url(#d3)"/>
<text class="small" x="198" y="92">C +2</text>
<rect class="line" x="222" y="14" width="168" height="150" rx="12"/>
<text class="label center" x="306" y="38">올린 뒤</text>
<rect class="kafka" x="238" y="54" width="136" height="28" rx="6"/><text class="chip" x="306" y="72">1등 C · 31점</text>
<rect class="box" x="238" y="90" width="136" height="28" rx="6"/><text class="chip" x="306" y="108">2등 A · 30점</text>
<rect class="box" x="238" y="126" width="136" height="28" rx="6"/><text class="chip" x="306" y="144">3등 B · 25점</text>
<text class="small" x="200" y="188">자리는 관리인이 다시 맞춰요</text>
</svg>
<p class="point">순위표에 점수만 알려 주면 관리인이 자리를 다시 맞춰서 언제 봐도 순서대로예요.</p>
<p class="explain">학생은 순위표를 직접 다시 쓰지 않고 점수만 바꿔 달라고 해요. 그래서 여러 학생이 동시에 점수를 올려도 표가 뒤섞이지 않아요. 누가 보든 위에서부터 몇 줄만 읽으면 1등부터 알 수 있어요.</p>
</section>

<section class="slide">
<h3>실제로는: 정렬된 셋은 점수 순서를 Redis가 유지해요</h3>
<table>
<thead><tr><th>누가</th><th>명령</th><th>하는 일</th></tr></thead>
<tbody>
<tr><td>앱 (사용자가 상품을 볼 때마다)</td><td>ZINCRBY popular 1 product:7</td><td>키 popular 안에서 멤버 product:7의 점수를 1 올려요. 처음 보는 상품이면 점수 1로 새로 넣어요</td></tr>
<tr><td>Redis</td><td>(따로 부탁하지 않아도)</td><td>점수 순서대로 자리를 맞춰 둬요</td></tr>
<tr><td>앱 (인기 목록 화면)</td><td>ZRANGE popular 0 9 REV</td><td>0번째부터 9번째까지 10개를 돌려주고 REV를 붙이면 점수가 높은 쪽부터 세요(REV는 Redis 6.2부터)</td></tr>
</tbody>
</table>
<p class="point">앱은 점수만 올리고 순서를 맞추는 일은 Redis가 해서 상위 몇 개를 바로 꺼낼 수 있어요.</p>
<p class="explain">정렬된 셋(sorted set)은 순위표에 오른 이름인 멤버(member)마다 점수(score)를 붙여 두고 점수 순서로 늘 정렬해 두는 자료형이에요. 같은 멤버는 하나만 있어서 다시 넣으면 새 줄이 생기지 않고 점수만 바뀌어요. 인기 순위를 이렇게 세면 앱이 DB에서 전부 세고 정렬하지 않아도 Redis에서 상위 10개를 바로 받아요.</p>
<p>참고: <a href="https://redis.io/docs/latest/develop/data-types/sorted-sets/">Redis 공식 문서: 정렬된 셋</a> · <a href="https://redis.io/docs/latest/commands/zincrby/">Redis 공식 문서: ZINCRBY</a> · <a href="https://redis.io/docs/latest/commands/zrange/">Redis 공식 문서: ZRANGE</a></p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">주의: 모양을 고를 때 헷갈리는 점</h2>

<section class="slide">
<h3>이럴 땐 조심해요: 자료형을 쓸 때 헷갈리는 네 가지</h3>
<table>
<thead><tr><th>상황</th><th>실제와 확인할 것</th></tr></thead>
<tbody>
<tr><td>문자열로 저장한 키에 리스트 명령을 보내요</td><td>키 하나의 값은 자료형이 하나뿐이라 모양이 다른 명령을 보내면 WRONGTYPE 오류가 나요. 같은 키는 처음 정한 자료형의 명령으로만 다뤄요</td></tr>
<tr><td>해시의 필드 하나에만 TTL을 걸고 싶어요</td><td>EXPIRE는 키 전체에 걸려서 필드 일부만 지우지 않아요. 필드별 만료는 Redis 7.4부터 HEXPIRE로 따로 지원해요</td></tr>
<tr><td>키 하나에 항목을 몇십만 개씩 몰아 담아요</td><td>전체를 한 번에 읽는 명령(리스트 처음부터 끝까지를 뜻하는 LRANGE key 0 -1 같은 명령)은 항목 수만큼 오래 걸리고 그동안 다른 명령은 기다려요. 필요한 범위만 읽거나 날짜별처럼 키를 나눠 담아요</td></tr>
<tr><td>방문 수나 순위를 Redis에서만 세요</td><td>1편의 캐시와 달리 이 값은 원본이 Redis뿐이라 퇴출되거나 재시작으로 사라지면 DB에서 다시 만들 수 없어요. 잃으면 안 되는 수는 DB에도 주기적으로 옮겨 적고 퇴출 정책과 지속성(RDB·AOF) 설정을 확인해요</td></tr>
</tbody>
</table>
<p class="point">키 하나에는 모양이 하나뿐이고 오래 걸리는 명령은 다른 요청을 붙잡으며 Redis에서만 센 값은 원본이 없다는 것을 기억해요.</p>
<p class="explain">Redis가 명령을 하나씩 처리하는 성질은 INCR을 안전하게 해 주지만 반대로 느린 명령 하나가 줄 전체를 막기도 해요. 예를 들어 항목이 50만 개인 리스트를 통째로 읽는 동안에는 짧은 GET 하나도 그 뒤에서 기다려요. 그래서 자주 보내는 명령은 LRANGE key 0 9처럼 정해진 범위만 다루게 골라요.</p>
<p>참고: <a href="https://redis.io/docs/latest/develop/data-types/hashes/">Redis 공식 문서: 해시 필드 만료</a> · <a href="https://redis.io/docs/latest/develop/get-started/faq/">Redis 공식 문서: FAQ</a></p>
</section>

<section class="slide">
<h3>한눈에 다시 보기: 이 글의 다섯 줄</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="문제는 값을 꺼내 고치고 다시 쓰면 수정이 사라지는 것이고 문자열은 INCR처럼 Redis가 그 자리에서 고치며 해시는 필드별로 고치는 칸 나뉜 카드이고 리스트와 셋은 순서대로 선 줄과 중복 없는 모음이며 정렬된 셋은 점수 순서를 Redis가 유지한다는 다섯 줄 요약 그림">
<circle class="bad" cx="30" cy="28" r="18"/><use class="ic" href="#i-memo" x="19" y="17" width="22" height="22"/>
<text class="label" x="62" y="19">문제</text><text class="small" x="62" y="38" style="text-anchor:start">꺼내 고치고 다시 쓰면 수정이 사라져요</text>
<circle class="kafka" cx="30" cy="76" r="18"/><use class="ic" href="#i-plus" x="19" y="65" width="22" height="22"/>
<text class="label" x="62" y="67">문자열</text><text class="small" x="62" y="86" style="text-anchor:start">INCR처럼 Redis가 그 자리에서 고쳐요</text>
<circle class="kafka" cx="30" cy="124" r="18"/><use class="ic" href="#i-card" x="19" y="113" width="22" height="22"/>
<text class="label" x="62" y="115">해시</text><text class="small" x="62" y="134" style="text-anchor:start">필드 하나만 고치는 칸 나뉜 카드</text>
<circle class="kafka" cx="30" cy="172" r="18"/><use class="ic" href="#i-line" x="19" y="161" width="22" height="22"/>
<text class="label" x="62" y="163">리스트와 셋</text><text class="small" x="62" y="182" style="text-anchor:start">순서대로 선 줄과 중복 없는 모음</text>
<circle class="kafka" cx="30" cy="220" r="18"/><use class="ic" href="#i-trophy" x="19" y="209" width="22" height="22"/>
<text class="label" x="62" y="211">정렬된 셋</text><text class="small" x="62" y="230" style="text-anchor:start">점수 순서를 Redis가 유지해요</text>
</svg>
<p class="point">값의 모양을 Redis에 맡기면 앱이 꺼내 고치지 않고 명령 하나로 안전하게 고칠 수 있어요.</p>
</section>
</div>

</div>
