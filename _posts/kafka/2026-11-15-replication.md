---
layout: post
title: "물류센터 건물 하나가 불타면? 택배 물류센터로 이해하는 Kafka 복제"
description: "복제본과 ISR, 읽기 경계, 접수 응답과 리더 교체를 물류센터 비유와 건물 장애 위젯으로 설명합니다."
date: 2026-11-15 14:30:00 +0900
series: kafka
episode: 5
summary: "건물이 멈춰도 기록을 이어 가려면 사본이 필요해요. 누가 따라왔는지와 몇 곳에 남겨야 성공인지 함께 살펴봐요."
---

<div class="lesson lesson-hierarchy">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: https://cdn.jsdelivr.net/npm/lucide-static@1.25.0/icons/ (ISC). 라이선스: assets/icons/LICENSE-lucide.txt. -->
<symbol id="i-store" viewBox="0 0 24 24"><path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"/><path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244"/><path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"/></symbol>
<symbol id="i-warehouse" viewBox="0 0 24 24"><path d="M18 21V10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v11"/><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 1.132-1.803l7.95-3.974a2 2 0 0 1 1.837 0l7.948 3.974A2 2 0 0 1 22 8z"/><path d="M6 13h12"/><path d="M6 17h12"/></symbol>
<symbol id="i-package" viewBox="0 0 24 24"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/></symbol>
<symbol id="i-user-round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></symbol>
<symbol id="i-notebook-pen" viewBox="0 0 24 24"><path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/></symbol>
</defs>
</svg>

<div class="intro">
<p class="q">물류센터 건물 하나가 멈춰도 맡긴 소식을 계속 꺼내 읽을 수 있을까요?</p>
<p>4편에서는 같은 서비스를 여러 대 띄운 컨슈머 그룹이 칸을 나눠 읽고 담당자를 바꾸는 방법을 봤어요. 하지만 읽는 담당자가 남아 있어도 소식을 보관한 건물에 접근하지 못하면 일을 이어 갈 수 없어요.</p>
<p>1편의 물류센터 단지(클러스터) 안에는 건물(브로커)이 여러 채 있어요. 이번에는 같은 기록을 다른 건물에도 남기는 <b>복제</b>와 성공 응답의 조건을 살펴보고 원본 건물이 멈췄을 때 누가 이어받는지 알아봐요.</p>
</div>

<div class="slide-group">
<h2 class="slide-group-title">사본 보관: 한 건물의 고장에 대비해요</h2>

<section class="slide">
<h3>기록을 가진 건물이 하나뿐이라면</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="가게가 맡긴 소식을 보관한 건물에 접근할 수 없어 담당자도 기다리는 그림">
<circle class="box" cx="55" cy="85" r="30"/><use class="ic" href="#i-store" x="35" y="65" width="40" height="40"/><text class="chip" x="55" y="137">주문 가게</text><circle class="bad" cx="200" cy="85" r="30"/><use class="ic" href="#i-warehouse" x="180" y="65" width="40" height="40"/><text class="chip" x="200" y="137">접근 불가</text><circle class="box" cx="345" cy="85" r="30"/><use class="ic" href="#i-user-round" x="325" y="65" width="40" height="40"/><text class="chip" x="345" y="137">읽기 대기</text><path class="line" d="M90,85 L165,85 M235,85 L310,85"/><text class="small" x="200" y="190">다른 건물에는 기록이 없어요</text>
</svg>
<p class="point">담당자가 남아 있어도 기록에 접근할 수 없으면 일을 멈춰요.</p>
<p class="explain">가게 주인이 맡긴 소식이 한 건물에만 있다고 가정해요. 건물이 정전되면 담당자는 복구를 기다려야 해요. 보관하던 기록까지 망가지면 기다려도 소식을 되찾지 못할 수 있어요.</p>
</section>

<section class="slide">
<h3>실제로는: 브로커 장애와 데이터 손실은 달라요</h3>
<table>
<thead><tr><th>상황</th><th>사본이 없을 때</th></tr></thead>
<tbody>
<tr><td>브로커가 잠시 멈춤</td><td>그 파티션을 이용할 수 없어요</td></tr>
<tr><td>유일한 저장 장치까지 손상됨</td><td>그곳에만 있던 메시지를 잃을 수 있어요</td></tr>
</tbody>
</table>
<p class="point">복제는 한 브로커를 쓸 수 없을 때 다른 기록으로 이어 가기 위한 준비예요.</p>
<p class="explain">컨슈머 그룹의 담당자 교체는 읽는 서비스의 장애에 대비해요. 브로커 쪽 기록을 지키려면 별도로 사본을 만들어야 해요. 잠시 멈추는 것만으로 기록이 바로 지워지는 것은 아니에요.</p>
</section>

<section class="slide">
<h3>같은 칸의 기록을 다른 건물에도 남겨요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="원본 / 사본 / 사본">
<text class="label center" x="200" y="25">같은 선반 칸의 기록을 따라 적어요</text>
<path class="line" d="M100,90 L165,90 M100,105 Q200,180 300,105"/>
<circle class="kafka" cx="70" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="50" y="75" width="40" height="40"/><text class="chip" x="70" y="147">원본</text>
<circle class="kafka" cx="200" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="180" y="75" width="40" height="40"/><text class="chip" x="200" y="147">사본</text>
<circle class="kafka" cx="330" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="310" y="75" width="40" height="40"/><text class="chip" x="330" y="147">사본</text>
<circle class="new" cx="70" cy="185" r="18"/><use class="ic" href="#i-package" x="57" y="172" width="26" height="26"/><text class="chip" x="70" y="224">0 · 1 · 2</text>
<circle class="new" cx="200" cy="185" r="18"/><use class="ic" href="#i-package" x="187" y="172" width="26" height="26"/><text class="chip" x="200" y="224">0 · 1 · 2</text>
<circle class="new" cx="330" cy="185" r="18"/><use class="ic" href="#i-package" x="317" y="172" width="26" height="26"/><text class="chip" x="330" y="224">0 · 1 · 2</text>
</svg>
<p class="point">사본은 다른 건물에 두어야 한 건물이 멈춰도 남아요.</p>
<p class="explain">가게 주인은 접수를 맡은 원본 건물에만 소식을 맡겨요. 사본 건물은 원본의 같은 선반 칸을 보고 소식을 같은 순서로 따라 적어요. 이 비유에서 복사하는 것은 택배의 내용이며 택배 자체를 나눠 보내는 것은 아니에요.</p>
</section>

<section class="slide">
<h3>실제로는: 파티션마다 리더와 팔로워를 둬요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="B1 · 리더 / B2 · 팔로워 / B3 · 팔로워">
<text class="label center" x="200" y="25">파티션 P0 · 복제 계수 3</text>
<path class="line" d="M100,90 L165,90 M100,105 Q200,180 300,105"/>
<circle class="kafka" cx="70" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="50" y="75" width="40" height="40"/><text class="chip" x="70" y="147">B1 · 리더</text>
<circle class="kafka" cx="200" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="180" y="75" width="40" height="40"/><text class="chip" x="200" y="147">B2 · 팔로워</text>
<circle class="kafka" cx="330" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="310" y="75" width="40" height="40"/><text class="chip" x="330" y="147">B3 · 팔로워</text>
<circle class="new" cx="70" cy="185" r="18"/><use class="ic" href="#i-package" x="57" y="172" width="26" height="26"/><text class="chip" x="70" y="224">0 · 1 · 2</text>
<circle class="new" cx="200" cy="185" r="18"/><use class="ic" href="#i-package" x="187" y="172" width="26" height="26"/><text class="chip" x="200" y="224">0 · 1 · 2</text>
<circle class="new" cx="330" cy="185" r="18"/><use class="ic" href="#i-package" x="317" y="172" width="26" height="26"/><text class="chip" x="330" y="224">0 · 1 · 2</text>
</svg>
<p class="point">복제 계수는 한 파티션의 리더와 팔로워를 합친 수예요.</p>
<p class="explain"><b>리더</b>는 쓰기를 받는 복제본이고 <b>팔로워</b>는 리더에 fetch(기록 가져오기)를 요청해 따라 적는 복제본이에요. 복제 계수 3이라면 서로 다른 브로커 세 곳에 같은 파티션의 기록을 둬요. Kafka 4.1에서 자동 생성하거나 복제 계수를 -1로 지정해 만든 토픽에 적용되는 <code>default.replication.factor</code>의 기본값은 1이라 기본값만으로 사본이 생기지는 않아요.</p>
</section>

<details class="origin">
<summary>더 알아보기: 복제 명단은 왜 필요할까요?</summary>
<p>Kafka의 복제본은 각자 기록을 가져오기 때문에 모두가 매 순간 같은 위치까지 적은 것은 아니에요. 설계 문서는 잘 따라오는 복제본을 별도로 관리해서 쓰기 완료와 장애 복구의 기준으로 삼는다고 설명해요.</p>
<p>그 명단의 이름 ISR은 <b>In-Sync Replicas</b>의 줄임말로 동기화된 복제본들이라는 뜻이에요.</p>
<p>참고: <a href="https://kafka.apache.org/41/design/design/#replication">Apache Kafka 4.1 복제 설계</a></p>
</details>

<p>참고: <a href="https://kafka.apache.org/41/configuration/broker-configs/#brokerconfigs_default.replication.factor">Kafka 4.1 기본 복제 계수</a></p>

</div>

<div class="slide-group">
<h2 class="slide-group-title">복제 경계: 잘 따라오는 사본과 읽을 범위를 구분해요</h2>

<section class="slide">
<h3>따라 적는 건물의 명단을 관리해요</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="원본과 잘 따라오는 사본은 명단 안에 있고 뒤처진 사본은 명단 밖에 있는 그림">
<rect class="line" x="8" y="10" width="255" height="180" rx="12"/><text class="label center" x="135" y="35">잘 따라오는 건물 명단</text><circle class="kafka" cx="70" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="50" y="75" width="40" height="40"/><text class="chip" x="70" y="147">원본</text><circle class="kafka" cx="200" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="180" y="75" width="40" height="40"/><text class="chip" x="200" y="147">따라오는 사본</text><circle class="bad" cx="335" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="315" y="75" width="40" height="40"/><text class="chip" x="335" y="147">뒤처진 사본</text>
</svg>
<p class="point">사본을 두었다고 모두가 곧바로 원본만큼 따라온 것은 아니에요.</p>
<p class="explain">사본 건물의 일이 늦어지면 아직 적지 못한 소식이 쌓여요. 원본 건물은 잘 따라오는 곳만 명단에 남겨요. 뒤처진 건물은 밀린 기록을 따라잡은 뒤 다시 명단에 들어갈 수 있어요.</p>
</section>

<section class="slide">
<h3>실제로는: ISR은 잘 따라오는 복제본의 집합이에요</h3>
<table>
<thead><tr><th>복제본</th><th>명단에서의 위치</th></tr></thead>
<tbody>
<tr><td>리더</td><td>ISR에 포함돼요</td></tr>
<tr><td>잘 따라오는 팔로워</td><td>ISR에 포함돼요</td></tr>
<tr><td>응답하지 않거나 오래 뒤처진 팔로워</td><td>ISR에서 빠질 수 있어요</td></tr>
</tbody>
</table>
<p class="point">ISR은 전체 사본 수가 아니라 지금 동기화를 유지하는 복제본의 집합이에요.</p>
<p class="explain">ISR에 있어도 새 메시지를 적는 짧은 시차는 생길 수 있어요. 리더는 팔로워가 계속 따라오는지를 보고 명단을 관리해요. Kafka 4.1에서 fetch 요청이 없거나 리더의 로그 끝을 따라잡지 못한 시간이 <code>replica.lag.time.max.ms</code>의 기본값인 30초 이상이면 ISR에서 제외해요.</p>
</section>

<section class="slide">
<h3>함께 보관한 곳까지만 꺼내 읽어요</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="소식 세 개 중 두 개는 함께 보관했고 마지막 소식은 복제 대기 중인 그림">
<circle class="new" cx="75" cy="80" r="18"/><use class="ic" href="#i-package" x="62" y="67" width="26" height="26"/><circle class="new" cx="145" cy="80" r="18"/><use class="ic" href="#i-package" x="132" y="67" width="26" height="26"/><circle class="new" cx="285" cy="80" r="18"/><use class="ic" href="#i-package" x="272" y="67" width="26" height="26"/><path class="line" d="M215,35 L215,135"/><text class="small" x="110" y="155">꺼내 읽을 범위</text><text class="small" x="285" y="155">따라 적기 대기</text>
</svg>
<p class="point">원본에 도착한 소식과 함께 보관을 마친 소식은 달라요.</p>
<p class="explain">가게 주인이 새 소식을 맡기면 사본 건물이 따라 적을 시간이 필요해요. 담당자는 함께 보관을 마쳤다고 확인된 범위 안에서 내용을 꺼내 읽어요. 그래서 아직 사본에 없는 소식까지 너무 일찍 업무에 쓰지 않아요.</p>
</section>

<section class="slide">
<h3>실제로는: HW 아래가 복제를 마친 읽기 범위예요</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="오프셋 0과 1은 HW 2 아래여서 읽을 수 있고 오프셋 2는 아직 대기인 그림">
<rect class="kafka" x="40" y="60" width="78" height="48" rx="6"/><text class="chip" x="79" y="84">0</text><rect class="kafka" x="125" y="60" width="78" height="48" rx="6"/><text class="chip" x="164" y="84">1</text><rect class="box" x="270" y="60" width="78" height="48" rx="6"/><text class="chip" x="309" y="84">2</text><path class="line" d="M235,35 L235,135"/><text class="small" x="235" y="155">HW = 2</text><text class="small" x="110" y="185">읽을 수 있음</text><text class="small" x="310" y="185">복제 대기</text>
</svg>
<p class="point">HW는 복제를 마친 마지막 메시지의 다음 오프셋이에요.</p>
<p class="explain"><b>HW(high watermark)</b>는 ISR 전체에 복제된 범위를 나타내는 경계이고 컨슈머는 그 아래의 메시지를 꺼내 읽어요. 그림에서 마지막으로 복제를 마친 메시지 번호가 1이면 HW는 2예요. Kafka 4.0 이후에는 ISR 수가 함께 기록을 남기도록 정한 최소 수 이상이어야 HW가 전진해요. 이 조건은 뒤에서 볼 안전한 리더 후보 명단 기능의 활성화 여부와는 별개예요.</p>
</section>

<section class="slide">
<h3>이럴 땐 조심해요: 업무 묶음이 끝나야 읽는 경우도 있어요</h3>
<table>
<thead><tr><th>컨슈머의 읽기 설정</th><th>읽을 수 있는 경계</th></tr></thead>
<tbody>
<tr><td>기본 읽기 · read_uncommitted</td><td>HW 아래까지</td></tr>
<tr><td>read_committed</td><td>HW와 미완료 트랜잭션의 첫 오프셋 중 작은 경계(LSO) 아래까지</td></tr>
</tbody>
</table>
<p class="point">복제 완료와 트랜잭션 완료는 서로 다른 조건이에요.</p>
<p class="explain">트랜잭션은 여러 쓰기를 하나의 성공 또는 취소로 묶는 장치예요. <code>read_committed</code>인 컨슈머는 LSO(Last Stable Offset) 아래에서 성공이 확정된 트랜잭션의 메시지와 일반 메시지를 읽고 취소된 메시지는 건너뛰어요. 아직 끝나지 않은 트랜잭션이 있으면 뒤의 메시지가 복제됐어도 그 경계를 넘어서 읽지 않아요.</p>
</section>

<p>참고: <a href="https://kafka.apache.org/41/configuration/broker-configs/#brokerconfigs_replica.lag.time.max.ms">Kafka 4.1 ISR 제외 조건</a> · <a href="https://kafka.apache.org/41/operations/eligible-leader-replicas/">Kafka 4.0 이후 HW 전진 조건</a> · <a href="https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html#endOffsets(java.util.Collection)">KafkaConsumer 읽기 경계</a></p>

</div>

<div class="slide-group">
<h2 class="slide-group-title">접수 응답: 몇 곳에 남겨야 성공일까요?</h2>

<section class="slide">
<h3>접수증을 주기 전에 사본을 기다려요</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="가게에서 원본에 맡긴 소식이 사본에 복제된 뒤 접수증이 가게로 돌아오는 순서">
<circle class="box" cx="50" cy="85" r="30"/><use class="ic" href="#i-store" x="30" y="65" width="40" height="40"/><text class="chip" x="50" y="137">가게</text><circle class="kafka" cx="200" cy="85" r="30"/><use class="ic" href="#i-warehouse" x="180" y="65" width="40" height="40"/><text class="chip" x="200" y="137">원본</text><circle class="kafka" cx="350" cy="85" r="30"/><use class="ic" href="#i-warehouse" x="330" y="65" width="40" height="40"/><text class="chip" x="350" y="137">명단 속 사본</text><path class="line" d="M85,75 L165,75 M235,75 L315,75 M165,115 L85,115"/><text class="small" x="125" y="55">① 맡김</text><text class="small" x="275" y="55">② 복제</text><text class="small" x="125" y="175">③ 접수증</text>
</svg>
<p class="point">원본에만 적고 접수증을 주면 사본에 남기기 전의 틈이 생겨요.</p>
<p class="explain">3편의 접수 응답은 여기서 사본 보관과 이어져요. 원본 건물이 먼저 접수증을 주고 곧바로 기록을 잃으면 가게는 성공했다고 믿어도 사본에는 소식이 없을 수 있어요. 명단 전체가 따라 적기를 기다리면 그 틈을 줄일 수 있어요.</p>
</section>

<section class="slide">
<h3>실제로는: acks=all은 현재 ISR 전체를 기다려요</h3>
<table>
<thead><tr><th>응답 조건</th><th>기다리는 범위</th><th>장애와의 관계</th></tr></thead>
<tbody>
<tr><td>acks=1</td><td>리더에 적으면 응답</td><td>팔로워가 복제하기 전에 리더를 잃으면 메시지도 잃을 수 있어요</td></tr>
<tr><td>acks=all</td><td>현재 ISR 전체에 적히면 응답</td><td>ISR에 하나라도 살아남는 조건에서 성공한 기록을 지켜요</td></tr>
</tbody>
</table>
<p class="point">acks=all의 all은 현재 ISR 전체를 뜻해요.</p>
<p class="explain"><code>acks</code>는 프로듀서가 성공으로 받아들일 접수 응답의 조건이에요. ISR 밖의 뒤처진 팔로워까지 모두 기다리는 뜻은 아니에요. Kafka Java 프로듀서는 3.0부터 기본값이 <code>acks=all</code>이며 이전 기본값은 1이었어요.</p>
</section>

<section class="slide">
<h3>건물 세 곳을 두고 최소 두 곳은 남겨요</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="원본 / 사본 / 멈춤">
<text class="label center" x="200" y="25">명단에 최소 두 건물이 있어야 접수</text>
<circle class="kafka" cx="70" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="50" y="75" width="40" height="40"/><text class="chip" x="70" y="147">원본</text>
<circle class="kafka" cx="200" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="180" y="75" width="40" height="40"/><text class="chip" x="200" y="147">사본</text>
<circle class="bad" cx="330" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="310" y="75" width="40" height="40"/><text class="chip" x="330" y="147">멈춤</text>
</svg>
<p class="point">모두 기다리는 규칙과 너무 적게 남으면 멈추는 규칙을 함께 둬요.</p>
<p class="explain">건물 세 곳에 기록을 두되 최소 두 곳이 명단에 있어야 접수한다고 정해 봐요. 한 건물이 멈춰도 두 곳에 남길 수 있어 일을 계속해요. 한 곳만 남으면 새 소식을 받지 않아 그 한 곳에만 기대는 상황을 막아요.</p>
</section>

<section class="slide">
<h3>실제로는: min.insync.replicas는 ISR의 하한선이에요</h3>
<table>
<thead><tr><th>현재 ISR 수</th><th>복제 계수 3 · acks=all · 최소 ISR 2</th></tr></thead>
<tbody>
<tr><td>3</td><td>3곳의 복제를 기다려 성공</td></tr>
<tr><td>2</td><td>2곳의 복제를 기다려 성공</td></tr>
<tr><td>1</td><td>최소 수 미달로 쓰기 거절</td></tr>
</tbody>
</table>
<p class="point">최소 ISR 2는 두 곳만 골라 기다린다는 뜻이 아니에요.</p>
<p class="explain"><code>min.insync.replicas</code>는 <code>acks=all</code> 쓰기에 필요한 ISR 수의 하한선이고 리더도 그 수에 포함돼요. ISR이 셋이면 셋 모두를 기다리며 두 곳보다 적어지면 쓰기를 거절해요. Kafka 4.1의 기본값은 1이라 ISR이 리더 하나뿐이어도 <code>acks=all</code> 쓰기가 성공할 수 있어요. 최소 수를 3으로 높이면 이 예에서는 한 대만 멈춰도 쓰기가 막혀요.</p>
</section>

<section class="slide" id="replication-write-playground" hidden>
<h3>직접 해 보기: 건물을 끄면 접수는 어떻게 될까요?</h3>
<div class="pp-body rp-widget" data-mode="write"></div>
<p class="point">설명용으로 ISR 변화와 복구를 빠르게 보여 주며 실제 쓰기는 acks=all과 최소 ISR 2의 조건을 따라요.</p>
<p class="explain">주문 서비스는 누르지 않아도 계속 소식을 보내요. 건물의 켜짐 여부만 바꾸면 남은 ISR 수에 따라 성공 응답과 쓰기 거절이 달라져요. 실제 장애 감지와 사본의 복구에는 시간이 걸리며 켠 건물도 따라잡은 뒤에야 ISR로 돌아와요.</p>
</section>

<p>참고: <a href="https://kafka.apache.org/41/configuration/producer-configs/#producerconfigs_acks">Kafka 4.1 acks</a> · <a href="https://kafka.apache.org/30/generated/producer_config.html#producerconfigs_acks">Kafka 3.0 프로듀서 기본값</a> · <a href="https://kafka.apache.org/41/configuration/broker-configs/#brokerconfigs_min.insync.replicas">Kafka 4.1 최소 ISR</a></p>

</div>

<div class="slide-group">
<h2 class="slide-group-title">리더 교체: 안전한 기록을 가진 사본이 이어받아요</h2>

<section class="slide">
<h3>원본이 멈추면 따라온 사본이 접수를 맡아요</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="원본 멈춤 / 새 접수처 / 사본">
<text class="label center" x="200" y="25">함께 보관한 기록으로 이어 가요</text>
<circle class="bad" cx="70" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="50" y="75" width="40" height="40"/><text class="chip" x="70" y="147">원본 멈춤</text>
<circle class="kafka" cx="200" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="180" y="75" width="40" height="40"/><text class="chip" x="200" y="147">새 접수처</text>
<circle class="kafka" cx="330" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="310" y="75" width="40" height="40"/><text class="chip" x="330" y="147">사본</text>
</svg>
<p class="point">새 원본은 이미 지켜야 할 기록을 가진 건물이어야 해요.</p>
<p class="explain">원본 건물이 멈추면 가게는 잠시 새 접수처를 기다려요. 명단 안에서 따라 적던 건물이 접수를 이어받으면 담당자는 남은 기록을 계속 꺼내 읽어요. 최신 명단에서 빠졌어도 함께 보관을 끝낸 기록을 가진 안전한 후보는 따로 기억해 둘 수 있어요.</p>
</section>

<section class="slide">
<h3>실제로는: ISR과 활성화된 ELR에서 안전한 리더를 찾아요</h3>
<table>
<thead><tr><th>리더 장애 뒤</th><th>다음 후보</th></tr></thead>
<tbody>
<tr><td>ISR에 사용 가능한 후보가 있음</td><td>ISR의 복제본에서 선출</td></tr>
<tr><td>ISR 후보가 없고 ELR이 활성화됨</td><td>ELR에 기록된 사용 가능한 안전한 후보를 확인</td></tr>
<tr><td>안전한 후보를 사용할 수 없음</td><td>복구를 기다리거나 손실 위험이 있는 선출을 검토</td></tr>
</tbody>
</table>
<p class="point">ISR 밖의 복제본도 ELR의 안전한 후보라면 리더를 이어받을 수 있어요.</p>
<p class="explain">Kafka는 리더 장애 뒤 ISR의 복제본을 우선 찾아 새 리더를 정해요. <b>ELR(Eligible Leader Replicas)</b>은 ISR 밖이어도 HW까지의 기록을 지켜 안전하게 선출할 수 있는 후보를 기억하는 명단이에요. ELR은 Kafka 4.0에서 도입되어 기본 비활성이었고 <code>eligible.leader.replicas.version=1</code>로 활성화하며 4.1부터 새로 만드는 클러스터에서는 기본 활성화돼요. 새 리더가 정해지면 프로듀서는 그 리더에 다시 요청하고 컨슈머도 새 리더에서 읽기를 이어 가요.</p>
</section>

<section class="slide" id="replication-leader-playground" hidden>
<h3>직접 해 보기: 리더 건물을 꺼 보세요</h3>
<div class="pp-body rp-widget" data-mode="leader"></div>
<p class="point">설명용으로 ISR 후보만 있는 파티션의 리더 선출과 복구를 빠르게 보여 줘요.</p>
<p class="explain">노란 건물이 현재 접수를 맡은 리더예요. 그 건물을 끄면 살아 있는 ISR 사본이 접수를 이어받고 다시 켠 건물은 기록을 따라잡은 뒤 사본으로 돌아와요. 전부 끄면 접수처가 없어지며 실제 선출 시간과 통신 재시도는 이 그림보다 오래 걸릴 수 있어요.</p>
</section>

<section class="slide">
<h3>이럴 땐 조심해요: 뒤처진 사본을 세우면 기록을 잃을 수 있어요</h3>
<table>
<thead><tr><th>선택</th><th>대가</th></tr></thead>
<tbody>
<tr><td>안전한 후보가 없어 복구를 기다림</td><td>일은 멈추지만 뒤처진 기록으로 바꾸지 않아요</td></tr>
<tr><td>안전하지 않은 사본을 새 리더로 세움</td><td>다시 쓸 수 있어도 그 사본에 없던 기록을 잃을 수 있어요</td></tr>
</tbody>
</table>
<p class="point">unclean 선출은 지켜야 할 기록이 없는 사본을 리더로 세울 위험을 감수해요.</p>
<p class="explain"><b>unclean 리더 선출</b>은 안전한 후보가 없을 때 뒤처진 복제본으로라도 다시 처리하는 선택이에요. Kafka 4.1에서 이를 허용하는 <code>unclean.leader.election.enable</code>의 기본값은 <code>false</code>여서 안전한 리더를 복구할 때까지 해당 파티션을 쓰지 못할 수 있어요. ELR로 안전하다고 기억한 후보를 고르는 것과는 달라요.</p>
</section>

<p>참고: <a href="https://kafka.apache.org/41/operations/eligible-leader-replicas/">Kafka 4.1 ELR과 선출 순서</a> · <a href="https://kafka.apache.org/41/configuration/broker-configs/#brokerconfigs_unclean.leader.election.enable">Kafka 4.1 unclean 선출</a></p>

<section class="slide">
<h3>한눈에 다시 보기</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="복제본, 리더와 팔로워, ISR과 HW, 접수 조건, 리더 교체의 다섯 줄 요약">
<circle class="kafka" cx="30" cy="28" r="18"/><use class="ic" href="#i-warehouse" x="17" y="15" width="26" height="26"/><text class="label" x="62" y="19">복제본 · 복제 계수</text><text class="small" x="62" y="38" style="text-anchor:start">파티션의 기록을 서로 다른 브로커에 둬요</text>
<circle class="kafka" cx="30" cy="76" r="18"/><use class="ic" href="#i-warehouse" x="17" y="63" width="26" height="26"/><text class="label" x="62" y="67">리더 · 팔로워</text><text class="small" x="62" y="86" style="text-anchor:start">쓰기를 받는 쪽과 따라 적는 쪽이에요</text>
<circle class="box" cx="30" cy="124" r="18"/><use class="ic" href="#i-notebook-pen" x="17" y="111" width="26" height="26"/><text class="label" x="62" y="115">ISR · HW</text><text class="small" x="62" y="134" style="text-anchor:start">잘 따라오는 명단과 복제를 마친 경계예요</text>
<circle class="box" cx="30" cy="172" r="18"/><use class="ic" href="#i-store" x="17" y="159" width="26" height="26"/><text class="label" x="62" y="163">acks=all · 최소 ISR</text><text class="small" x="62" y="182" style="text-anchor:start">명단 전체를 기다리고 너무 적으면 거절해요</text>
<circle class="kafka" cx="30" cy="220" r="18"/><use class="ic" href="#i-warehouse" x="17" y="207" width="26" height="26"/><text class="label" x="62" y="211">리더 교체</text><text class="small" x="62" y="230" style="text-anchor:start">ISR이나 활성화된 ELR의 안전한 후보가 이어요</text>
</svg>
<p class="point">복제는 여러 곳에 기록을 남기고 안전한 사본으로 일을 이어 가게 해요.</p>
</section>

</div>

</div>

<link rel="stylesheet" href="{{ '/assets/css/replication-playground.css' | relative_url }}">
<script defer src="{{ '/assets/js/replication-playground.js' | relative_url }}"></script>
