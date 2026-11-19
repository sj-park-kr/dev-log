---
layout: post
title: "택배가 두 번 오거나 사라지면? 물류센터로 이해하는 카프카 전달 보장"
description: "Kafka의 세 가지 전달 보장을 물류센터 비유로 비교하고 처리 결과와 오프셋을 함께 확정하는 트랜잭션과 read_committed의 범위를 설명합니다."
date: 2026-11-15 15:30:00 +0900
series: kafka
episode: 7
summary: "소식이 남아 있어도 처리는 누락되거나 겹칠 수 있어요. 세 가지 약속을 비교하고 결과와 읽은 위치를 함께 확정하는 이유를 알아봐요."
---

<div class="lesson lesson-hierarchy">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<symbol id="i-store" viewBox="0 0 24 24"><path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"/><path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244"/><path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"/></symbol>
<!-- 원본: Lucide lucide-static@1.25.0 (ISC). 라이선스: assets/icons/LICENSE-lucide.txt. Kafka 1편과 같은 아이콘을 써요. -->
<symbol id="i-package" viewBox="0 0 24 24"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/></symbol>
<symbol id="i-user-round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></symbol>
<symbol id="i-shelving-unit" viewBox="0 0 24 24"><path d="M12 12V9a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/><path d="M16 20v-3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/><path d="M20 22V2"/><path d="M4 12h16"/><path d="M4 20h16"/><path d="M4 2v20"/><path d="M4 4h16"/></symbol>
<symbol id="i-notebook-pen" viewBox="0 0 24 24"><path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/></symbol>
<symbol id="i-database" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></symbol>
</defs>
</svg>

<div class="intro">
<p class="q">소식은 선반에 남아 있는데 왜 일을 누락하거나 두 번 할까요?</p>
<p>6편에서는 소식을 언제까지 보관하고 어떻게 정리하는지 봤어요. 하지만 소식이 남아 있어도 읽는 서비스가 일하다 멈추면 아직 안 한 일을 건너뛰거나 이미 한 일을 다시 할 수 있어요.</p>
<p>4편의 커밋한 위치를 이어 받아 <b>최대 한 번·최소 한 번·정확히 한 번</b>의 차이를 알아봐요. 이어서 Kafka 안의 처리 결과와 읽은 위치를 <b>트랜잭션</b>으로 함께 확정하는 이유와 그 보장이 닿는 범위를 살펴봐요.</p>
</div>

<div class="slide-group">
<h2 class="slide-group-title">처리의 빈틈: 소식 보관과 업무 완료는 달라요</h2>

<section class="slide">
<h3>담당자가 일을 마쳤는지는 선반만 봐서는 몰라요</h3>
<svg class="dg" viewBox="0 0 400 300" role="img" aria-label="주문 선반의 4번을 읽어 바깥 DB의 재고는 줄었지만 팀 장부는 아직 다음 4여서 두 기록이 어긋나요">
<defs><marker id="delivery-flow-1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<circle class="new" cx="65" cy="60" r="28"/><use class="ic" href="#i-shelving-unit" x="43" y="38" width="44" height="44"/>
<text class="chip" x="65" y="110">주문 선반</text>
<circle class="box" cx="200" cy="60" r="28"/><use class="ic" href="#i-user-round" x="178" y="38" width="44" height="44"/>
<text class="chip" x="200" y="110">재고 담당</text>
<path class="line" d="M98,60 L168,60" marker-end="url(#delivery-flow-1)"/>
<text class="small" x="130" y="35">4번 읽기</text>
<path class="line" d="M180,88 L115,170" marker-end="url(#delivery-flow-1)"/>
<path class="line dash" d="M220,88 L285,170" marker-end="url(#delivery-flow-1)"/>
<circle class="box" cx="100" cy="200" r="28"/><use class="ic" href="#i-database" x="78" y="178" width="44" height="44"/>
<text class="chip" x="100" y="250">바깥 DB · 재고</text>
<text class="small" x="100" y="277">4번 처리로 10 → 9개</text>
<circle class="bad" cx="300" cy="200" r="28"/><use class="ic" href="#i-notebook-pen" x="278" y="178" width="44" height="44"/>
<text class="chip" x="300" y="250">팀 장부 · 읽을 자리</text>
<text class="alert" x="300" y="277">고치기 전 꺼짐 · 다음 4</text>
</svg>
<p class="point">소식을 보관했다고 그 소식에 따른 일까지 끝난 것은 아니에요.</p>
<p class="explain">여기서 장부는 4편의 <b>팀 장부(커밋한 위치)</b>이며 재고 수량을 적는 장부가 아니에요. 담당자가 Kafka 밖의 DB(데이터 저장소)에서 재고를 줄이거나 알림 담당이 문자를 보내는 일과 팀 장부를 고치는 일은 따로 끝나요. 그 틈에 담당자가 자리를 비우면 다음 담당자는 앞사람이 일을 마쳤는지 확신하기 어려워요.</p>
</section>

<section class="slide">
<h3>실제로는: 장애 뒤에는 커밋한 위치부터 이어 읽어요</h3>
<svg class="dg" viewBox="0 0 400 425" role="img" aria-label="최대 한 번은 4번 읽음 뒤 장부를 적고 장애가 나 누락되며 최소 한 번은 읽고 처리한 뒤 장애가 나 옛 장부로 재처리해요">
<defs><marker id="delivery-flow-2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="label" x="12" y="27">최대 한 번 · 처리 전 커밋</text>
<circle class="new" cx="45" cy="70" r="24"/><use class="ic" href="#i-package" x="28" y="53" width="34" height="34"/>
<text class="chip" x="45" y="115">4번 읽음</text>
<path class="line" d="M72,70 L119,70" marker-end="url(#delivery-flow-2)"/>
<circle class="new" cx="148" cy="70" r="24"/><use class="ic" href="#i-notebook-pen" x="131" y="53" width="34" height="34"/>
<text class="chip" x="148" y="115">장부: 다음 5</text>
<path class="line" d="M175,70 L222,70" marker-end="url(#delivery-flow-2)"/>
<circle class="bad" cx="251" cy="70" r="24"/><use class="ic" href="#i-user-round" x="234" y="53" width="34" height="34"/>
<text class="chip" x="251" y="115">장애</text>
<path class="line" d="M278,70 L325,70" marker-end="url(#delivery-flow-2)"/>
<circle class="bad" cx="354" cy="70" r="24"/><use class="ic" href="#i-package" x="337" y="53" width="34" height="34"/>
<text class="chip" x="354" y="115">4번 누락</text>
<text class="small" x="200" y="144">장부는 5부터 · 4번을 처리하지 못해요</text>
<text class="label" x="12" y="182">최소 한 번 · 처리 후 커밋</text>
<circle class="new" cx="45" cy="225" r="24"/><use class="ic" href="#i-package" x="28" y="208" width="34" height="34"/>
<text class="chip" x="45" y="270">4번 읽음</text>
<path class="line" d="M72,225 L119,225" marker-end="url(#delivery-flow-2)"/>
<circle class="box" cx="148" cy="225" r="24"/><use class="ic" href="#i-user-round" x="131" y="208" width="34" height="34"/>
<text class="chip" x="148" y="270">재고 처리</text>
<path class="line" d="M175,225 L222,225" marker-end="url(#delivery-flow-2)"/>
<circle class="bad" cx="251" cy="225" r="24"/><use class="ic" href="#i-user-round" x="234" y="208" width="34" height="34"/>
<text class="chip" x="251" y="270">장애</text>
<path class="line" d="M278,225 L325,225" marker-end="url(#delivery-flow-2)"/>
<circle class="new" cx="354" cy="225" r="24"/><use class="ic" href="#i-notebook-pen" x="337" y="208" width="34" height="34"/>
<text class="chip" x="354" y="270">장부: 다음 4</text>
<text class="small" x="200" y="299">처리는 했지만 장부를 아직 못 고쳐 옛 값이 남음</text>
<path class="line" d="M354,282 L354,315 L185,315 L185,342" marker-end="url(#delivery-flow-2)"/>
<circle class="box" cx="185" cy="365" r="20"/><use class="ic" href="#i-user-round" x="171" y="351" width="28" height="28"/>
<text class="small" x="85" y="358">다시 켠 뒤</text>
<text class="small" x="85" y="380">4번 다시 읽기</text>
<path class="line" d="M209,365 L274,365" marker-end="url(#delivery-flow-2)"/>
<circle class="bad" cx="300" cy="365" r="20"/><use class="ic" href="#i-database" x="286" y="351" width="28" height="28"/>
<text class="chip" x="300" y="407">한 번 더 처리 · 중복</text>
</svg>
<p class="point">커밋한 위치 저장과 업무 완료 사이에 장애가 나면 누락이나 중복이 생길 수 있어요.</p>
<p class="explain"><b>오프셋</b>은 칸 안의 위치 번호이며 그림의 “장부: 다음 5”는 4번까지 읽어 다음에 읽을 위치가 5라는 뜻이에요. 비유에서 자리를 비우는 <b>장애</b>는 여기서는 컨슈머 프로그램이 갑자기 꺼지는 상황이에요. 메시지가 보관돼 있다면 다시 켜진 컨슈머는 커밋한 위치부터 이어 읽으므로 위쪽은 4번을 결과적으로 건너뛰게 되고 아래쪽은 이미 한 일을 다시 해요.</p>
</section>

<section class="slide" id="delivery-playground" hidden>
<h3>직접 해 보기: 장부를 적는 시점만 바꿔요</h3>
<div class="pp-body">
<label for="delivery-timing">오프셋 커밋 시점</label>
<select id="delivery-timing"><option value="before">처리 전</option><option value="after">처리 후</option></select>
</div>
<p class="point">소식을 3번 꺼내 읽을 때마다 처리와 커밋 사이에 장애를 내는 설명용 흐름이며 실제 결과는 커밋과 처리의 순서에 따라 달라져요.</p>
<p class="explain">소식은 자동으로 도착하고 컨슈머는 장애 뒤 커밋한 위치부터 다시 꺼내 읽어요. 조건을 바꾸면 새 비교를 시작하며 최근 소식 6건의 처리 횟수와 읽은 위치·커밋한 위치를 보여 줘요. 실제 장애는 정해진 간격으로 나지 않지만 처리 누락과 재처리가 생기는 이유는 같아요.</p>
</section>

</div>

<div class="slide-group">
<h2 class="slide-group-title">세 가지 약속: 누락과 겹침을 어디까지 막을까요</h2>

<section class="slide">
<h3>재고를 줄일 때 누락과 중복 중 무엇을 막을까요</h3>
<svg class="dg" viewBox="0 0 400 260" role="img" aria-label="최대 한 번은 빠진 상자, 최소 한 번은 겹친 상자, 정확히 한 번은 주문별 하나의 상자로 처리 결과를 비교해요">
<text class="label" x="12" y="45">최대 한 번</text>
<circle class="box" cx="170" cy="40" r="18"/><use class="ic" href="#i-package" x="157" y="27" width="26" height="26"/>
<circle class="bad" cx="230" cy="40" r="18"/><use class="ic" href="#i-package" x="217" y="27" width="26" height="26"/>
<path class="line" d="M217,27 L243,53 M243,27 L217,53"/>
<text class="chip" x="170" y="69">주문 A</text><text class="chip" x="230" y="69">주문 B</text>
<text class="small" x="200" y="89">재고 반영 결과 · B 누락 가능</text>
<text class="label" x="12" y="125">최소 한 번</text>
<circle class="box" cx="170" cy="120" r="18"/><use class="ic" href="#i-package" x="157" y="107" width="26" height="26"/>
<circle class="box" cx="230" cy="120" r="18"/><use class="ic" href="#i-package" x="217" y="107" width="26" height="26"/>
<circle class="box" cx="290" cy="120" r="18"/><use class="ic" href="#i-package" x="277" y="107" width="26" height="26"/>
<text class="chip" x="170" y="149">주문 A</text><text class="chip" x="230" y="149">주문 B</text><text class="chip" x="290" y="149">주문 B</text>
<text class="small" x="200" y="169">재고 반영 결과 · B 중복 처리</text>
<text class="label" x="12" y="205">정확히 한 번</text>
<circle class="box" cx="170" cy="200" r="18"/><use class="ic" href="#i-package" x="157" y="187" width="26" height="26"/>
<circle class="box" cx="230" cy="200" r="18"/><use class="ic" href="#i-package" x="217" y="187" width="26" height="26"/>
<text class="chip" x="170" y="229">주문 A</text><text class="chip" x="230" y="229">주문 B</text>
<text class="small" x="200" y="249">재고 반영 결과 · 주문마다 한 번</text>
</svg>
<p class="point">세 가지 약속은 한 주문의 결과가 누락되거나 겹쳐도 되는지에 관한 약속이에요.</p>
<p class="explain">재고를 줄이는 서비스는 처리한 주문 번호와 재고 변경을 DB에 함께 적어 둬요. 다시 읽었을 때 그 번호를 확인해 이미 처리한 주문이면 재고를 줄이지 않아요. 이 주문 번호는 3편에서 프로듀서의 다시 보내기를 구별하던 송장 번호와 달리 어떤 주문의 재고를 줄였는지 구별해요.</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>실제로는: 처리 결과를 기준으로 세 약속을 구분해요</h3>
<table>
<thead><tr><th>약속</th><th>한 메시지의 결과</th><th>장애 뒤의 선택</th></tr></thead>
<tbody>
<tr><td>최대 한 번 · <code>at-most-once</code></td><td>0번 또는 1번</td><td>처리 전에 커밋하면 결과적으로 건너뛰게 돼요</td></tr>
<tr><td>최소 한 번 · <code>at-least-once</code></td><td>1번 이상</td><td>처리 후 커밋하므로 다시 처리할 수 있어요</td></tr>
<tr><td>정확히 한 번 · <code>exactly-once</code></td><td>다시 처리해도 결과가 1번</td><td>한 번만 반영되도록 만들어요</td></tr>
</tbody>
</table>
<p class="point">정확히 한 번이라는 말에는 어떤 결과까지 한 번인지 범위가 따라와야 해요.</p>
<p class="explain"><b>전달 보장</b>은 장애가 나도 전달·처리에 대해 지키는 약속이며 여기서 <b>복구</b>는 꺼진 컨슈머를 다시 켜 이어 읽는 것이에요. 최소 한 번은 꺼졌다 다시 켜진 뒤 남아 있는 메시지를 끝까지 처리한다는 뜻이고 보관 기간이 지나 지워진 메시지는 되살리지 못해요. 정확히 한 번은 다시 처리해도 결과가 한 번만 남도록 하는 약속이에요. Kafka에서 그 약속을 만드는 방법은 3묶음에서 살펴봐요.</p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 설정을 안 건드리면 셋 중 어느 약속인가요?</summary>
<p>A. 4편의 <b>자동 커밋</b>은 컨슈머 프로그램이 그때 읽은 위치를 알아서 장부에 적는 기능이에요. Kafka 4.1 공식 Java 컨슈머에서는 기본으로 켜져 있고 주기는 5초이며 <code>poll()</code>(다음 메시지를 받는 호출)을 할 때 주기가 지났으면 저장을 요청해요. 받은 묶음(한 번에 받은 메시지들)을 다음 호출이나 컨슈머 종료 전에 모두 처리하면 1묶음 그림의 <b>처리 후 커밋</b>처럼 동작해 최소 한 번이 돼요. 반대로 처리를 따로 맡기고 바로 다음 것을 받으면 미완료 위치도 저장돼 <b>처리 전 커밋</b>처럼 누락될 수 있어요. 그래서 기본값만으로 셋 중 하나가 무조건 보장되는 것은 아니에요.</p>
<p>참고: <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html">Apache Kafka 4.1 공식 문서</a></p>
</details>
</aside>
</div>

<p>참고: <a href="https://kafka.apache.org/41/design/design/#message-delivery-semantics">Apache Kafka 4.1: 세 전달 보장과 컨슈머 복구</a></p>

</div>

<div class="slide-group">
<h2 class="slide-group-title">트랜잭션: 출력 결과와 커밋한 위치를 함께 확정해요</h2>

<section class="slide">
<h3>결과도 Kafka 선반에 남긴다면 함께 확정할 수 있어요</h3>
<svg class="dg" viewBox="0 0 400 230" role="img" aria-label="담당자가 결과 소식과 팀 장부를 하나의 묶음으로 확정하는 그림">
<circle class="box" cx="65" cy="108" r="28"/><use class="ic" href="#i-user-round" x="43" y="86" width="44" height="44"/>
<text class="chip" x="65" y="158">재고 담당</text>
<text class="small" x="65" y="185">묶음 확정 / 취소</text>
<defs><marker id="delivery-flow-4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M98,108 L155,108" marker-end="url(#delivery-flow-4)"/>
<rect class="line" x="160" y="14" width="230" height="192" rx="12"/>
<text class="label center" x="275" y="40">한 묶음으로 확정</text>
<circle class="new" cx="215" cy="105" r="28"/><use class="ic" href="#i-shelving-unit" x="193" y="83" width="44" height="44"/>
<text class="chip" x="215" y="155">결과 선반</text>
<circle class="new" cx="335" cy="105" r="28"/><use class="ic" href="#i-notebook-pen" x="313" y="83" width="44" height="44"/>
<text class="chip" x="335" y="155">팀 장부</text>
<text class="small" x="275" y="185">둘 다 확정하거나 둘 다 취소해요</text>
</svg>
<p class="point">정확히 한 번은 바깥 DB에서 중복을 막거나 Kafka 안에서 트랜잭션으로 결과와 장부를 함께 확정해 만들 수 있어요.</p>
<p class="explain">이제 재고 담당이 DB를 직접 줄이지 않고 <b>재고 반영 소식을 선반에 남기면 뒷단 재고 팀이 그 소식을 읽어 줄인다</b>고 해 볼게요. 뒷단 재고 팀은 재고 담당과 교대하는 사람이 아니라 결과 선반을 읽어 다음 일을 하는 별도 팀이에요. <b>트랜잭션</b>은 여러 기록을 전부 확정하거나 전부 취소하는 묶음으로 여기서는 재고 담당이 결과와 팀 장부를 함께 확정하거나 취소해요.</p>
</section>

<section class="slide">
<h3>실제로는: 출력 메시지와 입력 오프셋을 함께 커밋해요</h3>
<svg class="dg" viewBox="0 0 400 340" role="img" aria-label="처리 서비스는 컨슈머이자 프로듀서이며 입력 토픽에서 읽은 뒤 출력 토픽과 팀 장부에 입력의 다음 오프셋을 함께 써요">
<defs><marker id="delivery-flow-5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<circle class="new" cx="65" cy="50" r="28"/><use class="ic" href="#i-shelving-unit" x="43" y="28" width="44" height="44"/>
<text class="chip" x="65" y="100">입력 토픽</text>
<path class="line" d="M98,50 L235,50" marker-end="url(#delivery-flow-5)"/>
<text class="small" x="165" y="35">꺼내 읽기</text>
<circle class="box" cx="270" cy="50" r="28"/><use class="ic" href="#i-user-round" x="248" y="28" width="44" height="44"/>
<text class="chip" x="270" y="100">재고 담당 = 처리 서비스</text>
<text class="small" x="270" y="122">컨슈머이자 프로듀서</text>
<rect class="line" x="12" y="178" width="376" height="150" rx="12"/>
<text class="label center" x="200" y="204">트랜잭션 · Kafka 안의 두 쓰기</text>
<path class="line" d="M245,140 L100,178 L100,229" marker-end="url(#delivery-flow-5)"/>
<text class="small" x="100" y="158">출력 소식 쓰기</text>
<path class="line" d="M300,140 L370,140 L370,220 L300,220 L300,229" marker-end="url(#delivery-flow-5)"/>
<text class="small" x="305" y="158">입력의 다음 오프셋</text>
<circle class="new" cx="100" cy="258" r="24"/><use class="ic" href="#i-shelving-unit" x="83" y="241" width="34" height="34"/>
<text class="chip" x="100" y="308">출력 토픽 · 결과 소식</text>
<circle class="new" cx="300" cy="258" r="24"/><use class="ic" href="#i-notebook-pen" x="283" y="241" width="34" height="34"/>
<text class="chip" x="300" y="300">장부 선반 · 내부 토픽</text>
<text class="small" x="300" y="320">팀 장부 · 커밋한 위치</text>
</svg>
<p class="point">Kafka 트랜잭션은 출력 메시지와 입력의 커밋한 위치를 함께 확정할 수 있어요.</p>
<p class="explain">읽은 위치 저장도 Kafka 안의 <b>장부 선반(내부 토픽)</b>에 쓰는 일이므로 처리 서비스의 프로듀서가 출력 메시지와 입력의 다음 오프셋을 같은 묶음에 넣을 수 있어요. 둘을 함께 확정해야 하므로 위치만 따로 저장하는 컨슈머의 자동 커밋은 꺼요. 처리 서비스(프로듀서)가 묶음을 확정하거나 취소하며 취소한 출력에는 표시가 붙고 커밋한 위치도 앞으로 가지 않아요. 묶음이 열린 채 서비스가 꺼지면 Kafka가 정해 둔 제한 시간이 지난 묶음을 취소로 정리해요.</p>
</section>

<details class="origin">
<summary>더 알아보기: 누가 왜 만들었을까?</summary>
<p>Apache Kafka 개발자들이 함께 제안한 <b>KIP-98</b>(Kafka 개선 제안 문서의 98번)은 재시도 중복을 막는 기능을 넘어 여러 파티션에 남기는 결과를 함께 확정하려고 나왔어요. Kafka 0.11.0.0부터 멱등 프로듀서(3편의 송장 번호로 재시도 중복을 막는 방식)와 트랜잭션을 지원해요.</p>
<p>제안 제목의 “Exactly Once Delivery and Transactional Messaging”은 정확히 한 번 전달과 트랜잭션 메시징이라는 뜻이에요. 주문을 읽고 처리한 결과를 다시 Kafka에 쓰는 서비스에서 출력과 읽은 위치가 어긋나는 문제를 풀기 위한 기능이에요.</p>
<p>참고: <a href="https://cwiki.apache.org/confluence/display/KAFKA/KIP-98+-+Exactly+Once+Delivery+and+Transactional+Messaging">KIP-98: 제안 배경과 공동 제안자</a> · <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/producer/KafkaProducer.html">KafkaProducer: 도입 버전과 트랜잭션</a></p>
</details>

<div class="slide-with-question">
<section class="slide">
<h3>실제로는: 다음 컨슈머도 확정된 결과만 꺼내 읽어야 해요</h3>
<table>
<thead><tr><th>출력 토픽의 기록</th><th><code>read_committed</code> 컨슈머</th></tr></thead>
<tbody>
<tr><td>확정된 트랜잭션 메시지</td><td>꺼내 읽어요</td></tr>
<tr><td>진행 중인 트랜잭션 메시지</td><td>끝날 때까지 기다려요</td></tr>
<tr><td>취소된 트랜잭션 메시지</td><td>건너뛰어요</td></tr>
<tr><td>트랜잭션 밖에서 쓴 메시지</td><td>그대로 읽혀요</td></tr>
</tbody>
</table>
<p class="point">트랜잭션으로 쓴 결과는 읽는 쪽도 확정 여부를 가려야 의미가 있어요.</p>
<p class="explain"><b>다음 컨슈머</b>는 앞에서 소개한 뒷단 재고 팀처럼 결과 선반을 읽는 서비스예요. 뒷단 팀의 컨슈머 설정에 <code>isolation.level=read_committed</code>를 적어야 하며 Kafka 4.1 공식 Java 컨슈머의 기본값인 <code>read_uncommitted</code>면 취소된 결과까지 읽을 수 있어요. 여기서 확정은 여러 쓰기를 마치는 <b>트랜잭션 커밋</b>이고 다음에 읽을 위치를 저장하는 <b>오프셋 커밋</b>과는 다른 말이에요.</p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 정확히 한 번이 좋은데 왜 항상 쓰지 않나요?</summary>
<p>A. 트랜잭션은 함께 확정할 기록을 관리하고 읽는 쪽도 확정을 기다리므로 더 느려질 수 있어요. 또 Kafka 트랜잭션의 보장은 Kafka 안에서 함께 묶은 출력 결과와 위치에 적용되며 외부 DB나 문자 발송에는 별도 방법이 필요해요. 예를 들어 일부 측정값의 누락은 허용하지만 중복 집계는 피하려는 실시간 화면이라면 처리 전에 커밋하는 최대 한 번을 선택할 수도 있어요.</p>
<p>참고: <a href="https://kafka.apache.org/41/design/design/#message-delivery-semantics">Apache Kafka 4.1 공식 문서</a></p>
</details>
</aside>
</div>

<section class="slide">
<h3>이럴 땐 조심해요: 문자 발송은 이 묶음 밖에 있어요</h3>
<table>
<thead><tr><th>결과를 남기는 곳</th><th>중복을 막으려면</th></tr></thead>
<tbody>
<tr><td>외부 DB(데이터 저장소)</td><td>재고 변경과 다음에 읽을 번호를 DB의 한 묶음으로 저장하거나 같은 주문 번호를 한 번만 반영해요</td></tr>
<tr><td>문자·결제 서비스</td><td>3편의 송장 번호처럼 상대 서비스가 같은 주문 번호를 한 번만 반영하는 기능이 필요해요</td></tr>
</tbody>
</table>
<p class="point">Kafka의 트랜잭션만으로 이미 보낸 문자나 외부 결제를 되돌릴 수는 없어요.</p>
<p class="explain">처음 예처럼 Kafka 밖의 DB에 재고를 쓰거나 문자를 보내는 일에는 다른 방법이 필요해요. DB에 재고 변경과 다음에 읽을 번호를 함께 저장하면 둘이 어긋나지 않으며 이때는 서비스가 시작할 때 Kafka 장부 대신 DB에 저장한 위치부터 읽게 해요. 문자 발송은 Kafka 트랜잭션을 취소해도 되돌릴 수 없으므로 상대 서비스의 중복 방지 기능이 필요해요.</p>
</section>

<section class="slide">
<h3>한눈에 다시 보기</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="세 가지 전달 보장과 트랜잭션 및 read_committed를 다섯 줄로 요약해요">
<circle class="bad" cx="30" cy="28" r="18"/><use class="ic" href="#i-package" x="17" y="15" width="26" height="26"/>
<text class="label" x="62" y="19">at-most-once · 최대 한 번</text><text class="small" x="62" y="38" style="text-anchor:start">누락될 수 있어도 겹치지 않게 해요</text>
<circle class="box" cx="20" cy="76" r="14"/><use class="ic" href="#i-package" x="10" y="66" width="20" height="20"/>
<circle class="box" cx="42" cy="76" r="14"/><use class="ic" href="#i-package" x="32" y="66" width="20" height="20"/>
<text class="label" x="62" y="67">at-least-once · 최소 한 번</text><text class="small" x="62" y="86" style="text-anchor:start">다시 처리해서 누락을 막되 겹칠 수 있어요</text>
<circle class="box" cx="30" cy="124" r="18"/><use class="ic" href="#i-package" x="17" y="111" width="26" height="26"/>
<text class="label" x="62" y="115">exactly-once · 정확히 한 번</text><text class="small" x="62" y="134" style="text-anchor:start">Kafka 안에서 묶은 결과를 한 번만 남겨요</text>
<circle class="new" cx="30" cy="172" r="18"/><use class="ic" href="#i-notebook-pen" x="17" y="159" width="26" height="26"/>
<text class="label" x="62" y="163">트랜잭션</text><text class="small" x="62" y="182" style="text-anchor:start">출력 결과와 입력 오프셋을 함께 확정해요</text>
<circle class="box" cx="30" cy="220" r="18"/><use class="ic" href="#i-user-round" x="17" y="207" width="26" height="26"/>
<text class="label" x="62" y="211">read_committed</text><text class="small" x="62" y="230" style="text-anchor:start">취소된 묶음은 건너뛰고 미완료는 기다려요</text>
</svg>
<p class="point">정확히 한 번을 이해하려면 결과와 읽은 위치를 함께 확정하는 범위까지 봐야 해요.</p>
</section>

<p>참고: <a href="https://kafka.apache.org/41/design/design/#using-transactions">Apache Kafka 4.1: 트랜잭션과 복구 조건</a> · <a href="https://kafka.apache.org/41/configuration/consumer-configs/#isolation.level">읽기 모드의 기본값과 대기 범위</a> · <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/producer/KafkaProducer.html#sendOffsetsToTransaction(java.util.Map,org.apache.kafka.clients.consumer.ConsumerGroupMetadata)">출력과 오프셋 묶기 및 자동 커밋 끄기</a> · <a href="https://kafka.apache.org/41/configuration/producer-configs/#transaction.timeout.ms">열린 묶음의 제한 시간과 자동 취소</a> · <a href="https://kafka.apache.org/41/design/design/#message-delivery-semantics">외부 시스템과의 협력</a></p>

</div>

</div>

<link rel="stylesheet" href="{{ '/assets/css/delivery-semantics-playground.css' | relative_url }}">
<script defer src="{{ '/assets/js/delivery-semantics-playground.js' | relative_url }}"></script>
