---
layout: post
title: "상자를 뜯고 요리하면 남은 음식은 어디에 둘까? 밀키트로 이해하는 Docker 볼륨"
description: "컨테이너를 지우면 안의 데이터도 사라지는 문제를 밀키트 주방 비유로 설명하고 Docker의 쓰기 층·볼륨·바인드 마운트·tmpfs 마운트가 어떻게 다르고 언제 무엇을 쓰는지 실제 동작으로 이어서 설명합니다."
date: 2026-11-15 21:10:00 +0900
series: docker
episode: 2
summary: "컨테이너 안에 쓴 데이터는 컨테이너와 함께 지워져요. 남길 데이터는 Docker가 맡는 볼륨에 두고 내가 고칠 파일은 바인드 마운트로 연결해요."
youtube: 8XFdJ9sP7Es
---

<div class="lesson lesson-hierarchy storybook">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- i-pot=cooking-pot, i-fridge=refrigerator, i-trash=trash-2, i-memory=memory-stick. 아이콘 원본: https://cdn.jsdelivr.net/npm/lucide-static@1.25.0/icons/ (ISC). 라이선스: assets/icons/LICENSE-lucide.txt. i-bowl만 Lucide에 맞는 것이 없어 1편과 같이 직접 그렸어요. -->
<symbol id="i-pot" viewBox="0 0 24 24"><path d="M2 12h20M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8M4 8l16-4M8.86 6.78l-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"/></symbol>
<symbol id="i-fridge" viewBox="0 0 24 24"><path d="M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6ZM5 10h14M15 7v6"/></symbol>
<symbol id="i-bowl" viewBox="0 0 24 24"><path d="M3 12h18a9 9 0 0 1-18 0zM7 12c1-4 3-6 5-8 2 2 4 4 5 8"/></symbol>
<symbol id="i-trash" viewBox="0 0 24 24"><path d="M10 11v6M14 11v6M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></symbol>
<symbol id="i-tag" viewBox="0 0 24 24"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5"/></symbol>
<symbol id="i-house" viewBox="0 0 24 24"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></symbol>
<symbol id="i-memory" viewBox="0 0 24 24"><path d="M12 12v-2M12 18v-2M16 12v-2M16 18v-2M2 11h1.5M20 18v-2M20.5 11H22M4 18v-2M8 12v-2M8 18v-2"/><rect x="2" y="6" width="20" height="10" rx="2"/></symbol>
</defs>
</svg>

<div class="slide-group">
<h2 class="slide-group-title">문제: 조리대를 바꾸면 주문 기록이 사라져요</h2>

<section class="slide">
<h3>조리대를 치우면 남은 음식도 사라져요</h3>
<svg class="dg" viewBox="0 0 400 290" role="img" aria-label="요리를 마친 조리대를 통째로 치우고 새 조리대를 차리면 조리대 위에 두었던 남은 음식이 함께 버려져 새 조리대에는 남은 음식이 없다는 그림">
<defs><marker id="v1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M108,78 L164,78" marker-end="url(#v1)"/>
<path class="line" d="M236,78 L292,78" marker-end="url(#v1)"/>
<circle class="box" cx="65" cy="78" r="42"/><use class="ic" href="#i-pot" x="39" y="52" width="52" height="52"/>
<circle class="box" cx="200" cy="78" r="32"/><use class="ic" href="#i-trash" x="178" y="56" width="44" height="44"/>
<circle class="box" cx="335" cy="78" r="42"/><use class="ic" href="#i-pot" x="309" y="52" width="52" height="52"/>
<text class="big" x="65" y="144">조리대</text><text class="small" x="65" y="163">삭제 전</text>
<text class="big" x="200" y="144">삭제</text><text class="small" x="200" y="163">컨테이너 삭제</text>
<text class="big" x="335" y="144">새 조리대</text><text class="alert" x="335" y="163">빈 조리대</text>
<rect class="line" x="10" y="184" width="380" height="96" rx="12"/>
<text class="label center" x="200" y="204">조리대 위에 둔 남은 음식</text>
<circle class="kafka" cx="150" cy="234" r="19"/><use class="ic" href="#i-bowl" x="136" y="220" width="28" height="28"/>
<path class="line" d="M174,234 L222,234" marker-end="url(#v1)"/>
<circle class="line dash" cx="250" cy="234" r="19"/><path class="line" d="M237,247 L263,221"/>
<text class="chip" x="150" y="268">치우기 전</text><text class="chip" x="250" y="268">치운 뒤</text>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="0s" repeatCount="indefinite" path="M108,78 L164,78"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="0.6s" repeatCount="indefinite" path="M236,78 L292,78"/></circle>
</svg>
<ol class="steps">
<li>남은 음식(주문 기록)을 조리대(컨테이너)에만 뒀어요</li>
<li>조리대를 지우면 그 위의 주문 기록도 사라져요</li>
</ol>
<p class="more">참고: <a href="https://docs.docker.com/engine/storage/">Docker 저장소 개요</a></p>
</section>

<section class="slide">
<h3>조리대를 멈추면 주문 기록은 남아요</h3>
<svg class="dg" viewBox="0 0 400 204" role="img" aria-label="이미지 v1으로 만든 같은 컨테이너를 멈췄다 다시 시작하면 쓰기 층의 주문 100건이 남고 지운 뒤 같은 v1으로 다시 만들면 0건이에요. 주문 수는 예시예요.">
<rect class="line" x="7" y="8" width="191" height="188" rx="12"/>
<text class="label center" x="102.5" y="35">멈춤 뒤 재시작</text>
<circle class="new" cx="102.5" cy="88" r="32"/><use class="ic" href="#i-pot" x="80.5" y="66" width="44" height="44"/>
<text class="chip" x="102.5" y="149">같은 쓰기 층</text><text class="small" x="102.5" y="176">주문 100건 (예시)</text>
<rect class="line" x="202" y="8" width="191" height="188" rx="12"/>
<text class="label center" x="297.5" y="35">삭제 뒤 새로 생성</text>
<circle class="bad" cx="297.5" cy="88" r="32"/><use class="ic" href="#i-pot" x="275.5" y="66" width="44" height="44"/>
<text class="chip" x="297.5" y="149">새 쓰기 층</text><text class="small" x="297.5" y="176">주문 0건 (예시)</text>
</svg>
<ol class="steps">
<li>밀키트 상자(이미지)는 읽기 전용이에요</li>
<li>멈췄던 조리대를 다시 열면 주문 100건이 남아요 (예시)</li>
<li>새 조리대에는 새 기록 공간(쓰기 층)이 생겨요</li>
</ol>
<p class="more">참고: <a href="https://docs.docker.com/engine/storage/drivers/">쓰기 층</a></p>
</section>

<details class="origin">
<summary>더 알아보기: 누가 왜 만들었을까?</summary>
<p>Docker가 공개되고 두 달이 안 된 <b>2013년 5월 3일 0.2.2 버전</b>에 이미 데이터 볼륨(<code>docker run -v</code>)과 다른 컨테이너의 볼륨을 함께 쓰는 기능이 들어갔어요. 컨테이너 바깥에 데이터를 두는 장치는 그만큼 처음부터 필요했어요.</p>
<p>호스트 컴퓨터의 폴더를 연결하는 기능은 0.4.7(2013년 6월 28일)에 <code>-b</code> 옵션으로 들어왔다가 0.5.0(2013년 7월 17일)부터 지금처럼 <code>-v</code>로 쓰게 됐어요. 볼륨을 컨테이너와 따로 만들고 이름을 붙여 관리하는 <code>docker volume</code> 명령은 <b>Docker 1.9.0(2015년 11월 3일)</b>에 생겼어요.</p>
<p>볼륨(volume)은 원래 디스크 같은 저장 공간 한 덩어리를 부르는 말이에요. 마운트(mount)는 저장 공간을 폴더 하나에 붙여 쓰는 일이고 바인드(bind)는 영어로 묶는다는 뜻이에요.</p>
<p>참고: <a href="https://github.com/moby/moby/blob/v1.9.0/CHANGELOG.md">Docker 1.9.0까지의 변경 기록(CHANGELOG)</a></p>
</details>
</div>

<div class="slide-group">
<h2 class="slide-group-title">냉장고: 다음 조리대에 데이터를 건네요</h2>

<section class="slide">
<h3>남길 음식은 이름 붙인 냉장고 칸에 둬요</h3>
<svg class="dg" viewBox="0 0 400 180" role="img" aria-label="조리대 1에서 남은 음식을 카레라는 이름표를 붙인 냉장고 칸에 넣고 조리대 1을 치운 뒤 새 조리대가 같은 칸을 열어 음식을 꺼내 쓰는 그림">
<defs><marker id="v3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M108,80 L156,80" marker-end="url(#v3)"/>
<path class="line" d="M244,80 L292,80" marker-end="url(#v3)"/>
<circle class="box" cx="65" cy="80" r="42"/><use class="ic" href="#i-pot" x="39" y="54" width="52" height="52"/>
<circle class="new" cx="200" cy="80" r="42"/><use class="ic" href="#i-fridge" x="174" y="54" width="52" height="52"/>
<circle class="box" cx="246" cy="36" r="17"/><use class="ic" href="#i-tag" x="235" y="25" width="22" height="22"/>
<circle class="box" cx="335" cy="80" r="42"/><use class="ic" href="#i-pot" x="309" y="54" width="52" height="52"/>
<text class="big" x="65" y="146">조리대 1</text><text class="small" x="65" y="165">이전 앱</text>
<text class="big" x="200" y="146">냉장고 칸</text><text class="small" x="200" y="165">이름표: 카레</text>
<text class="big" x="335" y="146">새 조리대</text><text class="small" x="335" y="165">새 앱</text>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="0s" repeatCount="indefinite" path="M108,80 L156,80"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="0.7s" repeatCount="indefinite" path="M244,80 L292,80"/></circle>
</svg>
<ol class="steps">
<li>주방이 맡은 냉장고 칸(볼륨)에 카레를 넣어요</li>
<li>새 앱 이미지로 조리대를 바꿔도 같은 칸을 열어요</li>
</ol>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>앱이 쓰는 폴더에 볼륨을 연결해요</h3>
<svg class="dg" viewBox="0 0 400 240" role="img" aria-label="호스트 안에서 지운 컨테이너 v1과 새로 실행한 컨테이너 v2가 각 컨테이너의 /data 폴더에 같은 볼륨 db-data를 연결하고 볼륨은 Docker가 관리해서 컨테이너를 지워도 남는다는 그림">
<defs><marker id="v4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="10" y="10" width="380" height="220" rx="12"/>
<text class="label center" x="200" y="30">Docker를 실행하는 컴퓨터(호스트)</text>
<circle class="box" cx="88" cy="75" r="29"/><use class="ic" href="#i-pot" x="68" y="55" width="40" height="40"/>
<circle class="box" cx="312" cy="75" r="29"/><use class="ic" href="#i-pot" x="292" y="55" width="40" height="40"/>
<text class="small" x="88" y="111">① 이전 조리대 삭제</text><text class="small" x="312" y="111">② 새 조리대 실행</text>
<text class="chip" x="88" y="132">/data</text><text class="chip" x="312" y="132">/data</text>
<path class="line dash" d="M88,143 L162,164"/><path class="line" d="M312,143 L235,164" marker-end="url(#v4)"/>
<circle class="new" cx="200" cy="171" r="29"/><use class="ic" href="#i-fridge" x="180" y="151" width="40" height="40"/>
<text class="chip" x="200" y="221">db-data</text>
</svg>
<ol class="steps">
<li><code>-v db-data:/data</code>에서 콜론 앞은 볼륨 이름이에요</li>
<li>콜론 뒤에는 앱 안에서 장부를 쓰는 폴더를 적어요</li>
<li>연결(마운트)하면 앱이 거기 쓸 때마다 볼륨에 남아요</li>
</ol>
<p class="more">참고: <a href="https://docs.docker.com/engine/storage/volumes/">볼륨 연결</a></p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 볼륨 이름을 잘못 쓰면 어떻게 되나요?</summary>
<p>A. 없는 이름이면 Docker가 다른 볼륨을 새로 만들어 연결해서 예전 데이터가 없는 것처럼 보여요. 연결할 폴더에 이미지의 초기 파일이 있으면 새 볼륨으로 복사될 수 있어요. 기존 볼륨 이름을 확인해 다시 연결해요.</p>
</details>
<details class="author-question">
<summary>초보 독자 Q. 볼륨은 내 컴퓨터 어디에 있나요?</summary>
<p>A. Docker가 관리하는 저장 영역에 있어요. <code>docker volume inspect db-data</code>의 저장 경로(Mountpoint)로 위치를 확인해요. Mac·Windows의 Docker Desktop에서 리눅스 컨테이너를 쓰면 리눅스 가상 머신 안에 있어요.</p>
</details>
</aside>
</div>
</div>

<div class="slide-group">
<h2 class="slide-group-title">집 서랍: 내가 고른 폴더를 함께 열어요</h2>

<section class="slide">
<h3>내가 고칠 레시피는 집 서랍에 둬요</h3>
<svg class="dg" viewBox="0 0 400 180" role="img" aria-label="우리 집 서랍과 조리대가 양쪽으로 이어져 집에서 고친 레시피가 조리대에서 바로 보이고 조리대에서 버린 것은 집 서랍에서도 사라진다는 그림">
<defs><marker id="v5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M108,64 L292,64" marker-end="url(#v5)"/>
<path class="line" d="M292,96 L108,96" marker-end="url(#v5)"/>
<circle class="box" cx="65" cy="80" r="42"/><use class="ic" href="#i-house" x="39" y="54" width="52" height="52"/>
<circle class="box" cx="335" cy="80" r="42"/><use class="ic" href="#i-pot" x="309" y="54" width="52" height="52"/>
<text class="small" x="200" y="48">고친 레시피가 바로 보여요</text>
<text class="alert" x="200" y="113">버리면 서랍에서도 사라져요</text>
<text class="big" x="65" y="146">우리 집 서랍</text><text class="small" x="65" y="165">호스트 폴더</text>
<text class="big" x="335" y="146">조리대</text><text class="small" x="335" y="165">앱 폴더</text>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="0s" repeatCount="indefinite" path="M108,64 L292,64"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="0.8s" repeatCount="indefinite" path="M292,96 L108,96"/></circle>
</svg>
<ol class="steps">
<li>집 서랍 연결(바인드 마운트)로 같은 파일을 열어요</li>
<li>기본으로 앱도 서랍의 파일을 고치거나 지울 수 있어요</li>
</ol>
</section>

<section class="slide">
<h3>내 폴더를 연결하면 고친 파일이 바로 보여요</h3>
<svg class="dg" viewBox="0 0 400 204" role="img" aria-label="호스트의 my-app/src와 조리대의 /app/src가 같은 레시피 파일을 보여 줘서 편집 후 이미지 재빌드 없이 파일 내용이 바뀌어요.">
<rect class="line" x="7" y="8" width="191" height="188" rx="12"/>
<text class="label center" x="102.5" y="35">내 편집기</text>
<circle class="box" cx="102.5" cy="88" r="32"/><use class="ic" href="#i-house" x="80.5" y="66" width="44" height="44"/>
<text class="chip" x="102.5" y="149">my-app/src</text><text class="small" x="102.5" y="176">고친 레시피</text>
<rect class="line" x="202" y="8" width="191" height="188" rx="12"/>
<text class="label center" x="297.5" y="35">조리대 안</text>
<circle class="new" cx="297.5" cy="88" r="32"/><use class="ic" href="#i-pot" x="275.5" y="66" width="44" height="44"/>
<text class="chip" x="297.5" y="149">/app/src</text><text class="small" x="297.5" y="176">같은 레시피</text>
</svg>
<ol class="steps">
<li><code>-v</code> 왼쪽에 내 폴더 경로를 쓰면 그 폴더가 열려요</li>
<li>코드나 설정 파일을 고쳐도 이미지를 다시 만들 필요가 없어요</li>
<li>앱에 읽기만 허용하려면 경로 끝에 <code>:ro</code>를 붙여요</li>
</ol>
<p class="more">참고: <a href="https://docs.docker.com/engine/storage/bind-mounts/">바인드 마운트</a></p>
</section>

<section class="slide">
<h3>빈 볼륨과 빈 서랍은 처음 열 때 달라요</h3>
<svg class="dg" viewBox="0 0 400 205" role="img" aria-label="같은 이미지 폴더에 처음 연결하면 빈 볼륨에는 원본이 복사되고 빈 집 서랍에서는 원래 파일이 가려져요.">
<rect class="line" x="7" y="8" width="191" height="188" rx="12"/>
<text class="label center" x="102.5" y="34">빈 볼륨</text>
<use class="ic" href="#i-bowl" x="82" y="44" width="41" height="41"/>
<text class="small" x="102" y="99">원래 파일</text>
<circle class="new" cx="102" cy="135" r="24"/><use class="ic" href="#i-bowl" x="86" y="119" width="32" height="32"/>
<text class="chip" x="102" y="182">볼륨에 생긴 사본</text>
<rect class="line" x="202" y="8" width="191" height="188" rx="12"/>
<text class="label center" x="297" y="34">빈 집 서랍</text>
<use class="ic" href="#i-bowl" x="277" y="44" width="41" height="41"/>
<text class="small" x="297" y="99">원래 파일</text>
<rect class="box" x="271" y="115" width="52" height="40" rx="6"/>
<text class="chip" x="297" y="182">원래 파일은 안 보여요</text>
</svg>
<ol class="steps">
<li>빈 볼륨에는 연결할 폴더의 기존 파일을 기본으로 복사해요</li>
<li>파일이 든 볼륨과 집 서랍은 앱의 기존 파일을 가려요</li>
<li>연결 없이 새로 띄우면 이미지에 든 파일이 보여요</li>
</ol>
<p class="more">참고: <a href="https://docs.docker.com/engine/storage/volumes/#mounting-a-volume-over-existing-data">빈 볼륨의 초기 복사</a> · <a href="https://docs.docker.com/engine/storage/bind-mounts/#bind-mounting-over-existing-data">연결 중 가려지는 파일</a></p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">선택: 남길 파일과 버릴 파일을 나눠요</h2>

<section class="slide">
<h3>언제까지 남길지 보고 저장할 곳을 골라요</h3>
<svg class="dg" viewBox="0 0 400 205" role="img" aria-label="볼륨과 바인드 마운트는 컨테이너를 지워도 파일이 남고 tmpfs는 멈추면 비워져요.">
<rect class="line" x="7" y="8" width="126" height="188" rx="12"/>
<text class="label center" x="70" y="34">볼륨</text>
<circle class="new" cx="70" cy="91" r="34"/><use class="ic" href="#i-fridge" x="47" y="68" width="46" height="46"/>
<text class="chip" x="70" y="149">주문 기록</text><text class="small" x="70" y="175">조리대 삭제 후 남음</text>
<rect class="line" x="137" y="8" width="126" height="188" rx="12"/>
<text class="label center" x="200" y="34">집 서랍</text>
<circle class="box" cx="200" cy="91" r="34"/><use class="ic" href="#i-house" x="177" y="68" width="46" height="46"/>
<text class="chip" x="200" y="149">개발 코드</text><text class="small" x="200" y="175">조리대 삭제 후 남음</text>
<rect class="line" x="267" y="8" width="126" height="188" rx="12"/>
<text class="label center" x="330" y="34">임시 공간</text>
<circle class="bad" cx="330" cy="91" r="34"/><use class="ic" href="#i-memory" x="307" y="68" width="46" height="46"/>
<text class="chip" x="330" y="149">임시 계산 파일</text><text class="small" x="330" y="175">멈추면 비움</text>
</svg>
<ol class="steps">
<li>다음 조리대에서도 쓸 주문 장부는 볼륨에 둬요</li>
<li>편집기로 고칠 코드는 직접 고른 폴더에 둬요</li>
<li>리눅스의 메모리 공간(tmpfs)은 멈추면 비워져요</li>
</ol>
<p class="more">참고: <a href="https://docs.docker.com/engine/storage/tmpfs/">임시 메모리 공간</a></p>
</section>

<section class="slide">
<h3>자동 삭제해도 이름 붙인 칸은 남아요</h3>
<svg class="dg" viewBox="0 0 400 205" role="img" aria-label="자동 삭제 옵션으로 컨테이너를 지울 때 이름 있는 볼륨은 남고 익명 볼륨은 함께 지워져요.">
<rect class="line" x="7" y="8" width="191" height="188" rx="12"/>
<text class="label center" x="102.5" y="34">이름 있는 볼륨</text>
<circle class="new" cx="102.5" cy="91" r="34"/><use class="ic" href="#i-fridge" x="79.5" y="68" width="46" height="46"/>
<text class="chip" x="102.5" y="149">db-data:/data</text><text class="small" x="102.5" y="175">자동 삭제 뒤 보관</text>
<rect class="line" x="202" y="8" width="191" height="188" rx="12"/>
<text class="label center" x="297.5" y="34">자동 이름(익명 볼륨)</text>
<circle class="bad" cx="297.5" cy="91" r="34"/><use class="ic" href="#i-fridge" x="274.5" y="68" width="46" height="46"/>
<text class="chip" x="297.5" y="149">/data</text><text class="small" x="297.5" y="175">자동 삭제 때 제거</text>
</svg>
<ol class="steps">
<li><code>-v /data</code>처럼 이름을 생략하면 Docker가 임의 이름을 붙여요</li>
<li><code>--rm</code>이면 종료 때 Docker가 조리대와 익명 칸을 지워요</li>
<li>이름 붙인 볼륨도 앱이 안의 파일을 지우면 파일은 사라져요</li>
</ol>
</section>

<section class="slide">
<h3>정리 옵션에 따라 지워지는 칸이 달라요</h3>
<svg class="dg" viewBox="0 0 400 204" role="img" aria-label="어떤 컨테이너에도 연결되지 않은 볼륨 가운데 기본 정리는 익명 볼륨만 지우고 --all을 붙이면 이름 있는 볼륨까지 지워요.">
<rect class="line" x="7" y="8" width="191" height="188" rx="12"/>
<text class="label center" x="102.5" y="35">기본 정리</text>
<circle class="box" cx="102.5" cy="88" r="32"/><use class="ic" href="#i-trash" x="80.5" y="66" width="44" height="44"/>
<text class="chip" x="102.5" y="149">미사용 익명 볼륨</text><text class="small" x="102.5" y="176">Docker 엔진 23.0</text>
<rect class="line" x="202" y="8" width="191" height="188" rx="12"/>
<text class="label center" x="297.5" y="35">--all (-a)</text>
<circle class="bad" cx="297.5" cy="88" r="32"/><use class="ic" href="#i-trash" x="275.5" y="66" width="44" height="44"/>
<text class="chip" x="297.5" y="149">미사용 이름 있는 칸도</text><text class="small" x="297.5" y="176">명령 도구 23.0.5부터</text>
</svg>
<ol class="steps">
<li>멈춘 조리대라도 연결된 칸은 정리에서 빠져요</li>
<li><code>docker volume prune</code>은 연결이 끊긴 칸을 정리해요</li>
<li><code>--all</code>은 연결이 끊긴 이름 있는 칸도 지워요</li>
</ol>
<p class="more">참고: <a href="https://docs.docker.com/reference/cli/docker/volume/prune/">볼륨 정리(엔진 통신 규칙 API 1.42 이상)</a> · <a href="https://docs.docker.com/engine/release-notes/23.0/">Engine 23.0 변경 기록</a></p>
</section>

<section class="slide">
<h3>볼륨을 지우기 전에 장부를 따로 복사해요</h3>
<svg class="dg" viewBox="0 0 400 182" role="img" aria-label="주방 냉장고의 장부를 다른 저장소에 복사하면 원래 칸이 지워져도 사본은 남아요.">
<defs><marker id="v11" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<circle class="box" cx="86" cy="81" r="40"/><use class="ic" href="#i-fridge" x="60" y="55" width="52" height="52"/>
<path class="line" d="M133,81 L262,81" marker-end="url(#v11)"/><text class="chip" x="198" y="65">장부 복사</text>
<circle class="new" cx="316" cy="81" r="40"/><use class="ic" href="#i-house" x="290" y="55" width="52" height="52"/>
<text class="big" x="86" y="153">원래 칸</text><text class="big" x="316" y="153">다른 저장소</text>
</svg>
<ol class="steps">
<li>볼륨 자체를 지우면 그 안의 주문 장부도 사라져요</li>
<li>다른 곳에 둔 사본(백업)이 있으면 다시 꺼낼 수 있어요</li>
</ol>
<p class="more">참고: <a href="https://docs.docker.com/engine/storage/volumes/#back-up-restore-or-migrate-data-volumes">볼륨 백업과 복원</a></p>
</section>

</div>

</div>
