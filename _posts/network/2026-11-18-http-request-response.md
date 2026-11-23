---
layout: post
title: "웹 앱은 서버와 어떻게 말을 주고받을까? 편지로 이해하는 HTTP 요청과 응답"
description: "브라우저와 앱이 서버에 일을 시키는 과정을 편지 주고받기 비유로 설명하고 HTTP 요청의 메서드·URL·헤더·본문과 응답의 상태 코드(200·404·500 등), 무상태와 쿠키, API와 JSON까지 실제 동작으로 이어서 설명합니다."
date: 2026-11-18 21:00:00 +0900
series: network
episode: 1
summary: "HTTP는 클라이언트와 서버가 함께 쓰는 편지 양식이에요. 받는 곳과 용건을 적어 요청을 보내면 서버는 맨 위에 결과 번호를 적은 답장으로 응답해요."
---

<div class="lesson lesson-hierarchy storybook">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: https://cdn.jsdelivr.net/npm/lucide-static@1.25.0/icons/ (ISC). 라이선스: assets/icons/LICENSE-lucide.txt. rect·circle·line 요소는 같은 모양의 path로 옮겼어요. -->
<symbol id="i-user" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"/></symbol>
<symbol id="i-mail" viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 7l-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/></symbol>
<symbol id="i-laptop" viewBox="0 0 24 24"><path d="M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2zM20.054 15.987H3.946"/></symbol>
<symbol id="i-server" viewBox="0 0 24 24"><path d="M4 2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM4 14h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2zM6 6h.01M6 18h.01"/></symbol>
</defs>
</svg>

<div class="slide-group">
<h2 class="slide-group-title">문제: 서로 다른 양식은 읽기 어려워요</h2>

<section class="slide">
<h3>양식이 다르면 부탁을 알아보기 어려워요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="주소가 없는 편지는 중간에서 멈춰요. 용건이 맨 끝에 있거나 글씨를 알아보기 힘든 두 편지는 도착해도 담당자가 뜻을 몰라 답장하지 못해요.">
<defs><marker id="m1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M58,46 L106,46"/>
<path class="line" d="M58,126 L106,126"/>
<path class="line" d="M58,206 L106,206"/>
<path class="line dash" d="M154,46 L218,46"/>
<path class="line" d="M219,39 L233,53 M233,39 L219,53"/>
<path class="line" d="M154,126 L282,126" marker-end="url(#m1)"/>
<path class="line" d="M154,206 L284,148" marker-end="url(#m1)"/>
<circle class="box" cx="36" cy="46" r="20"/><use class="ic" href="#i-user" x="25" y="35" width="22" height="22"/>
<circle class="box" cx="36" cy="126" r="20"/><use class="ic" href="#i-user" x="25" y="115" width="22" height="22"/>
<circle class="box" cx="36" cy="206" r="20"/><use class="ic" href="#i-user" x="25" y="195" width="22" height="22"/>
<circle class="bad" cx="130" cy="46" r="22"/><use class="ic" href="#i-mail" x="117" y="33" width="26" height="26"/>
<circle class="bad" cx="130" cy="126" r="22"/><use class="ic" href="#i-mail" x="117" y="113" width="26" height="26"/>
<circle class="bad" cx="130" cy="206" r="22"/><use class="ic" href="#i-mail" x="117" y="193" width="26" height="26"/>
<text class="chip" x="130" y="82">받는 곳이 없어요</text>
<text class="chip" x="130" y="162">용건이 맨 끝에</text>
<text class="chip" x="130" y="236">알아보기 힘든 글씨</text>
<circle class="box" cx="330" cy="126" r="40"/><use class="ic" href="#i-user" x="304" y="100" width="52" height="52"/>
<text class="alert big" x="330" y="72">?</text>
<text class="big" x="330" y="186">답장 담당자</text><text class="alert" x="330" y="206">무슨 뜻이지?</text>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="0.5s" repeatCount="indefinite" path="M154,126 L282,126"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="1s" repeatCount="indefinite" path="M154,206 L284,148"/></circle>
</svg>
<ol class="steps">
<li>앱마다 다른 양식을 쓰면 서로 뜻을 맞추기 어려워요</li>
<li>용건을 찾기 어려우면 답장도 늦어져요</li>
</ol>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>HTTP는 부탁과 답장의 약속이에요</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="왼쪽 클라이언트인 브라우저나 앱이 HTTP 양식으로 서버에 요청을 보내고 오른쪽 서버가 같은 양식으로 응답을 돌려주는 그림">
<defs><marker id="m2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M110,70 L288,70" marker-end="url(#m2)"/>
<path class="line" d="M290,110 L112,110" marker-end="url(#m2)"/>
<circle class="box" cx="70" cy="90" r="36"/><use class="ic" href="#i-laptop" x="48" y="68" width="44" height="44"/>
<circle class="box" cx="330" cy="90" r="36"/><use class="ic" href="#i-server" x="308" y="68" width="44" height="44"/>
<text class="chip" x="200" y="56">요청</text>
<rect class="kafka" x="150" y="78" width="100" height="24" rx="5"/><text class="chip" x="200" y="90">HTTP 양식</text>
<text class="chip" x="200" y="126">응답</text>
<text class="big" x="70" y="150">편지 쓰는 쪽</text><text class="small" x="70" y="170">클라이언트</text>
<text class="big" x="330" y="150">답장 담당자</text><text class="small" x="330" y="170">서버</text>
<circle class="packet" r="5"><animateMotion dur="3.2s" repeatCount="indefinite" path="M110,70 L290,70 L290,110 L112,110"/></circle>
</svg>
<ol class="steps">
<li>편지 쓰는 쪽(클라이언트)이 요청을 보내요</li>
<li>답장 담당자(서버)가 응답을 돌려줘요</li>
<li>함께 정한 웹 편지 양식이 HTTP예요</li>
</ol>
<p class="more"><a href="{{ '/2026/11/23/websocket/' | relative_url }}">6편에서 양쪽이 먼저 말하는 웹소켓</a> · <a href="{{ '/2026/11/20/https-tls/' | relative_url }}">4편에서 편지를 잠그는 HTTPS</a></p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 브라우저 주소창에 사이트 주소를 칠 때도 이 요청과 응답이 오가나요?</summary>
<p>A. 네. 브라우저가 주소를 보고 편지를 보내면 서버가 웹 페이지를 답장으로 돌려줘요. 앱이 자료를 부탁할 때도 같은 양식으로 편지를 써요.</p>
</details>
</aside>
</div>

<details class="origin">
<summary>더 알아보기: 누가 왜 만들었을까?</summary>
<p>HTTP는 <b>팀 버너스리(Tim Berners-Lee)</b>가 스위스의 연구소 CERN에서 월드 와이드 웹과 함께 만들었어요. 1989년에 웹을 제안했고 1990~1991년 무렵 구현해 공개했어요. 첫 형태는 나중에 HTTP/0.9라고 불렸는데 요청 종류(메서드)가 <code>GET</code> 하나뿐인 한 줄짜리 요청이었어요.</p>
<p>연구자들이 서로 다른 컴퓨터에 흩어진 문서를 링크로 이어서 바로 찾아보게 하려고 만든 약속이에요. HyperText는 다른 문서로 이어지는 링크가 달린 글이고 Transfer Protocol은 그것을 주고받는 약속이라는 뜻이에요.</p>
<p>RFC는 인터넷 기술의 약속을 번호를 붙여 적은 공식 문서예요. HTTP/1.0(RFC 1945, 1996년 5월)과 HTTP/1.1(RFC 2068, 1997년 1월)이 문서로 정리됐어요. 2022년 6월에는 모든 버전이 함께 쓰는 의미를 RFC 9110에 모았어요. HTTP/2는 2015년 RFC 7540으로 표준이 됐다가 2022년 6월에 RFC 9113으로 개정됐고 HTTP/3는 그때 RFC 9114로 표준이 됐어요. 버전이 바뀌어도 이 글에서 보는 요청과 응답의 뜻은 같아요.</p>
<p>참고: <a href="https://www.rfc-editor.org/rfc/rfc9110">RFC 9110 HTTP Semantics</a> · <a href="https://www.rfc-editor.org/rfc/rfc1945">RFC 1945 HTTP/1.0</a> · <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview">MDN: HTTP 개요</a></p>
</details>
</div>

<div class="slide-group">
<h2 class="slide-group-title">요청: 주소와 용건을 적어요</h2>

<section class="slide">
<h3>주소에는 받는 곳과 찾을 것이 들어가요</h3>
<svg class="dg" viewBox="0 0 400 170" role="img" aria-label="예시 주소 https://example.com:443/api/todos?page=2#top을 스킴, 호스트, 포트, 경로, 쿼리, 조각으로 나눈 그림. 경로와 쿼리는 요청 대상에 들어가고 #top 조각은 서버로 보내지 않아요.">
<path class="line" d="M211,29 L211,24 L359,24 L359,29"/>
<text class="small" x="285" y="13">HTTP/1.1 요청 줄</text>
<rect class="box" x="5" y="30" width="68" height="40" rx="5"/><text class="chip mono" x="39" y="50">https://</text>
<rect class="kafka" x="73" y="30" width="96" height="40" rx="5"/><text class="chip mono" x="121" y="50">example.com</text>
<rect class="box" x="169" y="30" width="42" height="40" rx="5"/><text class="chip mono" x="190" y="50">:443</text>
<rect class="box" x="211" y="30" width="86" height="40" rx="5"/><text class="chip mono" x="254" y="50">/api/todos</text>
<rect class="box" x="297" y="30" width="62" height="40" rx="5"/><text class="chip mono" x="328" y="50">?page=2</text>
<rect class="line dash" x="359" y="30" width="36" height="40" rx="5"/><text class="chip mono" x="377" y="50">#top</text>
<text class="chip" x="39" y="88">스킴</text><text class="chip" x="121" y="88">호스트</text><text class="chip" x="190" y="88">포트</text><text class="chip" x="254" y="88">경로</text><text class="chip" x="328" y="88">쿼리</text><text class="chip" x="377" y="88">조각</text>
<text class="small" x="39" y="108">방식</text><text class="small" x="121" y="108">받는 서버</text><text class="small" x="190" y="108">몇 번 문</text><text class="small" x="254" y="108">찾을 자료</text><text class="small" x="328" y="108">조건</text>
<rect class="line" x="10" y="124" width="380" height="36" rx="12"/>
<text class="alert" x="200" y="142">#top은 브라우저만 쓰고 서버로 보내지 않아요</text>
</svg>
<ol class="steps">
<li>서버 이름(호스트)으로 받을 곳을 찾아요 (예시)</li>
<li>기본 문 번호(포트)는 주소에서 뺄 수 있어요</li>
<li>HTTP는 80번이고 HTTPS는 443번이에요</li>
</ol>
<p class="more"><a href="{{ '/2026/11/19/dns/' | relative_url }}">3편에서 서버 이름으로 주소를 찾는 법</a></p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>첫 줄에는 용건과 요청 대상이 있어요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="할 일을 저장하는 HTTP 요청 예시로 요청 줄 POST /api/todos HTTP/1.1, 받는 곳과 본문 형식 및 길이(Content-Length: 26)를 적은 헤더, 이를 본문과 나누는 빈 줄, 새 할 일 우유 사기가 차례로 놓인 그림">
<text class="label" x="10" y="40">요청 줄</text>
<text class="label" x="10" y="88">헤더</text>
<text class="label" x="10" y="133">빈 줄</text>
<text class="label" x="10" y="178">본문</text>
<rect class="box" x="100" y="14" width="290" height="200" rx="8"/>
<rect class="kafka" x="108" y="24" width="274" height="32" rx="5"/><text class="chip mono" x="118" y="40" style="text-anchor:start">POST /api/todos HTTP/1.1</text>
<rect class="line" x="108" y="59" width="274" height="58" rx="5"/>
<text class="chip mono" x="118" y="76" style="text-anchor:start">Host: example.com</text>
<text class="chip mono" x="118" y="92" style="text-anchor:start">Content-Type: application/json</text>
<text class="chip mono" x="118" y="109" style="text-anchor:start">Content-Length: 26</text>
<rect class="line dash" x="108" y="122" width="274" height="22" rx="5"/>
<rect class="box" x="108" y="152" width="274" height="52" rx="5"/><text class="chip mono" x="118" y="178" style="text-anchor:start">{"title": "우유 사기"}</text>
<text class="small" x="245" y="234">HTTP/1.1 요청 예시 · 본문 26바이트</text>
</svg>
<ol class="steps">
<li>첫 줄에 부탁 종류(메서드)를 적어요 (예시)</li>
<li>덧붙인 정보(헤더)는 이름과 값을 콜론으로 이어요</li>
<li>빈 줄은 덧붙인 정보와 본문의 경계예요</li>
</ol>
<p class="more">참고: <a href="https://www.rfc-editor.org/rfc/rfc9112">RFC 9112 HTTP/1.1 양식</a></p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 이런 요청은 개발자가 한 줄씩 직접 쓰나요?</summary>
<p>A. 개발자는 주소와 부탁 종류와 보낼 내용을 정해요. 브라우저나 앱은 HTTP/1.1에서 받는 곳(<code>Host</code>)처럼 필수인 칸을 채우고 받고 싶은 형식은 <code>Accept</code>에 적을 수 있어요. <code>Host</code>가 빠지면 서버는 400으로 답해요.</p>
</details>
</aside>
</div>

<section class="slide">
<h3>같은 주소에도 다른 부탁을 보내요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="같은 주소에도 다른 부탁을 보내요. GET — 목록 보기. POST — 보낸 내용 처리. PUT — 통째로 교체하거나 만들기. PATCH — 일부 고치기. DELETE — 지우기">
<rect class="kafka" x="10" y="9" width="380" height="39" rx="8"/><text class="chip" x="25" y="29" style="text-anchor:start">GET</text><text class="chip" x="376" y="29" style="text-anchor:end">목록 보기</text>
<rect class="box" x="10" y="54" width="380" height="39" rx="8"/><text class="chip" x="25" y="74" style="text-anchor:start">POST</text><text class="chip" x="376" y="74" style="text-anchor:end">보낸 내용 처리</text>
<rect class="box" x="10" y="99" width="380" height="39" rx="8"/><text class="chip" x="25" y="119" style="text-anchor:start">PUT</text><text class="chip" x="376" y="119" style="text-anchor:end">통째로 교체하거나 만들기</text>
<rect class="box" x="10" y="144" width="380" height="39" rx="8"/><text class="chip" x="25" y="164" style="text-anchor:start">PATCH</text><text class="chip" x="376" y="164" style="text-anchor:end">일부 고치기</text>
<rect class="box" x="10" y="189" width="380" height="39" rx="8"/><text class="chip" x="25" y="209" style="text-anchor:start">DELETE</text><text class="chip" x="376" y="209" style="text-anchor:end">지우기</text>
</svg>
<ol class="steps">
<li>조회(GET)는 서버에 변경을 부탁하지 않아요</li>
<li>PUT과 DELETE는 반복해도 의도한 결과가 같아요</li>
<li>POST를 거듭 보내면 항목이 더 생길 수 있어요</li>
</ol>
</section>

</div>

<div class="slide-group">
<h2 class="slide-group-title">응답: 첫 숫자가 결과를 알려 줘요</h2>

<section class="slide">
<h3>답장 첫 줄에 결과 번호가 와요</h3>
<svg class="dg" viewBox="0 0 400 226" role="img" aria-label="앞의 할 일 저장 요청에 대한 HTTP 응답 예시로 상태 줄 HTTP/1.1 201 Created, 헤더 Content-Type: application/json, 빈 줄, 본문 id 7과 title 우유 사기가 차례로 놓인 그림">
<text class="label" x="10" y="40">상태 줄</text>
<text class="label" x="10" y="77">헤더</text>
<text class="label" x="10" y="111">빈 줄</text>
<text class="label" x="10" y="156">본문</text>
<rect class="box" x="100" y="14" width="290" height="178" rx="8"/>
<rect class="kafka" x="108" y="24" width="274" height="32" rx="5"/><text class="chip mono" x="118" y="40" style="text-anchor:start">HTTP/1.1 201 Created</text>
<rect class="line" x="108" y="62" width="274" height="30" rx="5"/><text class="chip mono" x="118" y="77" style="text-anchor:start">Content-Type: application/json</text>
<rect class="line dash" x="108" y="100" width="274" height="22" rx="5"/>
<rect class="box" x="108" y="130" width="274" height="52" rx="5"/><text class="chip mono" x="118" y="156" style="text-anchor:start">{"id": 7, "title": "우유 사기"}</text>
<text class="small" x="245" y="212">HTTP/1.1 응답 예시 · 일부 헤더 생략</text>
</svg>
<ol class="steps">
<li>201은 부탁한 항목을 만들었다는 뜻이에요</li>
<li>첫 줄은 버전과 결과 번호와 짧은 문구로 나뉘어요</li>
<li>자료 형식(Content-Type)으로 JSON과 HTML을 구별해요</li>
</ol>
</section>

<section class="slide">
<h3>결과 번호는 첫 숫자로 갈라져요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="결과 번호는 첫 숫자로 갈라져요. 1xx — 중간 안내. 2xx — 성공 · 200 / 201. 3xx — 다음 조치 · 301. 4xx — 요청 쪽 오류 · 400 / 404. 5xx — 서버 쪽 오류 · 500 / 503">
<rect class="kafka" x="10" y="9" width="380" height="39" rx="8"/><text class="chip" x="25" y="29" style="text-anchor:start">1xx</text><text class="chip" x="376" y="29" style="text-anchor:end">중간 안내</text>
<rect class="box" x="10" y="54" width="380" height="39" rx="8"/><text class="chip" x="25" y="74" style="text-anchor:start">2xx</text><text class="chip" x="376" y="74" style="text-anchor:end">성공 · 200 / 201</text>
<rect class="box" x="10" y="99" width="380" height="39" rx="8"/><text class="chip" x="25" y="119" style="text-anchor:start">3xx</text><text class="chip" x="376" y="119" style="text-anchor:end">다음 조치 · 301</text>
<rect class="box" x="10" y="144" width="380" height="39" rx="8"/><text class="chip" x="25" y="164" style="text-anchor:start">4xx</text><text class="chip" x="376" y="164" style="text-anchor:end">요청 쪽 오류 · 400 / 404</text>
<rect class="box" x="10" y="189" width="380" height="39" rx="8"/><text class="chip" x="25" y="209" style="text-anchor:start">5xx</text><text class="chip" x="376" y="209" style="text-anchor:end">서버 쪽 오류 · 500 / 503</text>
</svg>
<ol class="steps">
<li>100은 계속 보내라는 중간 답장이에요</li>
<li>200은 요청을 처리했다는 뜻이에요</li>
<li>301은 주소가 영구히 바뀌었다는 뜻이에요</li>
</ol>
</section>

</div>

<div class="slide-group">
<h2 class="slide-group-title">사용: 편지의 약속을 지키고 오류 원인을 찾아요</h2>

<div class="slide-with-question">
<section class="slide">
<h3>로그인이 필요한 편지에 확인표를 붙여요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="로그인의 예시. 클라이언트가 로그인 요청을 보내면 서버가 200과 함께 확인표를 돌려주고 클라이언트는 다음 주문 조회 요청에 그 확인표를 붙여 보내요.">
<defs><marker id="m7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line dash" d="M60,92 L60,222"/>
<path class="line dash" d="M340,92 L340,222"/>
<path class="line" d="M64,110 L334,110" marker-end="url(#m7)"/>
<path class="line" d="M336,160 L66,160" marker-end="url(#m7)"/>
<path class="line" d="M64,210 L334,210" marker-end="url(#m7)"/>
<circle class="box" cx="60" cy="40" r="28"/><use class="ic" href="#i-laptop" x="44" y="24" width="32" height="32"/>
<circle class="box" cx="340" cy="40" r="28"/><use class="ic" href="#i-server" x="324" y="24" width="32" height="32"/>
<text class="chip" x="60" y="80">클라이언트</text><text class="chip" x="340" y="80">서버</text>
<text class="chip mono" x="200" y="96">POST /login</text>
<text class="chip" x="200" y="146">200 · 브라우저에 확인표 보관</text>
<rect class="new" x="92" y="184" width="216" height="24" rx="5"/><text class="chip" x="200" y="196">조회 편지 · 헤더에 확인표</text>
<circle class="packet" r="5"><animateMotion dur="4.8s" repeatCount="indefinite" path="M64,110 L340,110 L340,160 L60,160 L60,210 L334,210"/></circle>
</svg>
<ol class="steps">
<li>한 장씩 따로 읽는 약속(무상태)이에요</li>
<li>같은 연결이라도 같은 사용자라고 짐작하지 않아요 (예시)</li>
<li>브라우저는 조건이 맞는 요청에 쿠키를 붙여요</li>
</ol>
<p class="more"><a href="{{ '/2026/11/19/cookie-session-token/' | relative_url }}">2편에서 확인표를 보내는 법 보기</a></p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 서버가 확인표를 알아본다면 결국 서버가 기억하는 것 아닌가요?</summary>
<p>A. 네. 서버는 로그인 기록을 보관할 수 있어요. 무상태라는 말은 앞 편지를 다시 읽지 않아도 이번 편지의 뜻을 알 수 있다는 말이에요. 브라우저가 보관한 쿠키를 보내거나 앱이 확인표(토큰)를 인증 정보(<code>Authorization</code>)에 넣을 수 있어요. 서버가 이를 읽는 방법은 <a href="{{ '/2026/11/19/cookie-session-token/' | relative_url }}">다음 편</a>에서 봐요.</p>
</details>
</aside>
</div>

<div class="slide-with-question">
<section class="slide">
<h3>앱은 서버와 정한 약속대로 부탁해요</h3>
<svg class="dg" viewBox="0 0 400 276" role="img" aria-label="할 일 서비스의 예시 요청 네 가지. GET /api/todos는 목록을 받아요. POST /api/todos는 새 할 일 이름을 담아요. PATCH /api/todos/7은 7번의 완료 여부를 바꿔요. DELETE /api/todos/7은 본문 없이 7번을 지워요.">
<rect class="line" x="9" y="8" width="382" height="260" rx="12"/>
<text class="label center" x="200" y="31">할 일 앱의 편지 네 가지 (예시)</text>
<circle class="kafka" cx="39" cy="69" r="16"/><use class="ic" href="#i-mail" x="29" y="59" width="20" height="20"/>
<text class="chip mono label" x="67" y="69">GET /api/todos</text>
<text class="small" x="301" y="69">답장에 목록</text>
<circle class="box" cx="39" cy="118" r="16"/><use class="ic" href="#i-mail" x="29" y="108" width="20" height="20"/>
<text class="chip mono label" x="67" y="114">POST /api/todos</text>
<text class="small mono label" x="67" y="136">{"title": "우유 사기"}</text>
<circle class="box" cx="39" cy="178" r="16"/><use class="ic" href="#i-mail" x="29" y="168" width="20" height="20"/>
<text class="chip mono label" x="67" y="174">PATCH /api/todos/7</text>
<text class="small mono label" x="67" y="196">{"done": true}</text>
<circle class="box" cx="39" cy="237" r="16"/><use class="ic" href="#i-mail" x="29" y="227" width="20" height="20"/>
<text class="chip mono label" x="67" y="237">DELETE /api/todos/7</text>
<text class="small" x="312" y="237">본문 없음</text>
</svg>
<ol class="steps">
<li>서버는 받아 주는 부탁(웹 API)을 정해요</li>
<li>이 약속을 따라 부탁하는 일을 API 호출이라고 해요</li>
<li>서버가 일하는 법을 바꿔도 약속이 같으면 앱은 그대로 써요 (예시)</li>
</ol>
<p class="more">참고: <a href="https://www.rfc-editor.org/rfc/rfc8259">RFC 8259 JSON</a> · <a href="{{ '/2026/11/20/cors/' | relative_url }}">5편에서 다른 주소의 답장을 읽는 조건</a></p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. "REST API"라는 말도 자주 보이는데 API와 무엇이 다른가요?</summary>
<p>A. API(Application Programming Interface)는 한 프로그램이 다른 프로그램의 기능을 쓰는 약속이에요. REST는 로이 필딩(Roy Fielding)이 2000년 박사 논문에서 제안한 설계 방식이에요. 흔히 HTTP로 자원을 다루는 API를 REST API라고 부르지만 필딩은 링크로 다음 동작을 안내하는 것도 조건으로 봤어요.</p>
</details>
</aside>
</div>

<div class="slide-with-question">
<section class="slide">
<h3>오류 번호가 다음에 볼 곳을 알려 줘요</h3>
<svg class="dg" viewBox="0 0 400 240" role="img" aria-label="요청에 4xx가 오면 요청의 주소와 인증 정보 또는 형식을 살펴요. 내부 오류(500)나 일시 불가(503)가 오면 응답을 만든 서버의 기록을 살펴요.">
<defs><marker id="m5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M106,48 L290,48" marker-end="url(#m5)"/>
<path class="line" d="M294,74 L110,74" marker-end="url(#m5)"/>
<circle class="box" cx="70" cy="60" r="32"/><use class="ic" href="#i-laptop" x="52" y="42" width="36" height="36"/>
<circle class="box" cx="330" cy="60" r="32"/><use class="ic" href="#i-server" x="312" y="42" width="36" height="36"/>
<text class="chip" x="200" y="34">요청</text><text class="chip" x="200" y="90">응답</text>
<text class="big" x="70" y="114">클라이언트</text><text class="big" x="330" y="114">서버</text>
<rect class="bad" x="10" y="136" width="185" height="96" rx="12"/>
<text class="label center" x="102" y="156">4xx면 이쪽</text>
<text class="chip" x="102" y="180">주소 · 경로</text><text class="chip" x="102" y="200">로그인 정보</text><text class="chip" x="102" y="220">400 · 형식 오류</text>
<rect class="bad" x="205" y="136" width="185" height="96" rx="12"/>
<text class="label center" x="297" y="156">5xx면 이쪽</text>
<text class="chip" x="297" y="180">일한 기록(로그)</text><text class="chip" x="297" y="200">503 · 일시 불가</text><text class="chip" x="297" y="220">500 · 내부 오류</text>
<circle class="packet" r="5"><animateMotion dur="3.2s" repeatCount="indefinite" path="M106,48 L294,48 L294,74 L110,74"/></circle>
</svg>
<ol class="steps">
<li>401은 인증 정보를 보고 403은 허용 여부를 봐요</li>
<li>404는 자료를 못 찾았거나 숨겼다는 뜻이에요</li>
<li>429면 짧은 시간에 요청을 많이 보낸 거예요</li>
</ol>
<p class="more">참고: <a href="https://www.rfc-editor.org/rfc/rfc9110#section-15">RFC 9110 상태 코드</a> · <a href="https://www.rfc-editor.org/rfc/rfc6585">RFC 6585 (429)</a> · <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status">MDN: HTTP 상태 코드</a></p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 내 앱에서 상태 코드는 어디서 볼 수 있나요?</summary>
<p>A. 브라우저의 개발자 도구(보통 F12 키)에서 네트워크 탭을 열어요. 404는 서버가 보낸 답장이지만 연결 오류에는 결과 번호가 없을 수 있어요. 서버 기록은 서버를 실행한 창이나 호스팅 서비스에서 찾아요.</p>
</details>
<details class="author-question">
<summary>초보 독자 Q. 502와 504는 어느 컴퓨터가 보내나요?</summary>
<p>A. 부탁을 전달하는 담당자(중간 서버)가 실제로 일하는 서버의 답을 기다려요. 쓸 수 없는 답을 받고 502를 보낼 수 있어요. 시간 안에 답을 못 받으면 504를 보내요.</p>
</details>
</aside>
</div>

</div>

</div>
