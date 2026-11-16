---
layout: post
title: "왜 두 번째 포장은 빠를까? 밀키트로 이해하는 Docker 이미지 레이어와 빌드 캐시"
description: "밀키트 트레이 비유로 Dockerfile 명령이 이미지 레이어가 되는 방식과 레이어 공유, 빌드 캐시가 재사용되고 깨지는 조건, 자주 바뀌는 것을 뒤에 두는 명령 순서와 .dockerignore를 설명합니다."
date: 2026-11-15 21:40:00 +0900
series: docker
episode: 5
summary: "이미지는 칸마다 봉인한 트레이를 쌓은 상자예요. 바뀌지 않은 칸은 창고에서 꺼내 다시 쓰니까 자주 바뀌는 재료를 맨 위에 두면 다시 포장이 빨라져요."
---

<div class="lesson lesson-hierarchy">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: Lucide (lucide-static v1.25.0, ISC). 라이선스: assets/icons/LICENSE-lucide.txt. -->
<symbol id="i-doc" viewBox="0 0 24 24"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2zM14 2v5a1 1 0 0 0 1 1h5M10 9H8M16 13H8M16 17H8"/></symbol>
<symbol id="i-drop" viewBox="0 0 24 24"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></symbol>
<symbol id="i-box" viewBox="0 0 24 24"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73zM12 22V12M3.29 7 12 12 20.71 7M7.5 4.27l9 5.15"/></symbol>
<symbol id="i-factory" viewBox="0 0 24 24"><path d="M12 16h.01M16 16h.01M3 19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a.5.5 0 0 0-.769-.422l-4.462 2.844A.5.5 0 0 1 15 10.5v-2a.5.5 0 0 0-.769-.422L9.77 10.922A.5.5 0 0 1 9 10.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2zM8 16h.01"/></symbol>
<symbol id="i-layers" viewBox="0 0 24 24"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83zM2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></symbol>
<symbol id="i-soup" viewBox="0 0 24 24"><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9ZM7 21h10M19.5 12 22 6M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62M11.25 3c.27.1.8.53.74 1.36-.05.83-.93 1.2-.98 2.02-.06.78.33 1.24.72 1.62M6.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.74 1.62"/></symbol>
<symbol id="i-carrot" viewBox="0 0 24 24"><path d="M15 16a1 1 0 0 0-7-7q-4 4-5.987 12.385a.5.5 0 0 0 .602.602Q11 20 15 16l-3-3M15 9q4 4 7 0-3-4-7 0 4-4 0-7-4 3 0 7M8 15l-2.58-2.58"/></symbol>
<symbol id="i-hourglass" viewBox="0 0 24 24"><path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></symbol>
<symbol id="i-warehouse" viewBox="0 0 24 24"><path d="M18 21V10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v11M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 1.132-1.803l7.95-3.974a2 2 0 0 1 1.837 0l7.948 3.974A2 2 0 0 1 22 8zM6 13h12M6 17h12"/></symbol>
<symbol id="i-tag" viewBox="0 0 24 24"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></symbol>
</defs>
</svg>

<div class="intro">
<p class="q">코드 한 줄만 고쳤는데 어떤 빌드는 몇 초 만에 끝나고 어떤 빌드는 몇 분이 걸릴까요?</p>
<p>1편에서 Docker가 Dockerfile을 위에서부터 읽으며 이미지를 층층이 쌓는다고 했어요. 개발하다 보면 코드를 고칠 때마다 이미지를 다시 빌드하는데 명령 순서를 잘못 쓴 Dockerfile은 매번 라이브러리 설치부터 다시 해서 오래 걸려요.</p>
<p>이 글을 다 읽으면 Dockerfile 명령이 <b>레이어</b>가 되는 방식과 이미지와 컨테이너가 레이어를 나눠 쓰는 이유를 알 수 있어요. <b>빌드 캐시</b>가 언제 다시 쓰이고 언제 깨지는지와 자주 바뀌는 것을 뒤에 두는 명령 순서도 함께 봐요.</p>
</div>

<div class="slide-group">
<h2 class="slide-group-title">무엇이 문제인가: 고명만 바꿨는데 처음부터 다시 포장</h2>

<section class="slide">
<h3>고명 하나 바꿨는데 상자를 처음부터 다시 담아요</h3>
<svg class="dg" viewBox="0 0 400 262" role="img" aria-label="포장 지시서에서 고명만 바꿨는데 포장 공장이 육수 끓이기와 소스 만들기와 고명 담기를 모두 처음부터 다시 해서 오래 걸리는 그림">
<defs><marker id="l1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M96,66 L152,66" marker-end="url(#l1)"/>
<path class="line" d="M248,66 L300,66" marker-end="url(#l1)"/>
<circle class="box" cx="62" cy="66" r="32"/><use class="ic" href="#i-doc" x="42" y="46" width="40" height="40"/>
<text class="big" x="62" y="118">포장 지시서</text><text class="alert" x="62" y="137">고명만 바꿈</text>
<circle class="bad" cx="200" cy="66" r="42"/><use class="ic" href="#i-factory" x="174" y="40" width="52" height="52"/>
<text class="big" x="200" y="128">포장 공장</text>
<circle class="bad" cx="338" cy="66" r="32"/><use class="ic" href="#i-hourglass" x="318" y="46" width="40" height="40"/>
<text class="big" x="338" y="118">또 기다림</text>
<rect class="line" x="10" y="152" width="380" height="100" rx="12"/>
<text class="label center" x="200" y="172">처음부터 다시 하는 일</text>
<circle class="bad" cx="80" cy="202" r="19"/><use class="ic" href="#i-soup" x="66" y="188" width="28" height="28"/>
<text class="chip" x="80" y="234">육수 끓이기</text>
<circle class="bad" cx="200" cy="202" r="19"/><use class="ic" href="#i-carrot" x="186" y="188" width="28" height="28"/>
<text class="chip" x="200" y="234">소스 만들기</text>
<circle class="bad" cx="320" cy="202" r="19"/><use class="ic" href="#i-drop" x="306" y="188" width="28" height="28"/>
<text class="chip" x="320" y="234">고명 담기</text>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0s" repeatCount="indefinite" path="M96,66 L152,66"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.7s" repeatCount="indefinite" path="M248,66 L300,66"/></circle>
</svg>
<p class="point">고명 한 가지만 바꿔도 공장이 상자 전체를 처음부터 다시 담으면 오래 걸려요.</p>
<p class="explain">지시서에 고명을 맨 먼저 담도록 적어 두면 고명이 바뀔 때 공장은 육수를 다시 끓이고 소스를 다시 만든 뒤 고명을 담아요. 실제로 바뀐 건 고명뿐인데 시간 대부분을 바뀌지 않은 일을 되풀이하는 데 써요. 비유에서 육수는 기본 이미지이고 소스는 라이브러리 설치이며 고명은 날마다 고치는 앱 코드예요.</p>
</section>

<section class="slide">
<h3>실제로는: 코드 한 줄 고칠 때마다 빌드를 기다려요</h3>
<table>
<thead><tr><th>빌드 단계</th><th>하는 일</th><th>걸리는 시간(예)</th></tr></thead>
<tbody>
<tr><td>기본 이미지 준비</td><td>Python 이미지를 레지스트리에서 받아요</td><td>수십 초</td></tr>
<tr><td>라이브러리 설치</td><td>앱이 쓰는 라이브러리를 내려받아 설치해요</td><td>수 분</td></tr>
<tr><td>앱 코드 복사</td><td>내가 고친 파일을 넣어요</td><td>1초 남짓</td></tr>
</tbody>
</table>
<p class="point">고친 건 코드 한 줄인데 빌드 시간은 대부분 바뀌지 않은 준비물을 다시 만드는 데 들어가요.</p>
<p class="explain">빌드는 Docker가 Dockerfile을 읽어 이미지를 만드는 일이에요. 개발자는 하루에도 여러 번 코드를 고치고 다시 빌드하는데 그때마다 라이브러리를 새로 설치하면 기다리는 시간이 쌓여요. Docker는 이전 빌드에서 만든 층을 기억해 두었다가 바뀌지 않은 층은 다시 만들지 않는 방법으로 이 문제를 풀어요.</p>
</section>

<details class="origin">
<summary>더 알아보기: 지금의 빌드 엔진은 언제 생겼을까?</summary>
<p>지금 <code>docker build</code>를 실행하면 <b>BuildKit</b>이라는 빌드 엔진이 Dockerfile을 읽고 캐시를 관리해요. BuildKit은 Docker의 오픈 소스 프로젝트인 Moby에서 예전 빌더를 대신하려고 만들었어요. 이름은 영어 build(빌드)와 kit(도구 모음)를 합친 말이에요.</p>
<p>BuildKit은 2018년 <b>Docker 18.09</b>에 처음 들어왔지만 그때는 <code>DOCKER_BUILDKIT=1</code>을 직접 켜야 쓸 수 있었어요. 2023년 2월 1일에 나온 <b>Docker Engine 23.0</b>부터 리눅스에서 기본 빌더가 됐고 지금은 Docker Desktop에서도 기본이에요. 다만 Windows 컨테이너 이미지를 빌드할 때는 아직 예전 빌더를 써요.</p>
<p>참고: <a href="https://docs.docker.com/build/buildkit/">BuildKit</a> · <a href="https://docs.docker.com/engine/release-notes/23.0/">Docker Engine 23.0 릴리스 노트</a> · <a href="https://medium.com/@tonistiigi/build-secrets-and-ssh-forwarding-in-docker-18-09-ae8161d066">Docker 18.09의 BuildKit 소개</a></p>
</details>
</div>

<div class="slide-group">
<h2 class="slide-group-title">레이어: 칸마다 따로 봉인한 트레이</h2>

<section class="slide">
<h3>상자 속 재료를 칸칸이 트레이에 담아 쌓아요</h3>
<svg class="dg" viewBox="0 0 400 236" role="img" aria-label="밀키트 상자 안에 육수 베이스 트레이를 바닥에 두고 소스 트레이와 소스 트레이와 고명 트레이를 차례로 얹어 칸마다 따로 봉인한 그림">
<circle class="kafka" cx="66" cy="104" r="42"/><use class="ic" href="#i-box" x="40" y="78" width="52" height="52"/>
<text class="big" x="66" y="168">밀키트 상자</text>
<path class="line dash" d="M110,104 L140,104"/>
<rect class="kafka" x="146" y="24" width="244" height="52" rx="8"/>
<circle class="box" cx="176" cy="50" r="17"/><use class="ic" href="#i-drop" x="165" y="39" width="22" height="22"/>
<text class="chip" x="290" y="50">3층 · 고명</text>
<rect class="kafka" x="146" y="84" width="244" height="52" rx="8"/>
<circle class="box" cx="176" cy="110" r="17"/><use class="ic" href="#i-carrot" x="165" y="99" width="22" height="22"/>
<text class="chip" x="290" y="110">2층 · 소스</text>
<rect class="kafka" x="146" y="144" width="244" height="52" rx="8"/>
<circle class="box" cx="176" cy="170" r="17"/><use class="ic" href="#i-soup" x="165" y="159" width="22" height="22"/>
<text class="chip" x="290" y="170">1층 · 육수 베이스</text>
<text class="small" x="268" y="220">아래 칸부터 차례로 얹고 칸마다 봉인해요</text>
</svg>
<p class="point">공장은 지시서 한 줄마다 트레이 하나를 채워 봉인하고 아래 칸부터 차례로 쌓아요.</p>
<p class="explain">공장은 육수 베이스를 담은 트레이를 바닥에 두고 소스와 고명 트레이를 그 위에 얹어요. 트레이마다 따로 봉인했기 때문에 다 만든 상자에서 칸 하나를 꺼내 다른 상자에 다시 쓸 수 있어요.</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>실제로는: 레이어는 명령이 바꾼 파일만 담은 층이에요</h3>
<svg class="dg" viewBox="0 0 400 262" role="img" aria-label="왼쪽 Dockerfile의 FROM python, COPY requirements.txt, RUN pip install, COPY 점 점 네 줄이 오른쪽에서 Python 기본 층, 목록 파일 추가, 설치한 라이브러리 추가, 앱 코드 추가 레이어가 되고 LABEL 줄은 파일 층 없이 이미지 정보에만 기록되는 그림">
<defs><marker id="l2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="label" x="10" y="14">Dockerfile</text>
<text class="label" x="210" y="14">이미지 레이어 (읽기 전용)</text>
<rect class="box" x="10" y="30" width="170" height="34" rx="5"/><text class="chip" x="95" y="47">FROM python</text>
<rect class="box" x="10" y="72" width="170" height="34" rx="5"/><text class="chip" x="95" y="89">COPY requirements.txt</text>
<rect class="box" x="10" y="114" width="170" height="34" rx="5"/><text class="chip" x="95" y="131">RUN pip install</text>
<rect class="box" x="10" y="156" width="170" height="34" rx="5"/><text class="chip" x="95" y="173">COPY . .</text>
<rect class="box" x="10" y="198" width="170" height="34" rx="5"/><text class="chip" x="95" y="215">LABEL 만든 사람</text>
<path class="line" d="M180,47 L206,47" marker-end="url(#l2)"/>
<path class="line" d="M180,89 L206,89" marker-end="url(#l2)"/>
<path class="line" d="M180,131 L206,131" marker-end="url(#l2)"/>
<path class="line" d="M180,173 L206,173" marker-end="url(#l2)"/>
<path class="line dash" d="M180,215 L214,215" marker-end="url(#l2)"/>
<rect class="kafka" x="210" y="30" width="180" height="34" rx="5"/><text class="chip" x="300" y="47">Python 기본 층들</text>
<rect class="kafka" x="210" y="72" width="180" height="34" rx="5"/><text class="chip" x="300" y="89">+ 목록 파일</text>
<rect class="kafka" x="210" y="114" width="180" height="34" rx="5"/><text class="chip" x="300" y="131">+ 설치한 라이브러리</text>
<rect class="kafka" x="210" y="156" width="180" height="34" rx="5"/><text class="chip" x="300" y="173">+ 앱 코드</text>
<circle class="box" cx="236" cy="215" r="17"/><use class="ic" href="#i-tag" x="225" y="204" width="22" height="22"/>
<text class="small" x="264" y="215" style="text-anchor:start">이미지 정보에만 적어요</text>
<text class="small" x="200" y="252">실행할 때는 층을 겹쳐 폴더 하나처럼 보여 줘요</text>
</svg>
<p class="point">레이어는 명령 하나가 더하거나 고치거나 지운 파일만 담은 읽기 전용 층이에요.</p>
<p class="explain">개발자가 빌드하면 Docker는 RUN·COPY·ADD처럼 파일을 바꾸는 명령마다 그 명령이 바꾼 파일만 모아 레이어로 저장해요. LABEL이나 CMD(컨테이너가 시작될 때 실행할 명령을 정하는 줄)처럼 설명과 설정만 정하는 명령은 파일 층을 만들지 않고 이미지의 메타데이터(상자 겉 이름표처럼 내용물에 대한 정보)에만 기록해요. 그림의 RUN pip install은 requirements.txt에 적힌 라이브러리를 설치하는 줄이고 COPY . .는 앱 코드 전체를 복사하는 줄이에요. 컨테이너를 실행할 때 Docker는 레이어들을 아래부터 겹쳐서 앱에게 폴더 하나처럼 보여 줘요.</p>
</section>

<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 어떤 레이어에서 파일을 지우면 이미지 크기도 줄어드나요?</summary>
<p>A. 아니요. 레이어는 위로 쌓이기만 해서 아래 레이어에 있던 파일은 그대로 남아 있어요. 위 레이어에서 지우면 그 파일을 숨기는 표시만 얹혀요.</p>
<p>그래서 내려받은 파일을 만들고 지우는 일은 같은 <code>RUN</code> 안에서 끝내야 이미지에 남지 않아요.</p>
</details>
</aside>
</div>

<section class="slide">
<h3>같은 바닥 트레이는 여러 상품이 나눠 써요</h3>
<svg class="dg" viewBox="0 0 400 236" role="img" aria-label="상품 A와 상품 B가 각자 위 칸에 채소와 양념 트레이를 두지만 바닥의 육수 베이스 트레이는 창고에 하나만 두고 함께 쓰는 그림">
<circle class="box" cx="110" cy="38" r="26"/><use class="ic" href="#i-box" x="94" y="22" width="32" height="32"/>
<text class="chip" x="168" y="38">상품 A</text>
<circle class="box" cx="290" cy="38" r="26"/><use class="ic" href="#i-box" x="274" y="22" width="32" height="32"/>
<text class="chip" x="348" y="38">상품 B</text>
<path class="line" d="M110,64 L110,80 M290,64 L290,80"/>
<rect class="box" x="40" y="80" width="140" height="48" rx="8"/>
<circle class="box" cx="66" cy="104" r="17"/><use class="ic" href="#i-carrot" x="55" y="93" width="22" height="22"/>
<text class="chip" x="128" y="104">채소</text>
<rect class="box" x="220" y="80" width="140" height="48" rx="8"/>
<circle class="box" cx="246" cy="104" r="17"/><use class="ic" href="#i-drop" x="235" y="93" width="22" height="22"/>
<text class="chip" x="308" y="104">양념</text>
<path class="line" d="M110,128 L150,148 M290,128 L250,148"/>
<rect class="kafka" x="40" y="148" width="320" height="48" rx="8"/>
<circle class="box" cx="66" cy="172" r="17"/><use class="ic" href="#i-soup" x="55" y="161" width="22" height="22"/>
<text class="chip" x="210" y="172">육수 베이스 · 하나만 만들어 함께 써요</text>
<text class="small" x="200" y="222">창고에 이미 있는 칸은 다시 받지 않아요</text>
</svg>
<p class="point">여러 상품이 같은 육수 베이스를 쓰면 공장은 그 트레이를 한 번만 만들어 함께 써요.</p>
<p class="explain">공장은 상품 A를 만들 때 담아 둔 육수 베이스 트레이를 상품 B를 만들 때도 그대로 꺼내 써요. 주방이 마트에서 상품을 가져올 때도 주방 창고에 이미 있는 트레이는 다시 받지 않고 없는 칸만 받아요.</p>
</section>

<section class="slide">
<h3>실제로는: 이미지끼리 레이어를 나눠 쓰고 컨테이너는 쓰기 층만 얹어요</h3>
<svg class="dg" viewBox="0 0 400 214" role="img" aria-label="왼쪽은 앱 A 이미지와 앱 B 이미지가 아래의 Python 레이어 하나를 함께 쓰고 오른쪽은 컨테이너 세 개가 같은 이미지 레이어 위에 각자 쓰기 층을 얹고 고칠 파일은 쓰기 층으로 복사해서 고치는 그림">
<rect class="line" x="10" y="10" width="185" height="194" rx="12"/>
<text class="label center" x="102" y="32">이미지끼리</text>
<rect class="box" x="22" y="56" width="76" height="34" rx="5"/><text class="chip" x="60" y="73">앱 A 층</text>
<rect class="box" x="107" y="56" width="76" height="34" rx="5"/><text class="chip" x="145" y="73">앱 B 층</text>
<rect class="kafka" x="22" y="98" width="161" height="34" rx="5"/><text class="chip" x="102" y="115">Python 층 (함께 씀)</text>
<text class="small" x="102" y="156">디스크에 한 번만 저장</text>
<text class="small" x="102" y="178">받을 때도 없는 층만</text>
<rect class="line" x="205" y="10" width="185" height="194" rx="12"/>
<text class="label center" x="297" y="32">컨테이너끼리</text>
<rect class="new" x="217" y="56" width="50" height="34" rx="5"/><text class="chip" x="242" y="73">쓰기</text>
<rect class="new" x="272" y="56" width="50" height="34" rx="5"/><text class="chip" x="297" y="73">쓰기</text>
<rect class="new" x="327" y="56" width="50" height="34" rx="5"/><text class="chip" x="352" y="73">쓰기</text>
<rect class="kafka" x="217" y="98" width="160" height="34" rx="5"/><text class="chip" x="297" y="115">이미지 층 (함께 씀)</text>
<text class="small" x="297" y="156">고칠 파일은 위로 복사</text>
<text class="small" x="297" y="178">지우면 쓰기 층만 사라져요</text>
</svg>
<p class="point">같은 레이어는 디스크에 한 번만 두고 여러 이미지와 컨테이너가 함께 써요.</p>
<p class="explain">Python 이미지를 바닥에 깐 이미지 두 개는 Python 레이어를 디스크에 한 번만 저장해 함께 써요. 서버가 레지스트리에서 이미지를 받을(pull) 때도 이미 가진 레이어는 다시 내려받지 않아요. 컨테이너는 이미지 레이어를 건드리지 않고 맨 위에 자기만의 쓰기 층을 얹어요. 앱이 아래 층의 파일을 고치려 하면 Docker가 그 파일을 쓰기 층으로 복사한 뒤 고치는데 이를 copy-on-write(쓸 때 복사)라고 해요.</p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">빌드 캐시: 어제 담은 트레이를 다시 꺼내 쓰기</h2>

<section class="slide">
<h3>지시서가 같은 칸은 창고에서 꺼내고 바뀐 칸부터 다시 담아요</h3>
<svg class="dg" viewBox="0 0 400 236" role="img" aria-label="창고에서 1층 육수 베이스 트레이는 그대로 꺼내 쓰고 2층 소스가 바뀌어 다시 담으면 그 위의 3층 고명도 바뀌지 않았지만 다시 담는 그림">
<defs><marker id="l3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M98,168 L128,168" marker-end="url(#l3)"/>
<circle class="kafka" cx="58" cy="168" r="36"/><use class="ic" href="#i-warehouse" x="36" y="146" width="44" height="44"/>
<text class="big" x="58" y="222">창고</text>
<rect class="bad blink" x="132" y="24" width="170" height="48" rx="8"/>
<circle class="box" cx="158" cy="48" r="17"/><use class="ic" href="#i-carrot" x="147" y="37" width="22" height="22"/>
<text class="chip" x="236" y="48">3층 · 고명</text>
<rect class="bad blink" x="132" y="84" width="170" height="48" rx="8"/>
<circle class="box" cx="158" cy="108" r="17"/><use class="ic" href="#i-drop" x="147" y="97" width="22" height="22"/>
<text class="chip" x="236" y="108">2층 · 소스</text>
<rect class="kafka" x="132" y="144" width="170" height="48" rx="8"/>
<circle class="box" cx="158" cy="168" r="17"/><use class="ic" href="#i-soup" x="147" y="157" width="22" height="22"/>
<text class="chip" x="236" y="168">1층 · 육수 베이스</text>
<text class="alert" x="352" y="40">안 바뀌었지만</text><text class="alert" x="352" y="58">다시 담기</text>
<text class="alert" x="352" y="100">바뀜</text><text class="alert" x="352" y="118">다시 담기</text>
<text class="small" x="352" y="160">같음</text><text class="small" x="352" y="178">꺼내 쓰기</text>
</svg>
<p class="point">공장은 지시서를 어제 것과 비교해 같은 칸은 창고에서 꺼내고 처음 달라진 칸부터는 위 칸까지 새로 담아요.</p>
<p class="explain">위 칸 트레이는 아래 칸이 만든 결과 위에 맞춰 담기 때문에 아래 칸이 새것으로 바뀌면 그 위 칸을 그대로 쓸 수 없어요. 그래서 고명은 하나도 바뀌지 않았는데 그 아래 소스가 바뀐 탓에 다시 담아요.</p>
</section>

<section class="slide">
<h3>실제로는: 빌드 캐시가 깨지는 조건</h3>
<table>
<thead><tr><th>명령</th><th>Docker가 비교하는 것</th><th>캐시가 깨지는 때</th></tr></thead>
<tbody>
<tr><td><code>FROM</code></td><td>기본 이미지</td><td>다른 기본 이미지를 쓸 때</td></tr>
<tr><td><code>RUN</code></td><td>명령 글자</td><td>명령이 한 글자라도 달라질 때</td></tr>
<tr><td><code>COPY</code>·<code>ADD</code></td><td>복사할 파일들의 정보로 만든 체크섬</td><td>복사할 파일이 바뀌거나 늘거나 줄 때</td></tr>
<tr><td><code>ARG</code>로 받는 값</td><td>빌드할 때 넘긴 값</td><td>값이 달라질 때</td></tr>
<tr><td>그 뒤의 모든 명령</td><td>비교하지 않아요</td><td>앞에서 한 번 깨지면 전부 다시 실행</td></tr>
</tbody>
</table>
<p class="point">Docker는 명령마다 이전 빌드와 같은지 비교하고 한 단계라도 다르면 그 단계부터 끝까지 다시 실행해요.</p>
<p class="explain">빌드 캐시는 Docker가 이전 빌드의 단계별 결과를 저장해 두는 곳이고 비유의 창고예요. 빌드 엔진은 Dockerfile의 명령을 위에서부터 하나씩 캐시와 비교해서 같은 결과가 있으면 실행하지 않고 가져와요(빌드 화면에 CACHED로 보여요). 체크섬은 파일 정보로 계산한 짧은 확인 값이라서 복사할 파일이 바뀌면 이 값도 달라져요. 한 단계가 달라지면 그 뒤 단계는 바뀐 게 없어도 비교 없이 모두 다시 실행하는데 뒤 단계의 명령은 앞 단계가 만든 결과 위에서 실행되므로 그 결과가 달라졌을 수 있기 때문이에요.</p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">명령 순서: 자주 바뀌는 것은 맨 위 칸에</h2>

<section class="slide">
<h3>매일 바뀌는 고명은 맨 위 칸에 담아요</h3>
<svg class="dg" viewBox="0 0 400 236" role="img" aria-label="왼쪽은 매일 바뀌는 고명이 맨 아래 칸에 있어 고명만 바꿔도 세 칸을 모두 다시 담고 오른쪽은 고명이 맨 위 칸에 있어 한 칸만 다시 담는 그림">
<rect class="line" x="10" y="10" width="185" height="216" rx="12"/>
<text class="label center" x="102" y="32">고명이 맨 아래</text>
<rect class="bad" x="25" y="50" width="155" height="42" rx="8"/>
<circle class="box" cx="48" cy="71" r="15"/><use class="ic" href="#i-drop" x="38" y="61" width="20" height="20"/><text class="chip" x="118" y="71">소스</text>
<rect class="bad" x="25" y="98" width="155" height="42" rx="8"/>
<circle class="box" cx="48" cy="119" r="15"/><use class="ic" href="#i-soup" x="38" y="109" width="20" height="20"/><text class="chip" x="118" y="119">육수</text>
<rect class="bad blink" x="25" y="146" width="155" height="42" rx="8"/>
<circle class="box" cx="48" cy="167" r="15"/><use class="ic" href="#i-carrot" x="38" y="157" width="20" height="20"/><text class="chip" x="118" y="167">고명 · 바뀜</text>
<text class="alert" x="102" y="208">세 칸 모두 다시 담기</text>
<rect class="line" x="205" y="10" width="185" height="216" rx="12"/>
<text class="label center" x="297" y="32">고명이 맨 위</text>
<rect class="bad blink" x="220" y="50" width="155" height="42" rx="8"/>
<circle class="box" cx="243" cy="71" r="15"/><use class="ic" href="#i-carrot" x="233" y="61" width="20" height="20"/><text class="chip" x="313" y="71">고명 · 바뀜</text>
<rect class="kafka" x="220" y="98" width="155" height="42" rx="8"/>
<circle class="box" cx="243" cy="119" r="15"/><use class="ic" href="#i-drop" x="233" y="109" width="20" height="20"/><text class="chip" x="313" y="119">소스</text>
<rect class="kafka" x="220" y="146" width="155" height="42" rx="8"/>
<circle class="box" cx="243" cy="167" r="15"/><use class="ic" href="#i-soup" x="233" y="157" width="20" height="20"/><text class="chip" x="313" y="167">육수</text>
<text class="small" x="297" y="208">한 칸만 다시 담기</text>
</svg>
<p class="point">매일 바뀌는 재료를 맨 위 칸에 두면 잘 바뀌지 않는 아래 칸은 매번 창고에서 꺼내 쓸 수 있어요.</p>
<p class="explain">공장은 처음 달라진 칸부터 위로 다시 담기 때문에 자주 바뀌는 고명이 바닥에 있으면 거의 매번 상자 전체를 새로 담아요. 잘 바뀌지 않는 육수를 바닥에 두고 날마다 바뀌는 고명을 맨 위에 두면 다시 담는 칸이 하나로 줄어요.</p>
</section>

<section class="slide">
<h3>실제로는: 라이브러리 목록을 먼저 복사하고 코드는 마지막에</h3>
<svg class="dg" viewBox="0 0 400 246" role="img" aria-label="앱 코드 한 줄을 고친 뒤 다시 빌드할 때 왼쪽처럼 코드 전체를 먼저 복사하면 COPY와 RUN pip install을 다시 실행하고 오른쪽처럼 requirements.txt를 먼저 복사해 설치하고 코드를 마지막에 복사하면 마지막 COPY만 다시 실행하는 그림">
<text class="label center" x="200" y="14">app.py 한 줄을 고치고 다시 빌드하면</text>
<text class="label" x="10" y="44">코드를 먼저 복사</text>
<text class="label" x="210" y="44">목록을 먼저 복사</text>
<rect class="kafka" x="10" y="60" width="180" height="34" rx="5"/><text class="chip" x="100" y="77">FROM python</text>
<rect class="bad" x="10" y="102" width="180" height="34" rx="5"/><text class="chip" x="100" y="119">COPY . .</text>
<rect class="bad blink" x="10" y="144" width="180" height="34" rx="5"/><text class="chip" x="100" y="161">RUN pip install</text>
<rect class="kafka" x="210" y="60" width="180" height="34" rx="5"/><text class="chip" x="300" y="77">FROM python</text>
<rect class="kafka" x="210" y="102" width="180" height="34" rx="5"/><text class="chip" x="300" y="119">COPY requirements.txt</text>
<rect class="kafka" x="210" y="144" width="180" height="34" rx="5"/><text class="chip" x="300" y="161">RUN pip install</text>
<rect class="bad" x="210" y="186" width="180" height="34" rx="5"/><text class="chip" x="300" y="203">COPY . .</text>
<text class="alert" x="100" y="203">설치를 매번 다시 해요</text>
<rect class="kafka" x="96" y="226" width="16" height="12" rx="3"/><text class="small" x="160" y="232">캐시에서 가져옴</text>
<rect class="bad" x="236" y="226" width="16" height="12" rx="3"/><text class="small" x="284" y="232">다시 실행</text>
</svg>
<p class="point">라이브러리 목록 파일만 먼저 복사해 설치하고 앱 코드는 마지막에 복사하면 코드를 고쳐도 설치 단계는 캐시를 써요.</p>
<p class="explain"><code>COPY . .</code>는 빌드할 폴더의 파일을 모두 이미지에 넣으라는 명령이고 requirements.txt는 Python 앱이 쓸 라이브러리 목록 파일이에요(Node.js의 package.json과 같은 역할). 왼쪽처럼 코드 전체를 먼저 넣으면 코드 한 줄만 고쳐도 복사 단계의 캐시가 깨져서 뒤의 설치가 매번 다시 돌아요. 오른쪽처럼 목록만 먼저 복사하면 목록이 그대로인 동안 설치 단계는 캐시에서 가져오고 마지막 코드 복사만 다시 해요. 그래서 Dockerfile은 잘 바뀌지 않는 것을 앞에 두고 자주 바뀌는 것을 뒤에 둬요.</p>
</section>

<section class="slide">
<h3>이럴 땐 조심해요: 캐시가 생각과 다르게 움직일 때</h3>
<table>
<thead><tr><th>오해나 상황</th><th>실제와 확인할 것</th></tr></thead>
<tbody>
<tr><td><code>RUN apt-get update</code>(리눅스에서 프로그램 목록을 새로 받는 명령)는 빌드할 때마다 최신 목록을 받는다</td><td>명령 글자가 같으면 캐시를 써서 예전 목록이 그대로 남아요. 목록이 낡는 일을 막으려면 update와 install을 같은 RUN에 함께 쓰고 꼭 새로 받아야 할 땐 <code>docker build --no-cache</code>로 캐시 없이 빌드해요</td></tr>
<tr><td><code>COPY . .</code>에 <code>.git</code>(코드 변경 기록 폴더)·<code>node_modules</code>(Node.js 라이브러리 폴더)·로그 파일이 같이 들어간다</td><td>앱과 상관없는 이 파일들이 바뀌어도 캐시가 깨지고 이미지도 커져요. 빌드할 폴더 맨 위의 <code>.dockerignore</code> 파일에 뺄 경로를 한 줄에 하나씩 적으면 빌드 컨텍스트에서 빠져요</td></tr>
<tr><td>파일을 열었다가 내용 그대로 다시 저장해도 캐시가 깨진다</td><td>파일의 수정 시각(mtime)만 바뀐 것은 캐시 비교에 쓰지 않아요</td></tr>
</tbody>
</table>
<p class="point">캐시는 명령 글자와 복사할 파일만 보고 판단해서 바깥 세상의 변화는 모르고 쓸데없는 파일 변화에는 깨져요.</p>
<p class="explain">Docker는 RUN 명령이 인터넷에서 무엇을 받아 올지 미리 알 수 없어서 글자가 같으면 같은 결과라고 봐요. 반대로 COPY는 빌드 컨텍스트의 파일을 비교하니 앱과 상관없는 파일이 바뀌어도 다시 빌드해요. 빌드 컨텍스트는 <code>docker build</code>를 실행할 때 빌드 엔진에게 넘기는 폴더의 파일들이에요.</p>
<p>참고: <a href="https://docs.docker.com/build/cache/">Docker 빌드 캐시</a> · <a href="https://docs.docker.com/build/cache/invalidation/">캐시가 깨지는 조건</a> · <a href="https://docs.docker.com/build/cache/optimize/">캐시 최적화</a> · <a href="https://docs.docker.com/get-started/docker-concepts/building-images/understanding-image-layers/">이미지 레이어 이해하기</a> · <a href="https://docs.docker.com/engine/storage/drivers/">스토리지 드라이버와 쓰기 층</a> · <a href="https://docs.docker.com/build/building/best-practices/">Dockerfile 모범 사례</a></p>
</section>

<section class="slide">
<h3>한눈에 다시 보기: 이 글의 다섯 줄</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="문제는 매번 처음부터 빌드하면 바뀌지 않은 준비물까지 다시 만드는 것이고 레이어는 명령이 바꾼 파일만 담은 읽기 전용 층이며 같은 레이어는 이미지와 컨테이너가 함께 쓰고 빌드 캐시는 같은 단계의 결과를 다시 쓰다가 달라진 단계부터 끝까지 다시 실행하며 명령 순서는 잘 바뀌지 않는 것을 앞에 둔다는 다섯 줄 요약 그림">
<circle class="bad" cx="30" cy="28" r="18"/><use class="ic" href="#i-hourglass" x="19" y="17" width="22" height="22"/>
<text class="label" x="62" y="19">문제</text><text class="small" x="62" y="38" style="text-anchor:start">매번 처음부터 빌드하면 안 바뀐 것도 다시 해요</text>
<circle class="kafka" cx="30" cy="76" r="18"/><use class="ic" href="#i-layers" x="19" y="65" width="22" height="22"/>
<text class="label" x="62" y="67">레이어</text><text class="small" x="62" y="86" style="text-anchor:start">명령이 바꾼 파일만 담은 읽기 전용 층</text>
<circle class="kafka" cx="30" cy="124" r="18"/><use class="ic" href="#i-box" x="19" y="113" width="22" height="22"/>
<text class="label" x="62" y="115">레이어 공유</text><text class="small" x="62" y="134" style="text-anchor:start">같은 층은 한 번만 두고 함께 써요</text>
<circle class="kafka" cx="30" cy="172" r="18"/><use class="ic" href="#i-warehouse" x="19" y="161" width="22" height="22"/>
<text class="label" x="62" y="163">빌드 캐시</text><text class="small" x="62" y="182" style="text-anchor:start">같은 단계는 꺼내 쓰고 바뀐 곳부터 다시 해요</text>
<circle class="new" cx="30" cy="220" r="18"/><use class="ic" href="#i-check" x="19" y="209" width="22" height="22"/>
<text class="label" x="62" y="211">명령 순서</text><text class="small" x="62" y="230" style="text-anchor:start">자주 바뀌는 코드는 Dockerfile 뒤쪽에</text>
</svg>
<p class="point">바뀌지 않은 층은 다시 쓰고 바뀌는 것은 뒤에 두면 두 번째 빌드부터 빨라져요.</p>
</section>
</div>

</div>
