---
layout: post
title: "선반이 꽉 차면 어떻게 할까? 택배 물류센터로 이해하는 Kafka 보관과 정리"
description: "카프카가 메시지를 읽어도 지우지 않는데 디스크는 어떻게 안 차는지, 보관 기간(retention)과 로그 컴팩션, 톰스톤을 물류센터 비유로 쉽게 설명하고, 개발자용으로 세그먼트 구조·기본값·cleanup.policy·티어드 스토리지까지 정리합니다."
date: 2026-11-15 15:00:00 +0900
series: kafka
episode: 6
summary: "카프카는 가져가도 택배를 안 버려요. 대신 오래된 선반 단을 통째로 폐기하거나, 동네별 최신 택배만 남겨서 선반이 꽉 차지 않게 해요."
---

<div class="lesson lesson-hierarchy">

<div class="intro">
<p class="q">가져가도 안 버리는 선반은 어떻게 꽉 차지 않을까요?</p>
<p>1편에서 카프카는 택배를 가져가도 없애지 않는다고 했어요. 그래서 다시 읽을 수도 있고, 여러 팀이 같은 택배를 각자 읽을 수도 있었죠. 그런데 쌓기만 하고 버리지 않으면 선반은 결국 꽉 차요.</p>
<p>이 글을 다 읽으면 <b>보관 기간(retention)</b>으로 오래된 단을 통째로 버리는 방법과, <b>로그 컴팩션</b>으로 동네별 최신 택배만 남기는 방법, 그리고 <b>톰스톤</b>으로 동네를 지우는 방법을 알 수 있어요.</p>
</div>

<div class="slide-group">
<h2 class="slide-group-title">기간으로 정리: 오래된 선반 단을 버려요</h2>

<section class="slide">
<h3>선반은 언젠가 꽉 차요</h3>
<svg class="dg" viewBox="0 0 400 110" role="img" aria-label="주문 선반에 택배 1번부터 7번까지 가득 쌓여 있고, 새로 온 택배는 놓을 자리가 없어서 깜빡이는 그림">
<text class="small" x="200" y="14">주문 선반</text>
<rect class="kafka" x="10" y="30" width="40" height="40" rx="5"/><text x="30" y="50">1</text>
<rect class="kafka" x="56" y="30" width="40" height="40" rx="5"/><text x="76" y="50">2</text>
<rect class="kafka" x="102" y="30" width="40" height="40" rx="5"/><text x="122" y="50">3</text>
<rect class="kafka" x="148" y="30" width="40" height="40" rx="5"/><text x="168" y="50">4</text>
<rect class="kafka" x="194" y="30" width="40" height="40" rx="5"/><text x="214" y="50">5</text>
<rect class="kafka" x="240" y="30" width="40" height="40" rx="5"/><text x="260" y="50">6</text>
<rect class="kafka" x="286" y="30" width="40" height="40" rx="5"/><text x="306" y="50">7</text>
<rect class="bad blink" x="336" y="30" width="54" height="40" rx="5"/><text class="chip" x="363" y="50">새 택배</text>
<text class="small" x="168" y="92">가져가도 그대로 쌓여요</text>
<text class="alert" x="363" y="92">자리 없음</text>
</svg>
<p class="point">1편에서 가져가도 안 없어진다고 했으니, 선반은 언젠가 꽉 차요.</p>
<p class="explain">주문 서비스가 택배를 하루 종일 맡기면 선반에는 새 택배가 계속 쌓여요. 알림 서비스가 이미 읽어 간 택배도 그대로 남아 있어서, 줄어드는 일이 없어요. 선반(디스크)은 크기가 정해져 있으니 어느 순간 새 택배를 놓을 자리가 없어져요. 그래서 "무엇을 언제 버릴지"를 미리 정해 둬야 해요.</p>
</section>

<details class="origin">
<summary>더 알아보기: 왜 이런 기능이 생겼을까?</summary>
<p>이유는 단순해요. <b>디스크는 무한하지 않은데, 카프카는 읽어도 지우지 않기 때문</b>이에요. 큐처럼 "읽으면 삭제"로 가면 편하지만, 그러면 1편에서 본 "다시 읽기"와 "여러 팀이 같은 택배를 각자 읽기"를 포기해야 해요.</p>
<p>그래서 카프카는 <b>"언제 버릴지"를 토픽마다 정하게</b> 했어요. 기본은 7일이고, 버리는 방식은 <code>cleanup.policy</code> 설정 하나로 골라요.</p>
<p>컴팩션은 카프카 자신도 써요. 4편에서 나온 팀 장부, 즉 오프셋 커밋을 저장하는 내부 토픽 <code>__consumer_offsets</code>이 컴팩션되는 토픽이에요. 장부는 "지금 어디까지 읽었나"만 있으면 되니까요.</p>
<p>선반이 너무 커져서 오래된 단까지 비싼 디스크에 두기 부담스러운 팀을 위한 기능도 생겼어요. 로컬 디스크와 원격 저장소를 함께 쓰는 <b>티어드 스토리지(KIP-405)</b>예요. Kafka 3.6에서 처음 들어왔고, 3.9부터 운영에 써도 되는 정식 기능(GA)이 됐어요.</p>
</details>

<section class="slide">
<h3>방법 ①: 오래된 단을 통째로 버려요</h3>
<svg class="dg" viewBox="0 0 400 215" role="img" aria-label="선반이 세 단으로 나뉘어 있고, 가장 오래된 첫째 단은 알림 서비스가 2번까지만 읽었어도 보관 기간이 지나면 통째로 폐기되는 그림">
<text class="small" x="70" y="16">오래된 단</text><text class="small" x="200" y="16">다음 단</text><text class="small" x="330" y="16">쌓는 중</text>
<rect class="bad" x="10" y="30" width="120" height="70" rx="8"/>
<rect class="kafka" x="16" y="47" width="32" height="36" rx="4"/><text x="32" y="65">1</text>
<rect class="kafka" x="54" y="47" width="32" height="36" rx="4"/><text x="70" y="65">2</text>
<rect class="kafka" x="92" y="47" width="32" height="36" rx="4"/><text x="108" y="65">3</text>
<rect class="box" x="140" y="30" width="120" height="70" rx="8"/>
<rect class="kafka" x="146" y="47" width="32" height="36" rx="4"/><text x="162" y="65">4</text>
<rect class="kafka" x="184" y="47" width="32" height="36" rx="4"/><text x="200" y="65">5</text>
<rect class="kafka" x="222" y="47" width="32" height="36" rx="4"/><text x="238" y="65">6</text>
<rect class="new" x="270" y="30" width="120" height="70" rx="8"/>
<rect class="kafka" x="276" y="47" width="32" height="36" rx="4"/><text x="292" y="65">7</text>
<rect class="kafka" x="314" y="47" width="32" height="36" rx="4"/><text x="330" y="65">8</text>
<rect class="kafka" x="352" y="47" width="32" height="36" rx="4"/><text x="368" y="65">9</text>
<polygon class="mark" points="70,108 62,120 78,120"/><text x="70" y="134">알림</text><text class="small" x="70" y="153">2번까지 읽음</text>
<text class="alert" x="70" y="182">기간이 지나면</text><text class="alert" x="70" y="200">통째로 폐기</text>
</svg>
<p class="point">읽었는지와 상관없이, 기간이 지난 단을 통째로 버려요.</p>
<p class="explain">그림에서 알림 서비스는 2번까지만 읽었지만, 첫째 단의 보관 기간이 지나면 3번 택배도 함께 사라져요. 물류센터는 누가 얼마나 읽었는지 보지 않고 단의 나이만 봐요. 그래서 알림 서비스가 오래 멈춰 있다가 돌아오면, 못 읽은 택배가 이미 없어졌을 수 있어요. 대신 택배를 하나씩 확인하지 않고 단째로 버리니까 정리가 아주 빨라요.</p>
</section>

<section class="slide">
<h3>실제로는: 브로커가 파티션 로그를 세그먼트로 나눠요</h3>
<svg class="dg" viewBox="0 0 400 190" role="img" aria-label="파티션 로그가 오프셋 0부터 99, 100부터 199인 닫힌 세그먼트 두 개와 오프셋 200부터 새 메시지가 쓰이는 활성 세그먼트로 나뉘어 있고, 삭제는 세그먼트 단위로 이루어지는 그림">
<defs><marker id="d1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="small" x="200" y="14">파티션 0의 로그 (예시)</text>
<rect class="box" x="10" y="30" width="110" height="60" rx="8"/><text class="chip" x="65" y="50">닫힌 세그먼트</text><text class="small" x="65" y="72">0~99</text>
<rect class="box" x="130" y="30" width="110" height="60" rx="8"/><text class="chip" x="185" y="50">닫힌 세그먼트</text><text class="small" x="185" y="72">100~199</text>
<rect class="kafka" x="250" y="30" width="140" height="60" rx="8"/><text class="chip" x="320" y="50">활성 세그먼트</text><text class="small" x="320" y="72">200~ 쓰는 중</text>
<path class="line dash" d="M10,100 L240,100"/>
<text class="small" x="125" y="118">retention은 세그먼트 단위로 삭제</text>
<path class="line" d="M320,138 L320,94" marker-end="url(#d1)"/>
<text class="chip" x="320" y="150">새 메시지</text>
<text class="small" x="130" y="150">크기(segment.bytes)나</text>
<text class="small" x="130" y="168">시간(segment.ms)이 차면 새 세그먼트</text>
</svg>
<p class="point">로그는 세그먼트 파일들의 묶음이고, 정리의 기본 단위도 세그먼트예요.</p>
<p class="explain">택배를 저장하는 서버인 브로커는 파티션의 기록을 여러 파일로 나눠 두어요. 이 파일 하나가 세그먼트이고, 비유의 선반 한 단에 해당해요. 브로커는 새 메시지를 활성 세그먼트에 적다가 크기나 시간 한도에 닿으면 새 세그먼트를 열어요. 보관 한도를 넘긴 기록은 세그먼트 단위로 지워서, 개별 택배마다 정확한 삭제 시각을 맞추지는 않아요.</p>
</section>

<section class="slide">
<h3>실제로는: 세그먼트와 보관 한도의 기본값을 확인해요 (Kafka 4.x)</h3>
<table>
<thead><tr><th>설정</th><th>기본값</th><th>의미</th></tr></thead>
<tbody>
<tr><td><code>segment.bytes</code></td><td>1 GiB</td><td>세그먼트 크기 한도 (브로커 설정명 <code>log.segment.bytes</code>)</td></tr>
<tr><td><code>segment.ms</code></td><td>7일</td><td>세그먼트를 새로 여는 시간 한도 (브로커 설정명 <code>log.roll.ms</code>)</td></tr>
<tr><td><code>retention.ms</code></td><td>7일</td><td><code>delete</code> 정책의 시간 보관 한도</td></tr>
<tr><td><code>retention.bytes</code></td><td>-1</td><td>크기 제한 없음. 설정하면 <b>파티션별</b> 한도</td></tr>
<tr><td><code>cleanup.policy</code></td><td><code>delete</code></td><td><code>compact</code>, <code>delete,compact</code>도 가능</td></tr>
<tr><td><code>delete.retention.ms</code></td><td>24시간</td><td>컴팩션 토픽에서 톰스톤을 보관하는 시간</td></tr>
</tbody>
</table>
<p class="point">용량 한도는 토픽 전체가 아니라 파티션마다 적용돼요.</p>
<p class="explain"><code>segment.bytes</code>와 <code>segment.ms</code>는 새 선반 단을 여는 기준이에요. <code>retention.ms</code>와 <code>retention.bytes</code>는 오래된 기록을 버리는 보관 한도예요. 브로커는 컨슈머가 어디까지 읽었는지와 관계없이 이 정책으로 정리하므로, 컨슈머가 오래 멈출 수 있다면 보관 기간도 함께 봐야 해요.</p>
</section>

</div>

<div class="slide-group">
<h2 class="slide-group-title">키로 정리: 같은 동네의 최신 택배를 남겨요</h2>

<section class="slide">
<h3>방법 ②: 동네별 최신 택배만 남겨요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="정리 전에는 A동, B동, A동, C동, B동, A동 택배가 0번부터 5번까지 있고, 정리 후에는 같은 동네의 오래된 택배가 사라져 C동 3번, B동 4번, A동 5번만 번호 그대로 남는 그림">
<defs><marker id="a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="label" x="10" y="14">정리 전</text>
<rect class="bad" x="12" y="26" width="56" height="44" rx="6"/><text class="small" x="40" y="39">0</text><text class="chip" x="40" y="58">A동</text>
<rect class="bad" x="76" y="26" width="56" height="44" rx="6"/><text class="small" x="104" y="39">1</text><text class="chip" x="104" y="58">B동</text>
<rect class="bad" x="140" y="26" width="56" height="44" rx="6"/><text class="small" x="168" y="39">2</text><text class="chip" x="168" y="58">A동</text>
<rect class="kafka" x="204" y="26" width="56" height="44" rx="6"/><text class="small" x="232" y="39">3</text><text class="chip" x="232" y="58">C동</text>
<rect class="kafka" x="268" y="26" width="56" height="44" rx="6"/><text class="small" x="296" y="39">4</text><text class="chip" x="296" y="58">B동</text>
<rect class="kafka" x="332" y="26" width="56" height="44" rx="6"/><text class="small" x="360" y="39">5</text><text class="chip" x="360" y="58">A동</text>
<path class="line" d="M200,76 L200,110" marker-end="url(#a1)"/>
<text class="label" x="212" y="94">동네별 최신만 남겨요</text>
<text class="label" x="10" y="126">정리 후</text>
<rect class="box dash" x="12" y="138" width="56" height="44" rx="6"/><text class="small" x="40" y="160">0</text>
<rect class="box dash" x="76" y="138" width="56" height="44" rx="6"/><text class="small" x="104" y="160">1</text>
<rect class="box dash" x="140" y="138" width="56" height="44" rx="6"/><text class="small" x="168" y="160">2</text>
<rect class="kafka" x="204" y="138" width="56" height="44" rx="6"/><text class="small" x="232" y="151">3</text><text class="chip" x="232" y="170">C동</text>
<rect class="kafka" x="268" y="138" width="56" height="44" rx="6"/><text class="small" x="296" y="151">4</text><text class="chip" x="296" y="170">B동</text>
<rect class="kafka" x="332" y="138" width="56" height="44" rx="6"/><text class="small" x="360" y="151">5</text><text class="chip" x="360" y="170">A동</text>
</svg>
<p class="point">같은 동네 택배는 가장 새것만 남고, 번호는 그대로예요.</p>
<p class="explain">회원 주소가 바뀔 때마다 새 택배가 쌓인다고 생각해 봐요. 지금 주소를 알고 싶을 뿐이라면, 같은 회원의 옛 주소 택배는 더 필요 없어요. 그래서 송장에 적힌 동네(키)별로 가장 새 택배만 남기고 나머지를 치워요. 남은 택배의 번호는 바뀌지 않아서, 어디까지 읽었는지 적어 둔 기록이 그대로 맞아요.</p>
</section>

<section class="slide">
<h3>실제로는: 브로커가 옛 레코드를 지워도 오프셋은 유지해요</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="컴팩션 전에는 오프셋 0부터 5까지 A=1, B=1, A=2, B=2, C=1, A=3이 있고, 컴팩션 후에는 오프셋 3의 B=2, 4의 C=1, 5의 A=3만 남으며 0부터 2번은 비어 있지만 남은 레코드의 번호는 바뀌지 않는 그림">
<defs><marker id="d2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="label" x="10" y="14">컴팩션 전</text>
<rect class="bad" x="12" y="24" width="56" height="52" rx="6"/><text class="small" x="40" y="37">0</text><text class="chip" x="40" y="60">A=1</text>
<rect class="bad" x="76" y="24" width="56" height="52" rx="6"/><text class="small" x="104" y="37">1</text><text class="chip" x="104" y="60">B=1</text>
<rect class="bad" x="140" y="24" width="56" height="52" rx="6"/><text class="small" x="168" y="37">2</text><text class="chip" x="168" y="60">A=2</text>
<rect class="kafka" x="204" y="24" width="56" height="52" rx="6"/><text class="small" x="232" y="37">3</text><text class="chip" x="232" y="60">B=2</text>
<rect class="kafka" x="268" y="24" width="56" height="52" rx="6"/><text class="small" x="296" y="37">4</text><text class="chip" x="296" y="60">C=1</text>
<rect class="kafka" x="332" y="24" width="56" height="52" rx="6"/><text class="small" x="360" y="37">5</text><text class="chip" x="360" y="60">A=3</text>
<path class="line" d="M340,82 L340,106" marker-end="url(#d2)"/>
<text class="label" x="10" y="108">컴팩션 후</text>
<rect class="box dash" x="12" y="120" width="56" height="52" rx="6"/><text class="small" x="40" y="146">0</text>
<rect class="box dash" x="76" y="120" width="56" height="52" rx="6"/><text class="small" x="104" y="146">1</text>
<rect class="box dash" x="140" y="120" width="56" height="52" rx="6"/><text class="small" x="168" y="146">2</text>
<rect class="kafka" x="204" y="120" width="56" height="52" rx="6"/><text class="small" x="232" y="133">3</text><text class="chip" x="232" y="156">B=2</text>
<rect class="kafka" x="268" y="120" width="56" height="52" rx="6"/><text class="small" x="296" y="133">4</text><text class="chip" x="296" y="156">C=1</text>
<rect class="kafka" x="332" y="120" width="56" height="52" rx="6"/><text class="small" x="360" y="133">5</text><text class="chip" x="360" y="156">A=3</text>
<text class="small" x="200" y="195">남은 레코드의 순서와 오프셋은 유지돼요</text>
</svg>
<p class="point">컴팩션은 레코드를 지울 뿐, 번호를 다시 매기지 않아요.</p>
<p class="explain">키는 같은 동네처럼 관련된 메시지를 묶는 이름이고, 레코드는 저장된 메시지 한 건이에요. 브로커가 컴팩션으로 같은 키의 옛 레코드를 지우면 번호가 비는 자리가 생겨요. 이 번호인 오프셋은 남은 레코드에서 바뀌지 않아서, 컨슈머가 기록해 둔 읽기 위치도 같은 기준을 유지해요.</p>
</section>

<section class="slide">
<h3>어떤 선반에 어떤 방법을 쓸까요?</h3>
<table>
<thead><tr><th>선반에 쌓이는 것</th><th>정리 방법</th><th>예</th></tr></thead>
<tbody>
<tr><td>지나간 일의 기록</td><td>기간이 지난 단 폐기</td><td>주문 이력, 클릭 기록</td></tr>
<tr><td>동네별 지금 상태</td><td>동네별 최신만 남기기</td><td>회원별 주소, 팀 장부</td></tr>
</tbody>
</table>
<p class="point">기록이면 기간으로, 상태면 최신만 남겨요.</p>
<p class="explain">주문 이력은 하나하나가 "그때 있었던 일"이라서, 오래되면 버려도 되지만 중간을 골라 지우면 안 돼요. 회원 주소는 지금 값만 중요해서, 옛 값을 지워도 아쉬울 게 없어요. 선반에 무엇이 쌓이는지부터 보면 어떤 방법을 쓸지 정할 수 있어요.</p>
</section>

<section class="slide">
<h3>실제로는: cleanup.policy로 세 가지 정리 방법을 골라요</h3>
<table>
<thead><tr><th></th><th><code>delete</code></th><th><code>compact</code></th><th><code>delete,compact</code></th></tr></thead>
<tbody>
<tr><td>정리 방식</td><td>한도를 넘긴 오래된 세그먼트 삭제</td><td>같은 키의 더 최신 레코드가 있으면 오래된 레코드를 백그라운드로 정리</td><td>오래된 세그먼트를 삭제하고, 남은 범위를 컴팩션</td></tr>
<tr><td>정리 기준</td><td><code>retention.ms</code>, <code>retention.bytes</code></td><td>키</td><td>보관 한도와 키</td></tr>
<tr><td>남는 것</td><td>한도 안의 모든 레코드</td><td>키마다 최신 값 (정리 전에는 옛 값도 남아 있음)</td><td>한도 안에서 키마다 최신 값</td></tr>
<tr><td>잘 맞는 데이터</td><td>이벤트 기록</td><td>키별 현재 상태 (예: <code>__consumer_offsets</code>)</td><td>최근 것만 의미 있는 키별 상태</td></tr>
</tbody>
</table>
<p class="point">기록은 <code>delete</code>, 상태는 <code>compact</code>, 둘 다 필요하면 합쳐요.</p>
<p class="explain"><code>cleanup.policy</code>는 브로커가 토픽의 기록을 어떤 기준으로 치울지 정하는 설정이에요. <code>delete</code>는 오래된 단을 버리고, <code>compact</code>는 동네별 최신 택배를 남기는 방식이에요. 컴팩션은 뒤에서 따로 진행하는 백그라운드 작업이라, 같은 키의 옛 값이 한동안 함께 남을 수 있어요.</p>
</section>

</div>

<div class="slide-group">
<h2 class="slide-group-title">삭제 표시: 폐기 표지도 새 택배로 보내요</h2>

<section class="slide">
<h3>동네를 지우려면 폐기 표지를 붙여요</h3>
<svg class="dg" viewBox="0 0 400 245" role="img" aria-label="A동 택배를 지우려고 마지막에 A동 폐기 표지를 붙이면, 정리 후 A동 택배가 사라지고 폐기 표지만 남았다가, 한참 뒤에는 표지도 치워지고 B동 택배만 남는 그림">
<text class="label" x="10" y="14">① 정리 전: 마지막에 폐기 표지</text>
<rect class="kafka" x="20" y="26" width="80" height="44" rx="6"/><text class="small" x="60" y="39">0</text><text class="chip" x="60" y="58">A동</text>
<rect class="kafka" x="110" y="26" width="80" height="44" rx="6"/><text class="small" x="150" y="39">1</text><text class="chip" x="150" y="58">B동</text>
<rect class="kafka" x="200" y="26" width="80" height="44" rx="6"/><text class="small" x="240" y="39">2</text><text class="chip" x="240" y="58">A동</text>
<rect class="bad" x="290" y="26" width="80" height="44" rx="6"/><text class="small" x="330" y="39">3</text><text class="chip" x="330" y="58">A동 폐기</text>
<text class="label" x="10" y="94">② 컴팩션 후: A동 택배가 사라져요</text>
<rect class="box dash" x="20" y="106" width="80" height="44" rx="6"/><text class="small" x="60" y="128">0</text>
<rect class="kafka" x="110" y="106" width="80" height="44" rx="6"/><text class="small" x="150" y="119">1</text><text class="chip" x="150" y="138">B동</text>
<rect class="box dash" x="200" y="106" width="80" height="44" rx="6"/><text class="small" x="240" y="128">2</text>
<rect class="bad" x="290" y="106" width="80" height="44" rx="6"/><text class="small" x="330" y="119">3</text><text class="chip" x="330" y="138">A동 폐기</text>
<text class="label" x="10" y="174">③ 한참 뒤: 표지도 치워져요</text>
<rect class="box dash" x="20" y="186" width="80" height="44" rx="6"/><text class="small" x="60" y="208">0</text>
<rect class="kafka" x="110" y="186" width="80" height="44" rx="6"/><text class="small" x="150" y="199">1</text><text class="chip" x="150" y="218">B동</text>
<rect class="box dash" x="200" y="186" width="80" height="44" rx="6"/><text class="small" x="240" y="208">2</text>
<rect class="box dash" x="290" y="186" width="80" height="44" rx="6"/><text class="small" x="330" y="208">3</text>
</svg>
<p class="point">동네 하나를 지우는 일도 "폐기 표지"라는 택배를 새로 맡기는 거예요.</p>
<p class="explain">회원이 탈퇴해서 그 동네 택배를 모두 없애고 싶다고 해 봐요. 선반에서 택배를 직접 빼낼 수는 없어요. 대신 "A동 폐기"라고 적힌 택배를 맨 끝에 새로 맡기면, 다음 정리 때 A동의 옛 택배가 사라져요. 폐기 표지도 택배라서 처음엔 남아 있다가, 한참 뒤 정리 때 함께 치워져요.</p>
</section>

<section class="slide">
<h3>실제로는: 프로듀서가 null 값을 보내 삭제를 표시해요</h3>
<table>
<thead><tr><th>항목</th><th>동작</th></tr></thead>
<tbody>
<tr><td>정의</td><td>키가 있고 value가 <code>null</code>인 레코드</td></tr>
<tr><td>역할</td><td>그 키의 과거 값을 컴팩션 때 제거하도록 표시</td></tr>
<tr><td>톰스톤 자신</td><td>나중에 컴팩션이 제거 (보관 시간은 <code>delete.retention.ms</code>, 기본 24시간)</td></tr>
<tr><td>흔한 실수</td><td>value가 문자열 <code>"null"</code>인 레코드는 톰스톤이 아님</td></tr>
</tbody>
</table>
<p class="point">키를 지우는 건 "삭제 명령"이 아니라 "value가 null인 레코드"를 쓰는 일이에요.</p>
<p class="explain">택배를 맡기는 앱인 프로듀서가 키를 쓰고 값을 <code>null</code>로 비운 레코드를 보내면, 이것이 톰스톤이라는 폐기 표지가 돼요. 브로커는 컴팩션 때 그 키의 과거 값을 지우고, 톰스톤도 보관 시간이 지난 뒤 정리해요. 글자로 쓴 <code>"null"</code>은 값이 있는 문자열이므로 폐기 표지가 아니에요.</p>
</section>

</div>

<div class="slide-group">
<h2 class="slide-group-title">정리: 보관의 한계와 원격 저장을 알아봐요</h2>

<section class="slide">
<h3>보관과 정리의 진짜 이름: 세그먼트·컴팩션·톰스톤</h3>
<table>
<thead><tr><th>물류센터 이야기</th><th>카프카 용어</th></tr></thead>
<tbody>
<tr><td>선반의 한 단</td><td>세그먼트 (Segment)</td></tr>
<tr><td>보관 기간이 지나면 오래된 단 폐기</td><td>보관 정책 (Retention)</td></tr>
<tr><td>동네별 최신 택배만 남기기</td><td>로그 컴팩션 (Log Compaction)</td></tr>
<tr><td>"이 동네 택배 폐기" 표지</td><td>톰스톤 (Tombstone)</td></tr>
<tr><td>송장에 적힌 받는 동네</td><td>키 (Key)</td></tr>
</tbody>
</table>
<p class="point">선반 단은 세그먼트, 동네별 최신만 남기는 정리는 컴팩션, 폐기 표지는 톰스톤이에요.</p>
</section>

<section class="slide">
<h3>보관의 확장: 티어드 스토리지의 버전별 변화</h3>
<table>
<thead><tr><th>시점</th><th>달라진 점</th></tr></thead>
<tbody>
<tr><td>Kafka 3.6</td><td>티어드 스토리지(KIP-405) 도입. 로컬과 원격 저장 계층을 함께 사용</td></tr>
<tr><td>Kafka 3.9 이후</td><td>티어드 스토리지가 운영 사용 가능한 정식 기능(GA)</td></tr>
<tr><td>예전 글의 설명</td><td>"보관 기간을 늘리려면 로컬 디스크를 계속 늘려야 한다"는 3.9 이후에는 원격 계층이라는 선택지가 있어서 그대로 맞지 않음</td></tr>
</tbody>
</table>
<p class="point">티어드 스토리지는 오래된 데이터를 원격 계층에 두는 선택지이고, 세부 동작은 이 글에서 다루지 않아요.</p>
<p class="explain">티어드 스토리지는 가까운 로컬 디스크와 원격 저장소를 함께 쓰는 방식이에요. 물류센터에서 오래된 선반 단을 두는 곳을 늘리는 선택지라고 생각하면 돼요. 그래서 보관 기간을 늘릴 때 로컬 디스크만 늘려야 한다는 옛 설명은 표의 버전 이후에는 그대로 맞지 않아요.</p>
</section>

<section class="slide">
<h3>보관과 정리에서 조심할 점: 삭제 시각과 전체 이력</h3>
<table>
<thead><tr><th>오해</th><th>실제</th></tr></thead>
<tbody>
<tr><td>컨슈머가 다 읽어야 지워진다</td><td>보관은 소비 완료 여부와 무관해요</td></tr>
<tr><td><code>retention.ms</code>가 지나면 그 시각에 지워진다</td><td>세그먼트 단위 삭제라서 개별 레코드의 정확한 삭제 시각은 아니에요</td></tr>
<tr><td>컴팩션하면 키마다 바로 하나만 남는다</td><td>백그라운드 작업이라 같은 키의 여러 레코드가 한동안 남아 있어요</td></tr>
<tr><td>컴팩션하면 오프셋이 다시 매겨진다</td><td>남은 레코드의 오프셋은 그대로예요</td></tr>
<tr><td>값이 <code>"null"</code>이면 삭제된다</td><td>null 값과 문자열 <code>"null"</code>은 달라요</td></tr>
</tbody>
</table>
<p class="point">보관 기간은 "이 시간 뒤에 지워도 된다"는 한도이지, 지우는 시각이 아니에요.</p>
<p class="explain">컨슈머가 아직 읽지 못한 택배도 보관 기간이 지나면 없어질 수 있으므로, 멈춰 있을 시간을 고려해 기간을 정해요. 브로커는 단위별로 정리해서 정확한 시각의 삭제를 보장하지 않아요. 동네별 전체 이력이 필요하면 옛 값을 지우는 컴팩션 대신 기간 폐기 방식을 써요.</p>
</section>

<section class="slide end">
<h3>보관과 정리 한 줄 정리</h3>
<p class="point">브로커가 오래된 세그먼트를 통째로 지우거나,<br>키마다 최신 값만 남기는 백그라운드 정리로 선반을 비워요.</p>
</section>

</div>

</div>
