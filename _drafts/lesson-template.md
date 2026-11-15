---
layout: post
title: "OOO는 왜 생겼을까? (비유)로 이해하는 OOO"
description: "검색 결과에 보일 한 문장 요약"
series: 시리즈id   # _data/series.yml 의 id. 새 시리즈면 거기에 먼저 추가
episode: 1
summary: "목록·글 상단에 보일 한 줄 요약"
---

<!--
글 쓰는 틀 (_drafts는 사이트에 올라가지 않음. 복사해서 _posts/시리즈id/YYYY-MM-DD-제목.md 로 저장. 폴더는 정리용이고 시리즈 소속은 front matter의 series가 정함. 이전/다음 편 링크는 레이아웃이 자동으로 붙임)
- 슬라이드 한 장 = h2 제목 + 그림(svg) 또는 표 + p.point 한 문장. 번호는 자동으로 붙음.
- 본문 문장은 p.point 한 문장이 원칙. 길게 설명하고 싶으면 그림을 고친다.
- 탭 두 개: #easy(쉬운 설명, 기본) / #dev(개발자용 심화). 슬라이드 번호는 탭마다 01부터.
- 쉬운 설명 순서: 문제 → (더 알아보기: 누가·왜 만들었나) → 해결 → 동작 원리 → 용어 → 언제 쓰면 안 되나 → 한 줄 정리
- 개발자용 심화: 실제 구조 그림, 내부 동작, 비교, 기본값/설정, 버전별 변화. 표 위주.
- section 안에는 빈 줄을 넣지 않는다 (마크다운 변환이 깨짐).
- svg 화살표 marker id는 글 전체에서 겹치지 않게 (쉬운 설명 a1, a2 … / 심화 d1, d2 …).
- 전체 규칙(움직임 포함)은 저장소 루트 CLAUDE.md 참고.
-->

<div class="lesson">
<nav class="tabs"><a href="#easy">쉬운 설명</a><a href="#dev">개발자용 심화</a></nav>

<div id="easy" class="panel">

<section class="slide">
<h2>어떤 문제가 있었을까?</h2>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="그림 설명">
<rect class="box" x="20" y="80" width="90" height="40" rx="8"/><text x="65" y="100">상자</text>
<rect class="bad" x="290" y="80" width="90" height="40" rx="8"/><text x="335" y="100">문제</text><text class="alert" x="335" y="138">빨간 글씨</text>
</svg>
<p class="point">문제를 한 문장으로.</p>
</section>

<details class="origin">
<summary>더 알아보기: 누가, 왜 만들었을까?</summary>
<p>언제, 어디서, 누가 만들었는지.</p>
<p>어떤 문제를 풀려고 만들었는지. 이름의 유래.</p>
</details>

<section class="slide">
<h2>그래서, 해결</h2>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="그림 설명">
<rect class="kafka" x="150" y="70" width="100" height="60" rx="10"/><text x="200" y="100">주인공</text>
</svg>
<p class="point">해결을 한 문장으로.</p>
</section>

<section class="slide">
<h2>진짜 이름 붙이기</h2>
<table>
<thead><tr><th>비유</th><th>진짜 용어</th></tr></thead>
<tbody>
<tr><td>비유 1</td><td>용어 (English)</td></tr>
</tbody>
</table>
</section>

<section class="slide">
<h2>언제 쓰면 안 될까?</h2>
<table>
<thead><tr><th>상황</th><th>방법</th><th>예</th></tr></thead>
<tbody>
<tr><td>상황</td><td>방법</td><td>예</td></tr>
</tbody>
</table>
</section>

<section class="slide end">
<h2>한 줄 정리</h2>
<p class="point">전체를 한 문장으로.</p>
</section>

<p class="next-tab"><a href="#dev">이해됐다면, 개발자용 심화 보기 →</a></p>
</div>

<div id="dev" class="panel">

<section class="slide">
<h2>전체 구조</h2>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="실제 구조 그림 설명">
<rect class="box" x="150" y="70" width="100" height="60" rx="8"/><text x="200" y="100">구성 요소</text>
</svg>
<p class="point">구조를 한 문장으로.</p>
</section>

<section class="slide">
<h2>먼저 알아 둘 설정</h2>
<table>
<thead><tr><th>설정</th><th>기본값</th><th>의미</th></tr></thead>
<tbody>
<tr><td><code>설정</code></td><td>값</td><td>의미</td></tr>
</tbody>
</table>
</section>

<section class="slide end">
<h2>한 줄 정리</h2>
<p class="point">개발자 관점에서 한 문장으로.</p>
</section>

</div>
</div>

