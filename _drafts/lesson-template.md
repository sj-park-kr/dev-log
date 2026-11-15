---
layout: post
title: "OOO는 왜 생겼을까? (비유)로 이해하는 OOO"
description: "비유에서 실제 동작까지 이어지는 내용을 검색 결과용 한 문장으로 요약"
series: 시리즈id   # _data/series.yml 의 id. 새 시리즈면 거기에 먼저 추가
episode: 1
summary: "목록·글 상단에 보일 한 줄 요약"
---

<!--
글 쓰는 틀 (_drafts는 사이트에 올라가지 않음. 복사해서 _posts/시리즈id/YYYY-MM-DD-제목.md 로 저장. 폴더는 정리용이고 시리즈 소속은 front matter의 series가 정함. 이전/다음 편 링크는 레이아웃이 자동으로 붙임)
- 승인된 구조·그림 기준 예시: _posts/docker/2026-11-15-why-container.md. (Kafka 글은 예전 구조라 대응표·정리 묶음이 남아 있으니 그 부분은 따라 하지 않는다.)
- 글 전체는 lesson lesson-hierarchy로 감싼다. 탭이나 easy/dev 패널, next-tab 링크는 넣지 않는다.
- 맨 위에 아이콘 스프라이트(숨긴 svg)를 두고, intro는 그 다음에, 주제 묶음 slide-group은 3~5개 둔다. 묶음 제목은 h2.slide-group-title, 하위 슬라이드 제목은 h3로 쓴다.
- 묶음은 하위 슬라이드를 둘 이상 포함한다. 번호는 CSS가 1, 2와 1-1, 1-2처럼 자동으로 붙인다. 오른쪽에 떠 있는 목차도 레이아웃이 h2·h3에서 자동으로 만든다. 묶음 제목은 짧은 이름: 설명 꼴로 쓴다(목차에는 콜론 앞부분만 나온다).
- 시리즈 로고나 emoji는 글이 아니라 _data/series.yml에서 정한다.
- 문제부터 보여 주고 같은 개념의 비유 바로 뒤에 실제로는 슬라이드를 붙인다. 개념마다 반복한다.
- origin은 관련 문제 옆에 details로 접어 둔다. 꼭 필요한 설명은 접힌 곳에 숨기지 않는다.
- 슬라이드 한 장 = h3 + 그림(svg) 또는 표 + p.point 핵심 한 문장 + p.explain 설명 2~3문장(용어를 풀어야 하는 실제로는 슬라이드만 4문장까지).
- explain은 그림에 안 보이는 누가·언제·왜를 순서대로 쓰고 그림 속 글자를 반복하지 않는다. 표 슬라이드와 한눈에 다시 보기 슬라이드는 explain을 생략할 수 있지만 point는 항상 둔다. 줄바꿈은 CSS가 맞추니 br을 쓰지 않는다.
- 그림의 사물은 글자 상자 대신 Lucide 아이콘으로 그린다(<use class="ic">). 색 원(kafka 좋은 쪽·bad 문제 쪽·box 중립·new 점선 보관) 위에 얹고 아래에 big/chip 라벨 한두 마디만 쓴다. 장식용 아이콘과 이모지는 넣지 않는다. 자세한 규칙은 docs/rules/05-svg.md.
- 비유와 실제 용어 대응표와 별도 정리 묶음은 만들지 않는다. 주의사항은 관련 개념 묶음 안의 이럴 땐 조심해요 슬라이드에 두고, 글 맨 끝에 한눈에 다시 보기 슬라이드를 하나 둔다. slide end 한 줄 정리는 쓰지 않는다.
- 용어는 처음 나올 때 한 줄로 풀고 시리즈 비유와 연결한다. 프로듀서가 / 브로커가 / 컨슈머가 등 주체를 분명히 쓴다.
- 쉽게 고쳐도 원래 point의 버전·기본값·날짜·동작 조건은 빠뜨리지 않는다.
- section/details 안에는 빈 줄이나 마크다운을 넣지 않는다. svg marker id는 글 전체에서 중복 없이 쓴다.
- 아래 괄호 속 안내를 실제 제목·그림·표·문장으로 바꾼다. 작업별 규칙은 저장소 루트 AGENTS.md가 안내하는 docs/ 문서 참고.
- 독자는 개념부터 잡으려는 주니어·바이브 코딩 사용자다. 비유와 그림으로 역할·관계·흐름부터 설명한다. 아래 설정·기본값 표는 개념 이해에 필요한 경우에만 사용한다.
-->

<div class="lesson lesson-hierarchy">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 글에 쓰는 아이콘만 남긴다. 원본: Lucide (lucide-static 버전 명시, ISC). 라이선스: assets/icons/LICENSE-lucide.txt. 직접 그린 아이콘은 여기에 밝힌다. -->
<symbol id="i-pot" viewBox="0 0 24 24"><path d="M2 12h20M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8M4 8l16-4M8.86 6.78l-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"/></symbol>
<symbol id="i-doc" viewBox="0 0 24 24"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2zM14 2v5a1 1 0 0 0 1 1h5M10 9H8M16 13H8M16 17H8"/></symbol>
</defs>
</svg>

<div class="intro">
<p class="q">(이 글에서 풀 질문 한 줄)</p>
<p>(앞 편과 이어서 무엇이 문제인지 설명해요.)</p>
<p>(다 읽으면 무엇을 알게 되는지 설명해요.)</p>
</div>

<div class="slide-group">
<h2 class="slide-group-title">(문제: 누가 어떤 어려움을 겪나요?)</h2>

<section class="slide">
<h3>(비유로 보여 주는 문제의 제목)</h3>
<svg class="dg" viewBox="0 0 400 180" role="img" aria-label="문제를 보여 주는 그림으로 바꿔요">
<defs><marker id="a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M124,80 L276,80" marker-end="url(#a1)"/>
<circle class="kafka" cx="80" cy="80" r="40"/><use class="ic" href="#i-pot" x="54" y="54" width="52" height="52"/>
<text class="big" x="80" y="140">(일하는 쪽)</text>
<circle class="bad" cx="320" cy="80" r="40"/><use class="ic" href="#i-doc" x="294" y="54" width="52" height="52"/>
<text class="big" x="320" y="140">(막히는 곳)</text>
<circle class="packet" r="5"><animateMotion dur="1.6s" begin="0s" repeatCount="indefinite" path="M124,80 L276,80"/></circle>
</svg>
<p class="point">(어떤 문제가 생기는지 한 문장으로 써요.)</p>
<p class="explain">(누가 어떤 일을 하는지 써요.) (언제 무엇 때문에 막히는지 써요.) (그래서 어떤 결과가 생기는지 써요.)</p>
</section>

<section class="slide">
<h3>실제로는: (같은 문제가 실제로 생기는 과정)</h3>
<table>
<thead><tr><th>주체</th><th>하는 일</th><th>생기는 문제</th></tr></thead>
<tbody>
<tr><td>(주체)</td><td>(동작)</td><td>(결과)</td></tr>
</tbody>
</table>
<p class="point">(비유에서 본 문제를 실제 동작에 연결해요.)</p>
<p class="explain">(처음 쓰는 용어의 뜻을 비유와 연결해요.) (주체가 언제 무엇을 하는지 써요.) (그 결과를 설명해요.) (필요하면 한 문장을 더해요.)</p>
</section>

<details class="origin">
<summary>더 알아보기: 누가 왜 만들었을까?</summary>
<p>(언제 어디서 누가 만들었는지 써요.)</p>
<p>(어떤 문제를 풀려고 만들었는지와 이름의 유래를 써요.)</p>
</details>
</div>

<div class="slide-group">
<h2 class="slide-group-title">(해결: 무엇을 바꾸면 풀리나요?)</h2>

<section class="slide">
<h3>(같은 비유로 보여 주는 해결 방법)</h3>
<svg class="dg" viewBox="0 0 400 220" role="img" aria-label="해결 방법을 보여 주는 그림으로 바꿔요">
<circle class="kafka" cx="200" cy="52" r="40"/><use class="ic" href="#i-pot" x="174" y="26" width="52" height="52"/>
<text class="big" x="200" y="112">(해결 장치)</text>
<rect class="line" x="10" y="132" width="380" height="78" rx="12"/>
<text class="label center" x="200" y="152">(관련 항목을 묶는 카드 제목)</text>
<circle class="box" cx="100" cy="180" r="17"/><use class="ic" href="#i-doc" x="89" y="169" width="22" height="22"/>
<text class="chip" x="100" y="202">(항목 1)</text>
<circle class="box" cx="300" cy="180" r="17"/><use class="ic" href="#i-doc" x="289" y="169" width="22" height="22"/>
<text class="chip" x="300" y="202">(항목 2)</text>
</svg>
<p class="point">(해결 방법을 한 문장으로 써요.)</p>
<p class="explain">(주체가 무엇을 바꾸는지 써요.) (바꾼 뒤 일이 어떤 순서로 이어지는지 써요.) (앞의 문제가 어떻게 풀리는지 써요.)</p>
</section>

<section class="slide">
<h3>실제로는: (그 해결 장치가 동작하는 과정)</h3>
<table>
<thead><tr><th>순서</th><th>주체</th><th>동작</th></tr></thead>
<tbody>
<tr><td>(순서)</td><td>(주체)</td><td>(동작)</td></tr>
</tbody>
</table>
<p class="point">(실제 장치가 하는 일을 한 문장으로 써요.)</p>
<p class="explain">(용어의 뜻을 비유와 연결해요.) (누가 무엇을 하고 다음에 누가 이어받는지 써요.) (그래서 어떤 결과가 생기는지 써요.)</p>
</section>

<section class="slide">
<h3>(확인할 설정과 기본값: 개념 이해에 필요할 때만)</h3>
<table>
<thead><tr><th>설정</th><th>기본값과 기준 버전</th><th>의미</th></tr></thead>
<tbody>
<tr><td><code>(설정)</code></td><td>(값과 버전)</td><td>(누가 무엇을 정하는지)</td></tr>
</tbody>
</table>
<p class="point">(설정에서 확인할 핵심과 기준 버전을 한 문장으로 써요.)</p>
</section>

<section class="slide">
<h3>이럴 땐 조심해요: (쓸 때 조심할 상황)</h3>
<table>
<thead><tr><th>오해나 상황</th><th>실제와 확인할 것</th></tr></thead>
<tbody>
<tr><td>(위에서 설명하지 않은 새 내용만)</td><td>(이유와 확인할 것)</td></tr>
</tbody>
</table>
<p class="point">(주의할 핵심을 한 문장으로 써요.)</p>
<p class="explain">(왜 그런지 한두 문장으로 써요.)</p>
</section>

<section class="slide">
<h3>한눈에 다시 보기: (이 글의 핵심 N줄)</h3>
<svg class="dg" viewBox="0 0 400 150" role="img" aria-label="핵심 개념을 한 줄씩 요약한 그림으로 바꿔요">
<circle class="bad" cx="30" cy="28" r="18"/><use class="ic" href="#i-doc" x="19" y="17" width="22" height="22"/>
<text class="label" x="62" y="19">(문제)</text><text class="small" x="62" y="38" style="text-anchor:start">(한 줄 설명)</text>
<circle class="kafka" cx="30" cy="76" r="18"/><use class="ic" href="#i-pot" x="19" y="65" width="22" height="22"/>
<text class="label" x="62" y="67">(핵심 개념)</text><text class="small" x="62" y="86" style="text-anchor:start">(한 줄 설명)</text>
<circle class="kafka" cx="30" cy="124" r="18"/><use class="ic" href="#i-pot" x="19" y="113" width="22" height="22"/>
<text class="label" x="62" y="115">(핵심 개념)</text><text class="small" x="62" y="134" style="text-anchor:start">(한 줄 설명)</text>
</svg>
<p class="point">(글 전체를 문제와 해결로 이어 한 문장으로 정리해요.)</p>
</section>
</div>

</div>
