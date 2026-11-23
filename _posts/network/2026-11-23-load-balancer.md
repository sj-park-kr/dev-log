---
layout: post
title: "서버 여러 대에 요청을 어떻게 나눌까? 편지 창구로 이해하는 로드 밸런서"
description: "그림으로 보는 로드 밸런서: 서버 한 대에 요청이 몰리는 문제, 로드 밸런서가 창구처럼 요청을 나누는 방법, 라운드 로빈과 최소 연결, 헬스 체크, L4와 L7의 차이, 서버를 늘리면 로그인이 풀리는 이유와 스티키 세션·공용 세션 저장소, 언제 쓰고 무엇을 조심하는지를 동화책처럼 설명합니다."
date: 2026-11-23 21:00:00 +0900
series: network
episode: 7
summary: "로드 밸런서는 편지를 받아 여러 답장 담당자에게 나눠 주는 창구예요. 손님은 창구 주소 하나만 알면 되고 창구는 멈춘 담당자를 빼고 남은 담당자에게 일을 나눠요."
---

<div class="lesson lesson-hierarchy storybook">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: https://cdn.jsdelivr.net/npm/lucide-static@1.25.0/icons/ (ISC). 라이선스: assets/icons/LICENSE-lucide.txt. i-check=circle-check, i-x=circle-x, i-book=book-open(2편과 같은 아이콘). -->
<symbol id="i-user-round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></symbol>
<symbol id="i-server" viewBox="0 0 24 24"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></symbol>
<symbol id="i-mail" viewBox="0 0 24 24"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></symbol>
<symbol id="i-split" viewBox="0 0 24 24"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></symbol>
<symbol id="i-heart-pulse" viewBox="0 0 24 24"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/><path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></symbol>
<symbol id="i-book" viewBox="0 0 24 24"><path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></symbol>
<symbol id="i-phone" viewBox="0 0 24 24"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></symbol>
<symbol id="i-x" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></symbol>
</defs>
</svg>

<div class="slide-group">
<h2 class="slide-group-title">문제: 담당자 한 명에게 편지가 몰려요</h2>

<section class="slide">
<h3>편지가 몰리면 담당자 한 명이 밀려요</h3>
<svg class="dg" viewBox="0 0 400 236" role="img" aria-label="손님 세 명이 보낸 편지가 답장 담당자(서버) 한 명 앞에 줄지어 쌓이고 담당자는 빨갛게 바쁜 상태로 편지가 밀린다는 그림">
<defs><marker id="lb1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M74,44 L150,104" marker-end="url(#lb1)"/>
<path class="line" d="M76,116 L150,116" marker-end="url(#lb1)"/>
<path class="line" d="M74,188 L150,128" marker-end="url(#lb1)"/>
<circle class="box" cx="50" cy="44" r="24"/><use class="ic" href="#i-user-round" x="34" y="28" width="32" height="32"/>
<circle class="box" cx="50" cy="116" r="24"/><use class="ic" href="#i-user-round" x="34" y="100" width="32" height="32"/>
<circle class="box" cx="50" cy="188" r="24"/><use class="ic" href="#i-user-round" x="34" y="172" width="32" height="32"/>
<text class="small" x="50" y="224">손님</text>
<circle class="box" cx="170" cy="116" r="16"/><use class="ic" href="#i-mail" x="159" y="105" width="22" height="22"/>
<circle class="box" cx="206" cy="116" r="16"/><use class="ic" href="#i-mail" x="195" y="105" width="22" height="22"/>
<circle class="box" cx="242" cy="116" r="16"/><use class="ic" href="#i-mail" x="231" y="105" width="22" height="22"/>
<text class="alert" x="206" y="82">편지가 밀려요</text>
<circle class="bad" cx="330" cy="116" r="42"/><use class="ic" href="#i-server" x="304" y="90" width="52" height="52"/>
<text class="big" x="330" y="184">답장 담당자</text><text class="small" x="330" y="204">서버 한 대</text>
</svg>
<ol class="steps">
<li>손님이 늘면 편지(요청)도 함께 늘어요</li>
<li>담당자(서버) 한 명이 처리할 양은 정해져 있어요</li>
<li>넘치면 답장이 늦거나 아예 오지 않아요</li>
</ol>
<p class="more">편지와 답장의 기본 규칙은 <a href="{{ '/2026/11/18/http-request-response/' | relative_url }}">1편 HTTP</a>에서 봐요</p>
</section>

<section class="slide">
<h3>담당자를 늘려도 손님은 어디로 보낼지 몰라요</h3>
<svg class="dg" viewBox="0 0 400 236" role="img" aria-label="답장 담당자를 A, B, C 세 명으로 늘렸지만 주소가 제각각이라 손님은 어느 주소로 편지를 보낼지 몰라 점선 화살표 세 개 앞에서 망설이는 그림">
<defs><marker id="lb2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line dash" d="M112,108 L272,48" marker-end="url(#lb2)"/>
<path class="line dash" d="M112,118 L272,118" marker-end="url(#lb2)"/>
<path class="line dash" d="M112,128 L272,188" marker-end="url(#lb2)"/>
<circle class="box" cx="70" cy="118" r="40"/><use class="ic" href="#i-user-round" x="46" y="94" width="48" height="48"/>
<text class="big" x="70" y="184">손님</text><text class="small" x="70" y="204">클라이언트</text>
<text class="alert" x="190" y="222">어디로 보내요?</text>
<circle class="box" cx="300" cy="44" r="26"/><use class="ic" href="#i-server" x="282" y="26" width="36" height="36"/><text class="chip" x="334" y="44" style="text-anchor:start">A 주소</text>
<circle class="box" cx="300" cy="118" r="26"/><use class="ic" href="#i-server" x="282" y="100" width="36" height="36"/><text class="chip" x="334" y="118" style="text-anchor:start">B 주소</text>
<circle class="box" cx="300" cy="192" r="26"/><use class="ic" href="#i-server" x="282" y="174" width="36" height="36"/><text class="chip" x="334" y="192" style="text-anchor:start">C 주소</text>
</svg>
<ol class="steps">
<li>담당자(서버)마다 주소(IP)가 따로 있어요</li>
<li>손님이 고르면 한 명에게만 몰릴 수 있어요</li>
<li>고른 담당자가 멈추면 답장을 못 받아요</li>
</ol>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">창구: 로드 밸런서가 편지를 나눠 줘요</h2>

<section class="slide">
<h3>로드 밸런서는 편지를 나눠 주는 창구예요</h3>
<svg class="dg" viewBox="0 0 400 260" role="img" aria-label="손님(클라이언트)은 나눔 창구(로드 밸런서) 주소 하나로만 편지를 보내고 창구가 그 편지를 답장 담당자 A, B, C(서버) 중 한 명에게 넘기는 그림">
<defs><marker id="lb3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M104,130 L146,130" marker-end="url(#lb3)"/>
<path class="line" d="M244,108 L302,70" marker-end="url(#lb3)"/>
<path class="line" d="M250,130 L300,130" marker-end="url(#lb3)"/>
<path class="line" d="M244,152 L302,190" marker-end="url(#lb3)"/>
<circle class="box" cx="62" cy="130" r="40"/><use class="ic" href="#i-user-round" x="38" y="106" width="48" height="48"/>
<text class="big" x="62" y="190">손님</text><text class="small" x="62" y="210">클라이언트</text>
<text class="chip" x="200" y="64">주소는 하나</text>
<circle class="kafka" cx="200" cy="130" r="48"/><use class="ic" href="#i-split" x="172" y="102" width="56" height="56"/>
<text class="big" x="200" y="200">나눔 창구</text><text class="small" x="200" y="220">로드 밸런서</text>
<circle class="box" cx="330" cy="54" r="26"/><use class="ic" href="#i-server" x="312" y="36" width="36" height="36"/><text class="chip" x="364" y="54" style="text-anchor:start">A</text>
<circle class="box" cx="330" cy="130" r="26"/><use class="ic" href="#i-server" x="312" y="112" width="36" height="36"/><text class="chip" x="364" y="130" style="text-anchor:start">B</text>
<circle class="box" cx="330" cy="206" r="26"/><use class="ic" href="#i-server" x="312" y="188" width="36" height="36"/><text class="chip" x="364" y="206" style="text-anchor:start">C</text>
<text class="small" x="330" y="248">답장 담당자</text>
<circle class="packet" r="5"><animateMotion dur="1.6s" repeatCount="indefinite" path="M104,130 L146,130"/></circle>
</svg>
<ol class="steps">
<li>담당자가 늘거나 바뀌어도 손님은 몰라도 돼요</li>
<li>창구(로드 밸런서)가 담당자 한 명을 골라 넘겨요</li>
<li>답장도 창구를 거쳐 손님에게 돌아가요</li>
</ol>
<p class="more">창구 주소는 <a href="{{ '/2026/11/19/dns/' | relative_url }}">3편 DNS</a>로 찾아요 · 쿠버네티스의 고정 창구(Service)도 이 일을 해요 (<a href="{{ '/2026/11/17/why-kubernetes/' | relative_url }}">쿠버네티스 1편</a>)</p>
</section>

<section class="slide">
<h3>차례대로 주거나 한가한 담당자에게 줘요</h3>
<svg class="dg" viewBox="0 0 400 302" role="img" aria-label="같은 상황을 두 방식으로 나란히 비교한 그림. 담당자 A는 처리 중인 편지가 3통, B는 1통, C는 0통이다. 위 차례대로(라운드 로빈) 카드에서는 다음 차례가 A라서 바쁜 A가 새 편지를 또 받는다. 아래 한가한 곳(최소 연결) 카드에서는 처리 중인 편지가 가장 적은 C가 새 편지를 받는다. 숫자는 설명용 예시다">
<defs><marker id="lb4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="6" y="6" width="388" height="140" rx="12"/>
<text class="label center" x="200" y="26">차례대로 (라운드 로빈)</text>
<circle class="kafka" cx="52" cy="86" r="24"/><use class="ic" href="#i-split" x="36" y="70" width="32" height="32"/>
<path class="line" d="M78,86 L156,84" marker-end="url(#lb4)"/><text class="chip" x="117" y="68">다음 차례</text>
<circle class="bad" cx="180" cy="84" r="20"/><use class="ic" href="#i-server" x="167" y="71" width="26" height="26"/>
<circle class="box" cx="265" cy="84" r="20"/><use class="ic" href="#i-server" x="252" y="71" width="26" height="26"/>
<circle class="box" cx="350" cy="84" r="20"/><use class="ic" href="#i-server" x="337" y="71" width="26" height="26"/>
<text class="chip" x="180" y="116">A</text><text class="chip" x="265" y="116">B</text><text class="chip" x="350" y="116">C</text>
<text class="small" x="180" y="134">편지 3통</text><text class="small" x="265" y="134">편지 1통</text><text class="small" x="350" y="134">편지 0통</text>
<text class="alert" x="308" y="50">바빠도 차례면 받아요</text>
<rect class="line" x="6" y="156" width="388" height="140" rx="12"/>
<text class="label center" x="200" y="176">한가한 곳 (최소 연결)</text>
<circle class="kafka" cx="52" cy="236" r="24"/><use class="ic" href="#i-split" x="36" y="220" width="32" height="32"/>
<path class="line" d="M78,228 Q210,184 328,228" marker-end="url(#lb4)"/><text class="chip" x="120" y="200">가장 한가한 C</text>
<circle class="bad" cx="180" cy="236" r="20"/><use class="ic" href="#i-server" x="167" y="223" width="26" height="26"/>
<circle class="box" cx="265" cy="236" r="20"/><use class="ic" href="#i-server" x="252" y="223" width="26" height="26"/>
<circle class="kafka" cx="350" cy="236" r="20"/><use class="ic" href="#i-server" x="337" y="223" width="26" height="26"/>
<text class="chip" x="180" y="266">A</text><text class="chip" x="265" y="266">B</text><text class="chip" x="350" y="266">C</text>
<text class="small" x="180" y="284">편지 3통</text><text class="small" x="265" y="284">편지 1통</text><text class="small" x="350" y="284">편지 0통</text>
</svg>
<ol class="steps">
<li>창구 프로그램(NGINX 등)의 기본은 차례대로예요</li>
<li>오래 걸리는 편지가 섞이면 한가한 곳이 나아요</li>
<li>편지 수는 지금 붙잡고 있는 연결 수예요 (예시)</li>
</ol>
<p class="more">참고: <a href="https://nginx.org/en/docs/http/load_balancing.html">NGINX: 로드 밸런싱 방법</a></p>
</section>

<section class="slide">
<h3>멈춘 담당자에게는 편지를 주지 않아요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="나눔 창구가 담당자 A, B, C에게 건강 확인(헬스 체크)을 한다. A와 C는 정상이라 실선 화살표로 편지를 받고 B는 멈춰서 점선과 빨간 X로 편지를 받지 못하는 그림">
<defs><marker id="lb5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M118,108 L252,56" marker-end="url(#lb5)"/>
<path class="line dash" d="M122,130 L252,130"/>
<path class="line" d="M118,152 L252,204" marker-end="url(#lb5)"/>
<circle class="bad" cx="190" cy="130" r="14"/><use class="ic" href="#i-x" x="180" y="120" width="20" height="20"/>
<circle class="kafka" cx="80" cy="130" r="40"/><use class="ic" href="#i-split" x="56" y="106" width="48" height="48"/>
<text class="big" x="80" y="196">나눔 창구</text>
<path class="line dash" d="M80,62 L80,90"/><circle class="new" cx="80" cy="44" r="18"/><use class="ic" href="#i-heart-pulse" x="68" y="32" width="24" height="24"/>
<text class="chip" x="80" y="12">건강 확인</text>
<circle class="box" cx="280" cy="48" r="26"/><use class="ic" href="#i-server" x="262" y="30" width="36" height="36"/><text class="chip" x="314" y="48" style="text-anchor:start">A · 정상</text>
<circle class="bad" cx="280" cy="130" r="26"/><use class="ic" href="#i-server" x="262" y="112" width="36" height="36"/><text class="alert" x="314" y="130" style="text-anchor:start">B · 멈춤</text>
<circle class="box" cx="280" cy="212" r="26"/><use class="ic" href="#i-server" x="262" y="194" width="36" height="36"/><text class="chip" x="314" y="212" style="text-anchor:start">C · 정상</text>
</svg>
<ol class="steps">
<li>창구는 담당자가 답하는지 계속 살펴요 (헬스 체크)</li>
<li>답이 없는 담당자는 잠시 목록에서 빼요</li>
<li>다시 답하면 편지를 또 넘겨요</li>
</ol>
<p class="more">참고: <a href="https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/how-elastic-load-balancing-works.html">AWS ELB 동작 방식</a> · <a href="https://nginx.org/en/docs/http/load_balancing.html#nginx_load_balancing_health_checks">NGINX 헬스 체크</a></p>
</section>

<section class="slide">
<h3>봉투만 보는 창구와 편지를 읽는 창구가 있어요</h3>
<svg class="dg" viewBox="0 0 400 270" role="img" aria-label="왼쪽 카드는 봉투만 보는 창구(L4)로 /api 편지와 /img 편지가 같은 연결로 와서 둘 다 API 담당에게 간다. 오른쪽 카드는 편지를 읽는 창구(L7)로 /api 편지는 API 담당에게, /img 편지는 그림 담당에게 나눠 보낸다">
<defs><marker id="lb6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="6" y="6" width="190" height="258" rx="12"/>
<text class="label center" x="101" y="26">봉투만 봐요 (L4)</text>
<circle class="box" cx="60" cy="64" r="18"/><use class="ic" href="#i-mail" x="48" y="52" width="24" height="24"/>
<circle class="box" cx="142" cy="64" r="18"/><use class="ic" href="#i-mail" x="130" y="52" width="24" height="24"/>
<text class="chip mono" x="60" y="96">/api</text><text class="chip mono" x="142" y="96">/img</text>
<path class="line" d="M72,106 L88,118" marker-end="url(#lb6)"/><path class="line" d="M130,106 L114,118" marker-end="url(#lb6)"/>
<circle class="kafka" cx="101" cy="142" r="22"/><use class="ic" href="#i-split" x="87" y="128" width="28" height="28"/>
<path class="line" d="M90,162 L68,190" marker-end="url(#lb6)"/>
<path class="line" d="M96,166 L72,194" marker-end="url(#lb6)"/>
<circle class="kafka" cx="60" cy="212" r="20"/><use class="ic" href="#i-server" x="47" y="199" width="26" height="26"/>
<circle class="box" cx="142" cy="212" r="20"/><use class="ic" href="#i-server" x="129" y="199" width="26" height="26"/>
<text class="chip" x="60" y="246">API</text><text class="chip" x="142" y="246">그림</text>
<text class="small" x="142" y="176">연결째 한 곳</text>
<rect class="line" x="204" y="6" width="190" height="258" rx="12"/>
<text class="label center" x="299" y="26">편지를 읽어요 (L7)</text>
<circle class="box" cx="258" cy="64" r="18"/><use class="ic" href="#i-mail" x="246" y="52" width="24" height="24"/>
<circle class="box" cx="340" cy="64" r="18"/><use class="ic" href="#i-mail" x="328" y="52" width="24" height="24"/>
<text class="chip mono" x="258" y="96">/api</text><text class="chip mono" x="340" y="96">/img</text>
<path class="line" d="M270,106 L286,118" marker-end="url(#lb6)"/><path class="line" d="M328,106 L312,118" marker-end="url(#lb6)"/>
<circle class="kafka" cx="299" cy="142" r="22"/><use class="ic" href="#i-split" x="285" y="128" width="28" height="28"/>
<path class="line" d="M288,162 L268,190" marker-end="url(#lb6)"/>
<path class="line" d="M310,162 L330,190" marker-end="url(#lb6)"/>
<circle class="kafka" cx="258" cy="212" r="20"/><use class="ic" href="#i-server" x="245" y="199" width="26" height="26"/>
<circle class="kafka" cx="340" cy="212" r="20"/><use class="ic" href="#i-server" x="327" y="199" width="26" height="26"/>
<text class="chip" x="258" y="246">API</text><text class="chip" x="340" y="246">그림</text>
</svg>
<ol class="steps">
<li>L4·L7은 창구가 보는 깊이를 나눈 이름이에요</li>
<li>읽는 창구는 경로(/api·/img)마다 담당자를 둬요</li>
<li>편지를 읽으려면 창구가 잠금(HTTPS)부터 풀어요</li>
</ol>
<p class="more">잠긴 편지는 <a href="{{ '/2026/11/20/https-tls/' | relative_url }}">4편 HTTPS</a>에서 봐요 · 참고: <a href="https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-rules.html">AWS ALB 경로 규칙</a> · <a href="https://docs.aws.amazon.com/elasticloadbalancing/latest/application/create-https-listener.html">ALB의 HTTPS 해독</a></p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">장부: 담당자마다 기억이 따로예요</h2>

<section class="slide">
<h3>다른 담당자에게 가면 로그인이 풀려요</h3>
<svg class="dg" viewBox="0 0 400 260" role="img" aria-label="1 손님이 로그인 편지를 보내자 창구가 담당자 A에게 넘기고 A는 번호표 7번을 자기 장부에 적는다. 2 다음 편지는 창구가 담당자 B에게 넘기는데 B의 장부에는 7번이 없어 누구인지 모른다는 그림. 번호는 설명용 예시다">
<defs><marker id="lb7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M84,135 L136,135" marker-end="url(#lb7)"/>
<path class="line" d="M196,118 L272,74" marker-end="url(#lb7)"/><text class="chip" x="214" y="80">① 로그인</text>
<path class="line" d="M196,152 L272,196" marker-end="url(#lb7)"/><text class="chip" x="214" y="214">② 다음 편지</text>
<circle class="box" cx="50" cy="135" r="32"/><use class="ic" href="#i-user-round" x="30" y="115" width="40" height="40"/>
<text class="big" x="50" y="188">손님</text>
<circle class="kafka" cx="168" cy="135" r="30"/><use class="ic" href="#i-split" x="148" y="115" width="40" height="40"/>
<text class="big" x="168" y="186">창구</text>
<circle class="box" cx="300" cy="60" r="26"/><use class="ic" href="#i-server" x="282" y="42" width="36" height="36"/>
<text class="chip" x="300" y="102">담당자 A</text>
<circle class="new" cx="366" cy="60" r="18"/><use class="ic" href="#i-book" x="354" y="48" width="24" height="24"/>
<text class="small" x="366" y="96">7번 있음</text>
<circle class="box" cx="300" cy="210" r="26"/><use class="ic" href="#i-server" x="282" y="192" width="36" height="36"/>
<text class="chip" x="300" y="252">담당자 B</text>
<circle class="bad" cx="366" cy="210" r="18"/><use class="ic" href="#i-book" x="354" y="198" width="24" height="24"/>
<text class="alert" x="366" y="174">7번 없음</text>
</svg>
<ol class="steps">
<li>A가 번호표(세션 ID)를 자기 장부에 적어요</li>
<li>창구는 장부를 몰라서 다음 편지를 B에게 줘요</li>
<li>B 장부엔 없는 번호라 다시 로그인해요 (예시)</li>
</ol>
<p class="more">번호표와 장부는 <a href="{{ '/2026/11/19/cookie-session-token/' | relative_url }}">2편 쿠키·세션·토큰</a>에서 봐요</p>
</section>

<section class="slide">
<h3>늘 같은 담당자에게 보내거나 장부를 같이 써요</h3>
<svg class="dg" viewBox="0 0 400 256" role="img" aria-label="왼쪽 카드는 늘 같은 담당자(스티키 세션)로 창구가 손님을 언제나 A에게만 보내고 A와 B는 장부를 따로 가져 A가 멈추면 다시 로그인해야 한다. 오른쪽 카드는 공용 장부(세션 저장소)로 창구가 A와 B 누구에게나 보내고 A와 B가 장부 하나를 같이 본다">
<defs><marker id="lb8" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="6" y="6" width="190" height="244" rx="12"/>
<text class="label center" x="101" y="26">늘 같은 담당자</text><text class="small" x="101" y="46">스티키 세션</text>
<circle class="kafka" cx="101" cy="90" r="24"/><use class="ic" href="#i-split" x="85" y="74" width="32" height="32"/>
<path class="line" d="M88,112 L66,142" marker-end="url(#lb8)"/>
<path class="line dash" d="M114,112 L136,142"/>
<circle class="box" cx="56" cy="164" r="20"/><use class="ic" href="#i-server" x="43" y="151" width="26" height="26"/><text class="chip" x="24" y="164">A</text>
<circle class="box" cx="146" cy="164" r="20"/><use class="ic" href="#i-server" x="133" y="151" width="26" height="26"/><text class="chip" x="178" y="164">B</text>
<circle class="new" cx="56" cy="206" r="14"/><use class="ic" href="#i-book" x="47" y="197" width="18" height="18"/>
<circle class="new" cx="146" cy="206" r="14"/><use class="ic" href="#i-book" x="137" y="197" width="18" height="18"/>
<text class="alert" x="101" y="236">A가 멈추면 다시 로그인</text>
<rect class="line" x="204" y="6" width="190" height="244" rx="12"/>
<text class="label center" x="299" y="26">공용 장부</text><text class="small" x="299" y="46">세션 저장소</text>
<circle class="kafka" cx="299" cy="90" r="24"/><use class="ic" href="#i-split" x="283" y="74" width="32" height="32"/>
<path class="line" d="M286,112 L264,142" marker-end="url(#lb8)"/>
<path class="line" d="M312,112 L334,142" marker-end="url(#lb8)"/>
<circle class="box" cx="254" cy="164" r="20"/><use class="ic" href="#i-server" x="241" y="151" width="26" height="26"/><text class="chip" x="222" y="164">A</text>
<circle class="box" cx="344" cy="164" r="20"/><use class="ic" href="#i-server" x="331" y="151" width="26" height="26"/><text class="chip" x="376" y="164">B</text>
<path class="line" d="M266,180 L286,198"/><path class="line" d="M332,180 L312,198"/>
<circle class="kafka" cx="299" cy="208" r="16"/><use class="ic" href="#i-book" x="288" y="197" width="22" height="22"/>
<text class="small" x="299" y="236">예: Redis</text>
</svg>
<ol class="steps">
<li>늘 A에게 가면 A가 멈출 때 다시 로그인해요</li>
<li>공용 장부면 담당자가 바뀌어도 로그인이 이어져요</li>
<li>같은 곳에만 보내면 한쪽에 몰리기도 해요</li>
</ol>
<p class="more">도장 찍은 확인표(토큰)를 쓰면 장부가 없어도 돼요 (<a href="{{ '/2026/11/19/cookie-session-token/' | relative_url }}">2편</a>) · 공용 장부로 많이 쓰는 Redis는 <a href="{{ '/2026/11/16/why-cache/' | relative_url }}">Redis 1편</a> · 참고: <a href="https://docs.aws.amazon.com/elasticloadbalancing/latest/application/sticky-sessions.html">AWS ALB 스티키 세션</a></p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">판단: 언제 쓰고 무엇을 조심해요?</h2>

<section class="slide">
<h3>이럴 때 써요, 이럴 땐 안 써요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="왼쪽 이럴 때 써요 카드에는 한 대론 벅차요, 한 대가 멈춰도 버텨요, 끊김 없이 새 버전이 있고 오른쪽 이럴 땐 안 써요 카드에는 한 대로 충분해요, 잠깐 멈춰도 괜찮아요, 연습용 앱이에요가 있는 그림">
<rect class="line" x="6" y="6" width="190" height="238" rx="12"/>
<circle class="kafka" cx="101" cy="40" r="20"/><use class="ic" href="#i-check" x="89" y="28" width="24" height="24"/>
<text class="label center" x="101" y="80">이럴 때 써요</text>
<rect class="box" x="20" y="102" width="162" height="34" rx="8"/><text class="chip" x="101" y="119">한 대론 벅차요</text>
<rect class="box" x="20" y="146" width="162" height="34" rx="8"/><text class="chip" x="101" y="163">한 대가 멈춰도 버텨요</text>
<rect class="box" x="20" y="190" width="162" height="34" rx="8"/><text class="chip" x="101" y="207">끊김 없이 새 버전</text>
<rect class="line" x="204" y="6" width="190" height="238" rx="12"/>
<circle class="bad" cx="299" cy="40" r="20"/><use class="ic" href="#i-x" x="287" y="28" width="24" height="24"/>
<text class="label center" x="299" y="80">이럴 땐 안 써요</text>
<rect class="box" x="218" y="102" width="162" height="34" rx="8"/><text class="chip" x="299" y="119">한 대로 충분해요</text>
<rect class="box" x="218" y="146" width="162" height="34" rx="8"/><text class="chip" x="299" y="163">잠깐 멈춰도 괜찮아요</text>
<rect class="box" x="218" y="190" width="162" height="34" rx="8"/><text class="chip" x="299" y="207">연습용 앱이에요</text>
</svg>
<ol class="steps">
<li>같은 서버를 두 대 이상 띄우면 창구가 필요해요</li>
<li>한 대씩 빼고 고쳐서 서비스를 멈추지 않아요</li>
<li>클라우드에서는 창구를 빌려 써요 (예: AWS ELB)</li>
</ol>
<p class="more">참고: <a href="https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/how-elastic-load-balancing-works.html">AWS: Elastic Load Balancing 동작 방식</a></p>
</section>

<section class="slide">
<h3>쓸 때는 세 가지를 조심해요</h3>
<svg class="dg" viewBox="0 0 400 146" role="img" aria-label="조심할 점 세 가지 그림. 창구 고장은 창구도 멈출 수 있다는 것, 손님 주소는 서버에서 가려진다는 것, 웹소켓은 한 담당자에게 계속 붙어 있다는 것이다">
<circle class="bad" cx="70" cy="64" r="40"/><use class="ic" href="#i-split" x="46" y="40" width="48" height="48"/>
<text class="big" x="70" y="130">창구 고장</text>
<circle class="box" cx="200" cy="64" r="40"/><use class="ic" href="#i-user-round" x="176" y="40" width="48" height="48"/>
<text class="big" x="200" y="130">손님 주소</text>
<circle class="box" cx="330" cy="64" r="40"/><use class="ic" href="#i-phone" x="306" y="40" width="48" height="48"/>
<text class="big" x="330" y="130">웹소켓</text>
</svg>
<ol class="steps">
<li>창구도 멈추니 여러 구역에 나눠 둬요</li>
<li>서버엔 창구 주소만 보여 손님 주소는 헤더로 받아요</li>
<li>웹소켓은 붙은 담당자가 멈추면 다시 연결해요</li>
</ol>
<p class="more">웹소켓 전화는 <a href="{{ '/2026/11/23/websocket/' | relative_url }}">6편</a>에서 봐요 · 참고: <a href="https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/how-elastic-load-balancing-works.html">AWS: 구역마다 창구 두기</a> · <a href="https://docs.aws.amazon.com/elasticloadbalancing/latest/application/x-forwarded-headers.html">AWS: 손님 주소를 담는 X-Forwarded-For 헤더</a></p>
</section>
</div>

</div>
