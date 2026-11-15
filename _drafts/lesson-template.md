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
- 승인된 구조 예시: _posts/kafka/2026-11-15-delivery-semantics.md.
- 글 전체는 lesson lesson-hierarchy로 감싼다. 탭이나 easy/dev 패널, next-tab 링크는 넣지 않는다.
- intro는 맨 위에, 주제 묶음 slide-group은 3~5개 둔다. 묶음 제목은 h2.slide-group-title, 하위 슬라이드 제목은 h3로 쓴다.
- 묶음은 하위 슬라이드를 둘 이상 포함한다. 번호는 CSS가 1, 2와 1-1, 1-2처럼 자동으로 붙인다.
- 문제부터 보여 주고, 같은 개념의 비유 바로 뒤에 실제로는 슬라이드를 붙인다. 개념마다 반복한다.
- origin은 관련 문제 옆에 details로 접어 둔다. 꼭 필요한 설명은 접힌 곳에 숨기지 않는다.
- 슬라이드 한 장 = h3 + 그림(svg) 또는 표 + p.point 핵심 한 문장 + p.explain 설명 2~4문장.
- explain은 누가 언제 무엇을 하고 그래서 어떻게 되는지 순서대로 쓴다. 표로 정리하는 슬라이드와 한 줄 정리에는 생략 가능하지만 point는 항상 둔다.
- 용어는 처음 나올 때 한 줄로 풀고 시리즈 비유와 연결한다. 프로듀서가 / 브로커가 / 컨슈머가 등 주체를 분명히 쓴다.
- 비교·설정·버전·주의사항은 관련 개념 옆이나 마지막 묶음에 둔다. 겹치는 주의사항과 한 줄 정리는 합친다.
- 쉽게 고쳐도 원래 point의 버전·기본값·날짜·동작 조건은 빠뜨리지 않는다.
- section/details 안에는 빈 줄이나 마크다운을 넣지 않는다. svg marker id는 글 전체에서 중복 없이 쓴다.
- 아래 괄호 속 안내를 실제 제목·그림·표·문장으로 바꾼다. 작업별 규칙은 저장소 루트 AGENTS.md가 안내하는 docs/ 문서 참고.
- 독자는 개념부터 잡으려는 주니어·바이브 코딩 사용자다. 비유와 그림으로 역할·관계·흐름부터 설명한다. 아래 설정·기본값 표는 개념 이해에 필요한 경우에만 사용한다.
-->

<div class="lesson lesson-hierarchy">

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
<rect class="box" x="20" y="60" width="120" height="50" rx="8"/><text x="80" y="85">일하는 쪽</text>
<rect class="bad" x="240" y="60" width="140" height="50" rx="8"/><text x="310" y="85">막히는 곳</text>
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
<p class="explain">(처음 쓰는 용어의 뜻을 비유와 연결해요.) (주체가 언제 무엇을 하는지 써요.) (그 결과를 설명해요.)</p>
</section>

<details class="origin">
<summary>더 알아보기: 누가, 왜 만들었을까?</summary>
<p>(언제, 어디서, 누가 만들었는지 써요.)</p>
<p>(어떤 문제를 풀려고 만들었는지와 이름의 유래를 써요.)</p>
</details>
</div>

<div class="slide-group">
<h2 class="slide-group-title">(해결: 무엇을 바꾸면 풀리나요?)</h2>

<section class="slide">
<h3>(같은 비유로 보여 주는 해결 방법)</h3>
<svg class="dg" viewBox="0 0 400 180" role="img" aria-label="해결 방법을 보여 주는 그림으로 바꿔요">
<rect class="kafka" x="120" y="50" width="160" height="70" rx="10"/><text x="200" y="85">해결 장치</text>
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
</div>

<div class="slide-group">
<h2 class="slide-group-title">정리: 이름과 설정, 주의할 점을 확인해요</h2>

<section class="slide">
<h3>(비유와 실제 용어의 대응)</h3>
<table>
<thead><tr><th>비유</th><th>실제 용어</th></tr></thead>
<tbody>
<tr><td>(비유)</td><td>(용어와 뜻)</td></tr>
</tbody>
</table>
<p class="point">(비유와 실제 용어의 관계를 한 문장으로 정리해요.)</p>
</section>

<section class="slide">
<h3>(확인할 설정과 기본값)</h3>
<table>
<thead><tr><th>설정</th><th>기본값과 기준 버전</th><th>의미</th></tr></thead>
<tbody>
<tr><td><code>(설정)</code></td><td>(값과 버전)</td><td>(누가 무엇을 정하는지)</td></tr>
</tbody>
</table>
<p class="point">(설정에서 확인할 핵심과 기준 버전을 한 문장으로 써요.)</p>
</section>

<section class="slide">
<h3>(쓸 때 조심할 상황)</h3>
<table>
<thead><tr><th>상황</th><th>이유</th><th>확인할 것</th></tr></thead>
<tbody>
<tr><td>(상황)</td><td>(이유)</td><td>(확인할 것)</td></tr>
</tbody>
</table>
<p class="point">(주의할 핵심을 한 문장으로 써요.)</p>
</section>

<section class="slide end">
<h3>한 줄 정리</h3>
<p class="point">(비유와 실제 동작을 이어 한 문장으로 정리해요.)</p>
</section>
</div>

</div>
