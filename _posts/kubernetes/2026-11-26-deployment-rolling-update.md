---
layout: post
title: "새 버전은 어떻게 멈추지 않고 바꿀까? 항구 교대 근무로 이해하는 쿠버네티스 Deployment"
description: "그림으로 보는 쿠버네티스 Deployment: 한꺼번에 바꾸면 서비스가 멈추는 문제, 계획표(Deployment)와 작업반(ReplicaSet), 롤링 업데이트가 파드를 조금씩 바꾸는 순서, maxSurge·maxUnavailable, 준비 확인, 이전 버전으로 되돌리기(rollout undo), Recreate와의 차이와 조심할 점을 동화책처럼 설명합니다."
date: 2026-11-26 22:00:00 +0900
series: kubernetes
episode: 3
summary: "Deployment는 항구의 교대 계획표예요. 버전을 고치면 관제실이 새 묶음을 하나씩 띄우고 옛 묶음을 줄여서 서비스를 멈추지 않고 바꿔요."
---

<div class="lesson lesson-hierarchy storybook">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: https://cdn.jsdelivr.net/npm/lucide-static@1.25.0/icons/ (ISC). 라이선스: assets/icons/LICENSE-lucide.txt. 이름 대응: i-tower=tower-control, i-clip=clipboard-list, i-bell=concierge-bell, i-undo=undo-2. -->
<symbol id="i-container" viewBox="0 0 24 24"><path d="M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4v6.6c0 .5.4 1.2.8 1.5l6.3 3.9a1.72 1.72 0 0 0 1.7 0l10.3-6c.5-.3.9-1 .9-1.5Z"/><path d="M10 21.9V14L2.1 9.1"/><path d="m10 14 11.9-6.9"/><path d="M14 19.8v-8.1"/><path d="M18 17.5V9.4"/></symbol>
<symbol id="i-tower" viewBox="0 0 24 24"><path d="M18.2 12.27 20 6H4l1.8 6.27a1 1 0 0 0 .95.73h10.5a1 1 0 0 0 .96-.73Z"/><path d="M8 13v9"/><path d="M16 22v-9"/><path d="m9 6 1 7"/><path d="m15 6-1 7"/><path d="M12 6V2"/><path d="M13 2h-2"/></symbol>
<symbol id="i-clip" viewBox="0 0 24 24"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></symbol>
<symbol id="i-bell" viewBox="0 0 24 24"><path d="M3 20a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1Z"/><path d="M20 16a8 8 0 1 0-16 0"/><path d="M12 4v4"/><path d="M10 4h4"/></symbol>
<symbol id="i-hourglass" viewBox="0 0 24 24"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></symbol>
<symbol id="i-undo" viewBox="0 0 24 24"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></symbol>
</defs>
</svg>

<div class="slide-group">
<h2 class="slide-group-title">문제: 한꺼번에 바꾸면 창구가 비어요</h2>

<section class="slide">
<h3>옛 묶음을 다 내리면 창구 뒤가 비어요</h3>
<svg class="dg" viewBox="0 0 400 260" role="img" aria-label="주문 앱이 고정 창구로 주문을 보낸다. 새 버전으로 바꾸려고 창구 뒤의 옛 묶음 세 개를 모두 내렸고 새 묶음은 아직 준비 중이라 창구가 주문을 이어 줄 곳이 없다.">
<defs><marker id="dp1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M78,110 L128,110" marker-end="url(#dp1)"/>
<path class="line dash" d="M204,98 L298,46"/>
<path class="line dash" d="M206,110 L296,110"/>
<path class="line dash" d="M204,122 L298,174"/>
<circle class="box" cx="50" cy="110" r="26"/><use class="ic" href="#i-container" x="34" y="94" width="32" height="32"/>
<text class="big" x="50" y="160">주문 앱</text>
<circle class="box" cx="168" cy="110" r="36"/><use class="ic" href="#i-bell" x="146" y="88" width="44" height="44"/>
<text class="big" x="168" y="168">고정 창구</text><text class="small" x="168" y="188">Service</text>
<circle class="bad blink" cx="322" cy="40" r="24"/><use class="ic" href="#i-container" x="307" y="25" width="30" height="30"/>
<circle class="bad blink" cx="322" cy="110" r="24"/><use class="ic" href="#i-container" x="307" y="95" width="30" height="30"/>
<circle class="bad blink" cx="322" cy="180" r="24"/><use class="ic" href="#i-container" x="307" y="165" width="30" height="30"/>
<text class="alert" x="322" y="222">옛 묶음 모두 내림</text>
<text class="small" x="200" y="248">새 묶음은 아직 준비 중이에요</text>
</svg>
<ol class="steps">
<li>새 버전으로 바꾸려면 묶음(파드)을 갈아야 해요</li>
<li>옛 묶음을 다 내리면(끄면) 그 사이 주문이 실패해요</li>
</ol>
<p class="more">고정 창구는 <a href="{{ '/2026/11/24/service/' | relative_url }}">2편 Service</a>에서 봐요</p>
</section>

<section class="slide">
<h3>새 버전이 고장 나면 되돌릴 길이 필요해요</h3>
<svg class="dg" viewBox="0 0 400 270" role="img" aria-label="옛 버전 my-app:1.2 묶음을 새 버전 my-app:1.3으로 바꿨더니 새 버전에 오류가 났다. 옛 버전으로 돌아가는 점선 화살표 가운데에 물음표가 있어 어떻게 돌아갈지 모르는 상태다. 버전 번호는 설명용 예시다.">
<defs><marker id="dp2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M130,110 L240,110" marker-end="url(#dp2)"/>
<path class="line dash" d="M262,206 Q185,266 108,206" marker-end="url(#dp2)"/>
<circle class="box" cx="94" cy="110" r="34"/><use class="ic" href="#i-container" x="72" y="88" width="44" height="44"/>
<text class="big" x="94" y="168">옛 버전</text><text class="mono small" x="94" y="188">my-app:1.2</text>
<circle class="bad" cx="276" cy="110" r="34"/><use class="ic" href="#i-container" x="254" y="88" width="44" height="44"/>
<text class="big" x="276" y="168">새 버전</text><text class="mono small" x="276" y="188">my-app:1.3</text>
<text class="alert" x="276" y="58">오류가 나요</text>
<text class="chip" x="185" y="94">바꿈</text>
<circle class="bad" cx="185" cy="236" r="16"/><text class="big" x="185" y="237">?</text>
</svg>
<ol class="steps">
<li>새 상자 종류(이미지)에 오류가 있을 수 있어요</li>
<li>옛 버전으로 돌아갈 기록이 있어야 해요 (버전은 예시)</li>
<li>사람이 손으로 되돌리면 실수하기 쉬워요</li>
</ol>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">교대: 계획표를 고치면 조금씩 바꿔요</h2>

<section class="slide">
<h3>계획표에서 버전만 고치면 교대가 시작돼요</h3>
<svg class="dg" viewBox="0 0 400 240" role="img" aria-label="계획표의 이미지 칸을 my-app:1.2에서 my-app:1.3으로 고치면 관제실이 바뀐 것을 보고 새 버전 묶음을 띄우기 시작한다. 버전 번호는 설명용 예시다.">
<defs><marker id="dp3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M116,80 L160,80" marker-end="url(#dp3)"/>
<path class="line" d="M240,80 L284,80" marker-end="url(#dp3)"/>
<circle class="kafka" cx="80" cy="80" r="34"/><use class="ic" href="#i-clip" x="58" y="58" width="44" height="44"/>
<text class="big" x="80" y="138">계획표</text><text class="small" x="80" y="158">Deployment</text>
<circle class="kafka" cx="200" cy="80" r="36"/><use class="ic" href="#i-tower" x="178" y="58" width="44" height="44"/>
<text class="big" x="200" y="138">관제실</text><text class="small" x="200" y="158">컨트롤 플레인</text>
<circle class="new" cx="320" cy="80" r="34"/><use class="ic" href="#i-container" x="298" y="58" width="44" height="44"/>
<text class="big" x="320" y="138">새 묶음</text><text class="small" x="320" y="158">파드</text>
<rect class="line" x="60" y="184" width="280" height="40" rx="12"/>
<text class="mono chip" x="200" y="204">image: my-app:1.2 → 1.3</text>
</svg>
<ol class="steps">
<li>계획표(Deployment)의 이미지를 바꿔요 (버전은 예시)</li>
<li>관제실은 이를 교대(롤링 업데이트) 신호로 봐요</li>
<li>개수만 바꾸면 교대는 일어나지 않아요</li>
</ol>
<p class="more">계획표와 관제실은 <a href="{{ '/2026/11/17/why-kubernetes/' | relative_url }}">1편</a>에서 봐요 · 참고: <a href="https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#updating-a-deployment">Deployment 업데이트</a></p>
</section>

<section class="slide">
<h3>새 작업반은 늘리고 옛 작업반은 줄여요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="계획표 아래에 버전별 작업반이 두 개 있다. 옛 작업반 1.2는 묶음을 줄이고 새 작업반 1.3은 묶음을 늘리는 중이다. 빈 자리는 점선 원이다. 버전과 개수는 설명용 예시다.">
<path class="line" d="M88,108 L156,64"/>
<path class="line" d="M88,142 L156,186"/>
<circle class="kafka" cx="60" cy="125" r="32"/><use class="ic" href="#i-clip" x="40" y="105" width="40" height="40"/>
<text class="big" x="60" y="180">계획표</text><text class="small" x="60" y="200">Deployment</text>
<rect class="line" x="156" y="20" width="234" height="88" rx="12"/>
<text class="label" x="172" y="42">옛 작업반 1.2</text>
<circle class="box" cx="186" cy="80" r="16"/><use class="ic" href="#i-container" x="175" y="69" width="22" height="22"/>
<circle class="box" cx="226" cy="80" r="16"/><use class="ic" href="#i-container" x="215" y="69" width="22" height="22"/>
<circle class="line dash" cx="266" cy="80" r="16"/>
<text class="chip" x="338" y="80">줄여요</text>
<rect class="line" x="156" y="142" width="234" height="88" rx="12"/>
<text class="label" x="172" y="164">새 작업반 1.3</text>
<circle class="new" cx="186" cy="202" r="16"/><use class="ic" href="#i-container" x="175" y="191" width="22" height="22"/>
<circle class="new" cx="226" cy="202" r="16"/><use class="ic" href="#i-container" x="215" y="191" width="22" height="22"/>
<circle class="line dash" cx="266" cy="202" r="16"/>
<text class="chip" x="338" y="202">늘려요</text>
</svg>
<ol class="steps">
<li>계획표는 버전마다 작업반(ReplicaSet)을 하나씩 둬요</li>
<li>작업반은 자기 버전 묶음의 개수를 지켜요</li>
<li>교대 중에는 두 작업반이 잠깐 함께 돌아요 (예시)</li>
</ol>
<p class="more">참고: <a href="https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/">ReplicaSet</a></p>
</section>

<section class="slide">
<h3>교대 중에도 늘 셋 이상이 주문을 받아요</h3>
<svg class="dg" viewBox="0 0 400 260" role="img" aria-label="묶음 3개를 바꾸는 다섯 단계. 시작에는 옛 묶음 3개, 1단계에는 옛 3개와 새 1개, 2단계에는 옛 2개와 새 2개, 3단계에는 옛 1개와 새 3개, 끝에는 새 3개가 있다. 어느 단계도 4개를 넘지 않고 3개 아래로 떨어지지 않는다. 개수는 설명용 예시다.">
<circle class="box" cx="120" cy="28" r="9"/><text class="chip" x="164" y="28">옛 묶음</text>
<circle class="new" cx="232" cy="28" r="9"/><text class="chip" x="276" y="28">새 묶음</text>
<path class="line dash" d="M24,84 L376,84"/>
<text class="chip" x="344" y="68">최대 4개</text>
<circle class="box" cx="56" cy="190" r="12"/><circle class="box" cx="56" cy="162" r="12"/><circle class="box" cx="56" cy="134" r="12"/>
<circle class="box" cx="128" cy="190" r="12"/><circle class="box" cx="128" cy="162" r="12"/><circle class="box" cx="128" cy="134" r="12"/><circle class="new" cx="128" cy="106" r="12"/>
<circle class="box" cx="200" cy="190" r="12"/><circle class="box" cx="200" cy="162" r="12"/><circle class="new" cx="200" cy="134" r="12"/><circle class="new" cx="200" cy="106" r="12"/>
<circle class="box" cx="272" cy="190" r="12"/><circle class="new" cx="272" cy="162" r="12"/><circle class="new" cx="272" cy="134" r="12"/><circle class="new" cx="272" cy="106" r="12"/>
<circle class="new" cx="344" cy="190" r="12"/><circle class="new" cx="344" cy="162" r="12"/><circle class="new" cx="344" cy="134" r="12"/>
<text class="chip" x="56" y="226">시작</text>
<text class="chip" x="128" y="226">1단계</text>
<text class="chip" x="200" y="226">2단계</text>
<text class="chip" x="272" y="226">3단계</text>
<text class="chip" x="344" y="226">끝</text>
</svg>
<ol class="steps">
<li>더 띄울 수(maxSurge)는 3의 25%를 올려 1개예요</li>
<li>미리 끌 수(maxUnavailable)는 3의 25%를 버려 0개예요</li>
<li>그래서 새 묶음이 준비된 뒤에야 옛 묶음을 꺼요 (예시)</li>
</ol>
<p class="more">두 값의 기본은 25%예요 · 참고: <a href="https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-update-deployment">롤링 업데이트 설정</a></p>
</section>

<section class="slide">
<h3>준비 확인을 통과해야 다음 교대로 넘어가요</h3>
<svg class="dg" viewBox="0 0 400 270" role="img" aria-label="고정 창구가 옛 묶음 세 개와 이어져 주문을 보내고 있다. 초록 점선의 새 묶음 하나는 모래시계가 붙어 아직 준비 확인을 통과하지 못해 창구와 이어지지 않았고 옛 묶음은 그대로 남아 있다.">
<defs><marker id="dp6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M106,106 L298,42" marker-end="url(#dp6)"/>
<path class="line" d="M108,116 L298,96" marker-end="url(#dp6)"/>
<path class="line" d="M106,128 L298,152" marker-end="url(#dp6)"/>
<circle class="kafka" cx="70" cy="120" r="38"/><use class="ic" href="#i-bell" x="48" y="98" width="44" height="44"/>
<text class="big" x="70" y="182">고정 창구</text>
<circle class="box" cx="322" cy="40" r="22"/><use class="ic" href="#i-container" x="308" y="26" width="28" height="28"/>
<circle class="box" cx="322" cy="96" r="22"/><use class="ic" href="#i-container" x="308" y="82" width="28" height="28"/>
<circle class="box" cx="322" cy="152" r="22"/><use class="ic" href="#i-container" x="308" y="138" width="28" height="28"/>
<circle class="new" cx="322" cy="212" r="22"/><use class="ic" href="#i-container" x="308" y="198" width="28" height="28"/>
<circle class="box" cx="352" cy="192" r="13"/><use class="ic" href="#i-hourglass" x="344" y="184" width="16" height="16"/>
<text class="chip" x="236" y="212">새 묶음 준비 중</text>
<text class="small" x="322" y="256">옛 묶음은 그대로예요</text>
</svg>
<ol class="steps">
<li>새 묶음도 준비 확인을 받아요 (readiness probe)</li>
<li>통과해야 창구 명단에 들어가 주문을 받아요</li>
<li>그래서 관제실은 그때까지 옛 묶음을 끄지 않아요</li>
</ol>
<p class="more">창구 명단과 준비 확인은 <a href="{{ '/2026/11/24/service/' | relative_url }}">2편 Service</a>에서 봐요 · 참고: <a href="https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-update-deployment">롤링 업데이트가 준비된 묶음을 세는 방식</a></p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">되돌리기: 옛 작업반을 남겨 둬요</h2>

<section class="slide">
<h3>교대가 끝나도 옛 작업반은 0개로 남아요</h3>
<svg class="dg" viewBox="0 0 400 220" role="img" aria-label="계획표 옆에 작업반 기록 세 줄이 있다. 작업반 1.1과 1.2는 묶음 없이 빈 자리만 남아 있고 지금 쓰는 작업반 1.3은 묶음 3개를 돌린다. 버전과 개수는 설명용 예시다.">
<path class="line dash" d="M90,96 L150,42"/>
<path class="line dash" d="M92,108 L150,102"/>
<path class="line" d="M90,122 L150,162"/>
<circle class="kafka" cx="60" cy="110" r="32"/><use class="ic" href="#i-clip" x="40" y="90" width="40" height="40"/>
<text class="big" x="60" y="166">계획표</text><text class="small" x="60" y="186">기록을 남겨요</text>
<rect class="line" x="150" y="20" width="236" height="44" rx="10"/>
<text class="chip" x="206" y="42">작업반 1.1</text><circle class="line dash" cx="300" cy="42" r="14"/>
<rect class="line" x="150" y="80" width="236" height="44" rx="10"/>
<text class="chip" x="206" y="102">작업반 1.2</text><circle class="line dash" cx="300" cy="102" r="14"/>
<rect class="line" x="150" y="140" width="236" height="44" rx="10"/>
<text class="chip" x="206" y="162">작업반 1.3</text>
<circle class="new" cx="290" cy="162" r="14"/><use class="ic" href="#i-container" x="281" y="153" width="18" height="18"/>
<circle class="new" cx="322" cy="162" r="14"/><use class="ic" href="#i-container" x="313" y="153" width="18" height="18"/>
<circle class="new" cx="354" cy="162" r="14"/><use class="ic" href="#i-container" x="345" y="153" width="18" height="18"/>
<text class="small" x="265" y="206">지금 쓰는 작업반</text>
</svg>
<ol class="steps">
<li>옛 작업반은 묶음 설계(파드 템플릿)를 들고 있어요</li>
<li>기본으로 옛 작업반 10개까지 남겨요 (revisionHistoryLimit)</li>
<li>그래서 1.2나 그 전 버전으로 돌아갈 수 있어요 (예시)</li>
</ol>
<p class="more">참고: <a href="https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#clean-up-policy">오래된 작업반 정리 기준</a></p>
</section>

<section class="slide">
<h3>되돌리기는 교대를 거꾸로 하는 일이에요</h3>
<svg class="dg" viewBox="0 0 400 240" role="img" aria-label="되돌리기를 하면 고장 난 작업반 1.3은 묶음을 3개에서 0개로 줄이고 남겨 두었던 작업반 1.2는 0개에서 3개로 다시 늘린다. 버전과 개수는 설명용 예시다.">
<defs><marker id="dp8" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M190,180 L208,180" marker-end="url(#dp8)"/>
<circle class="kafka" cx="140" cy="56" r="34"/><use class="ic" href="#i-undo" x="118" y="34" width="44" height="44"/>
<text class="big" x="186" y="48" style="text-anchor:start">되돌리기</text>
<text class="mono small" x="186" y="70" style="text-anchor:start">kubectl rollout undo</text>
<rect class="line" x="12" y="116" width="176" height="110" rx="12"/>
<text class="label center" x="100" y="138">작업반 1.3</text>
<circle class="bad" cx="56" cy="176" r="14"/><use class="ic" href="#i-container" x="47" y="167" width="18" height="18"/>
<circle class="bad" cx="100" cy="176" r="14"/><use class="ic" href="#i-container" x="91" y="167" width="18" height="18"/>
<circle class="bad" cx="144" cy="176" r="14"/><use class="ic" href="#i-container" x="135" y="167" width="18" height="18"/>
<text class="chip" x="100" y="210">3 → 0</text>
<rect class="line" x="212" y="116" width="176" height="110" rx="12"/>
<text class="label center" x="300" y="138">작업반 1.2</text>
<circle class="box" cx="256" cy="176" r="14"/><use class="ic" href="#i-container" x="247" y="167" width="18" height="18"/>
<circle class="box" cx="300" cy="176" r="14"/><use class="ic" href="#i-container" x="291" y="167" width="18" height="18"/>
<circle class="box" cx="344" cy="176" r="14"/><use class="ic" href="#i-container" x="335" y="167" width="18" height="18"/>
<text class="chip" x="300" y="210">0 → 3</text>
</svg>
<ol class="steps">
<li>되돌리기(rollout undo)는 남겨 둔 작업반을 다시 써요</li>
<li>늘리고 줄이는 순서는 교대와 같아요</li>
<li>데이터는 두고 묶음 설계만 돌아가요 (버전은 예시)</li>
</ol>
<p class="more">참고: <a href="https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-back-a-deployment">Deployment 되돌리기</a></p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">판단: 어떻게 바꾸고 무엇을 조심해요?</h2>

<section class="slide">
<h3>교대는 안 멈추고 한꺼번에 바꾸면 멈춰요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="왼쪽에서 오른쪽으로 흐르는 같은 시간 축으로 두 방식을 비교한다. 시간 길이는 설명용이다. 위 카드의 교대(RollingUpdate)는 옛 버전 1.2 막대와 새 버전 1.3 막대가 잠깐 겹쳐 빈 시간이 없다. 아래 카드의 한꺼번에 바꾸기(Recreate)는 1.2 막대가 끝난 뒤 빈틈이 있고 그다음에 1.3 막대가 시작된다.">
<rect class="line" x="10" y="8" width="380" height="112" rx="12"/>
<text class="label center" x="200" y="30">교대 · RollingUpdate</text><text class="small" x="350" y="30">시간 →</text>
<rect class="box" x="30" y="48" width="200" height="24" rx="6"/><text class="chip" x="90" y="60">1.2</text>
<rect class="new" x="150" y="82" width="220" height="24" rx="6"/><text class="chip" x="300" y="94">1.3</text>
<rect class="line" x="10" y="130" width="380" height="112" rx="12"/>
<text class="label center" x="200" y="152">한꺼번에 · Recreate</text>
<rect class="box" x="30" y="170" width="120" height="24" rx="6"/><text class="chip" x="90" y="182">1.2</text>
<rect class="bad blink" x="154" y="170" width="72" height="58" rx="6"/><text class="chip" x="190" y="199">빈틈</text>
<rect class="new" x="230" y="204" width="140" height="24" rx="6"/><text class="chip" x="300" y="216">1.3</text>
</svg>
<ol class="steps">
<li>기본인 교대(RollingUpdate)는 두 버전이 잠깐 겹쳐요</li>
<li>한꺼번에(Recreate)는 다 내린 뒤 띄워요</li>
<li>두 버전이 같은 데이터를 함께 못 쓸 때 골라요</li>
</ol>
<p class="more">참고: <a href="https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#strategy">Deployment 교대 방식</a></p>
</section>

<section class="slide">
<h3>쓸 때는 세 가지를 조심해요</h3>
<svg class="dg" viewBox="0 0 400 170" role="img" aria-label="조심할 점 세 가지. 교대 중에는 두 버전이 함께 돌아 새 버전도 옛 데이터를 읽어야 하고, 교대가 막혀도 관제실은 자동으로 되돌리지 않고 멈춤 표시만 하며, 되돌리기는 데이터베이스 내용을 되돌리지 않는다.">
<circle class="bad" cx="70" cy="64" r="32"/><use class="ic" href="#i-container" x="50" y="44" width="40" height="40"/>
<text class="big" x="70" y="122">두 버전 함께</text><text class="chip" x="70" y="144">함께 돌게 만들어요</text>
<circle class="bad" cx="200" cy="64" r="32"/><use class="ic" href="#i-tower" x="180" y="44" width="40" height="40"/>
<text class="big" x="200" y="122">자동 되돌림 없음</text><text class="chip" x="200" y="144">멈춤만 알려요</text>
<circle class="bad" cx="330" cy="64" r="32"/><use class="ic" href="#i-undo" x="310" y="44" width="40" height="40"/>
<text class="big" x="330" y="122">데이터는 그대로</text><text class="chip" x="330" y="144">DB는 못 되돌려요</text>
</svg>
<ol class="steps">
<li>새 버전도 옛 버전이 쓰던 데이터를 읽게 만들어요</li>
<li>교대가 10분 넘게 막혀도 멈춤 표시만 해요 (progressDeadlineSeconds)</li>
<li>데이터베이스(DB)에 바뀐 내용은 따로 챙겨요</li>
</ol>
<p class="more">참고: <a href="https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#failed-deployment">멈춘 교대</a></p>
</section>
</div>

</div>
