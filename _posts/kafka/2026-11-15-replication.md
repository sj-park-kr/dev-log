---
layout: post
title: "물류센터 건물 하나가 불타면? 택배 물류센터로 이해하는 Kafka 복제"
description: "카프카 복제(Replication)를 물류센터 비유로 쉽게 설명하고, 개발자용으로 리더·팔로워·ISR, high watermark, acks=all과 min.insync.replicas 조합, unclean 리더 선출, ELR까지 정리합니다."
date: 2026-11-15 14:30:00 +0900
series: kafka
episode: 5
summary: "카프카는 택배를 여러 건물에 사본으로 나눠 적어 둬요. 원본 건물이 불타도 최신으로 맞춘 건물이 새 원본이 돼요."
---

<div class="lesson lesson-hierarchy">

<div class="intro">
<p class="q">물류센터 건물이 불타도 택배를 지킬 수 있을까요?</p>
<p>4편까지는 택배가 한 건물 안의 선반에 쌓인다고 생각했어요. 그런데 건물이 하나뿐이면, 그 건물이 멈추는 순간 주문 서비스가 맡긴 택배도, 알림 문자 서비스가 가져갈 택배도 함께 사라져요.</p>
<p>이 글을 다 읽으면 카프카가 택배를 <b>여러 건물에 사본으로 나눠 두는 방법(복제)</b>, 그리고 원본이 불탔을 때 <b>누가 새 원본이 되는지(ISR 명단)</b>를 알 수 있어요.</p>
</div>

<div class="slide-group">
<h2 class="slide-group-title">사본이 필요한 이유: 한 건물의 고장에 대비해요</h2>

<section class="slide">
<h3>건물 하나에만 택배를 두면 모두 잃을 수 있어요</h3>
<svg class="dg" viewBox="0 0 400 170" role="img" aria-label="주문 서비스가 건물 하나뿐인 물류센터에 택배 1번부터 6번을 맡겼는데, 그 건물에 불이 나면 택배가 전부 사라지는 그림">
<defs><marker id="a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="box" x="10" y="60" width="80" height="44" rx="8"/><text x="50" y="82">주문</text>
<path class="line" d="M90,82 L118,82" marker-end="url(#a1)"/>
<rect class="bad blink" x="122" y="14" width="268" height="140" rx="10"/><text x="256" y="36">물류센터 건물 1개</text>
<rect class="kafka" x="134" y="56" width="36" height="36" rx="5"/><text x="152" y="74">1</text>
<rect class="kafka" x="176" y="56" width="36" height="36" rx="5"/><text x="194" y="74">2</text>
<rect class="kafka" x="218" y="56" width="36" height="36" rx="5"/><text x="236" y="74">3</text>
<rect class="kafka" x="260" y="56" width="36" height="36" rx="5"/><text x="278" y="74">4</text>
<rect class="kafka" x="302" y="56" width="36" height="36" rx="5"/><text x="320" y="74">5</text>
<rect class="kafka" x="344" y="56" width="36" height="36" rx="5"/><text x="362" y="74">6</text>
<text class="alert" x="256" y="124">불이 나면 택배가 전부 사라져요</text>
</svg>
<p class="point">건물 하나가 멈추면 택배를 전부 잃어요.</p>
<p class="explain">주문 서비스가 맡긴 택배가 건물 하나에만 있다고 생각해 봐요. 정전이나 고장으로 그 건물이 멈추면, 아직 배달되지 않은 결제 완료 소식이 모두 사라져요. 한 번 사라진 택배는 다시 만들 수 없어요. 그래서 건물 하나에만 기대면 안 돼요.</p>
</section>

<details class="origin">
<summary>더 알아보기: 복제는 언제, 왜 생겼을까?</summary>
<p><b>복제는 카프카의 기본 구조예요.</b> 카프카 설계 문서는 파티션마다 쓰기를 맡는 리더 하나와, 그 로그를 따라 복제하는 팔로워들이 있다고 설명해요.</p>
<p>접수 영수증(acks)의 기본값은 3.0 전까지 "원본에만 적으면 끝"인 <b>acks=1</b>이었어요. <b>Kafka 3.0(KIP-679)</b>에서 "명단 건물이 모두 적어야 끝"인 <b>acks=all</b>로 바뀌었어요.</p>
<p>명단에 아무도 안 남았을 때의 빈틈은 <b>KIP-966(ELR)</b>이 메웠어요. 4.0에서 도입됐고(기본 꺼짐), 4.1부터 새로 만드는 클러스터에서는 기본으로 켜져요.</p>
<p>명단의 이름 <b>ISR</b>은 In-Sync Replicas, 곧 "동기화된 복제본들"이라는 뜻이에요.</p>
</details>

<section class="slide">
<h3>다른 건물에 사본 선반을 둬요</h3>
<svg class="dg" viewBox="0 0 400 270" role="img" aria-label="주문 서비스가 원본 건물 1에 택배를 맡기면, 사본 건물 2와 건물 3이 원본을 보고 같은 택배 1번부터 3번을 따라 적는 그림">
<defs><marker id="a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="box" x="30" y="10" width="90" height="36" rx="8"/><text x="75" y="28">주문</text>
<path class="line" d="M75,46 L75,76" marker-end="url(#a2)"/>
<rect class="kafka" x="10" y="80" width="130" height="110" rx="10"/><text x="75" y="100">건물 1</text><text class="small" x="75" y="120">원본 (리더)</text>
<rect class="box" x="21" y="140" width="32" height="36" rx="5"/><text x="37" y="158">1</text>
<rect class="box" x="59" y="140" width="32" height="36" rx="5"/><text x="75" y="158">2</text>
<rect class="box" x="97" y="140" width="32" height="36" rx="5"/><text x="113" y="158">3</text>
<path class="line" d="M140,120 L248,82" marker-end="url(#a2)"/>
<path class="line" d="M140,150 L248,198" marker-end="url(#a2)"/>
<text class="small" x="195" y="137">따라 적기</text>
<rect class="new" x="250" y="30" width="140" height="100" rx="10"/><text x="320" y="50">건물 2</text><text class="small" x="320" y="70">사본 (팔로워)</text>
<rect class="box" x="262" y="84" width="32" height="34" rx="5"/><text x="278" y="101">1</text>
<rect class="box" x="300" y="84" width="32" height="34" rx="5"/><text x="316" y="101">2</text>
<rect class="box" x="338" y="84" width="32" height="34" rx="5"/><text x="354" y="101">3</text>
<rect class="new" x="250" y="150" width="140" height="100" rx="10"/><text x="320" y="170">건물 3</text><text class="small" x="320" y="190">사본 (팔로워)</text>
<rect class="box" x="262" y="204" width="32" height="34" rx="5"/><text x="278" y="221">1</text>
<rect class="box" x="300" y="204" width="32" height="34" rx="5"/><text x="316" y="221">2</text>
<rect class="box" x="338" y="204" width="32" height="34" rx="5"/><text x="354" y="221">3</text>
<circle class="packet" r="5"><animateMotion dur="1.2s" repeatCount="indefinite" path="M75,46 L75,76"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="0.5s" repeatCount="indefinite" path="M140,120 L248,82"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="0.9s" repeatCount="indefinite" path="M140,150 L248,198"/></circle>
</svg>
<p class="point">원본 건물만 택배를 받고, 사본 건물은 따라 적어요.</p>
<p class="explain">주문 서비스는 사본 건물이 몇 개든 신경 쓰지 않고 원본 건물에만 택배를 맡겨요. 사본 건물은 원본 건물에 들어온 택배를 보고, 같은 순서로 자기 선반에 똑같이 적어 두어요. 이렇게 한 택배가 여러 건물에 남으니, 한 건물이 멈춰도 다른 건물에서 이어 갈 수 있어요.</p>
</section>

<section class="slide">
<h3>실제로는: 리더가 쓰기를 받고 컨슈머는 HW 아래를 읽어요</h3>
<svg class="dg" viewBox="0 0 400 240" role="img" aria-label="파티션 하나의 복제본 세 개: 브로커 1 리더는 오프셋 0부터 5까지, 브로커 2 팔로워는 0부터 4까지 가지고 둘은 ISR이며, 브로커 3 팔로워는 0부터 2까지만 가져 ISR 밖이고, high watermark는 5인 그림">
<text class="small" x="200" y="12">파티션 P0의 복제본 3개</text>
<rect class="new" x="4" y="22" width="392" height="98" rx="8"/><text class="small" x="378" y="108">ISR</text>
<text class="label" x="10" y="50">B1 리더</text>
<rect class="kafka" x="96" y="34" width="40" height="30" rx="4"/><text class="chip" x="116" y="49">0</text>
<rect class="kafka" x="140" y="34" width="40" height="30" rx="4"/><text class="chip" x="160" y="49">1</text>
<rect class="kafka" x="184" y="34" width="40" height="30" rx="4"/><text class="chip" x="204" y="49">2</text>
<rect class="kafka" x="228" y="34" width="40" height="30" rx="4"/><text class="chip" x="248" y="49">3</text>
<rect class="kafka" x="272" y="34" width="40" height="30" rx="4"/><text class="chip" x="292" y="49">4</text>
<rect class="new" x="316" y="34" width="40" height="30" rx="4"/><text class="chip" x="336" y="49">5</text>
<text class="label" x="10" y="94">B2 팔로워</text>
<rect class="box" x="96" y="78" width="40" height="30" rx="4"/><text class="chip" x="116" y="93">0</text>
<rect class="box" x="140" y="78" width="40" height="30" rx="4"/><text class="chip" x="160" y="93">1</text>
<rect class="box" x="184" y="78" width="40" height="30" rx="4"/><text class="chip" x="204" y="93">2</text>
<rect class="box" x="228" y="78" width="40" height="30" rx="4"/><text class="chip" x="248" y="93">3</text>
<rect class="box" x="272" y="78" width="40" height="30" rx="4"/><text class="chip" x="292" y="93">4</text>
<text class="label" x="10" y="148">B3 팔로워</text>
<rect class="box" x="96" y="132" width="40" height="30" rx="4"/><text class="chip" x="116" y="147">0</text>
<rect class="box" x="140" y="132" width="40" height="30" rx="4"/><text class="chip" x="160" y="147">1</text>
<rect class="box" x="184" y="132" width="40" height="30" rx="4"/><text class="chip" x="204" y="147">2</text>
<text class="alert" x="262" y="147">ISR 밖</text>
<path class="line dash" d="M314,26 L314,170"/>
<polygon class="mark" points="314,176 306,188 322,188"/><text x="314" y="204">HW = 5</text>
<text class="small" x="200" y="226">컨슈머는 HW 아래(0~4)까지만 읽어요</text>
</svg>
<p class="point">쓰기는 리더가 받고, 컨슈머는 HW 아래까지만 읽어요.</p>
<p class="explain">택배를 맡기는 앱은 프로듀서, 저장하는 건물은 브로커, 꺼내서 처리하는 앱은 컨슈머예요. 선반의 한 칸인 파티션마다 쓰기를 받는 원본이 리더이고, 같은 기록을 따라 적는 사본이 팔로워예요. ISR은 리더를 잘 따라오는 복제본 명단이고, HW(high watermark)는 복제가 끝난 범위의 다음 번호예요. 그림에서는 HW가 5라서 컨슈머가 0~4를 읽고, 아직 리더에만 있는 5는 기다려요.</p>
</section>

<section class="slide">
<h3>최신으로 맞춘 건물 명단</h3>
<svg class="dg" viewBox="0 0 400 246" role="img" aria-label="건물 1과 건물 2는 택배 1번부터 6번까지 따라 적어서 명단에 오르고, 건물 3은 4번까지만 적어서 뒤처진 상태라 명단에 없는 그림">
<text class="label" x="10" y="42">건물 1</text>
<rect class="kafka" x="70" y="24" width="36" height="36" rx="5"/><text x="88" y="42">1</text>
<rect class="kafka" x="112" y="24" width="36" height="36" rx="5"/><text x="130" y="42">2</text>
<rect class="kafka" x="154" y="24" width="36" height="36" rx="5"/><text x="172" y="42">3</text>
<rect class="kafka" x="196" y="24" width="36" height="36" rx="5"/><text x="214" y="42">4</text>
<rect class="kafka" x="238" y="24" width="36" height="36" rx="5"/><text x="256" y="42">5</text>
<rect class="kafka" x="280" y="24" width="36" height="36" rx="5"/><text x="298" y="42">6</text>
<text class="small" x="361" y="42">원본</text>
<text class="label" x="10" y="92">건물 2</text>
<rect class="kafka" x="70" y="74" width="36" height="36" rx="5"/><text x="88" y="92">1</text>
<rect class="kafka" x="112" y="74" width="36" height="36" rx="5"/><text x="130" y="92">2</text>
<rect class="kafka" x="154" y="74" width="36" height="36" rx="5"/><text x="172" y="92">3</text>
<rect class="kafka" x="196" y="74" width="36" height="36" rx="5"/><text x="214" y="92">4</text>
<rect class="kafka" x="238" y="74" width="36" height="36" rx="5"/><text x="256" y="92">5</text>
<rect class="kafka" x="280" y="74" width="36" height="36" rx="5"/><text x="298" y="92">6</text>
<text class="small" x="361" y="92">따라잡음</text>
<text class="label" x="10" y="142">건물 3</text>
<rect class="kafka" x="70" y="124" width="36" height="36" rx="5"/><text x="88" y="142">1</text>
<rect class="kafka" x="112" y="124" width="36" height="36" rx="5"/><text x="130" y="142">2</text>
<rect class="kafka" x="154" y="124" width="36" height="36" rx="5"/><text x="172" y="142">3</text>
<rect class="kafka" x="196" y="124" width="36" height="36" rx="5"/><text x="214" y="142">4</text>
<rect class="box dash" x="238" y="124" width="36" height="36" rx="5"/>
<rect class="box dash" x="280" y="124" width="36" height="36" rx="5"/>
<text class="alert" x="361" y="142">뒤처짐</text>
<rect class="new" x="30" y="184" width="340" height="46" rx="8"/><text x="200" y="207">ISR 명단: 건물 1, 건물 2</text>
</svg>
<p class="point">원본을 바짝 따라온 건물만 명단에 올라요.</p>
<p class="explain">사본 건물이 모두 원본만큼 최신인 건 아니에요. 건물 3처럼 따라 적는 속도가 느려서 5번, 6번 택배가 아직 없는 곳도 있어요. 그래서 카프카는 원본을 잘 따라온 건물만 명단(ISR)에 적어 두고, 뒤처진 건물은 명단에서 빼요. 이 명단이 나중에 "누가 새 원본이 될 수 있나"와 "영수증을 언제 줄까"를 정하는 기준이 돼요.</p>
</section>

<section class="slide">
<h3>실제로는: HW는 컨슈머가 읽을 수 있는 복제 경계예요</h3>
<table>
<thead><tr><th>항목</th><th>내용</th></tr></thead>
<tbody>
<tr><td>정의</td><td>복제 커밋 경계. 마지막으로 복제에 성공한 레코드의 오프셋 + 1</td></tr>
<tr><td>일반 컨슈머</td><td>HW 아래까지만 읽음</td></tr>
<tr><td><code>read_committed</code></td><td>HW와 미완료 트랜잭션 시작 오프셋 중 작은 값(LSO)까지만 읽음</td></tr>
<tr><td>4.0 이후 전진 조건</td><td>ISR 수가 유효 min ISR 이상이어야 HW가 앞으로 나감 (ELR 활성화 여부와 별개)</td></tr>
</tbody>
</table>
<p class="point">컨슈머는 복제가 끝난 레코드까지만 읽어요.</p>
<p class="explain">HW는 명단 건물들이 함께 보관한 택배의 경계예요. 트랜잭션은 여러 작업을 한 묶음으로 끝내는 장치이고, <code>read_committed</code>는 끝난 묶음만 받는 컨슈머 설정이에요. 이 컨슈머는 HW뿐 아니라 아직 끝나지 않은 묶음의 시작 위치도 넘지 않으며, 두 경계 중 작은 값이 LSO예요. 4.0 이후에는 ISR 수가 유효 min ISR, 곧 적용되는 최소 명단 수 이상이어야 HW가 전진하며, 이는 ELR 활성화 여부와 별개예요.</p>
</section>

</div>

<div class="slide-group">
<h2 class="slide-group-title">접수 응답: 몇 곳에 적혀야 성공일까요?</h2>

<section class="slide">
<h3>영수증은 언제 줄까?</h3>
<table>
<thead><tr><th>영수증을 주는 때</th><th>원본 건물이 불타면</th></tr></thead>
<tbody>
<tr><td>원본에만 적고 바로 (<code>acks=1</code>)</td><td>사본에 못 적은 택배는 사라질 수 있어요</td></tr>
<tr><td>명단 건물이 모두 적은 뒤 (<code>acks=all</code>)</td><td>명단 안 건물이 새 원본이 돼도 그 택배가 있어요</td></tr>
</tbody>
</table>
<p class="point">영수증을 늦게 줄수록 더 안전하고, 그만큼 더 기다려요.</p>
<p class="explain">3편에서 본 영수증(acks)은 복제와 바로 이어져요. 원본에만 적고 영수증을 주면 빠르지만, 그 순간 원본이 불타면 주문 서비스는 "접수됐다"고 믿는데 택배는 어디에도 없어요. 명단 건물이 모두 적은 뒤에 주면 조금 더 기다리지만, 영수증을 받은 택배는 새 원본에도 남아 있어요. 결제 완료 같은 중요한 소식이라면 뒤쪽이 어울려요.</p>
</section>

<section class="slide">
<h3>실제로는: 팔로워가 복제한 뒤 리더가 접수 응답을 보내요</h3>
<svg class="dg" viewBox="0 0 400 230" role="img" aria-label="프로듀서가 리더에 쓰고, 리더의 로그를 팔로워 두 개가 fetch로 가져가 복제하고, ISR 전체가 적은 뒤 리더가 프로듀서에게 응답하는 그림">
<defs><marker id="d1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="box" x="10" y="90" width="80" height="40" rx="6"/><text class="chip" x="50" y="110">Producer</text>
<path class="line" d="M90,100 L148,100" marker-end="url(#d1)"/>
<text class="small" x="119" y="84">① 쓰기</text>
<path class="line dash" d="M148,122 L90,122" marker-end="url(#d1)"/>
<text class="small" x="119" y="142">③ 응답</text>
<rect class="kafka" x="150" y="90" width="90" height="40" rx="6"/><text class="chip" x="195" y="110">리더 B1</text>
<path class="line" d="M240,100 L298,55" marker-end="url(#d1)"/>
<path class="line" d="M240,120 L298,165" marker-end="url(#d1)"/>
<text class="small" x="272" y="110">② 복제</text>
<rect class="box" x="300" y="30" width="90" height="40" rx="6"/><text class="chip" x="345" y="50">팔로워 B2</text>
<rect class="box" x="300" y="150" width="90" height="40" rx="6"/><text class="chip" x="345" y="170">팔로워 B3</text>
<text class="small" x="200" y="214">응답은 ISR 전체가 적은 뒤에 와요</text>
<circle class="packet" r="5"><animateMotion dur="1.2s" repeatCount="indefinite" path="M90,100 L148,100"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.6s" repeatCount="indefinite" path="M240,100 L298,55"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.6s" repeatCount="indefinite" path="M240,120 L298,165"/></circle>
</svg>
<p class="point">팔로워가 fetch로 따라 적고, 리더는 ISR 전체가 적은 뒤 응답해요.</p>
<p class="explain">프로듀서가 먼저 리더 브로커에 메시지를 보내요. 팔로워 브로커는 fetch, 곧 기록을 가져오는 요청으로 리더의 새 메시지를 따라 적어요. 리더는 현재 ISR 전체가 적은 뒤 프로듀서에게 성공 응답을 보내요. 앞의 명단 건물이 모두 적은 뒤 영수증을 주는 순서예요.</p>
</section>

<section class="slide">
<h3>실제로는: acks와 최소 ISR 수를 함께 정해요 (복제 계수 3)</h3>
<table>
<thead><tr><th>조합</th><th>ISR 3개 (정상)</th><th>ISR 2개 (1대 멈춤)</th><th>ISR 1개 (리더만)</th></tr></thead>
<tbody>
<tr><td><code>acks=1</code></td><td>리더만 확인 후 성공</td><td>리더만 확인 후 성공</td><td>리더만 확인 후 성공</td></tr>
<tr><td><code>acks=all</code><br><code>min.insync.replicas=1</code></td><td>3개 확인 후 성공</td><td>2개 확인 후 성공</td><td>리더만 확인 후 성공 (<code>acks=1</code>과 같음)</td></tr>
<tr><td><code>acks=all</code><br><code>min.insync.replicas=2</code></td><td>3개 확인 후 성공</td><td>2개 확인 후 성공</td><td><b>쓰기 거절</b></td></tr>
<tr><td><code>acks=all</code><br><code>min.insync.replicas=3</code></td><td>3개 확인 후 성공</td><td><b>쓰기 거절</b></td><td><b>쓰기 거절</b></td></tr>
</tbody>
</table>
<p class="point">acks=all은 그 순간의 ISR 전체를 기다리고, min.insync.replicas는 ISR의 하한선이에요.</p>
<p class="explain"><code>acks</code>는 프로듀서가 어떤 접수 응답을 기다릴지 정하는 설정이에요. <code>min.insync.replicas</code>는 성공에 필요한 ISR 수의 하한선으로, 명단 건물이 너무 적으면 접수를 멈추는 기준이에요. 2로 설정해도 리더는 두 곳만 골라 기다리지 않고 현재 ISR 전체의 복제를 기다려요.</p>
</section>

<section class="slide">
<h3>실제로는: 복제 계수 3과 최소 ISR 2를 함께 쓰는 이유예요</h3>
<table>
<thead><tr><th>질문</th><th>복제 계수 3 · min.insync.replicas 2</th></tr></thead>
<tbody>
<tr><td>브로커 1대가 멈추면</td><td>ISR이 2개라 쓰기가 계속돼요</td></tr>
<tr><td>브로커 2대가 멈추면</td><td>ISR이 1개라 쓰기를 거절해요</td></tr>
<tr><td>성공한 쓰기는</td><td>항상 2곳 이상에 적혀 있어요</td></tr>
<tr><td><code>min.insync.replicas=1</code>이면</td><td>ISR이 리더뿐이어도 성공해서, 그 리더를 잃으면 레코드도 잃어요</td></tr>
<tr><td><code>min.insync.replicas=3</code>이면</td><td>브로커 1대만 멈춰도 쓰기가 막혀요</td></tr>
</tbody>
</table>
<p class="point">한 대가 멈춰도 쓰기가 되고, 성공한 쓰기는 2곳 이상에 남아요.</p>
<p class="explain">복제 계수는 한 파티션의 원본과 사본을 합친 수예요. 세 건물에 나눠 두고 최소 두 건물이 있어야 접수하게 하면, 한 건물이 멈춰도 프로듀서는 계속 보낼 수 있어요. 두 건물이 멈추면 리더가 쓰기를 거절해서 한 건물에만 새 택배가 남는 일을 막아요.</p>
</section>

</div>

<div class="slide-group">
<h2 class="slide-group-title">리더 교체: 안전한 사본이 원본을 이어받아요</h2>

<section class="slide">
<h3>원본 건물이 불타면</h3>
<svg class="dg" viewBox="0 0 400 190" role="img" aria-label="명단은 건물 1과 건물 2이고, 원본인 건물 1에 불이 나자 명단 안의 건물 2가 새 원본이 되고, 명단 밖의 건물 3은 그대로 사본으로 남는 그림">
<text class="small" x="200" y="14">ISR 명단: 건물 1, 건물 2</text>
<rect class="bad blink" x="10" y="30" width="110" height="140" rx="10"/><text x="65" y="54">건물 1</text><text class="alert" x="65" y="76">불이 났어요</text>
<rect class="box" x="15" y="116" width="22" height="34" rx="4"/><text x="26" y="133">1</text>
<rect class="box" x="41" y="116" width="22" height="34" rx="4"/><text x="52" y="133">2</text>
<rect class="box" x="67" y="116" width="22" height="34" rx="4"/><text x="78" y="133">3</text>
<rect class="box" x="93" y="116" width="22" height="34" rx="4"/><text x="104" y="133">4</text>
<rect class="kafka" x="145" y="30" width="110" height="140" rx="10"/><text x="200" y="54">건물 2</text><text x="200" y="76">새 원본</text>
<rect class="box" x="150" y="116" width="22" height="34" rx="4"/><text x="161" y="133">1</text>
<rect class="box" x="176" y="116" width="22" height="34" rx="4"/><text x="187" y="133">2</text>
<rect class="box" x="202" y="116" width="22" height="34" rx="4"/><text x="213" y="133">3</text>
<rect class="box" x="228" y="116" width="22" height="34" rx="4"/><text x="239" y="133">4</text>
<rect class="box" x="280" y="30" width="110" height="140" rx="10"/><text x="335" y="54">건물 3</text><text class="small" x="335" y="76">명단 밖</text>
<rect class="box" x="285" y="116" width="22" height="34" rx="4"/><text x="296" y="133">1</text>
<rect class="box" x="311" y="116" width="22" height="34" rx="4"/><text x="322" y="133">2</text>
<rect class="box dash" x="337" y="116" width="22" height="34" rx="4"/>
<rect class="box dash" x="363" y="116" width="22" height="34" rx="4"/>
</svg>
<p class="point">명단 안에 있던 건물이 새 원본이 돼요.</p>
<p class="explain">원본이 불타면 주문 서비스는 맡길 곳이 없어지니, 빨리 새 원본을 정해야 해요. 카프카는 명단 안의 건물 중에서 고르는데, 이 건물들은 원본을 바짝 따라 적었기 때문에 이미 영수증을 받은 택배를 모두 가지고 있어요. 그래서 건물 2가 새 원본이 되면 택배 기록이 이어지고, 알림 문자 서비스도 하던 자리에서 계속 가져갈 수 있어요.</p>
</section>

<section class="slide">
<h3>실제로는: ISR과 ELR에서 새 리더 후보를 찾아요</h3>
<table>
<thead><tr><th>상황</th><th>새 리더 후보</th><th>결과</th></tr></thead>
<tbody>
<tr><td>ISR에 복제본이 남아 있음</td><td>ISR 안의 복제본</td><td>정상 선출</td></tr>
<tr><td>ISR이 비었고 <code>unclean.leader.election.enable=false</code></td><td>없음</td><td>ISR 밖 복제본은 뽑지 않음. 리더가 생길 때까지 해당 파티션은 쓸 수 없음</td></tr>
<tr><td>ISR이 비었고 <code>unclean.leader.election.enable=true</code></td><td>ISR 밖 복제본</td><td>다시 쓸 수 있지만 데이터 손실 가능</td></tr>
<tr><td>ISR이 비었고 ELR 후보가 있음 (ELR 활성 시)</td><td>ELR 후보</td><td>HW까지 데이터를 가진 후보를 선택</td></tr>
</tbody>
</table>
<p class="point">unclean 선출은 가용성을 얻는 대신 데이터를 걸어요.</p>
<p class="explain">리더가 멈추면 카프카는 먼저 ISR 안의 복제본에서 새 리더를 찾아요. ELR(Eligible Leader Replicas)은 ISR 밖이어도 HW까지의 데이터를 가진 안전한 후보를 기록한 명단이에요. ELR 후보도 없다면 ISR 밖의 뒤처진 사본을 세우는 unclean 선출은 기록을 잃을 수 있어요. 기본값인 <code>false</code>에서는 이런 선출을 막아서 안전한 리더가 생길 때까지 해당 파티션을 쓸 수 없어요.</p>
</section>

<section class="slide">
<h3>명단 밖 건물을 원본으로 세우면?</h3>
<svg class="dg" viewBox="0 0 400 160" role="img" aria-label="불이 난 원래 원본에는 택배 1번부터 6번이 있었는데, 4번까지만 적은 명단 밖 건물 3을 새 원본으로 세우면 5번과 6번 택배가 사라지는 그림">
<text class="label" x="10" y="38">불난 건물</text>
<rect class="bad" x="80" y="20" width="36" height="36" rx="5"/><text x="98" y="38">1</text>
<rect class="bad" x="122" y="20" width="36" height="36" rx="5"/><text x="140" y="38">2</text>
<rect class="bad" x="164" y="20" width="36" height="36" rx="5"/><text x="182" y="38">3</text>
<rect class="bad" x="206" y="20" width="36" height="36" rx="5"/><text x="224" y="38">4</text>
<rect class="bad" x="248" y="20" width="36" height="36" rx="5"/><text x="266" y="38">5</text>
<rect class="bad" x="290" y="20" width="36" height="36" rx="5"/><text x="308" y="38">6</text>
<text class="label" x="10" y="108">건물 3</text>
<rect class="kafka" x="80" y="90" width="36" height="36" rx="5"/><text x="98" y="108">1</text>
<rect class="kafka" x="122" y="90" width="36" height="36" rx="5"/><text x="140" y="108">2</text>
<rect class="kafka" x="164" y="90" width="36" height="36" rx="5"/><text x="182" y="108">3</text>
<rect class="kafka" x="206" y="90" width="36" height="36" rx="5"/><text x="224" y="108">4</text>
<rect class="box dash blink" x="248" y="90" width="36" height="36" rx="5"/>
<rect class="box dash blink" x="290" y="90" width="36" height="36" rx="5"/>
<text class="small" x="361" y="108">새 원본</text>
<text class="alert" x="287" y="142">5, 6번 택배 사라짐</text>
</svg>
<p class="point">못 따라 적은 택배는 사라질 수 있어요.</p>
<p class="explain">명단 안의 건물이 모두 불타서 남은 건물이 건물 3뿐이라면 어떻게 될까요? 건물 3을 새 원본으로 세우면 다시 일할 수 있지만, 건물 3에 없던 5번과 6번 택배는 영영 사라져요. 일이 멈추는 것과 택배를 잃는 것 중 하나를 골라야 하는 상황이에요. 카프카는 기본으로 이 선택을 막아 두어서, 새 원본이 생길 때까지 일이 멈춰요.</p>
</section>

<section class="slide">
<h3>실제로는: ELR 도입으로 ISR 밖의 안전한 후보도 남겨요</h3>
<table>
<thead><tr><th>버전</th><th>상태</th></tr></thead>
<tbody>
<tr><td>4.0 이전</td><td>ELR 없음. ISR 밖 복제본을 리더로 세우려면 unclean 선출뿐</td></tr>
<tr><td>4.0</td><td>KIP-966 Part 1 도입. 기본 비활성. <code>eligible.leader.replicas.version=1</code>로 활성화</td></tr>
<tr><td>4.1 이후</td><td>새로 만드는 클러스터는 기본 활성</td></tr>
<tr><td>ELR이 추적하는 것</td><td>ISR 밖이어도 HW까지 데이터를 가진 안전한 리더 후보</td></tr>
</tbody>
</table>
<p class="point">옛 글의 "ISR 밖이면 무조건 unclean 선출"은 ELR이 켜지면 맞지 않아요.</p>
<p class="explain">옛 방식에서는 ISR 밖의 건물을 세우는 일이 데이터 손실을 감수하는 선택이었어요. ELR은 명단에서 빠졌더라도 이미 함께 보관한 택배를 가진 건물을 따로 기억해요. 그래서 ELR이 켜진 클러스터에서는 ISR 밖이라는 이유만으로 모두 위험한 후보라고 볼 수 없어요.</p>
</section>

</div>

<div class="slide-group">
<h2 class="slide-group-title">정리: 복제의 이름과 기본값을 확인해요</h2>

<section class="slide">
<h3>복제의 진짜 이름: 원본·사본·최신 명단</h3>
<table>
<thead><tr><th>물류센터 이야기</th><th>카프카 용어</th></tr></thead>
<tbody>
<tr><td>다른 건물의 사본 선반</td><td>복제본 (Replica)</td></tr>
<tr><td>원본을 맡은 건물</td><td>리더 (Leader)</td></tr>
<tr><td>사본을 두고 따라 적는 건물</td><td>팔로워 (Follower)</td></tr>
<tr><td>사본을 최신으로 맞춘 건물 명단</td><td>ISR (In-Sync Replicas)</td></tr>
<tr><td>접수 영수증</td><td>acks</td></tr>
<tr><td>명단 밖 건물을 원본으로 세우기</td><td>unclean 리더 선출</td></tr>
</tbody>
</table>
<p class="point">원본은 리더, 사본은 팔로워, 최신으로 따라온 복제본 명단은 ISR이에요.</p>
</section>

<section class="slide">
<h3>복제 설정의 기본값을 확인해요 (Kafka 4.x)</h3>
<table>
<thead><tr><th>설정</th><th>기본값</th><th>의미</th></tr></thead>
<tbody>
<tr><td><code>default.replication.factor</code></td><td>1</td><td>기본 복제 계수. 운영 권장값 3과 달라요</td></tr>
<tr><td><code>min.insync.replicas</code></td><td>1</td><td><code>acks=all</code> 쓰기 성공에 필요한 ISR 최소 수</td></tr>
<tr><td><code>replica.lag.time.max.ms</code></td><td>30000 (30초)</td><td>fetch를 안 보내거나 리더 로그 끝을 못 따라잡은 팔로워를 ISR에서 빼는 기준</td></tr>
<tr><td><code>unclean.leader.election.enable</code></td><td><code>false</code></td><td>ISR 밖 복제본을 최후 수단으로 리더로 세울지. 켜면 데이터 손실 가능</td></tr>
<tr><td><code>acks</code> (프로듀서)</td><td><code>all</code> (3.0+)</td><td>현재 ISR 전체의 확인을 기다림</td></tr>
</tbody>
</table>
<p class="point">기본 복제 계수가 1이라, 그대로 두면 사본이 없어요.</p>
<p class="explain">여러 건물에 사본을 두려면 기본 복제 계수 1을 그대로 두어서는 안 돼요. <code>replica.lag.time.max.ms</code>는 팔로워가 따라오지 못할 때 ISR에서 빼는 시간 기준이에요. 프로듀서가 <code>acks=all</code>을 써도 최소 ISR이 1이면 리더 혼자 남은 상태에서 접수할 수 있어요.</p>
</section>

<section class="slide">
<h3>복제에서 조심할 점: 전체 사본과 ISR은 달라요</h3>
<table>
<thead><tr><th>오해</th><th>실제</th></tr></thead>
<tbody>
<tr><td><code>acks=all</code>은 모든 복제본이 적는 것</td><td>모든 복제본이 아니라 <b>현재 ISR 전체</b>예요</td></tr>
<tr><td><code>min.insync.replicas=2</code>면 ISR 중 2개만 응답하면 됨</td><td>응답은 ISR 전체가 하고, 2는 ISR이 그보다 작아지면 쓰기를 거절하는 하한선이에요</td></tr>
<tr><td>기본 복제 계수는 3</td><td>기본값은 1이에요. 3은 운영 권장값이에요</td></tr>
<tr><td>ISR 밖 복제본은 unclean 선출로만 리더가 됨</td><td>ELR이 도입된 뒤에는 일반화할 수 없어요</td></tr>
</tbody>
</table>
<p class="point">acks=all이 기다리는 대상은 현재 ISR 전체이며, 안전성은 사본 수와 최소 ISR 설정도 함께 봐야 해요.</p>
<p class="explain">건물이 하나뿐이면 다른 건물에 사본을 둘 수 없어요. 복제 계수가 1이면 건물이 멈출 때 택배를 잃을 수 있으므로 실제 사본 수를 확인해요. 새 리더를 고를 때도 뒤처진 사본과 ELR의 안전한 후보를 구분해야 해요.</p>
</section>

<section class="slide end">
<h3>복제 한 줄 정리</h3>
<p class="point">리더가 받은 택배를 여러 건물에 따라 적고,<br>리더가 멈추면 ISR이나 활성화된 ELR의 안전한 후보가 이어받아요.</p>
</section>

</div>

</div>
