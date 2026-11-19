---
layout: post
title: "서버는 로그인한 사람을 어떻게 알아볼까? 편지로 이해하는 쿠키·세션·토큰"
description: "HTTP가 요청 사이를 기억하지 않는데도 로그인이 이어지는 이유를 편지와 확인표 비유로 설명하고 쿠키(Set-Cookie·Cookie 헤더)와 세션 ID, JWT 토큰과 Authorization: Bearer의 차이, 세션 하이재킹과 HttpOnly·Secure·SameSite, XSS·CSRF, 인증과 인가까지 실제 동작으로 이어서 설명합니다."
date: 2026-11-19 21:00:00 +0900
series: network
episode: 2
summary: "서버는 로그인할 때 한 번만 확인하고 확인표를 건네요. 담당자가 장부에 적어 두고 번호표를 주면 세션이고 확인표에 도장을 찍어 주면 토큰이에요."
---

<div class="lesson lesson-hierarchy">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: Lucide (lucide-static v1.25.0, ISC). 라이선스: assets/icons/LICENSE-lucide.txt. 이름 대응: i-check=circle-check, i-key=key-round, i-list=list-checks, i-book=book-open, i-mask=venetian-mask, i-badge=badge-check, i-trash=trash-2. rect·circle·line 요소는 같은 모양의 path로 옮겼어요. -->
<symbol id="i-user" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"/></symbol>
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
<symbol id="i-mask" viewBox="0 0 24 24"><path d="M18 11c-1.5 0-2.5.5-3 2M4 6a2 2 0 0 0-2 2v4a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V8a2 2 0 0 0-2-2h-3a8 8 0 0 0-5 2 8 8 0 0 0-5-2zM6 11c1.5 0 2.5.5 3 2"/></symbol>
<symbol id="i-badge" viewBox="0 0 24 24"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76ZM9 12l2 2 4-4"/></symbol>
<symbol id="i-trash" viewBox="0 0 24 24"><path d="M10 11v6M14 11v6M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></symbol>
<symbol id="i-clock" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0zM12 6v6l4 2"/></symbol>
</defs>
</svg>

<div class="intro">
<p class="q">HTTP는 지난 요청을 기억하지 않는데 서버는 어떻게 로그인한 사람을 알아볼까요?</p>
<p>네트워크 시리즈의 두 번째 편이에요. 1편에서 HTTP는 요청을 하나씩 따로 이해해서 클라이언트가 자기가 누구인지 알려 주는 확인표를 요청마다 함께 보낸다고 했어요. 그 확인표를 누가 언제 만들고 어디에 두었다가 어떻게 보내는지 모르면 AI가 만든 앱에서 로그인이 자꾸 풀리거나 <code>401</code>이 나올 때 어디를 봐야 할지 알기 어려워요.</p>
<p>이 글을 다 읽으면 요청마다 비밀번호를 보내지 않고도 로그인을 이어 가는 두 방법인 <b>세션</b>과 <b>토큰</b>이 어떻게 다른지 알 수 있어요. 브라우저가 확인표를 보관했다가 붙여 주는 <b>쿠키</b>와 앱이 직접 붙이는 <code>Authorization</code> 헤더도 봐요. 확인표를 도둑맞으면 무슨 일이 생기고 어떻게 지키는지와 <b>인증</b>과 <b>인가</b>의 차이도 함께 봐요.</p>
</div>

<div class="slide-group">
<h2 class="slide-group-title">문제: 요청마다 신원을 밝혀야 해요</h2>

<section class="slide">
<h3>편지마다 비밀번호를 넣으면 번거로워요</h3>
<svg class="dg" viewBox="0 0 400 264" role="img" aria-label="한 사람이 편지 세 통을 답장 담당자에게 보내는데 편지마다 이름과 비밀번호를 넣어야 하고 담당자는 편지가 올 때마다 비밀번호를 다시 확인하는 그림">
<defs><marker id="n1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M62,92 L128,40"/>
<path class="line" d="M64,100 L128,100"/>
<path class="line" d="M62,108 L128,160"/>
<path class="line" d="M174,36 L294,88" marker-end="url(#n1)"/>
<path class="line" d="M174,100 L290,100" marker-end="url(#n1)"/>
<path class="line" d="M174,164 L294,112" marker-end="url(#n1)"/>
<circle class="box" cx="40" cy="100" r="24"/><use class="ic" href="#i-user" x="27" y="87" width="26" height="26"/>
<circle class="box" cx="150" cy="36" r="22"/><use class="ic" href="#i-mail" x="137" y="23" width="26" height="26"/>
<circle class="box" cx="150" cy="100" r="22"/><use class="ic" href="#i-mail" x="137" y="87" width="26" height="26"/>
<circle class="box" cx="150" cy="164" r="22"/><use class="ic" href="#i-mail" x="137" y="151" width="26" height="26"/>
<circle class="bad" cx="172" cy="18" r="11"/><use class="ic" href="#i-lock" x="164" y="10" width="16" height="16"/>
<circle class="bad" cx="172" cy="82" r="11"/><use class="ic" href="#i-lock" x="164" y="74" width="16" height="16"/>
<circle class="bad" cx="172" cy="146" r="11"/><use class="ic" href="#i-lock" x="164" y="138" width="16" height="16"/>
<circle class="kafka" cx="330" cy="100" r="36"/><use class="ic" href="#i-user" x="308" y="78" width="44" height="44"/>
<text class="big" x="330" y="156">답장 담당자</text><text class="alert" x="330" y="176">매번 다시 확인해요</text>
<rect class="line" x="10" y="196" width="380" height="60" rx="12"/>
<text class="label center" x="200" y="214">편지마다 넣는 것</text>
<circle class="bad" cx="140" cy="236" r="15"/><use class="ic" href="#i-lock" x="130" y="226" width="20" height="20"/>
<text class="chip" x="166" y="236" style="text-anchor:start">이름과 비밀번호</text>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="0s" repeatCount="indefinite" path="M174,36 L294,88"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="0.5s" repeatCount="indefinite" path="M174,100 L290,100"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="1s" repeatCount="indefinite" path="M174,164 L294,112"/></circle>
</svg>
<p class="point">담당자가 앞 편지를 기억하지 못하니 편지를 보낼 때마다 이름과 비밀번호를 다시 적어야 해요.</p>
<p class="explain">편지 쓰는 사람은 주문을 보거나 장바구니에 담을 때마다 편지를 한 통씩 보내요. 담당자는 편지마다 비밀번호가 맞는지 처음부터 다시 확인해요. 비밀번호가 적힌 편지가 여러 번 오갈수록 서버까지 가는 길목에서 누군가 엿볼 기회도 늘어나요.</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>실제로는: 요청마다 비밀번호를 보내면 새어 나갈 기회가 늘어요</h3>
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
<rect class="bad" x="106" y="84" width="188" height="24" rx="5"/><text class="chip mono" x="200" y="96">GET /orders + 비밀번호</text>
<rect class="bad" x="106" y="134" width="188" height="24" rx="5"/><text class="chip mono" x="200" y="146">GET /profile + 비밀번호</text>
<rect class="bad" x="106" y="184" width="188" height="24" rx="5"/><text class="chip mono" x="200" y="196">POST /cart + 비밀번호</text>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="0s" repeatCount="indefinite" path="M64,110 L334,110"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="0.8s" repeatCount="indefinite" path="M64,160 L334,160"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="1.6s" repeatCount="indefinite" path="M64,210 L334,210"/></circle>
</svg>
<p class="point">HTTP는 요청마다 따로 이해하므로 아무 장치가 없으면 클라이언트가 요청마다 비밀번호를 보내야 해요.</p>
<p class="explain">HTTP 명세(RFC 9110)는 각 요청 메시지를 그 하나만으로 이해할 수 있게 정해서 서버는 앞 요청을 보고 누구인지 짐작하지 않아요. 가장 단순한 방법은 요청마다 아이디와 비밀번호를 붙이는 것인데 그러면 앱은 비밀번호를 계속 들고 있어야 하고 서버는 요청마다 비밀번호를 대조해야 해요. 비밀번호는 한 번 새면 바꾸기 전까지 누구나 그 사람으로 로그인할 수 있어서 자주 보낼수록 위험해요.</p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 요즘은 HTTPS를 쓰니 길목에서 엿볼 수 없지 않나요?</summary>
<p>A. HTTPS는 오가는 내용을 암호화해서 길목에서 엿보기 어렵게 해 줘요. 그래도 요청마다 비밀번호를 보내면 앱이 비밀번호를 계속 들고 있어야 하고 서버도 매번 대조해야 해요. 확인표는 기한이 지나거나 서버가 지우면 쓸모가 없어지지만 비밀번호는 바꾸기 전까지 계속 통해서 한 번 새면 피해가 더 오래가요.</p>
</details>
</aside>
</div>

<section class="slide">
<h3>처음 한 번만 확인하고 확인표를 건네요</h3>
<svg class="dg" viewBox="0 0 400 240" role="img" aria-label="편지 쓴 사람이 처음 한 번만 비밀번호를 담은 편지를 보내면 답장 담당자가 확인표를 건네고 다음부터는 편지에 확인표만 넣어 보내는 순서 그림">
<defs><marker id="n3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line dash" d="M60,92 L60,232"/>
<path class="line dash" d="M340,92 L340,232"/>
<path class="line" d="M64,118 L334,118" marker-end="url(#n3)"/>
<path class="line" d="M336,168 L66,168" marker-end="url(#n3)"/>
<path class="line" d="M64,218 L334,218" marker-end="url(#n3)"/>
<circle class="box" cx="60" cy="40" r="28"/><use class="ic" href="#i-user" x="44" y="24" width="32" height="32"/>
<circle class="kafka" cx="340" cy="40" r="28"/><use class="ic" href="#i-user" x="324" y="24" width="32" height="32"/>
<text class="chip" x="60" y="80">편지 쓴 사람</text><text class="chip" x="340" y="80">답장 담당자</text>
<circle class="bad" cx="118" cy="100" r="13"/><use class="ic" href="#i-lock" x="110" y="92" width="16" height="16"/>
<text class="chip" x="214" y="100">처음 한 번만 비밀번호</text>
<circle class="new" cx="118" cy="150" r="13"/><use class="ic" href="#i-key" x="110" y="142" width="16" height="16"/>
<text class="chip" x="214" y="150">확인표를 건네요</text>
<circle class="new" cx="118" cy="200" r="13"/><use class="ic" href="#i-key" x="110" y="192" width="16" height="16"/>
<text class="chip" x="214" y="200">다음부터는 확인표만</text>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="0s" repeatCount="indefinite" path="M64,118 L334,118"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="0.8s" repeatCount="indefinite" path="M336,168 L66,168"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="1.6s" repeatCount="indefinite" path="M64,218 L334,218"/></circle>
</svg>
<p class="point">담당자가 처음 한 번만 비밀번호를 확인하고 확인표를 건네면 다음 편지부터는 확인표만 넣으면 돼요.</p>
<p class="explain">편지 쓴 사람은 처음 한 통에서 이름과 비밀번호로 자기가 누구인지 밝혀요. 담당자는 맞는지 확인한 뒤 이 사람만 쓸 확인표를 만들어 답장에 넣어 줘요. 이후에는 비밀번호가 오가지 않아서 엿볼 기회도 담당자의 확인 수고도 줄어요.</p>
</section>

<section class="slide">
<h3>실제로는: 로그인 뒤에는 확인표가 비밀번호를 대신해요</h3>
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
<text class="label center" x="200" y="142">확인표를 만드는 두 가지 방식</text>
<circle class="new" cx="110" cy="182" r="20"/><use class="ic" href="#i-ticket" x="97" y="169" width="26" height="26"/>
<text class="chip" x="110" y="216">세션 ID</text><text class="small" x="110" y="234">서버 저장소에서 찾아요</text>
<circle class="new" cx="290" cy="182" r="20"/><use class="ic" href="#i-stamp" x="277" y="169" width="26" height="26"/>
<text class="chip" x="290" y="216">토큰</text><text class="small" x="290" y="234">서명을 검증해요</text>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0s" repeatCount="indefinite" path="M94,46 L302,46"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.9s" repeatCount="indefinite" path="M306,68 L98,68"/></circle>
</svg>
<p class="point">로그인 요청 한 번에 비밀번호를 확인하고 그 뒤 요청에서는 서버가 건넨 확인표가 비밀번호를 대신해요.</p>
<p class="explain">로그인은 아이디와 비밀번호처럼 나만 아는 정보로 내가 누구인지 서버에 밝히는 일이에요. 서버는 비밀번호가 맞으면 확인표를 만들어 응답에 담고 클라이언트는 그 뒤 요청마다 비밀번호 대신 확인표를 보내요. 확인표를 만드는 방식은 크게 서버가 기억해 두는 세션과 서버가 서명(서버만 찍을 수 있는 도장 같은 표시)해 건네는 토큰으로 나뉘고 이어지는 묶음에서 차례로 봐요. 1편에서 다음 편으로 미뤄 둔 쿠키는 확인표를 나르는 방법이고 토큰은 확인표의 한 종류예요.</p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">세션과 쿠키: 서버가 기억하는 로그인</h2>

<section class="slide">
<h3>담당자는 장부에 적고 번호표를 건네요</h3>
<svg class="dg" viewBox="0 0 400 260" role="img" aria-label="답장 담당자가 편지 쓴 사람에게 4821번 번호표를 건네고 방문자 장부에 4821번은 민지이고 로그인했다고 적어 두며 다음 편지에 번호표가 오면 장부에서 그 번호를 찾는 그림">
<defs><marker id="n5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M302,60 L86,60" marker-end="url(#n5)"/>
<path class="line" d="M86,94 L302,94" marker-end="url(#n5)"/>
<circle class="box" cx="50" cy="76" r="28"/><use class="ic" href="#i-user" x="34" y="60" width="32" height="32"/>
<text class="chip" x="50" y="118">편지 쓴 사람</text>
<circle class="kafka" cx="340" cy="76" r="34"/><use class="ic" href="#i-user" x="318" y="54" width="44" height="44"/>
<text class="big" x="340" y="128">답장 담당자</text>
<circle class="new" cx="140" cy="38" r="13"/><use class="ic" href="#i-ticket" x="131" y="29" width="18" height="18"/>
<text class="chip" x="160" y="38" style="text-anchor:start">번호표 4821번</text>
<text class="chip" x="194" y="112">다음 편지에 번호표를 넣어요</text>
<rect class="line" x="10" y="146" width="380" height="104" rx="12"/>
<text class="label center" x="200" y="166">담당자의 방문자 장부</text>
<circle class="box" cx="54" cy="210" r="24"/><use class="ic" href="#i-book" x="40" y="196" width="28" height="28"/>
<rect class="kafka" x="96" y="184" width="284" height="26" rx="5"/>
<text class="chip" x="108" y="197" style="text-anchor:start">4821번 · 민지 · 로그인했어요</text>
<text class="chip" x="108" y="227" style="text-anchor:start">9037번 · 서준 · 로그인했어요</text>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0s" repeatCount="indefinite" path="M302,60 L86,60"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.9s" repeatCount="indefinite" path="M86,94 L302,94"/></circle>
</svg>
<p class="point">담당자는 장부에 누가 몇 번인지 적어 두고 편지에 번호표가 오면 장부에서 그 번호를 찾아 누구인지 알아요.</p>
<p class="explain">첫 편지에서 비밀번호를 확인한 담당자는 장부 빈 줄에 번호와 이름을 적고 같은 번호가 적힌 번호표를 건네요. 번호표에는 이름이 없고 번호만 있어서 번호표만 봐서는 누구 것인지 알 수 없어요. 장부는 담당자만 갖고 있으니 번호를 맞춰 볼 수 있는 것도 담당자뿐이에요.</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>실제로는: 세션은 서버가 기억하고 클라이언트는 세션 ID만 들어요</h3>
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
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0s" repeatCount="indefinite" path="M92,40 L306,40"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.9s" repeatCount="indefinite" path="M306,64 L92,64"/></circle>
</svg>
<p class="point">세션 방식에서는 사용자 정보를 서버가 저장소에 두고 클라이언트는 아무 뜻 없는 세션 ID만 들고 다녀요.</p>
<p class="explain">세션(session)은 로그인한 사용자의 상태를 서버가 기억해 두는 것으로 비유의 장부에 해당해요. 로그인에 성공하면 서버는 남이 추측하기 어려운 무작위 값으로 세션 ID를 새로 만들고 저장소에 그 사용자의 정보와 짝지어 적어요. 요청에 세션 ID가 오면 서버는 저장소에서 같은 ID를 찾아 누구의 요청인지 알아내요. 로그아웃하면 서버가 저장소에서 그 줄을 지워서 같은 세션 ID가 다시 와도 더는 알아보지 않아요.</p>
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
<h3>실제로는: 브라우저는 세션 ID를 쿠키로 보관했다가 붙여요</h3>
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
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="0s" repeatCount="indefinite" path="M64,110 L334,110"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="0.8s" repeatCount="indefinite" path="M336,166 L66,166"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="1.6s" repeatCount="indefinite" path="M64,216 L334,216"/></circle>
</svg>
<p class="point">서버가 Set-Cookie 헤더로 세션 ID를 건네면 브라우저가 쿠키로 저장해 두고 조건에 맞는 다음 요청의 Cookie 헤더에 알아서 붙여요.</p>
<p class="explain">쿠키(cookie)는 서버가 응답에 실어 보낸 <code>이름=값</code> 꼴의 작은 기록을 브라우저가 저장해 둔 것으로 비유에서 번호표(세션 ID)를 넣어 두는 주머니예요. 서버는 쿠키와 함께 어느 사이트의 어떤 주소로 언제까지 보낼지 같은 조건을 정할 수 있고 브라우저는 요청을 보낼 때 조건에 맞는 쿠키를 골라 <code>Cookie</code> 헤더에 이름과 값만 실어요. 덕분에 앱 코드가 세션 ID를 직접 챙기지 않아도 로그인이 이어져요. 쿠키는 확인표를 나르는 방법이고 세션은 서버가 기억하는 방법이라서 둘은 보통 함께 쓰여요.</p>
</section>
<aside class="author-questions" aria-label="질문 목록">
<details class="author-question">
<summary>Q. 쿠키로 세션 ID를 보관하면 비밀번호를 넣는 것과 똑같은 것 아닌가요?</summary>
<p>A. 반은 맞아요. 세션 ID를 훔친 사람은 그 사용자인 척할 수 있어서 훔친 순간에는 비밀번호만큼 위험해요. 다른 점은 세션 ID가 로그인할 때마다 서버가 새로 만든 무작위 값이라는 거예요. 로그아웃하거나 만료돼서 서버가 지우면 바로 쓸모없어지고 비밀번호에 대한 정보도 들어 있지 않아요. 비밀번호는 내가 바꾸기 전까지 계속 통하고 다른 사이트에서 같은 비밀번호를 썼다면 그쪽까지 위험해져요. 저장 위치도 달라서 쿠키에는 세션 ID만 있고 누구인지 같은 사용자 정보는 서버의 세션 저장소에 따로 있어요.</p>
</details>
<details class="author-question">
<summary>초보 독자 Q. 쿠키는 내 컴퓨터 어디에 저장되고 내가 볼 수도 있나요?</summary>
<p>A. 브라우저가 사용하는 사람의 컴퓨터나 휴대폰에 저장해요. 브라우저의 개발자 도구(보통 F12 키)에서 사이트별 쿠키 목록을 볼 수 있어요.</p>
</details>
</aside>
</div>

<details class="origin">
<summary>더 알아보기: 누가 왜 만들었을까?</summary>
<p>쿠키는 <b>1994년 가을</b> Netscape 브라우저에 처음 들어갔어요. 만든 사람은 당시 Netscape에서 일하던 <b>루 몬툴리(Lou Montulli)</b>예요.</p>
<p>온라인 쇼핑몰이 장바구니를 만들려면 손님이 페이지를 옮겨 다니는 동안 무엇을 담았는지 이어서 알아야 했는데 HTTP는 요청 사이를 기억하지 않았어요. 몬툴리는 서버가 작은 기록을 브라우저에 맡겨 두고 다음 요청 때 돌려받는 방법을 만들었어요. 이름은 대학 운영체제 수업에서 배운 "magic cookie"에서 가져왔다고 2013년 자신의 블로그에 썼어요.</p>
<p>표준 문서는 1997년 2월 RFC 2109에서 시작해 RFC 2965를 거쳐 2011년 4월 애덤 바스(Adam Barth)가 쓴 RFC 6265로 이어졌어요. 쿠키는 지금도 로그인 말고도 언어 설정 같은 것을 기억하는 데 쓰이고 이 글은 로그인을 이어 가는 쓰임만 봐요.</p>
<p>참고: <a href="http://montulli.blogspot.com/2013/05/the-reasoning-behind-web-cookies.html">Lou Montulli: The reasoning behind Web Cookies</a> · <a href="https://www.rfc-editor.org/rfc/rfc6265">RFC 6265 HTTP State Management Mechanism</a> · <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies">MDN: HTTP 쿠키</a></p>
</details>
</div>

<div class="slide-group">
<h2 class="slide-group-title">토큰: 서버가 덜 기억하는 로그인</h2>

<section class="slide">
<h3>도장이 찍힌 확인표는 장부 없이 알아봐요</h3>
<svg class="dg" viewBox="0 0 400 260" role="img" aria-label="편지 쓴 사람이 도장 찍힌 확인표를 넣은 편지를 보내면 답장 담당자는 장부를 펼치지 않고 도장만 확인하며 확인표에는 민지와 저녁 6시까지라는 기한과 담당자의 도장이 있다는 그림">
<defs><marker id="n8" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M70,60 L126,60"/>
<path class="line" d="M174,60 L302,60" marker-end="url(#n8)"/>
<circle class="box" cx="44" cy="60" r="26"/><use class="ic" href="#i-user" x="28" y="44" width="32" height="32"/>
<text class="chip" x="44" y="104">편지 쓴 사람</text>
<circle class="box" cx="150" cy="60" r="22"/><use class="ic" href="#i-mail" x="137" y="47" width="26" height="26"/>
<circle class="new" cx="172" cy="40" r="11"/><use class="ic" href="#i-stamp" x="164" y="32" width="16" height="16"/>
<circle class="kafka" cx="340" cy="60" r="36"/><use class="ic" href="#i-user" x="316" y="36" width="48" height="48"/>
<text class="big" x="340" y="114">답장 담당자</text><text class="small" x="340" y="134">도장만 확인해요</text>
<rect class="line" x="10" y="150" width="250" height="100" rx="12"/>
<text class="label center" x="135" y="168">도장 찍힌 확인표</text>
<rect class="new" x="24" y="184" width="140" height="54" rx="6"/>
<text class="chip" x="94" y="202">민지</text><text class="chip" x="94" y="224">저녁 6시까지</text>
<circle class="kafka" cx="212" cy="208" r="22"/><use class="ic" href="#i-stamp" x="199" y="195" width="26" height="26"/>
<text class="chip" x="212" y="242">도장</text>
<circle class="line dash" cx="330" cy="196" r="24"/><use class="ic" href="#i-book" x="316" y="182" width="28" height="28"/>
<path class="line" d="M313,213 L347,179"/>
<text class="small" x="330" y="236">장부는 안 펼쳐요</text>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0s" repeatCount="indefinite" path="M174,60 L302,60"/></circle>
</svg>
<p class="point">담당자가 이름과 기한을 적은 확인표에 도장을 찍어 주면 다음 편지에서는 장부 없이 도장이 진짜인지만 보고 알아봐요.</p>
<p class="explain">첫 편지에서 비밀번호를 확인한 담당자는 확인표에 이름과 언제까지 쓸 수 있는지를 적고 자기만 찍을 수 있는 도장을 찍어 건네요. 누가 확인표를 고쳐 쓰거나 가짜를 만들면 담당자의 도장이 맞지 않아서 바로 알아채요. 대신 확인표에 적힌 내용은 누구나 읽을 수 있고 장부가 없어서 기한이 지나기 전에는 담당자가 이미 건넨 확인표를 무효로 만들기 어려워요.</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>실제로는: JWT는 서명이 붙은 토큰이에요</h3>
<svg class="dg" viewBox="0 0 400 230" role="img" aria-label="JWT는 헤더와 페이로드와 서명 세 부분을 점으로 이은 문자열이고 헤더는 서명 방식, 페이로드는 누구인지와 만료 시각, 서명은 위조 확인용이며 페이로드를 풀어 보면 sub와 exp가 보여서 누구나 읽을 수 있으니 비밀번호는 넣지 않는다는 그림">
<rect class="box" x="10" y="24" width="112" height="36" rx="5"/><text class="chip mono" x="66" y="42">eyJhbGci…</text>
<text class="big" x="130" y="42">.</text>
<rect class="box" x="138" y="24" width="112" height="36" rx="5"/><text class="chip mono" x="194" y="42">eyJzdWIi…</text>
<text class="big" x="258" y="42">.</text>
<rect class="kafka" x="266" y="24" width="124" height="36" rx="5"/><text class="chip mono" x="328" y="42">SflKxwRJ…</text>
<text class="chip" x="66" y="78">헤더</text><text class="chip" x="194" y="78">페이로드</text><text class="chip" x="328" y="78">서명</text>
<text class="small" x="66" y="98">서명 방식</text><text class="small" x="194" y="98">누구 · 만료 시각</text><text class="small" x="328" y="98">위조 확인용</text>
<rect class="line" x="10" y="118" width="380" height="102" rx="12"/>
<text class="label center" x="200" y="138">페이로드를 풀어 보면</text>
<text class="chip mono" x="200" y="170">{"sub": "7", "exp": …}</text>
<text class="alert" x="200" y="200">누구나 읽으니 비밀번호는 넣지 않아요</text>
</svg>
<p class="point">JWT는 헤더와 페이로드와 서명을 점으로 이은 문자열이고 서버는 서명을 검증해 위조 여부를 알아요.</p>
<p class="explain">토큰(token)은 로그인했다는 증명을 담은 문자열이고 JWT(JSON Web Token)는 내용을 JSON으로 적는 표준 형식이에요. 서버는 로그인에 성공하면 누구인지와 만료 시각(<code>exp</code>는 이 시각 이후에는 받아 주면 안 된다는 뜻)을 적고 예를 들어 서버만 아는 비밀 키로 서명을 만들어 세 부분을 점으로 이어요. 다음 요청에서 서버가 서명을 검증하면 저장소를 뒤지지 않고도 내용이 고쳐졌는지 알 수 있어요. 서명은 위조를 막는 도장이지 내용을 감추는 암호화가 아니라서 페이로드는 base64url(글자를 바꿔 적는 인코딩)만 되돌리면 누구나 읽어요.</p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 서명은 어떻게 만들고 검증하나요?</summary>
<p>A. 예를 들어 서버는 헤더와 페이로드 내용에 서버만 아는 비밀 키를 섞어 서명 값을 계산해 붙여요. 다음 요청에서 같은 계산을 다시 해 값이 같으면 내용이 그대로인 것이고 한 글자라도 고쳐졌다면 값이 달라져요. 비밀 키를 모르는 사람은 맞는 서명을 만들 수 없어요. 서명은 비밀 키로 만들고 공개 키로 검증하는 방식도 있어요.</p>
</details>
</aside>
</div>

<section class="slide">
<h3>실제로는: 앱은 토큰을 Authorization 헤더에 직접 넣어요</h3>
<svg class="dg" viewBox="0 0 400 214" role="img" aria-label="위쪽은 브라우저가 조건에 맞으면 Cookie 헤더에 세션 ID를 알아서 붙여 서버로 보내고 아래쪽은 앱 코드가 Authorization: Bearer 헤더에 토큰을 직접 넣어 서버로 보내는 비교 그림">
<defs><marker id="n9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M74,60 L300,60" marker-end="url(#n9)"/>
<path class="line" d="M74,160 L300,160" marker-end="url(#n9)"/>
<circle class="box" cx="44" cy="60" r="26"/><use class="ic" href="#i-laptop" x="28" y="44" width="32" height="32"/>
<text class="chip" x="44" y="102">브라우저</text>
<circle class="box" cx="330" cy="60" r="26"/><use class="ic" href="#i-server" x="314" y="44" width="32" height="32"/>
<text class="chip" x="330" y="102">서버</text>
<rect class="new" x="88" y="28" width="198" height="24" rx="5"/><text class="chip mono" x="187" y="40">Cookie: sid=8f3kq9…</text>
<text class="small" x="187" y="80">조건에 맞으면 브라우저가 붙여요</text>
<circle class="kafka" cx="44" cy="160" r="26"/><use class="ic" href="#i-laptop" x="28" y="144" width="32" height="32"/>
<text class="chip" x="44" y="202">앱 코드</text>
<circle class="box" cx="330" cy="160" r="26"/><use class="ic" href="#i-server" x="314" y="144" width="32" height="32"/>
<text class="chip" x="330" y="202">서버</text>
<rect class="new" x="76" y="128" width="222" height="24" rx="5"/><text class="chip mono" x="187" y="140">Authorization: Bearer eyJ…</text>
<text class="small" x="187" y="180">앱 코드가 직접 넣어요</text>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0s" repeatCount="indefinite" path="M74,60 L300,60"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.7s" repeatCount="indefinite" path="M74,160 L300,160"/></circle>
</svg>
<p class="point">브라우저는 쿠키를 규칙에 따라 붙여 주지만 Bearer 토큰은 앱 코드가 보관해 두었다가 요청마다 Authorization 헤더에 넣어야 해요.</p>
<p class="explain"><code>Authorization</code> 헤더에 <code>Bearer</code>라고 적고 토큰을 붙이는 방식은 RFC 6750에 정해져 있고 Bearer는 "가진 사람"이라는 뜻이에요. 이름처럼 토큰을 가진 쪽이면 누구든 쓸 수 있어서 HTTPS(암호화해서 보내는 HTTP)로만 보내고 URL에 넣지 않아요. 여기서 앱 코드는 브라우저 안에서 돌거나 휴대폰에 설치된 앱에서 서버에 요청을 보내는 프로그램이에요. 토큰을 쿠키에 담아 브라우저가 붙이게 하는 방식도 있어서 쿠키와 토큰은 둘 중 하나를 고르는 관계가 아니라 나르는 방법과 확인하는 방법의 이야기예요.</p>
</section>

<section class="slide">
<h3>세션과 토큰은 무엇이 다를까요</h3>
<table>
<thead><tr><th>질문</th><th>세션 (번호표와 장부)</th><th>토큰 (도장 찍힌 확인표)</th></tr></thead>
<tbody>
<tr><td>서버가 기억하는 것</td><td>세션 ID마다 사용자 정보를 저장소에 둬요</td><td>서명하고 검증할 키만 있으면 돼요</td></tr>
<tr><td>클라이언트가 든 것</td><td>아무 뜻 없는 세션 ID</td><td>누구나 읽을 수 있는 내용과 서명</td></tr>
<tr><td>확인하는 방법</td><td>저장소에서 세션 ID를 찾아요</td><td>서명과 만료 시각(<code>exp</code>)을 검증해요</td></tr>
<tr><td>로그아웃·취소</td><td>서버가 저장소에서 지우면 바로 끝나요</td><td>만료 전에는 무효로 만들기 어려워 만료를 짧게 잡거나 거부 목록(취소한 토큰의 명단)을 둬요. 그러면 서버가 다시 기억할 것이 생겨요</td></tr>
</tbody>
</table>
<p class="point">세션은 서버가 기억해서 취소가 쉽고 토큰은 서버가 덜 기억하는 대신 만료 전 취소가 어려워서 어느 쪽이 늘 낫다고 말할 수 없어요.</p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">조심: 확인표는 비밀번호만큼 중요해요</h2>

<section class="slide">
<h3>번호표를 베끼면 그 사람 행세를 할 수 있어요</h3>
<svg class="dg" viewBox="0 0 400 180" role="img" aria-label="민지의 번호표를 다른 사람이 몰래 베껴 편지에 넣어 보내자 답장 담당자는 민지의 편지라고 여기고 답하는 그림">
<defs><marker id="n10" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line dash" d="M72,90 L130,90" marker-end="url(#n10)"/>
<path class="line" d="M198,90 L298,90" marker-end="url(#n10)"/>
<circle class="box" cx="44" cy="90" r="26"/><use class="ic" href="#i-user" x="28" y="74" width="32" height="32"/>
<text class="chip" x="44" y="132">민지</text>
<circle class="new" cx="101" cy="66" r="12"/><use class="ic" href="#i-ticket" x="93" y="58" width="16" height="16"/>
<text class="small" x="101" y="114">몰래 베껴요</text>
<circle class="bad" cx="166" cy="90" r="30"/><use class="ic" href="#i-mask" x="148" y="72" width="36" height="36"/>
<text class="chip" x="166" y="138">훔친 사람</text>
<text class="chip" x="248" y="66">편지 + 번호표</text>
<circle class="kafka" cx="340" cy="90" r="36"/><use class="ic" href="#i-user" x="316" y="66" width="48" height="48"/>
<text class="big" x="340" y="146">답장 담당자</text><text class="alert" x="340" y="166">민지 님이군요</text>
<circle class="packet" r="5"><animateMotion dur="1s" begin="0s" repeatCount="indefinite" path="M72,90 L130,90"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.6s" repeatCount="indefinite" path="M198,90 L298,90"/></circle>
</svg>
<p class="point">담당자는 번호표만 보고 누구인지 정하니까 남이 번호표를 손에 넣으면 그 사람 행세를 할 수 있어요.</p>
<p class="explain">번호표나 도장 찍힌 확인표에는 들고 온 사람의 얼굴이 없어요. 그래서 민지의 번호표를 베낀 사람이 편지에 넣어 보내면 담당자는 민지의 편지로 알고 답장을 보내요. 확인표는 비밀번호를 대신하는 물건이라 비밀번호만큼 조심해서 다뤄야 해요.</p>
</section>

<section class="slide">
<h3>실제로는: 훔친 세션 ID나 토큰으로 사용자 행세를 해요</h3>
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
<text class="chip" x="64" y="168" style="text-anchor:start">세션은 로그아웃 때 서버에서 지워요</text>
<circle class="kafka" cx="40" cy="198" r="14"/><use class="ic" href="#i-clock" x="31" y="189" width="18" height="18"/>
<text class="chip" x="64" y="198" style="text-anchor:start">토큰은 만료 시각을 짧게 잡아요</text>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0s" repeatCount="indefinite" path="M82,44 L306,44"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.9s" repeatCount="indefinite" path="M306,68 L82,68"/></circle>
</svg>
<p class="point">서버는 확인표가 유효한지만 볼 뿐 누가 보냈는지는 가리지 못해서 유효한 세션 ID나 토큰을 가진 사람은 그 사용자 행세를 할 수 있어요.</p>
<p class="explain">남의 세션 ID나 토큰을 손에 넣어 그 사용자인 척 요청하는 공격자의 수법을 세션 하이재킹(hijacking·가로채기)이라고 해요. 브라우저에서 쿠키만 지워서는 공격자가 이미 베껴 간 세션 ID가 서버 저장소에 남아 계속 통하니까 서버가 저장소에서 지워야 해요. 로그인 전에도 서버는 방문자에게 세션 ID를 줄 수 있어서 로그인 때 새로 만들어 주는 것도 공격자가 미리 심어 둔 ID가 그대로 로그인 상태가 되는 일을 막기 위해서예요. 토큰은 서버가 기억하지 않아 지울 수 없으니 훔쳐 가도 오래 쓰지 못하게 짧은 만료가 필요해요.</p>
</section>

<section class="slide">
<h3>이럴 땐 조심해요: 세션 쿠키에는 보호 속성을 붙여요</h3>
<table>
<thead><tr><th>속성</th><th>하는 일</th><th>기억할 점</th></tr></thead>
<tbody>
<tr><td><code>HttpOnly</code></td><td>페이지 안에서 도는 프로그램인 JavaScript(<code>document.cookie</code>)가 쿠키 값을 읽지 못해요</td><td>XSS(남이 심은 스크립트가 내 사이트에서 실행되는 공격)가 일어나도 세션 ID를 읽어 가기 어려워요. 그래도 그 스크립트가 서버에 요청을 보내면 브라우저가 쿠키를 그대로 붙여 줘서 피해를 줄일 뿐 막지는 못해요</td></tr>
<tr><td><code>Secure</code></td><td>HTTPS 요청에만 쿠키를 붙여요</td><td>암호화되지 않은 <code>http</code> 요청으로 세션 ID가 새지 않게 해요</td></tr>
<tr><td><code>SameSite</code></td><td>다른 사이트에서 시작된 요청에 쿠키를 붙일지 정해요</td><td><code>Strict</code>는 붙이지 않고 <code>Lax</code>는 다른 사이트의 링크로 페이지가 통째로 넘어올 때(<code>GET</code>)만 붙이며 <code>None</code>은 붙이되 <code>Secure</code>가 함께 있어야 해요. 일부 브라우저는 값이 없으면 <code>Lax</code>처럼 다루지만 직접 정해 두는 게 나아요</td></tr>
<tr><td><code>Max-Age</code> · <code>Expires</code></td><td>쿠키를 언제까지 보관할지 정해요</td><td>둘 다 없으면 세션 쿠키(서버의 세션과는 다른 말이에요)라서 보통 브라우저를 닫을 때 지워지지만 닫기 전 창을 되살리는 세션 복원 기능이 켜져 있으면 남을 수 있어요</td></tr>
</tbody>
</table>
<p class="point">서버는 Set-Cookie에 속성을 함께 적어 쿠키를 누가 읽고 언제 어디로 보낼지 좁혀요.</p>
<p>참고: <a href="https://www.rfc-editor.org/rfc/rfc6265">RFC 6265</a> · <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies">MDN: HTTP 쿠키</a> · <a href="https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html">OWASP Session Management Cheat Sheet</a></p>
</section>

<section class="slide">
<h3>이럴 땐 조심해요: 토큰을 어디에 두든 만능은 없어요</h3>
<table>
<thead><tr><th>보관 위치</th><th>이런 점은 좋아요</th><th>이런 위험이 있어요</th></tr></thead>
<tbody>
<tr><td><code>localStorage</code> (브라우저가 사이트마다 주는 저장 공간)</td><td>앱 코드가 필요할 때 꺼내 <code>Authorization</code> 헤더에 넣어요</td><td>JavaScript로 읽을 수 있어서 XSS가 한 번 성공하면 토큰을 꺼내 갈 수 있다고 OWASP가 경고해요</td></tr>
<tr><td><code>HttpOnly</code> 쿠키</td><td>JavaScript가 값을 읽지 못해서 XSS로 토큰을 꺼내 가기 어려워요</td><td>조건에 맞으면 브라우저가 알아서 붙이니 CSRF(다른 사이트가 사용자의 브라우저를 시켜 내 사이트에 요청을 보내게 하는 공격)를 따로 막아야 해요. <code>SameSite</code>는 위험을 줄이는 보완책이고 CSRF 방어를 대신하지 않아요</td></tr>
</tbody>
</table>
<p class="point">어디에 두든 XSS를 먼저 막아야 하고 쿠키를 쓰면 CSRF 방어도 함께 갖춰야 해요.</p>
<p>참고: <a href="https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html">OWASP HTML5 Security Cheat Sheet</a> · <a href="https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html">OWASP CSRF Prevention Cheat Sheet</a> · <a href="https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html">OWASP JWT Cheat Sheet</a> · <a href="https://www.rfc-editor.org/rfc/rfc7519">RFC 7519 JWT</a> · <a href="https://www.rfc-editor.org/rfc/rfc6750">RFC 6750 Bearer Token</a></p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>이럴 땐 조심해요: 누구인지 확인과 해도 되는지 확인은 달라요</h3>
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
<p class="point">서버는 확인표로 누구인지 먼저 확인하고 그다음에 그 사람이 이 일을 해도 되는지 따로 확인해요.</p>
<p class="explain">인증(authentication)은 요청한 쪽이 주장하는 신원이 맞는지 확인하는 일이고 쿠키와 세션과 토큰이 돕는 일은 여기까지예요. 인가(authorization)는 확인된 사용자가 그 일을 해도 되는지 정하는 일이라 서버가 요청마다 따로 검사해야 해요. 1편에서 본 <code>401</code>은 이름과 달리 유효한 인증 정보가 없다는 뜻이고 <code>403</code>은 요청을 이해했지만 들어주지 않겠다는 뜻이라 로그인한 사용자라면 그 일을 할 권한부터 봐요.</p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 앱에서 로그인이 자꾸 풀리거나 401이 나오면 어디를 봐야 하나요?</summary>
<p>A. 세션 방식이면 서버가 그 세션을 지웠거나 만료됐는지와 요청에 쿠키가 붙었는지를 봐요. 토큰 방식이면 만료 시각이 지났는지와 요청에 Authorization 헤더가 붙었는지를 봐요. 요청에 무엇이 붙었는지는 브라우저 개발자 도구의 네트워크 탭에서 볼 수 있어요.</p>
</details>
</aside>
</div>

<section class="slide">
<h3>한눈에 다시 보기: 이 글의 다섯 줄</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="확인표는 로그인 한 번 뒤 비밀번호 대신 보내는 증명이고 세션은 서버가 사용자 정보를 기억하고 세션 ID로 찾으며 쿠키는 Set-Cookie로 받아 브라우저가 알아서 붙이고 토큰은 서명을 검증해 저장소 없이 위조를 가리며 하이재킹은 훔친 확인표로 행세하는 것이라 비밀번호처럼 지켜야 한다는 다섯 줄 요약 그림">
<circle class="new" cx="30" cy="28" r="18"/><use class="ic" href="#i-key" x="19" y="17" width="22" height="22"/>
<text class="label" x="62" y="19">확인표</text><text class="small" x="62" y="38" style="text-anchor:start">비밀번호 대신 보내는 세션 ID나 토큰</text>
<circle class="kafka" cx="30" cy="76" r="18"/><use class="ic" href="#i-book" x="19" y="65" width="22" height="22"/>
<text class="label" x="62" y="67">세션</text><text class="small" x="62" y="86" style="text-anchor:start">서버가 사용자 정보를 기억하고 세션 ID로 찾아요</text>
<circle class="new" cx="30" cy="124" r="18"/><use class="ic" href="#i-ticket" x="19" y="113" width="22" height="22"/>
<text class="label" x="62" y="115">쿠키</text><text class="small" x="62" y="134" style="text-anchor:start">Set-Cookie로 받아 브라우저가 알아서 붙여요</text>
<circle class="kafka" cx="30" cy="172" r="18"/><use class="ic" href="#i-stamp" x="19" y="161" width="22" height="22"/>
<text class="label" x="62" y="163">토큰 · JWT</text><text class="small" x="62" y="182" style="text-anchor:start">서명을 검증해 저장소 없이 위조를 가려요</text>
<circle class="bad" cx="30" cy="220" r="18"/><use class="ic" href="#i-mask" x="19" y="209" width="22" height="22"/>
<text class="label" x="62" y="211">하이재킹</text><text class="small" x="62" y="230" style="text-anchor:start">훔친 확인표로 행세하니 비밀번호처럼 지켜요</text>
</svg>
<p class="point">서버는 로그인 때 한 번 확인한 뒤 건넨 확인표로 사람을 알아보고 그 확인표를 장부로 기억하거나 도장으로 증명해요.</p>
</section>
</div>

</div>
