---
layout: post
title: "물류센터 건물 하나가 불타면? 택배 물류센터로 이해하는 Kafka 복제"
description: "사본과 ISR, 읽기 경계, 접수 응답과 리더 교체를 물류센터 비유와 건물 장애 위젯으로 설명합니다."
date: 2026-11-15 14:30:00 +0900
series: kafka
episode: 5
summary: "건물이 멈춰도 소식을 이어 가려면 사본이 필요해요. 누가 따라왔는지와 몇 곳에 남겨야 성공인지 함께 살펴봐요."
---

<div class="lesson lesson-hierarchy">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: https://cdn.jsdelivr.net/npm/lucide-static@1.25.0/icons/ (ISC). 라이선스: assets/icons/LICENSE-lucide.txt. -->
<symbol id="i-store" viewBox="0 0 24 24"><path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"/><path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244"/><path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"/></symbol>
<symbol id="i-warehouse" viewBox="0 0 24 24"><path d="M18 21V10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v11"/><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 1.132-1.803l7.95-3.974a2 2 0 0 1 1.837 0l7.948 3.974A2 2 0 0 1 22 8z"/><path d="M6 13h12"/><path d="M6 17h12"/></symbol>
<symbol id="i-package" viewBox="0 0 24 24"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/></symbol>
<symbol id="i-user-round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></symbol>
<symbol id="i-receipt" viewBox="0 0 24 24">
  <path d="M12 17V7" />
  <path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8" />
  <path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z" /></symbol>
<symbol id="i-list-checks" viewBox="0 0 24 24"><path d="M13 5h8"/><path d="M13 12h8"/><path d="M13 19h8"/><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/></symbol>
</defs>
</svg>

<div class="intro">
<p class="q">물류센터 건물 하나가 멈춰도 맡긴 소식을 계속 꺼내 읽을 수 있을까요?</p>
<p>4편에서는 같은 서비스를 여러 대 띄운 컨슈머 그룹이 칸을 나눠 읽고 담당자를 바꾸는 방법을 봤어요. 하지만 읽는 담당자가 남아 있어도 소식을 보관한 건물에 접근하지 못하면 일을 이어 갈 수 없어요.</p>
<p>1편의 물류센터 단지(클러스터) 안에는 건물(브로커)이 여러 채 있어요. 이번에는 같은 소식을 다른 건물에도 남기는 <b>복제</b>와 성공 응답의 조건을 살펴보고 리더 건물이 멈췄을 때 누가 이어받는지 알아봐요.</p>
</div>

<div class="slide-group">
<h2 class="slide-group-title">사본 보관: 한 건물의 고장에 대비해요</h2>

<section class="slide">
<h3>소식을 가진 건물이 하나뿐이라면</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="가게가 맡긴 소식을 보관한 건물에 접근할 수 없어 담당자도 기다리는 그림">
<circle class="box" cx="55" cy="85" r="30"/><use class="ic" href="#i-store" x="35" y="65" width="40" height="40"/><text class="chip" x="55" y="137">주문 가게</text><circle class="bad" cx="200" cy="85" r="30"/><use class="ic" href="#i-warehouse" x="180" y="65" width="40" height="40"/><text class="chip" x="200" y="137">접근 불가</text><circle class="box" cx="345" cy="85" r="30"/><use class="ic" href="#i-user-round" x="325" y="65" width="40" height="40"/><text class="chip" x="345" y="137">읽기 대기</text><path class="line" d="M90,85 L165,85 M235,85 L310,85"/><text class="small" x="200" y="190">다른 건물에는 소식이 없어요</text>
</svg>
<p class="point">담당자가 남아 있어도 소식에 접근할 수 없으면 일을 멈춰요.</p>
<p class="explain">한 건물도 칸에 따라 접수를 맡는 리더일 수도 소식을 따라 적는 곳일 수도 있어요. 이 칸의 소식이 한 건물에만 있는데 정전이 나면 담당자는 복구를 기다려야 해요. 정전은 실제 브로커가 멈춘 상황이며 보관하던 소식까지 망가지면 되찾지 못할 수 있어요.</p>
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
<p class="point">복제는 한 브로커를 쓸 수 없을 때 다른 브로커의 사본으로 이어 가기 위한 준비예요.</p>
<p class="explain">3편의 리더 건물은 쓰기를 받는 브로커로 <b>쓰기</b>는 프로듀서가 메시지를 보내 저장하는 일이에요. 컨슈머 그룹의 담당자 교체는 읽는 서비스의 장애에 대비해요. 브로커 쪽 메시지를 지키려면 별도로 사본을 만들어야 해요. 잠시 멈추는 것만으로 메시지가 바로 지워지는 것은 아니에요.</p>
</section>

<section class="slide">
<h3>같은 칸의 소식을 다른 건물에도 남겨요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="리더 건물 / 사본 / 사본">
<text class="label center" x="200" y="25">같은 선반 칸의 소식을 따라 적어요</text>
<defs><marker id="rp-fetch-1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M165,90 L105,90" marker-end="url(#rp-fetch-1)"/><path class="line" d="M310,70 Q200,-5 90,70" marker-end="url(#rp-fetch-1)"/>
<text class="small" x="200" y="55">가져오기 요청</text>
<circle class="kafka" cx="70" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="50" y="75" width="40" height="40"/><text class="chip" x="70" y="147">칸 A의 리더</text>
<circle class="kafka" cx="200" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="180" y="75" width="40" height="40"/><text class="chip" x="200" y="147">칸 A의 사본</text>
<circle class="kafka" cx="330" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="310" y="75" width="40" height="40"/><text class="chip" x="330" y="147">칸 A의 사본</text>
<circle class="new" cx="70" cy="185" r="18"/><use class="ic" href="#i-package" x="57" y="172" width="26" height="26"/><text class="chip" x="70" y="224">0 · 1 · 2</text>
<circle class="new" cx="200" cy="185" r="18"/><use class="ic" href="#i-package" x="187" y="172" width="26" height="26"/><text class="chip" x="200" y="224">0 · 1 · 2</text>
<circle class="new" cx="330" cy="185" r="18"/><use class="ic" href="#i-package" x="317" y="172" width="26" height="26"/><text class="chip" x="330" y="224">0 · 1 · 2</text>
</svg>
<p class="point">사본은 다른 건물에 두어야 한 건물이 멈춰도 남아요.</p>
<p class="explain">가게 주인은 그 칸의 접수를 맡은 리더 건물에 소식을 맡겨요. 다른 건물은 리더에게서 소식 내용을 가져와 같은 순서로 따라 적어요. 소식 내용을 복사하므로 건물마다 같은 내용이 남고 리더도 그 사본 중 하나예요.</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>실제로는: 파티션마다 리더와 팔로워를 둬요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="B1 · 리더 / B2 · 팔로워 / B3 · 팔로워">
<text class="label center" x="200" y="25">파티션 P0 · 복제 계수 3</text>
<defs><marker id="rp-fetch-2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M165,90 L105,90" marker-end="url(#rp-fetch-2)"/><path class="line" d="M310,70 Q200,-5 90,70" marker-end="url(#rp-fetch-2)"/>
<text class="small" x="200" y="55">가져오기 요청</text>
<circle class="kafka" cx="70" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="50" y="75" width="40" height="40"/><text class="chip" x="70" y="147">B1 · 리더</text>
<circle class="kafka" cx="200" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="180" y="75" width="40" height="40"/><text class="chip" x="200" y="147">B2 · 팔로워</text>
<circle class="kafka" cx="330" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="310" y="75" width="40" height="40"/><text class="chip" x="330" y="147">B3 · 팔로워</text>
<circle class="new" cx="70" cy="185" r="18"/><use class="ic" href="#i-package" x="57" y="172" width="26" height="26"/><text class="chip" x="70" y="224">0 · 1 · 2</text>
<circle class="new" cx="200" cy="185" r="18"/><use class="ic" href="#i-package" x="187" y="172" width="26" height="26"/><text class="chip" x="200" y="224">0 · 1 · 2</text>
<circle class="new" cx="330" cy="185" r="18"/><use class="ic" href="#i-package" x="317" y="172" width="26" height="26"/><text class="chip" x="330" y="224">0 · 1 · 2</text>
</svg>
<p class="point">복제 계수는 한 파티션의 리더와 팔로워를 합친 수예요.</p>
<p class="explain"><b>리더</b>는 쓰기를 받는 사본이고 <b>팔로워</b>는 리더에 fetch(메시지 가져오기)를 요청해 따라 적는 사본이에요. 복제 계수 3이라면 서로 다른 브로커 세 곳에 같은 파티션의 메시지를 둬요. 한 브로커도 파티션에 따라 리더일 수도 팔로워일 수도 있어요.</p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 사본을 3개 두면 저장 공간도 세 배가 드나요?</summary>
<p>A. 같은 메시지를 세 브로커에 각각 저장하므로 메시지 사본을 보관하는 공간은 사본 하나일 때의 약 세 배가 필요해요. 리더도 그 세 사본 중 하나예요. 실제 사용량에는 인덱스 같은 부가 공간도 더해져요.</p>
</details>
</aside>
</div>

<details class="origin">
<summary>더 알아보기: 누가 왜 복제를 만들었을까?</summary>
<p>링크드인에서 Kafka를 만들던 준 라오(Jun Rao) 등 개발자들은 브로커 한 대의 장애가 소식을 읽지 못하거나 잃는 문제로 이어지는 것을 줄이려 했어요. 여러 브로커에 같은 소식을 남기는 복제를 Kafka 0.8에 추가했어요.</p>
<p>준 라오는 2013년 링크드인 기술 블로그에서 장애가 나도 보내고 읽는 일을 이어 가고 소식을 지키려는 복제 설계를 소개했어요. 복제(replication)는 같은 소식의 사본을 여러 곳에 만드는 것을 뜻해요.</p>
<p>참고: <a href="https://www.linkedin.com/blog/engineering/open-source/intra-cluster-replication-apache-kafka">준 라오가 설명한 복제의 배경</a> · <a href="https://cwiki.apache.org/confluence/spaces/KAFKA/pages/30749496/Changes+in+Kafka+0.8">Apache Kafka 0.8의 복제 도입</a></p>
</details>

</div>

<div class="slide-group">
<h2 class="slide-group-title">복제 경계: 잘 따라오는 사본과 읽을 범위를 구분해요</h2>

<section class="slide">
<h3>따라 적는 건물의 명단을 관리해요</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="리더 건물과 잘 따라오는 사본은 명단 안에 있고 뒤처진 사본은 명단 밖에 있는 그림">
<rect class="line" x="8" y="10" width="255" height="180" rx="12"/><text class="label center" x="135" y="35">잘 따라오는 건물 명단</text><circle class="kafka" cx="70" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="50" y="75" width="40" height="40"/><text class="chip" x="70" y="147">칸 A의 리더</text><circle class="kafka" cx="200" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="180" y="75" width="40" height="40"/><text class="chip" x="200" y="147">따라오는 사본</text><circle class="bad" cx="335" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="315" y="75" width="40" height="40"/><text class="chip" x="335" y="147">뒤처진 사본</text>
</svg>
<p class="point">사본을 두었다고 모두가 곧바로 리더만큼 따라온 것은 아니에요.</p>
<p class="explain">사본 건물의 일이 늦어지면 아직 적지 못한 소식이 쌓여요. 리더 건물은 잘 따라오는 곳만 명단에 남겨요. 뒤처진 건물은 밀린 소식을 따라잡은 뒤 다시 명단에 들어갈 수 있어요.</p>
</section>

<section class="slide">
<h3>실제로는: ISR은 잘 따라오는 사본의 집합이에요</h3>
<table>
<thead><tr><th>사본</th><th>명단에서의 위치</th></tr></thead>
<tbody>
<tr><td>리더</td><td>ISR에 포함돼요</td></tr>
<tr><td>잘 따라오는 팔로워</td><td>ISR에 포함돼요</td></tr>
<tr><td>응답하지 않거나 오래 뒤처진 팔로워</td><td>ISR에서 빠질 수 있어요</td></tr>
</tbody>
</table>
<p class="point">ISR은 전체 사본 수가 아니라 지금 동기화를 유지하는 사본의 집합이에요.</p>
<p class="explain"><b>ISR(In-Sync Replicas)</b>은 동기화 중인 사본의 명단으로 동기화(in-sync)는 리더를 잘 따라오는 중이라는 뜻이에요. 짧은 시차가 있어도 계속 가져오기를 요청하고 정해 둔 시간 안에 따라잡으면 명단에 남아요. Kafka 4.1에서 이 시간의 기본값은 30초이며 그동안 가져오기 요청이 없거나 끝까지 따라잡지 못하면 리더가 명단에서 빼요. 이 글에서 <b>최신 사본</b>은 ISR 안의 사본(리더 포함)을 가리켜요.</p>
</section>

<section class="slide">
<h3>함께 보관한 곳까지만 꺼내 읽어요</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="소식 세 개 중 두 개는 함께 보관했고 마지막 소식은 복제 대기 중인 그림">
<circle class="new" cx="75" cy="80" r="18"/><use class="ic" href="#i-package" x="62" y="67" width="26" height="26"/><circle class="new" cx="145" cy="80" r="18"/><use class="ic" href="#i-package" x="132" y="67" width="26" height="26"/><circle class="new" cx="285" cy="80" r="18"/><use class="ic" href="#i-package" x="272" y="67" width="26" height="26"/><path class="line" d="M215,35 L215,135"/><text class="small" x="110" y="155">꺼내 읽을 범위</text><text class="small" x="285" y="155">따라 적기 대기</text>
</svg>
<p class="point">리더에 도착한 소식과 함께 보관을 마친 소식은 달라요.</p>
<p class="explain">가게 주인이 새 소식을 맡기면 사본 건물이 따라 적을 시간이 필요해요. 담당자는 함께 보관을 마쳤다고 확인된 범위 안에서 내용을 꺼내 읽어요. 너무 일찍 읽어 배송을 준비했는데 리더가 멈춰 그 소식이 사라지면 이미 한 일과 남은 소식이 어긋날 수 있어요.</p>
</section>

<section class="slide">
<h3>실제로는: HW 아래가 복제를 마친 읽기 범위예요</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="오프셋 0과 1은 HW 2 아래여서 읽을 수 있고 오프셋 2는 아직 대기인 그림">
<rect class="kafka" x="40" y="60" width="78" height="48" rx="6"/><text class="chip" x="79" y="84">0</text><rect class="kafka" x="125" y="60" width="78" height="48" rx="6"/><text class="chip" x="164" y="84">1</text><rect class="box" x="270" y="60" width="78" height="48" rx="6"/><text class="chip" x="309" y="84">2</text><path class="line" d="M235,35 L235,135"/><text class="small" x="235" y="155">HW = 2</text><text class="small" x="110" y="185">읽을 수 있음</text><text class="small" x="310" y="185">복제 대기</text>
</svg>
<p class="point">HW는 복제를 마친 마지막 메시지의 다음 오프셋이에요.</p>
<p class="explain">1편의 <b>오프셋</b>은 칸 안의 메시지에 붙인 자리 번호예요. <b>HW(high watermark)</b>는 ISR 전체에 복제된 메시지의 다음 번호로 HW=2라면 0·1번까지 꺼내 읽을 수 있어요. 컨슈머는 기본으로 리더에서 읽고 리더는 HW 아래의 메시지만 내줘요. 아직 복제되지 않은 메시지를 읽고 업무를 처리하면 리더 장애로 그 메시지가 사라졌을 때 이미 처리한 일과 어긋날 수 있어요.</p>
</section>

<p>참고: <a href="https://kafka.apache.org/41/configuration/broker-configs/#brokerconfigs_replica.lag.time.max.ms">Kafka 4.1 ISR 제외 조건</a></p>

</div>

<div class="slide-group">
<h2 class="slide-group-title">접수 응답: 몇 곳에 남겨야 성공일까요?</h2>

<section class="slide">
<h3>건물 세 곳을 두고 최소 두 곳은 남겨요</h3>
<svg class="dg" viewBox="0 0 400 340" role="img" aria-label="명단이 두 곳이면 접수증을 주고 한 곳만 남으면 접수를 멈추는 그림">
<text class="label center" x="200" y="25">명단에 최소 두 건물이 있어야 접수</text>
<circle class="kafka" cx="70" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="50" y="75" width="40" height="40"/><text class="chip" x="70" y="147">칸 A의 리더</text>
<circle class="kafka" cx="200" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="180" y="75" width="40" height="40"/><text class="chip" x="200" y="147">칸 A의 사본</text>
<circle class="bad" cx="330" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="310" y="75" width="40" height="40"/><text class="chip" x="330" y="147">멈춤</text>
<text class="small" x="200" y="187">명단 2곳 → 모두 따라 적으면 접수증</text>
<circle class="kafka" cx="70" cy="245" r="25"/><use class="ic" href="#i-warehouse" x="52" y="227" width="36" height="36"/>
<circle class="bad" cx="200" cy="245" r="25"/><use class="ic" href="#i-warehouse" x="182" y="227" width="36" height="36"/>
<circle class="bad" cx="330" cy="245" r="25"/><use class="ic" href="#i-warehouse" x="312" y="227" width="36" height="36"/>
<text class="chip" x="70" y="287">칸 A의 리더</text><text class="chip" x="200" y="287">멈춤</text><text class="chip" x="330" y="287">멈춤</text>
<text class="alert" x="200" y="323">명단 1곳 → 접수 중단 · 접수증 없음</text>
</svg>
<p class="point">모두 기다리는 규칙과 너무 적게 남으면 멈추는 규칙을 함께 둬요.</p>
<p class="explain">가게는 명단의 모든 건물이 따라 적은 뒤에야 3편의 접수증을 받아요. 이 예에서는 명단에 최소 두 곳이 있어야 접수하며 한 곳뿐이면 멈춰요. 가게는 거절을 받고 다시 보내기를 시도하다가 시간 한도가 지나면 실패를 알아요.</p>
</section>

<section class="slide">
<h3>실제로는: acks=all에도 사본 수의 하한선이 필요해요</h3>
<table>
<thead><tr><th>접수 조건</th><th>하는 일</th></tr></thead>
<tbody>
<tr><td>acks=all</td><td>현재 ISR 전체가 저장할 때까지 기다려요</td></tr>
<tr><td>최소 ISR</td><td>명단이 너무 줄면 쓰기를 거절해요</td></tr>
</tbody>
</table>
<p class="point">acks=all은 기다릴 범위를 정하고 최소 ISR은 남아 있어야 할 수를 정해요.</p>
<p class="explain">3편에서 본 <code>acks=all</code>은 복제와 함께 봐야 해요. ISR이 줄면 기다릴 사본도 줄어들므로 이것만으로는 여러 곳에 남는다고 보장할 수 없어요. <code>min.insync.replicas</code>라는 최소 수를 함께 정하면 사본이 너무 적을 때 쓰기를 거절해요.</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>실제로는: min.insync.replicas는 ISR의 하한선이에요</h3>
<table>
<thead><tr><th>현재 ISR 수(복제 계수 3 · 최소 ISR 2)</th><th>acks=all 쓰기 결과</th></tr></thead>
<tbody>
<tr><td>3</td><td>3곳의 복제를 기다려 성공</td></tr>
<tr><td>2</td><td>2곳의 복제를 기다려 성공</td></tr>
<tr><td>1</td><td>최소 수 미달로 쓰기 거절</td></tr>
</tbody>
</table>
<p class="point">최소 ISR 2는 두 곳만 골라 기다린다는 뜻이 아니에요.</p>
<p class="explain"><code>min.insync.replicas</code>는 <code>acks=all</code> 쓰기에 필요한 최소 ISR 수로 리더도 포함하며 ISR이 셋이면 셋 모두를 기다려요. Kafka 4.1의 기본값은 1이라 리더 하나뿐이어도 성공할 수 있지만 최소 수를 3으로 높이면 이 예에서는 한 대만 멈춰도 쓰기가 막혀요. 최소 수가 부족하면 <code>acks=all</code> 쓰기는 거절되고 프로듀서는 3편처럼 다시 보내기를 시도하다 시간 한도가 지나면 실패를 알아요. Kafka 4.1 문서 기준으로 이때는 HW도 늘어나지 않아 그동안 새 메시지는 아직 컨슈머가 읽을 수 없으며(쓰기가 거절되니 보통 새 메시지가 쌓이지도 않아요) 이 성질은 4묶음의 안전 후보에서 다시 쓰여요.</p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 건물 두 곳이 동시에 멈추면 어떻게 되나요?</summary>
<p>A. 복제 계수 3·acks=all·최소 ISR 2라면 한 곳만 남아 새 메시지 쓰기는 거절돼요. 남은 곳이 최신 사본을 가진 건물이라면 이미 함께 보관한 메시지는 꺼내 읽을 수 있어요. 남은 곳이 뒤처진 사본뿐이면 4묶음에서 볼 안전 후보가 없는 한 읽기도 복구를 기다려요. 멈춘 브로커가 돌아와 따라잡고 ISR이 두 곳 이상이 되면 쓰기도 다시 이어 갈 수 있어요.</p>
</details>
</aside>
</div>

<section class="slide" id="replication-write-playground" hidden>
<h3>직접 해 보기: 건물을 끄면 접수는 어떻게 될까요?</h3>
<div class="pp-body rp-widget" data-mode="write"></div>
<p class="point">위젯은 acks=all과 최소 ISR 2를 따르는 설명용 모형이에요.</p>
<p class="explain">가게는 누르지 않아도 계속 소식을 보내고 건물을 끄고 켜면 접수 결과가 달라져요. 건물 아래 숫자는 최근 소식 번호 세 개만 보여 주며 실제 장애 감지와 따라잡기는 이 모형보다 오래 걸릴 수 있어요. 리더가 바뀌는 이야기는 4묶음에서 살펴봐요.</p>
</section>

<p>참고: <a href="https://kafka.apache.org/41/configuration/producer-configs/#producerconfigs_acks">Kafka 4.1 acks</a> · <a href="https://kafka.apache.org/41/configuration/broker-configs/#brokerconfigs_min.insync.replicas">Kafka 4.1 최소 ISR</a> · <a href="https://kafka.apache.org/41/operations/eligible-leader-replicas/">Kafka 4.1 최소 ISR과 HW</a></p>

</div>

<div class="slide-group">
<h2 class="slide-group-title">리더 교체: 안전한 소식을 가진 사본이 이어받아요</h2>

<section class="slide">
<h3>리더 건물이 멈추면 따라온 사본이 접수를 맡아요</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="리더 멈춤 / 새 접수처 / 사본">
<text class="label center" x="200" y="25">명단(ISR) 안의 사본이 접수를 이어받아요</text>
<circle class="bad" cx="70" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="50" y="75" width="40" height="40"/><text class="chip" x="70" y="147">리더 멈춤</text>
<circle class="kafka" cx="200" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="180" y="75" width="40" height="40"/><text class="chip" x="200" y="147">새 접수처</text>
<circle class="kafka" cx="330" cy="95" r="30"/><use class="ic" href="#i-warehouse" x="310" y="75" width="40" height="40"/><text class="chip" x="330" y="147">칸 A의 사본</text>
</svg>
<p class="point">새 리더 건물은 이미 접수증을 준 소식을 지킬 수 있어야 해요.</p>
<p class="explain">접수증을 이미 준 소식은 HW 아래에 있어요. 새 리더는 이 소식을 모두 가진 건물이어야 해요. 그래서 리더 건물이 멈추면 단지 관리실(컨트롤러)이 명단 안에서 새 접수처를 고르고 명단에서 빠졌어도 확정된 곳까지는 다 가진 건물은 메모에 따로 적어 둬요.</p>
</section>

<section class="slide">
<h3>실제로는: 최신 사본이 모두 멈춰도 안전 후보를 기억해 둬요</h3>
<table>
<thead><tr><th>차례</th><th>컨트롤러의 선택</th></tr></thead>
<tbody>
<tr><td>1. 잘 따라오던 사본이 남음</td><td>ISR에서 새 리더를 골라요</td></tr>
<tr><td>2. ISR 후보가 모두 멈춤</td><td>ELR이 켜져 있고 안전 후보가 있으면 이어 가요</td></tr>
<tr><td>3. 안전 후보도 사용할 수 없음</td><td>복구를 기다려요 · unclean은 아래에서 봐요</td></tr>
</tbody>
</table>
<p class="point">ISR 밖의 사본도 ELR의 안전한 후보라면 리더를 이어받을 수 있어요.</p>
<p class="explain"><b>ELR(Eligible Leader Replicas)</b>은 ISR 밖에 있어도 리더를 맡을 수 있는 안전 후보의 명단으로 Kafka 4.1의 새 클러스터에서는 기본으로 켜져 있어요. 2묶음에서는 ISR 밖이면 뒤처진 사본이었지만 3묶음에서 본 것처럼 ISR이 최소 수보다 적어지면 HW가 더 늘지 않아요. 그래서 그 시점에 ISR에서 빠진 사본도 HW 아래 메시지는 모두 가지고 있으므로 <b>컨트롤러</b>(8편)가 이 사본을 ELR에 따로 적어 두고 ISR 후보가 모두 멈추면 사용 가능한 ELR 후보에서 새 리더를 골라요. 새 리더가 정해지면 프로듀서는 새 접수처 정보를 받아 그쪽에 메시지를 보내요.</p>
</section>

<section class="slide">
<h3>이럴 땐 조심해요: 뒤처진 사본을 세우면 소식을 잃을 수 있어요</h3>
<table>
<thead><tr><th>선택</th><th>대가</th></tr></thead>
<tbody>
<tr><td>안전한 후보가 없어 복구를 기다림</td><td>일은 멈추지만 뒤처진 소식으로 바꾸지 않아요</td></tr>
<tr><td>안전하지 않은 사본을 새 리더로 세움</td><td>다시 쓸 수 있어도 그 사본에 없던 소식을 잃을 수 있어요</td></tr>
</tbody>
</table>
<p class="point">unclean 선출은 지켜야 할 소식이 없는 사본을 리더로 세울 위험을 감수해요.</p>
<p class="explain">ISR과 ELR의 안전 후보도 쓸 수 없을 때 HW 아래의 메시지가 없을 수 있는 사본을 고르는 것이 <b>unclean 리더 선출</b>이에요. 이 선택은 접수를 다시 시작해도 이미 접수증을 준 메시지를 잃을 수 있어요. Kafka 4.1에서 <code>unclean.leader.election.enable</code>의 기본값은 <code>false</code>(꺼짐)라 안전한 사본이 돌아오기를 기다려요.</p>
</section>

<section class="slide" id="replication-leader-playground" hidden>
<h3>직접 해 보기: 리더 건물을 꺼 보세요</h3>
<div class="pp-body rp-widget" data-mode="leader"></div>
<p class="point">위젯은 acks=all과 최소 ISR 2를 따르며 잘 따라오던 사본이 리더를 이어받는 설명용 모형이에요.</p>
<p class="explain">처음 리더인 건물 B1만 끄고 켤 수 있어요. 끄면 다른 사본이 접수를 이어받고 다시 켜면 B1은 따라잡은 뒤 팔로워로 돌아와요. 건물 아래에는 최근 소식 번호 세 개만 보이며 ELR·unclean 선출은 이 모형에서 다루지 않아요.</p>
</section>

<section class="slide">
<h3>한눈에 다시 보기</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="사본, 리더와 팔로워, ISR과 HW, 접수 조건, 리더 교체의 다섯 줄 요약">
<circle class="kafka" cx="30" cy="28" r="18"/><use class="ic" href="#i-warehouse" x="17" y="15" width="26" height="26"/><text class="label" x="62" y="19">사본 · 복제 계수</text><text class="small" x="62" y="38" style="text-anchor:start">파티션의 소식을 서로 다른 브로커에 둬요</text>
<circle class="kafka" cx="30" cy="76" r="18"/><use class="ic" href="#i-warehouse" x="17" y="63" width="26" height="26"/><text class="label" x="62" y="67">리더 · 팔로워</text><text class="small" x="62" y="86" style="text-anchor:start">쓰기를 받는 쪽과 따라 적는 쪽이에요</text>
<circle class="box" cx="30" cy="124" r="18"/><use class="ic" href="#i-list-checks" x="17" y="111" width="26" height="26"/><text class="label" x="62" y="115">ISR · HW</text><text class="small" x="62" y="134" style="text-anchor:start">최신 사본의 명단과 복제를 마친 경계예요</text>
<circle class="box" cx="30" cy="172" r="18"/><use class="ic" href="#i-receipt" x="17" y="159" width="26" height="26"/><text class="label" x="62" y="163">acks=all · 최소 ISR</text><text class="small" x="62" y="182" style="text-anchor:start">명단 전체를 기다리고 너무 적으면 거절해요</text>
<circle class="kafka" cx="30" cy="220" r="18"/><use class="ic" href="#i-warehouse" x="17" y="207" width="26" height="26"/><text class="label" x="62" y="211">리더 교체 · ELR</text><text class="small" x="62" y="230" style="text-anchor:start">최신 사본이 모두 멈췄을 때 쓸 안전 후보예요</text>
</svg>
<p class="point">복제는 여러 곳에 소식을 남기고 안전한 사본으로 일을 이어 가게 해요.</p>
</section>

<p>참고: <a href="https://kafka.apache.org/41/operations/eligible-leader-replicas/">Kafka 4.1 ELR과 선출 순서</a> · <a href="https://kafka.apache.org/41/configuration/broker-configs/#brokerconfigs_unclean.leader.election.enable">Kafka 4.1 unclean 선출</a></p>

</div>

</div>

<link rel="stylesheet" href="{{ '/assets/css/replication-playground.css' | relative_url }}">
<script defer src="{{ '/assets/js/replication-playground.js' | relative_url }}"></script>
