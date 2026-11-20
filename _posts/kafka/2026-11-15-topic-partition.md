---
layout: post
title: "선반을 왜 칸으로 나눌까? 택배 물류센터로 이해하는 Kafka 토픽과 파티션"
description: "선반과 칸 비유로 Kafka 토픽과 파티션을 나누는 이유, 키로 메시지를 모으는 방법, 순서 보장 범위와 파티션 증가 시 주의점을 설명합니다."
date: 2026-11-15 13:00:00 +0900
series: kafka
episode: 2
summary: "파티션은 같은 팀이 나눠 읽는 토픽 안의 칸이에요. 같은 키의 소식은 같은 칸에 모이지만 칸 수를 늘리면 새 소식의 목적지가 바뀔 수 있어요."
youtube: KgLt0RLMcHM
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
<p>1편에서 주문 서비스는 물류센터에 소식을 맡기고 재고·알림 서비스는 자기 속도로 꺼내 읽었어요. 소식은 읽어도 남지만 도착하는 양이 처리하는 양보다 많으면 아직 못 읽은 소식이 쌓여요. 이때 담당자만 더 부르면 빨라질까요?</p>
<p>이 글에서는 종류별 선반인 <b>토픽</b>을 칸인 <b>파티션</b>으로 나누는 이유를 살펴봐요. 같은 소식을 묶는 <b>키</b>가 칸을 고르는 데 어떻게 쓰이는지와 순서가 지켜지는 범위도 알아봐요. 칸 수를 늘릴 때 같은 키의 새 소식이 다른 칸으로 갈 수 있다는 주의점도 살펴봐요.</p>
</div>

<div class="slide-group">
<h2 class="slide-group-title">함께 읽기: 담당자에게 나눠 줄 칸이 필요해요</h2>

<section class="slide">
<h3>한 담당자만으로는 주문을 따라잡기 어려워요</h3>
<svg class="dg" viewBox="0 0 400 266" role="img" aria-label="한 담당자가 한 칸에 쌓인 소식을 하나씩 가져다 혼자 읽느라 밀린 주문을 따라잡지 못해요.">
<circle class="box" cx="46" cy="90" r="28"/><use class="ic" href="#i-store" x="28" y="72" width="36" height="36"/><text class="big" x="46" y="138">가게</text><circle class="box" cx="192" cy="90" r="28"/><use class="ic" href="#i-shelving-unit" x="174" y="72" width="36" height="36"/><text class="big" x="192" y="138">주문 선반</text><circle class="bad" cx="344" cy="90" r="28"/><use class="ic" href="#i-user-round" x="326" y="72" width="36" height="36"/><text class="big" x="344" y="138">담당자</text><defs><marker id="tp-1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs><path class="line" d="M76,90 L160,90" marker-end="url(#tp-1)"/><path class="line" d="M324,110 L277,192" marker-end="url(#tp-1)"/><circle class="packet" r="5"><animateMotion dur="1.8s" repeatCount="indefinite" path="M277,192 L324,110"/></circle><rect class="line" x="82" y="158" width="236" height="91" rx="12"/><text class="label center" x="200" y="177">칸이 하나뿐인 주문 선반</text><circle class="box" cx="135" cy="213" r="18"/><use class="ic" href="#i-panel-top" x="122" y="200" width="26" height="26"/><circle class="new" cx="200" cy="213" r="18"/><use class="ic" href="#i-package" x="187" y="200" width="26" height="26"/><circle class="new" cx="265" cy="213" r="18"/><use class="ic" href="#i-package" x="252" y="200" width="26" height="26"/>
</svg>
<p class="point">소식을 받아 두어도 한 담당자가 혼자 읽는 속도에는 한계가 있어요.</p>
<p class="explain">1편에서 본 것처럼 센터는 소식을 선반에 받아 두어요. 선반은 칸 하나로 둘 수도 있고 여러 칸으로 나눌 수도 있는데 이 주문 선반은 아직 한 칸뿐이에요. 그 한 칸을 담당자 한 명이 혼자 읽으면 주문이 몰릴 때 읽지 못한 소식이 계속 쌓여요.</p>
</section>

<section class="slide">
<h3>칸마다 담당자를 나눠 두어요</h3>
<svg class="dg" viewBox="0 0 400 259" role="img" aria-label="주문 선반의 세 칸을 같은 재고 팀의 담당자 세 명이 하나씩 맡는 그림">
<rect class="line" x="8" y="8" width="238" height="237" rx="12"/><text class="label center" x="127" y="27">주문 선반</text><rect class="line" x="262" y="8" width="130" height="237" rx="12"/><text class="label center" x="327" y="27">재고 팀</text><text class="chip" x="45" y="66">칸 0</text><circle class="new" cx="99" cy="66" r="18"/><use class="ic" href="#i-package" x="86" y="53" width="26" height="26"/><circle class="new" cx="155" cy="66" r="18"/><use class="ic" href="#i-package" x="142" y="53" width="26" height="26"/><circle class="box" cx="326" cy="66" r="18"/><use class="ic" href="#i-user-round" x="313" y="53" width="26" height="26"/><defs><marker id="tp-3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs><path class="line" d="M298,66 L185,66" marker-end="url(#tp-3)"/><text class="chip" x="45" y="136">칸 1</text><circle class="new" cx="99" cy="136" r="18"/><use class="ic" href="#i-package" x="86" y="123" width="26" height="26"/><circle class="new" cx="155" cy="136" r="18"/><use class="ic" href="#i-package" x="142" y="123" width="26" height="26"/><circle class="box" cx="326" cy="136" r="18"/><use class="ic" href="#i-user-round" x="313" y="123" width="26" height="26"/><defs><marker id="tp-4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs><path class="line" d="M298,136 L185,136" marker-end="url(#tp-4)"/><text class="chip" x="45" y="206">칸 2</text><circle class="new" cx="99" cy="206" r="18"/><use class="ic" href="#i-package" x="86" y="193" width="26" height="26"/><circle class="new" cx="155" cy="206" r="18"/><use class="ic" href="#i-package" x="142" y="193" width="26" height="26"/><circle class="box" cx="326" cy="206" r="18"/><use class="ic" href="#i-user-round" x="313" y="193" width="26" height="26"/><defs><marker id="tp-5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs><path class="line" d="M298,206 L185,206" marker-end="url(#tp-5)"/>
</svg>
<p class="point">서로 다른 칸을 맡으면 여러 담당자가 함께 꺼내 읽을 수 있어요.</p>
<p class="explain">선반을 세 칸으로 나누면 재고 팀은 담당자마다 읽을 칸을 정해 서로 기다리지 않고 일해요. 한 칸은 팀에서 한 명만 맡고 한 명이 여러 칸을 맡을 수는 있어요. 1편처럼 팀은 칸마다 어디까지 읽었는지 메모를 하나만 적어 두므로 한 칸을 두 명이 읽으면 같은 주문을 둘 다 처리하거나 차례가 헷갈릴 수 있어요.</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>실제로는: 파티션을 나눠 맡아 함께 읽어요</h3>
<svg class="dg" viewBox="0 0 400 230" role="img" aria-label="주문 토픽 안에 파티션 0, 1, 2가 있는 구조">
<rect class="line" x="8" y="8" width="384" height="170" rx="12"/><text class="label center" x="200" y="27">주문 토픽</text><circle class="box" cx="72" cy="79" r="28"/><use class="ic" href="#i-panel-top" x="54" y="61" width="36" height="36"/><text class="big" x="72" y="127">파티션 0</text><circle class="box" cx="200" cy="79" r="28"/><use class="ic" href="#i-panel-top" x="182" y="61" width="36" height="36"/><text class="big" x="200" y="127">파티션 1</text><circle class="box" cx="328" cy="79" r="28"/><use class="ic" href="#i-panel-top" x="310" y="61" width="36" height="36"/><text class="big" x="328" y="127">파티션 2</text><text class="small" x="200" y="207">같은 팀(컨슈머 그룹)이 동시에 나눠 읽는 단위</text>
</svg>
<p class="point">파티션이 부족하면 컨슈머만 늘려도 읽는 속도가 빨라지지 않아요.</p>
<p class="explain">선반 안의 칸인 <b>파티션</b>에는 메시지가 들어온 차례대로 쌓이고 같은 서비스를 켠 프로그램 하나(한 대)가 <b>컨슈머</b> 하나예요. 같은 팀인 <b>컨슈머 그룹</b>은 비유의 팀 메모처럼 파티션마다 다음에 읽을 번호를 하나만 기억하므로 한 파티션을 한 컨슈머에게만 맡겨요. 그래서 파티션이 하나뿐이면 컨슈머를 세 대로 늘려도 실제로 읽는 것은 한 대예요. 한 컨슈머가 여러 파티션을 맡을 수는 있고 메시지 단위로 나누는 예외 방식은 4편에서 살펴봐요.</p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 칸보다 담당자가 많으면 남는 사람은 뭘 하나요?</summary>
<p>A. 맡을 칸이 없어서 쉬어요. 같은 팀에서 한 파티션은 한 컨슈머만 맡으므로 파티션이 3개인데 컨슈머가 4대면 한 대는 읽을 파티션을 받지 못해요.</p>
<p>쉬는 컨슈머는 다른 컨슈머가 멈추거나 파티션이 늘어 배정이 바뀌면 그때 일을 맡을 수 있어요. 배정이 바뀌는 과정은 4편에서 살펴봐요.</p>
</details>
</aside>
</div>

<details class="origin">
<summary>더 알아보기: 왜 여러 칸으로 나누도록 만들었을까?</summary>
<p>1편에서 본 링크드인의 문제는 많은 활동 기록을 여러 시스템에 전하는 것이었어요. Kafka의 공식 설계 문서는 큰 데이터 흐름을 여러 서버에 나눠 담고 여러 컨슈머가 함께 처리할 수 있게 하는 것을 목표로 설명해요.</p>
<p>토픽 전체를 하나의 줄로 묶으면 한 번에 처리하는 양을 늘릴 때 그 줄이 한계가 돼요. 파티션은 줄을 여러 개로 나누고 각 줄 안의 차례를 유지하는 선택이에요.</p>
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
<p class="point">가게가 보내기 전에 같은 동네는 같은 칸으로 정하면 관련 소식이 한 칸에 모여요.</p>
<p class="explain">가게는 소식을 보내기 전에 받는 동네를 보고 넣을 칸을 골라요. 강남 소식을 늘 같은 칸에 넣으면 그 칸의 담당자 한 명이 강남 소식을 들어온 차례대로 이어서 확인할 수 있어요. 동네가 달라도 같은 칸에 모일 수 있고 차례가 지켜지는 범위는 3번 묶음에서 살펴봐요.</p>
</section>

<section class="slide">
<h3>실제로는: 프로듀서가 키로 목적지를 계산해요</h3>
<svg class="dg" viewBox="0 0 400 190" role="img" aria-label="프로듀서가 키의 해시로 파티션 번호를 정하는 그림">
<circle class="box" cx="52" cy="85" r="28"/><use class="ic" href="#i-store" x="34" y="67" width="36" height="36"/><text class="big" x="52" y="133">프로듀서</text><circle class="box" cx="341" cy="85" r="28"/><use class="ic" href="#i-panel-top" x="323" y="67" width="36" height="36"/><text class="big" x="341" y="133">파티션</text><defs><marker id="tp-7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs><path class="line" d="M84,85 L307,85" marker-end="url(#tp-7)"/><text class="chip" x="195" y="57">키 → 해시 → 칸 번호</text><text class="small" x="200" y="161">키와 칸 수가 같으면 목적지도 같아요</text>
</svg>
<p class="point">기본 분배 규칙에서는 칸 수가 그대로인 한 같은 키가 같은 파티션으로 가요.</p>
<p class="explain"><b>키</b>는 비유의 동네처럼 관련 메시지를 묶는 값으로 쇼핑몰에서는 한 주문의 소식을 묶을 때 주문 번호를, 한 고객의 소식을 묶을 때 고객 번호를 자주 써요. <b>해시</b>는 같은 글자를 넣으면 언제나 같은 숫자가 나오는 계산이에요. Kafka 4.1의 공식 프로듀서(Java)는 기본 설정에서 키의 해시를 파티션 수로 나눈 나머지로 보낼 칸을 골라요. 보낼 칸을 직접 정하거나 칸 고르는 규칙을 바꾸거나 키를 무시하도록 설정하면 이 약속은 달라져요.</p>
</section>

<section class="slide">
<h3>동네를 안 적으면 한 묶음은 한 칸으로 보내요</h3>
<svg class="dg" viewBox="0 0 400 236" role="img" aria-label="동네를 적지 않은 소식을 첫 묶음은 칸 0에 모아 보내고 다음 묶음은 다른 칸으로 보내는 그림">
<circle class="new" cx="54" cy="118" r="28"/><use class="ic" href="#i-package" x="36" y="100" width="36" height="36"/><text class="big" x="54" y="166">동네 안 적음</text><rect class="line" x="151" y="8" width="241" height="100" rx="12"/><text class="label center" x="271.5" y="27">첫 묶음 → 칸 0</text><circle class="new" cx="200" cy="70" r="18"/><use class="ic" href="#i-package" x="187" y="57" width="26" height="26"/><circle class="new" cx="269" cy="70" r="18"/><use class="ic" href="#i-package" x="256" y="57" width="26" height="26"/><circle class="new" cx="338" cy="70" r="18"/><use class="ic" href="#i-package" x="325" y="57" width="26" height="26"/><rect class="line" x="151" y="124" width="241" height="100" rx="12"/><text class="label center" x="271.5" y="143">다음 묶음 → 다른 칸</text><circle class="new" cx="200" cy="186" r="18"/><use class="ic" href="#i-package" x="187" y="173" width="26" height="26"/><circle class="new" cx="269" cy="186" r="18"/><use class="ic" href="#i-package" x="256" y="173" width="26" height="26"/><circle class="new" cx="338" cy="186" r="18"/><use class="ic" href="#i-package" x="325" y="173" width="26" height="26"/><defs><marker id="tp-8" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs><path class="line" d="M84,104 L146,66" marker-end="url(#tp-8)"/><path class="line dash" d="M84,132 L146,178" marker-end="url(#tp-8)"/>
</svg>
<p class="point">동네를 안 적은 소식은 한 묶음을 한 칸에 모아 보내고 다음 묶음은 다른 칸으로 보낼 수 있어요.</p>
<p class="explain">가게는 서로 이어 볼 필요가 없는 소식에는 동네를 적지 않을 수 있어요. Kafka에서는 메시지의 키를 비워 두는 것(null)이 이에 해당해요. 키가 없으면 해시로 계산할 값이 없어서 칸을 고르는 방식이 달라져요. 가게가 소식을 하나씩 보내지 않고 묶음으로 보내면 센터까지 오가는 횟수가 줄고 묶음마다 칸을 다시 고르면 여러 칸에 나눠 둘 수 있어요. 칸이 다르면 담당자도 따로 확인하므로 모든 소식을 합친 차례는 정해지지 않아요.</p>
</section>

<section class="slide">
<h3>실제로는: 키를 안 붙인 메시지는 배치 단위로 나뉘어요</h3>
<svg class="dg" viewBox="0 0 400 211" role="img" aria-label="프로듀서가 같은 파티션의 메시지를 배치로 모아 보내는 그림">
<circle class="box" cx="58" cy="86" r="28"/><use class="ic" href="#i-store" x="40" y="68" width="36" height="36"/><text class="big" x="58" y="134">프로듀서</text><rect class="line" x="164" y="8" width="226" height="180" rx="12"/><text class="label center" x="277" y="27">같은 파티션의 배치</text><circle class="new" cx="207" cy="83" r="18"/><use class="ic" href="#i-package" x="194" y="70" width="26" height="26"/><circle class="new" cx="277" cy="83" r="18"/><use class="ic" href="#i-package" x="264" y="70" width="26" height="26"/><circle class="new" cx="347" cy="83" r="18"/><use class="ic" href="#i-package" x="334" y="70" width="26" height="26"/><defs><marker id="tp-9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs><path class="line" d="M90,86 L180,86" marker-end="url(#tp-9)"/>
</svg>
<p class="point">키를 안 붙인 메시지는 배치마다 파티션이 정해져 여러 파티션에 나뉘므로 전체 순서가 정해지지 않아요.</p>
<p class="explain">비유에서 동네를 안 적은 소식은 실제로는 키를 붙이지 않은(null) 메시지예요. <b>배치</b>는 같은 파티션에 보낼 메시지를 모은 묶음이에요. 공식 프로듀서는 키와 파티션 번호를 붙이지 않은 메시지를 한 파티션의 배치로 모으다가 정해진 크기만큼 보내면 파티션을 새로 골라요. 새로 고르는 파티션은 정해진 차례를 따르지 않으므로 바로 다음 칸이라고 기대할 수는 없어요. 칸끼리는 독립적으로 읽으므로 키를 안 붙인 메시지 전체에 하나의 순서를 기대할 수도 없어요.</p>
</section>

<p>참고: <a href="https://kafka.apache.org/41/configuration/producer-configs/#partitioner.class">Kafka 4.1: 키를 붙인 소식과 안 붙인 소식의 분배</a> · <a href="https://github.com/apache/kafka/blob/4.1.0/clients/src/main/java/org/apache/kafka/clients/producer/internals/BuiltInPartitioner.java">Kafka 4.1.0: 키 해시 계산 원본</a></p>

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
<svg class="dg" viewBox="0 0 400 252" role="img" aria-label="강남 소식이 가는 칸에 강남 1, 2, 3이 들어온 차례대로 이어지고 다른 동네 소식도 같은 칸에 올 수 있으며 다른 칸은 따로 읽는 그림">
<rect class="line" x="8" y="8" width="384" height="132" rx="12"/><text class="label center" x="200" y="27">강남 소식이 가는 칸</text><circle class="new" cx="90" cy="68" r="18"/><use class="ic" href="#i-package" x="77" y="55" width="26" height="26"/><text class="chip" x="90" y="106">강남 1</text><circle class="new" cx="200" cy="68" r="18"/><use class="ic" href="#i-package" x="187" y="55" width="26" height="26"/><text class="chip" x="200" y="106">강남 2</text><circle class="new" cx="310" cy="68" r="18"/><use class="ic" href="#i-package" x="297" y="55" width="26" height="26"/><text class="chip" x="310" y="106">강남 3</text><defs><marker id="tp-10" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs><path class="line" d="M113,68 L176,68" marker-end="url(#tp-10)"/><path class="line" d="M223,68 L286,68" marker-end="url(#tp-10)"/><text class="small" x="200" y="129">다른 동네 소식도 이 칸에 함께 쌓일 수 있어요</text><rect class="line" x="8" y="156" width="384" height="80" rx="12"/><text class="label center" x="200" y="175">다른 칸</text><circle class="new" cx="90" cy="207" r="18"/><use class="ic" href="#i-package" x="77" y="194" width="26" height="26"/><text class="small" x="249" y="208">다른 담당자가 따로 확인해요</text>
</svg>
<p class="point">각 칸은 자기 줄의 차례만 지켜요.</p>
<p class="explain">가게가 강남으로 가는 소식 1, 2, 3을 차례로 보냈다고 해 봐요. 셋이 같은 칸에 쌓이면 그 칸의 담당자는 들어온 차례대로 확인할 수 있어요. 다른 칸 담당자가 먼저 일을 마칠 수도 있으므로 모든 칸을 합친 처리 차례까지 정할 수는 없어요.</p>
</section>

<section class="slide">
<h3>실제로는: 오프셋은 파티션 안에서만 순서를 나타내요</h3>
<svg class="dg" viewBox="0 0 400 262" role="img" aria-label="파티션 0에는 용산 소식 둘이 오프셋 0, 1로 파티션 1에는 강남 소식 셋이 오프셋 0, 1, 2로 각각 따로 번호가 붙은 그림">
<rect class="line" x="8" y="8" width="384" height="118" rx="12"/><text class="label center" x="200" y="27">파티션 0</text><circle class="new" cx="90" cy="58" r="18"/><use class="ic" href="#i-package" x="77" y="45" width="26" height="26"/><text class="chip" x="90" y="96">용산 1</text><text class="small" x="90" y="114">오프셋 0</text><circle class="new" cx="200" cy="58" r="18"/><use class="ic" href="#i-package" x="187" y="45" width="26" height="26"/><text class="chip" x="200" y="96">용산 2</text><text class="small" x="200" y="114">오프셋 1</text>
<rect class="line" x="8" y="136" width="384" height="118" rx="12"/><text class="label center" x="200" y="155">파티션 1</text><circle class="new" cx="90" cy="186" r="18"/><use class="ic" href="#i-package" x="77" y="173" width="26" height="26"/><text class="chip" x="90" y="224">강남 1</text><text class="small" x="90" y="242">오프셋 0</text><circle class="new" cx="200" cy="186" r="18"/><use class="ic" href="#i-package" x="187" y="173" width="26" height="26"/><text class="chip" x="200" y="224">강남 2</text><text class="small" x="200" y="242">오프셋 1</text><circle class="new" cx="310" cy="186" r="18"/><use class="ic" href="#i-package" x="297" y="173" width="26" height="26"/><text class="chip" x="310" y="224">강남 3</text><text class="small" x="310" y="242">오프셋 2</text>
</svg>
<p class="point">서로 다른 파티션의 오프셋을 비교해서 전체 순서를 정할 수는 없어요.</p>
<p class="explain">브로커가 파티션 안의 메시지에 붙이는 자리 번호가 <b>오프셋</b>이에요. 그림처럼 두 파티션에 모두 오프셋 1이 있어도 서로 다른 소식이고 쌓인 개수도 달라요. 브로커는 새 메시지를 끝에 붙이고 컨슈머는 그 칸에 저장된 차례로 꺼내 읽어요. 컨슈머가 받은 메시지 여러 개를 동시에 처리하면 업무가 끝나는 순서까지 Kafka가 맞춰 주지는 않아요.</p>
</section>

<p>참고: <a href="https://kafka.apache.org/41/getting-started/introduction/">Kafka 4.1: 같은 키의 메시지와 파티션 안의 순서</a> · <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html">읽은 뒤 병렬 처리할 때 순서 주의</a></p>

</div>

<div class="slide-group">
<h2 class="slide-group-title">칸 수 변경: 새 소식의 목적지가 달라질 수 있어요</h2>

<section class="slide">
<h3>칸을 늘리면 새 소식이 다른 칸으로 가요</h3>
<svg class="dg" viewBox="0 0 400 346" role="img" aria-label="설명용 규칙에서 칸이 하나일 때는 강남 소식 1, 2, 3이 모두 칸 0에 쌓이고, 칸을 둘로 늘리면 옛 소식 1, 2는 칸 0에 남고 새로 온 강남 3만 칸 1로 가는 그림">
<rect class="line" x="8" y="8" width="384" height="104" rx="12"/><text class="label center" x="200" y="27">칸이 1개일 때</text><text class="chip" x="44" y="67">칸 0</text><circle class="new" cx="130" cy="62" r="18"/><use class="ic" href="#i-package" x="117" y="49" width="26" height="26"/><text class="chip" x="130" y="100">강남 1</text><circle class="new" cx="220" cy="62" r="18"/><use class="ic" href="#i-package" x="207" y="49" width="26" height="26"/><text class="chip" x="220" y="100">강남 2</text><circle class="new" cx="310" cy="62" r="18"/><use class="ic" href="#i-package" x="297" y="49" width="26" height="26"/><text class="chip" x="310" y="100">강남 3</text>
<rect class="line" x="8" y="124" width="384" height="198" rx="12"/><text class="label center" x="200" y="143">칸을 2개로 늘린 뒤</text><text class="chip" x="44" y="183">칸 0</text><circle class="new" cx="130" cy="178" r="18"/><use class="ic" href="#i-package" x="117" y="165" width="26" height="26"/><text class="chip" x="130" y="216">강남 1</text><circle class="new" cx="220" cy="178" r="18"/><use class="ic" href="#i-package" x="207" y="165" width="26" height="26"/><text class="chip" x="220" y="216">강남 2</text><text class="small" x="320" y="183">옛 소식은 그대로</text><text class="chip" x="44" y="267">칸 1</text><circle class="bad" cx="130" cy="262" r="18"/><use class="ic" href="#i-package" x="117" y="249" width="26" height="26"/><text class="chip" x="130" y="300">강남 3</text><text class="small" x="320" y="267">새 소식만 여기로</text>
<text class="small" x="200" y="340">설명용 첫 글자 규칙: 칸이 둘이면 ㄱ → 칸 1</text>
</svg>
<p class="point">칸이 늘어도 이미 놓인 소식은 원래 칸에 남아요.</p>
<p class="explain">칸이 하나일 때는 강남 소식이 모두 칸 0에 쌓여요. 칸이 늘어난 것을 알게 된 가게는 그 뒤로 새 칸 수를 보고 칸을 골라요. 그림의 규칙은 두 칸이면 첫 글자가 ㄱ인 동네를 칸 1에 넣는다고 정한 설명용 규칙이에요. 그래서 강남 1, 2는 칸 0에 남고 칸을 늘린 뒤에 온 강남 3만 칸 1로 가요. 강남의 옛 소식과 새 소식을 서로 다른 담당자가 따로 읽게 되므로 한 줄로 이어 확인하던 강남 소식의 차례가 끊겨요.</p>
</section>

<section class="slide">
<h3>실제로는: 파티션 수가 바뀌면 나머지도 달라져요</h3>
<svg class="dg" viewBox="0 0 400 222" role="img" aria-label="설명용 해시값 7을 파티션 수 1로 나누면 나머지 0이라 파티션 0으로, 2로 나누면 나머지 1이라 파티션 1로 가는 그림">
<rect class="line" x="8" y="8" width="384" height="185" rx="12"/><text class="label center" x="200" y="27">설명용 해시 숫자 7</text><text class="chip" x="107" y="67">파티션 1개</text><text class="chip" x="292" y="67">파티션 2개</text><text class="chip" x="107" y="104">7 % 1 = 0</text><text class="chip" x="292" y="104">7 % 2 = 1</text><text class="small" x="200" y="132">%는 나눈 나머지예요</text><text class="small" x="107" y="168">새 메시지 → P0(파티션 0)</text><text class="small" x="292" y="168">새 메시지 → P1(파티션 1)</text><text class="small" x="200" y="212">7은 강남의 실제 해시값이 아닌 설명용 숫자</text>
</svg>
<p class="point">같은 키라도 파티션을 늘린 뒤의 메시지는 다른 파티션으로 갈 수 있어요.</p>
<p class="explain">프로듀서가 센터에서 최신 선반 정보를 받아 와 파티션이 늘어난 것을 알면 그 뒤로는 새 파티션 수로 나머지를 계산해요. 앞의 첫 글자 규칙과 이 7 % 2는 칸 수가 바뀌면 고른 결과도 바뀌는 두 예예요. 브로커는 기존 메시지를 새 파티션으로 옮기지 않으므로 같은 키의 옛 메시지와 새 메시지가 서로 다른 파티션에 남고 다른 컨슈머가 따로 읽을 수 있어요. 따라서 파티션을 늘린 뒤에도 같은 키의 순서가 이어질 것이라고 가정하면 안 돼요.</p>
</section>

<section class="slide" id="pp" hidden>
<h3>직접 해 보기: 선반에 칸을 하나 늘려 봐요</h3>
<div class="pp-body"></div>
<p class="point">위의 움직이는 그림은 첫 글자 ㄱ으로 칸을 고르는 설명용 규칙이며 실제 Kafka의 기본 키 분배는 키의 해시를 칸 수로 나눈 나머지를 써요.</p>
<p class="explain">주문 서비스가 보내는 소식은 버튼을 누르지 않아도 계속 도착해요. 칸을 늘리고 강남·관악의 새 소식이 어디로 가는지 보세요. 「처음처럼 칸 1개로 보기」 버튼은 설명을 되돌리는 기능이며 실제 토픽의 칸 수를 줄이는 기능은 아니에요.</p>
<p class="small">늘리기 전에 들어온 소식은 「옛 소식」으로 남겨 두고 새 소식은 화면에서만 칸마다 최근 4개를 보여 줘요.</p>
</section>
<script src="{{ '/assets/js/partition-playground.js' | relative_url }}?v=4" defer></script>

<div class="slide-with-question">
<section class="slide">
<h3>이럴 땐 조심해요: 늘린 칸은 다시 줄일 수 없어요</h3>
<table>
<thead><tr><th>바꾸려는 것</th><th>Kafka 4.1의 동작</th></tr></thead>
<tbody>
<tr><td>기존 토픽의 파티션 수 감소</td><td>지원하지 않아요</td></tr>
<tr><td>구독 중인 토픽의 파티션 수 증가</td><td>컨슈머가 최신 선반 정보를 받아 새 칸을 알게 되면 팀의 배정을 다시 정해요</td></tr>
</tbody>
</table>
<p class="point">칸 수는 필요한 동시 읽기 수와 이후 변경의 영향을 함께 보고 정해요.</p>
<p class="explain">공식 문서는 줄이지 못하는 이유를 따로 적지 않아요. 다만 칸을 합친다면 두 칸에 따로 매긴 오프셋과 팀마다 적어 둔 읽은 자리를 하나로 다시 맞춰야 하므로 메시지만 옮겨서 끝나는 일이 아니에요. 표의 <b>구독</b>은 컨슈머가 이 토픽을 읽겠다고 신청해 두는 것이며 배정을 다시 정하는 과정은 4편에서 살펴봐요.</p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 칸(파티션)은 처음에 몇 개로 정하나요? 많이 잡으면 손해가 있나요?</summary>
<p>A. 정해진 정답 수는 없어요. 토픽을 만들 때 정하고 따로 정하지 않으면 브로커(Kafka 서버)의 설정인 <code>num.partitions</code>의 기본값인 1개로 만들어져요.</p>
<p>한 팀에서 함께 읽을 수 있는 컨슈머 수는 파티션 수를 넘지 못하므로 앞으로 필요한 동시 읽기 수를 보고 정해요. 예를 들어 재고 서비스를 최대 6대까지 켤 생각이면 6개 이상이 필요해요.</p>
<p>많이 잡으면 손해도 있어요. 브로커는 파티션마다 기록 파일을 따로 두는데 한 컴퓨터가 열어 둘 수 있는 파일 수와 메모리에는 한계가 있어요. 늘린 칸은 다시 줄일 수도 없어요.</p>
<p>참고: <a href="https://kafka.apache.org/41/configuration/broker-configs/#num.partitions">Kafka 4.1: num.partitions 기본값</a> · <a href="https://kafka.apache.org/41/operations/hardware-and-os/">파티션 수와 파일 수</a></p>
</details>
</aside>
</div>

<section class="slide">
<h3>한눈에 다시 보기</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="토픽 안의 파티션을 나눠 읽고 키로 관련 소식을 모으며 칸을 늘리면 목적지가 달라질 수 있어요.">
<circle class="box" cx="30" cy="28" r="18"/><use class="ic" href="#i-shelving-unit" x="17" y="15" width="26" height="26"/><text class="label" x="62" y="19">토픽</text><text class="small" x="62" y="38" style="text-anchor:start">같은 종류의 메시지를 모아 두는 선반</text><circle class="box" cx="30" cy="76" r="18"/><use class="ic" href="#i-panel-top" x="17" y="63" width="26" height="26"/><text class="label" x="62" y="67">파티션</text><text class="small" x="62" y="86" style="text-anchor:start">같은 팀(컨슈머 그룹)이 나눠 맡는 토픽 안의 칸</text><circle class="new" cx="30" cy="124" r="18"/><use class="ic" href="#i-tag" x="17" y="111" width="26" height="26"/><text class="label" x="62" y="115">키</text><text class="small" x="62" y="134" style="text-anchor:start">관련 메시지를 같은 칸으로 보내는 기준</text><circle class="box" cx="30" cy="172" r="18"/><use class="ic" href="#i-notebook-pen" x="17" y="159" width="26" height="26"/><text class="label" x="62" y="163">오프셋</text><text class="small" x="62" y="182" style="text-anchor:start">한 파티션 안에서 메시지에 붙는 자리 번호</text><circle class="bad" cx="30" cy="220" r="18"/><use class="ic" href="#i-panel-top" x="17" y="207" width="26" height="26"/><text class="label" x="62" y="211">파티션 증가</text><text class="small" x="62" y="230" style="text-anchor:start">같은 키의 새 메시지도 목적지가 바뀔 수 있어요</text>
</svg>
<p class="point">파티션은 함께 읽는 범위와 순서의 범위를 나누므로 키와 칸 수를 함께 생각해요.</p>
</section>

<p>참고: <a href="https://kafka.apache.org/41/operations/basic-kafka-operations/#modifying-topics">Kafka 4.1: 파티션 증가와 기존 데이터 및 감소 제한</a> · <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html">새 파티션을 알게 된 뒤 그룹 배정 조정</a></p>

</div>

</div>
