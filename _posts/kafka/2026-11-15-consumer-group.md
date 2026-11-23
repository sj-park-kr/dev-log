---
layout: post
title: "컨슈머와 컨슈머 그룹은 왜 필요할까? 배송 팀으로 이해하는 Kafka 컨슈머"
description: "물류센터 담당 팀의 비유로 Kafka 컨슈머 그룹의 파티션 배정·리밸런싱·오프셋 커밋과 처리 시점의 주의점을 설명합니다."
date: 2026-11-15 14:00:00 +0900
series: kafka
episode: 4
summary: "같은 팀은 칸을 나눠 맡고 다른 팀은 따로 읽어요. 팀원이 바뀌면 담당을 다시 나누고 커밋한 위치에서 이어 가요."
youtube: g97ZCCTyKf0
---

<div class="lesson lesson-hierarchy storybook">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: https://cdn.jsdelivr.net/npm/lucide-static@1.25.0/icons/ (ISC). 라이선스: assets/icons/LICENSE-lucide.txt. 공통 사물은 Kafka 1~3편과 같은 아이콘이며 장부(notebook-pen), 시계(timer), 사무실(clipboard-list)을 추가. -->
<symbol id="i-warehouse" viewBox="0 0 24 24"><path d="M18 21V10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v11"/><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 1.132-1.803l7.95-3.974a2 2 0 0 1 1.837 0l7.948 3.974A2 2 0 0 1 22 8z"/><path d="M6 13h12"/><path d="M6 17h12"/></symbol>
<symbol id="i-package" viewBox="0 0 24 24"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/></symbol>
<symbol id="i-user-round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></symbol>
<symbol id="i-notebook-pen" viewBox="0 0 24 24"><path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/></symbol>
<symbol id="i-clipboard-list" viewBox="0 0 24 24"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></symbol>
<symbol id="i-timer" viewBox="0 0 24 24"><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></symbol>
</defs>
</svg>

<div class="slide-group">
<h2 class="slide-group-title">문제: 혼자 읽으면 밀리고 멈춰요</h2>

<section class="slide">
<h3>한 명이 세 칸을 모두 맡으면 일이 밀려요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="주문 선반(토픽)의 칸 0, 칸 1, 칸 2에 상자가 쌓여 있고 담당자(컨슈머) 한 명이 세 칸을 모두 돌아가며 읽느라 바쁜 그림">
<defs><marker id="cg1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="8" y="8" width="222" height="234" rx="12"/>
<text class="label center" x="119" y="28">주문 선반 (토픽)</text>
<text class="chip" x="40" y="72">칸 0</text>
<circle class="new" cx="96" cy="72" r="18"/><use class="ic" href="#i-package" x="83" y="59" width="26" height="26"/>
<circle class="new" cx="146" cy="72" r="18"/><use class="ic" href="#i-package" x="133" y="59" width="26" height="26"/>
<circle class="new" cx="196" cy="72" r="18"/><use class="ic" href="#i-package" x="183" y="59" width="26" height="26"/>
<text class="chip" x="40" y="138">칸 1</text>
<circle class="new" cx="96" cy="138" r="18"/><use class="ic" href="#i-package" x="83" y="125" width="26" height="26"/>
<circle class="new" cx="146" cy="138" r="18"/><use class="ic" href="#i-package" x="133" y="125" width="26" height="26"/>
<circle class="new" cx="196" cy="138" r="18"/><use class="ic" href="#i-package" x="183" y="125" width="26" height="26"/>
<text class="chip" x="40" y="204">칸 2</text>
<circle class="new" cx="96" cy="204" r="18"/><use class="ic" href="#i-package" x="83" y="191" width="26" height="26"/>
<circle class="new" cx="146" cy="204" r="18"/><use class="ic" href="#i-package" x="133" y="191" width="26" height="26"/>
<circle class="new" cx="196" cy="204" r="18"/><use class="ic" href="#i-package" x="183" y="191" width="26" height="26"/>
<path class="line" d="M294,112 L222,78" marker-end="url(#cg1)"/>
<path class="line" d="M292,130 L222,138" marker-end="url(#cg1)"/>
<path class="line" d="M294,148 L222,198" marker-end="url(#cg1)"/>
<circle class="bad" cx="330" cy="130" r="36"/><use class="ic" href="#i-user-round" x="306" y="106" width="48" height="48"/>
<text class="big" x="330" y="194">담당자</text><text class="small" x="330" y="214">컨슈머</text>
</svg>
<ol class="steps">
<li>담당자(컨슈머) 한 명이 세 칸(파티션)을 돌며 읽어요</li>
<li>주문 처리가 느리면 다음 상자를 늦게 봐요</li>
<li>일을 나눠 맡을 사람이 더 필요해요</li>
</ol>
<p class="more">칸(파티션)이 무엇인지는 <a href="{{ '/2026/11/15/topic-partition/' | relative_url }}">2편</a>에서 봐요</p>
</section>

<section class="slide">
<h3>담당자가 멈추면 그 칸은 아무도 안 읽어요</h3>
<svg class="dg" viewBox="0 0 400 270" role="img" aria-label="재고 팀의 담당 1, 2, 3이 칸 0, 1, 2를 하나씩 읽다가 칸 1을 맡은 담당 2가 멈춰 칸 1에만 상자가 많이 쌓이는 그림">
<defs><marker id="cg2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="8" y="8" width="222" height="254" rx="12"/>
<text class="label center" x="119" y="28">주문 선반 (토픽)</text>
<text class="chip" x="40" y="72">칸 0</text>
<circle class="new" cx="96" cy="72" r="18"/><use class="ic" href="#i-package" x="83" y="59" width="26" height="26"/>
<text class="chip" x="40" y="138">칸 1</text>
<circle class="bad" cx="90" cy="122" r="14"/><use class="ic" href="#i-package" x="80" y="112" width="20" height="20"/>
<circle class="bad" cx="126" cy="122" r="14"/><use class="ic" href="#i-package" x="116" y="112" width="20" height="20"/>
<circle class="bad" cx="162" cy="122" r="14"/><use class="ic" href="#i-package" x="152" y="112" width="20" height="20"/>
<circle class="bad" cx="198" cy="122" r="14"/><use class="ic" href="#i-package" x="188" y="112" width="20" height="20"/>
<circle class="bad" cx="90" cy="154" r="14"/><use class="ic" href="#i-package" x="80" y="144" width="20" height="20"/>
<circle class="bad" cx="126" cy="154" r="14"/><use class="ic" href="#i-package" x="116" y="144" width="20" height="20"/>
<circle class="bad" cx="162" cy="154" r="14"/><use class="ic" href="#i-package" x="152" y="144" width="20" height="20"/>
<circle class="bad" cx="198" cy="154" r="14"/><use class="ic" href="#i-package" x="188" y="144" width="20" height="20"/>
<text class="chip" x="40" y="204">칸 2</text>
<circle class="new" cx="96" cy="204" r="18"/><use class="ic" href="#i-package" x="83" y="191" width="26" height="26"/>
<text class="alert" x="119" y="248">칸 1이 쌓여요</text>
<rect class="line" x="244" y="8" width="148" height="254" rx="12"/>
<text class="label center" x="318" y="28">재고 팀</text>
<path class="line" d="M270,72 L126,72" marker-end="url(#cg2)"/>
<path class="line dash" d="M270,138 L224,138"/>
<path class="line" d="M270,204 L126,204" marker-end="url(#cg2)"/>
<circle class="kafka" cx="292" cy="72" r="22"/><use class="ic" href="#i-user-round" x="277" y="57" width="30" height="30"/><text class="chip" x="322" y="72" style="text-anchor:start">담당 1</text>
<circle class="bad blink" cx="292" cy="138" r="22"/><use class="ic" href="#i-user-round" x="277" y="123" width="30" height="30"/><text class="alert" x="322" y="138" style="text-anchor:start">멈춤</text>
<circle class="kafka" cx="292" cy="204" r="22"/><use class="ic" href="#i-user-round" x="277" y="189" width="30" height="30"/><text class="chip" x="322" y="204" style="text-anchor:start">담당 3</text>
</svg>
<ol class="steps">
<li>팀(컨슈머 그룹) 안에서 칸 1은 담당 2만 맡아요</li>
<li>다른 팀원은 칸 1을 대신 읽지 않아요</li>
<li>누가 이어받고 어디부터 읽을지 정해야 해요</li>
</ol>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">팀: 같은 팀은 칸을 나눠 맡아요</h2>

<section class="slide">
<h3>같은 팀 이름이면 칸을 나눠 맡아요</h3>
<svg class="dg" viewBox="0 0 400 270" role="img" aria-label="같은 재고 프로그램 세 개가 모두 팀 이름 group.id=inventory를 적어 재고 팀(컨슈머 그룹)이 되고 칸 0, 1, 2를 한 명이 하나씩 맡는 그림">
<defs><marker id="cg3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="8" y="8" width="200" height="254" rx="12"/>
<text class="label center" x="108" y="28">주문 선반 (토픽)</text>
<text class="chip" x="40" y="86">칸 0</text>
<circle class="new" cx="96" cy="86" r="18"/><use class="ic" href="#i-package" x="83" y="73" width="26" height="26"/>
<circle class="new" cx="146" cy="86" r="18"/><use class="ic" href="#i-package" x="133" y="73" width="26" height="26"/>
<text class="chip" x="40" y="150">칸 1</text>
<circle class="new" cx="96" cy="150" r="18"/><use class="ic" href="#i-package" x="83" y="137" width="26" height="26"/>
<circle class="new" cx="146" cy="150" r="18"/><use class="ic" href="#i-package" x="133" y="137" width="26" height="26"/>
<text class="chip" x="40" y="214">칸 2</text>
<circle class="new" cx="96" cy="214" r="18"/><use class="ic" href="#i-package" x="83" y="201" width="26" height="26"/>
<circle class="new" cx="146" cy="214" r="18"/><use class="ic" href="#i-package" x="133" y="201" width="26" height="26"/>
<rect class="line" x="222" y="8" width="170" height="254" rx="12"/>
<text class="label center" x="307" y="28">재고 팀</text><text class="small mono" x="307" y="48">group.id=inventory</text>
<path class="line" d="M262,86 L176,86" marker-end="url(#cg3)"/>
<path class="line" d="M262,150 L176,150" marker-end="url(#cg3)"/>
<path class="line" d="M262,214 L176,214" marker-end="url(#cg3)"/>
<circle class="kafka" cx="286" cy="86" r="22"/><use class="ic" href="#i-user-round" x="271" y="71" width="30" height="30"/><text class="chip" x="316" y="80" style="text-anchor:start">담당 1</text><text class="small" x="316" y="98" style="text-anchor:start">프로그램 1</text>
<circle class="kafka" cx="286" cy="150" r="22"/><use class="ic" href="#i-user-round" x="271" y="135" width="30" height="30"/><text class="chip" x="316" y="144" style="text-anchor:start">담당 2</text><text class="small" x="316" y="162" style="text-anchor:start">프로그램 2</text>
<circle class="kafka" cx="286" cy="214" r="22"/><use class="ic" href="#i-user-round" x="271" y="199" width="30" height="30"/><text class="chip" x="316" y="208" style="text-anchor:start">담당 3</text><text class="small" x="316" y="226" style="text-anchor:start">프로그램 3</text>
</svg>
<ol class="steps">
<li>켜 둔 재고 프로그램 하나가 담당자 한 명이에요</li>
<li>같은 이름(group.id)을 쓴 프로그램끼리 한 팀이에요</li>
<li>팀 안에서 한 칸은 한 명에게만 배정돼요</li>
</ol>
<p class="more">참고: <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html">Apache Kafka 4.1 KafkaConsumer: 그룹과 파티션 배정</a></p>
</section>

<section class="slide">
<h3>업무가 다르면 팀 이름도 달라야 해요</h3>
<svg class="dg" viewBox="0 0 400 310" role="img" aria-label="주문 A와 B를 두 방식으로 나란히 비교한 그림. 위는 재고와 알림이 같은 팀 이름을 써서 A는 재고만, B는 알림만 받아 알림이 A를 놓친다. 아래는 재고 팀과 알림 팀이 다른 팀 이름을 써서 두 팀 모두 A와 B를 받는다">
<defs><marker id="cg4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="6" y="6" width="388" height="146" rx="12"/>
<text class="label center" x="200" y="26">같은 팀 이름</text>
<rect class="new" x="166" y="48" width="68" height="28" rx="6"/><text class="chip" x="200" y="62">주문 A</text>
<rect class="new" x="166" y="98" width="68" height="28" rx="6"/><text class="chip" x="200" y="112">주문 B</text>
<path class="line" d="M164,62 L84,82" marker-end="url(#cg4)"/>
<path class="line" d="M236,112 L316,92" marker-end="url(#cg4)"/>
<circle class="box" cx="60" cy="88" r="20"/><use class="ic" href="#i-user-round" x="46" y="74" width="28" height="28"/><text class="chip" x="60" y="124">재고</text><text class="small" x="60" y="142">한 팀</text>
<circle class="bad" cx="340" cy="88" r="20"/><use class="ic" href="#i-user-round" x="326" y="74" width="28" height="28"/><text class="chip" x="340" y="124">알림</text><text class="small" x="340" y="142">한 팀</text>
<text class="alert" x="200" y="144">칸을 나눠 맡아 일부만 받아요</text>
<rect class="line" x="6" y="160" width="388" height="144" rx="12"/>
<text class="label center" x="200" y="180">다른 팀 이름</text>
<rect class="new" x="166" y="202" width="68" height="28" rx="6"/><text class="chip" x="200" y="216">주문 A</text>
<rect class="new" x="166" y="252" width="68" height="28" rx="6"/><text class="chip" x="200" y="266">주문 B</text>
<path class="line" d="M164,216 L84,236" marker-end="url(#cg4)"/>
<path class="line" d="M164,266 L84,246" marker-end="url(#cg4)"/>
<path class="line" d="M236,216 L316,236" marker-end="url(#cg4)"/>
<path class="line" d="M236,266 L316,246" marker-end="url(#cg4)"/>
<circle class="kafka" cx="60" cy="241" r="20"/><use class="ic" href="#i-user-round" x="46" y="227" width="28" height="28"/><text class="chip" x="60" y="278">재고 팀</text>
<circle class="kafka" cx="340" cy="241" r="20"/><use class="ic" href="#i-user-round" x="326" y="227" width="28" height="28"/><text class="chip" x="340" y="278">알림 팀</text>
<text class="small" x="200" y="296">두 팀 모두 다 받아요</text>
</svg>
<ol class="steps">
<li>같은 팀이면 알림 쪽이 일부 주문을 못 받아요</li>
<li>팀 이름이 다르면 팀마다 모든 주문을 읽어요</li>
<li>주문을 복사하지 않고 같은 상자를 각자 읽어요</li>
</ol>
<p class="more">팀마다 읽은 자리를 따로 적는 그림은 <a href="{{ '/2026/11/15/why-kafka/' | relative_url }}">1편</a>에 있어요</p>
</section>

<section class="slide">
<h3>칸보다 사람이 많으면 남는 사람은 쉬어요</h3>
<svg class="dg" viewBox="0 0 400 280" role="img" aria-label="주문 선반에 칸이 세 개인데 재고 팀에 담당자가 네 명이라 세 명은 칸을 하나씩 맡고 네 번째 담당자는 맡을 칸이 없어 쉬는 그림">
<defs><marker id="cg5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="8" y="8" width="200" height="264" rx="12"/>
<text class="label center" x="108" y="28">주문 선반 (토픽)</text>
<text class="chip" x="40" y="70">칸 0</text>
<circle class="new" cx="96" cy="70" r="18"/><use class="ic" href="#i-package" x="83" y="57" width="26" height="26"/>
<circle class="new" cx="146" cy="70" r="18"/><use class="ic" href="#i-package" x="133" y="57" width="26" height="26"/>
<text class="chip" x="40" y="130">칸 1</text>
<circle class="new" cx="96" cy="130" r="18"/><use class="ic" href="#i-package" x="83" y="117" width="26" height="26"/>
<circle class="new" cx="146" cy="130" r="18"/><use class="ic" href="#i-package" x="133" y="117" width="26" height="26"/>
<text class="chip" x="40" y="190">칸 2</text>
<circle class="new" cx="96" cy="190" r="18"/><use class="ic" href="#i-package" x="83" y="177" width="26" height="26"/>
<circle class="new" cx="146" cy="190" r="18"/><use class="ic" href="#i-package" x="133" y="177" width="26" height="26"/>
<rect class="line" x="222" y="8" width="170" height="264" rx="12"/>
<text class="label center" x="307" y="28">재고 팀</text>
<path class="line" d="M264,70 L176,70" marker-end="url(#cg5)"/>
<path class="line" d="M264,130 L176,130" marker-end="url(#cg5)"/>
<path class="line" d="M264,190 L176,190" marker-end="url(#cg5)"/>
<circle class="kafka" cx="286" cy="70" r="20"/><use class="ic" href="#i-user-round" x="272" y="56" width="28" height="28"/><text class="chip" x="316" y="70" style="text-anchor:start">담당 1</text>
<circle class="kafka" cx="286" cy="130" r="20"/><use class="ic" href="#i-user-round" x="272" y="116" width="28" height="28"/><text class="chip" x="316" y="130" style="text-anchor:start">담당 2</text>
<circle class="kafka" cx="286" cy="190" r="20"/><use class="ic" href="#i-user-round" x="272" y="176" width="28" height="28"/><text class="chip" x="316" y="190" style="text-anchor:start">담당 3</text>
<circle class="box" cx="286" cy="244" r="20"/><use class="ic" href="#i-user-round" x="272" y="230" width="28" height="28"/><text class="chip" x="316" y="236" style="text-anchor:start">담당 4</text><text class="small" x="316" y="254" style="text-anchor:start">쉬어요</text>
</svg>
<ol class="steps">
<li>함께 읽는 사람 수는 칸 수까지예요</li>
<li>쉬던 담당 4는 누가 나가면 그 칸을 이어받아요</li>
<li>더 나눠 읽으려면 칸을 늘려야 해요</li>
</ol>
<p class="more">칸을 늘릴 때 조심할 점은 <a href="{{ '/2026/11/15/topic-partition/' | relative_url }}">2편</a>에서 봐요</p>
</section>

<section class="slide">
<h3>상자 단위로 나누는 공유 그룹도 있어요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="같은 칸 하나와 상자 세 개, 담당자 세 명을 좌우로 나란히 비교한 그림. 왼쪽 보통 팀(컨슈머 그룹)은 한 명이 세 상자를 모두 읽고 두 명은 쉰다. 오른쪽 공유 그룹(share group)은 세 명이 상자를 하나씩 나눠 읽는다">
<defs><marker id="cg6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="6" y="6" width="190" height="238" rx="12"/>
<text class="label center" x="101" y="28">컨슈머 그룹</text>
<text class="small" x="101" y="46">칸</text><rect class="line dash" x="22" y="50" width="158" height="52" rx="8"/>
<circle class="new" cx="56" cy="76" r="16"/><use class="ic" href="#i-package" x="45" y="65" width="22" height="22"/>
<circle class="new" cx="101" cy="76" r="16"/><use class="ic" href="#i-package" x="90" y="65" width="22" height="22"/>
<circle class="new" cx="146" cy="76" r="16"/><use class="ic" href="#i-package" x="135" y="65" width="22" height="22"/>
<path class="line" d="M92,152 L60,96" marker-end="url(#cg6)"/>
<path class="line" d="M101,150 L101,96" marker-end="url(#cg6)"/>
<path class="line" d="M110,152 L142,96" marker-end="url(#cg6)"/>
<circle class="box" cx="46" cy="176" r="20"/><use class="ic" href="#i-user-round" x="32" y="162" width="28" height="28"/><text class="chip" x="46" y="208">쉬어요</text>
<circle class="kafka" cx="101" cy="176" r="20"/><use class="ic" href="#i-user-round" x="87" y="162" width="28" height="28"/>
<circle class="box" cx="156" cy="176" r="20"/><use class="ic" href="#i-user-round" x="142" y="162" width="28" height="28"/><text class="chip" x="156" y="208">쉬어요</text>
<text class="small" x="101" y="226">한 칸 = 한 명</text>
<rect class="line" x="204" y="6" width="190" height="238" rx="12"/>
<text class="label center" x="299" y="28">공유 그룹</text>
<text class="small" x="299" y="46">칸</text><rect class="line dash" x="220" y="50" width="158" height="52" rx="8"/>
<circle class="new" cx="254" cy="76" r="16"/><use class="ic" href="#i-package" x="243" y="65" width="22" height="22"/>
<circle class="new" cx="299" cy="76" r="16"/><use class="ic" href="#i-package" x="288" y="65" width="22" height="22"/>
<circle class="new" cx="344" cy="76" r="16"/><use class="ic" href="#i-package" x="333" y="65" width="22" height="22"/>
<path class="line" d="M254,154 L254,96" marker-end="url(#cg6)"/>
<path class="line" d="M299,154 L299,96" marker-end="url(#cg6)"/>
<path class="line" d="M344,154 L344,96" marker-end="url(#cg6)"/>
<circle class="kafka" cx="254" cy="176" r="20"/><use class="ic" href="#i-user-round" x="240" y="162" width="28" height="28"/>
<circle class="kafka" cx="299" cy="176" r="20"/><use class="ic" href="#i-user-round" x="285" y="162" width="28" height="28"/>
<circle class="kafka" cx="344" cy="176" r="20"/><use class="ic" href="#i-user-round" x="330" y="162" width="28" height="28"/>
<text class="small" x="299" y="226">상자마다 나눠요</text>
</svg>
<ol class="steps">
<li>공유 그룹(share group)은 칸 대신 상자 단위로 나눠 맡겨요</li>
<li>담당자는 상자마다 센터에 처리했다고 알려요</li>
<li>Kafka 4.1에서는 아직 미리 보기 기능이에요</li>
</ol>
<p class="more">참고: <a href="https://kafka.apache.org/41/design/design/#share-groups">Apache Kafka 4.1: share group과 일반 그룹의 차이</a></p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">교대: 사람이 바뀌면 칸을 다시 나눠요</h2>

<section class="slide">
<h3>사무실이 팀원의 신호를 보고 칸을 정해요</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="담당자(컨슈머)가 센터 사무실(그룹 코디네이터)에 살아 있다는 신호를 계속 보내고 센터에 읽기 요청(poll())을 하며 사무실은 담당자에게 맡을 칸을 알려 주는 양방향 그림. 사무실은 센터(브로커) 한 곳 안에서 맡는 역할이다">
<defs><marker id="cg7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M108,70 L292,70" marker-end="url(#cg7)"/><text class="chip" x="170" y="58">살아 있어요</text>
<path class="line" d="M108,100 L230,100" marker-end="url(#cg7)"/><text class="chip mono" x="170" y="90">poll()</text>
<path class="line" d="M292,130 L108,130" marker-end="url(#cg7)"/><text class="chip" x="170" y="148">칸 0을 맡아요</text>
<circle class="box" cx="70" cy="100" r="34"/><use class="ic" href="#i-user-round" x="48" y="78" width="44" height="44"/>
<text class="big" x="70" y="158">담당자</text><text class="small" x="70" y="178">컨슈머</text>
<rect class="line" x="236" y="10" width="158" height="190" rx="12"/>
<use class="ic" href="#i-warehouse" x="246" y="18" width="22" height="22"/><text class="label" x="274" y="34">센터 (브로커)</text>
<circle class="kafka" cx="316" cy="100" r="36"/><use class="ic" href="#i-clipboard-list" x="294" y="78" width="44" height="44"/>
<text class="big" x="316" y="160">사무실</text><text class="small" x="316" y="180">그룹 코디네이터</text>
<circle class="packet" r="5"><animateMotion dur="1.6s" repeatCount="indefinite" path="M108,70 L292,70"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="0.8s" repeatCount="indefinite" path="M292,130 L108,130"/></circle>
</svg>
<ol class="steps">
<li>사무실(그룹 코디네이터)은 센터(브로커) 한 곳이 맡아요</li>
<li>담당자는 살아 있다는 신호(하트비트)를 계속 보내요</li>
<li>신호나 읽기 요청(poll())이 오래 끊기면 칸을 넘겨요</li>
</ol>
<p class="more">참고: <a href="https://kafka.apache.org/41/design/design/#the-consumer">Apache Kafka 4.1 설계: 컨슈머와 그룹 관리</a> · <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html">KafkaConsumer: poll()과 그룹 탈퇴 조건</a> · 센터가 고장 나면 <a href="{{ '/2026/11/15/replication/' | relative_url }}">5편</a></p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>사람이 드나들면 칸을 다시 나눠요</h3>
<svg class="dg" viewBox="0 0 400 300" role="img" aria-label="같은 칸 세 개와 담당자 세 명을 위아래로 나란히 비교한 그림. 위는 담당 1, 2, 3이 칸 0, 1, 2를 하나씩 맡는다. 아래는 담당 2가 나간 뒤 칸 1을 담당 1이 이어받아 담당 1이 두 칸을 맡는다">
<defs><marker id="cg8" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="6" y="6" width="388" height="138" rx="12"/>
<text class="label center" x="200" y="26">다시 나누기 전</text>
<rect class="new" x="50" y="40" width="60" height="30" rx="6"/><text class="chip" x="80" y="55">칸 0</text>
<rect class="new" x="170" y="40" width="60" height="30" rx="6"/><text class="chip" x="200" y="55">칸 1</text>
<rect class="new" x="290" y="40" width="60" height="30" rx="6"/><text class="chip" x="320" y="55">칸 2</text>
<path class="line" d="M80,86 L80,74" marker-end="url(#cg8)"/>
<path class="line" d="M200,86 L200,74" marker-end="url(#cg8)"/>
<path class="line" d="M320,86 L320,74" marker-end="url(#cg8)"/>
<circle class="kafka" cx="80" cy="108" r="20"/><use class="ic" href="#i-user-round" x="66" y="94" width="28" height="28"/><text class="chip" x="106" y="108" style="text-anchor:start">담당 1</text>
<circle class="kafka" cx="200" cy="108" r="20"/><use class="ic" href="#i-user-round" x="186" y="94" width="28" height="28"/><text class="chip" x="226" y="108" style="text-anchor:start">담당 2</text>
<circle class="kafka" cx="320" cy="108" r="20"/><use class="ic" href="#i-user-round" x="306" y="94" width="28" height="28"/><text class="chip" x="346" y="108" style="text-anchor:start">담당 3</text>
<rect class="line" x="6" y="154" width="388" height="140" rx="12"/>
<text class="label center" x="200" y="174">담당 2가 나간 뒤</text>
<rect class="new" x="50" y="188" width="60" height="30" rx="6"/><text class="chip" x="80" y="203">칸 0</text>
<rect class="new" x="170" y="188" width="60" height="30" rx="6"/><text class="chip" x="200" y="203">칸 1</text>
<rect class="new" x="290" y="188" width="60" height="30" rx="6"/><text class="chip" x="320" y="203">칸 2</text>
<path class="line" d="M80,236 L80,222" marker-end="url(#cg8)"/>
<path class="line" d="M98,242 L180,222" marker-end="url(#cg8)"/>
<path class="line" d="M320,236 L320,222" marker-end="url(#cg8)"/>
<circle class="kafka" cx="80" cy="258" r="20"/><use class="ic" href="#i-user-round" x="66" y="244" width="28" height="28"/><text class="chip" x="80" y="288">담당 1</text>
<circle class="line dash" cx="200" cy="258" r="20"/><text class="alert" x="226" y="258" style="text-anchor:start">나감</text>
<circle class="kafka" cx="320" cy="258" r="20"/><use class="ic" href="#i-user-round" x="306" y="244" width="28" height="28"/><text class="chip" x="346" y="258" style="text-anchor:start">담당 3</text>
</svg>
<ol class="steps">
<li>칸 담당을 다시 나누는 일을 리밸런싱이라고 해요</li>
<li>팀원이 바뀌거나 읽는 선반의 칸이 늘면 일어나요</li>
<li>사무실이 담당 없는 칸이 없게 다시 맡겨요</li>
</ol>
<p class="more">칸을 늘리는 이야기는 <a href="{{ '/2026/11/15/topic-partition/' | relative_url }}">2편</a>에서 봐요 · 참고: <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html">Apache Kafka 4.1 KafkaConsumer: 리밸런싱 조건</a></p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 리밸런싱 중에는 읽기가 멈추나요?</summary>
<p>A. 방식에 따라 달라요. 맡은 칸을 모두 내려놓고 다시 나누면 팀 전체가 잠깐 멈추고 필요한 칸만 넘기면 그 칸만 멈춰요. 기본은 모두 내려놓는 방식이에요.</p>
<p>참고: <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/consumer/ConsumerPartitionAssignor.RebalanceProtocol.html">Apache Kafka 4.1: 두 방식의 차이</a> · <a href="https://kafka.apache.org/41/configuration/consumer-configs/#partition.assignment.strategy">기본 배정 방식</a></p>
</details>
</aside>
</div>
</div>

<div class="slide-group">
<h2 class="slide-group-title">장부: 적어 둔 자리에서 이어 읽어요</h2>

<section class="slide">
<h3>새 담당은 장부에 적힌 자리부터 읽어요</h3>
<svg class="dg" viewBox="0 0 400 260" role="img" aria-label="칸 0의 상자 0번부터 7번 중 0~3번은 처리를 끝냈고 4~5번은 받았지만 아직 처리 전이다. 담당자가 읽은 자리는 6이지만 센터 장부에 적힌 자리는 4다. 새 담당은 장부를 보고 4번부터 읽는다. 번호는 설명용 예시다">
<defs><marker id="cg9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="label" x="16" y="22">칸 0</text>
<text class="chip" x="312" y="16">읽은 자리 6</text><path class="mark" d="M306,26 L318,26 L312,36 z"/>
<rect class="kafka" x="16" y="42" width="40" height="38" rx="6"/><text class="chip" x="36" y="61">0</text>
<rect class="kafka" x="62" y="42" width="40" height="38" rx="6"/><text class="chip" x="82" y="61">1</text>
<rect class="kafka" x="108" y="42" width="40" height="38" rx="6"/><text class="chip" x="128" y="61">2</text>
<rect class="kafka" x="154" y="42" width="40" height="38" rx="6"/><text class="chip" x="174" y="61">3</text>
<rect class="new" x="200" y="42" width="40" height="38" rx="6"/><text class="chip" x="220" y="61">4</text>
<rect class="new" x="246" y="42" width="40" height="38" rx="6"/><text class="chip" x="266" y="61">5</text>
<rect class="box" x="292" y="42" width="40" height="38" rx="6"/><text class="chip" x="312" y="61">6</text>
<rect class="box" x="338" y="42" width="40" height="38" rx="6"/><text class="chip" x="358" y="61">7</text>
<path class="line" d="M16,86 L16,92 L194,92 L194,86"/><text class="small" x="105" y="112">처리 끝</text>
<path class="mark" d="M214,96 L226,96 L220,86 z"/><text class="small" x="243" y="112">받았지만 처리 전</text>
<text class="chip" x="220" y="140">장부에 적힌 자리 4</text>
<path class="line" d="M220,168 L220,154" marker-end="url(#cg9)"/>
<circle class="box" cx="70" cy="196" r="28"/><use class="ic" href="#i-user-round" x="52" y="178" width="36" height="36"/>
<text class="big" x="70" y="246">새 담당</text>
<path class="line" d="M102,196 L186,196" marker-end="url(#cg9)"/>
<circle class="kafka" cx="220" cy="196" r="28"/><use class="ic" href="#i-notebook-pen" x="202" y="178" width="36" height="36"/>
<text class="big" x="262" y="202" style="text-anchor:start">장부</text>
</svg>
<ol class="steps">
<li>읽은 자리는 담당자만 기억해서 교대하면 사라져요</li>
<li>다음 번호를 장부에 적는 일을 커밋이라고 해요</li>
<li>새 담당은 장부에 적힌 4번부터 읽어요 (예시)</li>
</ol>
<p class="more">장부(__consumer_offsets)도 여러 건물에 복사돼요 (<a href="{{ '/2026/11/15/replication/' | relative_url }}">5편</a>) · 참고: <a href="https://kafka.apache.org/41/implementation/distribution/">Apache Kafka 4.1: 코디네이터와 오프셋 저장</a></p>
</section>

<section class="slide">
<h3>커밋이 일과 어긋나면 중복이나 누락이 생겨요</h3>
<svg class="dg" viewBox="0 0 400 300" role="img" aria-label="같은 주문을 두 순서로 나란히 비교한 그림. 위는 읽고 처리한 뒤 커밋하기 전에 멈춰서 새 담당이 같은 주문을 다시 처리한다. 아래는 읽고 처리하기 전에 커밋한 뒤 멈춰서 새 담당이 그 주문을 건너뛴다">
<defs><marker id="cg10" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="6" y="6" width="388" height="136" rx="12"/>
<text class="label center" x="200" y="26">처리한 뒤 커밋 전에 멈추면</text>
<rect class="box" x="30" y="52" width="80" height="32" rx="6"/><text class="chip" x="70" y="68">읽기</text>
<path class="line" d="M112,68 L156,68" marker-end="url(#cg10)"/>
<rect class="kafka" x="160" y="52" width="80" height="32" rx="6"/><text class="chip" x="200" y="68">처리 끝</text>
<path class="line" d="M242,68 L286,68" marker-end="url(#cg10)"/>
<rect class="bad" x="290" y="52" width="80" height="32" rx="6"/><text class="chip" x="330" y="68">멈춤</text>
<text class="alert" x="200" y="116">새 담당이 다시 처리해요 (중복)</text>
<rect class="line" x="6" y="152" width="388" height="142" rx="12"/>
<text class="label center" x="200" y="172">처리하기 전에 커밋하면</text>
<rect class="box" x="30" y="198" width="80" height="32" rx="6"/><text class="chip" x="70" y="214">읽기</text>
<path class="line" d="M112,214 L156,214" marker-end="url(#cg10)"/>
<rect class="kafka" x="160" y="198" width="80" height="32" rx="6"/><text class="chip" x="200" y="214">커밋</text>
<path class="line" d="M242,214 L286,214" marker-end="url(#cg10)"/>
<rect class="bad" x="290" y="198" width="80" height="32" rx="6"/><text class="chip" x="330" y="214">멈춤</text>
<text class="alert" x="200" y="264">새 담당이 건너뛰어요 (누락)</text>
</svg>
<ol class="steps">
<li>처리 뒤 커밋 전에 멈추면 재고가 두 번 줄 수 있어요</li>
<li>처리 전에 커밋하면 그 주문의 재고가 안 줄 수 있어요</li>
<li>그래서 보통 처리를 끝낸 뒤 커밋해요</li>
</ol>
<p class="more">같은 소식을 두 번 받아도 괜찮게 만드는 법은 <a href="{{ '/2026/11/15/delivery-semantics/' | relative_url }}">7편</a>에서 봐요</p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">판단: 읽을 때 무엇을 조심해요?</h2>

<div class="slide-with-question">
<section class="slide">
<h3>자동 커밋은 일이 끝났는지 보지 않아요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="왼쪽에서 오른쪽으로 흐르는 그림. 담당자가 1번째 읽기 요청(poll())으로 상자 4번과 5번을 받고 아직 처리하는 동안 5초가 지나 2번째 읽기 요청 때 자동으로 커밋한다. 4번과 5번이 끝나기 전에 커밋된다. 번호는 설명용 예시다">
<defs><marker id="cg11" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="label center" x="200" y="22">자동 커밋 (Kafka 4.1 Java 기본)</text>
<rect class="box" x="10" y="40" width="120" height="30" rx="6"/><text class="chip" x="70" y="55">1번째 poll()</text>
<circle class="new" cx="50" cy="104" r="16"/><use class="ic" href="#i-package" x="39" y="93" width="22" height="22"/><text class="chip" x="50" y="136">4</text>
<circle class="new" cx="90" cy="104" r="16"/><use class="ic" href="#i-package" x="79" y="93" width="22" height="22"/><text class="chip" x="90" y="136">5</text>
<path class="line" d="M114,104 L156,104" marker-end="url(#cg11)"/>
<circle class="bad" cx="180" cy="104" r="16"/><use class="ic" href="#i-package" x="169" y="93" width="22" height="22"/>
<circle class="bad" cx="220" cy="104" r="16"/><use class="ic" href="#i-package" x="209" y="93" width="22" height="22"/><text class="chip" x="200" y="136">처리 중</text>
<path class="line" d="M242,104 L304,104" marker-end="url(#cg11)"/>
<rect class="kafka" x="258" y="40" width="136" height="30" rx="6"/><text class="chip" x="326" y="55">2번째 poll() · 커밋</text>
<circle class="box" cx="330" cy="104" r="18"/><use class="ic" href="#i-timer" x="318" y="92" width="24" height="24"/><text class="small" x="330" y="136">5초 지남</text>
<text class="alert" x="200" y="186">4~5번이 끝나기 전에 커밋돼요</text>
</svg>
<ol class="steps">
<li>1번째 읽기 요청(poll())으로 4~5번을 받아요 (예시)</li>
<li>5초가 지나면 다음 읽기 요청 때 받은 번호까지 커밋해요</li>
<li>이 동작은 기본으로 켜져 있어요 (enable.auto.commit)</li>
</ol>
<p class="more">참고: <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html">Kafka 4.1 KafkaConsumer: 자동 커밋</a> · <a href="https://kafka.apache.org/41/configuration/consumer-configs/">컨슈머 설정</a> · <a href="https://github.com/apache/kafka/blob/4.1/clients/src/main/java/org/apache/kafka/clients/consumer/internals/ConsumerCoordinator.java">poll과 자동 커밋 코드</a></p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 자동 커밋이 기본이면 끄고 직접 커밋해야 하나요?</summary>
<p>A. 다음 요청 전에 받은 걸 다 처리한다면 자동 커밋도 괜찮아요. 처리를 따로 맡긴다면 끄고 끝낸 뒤 직접 커밋해요 (<a href="{{ '/2026/11/15/delivery-semantics/' | relative_url }}">7편</a>).</p>
</details>
</aside>
</div>

<section class="slide">
<h3>장부 자리를 못 쓰면 시작 위치 설정을 따라요</h3>
<svg class="dg" viewBox="0 0 400 290" role="img" aria-label="같은 칸을 위아래로 나란히 비교한 그림. 0~2번은 보관 기간이 지나 지워졌고 3~7번이 남아 있으며 끝에 새 상자가 온다. 위 latest(기본)는 남은 상자를 건너뛰고 새 상자부터 읽는다. 아래 earliest는 남아 있는 가장 오래된 3번부터 읽는다. 번호는 설명용 예시다">
<rect class="line" x="6" y="6" width="388" height="134" rx="12"/>
<text class="label center" x="200" y="26">latest · 끝부터 (Kafka 4.1 Java 기본)</text>
<rect class="line dash" x="14" y="44" width="34" height="34" rx="6"/><text class="small" x="31" y="61">0</text>
<rect class="line dash" x="54" y="44" width="34" height="34" rx="6"/><text class="small" x="71" y="61">1</text>
<rect class="line dash" x="94" y="44" width="34" height="34" rx="6"/><text class="small" x="111" y="61">2</text>
<rect class="kafka" x="134" y="44" width="34" height="34" rx="6"/><text class="chip" x="151" y="61">3</text>
<rect class="kafka" x="174" y="44" width="34" height="34" rx="6"/><text class="chip" x="191" y="61">4</text>
<rect class="kafka" x="214" y="44" width="34" height="34" rx="6"/><text class="chip" x="231" y="61">5</text>
<rect class="kafka" x="254" y="44" width="34" height="34" rx="6"/><text class="chip" x="271" y="61">6</text>
<rect class="kafka" x="294" y="44" width="34" height="34" rx="6"/><text class="chip" x="311" y="61">7</text>
<rect class="new" x="334" y="44" width="34" height="34" rx="6"/><text class="chip" x="351" y="61">새</text>
<text class="small" x="71" y="98">지워짐</text>
<path class="mark" d="M345,96 L357,96 L351,86 z"/><text class="chip" x="351" y="118">여기부터</text>
<text class="alert" x="231" y="118">남은 건 건너뛰어요</text>
<rect class="line" x="6" y="150" width="388" height="134" rx="12"/>
<text class="label center" x="200" y="170">earliest · 남은 처음부터</text>
<rect class="line dash" x="14" y="188" width="34" height="34" rx="6"/><text class="small" x="31" y="205">0</text>
<rect class="line dash" x="54" y="188" width="34" height="34" rx="6"/><text class="small" x="71" y="205">1</text>
<rect class="line dash" x="94" y="188" width="34" height="34" rx="6"/><text class="small" x="111" y="205">2</text>
<rect class="kafka" x="134" y="188" width="34" height="34" rx="6"/><text class="chip" x="151" y="205">3</text>
<rect class="kafka" x="174" y="188" width="34" height="34" rx="6"/><text class="chip" x="191" y="205">4</text>
<rect class="kafka" x="214" y="188" width="34" height="34" rx="6"/><text class="chip" x="231" y="205">5</text>
<rect class="kafka" x="254" y="188" width="34" height="34" rx="6"/><text class="chip" x="271" y="205">6</text>
<rect class="kafka" x="294" y="188" width="34" height="34" rx="6"/><text class="chip" x="311" y="205">7</text>
<rect class="new" x="334" y="188" width="34" height="34" rx="6"/><text class="chip" x="351" y="205">새</text>
<text class="small" x="71" y="242">지워짐</text>
<path class="mark" d="M145,240 L157,240 L151,230 z"/><text class="chip" x="151" y="262">여기부터</text>
<text class="small" x="290" y="262">남은 것부터 다 읽어요</text>
</svg>
<ol class="steps">
<li>새 팀이라 장부 자리가 없을 때 써요</li>
<li>적힌 자리의 상자가 지워졌을 때도 써요</li>
<li>설정 이름은 auto.offset.reset이에요 (번호는 예시)</li>
</ol>
<p class="more">보관 기간은 <a href="{{ '/2026/11/15/retention-compaction/' | relative_url }}">6편</a>에서 봐요 · 참고: <a href="https://kafka.apache.org/41/configuration/consumer-configs/">Java 컨슈머 설정: 시작 위치</a></p>
</section>
</div>

</div>
