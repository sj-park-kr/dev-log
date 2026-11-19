---
layout: post
title: "선반이 꽉 차면 어떻게 할까? 택배 물류센터로 이해하는 Kafka 보관과 정리"
description: "읽어도 남는 Kafka 기록을 언제 지우는지 보관 한도·로그 컴팩션·톰스톤을 물류센터 그림과 움직이는 위젯으로 설명합니다."
date: 2026-11-15 15:00:00 +0900
series: kafka
episode: 6
summary: "읽은 소식도 남겨 두되 오래된 단을 통째로 버리거나 키별 최신 상태를 남겨요. 무엇을 다시 읽어야 하는지가 정리 방법을 결정해요."
---

<div class="lesson lesson-hierarchy">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: https://cdn.jsdelivr.net/npm/lucide-static@1.25.0/icons/ (ISC). 라이선스: assets/icons/LICENSE-lucide.txt. -->
<symbol id="i-store" viewBox="0 0 24 24"><path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"/><path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244"/><path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"/></symbol>
<symbol id="i-package" viewBox="0 0 24 24"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/></symbol>
<symbol id="i-file-text" viewBox="0 0 24 24"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></symbol>
<symbol id="i-user-round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></symbol>
<symbol id="i-shelving-unit" viewBox="0 0 24 24"><path d="M12 12V9a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/><path d="M16 20v-3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/><path d="M20 22V2"/><path d="M4 12h16"/><path d="M4 20h16"/><path d="M4 2v20"/><path d="M4 4h16"/></symbol>
<symbol id="i-layers" viewBox="0 0 24 24"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" /><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" /><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" /></symbol>
<symbol id="i-timer" viewBox="0 0 24 24"><line x1="10" x2="14" y1="2" y2="2" /><line x1="12" x2="15" y1="14" y2="11" /><circle cx="12" cy="14" r="8" /></symbol>
<symbol id="i-list-filter" viewBox="0 0 24 24"><path d="M2 5h20" /><path d="M6 12h12" /><path d="M9 19h6" /></symbol>
<symbol id="i-trash-2" viewBox="0 0 24 24"><path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></symbol>
</defs>
</svg>
<div class="intro">
<p class="q">읽어도 남는 소식은 언제 지우는 걸까요?</p>
<p>5편에서는 센터 건물에 해당하는 브로커가 고장 나도 이어 가도록 사본을 두었어요. 하지만 사본까지 계속 쌓아 둘 공간은 한정돼 있어요. 1편에서 읽어도 남고 정해 둔 기간이나 용량을 넘으면 지운다고 한 이야기를 이제 자세히 살펴봐요.</p>
<p>이 글을 다 읽으면 오래된 기록을 묶어서 버리는 방법과 키별 최신 상태(예: 동네별 지금 배송 안내처럼 각 키의 가장 최근 값 모음)를 남기는 방법이 왜 다른지 알 수 있어요. 삭제를 표시하는 소식도 함께 살펴보며 어떤 기록을 다시 읽을 수 있는지 구분해요.</p>
</div>
<div class="slide-group">
<h2 class="slide-group-title">쌓이는 기록: 읽었다는 것과 지운다는 것은 달라요</h2>

<section class="slide">
<h3>담당자가 읽기를 기다리지 않고 보관 한도로 지워요</h3>
<svg class="dg" viewBox="0 0 400 220" role="img" aria-label="가게에서 새 택배가 계속 도착하고 읽은 택배도 선반에 남아 공간이 부족한 그림">
<circle class="box" cx="52" cy="65" r="32"/><use class="ic" href="#i-store" x="30" y="43" width="44" height="44"/><text class="chip" x="52" y="114">주문 가게</text><circle class="new" cx="200" cy="65" r="32"/><use class="ic" href="#i-shelving-unit" x="178" y="43" width="44" height="44"/><text class="chip" x="200" y="114">주문 선반</text><circle class="box" cx="348" cy="65" r="32"/><use class="ic" href="#i-user-round" x="326" y="43" width="44" height="44"/><text class="chip" x="348" y="114">알림 담당</text><path class="line" d="M86,65 L163,65 M235,65 L313,65"/><circle class="new" cx="116" cy="155" r="18"/><use class="ic" href="#i-package" x="103" y="142" width="26" height="26"/><circle class="new" cx="158" cy="155" r="18"/><use class="ic" href="#i-package" x="145" y="142" width="26" height="26"/><circle class="new" cx="200" cy="155" r="18"/><use class="ic" href="#i-package" x="187" y="142" width="26" height="26"/><circle class="new" cx="242" cy="155" r="18"/><use class="ic" href="#i-package" x="229" y="142" width="26" height="26"/><circle class="box" cx="284" cy="155" r="18"/><use class="ic" href="#i-package" x="271" y="142" width="26" height="26"/><text class="small" x="200" y="198">읽어도 남아요 · 새 소식도 와요</text>
</svg>
<p class="point">다시 읽으려고 남겨 둔 소식에도 보관할 자리가 필요해요.</p>
<p class="explain">가게는 소식을 보내는 프로듀서이고 담당자는 꺼내 읽는 컨슈머이며 1편처럼 실제 택배와 달리 내용을 보기만 해서 읽어도 소식이 남아요. 센터는 담당자가 읽었는지를 보고 지우는 게 아니라 정해 둔 기간·용량으로 지워요. 그래서 담당자가 오래 쉬면 못 읽은 소식도 지워질 수 있어요.</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>실제로는: 못 읽은 메시지도 사라질 수 있어요</h3>
<table>
<thead><tr><th>상황</th><th>메시지는 어떻게 되나요?</th></tr></thead>
<tbody>
<tr><td>서비스가 오래 멈춤</td><td>그동안 도착한 메시지를 꺼내 읽지 못해요</td></tr>
<tr><td>보관 한도에 도달</td><td>브로커는 못 읽은 메시지도 삭제할 수 있어요</td></tr>
</tbody>
</table>
<p class="point">읽은 위치와 상관없이 한도가 되면 지워요.</p>
<p class="explain">Kafka가 2편의 칸인 <b>파티션</b>에 이어 쓰는 기록을 <b>로그</b>라고 해요. 서비스가 돌아와 이어 읽을 예전 자리는 4편의 <b>커밋한 위치(오프셋)</b>예요. 그 메시지가 지워졌다면 같은 메시지를 다시 받을 수 없고 남은 기록에서 이어 읽어야 해요. 시작 위치가 보관 범위 밖이면 4편에서 본 시작 위치 규칙을 따라요.</p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 못 읽은 소식이 지워지면 서비스가 알 수 있나요?</summary>
<p>A. 다음에 읽으려는 위치가 보관 범위보다 앞이면 컨슈머가 그 위치에서 이어 읽을 수 없음을 알아요. 그때는 4편의 시작 위치 규칙인 <code>auto.offset.reset</code>을 따라 <code>earliest</code>면 남은 가장 오래된 기록부터 읽고 <code>latest</code>면 현재 끝으로 옮겨 이후의 새 소식부터 읽어요. 지워진 소식의 내용까지 알려 주지는 않으며 자동으로 옮기도록 두었다면 서비스가 누락을 따로 알아채도록 대비해야 해요.</p>
<p>컴팩션으로 중간 번호만 비었다면 시작 위치를 다시 정하지 않고 그 뒤의 남은 메시지부터 받아요.</p>
<p>참고: <a href="https://kafka.apache.org/41/configuration/consumer-configs/#auto.offset.reset">Apache Kafka 4.1: 읽을 위치가 사라졌을 때의 시작 규칙</a> · <a href="https://kafka.apache.org/41/design/design/#log-compaction-basics">컴팩션으로 빈 번호에서 읽기</a></p>
</details>
</aside>
</div>

<details class="origin">
<summary>더 알아보기: 보관과 키별 정리는 어디서 출발했을까?</summary>
<p>2011년 LinkedIn의 제이 크렙스(Jay Kreps), 네하 나크헤데(Neha Narkhede), 준 라오(Jun Rao)가 발표한 Kafka 논문에는 이미 읽은 메시지도 일정 기간 보관하고 오래된 기록 파일을 묶음째 지우는 설계가 나와요. 여러 서비스가 각자의 속도로 꺼내 읽고 다시 읽으면서도 저장 공간을 회수하려는 방법이었어요.</p>
<p>Kafka의 로그 컴팩션은 같은 회사에서 데이터가 바뀐 소식을 전하던 시스템에서 영감을 받았어요. 서비스가 다시 켜질 때 현재 상태를 복구하려면 최근에 바뀌지 않은 항목도 필요해서 기간으로만 자르면 부족했어요.</p>
<p><b>retention</b>은 보관을 뜻하고 <b>compaction</b>은 불필요한 옛 기록을 덜어 더 작게 만든다는 뜻이에요.</p>
<p>참고: <a href="https://www.microsoft.com/en-us/research/wp-content/uploads/2017/09/Kafka.pdf">2011년 Kafka 논문: 오래된 기록의 보관</a> · <a href="https://kafka.apache.org/41/design/design/#log-compaction">Apache Kafka 4.1: 현재 상태를 복구하려는 이유</a></p>
</details></div>

<div class="slide-group">
<h2 class="slide-group-title">보관 한도: 오래된 묶음을 통째로 치워요</h2>

<section class="slide">
<h3>기간이 지난 단은 정리 때 버려요</h3>
<svg class="dg" viewBox="0 0 400 235" role="img" aria-label="칸 0인 파티션 안에 단 0과 단 1과 쓰는 중인 단 2가 있고 오래된 단 0 전체가 폐기 대상인 그림">
<rect class="line" x="5" y="5" width="390" height="220" rx="12"/><text class="label center" x="200" y="27">칸 0 (파티션) 안의 기록</text>
<g transform="translate(0,30)">
<rect class="line" x="12" y="20" width="116" height="128" rx="12"/><text class="label center" x="70" y="42">단 0 · 폐기</text><circle class="bad" cx="34" cy="82" r="18"/><use class="ic" href="#i-package" x="21" y="69" width="26" height="26"/><text class="chip" x="34" y="117">0</text><circle class="bad" cx="70" cy="82" r="18"/><use class="ic" href="#i-package" x="57" y="69" width="26" height="26"/><text class="chip" x="70" y="117">1</text><circle class="bad" cx="106" cy="82" r="18"/><use class="ic" href="#i-package" x="93" y="69" width="26" height="26"/><text class="chip" x="106" y="117">2</text><rect class="line" x="142" y="20" width="116" height="128" rx="12"/><text class="label center" x="200" y="42">단 1 · 보관</text><circle class="new" cx="164" cy="82" r="18"/><use class="ic" href="#i-package" x="151" y="69" width="26" height="26"/><text class="chip" x="164" y="117">3</text><circle class="new" cx="200" cy="82" r="18"/><use class="ic" href="#i-package" x="187" y="69" width="26" height="26"/><text class="chip" x="200" y="117">4</text><circle class="new" cx="236" cy="82" r="18"/><use class="ic" href="#i-package" x="223" y="69" width="26" height="26"/><text class="chip" x="236" y="117">5</text><rect class="line" x="272" y="20" width="116" height="128" rx="12"/><text class="label center" x="330" y="42">단 2 · 쓰는 중</text><circle class="new" cx="294" cy="82" r="18"/><use class="ic" href="#i-package" x="281" y="69" width="26" height="26"/><text class="chip" x="294" y="117">6</text><circle class="new" cx="330" cy="82" r="18"/><use class="ic" href="#i-package" x="317" y="69" width="26" height="26"/><text class="chip" x="330" y="117">7</text><text class="small" x="200" y="180">오래된 단 전체가 폐기 대상이에요</text>
</g>
</svg>
<p class="point">기간으로 치울 때는 택배 하나씩이 아니라 오래된 단을 통째로 버려요.</p>
<p class="explain">센터는 2편의 칸(파티션) 안에 기록을 들어온 순서대로 단에 쌓고 단이 정해 둔 크기나 시간만큼 차면 새 단(세그먼트)을 시작해요. 센터(브로커)가 주기적으로 돌리는 정리 작업은 단 안의 가장 새 소식까지 기간이 지나야 그 단을 통째로 버려서 단 0은 버리고 단 1은 남겨요. 오래된 단을 치우면 담당자가 못 읽은 소식도 함께 사라져요.</p>
</section>

<section class="slide">
<h3>실제로는: 브로커가 세그먼트 단위로 지워요</h3>
<p class="explain"><b>세그먼트</b>는 한 파티션의 로그를 나눠 디스크에 저장한 파일 묶음이에요. 선반인 토픽마다 <code>cleanup.policy</code>로 기간·용량에 따라 지우기(<code>delete</code>)와 다음 묶음에서 볼 방식(<code>compact</code>) 중 고르거나 둘 다 쓸 수 있어요. 이 중 기간·용량으로 보관하는 기준을 <b>보관 정책(retention)</b>이라고 하며 용량 한도는 파티션마다 적용돼요. 삭제는 주기적으로 확인해 세그먼트째 처리하므로 메시지마다 정확한 삭제 시각을 약속하지 않아요.</p>
<table>
<thead><tr><th>로그의 부분</th><th>브로커가 하는 일</th></tr></thead>
<tbody>
<tr><td>쓰는 중인 세그먼트</td><td>새 메시지를 적는 중이라 아직 버리지 않아요</td></tr>
<tr><td>오래된 세그먼트</td><td>delete 정책에서 기간 또는 파티션별 용량 한도를 넘으면 묶음째 지워요</td></tr>
</tbody>
</table>
<p class="point">보관 한도는 개별 메시지의 정확한 삭제 시각을 약속하지 않아요.</p>
</section>

<section class="slide" data-retention-playground="retention" hidden>
<h3>직접 해 보기: 못 읽은 소식도 기간이 지나면 사라져요</h3>
<div class="rc-controls"><label for="rc-retention-choice">보관 기간</label><select id="rc-retention-choice"><option value="6">짧게 (6틱)</option><option value="12">길게 (12틱)</option></select></div>
<div class="pp-body"></div>
<p class="rc-help">1틱은 새 소식 한 건이 오는 간격이에요. ‘쓰는 중’은 지금 적는 단이고 ‘닫힘’은 다 채운 단이며 ‘못 읽음’은 쉬고 있는 담당자가 아직 읽지 못한 소식이에요.</p>
<p class="point">한 단에 세 건씩 담고 시간을 줄인 설명용 예시이며 실제 Kafka도 오래된 세그먼트를 묶음째 지워요.</p>
<p class="explain">담당자가 자리를 비워 도착한 소식을 하나도 읽지 못하는 상황이에요. 길게 보관하며 단이 쌓이게 한 뒤 짧게 바꿔 보세요. 다음 정리 때 ‘못 읽음’이 붙은 소식도 단째 사라지는지 살펴봐요.</p>
</section>

<p>참고: <a href="https://kafka.apache.org/41/implementation/log/">Apache Kafka 4.1: 로그 파일과 정리</a> · <a href="https://kafka.apache.org/41/configuration/topic-configs/#retention.ms">시간·용량 보관 한도</a></p></div>

<div class="slide-group">
<h2 class="slide-group-title">키별 최신 상태: 바뀐 결과를 복구할 만큼 남겨요</h2>

<section class="slide">
<h3>같은 동네의 새 소식이 있으면 옛것을 덜어내요</h3>
<svg class="dg" viewBox="0 0 400 265" role="img" aria-label="빨강은 치울 옛 소식이고 초록은 남는 최신 소식이며 정리 전 용산 0 강남 1 용산 2 강남 3이 있고 정리 뒤에는 용산 2와 강남 3이 원래 순서와 번호로 남은 그림">
<text class="label center" x="200" y="20">칸 0 안의 동네별 안내문</text><circle class="bad" cx="56" cy="63" r="18"/><use class="ic" href="#i-file-text" x="43" y="50" width="26" height="26"/><text class="chip" x="56" y="98">0 · 용산</text><circle class="bad" cx="152" cy="63" r="18"/><use class="ic" href="#i-file-text" x="139" y="50" width="26" height="26"/><text class="chip" x="152" y="98">1 · 강남</text><circle class="new" cx="248" cy="63" r="18"/><use class="ic" href="#i-file-text" x="235" y="50" width="26" height="26"/><text class="chip" x="248" y="98">2 · 용산</text><circle class="new" cx="344" cy="63" r="18"/><use class="ic" href="#i-file-text" x="331" y="50" width="26" height="26"/><text class="chip" x="344" y="98">3 · 강남</text>
<text class="label center" x="200" y="130">옛 소식을 덜어 낸 뒤</text><circle class="new" cx="248" cy="173" r="18"/><use class="ic" href="#i-file-text" x="235" y="160" width="26" height="26"/><text class="chip" x="248" y="208">2 · 용산</text><circle class="new" cx="344" cy="173" r="18"/><use class="ic" href="#i-file-text" x="331" y="160" width="26" height="26"/><text class="chip" x="344" y="208">3 · 강남</text>
<text class="alert" x="105" y="245">빨강: 치울 옛 소식</text><text class="small" x="290" y="245">초록: 남는 최신 소식</text>
</svg>
<p class="point">현재 상태가 목적이면 동네마다 마지막으로 온 안내문이 필요해요.</p>
<p class="explain">이제 이 선반에는 주문 택배 대신 <b>동네별 배송 안내</b>(예: 용산: 오늘 오후 도착)를 맡긴다고 해 봐요. 처음부터 모두 읽어도 되지만 기록이 쌓일수록 보관 공간과 읽는 시간이 많이 들어 새로 시작한 서비스가 동네별 현재 안내를 빨리 알도록 옛것을 덜어내요. 선반의 맨 마지막 안내문 하나만 남기면 다른 동네의 현재 안내를 알 수 없으니 동네마다 최신 안내를 남겨요.</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>실제로는: 컴팩션은 파티션 안에서 같은 키의 옛 값을 치워요</h3>
<svg class="dg" viewBox="0 0 400 165" role="img" aria-label="오프셋 0과 1의 옛 값은 사라지고 2번 용산 새 안내와 3번 강남 새 안내가 원래 번호로 남은 파티션">
<text class="label center" x="200" y="20">같은 파티션의 남은 메시지</text>
<circle class="line dash" cx="56" cy="65" r="18"/><text class="chip" x="56" y="108">0 · 빈 자리</text>
<circle class="line dash" cx="152" cy="65" r="18"/><text class="chip" x="152" y="108">1 · 빈 자리</text>
<circle class="new" cx="248" cy="65" r="18"/><use class="ic" href="#i-file-text" x="235" y="52" width="26" height="26"/><text class="chip" x="248" y="108">2 · 용산</text>
<circle class="new" cx="344" cy="65" r="18"/><use class="ic" href="#i-file-text" x="331" y="52" width="26" height="26"/><text class="chip" x="344" y="108">3 · 강남</text>
<text class="small" x="200" y="145">남은 순서와 번호는 바꾸지 않아요</text>
</svg>
<p class="point">로그 컴팩션은 키마다 최신 값을 남기며 남은 메시지의 순서와 오프셋은 바꾸지 않아요.</p>
<p class="explain"><b>로그 컴팩션(log compaction)</b>은 같은 키의 더 새 메시지가 있을 때 옛 메시지를 덜어내는 작업이며 동네 이름이 <b>키(key)</b>이고 안내 내용이 <b>값(value)</b>이에요. 2편처럼 같은 키를 같은 파티션에 모아 두면 브로커가 틈틈이 도는 정리 작업으로 옛 값을 치우며 정해진 시각에 바로 사라지지는 않아요. 새 메시지를 계속 적는 쓰는 중인 단은 컴팩션 대상에서 빼고 닫힌 단을 정리하므로 옛 값이 한동안 함께 남아요. 지워진 번호를 달라고 하면 기간 삭제로 앞쪽이 통째로 없어진 경우엔 4편의 시작 위치 규칙을 따르고 컴팩션으로 중간 번호만 빈 경우엔 그다음 남은 메시지부터 받아요.</p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 옛 값 이력도 필요한 서비스는 어떻게 하나요?</summary>
<p>A. 변경 이력이 필요하다면 컴팩션을 하지 않고 기간·용량으로 보관하는 토픽을 따로 둘 수 있어요. 예를 들어 현재 안내를 빨리 복구하는 토픽과 지난 안내의 변경 내역을 조사하는 토픽을 나눠 같은 변경 소식을 보내요. 이력용 토픽도 보관 한도 뒤에는 사라지므로 필요한 기간에 맞춰 보관해야 해요.</p>
<p>참고: <a href="https://kafka.apache.org/41/design/design/#log-compaction">Apache Kafka 4.1: 토픽마다 다른 보관 방식</a></p>
</details>
</aside>
</div>

<section class="slide" data-retention-playground="compact" hidden>
<h3>직접 해 보기: 기간 기준과 키 기준을 바꿔 봐요</h3>
<div class="rc-controls"><label for="rc-compact-choice">정리 정책</label><select id="rc-compact-choice"><option value="compact">키별 최신 값 (compact)</option><option value="delete">기간이 지난 단 (6틱·delete)</option></select></div>
<div class="pp-body"></div>
<p class="rc-help">‘단 N · 쓰는 중’은 지금 적는 단이라 정리에서 빠지고 ‘닫힘’은 다 채워 정리 대상이 된 단이에요.</p>
<p class="point">간격과 단 크기는 설명용이며 실제 Kafka도 키별 최신 상태를 남기는 정책과 오래된 세그먼트를 버리는 정책을 구분해요.</p>
<p class="explain">용산 소식은 초반에만 오고 이후에는 강남 소식만 갱신돼요. 기간 기준으로 바꾸면 용산의 마지막 안내도 사라지지만 키 기준에서는 새 용산 안내가 오기 전까지 남아요. ‘쓰는 중’인 단은 정리에서 빠지므로 옛 값이 잠시 함께 남는 것도 살펴봐요.</p>
</section>

<section class="slide">
<h3>이럴 땐 조심해요: 두 정책을 함께 쓰면 최신 값도 지워져요</h3>
<table>
<thead><tr><th>함께 쓰는 정책</th><th>남는 범위</th></tr></thead>
<tbody>
<tr><td><code>delete,compact</code></td><td>오래된 단은 버리고 남은 단에서는 키별 옛 값을 덜어내요</td></tr>
</tbody>
</table>
<p class="point">기간 삭제와 컴팩션을 함께 쓰면 키의 최신 값도 영원히 남지는 않아요.</p>
<p class="explain"><code>delete,compact</code>는 기간·용량으로 지우기와 키별 최신만 남기기를 <b>둘 다</b> 적용한다는 뜻이에요. 최신 값은 남기되 아주 오래 갱신되지 않은 키는 정리하려는 경우에 써요. 모든 키의 현재 상태를 복구해야 한다면 마지막 값이 든 단까지 보관 한도로 사라질 수 있다는 점을 고려해야 해요.</p>
</section>

<p>참고: <a href="https://kafka.apache.org/41/design/design/#log-compaction">Apache Kafka 4.1: 컴팩션과 오프셋 보장</a> · <a href="https://kafka.apache.org/41/configuration/topic-configs/#cleanup.policy">정리 정책의 조합</a></p></div>

<div class="slide-group">
<h2 class="slide-group-title">삭제 표시: 남겨 둔 상태도 없앨 수 있어야 해요</h2>

<section class="slide">
<h3>동네 안내를 없애려면 폐기 표지를 맡겨요</h3>
<svg class="dg" viewBox="0 0 400 340" role="img" aria-label="용산 안내문 뒤에 용산 폐기 표지를 맡기고 컴팩션 뒤에는 강남과 폐기 표지가 남다가 나중에는 강남만 남는 그림">
<text class="label center" x="200" y="18">폐기 표지도 맨 끝에 맡겨요</text><circle class="bad" cx="56" cy="61" r="18"/><use class="ic" href="#i-file-text" x="43" y="48" width="26" height="26"/><text class="chip" x="56" y="96">0 · 용산</text><circle class="new" cx="152" cy="61" r="18"/><use class="ic" href="#i-file-text" x="139" y="48" width="26" height="26"/><text class="chip" x="152" y="96">1 · 강남</text><circle class="bad" cx="248" cy="61" r="18"/><use class="ic" href="#i-file-text" x="235" y="48" width="26" height="26"/><text class="chip" x="248" y="96">2 · 용산</text><circle class="bad" cx="344" cy="61" r="18"/><use class="ic" href="#i-trash-2" x="331" y="48" width="26" height="26"/><text class="chip" x="344" y="96">3 · 용산 폐기</text>
<text class="label center" x="200" y="126">컴팩션 뒤에는 표지도 잠시 남아요</text><circle class="new" cx="152" cy="169" r="18"/><use class="ic" href="#i-file-text" x="139" y="156" width="26" height="26"/><text class="chip" x="152" y="204">1 · 강남</text><circle class="bad" cx="344" cy="169" r="18"/><use class="ic" href="#i-trash-2" x="331" y="156" width="26" height="26"/><text class="chip" x="344" y="204">3 · 용산 폐기</text>
<text class="label center" x="200" y="234">나중에는 표지도 치워요</text><circle class="new" cx="152" cy="277" r="18"/><use class="ic" href="#i-file-text" x="139" y="264" width="26" height="26"/><text class="chip" x="152" y="312">1 · 강남</text>
</svg>
<p class="point">새 소식이 없는 동네를 지우려면 그 동네의 폐기 표지를 새로 보내요.</p>
<p class="explain">담당자는 동네별 안내를 따로 적어 두고 쓰지만 센터는 동네 이름인 키마다 마지막 값만 볼 뿐 그 안내가 아직 필요한지는 몰라요. 가게가 ‘이 동네 안내는 이제 없음’이라는 빈 안내문을 맡기면 센터가 옛 안내를 치우고 나중에는 그 빈 안내문도 치워요. 담당자는 빈 안내문을 읽고 적어 둔 그 동네 안내도 지워요.</p>
</section>

<section class="slide">
<h3>실제로는: 키가 있고 값이 null인 메시지가 톰스톤이에요</h3>
<table>
<thead><tr><th>보내는 값</th><th>컴팩션 토픽에서의 의미</th></tr></thead>
<tbody>
<tr><td>키=용산, 값=<code>null</code></td><td>용산의 과거 값을 지우도록 표시해요</td></tr>
</tbody>
</table>
<p class="point">브로커는 컴팩션 때 그 키의 과거 값을 먼저 치우고 톰스톤 자체는 정해 둔 보관 시간이 지난 뒤 치워요.</p>
<p class="explain">폐기 표지인 <b>톰스톤(tombstone)</b>은 키가 있고 값이 <code>null</code>인 메시지로 <code>null</code>은 값이 비어 있다는 뜻이에요. 컴팩션 토픽에서는 이 빈 내용이 삭제를 뜻하므로 프로듀서가 보내면 브로커가 그 키의 과거 값을 먼저 치우고 보관 시간이 지나면 톰스톤도 치워요. 컨슈머 서비스는 매번 다시 읽지 않으려고 서비스가 따로 쓰는 저장소(DB)나 실행 중 기억(메모리)에 동네별 현재 안내를 만들어 둘 수 있어요. 이 서비스는 톰스톤을 읽으면 따로 보관하던 그 동네의 안내도 지워야 해요.</p>
</section>

<section class="slide" data-retention-playground="tombstone" hidden>
<h3>직접 해 보기: 폐기 표지를 보내면 무엇이 사라질까요?</h3>
<div class="rc-controls"><label for="rc-tombstone-choice">용산 폐기 표지</label><select id="rc-tombstone-choice"><option value="off">보내지 않아요</option><option value="on">보내요</option></select></div>
<div class="pp-body"></div>
<p class="rc-help">‘단 N · 쓰는 중’은 지금 적는 단이라 정리에서 빠지고 ‘닫힘’은 다 채워 정리 대상이 된 단이에요.</p>
<p class="point">용산 갱신이 멈춘 뒤 강남 소식만 계속 오는 설명용 예시이며 실제 Kafka도 톰스톤을 영원히 보관하지 않아요.</p>
<p class="explain">처음에는 표지 없이 용산의 최신 안내를 남겨요. 표지를 보내도록 바꾸면 새 폐기 소식이 도착하고 다음 정리에서 옛 안내가 사라져요. 다시 보내지 않기로 바꿔도 이미 지워진 안내는 돌아오지 않아요.</p>
</section>

<section class="slide">
<h3>이럴 땐 조심해요: 오래 멈춘 서비스는 삭제 표시를 놓쳐요</h3>
<table>
<thead><tr><th>상황</th><th>일어나는 일</th></tr></thead>
<tbody>
<tr><td>옛 용산 안내를 저장한 서비스가 톰스톤이 치워진 뒤 다시 켜져요</td><td>용산 삭제를 알 수 없어 낡은 용산 안내가 그대로 남아요</td></tr>
<tr><td>톰스톤이 남아 있는 동안 다시 켜서 쌓인 메시지를 끝까지 읽어요</td><td>톰스톤을 읽고 저장해 둔 용산 안내를 지워요</td></tr>
</tbody>
</table>
<p class="point">삭제 표시를 놓친 컨슈머의 낡은 상태를 Kafka가 저절로 지워 주지는 않아요.</p>
<p class="explain">톰스톤을 보관하는 시간은 토픽 설정으로 정하며 그 시간이 지나면 브로커가 톰스톤도 치워요. 그래서 톰스톤이 남아 있는 동안 다시 켜서 쌓인 메시지를 끝까지 읽어야 그 키가 삭제됐다는 것을 알 수 있어요. 이미 놓쳤다면 낡은 상태를 비우고 남은 기록을 처음부터 다시 읽어 상태를 새로 만들어요.</p>
</section>

<section class="slide">
<h3>한눈에 다시 보기</h3>
<svg class="dg" viewBox="0 0 400 205" role="img" aria-label="세그먼트 보관 한도 로그 컴팩션 톰스톤의 역할을 아이콘과 한 줄씩 보여 주는 네 줄 요약">
<circle class="box" cx="30" cy="28" r="18"/><use class="ic" href="#i-layers" x="17" y="15" width="26" height="26"/><text class="label" x="62" y="19">세그먼트</text><text class="small" x="62" y="38" style="text-anchor:start">파티션 로그를 나눠 보관하는 파일 묶음</text><circle class="bad" cx="30" cy="76" r="18"/><use class="ic" href="#i-timer" x="17" y="63" width="26" height="26"/><text class="label" x="62" y="67">보관 한도</text><text class="small" x="62" y="86" style="text-anchor:start">기간·파티션별 용량으로 오래된 묶음을 삭제</text><circle class="new" cx="30" cy="124" r="18"/><use class="ic" href="#i-list-filter" x="17" y="111" width="26" height="26"/><text class="label" x="62" y="115">로그 컴팩션</text><text class="small" x="62" y="134" style="text-anchor:start">파티션 안에서 키마다 최신 상태를 보관</text><circle class="bad" cx="30" cy="172" r="18"/><use class="ic" href="#i-trash-2" x="17" y="159" width="26" height="26"/><text class="label" x="62" y="163">톰스톤</text><text class="small" x="62" y="182" style="text-anchor:start">키와 null 값으로 삭제를 표시하는 메시지</text>
</svg>
<p class="point">무엇을 다시 읽어야 하는지에 맞춰 오래된 이력을 버리거나 키별 최신 상태를 남겨요.</p>
</section>

<p>참고: <a href="https://kafka.apache.org/41/design/design/#log-compaction-basics">Apache Kafka 4.1: 삭제 표시와 컴팩션</a> · <a href="https://kafka.apache.org/41/configuration/topic-configs/#delete.retention.ms">톰스톤 보관과 컨슈머의 복구 범위</a></p></div>

</div>
<link rel="stylesheet" href="{{ '/assets/css/retention-compaction-playground.css' | relative_url }}">
<script defer src="{{ '/assets/js/retention-compaction-playground.js' | relative_url }}"></script>
