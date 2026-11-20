---
layout: post
title: "컨슈머와 컨슈머 그룹은 왜 필요할까? 배송 팀으로 이해하는 Kafka 컨슈머"
description: "물류센터 담당 팀의 비유로 Kafka 컨슈머 그룹의 파티션 배정·리밸런싱·오프셋 커밋과 처리 시점의 주의점을 설명합니다."
date: 2026-11-15 14:00:00 +0900
series: kafka
episode: 4
summary: "같은 팀은 칸을 나눠 맡고 다른 팀은 따로 읽어요. 팀원이 바뀌면 담당을 다시 나누고 커밋한 위치에서 이어 가요."
---

<div class="lesson lesson-hierarchy">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: https://cdn.jsdelivr.net/npm/lucide-static@1.25.0/icons/ (ISC). 라이선스: assets/icons/LICENSE-lucide.txt. -->
<symbol id="i-warehouse" viewBox="0 0 24 24"><path d="M18 21V10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v11"/><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 1.132-1.803l7.95-3.974a2 2 0 0 1 1.837 0l7.948 3.974A2 2 0 0 1 22 8z"/><path d="M6 13h12"/><path d="M6 17h12"/></symbol>
<symbol id="i-user-round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></symbol>
<symbol id="i-shelving-unit" viewBox="0 0 24 24"><path d="M12 12V9a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/><path d="M16 20v-3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/><path d="M20 22V2"/><path d="M4 12h16"/><path d="M4 20h16"/><path d="M4 2v20"/><path d="M4 4h16"/></symbol>
<symbol id="i-server" viewBox="0 0 24 24"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/></symbol>
<symbol id="i-notebook-pen" viewBox="0 0 24 24"><path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/></symbol>
</defs>
</svg>

<div class="intro">
<p class="q">읽는 서비스를 늘리면 쌓인 주문을 더 빨리 처리할 수 있을까요?</p>
<p>3편에서는 주문 서비스가 소식을 안전하게 보내는 쪽을 봤어요. 이제 읽는 쪽의 차례예요. 1편에서 만난 재고 팀도 주문이 많아지면 담당자 한 명으로는 재고 처리 속도를 따라가기 어려워요.</p>
<p>나눌 파티션이 남아 있다면 컨슈머를 늘려 여러 주문을 더 빨리 처리할 수 있어요. 이번에는 이미 본 <b>컨슈머 그룹</b>이 파티션을 어떻게 나누는지 살펴봐요. 컨슈머를 늘려도 효과가 없는 경우와 담당 변경 때 이어 읽는 방법을 이해할 수 있어요.</p>
</div>

<div class="slide-group">
<h2 class="slide-group-title">일 나누기: 같은 업무를 맡은 서비스가 칸을 나눠 읽어요</h2>

<section class="slide">
<h3>한 사람이 여러 칸을 돌면 일이 밀려요</h3>
<svg class="dg" viewBox="0 0 400 325" role="img" aria-label="주문 선반의 세 칸을 재고 팀의 담당자 한 명이 모두 맡아 읽는 그림">
<rect class="line" x="245" y="5" width="148" height="303" rx="12"/>
<text class="label center" x="319" y="25">재고 팀</text>
<circle class="new" cx="57" cy="62" r="28"/><use class="ic" href="#i-shelving-unit" x="39" y="44" width="36" height="36"/>
<text class="chip" x="57" y="110">칸 0</text>
<path class="line" d="M87,62 L288,62"/>
<circle class="new" cx="57" cy="145" r="28"/><use class="ic" href="#i-shelving-unit" x="39" y="127" width="36" height="36"/>
<text class="chip" x="57" y="193">칸 1</text>
<path class="line" d="M87,145 L288,62"/>
<circle class="new" cx="57" cy="228" r="28"/><use class="ic" href="#i-shelving-unit" x="39" y="210" width="36" height="36"/>
<text class="chip" x="57" y="276">칸 2</text>
<path class="line" d="M87,228 L288,62"/>
<circle class="box" cx="322" cy="62" r="28"/><use class="ic" href="#i-user-round" x="304" y="44" width="36" height="36"/>
<text class="chip" x="322" y="110">담당 1</text>
</svg>
<p class="point">읽는 담당자가 처리할 수 있는 양보다 소식이 빨리 오면 대기 시간이 길어져요.</p>
<p class="explain">가게가 계속 주문 소식을 맡기는 동안 재고 담당은 읽은 주문의 재고를 반영해야 해요. 읽는 일만 빨라도 실제 업무가 느리면 다음 소식을 확인하는 시점이 늦어져요. 일을 나눌 사람이 필요해요.</p>
</section>

<section class="slide">
<h3>실제로는: 파티션을 나눠야 여러 컨슈머가 함께 읽어요</h3>
<svg class="dg" viewBox="0 0 400 325" role="img" aria-label="주문 토픽의 파티션 P0과 P1과 P2를 같은 재고 서비스 프로그램 세 개인 컨슈머 C1과 C2와 C3이 하나씩 읽는 그림">
<rect class="line" x="5" y="5" width="150" height="315" rx="12"/>
<text class="label center" x="80" y="25">주문 토픽</text>
<rect class="line" x="245" y="5" width="148" height="315" rx="12"/>
<text class="label center" x="319" y="25">재고 서비스</text>
<circle class="new" cx="80" cy="62" r="28"/><use class="ic" href="#i-shelving-unit" x="62" y="44" width="36" height="36"/>
<text class="chip" x="80" y="110">P0(칸 0)</text>
<path class="line" d="M112,62 L288,62"/>
<circle class="new" cx="80" cy="165" r="28"/><use class="ic" href="#i-shelving-unit" x="62" y="147" width="36" height="36"/>
<text class="chip" x="80" y="213">P1(칸 1)</text>
<path class="line" d="M112,165 L288,165"/>
<circle class="new" cx="80" cy="268" r="28"/><use class="ic" href="#i-shelving-unit" x="62" y="250" width="36" height="36"/>
<text class="chip" x="80" y="316">P2(칸 2)</text>
<path class="line" d="M112,268 L288,268"/>
<circle class="box" cx="322" cy="62" r="28"/><use class="ic" href="#i-server" x="304" y="44" width="36" height="36"/>
<text class="chip" x="322" y="110">컨슈머 C1</text>
<circle class="box" cx="322" cy="165" r="28"/><use class="ic" href="#i-server" x="304" y="147" width="36" height="36"/>
<text class="chip" x="322" y="213">컨슈머 C2</text>
<circle class="box" cx="322" cy="268" r="28"/><use class="ic" href="#i-server" x="304" y="250" width="36" height="36"/>
<text class="chip" x="322" y="316">컨슈머 C3</text>
</svg>
<p class="point">컨슈머를 늘려 파티션을 나누면 여러 주문을 동시에 처리할 수 있어요.</p>
<p class="explain">2편의 선반 칸인 <b>파티션</b>은 컨슈머에게 일을 나누는 단위이기도 해요. 같은 재고 서비스 프로그램을 한 컴퓨터에서든 여러 대에서든 여러 개 켜서 같은 그룹에 넣을 수 있어요. 각 컨슈머는 이 토픽을 읽겠다고 신청하는 <b>구독</b>을 하고 배정받은 파티션을 읽어요. 뒤에서는 일을 나누는 다른 방식도 짧게 살펴봐요.</p>
</section>

<section class="slide">
<h3>팀에서 칸마다 담당자를 정해요</h3>
<svg class="dg" viewBox="0 0 400 325" role="img" aria-label="재고 팀의 담당자 세 명이 주문 선반의 세 칸을 한 칸씩 나눠 맡는 그림">
<rect class="line" x="245" y="5" width="148" height="303" rx="12"/>
<text class="label center" x="319" y="25">재고 팀</text>
<circle class="new" cx="57" cy="62" r="28"/><use class="ic" href="#i-shelving-unit" x="39" y="44" width="36" height="36"/>
<text class="chip" x="57" y="110">칸 0</text>
<path class="line" d="M87,62 L288,62"/>
<circle class="new" cx="57" cy="145" r="28"/><use class="ic" href="#i-shelving-unit" x="39" y="127" width="36" height="36"/>
<text class="chip" x="57" y="193">칸 1</text>
<path class="line" d="M87,145 L288,163"/>
<circle class="new" cx="57" cy="228" r="28"/><use class="ic" href="#i-shelving-unit" x="39" y="210" width="36" height="36"/>
<text class="chip" x="57" y="276">칸 2</text>
<path class="line" d="M87,228 L288,264"/>
<circle class="box" cx="322" cy="62" r="28"/><use class="ic" href="#i-user-round" x="304" y="44" width="36" height="36"/>
<text class="chip" x="322" y="110">담당 1</text>
<circle class="box" cx="322" cy="163" r="28"/><use class="ic" href="#i-user-round" x="304" y="145" width="36" height="36"/>
<text class="chip" x="322" y="211">담당 2</text>
<circle class="box" cx="322" cy="264" r="28"/><use class="ic" href="#i-user-round" x="304" y="246" width="36" height="36"/>
<text class="chip" x="322" y="312">담당 3</text>
</svg>
<p class="point">같은 팀에서는 한 칸을 한 사람에게 맡겨 일을 나눠요.</p>
<p class="explain">팀원이 제각각 읽기 시작하면 같은 주문을 각자 처리할 수 있어요. 팀은 담당할 범위를 먼저 정해 읽는 일이 겹치지 않게 해요. 다만 담당이 바뀌는 일인 <b>교대</b> 중에 이미 처리한 주문을 다시 읽는 문제는 따로 대비해야 해요.</p>
</section>

<section class="slide">
<h3>실제로는: 같은 group.id로 파티션을 나눠 맡아요</h3>
<svg class="dg" viewBox="0 0 400 335" role="img" aria-label="컨슈머 C1과 C2와 C3이 각자 설정에 같은 group.id inventory를 적어 한 그룹이 되고 파티션 P0과 P1과 P2를 하나씩 맡는 그림">
<rect class="line" x="215" y="5" width="178" height="325" rx="12"/>
<text class="label center" x="304" y="25">같은 group.id = 한 그룹</text>
<circle class="new" cx="57" cy="60" r="28"/><use class="ic" href="#i-shelving-unit" x="39" y="42" width="36" height="36"/>
<text class="chip" x="57" y="108">P0</text>
<path class="line" d="M87,60 L272,60"/>
<circle class="new" cx="57" cy="156" r="28"/><use class="ic" href="#i-shelving-unit" x="39" y="138" width="36" height="36"/>
<text class="chip" x="57" y="204">P1</text>
<path class="line" d="M87,156 L272,156"/>
<circle class="new" cx="57" cy="252" r="28"/><use class="ic" href="#i-shelving-unit" x="39" y="234" width="36" height="36"/>
<text class="chip" x="57" y="300">P2</text>
<path class="line" d="M87,252 L272,252"/>
<circle class="box" cx="304" cy="60" r="28"/><use class="ic" href="#i-server" x="286" y="42" width="36" height="36"/>
<text class="chip" x="304" y="105">C1</text><text class="small mono" x="304" y="121">group.id=inventory</text>
<circle class="box" cx="304" cy="156" r="28"/><use class="ic" href="#i-server" x="286" y="138" width="36" height="36"/>
<text class="chip" x="304" y="201">C2</text><text class="small mono" x="304" y="217">group.id=inventory</text>
<circle class="box" cx="304" cy="252" r="28"/><use class="ic" href="#i-server" x="286" y="234" width="36" height="36"/>
<text class="chip" x="304" y="297">C3</text><text class="small mono" x="304" y="313">group.id=inventory</text>
</svg>
<p class="point">같은 그룹 안에서 파티션 하나는 한 컨슈머에게만 배정돼요.</p>
<p class="explain"><code>group.id</code>는 컨슈머 프로그램 설정에 적는 그룹 이름으로 팀 이름표에 해당해요. 여러 컨슈머가 동시에 일하는 정도를 <b>병렬성</b>이라고 해요. 인원을 늘리면 여러 주문을 나눠 처리할 수 있지만 주문 한 건의 재고 반영 자체가 느린 문제까지 빨라지는 것은 아니에요.</p>
</section>

<section class="slide">
<h3>이럴 땐 조심해요: 서로 다른 업무를 한 팀으로 묶지 않아요</h3>
<table>
<thead><tr><th>실수한 상황</th><th>빠질 수 있는 업무</th></tr></thead>
<tbody>
<tr><td>같은 group.id로 묶여 칸 0은 재고 서비스가 맡고 칸 1은 알림 서비스가 맡음</td><td>칸 0의 주문 A는 재고 서비스만 읽으므로 알림 처리가 빠질 수 있어요</td></tr>
</tbody>
</table>
<p class="point">모든 주문이 필요한 두 업무에 같은 group.id를 쓰면 주문을 나눠 받게 돼요.</p>
<p class="explain">모든 주문에 재고 반영과 알림 발송이 필요하다면 업무마다 다른 <code>group.id</code>를 써서 각각 전부 읽게 해요. 메시지를 두 벌 만드는 것이 아니라 같은 메시지를 각 그룹이 따로 읽는 거예요.</p>
</section>

<p>참고: <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html">Apache Kafka 4.1 KafkaConsumer: 그룹과 파티션 배정</a></p>
</div>

<div class="slide-group">
<h2 class="slide-group-title">담당 변경: 인원이 달라지면 배정을 조정해요</h2>

<section class="slide">
<h3>사람이 드나들면 센터 사무실이 맡을 칸을 다시 정해요</h3>
<svg class="dg" viewBox="0 0 400 325" role="img" aria-label="재고 팀의 담당 1이 칸 0과 칸 1을 맡고 담당 2가 칸 2를 맡는 그림">
<rect class="line" x="245" y="5" width="148" height="303" rx="12"/>
<text class="label center" x="319" y="25">재고 팀</text>
<circle class="new" cx="57" cy="62" r="28"/><use class="ic" href="#i-shelving-unit" x="39" y="44" width="36" height="36"/>
<text class="chip" x="57" y="110">칸 0</text>
<path class="line" d="M87,62 L288,62"/>
<circle class="new" cx="57" cy="145" r="28"/><use class="ic" href="#i-shelving-unit" x="39" y="127" width="36" height="36"/>
<text class="chip" x="57" y="193">칸 1</text>
<path class="line" d="M87,145 L288,62"/>
<circle class="new" cx="57" cy="228" r="28"/><use class="ic" href="#i-shelving-unit" x="39" y="210" width="36" height="36"/>
<text class="chip" x="57" y="276">칸 2</text>
<path class="line" d="M87,228 L288,264"/>
<circle class="box" cx="322" cy="62" r="28"/><use class="ic" href="#i-user-round" x="304" y="44" width="36" height="36"/>
<text class="chip" x="322" y="110">담당 1</text>
<circle class="box" cx="322" cy="264" r="28"/><use class="ic" href="#i-user-round" x="304" y="246" width="36" height="36"/>
<text class="chip" x="322" y="312">담당 2</text>
</svg>
<p class="point">팀원이 바뀌면 남은 사람과 새 사람이 칸을 나눠 맡아요.</p>
<p class="explain">담당자가 사무실에 주기적으로 일하는 중이라고 알리다가 오래 응답하지 않으면 사무실은 그만둔 것으로 보고 칸을 다른 담당에게 넘길 수 있어요. 팀원이 들어오거나 나갈 때도 센터 사무실이 맡을 칸을 다시 정해요. 칸 수보다 사람이 많아지면 맡을 칸이 없어 쉬는 사람이 생기므로 더 늘려도 함께 처리할 양은 늘지 않아요.</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>실제로는: 리밸런싱으로 파티션 배정을 바꿔요</h3>
<svg class="dg" viewBox="0 0 400 205" role="img" aria-label="컨슈머가 브로커 중 하나인 코디네이터에게 생존 신호를 보내고 코디네이터가 담당 파티션을 안내하는 그림">
<defs><marker id="cg-rebalance" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs><circle class="box" cx="65" cy="95" r="28"/><use class="ic" href="#i-user-round" x="47" y="77" width="36" height="36"/>
<text class="chip" x="65" y="141">컨슈머</text><circle class="kafka" cx="300" cy="95" r="28"/><use class="ic" href="#i-warehouse" x="282" y="77" width="36" height="36"/>
<text class="chip" x="300" y="141">코디네이터</text><path class="line" d="M96,76 L267,76" marker-end="url(#cg-rebalance)"/><path class="line" d="M267,112 L96,112" marker-end="url(#cg-rebalance)"/>
<text class="chip" x="181" y="51">살아 있다는 신호</text>
<text class="chip" x="181" y="138">담당 파티션 안내</text>
<text class="small" x="300" y="161">브로커 중 하나의 역할</text>
</svg>
<p class="point">리밸런싱은 그룹의 파티션 담당을 다시 조정하는 일이에요.</p>
<p class="explain">비유의 센터 사무실에 해당하는 <b>그룹 코디네이터</b>는 브로커 중 하나가 맡는 그룹 관리 역할이에요. 컨슈머가 바뀌거나 구독 토픽의 칸이 늘면 맡은 사람이 없는 칸이 생기지 않도록 조정해요. <b>하트비트</b>는 컨슈머가 코디네이터에 주기적으로 보내는 살아 있다는 신호이며 오래 끊기면 담당을 넘길 수 있어요. <code>poll()</code>은 다음 메시지를 받고 아직 일하고 있음을 확인하게 하는 요청 함수로 너무 오래 호출하지 않으면 담당을 넘길 수 있어요.</p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 리밸런싱 중에는 읽기가 멈추나요?</summary>
<p>A. 방식에 따라 달라요. 담당을 모두 반납하고 다시 나누는 방식은 그룹 전체의 읽기가 잠깐 멈출 수 있어요. 필요한 담당만 넘기는 방식은 영향을 받는 파티션의 읽기를 멈추고 다른 파티션은 계속 읽을 수 있어요.</p>
<p>참고: <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/consumer/ConsumerPartitionAssignor.RebalanceProtocol.html">Apache Kafka 4.1: 전체 반납과 부분 반납의 차이</a></p>
</details>
</aside>
</div>

<section class="slide" id="consumer-group-playground" hidden>
<h3>직접 해 보기: 컨슈머 수만 바꿔 보세요</h3>
<div class="pp-body">
<label for="cg-count">재고 그룹의 컨슈머 수</label>
<select id="cg-count"><option value="1">1명</option><option value="2" selected>2명</option><option value="3">3명</option><option value="4">4명</option></select>
<svg class="dg cg-stage" viewBox="0 0 400 350" role="img" aria-label="파티션 세 개와 컨슈머 사이에서 메시지를 계속 읽는 모습"></svg>
<p class="pp-sum cg-summary" aria-live="polite"></p>
<p class="cg-step"></p>
</div>
<p class="point">앞 칸부터 컨슈머에게 고르게 나누는 설명용 예시라 두 명일 때는 2개와 1개를 맡으며 실제 배정은 구독과 배정 방식에 따라 달라요.</p>
<p class="explain">1편에서 본 것처럼 읽어도 메시지는 파티션에서 지워지지 않으며 흐르는 점은 내용을 읽는 모습이에요. 점은 각 칸의 담당자에게만 가고 인원을 바꾸면 그 연결도 바뀌어요. 네 명이면 한 명은 맡을 칸이 없어 쉬지만 누군가 나가면 이어받을 수 있어요.</p>
</section>

<section class="slide">
<h3>이럴 땐 조심해요: 메시지별로 나누는 share group도 있어요</h3>
<table>
<thead><tr><th>일을 나누는 방식</th><th>같은 파티션을 여러 명이 읽나요?</th></tr></thead>
<tbody>
<tr><td>이 글의 일반 컨슈머 그룹</td><td>한 컨슈머에게 배정해요</td></tr>
<tr><td>별도 방식인 share group</td><td>메시지 단위로 나눠 처리할 수 있어요</td></tr>
</tbody>
</table>
<p class="point">파티션 수만큼만 함께 읽는다는 한계는 이 글의 일반 컨슈머 그룹에 해당해요.</p>
<p class="explain">Share group은 칸 전체를 독점하는 대신 메시지별로 작업을 나누고 메시지마다 처리했다고 알리는 방식이에요. 칸 수보다 많은 컨슈머가 메시지를 나눠 처리할 수 있으므로 일반 그룹의 인원 한계를 그대로 적용하지 않아요.</p>
</section>

<p>참고: <a href="https://kafka.apache.org/41/design/design/#the-consumer">Apache Kafka 4.1 설계: 컨슈머와 그룹 관리</a> · <a href="https://kafka.apache.org/41/design/design/#share-groups">Apache Kafka 4.1: share group과 일반 그룹의 차이(4.1에서는 미리 보기 기능)</a></p>
</div>

<div class="slide-group">
<h2 class="slide-group-title">교대의 기준: 커밋한 위치에서 이어 읽어요</h2>

<section class="slide">
<h3>커밋한 위치는 보통 일을 끝낸 뒤 고쳐요</h3>
<svg class="dg" viewBox="0 0 400 335" role="img" aria-label="담당자가 주문을 읽고 재고를 줄인 뒤 사무실에 알리며 읽은 위치는 6이고 사무실 장부에 적은 커밋한 위치는 4인 그림">
<defs><marker id="cg-notes" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs><circle class="box" cx="55" cy="55" r="28"/><use class="ic" href="#i-user-round" x="37" y="37" width="36" height="36"/>
<text class="chip" x="55" y="101">주문 읽기</text><circle class="box" cx="200" cy="55" r="28"/><use class="ic" href="#i-user-round" x="182" y="37" width="36" height="36"/>
<text class="chip" x="200" y="101">재고 수 줄이기</text><circle class="kafka" cx="345" cy="55" r="28"/><use class="ic" href="#i-warehouse" x="327" y="37" width="36" height="36"/>
<text class="chip" x="345" y="101">사무실에 알림</text><path class="line" d="M85,55 L167,55" marker-end="url(#cg-notes)"/><path class="line" d="M230,55 L312,55" marker-end="url(#cg-notes)"/>
<rect class="line" x="10" y="135" width="380" height="185" rx="12"/>
<text class="label center" x="200" y="156">같은 시점의 두 메모</text>
<circle class="box" cx="100" cy="203" r="28"/><use class="ic" href="#i-notebook-pen" x="82" y="185" width="36" height="36"/>
<text class="chip" x="100" y="249">읽은 위치 6</text>
<text class="small" x="100" y="268">5번까지 읽음</text><circle class="new" cx="300" cy="203" r="28"/><use class="ic" href="#i-notebook-pen" x="282" y="185" width="36" height="36"/>
<text class="chip" x="300" y="249">커밋한 위치 4</text>
<text class="small" x="300" y="268">3번까지 끝내고 적음</text>
<text class="small" x="200" y="294">3번까지 끝냄 · 4~5번은 읽기만 함</text>
</svg>
<p class="point">커밋은 장부에 다음 번호를 확정해 적는 일이며 보통 일을 끝낸 뒤 적어야 해요.</p>
<p class="explain">읽은 위치는 담당자가 손에 든 다음 번호이고 커밋한 위치는 사무실 장부에 적은 다음 번호예요. 담당자는 주문을 한 번에 여러 개 받아 차례로 처리하므로 그림의 4~5번은 읽었어도 아직 처리 중이에요. 커밋한 위치가 업무 완료를 뜻하는 것은 아니어서 담당자가 재고 반영을 끝낸 뒤 사무실에 알려 장부를 고쳐야 해요.</p>
</section>

<section class="slide">
<h3>실제로는: 커밋한 위치를 브로커에 저장해요</h3>
<svg class="dg" viewBox="0 0 400 285" role="img" aria-label="컨슈머의 읽은 위치는 다음 6이지만 3번까지 재고 반영한 뒤 다음 4를 코디네이터에 커밋해 내부 토픽에 저장하는 그림">
<defs><marker id="cg-commit" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs><circle class="box" cx="75" cy="75" r="28"/><use class="ic" href="#i-user-round" x="57" y="57" width="36" height="36"/>
<text class="chip" x="75" y="121">컨슈머</text><circle class="kafka" cx="305" cy="75" r="28"/><use class="ic" href="#i-warehouse" x="287" y="57" width="36" height="36"/>
<text class="chip" x="305" y="121">코디네이터</text><path class="line" d="M107,75 L272,75" marker-end="url(#cg-commit)"/>
<text class="chip" x="190" y="52">다음 번호 4 커밋</text>
<text class="small" x="75" y="145">읽은 위치: 다음 6</text>
<text class="small" x="305" y="145">커밋한 위치: 다음 4</text>
<circle class="new" cx="305" cy="213" r="28"/><use class="ic" href="#i-notebook-pen" x="287" y="195" width="36" height="36"/>
<text class="chip" x="305" y="259">__consumer_offsets</text><path class="line" d="M305,165 L305,180" marker-end="url(#cg-commit)"/>
<text class="small" x="109" y="229">재고 반영: 3번까지</text>
</svg>
<p class="point">컨슈머가 커밋을 보내면 코디네이터가 커밋한 위치를 보관해요.</p>
<p class="explain"><b>내부 토픽</b>은 Kafka가 스스로 쓰는 선반이에요. 읽은 위치는 새 메시지를 받으면 앞서가지만 커밋한 위치는 장부에 적을 때 바뀌므로 둘이 다를 수 있어요. 업무를 끝냈어도 커밋 전에 멈추면 새 담당은 그 완료 사실을 알 수 없어요. Kafka 4.1 공식 컨슈머(Java)는 기본으로 자동 커밋이 켜져 있고(<code>enable.auto.commit=true</code>) 기본 주기는 5초예요.</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>이럴 땐 조심해요: 자동 커밋은 업무 완료를 확인하지 않아요</h3>
<table>
<caption>담당자가 일을 조수에게 넘기고 바로 다음 주문을 읽는 장면을 떠올려 보세요.</caption>
<thead><tr><th>멈추기 전 상황</th><th>이어 읽을 때 생길 수 있는 일</th></tr></thead>
<tbody>
<tr><td>업무 완료 후 아직 커밋하지 못함</td><td>같은 주문을 다시 처리해 재고가 두 번 줄 수 있어요</td></tr>
<tr><td>같은 프로그램 안에서 처리를 따로 맡긴 작업이 끝나기 전에 다음 것을 읽고 커밋함</td><td>끝내지 못한 주문을 건너뛰어 재고가 줄지 않을 수 있어요</td></tr>
</tbody>
</table>
<p class="point">커밋한 위치가 실제 업무 진행과 어긋나면 중복이나 누락이 생길 수 있어요.</p>
<p class="explain">자동 커밋은 컨슈머 프로그램에 들어간 Kafka 기본 코드가 업무 완료와 상관없이 그때의 읽은 위치를 장부에 적는 동작이에요. Kafka 4.1 공식 컨슈머(Java)의 기본 동작에서는 <code>poll()</code>을 부를 때 커밋 주기가 지났으면 자동 커밋을 요청해요. 같은 프로그램 안에서 처리를 따로 맡긴 작업이 아직 끝나지 않아도 커밋한 위치가 앞서갈 수 있으므로 커밋 시점을 관리해야 해요.</p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 자동 커밋이 기본이면 끄고 직접 커밋해야 하나요?</summary>
<p>A. 항상 꺼야 하는 것은 아니에요. 다음 읽기 요청 전에 받은 주문을 모두 처리하는 흐름이라면 자동 커밋을 쓸 수 있어요. 같은 프로그램 안에서 처리를 따로 맡긴다면 자동 커밋을 끄고 업무 완료 뒤 직접 커밋하는 방법이 있으며 전달 보장 편에서 이어 봐요.</p>
<p>참고: <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html">Apache Kafka 4.1: 자동 커밋과 직접 커밋의 처리 조건</a></p>
</details>
</aside>
</div>

<section class="slide">
<h3>이럴 땐 조심해요: 교대했는데 커밋한 위치를 쓸 수 없어요</h3>
<table>
<thead><tr><th>담당을 이어받는 상황</th><th>놓치기 쉬운 점</th></tr></thead>
<tbody>
<tr><td>새 그룹이라 커밋한 위치가 없음</td><td>남아 있는 옛 주문부터 읽는다고 보장되지 않아요</td></tr>
<tr><td>장부의 번호가 가리키던 주문이 보관 기간이 지나 선반에서 지워짐</td><td>커밋한 위치에서 그대로 이어 갈 수 없어요</td></tr>
</tbody>
</table>
<p class="point">교대할 때 쓸 수 있는 커밋한 위치가 없다면 남아 있는 옛 주문을 건너뛸 수 있어요.</p>
<p class="explain">Kafka 4.1 공식 컨슈머(Java)는 커밋한 위치가 없거나 그 번호가 가리키던 주문이 보관 기간이 지나 지워졌다면 <code>auto.offset.reset</code>을 적용해요. 이렇게 장부의 번호로 더는 주문을 읽을 수 없는 것을 범위를 벗어났다고 해요. 기본값 <code>latest</code>는 이미 쌓인 것을 건너뛰고 앞으로 올 것부터 읽으며 <code>earliest</code>는 남아 있는 가장 오래된 것부터 읽어요.</p>
</section>

<section class="slide">
<h3>한눈에 다시 보기</h3>
<svg class="dg" viewBox="0 0 400 240" role="img" aria-label="컨슈머 그룹, 병렬성의 한계, 리밸런싱, 오프셋 커밋을 네 줄로 다시 보는 그림">
<circle class="box" cx="30" cy="28" r="18"/><use class="ic" href="#i-user-round" x="17" y="15" width="26" height="26"/>
<text class="label" x="62" y="19">컨슈머 그룹</text><text class="small" x="62" y="38" style="text-anchor:start">같은 업무를 맡은 서비스들이 파티션을 나눠요.</text>
<circle class="new" cx="30" cy="84" r="18"/><use class="ic" href="#i-shelving-unit" x="17" y="71" width="26" height="26"/>
<text class="label" x="62" y="75">병렬성의 한계</text><text class="small" x="62" y="94" style="text-anchor:start">일반 그룹은 파티션 수보다 더 나눌 수 없어요.</text>
<circle class="kafka" cx="30" cy="140" r="18"/><use class="ic" href="#i-warehouse" x="17" y="127" width="26" height="26"/>
<text class="label" x="62" y="131">리밸런싱</text><text class="small" x="62" y="150" style="text-anchor:start">컨슈머나 파티션이 달라지면 담당을 조정해요.</text>
<circle class="new" cx="30" cy="196" r="18"/><use class="ic" href="#i-notebook-pen" x="17" y="183" width="26" height="26"/>
<text class="label" x="62" y="187">오프셋 커밋</text><text class="small" x="62" y="206" style="text-anchor:start">커밋한 위치를 저장하며 업무 완료와 구별해요.</text>
</svg>
<p class="point">컨슈머 그룹은 칸을 나눠 읽고 담당이 바뀌면 커밋한 위치를 기준으로 이어 가요.</p>
</section>

<p>참고: <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html">Apache Kafka 4.1 KafkaConsumer: 위치와 커밋, 자동 커밋의 조건</a> · <a href="https://kafka.apache.org/41/configuration/consumer-configs/">Java 컨슈머 설정: 자동 커밋과 시작 위치</a> · <a href="https://github.com/apache/kafka/blob/4.1/clients/src/main/java/org/apache/kafka/clients/consumer/internals/ConsumerCoordinator.java">Kafka 4.1 기본 방식: poll과 자동 커밋 주기 확인</a> · <a href="https://kafka.apache.org/41/implementation/distribution/">코디네이터와 오프셋 저장</a></p>
</div>

</div>
<link rel="stylesheet" href="{{ "/assets/css/consumer-group-playground.css" | relative_url }}">
<script defer src="{{ "/assets/js/consumer-group-playground.js" | relative_url }}"></script>
