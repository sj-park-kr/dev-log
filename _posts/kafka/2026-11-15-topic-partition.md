---
layout: post
title: "선반을 왜 칸으로 나눌까? 택배 물류센터로 이해하는 Kafka 토픽과 파티션"
description: "선반과 칸 비유로 Kafka 토픽과 파티션을 나누는 이유, 키로 메시지를 모으는 방법, 순서 보장 범위와 파티션 증가 시 주의점을 설명합니다."
date: 2026-11-15 13:00:00 +0900
series: kafka
episode: 2
summary: "파티션은 같은 팀이 나눠 읽는 토픽 안의 칸이에요. 같은 키의 소식은 같은 칸에 모이지만 칸 수를 늘리면 새 소식의 목적지가 바뀔 수 있어요."
---

<div class="lesson lesson-hierarchy">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: https://cdn.jsdelivr.net/npm/lucide-static@1.25.0/icons/ (ISC). 공통 사물은 Kafka 1편과 같은 아이콘이며 칸(panel-top)과 키(tag)를 추가. 라이선스: assets/icons/LICENSE-lucide.txt. -->
<symbol id="i-store" viewBox="0 0 24 24"><path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"/><path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244"/><path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"/></symbol>
<symbol id="i-package" viewBox="0 0 24 24"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/></symbol>
<symbol id="i-user-round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></symbol>
<symbol id="i-shelving-unit" viewBox="0 0 24 24"><path d="M12 12V9a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/><path d="M16 20v-3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/><path d="M20 22V2"/><path d="M4 12h16"/><path d="M4 20h16"/><path d="M4 2v20"/><path d="M4 4h16"/></symbol>
<symbol id="i-notebook-pen" viewBox="0 0 24 24"><path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/></symbol>
<symbol id="i-panel-top" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/></symbol>
<symbol id="i-tag" viewBox="0 0 24 24"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5"/></symbol>
</defs>
</svg>

<div class="intro">
<p class="q">같은 주문 선반을 여러 담당자가 함께 읽으려면 어떻게 나눠야 할까요?</p>
<p>1편에서 주문 서비스는 물류센터에 소식을 맡기고 재고·알림 서비스는 자기 속도로 꺼내 읽었어요. 소식은 읽어도 남지만 도착하는 양이 처리하는 양보다 많으면 아직 못 읽은 기록이 쌓여요. 이때 담당자만 더 부르면 빨라질까요?</p>
<p>이 글에서는 종류별 선반인 <b>토픽</b>을 칸인 <b>파티션</b>으로 나누는 이유를 살펴봐요. 같은 소식을 묶는 <b>키</b>가 칸을 고르는 데 어떻게 쓰이는지와 순서가 지켜지는 범위도 알아봐요. 칸 수를 늘릴 때 같은 키의 새 소식이 다른 칸으로 갈 수 있다는 주의점도 살펴봐요.</p>
</div>

<div class="slide-group">
<h2 class="slide-group-title">함께 읽기: 담당자에게 나눠 줄 칸이 필요해요</h2>

<section class="slide">
<h3>한 담당자만으로는 주문을 따라잡기 어려워요</h3>
<svg class="dg" viewBox="0 0 400 266" role="img" aria-label="한 담당자가 한 칸의 소식을 혼자 읽느라 밀린 주문을 따라잡지 못해요.">
<circle class="box" cx="46" cy="90" r="28"/><use class="ic" href="#i-store" x="28" y="72" width="36" height="36"/><text class="big" x="46" y="138">가게</text><circle class="box" cx="192" cy="90" r="28"/><use class="ic" href="#i-shelving-unit" x="174" y="72" width="36" height="36"/><text class="big" x="192" y="138">주문 선반</text><circle class="bad" cx="344" cy="90" r="28"/><use class="ic" href="#i-user-round" x="326" y="72" width="36" height="36"/><text class="big" x="344" y="138">담당자</text><defs><marker id="tp-1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs><path class="line" d="M76,90 L160,90" marker-end="url(#tp-1)"/><path class="line" d="M312,90 L222,90" marker-end="url(#tp-1)"/><rect class="line" x="82" y="158" width="236" height="91" rx="12"/><text class="label center" x="200" y="177">한 담당자가 맡은 칸</text><circle class="box" cx="135" cy="213" r="18"/><use class="ic" href="#i-panel-top" x="122" y="200" width="26" height="26"/><circle class="new" cx="200" cy="213" r="18"/><use class="ic" href="#i-package" x="187" y="200" width="26" height="26"/><circle class="new" cx="265" cy="213" r="18"/><use class="ic" href="#i-package" x="252" y="200" width="26" height="26"/>
</svg>
<p class="point">소식을 받아 두어도 한 담당자가 혼자 읽는 속도에는 한계가 있어요.</p>
<p class="explain">1편에서 본 것처럼 센터는 소식을 받아 두어요. 그런데 한 선반을 한 담당자만 읽도록 두면 주문이 몰릴 때 혼자서는 따라잡기 어려워요. 같은 팀이 나눠 읽을 수 있도록 선반 안의 일감을 나눌 자리가 필요해요.</p>
</section>

<section class="slide">
<h3>칸마다 담당자를 나눠 두어요</h3>
<svg class="dg" viewBox="0 0 400 259" role="img" aria-label="주문 선반의 세 칸을 같은 재고 팀의 담당자 세 명이 하나씩 맡는 그림">
<rect class="line" x="8" y="8" width="238" height="237" rx="12"/><text class="label center" x="127" y="27">주문 선반</text><rect class="line" x="262" y="8" width="130" height="237" rx="12"/><text class="label center" x="327" y="27">재고 팀</text><text class="chip" x="45" y="66">칸 0</text><circle class="new" cx="99" cy="66" r="18"/><use class="ic" href="#i-package" x="86" y="53" width="26" height="26"/><circle class="new" cx="155" cy="66" r="18"/><use class="ic" href="#i-package" x="142" y="53" width="26" height="26"/><circle class="box" cx="326" cy="66" r="18"/><use class="ic" href="#i-user-round" x="313" y="53" width="26" height="26"/><defs><marker id="tp-3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs><path class="line" d="M298,66 L185,66" marker-end="url(#tp-3)"/><text class="chip" x="45" y="136">칸 1</text><circle class="new" cx="99" cy="136" r="18"/><use class="ic" href="#i-package" x="86" y="123" width="26" height="26"/><circle class="new" cx="155" cy="136" r="18"/><use class="ic" href="#i-package" x="142" y="123" width="26" height="26"/><circle class="box" cx="326" cy="136" r="18"/><use class="ic" href="#i-user-round" x="313" y="123" width="26" height="26"/><defs><marker id="tp-4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs><path class="line" d="M298,136 L185,136" marker-end="url(#tp-4)"/><text class="chip" x="45" y="206">칸 2</text><circle class="new" cx="99" cy="206" r="18"/><use class="ic" href="#i-package" x="86" y="193" width="26" height="26"/><circle class="new" cx="155" cy="206" r="18"/><use class="ic" href="#i-package" x="142" y="193" width="26" height="26"/><circle class="box" cx="326" cy="206" r="18"/><use class="ic" href="#i-user-round" x="313" y="193" width="26" height="26"/><defs><marker id="tp-5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs><path class="line" d="M298,206 L185,206" marker-end="url(#tp-5)"/>
</svg>
<p class="point">서로 다른 칸을 맡으면 여러 담당자가 함께 꺼내 읽을 수 있어요.</p>
<p class="explain">센터는 한 종류의 소식을 여러 칸에 나눠 둬요. 재고 팀은 담당자마다 읽을 칸을 정해 다른 담당자의 확인을 기다리지 않고 일해요. 세 명이 각자 한 칸을 맡으면 한 사람이 전체를 읽을 때보다 함께 처리할 여지가 생겨요.</p>
</section>

<section class="slide">
<h3>실제로는: 파티션을 나눠 맡아 함께 읽어요</h3>
<svg class="dg" viewBox="0 0 400 230" role="img" aria-label="주문 토픽 안에 파티션 0, 1, 2가 있는 구조">
<rect class="line" x="8" y="8" width="384" height="170" rx="12"/><text class="label center" x="200" y="27">주문 토픽</text><circle class="box" cx="72" cy="79" r="28"/><use class="ic" href="#i-panel-top" x="54" y="61" width="36" height="36"/><text class="big" x="72" y="127">파티션 0</text><circle class="box" cx="200" cy="79" r="28"/><use class="ic" href="#i-panel-top" x="182" y="61" width="36" height="36"/><text class="big" x="200" y="127">파티션 1</text><circle class="box" cx="328" cy="79" r="28"/><use class="ic" href="#i-panel-top" x="310" y="61" width="36" height="36"/><text class="big" x="328" y="127">파티션 2</text><text class="small" x="200" y="207">같은 그룹이 동시에 나눠 읽는 단위</text>
</svg>
<p class="point">파티션은 같은 그룹의 컨슈머가 나눠 읽는 단위예요.</p>
<p class="explain">선반 안의 칸인 <b>파티션</b>에는 메시지가 차례로 쌓여요. 일반 컨슈머 그룹에서는 한 파티션을 한 컨슈머만 맡으므로 세 컨슈머가 이 토픽을 동시에 읽으려면 칸도 적어도 세 개가 필요해요. 한 컨슈머가 여러 파티션을 맡을 수도 있으므로 칸 수만큼 서비스를 늘려야 하는 것은 아니에요. 다른 방식의 예외는 4편에서 살펴봐요.</p>
</section>

<details class="origin">
<summary>더 알아보기: 왜 여러 칸으로 나누도록 만들었을까?</summary>
<p>1편에서 본 링크드인의 문제는 많은 활동 기록을 여러 시스템에 전하는 것이었어요. Kafka의 공식 설계 문서는 큰 데이터 흐름을 여러 서버에 나눠 담고 여러 소비자가 함께 처리할 수 있게 하는 것을 목표로 설명해요.</p>
<p>토픽 전체를 하나의 줄로 묶으면 처리량을 늘릴 때 그 줄이 한계가 돼요. 파티션은 줄을 여러 개로 나누고 각 줄 안의 차례를 유지하는 선택이에요.</p>
<p>참고: <a href="https://kafka.apache.org/41/design/design/#motivation">Apache Kafka 4.1: 설계 동기</a></p>
</details>

<p>참고: <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html">Kafka 4.1: 그룹의 파티션 배정</a></p>

</div>

<div class="slide-group">
<h2 class="slide-group-title">칸 고르기: 같은 키의 소식을 한곳에 모아요</h2>

<section class="slide">
<h3>받는 동네가 같으면 같은 칸으로 보내요</h3>
<svg class="dg" viewBox="0 0 400 270" role="img" aria-label="설명용 동네 규칙에서 강남 소식은 칸 1로 용산 소식은 칸 0으로 모여요.">
<rect class="line" x="230" y="8" width="162" height="226" rx="12"/><text class="label center" x="311" y="27">주문 선반</text><circle class="new" cx="52" cy="56" r="18"/><use class="ic" href="#i-package" x="39" y="43" width="26" height="26"/><text class="chip" x="52" y="94">강남</text><circle class="new" cx="52" cy="126" r="18"/><use class="ic" href="#i-package" x="39" y="113" width="26" height="26"/><text class="chip" x="52" y="164">강남</text><circle class="new" cx="52" cy="196" r="18"/><use class="ic" href="#i-package" x="39" y="183" width="26" height="26"/><text class="chip" x="52" y="234">용산</text><text class="chip" x="310" y="63">칸 1</text><text class="chip" x="310" y="180">칸 0</text><defs><marker id="tp-6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs><path class="line" d="M74,56 L265,63" marker-end="url(#tp-6)"/><path class="line" d="M74,126 L265,75" marker-end="url(#tp-6)"/><path class="line" d="M74,196 L265,180" marker-end="url(#tp-6)"/><circle class="packet" r="5"><animateMotion dur="1.8s" begin="0s" repeatCount="indefinite" path="M74,56 L265,63"/></circle><circle class="packet" r="5"><animateMotion dur="1.8s" begin="0.4s" repeatCount="indefinite" path="M74,126 L265,75"/></circle><circle class="packet" r="5"><animateMotion dur="1.8s" begin="0.8s" repeatCount="indefinite" path="M74,196 L265,180"/></circle>
<text class="small" x="200" y="257">설명용 동네 규칙</text>
</svg>
<p class="point">관련된 소식을 한 칸에 모으려면 같은 기준을 붙여 보내요.</p>
<p class="explain">가게는 택배를 맡길 때 받는 동네를 함께 적어요. 센터가 같은 동네를 늘 같은 칸으로 보내기로 했다면 담당자는 그 칸에서 관련 소식을 이어서 확인해요. 동네가 달라도 같은 칸에 모일 수는 있어요.</p>
</section>

<section class="slide">
<h3>실제로는: 프로듀서가 키로 목적지를 계산해요</h3>
<svg class="dg" viewBox="0 0 400 190" role="img" aria-label="프로듀서가 키의 해시로 파티션 번호를 정하는 그림">
<circle class="box" cx="52" cy="85" r="28"/><use class="ic" href="#i-store" x="34" y="67" width="36" height="36"/><text class="big" x="52" y="133">프로듀서</text><circle class="box" cx="341" cy="85" r="28"/><use class="ic" href="#i-panel-top" x="323" y="67" width="36" height="36"/><text class="big" x="341" y="133">파티션</text><defs><marker id="tp-7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs><path class="line" d="M84,85 L307,85" marker-end="url(#tp-7)"/><text class="chip" x="195" y="57">키 → 해시 → 칸 번호</text><text class="small" x="200" y="161">키와 칸 수가 같으면 목적지도 같아요</text>
</svg>
<p class="point">기본 키 분배 규칙에서는 같은 키와 같은 파티션 수가 같은 목적지를 만들어요.</p>
<p class="explain"><b>키</b>는 비유의 동네 이름처럼 관련 소식을 묶는 값이에요. <b>해시</b>는 키를 숫자로 바꾸는 계산이에요. Kafka 4.1 Java 프로듀서는 키를 사용하는 기본 분배에서 그 숫자를 파티션 수로 나눈 나머지로 보낼 칸을 골라요. 같은 키가 같은 칸으로 가는 설명은 칸 수와 키를 다루는 방법이 같고 목적지나 선택 규칙을 따로 지정하지 않은 경우예요.</p>
</section>

<section class="slide">
<h3>동네가 없으면 한 칸에 모아 보내요</h3>
<svg class="dg" viewBox="0 0 400 242" role="img" aria-label="동네 없는 택배를 한 칸에 모아 함께 보내는 그림">
<circle class="new" cx="54" cy="89" r="28"/><use class="ic" href="#i-package" x="36" y="71" width="36" height="36"/><text class="big" x="54" y="137">동네 없음</text><rect class="line" x="151" y="8" width="241" height="176" rx="12"/><text class="label center" x="271.5" y="27">이번에 모아 보낼 칸</text><circle class="new" cx="200" cy="86" r="18"/><use class="ic" href="#i-package" x="187" y="73" width="26" height="26"/><circle class="new" cx="269" cy="86" r="18"/><use class="ic" href="#i-package" x="256" y="73" width="26" height="26"/><circle class="new" cx="338" cy="86" r="18"/><use class="ic" href="#i-package" x="325" y="73" width="26" height="26"/><defs><marker id="tp-8" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs><path class="line" d="M85,89 L172,89" marker-end="url(#tp-8)"/><text class="small" x="200" y="216">한 번에 함께 보내기</text>
</svg>
<p class="point">동네가 없는 소식은 묶어서 여러 칸에 나눠 보내요.</p>
<p class="explain">가게는 서로 이어 볼 필요가 없는 소식에는 동네를 적지 않을 수 있어요. 센터는 이런 택배를 한 번에 보낼 묶음으로 모아 여러 칸에 나눠 둬요. 서로 다른 칸을 맡은 담당자는 각자 확인하므로 모든 소식을 합친 차례는 정해지지 않아요.</p>
</section>

<section class="slide">
<h3>실제로는: 키 없는 소식은 묶음 단위로 나뉘어요</h3>
<svg class="dg" viewBox="0 0 400 211" role="img" aria-label="프로듀서가 같은 파티션의 메시지를 배치로 모아 보내는 그림">
<circle class="box" cx="58" cy="86" r="28"/><use class="ic" href="#i-store" x="40" y="68" width="36" height="36"/><text class="big" x="58" y="134">프로듀서</text><rect class="line" x="164" y="8" width="226" height="180" rx="12"/><text class="label center" x="277" y="27">같은 파티션의 배치</text><circle class="new" cx="207" cy="83" r="18"/><use class="ic" href="#i-package" x="194" y="70" width="26" height="26"/><circle class="new" cx="277" cy="83" r="18"/><use class="ic" href="#i-package" x="264" y="70" width="26" height="26"/><circle class="new" cx="347" cy="83" r="18"/><use class="ic" href="#i-package" x="334" y="70" width="26" height="26"/><defs><marker id="tp-9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs><path class="line" d="M90,86 L180,86" marker-end="url(#tp-9)"/>
</svg>
<p class="point">키가 없는 소식은 여러 파티션에 나뉘므로 전체 순서가 정해지지 않아요.</p>
<p class="explain"><b>배치</b>는 같은 파티션에 보낼 메시지를 모은 묶음이에요. Kafka 4.1 Java 프로듀서는 키와 파티션 번호를 지정하지 않은 기본 전송에서 이런 묶음으로 모아 여러 칸에 나눠 보내요. 칸끼리는 독립적으로 읽으므로 키 없는 소식 전체에 하나의 순서를 기대할 수는 없어요.</p>
</section>

<p>참고: <a href="https://kafka.apache.org/41/configuration/producer-configs/#partitioner.class">Kafka 4.1: 키와 키 없는 소식의 분배</a> · <a href="https://github.com/apache/kafka/blob/4.1.0/clients/src/main/java/org/apache/kafka/clients/producer/internals/BuiltInPartitioner.java">Kafka 4.1.0: 키 해시 계산 원본</a></p>

<section class="slide">
<h3>이럴 땐 조심해요: 한 키로 몰리면 한 칸만 바빠져요</h3>
<table>
<thead><tr><th>키를 고르는 기준</th><th>생길 수 있는 일</th></tr></thead>
<tbody>
<tr><td>모든 소식에 강남 키만 사용</td><td>한 파티션에 몰려서 다른 컨슈머는 여유가 남아요</td></tr>
<tr><td>실제 받는 동네를 키로 사용</td><td>동네별로 모을 수 있지만 강남 주문이 많으면 그 칸은 계속 바빠요</td></tr>
</tbody>
</table>
<p class="point">한 키에 소식이 몰리면 그 키를 맡은 칸의 일이 쏠려요.</p>
<p class="explain">가게가 키를 고를 때는 특정 값에 소식이 지나치게 몰리는지도 살펴봐야 해요. 다른 칸이 비어 있어도 강남 소식의 목적지는 그대로이므로 강남을 맡은 담당자의 부담은 줄지 않아요.</p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">순서의 범위: 차례는 한 칸 안에서 이어져요</h2>

<section class="slide">
<h3>같은 동네의 소식은 한 줄로 이어 읽어요</h3>
<svg class="dg" viewBox="0 0 400 233" role="img" aria-label="한 칸에서 접수, 결제, 배송 소식이 이어지고 다른 칸은 독립적으로 읽는 그림">
<rect class="line" x="8" y="8" width="384" height="108" rx="12"/><text class="label center" x="200" y="27">강남을 맡은 칸</text><circle class="new" cx="90" cy="71" r="18"/><use class="ic" href="#i-package" x="77" y="58" width="26" height="26"/><text class="chip" x="90" y="109">접수</text><circle class="new" cx="200" cy="71" r="18"/><use class="ic" href="#i-package" x="187" y="58" width="26" height="26"/><text class="chip" x="200" y="109">결제</text><circle class="new" cx="310" cy="71" r="18"/><use class="ic" href="#i-package" x="297" y="58" width="26" height="26"/><text class="chip" x="310" y="109">배송</text><defs><marker id="tp-10" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs><path class="line" d="M113,71 L176,71" marker-end="url(#tp-10)"/><path class="line" d="M223,71 L286,71" marker-end="url(#tp-10)"/><rect class="line" x="8" y="136" width="384" height="80" rx="12"/><text class="label center" x="200" y="155">다른 동네를 맡은 칸</text><circle class="new" cx="90" cy="187" r="18"/><use class="ic" href="#i-package" x="77" y="174" width="26" height="26"/><text class="small" x="249" y="188">독립적으로 확인해요</text>
</svg>
<p class="point">각 칸은 자기 줄의 차례만 지켜요.</p>
<p class="explain">가게가 강남으로 가는 소식에 접수 뒤 결제 내용을 차례로 적었다고 해 봐요. 둘을 같은 칸에 쌓으면 담당자가 들어온 차례를 따라 확인할 수 있어요. 다른 칸 담당자가 먼저 일을 마칠 수도 있으므로 모든 칸을 합친 처리 차례까지 정할 수는 없어요.</p>
</section>

<section class="slide">
<h3>실제로는: 오프셋은 파티션 안에서만 순서를 나타내요</h3>
<svg class="dg" viewBox="0 0 400 211" role="img" aria-label="파티션 0과 파티션 1 각각의 메시지에 독립적으로 오프셋 0, 1, 2가 붙은 그림">
<rect class="line" x="8" y="8" width="384" height="181" rx="12"/><text class="label center" x="200" y="27">서로 독립적인 자리 번호</text><text class="chip" x="68" y="65">파티션 0</text><circle class="new" cx="150" cy="65" r="18"/><use class="ic" href="#i-package" x="137" y="52" width="26" height="26"/><text class="chip" x="150" y="103">0</text><circle class="new" cx="236" cy="65" r="18"/><use class="ic" href="#i-package" x="223" y="52" width="26" height="26"/><text class="chip" x="236" y="103">1</text><circle class="new" cx="322" cy="65" r="18"/><use class="ic" href="#i-package" x="309" y="52" width="26" height="26"/><text class="chip" x="322" y="103">2</text><text class="chip" x="68" y="140">파티션 1</text><circle class="new" cx="150" cy="140" r="18"/><use class="ic" href="#i-package" x="137" y="127" width="26" height="26"/><text class="chip" x="150" y="178">0</text><circle class="new" cx="236" cy="140" r="18"/><use class="ic" href="#i-package" x="223" y="127" width="26" height="26"/><text class="chip" x="236" y="178">1</text><circle class="new" cx="322" cy="140" r="18"/><use class="ic" href="#i-package" x="309" y="127" width="26" height="26"/><text class="chip" x="322" y="178">2</text>
</svg>
<p class="point">서로 다른 파티션의 오프셋을 비교해서 전체 순서를 정할 수는 없어요.</p>
<p class="explain">브로커가 파티션 안의 메시지에 붙이는 자리 번호가 <b>오프셋</b>이에요. 브로커는 새 메시지를 끝에 붙이고 컨슈머는 그 칸에 저장된 차례로 꺼내 읽어요. 서비스가 읽은 소식을 동시에 처리한다면 업무가 끝나는 순서까지 Kafka가 맞춰 주지는 않아요.</p>
</section>

<p>참고: <a href="https://kafka.apache.org/41/getting-started/introduction/">Kafka 4.1: 같은 키의 메시지와 파티션 안의 순서</a> · <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html">읽은 뒤 병렬 처리할 때 순서 주의</a></p>

</div>

<div class="slide-group">
<h2 class="slide-group-title">칸 수 변경: 새 소식의 목적지가 달라질 수 있어요</h2>

<section class="slide">
<h3>칸을 늘리면 새 택배가 다른 칸으로 가요</h3>
<svg class="dg" viewBox="0 0 400 244" role="img" aria-label="설명용 규칙에서 강남 택배는 칸이 하나면 칸 0으로 가고 둘이면 새 택배만 칸 1로 가는 그림">
<rect class="line" x="8" y="8" width="184" height="218" rx="12"/><text class="label center" x="100" y="27">칸 1개일 때</text><rect class="line" x="208" y="8" width="184" height="218" rx="12"/><text class="label center" x="300" y="27">칸 2개로 늘리면</text><circle class="new" cx="100" cy="68" r="18"/><use class="ic" href="#i-package" x="87" y="55" width="26" height="26"/><text class="chip" x="100" y="106">강남</text><text class="chip" x="100" y="136">칸 0</text><circle class="new" cx="300" cy="68" r="18"/><use class="ic" href="#i-package" x="287" y="55" width="26" height="26"/><text class="chip" x="300" y="106">강남</text><text class="chip" x="300" y="136">새 소식 → 칸 1</text><text class="small" x="300" y="182">옛 소식은 칸 0</text><text class="small" x="100" y="182">설명용 첫 글자 규칙</text>
</svg>
<p class="point">칸이 늘어도 이미 놓인 소식은 원래 칸에 남아요.</p>
<p class="explain">센터가 칸을 늘리면 이후 택배를 넣는 기준도 달라질 수 있어요. 여기서는 뒤의 「직접 해 보기: 선반에 칸을 하나 늘려 봐요」 슬라이드처럼 두 칸일 때 첫 글자가 ㄱ인 동네를 칸 1로 보내는 설명용 규칙을 써요. 강남의 옛 소식과 새 소식이 갈라지면 담당자 한 명이 한 줄로 이어 확인하던 차례도 끊겨요.</p>
</section>

<section class="slide">
<h3>실제로는: 파티션 수가 바뀌면 나머지도 달라져요</h3>
<svg class="dg" viewBox="0 0 400 212" role="img" aria-label="설명용 해시값 7을 파티션 수 1로 나누면 0, 2로 나누면 1이 남는 그림">
<rect class="line" x="8" y="8" width="384" height="185" rx="12"/><text class="label center" x="200" y="27">설명용 해시 숫자 7</text><text class="chip" x="107" y="67">파티션 1개</text><text class="chip" x="292" y="67">파티션 2개</text><text class="chip" x="107" y="104">7 % 1 = 0</text><text class="chip" x="292" y="104">7 % 2 = 1</text><text class="small" x="107" y="150">새 기록 → P0</text><text class="small" x="292" y="150">새 기록 → P1</text>
</svg>
<p class="point">같은 키라도 파티션을 늘린 뒤의 기록은 다른 칸으로 갈 수 있어요.</p>
<p class="explain">프로듀서가 키로 목적지를 계산할 때는 파티션 수도 사용하므로 새 칸 수를 알게 된 뒤 계산 결과가 달라질 수 있어요. 그림의 7은 원리를 보여 주는 설명용 숫자이며 강남의 실제 해시값은 아니에요. 브로커가 기존 기록을 자동으로 옮기지 않으므로 같은 키의 옛 기록과 새 기록이 다른 칸에 남을 수 있어요. 따라서 파티션 증가 뒤에도 같은 키의 순서가 이어질 것이라고 가정하면 안 돼요.</p>
</section>

<section class="slide" id="pp" hidden>
<h3>직접 해 보기: 선반에 칸을 하나 늘려 봐요</h3>
<div class="pp-body"></div>
<p class="point">위젯은 첫 글자 ㄱ으로 칸을 고르는 설명용 규칙이며 실제 Kafka의 기본 키 분배는 키의 해시를 칸 수로 나눈 나머지를 써요.</p>
<p class="explain">주문 서비스가 보내는 소식은 버튼을 누르지 않아도 계속 도착해요. 칸을 늘리고 강남·관악의 새 소식이 어디로 가는지 보세요. 「처음처럼 칸 1개로 보기」 버튼은 설명을 되돌리는 기능이며 실제 토픽의 칸 수를 줄이는 기능은 아니에요.</p>
<p class="small">늘리기 전 최근 기록은 「옛 소식」으로 남겨 두고 새 소식은 칸마다 최근 4개만 표시해요.</p>
</section>
<script src="{{ '/assets/js/partition-playground.js' | relative_url }}?v=3" defer></script>

<section class="slide">
<h3>이럴 땐 조심해요: 늘린 칸은 다시 줄일 수 없어요</h3>
<table>
<thead><tr><th>바꾸려는 것</th><th>Kafka 4.1의 동작</th></tr></thead>
<tbody>
<tr><td>기존 토픽의 파티션 수 감소</td><td>지원하지 않아요</td></tr>
<tr><td>구독 중인 토픽의 파티션 수 증가</td><td>일반 컨슈머 그룹이 새 칸을 발견하면 배정을 조정해요</td></tr>
</tbody>
</table>
<p class="point">칸 수는 필요한 동시 읽기 수와 이후 변경의 영향을 함께 보고 정해요.</p>
<p class="explain">팀이 칸을 다시 나눠 맡는 조정을 <b>리밸런싱</b>이라고 해요. 파티션을 늘리는 작업은 저장 칸만 추가하는 것이 아니라 현재 읽는 서비스의 배정에도 영향을 줘요.</p>
</section>

<section class="slide">
<h3>한눈에 다시 보기</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="토픽 안의 파티션을 나눠 읽고 키로 관련 소식을 모으며 칸을 늘리면 목적지가 달라질 수 있어요.">
<circle class="box" cx="30" cy="28" r="18"/><use class="ic" href="#i-shelving-unit" x="17" y="15" width="26" height="26"/><text class="label" x="62" y="19">토픽</text><text class="small" x="62" y="38" style="text-anchor:start">같은 종류의 소식을 모아 두는 선반</text><circle class="box" cx="30" cy="76" r="18"/><use class="ic" href="#i-panel-top" x="17" y="63" width="26" height="26"/><text class="label" x="62" y="67">파티션</text><text class="small" x="62" y="86" style="text-anchor:start">같은 그룹이 나눠 맡는 토픽 안의 칸</text><circle class="new" cx="30" cy="124" r="18"/><use class="ic" href="#i-tag" x="17" y="111" width="26" height="26"/><text class="label" x="62" y="115">키</text><text class="small" x="62" y="134" style="text-anchor:start">관련 소식을 같은 칸으로 보내는 기준</text><circle class="box" cx="30" cy="172" r="18"/><use class="ic" href="#i-notebook-pen" x="17" y="159" width="26" height="26"/><text class="label" x="62" y="163">오프셋</text><text class="small" x="62" y="182" style="text-anchor:start">한 파티션 안에서 기록에 붙는 자리 번호</text><circle class="bad" cx="30" cy="220" r="18"/><use class="ic" href="#i-panel-top" x="17" y="207" width="26" height="26"/><text class="label" x="62" y="211">파티션 증가</text><text class="small" x="62" y="230" style="text-anchor:start">같은 키의 새 기록도 목적지가 바뀔 수 있어요</text>
</svg>
<p class="point">파티션은 함께 읽는 범위와 순서의 범위를 나누므로 키와 칸 수를 함께 생각해요.</p>
</section>

<p>참고: <a href="https://kafka.apache.org/41/operations/basic-kafka-operations/#modifying-topics">Kafka 4.1: 파티션 증가와 기존 데이터 및 감소 제한</a> · <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html">새 파티션 발견과 그룹 배정 조정</a></p>

</div>

</div>
