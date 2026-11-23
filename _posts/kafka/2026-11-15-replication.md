---
layout: post
title: "물류센터 건물 하나가 불타면? 택배 물류센터로 이해하는 Kafka 복제"
description: "그림으로 보는 Kafka 복제: 같은 칸을 여러 건물에 따라 적는 리더와 팔로워, 잘 따라오는 사본의 명단(ISR), 꺼내 읽을 경계선(HW), 최소 사본 수(min.insync.replicas), 리더 교체와 안전 후보(ELR), 뒤처진 사본 선출(unclean)의 위험을 동화책처럼 설명합니다."
date: 2026-11-15 14:30:00 +0900
series: kafka
episode: 5
summary: "건물이 멈춰도 소식을 이어 가려면 사본이 필요해요. 누가 따라왔는지와 몇 곳에 남겨야 성공인지 함께 살펴봐요."
---

<div class="lesson lesson-hierarchy storybook">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: https://cdn.jsdelivr.net/npm/lucide-static@1.25.0/icons/ (ISC). 라이선스: assets/icons/LICENSE-lucide.txt. 공통 사물은 Kafka 1~3편과 같은 아이콘이며 명단(list-checks), 8편의 관리실(building-2)을 추가. i-x=circle-x. -->
<symbol id="i-store" viewBox="0 0 24 24"><path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"/><path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244"/><path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"/></symbol>
<symbol id="i-warehouse" viewBox="0 0 24 24"><path d="M18 21V10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v11"/><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 1.132-1.803l7.95-3.974a2 2 0 0 1 1.837 0l7.948 3.974A2 2 0 0 1 22 8z"/><path d="M6 13h12"/><path d="M6 17h12"/></symbol>
<symbol id="i-package" viewBox="0 0 24 24"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/></symbol>
<symbol id="i-user-round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></symbol>
<symbol id="i-receipt" viewBox="0 0 24 24"><path d="M12 17V7"/><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8"/><path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z"/></symbol>
<symbol id="i-list-checks" viewBox="0 0 24 24"><path d="M13 5h8"/><path d="M13 12h8"/><path d="M13 19h8"/><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/></symbol>
<symbol id="i-building-2" viewBox="0 0 24 24"><path d="M10 12h4"/><path d="M10 8h4"/><path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/></symbol>
<symbol id="i-x" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0zM15 9l-6 6M9 9l6 6"/></symbol>
</defs>
</svg>

<div class="slide-group">
<h2 class="slide-group-title">문제: 건물이 하나뿐이면 멈춰요</h2>

<section class="slide">
<h3>건물이 하나뿐이면 멈출 때 못 읽어요</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="가게(프로듀서)가 맡긴 소식이 건물(브로커) 한 곳에만 있는데 그 건물이 멈춰 담당자(컨슈머)가 소식을 꺼내지 못하고 기다리는 그림. 다른 건물에는 이 소식이 없다">
<defs><marker id="rp1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M90,84 L154,84" marker-end="url(#rp1)"/>
<path class="line dash" d="M246,84 L310,84"/>
<circle class="box" cx="56" cy="84" r="30"/><use class="ic" href="#i-store" x="36" y="64" width="40" height="40"/>
<text class="big" x="56" y="140">가게</text><text class="small" x="56" y="160">프로듀서</text>
<circle class="bad blink" cx="200" cy="84" r="40"/><use class="ic" href="#i-warehouse" x="176" y="60" width="48" height="48"/>
<text class="big" x="200" y="146">건물</text><text class="small" x="200" y="166">브로커</text>
<circle class="box" cx="344" cy="84" r="30"/><use class="ic" href="#i-user-round" x="324" y="64" width="40" height="40"/>
<text class="big" x="344" y="140">담당자</text><text class="small" x="344" y="160">컨슈머</text>
<text class="alert" x="200" y="196">다른 건물엔 이 소식이 없어요</text>
</svg>
<ol class="steps">
<li>담당자는 건물이 돌아올 때까지 기다려요</li>
<li>이 칸(파티션)의 소식이 그 건물에만 있어서예요</li>
</ol>
<p class="more">읽는 쪽(컨슈머)이 멈출 때 담당자를 바꾸는 법은 <a href="{{ '/2026/11/15/consumer-group/' | relative_url }}">4편 컨슈머 그룹</a>에서 봐요</p>
</section>

<section class="slide">
<h3>멈추면 기다리고 망가지면 잃어요</h3>
<svg class="dg" viewBox="0 0 400 240" role="img" aria-label="사본이 없는 건물 하나가 고장 나는 두 경우를 좌우로 나란히 비교한 그림. 왼쪽 잠시 멈춤은 건물이 멈췄지만 상자는 남아 있어 돌아오면 다시 읽는다. 오른쪽 디스크 고장은 건물이 멈추고 그곳에만 있던 상자도 사라져 되찾지 못한다">
<rect class="line" x="6" y="6" width="190" height="228" rx="12"/>
<text class="label center" x="101" y="28">잠시 멈춤</text>
<circle class="bad" cx="101" cy="84" r="30"/><use class="ic" href="#i-warehouse" x="81" y="64" width="40" height="40"/>
<text class="chip" x="101" y="132">이 칸을 못 써요</text>
<circle class="box" cx="101" cy="176" r="18"/><use class="ic" href="#i-package" x="88" y="163" width="26" height="26"/>
<text class="chip" x="101" y="214">돌아오면 다시 읽어요</text>
<rect class="line" x="204" y="6" width="190" height="228" rx="12"/>
<text class="label center" x="299" y="28">디스크 고장</text>
<circle class="bad" cx="299" cy="84" r="30"/><use class="ic" href="#i-warehouse" x="279" y="64" width="40" height="40"/>
<text class="chip" x="299" y="132">이 칸을 못 써요</text>
<circle class="line dash" cx="299" cy="176" r="18"/><use class="ic" href="#i-package" x="286" y="163" width="26" height="26"/>
<text class="alert" x="299" y="214">되찾지 못해요</text>
</svg>
<ol class="steps">
<li>멈춰도 저장된 소식은 그대로 남아 있어요</li>
<li>디스크(저장 장치)가 망가지면 되살릴 곳이 없어요</li>
<li>그래서 다른 건물에 사본을 남겨 둬요 (복제)</li>
</ol>
</section>

<details class="origin">
<summary>더 알아보기: 누가 왜 복제를 만들었을까?</summary>
<p>링크드인에서 Kafka를 만들던 준 라오(Jun Rao) 등 개발자들은 브로커 한 대의 장애가 소식을 읽지 못하거나 잃는 문제로 이어지는 것을 줄이려 했어요. 그래서 여러 브로커에 같은 소식을 남기는 복제를 Kafka 0.8에 추가했어요.</p>
<p>준 라오는 2013년 링크드인 기술 블로그에서 복제 설계를 소개했어요. 장애가 나도 보내고 읽는 일을 이어 가며 소식을 지키는 설계예요. 복제(replication)는 같은 소식의 사본을 여러 곳에 만든다는 뜻이에요.</p>
<p>참고: <a href="https://www.linkedin.com/blog/engineering/open-source/intra-cluster-replication-apache-kafka">준 라오가 설명한 복제의 배경</a> · <a href="https://cwiki.apache.org/confluence/spaces/KAFKA/pages/30749496/Changes+in+Kafka+0.8">Apache Kafka 0.8의 복제 도입</a></p>
</details>
</div>

<div class="slide-group">
<h2 class="slide-group-title">사본: 같은 칸을 여러 건물에 적어요</h2>

<div class="slide-with-question">
<section class="slide">
<h3>같은 칸을 다른 건물에도 따라 적어요</h3>
<svg class="dg" viewBox="0 0 400 280" role="img" aria-label="가게가 건물 1의 리더에게 소식을 맡긴다. 왼쪽 건물 2와 오른쪽 건물 3의 팔로워가 리더에게 주세요 하고 달라고 해서 받아 같은 순서로 적는다. 리더와 팔로워 둘을 합쳐 사본이 3개이고 이것이 복제 계수 3이다. 숫자는 설명용 예시다">
<defs><marker id="rp2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M200,66 L200,108" marker-end="url(#rp2)"/>
<circle class="box" cx="200" cy="40" r="24"/><use class="ic" href="#i-store" x="184" y="24" width="32" height="32"/>
<text class="big" x="256" y="40">가게</text>
<path class="line" d="M92,140 L160,140" marker-end="url(#rp2)"/><text class="chip" x="127" y="124">주세요</text>
<path class="line" d="M160,160 L92,160" marker-end="url(#rp2)"/><text class="chip" x="127" y="176">소식</text>
<path class="line" d="M308,140 L240,140" marker-end="url(#rp2)"/><text class="chip" x="273" y="124">주세요</text>
<path class="line" d="M240,160 L308,160" marker-end="url(#rp2)"/><text class="chip" x="273" y="176">소식</text>
<circle class="box" cx="60" cy="150" r="30"/><use class="ic" href="#i-warehouse" x="40" y="130" width="40" height="40"/>
<text class="big" x="60" y="206">사본 2</text><text class="small" x="60" y="226">건물 2 · 팔로워</text>
<circle class="kafka" cx="200" cy="150" r="36"/><use class="ic" href="#i-warehouse" x="176" y="126" width="48" height="48"/>
<text class="big" x="200" y="206">사본 1</text><text class="small" x="200" y="226">건물 1 · 리더</text>
<circle class="box" cx="340" cy="150" r="30"/><use class="ic" href="#i-warehouse" x="320" y="130" width="40" height="40"/>
<text class="big" x="340" y="206">사본 3</text><text class="small" x="340" y="226">건물 3 · 팔로워</text>
<text class="chip" x="200" y="262">사본 3개 = 복제 계수 3 (예시)</text>
<circle class="packet" r="5"><animateMotion dur="1.6s" repeatCount="indefinite" path="M200,66 L200,108"/></circle>
</svg>
<ol class="steps">
<li>가게는 리더(받아 적는 건물)에만 맡겨요</li>
<li>팔로워(따라 적는 건물)는 리더에게 달라고 해 적어요</li>
<li>리더를 합친 사본 수가 복제 계수예요</li>
</ol>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 사본을 3개 두면 저장 공간도 세 배가 드나요?</summary>
<p>A. 같은 메시지를 세 브로커에 각각 저장하므로 메시지를 보관하는 공간은 사본 하나일 때의 약 세 배가 필요해요. 리더도 그 세 사본 중 하나예요.</p>
</details>
</aside>
</div>

<section class="slide">
<h3>한 건물이 칸마다 리더도 사본도 맡아요</h3>
<svg class="dg" viewBox="0 0 400 216" role="img" aria-label="건물 세 곳이 각각 칸 0, 1, 2를 모두 보관하는 그림. 건물 1은 칸 0의 리더이고 칸 1과 2는 사본으로 둔다. 건물 2는 칸 1의 리더, 건물 3은 칸 2의 리더다. 노란 칸이 리더 칸이다. 같은 칸의 사본은 서로 다른 건물에 있다. 배치는 설명용 예시다">
<rect class="line" x="6" y="6" width="124" height="178" rx="12"/>
<circle class="box" cx="68" cy="38" r="22"/><use class="ic" href="#i-warehouse" x="53" y="23" width="30" height="30"/>
<text class="big" x="68" y="78">건물 1</text>
<rect class="kafka" x="18" y="98" width="100" height="30" rx="6"/><text class="chip" x="68" y="113">리더 칸 0</text>
<rect class="box" x="18" y="138" width="100" height="30" rx="6"/><text class="chip" x="68" y="153">사본 칸 1·2</text>
<rect class="line" x="138" y="6" width="124" height="178" rx="12"/>
<circle class="box" cx="200" cy="38" r="22"/><use class="ic" href="#i-warehouse" x="185" y="23" width="30" height="30"/>
<text class="big" x="200" y="78">건물 2</text>
<rect class="kafka" x="150" y="98" width="100" height="30" rx="6"/><text class="chip" x="200" y="113">리더 칸 1</text>
<rect class="box" x="150" y="138" width="100" height="30" rx="6"/><text class="chip" x="200" y="153">사본 칸 0·2</text>
<rect class="line" x="270" y="6" width="124" height="178" rx="12"/>
<circle class="box" cx="332" cy="38" r="22"/><use class="ic" href="#i-warehouse" x="317" y="23" width="30" height="30"/>
<text class="big" x="332" y="78">건물 3</text>
<rect class="kafka" x="282" y="98" width="100" height="30" rx="6"/><text class="chip" x="332" y="113">리더 칸 2</text>
<rect class="box" x="282" y="138" width="100" height="30" rx="6"/><text class="chip" x="332" y="153">사본 칸 0·1</text>
<rect class="kafka" x="150" y="194" width="16" height="16" rx="3"/><text class="chip" x="214" y="203">= 리더 칸</text>
</svg>
<ol class="steps">
<li>칸(파티션)마다 리더 건물이 따로 정해져요 (예시)</li>
<li>같은 칸의 사본은 늘 서로 다른 건물에 둬요</li>
</ol>
</section>

<section class="slide">
<h3>잘 따라오는 사본만 명단에 남아요</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="명단(ISR) 카드 안에 리더와 잘 따라오는 사본이 있고 카드 밖에 뒤처져 빠진 사본이 점선으로 있는 그림">
<rect class="line" x="8" y="10" width="262" height="186" rx="12"/>
<circle class="box" cx="34" cy="34" r="14"/><use class="ic" href="#i-list-checks" x="24" y="24" width="20" height="20"/>
<text class="label center" x="148" y="38">명단 (ISR)</text>
<circle class="kafka" cx="78" cy="104" r="30"/><use class="ic" href="#i-warehouse" x="58" y="84" width="40" height="40"/>
<text class="big" x="78" y="158">리더</text>
<circle class="box" cx="200" cy="104" r="30"/><use class="ic" href="#i-warehouse" x="180" y="84" width="40" height="40"/>
<text class="big" x="200" y="158">사본</text><text class="small" x="200" y="178">잘 따라와요</text>
<circle class="line dash" cx="336" cy="104" r="30"/><use class="ic" href="#i-warehouse" x="316" y="84" width="40" height="40"/>
<text class="big" x="336" y="158">사본</text><text class="alert" x="336" y="178">뒤처져 빠졌어요</text>
</svg>
<ol class="steps">
<li>명단(ISR, in-sync replicas)엔 리더도 들어가요</li>
<li>30초 넘게 못 따라오면 빠져요 (Kafka 4.1 기본)</li>
<li>밀린 소식을 따라잡으면 다시 들어와요</li>
</ol>
<p class="more">참고: <a href="https://kafka.apache.org/41/configuration/broker-configs/#brokerconfigs_replica.lag.time.max.ms">Kafka 4.1: ISR에서 빠지는 조건 (replica.lag.time.max.ms)</a></p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">경계: 명단이 모두 적어야 믿어요</h2>

<section class="slide">
<h3>모두 적은 곳까지만 꺼내 읽어요</h3>
<svg class="dg" viewBox="0 0 400 240" role="img" aria-label="리더와 사본 둘의 칸을 세 줄로 나란히 그린 그림. 리더에는 0번, 1번, 2번 상자가 있고 두 사본에는 0번과 1번만 있다. 세 곳 모두 적은 1번 뒤에 경계선(HW)이 그어져 있고 담당자는 경계선 앞인 0번과 1번만 읽는다. 2번은 아직 리더에만 있다. 번호는 설명용 예시다">
<defs><marker id="rp3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="small" x="222" y="16">경계선 (HW, high watermark)</text>
<circle class="kafka" cx="34" cy="56" r="16"/><use class="ic" href="#i-warehouse" x="23" y="45" width="22" height="22"/>
<rect class="box" x="58" y="40" width="80" height="32" rx="6"/><text class="chip" x="98" y="56">자리 번호 0</text>
<rect class="box" x="144" y="40" width="64" height="32" rx="6"/><text class="chip" x="176" y="56">1</text>
<rect class="box" x="236" y="40" width="80" height="32" rx="6"/><text class="alert" x="276" y="56">2 리더에만</text>
<text class="chip" x="356" y="56">리더</text>
<circle class="box" cx="34" cy="104" r="16"/><use class="ic" href="#i-warehouse" x="23" y="93" width="22" height="22"/>
<rect class="box" x="58" y="88" width="80" height="32" rx="6"/><text class="chip" x="98" y="104">0</text>
<rect class="box" x="144" y="88" width="64" height="32" rx="6"/><text class="chip" x="176" y="104">1</text>
<rect class="line dash" x="236" y="88" width="80" height="32" rx="6"/><text class="small" x="276" y="104">아직 없음</text>
<text class="chip" x="356" y="104">사본</text>
<circle class="box" cx="34" cy="152" r="16"/><use class="ic" href="#i-warehouse" x="23" y="141" width="22" height="22"/>
<rect class="box" x="58" y="136" width="80" height="32" rx="6"/><text class="chip" x="98" y="152">0</text>
<rect class="box" x="144" y="136" width="64" height="32" rx="6"/><text class="chip" x="176" y="152">1</text>
<rect class="line dash" x="236" y="136" width="80" height="32" rx="6"/><text class="small" x="276" y="152">아직 없음</text>
<text class="chip" x="356" y="152">사본</text>
<path class="line" d="M222,28 L222,180"/>
<path class="line" d="M216,196 L62,196" marker-end="url(#rp3)"/>
<text class="chip" x="140" y="216">여기 앞까지만 읽어요</text>
</svg>
<ol class="steps">
<li>명단 사본들이 다 적은 곳 끝이 경계선(HW)이에요</li>
<li>담당자는 리더에서 경계선 앞까지만 받아요</li>
<li>2번(예시)은 접수증 전이고 리더 고장 때 사라질 수 있어요</li>
</ol>
<p class="more">자리 번호(오프셋)는 <a href="{{ '/2026/11/15/why-kafka/' | relative_url }}">1편</a>에서 봤어요</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>명단이 최소 수보다 적으면 거절해요</h3>
<svg class="dg" viewBox="0 0 400 330" role="img" aria-label="사본 3곳, 명단 최소 2, acks=all인 예를 세 줄로 나란히 비교한 그림. 줄마다 맨 앞 건물이 리더다. 명단이 3곳이면 3곳 모두 적기를 기다려 접수증을 준다. 2곳이면 2곳을 기다려 접수증을 준다. 1곳이면 최소 2곳에 모자라 쓰기를 거절한다. 숫자는 설명용 예시다">
<defs><marker id="rp4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="label center" x="200" y="16">예: 사본 3 · 명단 최소 2 · acks=all</text>
<rect class="line" x="6" y="26" width="388" height="94" rx="12"/>
<text class="label" x="18" y="46">명단 3곳</text>
<circle class="kafka" cx="70" cy="80" r="20"/><use class="ic" href="#i-warehouse" x="57" y="67" width="26" height="26"/><text class="small" x="70" y="110">리더</text>
<circle class="box" cx="150" cy="80" r="20"/><use class="ic" href="#i-warehouse" x="137" y="67" width="26" height="26"/>
<circle class="box" cx="230" cy="80" r="20"/><use class="ic" href="#i-warehouse" x="217" y="67" width="26" height="26"/>
<path class="line" d="M258,80 L312,80" marker-end="url(#rp4)"/>
<circle class="kafka" cx="340" cy="80" r="20"/><use class="ic" href="#i-receipt" x="327" y="67" width="26" height="26"/>
<rect class="line" x="6" y="128" width="388" height="94" rx="12"/>
<text class="label" x="18" y="148">명단 2곳</text>
<circle class="kafka" cx="70" cy="182" r="20"/><use class="ic" href="#i-warehouse" x="57" y="169" width="26" height="26"/><text class="small" x="70" y="212">리더</text>
<circle class="box" cx="150" cy="182" r="20"/><use class="ic" href="#i-warehouse" x="137" y="169" width="26" height="26"/>
<circle class="bad" cx="230" cy="182" r="20"/><use class="ic" href="#i-warehouse" x="217" y="169" width="26" height="26"/><text class="alert" x="230" y="212">빨강 = 멈춤</text>
<path class="line" d="M258,182 L312,182" marker-end="url(#rp4)"/>
<circle class="kafka" cx="340" cy="182" r="20"/><use class="ic" href="#i-receipt" x="327" y="169" width="26" height="26"/>
<rect class="line" x="6" y="230" width="388" height="94" rx="12"/>
<text class="label" x="18" y="250">명단 1곳</text><text class="alert" x="340" y="250">거절</text>
<circle class="kafka" cx="70" cy="284" r="20"/><use class="ic" href="#i-warehouse" x="57" y="271" width="26" height="26"/><text class="small" x="70" y="314">리더</text>
<circle class="bad" cx="150" cy="284" r="20"/><use class="ic" href="#i-warehouse" x="137" y="271" width="26" height="26"/>
<circle class="bad" cx="230" cy="284" r="20"/><use class="ic" href="#i-warehouse" x="217" y="271" width="26" height="26"/>
<path class="line dash" d="M258,284 L312,284" marker-end="url(#rp4)"/>
<circle class="box" cx="340" cy="284" r="20"/><use class="ic" href="#i-x" x="327" y="271" width="26" height="26"/>
</svg>
<ol class="steps">
<li>접수증 규칙(acks=all, <a href="{{ '/2026/11/15/producer/' | relative_url }}">3편</a>)은 명단 모두를 기다려요</li>
<li>명단 최소 수(min.insync.replicas)에는 리더도 포함해요</li>
<li>거절되면 가게는 제한 시간까지 다시 보내요</li>
</ol>
<p class="more">참고: <a href="https://kafka.apache.org/41/configuration/broker-configs/#brokerconfigs_min.insync.replicas">Kafka 4.1: 최소 ISR</a></p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 건물 두 곳이 동시에 멈추면 어떻게 되나요?</summary>
<p>A. 사본 3·명단 최소 2라면 한 곳만 남아요. 그러면 새 소식 쓰기는 거절돼요. 남은 곳이 명단 안 사본이면 이미 보관한 소식은 읽을 수 있어요. 아니면 「리더 교체」 묶음의 안전 후보가 없는 한 복구를 기다려요. 멈춘 건물이 돌아와 따라잡으면 다시 쓸 수 있어요.</p>
</details>
</aside>
</div>
</div>

<div class="slide-group">
<h2 class="slide-group-title">리더 교체: 안전한 사본이 이어받아요</h2>

<section class="slide">
<h3>리더가 멈추면 명단 안 사본이 이어받아요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="건물 1의 리더가 멈추자 관리실(컨트롤러)이 명단 카드 안의 건물 2를 새 리더로 정하는 그림. 명단 카드는 다 적은 사본만 모은 곳이라 건물 2와 건물 3은 접수증을 준 소식을 모두 가지고 있다">
<defs><marker id="rp5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="130" y="92" width="264" height="152" rx="12"/>
<text class="label center" x="300" y="112">명단 · 다 적은 사본</text>
<path class="line" d="M200,66 L200,124" marker-end="url(#rp5)"/>
<circle class="box" cx="200" cy="40" r="24"/><use class="ic" href="#i-building-2" x="184" y="24" width="32" height="32"/>
<text class="big" x="270" y="36">관리실</text><text class="small" x="270" y="56">컨트롤러</text>
<circle class="bad blink" cx="60" cy="160" r="30"/><use class="ic" href="#i-warehouse" x="40" y="140" width="40" height="40"/>
<text class="big" x="60" y="208">리더</text><text class="small" x="60" y="226">건물 1</text><text class="alert" x="60" y="244">멈췄어요</text>
<circle class="kafka" cx="200" cy="164" r="32"/><use class="ic" href="#i-warehouse" x="178" y="142" width="44" height="44"/>
<text class="big" x="200" y="214">새 리더</text><text class="small" x="200" y="232">건물 2</text>
<circle class="box" cx="330" cy="164" r="28"/><use class="ic" href="#i-warehouse" x="311" y="145" width="38" height="38"/>
<text class="big" x="330" y="214">사본</text><text class="small" x="330" y="232">건물 3</text>
</svg>
<ol class="steps">
<li>관리실(컨트롤러)이 명단 안에서 새 리더를 골라요</li>
<li>명단 사본은 접수증 준 소식을 모두 적어 뒀어요</li>
</ol>
<p class="more">관리실이 멈추면 어떻게 되는지는 <a href="{{ '/2026/11/15/kraft/' | relative_url }}">8편 KRaft</a>에서 봐요</p>
</section>

<section class="slide">
<h3>명단이 다 멈춰도 안전 후보를 기억해요</h3>
<svg class="dg" viewBox="0 0 400 300" role="img" aria-label="같은 건물 세 곳을 시간 순서로 위아래에 그린 그림. 위 카드에서 건물 3은 멈췄고 명단이 리더인 건물 1뿐이라 경계선이 멈췄다. 건물 2는 경계선이 멈춘 뒤에 명단에서 빠져 경계선 앞 소식을 다 가지고 있어 안전 후보가 된다. 아래 카드에서 건물 1까지 멈추자 안전 후보인 건물 2가 새 리더가 된다">
<rect class="line" x="6" y="6" width="388" height="140" rx="12"/>
<text class="label center" x="200" y="26">① 명단이 리더뿐이라 경계선이 멈춰요</text>
<circle class="kafka" cx="70" cy="76" r="26"/><use class="ic" href="#i-warehouse" x="53" y="59" width="34" height="34"/>
<text class="chip" x="70" y="118">건물 1</text><text class="small" x="70" y="136">리더</text>
<circle class="new" cx="200" cy="76" r="26"/><use class="ic" href="#i-warehouse" x="183" y="59" width="34" height="34"/>
<text class="chip" x="200" y="118">건물 2</text><text class="small" x="200" y="136">멈춘 뒤 빠져 다 가짐</text>
<circle class="bad" cx="330" cy="76" r="26"/><use class="ic" href="#i-warehouse" x="313" y="59" width="34" height="34"/>
<text class="chip" x="330" y="118">건물 3</text><text class="alert" x="330" y="136">멈춤</text>
<rect class="line" x="6" y="154" width="388" height="140" rx="12"/>
<text class="label center" x="200" y="174">② 명단이 다 멈췄어요</text>
<circle class="bad" cx="70" cy="224" r="26"/><use class="ic" href="#i-warehouse" x="53" y="207" width="34" height="34"/>
<text class="chip" x="70" y="266">건물 1</text><text class="alert" x="70" y="284">멈춤</text>
<circle class="kafka" cx="200" cy="224" r="26"/><use class="ic" href="#i-warehouse" x="183" y="207" width="34" height="34"/>
<text class="chip" x="200" y="266">건물 2</text><text class="small" x="200" y="284">새 리더</text>
<circle class="bad" cx="330" cy="224" r="26"/><use class="ic" href="#i-warehouse" x="313" y="207" width="34" height="34"/>
<text class="chip" x="330" y="266">건물 3</text><text class="alert" x="330" y="284">멈춤</text>
</svg>
<ol class="steps">
<li>명단이 최소 수보다 적으면 경계선이 더 안 늘어요</li>
<li>건물 2는 선이 멈춘 뒤 빠져 앞 소식을 다 가졌어요</li>
<li>이런 사본이 안전 후보(ELR, eligible leader replicas)예요</li>
</ol>
<p class="more">4.1부터 새 클러스터(건물 단지)는 기본으로 켜져요 · 참고: <a href="https://kafka.apache.org/41/operations/eligible-leader-replicas/">Kafka 4.1: ELR</a></p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">판단: 무엇을 조심해요?</h2>

<section class="slide">
<h3>뒤처진 사본을 리더로 고르면 소식을 잃어요</h3>
<svg class="dg" viewBox="0 0 400 282" role="img" aria-label="안전한 사본이 없을 때 두 선택을 위아래로 나란히 비교한 그림. 위 기다리기(기본)는 멈춘 리더가 돌아오기를 기다려 소식이 남는다. 아래 뒤처진 사본을 리더로 뽑기(unclean)는 뒤처진 사본을 리더로 골라 바로 접수하지만 그 사본에 없던 소식은 사라진다">
<defs><marker id="rp6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="6" y="6" width="388" height="130" rx="12"/>
<text class="label center" x="200" y="26">기다리기 (기본)</text>
<circle class="bad" cx="80" cy="76" r="26"/><use class="ic" href="#i-warehouse" x="63" y="59" width="34" height="34"/>
<text class="chip" x="80" y="118">멈춘 리더</text>
<path class="line dash" d="M114,76 L270,76" marker-end="url(#rp6)"/><text class="chip" x="192" y="62">돌아오길 기다려요</text>
<circle class="box" cx="300" cy="76" r="20"/><use class="ic" href="#i-package" x="287" y="63" width="26" height="26"/>
<text class="chip" x="300" y="118">소식이 남아요</text>
<rect class="line" x="6" y="146" width="388" height="130" rx="12"/>
<text class="label center" x="200" y="166">뒤처진 사본을 리더로 뽑기 (unclean)</text>
<circle class="kafka" cx="80" cy="216" r="26"/><use class="ic" href="#i-warehouse" x="63" y="199" width="34" height="34"/>
<text class="chip" x="80" y="258">뒤처진 사본</text>
<path class="line" d="M114,216 L270,216" marker-end="url(#rp6)"/><text class="chip" x="192" y="202">리더로 골라요</text>
<circle class="line dash" cx="300" cy="216" r="20"/><use class="ic" href="#i-package" x="287" y="203" width="26" height="26"/>
<text class="alert" x="300" y="258">일부가 없어요</text>
</svg>
<ol class="steps">
<li>안전한 사본이 없으면 기본은 마지막 리더를 기다려요</li>
<li>뒤처진 사본엔 접수증 준 소식이 없을 수 있어요</li>
<li>Kafka 4.1에서 이 뽑기는 기본으로 꺼져 있어요</li>
</ol>
<p class="more">참고: <a href="https://kafka.apache.org/41/operations/eligible-leader-replicas/">Kafka 4.1: ELR과 선출 순서</a> · <a href="https://kafka.apache.org/41/configuration/broker-configs/#brokerconfigs_unclean.leader.election.enable">unclean.leader.election.enable</a></p>
</section>

<section class="slide">
<h3>잃지 않으려면 세 설정을 함께 맞춰요</h3>
<svg class="dg" viewBox="0 0 400 170" role="img" aria-label="함께 맞출 설정 세 가지 그림. 사본 3개는 복제 계수, 명단 최소 2는 min.insync.replicas, 다 적고 접수는 acks=all이다">
<circle class="kafka" cx="70" cy="44" r="18"/><use class="ic" href="#i-warehouse" x="58" y="32" width="24" height="24"/>
<circle class="kafka" cx="44" cy="88" r="18"/><use class="ic" href="#i-warehouse" x="32" y="76" width="24" height="24"/>
<circle class="kafka" cx="96" cy="88" r="18"/><use class="ic" href="#i-warehouse" x="84" y="76" width="24" height="24"/>
<text class="big" x="70" y="130">사본 3개</text><text class="small" x="70" y="152">복제 계수</text>
<circle class="kafka" cx="200" cy="64" r="40"/><use class="ic" href="#i-list-checks" x="176" y="40" width="48" height="48"/>
<text class="big" x="200" y="130">명단 최소 2</text><text class="small mono" x="200" y="152">min.insync.replicas</text>
<circle class="kafka" cx="330" cy="64" r="40"/><use class="ic" href="#i-receipt" x="306" y="40" width="48" height="48"/>
<text class="big" x="330" y="130">다 적고 접수</text><text class="small mono" x="330" y="152">acks=all</text>
</svg>
<ol class="steps">
<li>한 곳이 멈춰도 잃지 않고 접수를 이어 가요</li>
<li>최소 수를 3으로 올리면 한 곳만 멈춰도 막혀요</li>
<li>기본(최소 1)은 리더 혼자여도 받아서 잃을 수 있어요</li>
</ol>
<p class="more">기본값은 Kafka 4.1 기준이에요 · Kafka 문서가 드는 흔한 조합이에요 · 참고: <a href="https://kafka.apache.org/41/configuration/broker-configs/#brokerconfigs_min.insync.replicas">Kafka 4.1: min.insync.replicas</a></p>
</section>
</div>

</div>
