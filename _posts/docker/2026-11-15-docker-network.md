---
layout: post
title: "조리대끼리 어떻게 음식을 주고받을까? 밀키트로 이해하는 Docker 네트워크"
description: "칸막이로 나뉜 컨테이너가 바깥과 서로에게 닿는 방법을 밀키트 주방 비유로 설명하고 포트 매핑(-p)과 기본 bridge와 사용자 정의 bridge 네트워크와 이름으로 찾는 내장 DNS와 host·none 드라이버까지 실제 동작으로 이어서 설명합니다."
date: 2026-11-15 21:20:00 +0900
series: docker
episode: 3
summary: "컨테이너는 칸막이 너머라 바로 닿지 않아요. 포트 매핑으로 바깥 주문을 잇고 사용자 정의 네트워크에서는 컨테이너끼리 이름으로 찾아요."
---

<div class="lesson lesson-hierarchy">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: Lucide (lucide-static v1.25.0, ISC). 라이선스: assets/icons/LICENSE-lucide.txt. 원과 사각형 요소는 같은 모양의 path로 옮겼어요. -->
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

<div class="intro">
<p class="q">칸막이로 나뉜 컨테이너는 바깥이나 다른 컨테이너와 어떻게 주고받을까요?</p>
<p>Docker 시리즈의 세 번째 편이에요. 1편에서 컨테이너는 칸막이로 나뉜 조리대라고 했어요. 칸막이 덕분에 양념이 옆 요리에 섞이지 않지만 손님의 주문도 옆 조리대의 음식도 칸막이를 바로 넘지 못해요. 브라우저로 여는 웹 앱을 컨테이너로 띄웠는데 브라우저에서 열리지 않거나 앱이 DB 컨테이너를 찾지 못하는 일이 여기서 생겨요.</p>
<p>이 글을 다 읽으면 <b>포트 매핑</b>으로 바깥의 요청을 컨테이너까지 보내는 방법과 <b>사용자 정의 네트워크</b>에서 컨테이너끼리 <b>이름</b>으로 찾는 방법을 알 수 있어요. 기본 bridge 네트워크와 무엇이 다른지와 host·none 같은 다른 연결 방식도 가볍게 봐요.</p>
</div>

<div class="slide-group">
<h2 class="slide-group-title">무엇이 문제인가: 칸막이 너머로 닿지 않는 주문</h2>

<section class="slide">
<h3>칸막이 조리대에는 주문이 바로 닿지 않아요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="손님이 주방 건물 안의 조리대에 주문하려 하지만 건물 벽이 잠겨 있어 닿지 않고 건물 안의 조리대 A와 조리대 B 사이에는 칸막이가 있어 서로 위치를 모르는 그림">
<path class="line dash" d="M78,90 L103,90"/>
<rect class="line" x="120" y="14" width="270" height="166" rx="12"/>
<text class="label center" x="255" y="36">주방 건물</text>
<circle class="box" cx="50" cy="90" r="28"/><use class="ic" href="#i-user" x="32" y="72" width="36" height="36"/>
<text class="big" x="50" y="140">손님</text><text class="alert" x="50" y="160">못 닿아요</text>
<circle class="bad" cx="120" cy="90" r="17"/><use class="ic" href="#i-lock" x="109" y="79" width="22" height="22"/>
<circle class="kafka" cx="195" cy="95" r="30"/><use class="ic" href="#i-pot" x="175" y="75" width="40" height="40"/>
<circle class="kafka" cx="330" cy="95" r="30"/><use class="ic" href="#i-pot" x="310" y="75" width="40" height="40"/>
<path class="line" d="M262,60 L262,128"/>
<text class="chip" x="195" y="142">조리대 A</text><text class="chip" x="330" y="142">조리대 B</text>
<text class="small" x="262" y="162">옆 조리대가 어디 있는지 몰라요</text>
</svg>
<p class="point">칸막이 덕분에 섞이지 않지만 바깥 주문도 옆 조리대의 음식도 바로 넘어오지 못해요.</p>
<p class="explain">손님(브라우저가 보내는 요청)은 주방 건물 밖에서 주문하는데 조리대는 칸막이 안에 있어서 주문을 받을 창구가 없어요. 조리대 A의 요리사가 조리대 B에 소스를 부탁하려 해도 B가 지금 몇 번 자리에 있는지 모르면 넘길 수 없어요.</p>
</section>

<section class="slide">
<h3>실제로는: 컨테이너마다 네트워크 공간이 따로 있어요</h3>
<table>
<thead><tr><th>항목</th><th>컨테이너를 그냥 실행하면</th></tr></thead>
<tbody>
<tr><td>IP 주소</td><td>컨테이너마다 Docker가 하나씩 나눠 줘요</td></tr>
<tr><td>포트 번호</td><td>컨테이너마다 따로 있어서 둘 다 80번을 써도 겹치지 않아요</td></tr>
<tr><td>바깥에서 들어오기</td><td>컨테이너 포트로 들어오는 길이 없어요</td></tr>
<tr><td>옆 컨테이너 찾기</td><td>기본 네트워크에서는 IP 주소로만 닿아요</td></tr>
</tbody>
</table>
<p class="point">컨테이너마다 자기 IP와 포트를 가진 네트워크 공간이 따로 있어서 바깥에서는 바로 들어올 수 없어요.</p>
<p class="explain">IP 주소는 네트워크에서 컴퓨터를 찾는 집 주소이고 포트는 그 컴퓨터 안에서 어느 프로그램에게 갈지 정하는 창구 번호이고 웹 서버는 보통 80번 포트에서 요청을 기다려요. 이 글에서 바깥은 컨테이너 밖 전부를 뜻하고 같은 컴퓨터의 브라우저도 포함해요. Docker는 컨테이너를 실행할 때 리눅스 커널의 네트워크 네임스페이스로 칸막이를 쳐서 컨테이너마다 IP와 포트를 따로 줘요. 그래서 컨테이너 안의 웹 앱이 80번 포트에서 기다려도 바깥의 브라우저는 그 포트에 바로 닿지 않아요. 옆 컨테이너의 IP는 컨테이너를 다시 만들 때 바뀔 수 있어서 IP를 코드에 적어 두기도 어려워요.</p>
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
<h2 class="slide-group-title">포트 매핑: 가게 창구를 조리대에 잇기</h2>

<section class="slide">
<h3>가게 창구 번호를 조리대 창구에 이어요</h3>
<svg class="dg" viewBox="0 0 400 230" role="img" aria-label="손님이 주방 건물의 8080번 창구에 주문하면 그 주문이 조리대 web의 80번 창구로 넘어가고 창구를 잇지 않은 조리대 db에는 손님 주문이 닿지 않는 그림">
<defs><marker id="n1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="120" y="14" width="270" height="206" rx="12"/>
<text class="label center" x="255" y="36">주방 건물</text>
<path class="line" d="M73,85 L136,85" marker-end="url(#n1)"/>
<path class="line" d="M200,85 L286,85" marker-end="url(#n1)"/>
<circle class="box" cx="45" cy="85" r="28"/><use class="ic" href="#i-user" x="27" y="67" width="36" height="36"/>
<text class="big" x="45" y="135">손님</text>
<circle class="kafka" cx="170" cy="85" r="30"/><use class="ic" href="#i-door" x="150" y="65" width="40" height="40"/>
<text class="chip" x="170" y="132">8080번 창구</text>
<text class="chip" x="243" y="71">80번으로</text>
<circle class="kafka" cx="320" cy="85" r="30"/><use class="ic" href="#i-pot" x="300" y="65" width="40" height="40"/>
<text class="chip" x="320" y="132">조리대 web</text>
<circle class="box" cx="320" cy="178" r="20"/><use class="ic" href="#i-pot" x="307" y="165" width="26" height="26"/>
<text class="chip" x="320" y="210">조리대 db</text>
<text class="small" x="210" y="170">창구를 잇지 않은</text><text class="small" x="210" y="188">조리대에는 못 와요</text>
<circle class="packet" r="5"><animateMotion dur="1s" begin="0s" repeatCount="indefinite" path="M73,85 L136,85"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="0.6s" repeatCount="indefinite" path="M200,85 L286,85"/></circle>
</svg>
<p class="point">가게 정문의 창구 번호를 조리대 창구에 이어 두면 손님 주문이 그 조리대까지 가요.</p>
<p class="explain">가게 주인(Docker)이 8080번 창구로 온 주문은 web 조리대의 80번 창구로 보내라고 정해 두면 손님은 칸막이 안을 몰라도 8080번 창구에만 주문하면 돼요. 창구를 잇지 않은 db 조리대에는 손님 주문이 닿지 않아요.</p>
</section>

<section class="slide">
<h3>실제로는: -p는 호스트 포트를 컨테이너 포트에 이어요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="-p 8080:80에서 앞의 8080은 호스트 포트이고 뒤의 80은 컨테이너 포트이며 브라우저가 localhost:8080으로 요청하면 호스트가 8080번에서 받아 web 컨테이너의 80번 웹 앱으로 넘기는 흐름 그림">
<defs><marker id="n2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="big" x="70" y="40">-p</text>
<rect class="kafka" x="95" y="20" width="100" height="40" rx="6"/><text x="145" y="40">8080</text>
<text class="big" x="212" y="40">:</text>
<rect class="box" x="230" y="20" width="100" height="40" rx="6"/><text x="280" y="40">80</text>
<text class="small" x="145" y="76">호스트 포트</text><text class="small" x="280" y="76">컨테이너 포트</text>
<path class="line" d="M120,136 L141,136" marker-end="url(#n2)"/>
<path class="line" d="M255,136 L276,136" marker-end="url(#n2)"/>
<rect class="box" x="10" y="110" width="110" height="52" rx="8"/><text class="chip" x="65" y="128">브라우저</text><text class="small" x="65" y="148">localhost:8080</text>
<rect class="kafka" x="145" y="110" width="110" height="52" rx="8"/><text class="chip" x="200" y="128">호스트</text><text class="small" x="200" y="148">8080번 포트</text>
<rect class="box" x="280" y="110" width="110" height="52" rx="8"/><text class="chip" x="335" y="128">web 컨테이너</text><text class="small" x="335" y="148">80번의 웹 앱</text>
<text class="small" x="200" y="186">-p가 없으면 바깥에서 닿는 길이 없어요</text>
<circle class="packet" r="5"><animateMotion dur="1s" begin="0s" repeatCount="indefinite" path="M120,136 L141,136"/></circle>
<circle class="packet" r="5"><animateMotion dur="1s" begin="0.5s" repeatCount="indefinite" path="M255,136 L276,136"/></circle>
</svg>
<p class="point">-p 호스트포트:컨테이너포트를 주면 호스트로 온 연결을 Docker가 컨테이너 포트로 넘겨줘요.</p>
<p class="explain">개발자가 <code>docker run -p 8080:80</code>처럼 실행하면 Docker가 호스트(Docker를 돌리는 컴퓨터)의 8080번 포트로 들어온 연결을 컨테이너의 80번 포트로 넘겨줘요. 이것을 포트 공개(publish) 또는 포트 매핑이라고 하고 비유의 창구 연결에 해당해요. <code>-p</code>를 주지 않은 컨테이너의 포트는 호스트 쪽으로 열리지 않아요. 앞에 호스트 IP를 적지 않으면 Docker는 호스트의 모든 주소(그 컴퓨터를 가리키는 모든 IP)에 그 포트를 열어요.</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>이럴 땐 조심해요: 포트를 열 때 헷갈리는 것</h3>
<table>
<thead><tr><th>상황</th><th>실제와 확인할 것</th></tr></thead>
<tbody>
<tr><td>컨테이너 두 개에 똑같이 <code>-p 8080:80</code>을 줬어요</td><td>호스트의 8080번은 한 번에 하나만 쓸 수 있어서 두 번째는 <code>port is already allocated</code> 오류로 시작하지 못해요. <code>-p 8081:80</code>처럼 호스트 쪽 번호를 바꿔요</td></tr>
<tr><td>내 컴퓨터에서만 보려고 <code>-p 8080:80</code>을 줬어요</td><td>호스트의 모든 주소에 열려서 다른 컴퓨터에서도 닿을 수 있어요. <code>-p 127.0.0.1:8080:80</code>처럼 주소를 적으면 내 컴퓨터에서만 열려요</td></tr>
<tr><td>컨테이너 안의 앱이 <code>localhost</code>로 내 컴퓨터의 DB에 접속해요</td><td>컨테이너 안의 localhost는 그 컨테이너 자신이라 연결되지 않아요. Docker Desktop에서는 <code>host.docker.internal</code>이라는 이름으로 내 컴퓨터에 닿아요</td></tr>
</tbody>
</table>
<p class="point">호스트 포트는 한 번에 하나만 쓸 수 있고 주소를 적지 않으면 바깥에도 열려요.</p>
<p class="explain">localhost(숫자로는 127.0.0.1)는 지금 이 컴퓨터 자신을 뜻하는 이름이라서 내 컴퓨터에서는 내 컴퓨터를, 컨테이너 안에서는 그 컨테이너를 가리켜요. 컨테이너끼리 이을 때는 포트를 열기보다 다음 묶음의 네트워크와 이름을 써요.</p>
<p>참고: <a href="https://docs.docker.com/engine/network/port-publishing/">포트 공개</a> · <a href="https://docs.docker.com/desktop/features/networking/networking-how-tos/">Docker Desktop 네트워크 사용법</a></p>
</section>

<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 컨테이너 안의 앱이 바깥 인터넷으로 나가는 것도 -p가 있어야 하나요?</summary>
<p>A. 아니요. 컨테이너에서 바깥으로 <b>나가는</b> 연결은 <code>-p</code> 없이도 돼요. 예를 들어 앱이 외부 서버의 API를 부르거나 패키지를 내려받는 일이에요.</p>
<p><code>-p</code>는 바깥에서 컨테이너로 <b>들어오는</b> 연결을 열 때만 필요해요.</p>
</details>
</aside>
</div>
</div>

<div class="slide-group">
<h2 class="slide-group-title">이름으로 찾기: 우리만의 구역과 이름표</h2>

<section class="slide">
<h3>번호로 부르기와 이름표로 부르기</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="왼쪽 기본 공용 구역에서는 조리대를 3번 자리와 4번 자리처럼 번호로만 불러서 자리가 바뀌면 못 찾고 오른쪽 우리가 만든 구역에서는 web과 db 이름표로 불러서 이름만 알면 찾는 그림">
<rect class="line" x="10" y="14" width="185" height="172" rx="12"/>
<text class="label center" x="102" y="38">기본 공용 구역</text>
<path class="line" d="M67,90 L138,90"/>
<circle class="bad" cx="45" cy="90" r="22"/><use class="ic" href="#i-pot" x="31" y="76" width="28" height="28"/>
<circle class="bad" cx="160" cy="90" r="22"/><use class="ic" href="#i-pot" x="146" y="76" width="28" height="28"/>
<circle class="box" cx="102" cy="90" r="16"/><use class="ic" href="#i-hash" x="92" y="80" width="20" height="20"/>
<text class="chip" x="45" y="128">3번 자리</text><text class="chip" x="160" y="128">4번 자리</text>
<text class="alert" x="102" y="160">자리가 바뀌면 못 찾아요</text>
<rect class="line" x="205" y="14" width="185" height="172" rx="12"/>
<text class="label center" x="297" y="38">우리가 만든 구역</text>
<path class="line" d="M262,90 L333,90"/>
<circle class="kafka" cx="240" cy="90" r="22"/><use class="ic" href="#i-pot" x="226" y="76" width="28" height="28"/>
<circle class="kafka" cx="355" cy="90" r="22"/><use class="ic" href="#i-pot" x="341" y="76" width="28" height="28"/>
<circle class="box" cx="297" cy="90" r="16"/><use class="ic" href="#i-tag" x="287" y="80" width="20" height="20"/>
<text class="chip" x="240" y="128">web</text><text class="chip" x="355" y="128">db</text>
<text class="small" x="297" y="160">이름만 알면 찾아요</text>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0s" repeatCount="indefinite" path="M262,90 L333,90"/></circle>
</svg>
<p class="point">자리 번호로만 부르면 자리가 바뀔 때 못 찾고 이름표로 부르면 언제든 찾아요.</p>
<p class="explain">가게가 처음부터 마련해 둔 공용 구역에서는 조리대끼리 자리 번호로만 음식을 넘길 수 있어요. 요리사(개발자)가 구역을 따로 만들고 함께 일할 조리대를 들이면 구역 안내판이 이름표(컨테이너 이름)를 보고 지금 자리를 알려 줘요. 공용 구역은 기본 bridge 네트워크이고 새로 만든 구역은 사용자 정의 네트워크예요.</p>
</section>

<section class="slide">
<h3>실제로는: 내장 DNS가 이름을 IP로 바꿔 줘요</h3>
<svg class="dg" viewBox="0 0 400 222" role="img" aria-label="사용자 정의 네트워크 안에서 web 컨테이너가 내장 DNS 127.0.0.11에 db가 어디인지 묻고 DNS가 예시 IP 172.18.0.3을 알려 주면 web이 db의 5432번 포트로 접속하며 같은 네트워크 안이라 -p 없이도 닿는 흐름 그림">
<defs><marker id="n3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="10" y="14" width="380" height="196" rx="12"/>
<text class="label center" x="200" y="36">사용자 정의 네트워크</text>
<path class="line" d="M140,72 L256,72" marker-end="url(#n3)"/>
<path class="line" d="M260,98 L144,98" marker-end="url(#n3)"/>
<path class="line" d="M85,110 L85,144" marker-end="url(#n3)"/>
<rect class="box" x="30" y="60" width="110" height="50" rx="8"/><text x="85" y="85">web</text>
<rect class="kafka" x="260" y="60" width="110" height="50" rx="8"/><text x="315" y="78">내장 DNS</text><text class="small" x="315" y="98">127.0.0.11</text>
<text class="small" x="198" y="60">① db는 어디?</text>
<text class="small" x="202" y="114">② 172.18.0.3 (예)</text>
<rect class="box" x="30" y="148" width="110" height="50" rx="8"/><text x="85" y="166">db</text><text class="small" x="85" y="186">5432번 포트</text>
<text class="small" x="95" y="134" style="text-anchor:start">③ db:5432로 접속</text>
<text class="small" x="300" y="160">같은 네트워크 안에서는</text><text class="small" x="300" y="180">-p 없이도 닿아요</text>
<circle class="packet" r="5"><animateMotion dur="1s" begin="0s" repeatCount="indefinite" path="M140,72 L256,72"/></circle>
<circle class="packet" r="5"><animateMotion dur="1s" begin="0.8s" repeatCount="indefinite" path="M260,98 L144,98"/></circle>
<circle class="packet" r="5"><animateMotion dur="1s" begin="1.6s" repeatCount="indefinite" path="M85,110 L85,144"/></circle>
</svg>
<p class="point">사용자 정의 네트워크에서는 Docker의 내장 DNS가 컨테이너 이름을 지금의 IP로 바꿔 줘요.</p>
<p class="explain">DNS는 이름을 IP 주소로 바꿔 주는 전화번호부 같은 장치이고 비유의 구역 안내판이에요. 개발자가 <code>docker network create mynet</code>으로 네트워크를 만들고 web과 db 컨테이너를 <code>--name db --network mynet</code>처럼 이름을 주면서 붙이면 web 앱은 주소 대신 <code>db</code>라는 이름으로 접속해요(예의 db는 PostgreSQL DB라 기본 포트인 5432번을 써요). 그러면 Docker의 내장 DNS가 그 이름을 지금 db 컨테이너의 IP로 알려 주고 같은 네트워크 안의 컨테이너끼리는 <code>-p</code>로 포트를 열지 않아도 서로의 포트에 닿아요. db 컨테이너를 다시 만들어 IP가 바뀌어도 이름은 그대로라서 web의 설정을 고치지 않아도 돼요.</p>
</section>

<section class="slide">
<h3>기본 bridge와 사용자 정의 bridge의 차이</h3>
<table>
<thead><tr><th>비교</th><th>기본 bridge</th><th>사용자 정의 bridge</th></tr></thead>
<tbody>
<tr><td>붙는 때</td><td><code>--network</code> 없이 실행하면 자동으로 붙어요</td><td><code>docker network create</code>로 만들고 <code>--network</code>로 붙여요</td></tr>
<tr><td>서로 찾는 법</td><td>IP 주소로만 닿아요. 이름은 옛 기능인 <code>--link</code>를 써야 해요</td><td>컨테이너 이름으로 찾아요</td></tr>
<tr><td>함께 있는 컨테이너</td><td>네트워크를 정하지 않은 컨테이너 전부</td><td>그 네트워크에 붙인 컨테이너만</td></tr>
<tr><td>다른 bridge 네트워크의 컨테이너와</td><td colspan="2">어느 쪽이든 서로 바로 닿지 않고 그쪽이 <code>-p</code>로 공개한 호스트 포트를 거쳐야 닿아요</td></tr>
</tbody>
</table>
<p class="point">컨테이너끼리 이름으로 부르려면 사용자 정의 bridge 네트워크를 만들어 함께 넣어요.</p>
<p class="explain">Docker 엔진은 처음부터 <code>bridge</code>라는 기본 네트워크를 만들어 두고 네트워크를 정하지 않은 컨테이너를 모두 여기에 붙여요. 그래서 서로 이름으로 불러야 하는 앱과 DB는 사용자 정의 네트워크에 함께 넣어요. 4편에서 볼 Compose는 앱마다 이런 네트워크를 하나 만들고 서비스 이름으로 찾게 해 줘요.</p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">다른 연결 방식: 칸막이를 걷거나 문을 닫기</h2>

<section class="slide">
<h3>칸막이를 걷는 조리대와 문을 닫는 조리대</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="왼쪽은 칸막이를 걷어 손님 주문이 창구 연결 없이 조리대로 바로 오고 오른쪽은 조리대 문을 잠가 아무와도 주고받지 않는 그림">
<defs><marker id="n4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="10" y="14" width="185" height="172" rx="12"/>
<text class="label center" x="102" y="38">칸막이를 걷어요</text>
<path class="line" d="M74,92 L122,92" marker-end="url(#n4)"/>
<circle class="box" cx="50" cy="92" r="22"/><use class="ic" href="#i-user" x="36" y="78" width="28" height="28"/>
<circle class="box" cx="150" cy="92" r="24"/><use class="ic" href="#i-pot" x="135" y="77" width="30" height="30"/>
<text class="small" x="102" y="140">가게 창구를 그대로 써요</text>
<text class="small" x="102" y="160">창구 연결이 필요 없어요</text>
<rect class="line" x="205" y="14" width="185" height="172" rx="12"/>
<text class="label center" x="297" y="38">문을 닫아요</text>
<circle class="box" cx="270" cy="92" r="24"/><use class="ic" href="#i-pot" x="255" y="77" width="30" height="30"/>
<circle class="box" cx="330" cy="92" r="17"/><use class="ic" href="#i-lock" x="319" y="81" width="22" height="22"/>
<text class="small" x="297" y="140">아무와도 주고받지 않아요</text>
<text class="small" x="297" y="160">혼자 하는 일만 해요</text>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="0s" repeatCount="indefinite" path="M74,92 L122,92"/></circle>
</svg>
<p class="point">칸막이를 걷으면 가게 창구를 바로 쓰고 문을 닫으면 아무와도 주고받지 않아요.</p>
<p class="explain">어떤 조리대는 칸막이 없이 가게의 창구를 직접 써서 창구 번호를 따로 이어 줄 필요가 없어요. 반대로 바깥과 주고받을 일이 없는 조리대는 문을 닫아 두면 아무것도 새어 나가지 않아요.</p>
</section>

<section class="slide">
<h3>실제로는: 연결 방식은 네트워크 드라이버가 정해요</h3>
<table>
<thead><tr><th>드라이버</th><th>하는 일</th><th>쓰는 때</th></tr></thead>
<tbody>
<tr><td><code>bridge</code> (기본값)</td><td>호스트 안에 컨테이너 전용 네트워크를 만들어요</td><td>대부분의 경우</td></tr>
<tr><td><code>host</code></td><td>칸막이 없이 호스트의 네트워크를 그대로 써요. 컨테이너에 따로 IP가 없고 <code>-p</code>는 무시돼요</td><td>중간 단계 없이 호스트 네트워크를 바로 써야 하거나 포트를 아주 많이 써야 할 때</td></tr>
<tr><td><code>none</code></td><td>자기 자신과만 통하는 연결(루프백)만 남기고 네트워크를 끊어요</td><td>네트워크가 필요 없는 작업</td></tr>
<tr><td><code>overlay</code></td><td>여러 대의 Docker 호스트를 하나의 네트워크로 이어요</td><td>Swarm으로 서버 여러 대를 묶을 때</td></tr>
</tbody>
</table>
<p class="point">컨테이너가 네트워크에 붙는 방식은 드라이버가 정하고 기본은 bridge예요.</p>
<p class="explain">드라이버는 Docker가 컨테이너를 네트워크에 잇는 방식이에요. 개발자가 <code>--network host</code>나 <code>--network none</code>처럼 고르면 Docker가 그 방식으로 컨테이너를 붙여요. host 드라이버는 리눅스의 Docker Engine에서 쓸 수 있고 Docker Desktop에서는 4.34 버전부터 설정에서 직접 켜야 써요.</p>
<p>참고: <a href="https://docs.docker.com/engine/network/">네트워크 개요</a> · <a href="https://docs.docker.com/engine/network/drivers/bridge/">bridge 드라이버</a> · <a href="https://docs.docker.com/engine/network/drivers/host/">host 드라이버</a> · <a href="https://docs.docker.com/engine/network/drivers/none/">none 드라이버</a> · <a href="https://docs.docker.com/compose/how-tos/networking/">Compose 네트워크</a></p>
</section>

<section class="slide">
<h3>한눈에 다시 보기: 이 글의 다섯 줄</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="컨테이너마다 IP와 포트가 따로 있는 칸막이가 문제이고 포트 매핑은 호스트 포트로 온 연결을 컨테이너로 넘기며 사용자 정의 네트워크는 함께 일할 컨테이너만 잇고 내장 DNS가 컨테이너 이름을 IP로 바꿔 주며 host와 none은 칸막이를 걷거나 네트워크를 끊는다는 다섯 줄 요약 그림">
<circle class="bad" cx="30" cy="28" r="18"/><use class="ic" href="#i-lock" x="19" y="17" width="22" height="22"/>
<text class="label" x="62" y="19">문제</text><text class="small" x="62" y="38" style="text-anchor:start">컨테이너마다 IP와 포트가 따로 있어 바로 닿지 않아요</text>
<circle class="kafka" cx="30" cy="76" r="18"/><use class="ic" href="#i-door" x="19" y="65" width="22" height="22"/>
<text class="label" x="62" y="67">포트 매핑 (-p)</text><text class="small" x="62" y="86" style="text-anchor:start">호스트 포트로 온 연결을 컨테이너 포트로 넘겨요</text>
<circle class="kafka" cx="30" cy="124" r="18"/><use class="ic" href="#i-network" x="19" y="113" width="22" height="22"/>
<text class="label" x="62" y="115">사용자 정의 네트워크</text><text class="small" x="62" y="134" style="text-anchor:start">함께 일할 컨테이너만 모아 이어요</text>
<circle class="kafka" cx="30" cy="172" r="18"/><use class="ic" href="#i-tag" x="19" y="161" width="22" height="22"/>
<text class="label" x="62" y="163">이름으로 찾기</text><text class="small" x="62" y="182" style="text-anchor:start">내장 DNS가 컨테이너 이름을 IP로 바꿔 줘요</text>
<circle class="box" cx="30" cy="220" r="18"/><use class="ic" href="#i-unplug" x="19" y="209" width="22" height="22"/>
<text class="label" x="62" y="211">host · none</text><text class="small" x="62" y="230" style="text-anchor:start">칸막이를 걷거나 네트워크를 아예 끊어요</text>
</svg>
<p class="point">바깥과는 포트 매핑으로 잇고 컨테이너끼리는 사용자 정의 네트워크에서 이름으로 이어요.</p>
</section>
</div>

</div>
