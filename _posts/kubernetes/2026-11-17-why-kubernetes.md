---
layout: post
title: "쿠버네티스는 왜 생겼을까? 항구 관제실로 이해하는 Kubernetes"
description: "서버 여러 대의 컨테이너를 사람이 직접 돌보기 어려운 문제를 항구 관제실 비유로 설명하고 클러스터·컨트롤 플레인·노드·파드와 원하는 상태를 맞추는 컨트롤러와 자가 치유까지 실제 동작으로 이어서 설명합니다."
date: 2026-11-17 22:40:00 +0900
series: kubernetes
episode: 1
summary: "쿠버네티스는 여러 배를 지켜보는 항구 관제실이에요. 원하는 상태를 계획표에 적어 두면 서버가 멈춰도 그 상태를 스스로 다시 맞춰요."
---

<div class="lesson lesson-hierarchy">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: Lucide (lucide-static v1.25.0, ISC). 라이선스: assets/icons/LICENSE-lucide.txt. 이름 대응: i-tower=tower-control, i-clip=clipboard-list, i-refresh=refresh-cw. rect·circle 요소는 같은 모양의 path로 옮겼어요. -->
<symbol id="i-user" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"/></symbol>
<symbol id="i-ship" viewBox="0 0 24 24"><path d="M12 10.189V14M12 2v3M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></symbol>
<symbol id="i-container" viewBox="0 0 24 24"><path d="M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4v6.6c0 .5.4 1.2.8 1.5l6.3 3.9a1.72 1.72 0 0 0 1.7 0l10.3-6c.5-.3.9-1 .9-1.5ZM10 21.9V14L2.1 9.1M10 14l11.9-6.9M14 19.8v-8.1M18 17.5V9.4"/></symbol>
<symbol id="i-tower" viewBox="0 0 24 24"><path d="M18.2 12.27 20 6H4l1.8 6.27a1 1 0 0 0 .95.73h10.5a1 1 0 0 0 .96-.73ZM8 13v9M16 22v-9M9 6l1 7M15 6l-1 7M12 6V2M13 2h-2"/></symbol>
<symbol id="i-clip" viewBox="0 0 24 24"><path d="M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M12 11h4M12 16h4M8 11h.01M8 16h.01"/></symbol>
<symbol id="i-refresh" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M8 16H3v5"/></symbol>
</defs>
</svg>

<div class="intro">
<p class="q">서버 여러 대에 흩어진 컨테이너 수십 개는 누가 띄우고 누가 돌볼까요?</p>
<p>쿠버네티스 시리즈의 첫 편이에요. Docker 시리즈에서는 앱과 준비물을 상자처럼 담아 실행하는 컨테이너를 만들고 Compose로 컴퓨터 한 대에서 여러 컨테이너를 한 번에 띄웠어요. 그런데 서버(앱을 늘 켜 두고 다른 사람이 쓰게 하는 컴퓨터) 한 대가 감당할 수 있는 사용자 수에는 한계가 있어서 사용자가 늘면 서버도 여러 대가 돼요. 그러면 어느 서버에 띄울지와 멈춘 컨테이너를 누가 다시 띄울지를 사람이 일일이 챙겨야 해요.</p>
<p>이 글을 다 읽으면 쿠버네티스(여러 서버의 컨테이너를 한곳에서 배치하고 돌보는 시스템)가 <b>원하는 상태</b>를 적어 두면 그 상태를 스스로 지키는 방식으로 이 문제를 어떻게 푸는지 알 수 있어요. 그 일을 나눠 맡는 <b>컨트롤 플레인</b>과 <b>노드</b>, 배치 단위인 <b>파드</b>, 서버가 멈췄을 때 저절로 회복하는 <b>자가 치유</b>도 함께 봐요.</p>
</div>

<div class="slide-group">
<h2 class="slide-group-title">문제: 배가 늘수록 혼자 챙길 수 없는 상자</h2>

<section class="slide">
<h3>배가 늘어나면 직원 한 명이 상자를 다 챙길 수 없어요</h3>
<svg class="dg" viewBox="0 0 400 300" role="img" aria-label="직원 한 명이 배 세 척에 상자를 싣고 살피는데 배 3이 멈춰서 그 상자를 어떻게 할지 모르고 직원이 매번 어느 배에 실을지와 멈춘 배의 상자와 상자 늘리기를 챙겨야 하는 그림">
<defs><marker id="m1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M176,68 L94,124" marker-end="url(#m1)"/>
<path class="line" d="M200,82 L200,116" marker-end="url(#m1)"/>
<path class="line" d="M224,68 L306,124" marker-end="url(#m1)"/>
<circle class="bad" cx="200" cy="50" r="30"/><use class="ic" href="#i-user" x="182" y="32" width="36" height="36"/>
<text class="small" x="240" y="44" style="text-anchor:start">직원 한 명이</text>
<text class="small" x="240" y="62" style="text-anchor:start">혼자 챙겨요</text>
<circle class="box" cx="70" cy="150" r="28"/><use class="ic" href="#i-ship" x="52" y="132" width="36" height="36"/>
<circle class="box" cx="200" cy="150" r="28"/><use class="ic" href="#i-ship" x="182" y="132" width="36" height="36"/>
<circle class="bad" cx="330" cy="150" r="28"/><use class="ic" href="#i-ship" x="312" y="132" width="36" height="36"/>
<text class="chip" x="70" y="196">배 1</text><text class="small" x="70" y="214">상자 4개</text>
<text class="chip" x="200" y="196">배 2</text><text class="small" x="200" y="214">상자 5개</text>
<text class="alert" x="330" y="196">배 3 멈춤</text><text class="alert" x="330" y="214">상자는 어디로?</text>
<rect class="line" x="10" y="230" width="380" height="62" rx="12"/>
<text class="label center" x="200" y="250">직원이 매번 챙길 일</text>
<text class="chip" x="75" y="276">어느 배에 실을까</text><text class="chip" x="200" y="276">멈춘 배의 상자</text><text class="chip" x="325" y="276">상자 늘리기</text>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0s" repeatCount="indefinite" path="M176,68 L94,124"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.4s" repeatCount="indefinite" path="M200,82 L200,116"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.8s" repeatCount="indefinite" path="M224,68 L306,124"/></circle>
</svg>
<p class="point">배와 상자가 많아지면 직원 한 명이 상자를 싣고 살피고 다시 싣는 일을 다 챙길 수 없어요.</p>
<p class="explain">배가 한두 척일 때는 직원이 직접 상자를 싣고 둘러봐도 괜찮아요. 배가 늘면 어느 배에 자리가 남았는지 고르고 멈춘 배의 상자를 다시 싣는 일이 밤낮없이 생겨요. 비유에서 상자는 Docker 시리즈의 컨테이너이고 배는 서버이며 직원은 개발자예요.</p>
</section>

<section class="slide">
<h3>실제로는: 서버 여러 대의 컨테이너를 사람이 직접 돌봐요</h3>
<table>
<thead><tr><th>해야 할 일</th><th>사람이 직접 하면</th></tr></thead>
<tbody>
<tr><td>어느 서버에 띄울까</td><td>서버마다 남은 메모리(작업 공간)와 CPU(계산 능력)를 보고 골라요</td></tr>
<tr><td>컨테이너가 멈추면</td><td>알림을 보고 사람이 다시 띄워요. 새벽에도요</td></tr>
<tr><td>서버 한 대가 꺼지면</td><td>그 위의 컨테이너를 다른 서버에 하나씩 다시 띄워요</td></tr>
<tr><td>사용자가 몰리면</td><td>서버마다 들어가 컨테이너를 더 띄워요</td></tr>
</tbody>
</table>
<p class="point">서버와 컨테이너가 많아지면 띄우고 살피고 다시 띄우는 일을 사람이 다 할 수 없어요.</p>
<p class="explain">Docker 시리즈에서 본 <code>docker run</code>과 Compose는 컴퓨터 한 대 안에서 컨테이너를 띄우고 치워요. 사용자가 늘면 같은 앱 컨테이너를 서버 여러 대에 나눠 띄워야 하는데 자리를 고르는 일부터 모두 사람 몫이 돼요. 컨테이너와 서버는 언제든 멈출 수 있어서 누군가 계속 지켜보다 다시 띄워야 해요. 이 일을 사람 대신 맡는 프로그램을 컨테이너 오케스트레이션(여러 컨테이너를 지휘한다는 뜻) 도구라고 하고 쿠버네티스가 그런 도구예요.</p>
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
<h2 class="slide-group-title">클러스터: 관제실과 배로 나뉜 항구</h2>

<section class="slide">
<h3>관제실은 정하고 배마다 갑판장이 상자를 실어요</h3>
<svg class="dg" viewBox="0 0 400 290" role="img" aria-label="항구 관제실 하나가 배 1, 배 2, 배 3에 점선으로 지시를 보내고 배마다 있는 갑판장이 지시대로 상자를 싣고 배 상태를 관제실에 알리는 그림">
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
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0s" repeatCount="indefinite" path="M176,84 L96,140"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.4s" repeatCount="indefinite" path="M200,92 L200,136"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.8s" repeatCount="indefinite" path="M224,84 L304,140"/></circle>
</svg>
<p class="point">관제실은 상자를 직접 나르지 않고 어느 배에 실을지만 정해요.</p>
<p class="explain">항구에는 상자를 싣는 배가 여러 척 있고 관제실이 이 배들을 함께 지켜봐요. 관제실이 "배 2에 이 상자를 실어"라고 정하면 배 2의 갑판장이 지시를 받아 상자를 싣고 잘 실렸는지 관제실에 알려요. 정하는 곳과 일하는 곳이 나뉘어 있어서 배를 늘려도 일하는 방식은 그대로예요.</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>실제로는: 컨트롤 플레인이 정하고 노드가 컨테이너를 돌려요</h3>
<svg class="dg" viewBox="0 0 400 290" role="img" aria-label="위쪽 컨트롤 플레인 안에 API 서버, etcd, 스케줄러, 컨트롤러가 있고 아래쪽 노드 1과 노드 2에는 각각 kubelet과 컨테이너 런타임과 파드 두 개가 있으며 API 서버에서 각 노드의 kubelet으로 지시가 가는 그림">
<defs><marker id="m3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="10" y="10" width="380" height="92" rx="12"/>
<text class="label center" x="200" y="30">컨트롤 플레인 (관제실)</text>
<rect class="kafka" x="20" y="44" width="84" height="40" rx="6"/><text class="chip" x="62" y="64">API 서버</text>
<rect class="box" x="114" y="44" width="84" height="40" rx="6"/><text class="chip" x="156" y="64">etcd</text>
<rect class="box" x="208" y="44" width="84" height="40" rx="6"/><text class="chip" x="250" y="64">스케줄러</text>
<rect class="box" x="302" y="44" width="84" height="40" rx="6"/><text class="chip" x="344" y="64">컨트롤러</text>
<path class="line" d="M62,84 L88,132" marker-end="url(#m3)"/>
<path class="line" d="M62,84 L270,132" marker-end="url(#m3)"/>
<rect class="line" x="10" y="136" width="185" height="140" rx="12"/>
<text class="label center" x="102" y="154">노드 1 (배)</text>
<rect class="box" x="22" y="168" width="161" height="26" rx="5"/><text class="chip" x="102" y="181">kubelet (갑판장)</text>
<rect class="box" x="22" y="200" width="161" height="26" rx="5"/><text class="chip" x="102" y="213">컨테이너 런타임</text>
<rect class="kafka" x="22" y="234" width="76" height="30" rx="5"/><text class="chip" x="60" y="249">파드</text>
<rect class="kafka" x="107" y="234" width="76" height="30" rx="5"/><text class="chip" x="145" y="249">파드</text>
<rect class="line" x="205" y="136" width="185" height="140" rx="12"/>
<text class="label center" x="297" y="154">노드 2 (배)</text>
<rect class="box" x="217" y="168" width="161" height="26" rx="5"/><text class="chip" x="297" y="181">kubelet (갑판장)</text>
<rect class="box" x="217" y="200" width="161" height="26" rx="5"/><text class="chip" x="297" y="213">컨테이너 런타임</text>
<rect class="kafka" x="217" y="234" width="76" height="30" rx="5"/><text class="chip" x="255" y="249">파드</text>
<rect class="kafka" x="302" y="234" width="76" height="30" rx="5"/><text class="chip" x="340" y="249">파드</text>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0s" repeatCount="indefinite" path="M62,84 L88,132"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.8s" begin="0.5s" repeatCount="indefinite" path="M62,84 L270,132"/></circle>
</svg>
<p class="point">쿠버네티스 클러스터는 정하는 컨트롤 플레인과 컨테이너를 실제로 돌리는 노드로 나뉘어요.</p>
<p class="explain">클러스터는 쿠버네티스가 하나로 묶어 관리하는 서버 무리이고 노드는 그 안의 서버 한 대(배 한 척)예요. 컨트롤 플레인에서 API 서버는 모든 요청을 받는 창구이고 etcd는 클러스터의 상태를 적어 두는 장부이며 스케줄러는 새 파드(컨테이너를 감싼 배치 단위로 바로 뒤에서 봐요)를 어느 노드에 둘지 정하고 컨트롤러는 계획과 실제를 맞춰요. 노드마다 있는 kubelet은 API 서버에서 받은 내용대로 컨테이너 런타임(containerd처럼 컨테이너를 실제로 실행하는 프로그램)에게 컨테이너를 띄우게 하고 상태를 API 서버에 보고해요.</p>
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
<h3>함께 다녀야 하는 상자는 한 묶음으로 실어요</h3>
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
<p class="point">관제실은 상자 하나하나가 아니라 묶음을 단위로 배에 실어요.</p>
<p class="explain">관제실은 모든 상자를 받침대에 묶은 묶음으로 다뤄요. 대부분의 묶음에는 상자가 하나뿐이고 본 상자를 늘 옆에서 도와야 하는 상자만 같은 묶음에 넣어요. 한 묶음의 상자는 언제나 같은 배에 함께 실리고 함께 내려요.</p>
</section>

<section class="slide">
<h3>실제로는: 파드는 컨테이너를 감싼 배치 단위예요</h3>
<svg class="dg" viewBox="0 0 400 210" role="img" aria-label="파드 A에는 앱 컨테이너 하나와 IP 주소 하나가 있고 파드 B에는 앱 컨테이너와 로그 도우미 컨테이너가 같은 IP 주소와 공유 볼륨을 함께 쓰며 파드 안의 컨테이너는 늘 같은 노드에서 함께 뜨는 그림">
<rect class="line" x="10" y="14" width="150" height="150" rx="12"/>
<text class="label center" x="85" y="36">파드 A</text>
<rect class="box" x="30" y="56" width="110" height="40" rx="6"/><text class="chip" x="85" y="76">앱 컨테이너</text>
<rect class="box" x="22" y="110" width="126" height="40" rx="6"/><text class="chip" x="85" y="130">IP 주소 하나</text>
<rect class="line" x="180" y="14" width="210" height="150" rx="12"/>
<text class="label center" x="285" y="36">파드 B</text>
<rect class="box" x="192" y="56" width="90" height="40" rx="6"/><text class="chip" x="237" y="76">앱 컨테이너</text>
<rect class="box" x="288" y="56" width="90" height="40" rx="6"/><text class="chip" x="333" y="76">로그 도우미</text>
<rect class="box" x="192" y="110" width="186" height="40" rx="6"/><text class="chip" x="285" y="130">같은 IP 주소 · 공유 볼륨</text>
<text class="small" x="200" y="192">파드 안의 컨테이너는 늘 같은 노드에서 함께 떠요</text>
</svg>
<p class="point">파드는 쿠버네티스가 만들고 관리하는 가장 작은 단위이고 컨테이너를 하나 이상 담아요.</p>
<p class="explain">쿠버네티스는 컨테이너를 따로따로 배치하지 않고 파드(Pod)로 감싸서 노드에 배치해요. IP 주소는 네트워크에서 파드를 찾아갈 때 쓰는 주소이고 볼륨은 컨테이너끼리 파일을 함께 쓰는 저장 공간이에요. 대부분은 파드 하나에 앱 컨테이너 하나를 넣고 로그를 모으는 도우미처럼 늘 붙어 있어야 하는 것만 같은 파드에 넣어요. 그래서 이 글에서 "앱을 3개 띄운다"는 말은 파드 3개를 띄운다는 뜻이에요.</p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">원하는 상태: 계획표에 결과만 적어 두기</h2>

<section class="slide">
<h3>관제실은 계획표와 실제 배를 계속 비교해요</h3>
<svg class="dg" viewBox="0 0 400 286" role="img" aria-label="계획표에는 상자 3개라고 적혀 있고 실제 배에는 상자가 2개뿐이라 관제실이 둘을 비교한 뒤 상자를 하나 더 싣고 계획표 보기와 실제와 비교와 모자라면 싣기를 계속 반복하는 그림">
<defs><marker id="m5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line dash" d="M162,64 L98,64" marker-end="url(#m5)"/>
<path class="line dash" d="M238,64 L302,64" marker-end="url(#m5)"/>
<circle class="kafka" cx="60" cy="64" r="34"/><use class="ic" href="#i-clip" x="38" y="42" width="44" height="44"/>
<circle class="kafka" cx="200" cy="64" r="36"/><use class="ic" href="#i-tower" x="178" y="42" width="44" height="44"/>
<circle class="bad" cx="340" cy="64" r="34"/><use class="ic" href="#i-ship" x="318" y="42" width="44" height="44"/>
<text class="big" x="60" y="122">계획표</text><text class="small" x="60" y="142">상자 3개</text>
<text class="big" x="200" y="122">관제실</text><text class="small" x="200" y="142">둘을 비교해요</text>
<text class="big" x="340" y="122">실제 배</text><text class="alert" x="340" y="142">상자 2개</text>
<path class="line" d="M60,206 L340,206 Q370,206 370,236 Q370,266 340,266 L60,266 Q30,266 30,236 Q30,206 60,206"/>
<rect class="box" x="35" y="192" width="100" height="28" rx="6"/><text class="chip" x="85" y="206">계획표 보기</text>
<rect class="box" x="150" y="192" width="100" height="28" rx="6"/><text class="chip" x="200" y="206">실제와 비교</text>
<rect class="kafka" x="265" y="192" width="100" height="28" rx="6"/><text class="chip" x="315" y="206">모자라면 싣기</text>
<text class="small" x="200" y="242">쉬지 않고 반복해요</text>
<circle class="packet" r="5"><animateMotion dur="5s" begin="0s" repeatCount="indefinite" path="M60,206 L340,206 Q370,206 370,236 Q370,266 340,266 L60,266 Q30,266 30,236 Q30,206 60,206"/></circle>
</svg>
<p class="point">관제실은 계획표와 실제 배를 계속 비교해서 차이가 나면 그만큼 맞춰요.</p>
<p class="explain">항구 주인은 "이 상자는 늘 3개 실어 둬"처럼 원하는 결과만 계획표에 적어요. 배가 멈추거나 상자가 빠지는 일은 언제든 생기니 관제실은 한 번 맞추고 끝내지 않아요. 어느 배에 어떤 순서로 실을지는 주인이 적지 않아도 관제실이 정해요.</p>
</section>

<section class="slide">
<h3>실제로는: 원하는 상태를 적으면 컨트롤러가 현재 상태를 맞춰요</h3>
<svg class="dg" viewBox="0 0 400 252" role="img" aria-label="왼쪽 YAML 파일에 kind Deployment, replicas 3, image my-app 1.2가 적혀 있고 kubectl apply로 API 서버에 보내면 원하는 상태가 etcd에 기록되며 컨트롤러가 현재 파드 2개를 원하는 3개와 비교해 1개 더 만드는 일을 계속 반복하는 그림">
<defs><marker id="m6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="label" x="10" y="14">원하는 상태 (YAML)</text>
<rect class="box" x="10" y="24" width="140" height="80" rx="6"/>
<text class="small" x="22" y="44" style="text-anchor:start">kind: Deployment</text>
<text class="small" x="22" y="64" style="text-anchor:start">replicas: 3</text>
<text class="small" x="22" y="84" style="text-anchor:start">image: my-app:1.2</text>
<path class="line" d="M150,64 L236,64" marker-end="url(#m6)"/>
<text class="small" x="193" y="50">kubectl apply</text>
<rect class="kafka" x="240" y="24" width="150" height="80" rx="6"/>
<text x="315" y="46">API 서버</text><text class="small" x="315" y="70">원하는 상태를</text><text class="small" x="315" y="88">etcd에 적어 둬요</text>
<path class="line" d="M315,104 L315,158" marker-end="url(#m6)"/>
<path class="line" d="M60,176 L340,176 Q370,176 370,206 Q370,236 340,236 L60,236 Q30,236 30,206 Q30,176 60,176"/>
<rect class="box" x="32" y="162" width="96" height="28" rx="6"/><text class="chip" x="80" y="176">현재 파드 2개</text>
<rect class="box" x="138" y="162" width="124" height="28" rx="6"/><text class="chip" x="200" y="176">원하는 3개와 비교</text>
<rect class="kafka" x="272" y="162" width="96" height="28" rx="6"/><text class="chip" x="320" y="176">1개 더 만들기</text>
<text class="small" x="200" y="212">컨트롤러가 계속 반복해요</text>
<circle class="packet" r="5"><animateMotion dur="5s" begin="0s" repeatCount="indefinite" path="M60,176 L340,176 Q370,176 370,206 Q370,236 340,236 L60,236 Q30,236 30,206 Q30,176 60,176"/></circle>
</svg>
<p class="point">개발자는 원하는 상태만 적고 쿠버네티스의 컨트롤러가 현재 상태를 그쪽으로 계속 맞춰요.</p>
<p class="explain">원하는 상태는 그림처럼 앱의 종류(Deployment)와 개수(replicas)와 이미지를 적은 설정이고 보통 YAML(들여쓰기로 항목을 적는 파일 형식)로 써요. 개발자가 kubectl(쿠버네티스에 명령을 보내는 도구)로 이 파일을 보내면 API 서버가 받아 etcd에 적어 둬요. 컨트롤러는 클러스터를 계속 지켜보다가 현재 상태가 원하는 상태와 다르면 파드를 만들거나 지워서 차이를 줄여요. 공식 문서는 이 반복을 정한 온도에 맞춰 난방을 켜고 끄는 온도 조절기에 비유해요.</p>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">자가 치유: 배가 멈춰도 지켜지는 계획표</h2>

<section class="slide">
<h3>배 한 척이 멈추면 다른 배에 새 상자를 실어요</h3>
<svg class="dg" viewBox="0 0 400 276" role="img" aria-label="배 1이 멈춰 관제실과 연락이 끊기자 관제실이 계획표의 상자 3개를 지키려고 배 2와 배 3에 새 상자를 하나씩 싣고 옛 상자를 옮기지 않고 같은 내용의 새 상자를 싣는다는 그림">
<defs><marker id="m7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line dash" d="M174,70 L94,134"/>
<path class="line" d="M200,82 L200,126" marker-end="url(#m7)"/>
<path class="line" d="M228,70 L306,134" marker-end="url(#m7)"/>
<circle class="kafka" cx="200" cy="48" r="34"/><use class="ic" href="#i-tower" x="178" y="26" width="44" height="44"/>
<text class="small" x="244" y="40" style="text-anchor:start">계획표: 상자 3개</text>
<text class="small" x="244" y="58" style="text-anchor:start">모자란 만큼 실어요</text>
<text class="alert" x="108" y="84">연락 끊김</text>
<circle class="bad" cx="70" cy="160" r="30"/><use class="ic" href="#i-ship" x="52" y="142" width="36" height="36"/>
<circle class="box" cx="200" cy="160" r="30"/><use class="ic" href="#i-ship" x="182" y="142" width="36" height="36"/>
<circle class="new" cx="228" cy="134" r="17"/><use class="ic" href="#i-container" x="217" y="123" width="22" height="22"/>
<circle class="box" cx="330" cy="160" r="30"/><use class="ic" href="#i-ship" x="312" y="142" width="36" height="36"/>
<circle class="new" cx="358" cy="134" r="17"/><use class="ic" href="#i-container" x="347" y="123" width="22" height="22"/>
<text class="alert" x="70" y="210">배 1 멈춤</text><text class="small" x="70" y="228">상자 2개 못 써요</text>
<text class="chip" x="200" y="210">배 2</text><text class="small" x="200" y="228">새 상자 +1</text>
<text class="chip" x="330" y="210">배 3</text><text class="small" x="330" y="228">새 상자 +1</text>
<text class="small" x="200" y="262">옛 상자를 옮기지 않고 같은 내용의 새 상자를 실어요</text>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0s" repeatCount="indefinite" path="M200,82 L200,126"/></circle>
<circle class="packet" r="5"><animateMotion dur="1.4s" begin="0.5s" repeatCount="indefinite" path="M228,70 L306,134"/></circle>
</svg>
<p class="point">배 한 척이 멈춰도 관제실이 다른 배에 새 상자를 실어서 계획표의 개수를 지켜요.</p>
<p class="explain">관제실은 갑판장에게서 한동안 소식이 없는 배를 멈춘 배로 봐요. 관제실은 멈춘 배의 상자를 장부에서 지우고 계획표보다 모자란 개수를 남은 배에 채워요. 직원이 새벽에 일어나지 않아도 항구는 계획표대로 돌아와요.</p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>실제로는: 노드가 멈추면 새 파드가 다른 노드에서 떠요</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="노드 1이 응답하지 않아 그 위의 파드 2개가 정리되고 노드 2와 노드 3에 새 파드가 하나씩 생기며 그 순서는 kubelet의 보고가 끊기고 컨트롤러가 새 파드를 만들고 스케줄러가 남은 노드에 배정하는 것이라는 그림">
<defs><marker id="m8" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="bad blink" x="10" y="14" width="120" height="96" rx="8"/>
<text x="70" y="36">노드 1</text><text class="alert" x="70" y="62">응답 없음</text><text class="small" x="70" y="88">파드 2개 정리</text>
<rect class="box" x="140" y="14" width="120" height="96" rx="8"/>
<text x="200" y="36">노드 2</text>
<rect class="kafka" x="148" y="56" width="50" height="28" rx="5"/><text class="chip" x="173" y="70">파드</text>
<rect class="new" x="204" y="56" width="50" height="28" rx="5"/><text class="chip" x="229" y="70">새 파드</text>
<rect class="box" x="270" y="14" width="120" height="96" rx="8"/>
<text x="330" y="36">노드 3</text>
<rect class="new" x="305" y="56" width="50" height="28" rx="5"/><text class="chip" x="330" y="70">새 파드</text>
<rect class="box" x="8" y="140" width="118" height="36" rx="6"/><text class="chip" x="67" y="158">보고가 끊겨요</text>
<rect class="box" x="141" y="140" width="118" height="36" rx="6"/><text class="chip" x="200" y="158">새 파드를 만들어요</text>
<rect class="kafka" x="274" y="140" width="118" height="36" rx="6"/><text class="chip" x="333" y="158">빈 노드에 배정해요</text>
<path class="line" d="M126,158 L137,158" marker-end="url(#m8)"/>
<path class="line" d="M259,158 L270,158" marker-end="url(#m8)"/>
<text class="small" x="67" y="194">kubelet</text><text class="small" x="200" y="194">컨트롤러</text><text class="small" x="333" y="194">스케줄러</text>
<text class="small" x="200" y="234">파드 개수가 원하는 상태대로 3개로 돌아와요</text>
</svg>
<p class="point">노드가 멈추면 컨트롤러가 새 파드를 만들고 스케줄러가 남은 노드에 배정해요.</p>
<p class="explain">노드의 kubelet이 한동안 API 서버에 상태를 보고하지 않으면 컨트롤 플레인은 그 노드를 쓸 수 없다고 보고 기본 설정이면 몇 분 뒤 그 위의 파드를 API 서버의 기록에서 지워요. 그러면 Deployment(앱 파드를 몇 개 띄워 둘지 적는 설정)에 적힌 개수보다 파드가 모자라서 컨트롤러가 새 파드를 만들어요. 스케줄러는 아직 노드가 정해지지 않은 새 파드를 보고 남은 노드 중 알맞은 곳에 배정하고 그 노드의 kubelet이 컨테이너를 띄워요. 옛 파드를 옮긴 게 아니라 새로 만든 파드라서 IP 주소도 바뀌는데 바뀌는 주소를 어떻게 찾아가는지는 다음 편의 서비스(Service)에서 다뤄요.</p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 멈췄던 노드가 다시 살아나면 파드가 4개가 되나요?</summary>
<p>A. 아니에요. 옛 파드는 이미 API 서버의 기록에서 지워졌어요. 다시 살아난 노드의 kubelet은 API 서버와 기록을 맞추면서 기록에 없는 옛 파드를 정리해요.</p>
<p>그래서 원하는 상태에 적은 3개가 그대로 유지돼요. 살아난 노드는 다음에 새 파드를 받을 수 있는 빈자리가 돼요.</p>
</details>
</aside>
</div>

<section class="slide">
<h3>이럴 땐 조심해요: 쿠버네티스를 처음 볼 때 헷갈리는 점</h3>
<table>
<thead><tr><th>오해</th><th>실제</th></tr></thead>
<tbody>
<tr><td>파드를 직접 지우면 앱이 꺼진다</td><td>지운 파드는 Deployment가 다시 만들어요. 개수를 줄이려면 파드를 지우지 말고 원하는 상태의 개수를 고쳐요</td></tr>
<tr><td>앱이 자꾸 죽어도 알아서 고쳐 준다</td><td>컨테이너만 죽으면 kubelet이 같은 파드 안에서 다시 띄워 줄 뿐 코드의 버그는 못 고쳐요. 시작하자마자 죽는 앱은 간격을 늘려 가며 재시작만 되풀이해요</td></tr>
<tr><td>파드 안에 쓴 파일은 남는다</td><td>새 파드는 이미지에서 새로 시작해서 옛 파드 안에 쓴 파일이 없어요. 남길 데이터는 볼륨에 둬요</td></tr>
<tr><td>쿠버네티스가 Docker를 대신한다</td><td>Docker로 만든 이미지는 그대로 써요. 쿠버네티스 1.24부터 Docker 엔진 연결 기능(dockershim)이 빠졌고 노드에서는 containerd 같은 런타임이 컨테이너를 실행해요</td></tr>
</tbody>
</table>
<p class="point">쿠버네티스는 적어 둔 상태를 지켜 줄 뿐 앱의 버그나 데이터까지 챙겨 주지는 않아요.</p>
<p>참고: <a href="https://kubernetes.io/docs/concepts/overview/components/">쿠버네티스 구성 요소</a> · <a href="https://kubernetes.io/docs/concepts/workloads/pods/">파드</a> · <a href="https://kubernetes.io/docs/concepts/architecture/controller/">컨트롤러</a> · <a href="https://kubernetes.io/docs/concepts/overview/working-with-objects/">오브젝트와 원하는 상태</a> · <a href="https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/">파드 생명 주기</a> · <a href="https://kubernetes.io/blog/2022/02/17/dockershim-faq/">dockershim 제거 FAQ</a></p>
</section>

<section class="slide">
<h3>한눈에 다시 보기: 이 글의 다섯 줄</h3>
<svg class="dg" viewBox="0 0 400 250" role="img" aria-label="문제는 서버와 컨테이너가 많으면 사람이 다 돌볼 수 없는 것이고 클러스터는 정하는 컨트롤 플레인과 일하는 노드로 나뉘며 파드는 컨테이너를 감싼 가장 작은 배치 단위이고 원하는 상태를 적으면 컨트롤러가 계속 맞추며 자가 치유는 노드가 멈추면 다른 노드에 새 파드를 띄우는 것이라는 다섯 줄 요약 그림">
<circle class="bad" cx="30" cy="28" r="18"/><use class="ic" href="#i-user" x="19" y="17" width="22" height="22"/>
<text class="label" x="62" y="19">문제</text><text class="small" x="62" y="38" style="text-anchor:start">서버와 컨테이너가 많으면 사람이 다 못 돌봐요</text>
<circle class="kafka" cx="30" cy="76" r="18"/><use class="ic" href="#i-tower" x="19" y="65" width="22" height="22"/>
<text class="label" x="62" y="67">클러스터</text><text class="small" x="62" y="86" style="text-anchor:start">정하는 컨트롤 플레인과 일하는 노드</text>
<circle class="box" cx="30" cy="124" r="18"/><use class="ic" href="#i-container" x="19" y="113" width="22" height="22"/>
<text class="label" x="62" y="115">파드</text><text class="small" x="62" y="134" style="text-anchor:start">컨테이너를 감싼 가장 작은 배치 단위</text>
<circle class="kafka" cx="30" cy="172" r="18"/><use class="ic" href="#i-clip" x="19" y="161" width="22" height="22"/>
<text class="label" x="62" y="163">원하는 상태</text><text class="small" x="62" y="182" style="text-anchor:start">결과만 적으면 컨트롤러가 계속 맞춰요</text>
<circle class="new" cx="30" cy="220" r="18"/><use class="ic" href="#i-refresh" x="19" y="209" width="22" height="22"/>
<text class="label" x="62" y="211">자가 치유</text><text class="small" x="62" y="230" style="text-anchor:start">노드가 멈추면 다른 노드에 새 파드를 띄워요</text>
</svg>
<p class="point">원하는 상태를 적어 두면 여러 서버에서 그 상태를 스스로 지켜 주는 것이 쿠버네티스예요.</p>
</section>
</div>

</div>
