---
layout: post
title: "선반을 왜 칸으로 나눌까? 택배 물류센터로 이해하는 Kafka 토픽과 파티션"
description: "그림으로 보는 Kafka 토픽과 파티션: 선반을 칸으로 나눠야 여럿이 함께 읽는 이유, 키로 칸을 고르는 방법, 순서가 지켜지는 범위, 칸 수를 늘리고 정할 때 조심할 점을 동화책처럼 설명합니다."
date: 2026-11-15 13:00:00 +0900
series: kafka
episode: 2
summary: "파티션은 같은 팀이 나눠 읽는 선반(토픽) 안의 칸이에요. 같은 키의 소식은 같은 칸에 모여 차례가 지켜지지만 칸 수를 늘리면 새 소식이 다른 칸으로 갈 수 있어요."
youtube: KgLt0RLMcHM
---

<div class="lesson lesson-hierarchy storybook">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: https://cdn.jsdelivr.net/npm/lucide-static@1.25.0/icons/ (ISC). 라이선스: assets/icons/LICENSE-lucide.txt. 공통 사물은 Kafka 1편과 같은 아이콘이며 칸(panel-top)과 키(tag)를 추가. i-check=circle-check, i-x=circle-x. -->
<symbol id="i-store" viewBox="0 0 24 24"><path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"/><path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244"/><path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"/></symbol>
<symbol id="i-package" viewBox="0 0 24 24"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/></symbol>
<symbol id="i-user-round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></symbol>
<symbol id="i-server" viewBox="0 0 24 24"><path d="M4 2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM4 14h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2zM6 6h.01M6 18h.01"/></symbol>
<symbol id="i-panel-top" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/></symbol>
<symbol id="i-tag" viewBox="0 0 24 24"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0zM9 12l2 2 4-4"/></symbol>
<symbol id="i-x" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0zM15 9l-6 6M9 9l6 6"/></symbol>
</defs>
</svg>

<div class="slide-group">
<h2 class="slide-group-title">문제: 한 칸은 한 명만 읽어요</h2>

<section class="slide">
<h3>한 칸을 한 명이 읽으면 상자가 쌓여요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="가게(프로듀서)가 한 칸뿐인 주문 선반에 상자를 계속 맡기고 담당자(컨슈머) 한 명이 혼자 꺼내 읽느라 못 읽은 상자가 선반에 계속 쌓이는 그림">
<defs><marker id="tp1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M84,100 L114,100" marker-end="url(#tp1)"/>
<path class="line" d="M286,100 L314,100" marker-end="url(#tp1)"/>
<circle class="box" cx="50" cy="100" r="32"/><use class="ic" href="#i-store" x="28" y="78" width="44" height="44"/>
<text class="big" x="50" y="156">가게</text><text class="small" x="50" y="176">프로듀서</text>
<rect class="line" x="118" y="20" width="164" height="166" rx="12"/>
<text class="label center" x="200" y="40">주문 선반 (한 칸)</text>
<circle class="new" cx="154" cy="84" r="17"/><use class="ic" href="#i-package" x="142" y="72" width="24" height="24"/>
<circle class="new" cx="200" cy="84" r="17"/><use class="ic" href="#i-package" x="188" y="72" width="24" height="24"/>
<circle class="new" cx="246" cy="84" r="17"/><use class="ic" href="#i-package" x="234" y="72" width="24" height="24"/>
<circle class="new" cx="154" cy="128" r="17"/><use class="ic" href="#i-package" x="142" y="116" width="24" height="24"/>
<circle class="new" cx="200" cy="128" r="17"/><use class="ic" href="#i-package" x="188" y="116" width="24" height="24"/>
<circle class="new" cx="246" cy="128" r="17"/><use class="ic" href="#i-package" x="234" y="116" width="24" height="24"/>
<text class="alert" x="200" y="168">계속 쌓여요</text>
<circle class="bad" cx="350" cy="100" r="32"/><use class="ic" href="#i-user-round" x="328" y="78" width="44" height="44"/>
<text class="big" x="350" y="156">담당자</text><text class="small" x="350" y="176">컨슈머</text>
<circle class="packet" r="5"><animateMotion dur="1.2s" repeatCount="indefinite" path="M84,100 L114,100"/></circle>
</svg>
<ol class="steps">
<li>가게(프로듀서)는 쉬지 않고 주문을 맡겨요</li>
<li>담당자(컨슈머) 한 명이 읽는 속도에는 한계가 있어요</li>
<li>맡기는 양이 더 많으면 못 읽은 상자가 쌓여요</li>
</ol>
</section>

<section class="slide">
<h3>담당자를 늘려도 칸이 하나면 한 명만 일해요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="한 칸뿐인 주문 선반을 재고 팀(컨슈머 그룹)의 담당자 세 명이 기다리지만 한 명만 칸을 맡아 읽고 나머지 두 명은 쉬는 그림">
<defs><marker id="tp2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="8" y="40" width="170" height="160" rx="12"/>
<text class="label center" x="93" y="60">주문 선반 (한 칸)</text>
<circle class="new" cx="53" cy="118" r="17"/><use class="ic" href="#i-package" x="41" y="106" width="24" height="24"/>
<circle class="new" cx="93" cy="118" r="17"/><use class="ic" href="#i-package" x="81" y="106" width="24" height="24"/>
<circle class="new" cx="133" cy="118" r="17"/><use class="ic" href="#i-package" x="121" y="106" width="24" height="24"/>
<text class="chip" x="93" y="166">칸 0</text>
<path class="line" d="M180,108 L240,90" marker-end="url(#tp2)"/>
<rect class="line" x="222" y="8" width="170" height="234" rx="12"/>
<text class="label center" x="307" y="28">재고 팀</text><text class="small" x="307" y="46">컨슈머 그룹</text>
<circle class="kafka" cx="268" cy="86" r="24"/><use class="ic" href="#i-user-round" x="252" y="70" width="32" height="32"/><text class="chip" x="302" y="86" style="text-anchor:start">읽어요</text>
<circle class="box" cx="268" cy="148" r="24"/><use class="ic" href="#i-user-round" x="252" y="132" width="32" height="32"/><text class="chip" x="302" y="148" style="text-anchor:start">쉬어요</text>
<circle class="box" cx="268" cy="210" r="24"/><use class="ic" href="#i-user-round" x="252" y="194" width="32" height="32"/><text class="chip" x="302" y="210" style="text-anchor:start">쉬어요</text>
<circle class="packet" r="5"><animateMotion dur="1.6s" repeatCount="indefinite" path="M180,108 L240,90"/></circle>
</svg>
<ol class="steps">
<li>같은 팀(컨슈머 그룹)에서 한 칸은 한 명만 맡아요</li>
<li>팀은 칸마다 읽은 자리(오프셋)를 하나만 적어요</li>
<li>둘이 같이 읽으면 같은 주문을 두 번 처리할 수 있어요</li>
</ol>
</section>

<details class="origin">
<summary>더 알아보기: 왜 여러 칸으로 나누도록 만들었을까?</summary>
<p>1편에서 본 링크드인의 문제는 많은 활동 기록을 여러 시스템에 전하는 것이었어요. Kafka의 공식 설계 문서는 큰 데이터 흐름을 여러 서버에 나눠 담고 여러 컨슈머가 함께 처리할 수 있게 하는 것을 목표로 설명해요.</p>
<p>토픽 전체를 하나의 줄로 묶으면 한 번에 처리하는 양을 늘릴 때 그 줄이 한계가 돼요. 파티션은 줄을 여러 개로 나누고 각 줄 안의 차례를 유지하는 선택이에요.</p>
<p>참고: <a href="https://kafka.apache.org/41/design/design/#motivation">Apache Kafka 4.1: 설계 동기</a></p>
</details>
</div>

<div class="slide-group">
<h2 class="slide-group-title">칸: 선반을 나눠 함께 읽어요</h2>

<section class="slide">
<h3>선반을 칸으로 나누면 여럿이 함께 읽어요</h3>
<svg class="dg" viewBox="0 0 400 270" role="img" aria-label="주문 선반(토픽)을 칸(파티션) 0, 1, 2로 나누고 재고 팀의 담당자 세 명이 칸을 하나씩 맡아 함께 읽는 그림">
<defs><marker id="tp3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="8" y="8" width="238" height="252" rx="12"/>
<text class="label center" x="127" y="28">주문 선반 (토픽)</text>
<rect class="line" x="262" y="8" width="130" height="252" rx="12"/>
<text class="label center" x="327" y="28">재고 팀</text>
<text class="chip" x="45" y="70">칸 0</text>
<circle class="new" cx="99" cy="70" r="18"/><use class="ic" href="#i-package" x="86" y="57" width="26" height="26"/>
<circle class="new" cx="155" cy="70" r="18"/><use class="ic" href="#i-package" x="142" y="57" width="26" height="26"/>
<text class="chip" x="45" y="140">칸 1</text>
<circle class="new" cx="99" cy="140" r="18"/><use class="ic" href="#i-package" x="86" y="127" width="26" height="26"/>
<circle class="new" cx="155" cy="140" r="18"/><use class="ic" href="#i-package" x="142" y="127" width="26" height="26"/>
<text class="chip" x="45" y="210">칸 2</text>
<circle class="new" cx="99" cy="210" r="18"/><use class="ic" href="#i-package" x="86" y="197" width="26" height="26"/>
<circle class="new" cx="155" cy="210" r="18"/><use class="ic" href="#i-package" x="142" y="197" width="26" height="26"/>
<text class="small" x="127" y="246">칸 = 파티션</text>
<circle class="kafka" cx="327" cy="70" r="22"/><use class="ic" href="#i-user-round" x="312" y="55" width="30" height="30"/>
<circle class="kafka" cx="327" cy="140" r="22"/><use class="ic" href="#i-user-round" x="312" y="125" width="30" height="30"/>
<circle class="kafka" cx="327" cy="210" r="22"/><use class="ic" href="#i-user-round" x="312" y="195" width="30" height="30"/>
<path class="line" d="M302,70 L180,70" marker-end="url(#tp3)"/>
<path class="line" d="M302,140 L180,140" marker-end="url(#tp3)"/>
<path class="line" d="M302,210 L180,210" marker-end="url(#tp3)"/>
</svg>
<ol class="steps">
<li>선반(토픽)을 여러 칸(파티션)으로 나눠요</li>
<li>담당자마다 맡은 칸이 달라 서로 기다리지 않아요</li>
<li>한 명이 여러 칸을 맡을 수는 있어요</li>
</ol>
<p class="more">쉬던 담당자는 누가 멈추거나 칸이 늘면 일을 맡아요 · 배정과 메시지 단위로 나누는 방식은 <a href="{{ '/2026/11/15/consumer-group/' | relative_url }}">4편 컨슈머 그룹</a> · 참고: <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html">Kafka 4.1: 그룹의 파티션 배정</a></p>
</section>

<section class="slide">
<h3>칸마다 상자 번호를 따로 매겨요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="칸 0에는 상자 0번과 1번이, 칸 1에는 상자 0번, 1번, 2번이 있다. 두 칸에 모두 1번이 있지만 서로 다른 상자다">
<rect class="line" x="8" y="8" width="384" height="106" rx="12"/>
<text class="label" x="24" y="30">칸 0 (파티션 0)</text>
<circle class="new" cx="110" cy="66" r="18"/><use class="ic" href="#i-package" x="97" y="53" width="26" height="26"/><text class="chip" x="110" y="100">0번</text>
<circle class="kafka" cx="190" cy="66" r="18"/><use class="ic" href="#i-package" x="177" y="53" width="26" height="26"/><text class="chip" x="190" y="100">1번</text>
<rect class="line" x="8" y="124" width="384" height="106" rx="12"/>
<text class="label" x="24" y="146">칸 1 (파티션 1)</text>
<circle class="new" cx="110" cy="182" r="18"/><use class="ic" href="#i-package" x="97" y="169" width="26" height="26"/><text class="chip" x="110" y="216">0번</text>
<circle class="kafka" cx="190" cy="182" r="18"/><use class="ic" href="#i-package" x="177" y="169" width="26" height="26"/><text class="chip" x="190" y="216">1번</text>
<circle class="new" cx="270" cy="182" r="18"/><use class="ic" href="#i-package" x="257" y="169" width="26" height="26"/><text class="chip" x="270" y="216">2번</text>
<text class="small" x="200" y="242">색칠한 두 1번은 서로 다른 상자예요</text>
</svg>
<ol class="steps">
<li>센터(브로커)는 칸 끝에 붙이며 번호(오프셋)를 매겨요</li>
<li>번호는 그 칸 안의 차례만 나타내요</li>
<li>번호로 두 칸 사이의 앞뒤는 정할 수 없어요</li>
</ol>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">칸 고르기: 같은 키는 같은 칸으로 가요</h2>

<section class="slide">
<h3>같은 키의 상자는 늘 같은 칸에 가요</h3>
<svg class="dg" viewBox="0 0 400 260" role="img" aria-label="키가 강남인 상자 둘은 칸 1로, 키가 용산인 상자는 칸 0으로 가는 그림. 어느 키가 어느 칸으로 가는지는 설명용 예시다">
<defs><marker id="tp4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<circle class="new" cx="60" cy="46" r="18"/><use class="ic" href="#i-package" x="47" y="33" width="26" height="26"/><text class="chip" x="60" y="80">키: 강남</text>
<circle class="new" cx="60" cy="126" r="18"/><use class="ic" href="#i-package" x="47" y="113" width="26" height="26"/><text class="chip" x="60" y="160">키: 강남</text>
<circle class="new" cx="60" cy="206" r="18"/><use class="ic" href="#i-package" x="47" y="193" width="26" height="26"/><text class="chip" x="60" y="240">키: 용산</text>
<rect class="line" x="230" y="8" width="162" height="244" rx="12"/>
<text class="label center" x="311" y="28">주문 선반</text>
<rect class="box" x="246" y="50" width="130" height="64" rx="8"/><text class="chip" x="311" y="82">칸 1</text>
<rect class="box" x="246" y="150" width="130" height="64" rx="8"/><text class="chip" x="311" y="182">칸 0</text>
<text class="small" x="311" y="236">설명용 예시</text>
<path class="line" d="M80,46 L242,74" marker-end="url(#tp4)"/>
<path class="line" d="M80,126 L242,94" marker-end="url(#tp4)"/>
<path class="line" d="M80,206 L242,182" marker-end="url(#tp4)"/>
<circle class="packet" r="5"><animateMotion dur="1.8s" begin="0s" repeatCount="indefinite" path="M80,46 L242,74"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.8s" begin="0.4s" repeatCount="indefinite" path="M80,126 L242,94"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.8s" begin="0.8s" repeatCount="indefinite" path="M80,206 L242,182"/></circle>
</svg>
<ol class="steps">
<li>가게는 보내기 전에 키를 보고 칸을 골라요</li>
<li>키는 주문 번호나 고객 번호처럼 소식을 묶는 값이에요</li>
<li>같은 키는 한 담당자가 들어온 차례대로 읽어요</li>
</ol>
</section>

<section class="slide">
<h3>키를 계산한 숫자로 칸 번호를 정해요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="키 강남을 해시로 계산하면 7이 나오고 7을 칸 수 3으로 나눈 나머지 1이 칸 번호가 되어 칸 1(파티션 1)로 가는 그림. 7과 칸 3개는 설명용 예시다">
<defs><marker id="tp5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<circle class="new" cx="40" cy="80" r="28"/><use class="ic" href="#i-tag" x="22" y="62" width="36" height="36"/>
<text class="big" x="40" y="130">키</text><text class="small" x="40" y="150">강남</text>
<path class="line" d="M70,80 L100,80" marker-end="url(#tp5)"/>
<rect class="box" x="104" y="58" width="80" height="44" rx="8"/><text class="chip" x="144" y="80">해시 = 7</text>
<path class="line" d="M186,80 L212,80" marker-end="url(#tp5)"/>
<rect class="box" x="216" y="58" width="88" height="44" rx="8"/><text class="chip mono" x="260" y="80">7 % 3 = 1</text>
<path class="line" d="M306,80 L328,80" marker-end="url(#tp5)"/>
<circle class="kafka" cx="360" cy="80" r="28"/><use class="ic" href="#i-panel-top" x="342" y="62" width="36" height="36"/>
<text class="big" x="360" y="130">칸 1</text><text class="small" x="360" y="150">파티션 1</text>
<text class="small" x="200" y="186">%는 나눈 나머지 · 7과 칸 3개는 예시</text>
</svg>
<ol class="steps">
<li>해시는 같은 키를 넣으면 늘 같은 숫자를 내요</li>
<li>그 숫자를 칸 수로 나눈 나머지가 칸 번호예요 (Kafka 4.1 Java 기본)</li>
<li>키가 달라도 나머지가 같으면 같은 칸에 모여요</li>
</ol>
<p class="more">칸을 직접 정하거나 분배 규칙을 바꾸거나 키를 무시하게 설정하면 달라져요 · 참고: <a href="https://kafka.apache.org/41/configuration/producer-configs/#partitioner.class">Kafka 4.1: 키를 붙인 소식과 안 붙인 소식의 분배</a> · <a href="https://github.com/apache/kafka/blob/4.1.0/clients/src/main/java/org/apache/kafka/clients/producer/internals/BuiltInPartitioner.java">키 해시 계산 원본</a></p>
</section>

<section class="slide">
<h3>키가 없으면 묶음마다 칸을 새로 골라요</h3>
<svg class="dg" viewBox="0 0 400 236" role="img" aria-label="키를 붙이지 않은 상자를 첫 묶음은 칸 0에 모아 보내고 다음 묶음은 다른 칸으로 보내는 그림">
<defs><marker id="tp6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<circle class="new" cx="54" cy="118" r="28"/><use class="ic" href="#i-package" x="36" y="100" width="36" height="36"/>
<text class="big" x="54" y="166">키 없음</text><text class="small" x="54" y="186">null</text>
<rect class="line" x="151" y="8" width="241" height="100" rx="12"/>
<text class="label center" x="271" y="27">첫 묶음 → 칸 0</text>
<circle class="new" cx="200" cy="70" r="18"/><use class="ic" href="#i-package" x="187" y="57" width="26" height="26"/>
<circle class="new" cx="269" cy="70" r="18"/><use class="ic" href="#i-package" x="256" y="57" width="26" height="26"/>
<circle class="new" cx="338" cy="70" r="18"/><use class="ic" href="#i-package" x="325" y="57" width="26" height="26"/>
<rect class="line" x="151" y="124" width="241" height="100" rx="12"/>
<text class="label center" x="271" y="143">다음 묶음 → 다른 칸</text>
<circle class="new" cx="200" cy="186" r="18"/><use class="ic" href="#i-package" x="187" y="173" width="26" height="26"/>
<circle class="new" cx="269" cy="186" r="18"/><use class="ic" href="#i-package" x="256" y="173" width="26" height="26"/>
<circle class="new" cx="338" cy="186" r="18"/><use class="ic" href="#i-package" x="325" y="173" width="26" height="26"/>
<path class="line" d="M84,104 L146,66" marker-end="url(#tp6)"/>
<path class="line dash" d="M84,132 L146,178" marker-end="url(#tp6)"/>
</svg>
<ol class="steps">
<li>키가 없는(null) 상자는 한 묶음(배치)씩 한 칸에 모여요</li>
<li>정해진 크기만큼 보내면 칸을 새로 골라요</li>
<li>새 칸은 정해진 차례가 없어 바로 옆 칸이 아닐 수 있어요</li>
</ol>
<p class="more">묶어 보내면 센터까지 오가는 횟수가 줄어요 (<a href="{{ '/2026/11/15/producer/' | relative_url }}">3편 프로듀서</a>) · 참고: <a href="https://kafka.apache.org/41/configuration/producer-configs/#partitioner.class">Kafka 4.1: 키를 붙이지 않은 소식의 분배</a></p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">순서: 차례는 한 칸 안에서만 지켜져요</h2>

<section class="slide">
<h3>키가 같으면 한 줄로 이어지고 없으면 흩어져요</h3>
<svg class="dg" viewBox="0 0 400 230" role="img" aria-label="같은 상자 1, 2, 3, 4를 두 방식으로 나란히 비교한 그림. 왼쪽 키가 같으면 네 상자가 모두 칸 0에 차례대로 이어진다. 오른쪽 키가 없으면 1과 2는 칸 0에, 3과 4는 칸 1에 나뉘어 칸끼리의 전체 차례를 알 수 없다">
<rect class="line" x="6" y="6" width="190" height="218" rx="12"/>
<text class="label center" x="101" y="28">키가 같아요</text><text class="small" x="101" y="46">모두 강남</text>
<rect class="line dash" x="16" y="64" width="172" height="44" rx="8"/><text class="chip" x="38" y="86">칸 0</text>
<rect class="line dash" x="16" y="120" width="172" height="44" rx="8"/><text class="chip" x="38" y="142">칸 1</text>
<circle class="kafka" cx="74" cy="86" r="13"/><text class="chip" x="74" y="86">1</text>
<circle class="kafka" cx="104" cy="86" r="13"/><text class="chip" x="104" y="86">2</text>
<circle class="kafka" cx="134" cy="86" r="13"/><text class="chip" x="134" y="86">3</text>
<circle class="kafka" cx="164" cy="86" r="13"/><text class="chip" x="164" y="86">4</text>
<text class="chip" x="101" y="196">차례대로 이어져요</text>
<rect class="line" x="204" y="6" width="190" height="218" rx="12"/>
<text class="label center" x="299" y="28">키가 없어요</text><text class="small" x="299" y="46">null</text>
<rect class="line dash" x="214" y="64" width="172" height="44" rx="8"/><text class="chip" x="236" y="86">칸 0</text>
<rect class="line dash" x="214" y="120" width="172" height="44" rx="8"/><text class="chip" x="236" y="142">칸 1</text>
<circle class="kafka" cx="272" cy="86" r="13"/><text class="chip" x="272" y="86">1</text>
<circle class="kafka" cx="302" cy="86" r="13"/><text class="chip" x="302" y="86">2</text>
<circle class="kafka" cx="332" cy="142" r="13"/><text class="chip" x="332" y="142">3</text>
<circle class="kafka" cx="362" cy="142" r="13"/><text class="chip" x="362" y="142">4</text>
<text class="alert" x="299" y="196">전체 차례는 몰라요</text>
</svg>
<ol class="steps">
<li>같은 키는 한 칸에 모여 차례대로 읽혀요</li>
<li>키가 없으면 여러 칸에 흩어져요</li>
<li>칸끼리는 따로 읽어서 전체 차례는 정해지지 않아요</li>
</ol>
<p class="more">참고: <a href="https://kafka.apache.org/41/getting-started/introduction/">Kafka 4.1: 같은 키의 메시지와 파티션 안의 순서</a></p>
</section>

<section class="slide">
<h3>받은 뒤 동시에 처리하면 끝나는 순서가 섞여요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="담당자가 칸 0에서 상자 0, 1, 2를 차례대로 받았지만 셋을 동시에 처리하자 1번이 가장 먼저 끝나는 시간 막대 그림. 시간은 설명용 예시다">
<defs><marker id="tp7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="8" y="8" width="160" height="104" rx="12"/>
<text class="label center" x="88" y="28">칸 0</text>
<circle class="new" cx="48" cy="70" r="15"/><text class="chip" x="48" y="70">0</text>
<circle class="new" cx="88" cy="70" r="15"/><text class="chip" x="88" y="70">1</text>
<circle class="new" cx="128" cy="70" r="15"/><text class="chip" x="128" y="70">2</text>
<path class="line" d="M172,60 L202,60" marker-end="url(#tp7)"/>
<circle class="box" cx="236" cy="60" r="28"/><use class="ic" href="#i-user-round" x="216" y="40" width="40" height="40"/>
<text class="big" x="236" y="106">담당자</text>
<rect class="line" x="8" y="134" width="384" height="106" rx="12"/>
<text class="label" x="20" y="152">동시에 처리</text><text class="small" x="356" y="152">시간 →</text>
<text class="chip" x="36" y="171">0번</text><rect class="box" x="60" y="162" width="200" height="18" rx="4"/>
<text class="chip" x="36" y="197">1번</text><rect class="kafka" x="60" y="188" width="80" height="18" rx="4"/><text class="chip" x="150" y="197" style="text-anchor:start">← 먼저 끝나요</text>
<text class="chip" x="36" y="223">2번</text><rect class="box" x="60" y="214" width="240" height="18" rx="4"/>
<circle class="packet" r="5"><animateMotion dur="1.6s" repeatCount="indefinite" path="M172,60 L202,60"/></circle>
</svg>
<ol class="steps">
<li>담당자는 칸에 쌓인 차례대로 받아요</li>
<li>받은 상자를 동시에 처리하면 먼저 끝나는 게 달라요 (시간은 예시)</li>
<li>끝나는 순서까지 Kafka가 맞춰 주지는 않아요</li>
</ol>
<p class="more">참고: <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html">Kafka 4.1: 읽은 뒤 병렬 처리할 때 순서 주의</a></p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">판단: 칸 수를 정할 때 무엇을 조심해요?</h2>

<section class="slide">
<h3>칸을 늘리면 같은 키도 다른 칸으로 가요</h3>
<svg class="dg" viewBox="0 0 400 346" role="img" aria-label="위아래로 나란히 비교한 그림. 위 칸이 1개일 때는 해시 7을 1로 나눈 나머지가 0이라 강남 상자 1, 2, 3이 모두 칸 0에 쌓인다. 아래 칸을 2개로 늘린 뒤에는 나머지가 1이 되어 옛 상자 1, 2는 칸 0에 그대로 남고 새로 온 강남 3만 칸 1로 간다. 7은 설명용 숫자다">
<rect class="line" x="8" y="8" width="384" height="104" rx="12"/>
<text class="label center" x="200" y="27">칸 1개: 7 % 1 = 0 → 칸 0</text>
<text class="chip" x="44" y="67">칸 0</text>
<circle class="new" cx="130" cy="62" r="18"/><use class="ic" href="#i-package" x="117" y="49" width="26" height="26"/><text class="chip" x="130" y="98">강남 1</text>
<circle class="new" cx="220" cy="62" r="18"/><use class="ic" href="#i-package" x="207" y="49" width="26" height="26"/><text class="chip" x="220" y="98">강남 2</text>
<circle class="new" cx="310" cy="62" r="18"/><use class="ic" href="#i-package" x="297" y="49" width="26" height="26"/><text class="chip" x="310" y="98">강남 3</text>
<rect class="line" x="8" y="124" width="384" height="198" rx="12"/>
<text class="label center" x="200" y="143">칸 2개: 7 % 2 = 1 → 칸 1</text>
<text class="chip" x="44" y="183">칸 0</text>
<circle class="new" cx="130" cy="178" r="18"/><use class="ic" href="#i-package" x="117" y="165" width="26" height="26"/><text class="chip" x="130" y="214">강남 1</text>
<circle class="new" cx="220" cy="178" r="18"/><use class="ic" href="#i-package" x="207" y="165" width="26" height="26"/><text class="chip" x="220" y="214">강남 2</text>
<text class="chip" x="330" y="183">옮기지 않아요</text>
<text class="chip" x="44" y="267">칸 1</text>
<circle class="bad" cx="310" cy="262" r="18"/><use class="ic" href="#i-package" x="297" y="249" width="26" height="26"/><text class="chip" x="310" y="298">강남 3</text>
<text class="chip" x="160" y="267">새 상자만 여기로 →</text>
<text class="small" x="200" y="338">7은 강남 키의 해시를 대신한 설명용 숫자</text>
</svg>
<ol class="steps">
<li>이미 놓인 상자는 원래 칸에 그대로 남아요</li>
<li>가게는 칸이 는 것을 알면 새 칸 수로 계산해요</li>
<li>옛 상자와 새 상자를 다른 담당자가 읽어 차례가 끊겨요</li>
</ol>
<p class="more">참고: <a href="https://kafka.apache.org/41/operations/basic-kafka-operations/#modifying-topics">Kafka 4.1: 파티션 증가와 기존 데이터</a></p>
</section>

<section class="slide">
<h3>늘린 칸은 다시 줄일 수 없어요</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="왼쪽 칸 늘리기 카드는 2칸에서 3칸으로 늘릴 수 있고 오른쪽 칸 줄이기 카드는 3칸에서 2칸으로 줄이는 것을 지원하지 않는 그림">
<defs><marker id="tp8" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="6" y="6" width="190" height="198" rx="12"/>
<circle class="kafka" cx="101" cy="40" r="20"/><use class="ic" href="#i-check" x="89" y="28" width="24" height="24"/>
<text class="label center" x="101" y="80">칸 늘리기</text>
<rect class="box" x="26" y="110" width="60" height="40" rx="8"/><text class="chip" x="56" y="130">2칸</text>
<path class="line" d="M90,130 L112,130" marker-end="url(#tp8)"/>
<rect class="kafka" x="116" y="110" width="60" height="40" rx="8"/><text class="chip" x="146" y="130">3칸</text>
<text class="chip" x="101" y="178">돼요</text>
<rect class="line" x="204" y="6" width="190" height="198" rx="12"/>
<circle class="bad" cx="299" cy="40" r="20"/><use class="ic" href="#i-x" x="287" y="28" width="24" height="24"/>
<text class="label center" x="299" y="80">칸 줄이기</text>
<rect class="box" x="224" y="110" width="60" height="40" rx="8"/><text class="chip" x="254" y="130">3칸</text>
<path class="line dash" d="M288,130 L310,130" marker-end="url(#tp8)"/>
<rect class="bad" x="314" y="110" width="60" height="40" rx="8"/><text class="chip" x="344" y="130">2칸</text>
<text class="alert" x="299" y="178">지원하지 않아요</text>
</svg>
<ol class="steps">
<li>기존 토픽의 칸 수는 줄일 수 없어요 (Kafka 4.1)</li>
<li>칸이 늘면 컨슈머가 새 칸을 알고 배정을 다시 정해요</li>
<li>따로 정하지 않으면 1칸으로 만들어요 (num.partitions=1)</li>
</ol>
<p class="more">배정을 다시 정하는 과정은 <a href="{{ '/2026/11/15/consumer-group/' | relative_url }}">4편 컨슈머 그룹</a>에서 봐요 · 참고: <a href="https://kafka.apache.org/41/operations/basic-kafka-operations/#modifying-topics">파티션 감소 제한</a> · <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html">새 파티션과 그룹 배정</a> · <a href="https://kafka.apache.org/41/configuration/broker-configs/#num.partitions">num.partitions 기본값</a></p>
</section>

<section class="slide">
<h3>칸을 나눌 때는 세 가지를 조심해요</h3>
<svg class="dg" viewBox="0 0 400 170" role="img" aria-label="조심할 점 세 가지 그림. 쏠림은 한 키에 몰려 한 칸만 바쁜 것, 적은 칸은 칸보다 많은 담당자가 쉬는 것, 많은 칸은 서버의 파일이 늘어나는 것이다">
<circle class="bad" cx="70" cy="64" r="40"/><use class="ic" href="#i-tag" x="46" y="40" width="48" height="48"/>
<text class="big" x="70" y="130">쏠림</text><text class="small" x="70" y="152">한 칸만 바빠요</text>
<circle class="box" cx="200" cy="64" r="40"/><use class="ic" href="#i-user-round" x="176" y="40" width="48" height="48"/>
<text class="big" x="200" y="130">적은 칸</text><text class="small" x="200" y="152">담당자가 쉬어요</text>
<circle class="box" cx="330" cy="64" r="40"/><use class="ic" href="#i-server" x="306" y="40" width="48" height="48"/>
<text class="big" x="330" y="130">많은 칸</text><text class="small" x="330" y="152">파일이 늘어요</text>
</svg>
<ol class="steps">
<li>한 키에 몰리면 다른 칸이 비어도 그 칸만 바빠요</li>
<li>담당자를 6명까지 쓰려면 칸도 6개 이상 필요해요 (예시)</li>
<li>칸마다 기록 파일을 따로 둬서 파일 수와 메모리가 늘어요</li>
</ol>
<p class="more">참고: <a href="https://kafka.apache.org/41/operations/hardware-and-os/">Kafka 4.1: 파티션 수와 파일 수</a></p>
</section>
</div>

</div>
