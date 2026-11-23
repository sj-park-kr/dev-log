---
layout: post
title: "택배가 두 번 오거나 사라지면? 물류센터로 이해하는 카프카 전달 보장"
description: "그림으로 보는 Kafka 전달 보장: 장부(오프셋 커밋)를 언제 적느냐로 갈리는 최대 한 번·최소 한 번·정확히 한 번, 자동 커밋의 함정, 결과와 장부를 함께 확정하는 트랜잭션과 read_committed, Kafka 밖의 일을 조심할 점을 동화책처럼 설명합니다."
date: 2026-11-15 15:30:00 +0900
series: kafka
episode: 7
summary: "소식이 남아 있어도 처리는 누락되거나 겹칠 수 있어요. 세 가지 약속을 비교하고 결과와 읽은 위치를 함께 확정하는 이유를 알아봐요."
---

<div class="lesson lesson-hierarchy storybook">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: https://cdn.jsdelivr.net/npm/lucide-static@1.25.0/icons/ (ISC). 라이선스: assets/icons/LICENSE-lucide.txt. 공통 사물은 Kafka 1~6편과 같은 아이콘이며 문자(message-square)를 추가. i-check=circle-check, i-x=circle-x. -->
<symbol id="i-store" viewBox="0 0 24 24"><path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"/><path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244"/><path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"/></symbol>
<symbol id="i-warehouse" viewBox="0 0 24 24"><path d="M18 21V10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v11"/><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 1.132-1.803l7.95-3.974a2 2 0 0 1 1.837 0l7.948 3.974A2 2 0 0 1 22 8z"/><path d="M6 13h12"/><path d="M6 17h12"/></symbol>
<symbol id="i-package" viewBox="0 0 24 24"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/></symbol>
<symbol id="i-user-round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></symbol>
<symbol id="i-shelving-unit" viewBox="0 0 24 24"><path d="M12 12V9a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/><path d="M16 20v-3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/><path d="M20 22V2"/><path d="M4 12h16"/><path d="M4 20h16"/><path d="M4 2v20"/><path d="M4 4h16"/></symbol>
<symbol id="i-notebook-pen" viewBox="0 0 24 24"><path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/></symbol>
<symbol id="i-database" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></symbol>
<symbol id="i-timer" viewBox="0 0 24 24"><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></symbol>
<symbol id="i-message-square" viewBox="0 0 24 24"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0zM9 12l2 2 4-4"/></symbol>
<symbol id="i-x" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0zM15 9l-6 6M9 9l6 6"/></symbol>
</defs>
</svg>

<div class="slide-group">
<h2 class="slide-group-title">문제: 남아 있어도 일은 빠지거나 겹쳐요</h2>

<section class="slide">
<h3>선반만 봐서는 일을 마쳤는지 몰라요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="담당자(컨슈머)가 선반(토픽)에서 4번 상자를 읽고 저장소(DB)의 재고를 10개에서 9개로 줄였지만 장부를 고치기 전에 멈춰 장부는 아직 4번에 머문 그림. 번호와 재고 수는 설명용 예시다">
<defs><marker id="ds1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M84,100 L132,100" marker-end="url(#ds1)"/><text class="chip" x="108" y="86">4번 상자</text>
<path class="line" d="M204,88 L282,60" marker-end="url(#ds1)"/>
<path class="line dash" d="M204,112 L282,152" marker-end="url(#ds1)"/>
<circle class="new" cx="50" cy="100" r="30"/><use class="ic" href="#i-shelving-unit" x="30" y="80" width="40" height="40"/>
<text class="big" x="50" y="152">선반</text><text class="small" x="50" y="172">토픽</text>
<circle class="box" cx="170" cy="100" r="32"/><use class="ic" href="#i-user-round" x="150" y="80" width="40" height="40"/>
<text class="big" x="170" y="154">담당자</text><text class="small" x="170" y="174">컨슈머</text>
<circle class="kafka" cx="320" cy="50" r="28"/><use class="ic" href="#i-database" x="302" y="32" width="36" height="36"/>
<text class="big" x="320" y="96">저장소</text><text class="small" x="320" y="122">4번으로 재고 10 → 9</text>
<circle class="bad blink" cx="320" cy="170" r="28"/><use class="ic" href="#i-notebook-pen" x="302" y="152" width="36" height="36"/>
<text class="big" x="320" y="216">장부</text><text class="alert" x="320" y="236">다음도 4번부터</text>
<circle class="packet" r="5"><animateMotion dur="1.6s" repeatCount="indefinite" path="M84,100 L132,100"/></circle>
</svg>
<ol class="steps">
<li>저장소(DB)는 서비스가 재고 수를 적어 두는 곳이에요</li>
<li>담당자(컨슈머)는 재고를 고친 뒤 장부를 따로 적어요</li>
<li>그 사이에 멈추면 새 담당은 4번을 또 읽어요 (예시)</li>
</ol>
<p class="more">장부와 커밋은 <a href="{{ '/2026/11/15/consumer-group/' | relative_url }}">4편 컨슈머 그룹</a>에서 봐요</p>
</section>

<section class="slide">
<h3>가게의 번호는 다시 읽기를 못 막아요</h3>
<svg class="dg" viewBox="0 0 400 190" role="img" aria-label="가게(프로듀서)가 맡긴 주문은 선반에 한 번만 쌓였지만 담당자가 같은 상자를 한 번 읽고 다시 읽어 재고를 두 번 줄이는 그림">
<defs><marker id="ds2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M74,90 L132,90" marker-end="url(#ds2)"/><text class="chip" x="103" y="78">번호</text>
<path class="line" d="M206,80 L286,80" marker-end="url(#ds2)"/><text class="chip" x="246" y="68">읽기</text>
<path class="line" d="M206,112 L286,112" marker-end="url(#ds2)"/><text class="chip" x="246" y="132">다시 읽기</text>
<circle class="box" cx="44" cy="90" r="26"/><use class="ic" href="#i-store" x="26" y="72" width="36" height="36"/>
<text class="big" x="44" y="138">가게</text><text class="small" x="44" y="164">프로듀서</text>
<circle class="kafka" cx="170" cy="96" r="30"/><use class="ic" href="#i-shelving-unit" x="150" y="76" width="40" height="40"/>
<text class="big" x="170" y="148">선반</text><text class="small" x="170" y="168">한 번만 쌓여요</text>
<circle class="bad" cx="326" cy="96" r="28"/><use class="ic" href="#i-user-round" x="308" y="78" width="36" height="36"/>
<text class="big" x="326" y="146">담당자</text><text class="alert" x="326" y="170">같은 일을 두 번 해요</text>
</svg>
<ol class="steps">
<li>3편의 번호(멱등성)는 가게가 다시 보낸 것만 걸러요</li>
<li>담당자가 다시 읽으면 재고 일도 한 번 더 해요</li>
<li>그래서 읽는 쪽의 약속(전달 보장)이 따로 있어요</li>
</ol>
<p class="more">번호를 붙여 다시 보내는 법은 <a href="{{ '/2026/11/15/producer/' | relative_url }}">3편 프로듀서</a>에서 봐요</p>
</section>

<details class="origin">
<summary>더 알아보기: 누가 왜 만들었을까?</summary>
<p>Apache Kafka 개발자들이 함께 제안한 <b>KIP-98</b>(Kafka 개선 제안 문서의 98번)은 재시도 중복을 막는 기능을 넘어 여러 파티션에 남기는 결과를 함께 확정하려고 나왔어요. Kafka 0.11.0.0부터 멱등 프로듀서(3편의 번호로 재시도 중복을 막는 방식)와 트랜잭션(여러 기록을 함께 확정하거나 취소하는 묶음)을 지원해요.</p>
<p>제안 제목의 “Exactly Once Delivery and Transactional Messaging”은 정확히 한 번 전달과 트랜잭션 메시징이라는 뜻이에요. 주문을 읽고 처리한 결과를 다시 Kafka에 쓰는 서비스에서 출력과 읽은 위치가 어긋나는 문제를 풀기 위한 기능이에요.</p>
<p>참고: <a href="https://cwiki.apache.org/confluence/display/KAFKA/KIP-98+-+Exactly+Once+Delivery+and+Transactional+Messaging">KIP-98: 제안 배경과 공동 제안자</a> · <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/producer/KafkaProducer.html">KafkaProducer: 도입 버전과 트랜잭션</a></p>
</details>
</div>

<div class="slide-group">
<h2 class="slide-group-title">세 약속: 빠짐과 겹침 중 무엇을 막을까요</h2>

<section class="slide">
<h3>장부를 먼저 적으면 빠지고 늦게 적으면 겹쳐요</h3>
<svg class="dg" viewBox="0 0 400 240" role="img" aria-label="같은 재고 처리를 위아래로 나란히 비교한 그림. 위는 장부를 먼저 적고 멈춰 재고 처리를 못 했고 새 담당은 다음 번호부터 읽어 재고 처리가 빠진다. 아래는 재고를 먼저 처리하고 장부를 적기 전에 멈춰 새 담당이 같은 번호를 다시 읽어 재고를 두 번 줄인다. 점선 상자는 멈춰서 하지 못한 일이다">
<defs><marker id="ds3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="6" y="6" width="388" height="110" rx="12"/>
<text class="label center" x="200" y="26">장부를 먼저 적으면</text><text class="chip" x="348" y="26">많아야 1번</text>
<rect class="kafka" x="24" y="42" width="100" height="32" rx="6"/><text class="chip" x="74" y="58">장부 적기</text>
<path class="line" d="M126,58 L146,58" marker-end="url(#ds3)"/>
<rect class="bad" x="150" y="42" width="100" height="32" rx="6"/><text class="chip" x="200" y="58">멈춤</text>
<path class="line dash" d="M252,58 L272,58" marker-end="url(#ds3)"/>
<rect class="line dash" x="276" y="42" width="100" height="32" rx="6"/><text class="small" x="326" y="58">재고 못 함</text>
<text class="alert" x="200" y="98">재고 처리가 빠져요</text>
<rect class="line" x="6" y="124" width="388" height="110" rx="12"/>
<text class="label center" x="200" y="144">재고를 먼저 처리하면</text><text class="chip" x="348" y="144">적어도 1번</text>
<rect class="kafka" x="24" y="160" width="100" height="32" rx="6"/><text class="chip" x="74" y="176">재고 처리</text>
<path class="line" d="M126,176 L146,176" marker-end="url(#ds3)"/>
<rect class="bad" x="150" y="160" width="100" height="32" rx="6"/><text class="chip" x="200" y="176">멈춤</text>
<path class="line dash" d="M252,176 L272,176" marker-end="url(#ds3)"/>
<rect class="line dash" x="276" y="160" width="100" height="32" rx="6"/><text class="small" x="326" y="176">장부 못 적음</text>
<text class="alert" x="200" y="216">재고를 두 번 줄여요</text>
</svg>
<ol class="steps">
<li>장부를 먼저 적으면 최대 한 번(at-most-once)이에요</li>
<li>재고를 먼저 하면 최소 한 번(at-least-once)이에요</li>
<li>둘 다 막는 약속은 정확히 한 번(exactly-once)이에요</li>
</ol>
<p class="more">새 담당이 장부부터 읽는 과정은 <a href="{{ '/2026/11/15/consumer-group/' | relative_url }}">4편</a> · 지워진 소식은 <a href="{{ '/2026/11/15/retention-compaction/' | relative_url }}">6편</a>에서 봐요 · 참고: <a href="https://kafka.apache.org/41/design/design/#message-delivery-semantics">Apache Kafka 4.1: 세 전달 보장과 컨슈머 복구</a></p>
</section>

<section class="slide">
<h3>자동 커밋은 처리 방식에 따라 약속이 달라요</h3>
<svg class="dg" viewBox="0 0 400 290" role="img" aria-label="자동 커밋을 켠 같은 담당자를 위아래로 나란히 비교한 그림. 위는 4번과 5번을 받아 다 처리한 뒤 다음 읽기 요청 때 장부에 6을 적어 최소 한 번이 된다. 아래는 4번과 5번의 처리를 다른 곳에 넘기고 바로 다음 읽기 요청이 장부에 6을 적고 그 뒤 처리 중에 멈춰 4번과 5번이 빠질 수 있다. 처리 상자의 색만 다르다. 번호는 설명용 예시다">
<defs><marker id="ds4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="small" x="200" y="14">자동 커밋 (enable.auto.commit) · 기본 켜짐 · 지난 적기 뒤 5초</text>
<rect class="line" x="6" y="24" width="388" height="126" rx="12"/>
<text class="label center" x="200" y="44">다 처리한 뒤 다음 요청</text>
<rect class="box" x="14" y="62" width="104" height="32" rx="6"/><text class="chip" x="66" y="78">4·5번 받기</text>
<path class="line" d="M120,78 L144,78" marker-end="url(#ds4)"/>
<rect class="kafka" x="148" y="62" width="104" height="32" rx="6"/><text class="chip" x="200" y="78">처리 끝</text>
<path class="line" d="M254,78 L278,78" marker-end="url(#ds4)"/>
<rect class="box" x="282" y="62" width="104" height="32" rx="6"/><text class="chip" x="334" y="78">장부에 6</text>
<text class="chip" x="200" y="130">최소 한 번</text>
<rect class="line" x="6" y="158" width="388" height="126" rx="12"/>
<text class="label center" x="200" y="178">처리를 넘기고 바로 다음 요청</text>
<rect class="box" x="14" y="196" width="104" height="32" rx="6"/><text class="chip" x="66" y="212">4·5번 받기</text>
<path class="line" d="M120,212 L144,212" marker-end="url(#ds4)"/>
<rect class="box" x="148" y="196" width="104" height="32" rx="6"/><text class="chip" x="200" y="212">장부에 6</text>
<path class="line" d="M254,212 L278,212" marker-end="url(#ds4)"/>
<rect class="bad" x="282" y="196" width="104" height="32" rx="6"/><text class="chip" x="334" y="212">처리 중 멈춤</text>
<text class="alert" x="200" y="264">4·5번이 빠질 수 있어요</text>
</svg>
<ol class="steps">
<li>5초가 지나면 다음 읽기 요청(poll()) 때 적어요</li>
<li>장부에는 다음에 읽을 번호 6을 적어요 (예시)</li>
<li>그 요청 전에 일을 다 끝내야 최소 한 번이에요</li>
</ol>
<p class="more">기본값은 Kafka 4.1 Java 컨슈머 기준이에요 · 자동 커밋 동작은 <a href="{{ '/2026/11/15/consumer-group/' | relative_url }}">4편</a>에서 봐요 · 참고: <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html">Kafka 4.1 KafkaConsumer: 자동 커밋</a> · <a href="https://kafka.apache.org/41/configuration/consumer-configs/#enable.auto.commit">컨슈머 설정</a></p>
</section>

<section class="slide">
<h3>겹쳐도 주문 번호를 보면 한 번만 반영해요</h3>
<svg class="dg" viewBox="0 0 400 240" role="img" aria-label="같은 주문 B가 두 번 오는 두 경우를 위아래 카드로 나란히 비교한 그림. 위 처음 온 주문 B는 저장소에서 재고를 하나 줄이고 주문 번호 B를 적는다. 아래 다시 온 같은 주문 B는 저장소에 이미 B가 적혀 있어 건너뛴다. 주문 번호는 설명용 예시다">
<defs><marker id="ds5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="6" y="6" width="388" height="110" rx="12"/>
<text class="label center" x="200" y="26">처음 온 주문</text>
<path class="line" d="M74,70 L154,70" marker-end="url(#ds5)"/>
<path class="line" d="M206,70 L246,70" marker-end="url(#ds5)"/>
<circle class="new" cx="50" cy="70" r="22"/><use class="ic" href="#i-package" x="36" y="56" width="28" height="28"/>
<text class="chip" x="50" y="106">주문 B</text>
<circle class="kafka" cx="180" cy="70" r="24"/><use class="ic" href="#i-database" x="164" y="54" width="32" height="32"/>
<text class="small" x="180" y="106">저장소</text>
<rect class="kafka" x="250" y="54" width="134" height="32" rx="6"/><text class="chip" x="317" y="70">재고 −1 · B 적기</text>
<rect class="line" x="6" y="124" width="388" height="110" rx="12"/>
<text class="label center" x="200" y="144">다시 온 같은 주문</text>
<path class="line" d="M74,188 L154,188" marker-end="url(#ds5)"/>
<path class="line" d="M206,188 L246,188" marker-end="url(#ds5)"/>
<circle class="box" cx="50" cy="188" r="22"/><use class="ic" href="#i-package" x="36" y="174" width="28" height="28"/>
<text class="chip" x="50" y="224">주문 B</text>
<circle class="kafka" cx="180" cy="188" r="24"/><use class="ic" href="#i-database" x="164" y="172" width="32" height="32"/>
<text class="small" x="180" y="224">저장소</text>
<rect class="box" x="250" y="172" width="134" height="32" rx="6"/><text class="chip" x="317" y="188">이미 있어 건너뛰기</text>
</svg>
<ol class="steps">
<li>주문 번호를 함께 적어 두면 다시 와도 알아봐요 (예시)</li>
<li>그래서 최소 한 번이어도 재고는 한 번 줄어요</li>
<li>이 번호는 3편 번호와 달리 담당자가 확인해요</li>
</ol>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">트랜잭션: 결과와 장부를 함께 확정해요</h2>

<section class="slide">
<h3>재고 담당은 결과를 다른 선반에 맡겨요</h3>
<svg class="dg" viewBox="0 0 400 160" role="img" aria-label="재고 담당이 주문 선반에서 주문을 읽고 처리한 결과 소식을 결과 선반에 맡기는 그림. 읽을 때는 컨슈머이고 맡길 때는 프로듀서다">
<defs><marker id="ds6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M84,70 L164,70" marker-end="url(#ds6)"/><text class="chip" x="124" y="56">읽기</text>
<path class="line" d="M236,70 L316,70" marker-end="url(#ds6)"/><text class="chip" x="276" y="56">맡기기</text>
<circle class="new" cx="50" cy="70" r="30"/><use class="ic" href="#i-shelving-unit" x="30" y="50" width="40" height="40"/>
<text class="big" x="50" y="124">주문 선반</text>
<circle class="box" cx="200" cy="70" r="32"/><use class="ic" href="#i-user-round" x="180" y="50" width="40" height="40"/>
<text class="big" x="200" y="124">재고 담당</text>
<circle class="kafka" cx="350" cy="70" r="30"/><use class="ic" href="#i-shelving-unit" x="330" y="50" width="40" height="40"/>
<text class="big" x="350" y="124">결과 선반</text>
<circle class="packet" r="5"><animateMotion dur="2.4s" repeatCount="indefinite" path="M84,70 L164,70 M236,70 L316,70"/></circle>
</svg>
<ol class="steps">
<li>이번엔 저장소 대신 결과 소식을 선반에 맡겨요</li>
<li>다음 팀이 그 결과 소식을 읽고 재고를 줄여요</li>
<li>읽을 땐 담당자(컨슈머), 맡길 땐 가게(프로듀서)예요</li>
</ol>
</section>

<section class="slide">
<h3>결과와 장부를 한 묶음으로 확정해요</h3>
<svg class="dg" viewBox="0 0 400 214" role="img" aria-label="결과 소식과 장부(__consumer_offsets)가 한 묶음(트랜잭션) 카드 안에 있고 묶음을 확정하면 다음 팀이 결과를 읽을 수 있는 그림">
<defs><marker id="ds10" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="6" y="6" width="260" height="200" rx="12"/>
<text class="label center" x="136" y="30">한 묶음 (트랜잭션)</text>
<circle class="new" cx="76" cy="100" r="26"/><use class="ic" href="#i-package" x="60" y="84" width="32" height="32"/>
<text class="chip" x="76" y="146">결과 소식</text>
<circle class="new" cx="196" cy="100" r="26"/><use class="ic" href="#i-notebook-pen" x="180" y="84" width="32" height="32"/>
<text class="chip" x="196" y="146">장부</text><text class="small mono" x="196" y="166">__consumer_offsets</text>
<path class="line" d="M268,100 L320,100" marker-end="url(#ds10)"/><text class="chip" x="294" y="86">확정</text>
<circle class="kafka" cx="352" cy="100" r="26"/><use class="ic" href="#i-user-round" x="336" y="84" width="32" height="32"/>
<text class="chip" x="352" y="146">다음 팀</text><text class="small" x="352" y="166">이제 읽어요</text>
</svg>
<ol class="steps">
<li>묶음째 확정하거나 취소하는 걸 트랜잭션이라 해요</li>
<li>확정(트랜잭션 커밋)은 장부 적기와 다른 커밋이에요</li>
<li>자동 커밋은 꺼서 장부를 묶음 안에서만 적어요 (enable.auto.commit=false)</li>
</ol>
<p class="more">참고: <a href="https://kafka.apache.org/41/design/design/#using-transactions">Kafka 4.1: 트랜잭션 쓰기</a> · <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/producer/KafkaProducer.html#sendOffsetsToTransaction(java.util.Map,org.apache.kafka.clients.consumer.ConsumerGroupMetadata)">출력과 오프셋 묶기</a></p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">취소: 멈추면 없던 일이 돼요</h2>

<section class="slide">
<h3>확정 전에 멈추면 묶음을 통째로 취소해요</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="재고 담당이 묶음을 확정하기 전에 멈춘 그림. 취소된 묶음 카드 안에서 결과 선반의 소식에는 취소 표시가 붙고 장부는 4번 그대로 남는다. 번호는 설명용 예시다">
<defs><marker id="ds7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line dash" d="M90,100 L130,100" marker-end="url(#ds7)"/>
<circle class="bad blink" cx="56" cy="100" r="30"/><use class="ic" href="#i-user-round" x="36" y="80" width="40" height="40"/>
<text class="big" x="56" y="152">재고 담당</text><text class="alert" x="56" y="172">멈췄어요</text>
<rect class="line" x="134" y="20" width="256" height="170" rx="12"/>
<text class="label center" x="262" y="44">센터가 취소한 묶음</text>
<circle class="bad" cx="200" cy="104" r="26"/><use class="ic" href="#i-package" x="184" y="88" width="32" height="32"/>
<circle class="bad" cx="228" cy="76" r="16"/><use class="ic" href="#i-x" x="216" y="64" width="24" height="24"/>
<text class="chip" x="200" y="152">결과 · 취소 표시</text>
<circle class="box" cx="324" cy="104" r="26"/><use class="ic" href="#i-notebook-pen" x="308" y="88" width="32" height="32"/>
<text class="chip" x="324" y="152">장부 · 4번 그대로</text>
</svg>
<ol class="steps">
<li>결과와 장부가 함께 없던 일이 돼요</li>
<li>새 담당은 장부의 4번부터 다시 해요 (예시)</li>
<li>취소된 건 없던 일이라 확정 결과는 한 번뿐이에요</li>
</ol>
<p class="more">참고: <a href="https://kafka.apache.org/41/design/design/#using-transactions">Kafka 4.1: 트랜잭션과 복구 조건</a></p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>열린 채 남은 묶음은 센터가 취소해요</h3>
<svg class="dg" viewBox="0 0 400 260" role="img" aria-label="확정도 취소도 안 된 열린 묶음이 취소되는 두 경우를 위아래 카드로 나란히 비교한 그림. 위는 묶음이 열린 채 1분이 지나 센터가 취소한다. 아래는 재고 담당이 같은 묶음 이름으로 다시 켜져 센터가 끝내지 못한 앞 묶음을 취소한다">
<defs><marker id="ds9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="6" y="6" width="388" height="120" rx="12"/>
<text class="label center" x="200" y="26">열린 채 1분이 지나면</text>
<path class="line" d="M92,70 L166,70" marker-end="url(#ds9)"/>
<path class="line" d="M234,70 L302,70" marker-end="url(#ds9)"/>
<circle class="new" cx="64" cy="70" r="24"/><use class="ic" href="#i-package" x="48" y="54" width="32" height="32"/>
<circle class="box" cx="86" cy="50" r="14"/><use class="ic" href="#i-timer" x="76" y="40" width="20" height="20"/>
<text class="chip" x="64" y="112">열린 묶음</text>
<circle class="kafka" cx="200" cy="70" r="28"/><use class="ic" href="#i-warehouse" x="182" y="52" width="36" height="36"/>
<text class="chip" x="200" y="112">센터</text>
<circle class="bad" cx="332" cy="70" r="24"/><use class="ic" href="#i-x" x="316" y="54" width="32" height="32"/>
<text class="chip" x="332" y="112">묶음 취소</text>
<rect class="line" x="6" y="134" width="388" height="120" rx="12"/>
<text class="label center" x="200" y="154">같은 이름으로 다시 켜면</text>
<path class="line" d="M92,198 L166,198" marker-end="url(#ds9)"/>
<path class="line" d="M234,198 L302,198" marker-end="url(#ds9)"/>
<circle class="box" cx="64" cy="198" r="24"/><use class="ic" href="#i-user-round" x="48" y="182" width="32" height="32"/>
<text class="chip" x="64" y="240">같은 묶음 이름</text>
<circle class="kafka" cx="200" cy="198" r="28"/><use class="ic" href="#i-warehouse" x="182" y="180" width="36" height="36"/>
<text class="chip" x="200" y="240">센터</text>
<circle class="bad" cx="332" cy="198" r="24"/><use class="ic" href="#i-x" x="316" y="182" width="32" height="32"/>
<text class="chip" x="332" y="240">앞 묶음 취소</text>
</svg>
<ol class="steps">
<li>확정도 취소도 안 한 묶음이 열린 묶음이에요</li>
<li>1분이 지나면 센터가 취소해요 (transaction.timeout.ms 기본)</li>
<li>묶음 이름(transactional.id)은 개발자가 설정에 적어요</li>
</ol>
<p class="more">기본값은 Kafka 4.1 Java 프로듀서 기준이에요 · 참고: <a href="https://kafka.apache.org/41/configuration/producer-configs/#transaction.timeout.ms">열린 묶음의 제한 시간과 자동 취소</a> · <a href="https://kafka.apache.org/41/configuration/producer-configs/#transactional.id">transactional.id</a> · <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/producer/KafkaProducer.html#initTransactions()">다시 켤 때 앞 묶음 정리</a></p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 같은 묶음 이름을 두 담당이 함께 쓰면요?</summary>
<p>A. 나중에 켠 쪽이 그 이름의 묶음을 이어 쓰고 먼저 켠 쪽은 더 쓰지 못하게 막혀요(ProducerFencedException). 그래서 동시에 도는 담당마다 이름을 다르게 정해요.</p>
<p>참고: <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/producer/KafkaProducer.html">Kafka 4.1 KafkaProducer</a></p>
</details>
</aside>
</div>

<section class="slide">
<h3>다음 팀은 취소된 결과를 건너뛰어요</h3>
<svg class="dg" viewBox="0 0 400 240" role="img" aria-label="결과 선반의 소식 세 가지를 확정만 읽는 모드(isolation.level=read_committed)로 읽는 그림. 확정된 소식은 꺼내 읽고 진행 중인 소식은 끝날 때까지 기다리고 취소된 소식은 건너뛴다">
<defs><marker id="ds8" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="label center" x="200" y="20">결과 선반 · 확정만 읽기</text><text class="small mono" x="200" y="38">isolation.level=read_committed</text>
<circle class="kafka" cx="80" cy="88" r="30"/><use class="ic" href="#i-check" x="62" y="70" width="36" height="36"/>
<circle class="box" cx="200" cy="88" r="30"/><use class="ic" href="#i-timer" x="182" y="70" width="36" height="36"/>
<circle class="bad" cx="320" cy="88" r="30"/><use class="ic" href="#i-x" x="302" y="70" width="36" height="36"/>
<text class="big" x="80" y="142">확정</text><text class="big" x="200" y="142">진행 중</text><text class="big" x="320" y="142">취소</text>
<path class="line" d="M80,156 L80,186" marker-end="url(#ds8)"/>
<path class="line" d="M200,156 L200,186" marker-end="url(#ds8)"/>
<path class="line" d="M320,156 L320,186" marker-end="url(#ds8)"/>
<rect class="kafka" x="30" y="192" width="100" height="32" rx="6"/><text class="chip" x="80" y="208">꺼내 읽어요</text>
<rect class="box" x="150" y="192" width="100" height="32" rx="6"/><text class="chip" x="200" y="208">기다려요</text>
<rect class="line dash" x="270" y="192" width="100" height="32" rx="6"/><text class="chip" x="320" y="208">건너뛰어요</text>
</svg>
<ol class="steps">
<li>다음 팀(컨슈머)도 확정만 읽게 설정해요 (read_committed)</li>
<li>진행 중은 취소될 수도 있어 끝날 때까지 기다려요</li>
<li>기본(read_uncommitted)은 취소된 것도 읽어요</li>
</ol>
<p class="more">기본값은 Kafka 4.1 Java 컨슈머 기준이에요 · 참고: <a href="https://kafka.apache.org/41/configuration/consumer-configs/#isolation.level">읽기 모드의 기본값</a> · <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html">KafkaConsumer: 트랜잭션 메시지 읽기</a></p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">판단: 언제 쓰고 무엇을 조심해요?</h2>

<section class="slide">
<h3>Kafka 밖의 일은 트랜잭션이 되돌리지 못해요</h3>
<svg class="dg" viewBox="0 0 400 220" role="img" aria-label="왼쪽 묶음 안 카드에는 센터 안의 결과 선반과 장부가 있고 오른쪽 묶음 밖 카드에는 재고와 다음 번호를 함께 적는 저장소(DB)와 문자·결제 회사가 있는 그림. 트랜잭션은 왼쪽만 함께 확정하거나 취소한다">
<rect class="line" x="6" y="6" width="190" height="208" rx="12"/>
<text class="label center" x="101" y="30">묶음 안 · 센터</text>
<circle class="kafka" cx="101" cy="80" r="26"/><use class="ic" href="#i-shelving-unit" x="85" y="64" width="32" height="32"/>
<text class="chip" x="101" y="122">결과 선반</text>
<circle class="kafka" cx="101" cy="160" r="26"/><use class="ic" href="#i-notebook-pen" x="85" y="144" width="32" height="32"/>
<text class="chip" x="101" y="202">장부</text>
<rect class="line" x="204" y="6" width="190" height="208" rx="12"/>
<text class="label center" x="299" y="30">묶음 밖 · 못 되돌려요</text>
<circle class="box" cx="299" cy="80" r="26"/><use class="ic" href="#i-database" x="283" y="64" width="32" height="32"/>
<text class="chip" x="299" y="122">저장소: 재고 + 다음 번호</text>
<circle class="box" cx="299" cy="160" r="26"/><use class="ic" href="#i-message-square" x="283" y="144" width="32" height="32"/>
<text class="chip" x="299" y="202">문자·결제 회사</text>
</svg>
<ol class="steps">
<li>재고와 다음 번호를 한곳에 적어야 함께 남아요</li>
<li>그래서 다시 켜면 장부 대신 저장소의 번호부터 읽어요</li>
<li>문자는 받는 회사가 같은 주문 번호를 걸러야 해요</li>
</ol>
<p class="more">참고: <a href="https://kafka.apache.org/41/design/design/#message-delivery-semantics">Apache Kafka 4.1: 외부 시스템과의 협력</a></p>
</section>

<section class="slide">
<h3>이럴 때 써요, 이럴 땐 안 써요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="왼쪽 트랜잭션을 써요 카드에는 결과를 선반에 다시 써요, 겹치면 안 되는 집계예요, 다음 팀도 확정만 읽어요가 있고 오른쪽 안 써도 돼요 카드에는 결과가 바깥 저장소예요, 조금 빠져도 되는 측정값, 주문 번호로 걸러져요가 있는 그림">
<rect class="line" x="6" y="6" width="190" height="238" rx="12"/>
<circle class="kafka" cx="101" cy="40" r="20"/><use class="ic" href="#i-check" x="89" y="28" width="24" height="24"/>
<text class="label center" x="101" y="80">트랜잭션을 써요</text>
<rect class="box" x="20" y="102" width="162" height="34" rx="8"/><text class="chip" x="101" y="119">결과를 선반에 다시 써요</text>
<rect class="box" x="20" y="146" width="162" height="34" rx="8"/><text class="chip" x="101" y="163">겹치면 안 되는 집계예요</text>
<rect class="box" x="20" y="190" width="162" height="34" rx="8"/><text class="chip" x="101" y="207">다음 팀도 확정만 읽어요</text>
<rect class="line" x="204" y="6" width="190" height="238" rx="12"/>
<circle class="bad" cx="299" cy="40" r="20"/><use class="ic" href="#i-x" x="287" y="28" width="24" height="24"/>
<text class="label center" x="299" y="80">안 써도 돼요</text>
<rect class="box" x="218" y="102" width="162" height="34" rx="8"/><text class="chip" x="299" y="119">결과가 바깥 저장소예요</text>
<rect class="box" x="218" y="146" width="162" height="34" rx="8"/><text class="chip" x="299" y="163">조금 빠져도 되는 측정값</text>
<rect class="box" x="218" y="190" width="162" height="34" rx="8"/><text class="chip" x="299" y="207">주문 번호로 걸러져요</text>
</svg>
<ol class="steps">
<li>트랜잭션은 확정을 기다려 더 느려질 수 있어요</li>
<li>바깥 저장소면 최소 한 번에 주문 번호 확인을 더해요</li>
<li>조금 빠져도 되는 실시간 화면은 최대 한 번도 골라요</li>
</ol>
<p class="more">참고: <a href="https://kafka.apache.org/41/design/design/#message-delivery-semantics">Apache Kafka 4.1: 전달 보장과 트랜잭션</a></p>
</section>
</div>

</div>
