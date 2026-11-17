---
layout: post
title: "상자를 뜯고 요리하면 남은 음식은 어디에 둘까? 밀키트로 이해하는 Docker 볼륨"
description: "컨테이너를 지우면 안의 데이터도 사라지는 문제를 밀키트 주방 비유로 설명하고 Docker의 쓰기 층·볼륨·바인드 마운트·tmpfs 마운트가 어떻게 다르고 언제 무엇을 쓰는지 실제 동작으로 이어서 설명합니다."
date: 2026-11-15 21:10:00 +0900
series: docker
episode: 2
summary: "컨테이너 안에 쓴 데이터는 컨테이너와 함께 지워져요. 남길 데이터는 Docker가 맡는 볼륨에 두고 내가 고칠 파일은 바인드 마운트로 연결해요."
---

<div class="lesson lesson-hierarchy">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: Lucide (lucide-static v1.25.0, ISC). 라이선스: assets/icons/LICENSE-lucide.txt. i-bowl만 Lucide에 맞는 것이 없어 1편과 같이 직접 그렸어요. -->
<symbol id="i-pot" viewBox="0 0 24 24"><path d="M2 12h20M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8M4 8l16-4M8.86 6.78l-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"/></symbol>
<symbol id="i-fridge" viewBox="0 0 24 24"><path d="M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6ZM5 10h14M15 7v6"/></symbol>
<symbol id="i-bowl" viewBox="0 0 24 24"><path d="M3 12h18a9 9 0 0 1-18 0zM7 12c1-4 3-6 5-8 2 2 4 4 5 8"/></symbol>
<symbol id="i-trash" viewBox="0 0 24 24"><path d="M10 11v6M14 11v6M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></symbol>
<symbol id="i-tag" viewBox="0 0 24 24"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5"/></symbol>
<symbol id="i-house" viewBox="0 0 24 24"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></symbol>
<symbol id="i-memory" viewBox="0 0 24 24"><path d="M12 12v-2M12 18v-2M16 12v-2M16 18v-2M2 11h1.5M20 18v-2M20.5 11H22M4 18v-2M8 12v-2M8 18v-2"/><rect x="2" y="6" width="20" height="10" rx="2"/></symbol>
</defs>
</svg>

<div class="intro">
<p class="q">컨테이너를 지우면 그 안에 쌓인 데이터는 어디로 갈까요?</p>
<p>Docker 시리즈의 두 번째 편이에요. 1편에서 컨테이너는 밀키트 상자를 뜯어 요리하는 조리대이고 조리대를 치우면 흔적도 같이 사라진다고 했어요. 그런데 데이터베이스(DB, 주문 기록 같은 데이터를 모아 두는 프로그램)처럼 데이터를 계속 쌓는 앱을 컨테이너로 돌리다가 새 버전으로 바꾸려고 컨테이너를 지우면 그동안 쌓은 데이터도 함께 사라져요.</p>
<p>이 글을 다 읽으면 데이터를 컨테이너 바깥에 두는 두 방법인 <b>볼륨</b>과 <b>바인드 마운트</b>가 무엇이고 어떻게 다른지 알 수 있어요. 메모리에만 잠깐 두는 <b>tmpfs 마운트</b>까지 셋 중에서 언제 무엇을 고르는지와 볼륨을 쓸 때 조심할 점도 함께 봐요.</p>
</div>

<div class="slide-group">
<h2 class="slide-group-title">무엇이 문제인가: 조리대와 함께 버려지는 음식</h2>

<section class="slide">
<h3>조리대를 치우면 위에 둔 음식도 버려져요</h3>
<svg class="dg" viewBox="0 0 400 290" role="img" aria-label="요리를 마친 조리대를 통째로 치우고 새 조리대를 차리면 조리대 위에 두었던 남은 음식이 함께 버려져 새 조리대에는 남은 음식이 없다는 그림">
<defs><marker id="v1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M108,78 L164,78" marker-end="url(#v1)"/>
<path class="line" d="M236,78 L292,78" marker-end="url(#v1)"/>
<circle class="box" cx="65" cy="78" r="42"/><use class="ic" href="#i-pot" x="39" y="52" width="52" height="52"/>
<circle class="box" cx="200" cy="78" r="32"/><use class="ic" href="#i-trash" x="178" y="56" width="44" height="44"/>
<circle class="box" cx="335" cy="78" r="42"/><use class="ic" href="#i-pot" x="309" y="52" width="52" height="52"/>
<text class="big" x="65" y="144">조리대</text><text class="small" x="65" y="163">요리를 마쳤어요</text>
<text class="big" x="200" y="144">다 치우기</text><text class="small" x="200" y="163">위에 둔 것까지</text>
<text class="big" x="335" y="144">새 조리대</text><text class="alert" x="335" y="163">남은 음식이 없어요</text>
<rect class="line" x="10" y="184" width="380" height="96" rx="12"/>
<text class="label center" x="200" y="204">조리대 위에 둔 남은 음식</text>
<circle class="kafka" cx="150" cy="234" r="19"/><use class="ic" href="#i-bowl" x="136" y="220" width="28" height="28"/>
<path class="line" d="M174,234 L222,234" marker-end="url(#v1)"/>
<circle class="line dash" cx="250" cy="234" r="19"/><path class="line" d="M237,247 L263,221"/>
<text class="chip" x="150" y="268">치우기 전</text><text class="chip" x="250" y="268">치운 뒤</text>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="0s" repeatCount="indefinite" path="M108,78 L164,78"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="0.6s" repeatCount="indefinite" path="M236,78 L292,78"/></circle>
</svg>
<p class="point">조리대 위에 둔 음식은 조리대를 치울 때 함께 버려져요.</p>
<p class="explain">손님이 밀키트를 뜯어 요리하고 남은 음식을 조리대 위에 그냥 두었어요. 다음 날 새 밀키트로 다시 차리려고 조리대를 통째로 치우면 그 위의 남은 음식도 같이 버려져요. 이 글에서 조리대를 치운다는 것은 잠시 멈추는 일이 아니라 컨테이너를 지우는 일이에요.</p>
</section>

<section class="slide">
<h3>실제로는: 컨테이너를 지우면 쓰기 층도 지워져요</h3>
<svg class="dg" viewBox="0 0 400 170" role="img" aria-label="지우기 전 컨테이너는 읽기 전용 이미지 층 v1 위의 쓰기 층에 주문 기록 100건이 있지만 지우고 새로 만든 컨테이너는 이미지 층 v2 위의 쓰기 층이 비어 있다는 그림">
<defs><marker id="v2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="label" x="10" y="14">지우기 전 컨테이너</text>
<text class="label" x="230" y="14">새로 만든 컨테이너</text>
<rect class="bad blink" x="10" y="30" width="160" height="44" rx="6"/><text class="chip" x="90" y="45">쓰기 층</text><text class="small" x="90" y="63">주문 기록 100건</text>
<rect class="kafka" x="10" y="82" width="160" height="44" rx="6"/><text class="chip" x="90" y="97">이미지 층 v1</text><text class="small" x="90" y="115">읽기 전용</text>
<path class="line" d="M174,78 L224,78" marker-end="url(#v2)"/>
<text class="small" x="199" y="64">교체</text>
<rect class="line dash" x="230" y="30" width="160" height="44" rx="6"/><text class="chip" x="310" y="45">쓰기 층</text><text class="small" x="310" y="63">비어 있어요</text>
<rect class="kafka" x="230" y="82" width="160" height="44" rx="6"/><text class="chip" x="310" y="97">이미지 층 v2</text><text class="small" x="310" y="115">읽기 전용</text>
<text class="alert" x="200" y="152">컨테이너를 지우면 쓰기 층도 함께 지워져요</text>
</svg>
<p class="point">컨테이너 안에 쓴 데이터는 컨테이너를 지울 때 쓰기 층과 함께 사라져요.</p>
<p class="explain">Docker는 읽기 전용 이미지 위에 컨테이너마다 전용 쓰기 층을 얹고 앱이 그 안에 만든 파일을 여기에 저장해요. 멈춤은 실행만 끝내므로 이 공간이 남지만 컨테이너를 삭제하면 함께 사라져요. 이미지는 고칠 수 없는 상자라서 새 버전으로 바꿀 때는 새 이미지로 새 컨테이너를 만드는 방식을 써요. 그림의 v1과 v2는 Docker 버전이 아니라 앱 이미지의 이전 버전과 새 버전이에요.</p>
</section>

<details class="origin">
<summary>더 알아보기: 볼륨은 언제부터 있었을까?</summary>
<p>Docker가 공개되고 두 달이 안 된 <b>2013년 5월 3일 0.2.2 버전</b>에 이미 데이터 볼륨(<code>docker run -v</code>)과 다른 컨테이너의 볼륨을 함께 쓰는 기능이 들어갔어요. 컨테이너 바깥에 데이터를 두는 장치는 그만큼 처음부터 필요했어요.</p>
<p>호스트 컴퓨터의 폴더를 연결하는 기능은 0.4.7(2013년 6월 28일)에 <code>-b</code> 옵션으로 들어왔다가 0.5.0(2013년 7월 17일)부터 지금처럼 <code>-v</code>로 쓰게 됐어요. 볼륨을 컨테이너와 따로 만들고 이름을 붙여 관리하는 <code>docker volume</code> 명령은 <b>Docker 1.9.0(2015년 11월 3일)</b>에 생겼어요.</p>
<p>볼륨(volume)은 원래 디스크 같은 저장 공간 한 덩어리를 부르는 말이에요. 마운트(mount)는 저장 공간을 폴더 하나에 붙여 쓰는 일이고 바인드(bind)는 영어로 묶는다는 뜻이에요.</p>
<p>참고: <a href="https://github.com/moby/moby/blob/v1.9.0/CHANGELOG.md">Docker 1.9.0까지의 변경 기록(CHANGELOG)</a></p>
</details>
</div>

<div class="slide-group">
<h2 class="slide-group-title">볼륨: 주방이 맡아 주는 냉장고 칸</h2>

<section class="slide">
<h3>남길 음식은 이름표 붙인 냉장고 칸에 넣어요</h3>
<svg class="dg" viewBox="0 0 400 180" role="img" aria-label="조리대 1에서 남은 음식을 카레라는 이름표를 붙인 냉장고 칸에 넣고 조리대 1을 치운 뒤 새 조리대가 같은 칸을 열어 음식을 꺼내 쓰는 그림">
<defs><marker id="v3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M108,80 L156,80" marker-end="url(#v3)"/>
<path class="line" d="M244,80 L292,80" marker-end="url(#v3)"/>
<circle class="box" cx="65" cy="80" r="42"/><use class="ic" href="#i-pot" x="39" y="54" width="52" height="52"/>
<circle class="new" cx="200" cy="80" r="42"/><use class="ic" href="#i-fridge" x="174" y="54" width="52" height="52"/>
<circle class="box" cx="246" cy="36" r="17"/><use class="ic" href="#i-tag" x="235" y="25" width="22" height="22"/>
<circle class="box" cx="335" cy="80" r="42"/><use class="ic" href="#i-pot" x="309" y="54" width="52" height="52"/>
<text class="big" x="65" y="146">조리대 1</text><text class="small" x="65" y="165">치워도 돼요</text>
<text class="big" x="200" y="146">냉장고 칸</text><text class="small" x="200" y="165">이름표: 카레</text>
<text class="big" x="335" y="146">새 조리대</text><text class="small" x="335" y="165">같은 칸을 열어요</text>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="0s" repeatCount="indefinite" path="M108,80 L156,80"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="0.7s" repeatCount="indefinite" path="M244,80 L292,80"/></circle>
</svg>
<p class="point">남길 음식을 주방이 관리하는 냉장고 칸에 넣으면 조리대를 치워도 남아요.</p>
<p class="explain">손님은 요리하면서 남길 음식을 이름표 붙인 냉장고 칸에 바로 넣어요. 조리대를 치우고 새 밀키트로 다시 차려도 같은 이름의 칸을 열면 어제 음식이 그대로 있어요. 냉장고는 주방(Docker가 돌아가는 컴퓨터)이 맡아 관리해서 손님은 냉장고가 주방 어디에 있는지 몰라도 돼요.</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>실제로는: 볼륨은 Docker가 관리하는 바깥 저장 공간이에요</h3>
<svg class="dg" viewBox="0 0 400 240" role="img" aria-label="호스트 안에서 지운 컨테이너 v1과 새로 실행한 컨테이너 v2가 각 컨테이너의 /data 폴더에 같은 볼륨 db-data를 연결하고 볼륨은 Docker가 관리해서 컨테이너를 지워도 남는다는 그림">
<defs><marker id="v4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="10" y="10" width="380" height="220" rx="12"/>
<text class="label center" x="200" y="30">호스트 (Docker를 실행하는 컴퓨터)</text>
<rect class="line dash" x="30" y="50" width="140" height="56" rx="6"/><text class="chip" x="100" y="70">컨테이너 v1</text><text class="alert" x="100" y="90">지웠어요</text>
<rect class="box" x="230" y="50" width="140" height="56" rx="6"/><text class="chip" x="300" y="70">컨테이너 v2</text><text class="small" x="300" y="90">새로 실행했어요</text>
<path class="line dash" d="M100,106 L168,160"/>
<path class="line" d="M300,106 L234,158" marker-end="url(#v4)"/>
<text class="small" x="200" y="128">컨테이너의 /data에 연결</text>
<rect class="new" x="120" y="162" width="160" height="52" rx="6"/><text class="chip" x="200" y="180">볼륨: db-data</text><text class="small" x="200" y="199">Docker가 관리해요</text>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0s" repeatCount="indefinite" path="M300,106 L234,158"/></circle>
</svg>
<p class="point">볼륨은 Docker가 만들고 관리하는 저장 공간이라 컨테이너를 지워도 남아요.</p>
<p class="explain">볼륨은 Docker가 호스트(Docker를 돌리는 컴퓨터)의 폴더에 보관하고 관리하는 공간이라 사용자가 그 폴더를 직접 건드리지 않아요. <code>docker run -v db-data:/data 이미지이름</code>에서 콜론 앞 db-data는 냉장고 칸의 카레 이름표처럼 볼륨 이름이고 뒤의 /data는 컨테이너 안 폴더예요. 이 연결이 마운트이며 앱이 /data에 쓰면 자동으로 볼륨에 저장되므로 사람이 파일을 따로 옮기지 않아요. /data는 이 예의 앱이 데이터를 쓰기로 정한 경로이고 실제 DB 이미지마다 경로가 다르므로 그 경로에 연결해야 해요.</p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 볼륨 이름을 잘못 쓰면 어떻게 되나요?</summary>
<p>A. 없는 이름이면 Docker가 다른 볼륨을 새로 만들어 연결해서 예전 데이터가 없는 것처럼 보여요. 연결할 폴더에 이미지의 초기 파일이 있으면 새 볼륨으로 복사될 수 있어요. 기존 볼륨 이름을 확인해 다시 연결해요.</p>
</details>
<details class="author-question">
<summary>초보 독자 Q. 볼륨은 내 컴퓨터 어디에 있나요?</summary>
<p>A. Docker가 관리하는 저장 영역에 있어요. <code>docker volume inspect db-data</code>의 Mountpoint로 위치를 확인할 수 있지만 그 안을 직접 고치지 않아요. Mac·Windows의 Docker Desktop에서는 리눅스 가상 머신 안에 있어요.</p>
</details>
</aside>
</div>
</div>

<div class="slide-group">
<h2 class="slide-group-title">바인드 마운트: 우리 집 서랍을 조리대에 잇기</h2>

<section class="slide">
<h3>조리대의 재료 칸에 집 서랍을 연결해요</h3>
<svg class="dg" viewBox="0 0 400 180" role="img" aria-label="우리 집 서랍과 조리대가 양쪽으로 이어져 집에서 고친 레시피가 조리대에서 바로 보이고 조리대에서 버린 것은 집 서랍에서도 사라진다는 그림">
<defs><marker id="v5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M108,64 L292,64" marker-end="url(#v5)"/>
<path class="line" d="M292,96 L108,96" marker-end="url(#v5)"/>
<circle class="box" cx="65" cy="80" r="42"/><use class="ic" href="#i-house" x="39" y="54" width="52" height="52"/>
<circle class="box" cx="335" cy="80" r="42"/><use class="ic" href="#i-pot" x="309" y="54" width="52" height="52"/>
<text class="small" x="200" y="48">고친 레시피가 바로 보여요</text>
<text class="alert" x="200" y="113">버리면 서랍에서도 사라져요</text>
<text class="big" x="65" y="146">우리 집 서랍</text><text class="small" x="65" y="165">내가 관리해요</text>
<text class="big" x="335" y="146">조리대</text><text class="small" x="335" y="165">그 자리에 서랍을 봐요</text>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="0s" repeatCount="indefinite" path="M108,64 L292,64"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="0.8s" repeatCount="indefinite" path="M292,96 L108,96"/></circle>
</svg>
<p class="point">집 서랍을 조리대에서 재료를 놓던 칸에 덮어 연결하면 양쪽에서 같은 물건을 써요.</p>
<p class="explain">요리사는 조리대에서 재료를 놓던 칸에 집 서랍을 덮어 연결해서 그 칸의 재료 대신 서랍 속 재료를 봐요. 집과 조리대에서 보는 물건은 하나라서 수정하기 편하지만 실수도 양쪽에 그대로 미쳐요. 실제로는 이미지를 다시 만들지 않고 집 폴더를 컨테이너에 그대로 연결하는 방법이에요.</p>
</section>

<section class="slide">
<h3>실제로는: 바인드 마운트는 호스트의 폴더를 그대로 연결해요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="내 노트북의 my-app/src 폴더와 컨테이너 안의 /app/src가 양쪽으로 이어져 같은 파일을 보고 -v 앞부분에 이름을 쓰면 볼륨이고 호스트 경로를 쓰면 바인드 마운트라는 그림">
<defs><marker id="v6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="label" x="10" y="14">내 노트북 (호스트)</text>
<text class="label" x="230" y="14">컨테이너</text>
<rect class="box" x="10" y="30" width="160" height="64" rx="6"/><text class="chip" x="90" y="52">my-app/src 폴더</text><text class="small" x="90" y="74">편집기로 고쳐요</text>
<rect class="box" x="230" y="30" width="160" height="64" rx="6"/><text class="chip" x="310" y="52">/app/src</text><text class="small" x="310" y="74">앱이 같은 파일을 읽어요</text>
<path class="line" d="M170,52 L226,52" marker-end="url(#v6)"/>
<path class="line" d="M230,74 L174,74" marker-end="url(#v6)"/>
<rect class="line" x="10" y="110" width="380" height="80" rx="12"/>
<text class="label center" x="200" y="128">-v 앞부분으로 구분해요</text>
<text class="chip" x="200" y="154">-v db-data:/data → 볼륨 (이름)</text>
<text class="chip" x="200" y="176">-v /home/me/src:/app/src → 바인드 마운트 (경로)</text>
<circle class="packet" r="5"><animateMotion dur="1s" begin="0s" repeatCount="indefinite" path="M170,52 L226,52"/></circle>
<circle class="packet" r="5"><animateMotion dur="1s" begin="0.5s" repeatCount="indefinite" path="M230,74 L174,74"/></circle>
</svg>
<p class="point">바인드 마운트는 호스트에 이미 있는 폴더를 컨테이너 안의 경로에 그대로 연결해요.</p>
<p class="explain">볼륨과 바인드 마운트는 모두 호스트 안에 있지만 볼륨은 주방 냉장고처럼 Docker가 위치와 관리를 맡고 바인드 마운트는 집 서랍처럼 내가 고른 폴더를 직접 열어 고쳐요. 바인드 마운트는 그 폴더를 컨테이너의 경로 위에 덮어 연결하며 원래 파일은 연결한 동안 가려져요. 이미지에 복사한 사본이 아니라 호스트의 파일을 직접 읽으므로 개발 중 코드를 고쳐도 이미지를 다시 만들 필요가 없어요. 대신 앱도 같은 파일을 고치거나 지울 수 있어서 편집기의 변경뿐 아니라 앱의 실수도 호스트에 미쳐요.</p>
</section>

<section class="slide">
<h3>이럴 땐 조심해요: 연결한 폴더에 원래 있던 파일</h3>
<table>
<thead><tr><th>상황</th><th>실제로 일어나는 일</th></tr></thead>
<tbody>
<tr><td>이미지 안에 파일이 있는 폴더에 바인드 마운트를 연결해요</td><td>원래 파일은 지워지지 않지만 연결한 동안 가려져서 컨테이너에서 보이지 않아요</td></tr>
<tr><td>같은 폴더에 방금 만든 빈 볼륨을 연결해요</td><td>Docker가 관리하는 새 저장소를 처음 채우도록 이미지 파일을 기본으로 복사해 줘요. 바인드 마운트는 내가 고른 폴더를 연결하므로 자동으로 채우지 않아요. 이미 데이터가 있는 볼륨이면 원래 파일을 가려요</td></tr>
<tr><td>연결한 파일을 앱이 읽기만 하면 돼요</td><td><code style="white-space:nowrap">-v /home/me/src:/app/src:ro</code>처럼 끝에 read-only(읽기 전용)의 약자인 <code>ro</code>를 붙여 앱이 호스트 파일을 바꾸거나 지우지 못하게 해요</td></tr>
</tbody>
</table>
<p class="point">연결할 폴더에 파일이 이미 있는지 확인하고 앱이 읽기만 하면 읽기 전용으로 연결해요.</p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">고르는 기준: 냉장고와 서랍 중 어디에 둘까</h2>

<section class="slide">
<h3>볼륨과 바인드 마운트와 tmpfs 마운트 비교</h3>
<table>
<thead><tr><th></th><th>볼륨</th><th>바인드 마운트</th><th>tmpfs 마운트</th></tr></thead>
<tbody>
<tr><td>누가 관리하나</td><td>Docker</td><td>사용자</td><td>Docker가 실행 중에만 마련해요</td></tr>
<tr><td>어디에 있나</td><td>호스트 안 Docker의 저장 영역</td><td>내가 고른 호스트 폴더</td><td>호스트의 메모리</td></tr>
<tr><td>컨테이너를 멈추면</td><td>남아요</td><td>남아요</td><td>사라져요</td></tr>
<tr><td>컨테이너 자체를 지우면</td><td>남아요</td><td>호스트 파일이라 남아요</td><td>사라져요</td></tr>
<tr><td>앱이 연결한 폴더 안의 파일을 지우면</td><td>볼륨의 그 파일이 지워져요</td><td>호스트의 그 파일이 지워져요</td><td>임시 공간의 그 파일이 지워져요</td></tr>
<tr><td>잘 맞는 일</td><td>DB 데이터처럼 앱이 만들고 남길 데이터</td><td>개발 중인 코드와 설정 파일 공유</td><td>디스크에 남기지 않을 임시 파일 (리눅스에서만)</td></tr>
</tbody>
</table>
<p class="point">앱이 남길 데이터는 볼륨에 두고 내가 직접 고칠 파일은 바인드 마운트로 연결해요.</p>
<p class="explain">메모리는 작업 중 빠르게 쓰는 공간이지만 전원을 끄면 내용이 사라져서 디스크에 오래 보관할 데이터와 용도가 달라요. 개발자는 다음 실행에서도 필요한 파일인지 잠깐 쓰고 버릴 파일인지에 따라 저장 방식을 골라요. 컨테이너를 지워도 저장소가 남는다는 말은 앱이 그 안의 파일을 직접 지우는 것까지 막아 준다는 뜻은 아니에요.</p>
</section>

<section class="slide">
<h3>이럴 땐 조심해요: 볼륨도 지우면 사라져요</h3>
<table>
<thead><tr><th>오해</th><th>실제</th></tr></thead>
<tbody>
<tr><td>볼륨에 넣으면 영원히 안전하다</td><td>볼륨을 지우면 안의 데이터도 사라져요. 볼륨도 호스트 한 대의 디스크에 있으니 다른 곳에 복사하는 백업은 따로 해요</td></tr>
<tr><td>이름 없는 볼륨도 이름 붙인 볼륨과 똑같다</td><td><code>-v /data</code>처럼 볼륨 이름 없이 컨테이너 폴더만 주면 Docker가 무작위 이름의 익명 볼륨을 만들어요. 컨테이너를 <code style="white-space:nowrap">--rm</code>(끝나면 컨테이너를 자동으로 지우는 옵션)으로 실행하면 이 익명 볼륨은 컨테이너와 함께 지워지고 이름 붙인 볼륨은 남아요</td></tr>
<tr><td>정리 명령 <code>docker volume prune</code>은 안 쓰는 볼륨을 모두 지운다</td><td>최근 Docker(실행 엔진의 버전 번호 23.0 이후)의 기본 정리 대상은 어떤 컨테이너도 쓰지 않는 익명 볼륨이고 23.0.5부터 <code>--all</code>을 붙이면 사용하지 않는 이름 있는 볼륨까지 지워요</td></tr>
</tbody>
</table>
<p class="point">볼륨은 컨테이너보다 오래 살 뿐이고 지우거나 정리하면 데이터도 함께 사라져요.</p>
<p>참고: <a href="https://docs.docker.com/engine/storage/">Docker 저장소 개요</a> · <a href="https://docs.docker.com/engine/storage/volumes/">볼륨</a> · <a href="https://docs.docker.com/engine/storage/bind-mounts/">바인드 마운트</a> · <a href="https://docs.docker.com/engine/storage/tmpfs/">tmpfs 마운트</a> · <a href="https://docs.docker.com/engine/storage/drivers/">스토리지 드라이버와 쓰기 층</a> · <a href="https://docs.docker.com/reference/cli/docker/volume/prune/">docker volume prune</a> · <a href="https://docs.docker.com/engine/release-notes/23.0/">Docker Engine 23.0 릴리스 노트</a></p>
</section>

<section class="slide">
<h3>한눈에 다시 보기: 이 글의 네 줄</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="문제는 쓰기 층이 컨테이너와 함께 지워지는 것이고 볼륨은 Docker가 관리하는 바깥 저장 공간이며 바인드 마운트는 호스트 폴더를 그대로 연결하는 것이고 tmpfs 마운트는 메모리에만 두는 임시 공간이라는 네 줄 요약 그림">
<circle class="bad" cx="30" cy="28" r="18"/><use class="ic" href="#i-trash" x="19" y="17" width="22" height="22"/>
<text class="label" x="62" y="19">문제</text><text class="small" x="62" y="38" style="text-anchor:start">쓰기 층의 데이터는 컨테이너와 함께 지워져요</text>
<circle class="new" cx="30" cy="76" r="18"/><use class="ic" href="#i-fridge" x="19" y="65" width="22" height="22"/>
<text class="label" x="62" y="67">볼륨</text><text class="small" x="62" y="86" style="text-anchor:start">Docker가 관리하는 바깥 저장 공간이에요</text>
<circle class="box" cx="30" cy="124" r="18"/><use class="ic" href="#i-house" x="19" y="113" width="22" height="22"/>
<text class="label" x="62" y="115">바인드 마운트</text><text class="small" x="62" y="134" style="text-anchor:start">호스트에 있는 폴더를 그대로 연결해요</text>
<circle class="box" cx="30" cy="172" r="18"/><use class="ic" href="#i-memory" x="19" y="161" width="22" height="22"/>
<text class="label" x="62" y="163">tmpfs 마운트</text><text class="small" x="62" y="182" style="text-anchor:start">메모리에만 두고 컨테이너가 멈추면 사라져요</text>
</svg>
<p class="point">남길 데이터는 컨테이너 밖에 두고 누가 관리할지에 따라 볼륨과 바인드 마운트를 골라요.</p>
</section>
</div>

</div>
