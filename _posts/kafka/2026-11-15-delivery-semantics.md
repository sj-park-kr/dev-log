---
layout: post
title: "택배가 두 번 오거나 사라지면? 물류센터로 이해하는 카프카 전달 보장"
description: "카프카의 전달 보장(at-most-once, at-least-once, exactly-once)을 택배 물류센터 비유로 쉽게 설명하고, 송장 번호·묶음 배송에서 멱등 프로듀서·트랜잭션·read_committed의 실제 동작까지 이어서 설명합니다."
date: 2026-11-15 15:30:00 +0900
series: kafka
episode: 7
summary: "택배는 두 번 오거나 사라질 수 있어요. 카프카는 송장 번호와 묶음 배송으로 이 둘을 막아요."
---

<div class="lesson lesson-hierarchy">

<div class="intro">
<p class="q">택배가 두 번 오거나 사라지지 않게 하려면 어떻게 해야 할까요?</p>
<p>앞 편까지 택배를 맡기고(프로듀서), 복사본을 만들고(복제), 얼마나 오래 보관할지(보관·정리)를 봤어요. 그런데 택배를 맡기고 받는 중간에 문제가 생기면 같은 주문이 두 번 처리되거나 아예 처리되지 않을 수 있어요. 결제 완료 알림이 두 번 가면 곤란하고, 한 번도 안 가도 곤란해요.</p>
<p>이 글을 다 읽으면 <b>최대 한 번, 최소 한 번, 정확히 한 번</b>이 각각 무슨 뜻인지, 그리고 카프카가 <b>송장 번호(멱등 프로듀서)</b>와 <b>묶음 배송(트랜잭션)</b>으로 중복과 유실을 어떻게 줄이는지 알 수 있어요.</p>
</div>

<div class="slide-group">
<h2 class="slide-group-title">무엇이 문제인가: 두 번 오거나 빠지는 택배</h2>

<section class="slide">
<h3>영수증을 못 받아서 다시 맡겼더니</h3>
<svg class="dg" viewBox="0 0 400 240" role="img" aria-label="주문 서비스가 카프카에 택배를 맡겼지만 영수증이 오지 않아 다시 맡겼고, 그 결과 주문 선반에 같은 주문 A-17이 두 칸에 쌓인 그림">
<defs><marker id="a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="box" x="10" y="40" width="70" height="75" rx="8"/><text x="45" y="78">주문</text>
<rect class="kafka" x="190" y="26" width="110" height="100" rx="10"/><text x="245" y="64">카프카</text><text class="small" x="245" y="88">물류센터</text>
<text class="chip" x="133" y="34">맡기기</text>
<path class="line" d="M80,46 L186,46" marker-end="url(#a1)"/>
<text class="alert blink" x="133" y="64">영수증 안 옴</text>
<path class="line dash" d="M186,78 L84,78" marker-end="url(#a1)"/>
<text class="chip" x="133" y="96">다시 맡기기</text>
<path class="line" d="M80,108 L186,108" marker-end="url(#a1)"/>
<text class="small" x="188" y="152">주문 선반</text>
<rect class="kafka" x="70" y="164" width="56" height="40" rx="6"/><text class="chip" x="98" y="184">A-15</text>
<rect class="kafka" x="130" y="164" width="56" height="40" rx="6"/><text class="chip" x="158" y="184">A-16</text>
<rect class="bad" x="190" y="164" width="56" height="40" rx="6"/><text class="chip" x="218" y="184">A-17</text>
<rect class="bad" x="250" y="164" width="56" height="40" rx="6"/><text class="chip" x="278" y="184">A-17</text>
<text class="alert" x="188" y="226">같은 주문이 두 칸에</text>
</svg>
<p class="point">영수증이 안 오면 다시 맡기는데, 그러면 택배가 두 개가 돼요.</p>
<p class="explain">주문 서비스는 택배를 맡겼는데 영수증이 오지 않으면, 접수가 안 된 건지 영수증만 길에서 사라진 건지 알 수 없어요. 그래서 안전하게 다시 맡기는데, 사실 처음 택배도 접수돼 있었다면 같은 주문이 두 번 쌓여요. 결제 완료 알림이 두 번 나가는 것처럼, 받는 쪽에서는 같은 일을 두 번 하게 돼요.</p>
</section>

<section class="slide">
<h3>배달하다 넘어지면</h3>
<svg class="dg" viewBox="0 0 400 230" role="img" aria-label="배송 기사가 장부에 4번까지 읽었다고 먼저 적은 뒤 배달하러 가다가 넘어져서, 4번 택배는 도착하지 못한 그림">
<defs><marker id="a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="small" x="200" y="14">주문 선반</text>
<rect class="kafka" x="20" y="28" width="50" height="40" rx="6"/><text x="45" y="48">1</text>
<rect class="kafka" x="80" y="28" width="50" height="40" rx="6"/><text x="105" y="48">2</text>
<rect class="kafka" x="140" y="28" width="50" height="40" rx="6"/><text x="165" y="48">3</text>
<rect class="bad blink" x="200" y="28" width="50" height="40" rx="6"/><text x="225" y="48">4</text>
<rect class="kafka" x="260" y="28" width="50" height="40" rx="6"/><text x="285" y="48">5</text>
<rect class="kafka" x="320" y="28" width="50" height="40" rx="6"/><text x="345" y="48">6</text>
<polygon class="mark" points="225,76 217,88 233,88"/><text x="225" y="106">장부</text><text class="small" x="225" y="126">4번까지 적음</text>
<rect class="box" x="10" y="160" width="70" height="40" rx="8"/><text x="45" y="180">기사</text>
<path class="line" d="M80,180 L146,180" marker-end="url(#a2)"/>
<rect class="bad blink" x="150" y="160" width="90" height="40" rx="8"/><text x="195" y="180">넘어짐</text>
<path class="line dash" d="M240,180 L286,180" marker-end="url(#a2)"/>
<rect class="box dash" x="290" y="160" width="100" height="40" rx="8"/><text x="340" y="180">4번 배달</text>
<text class="alert" x="340" y="216">도착 못 함</text>
</svg>
<p class="point">장부에 먼저 적고 배달하다 넘어지면, 그 택배는 영영 못 받아요.</p>
<p class="explain">기사는 장부에 "어디까지 가져갔는지"를 적어 두고, 장애가 나면 장부를 보고 이어서 가요. 그런데 4번까지 적어 놓고 배달하기 전에 넘어지면, 기사가 돌아와도 장부에는 이미 4번까지 갔다고 되어 있어요. 그래서 4번 택배는 건너뛰어지고, 그 주문의 알림 문자는 한 번도 나가지 않아요.</p>
</section>

<section class="slide">
<h3>실제로는: 컨슈머가 장부를 적는 시점이 중요해요</h3>
<svg class="dg" viewBox="0 0 400 236" role="img" aria-label="커밋은 읽은 위치를 저장하는 일이고 처리는 문자 발송 같은 실제 작업이다. 커밋을 처리보다 먼저 하고 장애가 나면 재시작 후 그 메시지를 건너뛰어 유실되고, 처리를 먼저 하고 장애가 나면 같은 메시지를 다시 처리해 중복된다">
<defs><marker id="d2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="label" x="10" y="14">① 커밋 → 처리 : at-most-once</text>
<rect class="box" x="10" y="28" width="70" height="36" rx="6"/><text x="45" y="46">읽기</text>
<path class="line" d="M80,46 L101,46" marker-end="url(#d2)"/>
<rect class="kafka" x="105" y="28" width="70" height="36" rx="6"/><text x="140" y="46">커밋</text>
<path class="line" d="M175,46 L196,46" marker-end="url(#d2)"/>
<rect class="bad blink" x="200" y="28" width="60" height="36" rx="6"/><text x="230" y="46">장애</text>
<path class="line dash" d="M260,46 L281,46" marker-end="url(#d2)"/>
<rect class="box dash" x="285" y="28" width="70" height="36" rx="6"/><text x="320" y="46">처리</text>
<text class="small" x="140" y="80">읽은 위치 저장</text>
<text class="small" x="320" y="80">문자 발송</text>
<text class="alert" x="300" y="102">이미 저장됨 → 건너뜀(유실)</text>
<text class="label" x="10" y="136">② 처리 → 커밋 : at-least-once</text>
<rect class="box" x="10" y="150" width="70" height="36" rx="6"/><text x="45" y="168">읽기</text>
<path class="line" d="M80,168 L101,168" marker-end="url(#d2)"/>
<rect class="kafka" x="105" y="150" width="70" height="36" rx="6"/><text x="140" y="168">처리</text>
<path class="line" d="M175,168 L196,168" marker-end="url(#d2)"/>
<rect class="bad blink" x="200" y="150" width="60" height="36" rx="6"/><text x="230" y="168">장애</text>
<path class="line dash" d="M260,168 L281,168" marker-end="url(#d2)"/>
<rect class="box dash" x="285" y="150" width="70" height="36" rx="6"/><text x="320" y="168">커밋</text>
<text class="small" x="140" y="202">문자 발송</text>
<text class="small" x="320" y="202">읽은 위치 저장</text>
<text class="alert" x="300" y="224">저장 안 됨 → 또 읽음(중복)</text>
</svg>
<p class="point">컨슈머가 일을 하기 전에 장부를 적으면 빠뜨릴 수 있고, 일을 한 뒤 적으면 두 번 할 수 있어요.</p>
<p class="explain">택배를 보내는 앱은 프로듀서, 물류센터에서 택배를 저장하는 서버는 브로커, 꺼내서 일하는 앱은 컨슈머예요. 컨슈머가 읽은 위치를 저장하는 일을 오프셋 커밋이라고 해요. 컨슈머가 커밋부터 하고 멈추면, 다시 시작할 때 아직 처리하지 않은 메시지도 건너뛰어요. 반대로 처리부터 하고 커밋 전에 멈추면, 같은 메시지를 다시 읽고 같은 일을 또 할 수 있어요.</p>
</section>

<details class="origin">
<summary>더 알아보기: 누가, 왜 만들었을까?</summary>
<p>카프카 <b>0.11 버전</b>에서 <b>KIP-98</b>이라는 제안서로 들어온 기능이에요. 제안서 제목이 "Exactly Once Delivery and Transactional Messaging", 곧 "정확히 한 번 전달과 트랜잭션 메시징"이에요.</p>
<p>재시도를 하면 같은 택배가 두 번 들어갈 수 있었어요. 그래서 맡길 때 번호표(PID는 보내는 쪽의 식별 번호, 시퀀스 번호는 메시지 순번)를 붙이고, 브로커가 이 번호를 기억해서 재시도로 생긴 중복을 알아보게 했어요.</p>
<p>그 뒤로 <b>KIP-447</b>이 이 기능을 더 널리 쓰게 다듬었고(2.5~3.0), <b>3.0</b>부터는 번호표 붙이기(멱등 프로듀서)가 기본으로 켜져요(KIP-679).</p>
</details>

<section class="slide">
<h3>택배에 거는 세 가지 약속</h3>
<table>
<thead><tr><th>약속</th><th>택배가 사라질까?</th><th>두 번 올까?</th></tr></thead>
<tbody>
<tr><td><b>최대 한 번</b> (at-most-once)</td><td>사라질 수 있어요</td><td>안 와요</td></tr>
<tr><td><b>최소 한 번</b> (at-least-once)</td><td>안 사라져요</td><td>올 수 있어요</td></tr>
<tr><td><b>정확히 한 번</b> (exactly-once)</td><td>안 사라져요</td><td>안 와요</td></tr>
</tbody>
</table>
<p class="point">잃어버리지 않으면 두 번 올 수 있고, 둘 다 막으려면 장치가 더 필요해요.</p>
<p class="explain">앞의 두 장면이 각각 이 표의 한 줄이에요. 장부에 먼저 적으면 택배가 사라질 수 있어서 최대 한 번이고, 배달한 뒤에 적으면 장애가 났을 때 같은 택배를 다시 배달해서 최소 한 번이에요. 결제처럼 잃어버리면 안 되는 일은 최소 한 번을 고르는 경우가 많고, 그러면 중복을 따로 막아야 해요. 둘 다 막은 약속이 정확히 한 번이에요.</p>
</section>

<section class="slide">
<h3>실제로는: 세 약속은 어디까지 지켜질까요? (Kafka 4.x)</h3>
<table>
<thead><tr><th>보장</th><th>유실</th><th>중복</th><th>컨슈머에서 만드는 법</th></tr></thead>
<tbody>
<tr><td>at-most-once</td><td>가능</td><td>없음</td><td>처리 전에 오프셋 커밋</td></tr>
<tr><td>at-least-once</td><td>없음</td><td>가능</td><td>처리 후에 오프셋 커밋</td></tr>
<tr><td>exactly-once</td><td>없음</td><td>없음</td><td>트랜잭션 + <code>read_committed</code></td></tr>
</tbody>
</table>
<p class="point">같은 약속이라도, 프로듀서가 보낼 때와 컨슈머가 처리할 때를 나눠서 봐요.</p>
<p class="explain">앞의 장부 순서는 컨슈머가 메시지를 처리하는 쪽의 약속이에요. 프로듀서가 브로커에 메시지를 맡기는 쪽에서는 재시도 중복을 따로 막아야 해요. 읽고 처리하고 다시 쓰는 일을 한 번으로 묶는 장치가 트랜잭션이고, 그 묶음이 끝난 메시지만 받는 컨슈머 설정이 <code>read_committed</code>예요. 뒤에서 송장 번호, 묶음 배송, 받는 쪽 설정을 차례로 볼 거예요.</p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">보내는 쪽: 같은 택배를 두 번 쌓지 않게</h2>

<section class="slide">
<h3>송장 번호로 중복 접수를 거절해요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="주문 서비스가 송장 A-1과 A-2를 맡기면 카프카가 저장하고, 영수증이 오지 않아 A-2를 다시 맡기면 이미 있는 송장이라 거절하는 그림">
<defs><marker id="a3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="box" x="10" y="28" width="60" height="160" rx="8"/><text x="40" y="108">주문</text>
<text x="310" y="12">카프카</text>
<text class="chip" x="148" y="36">송장 A-1 맡기기</text>
<path class="line" d="M70,48 L226,48" marker-end="url(#a3)"/>
<rect class="kafka" x="230" y="28" width="160" height="40" rx="8"/><text x="310" y="48">A-1 저장</text>
<text class="chip" x="148" y="92">송장 A-2 맡기기</text>
<path class="line" d="M70,104 L226,104" marker-end="url(#a3)"/>
<rect class="kafka" x="230" y="88" width="160" height="40" rx="8"/><text x="310" y="108">A-2 저장</text>
<path class="line dash" d="M226,118 L74,118" marker-end="url(#a3)"/>
<text class="alert" x="148" y="134">영수증 안 옴</text>
<text class="chip" x="148" y="156">A-2 다시 맡기기</text>
<path class="line" d="M70,168 L226,168" marker-end="url(#a3)"/>
<rect class="bad" x="230" y="148" width="160" height="40" rx="8"/><text x="310" y="168">중복이라 거절</text>
</svg>
<p class="point">같은 송장 번호는 두 번 받지 않아요.</p>
<p class="explain">주문 서비스는 택배마다 번호를 붙여서 맡겨요. 물류센터는 어떤 번호까지 받았는지 기억하고 있어서, 영수증을 못 받은 주문 서비스가 A-2를 다시 맡겨도 이미 받은 번호라고 알아봐요. 그래서 다시 쌓지 않으니까, 재시도를 마음 놓고 해도 같은 주문이 두 칸에 쌓이지 않아요.</p>
</section>

<section class="slide">
<h3>실제로는: 브로커가 PID와 시퀀스 번호를 확인해요</h3>
<svg class="dg" viewBox="0 0 400 240" role="img" aria-label="프로듀서가 PID 7과 시퀀스 0, 1을 보내 브로커가 기록하고, 시퀀스 1의 ack가 유실되어 프로듀서가 재시도하면 브로커가 이미 받은 번호라서 로그에 다시 쓰지 않는 시퀀스 그림">
<defs><marker id="d1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="box" x="10" y="8" width="80" height="32" rx="6"/><text class="chip" x="50" y="24">Producer</text>
<rect class="box" x="190" y="8" width="120" height="32" rx="6"/><text class="chip" x="250" y="24">브로커 · 파티션</text>
<path class="line dash" d="M50,40 L50,205"/>
<path class="line dash" d="M250,40 L250,205"/>
<text class="chip" x="150" y="52">PID 7 · seq 0</text>
<path class="line" d="M54,64 L246,64" marker-end="url(#d1)"/>
<rect class="kafka" x="262" y="52" width="128" height="26" rx="5"/><text class="chip" x="326" y="65">seq 0 기록</text>
<path class="line" d="M246,78 L54,78" marker-end="url(#d1)"/>
<text class="chip" x="150" y="104">PID 7 · seq 1</text>
<path class="line" d="M54,116 L246,116" marker-end="url(#d1)"/>
<rect class="kafka" x="262" y="104" width="128" height="26" rx="5"/><text class="chip" x="326" y="117">seq 1 기록</text>
<path class="line dash" d="M246,130 L150,130"/>
<text class="alert" x="112" y="130">ack 유실</text>
<text class="chip" x="150" y="166">PID 7 · seq 1 (재시도)</text>
<path class="line" d="M54,178 L246,178" marker-end="url(#d1)"/>
<rect class="bad" x="262" y="158" width="128" height="40" rx="5"/><text class="chip" x="326" y="171">seq 1 중복</text><text class="alert" x="326" y="188">다시 안 씀</text>
<text class="small" x="200" y="226">브로커가 PID·파티션별 번호를 추적해요</text>
</svg>
<p class="point">브로커는 이미 받은 송장 번호가 다시 오면, 저장을 반복하지 않고 성공했다고 알려 줘요.</p>
<p class="explain">프로듀서는 자기 식별 번호인 PID와 메시지 순번인 시퀀스 번호를 붙여서 보내요. 앞의 송장 번호처럼, 브로커는 프로듀서와 파티션별로 받은 번호를 기억해요. 프로듀서가 영수증에 해당하는 응답(ack)을 못 받아 다시 보내도, 브로커는 같은 번호를 알아보고 로그에 다시 쓰지 않아요. 이렇게 재시도로 생기는 중복을 막는 기능이 멱등 프로듀서예요.</p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">처리하는 쪽: 새 택배와 장부를 한 묶음으로</h2>

<section class="slide">
<h3>묶음 배송: 전부 도착 아니면 전부 취소</h3>
<svg class="dg" viewBox="0 0 400 215" role="img" aria-label="기사가 주문 4번 택배를 처리해서 새 택배를 올리는 일과 장부에 4번까지 적는 일을 한 묶음으로 묶고, 전부 성공하거나 전부 취소되는 그림">
<defs><marker id="a4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="kafka" x="10" y="85" width="80" height="50" rx="6"/><text x="50" y="110">주문 4번</text>
<path class="line" d="M90,110 L108,110" marker-end="url(#a4)"/>
<rect class="box" x="112" y="85" width="60" height="50" rx="8"/><text x="142" y="110">기사</text>
<path class="line" d="M172,110 L206,110" marker-end="url(#a4)"/>
<rect class="new" x="210" y="18" width="182" height="184" rx="10"/><text x="301" y="36">한 묶음</text>
<rect class="kafka" x="226" y="52" width="150" height="46" rx="8"/><text x="301" y="75">새 택배 올리기</text>
<rect class="kafka" x="226" y="108" width="150" height="46" rx="8"/><text x="301" y="131">장부에 4번 적기</text>
<text class="small" x="301" y="180">전부 성공 아니면 전부 취소</text>
</svg>
<p class="point">새 택배와 장부를 한 묶음으로 처리하면 둘 중 하나만 남지 않아요.</p>
<p class="explain">기사가 주문을 처리해서 새 택배를 올리고, 장부에 "여기까지 했어요"라고 적는 두 가지 일을 해요. 따로 하면 하나만 끝난 채 멈출 수 있어요. 새 택배만 올라가면 재시작 후 같은 주문을 또 처리하고, 장부만 적히면 그 주문의 결과가 사라져요. 두 일을 한 묶음으로 묶으면 둘 다 끝나거나 둘 다 없던 일이 돼요.</p>
</section>

<section class="slide">
<h3>실제로는: 처리 앱이 쓰기와 장부를 트랜잭션으로 묶어요</h3>
<svg class="dg" viewBox="0 0 400 285" role="img" aria-label="입력 토픽에서 읽은 처리 앱이 출력 토픽에 쓰기와 소비 오프셋 커밋을 하나의 트랜잭션으로 묶어 전부 커밋하거나 전부 중단하고, read_committed 컨슈머는 커밋된 것만 읽는 그림">
<defs><marker id="d3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="box" x="8" y="70" width="72" height="50" rx="6"/><text class="chip" x="44" y="95">입력 토픽</text>
<path class="line" d="M80,95 L98,95" marker-end="url(#d3)"/>
<rect class="kafka" x="100" y="70" width="80" height="50" rx="8"/><text x="140" y="95">처리 앱</text>
<path class="line" d="M180,95 L206,95" marker-end="url(#d3)"/>
<rect class="new" x="210" y="18" width="182" height="158" rx="10"/><text x="301" y="34">하나의 트랜잭션</text>
<rect class="box" x="226" y="48" width="150" height="38" rx="6"/><text x="301" y="67">출력 토픽에 쓰기</text>
<rect class="box" x="226" y="100" width="150" height="38" rx="6"/><text x="301" y="119">소비 오프셋 커밋</text>
<text class="small" x="301" y="160">전부 커밋 or 전부 중단</text>
<path class="line" d="M301,176 L301,206" marker-end="url(#d3)"/>
<rect class="box" x="210" y="210" width="182" height="40" rx="6"/><text class="chip" x="301" y="230">read_committed 컨슈머</text>
<text class="small" x="301" y="270">커밋된 것만 읽어요</text>
</svg>
<p class="point">처리 앱이 새 메시지 쓰기와 장부 기록을 묶으면, 둘 다 끝나거나 둘 다 취소돼요.</p>
<p class="explain">앞의 기사는 실제로 입력 토픽에서 읽고, 처리한 결과를 출력 토픽에 쓰는 앱이에요. 이 앱은 읽을 때는 컨슈머, 쓸 때는 프로듀서 역할을 해요. 앱이 출력 메시지와 입력 오프셋 커밋을 하나의 트랜잭션으로 묶으면, 브로커에는 둘 중 하나만 완료된 결과가 남지 않아요. 다음에는 출력 토픽을 읽는 컨슈머가 이 묶음을 어떻게 기다리는지 볼 거예요.</p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">읽는 쪽: 끝난 묶음만 받으려면</h2>

<section class="slide">
<h3>다 도착한 묶음만 보여요</h3>
<svg class="dg" viewBox="0 0 400 145" role="img" aria-label="배송 선반의 1번부터 3번은 도착이 끝났고 4번부터 6번은 묶음이 진행 중이어서, 읽는 기사에게는 3번까지만 보이는 그림">
<text class="small" x="200" y="12">배송 선반</text>
<rect class="kafka" x="20" y="28" width="50" height="40" rx="6"/><text x="45" y="48">1</text>
<rect class="kafka" x="80" y="28" width="50" height="40" rx="6"/><text x="105" y="48">2</text>
<rect class="kafka" x="140" y="28" width="50" height="40" rx="6"/><text x="165" y="48">3</text>
<rect class="new" x="200" y="28" width="50" height="40" rx="6"/><text x="225" y="48">4</text>
<rect class="new" x="260" y="28" width="50" height="40" rx="6"/><text x="285" y="48">5</text>
<rect class="new" x="320" y="28" width="50" height="40" rx="6"/><text x="345" y="48">6</text>
<text class="small" x="285" y="92">묶음 진행 중</text>
<polygon class="mark" points="195,78 187,90 203,90"/><text x="195" y="108">읽는 기사</text><text class="small" x="195" y="128">3번까지만 보여요</text>
</svg>
<p class="point">묶음이 끝나기 전의 택배는 읽는 쪽에서 가려요.</p>
<p class="explain">묶음이 진행되는 동안에도 새 택배는 이미 선반에 올라가 있어요. 읽는 기사가 이걸 바로 가져가면, 나중에 그 묶음이 취소됐을 때 없던 일이 된 택배를 처리한 셈이 돼요. 그래서 읽는 쪽에서 설정을 바꾸면, 끝까지 도착한 묶음의 택배만 보이고 진행 중인 것은 기다려요.</p>
</section>

<section class="slide">
<h3>실제로는: 컨슈머가 아직 끝나지 않은 묶음을 만나면</h3>
<svg class="dg" viewBox="0 0 400 246" role="img" aria-label="① 프로듀서가 트랜잭션으로 5, 6, 7을 쓴다. 아직 커밋 전이지만 파티션에는 이미 0부터 4 뒤에 5, 6, 7이 적혀 있다. ② 이때 컨슈머가 poll을 하면 5, 6, 7도 받을지 정해야 한다. ③ 프로듀서는 나중에 커밋하거나 중단한다">
<defs><marker id="d4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="box" x="10" y="8" width="100" height="36" rx="6"/><text x="60" y="26">프로듀서</text>
<rect class="box" x="150" y="8" width="100" height="36" rx="6"/><text x="200" y="26">파티션</text>
<rect class="box" x="290" y="8" width="100" height="36" rx="6"/><text x="340" y="26">컨슈머</text>
<path class="line dash" d="M60,44 L60,240"/>
<path class="line dash" d="M200,44 L200,96"/>
<path class="line dash" d="M340,44 L340,240"/>
<text class="small" x="128" y="62">① 트랜잭션으로 5·6·7 쓰기</text>
<path class="line" d="M60,76 L196,76" marker-end="url(#d4)"/>
<rect class="kafka" x="136" y="96" width="50" height="34" rx="5"/><text class="chip" x="161" y="113">0~4</text>
<rect class="new" x="190" y="96" width="74" height="34" rx="5"/><text class="chip" x="227" y="113">5·6·7</text>
<text class="small" x="227" y="144">커밋 전</text>
<text class="small" x="300" y="160">② poll()</text>
<path class="line" d="M340,174 L268,174" marker-end="url(#d4)"/>
<text x="290" y="198">5·6·7도 받을까?</text>
<text class="small" x="128" y="216">③ 나중에 커밋 또는 중단</text>
<path class="line" d="M60,230 L196,230" marker-end="url(#d4)"/>
</svg>
<p class="point">브로커에는 묶음이 끝나기 전에도 메시지가 있어서, 컨슈머는 그 메시지를 받을지 정해야 해요.</p>
<p class="explain">프로듀서가 트랜잭션으로 메시지를 보내면, 브로커는 먼저 파티션에 적어 둬요. 그 뒤 프로듀서가 묶음을 완료하거나 취소하기 전에 컨슈머가 메시지를 달라고 요청할 수 있어요. 이 요청이 <code>poll()</code>이고, 컨슈머 설정에 따라 끝나지 않은 묶음도 받을 수 있어요. 앞의 기사가 취소될지도 모르는 택배를 먼저 가져갈 수 있는 상황이에요.</p>
</section>

<section class="slide">
<h3>실제로는: 컨슈머의 isolation.level로 받는 범위를 정해요</h3>
<table>
<thead><tr><th>컨슈머 설정</th><th>② poll() 때 받는 것</th><th>③ 프로듀서가 중단하면</th></tr></thead>
<tbody>
<tr><td><code>read_uncommitted</code> (기본)</td><td>5·6·7을 바로 받음</td><td>5·6·7은 취소됐는데, 컨슈머는 이미 처리해 버림<br>(0~4는 영향 없음)</td></tr>
<tr><td><code>read_committed</code></td><td>0~4만 받고 5 앞에서 대기<br>(커밋되면 그때 5·6·7을 받음)</td><td>5·6·7은 건너뛰고 다음부터 받음</td></tr>
</tbody>
</table>
<p class="point">컨슈머를 read_committed로 설정하면, 아직 끝나지 않은 묶음은 기다리고 취소된 메시지는 받지 않아요.</p>
<p class="explain"><code>isolation.level</code>은 컨슈머가 아직 끝나지 않은 묶음도 받을지 정하는 설정이에요. 기본값인 <code>read_uncommitted</code>에서는 컨슈머가 먼저 처리한 메시지가 나중에 취소될 수 있어요. <code>read_committed</code>에서는 앞 그림의 5번 묶음이 끝날 때까지 기다리고, 프로듀서가 취소하면 컨슈머는 그 묶음을 건너뛰어요. 여기서 기다리는 경계인 LSO는 아직 끝나지 않은 트랜잭션의 시작 위치예요.</p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">정리: 이름과 설정을 확인해요</h2>

<section class="slide">
<h3>진짜 이름 붙이기</h3>
<table>
<thead><tr><th>물류센터 이야기</th><th>카프카 용어</th></tr></thead>
<tbody>
<tr><td>접수 영수증</td><td>acks</td></tr>
<tr><td>팀 장부 "어디까지 가져갔나"</td><td>오프셋 커밋</td></tr>
<tr><td>송장 번호로 중복 접수 거절</td><td>멱등 프로듀서 (Idempotent Producer)</td></tr>
<tr><td>묶음 배송: 전부 도착 아니면 전부 취소</td><td>트랜잭션 (Transaction)</td></tr>
<tr><td>다 도착한 묶음만 보기</td><td><code>read_committed</code></td></tr>
</tbody>
</table>
<p class="point">송장 번호는 멱등 프로듀서, 묶음 배송은 트랜잭션이라고 불러요.</p>
</section>

<section class="slide">
<h3>설정 확인: 보내는 쪽과 받는 쪽을 함께 봐요</h3>
<table>
<thead><tr><th>설정</th><th>기본값</th><th>의미</th></tr></thead>
<tbody>
<tr><td><code>enable.idempotence</code></td><td><code>true</code> (3.0+)</td><td>프로듀서가 다시 보내도 중복 저장을 막아요. 충돌하는 설정이 없을 때 기본으로 켜져요</td></tr>
<tr><td><code>acks</code></td><td><code>all</code> (3.0+)</td><td>중복 방지에 필요해요. 현재 ISR(복제를 따라잡은 서버들) 전체가 받았다는 응답을 기다려요</td></tr>
<tr><td><code>max.in.flight.requests.per.connection</code></td><td>5</td><td>중복 방지를 쓰려면 5 이하여야 해요</td></tr>
<tr><td><code>retries</code></td><td>2147483647</td><td>중복 방지를 쓰려면 0보다 커야 해요. 실제 한도는 <code>delivery.timeout.ms</code> (2분)이에요</td></tr>
<tr><td><code>transactional.id</code></td><td><code>null</code></td><td>프로듀서가 트랜잭션을 쓸 때 정하는 ID예요. 멱등성도 필요해요. 다시 시작해도 같은 ID로 복구하고, 이전 프로듀서가 더 쓰지 못하게 막아요(fencing)</td></tr>
<tr><td><code>isolation.level</code></td><td><code>read_uncommitted</code></td><td><code>read_committed</code>로 바꿔야 컨슈머가 취소된 묶음의 메시지를 건너뛰어요</td></tr>
<tr><td>Streams <code>processing.guarantee</code></td><td><code>at_least_once</code></td><td><code>exactly_once_v2</code>로 바꿔서 써요. 브로커 2.5 이상이 필요해요</td></tr>
</tbody>
</table>
<p class="point">프로듀서의 재시도 중복 방지는 기본으로 켜져도, 컨슈머가 완료된 묶음만 받도록 설정하는 일은 따로 해야 해요.</p>
<p class="explain">프로듀서의 <code>enable.idempotence</code>는 송장 번호로 재시도 중복을 막는 설정이에요. 처리 앱이 <code>transactional.id</code>로 묶음 배송을 쓰더라도, 읽는 컨슈머의 <code>isolation.level</code>을 함께 확인해야 해요. Kafka Streams는 읽고 처리하고 쓰는 앱을 만드는 도구이며, 이 도구로 만든 앱도 기본값을 그대로 쓰면 최소 한 번 보장이에요.</p>
</section>

<section class="slide">
<h3>버전 확인: 예전 글의 설정을 그대로 쓰면 안 돼요</h3>
<table>
<thead><tr><th>버전</th><th>바뀐 점</th><th>예전 글이 틀린 지점</th></tr></thead>
<tbody>
<tr><td>0.11</td><td>KIP-98: 멱등 프로듀서(PID·시퀀스)와 트랜잭션 도입</td><td>—</td></tr>
<tr><td>2.5</td><td>KIP-447: 트랜잭션 프로듀서 확장성을 위한 기반 변경</td><td>—</td></tr>
<tr><td>2.6</td><td>Streams에 <code>exactly_once_beta</code> 도입</td><td>—</td></tr>
<tr><td>3.0</td><td><code>exactly_once_v2</code> 도입, <code>exactly_once</code>·<code>exactly_once_beta</code>는 사용을 권하지 않게 됐어요(deprecated). 멱등성·<code>acks=all</code> 기본값 변경(KIP-679)</td><td>"멱등성을 직접 켜야 한다"는 3.0 이전 기준</td></tr>
<tr><td>3.0.0 · 3.1.0</td><td>명시적으로 true를 주지 않으면 멱등성 기본 활성화가 적용되지 않는 버그. 3.0.1 · 3.1.1 · 3.2.0에서 수정</td><td>이 두 버전에서는 기본으로 켜진다는 말이 틀림</td></tr>
<tr><td>4.0</td><td><code>exactly_once</code>·<code>exactly_once_beta</code> 제거. <code>at_least_once</code>와 <code>exactly_once_v2</code>만 허용</td><td>옛 값을 쓰라는 글은 4.0에서 동작하지 않음</td></tr>
</tbody>
</table>
<p class="point">예전 글에서 exactly_once를 쓰라고 하면, 그 글은 카프카 4.0 이전 기준이에요.</p>
<p class="explain">카프카는 버전이 바뀌면서 기본값과 허용하는 설정 이름도 바뀌었어요. 예를 들어 프로듀서의 중복 방지는 3.0부터 기본으로 켜지지만, 표에 적힌 두 버전에는 버그가 있었어요. Kafka Streams의 <code>exactly_once</code>라는 옛 설정값은 4.0에서 없어져서, 그 값을 그대로 쓰면 동작하지 않아요.</p>
</section>

<section class="slide">
<h3>이럴 땐 조심해요: 장치 하나만으로는 부족해요</h3>
<table>
<thead><tr><th>오해</th><th>실제</th></tr></thead>
<tbody>
<tr><td>멱등성을 켰으니 exactly-once다</td><td>프로듀서가 같은 실행 중에 다시 보내서 생긴 중복만 막아요. 전체 처리에는 새 메시지와 장부를 트랜잭션으로 함께 커밋하고, 컨슈머가 <code>read_committed</code>로 읽어야 해요</td></tr>
<tr><td>트랜잭션을 쓰면 DB 저장과 메일 발송도 한 번만 된다</td><td>외부 시스템까지의 보장에는 그 시스템의 협력이 필요해요</td></tr>
<tr><td><code>read_committed</code>가 기본값이다</td><td>기본은 <code>read_uncommitted</code>예요</td></tr>
<tr><td>Streams는 기본이 exactly-once다</td><td>기본은 <code>at_least_once</code>예요. <code>exactly_once_v2</code>를 직접 지정해야 해요</td></tr>
</tbody>
</table>
<p class="point">정확히 한 번 처리하려면 프로듀서, 처리 앱, 컨슈머의 장치가 함께 맞아야 해요.</p>
<p class="explain">프로듀서가 송장 번호로 재시도 중복을 막아도, 처리 앱의 장부 기록까지 한 묶음이 되는 것은 아니에요. 처리 앱이 트랜잭션을 쓰면, 읽는 컨슈머도 <code>read_committed</code>로 완료된 묶음만 받아야 해요. 문자 발송이나 외부 DB 저장은 카프카의 묶음 밖에서 일어나므로, 그 시스템도 중복을 막는 데 협력해야 해요.</p>
</section>

<section class="slide end">
<h3>한 줄 정리</h3>
<p class="point">택배를 두 번 처리하거나 빠뜨리지 않게,<br>보내는 쪽은 송장 번호를 붙이고, 처리 앱은 새 택배와 장부를 묶고, 받는 쪽은 끝난 묶음만 받아요.</p>
</section>
</div>

</div>
