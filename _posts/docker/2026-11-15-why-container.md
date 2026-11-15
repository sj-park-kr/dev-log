---
layout: post
title: "컨테이너는 왜 생겼을까? 밀키트로 이해하는 Docker"
description: "내 컴퓨터에선 되는데 서버에선 안 되는 문제를 밀키트 비유로 설명하고 Docker의 이미지·Dockerfile·컨테이너·레지스트리와 가상 머신과의 차이까지 실제 동작으로 이어서 설명합니다."
date: 2026-11-15 21:00:00 +0900
series: docker
episode: 1
summary: "Docker는 앱과 준비물을 밀키트 상자처럼 봉인해요. 어느 주방에서 뜯어도 같은 맛이 나듯 어느 컴퓨터에서 실행해도 같게 돌아가요."
---

<div class="lesson lesson-hierarchy">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: Lucide (lucide-static v1.25.0, ISC). 라이선스: assets/icons/LICENSE-lucide.txt. i-bowl만 Lucide에 맞는 것이 없어 직접 그렸어요. -->
<symbol id="i-pot" viewBox="0 0 24 24"><path d="M2 12h20M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8M4 8l16-4M8.86 6.78l-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"/></symbol>
<symbol id="i-doc" viewBox="0 0 24 24"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2zM14 2v5a1 1 0 0 0 1 1h5M10 9H8M16 13H8M16 17H8"/></symbol>
<symbol id="i-drop" viewBox="0 0 24 24"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></symbol>
<symbol id="i-flame" viewBox="0 0 24 24"><path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/></symbol>
<symbol id="i-box" viewBox="0 0 24 24"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73zM12 22V12M3.29 7 12 12 20.71 7M7.5 4.27l9 5.15"/></symbol>
<symbol id="i-store" viewBox="0 0 24 24"><path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"/></symbol>
<symbol id="i-fridge" viewBox="0 0 24 24"><path d="M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6ZM5 10h14M15 7v6"/></symbol>
<symbol id="i-building" viewBox="0 0 24 24"><path d="M10 12h4M10 8h4M14 21v-3a2 2 0 0 0-4 0v3M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/></symbol>
<symbol id="i-layers" viewBox="0 0 24 24"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83zM2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></symbol>
<symbol id="i-factory" viewBox="0 0 24 24"><path d="M12 16h.01M16 16h.01M3 19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a.5.5 0 0 0-.769-.422l-4.462 2.844A.5.5 0 0 1 15 10.5v-2a.5.5 0 0 0-.769-.422L9.77 10.922A.5.5 0 0 1 9 10.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2zM8 16h.01"/></symbol>
<symbol id="i-bowl" viewBox="0 0 24 24"><path d="M3 12h18a9 9 0 0 1-18 0zM7 12c1-4 3-6 5-8 2 2 4 4 5 8"/></symbol>
</defs>
</svg>

<div class="intro">
<p class="q">내 컴퓨터에서 잘 되던 앱이 왜 서버에서는 안 될까요?</p>
<p>Docker 시리즈의 첫 편이에요. 바이브 코딩으로 만든 앱이 내 노트북에서는 잘 돌아가는데 서버나 동료의 컴퓨터로 옮기면 오류가 나는 일이 자주 있어요. 코드는 똑같아도 그 코드를 돌리는 언어 버전과 라이브러리 같은 준비물이 컴퓨터마다 다르기 때문이에요.</p>
<p>이 글을 다 읽으면 Docker가 앱과 준비물을 <b>이미지</b>라는 상자에 담고 그 상자를 <b>컨테이너</b>로 실행해서 이 문제를 어떻게 푸는지 알 수 있어요. 이미지가 <b>레지스트리</b>를 거쳐 서버까지 가는 흐름과 컨테이너가 <b>가상 머신</b>과 무엇이 다른지도 함께 봐요.</p>
</div>

<div class="slide-group">
<h2 class="slide-group-title">무엇이 문제인가: 내 주방에서만 나는 맛</h2>

<section class="slide">
<h3>레시피만 보내면 맛이 달라져요</h3>
<svg class="dg" viewBox="0 0 400 300" role="img" aria-label="친구 주방의 냄비에서는 맛있는 요리가 되지만 레시피 종이만 우리 주방으로 보내면 맛이 달라지고 그 이유는 간장과 고춧가루와 불 크기가 서로 달랐기 때문이라는 그림">
<defs><marker id="m1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M108,78 L292,78" marker-end="url(#m1)"/>
<circle class="kafka" cx="65" cy="78" r="42"/><use class="ic" href="#i-pot" x="39" y="52" width="52" height="52"/>
<circle class="box" cx="200" cy="78" r="32"/><use class="ic" href="#i-doc" x="178" y="56" width="44" height="44"/>
<circle class="bad" cx="335" cy="78" r="42"/><use class="ic" href="#i-pot" x="309" y="52" width="52" height="52"/>
<text class="alert big" x="335" y="46">?</text>
<text class="big" x="65" y="144">친구 주방</text><text class="small" x="65" y="163">맛있어요</text>
<text class="small" x="200" y="128">레시피만</text>
<text class="big" x="335" y="144">우리 주방</text><text class="alert" x="335" y="163">맛이 달라요</text>
<g transform="translate(0,10)">
<rect class="line" x="10" y="174" width="380" height="108" rx="12"/>
<text class="label center" x="200" y="194">두 주방에서 달랐던 것</text>
<circle class="kafka" cx="44" cy="226" r="19"/><use class="ic" href="#i-drop" x="30" y="212" width="28" height="28"/>
<circle class="bad" cx="96" cy="226" r="19"/><use class="ic" href="#i-drop" x="82" y="212" width="28" height="28"/>
<text class="chip" x="70" y="260">간장 종류</text>
<circle class="kafka" cx="174" cy="226" r="19"/><use class="ic" href="#i-bowl" x="160" y="212" width="28" height="28"/>
<circle class="line dash" cx="226" cy="226" r="19"/><path class="line" d="M213,239 L239,213"/>
<text class="chip" x="200" y="260">고춧가루 없음</text>
<circle class="kafka" cx="304" cy="226" r="19"/><use class="ic" href="#i-flame" x="288" y="210" width="32" height="32"/>
<circle class="bad" cx="356" cy="226" r="19"/><use class="ic" href="#i-flame" x="347" y="217" width="18" height="18"/>
<text class="chip" x="330" y="260">불 세기</text>
</g>
<circle class="packet" r="5"><animateMotion dur="1.8s" begin="0s" repeatCount="indefinite" path="M108,78 L292,78"/></circle>
</svg>
<p class="point">레시피가 같아도 주방의 재료와 양념이 다르면 다른 요리가 나와요.</p>
<p class="explain">친구가 맛있게 만든 요리의 레시피만 받아서 우리 주방에서 따라 하면 간장 종류와 고춧가루와 불 세기가 달라서 맛이 달라져요. 그러면 무엇이 달랐는지 찾느라 시간을 써요.</p>
</section>

<section class="slide">
<h3>실제로는: 코드만 옮기면 서버에서 멈춰요</h3>
<table>
<thead><tr><th>준비물</th><th>내 노트북</th><th>서버</th></tr></thead>
<tbody>
<tr><td>언어 실행기 (런타임)</td><td>Python 3.12</td><td>Python 3.10</td></tr>
<tr><td>라이브러리</td><td>설치돼 있음</td><td>버전이 다르거나 없음</td></tr>
<tr><td>운영체제 프로그램</td><td>이미지 변환 도구 있음</td><td>없음</td></tr>
<tr><td>설정 값</td><td>환경 변수 있음</td><td>빠짐</td></tr>
</tbody>
</table>
<p class="point">코드는 같아도 코드를 돌리는 준비물이 다르면 앱이 다르게 움직여요.</p>
<p class="explain">개발자가 노트북에서 만든 앱은 코드만으로 돌지 않고 런타임과 라이브러리 같은 준비물 위에서 돌아요. 런타임은 코드를 읽어 실행해 주는 프로그램이고 라이브러리는 남이 만들어 둔 코드 묶음이에요. 코드만 서버로 옮기면 서버에 깔린 준비물이 달라서 "내 컴퓨터에선 되는데"라는 일이 생겨요. 서버를 늘릴 때마다 사람이 준비물을 똑같이 맞추는 일도 오래 걸리고 실수가 나기 쉬워요.</p>
</section>

<details class="origin">
<summary>더 알아보기: 누가 왜 만들었을까?</summary>
<p>Docker는 <b>2013년 3월 15일</b> 미국 PyCon 2013에서 dotCloud의 <b>솔로몬 하익스(Solomon Hykes)</b>가 짧은 발표 "The Future of Linux Containers"로 처음 소개했어요. 같은 달 오픈 소스로 공개됐어요.</p>
<p>dotCloud는 고객의 앱을 자기 서버에서 대신 돌려 주는 서비스(PaaS)를 운영하면서 회사 안에서 리눅스 컨테이너를 쓰고 있었어요. 다루기 복잡했던 이 기술을 누구나 쉽게 쓰도록 만든 도구가 Docker예요. Docker가 인기를 얻자 회사 이름도 Docker, Inc.로 바뀌었어요.</p>
<p>docker는 영어로 항구에서 배에 짐을 싣고 내리는 부두 노동자를 뜻해요. 컨테이너도 원래 배로 실어 나르는 규격 화물 상자를 부르는 말이에요.</p>
<p>참고: <a href="https://pyvideo.org/pycon-us-2013/the-future-of-linux-containers.html">PyCon 2013 발표 기록</a> · <a href="https://www.infoq.com/articles/docker-future/">InfoQ: Docker의 출발</a> · <a href="https://www.docker.com/resources/what-container/">Docker: 컨테이너란</a></p>
</details>
</div>

<div class="slide-group">
<h2 class="slide-group-title">이미지: 재료까지 봉인한 밀키트 상자</h2>

<section class="slide">
<h3>레시피와 재료를 한 상자에 담아요</h3>
<svg class="dg" viewBox="0 0 400 256" role="img" aria-label="레시피 카드와 재료와 양념이 들어 있는 밀키트 상자를 우리 주방과 회사 주방이 각각 받아 같은 맛을 내는 그림">
<defs><marker id="m2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M124,62 L272,62" marker-end="url(#m2)"/>
<path class="line" d="M112,98 L274,168" marker-end="url(#m2)"/>
<circle class="kafka" cx="80" cy="70" r="42"/><use class="ic" href="#i-box" x="54" y="44" width="52" height="52"/>
<text class="big" x="80" y="126">밀키트 상자</text>
<rect class="line" x="10" y="142" width="140" height="98" rx="10"/>
<text class="small" x="80" y="158">상자 안</text>
<circle class="box" cx="38" cy="188" r="17"/><use class="ic" href="#i-doc" x="27" y="177" width="22" height="22"/>
<circle class="box" cx="80" cy="188" r="17"/><use class="ic" href="#i-bowl" x="69" y="177" width="22" height="22"/>
<circle class="box" cx="122" cy="188" r="17"/><use class="ic" href="#i-drop" x="111" y="177" width="22" height="22"/>
<text class="chip" x="38" y="220">레시피</text><text class="chip" x="80" y="220">재료</text><text class="chip" x="122" y="220">양념</text>
<circle class="box" cx="310" cy="62" r="32"/><use class="ic" href="#i-pot" x="290" y="42" width="40" height="40"/>
<text class="big" x="310" y="112">우리 주방</text><text class="small" x="310" y="130">같은 맛</text>
<circle class="box" cx="310" cy="176" r="32"/><use class="ic" href="#i-pot" x="290" y="156" width="40" height="40"/>
<text class="big" x="310" y="226">회사 주방</text><text class="small" x="310" y="244">같은 맛</text>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0s" repeatCount="indefinite" path="M124,62 L272,62"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="0.6s" repeatCount="indefinite" path="M112,98 L274,168"/></circle>
</svg>
<p class="point">레시피와 재료와 양념을 한 상자에 봉인하면 어느 주방에서 만들어도 같은 맛이 나요.</p>
<p class="explain">밀키트 공장은 포장 지시서를 보고 레시피 카드와 계량한 재료를 칸마다 담아 상자를 봉인해요. 받는 사람은 자기 주방에 무엇이 있는지 신경 쓰지 않고 상자 안의 것만 써서 어느 주방에서나 같은 맛이 나요. 봉인한 상자는 열어서 고치지 않고 바꾸고 싶으면 새 상자를 포장해요.</p>
</section>

<section class="slide">
<h3>실제로는: Dockerfile대로 층을 쌓아 이미지를 만들어요</h3>
<svg class="dg" viewBox="0 0 400 230" role="img" aria-label="왼쪽 Dockerfile의 FROM python, COPY 라이브러리 목록, RUN 라이브러리 설치, COPY 앱 코드 네 줄이 각각 오른쪽 이미지의 층 하나가 되어 읽기 전용 이미지로 쌓이는 그림">
<defs><marker id="m3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="label" x="10" y="14">Dockerfile</text>
<text class="label" x="210" y="14">이미지 (읽기 전용)</text>
<rect class="box" x="10" y="30" width="160" height="34" rx="5"/><text class="chip" x="90" y="47">FROM python</text>
<rect class="box" x="10" y="74" width="160" height="34" rx="5"/><text class="chip" x="90" y="91">COPY 라이브러리 목록</text>
<rect class="box" x="10" y="118" width="160" height="34" rx="5"/><text class="chip" x="90" y="135">RUN 라이브러리 설치</text>
<rect class="box" x="10" y="162" width="160" height="34" rx="5"/><text class="chip" x="90" y="179">COPY 앱 코드</text>
<path class="line" d="M170,47 L206,47" marker-end="url(#m3)"/>
<path class="line" d="M170,91 L206,91" marker-end="url(#m3)"/>
<path class="line" d="M170,135 L206,135" marker-end="url(#m3)"/>
<path class="line" d="M170,179 L206,179" marker-end="url(#m3)"/>
<rect class="kafka" x="210" y="30" width="180" height="34" rx="5"/><text class="chip" x="300" y="47">기본 이미지 (Python)</text>
<rect class="kafka" x="210" y="74" width="180" height="34" rx="5"/><text class="chip" x="300" y="91">라이브러리 목록 층</text>
<rect class="kafka" x="210" y="118" width="180" height="34" rx="5"/><text class="chip" x="300" y="135">설치한 라이브러리 층</text>
<rect class="kafka" x="210" y="162" width="180" height="34" rx="5"/><text class="chip" x="300" y="179">앱 코드 층</text>
<text class="small" x="200" y="217">명령 한 줄이 층 하나가 돼요</text>
</svg>
<p class="point">이미지는 앱 코드와 실행에 필요한 준비물을 층층이 담아 봉인한 꾸러미예요.</p>
<p class="explain">이미지는 앱을 실행하는 데 필요한 파일과 라이브러리와 설정을 모두 담은 꾸러미이고 Dockerfile은 그 이미지를 만드는 포장 지시서예요. 개발자가 빌드(build)를 하면 Docker가 Dockerfile을 위에서부터 읽으며 이미 만들어진 Python 이미지를 바닥에 깔고 명령마다 층(레이어)을 하나씩 쌓아요. 완성된 이미지는 고칠 수 없어서 바꾸려면 Dockerfile을 고쳐 새로 빌드해요. 다시 빌드할 때는 바뀐 층부터 다시 만들고 그 앞의 층은 그대로 써서 빨라요.</p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">컨테이너: 상자를 뜯어 요리하고 어디로든 보내기</h2>

<section class="slide">
<h3>같은 상자를 여러 조리대에서 뜯어요</h3>
<svg class="dg" viewBox="0 0 400 266" role="img" aria-label="밀키트 상자 하나에서 화살표가 조리대 세 곳으로 이어져 각각 요리가 진행되고 다 쓰고 치우면 흔적은 사라지고 남길 음식은 냉장고에 넣는다는 그림">
<defs><marker id="m4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M188,64 L82,106" marker-end="url(#m4)"/>
<path class="line" d="M200,68 L200,100" marker-end="url(#m4)"/>
<path class="line" d="M212,64 L318,106" marker-end="url(#m4)"/>
<circle class="kafka" cx="200" cy="38" r="28"/><use class="ic" href="#i-box" x="182" y="20" width="36" height="36"/>
<text class="small" x="240" y="38" style="text-anchor:start">같은 상품</text>
<circle class="kafka" cx="70" cy="134" r="30"/><use class="ic" href="#i-pot" x="50" y="114" width="40" height="40"/>
<circle class="kafka" cx="200" cy="134" r="30"/><use class="ic" href="#i-pot" x="180" y="114" width="40" height="40"/>
<circle class="kafka" cx="330" cy="134" r="30"/><use class="ic" href="#i-pot" x="310" y="114" width="40" height="40"/>
<text class="chip" x="70" y="180">조리대 1</text><text class="chip" x="200" y="180">조리대 2</text><text class="chip" x="330" y="180">조리대 3</text>
<rect class="line" x="10" y="198" width="380" height="58" rx="12"/>
<text class="chip" x="105" y="218">치우면 흔적도</text><text class="chip" x="105" y="236">같이 사라져요</text>
<circle class="new" cx="225" cy="227" r="20"/><use class="ic" href="#i-fridge" x="212" y="214" width="26" height="26"/>
<text class="chip" x="315" y="218">남길 음식은</text><text class="chip" x="315" y="236">냉장고에</text>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0s" repeatCount="indefinite" path="M188,64 L82,106"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.4s" repeatCount="indefinite" path="M200,68 L200,100"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.8s" repeatCount="indefinite" path="M212,64 L318,106"/></circle>
</svg>
<p class="point">같은 상자를 여러 조리대에서 동시에 뜯어 따로따로 요리할 수 있어요.</p>
<p class="explain">손님은 같은 밀키트를 여러 개 사서 조리대마다 하나씩 뜯어 요리하고 조리대 사이의 칸막이 덕분에 양념이 옆 요리에 섞이지 않아요. 다 먹고 조리대를 치우면 그 위의 흔적도 같이 사라지니까 남길 음식은 조리대 밖 냉장고에 넣어요.</p>
</section>

<section class="slide">
<h3>실제로는: 컨테이너는 이미지를 실행한 앱이에요</h3>
<svg class="dg" viewBox="0 0 400 230" role="img" aria-label="읽기 전용 이미지 하나로 컨테이너 A, B, C 세 개를 실행하고 컨테이너를 지우면 안에 쓴 파일은 사라지므로 남길 데이터는 바깥의 볼륨에 저장하는 그림">
<defs><marker id="m5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="kafka" x="10" y="53" width="110" height="70" rx="8"/><text x="65" y="78">이미지</text><text class="small" x="65" y="102">읽기 전용</text>
<path class="line" d="M120,88 L226,32" marker-end="url(#m5)"/>
<path class="line" d="M120,88 L226,88" marker-end="url(#m5)"/>
<path class="line" d="M120,88 L226,144" marker-end="url(#m5)"/>
<rect class="box" x="230" y="10" width="160" height="44" rx="6"/><text class="chip" x="310" y="32">컨테이너 A · 실행 중</text>
<rect class="box" x="230" y="66" width="160" height="44" rx="6"/><text class="chip" x="310" y="88">컨테이너 B · 실행 중</text>
<rect class="box" x="230" y="122" width="160" height="44" rx="6"/><text class="chip" x="310" y="144">컨테이너 C · 실행 중</text>
<path class="line dash" d="M310,166 L310,182"/>
<rect class="new" x="230" y="182" width="160" height="40" rx="6"/><text class="chip" x="310" y="202">볼륨 (바깥 보관함)</text>
<text class="alert" x="112" y="202">지우면 안에 쓴 파일은 사라져요</text>
</svg>
<p class="point">컨테이너는 이미지를 바탕으로 실행된 앱이고 한 이미지로 여러 개를 띄울 수 있어요.</p>
<p class="explain">Docker가 이미지를 읽어 그 위에 컨테이너 전용 쓰기 공간을 얹고 앱을 실행하면 컨테이너가 돼요. 컨테이너는 다른 컨테이너와 서버의 나머지 부분에서 칸막이로 나뉜(격리된) 프로세스이고 프로세스는 실행 중인 프로그램 하나를 뜻해요. 컨테이너를 지우면 그 안에서 쓴 파일도 같이 사라져요. 그래서 남겨야 할 데이터는 볼륨이라는 바깥 보관함에 저장하고 볼륨은 컨테이너를 지워도 남아요.</p>
</section>

<section class="slide">
<h3>공장에서 포장하고 마트에서 받아 가요</h3>
<svg class="dg" viewBox="0 0 400 192" role="img" aria-label="포장 공장이 밀키트 상자를 마트 진열대에 납품하고 우리 주방과 회사 주방이 마트에서 같은 상품을 사 가는 흐름 그림">
<defs><marker id="m6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M93,96 L161,96" marker-end="url(#m6)"/>
<path class="line" d="M232,86 L316,46" marker-end="url(#m6)"/>
<path class="line" d="M232,106 L316,110" marker-end="url(#m6)"/>
<circle class="box" cx="55" cy="96" r="36"/><use class="ic" href="#i-factory" x="33" y="74" width="44" height="44"/>
<text class="big" x="55" y="148">포장 공장</text>
<text class="chip" x="127" y="80">납품</text>
<circle class="kafka" cx="200" cy="96" r="36"/><use class="ic" href="#i-store" x="178" y="74" width="44" height="44"/>
<text class="big" x="200" y="148">마트 진열대</text>
<circle class="box" cx="350" cy="36" r="26"/><use class="ic" href="#i-pot" x="334" y="20" width="32" height="32"/>
<text class="chip" x="350" y="76">우리 주방</text>
<circle class="box" cx="350" cy="116" r="26"/><use class="ic" href="#i-pot" x="334" y="100" width="32" height="32"/>
<text class="chip" x="350" y="156">회사 주방</text>
<text class="small" x="200" y="182">어디서든 같은 상품 이름으로 사 가요</text>
<circle class="packet" r="5"><animateMotion dur="1.2s" begin="0s" repeatCount="indefinite" path="M93,96 L161,96"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.6s" repeatCount="indefinite" path="M232,86 L316,46"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.9s" repeatCount="indefinite" path="M232,106 L316,110"/></circle>
</svg>
<p class="point">공장이 포장한 상자를 마트에 두면 어느 주방이든 같은 상품을 사 갈 수 있어요.</p>
<p class="explain">포장 공장은 상자를 다 만들면 마트 진열대에 올리고 우리 주방과 회사 주방은 마트에서 같은 상품 이름으로 가져가요. 그래서 상자는 한 번만 만들고 여러 곳에서 똑같이 써요.</p>
</section>

<section class="slide">
<h3>실제로는: 이미지는 레지스트리를 거쳐 서버로 가요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="내 노트북에서 이미지를 빌드해 레지스트리에 올리고 서버와 동료 노트북과 서버 2가 레지스트리에서 같은 이미지를 받아 실행하는 흐름 그림">
<defs><marker id="m7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="box" x="10" y="20" width="110" height="70" rx="8"/><text x="65" y="40">내 노트북</text><text class="small" x="65" y="62">빌드(build)</text><text class="small" x="65" y="78">올리기(push)</text>
<path class="line" d="M120,55 L141,55" marker-end="url(#m7)"/>
<rect class="kafka" x="145" y="20" width="110" height="70" rx="8"/><text x="200" y="40">레지스트리</text><text class="small" x="200" y="62">이미지 보관</text><text class="small" x="200" y="78">Docker Hub 등</text>
<path class="line" d="M255,55 L276,55" marker-end="url(#m7)"/>
<rect class="box" x="280" y="20" width="110" height="70" rx="8"/><text x="335" y="40">서버</text><text class="small" x="335" y="62">받기(pull)</text><text class="small" x="335" y="78">실행(run)</text>
<path class="line" d="M200,90 L200,126" marker-end="url(#m7)"/>
<path class="line" d="M240,90 L320,126" marker-end="url(#m7)"/>
<rect class="box" x="145" y="130" width="110" height="40" rx="8"/><text class="chip" x="200" y="150">동료 노트북</text>
<rect class="box" x="280" y="130" width="110" height="40" rx="8"/><text class="chip" x="335" y="150">서버 2</text>
<text class="small" x="200" y="190">같은 이미지라서 어디서나 같은 준비물로 돌아요</text>
<circle class="packet" r="5"><animateMotion dur="1s" begin="0s" repeatCount="indefinite" path="M120,55 L141,55"/></circle>
<circle class="packet" r="5"><animateMotion dur="1s" begin="0.5s" repeatCount="indefinite" path="M255,55 L276,55"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.8s" repeatCount="indefinite" path="M240,90 L320,126"/></circle>
</svg>
<p class="point">개발자가 이미지를 레지스트리에 올리면 서버와 동료는 같은 이미지를 받아 실행해요.</p>
<p class="explain">개발자가 노트북에서 이미지를 빌드하고 레지스트리에 올려요(push). 레지스트리는 이미지를 보관하고 나눠 주는 저장소이고 Docker Hub는 누구나 쓸 수 있는 공개 레지스트리예요. 서버와 동료의 노트북은 이미지 이름으로 받아(pull) 컨테이너로 실행해요(run). 모두가 같은 이미지를 쓰니까 "내 컴퓨터에선 되는데" 문제가 줄어요.</p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">가상 머신과 무엇이 다를까: 건물째 짓기와 칸막이</h2>

<section class="slide">
<h3>건물을 통째로 짓기와 칸막이 치기</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="왼쪽은 요리마다 건물과 배관과 조리대를 따로 지은 세 채의 건물로 무겁고 오래 걸리고 오른쪽은 건물 하나의 공용 가스·수도 위에 칸막이로 나눈 조리대 세 개가 있어 가볍고 바로 시작하는 그림">
<rect class="line" x="10" y="14" width="185" height="182" rx="12"/>
<text class="label center" x="102" y="38">건물째 짓기</text>
<circle class="box" cx="48" cy="86" r="20"/><use class="ic" href="#i-building" x="35" y="73" width="26" height="26"/>
<circle class="box" cx="102" cy="86" r="20"/><use class="ic" href="#i-building" x="89" y="73" width="26" height="26"/>
<circle class="box" cx="156" cy="86" r="20"/><use class="ic" href="#i-building" x="143" y="73" width="26" height="26"/>
<text class="small" x="102" y="134">요리마다 따로 지어요</text>
<text class="alert" x="102" y="166">무겁고 오래 걸려요</text>
<rect class="line" x="205" y="14" width="185" height="182" rx="12"/>
<text class="label center" x="297" y="38">건물 하나에 칸막이</text>
<circle class="kafka" cx="243" cy="86" r="20"/><use class="ic" href="#i-pot" x="230" y="73" width="26" height="26"/>
<circle class="kafka" cx="297" cy="86" r="20"/><use class="ic" href="#i-pot" x="284" y="73" width="26" height="26"/>
<circle class="kafka" cx="351" cy="86" r="20"/><use class="ic" href="#i-pot" x="338" y="73" width="26" height="26"/>
<path class="line" d="M270,62 L270,110 M324,62 L324,110"/>
<rect class="new" x="220" y="122" width="155" height="30" rx="6"/><text class="chip" x="297" y="137">공용 가스·수도</text>
<text class="small" x="297" y="176">가볍고 금방 시작해요</text>
</svg>
<p class="point">요리마다 건물을 새로 지으면 무겁고 건물 하나에 칸막이를 치면 가벼워요.</p>
<p class="explain">첫 번째 방법은 요리마다 건물과 가스·수도 배관까지 따로 지어서 서로 확실히 떨어져 있지만 짓는 데 오래 걸리고 자리를 많이 차지해요. 두 번째 방법은 건물 하나의 가스와 수도를 함께 쓰고 조리대만 칸막이로 나눠서 금방 시작하고 더 많이 들어가요.</p>
</section>

<section class="slide">
<h3>실제로는: 가상 머신과 컨테이너의 층 구조</h3>
<svg class="dg" viewBox="0 0 400 240" role="img" aria-label="왼쪽 가상 머신은 서버 하드웨어 위의 하이퍼바이저 위에 앱과 준비물과 게스트 OS를 각각 담은 가상 머신 두 개가 있고 오른쪽 컨테이너는 서버 하드웨어 위의 호스트 OS 커널 하나를 Docker 엔진과 앱과 준비물만 담은 컨테이너 세 개가 함께 쓰는 그림">
<text class="label" x="10" y="14">가상 머신</text>
<text class="label" x="210" y="14">컨테이너</text>
<rect class="box" x="10" y="30" width="85" height="104" rx="6"/><text class="chip" x="52" y="52">앱</text><text class="chip" x="52" y="82">준비물</text><text class="chip" x="52" y="112">게스트 OS</text>
<rect class="box" x="105" y="30" width="85" height="104" rx="6"/><text class="chip" x="147" y="52">앱</text><text class="chip" x="147" y="82">준비물</text><text class="chip" x="147" y="112">게스트 OS</text>
<rect class="box" x="10" y="142" width="180" height="26" rx="5"/><text class="chip" x="100" y="155">하이퍼바이저</text>
<rect class="box" x="10" y="176" width="180" height="26" rx="5"/><text class="chip" x="100" y="189">서버 하드웨어</text>
<text class="small" x="100" y="224">OS째 담아 보통 수십 GB</text>
<rect class="box" x="210" y="30" width="56" height="70" rx="6"/><text class="chip" x="238" y="52">앱</text><text class="chip" x="238" y="80">준비물</text>
<rect class="box" x="272" y="30" width="56" height="70" rx="6"/><text class="chip" x="300" y="52">앱</text><text class="chip" x="300" y="80">준비물</text>
<rect class="box" x="334" y="30" width="56" height="70" rx="6"/><text class="chip" x="362" y="52">앱</text><text class="chip" x="362" y="80">준비물</text>
<rect class="box" x="210" y="108" width="180" height="26" rx="5"/><text class="chip" x="300" y="121">Docker 엔진</text>
<rect class="kafka" x="210" y="142" width="180" height="26" rx="5"/><text class="chip" x="300" y="155">호스트 OS 커널 (함께 씀)</text>
<rect class="box" x="210" y="176" width="180" height="26" rx="5"/><text class="chip" x="300" y="189">서버 하드웨어</text>
<text class="small" x="300" y="224">이미지는 보통 수십 MB</text>
</svg>
<p class="point">가상 머신은 운영체제를 통째로 담고 컨테이너는 서버의 커널 하나를 함께 써요.</p>
<p class="explain">커널은 운영체제(OS)의 핵심으로 CPU와 메모리와 파일을 프로그램들에게 나눠 주는 부분이고 비유의 가스·수도 배관이에요. 가상 머신(VM)은 하이퍼바이저라는 프로그램이 컴퓨터 하드웨어를 흉내 내고 그 안에 OS를 하나씩 통째로 설치해서 무겁고 켜는 데 오래 걸려요. 컨테이너는 서버의 커널 하나를 함께 쓰고 리눅스 커널의 네임스페이스(namespace)라는 칸막이로 각자 볼 수 있는 범위만 나눠서 가볍고 금방 켜져요. 대신 커널을 함께 쓰니까 컨테이너 안의 프로그램은 그 서버의 커널과 CPU에서 돌 수 있는 것이어야 해요.</p>
</section>

<section class="slide">
<h3>이럴 땐 조심해요: 이미지가 안 돌아가는 경우</h3>
<table>
<thead><tr><th>오해</th><th>실제</th></tr></thead>
<tbody>
<tr><td>한 번 만든 이미지는 어떤 컴퓨터에서도 돈다</td><td>CPU 종류(amd64, arm64)가 맞아야 해요. 여러 종류용으로 함께 빌드한 멀티 플랫폼 이미지라면 Docker가 맞는 것을 골라 받아요</td></tr>
<tr><td>Mac·Windows에서는 리눅스 없이 돈다</td><td>Docker Desktop이 리눅스 가상 머신을 띄우고 그 안에서 리눅스 컨테이너를 돌려요</td></tr>
</tbody>
</table>
<p class="point">컨테이너는 가볍지만 서버의 커널과 CPU 종류에 맞아야 해요.</p>
<p class="explain">컨테이너는 서버의 커널을 빌려 쓰기 때문에 그 서버의 CPU에서 돌 수 있는 이미지여야 해요. 예를 들어 Apple 실리콘 Mac에서 arm64용으로만 만든 이미지는 amd64 서버에서 에뮬레이션 없이 그대로 실행되지 않아요. Mac과 Windows에는 리눅스 커널이 없어서 Docker Desktop이 리눅스 가상 머신을 하나 띄워 두고 컨테이너를 그 안에서 돌려요.</p>
<p>참고: <a href="https://docs.docker.com/get-started/docker-overview/">Docker 개요</a> · <a href="https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/">이미지란</a> · <a href="https://docs.docker.com/get-started/docker-concepts/running-containers/persisting-container-data/">컨테이너 데이터 보존</a> · <a href="https://docs.docker.com/build/building/multi-platform/">멀티 플랫폼 빌드</a> · <a href="https://docs.docker.com/desktop/features/vmm/">Mac의 Docker Desktop VM</a> · <a href="https://docs.docker.com/desktop/features/wsl/">Windows의 WSL 2</a></p>
</section>

<section class="slide">
<h3>한눈에 다시 보기: 이 글의 다섯 줄</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="문제는 코드만 옮기면 준비물이 달라지는 것이고 이미지는 앱과 준비물을 봉인한 상자이며 컨테이너는 이미지를 실행한 앱이고 레지스트리는 이미지를 보관하고 나눠 주는 곳이며 컨테이너는 가상 머신과 달리 서버의 커널을 함께 쓴다는 다섯 줄 요약 그림">
<circle class="bad" cx="30" cy="28" r="18"/><use class="ic" href="#i-doc" x="19" y="17" width="22" height="22"/>
<text class="label" x="62" y="19">문제</text><text class="small" x="62" y="38" style="text-anchor:start">코드만 옮기면 준비물이 달라 다르게 돌아요</text>
<circle class="kafka" cx="30" cy="76" r="18"/><use class="ic" href="#i-box" x="19" y="65" width="22" height="22"/>
<text class="label" x="62" y="67">이미지</text><text class="small" x="62" y="86" style="text-anchor:start">앱과 준비물을 봉인한 읽기 전용 상자</text>
<circle class="kafka" cx="30" cy="124" r="18"/><use class="ic" href="#i-pot" x="19" y="113" width="22" height="22"/>
<text class="label" x="62" y="115">컨테이너</text><text class="small" x="62" y="134" style="text-anchor:start">이미지를 실행한 앱이에요</text>
<circle class="kafka" cx="30" cy="172" r="18"/><use class="ic" href="#i-store" x="19" y="161" width="22" height="22"/>
<text class="label" x="62" y="163">레지스트리</text><text class="small" x="62" y="182" style="text-anchor:start">이미지를 보관하고 나눠 주는 저장소</text>
<circle class="new" cx="30" cy="220" r="18"/><use class="ic" href="#i-layers" x="19" y="209" width="22" height="22"/>
<text class="label" x="62" y="211">가상 머신과 차이</text><text class="small" x="62" y="230" style="text-anchor:start">OS를 통째로 담지 않고 서버의 커널을 함께 써요</text>
</svg>
<p class="point">문제를 상자로 봉인해서 실행하고 나눠 쓰는 것이 Docker예요.</p>
</section>
</div>

</div>
