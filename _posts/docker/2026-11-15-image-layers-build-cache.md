---
layout: post
title: "왜 두 번째 포장은 빠를까? 밀키트로 이해하는 Docker 이미지 레이어와 빌드 캐시"
description: "밀키트 트레이 비유로 Dockerfile 명령이 이미지 레이어가 되는 방식과 레이어 공유, 빌드 캐시가 재사용되고 깨지는 조건, 자주 바뀌는 것을 뒤에 두는 명령 순서와 .dockerignore를 설명합니다."
date: 2026-11-15 21:40:00 +0900
series: docker
episode: 5
summary: "이미지는 칸마다 봉인한 트레이를 쌓은 상자예요. 바뀌지 않은 칸은 창고에서 꺼내 다시 쓰니까 자주 바뀌는 재료를 맨 위에 두면 다시 포장이 빨라져요."
youtube: DdN-0ZGBhII
---

<div class="lesson lesson-hierarchy storybook">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: https://cdn.jsdelivr.net/npm/lucide-static@1.25.0/icons/ (ISC). 라이선스: assets/icons/LICENSE-lucide.txt. i-doc=file-text, i-drop=droplet, i-box=package. 나머지는 i- 뒤가 원본 이름이다. -->
<symbol id="i-doc" viewBox="0 0 24 24"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2zM14 2v5a1 1 0 0 0 1 1h5M10 9H8M16 13H8M16 17H8"/></symbol>
<symbol id="i-drop" viewBox="0 0 24 24"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></symbol>
<symbol id="i-box" viewBox="0 0 24 24"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73zM12 22V12M3.29 7 12 12 20.71 7M7.5 4.27l9 5.15"/></symbol>
<symbol id="i-factory" viewBox="0 0 24 24"><path d="M12 16h.01M16 16h.01M3 19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a.5.5 0 0 0-.769-.422l-4.462 2.844A.5.5 0 0 1 15 10.5v-2a.5.5 0 0 0-.769-.422L9.77 10.922A.5.5 0 0 1 9 10.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2zM8 16h.01"/></symbol>
<symbol id="i-soup" viewBox="0 0 24 24"><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9ZM7 21h10M19.5 12 22 6M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62M11.25 3c.27.1.8.53.74 1.36-.05.83-.93 1.2-.98 2.02-.06.78.33 1.24.72 1.62M6.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.74 1.62"/></symbol>
<symbol id="i-carrot" viewBox="0 0 24 24"><path d="M15 16a1 1 0 0 0-7-7q-4 4-5.987 12.385a.5.5 0 0 0 .602.602Q11 20 15 16l-3-3M15 9q4 4 7 0-3-4-7 0 4-4 0-7-4 3 0 7M8 15l-2.58-2.58"/></symbol>
<symbol id="i-hourglass" viewBox="0 0 24 24"><path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></symbol>
<symbol id="i-warehouse" viewBox="0 0 24 24"><path d="M18 21V10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v11M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 1.132-1.803l7.95-3.974a2 2 0 0 1 1.837 0l7.948 3.974A2 2 0 0 1 22 8zM6 13h12M6 17h12"/></symbol>
<symbol id="i-tag" viewBox="0 0 24 24"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5"/></symbol>
</defs>
</svg>

<div class="slide-group">
<h2 class="slide-group-title">문제: 고명 하나 때문에 육수를 다시 내요</h2>

<section class="slide">
<h3>고명 하나 바꾸는데 육수부터 기다려요</h3>
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
<ol class="steps">
<li>포장 공장(빌더)이 지시서대로 상자를 만드는 일이 빌드예요</li>
<li>고명만 바꿔 다시 포장(재빌드)할 때도 처음부터 하면 오래 걸려요</li>
</ol>
</section>

<section class="slide">
<h3>코드 한 줄을 옮겨도 설치에 몇 분이 걸릴 수 있어요</h3>
<svg class="dg" viewBox="0 0 400 205" role="img" aria-label="첫 빌드에서 기본 이미지 받기와 라이브러리 설치가 코드 한 줄을 복사하는 것보다 오래 걸리는 시간 예시예요.">
<rect class="line" x="7" y="8" width="126" height="188" rx="12"/>
<text class="label center" x="70" y="34">기본 이미지</text>
<circle class="box" cx="70" cy="91" r="34"/><use class="ic" href="#i-drop" x="47" y="68" width="46" height="46"/>
<text class="chip" x="70" y="149">수십 초</text><text class="small" x="70" y="175">육수 받기</text>
<rect class="line" x="137" y="8" width="126" height="188" rx="12"/>
<text class="label center" x="200" y="34">라이브러리</text>
<circle class="bad" cx="200" cy="91" r="34"/><use class="ic" href="#i-soup" x="177" y="68" width="46" height="46"/>
<text class="chip" x="200" y="149">수 분</text><text class="small" x="200" y="175">소스 만들기</text>
<rect class="line" x="267" y="8" width="126" height="188" rx="12"/>
<text class="label center" x="330" y="34">앱 코드</text>
<circle class="box" cx="330" cy="91" r="34"/><use class="ic" href="#i-carrot" x="307" y="68" width="46" height="46"/>
<text class="chip" x="330" y="149">1초 남짓</text><text class="small" x="330" y="175">고명 담기</text>
</svg>
<ol class="steps">
<li>육수(기본 이미지)는 마트(레지스트리)에서 받아요</li>
<li>소스(라이브러리) 설치가 수 분 걸릴 수 있어요 (예시)</li>
<li>고명(앱 코드)만 바뀌면 설치 결과를 다시 쓰고 싶어요</li>
</ol>
</section>

<details class="origin">
<summary>더 알아보기: 누가 왜 만들었을까?</summary>
<p>리눅스 이미지를 기본 설정으로 빌드하면 <b>BuildKit</b>이라는 빌드 엔진이 Dockerfile을 읽고 캐시를 관리해요. BuildKit은 Docker의 오픈 소스 프로젝트인 Moby에서 예전 빌더를 대신하려고 만들었어요. 이름은 영어 build(빌드)와 kit(도구 모음)를 합친 말이에요. 이름과 내부 구조를 몰라도 Dockerfile을 적고 빌드하는 방법은 같아요.</p>
<p>BuildKit은 2018년 <b>Docker 18.09</b>에 처음 들어왔지만 그때는 <code>DOCKER_BUILDKIT=1</code>을 직접 켜야 쓸 수 있었어요. 2023년 2월 1일에 나온 <b>Docker Engine 23.0</b>부터 리눅스에서 기본 빌더가 됐고 지금은 Docker Desktop에서도 기본이에요. 다만 Windows 컨테이너 이미지는 예전 빌더가 기본이고 BuildKit 0.13부터 실험 지원해요.</p>
<p>참고: <a href="https://docs.docker.com/build/buildkit/">BuildKit</a> · <a href="https://docs.docker.com/engine/release-notes/23.0/">Docker Engine 23.0 릴리스 노트</a> · <a href="https://medium.com/@tonistiigi/build-secrets-and-ssh-forwarding-in-docker-18-09-ae8161d066">Docker 18.09의 BuildKit 소개</a></p>
</details>
</div>

<div class="slide-group">
<h2 class="slide-group-title">트레이: 바뀐 파일만 층마다 쌓아요</h2>

<section class="slide">
<h3>아래 층 위에 새 파일 층을 얹어요</h3>
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
<text class="small" x="268" y="220">아래에서 위로</text>
</svg>
<ol class="steps">
<li>밀키트 상자(이미지)는 지시서(Dockerfile)대로 채워요</li>
<li>트레이(레이어)를 포개면 앱이 읽을 파일이 모두 모여요</li>
</ol>
<p class="more">참고: <a href="https://docs.docker.com/get-started/docker-concepts/building-images/understanding-image-layers/">Docker의 이미지 레이어</a></p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>트레이 하나에는 바뀐 파일만 담아요</h3>
<svg class="dg" viewBox="0 0 400 262" role="img" aria-label="왼쪽 Dockerfile의 FROM python, COPY requirements.txt, RUN pip install, COPY 점 점 네 줄이 오른쪽에서 Python 기본 층, 목록 파일 추가, 설치한 라이브러리 추가, 앱 코드 추가 레이어가 되고 LABEL 줄은 파일 층 없이 이미지 정보에만 기록되는 그림">
<defs><marker id="l2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="label" x="10" y="14">Dockerfile</text>
<text class="label" x="210" y="14">이미지 레이어 (읽기 전용)</text>
<rect class="box" x="10" y="30" width="170" height="34" rx="5"/><text class="chip" x="95" y="47">FROM python</text>
<rect class="box" x="10" y="72" width="170" height="34" rx="5"/><text class="chip" x="95" y="89">COPY requirements.txt</text>
<rect class="box" x="10" y="110" width="170" height="42" rx="5"/><text class="chip" x="95" y="121">RUN pip install -r</text><text class="chip" x="95" y="142">requirements.txt</text>
<rect class="box" x="10" y="156" width="170" height="34" rx="5"/><text class="chip" x="95" y="173">COPY . .</text>
<rect class="box" x="10" y="198" width="170" height="34" rx="5"/><text class="chip" x="95" y="215">LABEL 만든 사람</text>
<path class="line" d="M184,47 L206,47 M184,89 L206,89 M184,131 L206,131 M184,173 L206,173" marker-end="url(#l2)"/>
<path class="line dash" d="M180,215 L214,215" marker-end="url(#l2)"/>
<rect class="kafka" x="210" y="30" width="180" height="34" rx="5"/><text class="chip" x="300" y="47">① 기본 층</text>
<rect class="kafka" x="210" y="72" width="180" height="34" rx="5"/><text class="chip" x="300" y="89">② 목록 파일 추가</text>
<rect class="kafka" x="210" y="114" width="180" height="34" rx="5"/><text class="chip" x="300" y="131">③ 필요한 도구 설치</text>
<rect class="kafka" x="210" y="156" width="180" height="34" rx="5"/><text class="chip" x="300" y="173">④ 앱 코드 추가</text>
<circle class="box" cx="236" cy="215" r="17"/><use class="ic" href="#i-tag" x="225" y="204" width="22" height="22"/>
<text class="small" x="264" y="215" style="text-anchor:start">이미지 정보에만 적어요</text>
<text class="small" x="200" y="252">겹쳐 보이는 파일들</text>
</svg>
<ol class="steps">
<li>FROM은 기존 층을 고르고 RUN·COPY·ADD는 파일을 바꿔요</li>
<li>LABEL과 CMD는 설명과 실행 설정만 기록해요</li>
<li>바꾼 파일은 위층에 놓이고 삭제 표시가 아래 파일을 가려요</li>
</ol>
<p class="more">참고: <a href="https://docs.docker.com/engine/storage/drivers/">Docker의 파일 삭제와 읽기 전용 층</a></p>
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
<h3>같은 육수 트레이는 한 번만 받아요</h3>
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
<text class="chip" x="210" y="172">공통 육수</text>
<text class="small" x="200" y="222">보관함에 한 벌</text>
</svg>
<ol class="steps">
<li>주방 보관함(로컬 저장소)에 받은 층을 둬요</li>
<li>내용으로 만든 번호(체크섬)가 같으면 그 층을 다시 받지 않아요</li>
<li>공장 창고(빌드 캐시)는 포장 단계의 결과를 보관해요</li>
</ol>
</section>

<section class="slide">
<h3>앱이 파일을 고칠 때만 따로 복사해요</h3>
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
<text class="small" x="297" y="178">조리대 삭제 → 쓰기 층 삭제</text>
</svg>
<ol class="steps">
<li>조리대(컨테이너)마다 같은 원본을 읽어요</li>
<li>고칠 파일만 자기 쓰기 층으로 복사해요(copy-on-write)</li>
<li>옆 조리대에서는 원래 파일이 그대로 보여요</li>
</ol>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">창고: 같은 준비를 다시 하지 않아요</h2>

<section class="slide">
<h3>소스를 바꾸면 그 위의 고명도 다시 얹어요</h3>
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
<ol class="steps">
<li>고명이 같아도 소스 위에 올린 이전 결과는 못 써요</li>
<li>빌드 화면에서 재사용한 단계 옆에 CACHED가 떠요</li>
</ol>
<p class="more">참고: <a href="https://docs.docker.com/build/cache/">Docker의 빌드 캐시</a></p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>명령과 재료가 같으면 창고에서 꺼내요</h3>
<svg class="dg" viewBox="0 0 400 205" role="img" aria-label="같은 입력이면 CACHED가 표시되고 입력이 바뀌면 그 결과를 쓰는 단계까지 다시 실행해요.">
<rect class="line" x="7" y="8" width="191" height="188" rx="12"/>
<text class="label center" x="102.5" y="34">같은 재료와 지시</text>
<circle class="new" cx="102.5" cy="91" r="34"/><use class="ic" href="#i-warehouse" x="79.5" y="68" width="46" height="46"/>
<text class="chip" x="102.5" y="149">CACHED</text><text class="small" x="102.5" y="175">이전 결과 사용</text>
<rect class="line" x="202" y="8" width="191" height="188" rx="12"/>
<text class="label center" x="297.5" y="34">바뀐 재료나 지시</text>
<circle class="kafka" cx="297.5" cy="91" r="34"/><use class="ic" href="#i-factory" x="274.5" y="68" width="46" height="46"/>
<text class="chip" x="297.5" y="149">다시 실행</text><text class="small" x="297.5" y="175">다음 단계도 갱신</text>
</svg>
<ol class="steps">
<li>앞 단계가 같으면 RUN은 보통 명령만 비교해요</li>
<li>COPY·ADD는 파일 추가·삭제와 내용·경로·권한 변경을 봐요</li>
<li>수정 시각만 바뀌면 재사용하고 기본 이미지가 바뀌면 그 위 단계도 다시 만들어요</li>
</ol>
<p class="more">참고: <a href="https://docs.docker.com/build/cache/invalidation/">Docker의 캐시를 확인하는 조건</a></p>
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
<h2 class="slide-group-title">판단: 무엇을 다시 만들고 무엇을 뺄까요?</h2>

<section class="slide">
<h3>설치에 필요한 목록부터 복사해요</h3>
<svg class="dg" viewBox="0 0 400 246" role="img" aria-label="앱 코드 한 줄을 고친 뒤 다시 빌드할 때 왼쪽처럼 코드 전체를 먼저 복사하면 COPY와 RUN pip install을 다시 실행하고 오른쪽처럼 requirements.txt를 먼저 복사해 설치하고 코드를 마지막에 복사하면 마지막 COPY만 다시 실행하는 그림">
<text class="label center" x="200" y="14">app.py 한 줄을 고치고 다시 빌드하면</text>
<rect class="line" x="4" y="27" width="192" height="196" rx="12"/><rect class="line" x="204" y="27" width="192" height="196" rx="12"/>
<text class="label center" x="100" y="44">코드를 먼저 복사</text>
<text class="label center" x="300" y="44">목록을 먼저 복사</text>
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
<ol class="steps">
<li>Python의 requirements.txt와 Node.js의 package.json은 필요한 라이브러리를 적는 목록이에요</li>
<li>목록만으로 설치할 수 있으면 고명(앱 코드)은 설치 뒤에 담아요</li>
<li><code>COPY . .</code>는 빌드에 넘긴 파일을 이미지의 작업 폴더에 넣어요</li>
</ol>
<p class="more">참고: <a href="https://docs.docker.com/build/cache/optimize/">Docker의 파일 복사 순서</a></p>
</section>

<section class="slide">
<h3>새 설치 목록은 설치와 한 단계로 묶어요</h3>
<svg class="dg" viewBox="0 0 400 205" role="img" aria-label="같은 설치 명령도 왼쪽은 보관한 결과를 쓰고 오른쪽은 캐시를 건너뛰어 새로 실행해요.">
<rect class="line" x="7" y="8" width="191" height="188" rx="12"/>
<text class="label center" x="102.5" y="34">이전 결과 쓰기</text>
<circle class="kafka" cx="102.5" cy="91" r="34"/><use class="ic" href="#i-warehouse" x="79.5" y="68" width="46" height="46"/>
<text class="chip" x="102.5" y="149">CACHED</text><text class="small" x="102.5" y="175">보관한 결과</text>
<rect class="line" x="202" y="8" width="191" height="188" rx="12"/>
<text class="label center" x="297.5" y="34">다시 설치하기</text>
<circle class="box" cx="297.5" cy="91" r="34"/><use class="ic" href="#i-factory" x="274.5" y="68" width="46" height="46"/>
<text class="chip" x="297.5" y="149">--no-cache</text><text class="small" x="297.5" y="175">명령 새로 실행</text>
</svg>
<ol class="steps">
<li><code>--no-cache</code>는 빌드 단계를 새로 실행하고 <code>--pull</code>은 새 기본 이미지를 확인해요</li>
<li>리눅스 설치 목록을 따로 받으면 옛 목록이 남을 수 있어요</li>
<li><code>apt-get update &amp;&amp; apt-get install</code>은 목록을 받아야 설치해요</li>
</ol>
<p class="more">참고: <a href="https://docs.docker.com/build/building/best-practices/">Docker의 이미지 갱신과 패키지 설치 예시</a></p>
</section>

<section class="slide">
<h3>포장에 쓸 파일만 공장에 보내요</h3>
<svg class="dg" viewBox="0 0 400 190" role="img" aria-label="빌드 파일 묶음에서 로그를 빼면 코드와 설치 목록만 포장 공장에 도착해요.">
<circle class="box" cx="58" cy="83" r="32"/><use class="ic" href="#i-doc" x="37" y="62" width="42" height="42"/>
<text class="big" x="58" y="148">파일 묶음</text>
<path class="line" d="M96 83H300"/><path class="line dash" d="M195 83v41"/>
<rect class="bad" x="159" y="122" width="72" height="32" rx="6"/><text class="chip" x="195" y="138">기록 제외</text>
<text class="chip" x="198" y="66">코드 · 목록 →</text>
<circle class="kafka" cx="339" cy="83" r="32"/><use class="ic" href="#i-factory" x="318" y="62" width="42" height="42"/><text class="big" x="339" y="148">포장 공장</text>
</svg>
<ol class="steps">
<li>공장에 보내는 파일 묶음(빌드 컨텍스트)에는 코드 기록(.git)과 설치 폴더(node_modules)도 들어갈 수 있어요</li>
<li>그 폴더 맨 위의 <code>.dockerignore</code>에 뺄 경로를 한 줄씩 적어요</li>
<li>다음 빌드에서 실행 기록(로그)도 복사하면 이미지가 커지고 캐시가 깨질 수 있어요</li>
</ol>
<p class="more">참고: <a href="https://docs.docker.com/build/concepts/context/#dockerignore-files">Docker의 빌드 제외 목록</a></p>
</section>

</div>

</div>
