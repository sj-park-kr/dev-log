---
layout: post
title: "택배가 두 번 오거나 사라지면? 물류센터로 이해하는 카프카 전달 보장"
description: "Kafka의 세 가지 전달 보장을 물류센터 비유로 비교하고 처리 결과와 오프셋을 함께 확정하는 트랜잭션과 read_committed의 범위를 설명합니다."
date: 2026-11-15 15:30:00 +0900
series: kafka
episode: 7
summary: "소식이 남아 있어도 처리는 빠지거나 겹칠 수 있어요. 세 가지 약속을 비교하고 결과와 읽은 자리를 함께 확정하는 이유를 알아봐요."
---

<div class="lesson lesson-hierarchy">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 원본: Lucide lucide-static@1.25.0 (ISC). 라이선스: assets/icons/LICENSE-lucide.txt. Kafka 1편과 같은 아이콘을 써요. -->
<symbol id="i-package" viewBox="0 0 24 24"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/></symbol>
<symbol id="i-user-round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></symbol>
<symbol id="i-shelving-unit" viewBox="0 0 24 24"><path d="M12 12V9a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/><path d="M16 20v-3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/><path d="M20 22V2"/><path d="M4 12h16"/><path d="M4 20h16"/><path d="M4 2v20"/><path d="M4 4h16"/></symbol>
<symbol id="i-notebook-pen" viewBox="0 0 24 24"><path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/></symbol>
</defs>
</svg>

<div class="intro">
<p class="q">소식은 선반에 남아 있는데 왜 일을 빠뜨리거나 두 번 할까요?</p>
<p>6편에서는 소식을 언제까지 보관하고 어떻게 정리하는지 봤어요. 하지만 소식이 남아 있어도 읽는 서비스가 일하다 멈추면 아직 안 한 일을 건너뛰거나 이미 한 일을 다시 할 수 있어요.</p>
<p>3편의 재시도 중복 방지와 4편의 읽은 자리 기록을 이어 받아 <b>최대 한 번·최소 한 번·정확히 한 번</b>의 차이를 알아봐요. 이어서 Kafka 안의 처리 결과와 읽은 자리를 <b>트랜잭션</b>으로 함께 확정하는 이유와 그 보장이 닿는 범위를 살펴봐요.</p>
</div>

<div class="slide-group">
<h2 class="slide-group-title">처리의 빈틈: 소식 보관과 업무 완료는 달라요</h2>

<section class="slide">
<h3>담당자가 일을 마쳤는지는 선반만 봐서는 몰라요</h3>
<svg class="dg" viewBox="0 0 400 265" role="img" aria-label="선반의 소식은 남아 있지만 담당자의 업무와 팀 장부 기록은 어긋날 수 있어요">
<circle class="new" cx="65" cy="70" r="28"/><use class="ic" href="#i-shelving-unit" x="43" y="48" width="44" height="44"/>
<text class="chip" x="65" y="120">주문 선반</text>
<circle class="box" cx="200" cy="70" r="28"/><use class="ic" href="#i-user-round" x="178" y="48" width="44" height="44"/>
<text class="chip" x="200" y="120">재고 담당</text>
<circle class="box" cx="335" cy="70" r="28"/><use class="ic" href="#i-notebook-pen" x="313" y="48" width="44" height="44"/>
<text class="chip" x="335" y="120">팀 장부</text>
<path class="line" d="M98,70 L168,70 M232,70 L302,70"/>
<text class="label center" x="200" y="160">주문 A를 읽은 담당자가 자리를 비우면?</text>
<circle class="new" cx="95" cy="204" r="18"/><use class="ic" href="#i-package" x="82" y="191" width="26" height="26"/>
<text class="chip" x="95" y="244">내용은 남아요</text>
<circle class="bad" cx="285" cy="204" r="18"/><use class="ic" href="#i-user-round" x="272" y="191" width="26" height="26"/>
<text class="chip" x="285" y="244">일과 기록은 어긋날 수 있어요</text>
</svg>
<p class="point">소식을 보관했다고 그 소식에 따른 일까지 끝난 것은 아니에요.</p>
<p class="explain">담당자는 주문 내용을 꺼내 읽고 재고를 줄인 뒤 다음 사람이 이어 볼 장부도 남겨야 해요. 일과 장부를 따로 마치는 사이에 자리를 비우면 돌아온 담당자는 어디서 이어야 할지 헷갈려요. 선반에 상자가 있어도 이미 일했는지까지 알려 주지는 않아요.</p>
</section>

<section class="slide">
<h3>실제로는: 장애 뒤에는 저장한 오프셋부터 이어 읽어요</h3>
<svg class="dg" viewBox="0 0 400 310" role="img" aria-label="처리 전 다음 오프셋 5를 저장하면 4번이 빠지고 처리 후 커밋 전 장애가 나면 4번부터 다시 읽어요">
<text class="label" x="12" y="24">처리 전 커밋</text>
<circle class="box" cx="65" cy="75" r="28"/><use class="ic" href="#i-notebook-pen" x="43" y="53" width="44" height="44"/>
<text class="chip" x="65" y="125">다음: 5</text>
<circle class="bad" cx="200" cy="75" r="28"/><use class="ic" href="#i-user-round" x="178" y="53" width="44" height="44"/>
<text class="chip" x="200" y="125">장애</text>
<circle class="bad" cx="335" cy="75" r="28"/><use class="ic" href="#i-package" x="313" y="53" width="44" height="44"/>
<text class="chip" x="335" y="125">4번 미처리</text>
<path class="line" d="M98,75 L168,75 M232,75 L302,75"/>
<text class="label" x="12" y="157">처리 후 커밋</text>
<circle class="box" cx="65" cy="208" r="28"/><use class="ic" href="#i-user-round" x="43" y="186" width="44" height="44"/>
<text class="chip" x="65" y="258">4번 처리</text>
<circle class="bad" cx="200" cy="208" r="28"/><use class="ic" href="#i-user-round" x="178" y="186" width="44" height="44"/>
<text class="chip" x="200" y="258">장애</text>
<circle class="box" cx="335" cy="208" r="28"/><use class="ic" href="#i-notebook-pen" x="313" y="186" width="44" height="44"/>
<text class="chip" x="335" y="258">다음: 4</text>
<path class="line" d="M98,208 L168,208 M232,208 L302,208"/>
<text class="alert" x="200" y="285">앞은 4번을 건너뛰고 뒤는 4번을 다시 읽어요</text>
</svg>
<p class="point">오프셋 저장과 업무 완료 사이에 장애가 나면 유실이나 중복이 생길 수 있어요.</p>
<p class="explain">팀 장부에 다음에 읽을 자리를 저장하는 것이 4편에서 본 <b>오프셋 커밋</b>이에요. 컨슈머가 4번 처리 전에 5를 저장하고 멈추면 재시작한 서비스는 4번을 건너뛰어요. 4번을 처리한 뒤 5를 저장하기 전에 멈추면 4번부터 다시 읽어 같은 일을 또 할 수 있어요. 여기서는 메시지가 보관돼 있고 컨슈머가 저장된 위치부터 복구하는 상황을 살펴봐요.</p>
</section>

<section class="slide" id="delivery-playground" hidden>
<h3>직접 해 보기: 장부를 적는 시점만 바꿔요</h3>
<div class="pp-body">
<label for="delivery-timing">오프셋 커밋 시점</label>
<select id="delivery-timing"><option value="before">처리 전</option><option value="after">처리 후</option></select>
</div>
<p class="point">3건마다 두 작업 사이에 장애를 내는 설명용 흐름이며 실제 결과는 커밋과 처리의 순서에 따라 달라져요.</p>
<p class="explain">소식은 자동으로 도착하고 컨슈머는 장애 뒤 저장된 오프셋부터 다시 꺼내 읽어요. 조건을 바꾸면 새 비교를 시작하며 최근 소식 6건의 처리 횟수와 다음에 읽을 번호를 보여 줘요. 실제 장애는 정해진 간격으로 나지 않지만 처리 누락과 재처리가 생기는 이유는 같아요.</p>
</section>

</div>

<div class="slide-group">
<h2 class="slide-group-title">세 가지 약속: 빠뜨림과 겹침을 어디까지 막을까요</h2>

<section class="slide">
<h3>담당 팀이 주문마다 지킬 약속을 골라요</h3>
<svg class="dg" viewBox="0 0 400 260" role="img" aria-label="최대 한 번은 빠진 상자, 최소 한 번은 겹친 상자, 정확히 한 번은 주문별 하나의 상자로 처리 결과를 비교해요">
<text class="label" x="12" y="45">최대 한 번</text>
<circle class="box" cx="170" cy="40" r="18"/><use class="ic" href="#i-package" x="157" y="27" width="26" height="26"/>
<circle class="bad" cx="230" cy="40" r="18"/><use class="ic" href="#i-package" x="217" y="27" width="26" height="26"/>
<path class="line" d="M217,27 L243,53 M243,27 L217,53"/>
<text class="chip" x="170" y="69">A</text><text class="chip" x="230" y="69">B</text>
<text class="small" x="200" y="89">어떤 주문은 처리하지 못할 수 있어요</text>
<text class="label" x="12" y="125">최소 한 번</text>
<circle class="box" cx="170" cy="120" r="18"/><use class="ic" href="#i-package" x="157" y="107" width="26" height="26"/>
<circle class="box" cx="230" cy="120" r="18"/><use class="ic" href="#i-package" x="217" y="107" width="26" height="26"/>
<circle class="bad" cx="290" cy="120" r="18"/><use class="ic" href="#i-package" x="277" y="107" width="26" height="26"/>
<text class="chip" x="170" y="149">A</text><text class="chip" x="230" y="149">B</text><text class="chip" x="290" y="149">B</text>
<text class="small" x="200" y="169">같은 주문을 다시 처리할 수도 있어요</text>
<text class="label" x="12" y="205">정확히 한 번</text>
<circle class="box" cx="170" cy="200" r="18"/><use class="ic" href="#i-package" x="157" y="187" width="26" height="26"/>
<circle class="box" cx="230" cy="200" r="18"/><use class="ic" href="#i-package" x="217" y="187" width="26" height="26"/>
<text class="chip" x="170" y="229">A</text><text class="chip" x="230" y="229">B</text>
<text class="small" x="200" y="249">각 주문의 결과를 한 번만 남겨요</text>
</svg>
<p class="point">세 가지 약속은 한 주문의 결과가 빠지거나 겹쳐도 되는지에 관한 약속이에요.</p>
<p class="explain">담당 팀은 장애 뒤 확실하지 않은 주문을 다시 처리할지 결정해야 해요. 빠진 일이 더 곤란하다면 다시 처리하고 겹친 결과가 생기지 않게 대비할 수 있어요. 두 문제를 함께 막으려면 장부만 적는 것보다 더 강한 장치가 필요해요.</p>
</section>

<section class="slide">
<h3>실제로는: 처리 결과를 기준으로 세 약속을 구분해요</h3>
<table>
<thead><tr><th>약속</th><th>한 메시지의 결과</th><th>장애 뒤의 선택</th></tr></thead>
<tbody>
<tr><td>최대 한 번 · <code>at-most-once</code></td><td>0번 또는 1번</td><td>처리 전 저장한 위치를 믿고 건너뛸 수 있어요</td></tr>
<tr><td>최소 한 번 · <code>at-least-once</code></td><td>1번 이상</td><td>처리 후 위치를 저장하므로 다시 처리할 수 있어요</td></tr>
<tr><td>정확히 한 번 · <code>exactly-once</code></td><td>정해진 범위 안에 결과가 1번</td><td>결과와 읽은 자리를 함께 확정해요</td></tr>
</tbody>
</table>
<p class="point">정확히 한 번이라는 말에는 어떤 결과까지 한 번인지 범위가 따라와야 해요.</p>
<p class="explain"><b>전달 보장</b>은 장애와 복구가 있어도 메시지의 전달·처리에 대해 지키는 약속이에요. 이 글에서는 브로커에 보관된 메시지를 컨슈머가 처리해 남기는 결과를 기준으로 비교해요. 최소 한 번은 보관된 메시지를 복구 후 끝내 처리한다는 조건이며 보관 기간이 지나 사라진 메시지까지 되살리는 약속은 아니에요. 정확히 한 번도 코드 실행 자체가 한 번이라는 뜻은 아니고 다시 실행해도 보장 범위에 결과를 한 번만 남긴다는 뜻이에요.</p>
</section>

<p>참고: <a href="https://kafka.apache.org/41/design/design/#message-delivery-semantics">Apache Kafka 4.1: 세 전달 보장과 컨슈머 복구</a></p>

</div>

<div class="slide-group">
<h2 class="slide-group-title">트랜잭션: 결과와 읽은 자리를 함께 확정해요</h2>

<section class="slide">
<h3>새 소식과 장부에 같은 승인 도장을 찍어요</h3>
<svg class="dg" viewBox="0 0 400 230" role="img" aria-label="담당자가 결과 소식과 팀 장부를 하나의 묶음에 넣어 함께 승인하는 그림">
<circle class="box" cx="65" cy="108" r="28"/><use class="ic" href="#i-user-round" x="43" y="86" width="44" height="44"/>
<text class="chip" x="65" y="158">재고 담당</text>
<path class="line" d="M98,108 L155,108"/>
<rect class="line" x="160" y="14" width="230" height="192" rx="12"/>
<text class="label center" x="275" y="40">한 묶음으로 승인</text>
<circle class="new" cx="215" cy="105" r="28"/><use class="ic" href="#i-package" x="193" y="83" width="44" height="44"/>
<text class="chip" x="215" y="155">새 결과</text>
<circle class="box" cx="335" cy="105" r="28"/><use class="ic" href="#i-notebook-pen" x="313" y="83" width="44" height="44"/>
<text class="chip" x="335" y="155">팀 장부</text>
<text class="small" x="275" y="185">둘 다 승인하거나 둘 다 취소해요</text>
</svg>
<p class="point">새 결과만 남거나 장부만 앞서가지 않도록 둘을 한 묶음으로 마쳐요.</p>
<p class="explain">재고 담당이 주문을 읽고 새 선반에 재고 반영 소식을 남기는 일을 맡았다고 해요. 센터는 그 소식과 팀 장부를 따로 승인하지 않아서 교대한 담당자가 절반만 끝난 상태를 이어받지 않게 해요. 이 비유의 묶음은 실제 재고 창고의 물건까지 되돌리는 장치가 아니라 센터 안 기록에 거는 약속이에요.</p>
</section>

<section class="slide">
<h3>실제로는: 출력 메시지와 입력 오프셋을 함께 커밋해요</h3>
<svg class="dg" viewBox="0 0 400 305" role="img" aria-label="입력 토픽을 읽은 처리 서비스가 출력 메시지와 입력의 다음 오프셋을 하나의 트랜잭션으로 확정해요">
<circle class="new" cx="60" cy="65" r="28"/><use class="ic" href="#i-shelving-unit" x="38" y="43" width="44" height="44"/>
<text class="chip" x="60" y="115">입력 토픽</text>
<circle class="box" cx="200" cy="65" r="28"/><use class="ic" href="#i-user-round" x="178" y="43" width="44" height="44"/>
<text class="chip" x="200" y="115">처리 서비스</text>
<path class="line" d="M93,65 L168,65 M200,98 L200,145"/>
<text class="small" x="310" y="65">읽을 때: 컨슈머</text>
<text class="small" x="310" y="88">쓸 때: 프로듀서</text>
<rect class="line" x="12" y="150" width="376" height="128" rx="12"/>
<text class="label center" x="200" y="174">트랜잭션</text>
<circle class="new" cx="100" cy="216" r="18"/><use class="ic" href="#i-package" x="87" y="203" width="26" height="26"/>
<text class="chip" x="100" y="256">출력 토픽의 결과</text>
<circle class="box" cx="300" cy="216" r="18"/><use class="ic" href="#i-notebook-pen" x="287" y="203" width="26" height="26"/>
<text class="chip" x="300" y="256">입력의 다음 오프셋</text>
</svg>
<p class="point">Kafka 트랜잭션은 출력 메시지와 소비한 위치를 함께 확정할 수 있어요.</p>
<p class="explain"><b>트랜잭션</b>은 여러 기록을 전부 확정하거나 전부 취소하는 묶음이며 여러 토픽과 파티션의 쓰기도 묶을 수 있어요. 처리 서비스는 자동 오프셋 커밋을 끄고 트랜잭션을 쓰는 프로듀서로 출력 메시지와 입력의 다음 오프셋을 같은 묶음에 넣어요. 묶음을 취소하면 출력은 확정되지 않고 저장된 입력 위치도 전진하지 않아서 서비스를 복구한 뒤 다시 처리할 수 있어요. 같은 실행 중 취소 뒤 재처리하려면 서비스가 읽을 위치와 처리 상태를 직접 되돌려야 하며 Kafka가 컨슈머 위치를 자동으로 되감지는 않아요.</p>
</section>

<details class="origin">
<summary>더 알아보기: 누가 왜 만들었을까?</summary>
<p>Apache Kafka 개발자들이 함께 제안한 <b>KIP-98</b>은 재시도 중복을 막는 기능을 넘어 여러 파티션에 남기는 결과를 함께 확정하려고 나왔어요. Kafka 0.11.0.0부터 멱등 프로듀서와 트랜잭션을 지원해요.</p>
<p>제안 제목의 “Exactly Once Delivery and Transactional Messaging”은 정확히 한 번 전달과 트랜잭션 메시징이라는 뜻이에요. 주문을 읽고 처리한 결과를 다시 Kafka에 쓰는 서비스에서 출력과 읽은 위치가 어긋나는 문제를 풀기 위한 기능이에요.</p>
<p>참고: <a href="https://cwiki.apache.org/confluence/display/KAFKA/KIP-98+-+Exactly+Once+Delivery+and+Transactional+Messaging">KIP-98: 제안 배경과 공동 제안자</a> · <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/producer/KafkaProducer.html">KafkaProducer: 도입 버전과 트랜잭션</a></p>
</details>

<section class="slide">
<h3>실제로는: 다음 컨슈머도 확정된 결과만 꺼내 읽어야 해요</h3>
<table>
<thead><tr><th>출력 토픽의 기록</th><th><code>read_committed</code> 컨슈머</th></tr></thead>
<tbody>
<tr><td>확정된 트랜잭션 메시지</td><td>꺼내 읽어요</td></tr>
<tr><td>진행 중인 트랜잭션 메시지</td><td>끝날 때까지 기다려요</td></tr>
<tr><td>취소된 트랜잭션 메시지</td><td>건너뛰어요</td></tr>
<tr><td>트랜잭션 밖에서 쓴 메시지</td><td>이 설정으로 가려지지 않아요</td></tr>
</tbody>
</table>
<p class="point">트랜잭션으로 쓴 결과는 읽는 쪽도 확정 여부를 가려야 의미가 있어요.</p>
<p class="explain"><code>isolation.level</code>은 컨슈머가 트랜잭션 메시지를 어디까지 꺼내 읽을지 정하는 설정이에요. Kafka 4.1의 기본값은 <code>read_uncommitted</code>라서 진행 중이거나 취소된 묶음도 읽을 수 있으므로 이 흐름에서는 <code>read_committed</code>를 써요. 이 모드에서는 파티션의 가장 이른 미완료 트랜잭션이 시작한 위치 앞까지만 읽을 수 있어 그 뒤에 있는 다른 메시지도 기다릴 수 있어요.</p>
</section>

<section class="slide">
<h3>이럴 땐 조심해요: 문자 발송은 이 묶음 밖에 있어요</h3>
<table>
<thead><tr><th>결과를 남기는 곳</th><th>중복을 막으려면</th></tr></thead>
<tbody>
<tr><td>Kafka 출력 토픽</td><td>출력과 입력 오프셋을 함께 확정하고 다음 컨슈머는 확정된 묶음을 읽어요</td></tr>
<tr><td>외부 DB(데이터 저장소)</td><td>DB 안에서 결과와 읽은 위치를 함께 저장하거나 같은 주문의 중복 반영을 막아요</td></tr>
<tr><td>문자·결제 서비스</td><td>같은 주문 번호의 요청을 다시 받아도 한 번만 반영하는 기능 등 상대의 협력이 필요해요</td></tr>
</tbody>
</table>
<p class="point">Kafka의 트랜잭션만으로 이미 보낸 문자나 외부 결제를 되돌릴 수는 없어요.</p>
<p class="explain">서비스가 문자를 보낸 직후 Kafka 묶음을 취소해도 발송한 문자는 취소되지 않아요. 그래서 외부 시스템까지 정확히 한 번을 말하려면 그곳의 저장·중복 방지 방식도 함께 맞춰야 해요. 같은 요청을 반복해도 결과가 한 번 반영되는 성질을 <b>멱등성</b>이라고 하며 3편의 프로듀서 멱등성만으로 외부 업무까지 보장하지는 않아요.</p>
</section>

<section class="slide">
<h3>한눈에 다시 보기</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="세 가지 전달 보장과 트랜잭션 및 read_committed를 다섯 줄로 요약해요">
<circle class="bad" cx="30" cy="28" r="18"/><use class="ic" href="#i-package" x="17" y="15" width="26" height="26"/>
<text class="label" x="62" y="19">at-most-once · 최대 한 번</text><text class="small" x="62" y="38" style="text-anchor:start">처리는 빠질 수 있어도 겹치지 않게 해요</text>
<circle class="box" cx="30" cy="76" r="18"/><use class="ic" href="#i-package" x="17" y="63" width="26" height="26"/>
<text class="label" x="62" y="67">at-least-once · 최소 한 번</text><text class="small" x="62" y="86" style="text-anchor:start">다시 처리해서 빠뜨림을 막되 겹칠 수 있어요</text>
<circle class="box" cx="30" cy="124" r="18"/><use class="ic" href="#i-package" x="17" y="111" width="26" height="26"/>
<text class="label" x="62" y="115">exactly-once · 정확히 한 번</text><text class="small" x="62" y="134" style="text-anchor:start">약속한 범위에 결과를 한 번만 남겨요</text>
<circle class="box" cx="30" cy="172" r="18"/><use class="ic" href="#i-notebook-pen" x="17" y="159" width="26" height="26"/>
<text class="label" x="62" y="163">트랜잭션</text><text class="small" x="62" y="182" style="text-anchor:start">출력 결과와 입력 오프셋을 함께 확정해요</text>
<circle class="box" cx="30" cy="220" r="18"/><use class="ic" href="#i-user-round" x="17" y="207" width="26" height="26"/>
<text class="label" x="62" y="211">read_committed</text><text class="small" x="62" y="230" style="text-anchor:start">취소된 묶음은 건너뛰고 미완료는 기다려요</text>
</svg>
<p class="point">정확히 한 번을 이해하려면 결과와 읽은 자리를 함께 확정하는 범위까지 봐야 해요.</p>
</section>

<p>참고: <a href="https://kafka.apache.org/41/design/design/#using-transactions">Apache Kafka 4.1: 트랜잭션과 복구 조건</a> · <a href="https://kafka.apache.org/41/configuration/consumer-configs/#isolation.level">읽기 모드의 기본값과 대기 범위</a> · <a href="https://kafka.apache.org/41/design/design/#message-delivery-semantics">외부 시스템과의 협력</a></p>

</div>

</div>

<script defer src="{{ '/assets/js/delivery-semantics-playground.js' | relative_url }}"></script>
