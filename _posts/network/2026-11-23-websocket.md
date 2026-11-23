---
layout: post
title: "채팅 앱은 새 메시지를 어떻게 바로 받을까? 편지와 전화로 이해하는 WebSocket"
description: "그림으로 보는 WebSocket: HTTP만으로는 서버가 먼저 알릴 수 없는 이유, 폴링과 롱 폴링의 한계, 웹소켓이 첫 요청으로 연결을 바꾸고 양쪽이 아무 때나 말하는 방법, SSE와의 차이, 언제 쓰고 무엇을 조심하는지를 동화책처럼 설명합니다."
date: 2026-11-23 00:10:00 +0900
series: network
episode: 6
automation: daily-writing
summary: "HTTP는 내가 편지를 보내야 답장이 오는 방식이라 서버가 먼저 알릴 수 없어요. 웹소켓은 첫 편지로 전화로 바꾸자고 한 뒤 연결을 끊지 않아 서버와 내가 아무 때나 말해요."
---

<div class="lesson lesson-hierarchy storybook">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: https://cdn.jsdelivr.net/npm/lucide-static@1.25.0/icons/ (ISC). 라이선스: assets/icons/LICENSE-lucide.txt. i-check=circle-check, i-x=circle-x. -->
<symbol id="i-user-round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></symbol>
<symbol id="i-server" viewBox="0 0 24 24"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></symbol>
<symbol id="i-mail" viewBox="0 0 24 24"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></symbol>
<symbol id="i-phone" viewBox="0 0 24 24"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/></symbol>
<symbol id="i-message-circle" viewBox="0 0 24 24"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/></symbol>
<symbol id="i-hourglass" viewBox="0 0 24 24"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></symbol>
<symbol id="i-unplug" viewBox="0 0 24 24"><path d="m19 5 3-3"/><path d="m2 22 3-3"/><path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"/><path d="M7.5 13.5 10 11"/><path d="M10.5 16.5 13 14"/><path d="m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z"/></symbol>
<symbol id="i-shield-alert" viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/></symbol>
<symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></symbol>
<symbol id="i-x" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></symbol>
</defs>
</svg>

<div class="slide-group">
<h2 class="slide-group-title">문제: 편지는 내가 보내야 답장이 와요</h2>

<section class="slide">
<h3>답장 담당자는 먼저 편지를 못 보내요</h3>
<svg class="dg" viewBox="0 0 400 230" role="img" aria-label="친구가 보낸 새 메시지가 답장 담당자(서버)에 도착했지만 담당자는 나(클라이언트)에게 먼저 편지를 보낼 수 없어 화살표가 막혀 있는 그림">
<defs><marker id="ws1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line dash" d="M286,116 L116,116" marker-end="url(#ws1)"/>
<circle class="bad" cx="200" cy="116" r="18"/><use class="ic" href="#i-x" x="188" y="104" width="24" height="24"/>
<text class="alert" x="200" y="154">먼저 못 보내요</text>
<circle class="box" cx="70" cy="116" r="40"/><use class="ic" href="#i-user-round" x="46" y="92" width="48" height="48"/>
<text class="big" x="70" y="180">나</text><text class="small" x="70" y="200">클라이언트</text>
<circle class="box" cx="330" cy="116" r="40"/><use class="ic" href="#i-server" x="306" y="92" width="48" height="48"/>
<text class="big" x="330" y="180">답장 담당자</text><text class="small" x="330" y="200">서버</text>
<circle class="new" cx="330" cy="36" r="20"/><use class="ic" href="#i-message-circle" x="318" y="24" width="24" height="24"/>
<text class="chip" x="262" y="36">친구 메시지</text>
</svg>
<ol class="steps">
<li>내가 편지(요청)를 보내야 담당자가 답해요</li>
<li>친구 메시지가 서버에 와도 나는 몰라요</li>
<li>그래서 채팅 화면이 저절로 바뀌지 않아요</li>
</ol>
<p class="more">편지와 답장의 기본 규칙은 <a href="{{ '/2026/11/18/http-request-response/' | relative_url }}">1편 HTTP</a>에서 봐요</p>
</section>

<section class="slide">
<h3>자꾸 물어보면 대부분 헛걸음이에요</h3>
<svg class="dg" viewBox="0 0 400 232" role="img" aria-label="나는 3초마다 새 소식이 있는지 편지로 묻는다(폴링). 0초, 3초, 6초에는 없어요라는 답만 받고, 새 메시지는 7초에 도착했지만 9초에 다시 물을 때에야 받는다. 시간은 설명용 예시다">
<defs><marker id="ws2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="label center" x="200" y="20">나 → 담당자: 새 소식 있어요?</text>
<circle class="box" cx="60" cy="62" r="22"/><use class="ic" href="#i-mail" x="46" y="48" width="28" height="28"/>
<circle class="box" cx="140" cy="62" r="22"/><use class="ic" href="#i-mail" x="126" y="48" width="28" height="28"/>
<circle class="box" cx="220" cy="62" r="22"/><use class="ic" href="#i-mail" x="206" y="48" width="28" height="28"/>
<circle class="box" cx="300" cy="62" r="22"/><use class="ic" href="#i-mail" x="286" y="48" width="28" height="28"/>
<path class="line" d="M60,86 L60,108" marker-end="url(#ws2)"/><path class="line" d="M140,86 L140,108" marker-end="url(#ws2)"/><path class="line" d="M220,86 L220,108" marker-end="url(#ws2)"/><path class="line" d="M300,86 L300,108" marker-end="url(#ws2)"/>
<rect class="line dash" x="30" y="112" width="60" height="30" rx="6"/><text class="small" x="60" y="127">없어요</text>
<rect class="line dash" x="110" y="112" width="60" height="30" rx="6"/><text class="small" x="140" y="127">없어요</text>
<rect class="line dash" x="190" y="112" width="60" height="30" rx="6"/><text class="small" x="220" y="127">없어요</text>
<rect class="kafka" x="270" y="112" width="60" height="30" rx="6"/><text class="chip" x="300" y="127">있어요</text>
<path class="line" d="M30,172 L380,172" marker-end="url(#ws2)"/>
<text class="small" x="60" y="190">0초</text><text class="small" x="140" y="190">3초</text><text class="small" x="220" y="190">6초</text><text class="small" x="300" y="190">9초</text>
<path class="mark" d="M243,164 L251,164 L247,172 z"/>
<rect class="bad" x="247" y="166" width="53" height="12" rx="3"/>
<text class="alert" x="280" y="214">7초에 왔는데 9초에 받아요</text>
</svg>
<ol class="steps">
<li>3초마다 묻는 이 방법이 폴링이에요 (예시)</li>
<li>새 메시지는 다음에 물을 때까지 기다려요</li>
<li>사람이 많으면 서버가 헛물음에 바빠져요</li>
</ol>
</section>

<section class="slide">
<h3>답장을 붙잡아 둬도 매번 다시 보내요</h3>
<svg class="dg" viewBox="0 0 400 284" role="img" aria-label="롱 폴링 순서 그림. 1 내가 소식이 생기면 알려 달라고 편지를 보내고 2 담당자는 소식이 생길 때까지 답장을 붙잡아 둔다. 3 새 메시지가 생기면 답장을 보내고 4 나는 곧바로 다음 편지를 다시 보낸다">
<defs><marker id="ws3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line dash" d="M60,80 L60,276"/>
<path class="line dash" d="M340,80 L340,276"/>
<circle class="box" cx="60" cy="34" r="24"/><use class="ic" href="#i-user-round" x="44" y="18" width="32" height="32"/>
<circle class="box" cx="340" cy="34" r="24"/><use class="ic" href="#i-server" x="324" y="18" width="32" height="32"/>
<text class="big" x="60" y="72">나</text><text class="big" x="340" y="72">담당자</text>
<path class="line" d="M64,108 L334,108" marker-end="url(#ws3)"/><text class="chip" x="200" y="96">① 생기면 알려 줘요</text>
<rect class="new" x="328" y="118" width="24" height="64" rx="5"/>
<circle class="box" cx="280" cy="150" r="16"/><use class="ic" href="#i-hourglass" x="270" y="140" width="20" height="20"/>
<text class="chip" x="200" y="150">② 붙잡아 둬요</text>
<path class="line" d="M336,206 L66,206" marker-end="url(#ws3)"/><text class="chip" x="200" y="194">③ 새 메시지 왔어요</text>
<path class="line" d="M64,256 L334,256" marker-end="url(#ws3)"/><text class="chip" x="200" y="244">④ 또 알려 줘요</text>
</svg>
<ol class="steps">
<li>답을 미뤄 두는 이 방법을 롱 폴링이라 해요</li>
<li>편지마다 첨부 서류(헤더)를 또 붙여서 낭비예요</li>
<li>소식 하나마다 편지 한 통을 새로 써요</li>
</ol>
<p class="more">참고: <a href="https://www.rfc-editor.org/rfc/rfc6202#section-2.1">RFC 6202: 롱 폴링</a></p>
</section>

<details class="origin">
<summary>더 알아보기: 누가 왜 만들었을까?</summary>
<p>웹에서 채팅처럼 양쪽이 수시로 말하는 앱을 만들려면 HTTP로 서버를 자꾸 물어보는 수밖에 없었어요. 요청마다 첨부 서류(헤더)를 새로 붙여야 해서 낭비가 컸어요.</p>
<p>그래서 연결을 열어 두는 방법이 만들어졌고 2011년 12월 인터넷 표준을 정하는 곳(IETF)이 RFC 6455 문서로 확정했어요.</p>
<p>참고: <a href="https://www.rfc-editor.org/rfc/rfc6455.html#section-1.1">RFC 6455 1.1 배경</a> · <a href="https://en.wikipedia.org/wiki/WebSocket#History">Wikipedia: WebSocket 역사(2차 자료)</a></p>
</details>
</div>

<div class="slide-group">
<h2 class="slide-group-title">통화: 웹소켓은 전화를 걸어 둬요</h2>

<section class="slide">
<h3>웹소켓은 끊지 않고 걸어 둔 전화예요</h3>
<svg class="dg" viewBox="0 0 400 236" role="img" aria-label="나(클라이언트)와 답장 담당자(서버) 사이에 전화(웹소켓 연결)가 걸려 있고 위 화살표로 내가 말하고 아래 화살표로 담당자가 먼저 말하는 그림">
<defs><marker id="ws4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M112,94 L286,94" marker-end="url(#ws4)"/>
<path class="line" d="M288,126 L114,126" marker-end="url(#ws4)"/>
<circle class="box" cx="70" cy="110" r="40"/><use class="ic" href="#i-user-round" x="46" y="86" width="48" height="48"/>
<text class="big" x="70" y="176">나</text><text class="small" x="70" y="196">클라이언트</text>
<circle class="kafka" cx="200" cy="110" r="44"/><use class="ic" href="#i-phone" x="174" y="84" width="52" height="52"/>
<text class="big" x="200" y="176">전화</text><text class="small" x="200" y="196">웹소켓 연결</text>
<circle class="box" cx="330" cy="110" r="40"/><use class="ic" href="#i-server" x="306" y="86" width="48" height="48"/>
<text class="big" x="330" y="176">답장 담당자</text><text class="small" x="330" y="196">서버</text>
<text class="chip" x="200" y="30">끊을 때까지 열려 있어요</text>
<circle class="packet" r="5"><animateMotion dur="2.4s" repeatCount="indefinite" path="M112,94 L286,94"/></circle>
<circle class="packet" r="5"><animateMotion dur="2.4s" begin="1.2s" repeatCount="indefinite" path="M288,126 L114,126"/></circle>
</svg>
<ol class="steps">
<li>한 번 연결하면 한쪽이 끊을 때까지 이어져요</li>
<li>담당자(서버)도 먼저 말을 걸 수 있어요</li>
<li>말할 때마다 첨부 서류를 다시 붙이지 않아요</li>
</ol>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>첫 편지로 전화로 바꾸자고 해요</h3>
<svg class="dg" viewBox="0 0 400 290" role="img" aria-label="웹소켓 연결 순서 그림. 1 나는 Upgrade: websocket 헤더를 단 HTTP 요청으로 전화로 바꾸자고 하고 2 담당자는 101 Switching Protocols로 좋다고 답한다. 3 그 뒤로 같은 연결이 전화가 되어 양쪽이 주고받는다">
<defs><marker id="ws5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line dash" d="M60,80 L60,280"/>
<path class="line dash" d="M340,80 L340,280"/>
<circle class="box" cx="60" cy="34" r="24"/><use class="ic" href="#i-user-round" x="44" y="18" width="32" height="32"/>
<circle class="box" cx="340" cy="34" r="24"/><use class="ic" href="#i-server" x="324" y="18" width="32" height="32"/>
<text class="big" x="60" y="72">나</text><text class="big" x="340" y="72">담당자</text>
<path class="line" d="M64,112 L334,112" marker-end="url(#ws5)"/><text class="chip" x="200" y="100">① 전화로 바꿔요</text>
<text class="mono" x="200" y="128">Upgrade: websocket</text>
<path class="line" d="M336,176 L66,176" marker-end="url(#ws5)"/><text class="chip" x="200" y="164">② 좋아요</text>
<text class="mono" x="200" y="192">101 Switching Protocols</text>
<rect class="kafka" x="60" y="222" width="280" height="44" rx="10"/>
<use class="ic" href="#i-phone" x="96" y="232" width="24" height="24"/>
<text class="chip" x="210" y="244">③ 이제부터 통화</text>
</svg>
<ol class="steps">
<li>첫 한 통은 평범한 HTTP 요청이에요</li>
<li>담당자가 101(바꿀게요)로 답하면 그대로 통화해요</li>
</ol>
<p class="more">통화 주소는 ws://이고 잠근 통화는 wss://예요. 잠그는 법은 <a href="{{ '/2026/11/20/https-tls/' | relative_url }}">4편 HTTPS</a>에서 봐요 · 참고: <a href="https://www.rfc-editor.org/rfc/rfc6455.html#section-1.3">RFC 6455 1.3 연결 시작</a></p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 웹소켓에서는 로그인을 어떻게 확인해요?</summary>
<p>A. 전화로 바꾸자는 첫 편지가 평범한 HTTP 요청이라 브라우저가 쿠키를 함께 실어 보내요. 그래서 보통 담당자(서버)가 전화를 연결해 줄 때 쿠키나 토큰으로 누구인지 확인해요. 쿠키와 토큰은 <a href="{{ '/2026/11/19/cookie-session-token/' | relative_url }}">2편</a>에서 봐요.</p>
<p>참고: <a href="https://websockets.spec.whatwg.org/#websocket-opening-handshake">WHATWG WebSockets 표준: 연결 시작(credentials mode "include")</a></p>
</details>
</aside>
</div>

<section class="slide">
<h3>통화 중엔 둘 다 아무 때나 말해요</h3>
<svg class="dg" viewBox="0 0 400 290" role="img" aria-label="통화 중인 나와 담당자 사이의 순서 그림. 담당자가 먼저 친구 메시지를 전하고, 나는 내 메시지를 보내고, 조용할 때 담당자가 여보세요(핑)라고 묻고 나는 네(퐁)라고 답한다">
<defs><marker id="ws6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="kafka" x="52" y="84" width="16" height="196" rx="6"/>
<rect class="kafka" x="332" y="84" width="16" height="196" rx="6"/>
<circle class="box" cx="60" cy="34" r="24"/><use class="ic" href="#i-user-round" x="44" y="18" width="32" height="32"/>
<circle class="box" cx="340" cy="34" r="24"/><use class="ic" href="#i-server" x="324" y="18" width="32" height="32"/>
<text class="big" x="60" y="72">나</text><text class="big" x="340" y="72">담당자</text>
<path class="line" d="M330,114 L72,114" marker-end="url(#ws6)"/><text class="chip" x="200" y="102">친구 메시지 왔어요</text>
<path class="line" d="M70,164 L328,164" marker-end="url(#ws6)"/><text class="chip" x="200" y="152">내 메시지 보내요</text>
<path class="line dash" d="M330,220 L72,220" marker-end="url(#ws6)"/><text class="small" x="200" y="208">여보세요? (핑)</text>
<path class="line dash" d="M70,264 L328,264" marker-end="url(#ws6)"/><text class="small" x="200" y="252">네 (퐁)</text>
</svg>
<ol class="steps">
<li>친구 메시지가 오면 서버가 바로 전해 줘요</li>
<li>내 메시지도 같은 연결로 보내요</li>
<li>조용할 땐 핑·퐁으로 아직 이어졌는지 확인해요</li>
</ol>
<p class="more">참고: <a href="https://www.rfc-editor.org/rfc/rfc6455.html#section-5.5.2">RFC 6455 5.5.2 핑</a></p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">비교: 새 소식을 받는 방법이 달라요</h2>

<section class="slide">
<h3>폴링은 늦고 웹소켓은 바로 받아요</h3>
<svg class="dg" viewBox="0 0 400 330" role="img" aria-label="같은 시간 축에서 세 방법을 위아래로 비교한 그림. 새 메시지가 같은 시각에 도착한다. 폴링은 직전 물음이 지난 뒤라 다음 물음 때까지 빨간 구간만큼 기다렸다 받고, 롱 폴링은 붙잡아 둔 답장으로 바로 받지만 받자마자 편지를 다시 보낸다. 웹소켓은 하나의 연결이 계속 이어져 있어 도착선에서 바로 받는다. 아래 범례는 흰 칸이 물음, 빨간 칸이 늦어진 시간, 노란 칸이 받는 순간, 초록 점선 칸이 열어 둔 채 기다리는 시간이라는 뜻이다. 시간은 설명용 예시다">
<text class="chip" x="250" y="12">새 메시지 도착</text>
<path class="line dash" d="M250,22 L250,300"/>
<rect class="line" x="6" y="26" width="388" height="86" rx="12"/>
<text class="label center" x="200" y="46">폴링</text><text class="small" x="364" y="46">시간 →</text>
<rect class="box" x="80" y="62" width="14" height="22" rx="3"/>
<rect class="box" x="150" y="62" width="14" height="22" rx="3"/>
<rect class="box" x="220" y="62" width="14" height="22" rx="3"/>
<rect class="bad" x="250" y="66" width="40" height="14" rx="3"/>
<rect class="kafka" x="290" y="62" width="14" height="22" rx="3"/>
<text class="alert" x="256" y="100" style="text-anchor:start">기다려요</text>
<rect class="line" x="6" y="120" width="388" height="86" rx="12"/>
<text class="label center" x="200" y="140">롱 폴링</text>
<rect class="new" x="90" y="156" width="160" height="22" rx="4"/><text class="chip" x="170" y="167">답장 붙잡아 둠</text>
<rect class="kafka" x="250" y="156" width="12" height="22" rx="3"/>
<rect class="line dash" x="268" y="156" width="100" height="22" rx="4"/><text class="chip" x="318" y="167">다시 보내요</text>
<rect class="line" x="6" y="214" width="388" height="86" rx="12"/>
<text class="label center" x="200" y="234">웹소켓</text>
<rect class="new" x="90" y="250" width="280" height="22" rx="4"/><text class="chip" x="170" y="261">연결 하나 그대로</text>
<rect class="kafka" x="250" y="250" width="12" height="22" rx="3"/>
<text class="chip" x="256" y="288" style="text-anchor:start">바로 받아요</text>
<rect class="box" x="20" y="310" width="14" height="14" rx="3"/><text class="small" x="38" y="317" style="text-anchor:start">물음</text>
<rect class="bad" x="98" y="310" width="14" height="14" rx="3"/><text class="small" x="116" y="317" style="text-anchor:start">늦어진 시간</text>
<rect class="kafka" x="206" y="310" width="14" height="14" rx="3"/><text class="small" x="224" y="317" style="text-anchor:start">받는 순간</text>
<rect class="new" x="300" y="310" width="14" height="14" rx="3"/><text class="small" x="318" y="317" style="text-anchor:start">열어 둠</text>
</svg>
<ol class="steps">
<li>폴링은 메시지가 와도 다음 물음까지 몰라요</li>
<li>롱 폴링은 메시지마다 편지를 한 통씩 써요</li>
<li>웹소켓은 서버가 그 순간 바로 건네요</li>
</ol>
</section>

<section class="slide">
<h3>서버만 말하면 방송(SSE)으로 충분해요</h3>
<svg class="dg" viewBox="0 0 400 262" role="img" aria-label="왼쪽 방송(SSE, Server-Sent Events) 카드는 담당자에서 나에게로 화살표가 하나만 있어 서버만 말하고 끊기면 브라우저가 기본으로 다시 붙는다. 오른쪽 웹소켓 카드는 같은 두 사람 사이에 위아래 화살표가 둘 있어 양쪽이 말하고 끊기면 다시 거는 코드를 개발자가 직접 짜야 한다">
<defs><marker id="ws7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="10" y="10" width="185" height="242" rx="12"/>
<text class="label center" x="102" y="28">방송 · SSE</text><text class="small" x="102" y="46">Server-Sent Events</text>
<circle class="box" cx="102" cy="82" r="26"/><use class="ic" href="#i-server" x="84" y="64" width="36" height="36"/>
<path class="line" d="M102,112 L102,150" marker-end="url(#ws7)"/>
<circle class="box" cx="102" cy="180" r="26"/><use class="ic" href="#i-user-round" x="84" y="162" width="36" height="36"/>
<text class="small" x="102" y="228">브라우저가 다시 붙어요</text>
<rect class="line" x="205" y="10" width="185" height="242" rx="12"/>
<text class="label center" x="297" y="28">통화 · 웹소켓</text>
<circle class="box" cx="297" cy="82" r="26"/><use class="ic" href="#i-server" x="279" y="64" width="36" height="36"/>
<path class="line" d="M289,112 L289,150" marker-end="url(#ws7)"/>
<path class="line" d="M305,150 L305,112" marker-end="url(#ws7)"/>
<circle class="box" cx="297" cy="180" r="26"/><use class="ic" href="#i-user-round" x="279" y="162" width="36" height="36"/>
<text class="small" x="297" y="228">다시 걸 코드를 짜야 해요</text>
</svg>
<ol class="steps">
<li>SSE는 '서버가 보낸 소식'이란 뜻이에요</li>
<li>나도 자주 말해야 하면 웹소켓을 써요</li>
</ol>
<p class="more">참고: <a href="https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events">MDN: Server-sent events</a> · <a href="https://html.spec.whatwg.org/multipage/server-sent-events.html">HTML 표준: SSE 재연결</a></p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">판단: 언제 쓰고 무엇을 조심해요?</h2>

<section class="slide">
<h3>이럴 때 써요, 이럴 땐 안 써요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="왼쪽 이럴 때 써요 카드에는 채팅을 주고받아요, 여럿이 함께 편집해요, 실시간 게임과 시세가 있고 오른쪽 이럴 땐 안 써요 카드에는 가끔만 바뀌어요, 서버만 알려 줘요, 한 번 묻고 끝나요가 있는 그림">
<rect class="line" x="6" y="6" width="190" height="238" rx="12"/>
<circle class="kafka" cx="101" cy="40" r="20"/><use class="ic" href="#i-check" x="89" y="28" width="24" height="24"/>
<text class="label center" x="101" y="80">이럴 때 써요</text>
<rect class="box" x="20" y="102" width="162" height="34" rx="8"/><text class="chip" x="101" y="119">채팅을 주고받아요</text>
<rect class="box" x="20" y="146" width="162" height="34" rx="8"/><text class="chip" x="101" y="163">여럿이 함께 편집해요</text>
<rect class="box" x="20" y="190" width="162" height="34" rx="8"/><text class="chip" x="101" y="207">실시간 게임·시세</text>
<rect class="line" x="204" y="6" width="190" height="238" rx="12"/>
<circle class="bad" cx="299" cy="40" r="20"/><use class="ic" href="#i-x" x="287" y="28" width="24" height="24"/>
<text class="label center" x="299" y="80">이럴 땐 안 써요</text>
<rect class="box" x="218" y="102" width="162" height="34" rx="8"/><text class="chip" x="299" y="119">가끔만 바뀌어요</text>
<rect class="box" x="218" y="146" width="162" height="34" rx="8"/><text class="chip" x="299" y="163">서버만 알려 줘요</text>
<rect class="box" x="218" y="190" width="162" height="34" rx="8"/><text class="chip" x="299" y="207">한 번 묻고 끝나요</text>
</svg>
<ol class="steps">
<li>양쪽이 자주 바로 말해야 하면 웹소켓이에요</li>
<li>연결을 계속 열어 둘 값어치가 있을 때만 써요</li>
</ol>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>쓸 때는 세 가지를 조심해요</h3>
<svg class="dg" viewBox="0 0 400 170" role="img" aria-label="조심할 점 세 가지 그림. 끊김은 플러그가 빠진 모습으로 다시 걸어야 하고, 연결 수는 서버가 열린 연결마다 메모리를 쓰고, 출처는 방패 경고로 서버가 직접 확인해야 한다는 뜻이다">
<circle class="bad" cx="70" cy="64" r="40"/><use class="ic" href="#i-unplug" x="46" y="40" width="48" height="48"/>
<text class="big" x="70" y="130">끊김</text><text class="small" x="70" y="152">다시 걸어야 해요</text>
<circle class="box" cx="200" cy="64" r="40"/><use class="ic" href="#i-server" x="176" y="40" width="48" height="48"/>
<text class="big" x="200" y="130">연결 수</text><text class="small" x="200" y="152">연결마다 메모리를 써요</text>
<circle class="box" cx="330" cy="64" r="40"/><use class="ic" href="#i-shield-alert" x="306" y="40" width="48" height="48"/>
<text class="big" x="330" y="130">출처</text><text class="small" x="330" y="152">서버가 확인해요</text>
</svg>
<ol class="steps">
<li>SSE와 달리 브라우저가 대신 걸어 주지 않아요</li>
<li>사람 수만큼 연결이 열려 서버가 버거워져요</li>
<li>남의 사이트가 건 전화인지 출처로 가려요</li>
</ol>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 전화가 끊긴 사이에 온 메시지는 사라져요?</summary>
<p>A. 웹소켓은 끊긴 동안의 말을 모아 뒀다가 다시 전해 주지 않아요. 그래서 채팅 앱은 보통 메시지를 서버에 저장해 두고, 다시 전화를 걸면 마지막으로 받은 메시지 다음 것부터 달라고 해서 놓친 것을 채워요.</p>
</details>
</aside>
</div>

<section class="slide">
<h3>다른 사이트가 건 전화는 서버가 걸러요</h3>
<svg class="dg" viewBox="0 0 400 300" role="img" aria-label="내가 열어 둔 다른 사이트 페이지가 1 내 브라우저에게 담당자(서버)로 전화를 걸어 달라고 시키면 2 브라우저는 내 쿠키와 Origin: other.test를 실어 연결을 청한다. 3 담당자는 출처를 보고 모르는 곳이라 403 Forbidden으로 거절한다. 확인하지 않으면 다른 사이트가 내 이름으로 통화하게 된다. 주소는 설명용 예시다">
<defs><marker id="ws8" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line dash" d="M60,106 L60,268"/>
<path class="line dash" d="M200,96 L200,268"/>
<path class="line dash" d="M340,96 L340,268"/>
<text class="small" x="60" y="98">내가 연 페이지</text>
<circle class="bad" cx="60" cy="40" r="24"/><use class="ic" href="#i-globe" x="44" y="24" width="32" height="32"/>
<circle class="box" cx="200" cy="40" r="24"/><use class="ic" href="#i-user-round" x="184" y="24" width="32" height="32"/>
<circle class="kafka" cx="340" cy="40" r="24"/><use class="ic" href="#i-server" x="324" y="24" width="32" height="32"/>
<text class="big" x="60" y="80">다른 사이트</text><text class="big" x="200" y="80">내 브라우저</text><text class="big" x="340" y="80">담당자</text>
<path class="line" d="M64,124 L194,124" marker-end="url(#ws8)"/><text class="chip" x="130" y="112">① 전화 걸어 줘</text>
<path class="line" d="M204,174 L334,174" marker-end="url(#ws8)"/><text class="chip" x="270" y="162">② 쿠키도 실어요</text>
<text class="chip mono" x="270" y="190" style="font-size:11px">Origin: other.test</text>
<path class="line dash" d="M336,236 L206,236" marker-end="url(#ws8)"/><text class="chip" x="270" y="224">③ 출처 보고 거절</text>
<text class="chip mono" x="270" y="252" style="font-size:11px">403 Forbidden</text>
<text class="alert" x="200" y="288">확인 안 하면 내 이름으로 통화돼요</text>
</svg>
<ol class="steps">
<li>SameSite=None 쿠키는 남의 사이트가 걸어도 실려요</li>
<li>CORS 같은 답장 검사가 없어 연결이 그냥 열려요</li>
<li>그래서 서버가 출처(Origin)를 확인해요</li>
</ol>
<p class="more">쿠키가 실리는 조건(SameSite)은 <a href="{{ '/2026/11/19/cookie-session-token/' | relative_url }}">2편</a>, CORS는 <a href="{{ '/2026/11/20/cors/' | relative_url }}">5편 CORS</a>에서 봐요 · 참고: <a href="https://www.rfc-editor.org/rfc/rfc6455.html#section-10.2">RFC 6455 10.2 Origin 확인</a> · <a href="https://websockets.spec.whatwg.org/#websocket-opening-handshake">WHATWG WebSockets: 연결 시작(쿠키 포함)</a> · <a href="https://fetch.spec.whatwg.org/#main-fetch">Fetch 표준: main fetch(websocket은 CORS 검사 생략)</a></p>
</section>
</div>

</div>
