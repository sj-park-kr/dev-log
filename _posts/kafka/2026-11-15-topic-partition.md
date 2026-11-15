---
layout: post
title: "선반을 왜 칸으로 나눌까? 택배 물류센터로 이해하는 Kafka 토픽과 파티션"
description: "카프카 토픽을 왜 파티션으로 나누는지 물류센터 비유로 쉽게 설명하고, 개발자용으로 키 해시(murmur2), 키 없는 메시지의 sticky 파티셔너 변천, num.partitions 기본값, 파티션 수 결정 기준과 증가 시 주의점까지 정리합니다."
date: 2026-11-15 13:00:00 +0900
series: kafka
episode: 2
summary: "선반 하나에 주문이 몰리면 한 명씩만 꺼낼 수 있어서 느려요. 선반을 칸으로 나누면 여럿이 함께 꺼내고, 같은 동네 택배는 항상 같은 칸으로 가요."
---

<div class="lesson">
<nav class="tabs"><a href="#easy">쉬운 설명</a><a href="#dev">개발자용 심화</a></nav>

<div id="easy" class="panel">

<div class="intro">
<p class="q">주문이 몰리면, 선반을 어떻게 나눠야 할까요?</p>
<p>1편에서 주문 서비스는 카프카라는 물류센터에 택배를 맡기고, 재고·알림 같은 서비스가 선반에서 가져간다고 했어요. 그런데 주문이 한꺼번에 몰리면 선반 하나로는 꺼내는 속도를 감당하지 못해요. 선반을 나누면 빨라지지만, 그러면 택배가 어느 칸에 들어가는지, 순서는 어떻게 되는지가 새로운 걱정거리가 돼요.</p>
<p>이 글을 다 읽으면 <b>토픽</b>을 <b>파티션</b>으로 나누는 이유, 택배를 <b>키</b>로 칸에 나눠 넣는 방법, 순서가 어디까지 지켜지는지를 알 수 있어요.</p>
</div>

<section class="slide">
<h2>선반 하나에 주문이 몰리면</h2>
<svg class="dg" viewBox="0 0 400 195" role="img" aria-label="주문 서비스가 선반 하나에 택배를 계속 쌓고, 배송 기사 한 명이 하나씩 꺼내는 그림">
<defs><marker id="a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="box" x="10" y="75" width="80" height="50" rx="8"/><text x="50" y="100">주문</text>
<path class="line" d="M90,90 L126,90" marker-end="url(#a1)"/>
<path class="line" d="M90,100 L126,100" marker-end="url(#a1)"/>
<path class="line" d="M90,110 L126,110" marker-end="url(#a1)"/>
<rect class="bad" x="130" y="45" width="150" height="110" rx="10"/><text class="small" x="205" y="65">선반 (칸 1개)</text>
<rect class="kafka" x="142" y="85" width="40" height="36" rx="5"/><text x="162" y="103">0</text>
<rect class="kafka" x="186" y="85" width="40" height="36" rx="5"/><text x="206" y="103">1</text>
<rect class="kafka" x="230" y="85" width="40" height="36" rx="5"/><text x="250" y="103">2</text>
<path class="line" d="M280,103 L318,103" marker-end="url(#a1)"/>
<rect class="box" x="320" y="83" width="70" height="40" rx="8"/><text x="355" y="103">기사</text>
<text class="alert" x="205" y="175">한 명씩만 꺼내요</text>
<circle class="packet" r="5"><animateMotion dur="1s" repeatCount="indefinite" path="M90,90 L126,90"/></circle>
<circle class="packet" r="5"><animateMotion dur="1s" begin="0.3s" repeatCount="indefinite" path="M90,100 L126,100"/></circle>
<circle class="packet" r="5"><animateMotion dur="1s" begin="0.6s" repeatCount="indefinite" path="M90,110 L126,110"/></circle>
</svg>
<p class="point">선반 하나에 몰리면 줄이 길어져요.</p>
<p class="explain">주문 서비스는 택배를 계속 선반에 올려요. 그런데 기사는 한 번에 한 개씩만 꺼낼 수 있어서, 올리는 속도가 꺼내는 속도보다 빠르면 선반에는 쌓이기만 해요. 쌓인 택배는 그만큼 늦게 배송돼요. 결제 완료 소식이 알림 서비스에 늦게 닿는 것도 이런 이유예요.</p>
</section>

<section class="slide">
<h2>기사를 늘려도 그대로예요</h2>
<svg class="dg" viewBox="0 0 400 285" role="img" aria-label="선반 하나에서 재고 팀의 기사 A만 택배를 꺼내고, 같은 팀의 기사 B와 기사 C는 기다리는 그림. 같은 팀 안에서는 한 칸을 한 명만 맡는다">
<defs><marker id="a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="box" x="10" y="90" width="120" height="90" rx="10"/><text x="70" y="125">선반 하나</text><text class="small" x="70" y="148">칸 1개</text>
<path class="line" d="M130,120 L258,60" marker-end="url(#a2)"/>
<path class="line dash" d="M130,135 L258,135" marker-end="url(#a2)"/>
<path class="line dash" d="M130,150 L258,210" marker-end="url(#a2)"/>
<rect class="box dash" x="248" y="6" width="144" height="248" rx="10"/><text class="small" x="320" y="24">재고 팀</text>
<rect class="box" x="260" y="40" width="120" height="40" rx="8"/><text x="320" y="60">기사 A</text><text class="small" x="320" y="93">꺼내는 중</text>
<rect class="bad" x="260" y="115" width="120" height="40" rx="8"/><text x="320" y="135">기사 B</text><text class="alert" x="320" y="168">기다려요</text>
<rect class="bad" x="260" y="190" width="120" height="40" rx="8"/><text x="320" y="210">기사 C</text><text class="alert" x="320" y="243">기다려요</text>
<text class="small" x="200" y="276">같은 팀 안에서는 한 칸을 한 명만 맡아요 (4편)</text>
</svg>
<p class="point">칸이 하나면, 같은 팀 기사를 늘려도 일하는 사람은 한 명이에요.</p>
<p class="explain">배송이 밀려서 재고 팀이 기사를 두 명 더 불렀다고 해 봐요. 그런데 같은 팀 안에서는 한 칸을 한 명만 맡을 수 있어요. 칸이 하나뿐이니 기사 A만 일하고, B와 C는 맡을 칸이 없어서 서 있기만 해요. 일할 수 있는 사람 수는 기사 수가 아니라 칸 수가 정해요.</p>
</section>

<details class="origin">
<summary>더 알아보기: 칸 고르는 규칙은 어떻게 바뀌어 왔을까?</summary>
<p>동네(키)가 적힌 택배는 계산식으로 칸이 정해져요. 동네가 없는 택배를 어느 칸에 넣을지는 <b>카프카 버전마다 규칙이 바뀌어 왔어요.</b></p>
<p>예전에는 칸을 돌아가며 한 개씩 넣었어요. 이걸 라운드 로빈(round-robin)이라고 해요.</p>
<p><b>Kafka 2.4(KIP-480)</b>에서 한 칸에 모아 싣다가, 새 묶음을 시작할 때 칸을 바꾸는 방식(sticky)이 들어왔어요. 트럭에 싣는 묶음(배치)은 같은 칸의 택배끼리만 만들 수 있어서 이게 더 유리해요.</p>
<p><b>3.3(KIP-794)</b>에서는 "묶음을 몇 번 만들었나" 대신 "얼마나 실었나"를 기준으로 바꿨어요. 느린 건물(브로커) 쪽으로 택배가 쏠리지 않게 하는 방법도 더했고요.</p>
<p>그리고 <b>4.0</b>에서는 예전 파티셔너 클래스 두 개가 사라졌어요. 자세한 건 개발자용 심화 탭에서 봐요.</p>
</details>

<section class="slide">
<h2>그래서, 선반을 칸으로 나눠요</h2>
<svg class="dg" viewBox="0 0 400 220" role="img" aria-label="주문 선반이 칸 0, 칸 1, 칸 2로 나뉘고, 칸마다 배송 기사 A, B, C가 한 명씩 택배를 꺼내는 그림">
<defs><marker id="a3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="box dash" x="10" y="20" width="270" height="190" rx="10"/><text class="small" x="145" y="36">주문 선반</text>
<rect class="box" x="20" y="50" width="250" height="42" rx="6"/><text x="48" y="71">칸 0</text>
<rect class="kafka" x="80" y="56" width="40" height="30" rx="5"/><text x="100" y="71">0</text>
<rect class="kafka" x="126" y="56" width="40" height="30" rx="5"/><text x="146" y="71">1</text>
<rect class="kafka" x="172" y="56" width="40" height="30" rx="5"/><text x="192" y="71">2</text>
<rect class="box" x="20" y="100" width="250" height="42" rx="6"/><text x="48" y="121">칸 1</text>
<rect class="kafka" x="80" y="106" width="40" height="30" rx="5"/><text x="100" y="121">0</text>
<rect class="kafka" x="126" y="106" width="40" height="30" rx="5"/><text x="146" y="121">1</text>
<rect class="kafka" x="172" y="106" width="40" height="30" rx="5"/><text x="192" y="121">2</text>
<rect class="box" x="20" y="150" width="250" height="42" rx="6"/><text x="48" y="171">칸 2</text>
<rect class="kafka" x="80" y="156" width="40" height="30" rx="5"/><text x="100" y="171">0</text>
<rect class="kafka" x="126" y="156" width="40" height="30" rx="5"/><text x="146" y="171">1</text>
<path class="line" d="M270,71 L318,71" marker-end="url(#a3)"/>
<path class="line" d="M270,121 L318,121" marker-end="url(#a3)"/>
<path class="line" d="M270,171 L318,171" marker-end="url(#a3)"/>
<rect class="box" x="320" y="50" width="70" height="42" rx="8"/><text x="355" y="71">기사 A</text>
<rect class="box" x="320" y="100" width="70" height="42" rx="8"/><text x="355" y="121">기사 B</text>
<rect class="box" x="320" y="150" width="70" height="42" rx="8"/><text x="355" y="171">기사 C</text>
</svg>
<p class="point">선반을 칸으로 나누면, 같은 팀 기사들이 칸을 하나씩 맡아 함께 일해요.</p>
<p class="explain">주문 택배가 칸 0, 1, 2에 나뉘어 쌓이니까, 기사 세 명이 각자 자기 칸만 보면 돼요. 서로 기다릴 일이 없어서 세 명이 동시에 꺼낼 수 있어요. 칸을 나눈 만큼 한꺼번에 처리하는 양이 늘어나요. 이렇게 나눈 칸 하나하나를 파티션이라고 불러요.</p>
</section>

<section class="slide">
<h2>어느 칸에 넣을까? 받는 동네로 정해요</h2>
<svg class="dg" viewBox="0 0 400 185" role="img" aria-label="마포 동네 택배 두 개는 칸 0으로, 강남 동네 택배는 칸 1로 들어가는 그림">
<defs><marker id="a4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="box" x="10" y="14" width="90" height="36" rx="8"/><text x="55" y="32">마포 택배</text>
<rect class="box" x="10" y="74" width="90" height="36" rx="8"/><text x="55" y="92">마포 택배</text>
<rect class="box" x="10" y="134" width="90" height="36" rx="8"/><text x="55" y="152">강남 택배</text>
<path class="line" d="M100,32 L246,30" marker-end="url(#a4)"/>
<path class="line" d="M100,92 L246,42" marker-end="url(#a4)"/>
<path class="line" d="M100,152 L246,90" marker-end="url(#a4)"/>
<rect class="kafka" x="250" y="10" width="140" height="40" rx="8"/><text x="320" y="30">칸 0</text>
<rect class="kafka" x="250" y="70" width="140" height="40" rx="8"/><text x="320" y="90">칸 1</text>
<rect class="box" x="250" y="130" width="140" height="40" rx="8"/><text x="320" y="150">칸 2</text>
<circle class="packet" r="5"><animateMotion dur="1.6s" repeatCount="indefinite" path="M100,32 L246,30"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="0.5s" repeatCount="indefinite" path="M100,92 L246,42"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="1s" repeatCount="indefinite" path="M100,152 L246,90"/></circle>
</svg>
<p class="point">같은 동네 택배는 항상 같은 칸으로 가요.</p>
<p class="explain">칸이 여러 개가 되면, 택배마다 어느 칸에 넣을지 정해야 해요. 송장에 받는 동네(키)가 적혀 있으면 그 동네로 칸을 계산해요. 같은 동네는 계산 결과도 같아서 늘 같은 칸으로 들어가요. 예를 들어 같은 고객의 주문 소식을 같은 동네로 적어 두면, 그 고객의 소식이 한 칸에 차례로 모여요.</p>
</section>

<section class="slide">
<h2>순서는 어디까지 지켜질까?</h2>
<svg class="dg" viewBox="0 0 400 140" role="img" aria-label="칸 0과 칸 1 각각에는 택배 번호가 차례대로 붙어 순서가 지켜지지만, 두 칸 사이의 순서는 알 수 없다는 그림">
<text class="label" x="10" y="36">칸 0</text>
<rect class="kafka" x="70" y="18" width="50" height="36" rx="5"/><text x="95" y="36">0</text>
<rect class="kafka" x="126" y="18" width="50" height="36" rx="5"/><text x="151" y="36">1</text>
<rect class="kafka" x="182" y="18" width="50" height="36" rx="5"/><text x="207" y="36">2</text>
<text class="small" x="345" y="36">순서가 지켜져요</text>
<text class="alert" x="200" y="72">칸 0과 칸 1 사이는 순서를 몰라요</text>
<text class="label" x="10" y="108">칸 1</text>
<rect class="kafka" x="70" y="90" width="50" height="36" rx="5"/><text x="95" y="108">0</text>
<rect class="kafka" x="126" y="90" width="50" height="36" rx="5"/><text x="151" y="108">1</text>
<rect class="kafka" x="182" y="90" width="50" height="36" rx="5"/><text x="207" y="108">2</text>
<rect class="kafka" x="238" y="90" width="50" height="36" rx="5"/><text x="263" y="108">3</text>
<text class="small" x="345" y="108">순서가 지켜져요</text>
</svg>
<p class="point">한 칸 안은 순서대로, 칸끼리는 순서가 없어요.</p>
<p class="explain">한 칸 안에서는 들어온 차례대로 번호가 붙고, 기사도 그 번호 순서로 꺼내요. 하지만 칸 0과 칸 1은 따로 움직여서 어느 쪽 택배가 먼저인지 알 수 없어요. "주문 접수" 다음에 "결제 완료"가 와야 하는 택배는 같은 동네로 적어서 같은 칸에 보내야 순서가 지켜져요.</p>
</section>

<section class="slide">
<h2>동네가 없는 택배는?</h2>
<svg class="dg" viewBox="0 0 400 170" role="img" aria-label="동네가 적히지 않은 택배는 지금 칸에 한 묶음이 찰 때까지 모아 싣고, 가득 차면 다음 칸으로 바꾸는 그림">
<defs><marker id="a5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="box" x="10" y="75" width="110" height="50" rx="8"/><text class="chip" x="65" y="100">동네 없는 택배</text>
<path class="line" d="M120,100 L188,42" marker-end="url(#a5)"/>
<text class="small" x="290" y="10">지금 칸</text>
<rect class="box" x="190" y="20" width="200" height="44" rx="6"/>
<rect class="kafka" x="200" y="27" width="36" height="30" rx="5"/><text x="218" y="42">0</text>
<rect class="kafka" x="244" y="27" width="36" height="30" rx="5"/><text x="262" y="42">1</text>
<rect class="kafka" x="288" y="27" width="36" height="30" rx="5"/><text x="306" y="42">2</text>
<rect class="kafka" x="332" y="27" width="36" height="30" rx="5"/><text x="350" y="42">3</text>
<path class="line dash" d="M270,64 L270,108" marker-end="url(#a5)"/>
<text class="small" x="345" y="80">가득 차면</text><text class="small" x="345" y="96">바꿔요</text>
<rect class="new" x="190" y="110" width="200" height="44" rx="6"/><text x="290" y="132">다음 칸</text>
</svg>
<p class="point">동네가 없으면 한 칸에 모아 싣다가 칸을 바꿔요.</p>
<p class="explain">모든 택배에 동네가 적혀 있지는 않아요. 접속 기록처럼 순서가 중요하지 않은 택배가 그래요. 이런 택배는 지금 칸에 한 묶음이 찰 때까지 모아 싣다가, 가득 차면 다음 칸으로 옮겨요. 트럭에 싣는 묶음은 같은 칸의 택배끼리만 만들 수 있어서 이렇게 하면 한 번에 많이 실을 수 있어요. 대신 칸이 바뀌기 때문에 순서는 기대할 수 없어요.</p>
</section>

<section class="slide">
<h2>칸은 늘릴 수만 있어요</h2>
<table>
<thead><tr><th>하고 싶은 일</th><th>될까요?</th></tr></thead>
<tbody>
<tr><td>칸 늘리기</td><td>할 수 있어요</td></tr>
<tr><td>칸 줄이기</td><td>할 수 없어요</td></tr>
</tbody>
</table>
<p class="point">칸은 한번 늘리면 되돌릴 수 없어요.</p>
<p class="explain">주문이 늘면 칸을 더 만들 수 있지만, 주문이 줄었다고 칸을 줄일 수는 없어요. 그래서 칸 수는 처음에 신중하게 정해야 해요. 함께 일할 기사가 몇 명쯤 필요한지부터 따져 보면 좋아요.</p>
</section>

<section class="slide">
<h2>칸을 늘리면 동네가 옮겨 가요</h2>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="칸이 3개일 때 칸 0으로 가던 마포 택배가, 칸을 4개로 늘리면 칸 3으로 갈 수 있다는 그림">
<defs><marker id="a6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="label" x="10" y="12">칸 3개일 때</text>
<rect class="box" x="10" y="24" width="100" height="40" rx="8"/><text x="60" y="44">마포 택배</text>
<path class="line" d="M110,44 L250,44" marker-end="url(#a6)"/>
<rect class="kafka" x="252" y="24" width="80" height="40" rx="8"/><text x="292" y="44">칸 0</text>
<text class="label" x="10" y="100">칸 4개로 늘리면</text>
<rect class="box" x="10" y="112" width="100" height="40" rx="8"/><text x="60" y="132">마포 택배</text>
<path class="line" d="M110,132 L250,132" marker-end="url(#a6)"/>
<rect class="new" x="252" y="112" width="80" height="40" rx="8"/><text x="292" y="132">칸 3</text>
<text class="alert" x="200" y="180">옛 택배는 칸 0에 그대로 있어요</text>
</svg>
<p class="point">칸 수가 바뀌면, 일부 동네는 다른 칸으로 가요.</p>
<p class="explain">칸을 고르는 계산에는 칸 수가 들어가요. 그래서 칸이 3개에서 4개로 늘면 같은 마포 택배도 다른 칸이 나올 수 있어요. 이미 칸 0에 쌓인 옛 택배는 자동으로 옮겨지지 않아요. 그러면 같은 동네의 택배가 두 칸에 나뉘어 있게 되고, 그 동네의 순서도 깨질 수 있어요.</p>
</section>

<section class="slide">
<h2>진짜 이름 붙이기</h2>
<table>
<thead><tr><th>물류센터 이야기</th><th>카프카 용어</th></tr></thead>
<tbody>
<tr><td>배송 구역 선반</td><td>토픽 (Topic)</td></tr>
<tr><td>선반의 칸</td><td>파티션 (Partition)</td></tr>
<tr><td>송장에 적힌 받는 동네</td><td>키 (Key)</td></tr>
<tr><td>칸 안의 택배 번호</td><td>오프셋 (Offset)</td></tr>
<tr><td>트럭에 모아 싣기</td><td>배치 (Batch)</td></tr>
<tr><td>배송 팀 (4편)</td><td>컨슈머 그룹 (<code>group.id</code>)</td></tr>
</tbody>
</table>
</section>

<section class="slide">
<h2>이럴 땐 조심해요</h2>
<table>
<thead><tr><th>상황</th><th>이유</th></tr></thead>
<tbody>
<tr><td>전체 주문의 순서가 꼭 필요해요</td><td>칸끼리는 순서가 없어요. 순서가 필요한 택배는 같은 동네로 묶어요</td></tr>
<tr><td>동네 없이 보내면서 순서를 기대해요</td><td>동네가 없으면 칸이 바뀌어서 순서를 알 수 없어요</td></tr>
<tr><td>칸을 나중에 줄이고 싶어요</td><td>줄일 수 없어요. 처음에 신중히 정해요</td></tr>
</tbody>
</table>
</section>

<section class="slide end">
<h2>한 줄 정리</h2>
<p class="point">선반을 칸으로 나누면 여럿이 함께 꺼낼 수 있고,<br>같은 동네는 항상 같은 칸이라 순서가 지켜져요.</p>
</section>

<p class="next-tab"><a href="#dev">이해됐다면, 개발자용 심화 보기 →</a></p>
</div>

<div id="dev" class="panel">

<section class="slide">
<h2>키는 어떻게 파티션이 될까?</h2>
<svg class="dg" viewBox="0 0 400 160" role="img" aria-label="key가 있으면 murmur2 해시를 파티션 수로 나눈 나머지로 파티션이 정해지고, key가 없으면 sticky 규칙으로 파티션이 정해지는 그림">
<defs><marker id="d1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="box" x="8" y="20" width="80" height="36" rx="6"/><text class="chip" x="48" y="38">key 있음</text>
<path class="line" d="M88,38 L108,38" marker-end="url(#d1)"/>
<rect class="box" x="110" y="20" width="76" height="36" rx="6"/><text class="chip" x="148" y="38">murmur2</text>
<path class="line" d="M186,38 L206,38" marker-end="url(#d1)"/>
<rect class="box" x="208" y="20" width="96" height="36" rx="6"/><text class="chip" x="256" y="38">% 파티션 수</text>
<path class="line" d="M304,38 L320,38" marker-end="url(#d1)"/>
<rect class="kafka" x="322" y="20" width="70" height="36" rx="6"/><text class="chip" x="357" y="38">파티션 n</text>
<text class="small" x="200" y="72">같은 key는 항상 같은 번호가 나와요</text>
<rect class="box" x="8" y="90" width="80" height="36" rx="6"/><text class="chip" x="48" y="108">key 없음</text>
<path class="line" d="M88,108 L108,108" marker-end="url(#d1)"/>
<rect class="box" x="110" y="90" width="96" height="36" rx="6"/><text class="chip" x="158" y="108">sticky 규칙</text>
<path class="line" d="M206,108 L320,108" marker-end="url(#d1)"/>
<rect class="kafka" x="322" y="90" width="70" height="36" rx="6"/><text class="chip" x="357" y="108">파티션 n</text>
<text class="small" x="200" y="142">한 파티션에 모으다가 바꿔요</text>
</svg>
<p class="point">key가 있으면 해시로, 없으면 sticky 규칙으로 정해져요.</p>
</section>

<section class="slide">
<h2>파티션이 정해지는 경로</h2>
<table>
<thead><tr><th>상황</th><th>결과</th></tr></thead>
<tbody>
<tr><td>레코드에 파티션 번호를 직접 지정</td><td>지정한 파티션</td></tr>
<tr><td><code>partitioner.class</code> 지정</td><td>직접 만든 파티셔너가 결정</td></tr>
<tr><td>기본 경로 + key 있음</td><td><code>Utils.toPositive(Utils.murmur2(serializedKey)) % numPartitions</code></td></tr>
<tr><td>기본 경로 + key 없음</td><td>sticky 방식 (아래 표 참고)</td></tr>
<tr><td><code>partitioner.ignore.keys=true</code></td><td>key를 무시</td></tr>
</tbody>
</table>
<p class="point">해시 대상은 직렬화된 key 바이트예요. (Kafka 4.x)</p>
</section>

<section class="slide">
<h2>순서는 어디까지 보장될까?</h2>
<table>
<thead><tr><th>범위</th><th>순서 보장</th><th>이유</th></tr></thead>
<tbody>
<tr><td>파티션 안</td><td>보장</td><td>레코드가 끝에만 추가되고, 오프셋이 곧 순서</td></tr>
<tr><td>같은 key</td><td>파티션 수가 그대로면 보장</td><td>항상 같은 파티션으로 감</td></tr>
<tr><td>토픽 전체</td><td>보장 안 됨</td><td>파티션끼리는 순서 관계가 없음</td></tr>
<tr><td>key 없는 레코드</td><td>기대할 수 없음</td><td>sticky로 파티션이 바뀜</td></tr>
<tr><td>프로듀서 재시도</td><td>멱등성을 끄고 in-flight가 2 이상이면 깨질 수 있음</td><td><code>max.in.flight.requests.per.connection</code> 기본 5</td></tr>
</tbody>
</table>
<p class="point">순서가 필요한 데이터는 같은 key로 묶어요.</p>
</section>

<section class="slide">
<h2>key 없는 레코드: sticky의 변천</h2>
<table>
<thead><tr><th>버전</th><th>규칙</th></tr></thead>
<tbody>
<tr><td>2.4 이전</td><td>파티션을 돌아가며 한 개씩 (round-robin)</td></tr>
<tr><td>2.4 (KIP-480)</td><td>sticky 도입. 같은 파티션에 모으고, 새 배치를 할당할 때 바꿈</td></tr>
<tr><td>3.3 (KIP-794)</td><td>배치 생성마다 바꾸던 방식에서 누적 생산 바이트(<code>batch.size</code>) 기준으로 전환. 느린 브로커로 인한 편향을 줄이는 적응형 선택 도입</td></tr>
<tr><td>4.0 이후</td><td><code>DefaultPartitioner</code>, <code>UniformStickyPartitioner</code> 클래스 제거. 기본 파티셔닝 기능은 유지</td></tr>
</tbody>
</table>
<p class="point">'key 없으면 round-robin'은 옛날 설명이에요.</p>
</section>

<section class="slide">
<h2>파티션 관련 설정과 기본값</h2>
<table>
<thead><tr><th>설정</th><th>기본값</th><th>의미</th></tr></thead>
<tbody>
<tr><td><code>partitioner.class</code></td><td><code>null</code></td><td>지정하지 않으면 기본 로직. key 있음은 해시, 없음은 sticky</td></tr>
<tr><td><code>partitioner.adaptive.partitioning.enable</code></td><td><code>true</code></td><td>key 없는 레코드에서 느린 브로커로 인한 편향을 줄임 (KIP-794)</td></tr>
<tr><td><code>partitioner.ignore.keys</code></td><td><code>false</code></td><td><code>true</code>면 key를 무시</td></tr>
<tr><td><code>batch.size</code></td><td>16384 (16 KiB)</td><td>같은 파티션 레코드를 모으는 배치 크기. sticky 전환의 누적 바이트 기준</td></tr>
<tr><td><code>num.partitions</code> (브로커)</td><td>1</td><td>토픽 생성 때 파티션 수를 생략하면 쓰는 값</td></tr>
</tbody>
</table>
<p class="point">기본값은 Kafka 4.x 기준이에요.</p>
</section>

<section class="slide">
<h2>파티션 수는 어떻게 정할까?</h2>
<table>
<thead><tr><th>기준</th><th>이유</th></tr></thead>
<tbody>
<tr><td>동시에 일할 컨슈머 수</td><td>일반 컨슈머 그룹은 파티션 하나를 컨슈머 한 개에만 배정해요. 컨슈머가 파티션보다 많으면 일부는 배정을 못 받아요. (share group에는 해당 안 됨)</td></tr>
<tr><td>key 단위 순서가 필요한가</td><td>순서는 파티션 안에서만 보장돼요</td></tr>
<tr><td>나중에 늘릴 가능성</td><td>줄일 수 없고, 늘리면 key와 파티션의 대응이 바뀌어요</td></tr>
<tr><td>기본값 확인</td><td><code>num.partitions</code>가 1이라, 생략하면 병렬성 상한도 1이에요</td></tr>
</tbody>
</table>
<p class="point">병렬성의 상한은 파티션 수라서, 필요한 컨슈머 수를 먼저 봐요.</p>
</section>

<section class="slide">
<h2>파티션을 늘리면 생기는 일</h2>
<svg class="dg" viewBox="0 0 400 205" role="img" aria-label="해시값 7인 key는 파티션이 3개일 때 7을 3으로 나눈 나머지 1이라 P1로 가지만, 4개로 늘리면 나머지 3이라 P3로 가는 그림">
<defs><marker id="d2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="label" x="10" y="12">파티션 3개</text>
<rect class="box" x="10" y="24" width="110" height="40" rx="6"/><text class="chip" x="65" y="44">7 % 3 = 1</text>
<path class="line" d="M120,44 L250,44" marker-end="url(#d2)"/>
<rect class="kafka" x="252" y="24" width="60" height="40" rx="6"/><text x="282" y="44">P1</text>
<text class="label" x="10" y="100">4개로 증가</text>
<rect class="box" x="10" y="112" width="110" height="40" rx="6"/><text class="chip" x="65" y="132">7 % 4 = 3</text>
<path class="line" d="M120,132 L250,132" marker-end="url(#d2)"/>
<rect class="new" x="252" y="112" width="60" height="40" rx="6"/><text x="282" y="132">P3</text>
<text class="alert" x="200" y="172">P1의 옛 레코드는 자동으로 안 옮겨져요</text>
<text class="small" x="200" y="192">(7은 설명용 가짜 해시값이에요)</text>
</svg>
<p class="point">나머지 연산의 분모가 바뀌면 결과도 바뀌어요.</p>
</section>

<section class="slide">
<h2>파티션을 늘릴 때 주의</h2>
<table>
<thead><tr><th>항목</th><th>내용 (Kafka 4.x)</th></tr></thead>
<tbody>
<tr><td>증가 / 감소</td><td>증가는 가능, 감소는 미지원</td></tr>
<tr><td>기존 데이터</td><td>자동으로 재분배되지 않음</td></tr>
<tr><td>같은 key의 옛 레코드와 새 레코드</td><td>같은 파티션에 있다는 보장이 없음. 일부 key의 이후 레코드가 다른 파티션으로 감</td></tr>
<tr><td>컨슈머 그룹</td><td>구독 토픽의 파티션이 늘면 리밸런싱으로 배정을 조정</td></tr>
</tbody>
</table>
<p class="point">key 순서에 기대는 토픽은 늘리기 전에 한 번 더 생각해요.</p>
</section>

<section class="slide">
<h2>예전 글이 틀린 지점</h2>
<table>
<thead><tr><th>예전 글</th><th>지금 (Kafka 4.x)</th></tr></thead>
<tbody>
<tr><td>key가 없으면 round-robin</td><td>2.4부터 sticky, 3.3에서 개선. 현재 기본은 sticky</td></tr>
<tr><td><code>DefaultPartitioner</code>를 쓰거나 상속</td><td>4.0에서 클래스 제거. <code>partitioner.class</code>를 지정하지 않으면 내장 기본 로직</td></tr>
<tr><td>파티션을 늘려도 같은 key는 같은 파티션</td><td>보장 없음. 일부 key는 다른 파티션으로 감</td></tr>
</tbody>
</table>
<p class="point">파티셔너 글을 읽을 땐 어느 버전 기준인지 먼저 봐요.</p>
</section>

<section class="slide end">
<h2>한 줄 정리</h2>
<p class="point">파티션은 순서와 병렬성의 단위이고,<br>key와 파티션의 대응은 파티션 수가 바뀌면 함께 바뀌어요.</p>
</section>

</div>
</div>
