---
layout: post
title: "쿠버네티스는 왜 생겼을까? 항구 관제실로 이해하는 Kubernetes"
description: "서버 여러 대의 컨테이너를 사람이 직접 돌보기 어려운 문제를 항구 관제실 비유로 설명하고 클러스터·컨트롤 플레인·노드·파드와 원하는 상태를 맞추는 컨트롤러와 자가 치유까지 실제 동작으로 이어서 설명합니다."
date: 2026-11-17 22:40:00 +0900
series: kubernetes
episode: 1
summary: "쿠버네티스는 여러 배를 지켜보는 항구 관제실이에요. 원하는 상태를 계획표에 적어 두면 서버가 멈춰도 그 상태를 스스로 다시 맞춰요."
---

<div class="lesson lesson-hierarchy storybook">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: https://cdn.jsdelivr.net/npm/lucide-static@1.25.0/icons/ (ISC). 라이선스: assets/icons/LICENSE-lucide.txt. 이름 대응: i-tower=tower-control, i-clip=clipboard-list, i-refresh=refresh-cw. -->
<symbol id="i-user" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></symbol>
<symbol id="i-ship" viewBox="0 0 24 24"><path d="M12 10.189V14"/><path d="M12 2v3"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76"/><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></symbol>
<symbol id="i-container" viewBox="0 0 24 24"><path d="M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4v6.6c0 .5.4 1.2.8 1.5l6.3 3.9a1.72 1.72 0 0 0 1.7 0l10.3-6c.5-.3.9-1 .9-1.5Z"/><path d="M10 21.9V14L2.1 9.1"/><path d="m10 14 11.9-6.9"/><path d="M14 19.8v-8.1"/><path d="M18 17.5V9.4"/></symbol>
<symbol id="i-tower" viewBox="0 0 24 24"><path d="M18.2 12.27 20 6H4l1.8 6.27a1 1 0 0 0 .95.73h10.5a1 1 0 0 0 .96-.73Z"/><path d="M8 13v9"/><path d="M16 22v-9"/><path d="m9 6 1 7"/><path d="m15 6-1 7"/><path d="M12 6V2"/><path d="M13 2h-2"/></symbol>
<symbol id="i-clip" viewBox="0 0 24 24"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></symbol>
<symbol id="i-refresh" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></symbol>
</defs>
</svg>

<div class="slide-group">
<h2 class="slide-group-title">문제: 배가 늘어나면 직원이 자리를 찾아다녀요</h2>

<section class="slide">
<h3>배가 늘면 상자 놓을 자리부터 찾아야 해요</h3>
<svg class="dg" viewBox="0 0 400 300" role="img" aria-label="직원 한 명이 배 세 척에 상자를 싣고 살피는데 배 3이 멈춰서 그 상자를 어떻게 할지 모르고 직원이 매번 어느 배에 실을지와 멈춘 배의 상자와 상자 늘리기를 챙겨야 하는 그림. 수치는 설명용 예시다.">
<defs><marker id="m1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M176,68 L94,124" marker-end="url(#m1)"/>
<path class="line" d="M200,82 L200,116" marker-end="url(#m1)"/>
<path class="line" d="M224,68 L306,124" marker-end="url(#m1)"/>
<circle class="bad" cx="200" cy="50" r="30"/><use class="ic" href="#i-user" x="182" y="32" width="36" height="36"/>
<text class="small" x="240" y="44" style="text-anchor:start">직원</text>
<text class="small" x="240" y="62" style="text-anchor:start">개발자</text>
<circle class="box" cx="70" cy="150" r="28"/><use class="ic" href="#i-ship" x="52" y="132" width="36" height="36"/>
<circle class="box" cx="200" cy="150" r="28"/><use class="ic" href="#i-ship" x="182" y="132" width="36" height="36"/>
<circle class="bad" cx="330" cy="150" r="28"/><use class="ic" href="#i-ship" x="312" y="132" width="36" height="36"/>
<text class="chip" x="70" y="196">배 1</text><text class="small" x="70" y="214">상자 4개</text>
<text class="chip" x="200" y="196">배 2</text><text class="small" x="200" y="214">상자 5개</text>
<text class="alert" x="330" y="196">배 3 멈춤</text><text class="alert" x="330" y="214">상자는 어디로?</text>
<rect class="line" x="10" y="230" width="380" height="62" rx="12"/>
<text class="label center" x="200" y="250">직원이 매번 챙길 일</text>
<text class="chip" x="75" y="276">자리 배정</text><text class="chip" x="200" y="276">고장 복구</text><text class="chip" x="325" y="276">상자 늘리기</text>
</svg>
<ol class="steps">
<li>직원(개발자)은 배(서버)마다 빈자리를 살펴요</li>
<li>상자(컨테이너)에 필요한 CPU와 메모리가 달라요</li>
<li>배가 멈추면 실었던 상자도 다시 챙겨요 (예시)</li>
</ol>
</section>

<section class="slide">
<h3>배 한 척과 여러 척은 돌볼 일이 달라요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="한 배에서는 Compose로 앱을 함께 띄우지만 여러 배에 나눠 실으려면 배치할 자리와 고장 난 배의 상자를 챙겨야 한다.">
<rect class="line" x="10" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="102" y="34">배 한 척</text>
<circle class="box" cx="102" cy="88" r="32"/><use class="ic" href="#i-ship" x="81" y="67" width="42" height="42"/>
<text class="big" x="102" y="150">한 배에 싣기</text><text class="small" x="102" y="174">Docker Compose</text>
<rect class="line" x="206" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="298" y="34">여러 척</text>
<circle class="bad" cx="298" cy="88" r="32"/><use class="ic" href="#i-ship" x="277" y="67" width="42" height="42"/>
<text class="big" x="298" y="150">배를 골라 싣기</text><text class="small" x="298" y="174">고장 나면 재배치</text>
</svg>
<ol class="steps">
<li>docker run과 Compose로 한 서버에 앱을 띄울 수 있어요</li>
<li>사용자가 몰리면 같은 앱을 여러 배에 나눠 실어요</li>
</ol>
</section>

<details class="origin">
<summary>더 알아보기: 누가 왜 만들었을까?</summary>
<p>쿠버네티스는 Google이 만들었어요. 공식 블로그에 따르면 <b>2014년 6월 6일</b> 첫 코드가 GitHub에 올라왔고 그해 오픈 소스로 공개됐어요.</p>
<p>Google은 그전부터 회사 안에서 <b>Borg</b>라는 시스템으로 수많은 서버에 작업을 배치하고 돌봐 왔어요. 쿠버네티스는 이렇게 오래 대규모 서비스를 운영한 경험을 바탕으로 누구나 쓸 수 있게 새로 만든 것이에요. <b>2015년 7월 21일</b> 1.0이 나오면서 Google은 쿠버네티스를 리눅스 재단 아래 새로 생긴 CNCF(Cloud Native Computing Foundation)에 기부했어요.</p>
<p>Kubernetes는 그리스어로 배의 키를 잡는 조타수나 항해사를 뜻해요. K와 s 사이의 글자가 여덟 개라서 줄여서 K8s라고도 써요.</p>
<p>참고: <a href="https://kubernetes.io/docs/concepts/overview/">쿠버네티스 개요</a> · <a href="https://kubernetes.io/blog/2024/06/06/10-years-of-kubernetes/">쿠버네티스 10주년</a> · <a href="https://kubernetes.io/blog/2015/04/23/borg-predecessor-to-kubernetes/">Borg: 쿠버네티스의 전신</a></p>
</details>
</div>

<div class="slide-group">
<h2 class="slide-group-title">항구: 관제실이 자리를 정하고 배에서 실행해요</h2>

<div class="slide-with-question">
<section class="slide">
<h3>관제실이 자리를 정하면 갑판장이 실어요</h3>
<svg class="dg" viewBox="0 0 400 290" role="img" aria-label="항구 관제실 하나가 배 1, 배 2, 배 3에 점선으로 지시를 보내고 배마다 있는 갑판장이 지시대로 상자를 싣고 배 상태를 관제실에 알리는 그림. 수치는 설명용 예시다.">
<defs><marker id="m2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line dash" d="M176,84 L96,140" marker-end="url(#m2)"/>
<path class="line dash" d="M200,92 L200,136" marker-end="url(#m2)"/>
<path class="line dash" d="M224,84 L304,140" marker-end="url(#m2)"/>
<circle class="kafka" cx="200" cy="52" r="40"/><use class="ic" href="#i-tower" x="174" y="26" width="52" height="52"/>
<text class="big" x="258" y="44" style="text-anchor:start">관제실</text>
<text class="small" x="258" y="66" style="text-anchor:start">실을 배를 정해요</text>
<circle class="box" cx="70" cy="170" r="30"/><use class="ic" href="#i-ship" x="52" y="152" width="36" height="36"/>
<circle class="box" cx="96" cy="196" r="17"/><use class="ic" href="#i-user" x="87" y="185" width="22" height="22"/>
<circle class="box" cx="200" cy="170" r="30"/><use class="ic" href="#i-ship" x="182" y="152" width="36" height="36"/>
<circle class="box" cx="226" cy="196" r="17"/><use class="ic" href="#i-user" x="217" y="185" width="22" height="22"/>
<circle class="box" cx="330" cy="170" r="30"/><use class="ic" href="#i-ship" x="312" y="152" width="36" height="36"/>
<circle class="box" cx="356" cy="196" r="17"/><use class="ic" href="#i-user" x="347" y="185" width="22" height="22"/>
<text class="chip" x="70" y="228">배 1</text><text class="chip" x="200" y="228">배 2</text><text class="chip" x="330" y="228">배 3</text>
<text class="small" x="70" y="246">갑판장이 실어요</text><text class="small" x="200" y="246">갑판장이 실어요</text><text class="small" x="330" y="246">갑판장이 실어요</text>
<text class="small" x="200" y="276">갑판장은 배 상태를 관제실에 알려요</text>
</svg>
<ol class="steps">
<li>항구(클러스터)는 여러 배를 함께 관리해요</li>
<li>관제실(컨트롤 플레인)이 새 묶음의 배(노드)를 골라요</li>
<li>갑판장(kubelet)이 실행을 맡기고 상태를 알려요 (배 번호는 예시)</li>
</ol>
<p class="more">참고: <a href="https://kubernetes.io/docs/concepts/overview/components/">쿠버네티스 구성 요소</a></p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 관제실(컨트롤 플레인) 자체가 멈추면 어떻게 되나요?</summary>
<p>A. 컨트롤 플레인도 서버 위에서 도는 프로그램이라 멈출 수 있어요. 그래서 실제 서비스에서는 보통 컨트롤 플레인을 서버 여러 대에 나눠 띄워서 한 대가 멈춰도 나머지가 이어 받게 해요.</p>
<p>컨트롤 플레인이 모두 멈춰도 노드에서 이미 돌고 있는 컨테이너가 바로 꺼지지는 않아요. 다만 그동안은 새 파드를 배치하거나 멈춘 노드의 파드를 다시 띄우는 일을 할 수 없어요.</p>
</details>
</aside>
</div>

<section class="slide">
<h3>관제실에는 접수 창구와 장부가 있어요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="API 서버가 요청을 받아 etcd에 상태를 기록한다. 스케줄러가 배를 고르고 컨트롤러가 계획과 현재 상태를 맞춘다.">
<rect class="line" x="10" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="102" y="34">창구와 장부</text>
<circle class="box" cx="102" cy="88" r="32"/><use class="ic" href="#i-clip" x="81" y="67" width="42" height="42"/>
<text class="big" x="102" y="150">접수 · 기록</text><text class="small" x="102" y="174">API 서버 · etcd</text>
<rect class="line" x="206" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="298" y="34">배정과 점검</text>
<circle class="kafka" cx="298" cy="88" r="32"/><use class="ic" href="#i-tower" x="277" y="67" width="42" height="42"/>
<text class="big" x="298" y="150">자리 · 개수</text><text class="small" x="298" y="174">스케줄러 · 컨트롤러</text>
</svg>
<ol class="steps">
<li>창구(API 서버)가 요청을 받아 장부(etcd)에 적어요</li>
<li>배정 담당(스케줄러)은 새 묶음을 놓을 자리를 골라요</li>
<li>점검 담당(컨트롤러)은 계획과 실제를 맞춰요</li>
</ol>
<p class="more">참고: <a href="https://kubernetes.io/docs/concepts/overview/components/">관제실과 노드가 맡은 일</a></p>
</section>

<section class="slide">
<h3>늘 붙어 다닐 상자는 한 묶음에 실어요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="왼쪽 묶음에는 상자가 하나 있고 오른쪽 묶음에는 본 상자와 도우미 상자 둘이 붙어 있으며 두 묶음 모두 묶음째 같은 배에 실리는 그림">
<defs><marker id="m4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="10" y="14" width="185" height="150" rx="12"/>
<text class="label center" x="102" y="36">묶음 하나에 상자 하나</text>
<circle class="kafka" cx="102" cy="94" r="32"/><use class="ic" href="#i-container" x="82" y="74" width="40" height="40"/>
<text class="small" x="102" y="146">대부분 이렇게 실어요</text>
<rect class="line" x="205" y="14" width="185" height="150" rx="12"/>
<text class="label center" x="297" y="36">꼭 붙어 다니는 상자 둘</text>
<path class="line" d="M290,94 L304,94"/>
<circle class="kafka" cx="262" cy="94" r="28"/><use class="ic" href="#i-container" x="244" y="76" width="36" height="36"/>
<circle class="box" cx="332" cy="94" r="28"/><use class="ic" href="#i-container" x="314" y="76" width="36" height="36"/>
<text class="chip" x="262" y="142">본 상자</text><text class="chip" x="332" y="142">도우미</text>
<path class="line" d="M102,164 L178,198" marker-end="url(#m4)"/>
<path class="line" d="M297,164 L222,198" marker-end="url(#m4)"/>
<circle class="box" cx="200" cy="216" r="28"/><use class="ic" href="#i-ship" x="182" y="198" width="36" height="36"/>
<text class="small" x="236" y="232" style="text-anchor:start">묶음째 같은 배에</text>
</svg>
<ol class="steps">
<li>상자 묶음(파드)은 배치할 수 있는 가장 작은 단위예요</li>
<li>보통 앱 하나를 담고 로그 도우미도 함께 담을 수 있어요</li>
<li>같은 묶음의 상자들은 주소(IP)와 함께 연결한 저장 공간(볼륨)을 써요</li>
</ol>
<p class="more">참고: <a href="https://kubernetes.io/docs/concepts/workloads/pods/">파드의 네트워크와 저장 공간</a></p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">계획표: 원하는 개수와 실제 개수를 맞춰요</h2>

<section class="slide">
<h3>계획표에는 띄워 둘 앱과 개수를 적어요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="개발자가 YAML에 앱 이미지와 원하는 복제 수를 적고 kubectl로 보내면 API 서버가 etcd에 기록한다. 이미지와 개수는 예시다.">
<rect class="line" x="10" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="102" y="34">개발자의 계획표</text>
<circle class="box" cx="102" cy="88" r="32"/><use class="ic" href="#i-clip" x="81" y="67" width="42" height="42"/>
<text class="big" x="102" y="150">앱 3개</text><text class="small" x="102" y="174">이미지 my-app:1.2</text>
<rect class="line" x="206" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="298" y="34">관제실 장부</text>
<circle class="kafka" cx="298" cy="88" r="32"/><use class="ic" href="#i-tower" x="277" y="67" width="42" height="42"/>
<text class="big" x="298" y="150">원하는 상태</text><text class="small" x="298" y="174">API 서버 → etcd</text>
</svg>
<ol class="steps">
<li>앱 계획표(Deployment)에 이미지와 개수(replicas)를 적어요</li>
<li>개발자가 설정 파일(YAML)을 전송 도구(kubectl)로 보내요 (예시)</li>
</ol>
<p class="more">참고: <a href="https://kubernetes.io/docs/concepts/overview/working-with-objects/">오브젝트와 원하는 상태</a></p>
</section>

<section class="slide">
<h3>하나가 모자라면 새 묶음 하나를 만들어요</h3>
<svg class="dg" viewBox="0 0 400 286" role="img" aria-label="계획표에는 묶음 3개라고 적혀 있고 실제 배에는 상자가 2개뿐이라 관제실이 둘을 비교한 뒤 상자를 하나 더 싣고 계획표 보기와 실제와 비교와 모자라면 싣기를 계속 반복하는 그림. 수치는 설명용 예시다.">
<defs><marker id="m5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line dash" d="M162,64 L98,64" marker-end="url(#m5)"/>
<path class="line dash" d="M238,64 L302,64" marker-end="url(#m5)"/>
<circle class="kafka" cx="60" cy="64" r="34"/><use class="ic" href="#i-clip" x="38" y="42" width="44" height="44"/>
<circle class="kafka" cx="200" cy="64" r="36"/><use class="ic" href="#i-tower" x="178" y="42" width="44" height="44"/>
<circle class="bad" cx="340" cy="64" r="34"/><use class="ic" href="#i-ship" x="318" y="42" width="44" height="44"/>
<text class="big" x="60" y="122">계획표</text><text class="small" x="60" y="142">묶음 3개</text>
<text class="big" x="200" y="122">관제실</text><text class="small" x="200" y="142">둘을 비교해요</text>
<text class="big" x="340" y="122">실제 배</text><text class="alert" x="340" y="142">묶음 2개</text>
<path class="line" d="M60,206 L340,206 Q370,206 370,236 Q370,266 340,266 L60,266 Q30,266 30,236 Q30,206 60,206"/>
<rect class="box" x="35" y="192" width="100" height="28" rx="6"/><text class="chip" x="85" y="206">계획표 보기</text>
<rect class="box" x="150" y="192" width="100" height="28" rx="6"/><text class="chip" x="200" y="206">실제와 비교</text>
<rect class="kafka" x="265" y="192" width="100" height="28" rx="6"/><text class="chip" x="315" y="206">모자라면 싣기</text>
<text class="small" x="200" y="242">쉬지 않고 반복해요</text>
</svg>
<ol class="steps">
<li>점검 담당은 실제 개수를 계획표와 계속 비교해요</li>
<li>실제가 둘이고 목표가 셋이면 하나를 만들어요 (예시)</li>
<li>앱을 줄일 때는 계획표의 개수를 줄여요</li>
</ol>
<p class="more">참고: <a href="https://kubernetes.io/docs/concepts/architecture/controller/">컨트롤러가 상태를 맞추는 원리</a></p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">복구: 배와 상자 중 어디가 멈췄는지 살펴요</h2>

<div class="slide-with-question">
<section class="slide">
<h3>배가 멈추면 빈자리에 새 묶음을 띄워요</h3>
<svg class="dg" viewBox="0 0 400 276" role="img" aria-label="배 1이 멈춰 관제실과 연락이 끊기자 관제실이 계획표의 묶음 3개를 지키려고 배 2와 배 3에 새 상자를 하나씩 싣고 옛 상자를 옮기지 않고 같은 내용의 새 상자를 싣는다는 그림. 수치는 설명용 예시다.">
<defs><marker id="m7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line dash" d="M174,70 L94,134"/>
<path class="line" d="M200,82 L200,126" marker-end="url(#m7)"/>
<path class="line" d="M228,70 L306,134" marker-end="url(#m7)"/>
<circle class="kafka" cx="200" cy="48" r="34"/><use class="ic" href="#i-tower" x="178" y="26" width="44" height="44"/>
<text class="small" x="244" y="40" style="text-anchor:start">계획표: 묶음 3개</text>
<text class="small" x="244" y="58" style="text-anchor:start">모자란 만큼 실어요</text>
<text class="alert" x="108" y="84">연락 끊김</text>
<circle class="bad" cx="70" cy="160" r="30"/><use class="ic" href="#i-ship" x="52" y="142" width="36" height="36"/>
<circle class="box" cx="200" cy="160" r="30"/><use class="ic" href="#i-ship" x="182" y="142" width="36" height="36"/>
<circle class="new" cx="228" cy="134" r="17"/><use class="ic" href="#i-container" x="217" y="123" width="22" height="22"/>
<circle class="box" cx="330" cy="160" r="30"/><use class="ic" href="#i-ship" x="312" y="142" width="36" height="36"/>
<circle class="new" cx="358" cy="134" r="17"/><use class="ic" href="#i-container" x="347" y="123" width="22" height="22"/>
<text class="alert" x="70" y="210">배 1 멈춤</text><text class="small" x="70" y="228">묶음 둘 중단</text>
<text class="chip" x="200" y="210">배 2</text><text class="small" x="200" y="228">새 묶음 +1</text>
<text class="chip" x="330" y="210">배 3</text><text class="small" x="330" y="228">새 묶음 +1</text>
<text class="small" x="200" y="262">새 묶음으로 교체</text>
</svg>
<ol class="steps">
<li>응답 불가 표시 뒤 기본 대기 시간은 5분이에요</li>
<li>계획표가 관리하는 묶음은 여유 있는 배에 새로 떠요 (예시)</li>
<li>새 묶음의 IP가 바뀌어도 고정 창구(Service)로 찾아가요</li>
</ol>
<p class="more">참고: <a href="https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/">응답 없는 노드의 기본 대기 시간</a> · <a href="https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/">파드 생명 주기</a></p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 멈췄던 노드가 다시 살아나면 파드가 4개가 되나요?</summary>
<p>A. 연락만 끊겼다면 옛 배에서도 앱이 잠시 돌 수 있어요. 다시 연결된 갑판장은 관제실의 기록을 보고 삭제된 옛 파드를 정리해요.</p>
<p>정리가 끝나면 계획표대로 3개가 남아요. 살아난 노드는 다음에 새 파드를 받을 수 있는 빈자리가 돼요.</p>
</details>
</aside>
</div>

<section class="slide">
<h3>상자를 다시 띄워도 앱 오류는 남아요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="컨테이너가 종료되면 재시작 정책에 따라 같은 파드에서 다시 띄우지만 코드에 오류가 남으면 반복해서 멈춘다.">
<rect class="line" x="10" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="102" y="34">일시적인 중단</text>
<circle class="new" cx="102" cy="88" r="32"/><use class="ic" href="#i-refresh" x="81" y="67" width="42" height="42"/>
<text class="big" x="102" y="150">같은 파드</text><text class="small" x="102" y="174">컨테이너 재시작</text>
<rect class="line" x="206" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="298" y="34">계속되는 앱 오류</text>
<circle class="bad" cx="298" cy="88" r="32"/><use class="ic" href="#i-refresh" x="277" y="67" width="42" height="42"/>
<text class="big" x="298" y="150">재시작 반복</text><text class="small" x="298" y="174">대기 간격 증가</text>
</svg>
<ol class="steps">
<li>갑판장은 재시작 정책에 따라 같은 묶음의 상자를 다시 띄워요</li>
<li>반복해서 죽는 앱은 개발자가 원인을 고쳐요</li>
<li>새 파드에도 남길 파일은 영구 볼륨에 둬요</li>
</ol>
<p class="more">참고: <a href="https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/">재시작 정책과 재시도 간격</a></p>
</section>

</div>

<div class="slide-group">
<h2 class="slide-group-title">선택: 어떤 항구에 관제실을 둘까요?</h2>

<section class="slide">
<h3>Docker로 만든 상자도 그대로 실어요</h3>
<svg class="dg" viewBox="0 0 400 200" role="img" aria-label="Docker로 만든 앱 이미지를 노드의 kubelet이 containerd 같은 실행기에 맡겨 실행한다.">
<rect class="line" x="10" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="102" y="34">상자 준비</text>
<circle class="box" cx="102" cy="88" r="32"/><use class="ic" href="#i-container" x="81" y="67" width="42" height="42"/>
<text class="big" x="102" y="150">앱 이미지</text><text class="small" x="102" y="174">Docker</text>
<rect class="line" x="206" y="8" width="184" height="182" rx="12"/>
<text class="label center" x="298" y="34">배에서 실행</text>
<circle class="kafka" cx="298" cy="88" r="32"/><use class="ic" href="#i-ship" x="277" y="67" width="42" height="42"/>
<text class="big" x="298" y="150">컨테이너 실행</text><text class="small" x="298" y="174">containerd</text>
</svg>
<ol class="steps">
<li>쿠버네티스 1.24부터 내장 연결부(dockershim)가 빠졌어요</li>
<li>노드는 containerd 같은 실행기(런타임)로 이미지를 띄워요</li>
<li>Docker 엔진을 계속 쓰려면 별도 연결부(cri-dockerd)가 필요해요</li>
</ol>
<p class="more">참고: <a href="https://kubernetes.io/blog/2022/02/17/dockershim-faq/">dockershim 제거 FAQ</a></p>
</section>

<section class="slide">
<h3>여러 배에 빈자리를 계속 채우려면 관제실을 둬요</h3>
<svg class="dg" viewBox="0 0 400 190" role="img" aria-label="개발자가 한 서버에서만 확인하는 앱은 Compose로 띄우고 여러 서버에 나눠 띄운 앱을 다른 서버에서 복구해야 하면 쿠버네티스를 선택한다.">
<rect class="line" x="10" y="8" width="184" height="172" rx="12"/>
<text class="label center" x="102" y="36">내 컴퓨터에서 시험</text>
<circle class="box" cx="102" cy="85" r="29"/><use class="ic" href="#i-ship" x="82" y="65" width="40" height="40"/>
<text class="big" x="102" y="145">한 배에 띄우기</text><text class="small" x="102" y="166">Compose</text>
<rect class="line" x="206" y="8" width="184" height="172" rx="12"/>
<text class="label center" x="298" y="36">서버 고장에 대비</text>
<use class="ic" href="#i-ship" x="228" y="67" width="36" height="36"/><path class="line dash" d="M267 86h58"/><use class="ic" href="#i-ship" x="331" y="67" width="36" height="36"/>
<text class="big" x="298" y="145">다른 배에 복구</text><text class="small" x="298" y="166">쿠버네티스</text>
</svg>
<ol class="steps">
<li>한 서버에서 앱과 DB를 시험할 때는 Compose로 충분해요</li>
<li>여러 서버에서 앱 개수를 유지하려면 쿠버네티스가 자리를 찾아요</li>
<li>복구하려면 남은 배에 새 묶음을 실을 자리가 있어야 해요</li>
</ol>
</section>
</div>

</div>
