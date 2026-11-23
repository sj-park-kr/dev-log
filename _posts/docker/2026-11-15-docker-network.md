---
layout: post
title: "조리대끼리 어떻게 음식을 주고받을까? 밀키트로 이해하는 Docker 네트워크"
description: "칸막이로 나뉜 컨테이너가 바깥과 서로에게 닿는 방법을 밀키트 주방 비유로 설명하고 포트 매핑(-p)과 기본 bridge와 사용자 정의 bridge 네트워크와 이름으로 찾는 내장 DNS와 host·none 드라이버까지 실제 동작으로 이어서 설명합니다."
date: 2026-11-15 21:20:00 +0900
series: docker
episode: 3
summary: "바깥에서 컨테이너로 들어올 때는 기본적으로 포트 매핑(-p)을 써요. 컨테이너끼리는 사용자 정의 네트워크에서 이름으로 찾아요."
---

<div class="lesson lesson-hierarchy storybook">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: https://cdn.jsdelivr.net/npm/lucide-static@1.25.0/icons/ (ISC). 라이선스: assets/icons/LICENSE-lucide.txt. i-pot=cooking-pot, i-door=door-open. 원과 사각형 요소는 같은 모양의 path로 옮겼어요. -->
<symbol id="i-pot" viewBox="0 0 24 24"><path d="M2 12h20M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8M4 8l16-4M8.86 6.78l-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"/></symbol>
<symbol id="i-user" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M8 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0"/></symbol>
<symbol id="i-lock" viewBox="0 0 24 24"><path d="M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM7 11V7a5 5 0 0 1 10 0v4"/></symbol>
<symbol id="i-door" viewBox="0 0 24 24"><path d="M11 20H2M11 4.562v16.157a1 1 0 0 0 1.242.97L19 20V5.562a2 2 0 0 0-1.515-1.94l-4-1A2 2 0 0 0 11 4.561zM11 4H8a2 2 0 0 0-2 2v14M14 12h.01M22 20h-3"/></symbol>
<symbol id="i-hash" viewBox="0 0 24 24"><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/></symbol>
<symbol id="i-tag" viewBox="0 0 24 24"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42zM7.5 7.5h.01"/></symbol>
<symbol id="i-network" viewBox="0 0 24 24"><path d="M17 16h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1zM3 16h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1zM10 2h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3M12 12V8"/></symbol>
<symbol id="i-unplug" viewBox="0 0 24 24"><path d="m19 5 3-3M2 22l3-3M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4ZM7.5 13.5 10 11M10.5 16.5 13 14M12 6l6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z"/></symbol>
</defs>
</svg>

<div class="slide-group">
<h2 class="slide-group-title">문제: 칸막이 밖에서 주문할 길이 없어요</h2>

<section class="slide">
<h3>밖에서 주문할 창구가 없어요</h3>
<svg class="dg" viewBox="0 0 400 176" role="img" aria-label="밖 손님이 가게에 왔지만 주문 창구가 닫혀 안쪽 조리대까지 주문이 가지 않아요.">
<rect class="line" x="154" y="14" width="232" height="148" rx="12"/>
<text class="label center" x="272" y="36">가게</text>
<path class="line dash" d="M80,85 H135"/>
<circle class="box" cx="52" cy="85" r="28"/><use class="ic" href="#i-user" x="34" y="67" width="36" height="36"/>
<text class="big" x="52" y="138">손님</text>
<circle class="bad" cx="154" cy="85" r="19"/><use class="ic" href="#i-lock" x="142" y="73" width="24" height="24"/>
<text class="chip" x="154" y="138">창구 닫힘</text>
<circle class="box" cx="286" cy="85" r="30"/><use class="ic" href="#i-pot" x="266" y="65" width="40" height="40"/>
<text class="big" x="286" y="138">조리대</text>
</svg>
<ol class="steps">
<li>앱은 조리대(컨테이너)에서 주문을 기다려요</li>
<li>밖 손님은 가게(호스트)에 열어 둔 창구를 찾아요</li>
</ol>
</section>

<section class="slide">
<h3>자리가 다르면 같은 번호도 써요</h3>
<svg class="dg" viewBox="0 0 400 205" role="img" aria-label="기본 bridge에서 두 조리대는 서로 다른 주소를 받아요. 80번은 두 앱이 모두 같은 창구를 쓰는 예시예요.">
<rect class="line" x="7" y="8" width="191" height="188" rx="12"/>
<text class="label center" x="102.5" y="34">조리대 A</text>
<circle class="box" cx="102.5" cy="91" r="34"/><use class="ic" href="#i-pot" x="79.5" y="68" width="46" height="46"/>
<text class="chip" x="102.5" y="149">IP 주소 A</text><text class="small" x="102.5" y="175">80번 (예시)</text>
<rect class="line" x="202" y="8" width="191" height="188" rx="12"/>
<text class="label center" x="297.5" y="34">조리대 B</text>
<circle class="box" cx="297.5" cy="91" r="34"/><use class="ic" href="#i-pot" x="274.5" y="68" width="46" height="46"/>
<text class="chip" x="297.5" y="149">IP 주소 B</text><text class="small" x="297.5" y="175">80번 (예시)</text>
</svg>
<ol class="steps">
<li>조리대의 자리(IP 주소)에서 창구 번호(포트)를 골라요</li>
<li>기본 구역(bridge)은 조리대마다 다른 주소를 줘요</li>
<li>칸막이(네임스페이스) 덕에 80번이 겹치지 않아요 (예시)</li>
</ol>
</section>

<details class="origin">
<summary>더 알아보기: 누가 왜 만들었을까?</summary>
<p>초기 Docker에서는 컨테이너가 모두 기본 bridge 네트워크 하나에 붙었어요. 컨테이너끼리 이름으로 부르려면 <code>--link</code> 옵션으로 하나하나 이어 줘야 했고 지금 공식 문서는 이 방식을 옛 기능(legacy)으로 분류해요.</p>
<p>Docker, Inc.는 <b>2015년 3월</b> 네트워크 스타트업 SocketPlane을 인수하고 네트워크 기능을 libnetwork라는 부품으로 다시 짰어요. <b>2015년 11월</b> 나온 Docker 1.9에서 <code>docker network</code> 명령이 정식 기능이 되어 사용자가 네트워크를 직접 만들고 컨테이너를 붙였다 뗄 수 있게 됐어요. <b>2016년 2월</b> Docker 1.10부터는 사용자 정의 네트워크 안에서 컨테이너 이름을 DNS로 찾아요.</p>
<p>bridge는 영어로 다리예요. 네트워크에서는 두 구간을 이어 주는 장치를 부르는 말이고 Docker의 bridge는 호스트 안에 소프트웨어로 만든 다리예요.</p>
<p>참고: <a href="https://github.com/moby/moby/releases/tag/v1.9.0">Docker 1.9 릴리스 노트</a> · <a href="https://github.com/moby/moby/releases/tag/v1.10.0">Docker 1.10 릴리스 노트</a> · <a href="https://siliconangle.com/2015/11/09/docker-1-9-intros-a-fix-for-container-networking-headaches">SiliconANGLE: Docker 1.9와 SocketPlane</a></p>
</details>
</div>

<div class="slide-group">
<h2 class="slide-group-title">정문: 공개한 포트로 손님을 맞아요</h2>

<section class="slide">
<h3>손님 주문은 정문에서 조리대로 넘어가요</h3>
<svg class="dg" viewBox="0 0 400 230" role="img" aria-label="포트 번호는 예시예요. 가게 밖 손님이 가게의 8080번 창구에 주문하면 조리대 web의 80번 창구로 넘어가고 공개 창구가 없는 조리대 db에는 밖 손님이 주문하지 못하는 그림">
<defs><marker id="n1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="120" y="14" width="270" height="206" rx="12"/>
<text class="label center" x="255" y="36">가게</text>
<path class="line" d="M73,85 L136,85" marker-end="url(#n1)"/>
<path class="line" d="M200,85 L286,85" marker-end="url(#n1)"/>
<circle class="box" cx="45" cy="85" r="28"/><use class="ic" href="#i-user" x="27" y="67" width="36" height="36"/>
<text class="big" x="45" y="135">밖 손님</text>
<circle class="kafka" cx="170" cy="85" r="30"/><use class="ic" href="#i-door" x="150" y="65" width="40" height="40"/>
<text class="chip" x="170" y="132">정문 8080 (예시)</text>
<text class="chip" x="243" y="71">조리대 80번</text>
<circle class="box" cx="320" cy="85" r="30"/><use class="ic" href="#i-pot" x="300" y="65" width="40" height="40"/>
<text class="chip" x="320" y="132">조리대 web</text>
<circle class="box" cx="320" cy="178" r="20"/><use class="ic" href="#i-pot" x="307" y="165" width="26" height="26"/>
<text class="chip" x="320" y="210">조리대 db</text>
<text class="small" x="210" y="170">공개 창구가 없어</text><text class="small" x="210" y="188">밖 손님은 못 와요</text>
<circle class="packet" r="5"><animateMotion dur="2.4s" repeatCount="indefinite" path="M73,85 L136,85 M200,85 L286,85"/></circle>
</svg>
<ol class="steps">
<li>손님은 웹에 주문하고 재료 창고(DB)는 안에서만 불러요</li>
<li>다른 기기는 가게 주소와 정문 번호로 주문해요 (예시)</li>
</ol>
</section>

<section class="slide">
<h3>앞 번호는 정문이고 뒤 번호는 조리대예요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="예시 명령 -p 8080:80에서 앞의 8080은 호스트 포트이고 뒤의 80은 컨테이너 포트이며 브라우저가 가게 정문에 요청하면 호스트가 8080번에서 받아 web 컨테이너의 80번 웹 앱으로 넘기는 흐름 그림">
<defs><marker id="n2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="big" x="70" y="40">-p</text>
<rect class="kafka" x="95" y="20" width="100" height="40" rx="6"/><text x="145" y="40">8080</text>
<text class="big" x="212" y="40">:</text>
<rect class="box" x="230" y="20" width="100" height="40" rx="6"/><text x="280" y="40">80</text>
<text class="small" x="145" y="76">호스트 포트 (예시)</text><text class="small" x="280" y="76">컨테이너 포트</text>
<path class="line" d="M90,136 L173,136" marker-end="url(#n2)"/>
<path class="line" d="M224,136 L308,136" marker-end="url(#n2)"/>
<use class="ic" href="#i-user" x="46" y="116" width="38" height="38"/><text class="chip" x="65" y="175">브라우저</text>
<use class="ic" href="#i-door" x="181" y="116" width="38" height="38"/><text class="chip" x="200" y="175">가게 정문</text>
<use class="ic" href="#i-pot" x="316" y="116" width="38" height="38"/><text class="chip" x="335" y="175">웹 조리대</text>
<circle class="packet" r="5"><animateMotion dur="2.4s" repeatCount="indefinite" path="M90,136 L173,136 M224,136 L308,136"/></circle>
</svg>
<ol class="steps">
<li><code>docker run</code>에 두 창구를 잇는 규칙(포트 매핑)을 줘요 (예시)</li>
<li>Mac·Windows의 가상 머신 속 웹은 공개 창구로 찾아요</li>
<li>리눅스에서 Docker를 돌리는 컴퓨터는 조리대 주소로도 닿아요</li>
</ol>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>내 컴퓨터에만 열 창구는 주소를 붙여요</h3>
<svg class="dg" viewBox="0 0 400 205" role="img" aria-label="8080과 80은 포트 번호 예시예요. 가게 전체에 연 포트와 이 컴퓨터의 루프백 주소에만 연 포트의 접속 범위를 비교해요.">
<rect class="line" x="7" y="8" width="191" height="188" rx="12"/>
<text class="label center" x="102.5" y="34">기본 공개 (예시)</text>
<circle class="bad" cx="102.5" cy="91" r="34"/><use class="ic" href="#i-door" x="79.5" y="68" width="46" height="46"/>
<text class="chip" x="102.5" y="149">-p 8080:80</text><text class="small" x="102.5" y="175">다른 기기도 접근 가능</text>
<rect class="line" x="202" y="8" width="191" height="188" rx="12"/>
<text class="label center" x="297.5" y="34">내 기기만</text>
<circle class="kafka" cx="297.5" cy="91" r="34"/><use class="ic" href="#i-door" x="274.5" y="68" width="46" height="46"/>
<text class="chip" x="297.5" y="149">127.0.0.1:8080:80</text><text class="small" x="297.5" y="175">호스트에서 접근</text>
</svg>
<ol class="steps">
<li>주소를 빼면 모든 호스트 주소에 열려요 (기본값)</li>
<li>내 기기만 받으려면 <code>-p 127.0.0.1:8080:80</code>을 써요</li>
<li>Docker 엔진 28.0.0 전에는 같은 내부망 기기도 닿을 수 있어요</li>
</ol>
<p class="more">참고: <a href="https://docs.docker.com/engine/network/port-publishing/">포트 공개</a> · <a href="https://docs.docker.com/desktop/features/networking/networking-how-tos/">Docker Desktop 네트워크 사용법</a></p>
</section>

<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 컨테이너 안의 앱이 다른 기기의 API 서버로 요청을 보내는 것도 -p가 있어야 하나요?</summary>
<p>A. 아니요. bridge 기본 설정에서 컨테이너가 다른 기기에 요청을 보내는 데는 <code>-p</code>가 필요 없어요. <code>-p</code>는 다른 쪽에서 이 컨테이너의 앱으로 접속할 입구를 공개하는 옵션이에요.</p>
<p>Docker Engine을 직접 돌리는 리눅스 컴퓨터는 자기 안의 컨테이너 IP로 직접 접속할 수 있어요. 같은 bridge 구역의 컨테이너끼리도 IP로 바로 닿아요. 서로 다른 bridge 구역끼리는 기본 설정에서 공개 창구를 거쳐요.</p>
</details>
</aside>
</div>
<section class="slide">
<h3>localhost는 지금 서 있는 곳을 가리켜요</h3>
<svg class="dg" viewBox="0 0 400 204" role="img" aria-label="브라우저에서 localhost는 내 컴퓨터를 가리키고 컨테이너 안에서 localhost는 그 컨테이너를 가리켜요.">
<rect class="line" x="7" y="8" width="191" height="188" rx="12"/>
<text class="label center" x="102.5" y="35">내 브라우저</text>
<circle class="box" cx="102.5" cy="88" r="32"/><use class="ic" href="#i-user" x="80.5" y="66" width="44" height="44"/>
<text class="chip" x="102.5" y="149">localhost</text><text class="small" x="102.5" y="176">내 컴퓨터</text>
<rect class="line" x="202" y="8" width="191" height="188" rx="12"/>
<text class="label center" x="297.5" y="35">컨테이너 속 앱</text>
<circle class="kafka" cx="297.5" cy="88" r="32"/><use class="ic" href="#i-pot" x="275.5" y="66" width="44" height="44"/>
<text class="chip" x="297.5" y="149">localhost</text><text class="small" x="297.5" y="176">자기 조리대</text>
</svg>
<ol class="steps">
<li>자기 자신(localhost)은 127.0.0.1 같은 주소로 찾아요</li>
<li>별도 조리대 속 localhost로는 호스트의 DB에 닿지 않아요</li>
<li>Docker Desktop에서 호스트 이름은 <code>host.docker.internal</code>이에요</li>
</ol>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">이름표: 같은 구역에서 조리대를 찾아요</h2>

<section class="slide">
<h3>자리가 바뀌어도 이름표로 찾아요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="3번과 4번은 자리 번호 예시예요. 왼쪽 기본 공용 구역에서는 조리대를 3번 자리와 4번 자리처럼 번호로만 불러서 자리가 바뀌면 못 찾고 오른쪽 우리가 만든 구역에서는 web과 db 이름표로 불러서 이름만 알면 찾는 그림">
<rect class="line" x="10" y="14" width="185" height="172" rx="12"/>
<text class="label center" x="102" y="38">기본 공용 구역</text>
<path class="line" d="M67,90 L138,90"/>
<circle class="box" cx="45" cy="90" r="22"/><use class="ic" href="#i-pot" x="31" y="76" width="28" height="28"/>
<circle class="box" cx="160" cy="90" r="22"/><use class="ic" href="#i-pot" x="146" y="76" width="28" height="28"/>
<circle class="box" cx="102" cy="90" r="16"/><use class="ic" href="#i-hash" x="92" y="80" width="20" height="20"/>
<text class="chip" x="45" y="128">3번 (예시)</text><text class="chip" x="160" y="128">4번 (예시)</text>
<text class="alert" x="102" y="160">자리가 바뀌면 못 찾아요</text>
<rect class="line" x="205" y="14" width="185" height="172" rx="12"/>
<text class="label center" x="297" y="38">우리가 만든 구역</text>
<path class="line" d="M262,90 L333,90"/>
<circle class="box" cx="240" cy="90" r="22"/><use class="ic" href="#i-pot" x="226" y="76" width="28" height="28"/>
<circle class="box" cx="355" cy="90" r="22"/><use class="ic" href="#i-pot" x="341" y="76" width="28" height="28"/>
<circle class="box" cx="297" cy="90" r="16"/><use class="ic" href="#i-tag" x="287" y="80" width="20" height="20"/>
<text class="chip" x="297" y="61">구역 안내판</text>
<text class="chip" x="240" y="128">web</text><text class="chip" x="355" y="128">db</text>
<text class="small" x="297" y="160">이름만 알면 찾아요</text>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0s" repeatCount="indefinite" path="M262,90 L333,90"/></circle>
</svg>
<ol class="steps">
<li>주인이 만든 구역(사용자 정의 bridge)에 둘을 모아요 (예시)</li>
<li>새 조리대에 예전 이름을 붙이면 그 이름으로 찾아요</li>
</ol>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>이름 안내소가 지금의 자리 번호를 알려줘요</h3>
<svg class="dg" viewBox="0 0 400 222" role="img" aria-label="사용자 정의 네트워크 안에서 web 컨테이너가 내장 DNS 127.0.0.11에 db가 어디인지 묻고 DNS가 예시 IP 172.18.0.3을 알려 주면 web이 db의 5432번 포트로 접속하며 같은 네트워크 안이라 -p 없이도 닿는 흐름 그림">
<defs><marker id="n3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="10" y="14" width="380" height="196" rx="12"/>
<text class="label center" x="200" y="36">사용자 정의 네트워크</text>
<path class="line" d="M112,72 L289,72" marker-end="url(#n3)"/>
<path class="line" d="M288,98 L115,98" marker-end="url(#n3)"/>
<path class="line" d="M85,119 L85,147" marker-end="url(#n3)"/>
<use class="ic" href="#i-pot" x="64" y="59" width="40" height="40"/><text class="chip" x="85" y="111">web</text>
<use class="ic" href="#i-tag" x="292" y="53" width="39" height="39"/><text class="chip" x="314" y="105">이름 안내소</text><text class="small" x="314" y="124">127.0.0.11</text>
<text class="chip" x="198" y="60">① db?</text><text class="chip" x="202" y="118">② 172.18.0.3 (예시)</text>
<use class="ic" href="#i-pot" x="65" y="150" width="40" height="40"/><text class="chip" x="85" y="201">db</text>
<text class="chip" x="189" y="161">③ 172.18.0.3:5432</text>
<circle class="packet" r="5"><animateMotion dur="3.6s" repeatCount="indefinite" path="M112,72 L289,72 M288,98 L115,98 M85,119 L85,147"/></circle>
</svg>
<ol class="steps">
<li>웹 앱은 이름 안내소(DNS)에 먼저 물어요 (예시)</li>
<li>웹 앱은 받은 자리 번호로 DB 창구에 닿아요</li>
<li>같은 구역 안에서는 DB 포트를 밖에 공개할 필요가 없어요</li>
</ol>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 컨테이너 IP는 어디서 확인하고 다시 만들면 바뀌나요?</summary>
<p>A. <code>docker inspect db</code>의 NetworkSettings 아래 Networks에서 확인해요. 다시 만들면 IP가 바뀔 수 있으니 앱의 연결 주소에는 같은 네트워크의 컨테이너 이름을 써요.</p>
</details>
</aside>
</div>

<section class="slide">
<h3>이름으로 찾으려면 같은 구역에 넣어요</h3>
<svg class="dg" viewBox="0 0 400 205" role="img" aria-label="기본 bridge에는 자동으로 붙고 사용자 정의 bridge에는 지정한 컨테이너만 붙어 이름으로 찾아요.">
<rect class="line" x="7" y="8" width="191" height="188" rx="12"/>
<text class="label center" x="102.5" y="34">기본 구역</text>
<circle class="box" cx="102.5" cy="91" r="34"/><use class="ic" href="#i-network" x="79.5" y="68" width="46" height="46"/>
<text class="chip" x="102.5" y="149">자동 참여</text><text class="small" x="102.5" y="175">IP로 찾기</text>
<rect class="line" x="202" y="8" width="191" height="188" rx="12"/>
<text class="label center" x="297.5" y="34">직접 만든 구역</text>
<circle class="kafka" cx="297.5" cy="91" r="34"/><use class="ic" href="#i-network" x="274.5" y="68" width="46" height="46"/>
<text class="chip" x="297.5" y="149">지정해서 참여</text><text class="small" x="297.5" y="175">이름으로 찾기</text>
</svg>
<ol class="steps">
<li>구역을 고르지 않으면 기본 bridge에 붙어요</li>
<li>앱 주인은 둘을 같은 구역(mynet)에 넣어요</li>
<li>그 안에서 DB 조리대에 이름표(db)를 붙여요</li>
</ol>
</section>

<section class="slide">
<h3>웹 앱의 DB 주소에는 이름과 포트를 적어요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="mynet 안에서 웹 조리대가 이름표 db가 붙은 PostgreSQL 18 조리대에 db:5432로 접속해요.">
<rect class="line" x="8" y="8" width="384" height="184" rx="12"/>
<text class="label center" x="200" y="35">mynet</text>
<path class="line" d="M112,97 H281 l-10,-7 m10,7 l-10,7"/>
<text class="chip" x="196" y="79">db:5432</text>
<circle class="box" cx="73" cy="98" r="32"/><use class="ic" href="#i-pot" x="52" y="77" width="42" height="42"/>
<circle class="kafka" cx="323" cy="98" r="32"/><use class="ic" href="#i-pot" x="302" y="77" width="42" height="42"/>
<text class="big" x="73" y="158">웹 조리대</text><text class="big" x="323" y="158">DB 조리대</text>
</svg>
<ol class="steps">
<li>웹 앱이 읽는 환경 설정에 <code>db:5432</code>를 적어요</li>
<li>DB 상자(<code>postgres:18</code>)의 기본 포트는 5432예요</li>
</ol>
<p class="more"><a href="{{ '/2026/11/15/compose/' | relative_url }}">4편</a>에서 Compose가 기본 구역의 서비스 이름을 쓰는 이유를 봐요</p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">선택: 조리대에 필요한 연결만 남겨요</h2>

<section class="slide">
<h3>필요한 통로를 보고 연결 방식을 골라요</h3>
<svg class="dg" viewBox="0 0 400 204" role="img" aria-label="bridge에는 구역 안의 통로가 있고 host는 호스트의 창구를 공유하며 none에는 자기 자신과 통하는 루프백만 남아요.">
<rect class="line" x="7" y="8" width="126" height="188" rx="12"/>
<text class="label center" x="70" y="35">bridge</text>
<circle class="box" cx="70" cy="88" r="32"/><use class="ic" href="#i-network" x="48" y="66" width="44" height="44"/>
<text class="chip" x="70" y="149">구역 안 통로</text><text class="small" x="70" y="176">기본 방식</text>
<rect class="line" x="137" y="8" width="126" height="188" rx="12"/>
<text class="label center" x="200" y="35">host</text>
<circle class="kafka" cx="200" cy="88" r="32"/><use class="ic" href="#i-door" x="178" y="66" width="44" height="44"/>
<text class="chip" x="200" y="149">호스트 창구</text><text class="small" x="200" y="176">직접 사용</text>
<rect class="line" x="267" y="8" width="126" height="188" rx="12"/>
<text class="label center" x="330" y="35">none</text>
<circle class="box" cx="330" cy="88" r="32"/><use class="ic" href="#i-unplug" x="308" y="66" width="44" height="44"/>
<text class="chip" x="330" y="149">외부 통로 없음</text><text class="small" x="330" y="176">루프백만 남음</text>
</svg>
<ol class="steps">
<li>보통은 구역을 나누는 bridge를 골라요</li>
<li>호스트 통로나 많은 포트를 직접 써야 하면 host를 골라요</li>
<li><code>--network none</code>은 자기 안에서만 일할 때 골라요</li>
</ol>
<p class="more">참고: <a href="https://docs.docker.com/engine/network/">네트워크 개요</a> · <a href="https://docs.docker.com/engine/network/drivers/bridge/">bridge 드라이버</a> · <a href="https://docs.docker.com/engine/network/drivers/none/">none 드라이버</a></p>
</section>

<section class="slide">
<h3>호스트 창구를 같이 쓰면 번호가 겹칠 수 있어요</h3>
<svg class="dg" viewBox="0 0 400 204" role="img" aria-label="8080과 8081, 80은 포트 번호 예시예요. 포트 매핑을 쓰는 bridge에서는 같은 내부 80번도 정문 8080과 8081로 나눌 수 있고 host에서는 한 주소의 80번을 두 앱이 동시에 차지할 수 없어요.">
<rect class="line" x="7" y="8" width="191" height="188" rx="12"/>
<text class="label center" x="102.5" y="35">bridge</text>
<circle class="box" cx="102.5" cy="88" r="32"/><use class="ic" href="#i-door" x="80.5" y="66" width="44" height="44"/>
<text class="chip" x="102.5" y="149">정문 8080·8081 (예시)</text><text class="small" x="102.5" y="176">각각 내부 80으로</text>
<rect class="line" x="202" y="8" width="191" height="188" rx="12"/>
<text class="label center" x="297.5" y="35">host</text>
<circle class="bad" cx="297.5" cy="88" r="32"/><use class="ic" href="#i-door" x="275.5" y="66" width="44" height="44"/>
<text class="chip" x="297.5" y="149">같은 주소의 80</text><text class="small" x="297.5" y="176">이미 쓰면 충돌</text>
</svg>
<ol class="steps">
<li>host는 컨테이너에 별도 IP를 주지 않고 -p도 무시해요</li>
<li>같은 주소·포트를 또 공개하면 다음 컨테이너가 시작되지 않아요 (<code>port is already allocated</code>)</li>
<li>리눅스 Engine과 설정을 켠 Desktop 4.34 이상에서 써요</li>
</ol>
<p class="more">참고: <a href="https://docs.docker.com/engine/network/drivers/host/">host 드라이버</a> · <a href="https://docs.docker.com/engine/network/port-publishing/">포트 공개</a></p>
</section>

</div>

</div>
