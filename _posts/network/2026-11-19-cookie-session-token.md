---
layout: post
title: "서버는 로그인한 사람을 어떻게 알아볼까? 편지로 이해하는 쿠키·세션·토큰"
description: "HTTP가 요청 사이를 기억하지 않는데도 로그인이 이어지는 이유를 편지와 확인표 비유로 설명하고 쿠키(Set-Cookie·Cookie 헤더)와 세션 ID, JWT 토큰과 Authorization: Bearer의 차이, 세션 하이재킹과 HttpOnly·Secure·SameSite, XSS·CSRF, 인증과 인가까지 실제 동작으로 이어서 설명합니다."
date: 2026-11-19 21:00:00 +0900
series: network
episode: 2
summary: "서버는 로그인할 때 한 번만 확인하고 확인표를 건네요. 담당자가 장부에 적어 두고 번호표를 주면 세션이고 확인표에 도장을 찍어 주면 토큰이에요."
---

<div class="lesson lesson-hierarchy storybook">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: https://lucide.dev (lucide-static v1.25.0, ISC). 라이선스: assets/icons/LICENSE-lucide.txt. 이름 대응: i-check=circle-check, i-key=key-round, i-list=list-checks, i-book=book-open, i-mask=venetian-mask, i-badge=badge-check, i-trash=trash-2. rect·circle·line 요소는 같은 모양의 path로 옮겼어요. -->
<symbol id="i-mail" viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 7l-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/></symbol>
<symbol id="i-laptop" viewBox="0 0 24 24"><path d="M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2zM20.054 15.987H3.946"/></symbol>
<symbol id="i-server" viewBox="0 0 24 24"><path d="M4 2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM4 14h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2zM6 6h.01M6 18h.01"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0zM9 12l2 2 4-4"/></symbol>
<symbol id="i-key" viewBox="0 0 24 24"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4zM16.5 7.5h.01"/></symbol>
<symbol id="i-list" viewBox="0 0 24 24"><path d="M13 5h8M13 12h8M13 19h8M3 17l2 2 4-4M3 7l2 2 4-4"/></symbol>
<symbol id="i-lock" viewBox="0 0 24 24"><path d="M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM7 11V7a5 5 0 0 1 10 0v4"/></symbol>
<symbol id="i-ticket" viewBox="0 0 24 24"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2ZM13 5v2M13 17v2M13 11v2"/></symbol>
<symbol id="i-book" viewBox="0 0 24 24"><path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></symbol>
<symbol id="i-stamp" viewBox="0 0 24 24"><path d="M14 13V8.5C14 7 15 7 15 5a3 3 0 0 0-6 0c0 2 1 2 1 3.5V13M20 15.5a2.5 2.5 0 0 0-2.5-2.5h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1zM5 22h14"/></symbol>
<symbol id="i-badge" viewBox="0 0 24 24"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76ZM9 12l2 2 4-4"/></symbol>
<symbol id="i-trash" viewBox="0 0 24 24"><path d="M10 11v6M14 11v6M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></symbol>
<symbol id="i-clock" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0zM12 6v6l4 2"/></symbol>
</defs>
</svg>

<div class="slide-group">
<h2 class="slide-group-title">문제: 비밀번호를 편지마다 맡기기는 위험해요</h2>

<div class="slide-with-question">
<section class="slide">
<h3>비밀번호를 자주 보내면 샐 기회도 늘어요</h3>
<svg class="dg" viewBox="0 0 400 240" role="img" aria-label="클라이언트가 GET /orders, GET /profile, POST /cart 요청을 보낼 때마다 비밀번호를 붙여 서버로 보내는 순서 그림">
<defs><marker id="n2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line dash" d="M60,92 L60,232"/>
<path class="line dash" d="M340,92 L340,232"/>
<path class="line" d="M64,110 L334,110" marker-end="url(#n2)"/>
<path class="line" d="M64,160 L334,160" marker-end="url(#n2)"/>
<path class="line" d="M64,210 L334,210" marker-end="url(#n2)"/>
<circle class="box" cx="60" cy="40" r="28"/><use class="ic" href="#i-laptop" x="44" y="24" width="32" height="32"/>
<circle class="box" cx="340" cy="40" r="28"/><use class="ic" href="#i-server" x="324" y="24" width="32" height="32"/>
<text class="chip" x="60" y="80">클라이언트</text><text class="chip" x="340" y="80">서버</text>
<rect class="bad" x="106" y="84" width="188" height="24" rx="5"/><text class="chip mono" x="200" y="96">주문 목록 + 비밀번호</text>
<rect class="bad" x="106" y="134" width="188" height="24" rx="5"/><text class="chip mono" x="200" y="146">내 정보 + 비밀번호</text>
<rect class="bad" x="106" y="184" width="188" height="24" rx="5"/><text class="chip mono" x="200" y="196">장바구니 + 비밀번호</text>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="0s" repeatCount="indefinite" path="M64,110 L334,110"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="0.8s" repeatCount="indefinite" path="M64,160 L334,160"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="1.6s" repeatCount="indefinite" path="M64,210 L334,210"/></circle>
</svg>
<ol class="steps">
<li>새 편지만 보면 누가 보냈는지 알 수 없어요</li>
<li>비밀번호가 새면 바꾸기 전까지 다시 쓸 수 있어요</li>
</ol>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 요즘은 HTTPS를 쓰니 길목에서 엿볼 수 없지 않나요?</summary>
<p>A. HTTPS는 오가는 내용을 암호화해서 길목에서 엿보기 어렵게 해 줘요. 그래도 요청마다 비밀번호를 보내면 앱이 비밀번호를 계속 들고 있어야 하고 서버도 매번 대조해야 해요. 확인표는 기한이 지나거나 서버가 지우면 쓸모가 없어지지만 비밀번호는 바꾸기 전까지 계속 통해서 한 번 새면 피해가 더 오래가요.</p>
</details>
</aside>
</div>

<section class="slide">
<h3>한 번 신원을 확인하고 확인표를 받아요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="클라이언트가 POST /login 요청에 비밀번호를 담아 보내면 서버가 응답에 확인표를 담아 돌려주고 확인표를 만드는 방식에는 서버 저장소에서 찾는 세션 ID와 서명을 검증하는 토큰 두 가지가 있다는 그림">
<defs><marker id="n4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M94,46 L302,46" marker-end="url(#n4)"/>
<path class="line" d="M306,68 L98,68" marker-end="url(#n4)"/>
<circle class="box" cx="60" cy="56" r="30"/><use class="ic" href="#i-laptop" x="42" y="38" width="36" height="36"/>
<circle class="box" cx="340" cy="56" r="30"/><use class="ic" href="#i-server" x="322" y="38" width="36" height="36"/>
<text class="chip" x="60" y="104">클라이언트</text><text class="chip" x="340" y="104">서버</text>
<rect class="bad" x="104" y="16" width="192" height="22" rx="5"/><text class="chip mono" x="200" y="27">POST /login + 비밀번호</text>
<rect class="new" x="130" y="76" width="140" height="22" rx="5"/><text class="chip" x="200" y="87">응답 + 확인표</text>
<rect class="line" x="10" y="122" width="380" height="120" rx="12"/>
<text class="label center" x="200" y="142">담당자가 확인표를 읽는 방법</text>
<circle class="new" cx="110" cy="182" r="20"/><use class="ic" href="#i-ticket" x="97" y="169" width="26" height="26"/>
<text class="chip" x="110" y="216">세션 ID</text><text class="small" x="110" y="234">장부 조회</text>
<circle class="new" cx="290" cy="182" r="20"/><use class="ic" href="#i-stamp" x="277" y="169" width="26" height="26"/>
<text class="chip" x="290" y="216">서명표(JWT)</text><text class="small" x="290" y="234">도장 확인</text>
<circle class="packet" r="5"><animateMotion dur="3.2s" repeatCount="indefinite" path="M94,46 L306,46 L306,68 L98,68"/></circle>
</svg>
<ol class="steps">
<li>로그인할 때만 비밀번호를 확인해요</li>
<li>다음 편지에는 기한을 둔 확인표를 붙여요</li>
</ol>
</section>

<details class="origin">
<summary>더 알아보기: 누가 왜 만들었을까?</summary>
<p>쿠키는 <b>1994년 가을</b> Netscape 브라우저에 처음 들어갔어요. 만든 사람은 당시 Netscape에서 일하던 <b>루 몬툴리(Lou Montulli)</b>예요.</p>
<p>온라인 쇼핑몰이 장바구니를 만들려면 손님이 페이지를 옮겨 다니는 동안 무엇을 담았는지 이어서 알아야 했는데 HTTP는 요청 사이를 기억하지 않았어요. 몬툴리는 서버가 작은 기록을 브라우저에 맡겨 두고 다음 요청 때 돌려받는 방법을 만들었어요. 이름은 대학 운영체제 수업에서 배운 "magic cookie"에서 가져왔다고 2013년 자신의 블로그에 썼어요.</p>
<p>표준 문서는 1997년 2월 RFC 2109에서 시작해 RFC 2965를 거쳐 2011년 4월 애덤 바스(Adam Barth)가 쓴 RFC 6265로 이어졌어요. 쿠키는 지금도 로그인 말고도 언어 설정 같은 것을 기억하는 데 쓰이고 이 글은 로그인을 이어 가는 쓰임만 봐요.</p>
<p>참고: <a href="http://montulli.blogspot.com/2013/05/the-reasoning-behind-web-cookies.html">Lou Montulli: The reasoning behind Web Cookies</a> · <a href="https://www.rfc-editor.org/rfc/rfc6265">RFC 6265 HTTP State Management Mechanism</a> · <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies">MDN: HTTP 쿠키</a></p>
</details>
</div>

<div class="slide-group">
<h2 class="slide-group-title">번호표: 장부에서 주인을 찾아요</h2>

<div class="slide-with-question">
<section class="slide">
<h3>번호표로 서버 장부에서 주인을 찾아요</h3>
<svg class="dg" viewBox="0 0 400 240" role="img" aria-label="클라이언트는 8f3kq9로 시작하는 세션 ID만 들고 요청에 담아 보내고 서버는 세션 저장소에서 그 ID가 민지이고 로그인했다는 줄을 찾아 민지의 주문 목록을 응답하는 그림">
<defs><marker id="n6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M92,40 L306,40" marker-end="url(#n6)"/>
<path class="line" d="M306,64 L92,64" marker-end="url(#n6)"/>
<circle class="box" cx="60" cy="52" r="28"/><use class="ic" href="#i-laptop" x="44" y="36" width="32" height="32"/>
<circle class="box" cx="340" cy="52" r="28"/><use class="ic" href="#i-server" x="324" y="36" width="32" height="32"/>
<text class="chip" x="199" y="24">요청 + 세션 ID</text>
<text class="chip" x="199" y="82">민지의 주문 목록</text>
<text class="chip" x="60" y="96">클라이언트</text><text class="chip" x="340" y="96">서버</text>
<rect class="new" x="14" y="116" width="92" height="26" rx="5"/><text class="chip mono" x="60" y="129">8f3kq9…</text>
<text class="small" x="60" y="160">ID만 들고 있어요</text>
<rect class="line" x="170" y="112" width="220" height="118" rx="12"/>
<text class="label center" x="280" y="132">서버의 세션 저장소</text>
<rect class="kafka" x="180" y="150" width="200" height="26" rx="5"/>
<text class="chip mono" x="190" y="163" style="text-anchor:start">8f3kq9…</text><text class="chip" x="262" y="163" style="text-anchor:start">민지 · 로그인함</text>
<text class="chip mono" x="190" y="199" style="text-anchor:start">p2xm7a…</text><text class="chip" x="262" y="199" style="text-anchor:start">서준 · 로그인함</text>
<circle class="packet" r="5"><animateMotion dur="3.2s" repeatCount="indefinite" path="M92,40 L306,40 L306,64 L92,64"/></circle>
</svg>
<ol class="steps">
<li>담당자는 로그인 기록(세션)을 저장해요</li>
<li>무작위 번호(세션 ID)를 건네요 (예시)</li>
<li>다음 요청에서 번호와 맞는 기록을 찾아요</li>
</ol>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 세션 저장소는 구체적으로 어떤 건가요?</summary>
<p>A. 서버가 세션 ID와 사용자 정보를 짝지어 두는 곳이에요. 서버 프로그램의 메모리나 데이터베이스에 두기도 하고 빠르게 읽고 쓰려고 Redis 같은 캐시를 쓰기도 해요. 어디에 두든 서버가 ID로 사용자를 찾아본다는 흐름은 같아요.</p>
</details>
</aside>
</div>

<div class="slide-with-question">
<section class="slide">
<h3>브라우저가 다음 편지에 번호표를 붙여요</h3>
<svg class="dg" viewBox="0 0 400 246" role="img" aria-label="브라우저가 POST /login을 보내면 서버가 Set-Cookie 헤더에 세션 ID를 담아 응답하고 브라우저는 그것을 쿠키로 보관했다가 다음 GET /orders 요청의 Cookie 헤더에 붙여 보내는 순서 그림">
<defs><marker id="n7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line dash" d="M60,92 L60,236"/>
<path class="line dash" d="M340,92 L340,236"/>
<path class="line" d="M64,110 L334,110" marker-end="url(#n7)"/>
<path class="line" d="M336,166 L66,166" marker-end="url(#n7)"/>
<path class="line" d="M64,216 L334,216" marker-end="url(#n7)"/>
<circle class="box" cx="60" cy="40" r="28"/><use class="ic" href="#i-laptop" x="44" y="24" width="32" height="32"/>
<circle class="box" cx="340" cy="40" r="28"/><use class="ic" href="#i-server" x="324" y="24" width="32" height="32"/>
<text class="chip" x="60" y="80">브라우저</text><text class="chip" x="340" y="80">서버</text>
<text class="chip mono" x="200" y="96">POST /login</text>
<rect class="new" x="90" y="134" width="220" height="24" rx="5"/><text class="chip mono" x="200" y="146">Set-Cookie: sid=8f3kq9…</text>
<circle class="new" cx="60" cy="192" r="15"/><use class="ic" href="#i-ticket" x="51" y="183" width="18" height="18"/>
<text class="small" x="22" y="192">보관</text>
<rect class="new" x="104" y="184" width="192" height="24" rx="5"/><text class="chip mono" x="200" y="196">Cookie: sid=8f3kq9…</text>
<text class="small mono" x="200" y="234">GET /orders</text>
<circle class="packet" r="5"><animateMotion dur="4.8s" repeatCount="indefinite" path="M64,110 L340,110 L340,166 L60,166 L60,216 L334,216"/></circle>
</svg>
<ol class="steps">
<li>서버가 Set-Cookie로 번호표를 맡겨요</li>
<li>브라우저는 주소와 속성이 맞으면 Cookie로 보내요</li>
<li>쿠키에는 번호표 외에 다른 값도 담을 수 있어요</li>
</ol>
</section>
<aside class="author-questions" aria-label="질문 목록">
<details class="author-question">
<summary>Q. 쿠키로 세션 ID를 보관하면 비밀번호를 넣는 것과 똑같은 것 아닌가요?</summary>
<p>A. 반은 맞아요. 세션 ID를 훔친 사람은 그 사용자인 척할 수 있어서 훔친 순간에는 비밀번호만큼 위험해요. 다른 점은 세션 ID가 로그인할 때마다 서버가 새로 만든 무작위 값이라는 거예요. 로그아웃하거나 만료돼서 서버가 지우면 바로 쓸모없어지고 비밀번호에 대한 정보도 들어 있지 않아요. 비밀번호는 내가 바꾸기 전까지 계속 통하고 다른 사이트에서 같은 비밀번호를 썼다면 그쪽까지 위험해져요. 저장 위치도 달라서 쿠키에는 세션 ID만 있고 누구인지 같은 사용자 정보는 서버의 세션 저장소에 따로 있어요.</p>
</details>
<details class="author-question">
<summary>초보 독자 Q. 쿠키는 내 컴퓨터 어디에 저장되고 내가 볼 수도 있나요?</summary>
<p>A. 브라우저가 사용하는 사람의 컴퓨터나 휴대폰에 저장해요. 브라우저의 개발자 도구(보통 F12 키)에서 사이트별 쿠키 목록을 볼 수 있어요. SameSite를 생략하면 일부 브라우저는 Lax처럼 다뤄요.</p>
</details>
</aside>
</div>

</div>

<div class="slide-group">
<h2 class="slide-group-title">서명: 도장을 확인해 발급한 쪽을 알아봐요</h2>

<div class="slide-with-question">
<section class="slide">
<h3>서버는 도장을 보고 위조된 표를 가려요</h3>
<svg class="dg" viewBox="0 0 400 230" role="img" aria-label="그림의 예시처럼 서명만 한 JWT는 헤더와 페이로드와 서명 세 부분을 점으로 이은 문자열이고 헤더는 서명 방식, 페이로드는 누구인지와 만료 시각, 서명은 위조 확인용이며 확인표의 내용 (예시) sub와 exp가 보여서 누구나 읽을 수 있으니 비밀번호는 넣지 않는다는 그림">
<rect class="box" x="10" y="24" width="112" height="36" rx="5"/><text class="chip mono" x="66" y="42">eyJhbGci…</text>
<text class="big" x="130" y="42">.</text>
<rect class="box" x="138" y="24" width="112" height="36" rx="5"/><text class="chip mono" x="194" y="42">eyJzdWIi…</text>
<text class="big" x="258" y="42">.</text>
<rect class="kafka" x="266" y="24" width="124" height="36" rx="5"/><text class="chip mono" x="328" y="42">SflKxwRJ…</text>
<text class="chip" x="66" y="78">헤더</text><text class="chip" x="194" y="78">페이로드</text><text class="chip" x="328" y="78">서명</text>
<text class="small" x="66" y="98">서명 방식</text><text class="small" x="194" y="98">누구 · 만료 시각</text><text class="small" x="328" y="98">위조 확인용</text>
<rect class="line" x="10" y="118" width="380" height="102" rx="12"/>
<text class="label center" x="200" y="138">확인표의 내용 (예시)</text>
<text class="chip mono" x="200" y="170">{"sub": "7", "exp": …}</text>
<text class="alert" x="200" y="200">누구나 읽으니 비밀번호는 넣지 않아요</text>
</svg>
<ol class="steps">
<li>서명만 한 확인표(JWT)는 세 칸이에요 (예시)</li>
<li>서명은 내용을 숨기지 않아 누구나 읽을 수 있어요</li>
<li>서버는 서명·발급자·받는 곳·기한을 확인해요</li>
</ol>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 서명은 어떻게 만들고 검증하나요?</summary>
<p>A. 예를 들어 서버는 헤더와 페이로드 내용에 서버만 아는 비밀 키를 섞어 서명 값을 계산해 붙여요. 다음 요청에서 같은 계산을 다시 해 값이 같으면 내용이 그대로인 것이고 한 글자라도 고쳐졌다면 값이 달라져요. 비밀 키를 모르는 사람은 맞는 서명을 만들 수 없어요. 서명은 비밀 키로 만들고 공개 키로 검증하는 방식도 있어요.</p>
</details>
</aside>
</div>

<section class="slide">
<h3>앱이 편지에 직접 확인표를 붙이기도 해요</h3>
<svg class="dg" viewBox="0 0 400 214" role="img" aria-label="위쪽은 브라우저가 조건에 맞으면 Cookie 헤더에 세션 ID를 알아서 붙여 서버로 보내고 아래쪽은 앱 코드가 Authorization: Bearer 헤더에 토큰을 직접 넣어 서버로 보내는 비교 그림">
<defs><marker id="n9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M74,60 L300,60" marker-end="url(#n9)"/>
<path class="line" d="M74,160 L300,160" marker-end="url(#n9)"/>
<circle class="box" cx="44" cy="60" r="26"/><use class="ic" href="#i-laptop" x="28" y="44" width="32" height="32"/>
<text class="chip" x="44" y="102">브라우저</text>
<circle class="box" cx="330" cy="60" r="26"/><use class="ic" href="#i-server" x="314" y="44" width="32" height="32"/>
<text class="chip" x="330" y="102">서버</text>
<rect class="new" x="88" y="28" width="198" height="24" rx="5"/><text class="chip mono" x="187" y="40">Cookie: sid=8f3kq9…</text>
<text class="small" x="187" y="80">브라우저 자동 전송</text>
<circle class="kafka" cx="44" cy="160" r="26"/><use class="ic" href="#i-laptop" x="28" y="144" width="32" height="32"/>
<text class="chip" x="44" y="202">앱 코드</text>
<circle class="box" cx="330" cy="160" r="26"/><use class="ic" href="#i-server" x="314" y="144" width="32" height="32"/>
<text class="chip" x="330" y="202">서버</text>
<rect class="new" x="76" y="128" width="222" height="24" rx="5"/><text class="chip mono" x="187" y="140">Authorization: Bearer eyJ…</text>
<text class="small" x="187" y="180">앱이 직접 전송</text>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0s" repeatCount="indefinite" path="M74,60 L300,60"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.7s" repeatCount="indefinite" path="M74,160 L300,160"/></circle>
</svg>
<ol class="steps">
<li>Authorization 헤더에 Bearer와 토큰을 넣어요</li>
<li>가진 사람이 쓸 수 있어 HTTPS로 보내요</li>
<li>주소(URL)에는 적지 않고 쿠키에 담을 수도 있어요</li>
</ol>
</section>

<section class="slide">
<h3>로그아웃할 때 두 확인표의 차이가 보여요</h3>
<svg class="dg" viewBox="0 0 400 195" role="img" aria-label="로그아웃할 때 두 확인표의 차이가 보여요. 서버 장부에서 세션을 지우면 번호표는 바로 효력을 잃어요. 별도 취소 기록이 없는 서명표는 만료될 때까지 유효해요.">
<rect class="line" x="4" y="6" width="192" height="180" rx="12"/><text class="label center" x="100" y="34">서버 장부</text>
<circle class="box" cx="100" cy="82" r="30"/><use class="ic" href="#i-book" x="79" y="61" width="42" height="42"/>
<text class="chip" x="100" y="140">세션 ID로 조회</text><text class="small" x="100" y="164">장부에서 지우면 끝</text>
<rect class="line" x="202" y="6" width="192" height="180" rx="12"/><text class="label center" x="298" y="34">서명표</text>
<circle class="new" cx="298" cy="82" r="30"/><use class="ic" href="#i-stamp" x="277" y="61" width="42" height="42"/>
<text class="chip" x="298" y="140">서명과 만료 확인</text><text class="small" x="298" y="164">기한까지 유효</text>
</svg>
<ol class="steps">
<li>번호표는 서버가 장부에서 지우면 바로 끝나요</li>
<li>서명표는 만료 전에 거두려면 별도 기록이 필요해요</li>
<li>유효기간을 줄이면 훔친 표를 쓸 시간도 줄어요</li>
</ol>
</section>

</div>

<div class="slide-group">
<h2 class="slide-group-title">보호: 새어 나간 확인표는 남도 쓸 수 있어요</h2>

<section class="slide">
<h3>번호표만 복사해도 남이 쓸 수 있어요</h3>
<svg class="dg" viewBox="0 0 400 226" role="img" aria-label="공격자가 훔친 세션 ID를 Cookie 헤더에 넣어 서버에 보내자 서버가 200과 함께 민지의 주문 목록을 돌려주고 그래서 서버는 로그아웃 때 세션을 지우고 토큰의 만료 시각을 짧게 잡는다는 그림">
<defs><marker id="n11" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M82,44 L306,44" marker-end="url(#n11)"/>
<path class="line" d="M306,68 L82,68" marker-end="url(#n11)"/>
<circle class="bad" cx="50" cy="56" r="28"/><use class="ic" href="#i-laptop" x="34" y="40" width="32" height="32"/>
<text class="chip" x="50" y="100">공격자</text>
<circle class="box" cx="340" cy="56" r="28"/><use class="ic" href="#i-server" x="324" y="40" width="32" height="32"/>
<text class="chip" x="340" y="100">서버</text>
<rect class="bad" x="96" y="14" width="200" height="24" rx="5"/><text class="chip mono" x="196" y="26">Cookie: sid=8f3kq9…</text>
<text class="chip" x="196" y="86">200 · 민지의 주문 목록</text>
<rect class="line" x="10" y="118" width="380" height="100" rx="12"/>
<text class="label center" x="200" y="138">그래서 서버는</text>
<circle class="kafka" cx="40" cy="168" r="14"/><use class="ic" href="#i-trash" x="31" y="159" width="18" height="18"/>
<text class="chip" x="64" y="168" style="text-anchor:start">로그아웃 때 세션 삭제</text>
<circle class="kafka" cx="40" cy="198" r="14"/><use class="ic" href="#i-clock" x="31" y="189" width="18" height="18"/>
<text class="chip" x="64" y="198" style="text-anchor:start">짧은 토큰 유효기간</text>
<circle class="packet" r="5"><animateMotion dur="3.2s" repeatCount="indefinite" path="M82,44 L306,44 L306,68 L82,68"/></circle>
</svg>
<ol class="steps">
<li>남의 표로 로그인 행세를 하면 세션 하이재킹이에요</li>
<li>서버는 로그인할 때 새 번호표를 발급해요</li>
</ol>
<p class="more"><a href="{{ '/2026/11/20/https-tls/' | relative_url }}">길목에서 확인표를 보호하는 HTTPS</a></p>
</section>

<section class="slide">
<h3>쿠키 봉투에는 보낼 조건을 적어요</h3>
<svg class="dg" viewBox="0 0 400 205" role="img" aria-label="쿠키 봉투에는 보낼 조건을 적어요. HttpOnly — 스크립트의 값 읽기 차단. Secure — HTTPS로 전송. SameSite — Strict · Lax · None + Secure. Max-Age / Expires — 보관 기한">
<rect class="kafka" x="10" y="9" width="380" height="39" rx="8"/><text class="chip" x="25" y="29" style="text-anchor:start">HttpOnly</text><text class="chip" x="376" y="29" style="text-anchor:end">스크립트의 값 읽기 차단</text>
<rect class="box" x="10" y="54" width="380" height="39" rx="8"/><text class="chip" x="25" y="74" style="text-anchor:start">Secure</text><text class="chip" x="376" y="74" style="text-anchor:end">HTTPS로 전송</text>
<rect class="box" x="10" y="99" width="380" height="39" rx="8"/><text class="chip" x="25" y="119" style="text-anchor:start">SameSite</text><text class="chip" x="376" y="119" style="text-anchor:end">Strict · Lax · None + Secure</text>
<rect class="box" x="10" y="144" width="380" height="39" rx="8"/><text class="chip" x="25" y="164" style="text-anchor:start">Max-Age / Expires</text><text class="chip" x="376" y="164" style="text-anchor:end">보관 기한</text>
</svg>
<ol class="steps">
<li>Lax는 외부 링크로 페이지를 열 때도 쿠키를 붙여요</li>
<li>Strict는 다른 사이트에서 오는 편지에 붙이지 않아요</li>
<li>기한 없는 쿠키도 창을 복원하면 남을 수 있어요</li>
</ol>
<p class="more">참고: <a href="https://www.rfc-editor.org/rfc/rfc6265">RFC 6265</a> · <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies">MDN: HTTP 쿠키</a> · <a href="https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html">OWASP Session Management Cheat Sheet</a></p>
</section>

<section class="slide">
<h3>확인표를 두는 장소에 따라 위험이 달라요</h3>
<svg class="dg" viewBox="0 0 400 195" role="img" aria-label="확인표를 두는 장소에 따라 위험이 달라요. 사이트 저장소 localStorage 악성 스크립트도 읽어요. HttpOnly 쿠키 브라우저가 붙여요 다른 사이트의 요청">
<rect class="line" x="4" y="6" width="192" height="180" rx="12"/><text class="label center" x="100" y="34">사이트 저장소</text>
<circle class="box" cx="100" cy="82" r="30"/><use class="ic" href="#i-key" x="79" y="61" width="42" height="42"/>
<text class="chip" x="100" y="140">localStorage</text><text class="small" x="100" y="164">악성 스크립트도 읽어요</text>
<rect class="line" x="202" y="6" width="192" height="180" rx="12"/><text class="label center" x="298" y="34">HttpOnly 쿠키</text>
<circle class="new" cx="298" cy="82" r="30"/><use class="ic" href="#i-lock" x="277" y="61" width="42" height="42"/>
<text class="chip" x="298" y="140">브라우저가 붙여요</text><text class="small" x="298" y="164">다른 사이트의 요청</text>
</svg>
<ol class="steps">
<li>악성 코드가 실행되면(XSS) 저장된 표가 새요</li>
<li>HttpOnly 쿠키도 스크립트가 요청하는 일은 못 막아요</li>
<li>남이 시킨 요청(CSRF)은 서버가 따로 가려요</li>
</ol>
<p class="more">참고: <a href="https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html">OWASP HTML5 Security Cheat Sheet</a> · <a href="https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html">OWASP CSRF Prevention Cheat Sheet</a> · <a href="https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html">OWASP JWT Cheat Sheet</a> · <a href="https://www.rfc-editor.org/rfc/rfc7519">RFC 7519 JWT</a> · <a href="https://www.rfc-editor.org/rfc/rfc6750">RFC 6750 Bearer Token</a></p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>누구인지 알아도 모든 일을 맡기지는 않아요</h3>
<svg class="dg" viewBox="0 0 400 232" role="img" aria-label="요청이 먼저 누구인지 확인하는 인증을 지나고 다음으로 그 일을 해도 되는지 확인하는 인가를 지나야 답장을 받으며 인증에서 막히면 401로 로그인부터 다시 하고 인가에서 막히면 403으로 그 일을 할 권한이 없다는 그림">
<defs><marker id="n12" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M66,70 L118,70" marker-end="url(#n12)"/>
<path class="line" d="M182,70 L228,70" marker-end="url(#n12)"/>
<path class="line" d="M292,70 L334,70" marker-end="url(#n12)"/>
<path class="line" d="M150,152 L150,180" marker-end="url(#n12)"/>
<path class="line" d="M260,152 L260,180" marker-end="url(#n12)"/>
<circle class="box" cx="40" cy="70" r="24"/><use class="ic" href="#i-mail" x="27" y="57" width="26" height="26"/>
<text class="chip" x="40" y="110">요청</text>
<circle class="kafka" cx="150" cy="70" r="30"/><use class="ic" href="#i-badge" x="132" y="52" width="36" height="36"/>
<text class="big" x="150" y="122">인증</text><text class="small" x="150" y="142">누구인지</text>
<circle class="kafka" cx="260" cy="70" r="30"/><use class="ic" href="#i-list" x="242" y="52" width="36" height="36"/>
<text class="big" x="260" y="122">인가</text><text class="small" x="260" y="142">해도 되는 일인지</text>
<circle class="kafka" cx="360" cy="70" r="24"/><use class="ic" href="#i-check" x="347" y="57" width="26" height="26"/>
<text class="chip" x="360" y="110">답장</text>
<rect class="bad" x="112" y="182" width="76" height="26" rx="5"/><text class="chip mono" x="150" y="195">401</text>
<rect class="bad" x="222" y="182" width="76" height="26" rx="5"/><text class="chip mono" x="260" y="195">403</text>
<text class="small" x="150" y="222">로그인부터 다시</text><text class="small" x="260" y="222">그 일은 권한 없음</text>
<circle class="packet" r="5"><animateMotion dur="2s" begin="0s" repeatCount="indefinite" path="M66,70 L334,70"/></circle>
</svg>
<ol class="steps">
<li>신원 확인(인증)은 누가 요청했는지 밝혀요</li>
<li>권한 확인(인가)은 이 사람이 해도 될지 판단해요</li>
</ol>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 앱에서 로그인이 자꾸 풀리거나 401이 나오면 어디를 봐야 하나요?</summary>
<p>A. 세션 방식이면 서버가 그 세션을 지웠거나 만료됐는지와 요청에 쿠키가 붙었는지를 봐요. 토큰 방식이면 만료 시각이 지났는지와 요청에 Authorization 헤더가 붙었는지를 봐요. 요청에 무엇이 붙었는지는 브라우저 개발자 도구의 네트워크 탭에서 볼 수 있어요.</p>
</details>
</aside>
</div>

</div>

</div>
