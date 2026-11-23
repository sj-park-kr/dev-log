---
layout: post
title: "선반이 꽉 차면 어떻게 할까? 택배 물류센터로 이해하는 Kafka 보관과 정리"
description: "그림으로 보는 Kafka 보관과 정리: 읽어도 남는 기록을 언제 지우는지, 오래된 세그먼트를 통째로 버리는 보관 한도, 키별 최신 값을 남기는 로그 컴팩션, 삭제를 알리는 톰스톤, 정리 방법을 고를 때 조심할 점을 동화책처럼 설명합니다."
date: 2026-11-15 15:00:00 +0900
series: kafka
episode: 6
summary: "읽은 소식도 남겨 두되 오래된 단을 통째로 버리거나 키별 최신 상태를 남겨요. 무엇을 다시 읽어야 하는지가 정리 방법을 결정해요."
youtube: YTL22xtEngI
---

<div class="lesson lesson-hierarchy storybook">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: https://cdn.jsdelivr.net/npm/lucide-static@1.25.0/icons/ (ISC). 라이선스: assets/icons/LICENSE-lucide.txt. 공통 사물은 Kafka 1편과 같은 아이콘이며 안내문(file-text), 폐기 표지(trash-2), 기간(timer), 덜어내기(list-filter), 저장소(database)를 추가. -->
<symbol id="i-store" viewBox="0 0 24 24"><path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"/><path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244"/><path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"/></symbol>
<symbol id="i-package" viewBox="0 0 24 24"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/></symbol>
<symbol id="i-user-round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></symbol>
<symbol id="i-file-text" viewBox="0 0 24 24"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></symbol>
<symbol id="i-trash-2" viewBox="0 0 24 24"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></symbol>
<symbol id="i-timer" viewBox="0 0 24 24"><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></symbol>
<symbol id="i-list-filter" viewBox="0 0 24 24"><path d="M2 5h20"/><path d="M6 12h12"/><path d="M9 19h6"/></symbol>
<symbol id="i-database" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></symbol>
</defs>
</svg>

<div class="slide-group">
<h2 class="slide-group-title">문제: 읽어도 남기면 선반이 차요</h2>

<section class="slide">
<h3>읽어도 남기면 선반이 가득 차요</h3>
<svg class="dg" viewBox="0 0 400 230" role="img" aria-label="가게(프로듀서)가 주문 선반에 상자를 계속 맡기고 담당자(컨슈머)는 읽기만 해서 상자가 선반에 남아 선반이 가득 찬 그림">
<defs><marker id="rc1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M84,100 L112,100" marker-end="url(#rc1)"/>
<path class="line" d="M314,100 L288,100" marker-end="url(#rc1)"/>
<circle class="box" cx="50" cy="100" r="32"/><use class="ic" href="#i-store" x="28" y="78" width="44" height="44"/>
<text class="big" x="50" y="156">가게</text><text class="small" x="50" y="176">프로듀서</text>
<rect class="line" x="116" y="12" width="168" height="206" rx="12"/>
<text class="label center" x="200" y="34">주문 선반</text>
<circle class="new" cx="152" cy="68" r="18"/><use class="ic" href="#i-package" x="139" y="55" width="26" height="26"/>
<circle class="new" cx="200" cy="68" r="18"/><use class="ic" href="#i-package" x="187" y="55" width="26" height="26"/>
<circle class="new" cx="248" cy="68" r="18"/><use class="ic" href="#i-package" x="235" y="55" width="26" height="26"/>
<circle class="new" cx="152" cy="114" r="18"/><use class="ic" href="#i-package" x="139" y="101" width="26" height="26"/>
<circle class="new" cx="200" cy="114" r="18"/><use class="ic" href="#i-package" x="187" y="101" width="26" height="26"/>
<circle class="new" cx="248" cy="114" r="18"/><use class="ic" href="#i-package" x="235" y="101" width="26" height="26"/>
<circle class="new" cx="152" cy="160" r="18"/><use class="ic" href="#i-package" x="139" y="147" width="26" height="26"/>
<circle class="new" cx="200" cy="160" r="18"/><use class="ic" href="#i-package" x="187" y="147" width="26" height="26"/>
<circle class="bad blink" cx="248" cy="160" r="18"/><use class="ic" href="#i-package" x="235" y="147" width="26" height="26"/>
<text class="alert" x="200" y="204">자리가 모자라요</text>
<circle class="box" cx="350" cy="100" r="32"/><use class="ic" href="#i-user-round" x="328" y="78" width="44" height="44"/>
<text class="big" x="350" y="156">담당자</text><text class="small" x="350" y="176">컨슈머</text>
<circle class="packet" r="5"><animateMotion dur="1.4s" repeatCount="indefinite" path="M84,100 L112,100"/></circle>
</svg>
<ol class="steps">
<li>담당자는 내용만 읽고 상자는 선반(토픽)에 남겨요</li>
<li>가게는 새 소식을 쉬지 않고 맡겨요</li>
<li>그래서 언젠가는 오래된 소식을 치워야 해요</li>
</ol>
<p class="more">읽어도 지우지 않는 기록은 <a href="{{ '/2026/11/15/why-kafka/' | relative_url }}">1편</a>에서 봐요</p>
</section>

<section class="slide">
<h3>센터는 읽었는지 보지 않고 기간으로 지워요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="주문 선반의 한 칸에서 0번부터 2번 소식은 기간이 지나 지워졌고 3번부터 6번만 남았다. 오래 쉰 담당자는 아직 1번부터 읽을 차례였지만 그 소식은 이미 없다. 번호는 설명용 예시다">
<text class="label center" x="200" y="22">주문 선반의 한 칸</text>
<circle class="line dash" cx="44" cy="66" r="18"/><text class="chip" x="44" y="104">0</text>
<circle class="line dash" cx="96" cy="66" r="18"/><text class="chip" x="96" y="104">1</text>
<circle class="line dash" cx="148" cy="66" r="18"/><text class="chip" x="148" y="104">2</text>
<circle class="new" cx="200" cy="66" r="18"/><use class="ic" href="#i-package" x="187" y="53" width="26" height="26"/><text class="chip" x="200" y="104">3</text>
<circle class="new" cx="252" cy="66" r="18"/><use class="ic" href="#i-package" x="239" y="53" width="26" height="26"/><text class="chip" x="252" y="104">4</text>
<circle class="new" cx="304" cy="66" r="18"/><use class="ic" href="#i-package" x="291" y="53" width="26" height="26"/><text class="chip" x="304" y="104">5</text>
<circle class="new" cx="356" cy="66" r="18"/><use class="ic" href="#i-package" x="343" y="53" width="26" height="26"/><text class="chip" x="356" y="104">6</text>
<path class="line" d="M26,116 L26,122 L166,122 L166,116"/>
<text class="alert" x="96" y="142">기간이 지나 지웠어요</text>
<circle class="bad" cx="96" cy="196" r="28"/><use class="ic" href="#i-user-round" x="76" y="176" width="40" height="40"/>
<text class="chip" x="136" y="190" style="text-anchor:start">1번부터 읽을 차례</text>
<text class="small" x="136" y="210" style="text-anchor:start">오래 쉬었어요</text>
</svg>
<ol class="steps">
<li>용량 한도를 넘어도 지워요 (보관 정책 retention)</li>
<li>오래 쉬면 못 읽은 소식도 지워져요 (예시)</li>
<li>지워진 소식은 다시 받을 수 없어요</li>
</ol>
</section>

<details class="origin">
<summary>더 알아보기: 누가 왜 만들었을까?</summary>
<p>2011년 LinkedIn의 제이 크렙스(Jay Kreps), 네하 나크헤데(Neha Narkhede), 준 라오(Jun Rao)가 발표한 Kafka 논문에는 이미 읽은 메시지도 일정 기간 보관하고 오래된 기록 파일을 묶음째 지우는 설계가 나와요. 여러 서비스가 각자의 속도로 읽고 다시 읽으면서도 저장 공간을 되찾으려는 방법이었어요.</p>
<p>컴팩션은 같은 회사에서 데이터가 바뀐 소식을 전하던 시스템에서 영감을 받았어요. 서비스는 다시 켜지면 지금 상태부터 알아야 해요. 오래 안 바뀐 항목도 지금 상태의 일부라서 기간으로만 지우면 부족했어요.</p>
<p>retention은 보관을 뜻하고 compaction은 불필요한 옛 기록을 덜어 더 작게 만든다는 뜻이에요.</p>
<p>참고: <a href="https://www.microsoft.com/en-us/research/wp-content/uploads/2017/09/Kafka.pdf">2011년 Kafka 논문: 오래된 기록의 보관</a> · <a href="https://kafka.apache.org/41/design/design/#log-compaction">Apache Kafka 4.1: 현재 상태를 복구하려는 이유</a></p>
</details>
</div>

<div class="slide-group">
<h2 class="slide-group-title">보관 한도: 오래된 단을 통째로 버려요</h2>

<div class="slide-with-question">
<section class="slide">
<h3>기간이 지난 단은 통째로 버려요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="칸 0(파티션)의 기록이 단 0, 단 1, 쓰는 중인 단 2(세그먼트)로 나뉘어 있고 기간이 지난 단 0은 상자 세 개째 통째로 버리며 단 1과 쓰는 중인 단 2는 남기는 그림. 단 크기와 번호는 설명용 예시다">
<rect class="line" x="5" y="5" width="390" height="190" rx="12"/>
<text class="label center" x="200" y="27">칸 0 (파티션) 안의 단 세 개</text>
<rect class="line dash" x="16" y="42" width="112" height="108" rx="10"/><text class="label center" x="72" y="62">단 0</text>
<circle class="bad" cx="38" cy="98" r="16"/><use class="ic" href="#i-package" x="27" y="87" width="22" height="22"/><text class="chip" x="38" y="132">0</text>
<circle class="bad" cx="72" cy="98" r="16"/><use class="ic" href="#i-package" x="61" y="87" width="22" height="22"/><text class="chip" x="72" y="132">1</text>
<circle class="bad" cx="106" cy="98" r="16"/><use class="ic" href="#i-package" x="95" y="87" width="22" height="22"/><text class="chip" x="106" y="132">2</text>
<rect class="line" x="144" y="42" width="112" height="108" rx="10"/><text class="label center" x="200" y="62">단 1</text>
<circle class="new" cx="166" cy="98" r="16"/><use class="ic" href="#i-package" x="155" y="87" width="22" height="22"/><text class="chip" x="166" y="132">3</text>
<circle class="new" cx="200" cy="98" r="16"/><use class="ic" href="#i-package" x="189" y="87" width="22" height="22"/><text class="chip" x="200" y="132">4</text>
<circle class="new" cx="234" cy="98" r="16"/><use class="ic" href="#i-package" x="223" y="87" width="22" height="22"/><text class="chip" x="234" y="132">5</text>
<rect class="line" x="272" y="42" width="112" height="108" rx="10"/><text class="label center" x="328" y="62">단 2</text>
<circle class="new" cx="294" cy="98" r="16"/><use class="ic" href="#i-package" x="283" y="87" width="22" height="22"/><text class="chip" x="294" y="132">6</text>
<circle class="new" cx="328" cy="98" r="16"/><use class="ic" href="#i-package" x="317" y="87" width="22" height="22"/><text class="chip" x="328" y="132">7</text>
<text class="alert" x="72" y="176">통째로 버려요</text>
<text class="chip" x="328" y="176">쓰는 중</text>
</svg>
<ol class="steps">
<li>기록을 단(세그먼트)으로 나눠 통째로 지워요</li>
<li>단 안의 가장 새 소식도 기본 7일이 지나면 단을 버려요</li>
<li>용량 한도를 걸면 칸마다 따로 재요</li>
</ol>
<p class="more">기본값은 Kafka 4.1 기준이에요 · 참고: <a href="https://kafka.apache.org/41/configuration/topic-configs/#retention.ms">retention.ms</a> · <a href="https://kafka.apache.org/41/configuration/topic-configs/#retention.bytes">retention.bytes</a> · <a href="https://kafka.apache.org/41/implementation/log/">세그먼트째 지우기</a></p>
</section>
<aside class="author-questions" aria-label="작성자 질문 목록">
<details class="author-question">
<summary>Q. 7일 지난 기록만 지우면 되지 왜 굳이 단으로 나눠요?</summary>
<p>A. 파일은 앞부분만 잘라내기 어려워서 파일 하나에 다 쓰면 오래된 줄을 지울 때마다 남은 기록을 새 파일로 다시 써야 해요. 단 파일로 나눠 두면 기한이 지난 단 파일만 지워서 금방 끝나요. 대신 단 안의 가장 새 소식이 기준이라 옛 소식은 7일보다 조금 더 남을 수 있어요.</p>
<p>참고: <a href="https://kafka.apache.org/41/configuration/topic-configs/#segment.bytes">Kafka 4.1: 정리는 늘 파일 하나씩 해요</a> · <a href="https://kafka.apache.org/41/implementation/log/">세그먼트째 지우기</a></p>
</details>
</aside>
</div>

<section class="slide">
<h3>읽을 자리가 지워졌으면 시작 규칙을 따라요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="주문 선반의 한 칸에서 0번부터 2번은 지워졌고 담당자는 1번을 달라고 한다. 시작 규칙이 earliest면 남은 맨 앞인 3번으로, latest면 기록의 끝으로 옮겨 새 소식만 읽는 그림. 번호는 설명용 예시다">
<defs><marker id="rc2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="label center" x="200" y="22">주문 선반의 한 칸</text>
<circle class="line dash" cx="40" cy="66" r="18"/><text class="chip" x="40" y="104">0</text>
<circle class="line dash" cx="88" cy="66" r="18"/><text class="chip" x="88" y="104">1</text>
<circle class="line dash" cx="136" cy="66" r="18"/><text class="chip" x="136" y="104">2</text>
<circle class="new" cx="184" cy="66" r="18"/><use class="ic" href="#i-package" x="171" y="53" width="26" height="26"/><text class="chip" x="184" y="104">3</text>
<circle class="new" cx="232" cy="66" r="18"/><use class="ic" href="#i-package" x="219" y="53" width="26" height="26"/><text class="chip" x="232" y="104">4</text>
<circle class="new" cx="280" cy="66" r="18"/><use class="ic" href="#i-package" x="267" y="53" width="26" height="26"/><text class="chip" x="280" y="104">5</text>
<circle class="new" cx="328" cy="66" r="18"/><use class="ic" href="#i-package" x="315" y="53" width="26" height="26"/><text class="chip" x="328" y="104">6</text>
<path class="line dash" d="M364,44 L364,90"/>
<path class="line" d="M184,142 L184,110" marker-end="url(#rc2)"/>
<text class="chip mono" x="184" y="158">earliest</text><text class="chip" x="184" y="180">남은 맨 앞</text>
<path class="line" d="M364,142 L364,96" marker-end="url(#rc2)"/>
<text class="chip mono" x="364" y="158">latest</text><text class="chip" x="364" y="180">끝</text>
<circle class="bad" cx="60" cy="196" r="26"/><use class="ic" href="#i-user-round" x="42" y="178" width="36" height="36"/>
<text class="chip" x="60" y="240">1번 주세요</text>
<text class="alert" x="88" y="132">지워졌어요</text>
</svg>
<ol class="steps">
<li>이어 읽을 자리(오프셋)가 이미 지워졌어요 (예시)</li>
<li>담당자는 시작 규칙에 따라 자리를 옮겨요</li>
<li>지워진 소식이 무엇이었는지는 알려 주지 않아요</li>
</ol>
<p class="more">시작 규칙(auto.offset.reset)과 커밋한 자리는 <a href="{{ '/2026/11/15/consumer-group/' | relative_url }}">4편 컨슈머 그룹</a>에서 봐요 · 참고: <a href="https://kafka.apache.org/41/configuration/consumer-configs/#auto.offset.reset">Kafka 4.1: 읽을 위치가 사라졌을 때의 시작 규칙</a></p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">컴팩션: 키마다 마지막 값만 남겨요</h2>

<section class="slide">
<h3>같은 키는 마지막 값만 남겨요</h3>
<svg class="dg" viewBox="0 0 400 240" role="img" aria-label="칸 0에 용산 0, 강남 1, 용산 2, 강남 3 안내문이 있고 정리 뒤에는 동네마다 마지막인 용산 2와 강남 3만 원래 자리에 남는 그림. 번호는 설명용 예시다">
<text class="label center" x="200" y="20">정리 전 · 동네별 배송 안내</text>
<circle class="bad" cx="56" cy="62" r="18"/><use class="ic" href="#i-file-text" x="43" y="49" width="26" height="26"/><text class="chip" x="56" y="98">0 용산</text>
<circle class="bad" cx="152" cy="62" r="18"/><use class="ic" href="#i-file-text" x="139" y="49" width="26" height="26"/><text class="chip" x="152" y="98">1 강남</text>
<circle class="new" cx="248" cy="62" r="18"/><use class="ic" href="#i-file-text" x="235" y="49" width="26" height="26"/><text class="chip" x="248" y="98">2 용산</text>
<circle class="new" cx="344" cy="62" r="18"/><use class="ic" href="#i-file-text" x="331" y="49" width="26" height="26"/><text class="chip" x="344" y="98">3 강남</text>
<path class="line dash" d="M10,120 L390,120"/>
<text class="label center" x="200" y="146">정리 뒤</text>
<text class="alert" x="104" y="192">옛 안내는 덜어내요</text>
<circle class="new" cx="248" cy="186" r="18"/><use class="ic" href="#i-file-text" x="235" y="173" width="26" height="26"/><text class="chip" x="248" y="222">2 용산</text>
<circle class="new" cx="344" cy="186" r="18"/><use class="ic" href="#i-file-text" x="331" y="173" width="26" height="26"/><text class="chip" x="344" y="222">3 강남</text>
</svg>
<ol class="steps">
<li>동네 이름이 키이고 안내가 값이에요 (예시)</li>
<li>키마다 마지막 값만 남기는 정리(컴팩션)예요</li>
<li>새로 켠 담당자가 지금 안내를 빨리 알아요</li>
</ol>
<p class="more">참고: <a href="https://kafka.apache.org/41/design/design/#log-compaction">Apache Kafka 4.1: 컴팩션</a></p>
</section>

<section class="slide">
<h3>남은 소식의 번호와 순서는 그대로예요</h3>
<svg class="dg" viewBox="0 0 400 230" role="img" aria-label="컴팩션 뒤 0번과 1번은 빈 자리이고 2번 용산과 3번 강남이 원래 번호로 남았다. 담당자가 1번을 달라고 하면 다음 남은 2번부터 받는 그림. 번호와 동네는 설명용 예시다">
<defs><marker id="rc3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="label center" x="200" y="20">컴팩션 뒤의 칸 0</text>
<circle class="line dash" cx="56" cy="62" r="18"/><text class="chip" x="56" y="98">0</text>
<circle class="line dash" cx="152" cy="62" r="18"/><text class="chip" x="152" y="98">1</text>
<circle class="new" cx="248" cy="62" r="18"/><use class="ic" href="#i-file-text" x="235" y="49" width="26" height="26"/><text class="chip" x="248" y="98">2 용산</text>
<circle class="new" cx="344" cy="62" r="18"/><use class="ic" href="#i-file-text" x="331" y="49" width="26" height="26"/><text class="chip" x="344" y="98">3 강남</text>
<path class="line dash" d="M152,150 L152,110" marker-end="url(#rc3)"/>
<path class="line" d="M178,170 Q236,160 246,110" marker-end="url(#rc3)"/>
<circle class="box" cx="152" cy="176" r="24"/><use class="ic" href="#i-user-round" x="136" y="160" width="32" height="32"/>
<text class="chip" x="152" y="218">1번 주세요</text>
<text class="chip" x="300" y="176">2번부터 받아요</text>
<circle class="packet" r="5"><animateMotion dur="1.6s" repeatCount="indefinite" path="M178,170 Q236,160 246,110"/></circle>
</svg>
<ol class="steps">
<li>지워진 번호를 달라면 다음 남은 것부터 받아요 (예시)</li>
<li>남은 소식끼리 차례는 바뀌지 않아요</li>
</ol>
<p class="more">같은 키가 같은 칸에 모이는 이유는 <a href="{{ '/2026/11/15/topic-partition/' | relative_url }}">2편</a>에서 봐요 · 참고: <a href="https://kafka.apache.org/41/design/design/#log-compaction-basics">Kafka 4.1: 컴팩션과 오프셋 보장</a></p>
</section>

<section class="slide">
<h3>정리는 틈틈이 해서 바로 사라지지 않아요</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="칸 0의 닫힌 단 0에서는 옛 용산 0을 덜어냈지만 강남 1은 남아 있다. 새 강남 3과 4는 쓰는 중인 단 1에 있어서 아직 정리하지 않아 옛 강남 1과 3이 잠시 함께 남는 그림. 번호와 동네는 설명용 예시다">
<rect class="line" x="5" y="5" width="390" height="200" rx="12"/>
<text class="label center" x="200" y="27">칸 0</text>
<rect class="line" x="16" y="42" width="220" height="108" rx="10"/><text class="label center" x="126" y="62">단 0</text>
<circle class="line dash" cx="50" cy="98" r="18"/><text class="chip" x="50" y="134">0 용산</text>
<circle class="bad" cx="126" cy="98" r="18"/><use class="ic" href="#i-file-text" x="113" y="85" width="26" height="26"/><text class="chip" x="126" y="134">1 강남</text>
<circle class="new" cx="202" cy="98" r="18"/><use class="ic" href="#i-file-text" x="189" y="85" width="26" height="26"/><text class="chip" x="202" y="134">2 용산</text>
<rect class="line" x="252" y="42" width="132" height="108" rx="10"/><text class="label center" x="318" y="62">단 1</text>
<circle class="bad" cx="284" cy="98" r="18"/><use class="ic" href="#i-file-text" x="271" y="85" width="26" height="26"/><text class="chip" x="284" y="134">3 강남</text>
<circle class="new" cx="352" cy="98" r="18"/><use class="ic" href="#i-file-text" x="339" y="85" width="26" height="26"/><text class="chip" x="352" y="134">4 강남</text>
<text class="chip" x="126" y="180">닫힘</text>
<text class="chip" x="318" y="180">쓰는 중</text>
</svg>
<ol class="steps">
<li>쓰는 중인 단은 지우지도 덜어내지도 않아요</li>
<li>그래서 옛 강남 안내가 잠시 남아요 (예시)</li>
<li>두 정리 모두 틈틈이 해서 정확한 시각은 없어요</li>
</ol>
<p class="more">참고: <a href="https://kafka.apache.org/41/design/design/#log-compaction-basics">Kafka 4.1: 컴팩션 동작</a> · <a href="https://kafka.apache.org/41/implementation/log/">정리 주기</a></p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>오래 안 바뀐 키도 컴팩션은 지우지 않아요</h3>
<svg class="dg" viewBox="0 0 400 272" role="img" aria-label="같은 기록 용산 0, 강남 1부터 4를 두 방식으로 나란히 정리한 그림. 위 기간 정리(delete)는 오래된 0번부터 2번을 지워 용산 안내가 하나도 남지 않는다. 아래 컴팩션(compact)은 용산 0과 마지막 강남 4를 남긴다. 번호는 설명용 예시다">
<rect class="line" x="6" y="6" width="388" height="124" rx="12"/>
<text class="label center" x="200" y="28">기간 정리 (delete)</text>
<circle class="line dash" cx="48" cy="70" r="18"/><text class="chip" x="48" y="106">0 용산</text>
<circle class="line dash" cx="124" cy="70" r="18"/><text class="chip" x="124" y="106">1 강남</text>
<circle class="line dash" cx="200" cy="70" r="18"/><text class="chip" x="200" y="106">2 강남</text>
<circle class="new" cx="276" cy="70" r="18"/><use class="ic" href="#i-file-text" x="263" y="57" width="26" height="26"/><text class="chip" x="276" y="106">3 강남</text>
<circle class="new" cx="352" cy="70" r="18"/><use class="ic" href="#i-file-text" x="339" y="57" width="26" height="26"/><text class="chip" x="352" y="106">4 강남</text>
<rect class="line" x="6" y="142" width="388" height="124" rx="12"/>
<text class="label center" x="200" y="164">컴팩션 (compact)</text>
<circle class="new" cx="48" cy="206" r="18"/><use class="ic" href="#i-file-text" x="35" y="193" width="26" height="26"/><text class="chip" x="48" y="242">0 용산</text>
<circle class="line dash" cx="124" cy="206" r="18"/><text class="chip" x="124" y="242">1 강남</text>
<circle class="line dash" cx="200" cy="206" r="18"/><text class="chip" x="200" y="242">2 강남</text>
<circle class="line dash" cx="276" cy="206" r="18"/><text class="chip" x="276" y="242">3 강남</text>
<circle class="new" cx="352" cy="206" r="18"/><use class="ic" href="#i-file-text" x="339" y="193" width="26" height="26"/><text class="chip" x="352" y="242">4 강남</text>
</svg>
<ol class="steps">
<li>기간 정리는 용산의 마지막 안내도 버려요 (예시)</li>
<li>컴팩션은 새 용산 안내가 올 때까지 남겨요</li>
<li>토픽마다 고르고 기본은 기간 정리예요</li>
</ol>
<p class="more">참고: <a href="https://kafka.apache.org/41/configuration/topic-configs/#cleanup.policy">Kafka 4.1: cleanup.policy</a></p>
</section>
<aside class="author-questions" aria-label="작성자 질문 목록">
<details class="author-question">
<summary>Q. 컴팩션이랑 기간 정리(retention)는 겹치는 거 아니에요?</summary>
<p>A. 기간 정리는 언제 썼는지 보고 단을 통째로 버리고, 컴팩션은 같은 키의 마지막 값인지 보고 옛 값만 덜어내요. 그래서 컴팩션만 고른 토픽은 7일이 지나도 지우지 않아요. 둘 다 필요하면 마지막 장처럼 두 방식을 함께 켜요.</p>
<p>참고: <a href="https://kafka.apache.org/41/configuration/topic-configs/#retention.ms">Kafka 4.1: retention.ms는 delete 정책에 적용</a> · <a href="https://kafka.apache.org/41/configuration/topic-configs/#cleanup.policy">cleanup.policy</a></p>
</details>
</aside>
</div>
</div>

<div class="slide-group">
<h2 class="slide-group-title">톰스톤: 컴팩션에서 키를 지우는 법</h2>

<div class="slide-with-question">
<section class="slide">
<h3>컴팩션에선 가게가 빈 안내로 키를 지워요</h3>
<svg class="dg" viewBox="0 0 400 332" role="img" aria-label="칸 0을 세 단계 카드로 위아래에 그린 그림. 첫 카드는 가게(프로듀서)가 용산 0, 강남 1, 용산 2 뒤에 용산의 빈 안내(톰스톤) 3을 맡긴다. 둘째 카드는 컴팩션 뒤 강남 1과 톰스톤 3이 남는다. 셋째 카드는 정해 둔 시간이 지나 톰스톤도 치우고 강남 1만 남는다. 번호와 동네는 설명용 예시다">
<rect class="line" x="6" y="6" width="388" height="100" rx="12"/>
<text class="label center" x="200" y="28">① 가게가 빈 안내를 맡겨요</text>
<circle class="bad" cx="50" cy="58" r="18"/><use class="ic" href="#i-file-text" x="37" y="45" width="26" height="26"/><text class="chip" x="50" y="94">0 용산</text>
<circle class="new" cx="140" cy="58" r="18"/><use class="ic" href="#i-file-text" x="127" y="45" width="26" height="26"/><text class="chip" x="140" y="94">1 강남</text>
<circle class="bad" cx="230" cy="58" r="18"/><use class="ic" href="#i-file-text" x="217" y="45" width="26" height="26"/><text class="chip" x="230" y="94">2 용산</text>
<circle class="bad" cx="320" cy="58" r="18"/><use class="ic" href="#i-trash-2" x="307" y="45" width="26" height="26"/><text class="chip" x="320" y="94">3 용산 톰스톤</text>
<rect class="line" x="6" y="116" width="388" height="100" rx="12"/>
<text class="label center" x="200" y="138">② 옛 용산 안내를 치워요</text>
<circle class="new" cx="140" cy="168" r="18"/><use class="ic" href="#i-file-text" x="127" y="155" width="26" height="26"/><text class="chip" x="140" y="204">1 강남</text>
<circle class="bad" cx="320" cy="168" r="18"/><use class="ic" href="#i-trash-2" x="307" y="155" width="26" height="26"/><text class="chip" x="320" y="204">3 용산 톰스톤</text>
<rect class="line" x="6" y="226" width="388" height="100" rx="12"/>
<text class="label center" x="200" y="248">③ 나중엔 빈 안내도 치워요</text>
<circle class="new" cx="140" cy="278" r="18"/><use class="ic" href="#i-file-text" x="127" y="265" width="26" height="26"/><text class="chip" x="140" y="314">1 강남</text>
</svg>
<ol class="steps">
<li>가게가 값만 비워(null) 보낸 소식이 톰스톤이에요</li>
<li>마지막 값은 늘 남아서 지운다는 표시가 필요해요</li>
<li>켜는 설정은 없고 남길 기간만 정해요 (기본 하루)</li>
</ol>
<p class="more">기본값은 Kafka 4.1 기준이에요 · 참고: <a href="https://kafka.apache.org/41/design/design/#log-compaction-basics">Kafka 4.1: 삭제 표시와 컴팩션</a> · <a href="https://kafka.apache.org/41/configuration/topic-configs/#delete.retention.ms">delete.retention.ms</a></p>
</section>
<aside class="author-questions" aria-label="작성자 질문과 초보 독자 질문 목록">
<details class="author-question">
<summary>Q. 톰스톤은 누가 설정해요? 따로 켜는 기능인가요?</summary>
<p>A. 켜는 기능이 아니라 가게(프로듀서)가 같은 키에 값만 비워 보낸 소식을 부르는 이름이에요. 컴팩션이 이 소식을 지우라는 뜻으로 보고 옛 값을 치운 뒤 나중에 톰스톤도 치워요. 그래서 톰스톤은 컴팩션 토픽에서만 뜻이 있어요.</p>
<p>참고: <a href="https://kafka.apache.org/41/design/design/#log-compaction-basics">Kafka 4.1: 삭제 표시와 컴팩션</a></p>
</details>
<details class="author-question">
<summary>Q. 톰스톤이 지워지려면 컴팩션이랑 기간 정리를 둘 다 켜야 해요?</summary>
<p>A. 아니요. 컴팩션만 켜면 돼요. 7일과 하루는 서로 다른 타이머예요.</p>
<p>7일(retention.ms)은 기간 정리가 오래된 단을 버리는 타이머예요. 컴팩션만 고른 토픽에서는 이 타이머로 지우지 않아요.</p>
<p>하루(delete.retention.ms)는 컴팩션이 톰스톤을 치우는 타이머예요. 이름에 delete와 retention이 들어 있어 7일 설정과 헷갈리지만 따로 있는 설정이에요.</p>
<p>참고: <a href="https://kafka.apache.org/41/configuration/topic-configs/#delete.retention.ms">Kafka 4.1: delete.retention.ms</a></p>
</details>
<details class="author-question">
<summary>초보 독자 Q. 톰스톤은 왜 하루나 남겨요?</summary>
<p>A. 늦게 읽는 담당자도 지우라는 표지를 보게 하려는 거예요. 톰스톤을 바로 치우면 그 뒤에 읽은 담당자는 용산이 지워졌다는 걸 알 수 없어요. 그래서 처음부터 다시 읽는 담당자는 이 시간 안에 끝까지 읽어야 해요.</p>
<p>참고: <a href="https://kafka.apache.org/41/configuration/topic-configs/#delete.retention.ms">Kafka 4.1: delete.retention.ms</a></p>
</details>
</aside>
</div>

<div class="slide-with-question">
<section class="slide">
<h3>톰스톤을 놓치면 낡은 안내가 남아요</h3>
<svg class="dg" viewBox="0 0 400 272" role="img" aria-label="담당자가 읽는 때를 두 경우로 나란히 비교한 그림. 위는 용산 톰스톤이 남아 있는 하루 안에 그것을 읽고 담당자 저장소(DB)의 용산 안내를 지운다. 아래는 톰스톤이 이미 치워진 뒤에 읽어서 읽을 표지가 없고 저장소에는 낡은 용산 안내가 그대로 남는다. 동네는 설명용 예시다">
<defs><marker id="rc4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="6" y="6" width="388" height="124" rx="12"/>
<text class="label center" x="200" y="28">하루 안에 톰스톤을 읽었어요</text>
<circle class="bad" cx="90" cy="76" r="22"/><use class="ic" href="#i-trash-2" x="74" y="60" width="32" height="32"/><text class="chip" x="90" y="116">용산 톰스톤</text>
<path class="line" d="M116,76 L196,76" marker-end="url(#rc4)"/>
<circle class="box" cx="226" cy="76" r="24"/><use class="ic" href="#i-user-round" x="210" y="60" width="32" height="32"/><text class="chip" x="226" y="116">담당자</text>
<path class="line" d="M254,76 L306,76" marker-end="url(#rc4)"/>
<circle class="box" cx="338" cy="76" r="26"/><use class="ic" href="#i-database" x="320" y="58" width="36" height="36"/><text class="chip" x="338" y="116">저장소 용산 지움</text>
<rect class="line" x="6" y="142" width="388" height="124" rx="12"/>
<text class="label center" x="200" y="164">톰스톤이 치워진 뒤에 읽었어요</text>
<circle class="line dash" cx="90" cy="212" r="22"/><text class="chip" x="90" y="252">표지 없음</text>
<path class="line dash" d="M116,212 L196,212" marker-end="url(#rc4)"/>
<circle class="box" cx="226" cy="212" r="24"/><use class="ic" href="#i-user-round" x="210" y="196" width="32" height="32"/><text class="chip" x="226" y="252">담당자</text>
<path class="line" d="M254,212 L306,212" marker-end="url(#rc4)"/>
<circle class="bad blink" cx="338" cy="212" r="26"/><use class="ic" href="#i-database" x="320" y="194" width="36" height="36"/><text class="alert" x="338" y="252">낡은 용산 남음</text>
</svg>
<ol class="steps">
<li>저장소(DB)는 담당자가 지금 안내를 적어 두는 곳이에요</li>
<li>톰스톤을 읽어야 저장소에서도 용산을 지워요</li>
<li>놓쳤다면 저장소를 비우고 처음부터 다시 읽어요</li>
</ol>
<p class="more">참고: <a href="https://kafka.apache.org/41/configuration/topic-configs/#delete.retention.ms">Kafka 4.1: 톰스톤 보관과 컨슈머의 복구 범위</a></p>
</section>
<aside class="author-questions" aria-label="작성자 질문 목록">
<details class="author-question">
<summary>Q. 갑자기 저장소(DB)는 왜 나와요?</summary>
<p>A. 담당자는 손님이 물을 때마다 선반을 처음부터 다시 읽지 않아요. 지금 안내만 자기 저장소(DB)에 적어 두고 거기서 바로 답해요. 그래서 톰스톤을 놓치면 선반에선 용산이 사라져도 저장소에는 끝난 용산 안내가 그대로 남아요.</p>
<p>저장소에 적어 두는 방식은 <a href="{{ '/2026/11/15/delivery-semantics/' | relative_url }}">7편 전달 보장</a>에서도 나와요</p>
</details>
</aside>
</div>
</div>

<div class="slide-group">
<h2 class="slide-group-title">판단: 무엇을 쓰고 무엇을 조심해요?</h2>

<section class="slide">
<h3>이럴 땐 기간 정리, 이럴 땐 컴팩션을 써요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="왼쪽 기간 정리(delete) 카드에는 주문·클릭 기록, 최근 기간만 다시 읽어요, 용산 안내가 바뀐 기록 전부가 있고 오른쪽 컴팩션(compact) 카드에는 용산의 마지막 안내, 켤 때 상태를 복구해요, 옛 값은 필요 없어요가 있는 그림">
<rect class="line" x="6" y="6" width="190" height="238" rx="12"/>
<circle class="box" cx="101" cy="40" r="20"/><use class="ic" href="#i-timer" x="89" y="28" width="24" height="24"/>
<text class="label center" x="101" y="80">기간 정리 (delete)</text>
<rect class="box" x="20" y="102" width="162" height="34" rx="8"/><text class="chip" x="101" y="119">주문·클릭 기록</text>
<rect class="box" x="20" y="146" width="162" height="34" rx="8"/><text class="chip" x="101" y="163">최근 기간만 다시 읽어요</text>
<rect class="box" x="20" y="190" width="162" height="34" rx="8"/><text class="chip" x="101" y="207">용산 안내 이력 전부</text>
<rect class="line" x="204" y="6" width="190" height="238" rx="12"/>
<circle class="box" cx="299" cy="40" r="20"/><use class="ic" href="#i-list-filter" x="287" y="28" width="24" height="24"/>
<text class="label center" x="299" y="80">컴팩션 (compact)</text>
<rect class="box" x="218" y="102" width="162" height="34" rx="8"/><text class="chip" x="299" y="119">용산 마지막 안내</text>
<rect class="box" x="218" y="146" width="162" height="34" rx="8"/><text class="chip" x="299" y="163">켤 때 상태를 복구해요</text>
<rect class="box" x="218" y="190" width="162" height="34" rx="8"/><text class="chip" x="299" y="207">옛 값은 필요 없어요</text>
</svg>
<ol class="steps">
<li>무엇을 다시 읽어야 하는지가 정리 방법을 정해요</li>
<li>이력과 마지막 안내가 다 필요하면 토픽을 나눠요</li>
<li>이력용 토픽도 보관 기간이 지나면 사라져요</li>
</ol>
<p class="more">참고: <a href="https://kafka.apache.org/41/design/design/#log-compaction">Apache Kafka 4.1: 토픽마다 다른 보관 방식</a></p>
</section>

<section class="slide">
<h3>두 방식을 함께 쓰면 최신 값도 지워져요</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="정리 정책 delete,compact인 칸에서 기간이 지난 단 0은 용산의 마지막 안내까지 통째로 버리고 남은 단 1에서는 옛 강남 안내만 덜어내 마지막 강남만 남는 그림. 번호는 설명용 예시다">
<rect class="line" x="5" y="5" width="390" height="200" rx="12"/>
<text class="label center mono" x="200" y="27">delete,compact</text>
<rect class="line dash" x="16" y="42" width="176" height="108" rx="10"/><text class="label center" x="104" y="62">오래된 단 0</text>
<circle class="bad" cx="66" cy="98" r="18"/><use class="ic" href="#i-file-text" x="53" y="85" width="26" height="26"/><text class="chip" x="66" y="134">0 용산</text>
<circle class="bad" cx="142" cy="98" r="18"/><use class="ic" href="#i-file-text" x="129" y="85" width="26" height="26"/><text class="chip" x="142" y="134">1 강남</text>
<rect class="line" x="208" y="42" width="176" height="108" rx="10"/><text class="label center" x="296" y="62">단 1</text>
<circle class="line dash" cx="258" cy="98" r="18"/><text class="chip" x="258" y="134">2 강남</text>
<circle class="new" cx="334" cy="98" r="18"/><use class="ic" href="#i-file-text" x="321" y="85" width="26" height="26"/><text class="chip" x="334" y="134">3 강남</text>
<text class="alert" x="104" y="180">용산 마지막 안내도 사라져요</text>
<text class="small" x="296" y="180">옛 강남만 덜어내요</text>
</svg>
<ol class="steps">
<li>오래된 단은 버리고 남은 단은 덜어내요 (예시)</li>
<li>오래 안 바뀐 키까지 치우고 싶을 때 써요</li>
<li>모든 키를 늘 복구해야 하면 함께 쓰지 않아요</li>
</ol>
<p class="more">참고: <a href="https://kafka.apache.org/41/configuration/topic-configs/#cleanup.policy">Kafka 4.1: 정리 정책의 조합</a> · <a href="https://kafka.apache.org/41/design/design/#log-compaction">컴팩션과 보관 한도</a></p>
</section>
</div>

</div>
