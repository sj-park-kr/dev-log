---
layout: post
title: "컨슈머와 컨슈머 그룹은 왜 필요할까? 배송 팀으로 이해하는 Kafka 컨슈머"
description: "카프카 컨슈머 그룹이 어떤 문제를 풀려고 생겼는지 배송 기사 비유로 쉽게 설명하고, 개발자용으로 그룹 코디네이터·리밸런싱·오프셋 커밋·자동 커밋의 함정과 KIP-848·share group까지 정리합니다."
date: 2026-11-15 14:00:00 +0900
series: kafka
episode: 4
summary: "배송 기사 여럿이 칸을 나눠 맡는 것이 컨슈머 그룹이에요. 같은 팀은 나눠 가져가고, 다른 팀은 같은 택배를 따로 가져가요."
---

<div class="lesson">
<nav class="tabs"><a href="#easy">쉬운 설명</a><a href="#dev">개발자용 심화</a></nav>

<div id="easy" class="panel">

<div class="intro">
<p class="q">택배를 꺼내 가는 기사가 여럿이면, 어떻게 나눠 맡을까요?</p>
<p>3편에서는 택배를 맡기는 쪽의 걱정을 봤어요. 이번에는 반대쪽이에요. 주문이 계속 쌓이는데 꺼내 가는 기사가 한 명이면 밀리고, 기사를 그냥 늘리면 같은 택배를 둘이 가져가는 문제가 생겨요.</p>
<p>이 글을 다 읽으면 기사들이 한 팀(<b>컨슈머 그룹</b>)으로 칸을 나눠 맡는 방법과, 팀원이 바뀌어도 <b>팀 장부(오프셋 커밋)</b> 덕분에 이어서 가져가는 이유를 알 수 있어요.</p>
</div>

<section class="slide">
<h2>기사 한 명이 모든 칸을 돌면</h2>
<svg class="dg" viewBox="0 0 400 225" role="img" aria-label="주문 선반의 칸 세 개에서 기사 한 명이 모든 택배를 혼자 가져가느라 밀리는 그림">
<defs><marker id="a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="kafka" x="20" y="20" width="110" height="50" rx="8"/><text x="75" y="45">칸 0</text>
<rect class="kafka" x="20" y="90" width="110" height="50" rx="8"/><text x="75" y="115">칸 1</text>
<rect class="kafka" x="20" y="160" width="110" height="50" rx="8"/><text x="75" y="185">칸 2</text>
<path class="line" d="M130,45 L268,105" marker-end="url(#a1)"/>
<path class="line" d="M130,115 L268,115" marker-end="url(#a1)"/>
<path class="line" d="M130,185 L268,125" marker-end="url(#a1)"/>
<rect class="bad blink" x="270" y="85" width="110" height="60" rx="8"/><text x="325" y="115">기사 1명</text>
<text class="alert" x="325" y="165">다 못 돌아요</text>
</svg>
<p class="point">기사가 한 명이면 택배가 밀려요.</p>
<p class="explain">2편에서 선반을 칸으로 나눠 둬도, 꺼내 가는 기사가 한 명이면 소용이 없어요. 기사 한 명이 세 칸을 번갈아 돌며 처리할 수 있는 양에는 한계가 있어요. 그 사이 주문은 계속 쌓이고, 알림 문자 같은 일은 점점 늦어져요.</p>
</section>

<section class="slide">
<h2>기사를 그냥 늘리면</h2>
<svg class="dg" viewBox="0 0 400 230" role="img" aria-label="한 칸의 3번 택배를 기사 1과 기사 2가 둘 다 가져가는 그림">
<defs><marker id="a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="kafka" x="20" y="90" width="100" height="50" rx="8"/><text x="70" y="115">칸 0</text>
<path class="line" d="M120,115 L268,52" marker-end="url(#a2)"/>
<path class="line" d="M120,115 L268,172" marker-end="url(#a2)"/>
<rect class="bad" x="270" y="30" width="110" height="44" rx="8"/><text x="325" y="52">기사 1</text><text class="alert" x="325" y="92">3번 가져감</text>
<rect class="bad" x="270" y="150" width="110" height="44" rx="8"/><text x="325" y="172">기사 2</text><text class="alert" x="325" y="212">3번 가져감</text>
<text class="alert" x="200" y="115">같은 택배</text>
</svg>
<p class="point">서로 모르고 가져가면 같은 택배를 둘이 가져가요.</p>
<p class="explain">그렇다고 기사를 규칙 없이 늘리면 새 문제가 생겨요. 기사들은 서로를 몰라서, 같은 칸에서 같은 택배를 각자 꺼내 가요. 결제 완료 택배를 두 명이 처리하면 알림 문자가 두 번 나갈 수 있어요. 그래서 누가 어느 칸을 맡을지 정하는 약속이 필요해요.</p>
</section>

<details class="origin">
<summary>더 알아보기: 이 규칙은 어떻게 다듬어졌을까?</summary>
<p><b>같은 이름표(group.id)를 가진 컨슈머끼리 일을 나누고, 이름표가 다른 그룹은 서로 상관없이 읽는다</b>는 약속은 카프카 컨슈머의 기본 규칙이에요.</p>
<p>예전 방식은 팀원이 바뀌어 담당을 다시 나눌 때, 팀 전체가 한 번에 맞춰야 하는 단계(전역 동기화 장벽)를 거쳤어요. 이 단계를 없앤 새 방식이 <b>KIP-848</b>이고, Kafka 4.0(2025년 3월 18일 릴리스)에서 정식(GA)이 됐어요.</p>
<p>"한 칸은 한 명만 맡는다"는 규칙을 벗어난 <b>share group</b>도 있어요. KIP-932("Queues for Kafka")로 만들어졌고, 4.0에서 Early Access, 4.1에서 Preview를 거쳐 4.2부터 정식이에요.</p>
</details>

<section class="slide">
<h2>그래서, 배송 팀</h2>
<svg class="dg" viewBox="0 0 400 225" role="img" aria-label="칸 0, 1, 2를 배송 팀 안의 기사 1, 2, 3이 한 명씩 맡아 가져가는 그림">
<defs><marker id="a3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="box dash" x="250" y="2" width="142" height="218" rx="10"/><text class="small" x="321" y="16">배송 팀</text>
<rect class="kafka" x="10" y="30" width="80" height="44" rx="8"/><text x="50" y="52">칸 0</text>
<rect class="kafka" x="10" y="100" width="80" height="44" rx="8"/><text x="50" y="122">칸 1</text>
<rect class="kafka" x="10" y="170" width="80" height="44" rx="8"/><text x="50" y="192">칸 2</text>
<path class="line" d="M90,52 L268,52" marker-end="url(#a3)"/>
<path class="line" d="M90,122 L268,122" marker-end="url(#a3)"/>
<path class="line" d="M90,192 L268,192" marker-end="url(#a3)"/>
<rect class="box" x="270" y="30" width="110" height="44" rx="8"/><text x="325" y="52">기사 1</text>
<rect class="box" x="270" y="100" width="110" height="44" rx="8"/><text x="325" y="122">기사 2</text>
<rect class="box" x="270" y="170" width="110" height="44" rx="8"/><text x="325" y="192">기사 3</text>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="0.2s" repeatCount="indefinite" path="M90,52 L268,52"/></circle>
<circle class="packet" r="5"><animateMotion dur="2.2s" begin="0.6s" repeatCount="indefinite" path="M90,122 L268,122"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.9s" begin="1s" repeatCount="indefinite" path="M90,192 L268,192"/></circle>
</svg>
<p class="point">한 팀 안에서는 칸 하나를 기사 한 명만 맡아요.</p>
<p class="explain">기사들을 한 팀으로 묶고, 팀 안에서는 칸마다 담당을 한 명씩만 정해요. 이러면 같은 택배를 두 번 가져가는 일이 없어요. 기사가 셋이면 세 칸을 동시에 비우니까, 밀리던 택배도 빨리 줄어요.</p>
</section>

<section class="slide">
<h2>다른 팀은 따로 가져가요</h2>
<svg class="dg" viewBox="0 0 400 260" role="img" aria-label="주문 선반을 재고 팀의 기사 두 명이 나눠 읽고, 알림 팀의 기사 한 명이 혼자 전부 읽는 그림">
<defs><marker id="a4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="kafka" x="10" y="70" width="100" height="110" rx="10"/><text x="60" y="125">주문 선반</text>
<path class="line" d="M110,125 L208,65" marker-end="url(#a4)"/>
<path class="line" d="M110,125 L208,195" marker-end="url(#a4)"/>
<rect class="box dash" x="210" y="10" width="180" height="110" rx="10"/><text class="small" x="300" y="26">재고 팀</text>
<rect class="box" x="220" y="40" width="76" height="36" rx="8"/><text x="258" y="58">기사 1</text><text class="small" x="258" y="96">칸 0, 1</text>
<rect class="box" x="304" y="40" width="76" height="36" rx="8"/><text x="342" y="58">기사 2</text><text class="small" x="342" y="96">칸 2</text>
<rect class="box dash" x="210" y="140" width="180" height="110" rx="10"/><text class="small" x="300" y="156">알림 팀</text>
<rect class="box" x="250" y="170" width="100" height="36" rx="8"/><text x="300" y="188">기사 1</text><text class="small" x="300" y="226">칸 0, 1, 2</text>
</svg>
<p class="point">팀이 다르면 같은 택배를 각자 따로 가져가요.</p>
<p class="explain">같은 주문 택배를 필요로 하는 서비스는 여럿이에요. 재고 팀은 주문을 보고 재고를 줄이고, 알림 팀은 같은 주문을 보고 문자를 보내요. 팀 이름표가 다르면 서로 상관없이 각자 전체를 가져가요. 한 팀이 가져갔다고 다른 팀 몫이 없어지지도 않아요.</p>
</section>

<section class="slide">
<h2>팀원이 들어오면 담당을 다시 나눠요</h2>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="기사 2명일 때는 기사 1이 칸 0과 1을, 기사 2가 칸 2를 맡다가, 기사가 3명이 되면 한 칸씩 맡는 그림">
<text class="label" x="10" y="14">기사 2명</text>
<rect class="kafka" x="30" y="30" width="100" height="36" rx="8"/><text x="80" y="48">칸 0</text>
<rect class="kafka" x="150" y="30" width="100" height="36" rx="8"/><text x="200" y="48">칸 1</text>
<rect class="kafka" x="270" y="30" width="100" height="36" rx="8"/><text x="320" y="48">칸 2</text>
<path class="line" d="M80,66 L80,80"/><path class="line" d="M200,66 L200,80"/><path class="line" d="M320,66 L320,80"/>
<rect class="box" x="30" y="80" width="100" height="32" rx="8"/><text x="80" y="96">기사 1</text>
<rect class="box" x="150" y="80" width="100" height="32" rx="8"/><text x="200" y="96">기사 1</text>
<rect class="box" x="270" y="80" width="100" height="32" rx="8"/><text x="320" y="96">기사 2</text>
<text class="label" x="10" y="140">기사 3명 (한 명 합류)</text>
<rect class="kafka" x="30" y="156" width="100" height="36" rx="8"/><text x="80" y="174">칸 0</text>
<rect class="kafka" x="150" y="156" width="100" height="36" rx="8"/><text x="200" y="174">칸 1</text>
<rect class="kafka" x="270" y="156" width="100" height="36" rx="8"/><text x="320" y="174">칸 2</text>
<path class="line" d="M80,192 L80,206"/><path class="line" d="M200,192 L200,206"/><path class="line" d="M320,192 L320,206"/>
<rect class="box" x="30" y="206" width="100" height="32" rx="8"/><text x="80" y="222">기사 1</text>
<rect class="new" x="150" y="206" width="100" height="32" rx="8"/><text x="200" y="222">기사 2</text>
<rect class="new" x="270" y="206" width="100" height="32" rx="8"/><text x="320" y="222">기사 3</text>
</svg>
<p class="point">팀원이 들어오거나 나가면, 칸 담당을 다시 나눠요(리밸런싱).</p>
<p class="explain">주문이 몰려서 기사를 한 명 더 부르면, 두 칸을 맡던 기사가 한 칸을 넘겨주고 셋이 한 칸씩 나눠 가져요. 반대로 기사 한 명이 갑자기 연결이 끊겨도, 그 사람이 맡던 칸을 다른 기사가 이어받아요. 그래서 기사가 들락거려도 맡는 사람이 없는 칸이 생기지 않아요.</p>
</section>

<section class="slide">
<h2>기사가 칸보다 많으면</h2>
<svg class="dg" viewBox="0 0 400 230" role="img" aria-label="칸이 두 개인데 기사가 세 명이라서 기사 3은 맡을 칸이 없어 쉬는 그림">
<defs><marker id="a5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="kafka" x="10" y="30" width="90" height="40" rx="8"/><text x="55" y="50">칸 0</text>
<rect class="kafka" x="10" y="100" width="90" height="40" rx="8"/><text x="55" y="120">칸 1</text>
<path class="line" d="M100,50 L268,50" marker-end="url(#a5)"/>
<path class="line" d="M100,120 L268,120" marker-end="url(#a5)"/>
<rect class="box" x="270" y="30" width="110" height="40" rx="8"/><text x="325" y="50">기사 1</text>
<rect class="box" x="270" y="100" width="110" height="40" rx="8"/><text x="325" y="120">기사 2</text>
<rect class="box dash" x="270" y="170" width="110" height="40" rx="8"/><text x="325" y="190">기사 3</text>
<text class="small" x="170" y="190">맡을 칸 없음</text>
</svg>
<p class="point">칸 수보다 기사가 많으면, 남는 기사는 쉬어요.</p>
<p class="explain">칸 하나는 한 명만 맡는 규칙이니까, 칸이 둘인데 기사가 셋이면 셋째 기사는 맡을 칸이 없어요. 주문이 아무리 몰려도 기사를 더 부르는 것만으로는 빨라지지 않아요. 더 빨리 처리하고 싶으면 기사뿐 아니라 칸도 함께 늘려야 해요.</p>
</section>

<section class="slide">
<h2>장부를 보고 이어서 가져가요</h2>
<svg class="dg" viewBox="0 0 400 230" role="img" aria-label="주문 선반에서 3번 택배까지 가져갔다고 팀 장부에 적혀 있어서, 새로 온 기사가 장부를 보고 4번부터 이어서 가져가는 그림">
<defs><marker id="a6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="small" x="200" y="14">주문 선반</text>
<rect class="box" x="20" y="32" width="50" height="40" rx="6"/><text x="45" y="52">1</text>
<rect class="box" x="80" y="32" width="50" height="40" rx="6"/><text x="105" y="52">2</text>
<rect class="box" x="140" y="32" width="50" height="40" rx="6"/><text x="165" y="52">3</text>
<rect class="kafka" x="200" y="32" width="50" height="40" rx="6"/><text x="225" y="52">4</text>
<rect class="kafka" x="260" y="32" width="50" height="40" rx="6"/><text x="285" y="52">5</text>
<rect class="kafka" x="320" y="32" width="50" height="40" rx="6"/><text x="345" y="52">6</text>
<polygon class="mark" points="165,80 157,92 173,92"/><text x="165" y="110">팀 장부</text><text class="small" x="165" y="132">3번까지 가져감</text>
<path class="line" d="M165,172 L165,146" marker-end="url(#a6)"/>
<rect class="new" x="105" y="172" width="120" height="40" rx="8"/><text x="165" y="192">새 기사</text>
<text class="small" x="300" y="192">4번부터 이어서</text>
</svg>
<p class="point">기사가 바뀌어도 장부를 보고 이어서 가져가요.</p>
<p class="explain">담당이 바뀌면 새 기사는 어디까지 가져갔는지 알 길이 없어요. 장부가 없으면 처음부터 다시 가져가서 이미 처리한 택배를 또 처리하거나, 아무 데서나 시작해서 놓치는 택배가 생겨요. 그래서 팀은 "3번까지 가져갔다"를 장부에 적어 두고, 새 기사는 그 장부를 보고 4번부터 이어가요.</p>
</section>

<section class="slide">
<h2>진짜 이름 붙이기</h2>
<table>
<thead><tr><th>물류센터 이야기</th><th>카프카 용어</th></tr></thead>
<tbody>
<tr><td>선반의 칸</td><td>파티션 (Partition)</td></tr>
<tr><td>가져가는 기사</td><td>컨슈머 (Consumer)</td></tr>
<tr><td>배송 팀</td><td>컨슈머 그룹 (Consumer Group)</td></tr>
<tr><td>팀 이름표</td><td><code>group.id</code></td></tr>
<tr><td>팀원이 바뀔 때 담당 다시 나누기</td><td>리밸런싱 (Rebalancing)</td></tr>
<tr><td>팀 장부 "어디까지 가져갔나"</td><td>오프셋 커밋 (Offset Commit)</td></tr>
</tbody>
</table>
</section>

<section class="slide">
<h2>주의할 점</h2>
<table>
<thead><tr><th>상황</th><th>어떻게 되나</th></tr></thead>
<tbody>
<tr><td>다른 서비스가 같은 팀 이름을 써요</td><td>택배를 나눠 가져서 서로 일부만 받아요</td></tr>
<tr><td>기사가 칸보다 많아요</td><td>남는 기사는 쉬어요. 빨라지려면 칸이 늘어야 해요</td></tr>
<tr><td>칸을 늘려요</td><td>팀이 담당을 다시 나눠요</td></tr>
<tr><td>장부에 적기 전에 기사가 쓰러져요</td><td>일부 택배를 한 번 더 받을 수 있어요 (7편에서 다뤄요)</td></tr>
</tbody>
</table>
</section>

<section class="slide end">
<h2>한 줄 정리</h2>
<p class="point">컨슈머 그룹은 배송 기사들이 칸을 나눠 맡는 팀이고,<br>팀 장부 덕분에 이어서 가져갈 수 있어요.</p>
</section>

<p class="next-tab"><a href="#dev">이해됐다면, 개발자용 심화 보기 →</a></p>
</div>

<div id="dev" class="panel">

<section class="slide">
<h2>전체 구조</h2>
<svg class="dg" viewBox="0 0 400 300" role="img" aria-label="토픽의 파티션 P0, P1, P2를 그룹 A의 컨슈머 C1이 P0과 P1을, C2가 P2를 읽고, 그룹 코디네이터 브로커가 오프셋 커밋을 내부 토픽 __consumer_offsets에 저장하는 그림">
<defs><marker id="d1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="box dash" x="10" y="20" width="90" height="190" rx="10"/><text class="small" x="55" y="36">토픽</text>
<rect class="kafka" x="25" y="50" width="60" height="36" rx="6"/><text class="chip" x="55" y="68">P0</text>
<rect class="kafka" x="25" y="100" width="60" height="36" rx="6"/><text class="chip" x="55" y="118">P1</text>
<rect class="kafka" x="25" y="150" width="60" height="36" rx="6"/><text class="chip" x="55" y="168">P2</text>
<path class="line" d="M85,68 L223,60" marker-end="url(#d1)"/>
<path class="line" d="M85,118 L223,74" marker-end="url(#d1)"/>
<path class="line" d="M85,168 L223,117" marker-end="url(#d1)"/>
<rect class="box dash" x="210" y="20" width="180" height="130" rx="10"/><text class="small" x="300" y="36">그룹 A</text>
<rect class="box" x="225" y="50" width="150" height="34" rx="6"/><text class="chip" x="300" y="67">C1 (P0, P1)</text>
<rect class="box" x="225" y="100" width="150" height="34" rx="6"/><text class="chip" x="300" y="117">C2 (P2)</text>
<path class="line dash" d="M330,150 L330,185" marker-end="url(#d1)"/><text class="small" x="278" y="168">오프셋 커밋</text>
<rect class="box" x="150" y="185" width="240" height="40" rx="6"/><text class="chip" x="270" y="205">그룹 코디네이터 (브로커)</text>
<path class="line" d="M270,225 L270,250" marker-end="url(#d1)"/>
<rect class="kafka" x="150" y="250" width="240" height="36" rx="6"/><text class="chip" x="270" y="268">__consumer_offsets</text>
</svg>
<p class="point">그룹 코디네이터가 오프셋 커밋을 내부 토픽 <code>__consumer_offsets</code>에 저장해요.</p>
</section>

<section class="slide">
<h2>컨슈머 수와 배정</h2>
<table>
<thead><tr><th>컨슈머 수 (파티션 3개)</th><th>컨슈머별 담당 파티션 수</th><th>결과</th></tr></thead>
<tbody>
<tr><td>1</td><td>3</td><td>혼자 전부 읽어요</td></tr>
<tr><td>2</td><td>2, 1</td><td>한 컨슈머가 파티션 여러 개를 받아요</td></tr>
<tr><td>3</td><td>1, 1, 1</td><td>병렬성이 가장 높아요</td></tr>
<tr><td>4</td><td>1, 1, 1, 0</td><td>한 컨슈머는 배정을 못 받아요</td></tr>
</tbody>
</table>
<p class="point">일반 컨슈머 그룹의 병렬성 상한은 파티션 수예요.</p>
</section>

<section class="slide">
<h2>리밸런싱은 언제 일어날까</h2>
<table>
<thead><tr><th>계기</th><th>예</th></tr></thead>
<tbody>
<tr><td>멤버 가입</td><td>컨슈머를 새로 띄움</td></tr>
<tr><td>멤버 이탈</td><td>컨슈머를 내리거나 연결이 끊김</td></tr>
<tr><td>멤버 실패</td><td>하트비트가 끊김, <code>poll()</code> 간격 초과 (아래 설정 표)</td></tr>
<tr><td>구독 토픽의 파티션 증가</td><td>새 파티션도 배정해야 함</td></tr>
</tbody>
</table>
<p class="point">리밸런싱은 파티션 배정을 다시 계산하는 일이에요.</p>
</section>

<section class="slide">
<h2>자동 커밋의 함정</h2>
<svg class="dg" viewBox="0 0 400 215" role="img" aria-label="처리를 끝내고 커밋 전에 죽으면 같은 메시지를 다시 받아 중복되고, 처리를 다른 스레드에 넘긴 채 커밋이 먼저 되고 죽으면 처리하지 못한 메시지가 유실되는 두 가지 경우">
<defs><marker id="d2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="label" x="10" y="14">① 처리한 뒤, 커밋 전에 죽으면</text>
<rect class="box" x="10" y="32" width="100" height="40" rx="8"/><text x="60" y="52">처리 완료</text>
<path class="line" d="M110,52 L148,52" marker-end="url(#d2)"/>
<rect class="bad" x="150" y="32" width="80" height="40" rx="8"/><text x="190" y="52">죽음</text><text class="alert" x="190" y="88">커밋 전</text>
<path class="line" d="M230,52 L268,52" marker-end="url(#d2)"/>
<rect class="bad" x="270" y="32" width="120" height="40" rx="8"/><text x="330" y="52">다시 받음</text><text class="alert" x="330" y="88">중복</text>
<text class="label" x="10" y="126">② 처리를 다른 스레드에 넘기고 커밋이 먼저 되면</text>
<rect class="box" x="10" y="144" width="100" height="40" rx="8"/><text x="60" y="164">커밋됨</text>
<path class="line" d="M110,164 L148,164" marker-end="url(#d2)"/>
<rect class="bad" x="150" y="144" width="80" height="40" rx="8"/><text x="190" y="164">죽음</text><text class="alert" x="190" y="200">처리 전</text>
<path class="line" d="M230,164 L268,164" marker-end="url(#d2)"/>
<rect class="bad" x="270" y="144" width="120" height="40" rx="8"/><text x="330" y="164">처리 못 함</text><text class="alert" x="330" y="200">유실</text>
</svg>
<p class="point">자동 커밋은 다음 <code>poll()</code> 때 커밋하므로 기본은 중복 쪽이고, 처리를 비동기로 넘기면 유실도 생겨요(7편).</p>
</section>

<section class="slide">
<h2>먼저 알아 둘 설정</h2>
<table>
<thead><tr><th>설정</th><th>기본값</th><th>의미</th></tr></thead>
<tbody>
<tr><td><code>auto.offset.reset</code></td><td><code>latest</code></td><td>유효한 커밋 오프셋이 없거나 범위를 벗어났을 때 어디서 시작할지</td></tr>
<tr><td><code>enable.auto.commit</code></td><td><code>true</code></td><td>오프셋을 자동으로 커밋할지</td></tr>
<tr><td><code>auto.commit.interval.ms</code></td><td>5000 (5초)</td><td>자동 커밋 주기</td></tr>
<tr><td><code>session.timeout.ms</code></td><td>45000 (45초)</td><td>classic 프로토콜의 클라이언트 설정</td></tr>
<tr><td><code>heartbeat.interval.ms</code></td><td>3000 (3초)</td><td>classic 프로토콜의 클라이언트 설정</td></tr>
<tr><td><code>max.poll.interval.ms</code></td><td>300000 (5분)</td><td>그룹 관리 시 <code>poll()</code> 호출 간격의 상한</td></tr>
<tr><td><code>group.protocol</code></td><td><code>classic</code></td><td>그룹 프로토콜 선택 (<code>classic</code> 또는 <code>consumer</code>)</td></tr>
</tbody>
</table>
<p class="point">처음 만든 그룹은 기본값 <code>latest</code> 때문에, 이미 쌓인 메시지를 건너뛰어요.</p>
</section>

<section class="slide">
<h2>classic과 새 consumer 프로토콜</h2>
<table>
<thead><tr><th></th><th>classic (기본)</th><th>consumer (KIP-848)</th></tr></thead>
<tbody>
<tr><td>선택</td><td><code>group.protocol=classic</code></td><td><code>group.protocol=consumer</code></td></tr>
<tr><td>리밸런싱</td><td>전역 동기화 장벽이 있음</td><td>서버 중심의 증분 리밸런싱, 전역 동기화 장벽 없음</td></tr>
<tr><td>세션·하트비트</td><td>클라이언트 설정: 45초, 3초</td><td>브로커 설정 <code>group.consumer.session.timeout.ms</code> 45초, <code>group.consumer.heartbeat.interval.ms</code> 5초</td></tr>
<tr><td>클라이언트의 <code>session.timeout.ms</code>, <code>heartbeat.interval.ms</code></td><td>적용됨</td><td>적용 안 됨</td></tr>
<tr><td>상태</td><td>기본값</td><td>4.0 GA, 서버는 기본 활성화, 클라이언트가 골라야 함</td></tr>
</tbody>
</table>
<p class="point">새 프로토콜은 4.0부터 쓸 수 있지만, 기본값은 아직 classic이에요 (4.4 기준).</p>
</section>

<section class="slide">
<h2>share group은 맛보기만</h2>
<table>
<thead><tr><th></th><th>컨슈머 그룹</th><th>share group (KIP-932)</th></tr></thead>
<tbody>
<tr><td>파티션 배정</td><td>한 컨슈머에 독점 배정</td><td>독점 배정 없이 레코드를 협력 소비</td></tr>
<tr><td>확인 단위</td><td>오프셋 커밋</td><td>레코드별 확인, 전달 시도 횟수 추적</td></tr>
<tr><td>컨슈머 수 상한</td><td>파티션 수</td><td>이 규칙을 그대로 적용하지 않음</td></tr>
<tr><td>상태</td><td>정식</td><td>4.0 Early Access (기본 비활성, 운영용 아님) → 4.1 Preview → 4.2 정식</td></tr>
</tbody>
</table>
<p class="point">레코드별 소비 모델은 따로 깊게 다룰 만큼 커서, 여기서는 개요만 봐요.</p>
</section>

<section class="slide">
<h2>예전 글이 틀린 지점</h2>
<table>
<thead><tr><th>예전 글의 설명</th><th>4.x 기준</th></tr></thead>
<tbody>
<tr><td>리밸런싱에는 항상 전역 동기화 장벽이 있다</td><td><code>consumer</code> 프로토콜(4.0 GA)은 장벽 없는 증분 방식. classic은 그대로</td></tr>
<tr><td>컨슈머 수의 상한은 파티션 수다</td><td>일반 컨슈머 그룹만 해당. share group(4.2 정식)은 그대로 적용 안 됨</td></tr>
<tr><td><code>session.timeout.ms</code>와 <code>heartbeat.interval.ms</code>로 장애 감지를 조절한다</td><td><code>consumer</code> 프로토콜에서는 적용 안 됨. 브로커 <code>group.consumer.*</code> 설정을 봄</td></tr>
<tr><td>새 프로토콜이 기본이다</td><td>4.0에서 GA가 됐지만 <code>group.protocol</code> 기본값은 <code>classic</code></td></tr>
</tbody>
</table>
<p class="point">설정 이름만 보고 따라 하지 말고, 쓰는 프로토콜부터 확인해요.</p>
</section>

<section class="slide end">
<h2>한 줄 정리</h2>
<p class="point">컨슈머 그룹은 파티션을 컨슈머에게 나눠 주고,<br>오프셋 커밋으로 이어 읽게 하는 장치예요.</p>
</section>

</div>
</div>
