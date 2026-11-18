---
layout: post
title: "웹 앱은 서버와 어떻게 말을 주고받을까? 편지로 이해하는 HTTP 요청과 응답"
description: "브라우저와 앱이 서버에 일을 시키는 과정을 편지 주고받기 비유로 설명하고 HTTP 요청의 메서드·URL·헤더·본문과 응답의 상태 코드(200·404·500 등), 무상태와 쿠키, API와 JSON까지 실제 동작으로 이어서 설명합니다."
date: 2026-11-18 21:00:00 +0900
series: network
episode: 1
summary: "HTTP는 클라이언트와 서버가 함께 쓰는 편지 양식이에요. 받는 곳과 용건을 적어 요청을 보내면 서버는 맨 위에 결과 번호를 적은 답장으로 응답해요."
---

<div class="lesson lesson-hierarchy">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: Lucide (lucide-static v1.25.0, ISC). 라이선스: assets/icons/LICENSE-lucide.txt. 이름 대응: i-doc=file-text, i-check=circle-check, i-key=key-round, i-list=list-checks. rect·circle·line 요소는 같은 모양의 path로 옮겼어요. -->
<symbol id="i-user" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"/></symbol>
<symbol id="i-mail" viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 7l-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/></symbol>
<symbol id="i-mail-open" viewBox="0 0 24 24"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6ZM22 10l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/></symbol>
<symbol id="i-laptop" viewBox="0 0 24 24"><path d="M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2zM20.054 15.987H3.946"/></symbol>
<symbol id="i-server" viewBox="0 0 24 24"><path d="M4 2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM4 14h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2zM6 6h.01M6 18h.01"/></symbol>
<symbol id="i-doc" viewBox="0 0 24 24"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2zM14 2v5a1 1 0 0 0 1 1h5M10 9H8M16 13H8M16 17H8"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0zM9 12l2 2 4-4"/></symbol>
<symbol id="i-key" viewBox="0 0 24 24"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4zM16.5 7.5h.01"/></symbol>
<symbol id="i-list" viewBox="0 0 24 24"><path d="M13 5h8M13 12h8M13 19h8M3 17l2 2 4-4M3 7l2 2 4-4"/></symbol>
</defs>
</svg>

<div class="intro">
<p class="q">브라우저나 앱은 서버에게 어떻게 일을 시키고 결과를 받을까요?</p>
<p>네트워크(컴퓨터끼리 연결해 메시지를 주고받는 것) 시리즈의 첫 편이에요. AI에게 시켜 만든 앱을 돌리다 보면 화면이나 로그(프로그램이 남기는 기록)에 <code>404</code>, <code>500</code>, <code>401</code>이나 "API 호출 실패" 같은 말이 자주 나와요. 이 말들은 앱이 서버(요청을 받아 일을 처리해 주는 컴퓨터)와 주고받은 메시지의 결과인데 그 메시지가 어떻게 생겼는지 모르면 어디가 잘못됐는지 짐작하기 어려워요.</p>
<p>이 글을 다 읽으면 앱과 서버가 함께 쓰는 편지 양식인 <b>HTTP</b>가 왜 필요한지와 <b>요청</b>과 <b>응답</b>이 각각 무엇으로 이뤄지는지 알 수 있어요. <b>상태 코드</b>의 첫 숫자로 보낸 쪽 문제인지 서버 쪽 문제인지 짐작하는 법도 배워요. HTTP가 지난 요청을 기억하지 않는다는 것과 <b>API</b>가 이 흐름과 어떻게 이어지는지도 함께 봐요.</p>
</div>

<div class="slide-group">
<h2 class="slide-group-title">문제: 약속 없이 쓴 편지에는 답장이 없어요</h2>

<section class="slide">
<h3>각자 마음대로 쓴 편지는 읽을 수 없어요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="세 사람이 각자 다른 형식으로 편지를 써서 답장 담당자에게 보내는데 하나는 받는 곳이 없고 하나는 용건이 맨 끝에 있고 하나는 알아보기 힘든 글씨라서 담당자가 무슨 뜻인지 몰라 답장을 못 하는 그림">
<defs><marker id="m1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M58,46 L106,46"/>
<path class="line" d="M58,126 L106,126"/>
<path class="line" d="M58,206 L106,206"/>
<path class="line" d="M154,46 L284,104" marker-end="url(#m1)"/>
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
<text class="chip" x="130" y="242">알아보기 힘든 글씨</text>
<circle class="box" cx="330" cy="126" r="40"/><use class="ic" href="#i-user" x="304" y="100" width="52" height="52"/>
<text class="alert big" x="330" y="72">?</text>
<text class="big" x="330" y="186">답장 담당자</text><text class="alert" x="330" y="206">무슨 뜻이지?</text>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="0s" repeatCount="indefinite" path="M154,46 L284,104"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="0.5s" repeatCount="indefinite" path="M154,126 L282,126"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="1s" repeatCount="indefinite" path="M154,206 L284,148"/></circle>
</svg>
<p class="point">쓰는 사람마다 형식이 다르면 받는 사람은 무엇을 해 달라는 건지 알 수 없어요.</p>
<p class="explain">답장 담당자는 하루에도 수많은 사람에게서 편지를 받아요. 받는 곳과 용건이 어디에 적혀 있는지 정해져 있지 않으면 편지마다 해석하느라 오래 걸리고 잘못 읽기도 해요. 그래서 모두가 같은 양식으로 쓰자는 약속이 필요해요.</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>실제로는: 클라이언트가 먼저 요청하고 서버가 응답해요</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="왼쪽 클라이언트인 브라우저나 앱이 HTTP 양식으로 서버에 요청을 보내고 오른쪽 서버가 같은 양식으로 응답을 돌려주는 그림">
<defs><marker id="m2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M110,70 L288,70" marker-end="url(#m2)"/>
<path class="line" d="M290,110 L112,110" marker-end="url(#m2)"/>
<circle class="box" cx="70" cy="90" r="36"/><use class="ic" href="#i-laptop" x="48" y="68" width="44" height="44"/>
<circle class="box" cx="330" cy="90" r="36"/><use class="ic" href="#i-server" x="308" y="68" width="44" height="44"/>
<text class="chip" x="200" y="56">요청</text>
<rect class="kafka" x="150" y="78" width="100" height="24" rx="5"/><text class="chip" x="200" y="90">HTTP 양식</text>
<text class="chip" x="200" y="126">응답</text>
<text class="big" x="70" y="150">클라이언트</text><text class="small" x="70" y="170">브라우저 · 앱</text>
<text class="big" x="330" y="150">서버</text><text class="small" x="330" y="170">일을 처리하는 컴퓨터</text>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0s" repeatCount="indefinite" path="M110,70 L288,70"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.9s" repeatCount="indefinite" path="M290,110 L112,110"/></circle>
</svg>
<p class="point">HTTP에서는 보통 클라이언트가 먼저 요청을 보내고 서버가 그 요청에 응답해요.</p>
<p class="explain">클라이언트는 브라우저나 앱처럼 일을 부탁하는 쪽으로 편지를 쓰는 사람이고 서버는 부탁을 받아 처리하는 답장 담당자예요. 둘이 메시지를 주고받는 방식을 미리 정해 둔 약속을 프로토콜이라고 하고 웹에서 쓰는 약속이 HTTP(HyperText Transfer Protocol)예요. 클라이언트가 HTTP 양식에 맞춰 요청을 보내면 서버는 같은 양식으로 응답을 돌려줘요. 서버가 먼저 알림을 보내야 할 때는 WebSocket(연결을 열어 두고 양쪽이 자유롭게 보내는 방식) 같은 별도 방법을 써요.</p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 브라우저 주소창에 사이트 주소를 칠 때도 이 요청과 응답이 오가나요?</summary>
<p>A. 네. 브라우저가 주소를 보고 요청을 만들어 서버에 보내고 서버가 웹 페이지를 응답으로 돌려줘요. 앱이 API를 부를 때도 같은 양식을 써서 사람이 보는 화면 대신 데이터를 받아 와요.</p>
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
<h2 class="slide-group-title">요청: 받는 곳과 용건을 적은 편지</h2>

<section class="slide">
<h3>편지는 정해진 순서로 써요</h3>
<svg class="dg" viewBox="0 0 400 260" role="img" aria-label="편지 한 장이 맨 윗줄의 용건과 받는 곳과 양식 버전, 그 아래 첨부 서류 두 장, 한 줄 비우기, 맨 아래 편지 내용 순서로 이뤄진 그림">
<defs><marker id="m3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M102,80 L126,80" marker-end="url(#m3)"/>
<circle class="kafka" cx="60" cy="80" r="40"/><use class="ic" href="#i-mail" x="34" y="54" width="52" height="52"/>
<text class="big" x="60" y="140">편지</text>
<rect class="box" x="130" y="10" width="260" height="240" rx="8"/>
<rect class="kafka" x="145" y="24" width="230" height="40" rx="5"/><text class="chip" x="260" y="44">용건 · 받는 곳 · 양식 버전</text>
<rect class="box" x="145" y="74" width="230" height="30" rx="5"/><use class="ic" href="#i-doc" x="155" y="80" width="18" height="18"/><text class="chip" x="260" y="89">첨부 서류</text>
<rect class="box" x="145" y="110" width="230" height="30" rx="5"/><use class="ic" href="#i-doc" x="155" y="116" width="18" height="18"/><text class="chip" x="260" y="125">첨부 서류</text>
<rect class="line dash" x="145" y="148" width="230" height="24" rx="5"/><text class="small" x="260" y="160">한 줄 비우기</text>
<rect class="box" x="145" y="182" width="230" height="54" rx="5"/><text class="chip" x="260" y="209">편지 내용</text>
</svg>
<p class="point">편지는 맨 위에 용건과 받는 곳을 쓰고 서류를 붙인 뒤 한 줄 띄고 내용을 적어요.</p>
<p class="explain">받는 곳은 봉투 겉면의 주소처럼 맨 윗줄에 적고 용건도 함께 적어서 답장 담당자는 그 줄만 보고 무슨 일인지와 어디로 넘길지를 정해요. 첨부 서류에는 내용이 어떤 형식인지나 로그인했다는 증명 같은 정보가 붙어요. 한 줄을 비워 두는 건 서류가 끝나고 내용이 시작된다는 표시예요.</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>실제로는: 요청은 요청 줄과 헤더와 본문으로 이뤄져요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="할 일을 저장하는 HTTP 요청 예시로 요청 줄 POST /api/todos HTTP/1.1, 헤더 Host: example.com과 Content-Type: application/json, 빈 줄, 본문 title 우유 사기가 차례로 놓인 그림">
<text class="label" x="10" y="40">요청 줄</text>
<text class="label" x="10" y="88">헤더</text>
<text class="label" x="10" y="133">빈 줄</text>
<text class="label" x="10" y="178">본문</text>
<rect class="box" x="100" y="14" width="290" height="200" rx="8"/>
<rect class="kafka" x="108" y="24" width="274" height="32" rx="5"/><text class="chip mono" x="118" y="40" style="text-anchor:start">POST /api/todos HTTP/1.1</text>
<rect class="line" x="108" y="62" width="274" height="52" rx="5"/>
<text class="chip mono" x="118" y="76" style="text-anchor:start">Host: example.com</text>
<text class="chip mono" x="118" y="100" style="text-anchor:start">Content-Type: application/json</text>
<rect class="line dash" x="108" y="122" width="274" height="22" rx="5"/>
<rect class="box" x="108" y="152" width="274" height="52" rx="5"/><text class="chip mono" x="118" y="178" style="text-anchor:start">{"title": "우유 사기"}</text>
<text class="small" x="245" y="234">요청 줄 = 메서드 · 요청 대상 · 버전</text>
</svg>
<p class="point">HTTP/1.1 요청 메시지는 요청 줄과 헤더 여러 줄 그리고 빈 줄 뒤의 본문으로 이뤄져요.</p>
<p class="explain">편지의 맨 윗줄에 해당하는 요청 줄에는 메서드(용건의 종류)와 요청 대상(서버 안에서 받는 곳)과 HTTP 버전이 들어가요. 헤더는 <code>이름: 값</code> 꼴로 붙이는 첨부 서류로 <code>Content-Type</code>은 본문 형식(예: <code>application/json</code>은 중괄호 안에 이름과 값을 짝지어 적는 JSON이라는 글자 형식)을, <code>Accept</code>는 받고 싶은 응답 형식을, <code>Authorization</code>은 로그인했다는 증명 같은 인증 정보를 알려요. 서버 주소만으로는 어느 사이트로 가는 편지인지 가리기 어려워서 HTTP/1.1에서는 사이트 이름을 적는 <code>Host</code> 헤더가 꼭 있어야 하고 빠지면 서버는 잘못된 요청(<code>400</code>)으로 답해야 해요. 본문은 편지 내용이라 이 예처럼 저장할 데이터를 보낼 때 붙여요.</p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 이런 요청은 개발자가 한 줄씩 직접 쓰나요?</summary>
<p>A. 보통은 쓰지 않아요. 브라우저나 앱 코드가 쓰는 도구가 요청 줄과 헤더를 만들어 주고 개발자는 주소와 메서드와 보낼 데이터만 정해요.</p>
</details>
</aside>
</div>

<section class="slide">
<h3>실제로는: URL은 받는 곳을 적은 주소예요</h3>
<svg class="dg" viewBox="0 0 400 170" role="img" aria-label="https://example.com:443/api/todos?page=2#top 주소를 스킴, 호스트, 포트, 경로, 쿼리, 조각 여섯 부분으로 나누고 경로와 쿼리는 요청 대상에 들어가며 #top 조각은 서버로 보내지 않는다는 그림">
<path class="line" d="M211,24 L211,18 L359,18 L359,24"/>
<text class="small" x="285" y="8">요청 대상에 들어가요</text>
<rect class="box" x="5" y="30" width="68" height="40" rx="5"/><text class="chip mono" x="39" y="50">https://</text>
<rect class="kafka" x="73" y="30" width="96" height="40" rx="5"/><text class="chip mono" x="121" y="50">example.com</text>
<rect class="box" x="169" y="30" width="42" height="40" rx="5"/><text class="chip mono" x="190" y="50">:443</text>
<rect class="box" x="211" y="30" width="86" height="40" rx="5"/><text class="chip mono" x="254" y="50">/api/todos</text>
<rect class="box" x="297" y="30" width="62" height="40" rx="5"/><text class="chip mono" x="328" y="50">?page=2</text>
<rect class="line dash" x="359" y="30" width="36" height="40" rx="5"/><text class="chip mono" x="377" y="50">#top</text>
<text class="chip" x="39" y="88">스킴</text><text class="chip" x="121" y="88">호스트</text><text class="chip" x="190" y="88">포트</text><text class="chip" x="254" y="88">경로</text><text class="chip" x="328" y="88">쿼리</text><text class="chip" x="377" y="88">조각</text>
<text class="small" x="39" y="108">방식</text><text class="small" x="121" y="108">어느 서버</text><text class="small" x="190" y="108">몇 번 문</text><text class="small" x="254" y="108">어떤 자원</text><text class="small" x="328" y="108">조건</text>
<rect class="line" x="10" y="124" width="380" height="36" rx="12"/>
<text class="alert" x="200" y="142">#top은 브라우저만 쓰고 서버로 보내지 않아요</text>
</svg>
<p class="point">URL은 어떤 방식으로 어느 서버의 몇 번 문에 있는 어떤 자원을 원하는지 적은 주소예요.</p>
<p class="explain">스킴은 편지를 보내는 방식이고 <code>https</code>는 TLS라는 방식으로 내용을 암호화(남이 읽지 못하게 뒤섞기)한 HTTP예요. 호스트는 서버의 이름이고 포트는 그 서버에서 편지를 받는 문 번호인데 <code>http</code>는 80번, <code>https</code>는 443번이 기본이라 보통 생략해요. 경로와 쿼리는 서버가 다루는 글이나 주문 같은 자원 가운데 무엇을 어떤 조건으로 원하는지 알려 주고 요청 줄의 요청 대상에 그대로 들어가고 호스트는 <code>Host</code> 헤더로 들어가요.</p>
</section>

<section class="slide">
<h3>실제로는: 메서드는 무엇을 해 달라는지 알리는 용건이에요</h3>
<table>
<thead><tr><th>메서드</th><th>용건</th><th>예</th></tr></thead>
<tbody>
<tr><td><code>GET</code></td><td>지금 있는 것을 보여 주세요</td><td>할 일 목록 보기</td></tr>
<tr><td><code>POST</code></td><td>보낸 내용을 정해진 대로 처리해 주세요</td><td>새 할 일 추가하기</td></tr>
<tr><td><code>PUT</code></td><td>이 내용으로 통째로 바꿔 주세요(없으면 만들어 주세요)</td><td>할 일 하나를 전부 다시 쓰기</td></tr>
<tr><td><code>PATCH</code></td><td>일부만 고쳐 주세요</td><td>완료 표시만 바꾸기</td></tr>
<tr><td><code>DELETE</code></td><td>지워 주세요</td><td>할 일 하나 지우기</td></tr>
</tbody>
</table>
<p class="point">같은 주소로 보내도 메서드에 따라 서버가 하는 일이 달라져요.</p>
<p class="explain">클라이언트는 요청 줄 맨 앞에 메서드를 적어 같은 <code>/api/todos</code>에 보내도 보기인지 추가인지 알려요. <code>GET</code>은 서버의 상태를 바꾸지 않는 안전한 요청이에요. <code>PUT</code>과 <code>DELETE</code>는 같은 요청을 여러 번 보내도 서버에 남는 결과가 한 번 보낸 것과 같지만 <code>POST</code>는 보낼 때마다 새 항목이 생길 수 있어요.</p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">응답: 결과 번호를 적은 답장</h2>

<section class="slide">
<h3>답장 맨 위에는 처리 결과 번호가 있어요</h3>
<svg class="dg" viewBox="0 0 400 270" role="img" aria-label="답장 담당자가 편지 쓴 사람에게 답장을 보내고 답장 맨 위의 결과 번호가 2로 시작하면 잘 처리했다는 뜻, 4로 시작하면 보낸 편지에 문제가 있다는 뜻, 5로 시작하면 담당자 쪽 사정으로 못 했다는 뜻인 그림">
<defs><marker id="m4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M290,60 L104,60" marker-end="url(#m4)"/>
<circle class="box" cx="70" cy="60" r="30"/><use class="ic" href="#i-user" x="52" y="42" width="36" height="36"/>
<circle class="kafka" cx="330" cy="60" r="36"/><use class="ic" href="#i-user" x="308" y="38" width="44" height="44"/>
<text class="chip" x="197" y="44">답장</text>
<text class="big" x="70" y="112">편지 쓴 사람</text>
<text class="big" x="330" y="112">답장 담당자</text>
<rect class="line" x="10" y="134" width="380" height="126" rx="12"/>
<text class="label center" x="200" y="154">답장 맨 위의 결과 번호</text>
<circle class="kafka" cx="75" cy="190" r="20"/><use class="ic" href="#i-check" x="62" y="177" width="26" height="26"/>
<circle class="bad" cx="200" cy="190" r="20"/><use class="ic" href="#i-mail" x="187" y="177" width="26" height="26"/>
<circle class="bad" cx="325" cy="190" r="20"/><use class="ic" href="#i-user" x="312" y="177" width="26" height="26"/>
<text class="chip" x="75" y="226">2로 시작</text><text class="small" x="75" y="246">잘 처리했어요</text>
<text class="chip" x="200" y="226">4로 시작</text><text class="small" x="200" y="246">보낸 편지에 문제</text>
<text class="chip" x="325" y="226">5로 시작</text><text class="small" x="325" y="246">담당자 쪽 사정</text>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="0s" repeatCount="indefinite" path="M290,60 L104,60"/></circle>
</svg>
<p class="point">답장 담당자는 맨 위에 결과 번호를 적어서 내용을 읽기 전에 결과부터 알 수 있게 해요.</p>
<p class="explain">편지 쓴 사람은 답장을 다 읽기 전에 첫 숫자만 보고 일이 잘 됐는지 알아요. 첫 숫자가 같으면 비슷한 종류의 결과라서 처음 보는 번호도 대략 짐작할 수 있어요. 번호 아래에는 요청 편지처럼 첨부 서류와 답장 내용이 이어져요.</p>
</section>

<section class="slide">
<h3>실제로는: 응답은 상태 줄과 헤더와 본문으로 이뤄져요</h3>
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
<text class="small" x="245" y="212">상태 줄 = 버전 · 상태 코드 · 사유 문구</text>
</svg>
<p class="point">HTTP/1.1 응답 메시지도 상태 줄과 헤더와 빈 줄 뒤의 본문으로 요청과 비슷한 모양이에요.</p>
<p class="explain">서버는 요청을 처리한 뒤 상태 줄에 HTTP 버전과 상태 코드(처리 결과를 알리는 세 자리 숫자)와 사람이 읽는 사유 문구를 적어요. 사유 문구는 빠질 수도 있어서 프로그램은 숫자를 보고 판단해요. 헤더의 <code>Content-Type</code>은 본문이 JSON인지 웹 페이지(HTML)인지 알려 줘서 클라이언트가 본문을 알맞게 읽게 해요. 이 예는 앞의 할 일 저장 요청을 받은 서버가 7번 항목을 새로 만들고 <code>201</code>로 답한 모습이에요.</p>
</section>

<section class="slide">
<h3>실제로는: 상태 코드는 첫 숫자로 다섯 종류로 나뉘어요</h3>
<table>
<thead><tr><th>첫 숫자</th><th>뜻</th><th>자주 보는 코드</th></tr></thead>
<tbody>
<tr><td><code>1xx</code></td><td>정보: 처리가 끝나기 전의 중간 안내</td><td>앱 화면에서 볼 일은 드물어요</td></tr>
<tr><td><code>2xx</code></td><td>성공: 요청을 잘 처리했어요</td><td><code>200 OK</code> 처리 완료 · <code>201 Created</code> 새로 만듦</td></tr>
<tr><td><code>3xx</code></td><td>리다이렉션: 응답이 알려 주는 다른 주소로 한 번 더 요청해야 해요</td><td><code>301 Moved Permanently</code> 주소가 아주 옮겨 갔어요</td></tr>
<tr><td><code>4xx</code></td><td>클라이언트 오류: 보낸 요청에 문제가 있어요</td><td><code>400 Bad Request</code> 형식이 잘못됨 · <code>401</code> · <code>403</code> · <code>404 Not Found</code> 못 찾음</td></tr>
<tr><td><code>5xx</code></td><td>서버 오류: 서버가 처리하지 못했어요</td><td><code>500 Internal Server Error</code> 서버 안의 오류 · <code>503 Service Unavailable</code> 잠시 이용 불가</td></tr>
</tbody>
</table>
<p class="point">상태 코드의 첫 숫자만 보면 어떤 종류의 결과인지 알 수 있어요.</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>4xx면 보낸 쪽을 5xx면 서버 쪽을 먼저 봐요</h3>
<svg class="dg" viewBox="0 0 400 240" role="img" aria-label="클라이언트가 서버에 요청을 보내고 응답을 받는데 응답이 4xx면 왼쪽 클라이언트 쪽의 주소와 경로, 로그인 정보, 보낸 데이터 형식을 살피고 5xx면 오른쪽 서버 쪽의 서버 로그, 점검과 과부하, 서버 코드 오류를 살핀다는 그림">
<defs><marker id="m5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M106,48 L290,48" marker-end="url(#m5)"/>
<path class="line" d="M294,74 L110,74" marker-end="url(#m5)"/>
<circle class="box" cx="70" cy="60" r="32"/><use class="ic" href="#i-laptop" x="52" y="42" width="36" height="36"/>
<circle class="box" cx="330" cy="60" r="32"/><use class="ic" href="#i-server" x="312" y="42" width="36" height="36"/>
<text class="chip" x="200" y="34">요청</text><text class="chip" x="200" y="90">응답</text>
<text class="big" x="70" y="114">클라이언트</text><text class="big" x="330" y="114">서버</text>
<rect class="bad" x="10" y="136" width="185" height="96" rx="12"/>
<text class="label center" x="102" y="156">4xx면 이쪽</text>
<text class="chip" x="102" y="180">주소 · 경로</text><text class="chip" x="102" y="200">로그인 정보</text><text class="chip" x="102" y="220">보낸 데이터 형식</text>
<rect class="bad" x="205" y="136" width="185" height="96" rx="12"/>
<text class="label center" x="297" y="156">5xx면 이쪽</text>
<text class="chip" x="297" y="180">서버 로그</text><text class="chip" x="297" y="200">점검 · 과부하</text><text class="chip" x="297" y="220">서버 코드 오류</text>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0s" repeatCount="indefinite" path="M106,48 L290,48"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.9s" repeatCount="indefinite" path="M294,74 L110,74"/></circle>
</svg>
<p class="point">상태 코드가 4로 시작하면 보낸 요청을 5로 시작하면 서버를 먼저 살펴요.</p>
<p class="explain">AI가 만든 앱에서 오류가 나면 먼저 응답의 상태 코드부터 확인해요. 4xx는 서버가 편지를 읽어 보고 보낸 쪽 잘못으로 처리할 수 없다고 돌려보낸 것이라 보통 요청을 고치면 풀려요. 5xx는 요청이 제대로여도 서버가 처리하다 실패한 것이라 서버의 로그(서버가 남긴 작업 기록)를 봐야 해요.</p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 내 앱에서 상태 코드는 어디서 볼 수 있나요?</summary>
<p>A. 브라우저의 개발자 도구(보통 F12 키)에 있는 네트워크 탭에서 요청마다 상태 코드를 볼 수 있어요. 서버 로그는 서버를 실행한 터미널이나 서버를 빌려 주는 서비스의 로그 화면에서 볼 수 있어요.</p>
</details>
</aside>
</div>

<section class="slide">
<h3>이럴 땐 조심해요: 헷갈리기 쉬운 상태 코드</h3>
<table>
<thead><tr><th>오해</th><th>실제</th></tr></thead>
<tbody>
<tr><td><code>401</code>과 <code>403</code>은 둘 다 권한이 없다는 같은 뜻이라고 생각하기 쉬워요</td><td><code>401 Unauthorized</code>는 이름과 달리 유효한 인증 정보가 없다는 뜻이라 로그인부터 다시 확인해요. <code>403 Forbidden</code>은 요청을 이해했지만 들어주지 않겠다는 뜻이라 로그인했어도 그 일을 할 권한이 없을 때 나와요</td></tr>
<tr><td><code>404</code>가 나오면 서버가 꺼졌다고 생각하기 쉬워요</td><td>서버는 살아서 답장을 보냈어요. 그 주소의 자원을 찾지 못했거나 있어도 숨기고 싶다는 뜻이라 경로 오타나 지워진 항목을 먼저 봐요. 서버에 아예 닿지 못하면 상태 코드 없이 연결 오류가 나거나 요청을 대신 전달하는 중간 서버가 <code>502</code>(받은 응답이 잘못됨)나 <code>504</code>(응답이 제때 오지 않음)로 대신 답해요</td></tr>
<tr><td>4xx는 언제나 내 코드가 틀린 것이라고 생각하기 쉬워요</td><td><code>429 Too Many Requests</code>는 짧은 시간에 요청을 너무 많이 보냈다는 뜻이라 코드는 맞아도 잠시 기다렸다 다시 보내야 해요</td></tr>
</tbody>
</table>
<p class="point">첫 숫자로 방향을 잡은 뒤 그 코드의 정확한 뜻까지 확인해야 엉뚱한 곳을 고치지 않아요.</p>
<p>참고: <a href="https://www.rfc-editor.org/rfc/rfc9110#section-15">RFC 9110 상태 코드</a> · <a href="https://www.rfc-editor.org/rfc/rfc6585">RFC 6585 (429)</a> · <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status">MDN: HTTP 상태 코드</a></p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">무상태와 API: 편지마다 새로 읽는 답장 담당자</h2>

<section class="slide">
<h3>답장 담당자는 앞 편지를 기억하지 못해요</h3>
<svg class="dg" viewBox="0 0 400 280" role="img" aria-label="한 사람이 첫 편지에 저는 민지예요라고 쓰고 두 번째 편지에 제 주문 보여 주세요라고 보내자 답장 담당자는 두 번째 편지가 누구 부탁인지 모르고 그래서 편지마다 확인표를 같이 넣는다는 그림">
<defs><marker id="m6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M62,90 L128,58"/>
<path class="line" d="M62,110 L128,142"/>
<path class="line" d="M174,50 L302,96" marker-end="url(#m6)"/>
<path class="line" d="M174,150 L302,124" marker-end="url(#m6)"/>
<circle class="box" cx="40" cy="100" r="24"/><use class="ic" href="#i-user" x="27" y="87" width="26" height="26"/>
<circle class="box" cx="150" cy="50" r="22"/><use class="ic" href="#i-mail" x="137" y="37" width="26" height="26"/>
<circle class="box" cx="150" cy="150" r="22"/><use class="ic" href="#i-mail" x="137" y="137" width="26" height="26"/>
<text class="chip" x="150" y="86">1 저는 민지예요</text>
<text class="chip" x="150" y="186">2 제 주문 보여 주세요</text>
<circle class="kafka" cx="340" cy="110" r="38"/><use class="ic" href="#i-user" x="316" y="86" width="48" height="48"/>
<text class="big" x="340" y="168">답장 담당자</text><text class="alert" x="340" y="188">2번은 누구 부탁?</text>
<rect class="line" x="10" y="206" width="380" height="66" rx="12"/>
<text class="label center" x="200" y="222">그래서 편지마다</text>
<circle class="box" cx="120" cy="252" r="17"/><use class="ic" href="#i-mail" x="109" y="241" width="22" height="22"/>
<text x="150" y="252">+</text>
<circle class="new" cx="180" cy="252" r="17"/><use class="ic" href="#i-key" x="169" y="241" width="22" height="22"/>
<text class="chip" x="286" y="252">확인표를 같이 넣어요</text>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="0s" repeatCount="indefinite" path="M174,50 L302,96"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="0.8s" repeatCount="indefinite" path="M174,150 L302,124"/></circle>
</svg>
<p class="point">답장 담당자는 지난 편지를 기억하지 않고 지금 받은 편지만 보고 답해요.</p>
<p class="explain">담당자는 편지를 받을 때마다 그 한 장만 읽고 답장을 써요. 그래서 앞 편지에서 누구인지 밝혔어도 다음 편지에 다시 알리지 않으면 누구의 부탁인지 몰라요. 편지 쓰는 사람은 자기가 누구인지 알려 주는 확인표를 편지마다 함께 넣어요.</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>실제로는: HTTP는 요청을 하나씩 따로 이해해요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="클라이언트가 로그인 요청을 보내면 서버가 200과 함께 확인표를 돌려주고 클라이언트는 다음 주문 조회 요청에 그 확인표를 붙여 보내는 순서 그림">
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
<text class="chip" x="200" y="146">200 + 확인표</text>
<rect class="new" x="112" y="184" width="176" height="24" rx="5"/><text class="chip mono" x="200" y="196">GET /orders + 확인표</text>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="0s" repeatCount="indefinite" path="M64,110 L334,110"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="0.8s" repeatCount="indefinite" path="M336,160 L66,160"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="1.6s" repeatCount="indefinite" path="M64,210 L334,210"/></circle>
</svg>
<p class="point">HTTP는 요청 사이를 저절로 기억하지 않아서 클라이언트가 필요한 정보를 요청마다 함께 보내요.</p>
<p class="explain">HTTP가 무상태(stateless)라는 말은 서버가 각 요청을 앞뒤 요청 없이 그 메시지만으로 이해할 수 있다는 뜻이에요. 명세(HTTP를 적은 공식 문서)는 같은 연결(두 컴퓨터가 이어 둔 통신 통로)로 온 두 요청이라도 같은 사용자의 것이라고 서버가 함부로 가정하면 안 된다고 정해요. 그래서 로그인할 때 서버가 건넨 확인표를 브라우저는 쿠키(서버가 맡긴 작은 기록을 저장했다가 다음 요청에 붙여 보내는 것)로 보관하고 앱은 토큰(로그인했다는 증명 문자열)으로 <code>Authorization</code> 헤더에 붙여 보내기도 해요. 쿠키와 토큰이 어떻게 만들어지고 지켜지는지는 다음 편에서 봐요.</p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 서버가 확인표를 알아본다면 결국 서버가 기억하는 것 아닌가요?</summary>
<p>A. 서버가 확인표로 누구인지 찾아보는 건 맞아요. 하지만 HTTP가 요청 사이를 저절로 이어 주지는 않아서 클라이언트가 요청마다 확인표를 붙여야 서버가 알아봐요. 서버가 로그인 정보를 어떻게 저장해 두는지는 다음 편에서 봐요.</p>
</details>
</aside>
</div>

<section class="slide">
<h3>담당자는 받아 주는 편지 양식을 목록으로 알려 줘요</h3>
<svg class="dg" viewBox="0 0 400 236" role="img" aria-label="답장 담당자가 목록을 보여 주세요, 새로 적어 주세요, 이 항목을 지워 주세요 세 가지 편지 양식을 받아 준다고 알려 주고 양식에 없는 편지는 받아 주지 않는다는 그림">
<defs><marker id="m8" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M110,90 L156,90" marker-end="url(#m8)"/>
<circle class="kafka" cx="70" cy="90" r="36"/><use class="ic" href="#i-user" x="48" y="68" width="44" height="44"/>
<text class="big" x="70" y="146">답장 담당자</text>
<rect class="line" x="160" y="10" width="230" height="180" rx="12"/>
<text class="label center" x="275" y="30">받아 주는 편지 양식</text>
<circle class="box" cx="190" cy="66" r="17"/><use class="ic" href="#i-mail" x="179" y="55" width="22" height="22"/>
<text class="chip" x="216" y="66" style="text-anchor:start">목록을 보여 주세요</text>
<circle class="box" cx="190" cy="112" r="17"/><use class="ic" href="#i-mail" x="179" y="101" width="22" height="22"/>
<text class="chip" x="216" y="112" style="text-anchor:start">새로 적어 주세요</text>
<circle class="box" cx="190" cy="158" r="17"/><use class="ic" href="#i-mail" x="179" y="147" width="22" height="22"/>
<text class="chip" x="216" y="158" style="text-anchor:start">이 항목을 지워 주세요</text>
<text class="small" x="200" y="220">양식에 없는 편지는 받아 주지 않아요</text>
</svg>
<p class="point">담당자가 어떤 편지를 어떤 양식으로 받아 주는지 미리 알려 주면 쓰는 사람은 그대로 쓰기만 하면 돼요.</p>
<p class="explain">편지 쓰는 사람은 담당자 안에서 일이 어떻게 처리되는지 몰라도 돼요. 목록에 있는 양식대로 쓰면 답장이 오고 목록에 없는 부탁을 하면 거절 답장이 와요. 담당자가 일하는 방식을 바꿔도 목록만 그대로면 쓰는 사람은 고칠 것이 없어요.</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>실제로는: API는 서버가 받아 주는 요청 목록이에요</h3>
<table>
<thead><tr><th>요청</th><th>하는 일</th><th>본문 (JSON)</th></tr></thead>
<tbody>
<tr><td><code>GET /api/todos</code></td><td>할 일 목록 받기</td><td>응답 본문에 목록이 와요</td></tr>
<tr><td><code>POST /api/todos</code></td><td>할 일 추가하기</td><td>요청 본문 <code>{"title": "우유 사기"}</code></td></tr>
<tr><td><code>PATCH /api/todos/7</code></td><td>7번 일부 고치기</td><td>요청 본문 <code>{"done": true}</code></td></tr>
<tr><td><code>DELETE /api/todos/7</code></td><td>7번 지우기</td><td>없어요</td></tr>
</tbody>
</table>
<p class="point">API는 서버가 어떤 요청을 어떤 형식으로 받아 주는지 정해 둔 약속이에요.</p>
<p class="explain">API(Application Programming Interface)는 한 프로그램이 다른 프로그램의 기능을 쓰게 해 주는 약속이고 웹에서는 보통 이런 HTTP 요청 목록으로 만들어요. 앱이 "API를 호출한다"는 말은 이 목록 가운데 하나에 맞춰 서버에 요청을 보내고 응답을 받는다는 뜻이에요. 본문에는 앞에서 본 JSON을 흔히 쓰고 <code>Content-Type</code> 헤더에 <code>application/json</code>이라고 적어요.</p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. "REST API"라는 말도 자주 보이는데 API와 무엇이 다른가요?</summary>
<p>A. REST는 로이 필딩(Roy Fielding)이 2000년 박사 논문에서 제안한 설계 방식의 이름이에요. 흔히 말하는 REST API는 위 표처럼 HTTP로 자원을 주고받는 API를 느슨하게 부르는 말인 경우가 많아요. 필딩 본인은 하이퍼텍스트(링크)로 움직이지 않으면 REST API가 아니라고 말했어요.</p>
</details>
</aside>
</div>

<section class="slide">
<h3>한눈에 다시 보기: 이 글의 다섯 줄</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="HTTP는 클라이언트가 요청하고 서버가 응답하는 약속이고 요청은 메서드와 URL과 헤더와 본문으로 이뤄지며 응답의 상태 코드는 4xx면 보낸 쪽 5xx면 서버 쪽 문제이고 서버는 요청마다 따로 이해하므로 필요한 정보를 같이 보내며 API는 서버가 받아 주는 요청 목록이라는 다섯 줄 요약 그림">
<circle class="kafka" cx="30" cy="28" r="18"/><use class="ic" href="#i-laptop" x="19" y="17" width="22" height="22"/>
<text class="label" x="62" y="19">HTTP</text><text class="small" x="62" y="38" style="text-anchor:start">클라이언트가 요청하고 서버가 응답하는 약속</text>
<circle class="kafka" cx="30" cy="76" r="18"/><use class="ic" href="#i-mail" x="19" y="65" width="22" height="22"/>
<text class="label" x="62" y="67">요청</text><text class="small" x="62" y="86" style="text-anchor:start">메서드와 URL로 용건과 받는 곳을 적어요</text>
<circle class="box" cx="30" cy="124" r="18"/><use class="ic" href="#i-mail-open" x="19" y="113" width="22" height="22"/>
<text class="label" x="62" y="115">응답과 상태 코드</text><text class="small" x="62" y="134" style="text-anchor:start">4xx는 보낸 쪽 문제이고 5xx는 서버 쪽 문제</text>
<circle class="new" cx="30" cy="172" r="18"/><use class="ic" href="#i-key" x="19" y="161" width="22" height="22"/>
<text class="label" x="62" y="163">무상태</text><text class="small" x="62" y="182" style="text-anchor:start">HTTP가 기억하지 않아 확인표를 매번 보내요</text>
<circle class="kafka" cx="30" cy="220" r="18"/><use class="ic" href="#i-list" x="19" y="209" width="22" height="22"/>
<text class="label" x="62" y="211">API</text><text class="small" x="62" y="230" style="text-anchor:start">서버가 받아 주는 요청 목록</text>
</svg>
<p class="point">약속된 양식으로 편지를 보내고 결과 번호가 적힌 답장을 받는 것이 HTTP예요.</p>
</section>
</div>

</div>
