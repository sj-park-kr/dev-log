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
<symbol id="i-user-round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></symbol>
<symbol id="i-shelving-unit" viewBox="0 0 24 24"><path d="M12 12V9a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/><path d="M16 20v-3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/><path d="M20 22V2"/><path d="M4 12h16"/><path d="M4 20h16"/><path d="M4 2v20"/><path d="M4 4h16"/></symbol>
</defs>
</svg>
<div class="intro">
<p class="q">읽어도 남는 소식은 언제 지우는 걸까요?</p>
<p>5편에서는 브로커가 고장 나도 이어 가도록 사본을 두었어요. 하지만 사본까지 계속 쌓아 둘 공간은 한정돼 있어요. 1편에서 읽어도 남고 정해 둔 기간이나 용량을 넘으면 지운다고 한 이야기를 이제 자세히 살펴봐요.</p>
<p>이 글을 다 읽으면 오래된 기록을 묶어서 버리는 방법과 키별 최신 상태를 남기는 방법이 왜 다른지 알 수 있어요. 삭제를 표시하는 소식도 함께 살펴보며 어떤 기록을 다시 읽을 수 있는지 구분해요.</p>
</div>
<div class="slide-group">
<h2 class="slide-group-title">쌓이는 기록: 읽었다는 것과 지운다는 것은 달라요</h2>

<section class="slide">
<h3>담당자가 다 읽어도 선반은 비워지지 않아요</h3>
<svg class="dg" viewBox="0 0 400 220" role="img" aria-label="가게에서 새 택배가 계속 도착하고 읽은 택배도 선반에 남아 공간이 부족한 그림">
<circle class="box" cx="52" cy="65" r="32"/><use class="ic" href="#i-store" x="30" y="43" width="44" height="44"/><text class="chip" x="52" y="114">주문 가게</text><circle class="new" cx="200" cy="65" r="32"/><use class="ic" href="#i-shelving-unit" x="178" y="43" width="44" height="44"/><text class="chip" x="200" y="114">주문 선반</text><circle class="box" cx="348" cy="65" r="32"/><use class="ic" href="#i-user-round" x="326" y="43" width="44" height="44"/><text class="chip" x="348" y="114">알림 담당</text><path class="line" d="M86,65 L163,65 M235,65 L313,65"/><circle class="new" cx="116" cy="155" r="18"/><use class="ic" href="#i-package" x="103" y="142" width="26" height="26"/><circle class="new" cx="158" cy="155" r="18"/><use class="ic" href="#i-package" x="145" y="142" width="26" height="26"/><circle class="new" cx="200" cy="155" r="18"/><use class="ic" href="#i-package" x="187" y="142" width="26" height="26"/><circle class="new" cx="242" cy="155" r="18"/><use class="ic" href="#i-package" x="229" y="142" width="26" height="26"/><circle class="bad" cx="284" cy="155" r="18"/><use class="ic" href="#i-package" x="271" y="142" width="26" height="26"/><text class="small" x="200" y="198">읽어도 남아요 · 새 소식도 와요</text>
</svg>
<p class="point">다시 읽으려고 남겨 둔 소식에도 보관할 자리가 필요해요.</p>
<p class="explain">가게가 새 소식을 맡길 때마다 센터의 보관량이 늘어요. 담당자가 내용을 확인하는 일과 센터가 상자를 치우는 일은 따로예요. 센터는 나중에 무엇을 다시 읽어야 하는지에 맞춰 버릴 기준을 정해야 해요.</p>
</section>

<section class="slide">
<h3>실제로는: 컨슈머의 읽기와 브로커의 삭제는 별개예요</h3>
<table>
<thead><tr><th>하는 일</th><th>담당과 기준</th></tr></thead>
<tbody>
<tr><td>읽은 자리 저장</td><td>컨슈머 그룹이 다음에 읽을 오프셋을 기억해요</td></tr>
<tr><td>기록 보관과 삭제</td><td>브로커가 토픽에 정한 정책으로 관리해요</td></tr>
</tbody>
</table>
<p class="point">컨슈머가 어디까지 꺼내 읽었는지가 보관 한도를 늘려 주지는 않아요.</p>
<p class="explain">Kafka가 파티션에 이어 쓰는 기록을 <b>로그</b>라고 해요. 브로커는 컨슈머의 읽기 완료와 별개로 로그를 보관하므로 느린 서비스의 못 읽은 메시지도 사라질 수 있어요. 토픽마다 오래된 이력이 필요한지 현재 상태가 필요한지에 따라 정리 정책을 골라요.</p>
</section>

<details class="origin">
<summary>더 알아보기: 보관과 키별 정리는 어디서 출발했을까?</summary>
<p>2011년 LinkedIn의 제이 크렙스(Jay Kreps), 네하 나크헤데(Neha Narkhede), 준 라오(Jun Rao)가 발표한 Kafka 논문에는 이미 읽은 메시지도 일정 기간 보관하고 지난 세그먼트를 지우는 설계가 나와요. 여러 서비스가 각자의 속도로 꺼내 읽고 다시 읽으면서도 저장 공간을 회수하려는 방법이었어요.</p>
<p>Kafka의 로그 컴팩션은 같은 회사의 데이터 변경 기록 전달 시스템인 <b>Databus</b>에서 영감을 받았어요. 서비스가 다시 켜질 때 현재 상태를 복구하려면 최근에 바뀌지 않은 항목도 필요해서 기간으로만 자르면 부족했어요.</p>
<p><b>retention</b>은 보관을 뜻하고 <b>compaction</b>은 불필요한 옛 기록을 덜어 더 작게 만든다는 뜻이에요.</p>
<p>참고: <a href="https://www.microsoft.com/en-us/research/wp-content/uploads/2017/09/Kafka.pdf">2011년 Kafka 논문: 3.1절의 보관 설계</a> · <a href="https://kafka.apache.org/41/design/design/#log-compaction">Apache Kafka 4.1 설계: 복구 문제와 Databus의 영향</a></p>
</details></div>

<div class="slide-group">
<h2 class="slide-group-title">보관 한도: 오래된 묶음을 통째로 치워요</h2>

<section class="slide">
<h3>기간이 지난 단은 아직 못 읽었어도 버려요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="0번부터 2번 택배가 든 오래된 단 전체가 폐기 대상이고 다음 단과 쌓는 중인 단은 보관하는 그림">
<rect class="bad" x="12" y="20" width="116" height="128" rx="12"/><text class="label center" x="70" y="42">폐기할 단</text><circle class="new" cx="34" cy="82" r="18"/><use class="ic" href="#i-package" x="21" y="69" width="26" height="26"/><text class="chip" x="34" y="117">0</text><circle class="new" cx="70" cy="82" r="18"/><use class="ic" href="#i-package" x="57" y="69" width="26" height="26"/><text class="chip" x="70" y="117">1</text><circle class="new" cx="106" cy="82" r="18"/><use class="ic" href="#i-package" x="93" y="69" width="26" height="26"/><text class="chip" x="106" y="117">2</text><rect class="line" x="142" y="20" width="116" height="128" rx="12"/><text class="label center" x="200" y="42">보관할 단</text><circle class="new" cx="164" cy="82" r="18"/><use class="ic" href="#i-package" x="151" y="69" width="26" height="26"/><text class="chip" x="164" y="117">3</text><circle class="new" cx="200" cy="82" r="18"/><use class="ic" href="#i-package" x="187" y="69" width="26" height="26"/><text class="chip" x="200" y="117">4</text><circle class="new" cx="236" cy="82" r="18"/><use class="ic" href="#i-package" x="223" y="69" width="26" height="26"/><text class="chip" x="236" y="117">5</text><rect class="line" x="272" y="20" width="116" height="128" rx="12"/><text class="label center" x="330" y="42">쌓는 중</text><circle class="new" cx="294" cy="82" r="18"/><use class="ic" href="#i-package" x="281" y="69" width="26" height="26"/><text class="chip" x="294" y="117">6</text><circle class="new" cx="330" cy="82" r="18"/><use class="ic" href="#i-package" x="317" y="69" width="26" height="26"/><text class="chip" x="330" y="117">7</text><text class="small" x="200" y="180">오래된 단 전체가 폐기 대상이에요</text>
</svg>
<p class="point">기간으로 치울 때는 택배 하나씩이 아니라 오래된 단을 통째로 버려요.</p>
<p class="explain">센터는 택배가 들어온 순서대로 단을 채워요. 담당자가 오래 자리를 비워도 센터는 정해 둔 보관 한도에 따라 자리를 비워요. 그래서 담당자가 돌아올 때까지 모든 소식이 남는다고 생각하면 안 돼요.</p>
</section>

<section class="slide">
<h3>실제로는: 브로커가 세그먼트 단위로 지워요</h3>
<table>
<thead><tr><th>로그의 부분</th><th>브로커가 하는 일</th></tr></thead>
<tbody>
<tr><td>활성 세그먼트</td><td>새 메시지를 적는 파일이며 크기나 시간 기준으로 새 파일을 열어요</td></tr>
<tr><td>오래된 세그먼트</td><td>delete 정책에서 기간 또는 파티션별 용량 한도를 넘으면 묶음째 지워요</td></tr>
</tbody>
</table>
<p class="point">보관 한도는 개별 메시지의 정확한 삭제 시각을 약속하지 않아요.</p>
<p class="explain">선반 한 단처럼 파티션 로그를 나눈 파일 묶음이 <b>세그먼트</b>예요. 브로커가 시간·용량에 따라 보관하는 기준을 <b>보관 정책(retention)</b>이라고 하며 용량 한도는 토픽 전체가 아닌 파티션마다 적용돼요. 별도로 바꾸지 않은 Kafka 4.1의 토픽 정책은 <code>delete</code>이고 보관 기간은 7일이며 용량 한도는 없어요. 실제 삭제는 세그먼트 단위의 주기적 작업이어서 각 메시지가 한도에 닿는 순간 없어지는 것은 아니에요.</p>
</section>

<section class="slide" data-retention-playground="retention" hidden>
<h3>직접 해 보기: 보관 기간을 바꾸면 몇 단이 남을까요?</h3>
<div class="rc-controls"><label for="rc-retention-choice">보관 기간</label><select id="rc-retention-choice"><option value="6">짧게 보관</option><option value="12">길게 보관</option></select></div>
<div class="pp-body"></div>
<p class="point">한 단에 세 건씩 담고 시간을 줄인 설명용 예시이며 실제 Kafka도 오래된 세그먼트를 묶음째 지워요.</p>
<p class="explain">소식은 누르지 않아도 계속 도착해요. 조건을 바꾸면 이미 남아 있는 기록에 다음 정리부터 새 기준이 적용돼요. 단계 문장으로 도착과 정리를 함께 확인해요.</p>
</section>

<p>참고: <a href="https://kafka.apache.org/41/implementation/log/">Apache Kafka 4.1: 로그 파일과 정리</a> · <a href="https://kafka.apache.org/41/configuration/topic-configs/#retention.ms">시간·용량 보관 한도와 기본값</a></p></div>

<div class="slide-group">
<h2 class="slide-group-title">키별 최신 상태: 바뀐 결과를 복구할 만큼 남겨요</h2>

<section class="slide">
<h3>같은 동네의 새 소식이 있으면 옛것을 덜어내요</h3>
<svg class="dg" viewBox="0 0 400 235" role="img" aria-label="정리 전 용산 0 강남 1 용산 2 강남 3이 있고 정리 뒤에는 용산 2와 강남 3이 원래 순서와 번호로 남은 그림">
<text class="label center" x="200" y="20">같은 선반 칸의 택배</text><circle class="bad" cx="56" cy="63" r="18"/><use class="ic" href="#i-package" x="43" y="50" width="26" height="26"/><text class="chip" x="56" y="98">0 · 용산</text><circle class="bad" cx="152" cy="63" r="18"/><use class="ic" href="#i-package" x="139" y="50" width="26" height="26"/><text class="chip" x="152" y="98">1 · 강남</text><circle class="new" cx="248" cy="63" r="18"/><use class="ic" href="#i-package" x="235" y="50" width="26" height="26"/><text class="chip" x="248" y="98">2 · 용산</text><circle class="new" cx="344" cy="63" r="18"/><use class="ic" href="#i-package" x="331" y="50" width="26" height="26"/><text class="chip" x="344" y="98">3 · 강남</text>
<text class="label center" x="200" y="130">옛 소식을 덜어 낸 뒤</text><circle class="new" cx="248" cy="173" r="18"/><use class="ic" href="#i-package" x="235" y="160" width="26" height="26"/><text class="chip" x="248" y="208">2 · 용산</text><circle class="new" cx="344" cy="173" r="18"/><use class="ic" href="#i-package" x="331" y="160" width="26" height="26"/><text class="chip" x="344" y="208">3 · 강남</text>
</svg>
<p class="point">현재 상태가 목적이면 동네마다 마지막으로 온 택배가 필요해요.</p>
<p class="explain">이 선반에는 동네별 배송 안내가 바뀔 때마다 새 소식을 맡긴다고 해 봐요. 담당자가 지금 안내를 복구하려면 전체 동네의 최신 소식이 필요해요. 전체 선반에서 맨 마지막 택배 하나만 읽으면 다른 동네의 안내를 알 수 없어요.</p>
</section>

<section class="slide">
<h3>실제로는: 컴팩션은 파티션 안에서 같은 키의 옛 값을 치워요</h3>
<svg class="dg" viewBox="0 0 400 165" role="img" aria-label="오프셋 0과 1의 옛 값은 사라지고 2번 용산 새 안내와 3번 강남 새 안내가 원래 번호로 남은 파티션">
<text class="label center" x="200" y="20">같은 파티션의 남은 메시지</text>
<circle class="line dash" cx="56" cy="65" r="18"/><text class="chip" x="56" y="108">0 · 빈 자리</text>
<circle class="line dash" cx="152" cy="65" r="18"/><text class="chip" x="152" y="108">1 · 빈 자리</text>
<circle class="new" cx="248" cy="65" r="18"/><use class="ic" href="#i-package" x="235" y="52" width="26" height="26"/><text class="chip" x="248" y="108">2 · 용산</text>
<circle class="new" cx="344" cy="65" r="18"/><use class="ic" href="#i-package" x="331" y="52" width="26" height="26"/><text class="chip" x="344" y="108">3 · 강남</text>
<text class="small" x="200" y="145">남은 순서와 번호는 바꾸지 않아요</text>
</svg>
<p class="point">로그 컴팩션은 키마다 최신 값을 남기며 남은 메시지의 순서와 오프셋은 바꾸지 않아요.</p>
<p class="explain"><b>로그 컴팩션(log compaction)</b>은 같은 키의 더 새 메시지가 있을 때 옛 메시지를 덜어내는 작업이에요. 브로커가 뒤에서 따로 진행하므로 같은 키의 옛 값도 한동안 남고 쓰는 중인 활성 세그먼트는 컴팩션하지 않아요. 동네 이름 같은 <b>키(key)</b>와 안내 내용인 <b>값(value)</b>을 보내며 같은 키는 같은 파티션에 모아야 해요. 컨슈머가 지워진 번호부터 꺼내 읽으면 그 뒤에 남아 있는 메시지부터 받아요.</p>
</section>

<section class="slide" data-retention-playground="compact" hidden>
<h3>직접 해 보기: 기간 기준과 키 기준을 바꿔 봐요</h3>
<div class="rc-controls"><label for="rc-compact-choice">정리 정책</label><select id="rc-compact-choice"><option value="compact">키별 최신 값</option><option value="delete">기간이 지난 단</option></select></div>
<div class="pp-body"></div>
<p class="point">간격과 단 크기는 설명용이며 실제 Kafka도 키별 최신 상태를 남기는 정책과 오래된 세그먼트를 버리는 정책을 구분해요.</p>
<p class="explain">소식은 누르지 않아도 계속 도착해요. 조건을 바꾸면 이미 남아 있는 기록에 다음 정리부터 새 기준이 적용돼요. 단계 문장으로 도착과 정리를 함께 확인해요.</p>
</section>

<section class="slide">
<h3>이럴 땐 조심해요: 모든 변경 이력이 필요한가요?</h3>
<table>
<thead><tr><th>다시 읽으려는 목적</th><th>맞는 정책과 남는 범위</th></tr></thead>
<tbody>
<tr><td>주문이 들어온 순서와 개별 내역</td><td><code>delete</code>: 보관 한도 안의 이력을 남겨요</td></tr>
<tr><td>대상별 현재 상태 복구</td><td><code>compact</code>: 삭제 표시가 없는 키의 최신 값을 남겨요</td></tr>
<tr><td>최근 범위의 상태만 필요</td><td><code>delete,compact</code>: 오래된 단을 버리고 남은 범위를 컴팩션해요</td></tr>
</tbody>
</table>
<p class="point">기간 삭제와 컴팩션을 함께 쓰면 키의 최신 값도 영원히 남지는 않아요.</p>
<p class="explain">주문 번호가 같은 변경 기록을 모두 추적해야 한다면 옛 값을 없애는 정책은 맞지 않아요. 반대로 컴팩션만 쓰더라도 서로 다른 키가 계속 늘면 남겨야 할 상태도 늘어요. 먼저 필요한 이력의 범위를 정해야 보관량과 다시 읽을 수 있는 범위를 함께 판단할 수 있어요.</p>
</section>

<p>참고: <a href="https://kafka.apache.org/41/design/design/#log-compaction">Apache Kafka 4.1: 컴팩션과 오프셋 보장</a> · <a href="https://kafka.apache.org/41/configuration/topic-configs/#cleanup.policy">정리 정책의 조합</a></p></div>

<div class="slide-group">
<h2 class="slide-group-title">삭제 표시: 남겨 둔 상태도 없앨 수 있어야 해요</h2>

<section class="slide">
<h3>동네 안내를 없애려면 폐기 표지를 맡겨요</h3>
<svg class="dg" viewBox="0 0 400 340" role="img" aria-label="용산 택배 뒤에 용산 폐기 표지를 맡기고 컴팩션 뒤에는 강남과 폐기 표지가 남다가 나중에는 강남만 남는 그림">
<text class="label center" x="200" y="18">폐기 표지도 맨 끝에 맡겨요</text><circle class="new" cx="56" cy="61" r="18"/><use class="ic" href="#i-package" x="43" y="48" width="26" height="26"/><text class="chip" x="56" y="96">0 · 용산</text><circle class="new" cx="152" cy="61" r="18"/><use class="ic" href="#i-package" x="139" y="48" width="26" height="26"/><text class="chip" x="152" y="96">1 · 강남</text><circle class="new" cx="248" cy="61" r="18"/><use class="ic" href="#i-package" x="235" y="48" width="26" height="26"/><text class="chip" x="248" y="96">2 · 용산</text><circle class="bad" cx="344" cy="61" r="18"/><use class="ic" href="#i-package" x="331" y="48" width="26" height="26"/><text class="chip" x="344" y="96">3 · 용산 폐기</text>
<text class="label center" x="200" y="126">컴팩션 뒤에는 표지도 잠시 남아요</text><circle class="new" cx="152" cy="169" r="18"/><use class="ic" href="#i-package" x="139" y="156" width="26" height="26"/><text class="chip" x="152" y="204">1 · 강남</text><circle class="bad" cx="344" cy="169" r="18"/><use class="ic" href="#i-package" x="331" y="156" width="26" height="26"/><text class="chip" x="344" y="204">3 · 용산 폐기</text>
<text class="label center" x="200" y="234">나중에는 표지도 치워요</text><circle class="new" cx="152" cy="277" r="18"/><use class="ic" href="#i-package" x="139" y="264" width="26" height="26"/><text class="chip" x="152" y="312">1 · 강남</text>
</svg>
<p class="point">새 소식이 없는 동네를 지우려면 그 동네의 폐기 표지를 새로 보내요.</p>
<p class="explain">센터는 소식이 더 오지 않는다는 이유만으로 동네가 폐지됐는지 알 수 없어요. 가게가 폐기 표지를 보내야 담당자도 갖고 있던 안내를 지울 수 있어요. 센터는 담당자가 표지를 읽을 여유를 둔 뒤 표지 자체도 치워요.</p>
</section>

<section class="slide">
<h3>실제로는: 키가 있고 값이 null인 메시지가 톰스톤이에요</h3>
<table>
<thead><tr><th>보내는 값</th><th>컴팩션 토픽에서의 의미</th></tr></thead>
<tbody>
<tr><td>키=용산, 값=<code>null</code></td><td>용산의 과거 값을 지우도록 표시해요</td></tr>
<tr><td>키=용산, 값=<code>"null"</code></td><td>글자 네 개가 든 값이므로 삭제 표시가 아니에요</td></tr>
</tbody>
</table>
<p class="point">프로듀서가 보낸 톰스톤을 브로커가 컴팩션하면서 과거 값과 함께 정리해요.</p>
<p class="explain">폐기 표지에 해당하는 메시지를 <b>톰스톤(tombstone)</b>이라고 해요. 프로듀서가 같은 키와 <code>null</code> 값을 보내면 브로커가 그 키의 과거 값을 제거하고 나중에는 톰스톤도 치워요. Kafka 4.1의 컴팩션 토픽에서 톰스톤 보관 기준인 <code>delete.retention.ms</code>의 기본값은 24시간이며 정확히 그 시각에 삭제된다는 뜻은 아니에요. 컨슈머 서비스는 톰스톤을 읽었을 때 자신이 보관하던 그 키의 상태도 지워야 해요.</p>
</section>

<section class="slide" data-retention-playground="tombstone" hidden>
<h3>직접 해 보기: 폐기 표지를 보내면 무엇이 사라질까요?</h3>
<div class="rc-controls"><label for="rc-tombstone-choice">용산 폐기 표지</label><select id="rc-tombstone-choice"><option value="off">보내지 않아요</option><option value="on">보내요</option></select></div>
<div class="pp-body"></div>
<p class="point">용산 갱신이 멈춘 뒤 강남 소식만 계속 오는 설명용 예시이며 실제 Kafka도 톰스톤을 영원히 보관하지 않아요.</p>
<p class="explain">처음에는 표지 없이 용산의 최신 안내를 남겨요. 표지를 보내도록 바꾸면 새 폐기 소식이 도착하고 다음 정리에서 옛 안내가 사라져요. 다시 보내지 않기로 바꿔도 이미 지워진 안내는 돌아오지 않아요.</p>
</section>

<section class="slide">
<h3>이럴 땐 조심해요: 오래 멈춘 서비스는 삭제 표시를 놓쳐요</h3>
<table>
<thead><tr><th>상황</th><th>남을 수 있는 문제</th></tr></thead>
<tbody>
<tr><td>서비스가 옛 용산 안내를 저장한 뒤 오래 멈춰요</td><td>복귀 전에 톰스톤까지 정리되면 삭제 사실을 못 읽어요</td></tr>
<tr><td>처음부터 상태를 복구해요</td><td>빈 상태에서 시작해 남은 키들의 최신 상태를 다시 모아야 해요</td></tr>
</tbody>
</table>
<p class="point">삭제 표시를 놓친 컨슈머의 낡은 상태를 Kafka가 저절로 지워 주지는 않아요.</p>
<p class="explain">컨슈머가 자기 저장소에 상태를 쌓아 두고 이어 읽기만 하면 없어진 키를 발견하지 못할 수 있어요. 복구할 때는 삭제 표시의 보관 범위 안에 읽기를 끝내거나 낡은 상태를 비우고 다시 만드는 방식을 마련해야 해요. 기간 삭제 역시 외부 저장소의 데이터를 대신 지우는 기능은 아니에요.</p>
</section>

<section class="slide">
<h3>한눈에 다시 보기</h3>
<svg class="dg" viewBox="0 0 400 205" role="img" aria-label="세그먼트 보관 한도 로그 컴팩션 톰스톤의 역할을 아이콘과 한 줄씩 보여 주는 네 줄 요약">
<circle class="box" cx="30" cy="28" r="18"/><use class="ic" href="#i-shelving-unit" x="17" y="15" width="26" height="26"/><text class="label" x="62" y="19">세그먼트</text><text class="small" x="62" y="38" style="text-anchor:start">파티션 로그를 나눠 보관하는 파일 묶음</text><circle class="bad" cx="30" cy="76" r="18"/><use class="ic" href="#i-shelving-unit" x="17" y="63" width="26" height="26"/><text class="label" x="62" y="67">보관 한도</text><text class="small" x="62" y="86" style="text-anchor:start">기간·파티션별 용량으로 오래된 묶음을 삭제</text><circle class="new" cx="30" cy="124" r="18"/><use class="ic" href="#i-package" x="17" y="111" width="26" height="26"/><text class="label" x="62" y="115">로그 컴팩션</text><text class="small" x="62" y="134" style="text-anchor:start">파티션 안에서 키마다 최신 상태를 보관</text><circle class="bad" cx="30" cy="172" r="18"/><use class="ic" href="#i-package" x="17" y="159" width="26" height="26"/><text class="label" x="62" y="163">톰스톤</text><text class="small" x="62" y="182" style="text-anchor:start">키와 null 값으로 삭제를 표시하는 메시지</text>
</svg>
<p class="point">무엇을 다시 읽어야 하는지에 맞춰 오래된 이력을 버리거나 키별 최신 상태를 남겨요.</p>
</section>

<p>참고: <a href="https://kafka.apache.org/41/design/design/#log-compaction-basics">Apache Kafka 4.1: 삭제 표시와 컴팩션</a> · <a href="https://kafka.apache.org/41/configuration/topic-configs/#delete.retention.ms">톰스톤 보관과 컨슈머의 복구 범위</a></p></div>

</div>
<link rel="stylesheet" href="{{ '/assets/css/retention-compaction-playground.css' | relative_url }}">
<script defer src="{{ '/assets/js/retention-compaction-playground.js' | relative_url }}"></script>
