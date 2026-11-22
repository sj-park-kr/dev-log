---
layout: post
title: "OOO는 왜 생겼을까? (비유)로 이해하는 OOO"
description: "검색 결과용 한 문장. 이 글이 답하는 질문들(뭐야·왜·어떻게·뭐가 달라·언제·뭘 조심)을 키워드로 담는다"
date: YYYY-MM-DD HH:MM:SS +0900
series: 시리즈id   # _data/series.yml 의 id. 새 시리즈면 거기에 먼저 추가
episode: 1
summary: "글 상단과 목록에 보일 한 줄 요약. 비유 한 문장 + 핵심 한 문장"
---

<!--
동화책 형식 작성 틀 (_drafts는 사이트에 올라가지 않음. 복사해서 _posts/시리즈id/YYYY-MM-DD-영문-슬러그.md 로 저장)
- 기준 예시: _posts/kafka/2026-11-15-why-kafka.md. 규칙: docs/rules/01, 03, 04, 05.
- 그림이 설명하고 글자는 거든다. 페이지 = h3 답 한 문장 + 큰 svg 한 장 + ol.steps 0~3줄 + p.more(선택).
- intro, 30초 요약, p.point, p.explain, 표, 문단, 한눈에 다시 보기, 직접 해 보기 위젯은 쓰지 않는다.
- 묶음 3~5개, 묶음마다 페이지 2~4장, 전체 8~12페이지. 묶음 제목은 "짧은 이름: 설명".
- 흐름: 문제(없으면 불편) → 정체(비유로 뭐야) → 원리(어떻게) → 비교(나란히 한 장) → 판단(언제 쓰나·조심할 점).
- 기술 용어는 처음에 비유 이름 옆 괄호로: 가게(프로듀서). 자세한 조건은 p.more로 다른 편 링크.
- 비교할 두 가지는 한 그림 안에 같은 기준으로 나란히 그린다.
- section/details 안에는 빈 줄과 마크다운 금지. marker id는 글 전체에서 겹치지 않게.
- 아래 (괄호) 안내를 실제 내용으로 바꾸고 필요한 만큼 페이지를 복사한다.
-->

<div class="lesson lesson-hierarchy storybook">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: https://cdn.jsdelivr.net/npm/lucide-static@1.25.0/icons/ (ISC). 라이선스: assets/icons/LICENSE-lucide.txt. (이름이 다른 아이콘 대응: i-check=circle-check) -->
<symbol id="i-store" viewBox="0 0 24 24">(Lucide store 아이콘의 path)</symbol>
<symbol id="i-user-round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></symbol>
</defs>
</svg>

<div class="slide-group">
<h2 class="slide-group-title">문제: (이게 없을 때 불편한 점)</h2>

<section class="slide">
<h3>(이게 없을 때 생기는 일을 답 한 문장으로)</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="(그림 내용 전체를 문장으로)">
<defs><marker id="sb1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M114,125 L256,125" marker-end="url(#sb1)"/>
<circle class="box" cx="70" cy="125" r="42"/><use class="ic" href="#i-store" x="44" y="99" width="52" height="52"/>
<text class="big" x="70" y="192">(이름표)</text>
<circle class="bad" cx="290" cy="125" r="30"/><use class="ic" href="#i-user-round" x="270" y="105" width="40" height="40"/>
<text class="big" x="290" y="180">(이름표)</text>
</svg>
<ol class="steps">
<li>(그림이 뜻하는 것 한 문장)</li>
<li>(그래서 생기는 문제 한 문장)</li>
</ol>
</section>

<section class="slide">
<h3>(두 방식을 비교해 답 한 문장으로)</h3>
<svg class="dg" viewBox="0 0 400 306" role="img" aria-label="(위 카드와 아래 카드가 각각 무엇을 보여 주는지 문장으로)">
<rect class="line" x="6" y="6" width="388" height="136" rx="12"/>
<text class="label center" x="200" y="26">(방식 A)</text>
<rect class="line" x="6" y="152" width="388" height="148" rx="12"/>
<text class="label center" x="200" y="172">(방식 B)</text>
</svg>
<ol class="steps">
<li>(A는 어떻게 되는지)</li>
<li>(B는 어떻게 되는지)</li>
</ol>
</section>

<details class="origin">
<summary>더 알아보기: 누가 왜 만들었을까?</summary>
<p>(언제, 어디서, 누가, 어떤 문제 때문에 만들었는지)</p>
<p>(이름의 유래)</p>
<p>참고: <a href="(1차 출처)">(출처 이름)</a></p>
</details>
</div>

<div class="slide-group">
<h2 class="slide-group-title">(비유 이름): (주인공이 하는 일)</h2>

<section class="slide">
<h3>(주인공)은 (비유)예요</h3>
<svg class="dg" viewBox="0 0 400 260" role="img" aria-label="(그림 내용)">
<!-- 비유 이름은 big, 실제 용어는 그 아래 small -->
</svg>
<ol class="steps">
<li>(비유 이름)((용어))는 (무엇을) 해요</li>
<li>(비유 이름)((용어))는 (무엇을) 해요</li>
<li>(비유 이름)((용어))는 (무엇을) 해요</li>
</ol>
</section>

<section class="slide">
<h3>(동작 순서를 답 한 문장으로)</h3>
<svg class="dg" viewBox="0 0 400 296" role="img" aria-label="(① ② ③ 순서를 문장으로)">
</svg>
<ol class="steps">
<li>(이 순서의 뜻)</li>
</ol>
<p class="more">(자세한 조건)은 <a href="{{ '/YYYY/MM/DD/슬러그/' | relative_url }}">(n편)</a>에서 봐요</p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">판단: 언제 쓰고 무엇을 조심해요?</h2>

<section class="slide">
<h3>이럴 때 써요, 이럴 땐 안 써요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="(왼쪽 카드와 오른쪽 카드의 항목을 문장으로)">
<rect class="line" x="6" y="6" width="190" height="238" rx="12"/>
<text class="label center" x="101" y="80">이럴 때 써요</text>
<rect class="line" x="204" y="6" width="190" height="238" rx="12"/>
<text class="label center" x="299" y="80">이럴 땐 안 써요</text>
</svg>
</section>

<section class="slide">
<h3>쓸 때는 (n)가지를 조심해요</h3>
<svg class="dg" viewBox="0 0 400 170" role="img" aria-label="(조심할 점을 문장으로)">
</svg>
<ol class="steps">
<li>(조심할 점) (<a href="{{ '/YYYY/MM/DD/슬러그/' | relative_url }}">n편</a>)</li>
</ol>
</section>
</div>

</div>
