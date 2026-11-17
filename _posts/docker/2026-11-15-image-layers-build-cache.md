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
</defs>
</svg>

<div class="intro">
<p class="q">코드 한 줄만 고쳤는데 어떤 빌드는 몇 초 만에 끝나고 어떤 빌드는 몇 분이 걸릴까요?</p>
<p>1편에서 Docker가 Dockerfile을 위에서부터 읽으며 이미지를 층층이 쌓는다고 했어요. 층은 파일의 변화를 담아 겹쳐 쓰는 단위이고 레이어라고 불러요. 개발하다 보면 코드를 고칠 때마다 이미지를 다시 빌드하는데 명령 순서를 잘못 쓴 Dockerfile은 매번 라이브러리 설치부터 다시 해서 오래 걸려요.</p>
<p>이 글을 다 읽으면 Dockerfile 명령이 <b>레이어</b>가 되는 방식과 이미지와 컨테이너가 레이어를 나눠 쓰는 이유를 알 수 있어요. <b>빌드 캐시</b>가 언제 다시 쓰이고 언제 깨지는지와 자주 바뀌는 것을 뒤에 두는 명령 순서도 함께 봐요.</p>
</div>

<div class="slide-group">
<h2 class="slide-group-title">무엇이 문제인가: 고명만 바꿨는데 처음부터 다시 포장</h2>

<section class="slide">
<h3>바뀌지 않은 육수까지 다시 준비하느라 기다려요</h3>
<svg class="dg" viewBox="0 0 400 262" role="img" aria-label="포장 지시서에서 고명만 바꿨는데 포장 공장이 만든 육수 받기와 소스 만들기와 고명 담기를 모두 처음부터 다시 해서 오래 걸리는 그림">
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
<text class="chip" x="80" y="234">만든 육수 받기</text>
<circle class="bad" cx="200" cy="202" r="19"/><use class="ic" href="#i-drop" x="186" y="188" width="28" height="28"/>
<text class="chip" x="200" y="234">소스 만들기</text>
<circle class="bad" cx="320" cy="202" r="19"/><use class="ic" href="#i-carrot" x="306" y="188" width="28" height="28"/>
<text class="chip" x="320" y="234">고명 담기</text>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0s" repeatCount="indefinite" path="M96,66 L152,66"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.7s" repeatCount="indefinite" path="M248,66 L300,66"/></circle>
</svg>
<p class="point">고명 한 가지만 바꿔도 공장이 상자 전체를 처음부터 다시 담으면 오래 걸려요.</p>
<p class="explain">포장 지시서는 Dockerfile, 포장 공장은 빌드 엔진, 상자는 이미지, 트레이는 레이어(층)에 해당해요. 개발자가 코드를 고친 뒤 다시 만드는 것이 두 번째 포장, 즉 두 번째 빌드예요. 첫 빌드는 저장해 둔 결과인 캐시가 없어 오래 걸리는 게 정상이지만 두 번째에도 같은 준비를 되풀이하면 작은 변화도 시험하기 어려워요.</p>
</section>

<section class="slide">
<h3>실제로는: 코드 한 줄 고칠 때마다 빌드를 기다려요</h3>
<table>
<thead><tr><th>빌드 단계</th><th>하는 일</th><th>걸리는 시간(예)</th></tr></thead>
<tbody>
<tr><td>기본 이미지 준비</td><td>Python 이미지를 레지스트리에서 받아요</td><td>수십 초</td></tr>
<tr><td>라이브러리 설치</td><td>앱이 쓰는 라이브러리를 내려받아 설치해요</td><td>수 분</td></tr>
<tr><td>앱 코드 복사</td><td>코드 폴더 전체를 넣어요</td><td>1초 남짓</td></tr>
</tbody>
</table>
<p class="point">고친 건 코드 한 줄인데 빌드 시간은 대부분 바뀌지 않은 준비물을 다시 만드는 데 들어가요.</p>
<p class="explain">육수는 기본 이미지, 소스 만들기는 라이브러리 설치, 고명은 앱 코드에 해당하고 마트는 이미지를 받아 오는 레지스트리예요. 개발자가 하루에도 여러 번 고칠 때마다 설치를 되풀이하지 않도록 Docker는 이전 단계의 결과를 기억해 둬요.</p>
</section>

<details class="origin">
<summary>더 알아보기: 지금의 빌드 엔진은 언제 생겼을까?</summary>
<p>지금 <code>docker build</code>를 실행하면 <b>BuildKit</b>이라는 빌드 엔진이 Dockerfile을 읽고 캐시를 관리해요. BuildKit은 Docker의 오픈 소스 프로젝트인 Moby에서 예전 빌더를 대신하려고 만들었어요. 이름은 영어 build(빌드)와 kit(도구 모음)를 합친 말이에요. 이름과 내부 구조를 몰라도 Dockerfile을 적고 빌드하는 방법은 같아요.</p>
<p>BuildKit은 2018년 <b>Docker 18.09</b>에 처음 들어왔지만 그때는 <code>DOCKER_BUILDKIT=1</code>을 직접 켜야 쓸 수 있었어요. 2023년 2월 1일에 나온 <b>Docker Engine 23.0</b>부터 리눅스에서 기본 빌더가 됐고 지금은 Docker Desktop에서도 기본이에요. 다만 Windows 컨테이너 이미지를 빌드할 때는 아직 예전 빌더를 써요.</p>
<p>참고: <a href="https://docs.docker.com/build/buildkit/">BuildKit</a> · <a href="https://docs.docker.com/engine/release-notes/23.0/">Docker Engine 23.0 릴리스 노트</a> · <a href="https://medium.com/@tonistiigi/build-secrets-and-ssh-forwarding-in-docker-18-09-ae8161d066">Docker 18.09의 BuildKit 소개</a></p>
</details>
</div>

<div class="slide-group">
<h2 class="slide-group-title">레이어: 아래 준비 위에 차례로 쌓는 트레이</h2>

<section class="slide">
<h3>육수 위에 소스와 고명을 차례로 얹어요</h3>
<svg class="dg" viewBox="0 0 400 236" role="img" aria-label="밀키트 상자 안에 육수 베이스 트레이를 바닥에 두고 소스 트레이와 고명 트레이를 차례로 얹어 아래 칸에 맞춰 준비한 결과를 층마다 봉인한 그림">
<circle class="kafka" cx="66" cy="104" r="42"/><use class="ic" href="#i-box" x="40" y="78" width="52" height="52"/>
<text class="big" x="66" y="168">밀키트 상자</text>
<path class="line dash" d="M110,104 L140,104"/>
<rect class="kafka" x="146" y="24" width="244" height="52" rx="8"/>
<circle class="box" cx="176" cy="50" r="17"/><use class="ic" href="#i-carrot" x="165" y="39" width="22" height="22"/>
<text class="chip" x="290" y="50">3층 · 고명</text>
<rect class="kafka" x="146" y="84" width="244" height="52" rx="8"/>
<circle class="box" cx="176" cy="110" r="17"/><use class="ic" href="#i-drop" x="165" y="99" width="22" height="22"/>
<text class="chip" x="290" y="110">2층 · 소스</text>
<rect class="kafka" x="146" y="144" width="244" height="52" rx="8"/>
<circle class="box" cx="176" cy="170" r="17"/><use class="ic" href="#i-soup" x="165" y="159" width="22" height="22"/>
<text class="chip" x="290" y="170">1층 · 육수 베이스</text>
<text class="small" x="268" y="220">아래 칸부터 차례로 얹고 칸마다 봉인해요</text>
</svg>
<p class="point">공장은 지시서에서 파일을 바꾸는 줄마다 트레이 하나를 채워 봉인하고 아래 칸부터 차례로 쌓아요.</p>
<p class="explain">공장은 육수를 바닥에 깔고 소스를 부은 뒤 그 위에 고명을 얹어 모양을 잡아요. 위 트레이는 아래 준비에 맞춰 완성한 결과를 담으므로 그 바탕이 같을 때만 그대로 꺼내 쓸 수 있어요. 소스가 바뀌면 고명의 재료가 같아도 얹어서 모양 잡는 일을 다시 해야 해요.</p>
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
<rect class="box" x="10" y="114" width="170" height="34" rx="5"/><text class="chip" x="95" y="124">RUN pip install -r</text><text class="chip" x="95" y="139">requirements.txt</text>
<rect class="box" x="10" y="156" width="170" height="34" rx="5"/><text class="chip" x="95" y="173">COPY . .</text>
<rect class="box" x="10" y="198" width="170" height="34" rx="5"/><text class="chip" x="95" y="215">LABEL 만든 사람</text>
<path class="line" d="M184,110 L206,110" marker-end="url(#l2)"/>
<path class="line dash" d="M180,215 L214,215" marker-end="url(#l2)"/>
<rect class="kafka" x="210" y="156" width="180" height="34" rx="5"/><text class="chip" x="300" y="173">Python 기본 층들</text>
<rect class="kafka" x="210" y="114" width="180" height="34" rx="5"/><text class="chip" x="300" y="131">+ 목록 파일</text>
<rect class="kafka" x="210" y="72" width="180" height="34" rx="5"/><text class="chip" x="300" y="89">+ 설치한 라이브러리</text>
<rect class="kafka" x="210" y="30" width="180" height="34" rx="5"/><text class="chip" x="300" y="47">+ 앱 코드</text>
<circle class="box" cx="236" cy="215" r="17"/><use class="ic" href="#i-tag" x="225" y="204" width="22" height="22"/>
<text class="small" x="264" y="215" style="text-anchor:start">이미지 정보에만 적어요</text>
<text class="small" x="200" y="252">실행할 때는 층을 겹쳐 폴더 하나처럼 보여 줘요</text>
</svg>
<p class="point">레이어는 명령 하나가 더하거나 고치거나 지운 파일만 담은 읽기 전용 층이에요.</p>
<p class="explain">Docker는 RUN·COPY·ADD처럼 파일을 바꾸는 명령의 결과를 층으로 남기고 FROM이 고르는 기본 이미지에는 이미 여러 층이 들어 있어요. LABEL과 CMD처럼 설명이나 실행 설정만 정하는 줄은 파일 층 대신 이미지 정보(메타데이터)에 적혀요. 위 층의 파일이 아래 층의 같은 파일을 가리며 아래 층은 읽기 전용이라 고칠 수 없으므로 삭제도 원본을 없애는 대신 숨김 표시를 남겨요. <code>RUN pip install -r requirements.txt</code>는 목록 파일대로 설치하고 <code>COPY . .</code>는 앞 점이 내 폴더 전체(빌드에 넘긴 파일), 뒤 점이 이미지 안 작업 폴더를 뜻해요.</p>
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
<svg class="dg" viewBox="0 0 400 236" role="img" aria-label="상품 A와 상품 B가 각자 위 칸에 고명과 소스 트레이를 두지만 바닥의 육수 베이스 트레이는 주방 보관함에 하나만 두고 함께 쓰는 그림">
<circle class="kafka" cx="110" cy="38" r="26"/><use class="ic" href="#i-box" x="94" y="22" width="32" height="32"/>
<text class="chip" x="168" y="38">상품 A</text>
<circle class="kafka" cx="290" cy="38" r="26"/><use class="ic" href="#i-box" x="274" y="22" width="32" height="32"/>
<text class="chip" x="348" y="38">상품 B</text>
<path class="line" d="M110,64 L110,80 M290,64 L290,80"/>
<rect class="box" x="40" y="80" width="140" height="48" rx="8"/>
<circle class="box" cx="66" cy="104" r="17"/><use class="ic" href="#i-carrot" x="55" y="93" width="22" height="22"/>
<text class="chip" x="128" y="104">고명</text>
<rect class="box" x="220" y="80" width="140" height="48" rx="8"/>
<circle class="box" cx="246" cy="104" r="17"/><use class="ic" href="#i-drop" x="235" y="93" width="22" height="22"/>
<text class="chip" x="308" y="104">소스</text>
<path class="line" d="M110,128 L150,148 M290,128 L250,148"/>
<rect class="kafka" x="40" y="148" width="320" height="48" rx="8"/>
<circle class="box" cx="66" cy="172" r="17"/><use class="ic" href="#i-soup" x="55" y="161" width="22" height="22"/>
<text class="chip" x="210" y="172">육수 베이스 · 하나만 만들어 함께 써요</text>
<text class="small" x="200" y="222">주방 보관함에 있는 칸은 다시 받지 않아요</text>
</svg>
<p class="point">여러 상품이 같은 육수 베이스를 쓰면 공장은 그 트레이를 한 번만 만들어 함께 써요.</p>
<p class="explain">공장 창고는 빌드 캐시이고 주방 보관함은 마트(레지스트리)에서 받아 둔 이미지 층을 두는 곳이에요. 내 컴퓨터에서 빌드하고 실행하는 경우 둘 다 내 컴퓨터의 Docker 저장 공간에 있지만 맡은 역할이 달라요. 받는 주방에 같은 트레이가 있으면 또 받지 않아도 되듯 Docker는 층 내용으로 만든 고유 번호(체크섬)로 같은 층인지 알아보고 이미 있는 층을 다시 받지 않아요.</p>
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
<p class="explain">개발자가 같은 준비물을 쓰는 앱을 늘릴 때 Docker가 이미지 전체를 매번 복제할 필요는 없어요. 앱이 이미지 속 파일을 바꾸려는 순간에야 그 컨테이너의 전용 공간에 복사본을 만들고 이를 copy-on-write(쓸 때 복사)라고 해요. 원본을 그대로 두기 때문에 한 앱의 수정이 같은 이미지를 쓰는 다른 앱에 섞이지 않아요.</p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">빌드 캐시: 어제 담은 트레이를 다시 꺼내 쓰기</h2>

<section class="slide">
<h3>소스를 바꾸면 그대로인 고명도 다시 담아요</h3>
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
<p class="explain">포장 담당자는 소스를 부은 위에 고명을 얹어 모양을 잡고 그 결과를 보관해요. 소스를 바꾸면 그 위에 같은 고명을 얹어도 모양이 달라질 수 있어요. 그래서 아래 소스가 달라지면 위 고명을 준비하는 일도 다시 해요.</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>실제로는: 빌드 캐시가 깨지는 조건</h3>
<table>
<thead><tr><th>명령</th><th>Docker가 비교하는 것</th><th>캐시가 깨지는 때</th></tr></thead>
<tbody>
<tr><td><code>FROM</code></td><td>기본 이미지</td><td>다른 기본 이미지를 쓸 때</td></tr>
<tr><td><code>RUN</code></td><td>명령 글자(일반적인 설치 명령 기준)</td><td>명령 글자가 달라질 때 — 인터넷의 라이브러리가 바뀌어도 그것만으로는 몰라요</td></tr>
<tr><td><code>COPY</code>·<code>ADD</code></td><td>파일 내용·경로·누가 읽고 쓸 수 있는지 등으로 만든 확인 값 (수정 시각 제외)</td><td>복사할 파일이 바뀌거나 늘거나 줄 때</td></tr>
<tr><td>그 뒤의 모든 명령</td><td>비교하지 않아요</td><td>앞에서 한 번 깨지면 전부 다시 실행</td></tr>
</tbody>
</table>
<p class="point">Docker는 명령마다 이전 빌드와 같은지 비교하고 한 단계라도 다르면 그 단계부터 끝까지 다시 실행해요.</p>
<p class="explain">빌드 캐시는 비유의 공장 창고로 Docker가 이전 단계의 결과를 기억해 두는 곳이에요. 위 층은 아래 층 위에서 명령을 실행한 결과(바뀐 파일)이므로 아래가 달라지면 같은 명령도 다른 결과를 낼 수 있어 Docker는 다시 실행해요. <code>CACHED</code>는 빌드할 때 터미널(명령을 입력하는 창)에 그 단계 줄 옆에 뜨며 명령을 다시 실행하는 대신 이전 결과를 썼다는 표시예요.</p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 버전을 안 정하면 캐시 때문에 옛 라이브러리가 그대로 남나요?</summary>
<p>A. 그럴 수 있어요. 설치 명령이 같으면 인터넷의 새 버전 여부를 확인하지 않고 예전 결과를 쓸 수 있어요. 새로 설치하려면 --no-cache로 빌드하고 무엇을 설치할지 일정하게 유지하려면 목록 파일에 <code>flask==3.1.0</code>처럼 라이브러리 버전도 적어 둬요(<a href="https://pypi.org/project/Flask/3.1.0/">실제로 배포된 버전의 예</a>예요).</p>
</details>
<details class="author-question">
<summary>초보 독자 Q. 캐시는 내 컴퓨터에만 있나요?</summary>
<p>A. 기본적으로 실제로 이미지를 만드는 컴퓨터에 쌓여요. 내 컴퓨터에서 빌드하면 여기에 있고 다른 컴퓨터에 빌드를 맡기면 그쪽에 있어요. 캐시를 내보내고 가져오도록 설정하면 다른 컴퓨터의 빌드에서도 나눠 쓸 수 있어요. <a href="https://docs.docker.com/build/cache/backends/">캐시 저장 위치 안내</a>를 참고해요.</p>
</details>
</aside>
</div>
</div>

<div class="slide-group">
<h2 class="slide-group-title">명령 순서: 자주 바뀌는 것은 맨 위 칸에</h2>

<section class="slide">
<h3>고명 한 칸만 다시 담도록 순서를 바꿔요</h3>
<svg class="dg" viewBox="0 0 400 320" role="img" aria-label="왼쪽은 목록과 고명을 한 칸에 먼저 넣고 그 위에서 소스를 만들어 고명 변경 시 두 칸을 다시 준비하며 오른쪽은 목록과 소스를 먼저 준비하고 고명을 마지막에 넣어 한 칸만 다시 준비하고 육수는 양쪽 모두 재사용하는 그림">
<rect class="line" x="10" y="10" width="185" height="300" rx="12"/>
<text class="label center" x="102" y="32">한꺼번에 준비</text>
<text class="small" x="102" y="52">목록·고명부터 함께 넣기</text>
<rect class="bad" x="25" y="118" width="155" height="42" rx="8"/>
<circle class="box" cx="48" cy="139" r="15"/><use class="ic" href="#i-drop" x="38" y="129" width="20" height="20"/><text class="chip" x="118" y="139">소스 만들기</text>
<rect class="bad" x="25" y="170" width="155" height="42" rx="8"/>
<circle class="box" cx="48" cy="191" r="15"/><use class="ic" href="#i-carrot" x="38" y="181" width="20" height="20"/><text class="chip" x="118" y="191">목록 + 고명</text>
<rect class="kafka" x="25" y="222" width="155" height="42" rx="8"/>
<circle class="box" cx="48" cy="243" r="15"/><use class="ic" href="#i-soup" x="38" y="233" width="20" height="20"/><text class="chip" x="118" y="243">육수 · 재사용</text>
<text class="alert" x="102" y="290">두 칸 다시 준비</text>
<rect class="line" x="205" y="10" width="185" height="300" rx="12"/>
<text class="label center" x="297" y="32">고명은 마지막에</text>
<text class="small" x="297" y="52">목록부터 넣고 소스 만들기</text>
<rect class="bad blink" x="220" y="66" width="155" height="42" rx="8"/>
<circle class="box" cx="243" cy="87" r="15"/><use class="ic" href="#i-carrot" x="233" y="77" width="20" height="20"/><text class="chip" x="313" y="87">고명 · 바뀜</text>
<rect class="kafka" x="220" y="118" width="155" height="42" rx="8"/>
<circle class="box" cx="243" cy="139" r="15"/><use class="ic" href="#i-drop" x="233" y="129" width="20" height="20"/><text class="chip" x="313" y="139">소스 만들기</text>
<rect class="kafka" x="220" y="170" width="155" height="42" rx="8"/>
<circle class="box" cx="243" cy="191" r="15"/><use class="ic" href="#i-doc" x="233" y="181" width="20" height="20"/><text class="chip" x="313" y="191">소스 재료 목록</text>
<rect class="kafka" x="220" y="222" width="155" height="42" rx="8"/>
<circle class="box" cx="243" cy="243" r="15"/><use class="ic" href="#i-soup" x="233" y="233" width="20" height="20"/><text class="chip" x="313" y="243">육수 · 재사용</text>
<text class="small" x="297" y="290">한 칸만 다시 준비</text>
</svg>
<p class="point">매일 바뀌는 재료를 맨 위 칸에 두면 잘 바뀌지 않는 아래 칸은 매번 창고에서 꺼내 쓸 수 있어요.</p>
<p class="explain">왼쪽의 한꺼번에 준비는 목록과 고명을 먼저 한 칸에 넣은 뒤 소스를 만드는 순서예요. 고명만 바꿔도 그 칸과 그 위 소스 준비를 다시 하지만 육수는 그대로 꺼내 써요. 오른쪽은 소스에 필요한 목록부터 넣고 소스를 만든 뒤 고명을 마지막에 얹으므로 고명 한 칸만 다시 담아요.</p>
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
<p class="explain">requirements.txt는 Python 앱이 쓸 라이브러리 목록 파일이에요(Node.js의 package.json과 같은 역할). 개발자는 기능을 고칠 때 이 목록보다 앱 코드를 훨씬 자주 바꿔요. 왼쪽은 <code>RUN pip install -r requirements.txt</code> 아래의 <code>COPY . .</code>에 코드까지 들어 있어 코드만 바꿔도 설치를 다시 실행해요. 설치가 코드 파일 없이 목록만으로 가능하면 오른쪽처럼 코드를 나중에 복사해서 설치 결과를 다시 쓸 수 있어요.</p>
</section>

<section class="slide">
<h3>이럴 땐 조심해요: 캐시가 생각과 다르게 움직일 때</h3>
<p>빌드 컨텍스트는 개발자가 빌드 엔진에 넘기는 파일들의 범위예요.</p>
<table>
<thead><tr><th>오해나 상황</th><th>실제와 확인할 것</th></tr></thead>
<tbody>
<tr><td>인터넷의 프로그램 목록을 꼭 새로 받아야 해요</td><td><code>docker build --no-cache</code>로 캐시 없이 빌드해요. 목록을 받는 <code>apt-get update</code>를 별도 RUN에 두면 명령 글자가 같아 예전 목록 캐시를 써요. 목록 받기와 설치를 <code>RUN apt-get update &amp;&amp; apt-get install -y curl</code>처럼 같은 RUN에 적으면 설치 대상을 고칠 때 목록도 새로 받아요. <code>&amp;&amp;</code>는 앞 명령이 성공하면 이어서 다음 명령을 실행한다는 뜻이에요</td></tr>
<tr><td><code>COPY . .</code>에 <code>.git</code>(코드 변경 기록 폴더)·<code>node_modules</code>(Node.js 라이브러리 폴더)·로그 파일이 같이 들어간다</td><td>앱과 상관없는 이 파일들이 바뀌어도 캐시가 깨지고 이미지도 커져요. 빌드할 폴더 맨 위의 <code>.dockerignore</code> 파일에 뺄 경로를 <code>.git</code>과 <code>node_modules</code>처럼 한 줄에 하나씩 적으면 빌드 컨텍스트에서 빠져요</td></tr>
<tr><td>파일을 열었다가 내용 그대로 다시 저장해도 캐시가 깨진다</td><td>파일의 수정 시각(mtime)만 바뀐 것은 캐시 비교에 쓰지 않아요</td></tr>
</tbody>
</table>
<p class="point">캐시는 명령 글자와 복사할 파일만 보고 판단해서 바깥 세상의 변화는 모르고 쓸데없는 파일 변화에는 깨져요.</p>
<p class="explain">개발자가 기능과 무관한 기록 파일까지 빌드 엔진에 넘기면 앱을 고치지 않아도 다시 만들 일이 생겨요. 필요한 파일의 범위를 먼저 정하면 작은 변경이 빌드 전체로 번지는 일을 줄일 수 있어요.</p>
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
<circle class="box" cx="30" cy="220" r="18"/><use class="ic" href="#i-carrot" x="19" y="209" width="22" height="22"/>
<text class="label" x="62" y="211">명령 순서</text><text class="small" x="62" y="230" style="text-anchor:start">자주 바뀌는 코드는 Dockerfile 뒤쪽에</text>
</svg>
<p class="point">바뀌지 않은 층은 다시 쓰고 바뀌는 것은 뒤에 두면 두 번째 빌드부터 빨라져요.</p>
</section>
</div>

</div>
