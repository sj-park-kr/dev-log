---
layout: post
title: "컨테이너는 왜 생겼을까? 밀키트로 이해하는 Docker"
description: "내 컴퓨터에선 되는데 서버에선 안 되는 문제를 밀키트 비유로 설명하고 Docker의 이미지·Dockerfile·컨테이너·레지스트리와 가상 머신과의 차이까지 실제 동작으로 이어서 설명합니다."
date: 2026-11-15 21:00:00 +0900
series: docker
episode: 1
summary: "Docker는 앱과 준비물을 밀키트 상자처럼 봉인해요. 칩과 운영체제가 맞는 컴퓨터라면 같은 준비물로 앱을 실행해요."
---

<div class="lesson lesson-hierarchy storybook">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: https://cdn.jsdelivr.net/npm/lucide-static@1.25.0/icons/ (ISC). 라이선스: assets/icons/LICENSE-lucide.txt. i-pot=cooking-pot, i-doc=file-text, i-drop=droplet, i-box=package, i-fridge=refrigerator, i-check=circle-check, i-x=circle-x (i-house, i-plug, i-flame, i-store, i-factory는 같은 이름). i-bowl만 Lucide에 맞는 것이 없어 직접 그렸어요. -->
<symbol id="i-house" viewBox="0 0 24 24"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></symbol>
<symbol id="i-pot" viewBox="0 0 24 24"><path d="M2 12h20M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8M4 8l16-4M8.86 6.78l-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"/></symbol>
<symbol id="i-doc" viewBox="0 0 24 24"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2zM14 2v5a1 1 0 0 0 1 1h5M10 9H8M16 13H8M16 17H8"/></symbol>
<symbol id="i-drop" viewBox="0 0 24 24"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></symbol>
<symbol id="i-flame" viewBox="0 0 24 24"><path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/></symbol>
<symbol id="i-box" viewBox="0 0 24 24"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73zM12 22V12M3.29 7 12 12 20.71 7M7.5 4.27l9 5.15"/></symbol>
<symbol id="i-store" viewBox="0 0 24 24"><path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"/></symbol>
<symbol id="i-fridge" viewBox="0 0 24 24"><path d="M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6ZM5 10h14M15 7v6"/></symbol>
<symbol id="i-factory" viewBox="0 0 24 24"><path d="M12 16h.01M16 16h.01M3 19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a.5.5 0 0 0-.769-.422l-4.462 2.844A.5.5 0 0 1 15 10.5v-2a.5.5 0 0 0-.769-.422L9.77 10.922A.5.5 0 0 1 9 10.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2zM8 16h.01"/></symbol>
<symbol id="i-plug" viewBox="0 0 24 24"><path d="M12 22v-5M15 8V2M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1zM9 8V2"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0zM9 12l2 2 4-4"/></symbol>
<symbol id="i-x" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0zM15 9l-6 6M9 9l6 6"/></symbol>
<symbol id="i-bowl" viewBox="0 0 24 24"><path d="M3 12h18a9 9 0 0 1-18 0zM7 12c1-4 3-6 5-8 2 2 4 4 5 8"/></symbol>
</defs>
</svg>

<div class="slide-group">
<h2 class="slide-group-title">문제: 서버 주방에만 없는 재료가 있어요</h2>

<section class="slide">
<h3>레시피만 보내면 맛이 달라져요</h3>
<svg class="dg" viewBox="0 0 400 320" role="img" aria-label="내 주방(내 노트북)에서 레시피(앱 코드)만 서버 주방(서버)으로 보내면 맛이 달라진다. 두 주방은 간장 종류(언어 버전), 고춧가루(라이브러리), 불 세기(설정 값)가 서로 달랐다는 그림. 각 쌍의 왼쪽은 내 주방, 오른쪽은 서버 주방이다">
<defs><marker id="m1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M108,78 L292,78" marker-end="url(#m1)"/>
<circle class="box" cx="65" cy="78" r="42"/><use class="ic" href="#i-house" x="39" y="52" width="52" height="52"/>
<circle class="box" cx="200" cy="78" r="32"/><use class="ic" href="#i-doc" x="178" y="56" width="44" height="44"/>
<circle class="bad" cx="335" cy="78" r="42"/><use class="ic" href="#i-house" x="309" y="52" width="52" height="52"/>
<text class="alert big" x="335" y="26">?</text>
<text class="big" x="65" y="144">내 주방</text><text class="small" x="65" y="163">내 노트북</text>
<text class="big" x="200" y="134">레시피만</text><text class="small" x="200" y="153">앱 코드</text>
<text class="big" x="335" y="144">서버 주방</text><text class="small" x="335" y="163">서버</text>
<g transform="translate(0,10)">
<rect class="line" x="10" y="174" width="380" height="128" rx="12"/>
<text class="label center" x="200" y="192">두 주방에서 달랐던 것</text>
<text class="small" x="44" y="210">내</text><text class="small" x="96" y="210">서버</text>
<text class="small" x="174" y="210">내</text><text class="small" x="226" y="210">서버</text>
<text class="small" x="304" y="210">내</text><text class="small" x="356" y="210">서버</text>
<circle class="kafka" cx="44" cy="234" r="19"/><use class="ic" href="#i-drop" x="30" y="220" width="28" height="28"/>
<circle class="bad" cx="96" cy="234" r="19"/><use class="ic" href="#i-drop" x="82" y="220" width="28" height="28"/>
<text class="chip" x="70" y="270">간장 종류</text><text class="small" x="70" y="288">언어 버전</text>
<circle class="kafka" cx="174" cy="234" r="19"/><use class="ic" href="#i-bowl" x="160" y="220" width="28" height="28"/>
<circle class="line dash" cx="226" cy="234" r="19"/><path class="line" d="M213,247 L239,221"/>
<text class="chip" x="200" y="270">고춧가루</text><text class="small" x="200" y="288">라이브러리</text>
<circle class="kafka" cx="304" cy="234" r="19"/><use class="ic" href="#i-flame" x="288" y="218" width="32" height="32"/>
<circle class="bad" cx="356" cy="234" r="19"/><use class="ic" href="#i-flame" x="347" y="225" width="18" height="18"/>
<text class="chip" x="330" y="270">불 세기</text><text class="small" x="330" y="288">설정 값</text>
</g>
<circle class="packet" r="5"><animateMotion dur="1.8s" begin="0s" repeatCount="indefinite" path="M108,78 L292,78"/></circle>
</svg>
<ol class="steps">
<li>서버는 앱을 늘 켜 두고 남이 쓰게 하는 컴퓨터예요</li>
<li>코드만 보내면 준비물(재료)은 옮겨지지 않아요</li>
<li>준비물이 다르면 같은 코드도 서버에서 멈춰요</li>
</ol>
</section>

<section class="slide">
<h3>서버를 늘릴 때마다 준비물을 또 맞춰요</h3>
<svg class="dg" viewBox="0 0 400 236" role="img" aria-label="내 주방(내 노트북)에서 서버 주방 세 곳으로 사람이 준비물을 하나씩 맞추러 가고 두 곳은 맞았지만 한 곳은 틀려서 앱이 멈추는 그림">
<defs><marker id="m2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M104,108 L266,56" marker-end="url(#m2)"/>
<path class="line" d="M106,118 L264,122" marker-end="url(#m2)"/>
<path class="line" d="M104,128 L266,186" marker-end="url(#m2)"/>
<circle class="box" cx="62" cy="118" r="40"/><use class="ic" href="#i-house" x="38" y="94" width="48" height="48"/>
<text class="big" x="62" y="180">내 주방</text><text class="small" x="62" y="200">내 노트북</text>
<text class="small" x="180" y="106">하나씩 손으로</text>
<circle class="box" cx="296" cy="52" r="26"/><use class="ic" href="#i-house" x="280" y="36" width="32" height="32"/>
<circle class="box" cx="296" cy="122" r="26"/><use class="ic" href="#i-house" x="280" y="106" width="32" height="32"/>
<circle class="box" cx="296" cy="192" r="26"/><use class="ic" href="#i-house" x="280" y="176" width="32" height="32"/>
<circle class="kafka" cx="346" cy="52" r="14"/><use class="ic" href="#i-check" x="336" y="42" width="20" height="20"/>
<circle class="kafka" cx="346" cy="122" r="14"/><use class="ic" href="#i-check" x="336" y="112" width="20" height="20"/>
<circle class="bad" cx="346" cy="192" r="14"/><use class="ic" href="#i-x" x="336" y="182" width="20" height="20"/>
<text class="small" x="296" y="14">서버 주방 1·2·3</text>
<text class="alert" x="320" y="230">하나만 틀려도 멈춰요</text>
</svg>
<ol class="steps">
<li>서버를 늘리면 사람이 준비물을 하나씩 맞춰요</li>
<li>오래 걸리고 한 곳만 틀려도 앱이 멈춰요</li>
</ol>
</section>

<details class="origin">
<summary>더 알아보기: 누가 왜 만들었을까?</summary>
<p>Docker는 <b>2013년 3월 15일</b> 미국 PyCon 2013에서 dotCloud의 <b>솔로몬 하익스(Solomon Hykes)</b>가 짧은 발표 "The Future of Linux Containers"로 처음 소개했어요. 같은 달 누구나 코드를 볼 수 있는 오픈 소스로 공개됐어요.</p>
<p>dotCloud는 고객의 앱을 자기 서버에서 대신 돌려 주는 회사였어요. 리눅스에서 앱을 칸막이로 나눠 돌리는 기술(리눅스 컨테이너)을 쓰고 있었는데 다루기가 복잡했어요. 이걸 누구나 쉽게 쓰게 만든 도구가 Docker이고 나중에 회사 이름도 Docker, Inc.로 바뀌었어요.</p>
<p>docker는 영어로 항구에서 배에 짐을 싣고 내리는 부두 노동자를 뜻해요. 컨테이너도 원래 배로 실어 나르는 규격 화물 상자를 부르는 말이에요.</p>
<p>참고: <a href="https://pyvideo.org/pycon-us-2013/the-future-of-linux-containers.html">PyCon 2013 발표 기록</a> · <a href="https://www.infoq.com/articles/docker-future/">InfoQ: Docker의 출발</a> · <a href="https://www.docker.com/resources/what-container/">Docker: 컨테이너란</a></p>
</details>
</div>

<div class="slide-group">
<h2 class="slide-group-title">포장: 앱과 준비물을 한 상자에 담아요</h2>

<section class="slide">
<h3>Docker는 앱과 준비물을 밀키트 상자에 담아요</h3>
<svg class="dg" viewBox="0 0 400 290" role="img" aria-label="레시피(앱 코드)와 간장(언어 버전)과 고춧가루(라이브러리)가 들어 있는 밀키트 상자(이미지)를 서버 주방과 동료 주방이 각각 받아 같은 맛을 내는 그림">
<defs><marker id="m3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M124,62 L272,62" marker-end="url(#m3)"/>
<path class="line" d="M112,98 L274,168" marker-end="url(#m3)"/>
<circle class="kafka" cx="80" cy="66" r="42"/><use class="ic" href="#i-box" x="54" y="40" width="52" height="52"/>
<text class="big" x="80" y="126">밀키트 상자</text><text class="small" x="80" y="145">이미지</text>
<rect class="line" x="10" y="158" width="140" height="122" rx="10"/>
<text class="label center" x="80" y="176">상자 안</text>
<circle class="box" cx="38" cy="204" r="17"/><use class="ic" href="#i-doc" x="27" y="193" width="22" height="22"/>
<circle class="box" cx="80" cy="204" r="17"/><use class="ic" href="#i-drop" x="69" y="193" width="22" height="22"/>
<circle class="box" cx="122" cy="204" r="17"/><use class="ic" href="#i-bowl" x="111" y="193" width="22" height="22"/>
<text class="chip" x="38" y="238">레시피</text><text class="chip" x="80" y="238">간장</text><text class="chip" x="122" y="238">고춧가루</text>
<text class="small" x="38" y="258">앱 코드</text><text class="small" x="80" y="258">언어 버전</text><text class="small" x="122" y="258">라이브러리</text>
<circle class="box" cx="310" cy="62" r="32"/><use class="ic" href="#i-house" x="290" y="42" width="40" height="40"/>
<text class="big" x="310" y="112">서버 주방</text><text class="small" x="310" y="136">같은 맛</text>
<circle class="box" cx="310" cy="176" r="32"/><use class="ic" href="#i-house" x="290" y="156" width="40" height="40"/>
<text class="big" x="310" y="226">동료 주방</text><text class="small" x="310" y="250">같은 맛</text>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0s" repeatCount="indefinite" path="M124,62 L272,62"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="0.6s" repeatCount="indefinite" path="M112,98 L274,168"/></circle>
</svg>
<ol class="steps">
<li>Docker는 컴퓨터에 설치해 쓰는 프로그램이에요</li>
<li>밀키트 상자(이미지)에 앱과 준비물을 함께 담아요</li>
<li>내용을 바꾸려면 상자를 고치지 않고 새로 포장해요</li>
</ol>
<p class="more">참고: <a href="https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/">Docker: 이미지란</a></p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>포장 지시서대로 파일을 층층이 담아요</h3>
<svg class="dg" viewBox="0 0 400 230" role="img" aria-label="왼쪽 Dockerfile의 1 FROM python:3.12, 2 COPY requirements.txt, 3 RUN 라이브러리 설치, 4 COPY 앱 코드 네 줄이 오른쪽 이미지에서 같은 번호의 층이 되어 1번이 바닥, 4번이 맨 위로 쌓이는 그림">
<defs><marker id="m4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="label" x="8" y="14">Dockerfile (지시서)</text>
<text class="label" x="218" y="14">이미지 (읽기 전용)</text>
<rect class="box" x="8" y="30" width="180" height="34" rx="5"/><text class="chip" x="98" y="47">1 FROM python:3.12</text>
<rect class="box" x="8" y="74" width="180" height="34" rx="5"/><text class="chip" x="98" y="91">2 COPY requirements.txt</text>
<rect class="box" x="8" y="118" width="180" height="34" rx="5"/><text class="chip" x="98" y="135">3 RUN 라이브러리 설치</text>
<rect class="box" x="8" y="162" width="180" height="34" rx="5"/><text class="chip" x="98" y="179">4 COPY 앱 코드</text>
<path class="line" d="M190,112 L214,112" marker-end="url(#m4)"/>
<rect class="kafka" x="218" y="162" width="174" height="34" rx="5"/><text class="chip" x="305" y="179">1 바탕 (Python)</text>
<rect class="kafka" x="218" y="118" width="174" height="34" rx="5"/><text class="chip" x="305" y="135">2 라이브러리 목록</text>
<rect class="kafka" x="218" y="74" width="174" height="34" rx="5"/><text class="chip" x="305" y="91">3 설치한 라이브러리</text>
<rect class="kafka" x="218" y="30" width="174" height="34" rx="5"/><text class="chip" x="305" y="47">4 앱 코드</text>
<text class="small" x="305" y="217">1번이 바닥이고 위로 쌓아요</text>
</svg>
<ol class="steps">
<li>지시서(Dockerfile)대로 만드는 일이 빌드예요</li>
<li>바탕(기본 이미지)이 내 컴퓨터에 없으면 인터넷에서 받아 와요</li>
<li>다시 빌드하면 바뀐 층부터 새로 만들어요</li>
</ol>
<p class="more">층을 다시 쓰는 법은 <a href="{{ '/2026/11/15/image-layers-build-cache/' | relative_url }}">5편 레이어와 빌드 캐시</a>에서 봐요</p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. Dockerfile은 어디에 어떤 이름으로 만들고, 빌드는 어떻게 하나요?</summary>
<p>A. 보통 앱 코드 폴더 맨 위에 <code>Dockerfile</code>이라는 이름의 글자 파일로 만들어요. 빌드는 Docker에게 그 폴더를 알려 주고 지시서대로 상자를 만들라고 시키는 일이에요. 만든 상자를 마트에 올리고 받아서 실행하는 것도 모두 Docker에게 시켜요.</p>
</details>
</aside>
</div>
</div>

<div class="slide-group">
<h2 class="slide-group-title">조리대: 이미지를 나눠 받아 따로 실행해요</h2>

<section class="slide">
<h3>상자 하나로 여러 조리대를 차려요</h3>
<svg class="dg" viewBox="0 0 400 196" role="img" aria-label="밀키트 상자 하나에서 화살표가 조리대 세 곳으로 이어져 원본 상자는 그대로 둔 채 조리대마다 따로 요리하는 그림">
<defs><marker id="m5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M188,64 L82,106" marker-end="url(#m5)"/>
<path class="line" d="M200,68 L200,100" marker-end="url(#m5)"/>
<path class="line" d="M212,64 L318,106" marker-end="url(#m5)"/>
<circle class="kafka" cx="200" cy="38" r="28"/><use class="ic" href="#i-box" x="182" y="20" width="36" height="36"/>
<text class="small" x="240" y="38" style="text-anchor:start">원본은 그대로</text>
<circle class="box" cx="70" cy="134" r="30"/><use class="ic" href="#i-pot" x="50" y="114" width="40" height="40"/>
<circle class="box" cx="200" cy="134" r="30"/><use class="ic" href="#i-pot" x="180" y="114" width="40" height="40"/>
<circle class="box" cx="330" cy="134" r="30"/><use class="ic" href="#i-pot" x="310" y="114" width="40" height="40"/>
<text class="chip" x="70" y="182">조리대 1</text><text class="chip" x="200" y="182">조리대 2</text><text class="chip" x="330" y="182">조리대 3</text>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0s" repeatCount="indefinite" path="M188,64 L82,106"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.4s" repeatCount="indefinite" path="M200,68 L200,100"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.8s" repeatCount="indefinite" path="M212,64 L318,106"/></circle>
</svg>
<ol class="steps">
<li>조리대(컨테이너)는 상자를 열어 실행 중인 앱이에요</li>
<li>같은 상자로 조리대를 여러 개 차려요</li>
<li>한 조리대에서 바꾼 것은 옆 조리대에 섞이지 않아요</li>
</ol>
</section>

<section class="slide">
<h3>각 조리대에는 따로 쓰는 공간이 있어요</h3>
<svg class="dg" viewBox="0 0 400 270" role="img" aria-label="읽기 전용 밀키트 상자(이미지) 하나로 조리대 세 개를 차리고 조리대마다 자기 쓰기 층이 있다. 남길 데이터가 있는 조리대 3은 바깥 냉장고(볼륨)에 연결한다">
<defs><marker id="m6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M188,64 L82,104" marker-end="url(#m6)"/>
<path class="line" d="M200,68 L200,100" marker-end="url(#m6)"/>
<path class="line" d="M212,64 L318,104" marker-end="url(#m6)"/>
<circle class="kafka" cx="200" cy="38" r="28"/><use class="ic" href="#i-box" x="182" y="20" width="36" height="36"/>
<text class="big" x="240" y="34" style="text-anchor:start">상자</text><text class="small" x="240" y="54" style="text-anchor:start">이미지 · 읽기 전용</text>
<circle class="box" cx="70" cy="132" r="28"/><use class="ic" href="#i-pot" x="52" y="114" width="36" height="36"/>
<circle class="box" cx="200" cy="132" r="28"/><use class="ic" href="#i-pot" x="182" y="114" width="36" height="36"/>
<circle class="box" cx="330" cy="132" r="28"/><use class="ic" href="#i-pot" x="312" y="114" width="36" height="36"/>
<text class="chip" x="70" y="180">쓰기 층 1</text><text class="chip" x="200" y="180">쓰기 층 2</text><text class="chip" x="330" y="180">쓰기 층 3</text>
<path class="line dash" d="M330,192 L330,210"/>
<circle class="new" cx="330" cy="234" r="22"/><use class="ic" href="#i-fridge" x="316" y="220" width="28" height="28"/>
<text class="big" x="296" y="232" style="text-anchor:end">냉장고</text><text class="small" x="296" y="252" style="text-anchor:end">볼륨 · 필요한 조리대만</text>
</svg>
<ol class="steps">
<li>새 파일은 그 조리대의 쓰기 층에 생겨요</li>
<li>조리대를 치우면 쓰기 층도 같이 사라져요</li>
<li>지워지면 안 될 파일은 냉장고(볼륨)에 넣어요</li>
</ol>
<p class="more">냉장고는 <a href="{{ '/2026/11/15/docker-volume/' | relative_url }}">2편 볼륨</a>, 비밀번호 넘기기는 <a href="{{ '/2026/11/15/compose/' | relative_url }}">4편 Compose</a>에서 봐요</p>
</section>

<section class="slide">
<h3>다른 주방도 마트에서 상자를 받아요</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="포장 공장(개발자)이 밀키트 상자를 마트 진열대(레지스트리, 예를 들어 Docker Hub)에 올리고 서버 주방(서버)과 동료 주방(동료 노트북)이 같은 상자의 사본을 받아 가는 흐름">
<defs><marker id="m7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M93,96 L161,96" marker-end="url(#m7)"/>
<path class="line" d="M232,86 L316,46" marker-end="url(#m7)"/>
<path class="line" d="M232,106 L316,122" marker-end="url(#m7)"/>
<circle class="box" cx="55" cy="96" r="36"/><use class="ic" href="#i-factory" x="33" y="74" width="44" height="44"/>
<text class="big" x="55" y="148">포장 공장</text><text class="small" x="55" y="168">개발자</text>
<text class="chip" x="127" y="80">올리기</text>
<text class="chip" x="262" y="54">받기</text><text class="chip" x="276" y="132">받기</text>
<circle class="kafka" cx="200" cy="96" r="36"/><use class="ic" href="#i-store" x="178" y="74" width="44" height="44"/>
<text class="big" x="200" y="148">마트 진열대</text><text class="small" x="200" y="168">레지스트리</text><text class="small" x="200" y="188">예: Docker Hub</text>
<circle class="box" cx="350" cy="36" r="26"/><use class="ic" href="#i-house" x="334" y="20" width="32" height="32"/>
<text class="chip" x="350" y="76">서버 주방</text><text class="small" x="350" y="94">서버</text>
<circle class="box" cx="350" cy="134" r="26"/><use class="ic" href="#i-house" x="334" y="118" width="32" height="32"/>
<text class="chip" x="350" y="174">동료 주방</text><text class="small" x="350" y="192">동료 노트북</text>
</svg>
<ol class="steps">
<li>개발자는 마트(레지스트리)에 이미지를 올려요(push)</li>
<li>서버가 사본을 받아도(pull) 원본은 마트에 남아요</li>
<li>서버에도 Docker가 깔려 있어야 받아서 실행해요(run)</li>
</ol>
<p class="more">참고: <a href="https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-registry/">Docker: 레지스트리와 Docker Hub</a></p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">커널: 운영체제의 핵심을 함께 써요</h2>

<section class="slide">
<h3>조리대들은 커널 하나를 함께 써요</h3>
<svg class="dg" viewBox="0 0 400 232" role="img" aria-label="서버 주방 하나 안에 칸막이로 나눈 조리대 세 개가 있고 모두 바닥의 공용 설비(커널) 하나를 함께 쓰는 그림">
<rect class="line" x="6" y="6" width="388" height="220" rx="12"/>
<text class="label center" x="200" y="28">서버 주방 하나</text>
<path class="line" d="M145,46 L145,132 M255,46 L255,132"/>
<circle class="box" cx="90" cy="78" r="30"/><use class="ic" href="#i-pot" x="70" y="58" width="40" height="40"/>
<circle class="box" cx="200" cy="78" r="30"/><use class="ic" href="#i-pot" x="180" y="58" width="40" height="40"/>
<circle class="box" cx="310" cy="78" r="30"/><use class="ic" href="#i-pot" x="290" y="58" width="40" height="40"/>
<text class="chip" x="90" y="126">조리대 1</text><text class="chip" x="200" y="126">조리대 2</text><text class="chip" x="310" y="126">조리대 3</text>
<text class="small" x="145" y="148">칸막이</text><text class="small" x="255" y="148">칸막이</text>
<rect class="kafka" x="24" y="160" width="352" height="54" rx="8"/>
<use class="ic" href="#i-plug" x="104" y="169" width="36" height="36"/>
<text class="big" x="210" y="184">공용 설비</text><text class="small" x="210" y="204">커널</text>
</svg>
<ol class="steps">
<li>커널은 운영체제(OS)의 핵심으로 CPU·메모리를 앱에 나눠 줘요</li>
<li>커널 말고 앱이 쓸 OS 파일은 이미지에 들어 있어요</li>
<li>칸막이(네임스페이스)는 옆 조리대가 안 보이게 해요</li>
</ol>
</section>

<section class="slide">
<h3>컨테이너는 가상 머신보다 가벼워요</h3>
<svg class="dg" viewBox="0 0 400 282" role="img" aria-label="두 카드 모두 같은 서버 컴퓨터와 서버 OS·커널 위에 앱 두 개를 올린다. 왼쪽 가상 머신은 그 위에 하이퍼바이저와 앱마다 커널이 든 게스트 OS를 더 쌓아 높고 무겁다. 오른쪽 컨테이너는 Docker만 올리고 서버 OS의 커널을 함께 써서 낮고 가볍다">
<rect class="line" x="6" y="6" width="190" height="270" rx="12"/>
<text class="label center" x="101" y="26">가상 머신</text><text class="small" x="101" y="42">컴퓨터 속 가짜 컴퓨터</text>
<circle class="box" cx="58" cy="72" r="20"/><use class="ic" href="#i-pot" x="44" y="58" width="28" height="28"/>
<circle class="box" cx="144" cy="72" r="20"/><use class="ic" href="#i-pot" x="130" y="58" width="28" height="28"/>
<text class="chip" x="58" y="104">앱·준비물</text><text class="chip" x="144" y="104">앱·준비물</text>
<rect class="bad" x="18" y="112" width="80" height="54" rx="5"/><text class="chip" x="58" y="134">게스트 OS</text><text class="small" x="58" y="154">커널 포함</text>
<rect class="bad" x="104" y="112" width="80" height="54" rx="5"/><text class="chip" x="144" y="134">게스트 OS</text><text class="small" x="144" y="154">커널 포함</text>
<rect class="box" x="18" y="174" width="166" height="26" rx="5"/><text class="chip" x="101" y="187">하이퍼바이저</text>
<rect class="box" x="18" y="208" width="166" height="26" rx="5"/><text class="chip" x="101" y="221">서버 OS·커널</text>
<rect class="box" x="18" y="242" width="166" height="26" rx="5"/><text class="chip" x="101" y="255">서버 컴퓨터</text>
<rect class="line" x="204" y="92" width="190" height="184" rx="12"/>
<text class="label center" x="299" y="112">컨테이너</text>
<circle class="box" cx="256" cy="140" r="20"/><use class="ic" href="#i-pot" x="242" y="126" width="28" height="28"/>
<circle class="box" cx="342" cy="140" r="20"/><use class="ic" href="#i-pot" x="328" y="126" width="28" height="28"/>
<text class="chip" x="256" y="170">앱·준비물</text><text class="chip" x="342" y="170">앱·준비물</text>
<rect class="box" x="216" y="176" width="166" height="26" rx="5"/><text class="chip" x="299" y="189">Docker 프로그램</text>
<rect class="kafka" x="216" y="208" width="166" height="26" rx="5"/><text class="chip" x="299" y="221">서버 OS·커널 함께 써요</text>
<rect class="box" x="216" y="242" width="166" height="26" rx="5"/><text class="chip" x="299" y="255">서버 컴퓨터</text>
</svg>
<ol class="steps">
<li>가상 머신은 앱마다 자기 OS(게스트 OS)를 통째로 켜요</li>
<li>하이퍼바이저는 한 컴퓨터를 가상 머신 여러 대로 쪼개요</li>
<li>컨테이너는 서버의 커널을 빌려 써서 금방 시작해요</li>
</ol>
<p class="more">참고: <a href="https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/">Docker: 컨테이너란</a></p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">판단: 언제 쓰고 무엇을 조심해요?</h2>

<section class="slide">
<h3>이럴 때 써요, 이럴 땐 안 써요</h3>
<svg class="dg" viewBox="0 0 400 206" role="img" aria-label="왼쪽 컨테이너를 써요 카드에는 서버를 여러 대로 늘려요, 여럿이 같은 준비물을 써요가 있고 오른쪽 가상 머신을 써요 카드에는 다른 OS 앱을 돌려요, 보안 벽이 더 필요해요가 있는 그림">
<rect class="line" x="6" y="6" width="190" height="194" rx="12"/>
<circle class="kafka" cx="101" cy="40" r="20"/><use class="ic" href="#i-check" x="89" y="28" width="24" height="24"/>
<text class="label center" x="101" y="80">컨테이너를 써요</text>
<rect class="box" x="20" y="102" width="162" height="34" rx="8"/><text class="chip" x="101" y="119">서버를 여러 대로 늘려요</text>
<rect class="box" x="20" y="146" width="162" height="34" rx="8"/><text class="chip" x="101" y="163">여럿이 같은 준비물을 써요</text>
<rect class="line" x="204" y="6" width="190" height="194" rx="12"/>
<circle class="box" cx="299" cy="40" r="20"/><use class="ic" href="#i-check" x="287" y="28" width="24" height="24"/>
<text class="label center" x="299" y="80">가상 머신을 써요</text>
<rect class="box" x="218" y="102" width="162" height="34" rx="8"/><text class="chip" x="299" y="119">다른 OS 앱을 돌려요</text>
<rect class="box" x="218" y="146" width="162" height="34" rx="8"/><text class="chip" x="299" y="163">보안 벽이 더 필요해요</text>
</svg>
<ol class="steps">
<li>서버를 늘려도 같은 상자만 받으면 돼요</li>
<li>다른 OS나 보안 벽이 필요하면 가상 머신을 써요</li>
</ol>
<p class="more">참고: <a href="https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/">Docker: 컨테이너란</a> · <a href="https://learn.microsoft.com/en-us/virtualization/windowscontainers/about/containers-vs-vm">Microsoft: 컨테이너와 가상 머신</a></p>
</section>

<section class="slide">
<h3>상자는 칩에 맞는 판이 있어야 돌아요</h3>
<svg class="dg" viewBox="0 0 400 214" role="img" aria-label="왼쪽 amd64 컴퓨터(대부분 PC·서버)는 amd64 판 상자를 받아 실행된다. 오른쪽 arm64 컴퓨터(예: 애플 M 칩 맥)는 amd64 판만 있는 상자를 받아 흉내 내기(에뮬레이션)로만 돌고 느릴 수 있는 예시예요">
<rect class="line" x="7" y="8" width="191" height="198" rx="12"/>
<text class="label center" x="102.5" y="32">amd64 컴퓨터</text><text class="small" x="102.5" y="50">대부분 PC·서버</text>
<circle class="box" cx="102.5" cy="100" r="32"/><use class="ic" href="#i-box" x="80.5" y="78" width="44" height="44"/>
<circle class="kafka" cx="140" cy="70" r="14"/><use class="ic" href="#i-check" x="130" y="60" width="20" height="20"/>
<text class="chip" x="102.5" y="156">amd64 판</text><text class="small" x="102.5" y="182">잘 돌아요</text>
<rect class="line" x="202" y="8" width="191" height="198" rx="12"/>
<text class="label center" x="297.5" y="32">arm64 컴퓨터</text><text class="small" x="297.5" y="50">예: 애플 M 칩 맥</text>
<circle class="bad" cx="297.5" cy="100" r="32"/><use class="ic" href="#i-box" x="275.5" y="78" width="44" height="44"/>

<text class="chip" x="297.5" y="156">amd64 판만</text><text class="alert" x="297.5" y="182">흉내 내면 돌지만 느릴 수 있어요</text>
</svg>
<ol class="steps">
<li>칩(CPU) 종류마다 이미지 판을 따로 만들어요</li>
<li>여러 판을 묶은 이미지면 Docker가 맞는 판을 골라요</li>
<li>맞는 판이 없으면 흉내 내기(에뮬레이션)로 돌려요</li>
</ol>
<p class="more">참고: <a href="https://docs.docker.com/build/building/multi-platform/">Docker: 멀티 플랫폼 이미지</a></p>
</section>

<section class="slide">
<h3>Mac·Windows에선 리눅스 가상 머신 하나를 켜요</h3>
<svg class="dg" viewBox="0 0 400 236" role="img" aria-label="Mac·Windows 컴퓨터 안에 Docker Desktop이 리눅스 가상 머신 하나를 켜고 그 안의 조리대 세 개가 리눅스 커널 하나를 함께 쓰는 그림">
<rect class="line" x="6" y="6" width="388" height="224" rx="12"/>
<text class="label center" x="200" y="28">Mac·Windows 컴퓨터</text>
<rect class="new" x="24" y="44" width="352" height="170" rx="10"/>
<text class="chip" x="200" y="64">리눅스 가상 머신 하나</text>
<circle class="box" cx="100" cy="104" r="26"/><use class="ic" href="#i-pot" x="84" y="88" width="32" height="32"/>
<circle class="box" cx="200" cy="104" r="26"/><use class="ic" href="#i-pot" x="184" y="88" width="32" height="32"/>
<circle class="box" cx="300" cy="104" r="26"/><use class="ic" href="#i-pot" x="284" y="88" width="32" height="32"/>
<text class="chip" x="100" y="146">조리대 1</text><text class="chip" x="200" y="146">조리대 2</text><text class="chip" x="300" y="146">조리대 3</text>
<rect class="kafka" x="44" y="162" width="312" height="36" rx="8"/><text class="chip" x="200" y="180">리눅스 커널 하나</text>
</svg>
<ol class="steps">
<li>조리대는 리눅스 커널을 빌리는데 Mac·Windows엔 없어요</li>
<li>Docker Desktop은 Mac·Windows에 설치하는 Docker예요</li>
<li>가상 머신은 하나뿐이라 조리대는 여전히 가벼워요</li>
</ol>
<p class="more">참고: <a href="https://docs.docker.com/desktop/features/vmm/">Mac의 Docker Desktop VM</a> · <a href="https://docs.docker.com/desktop/features/wsl/">Windows의 WSL 2</a></p>
</section>
</div>

</div>
