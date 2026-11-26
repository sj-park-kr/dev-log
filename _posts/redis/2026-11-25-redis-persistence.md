---
layout: post
title: "Redis는 재시작 뒤 어디까지 기억할까? 도서관 책상으로 보는 RDB와 AOF"
description: "도서관 대출 기록으로 Redis의 두 가지 디스크 저장 방식인 RDB와 AOF를 비교하고 정전 뒤 복구되는 시점과 별도 백업이 필요한 이유를 설명합니다."
date: 2026-11-25 00:00:00 +0900
series: redis
episode: 3
summary: "RDB는 책상 사진처럼 한 시점의 값을 남겨요. AOF는 대출 일지처럼 바뀐 일을 적어서 디스크에 남은 기록까지 따라가요."
---

<div class="lesson lesson-hierarchy storybook">

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
<!-- 아이콘 원본: https://cdn.jsdelivr.net/npm/lucide-static@1.25.0/icons/ (ISC). 라이선스: assets/icons/LICENSE-lucide.txt. i-desk=lamp-desk, i-book=book-open, i-stack=library-big, i-trash=trash-2, i-outage=zap-off, i-disk=hard-drive, i-buffer=memory-stick -->
<symbol id="i-user" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></symbol>
<symbol id="i-buffer" viewBox="0 0 24 24"><path d="M12 12v-2"/><path d="M12 18v-2"/><path d="M16 12v-2"/><path d="M16 18v-2"/><path d="M2 11h1.5"/><path d="M20 18v-2"/><path d="M20.5 11H22"/><path d="M4 18v-2"/><path d="M8 12v-2"/><path d="M8 18v-2"/><rect x="2" y="6" width="20" height="10" rx="2"/></symbol>
<symbol id="i-stack" viewBox="0 0 24 24"><rect width="8" height="18" x="3" y="3" rx="1"/><path d="M7 3v18"/><path d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z"/></symbol>
<symbol id="i-desk" viewBox="0 0 24 24"><path d="M10.293 2.293a1 1 0 0 1 1.414 0l2.5 2.5 5.994 1.227a1 1 0 0 1 .506 1.687l-7 7a1 1 0 0 1-1.687-.506l-1.227-5.994-2.5-2.5a1 1 0 0 1 0-1.414z"/><path d="m14.207 4.793-3.414 3.414"/><path d="M3 20a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="m9.086 6.5-4.793 4.793a1 1 0 0 0-.18 1.17L7 18"/></symbol>
<symbol id="i-book" viewBox="0 0 24 24"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></symbol>
<symbol id="i-trash" viewBox="0 0 24 24"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></symbol>
<symbol id="i-camera" viewBox="0 0 24 24"><path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"/><circle cx="12" cy="13" r="3"/></symbol>
<symbol id="i-outage" viewBox="0 0 24 24"><path d="M10.513 4.856 13.12 2.17a.5.5 0 0 1 .86.46l-1.377 4.317"/><path d="M15.656 10H20a1 1 0 0 1 .78 1.63l-1.72 1.773"/><path d="M16.273 16.273 10.88 21.83a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14H4a1 1 0 0 1-.78-1.63l4.507-4.643"/><path d="m2 2 20 20"/></symbol>
<symbol id="i-disk" viewBox="0 0 24 24"><path d="M10 16h.01"/><path d="M2.212 11.577a2 2 0 0 0-.212.896V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5.527a2 2 0 0 0-.212-.896L18.55 5.11A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><path d="M21.946 12.013H2.054"/><path d="M6 16h.01"/></symbol>
<symbol id="i-copy" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></symbol>
</defs>
</svg>

<div class="slide-group">
<h2 class="slide-group-title">정전: 책상 위 대출 기록이 사라져요</h2>

<section class="slide">
<h3>책상에만 적은 대출 기록은 정전 때 사라져요</h3>
<svg class="dg" viewBox="0 0 400 195" role="img" aria-label="왼쪽 정전 전 공용 책상에는 해님 책이 대출 중이라는 기록이 있고 그 기록은 책상에만 있어요. 가운데에서 정전이 나고 오른쪽에서 다시 켠 책상은 비어 있어 대출 기록이 없어요.">
<defs><marker id="p1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="8" y="7" width="160" height="180" rx="12"/>
<text class="label center" x="88" y="32">정전 전</text>
<circle class="box" cx="88" cy="86" r="34"/><use class="ic" href="#i-desk" x="66" y="64" width="44" height="44"/>
<text class="big" x="88" y="147">대출 중</text><text class="small" x="88" y="172">책상에만 적음</text>
<circle class="bad" cx="200" cy="86" r="20"/><use class="ic" href="#i-outage" x="188" y="74" width="24" height="24"/>
<text class="chip" x="200" y="124">정전</text>
<path class="line" d="M178,147 L222,147" marker-end="url(#p1)"/>
<rect class="line" x="232" y="7" width="160" height="180" rx="12"/>
<text class="label center" x="312" y="32">다시 켠 뒤</text>
<circle class="bad" cx="312" cy="86" r="34"/><use class="ic" href="#i-desk" x="290" y="64" width="44" height="44"/>
<text class="big" x="312" y="147">빈 책상</text><text class="small" x="312" y="172">대출 기록 없음</text>
</svg>
<ol class="steps">
<li>공용 책상(Redis)은 값을 메모리에 둬요</li>
<li>학생(앱)이 적은 대출 기록도 책상 위의 값이에요</li>
<li>전기가 나가면 메모리의 값은 지워져요</li>
</ol>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>서고에 원본이 있어야 다시 채울 수 있어요</h3>
<svg class="dg" viewBox="0 0 400 195" role="img" aria-label="다시 켠 빈 책상을 채울 원본이 있는지 두 값을 같은 모양으로 비교한 그림. 왼쪽 책 소개는 서고에 원본이 있어 빈 책상을 다시 채워요. 오른쪽 대출 기록은 서고에 원본이 없어 빈 책상을 채울 수 없어요.">
<defs><marker id="p2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="8" y="7" width="186" height="180" rx="12"/>
<text class="label center" x="101" y="32">책 소개</text>
<circle class="box" cx="56" cy="80" r="26"/><use class="ic" href="#i-stack" x="38" y="62" width="36" height="36"/>
<path class="line" d="M86,80 L118,80" marker-end="url(#p2)"/>
<circle class="box" cx="146" cy="80" r="26"/><use class="ic" href="#i-desk" x="128" y="62" width="36" height="36"/>
<text class="chip" x="56" y="122">서고</text><text class="chip" x="146" y="122">빈 책상</text>
<text class="big" x="101" y="152">원본 있음</text><text class="small" x="101" y="174">서고에서 다시 채워요</text>
<rect class="line" x="206" y="7" width="186" height="180" rx="12"/>
<text class="label center" x="299" y="32">대출 기록</text>
<circle class="bad" cx="254" cy="80" r="26"/><use class="ic" href="#i-stack" x="236" y="62" width="36" height="36"/>
<path class="line dash" d="M284,80 L316,80" marker-end="url(#p2)"/>
<circle class="box" cx="344" cy="80" r="26"/><use class="ic" href="#i-desk" x="326" y="62" width="36" height="36"/>
<text class="chip" x="254" y="122">서고</text><text class="chip" x="344" y="122">빈 책상</text>
<text class="big" x="299" y="152">원본 없음</text><text class="alert" x="299" y="174">채울 곳이 없어요</text>
</svg>
<ol class="steps">
<li>Redis는 꺼도 남는 디스크에도 남길 수 있어요</li>
<li>다시 켜도 값을 되찾는 성질을 영속성이라 해요</li>
</ol>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 대출 기록처럼 중요한 건 DB에 둬야 하지 않나요?</summary>
<p>A. 맞아요. 늘 정확해야 하는 원본은 DB에 두는 쪽이 맞아요(<a href="{{ '/2026/11/16/why-cache/' | relative_url }}">1편</a>). 이 글의 대출 기록은 <a href="{{ '/2026/11/16/data-types/' | relative_url }}">2편</a>의 책상에서만 센 방문 수처럼 Redis에만 둔 값이 다시 켠 뒤 어떻게 되는지 보여 주는 예시예요.</p>
</details>
</aside>
</div>
</div>

<div class="slide-group">
<h2 class="slide-group-title">책상 사진(RDB): 한 시점의 값을 남겨요</h2>

<section class="slide">
<h3>RDB는 책상 전체를 한 장에 담아요</h3>
<svg class="dg" viewBox="0 0 400 195" role="img" aria-label="해님 책은 대출 중이고 달님 책은 반납된 순간의 책상과 그 상태를 담은 사진이 나란히 있어요.">
<rect class="line" x="8" y="7" width="186" height="180" rx="12"/>
<text class="label center" x="101" y="32">책상</text>
<circle class="box" cx="101" cy="86" r="34"/><use class="ic" href="#i-desk" x="79" y="64" width="44" height="44"/>
<text class="big" x="101" y="147">해님 책 · 빌려 감</text><text class="small" x="101" y="172">달님 책 · 반납됨</text>
<rect class="line" x="206" y="7" width="186" height="180" rx="12"/>
<text class="label center" x="299" y="32">그때 찍은 사진</text>
<circle class="kafka" cx="299" cy="86" r="34"/><use class="ic" href="#i-camera" x="277" y="64" width="44" height="44"/>
<text class="big" x="299" y="147">해님 책 · 빌려 감</text><text class="small" x="299" y="172">달님 책 · 반납됨</text>
</svg>
<ol class="steps">
<li>사진(RDB)에는 그 순간 기록이 모두 담겨요</li>
<li>Redis는 사진을 디스크에 파일로 보관해요</li>
</ol>
<p class="more">참고: <a href="https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/#snapshotting">Redis 공식 문서: 영속성 · 스냅샷</a></p>
</section>

<div class="slide-with-question">
<section class="slide">
<h3>Redis는 정한 조건이 차면 사진을 찍어요</h3>
<svg class="dg" viewBox="0 0 400 220" role="img" aria-label="마지막 사진부터 시간과 바뀐 횟수를 재요. 1시간이 지났고 그동안 1번 이상 바뀌었거나, 5분이 지났고 100번 이상 바뀌었거나, 1분이 지났고 1만 번 이상 바뀌었으면 책상 사진(RDB)을 찍어요. 한 줄 안의 두 조건은 둘 다 맞아야 해요. Redis 8.0 설정 파일의 기본 조건이에요.">
<defs><marker id="p3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<circle class="kafka" cx="70" cy="86" r="40"/><use class="ic" href="#i-camera" x="46" y="62" width="48" height="48"/>
<text class="big" x="70" y="150">책상 사진</text><text class="small" x="70" y="172">RDB</text>
<path class="line" d="M146,86 L116,86" marker-end="url(#p3)"/>
<rect class="line" x="150" y="10" width="240" height="180" rx="12"/>
<text class="label center" x="270" y="34">마지막 사진부터 재요</text>
<rect class="box" x="164" y="52" width="212" height="34" rx="8"/><text class="chip" x="270" y="69">1시간 지남 + 1번 이상 바뀜</text>
<rect class="box" x="164" y="98" width="212" height="34" rx="8"/><text class="chip" x="270" y="115">5분 지남 + 100번 이상 바뀜</text>
<rect class="box" x="164" y="144" width="212" height="34" rx="8"/><text class="chip" x="270" y="161">1분 지남 + 1만 번 이상 바뀜</text>
<text class="small" x="270" y="206">Redis 8.0 기본 조건</text>
</svg>
<ol class="steps">
<li>한 줄의 두 조건이 다 맞으면 찍어요 (save 설정)</li>
<li>줄 하나만 맞아도 찍고 그때부터 다시 재요</li>
<li>조건은 개발자나 서비스 제공자가 바꿀 수 있어요</li>
</ol>
<p class="more">참고: <a href="https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/#snapshotting">Redis 공식 문서: 영속성 · 스냅샷</a> · <a href="https://raw.githubusercontent.com/redis/redis/8.0/redis.conf">Redis 8.0 redis.conf</a> · <a href="https://raw.githubusercontent.com/redis/redis/8.0/src/server.c">Redis 8.0 server.c</a></p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 사진을 찍는 동안에도 앱의 요청을 받나요?</summary>
<p>A. 네, 받아요. Redis는 자기를 복제한 자식 프로세스를 만들고(fork) 사진 쓰기는 자식에게 맡긴 채 계속 요청을 처리해요. 다만 데이터가 아주 크면 자식을 만드는 순간 몇 밀리초에서 1초쯤 응답이 멈출 수 있어요.</p>
<p>참고: <a href="https://redis.io/docs/latest/commands/bgsave/">Redis 공식 문서: BGSAVE</a> · <a href="https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/#rdb-disadvantages">Redis 공식 문서: 영속성 · RDB의 단점</a></p>
</details>
</aside>
</div>

<div class="slide-with-question">
<section class="slide">
<h3>사진 뒤에 받은 반납은 정전 때 사라져요</h3>
<svg class="dg" viewBox="0 0 400 312" role="img" aria-label="해님 책 기록을 순서마다 책상 기록(Redis 메모리)과 사진 속 기록(디스크의 파일) 두 칸에 나눠 보여 주는 표 모양 그림. 1 책을 빌려 간 상태에서 사진을 찍으면 책상과 사진 모두 대출 중이에요. 2 책을 돌려받으면 책상만 반납 완료로 바뀌고 사진은 대출 중 그대로예요. 3 새 사진을 찍기 전에 정전이 나면 책상 기록은 지워지고 사진에는 대출 중이 남아요. 4 다시 켜면 사진의 대출 중을 책상으로 가져와 책상도 대출 중이 돼요.">
<defs><marker id="p4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<text class="label center" x="252" y="16">해님 책 기록</text>
<circle class="box" cx="173" cy="50" r="18"/><use class="ic" href="#i-desk" x="161" y="38" width="24" height="24"/>
<circle class="kafka" cx="331" cy="50" r="18"/><use class="ic" href="#i-camera" x="319" y="38" width="24" height="24"/>
<text class="big" x="173" y="84">책상 기록</text><text class="big" x="331" y="84">사진 속 기록</text>
<text class="small" x="173" y="104">Redis 메모리</text><text class="small" x="331" y="104">디스크의 파일</text>
<text class="chip" x="54" y="140">① 사진 찍음</text>
<rect class="box" x="110" y="120" width="126" height="40" rx="8"/><text class="chip" x="173" y="140">대출 중</text>
<rect class="box" x="268" y="120" width="126" height="40" rx="8"/><text class="chip" x="331" y="140">대출 중</text>
<text class="chip" x="54" y="188">② 돌려받음</text>
<rect class="new" x="110" y="168" width="126" height="40" rx="8"/><text class="chip" x="173" y="188">반납 완료</text>
<rect class="box" x="268" y="168" width="126" height="40" rx="8"/><text class="chip" x="331" y="188">대출 중</text>
<text class="chip" x="54" y="228">③ 정전</text><text class="small" x="54" y="246">새 사진 전</text>
<rect class="line dash" x="110" y="216" width="126" height="40" rx="8"/><text class="small" x="173" y="236">지워짐</text>
<rect class="box" x="268" y="216" width="126" height="40" rx="8"/><text class="chip" x="331" y="236">대출 중</text>
<text class="chip" x="54" y="284">④ 다시 켬</text>
<rect class="bad" x="110" y="264" width="126" height="40" rx="8"/><text class="chip" x="173" y="284">대출 중</text>
<rect class="box" x="268" y="264" width="126" height="40" rx="8"/><text class="chip" x="331" y="284">대출 중</text>
<path class="line" d="M266,284 L240,284" marker-end="url(#p4)"/>
</svg>
<ol class="steps">
<li>사진(RDB)은 그 순간 책상 기록을 복사해 둔 파일이에요</li>
<li>사진은 나중에 책상 기록이 바뀌어도 따라 바뀌지 않아요</li>
<li>그래서 책은 돌아왔는데 Redis는 '대출 중'이라고 답해요</li>
</ol>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 정상적으로 껐다 켜도 사라지나요?</summary>
<p>A. 사진 조건(save)이 설정돼 있으면 Redis는 종료 신호(SIGINT·SIGTERM)를 받았을 때 기본으로 끄기 직전에 사진을 한 번 찍어요. 그래서 이렇게 정상 종료하면 다시 켰을 때 끄기 직전 상태로 돌아와요. 사진 조건이 없거나 종료 옵션에 nosave를 정해 두면 찍지 않아요.</p>
<p>참고: <a href="https://raw.githubusercontent.com/redis/redis/8.0/redis.conf">Redis 8.0 redis.conf · shutdown-on-sigterm</a></p>
</details>
</aside>
</div>
</div>

<div class="slide-group">
<h2 class="slide-group-title">대출 일지(AOF): 바뀐 일을 이어 적어요</h2>

<div class="slide-with-question">
<section class="slide">
<h3>AOF는 대출과 반납을 순서대로 적어요</h3>
<svg class="dg" viewBox="0 0 400 195" role="img" aria-label="왼쪽 대출 일지에는 해님 책의 대출 다음 반납이 적혀 있어요. 화살표를 따라 오른쪽 다시 켠 책상은 일지를 앞에서부터 따라가 해님 책을 반납 완료로 채워요.">
<defs><marker id="p7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="8" y="7" width="172" height="180" rx="12"/>
<text class="label center" x="94" y="32">대출 일지</text>
<circle class="kafka" cx="94" cy="86" r="34"/><use class="ic" href="#i-book" x="72" y="64" width="44" height="44"/>
<text class="big" x="94" y="147">대출 → 반납</text><text class="small" x="94" y="172">해님 책</text>
<path class="line" d="M184,86 L216,86" marker-end="url(#p7)"/>
<rect class="line" x="220" y="7" width="172" height="180" rx="12"/>
<text class="label center" x="306" y="32">다시 켠 책상</text>
<circle class="new" cx="306" cy="86" r="34"/><use class="ic" href="#i-desk" x="284" y="64" width="44" height="44"/>
<text class="big" x="306" y="147">반납 완료</text><text class="small" x="306" y="172">기록 순서대로 적용</text>
</svg>
<ol class="steps">
<li>Redis는 값을 바꾼 명령을 일지(AOF)에 덧붙여요</li>
<li>다시 켜면 Redis가 일지대로 다시 처리해요</li>
<li>AOF는 꺼져 있어 개발자가 켜야 해요 (appendonly)</li>
</ol>
<p class="more">참고: <a href="https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/#append-only-file">Redis 공식 문서: 영속성 · AOF</a> · <a href="https://raw.githubusercontent.com/redis/redis/8.0/redis.conf">Redis 8.0 redis.conf</a></p>
</section>
<aside class="author-questions" aria-label="초보 독자 질문 목록">
<details class="author-question">
<summary>초보 독자 Q. 일지가 계속 쌓이면 파일이 너무 커지지 않나요?</summary>
<p>A. 커지면 Redis가 일지를 다시 써서 줄여요. 지금 상태를 만드는 데 필요한 명령만 담은 새 일지를 뒤에서 만들고 다 되면 옛 일지와 바꿔요(AOF 다시 쓰기). Redis 8.0 기본 설정에서는 일지가 64MB 이상이고 지난번 다시 쓴 뒤보다 두 배가 되면 자동으로 해요.</p>
<p>참고: <a href="https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/#log-rewriting">Redis 공식 문서: 영속성 · 일지 다시 쓰기</a> · <a href="https://raw.githubusercontent.com/redis/redis/8.0/redis.conf">Redis 8.0 redis.conf · auto-aof-rewrite</a></p>
</details>
</aside>
</div>

<section class="slide">
<h3>일지에 적고 디스크에 남기기까지 틈이 있어요</h3>
<svg class="dg" viewBox="0 0 400 300" role="img" aria-label="위쪽은 일지가 가는 길이에요. Redis가 일지에 적은 내용은 먼저 메모리의 임시 공간에 머물고 나중에 디스크로 옮겨져요. 정전이 나면 임시 공간은 지워져요. 아래 왼쪽 1초마다 옮기기(everysec)는 최근 1초쯤의 변경이 사라질 수 있어요. 아래 오른쪽 옮긴 뒤 답하기(always)는 디스크로 옮긴 다음에 Redis가 앱에 답해서 느리지만 안전해요.">
<defs><marker id="p6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<path class="line" d="M84,50 L170,50" marker-end="url(#p6)"/>
<path class="line" d="M230,50 L316,50" marker-end="url(#p6)"/>
<text class="chip" x="127" y="34">일지에 적음</text><text class="chip" x="273" y="34">디스크로 옮김</text>
<circle class="box" cx="56" cy="50" r="24"/><use class="ic" href="#i-desk" x="40" y="34" width="32" height="32"/>
<circle class="kafka" cx="200" cy="50" r="24"/><use class="ic" href="#i-buffer" x="184" y="34" width="32" height="32"/>
<circle class="new" cx="344" cy="50" r="24"/><use class="ic" href="#i-disk" x="328" y="34" width="32" height="32"/>
<text class="chip" x="56" y="88">Redis</text><text class="chip" x="200" y="88">임시 공간(메모리)</text><text class="chip" x="344" y="88">디스크</text>
<text class="small" x="200" y="110">정전 때 임시 공간은 지워져요</text>
<rect class="line" x="8" y="128" width="186" height="164" rx="12"/>
<text class="label center" x="101" y="150">1초마다 (everysec)</text>
<path class="line dash" d="M86,190 L116,190" marker-end="url(#p6)"/>
<circle class="bad" cx="60" cy="190" r="22"/><use class="ic" href="#i-buffer" x="46" y="176" width="28" height="28"/>
<circle class="box" cx="142" cy="190" r="22"/><use class="ic" href="#i-disk" x="128" y="176" width="28" height="28"/>
<text class="chip" x="60" y="226">임시 공간</text><text class="chip" x="142" y="226">디스크</text>
<text class="alert" x="101" y="258">최근 1초쯤 사라질 수 있어요</text>
<rect class="line" x="206" y="128" width="186" height="164" rx="12"/>
<text class="label center" x="299" y="150">옮긴 뒤 답 (always)</text>
<path class="line" d="M278,190 L318,190" marker-end="url(#p6)"/>
<circle class="new" cx="254" cy="190" r="22"/><use class="ic" href="#i-disk" x="240" y="176" width="28" height="28"/>
<circle class="box" cx="344" cy="190" r="22"/><use class="ic" href="#i-user" x="330" y="176" width="28" height="28"/>
<text class="chip" x="254" y="226">① 디스크</text><text class="chip" x="344" y="226">② 앱에 답</text>
<text class="big" x="299" y="258">느리지만 안전</text>
</svg>
<ol class="steps">
<li>AOF를 켜면 Redis는 기본 1초마다 옮겨요 (appendfsync)</li>
<li>always로 바꾸면 Redis가 옮긴 뒤 앱에 답해요</li>
<li>그래서 always에서는 답한 변경이 정전에도 남아요</li>
</ol>
<p class="more">참고: <a href="https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/#how-durable-is-the-append-only-file">Redis 공식 문서: 영속성 · AOF의 내구성</a> · <a href="https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/">Redis 공식 문서: 지연 문제 진단</a></p>
</section>

<section class="slide">
<h3>일지는 디스크에 남긴 반납까지 되살려요</h3>
<svg class="dg" viewBox="0 0 400 284" role="img" aria-label="같은 시간 축에 두 복구 방식을 위아래로 나란히 그린 그림. 위는 1 대출 때 사진을 찍고 2 반납을 받은 뒤 3 정전이 나서 사진으로 되살리면 대출 중이에요. 아래는 1 대출과 2 반납을 일지에 적어 디스크에 남긴 뒤 3 정전이 나서 일지로 되살리면 반납 완료예요.">
<defs><marker id="p5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>
<rect class="line" x="6" y="6" width="388" height="130" rx="12"/>
<text class="label center" x="200" y="26">사진(RDB)으로 되살리기</text>
<path class="line" d="M80,66 L140,66" marker-end="url(#p5)"/>
<path class="line" d="M180,66 L240,66" marker-end="url(#p5)"/>
<path class="line" d="M280,66 L312,66" marker-end="url(#p5)"/>
<circle class="kafka" cx="60" cy="66" r="18"/><use class="ic" href="#i-camera" x="48" y="54" width="24" height="24"/>
<circle class="box" cx="160" cy="66" r="18"/><use class="ic" href="#i-book" x="148" y="54" width="24" height="24"/>
<circle class="bad" cx="260" cy="66" r="18"/><use class="ic" href="#i-outage" x="248" y="54" width="24" height="24"/>
<rect class="bad" x="316" y="50" width="72" height="32" rx="6"/><text class="chip" x="352" y="66">대출 중</text>
<text class="chip" x="60" y="104">① 대출 · 사진</text><text class="chip" x="160" y="104">② 반납</text><text class="chip" x="260" y="104">③ 정전</text><text class="chip" x="352" y="104">되살린 값</text>
<rect class="line" x="6" y="146" width="388" height="130" rx="12"/>
<text class="label center" x="200" y="166">일지(AOF)로 되살리기</text>
<path class="line" d="M80,206 L140,206" marker-end="url(#p5)"/>
<path class="line" d="M180,206 L240,206" marker-end="url(#p5)"/>
<path class="line" d="M280,206 L312,206" marker-end="url(#p5)"/>
<circle class="kafka" cx="60" cy="206" r="18"/><use class="ic" href="#i-book" x="48" y="194" width="24" height="24"/>
<circle class="kafka" cx="160" cy="206" r="18"/><use class="ic" href="#i-book" x="148" y="194" width="24" height="24"/>
<circle class="bad" cx="260" cy="206" r="18"/><use class="ic" href="#i-outage" x="248" y="194" width="24" height="24"/>
<rect class="kafka" x="316" y="190" width="72" height="32" rx="6"/><text class="chip" x="352" y="206">반납 완료</text>
<text class="chip" x="60" y="244">① 대출 기록</text><text class="chip" x="160" y="244">② 반납 기록</text><text class="chip" x="260" y="244">③ 정전</text><text class="chip" x="352" y="244">되살린 값</text>
<text class="small" x="110" y="264">둘 다 디스크에 남김</text>
</svg>
<ol class="steps">
<li>사진은 찍은 순간까지만 되살려요</li>
</ol>
</section>
</div>

<div class="slide-group">
<h2 class="slide-group-title">선택: 잃어도 되는 변경과 지켜야 할 기록을 살펴요</h2>

<section class="slide">
<h3>마지막 사진 뒤 변경을 잃어도 되면 RDB만 써요</h3>
<svg class="dg" viewBox="0 0 400 195" role="img" aria-label="같은 RDB와 AOF 아이콘으로 두 선택을 나란히 비교한 그림. 왼쪽 RDB만은 RDB만 켜고 AOF는 꺼서 마지막 사진 뒤의 변경은 잃어도 될 때 써요. 오른쪽 둘 다 켜기는 RDB와 AOF를 모두 켜서 데이터베이스만큼 안전해야 할 때 써요.">
<rect class="line" x="8" y="7" width="186" height="180" rx="12"/>
<text class="label center" x="101" y="32">RDB만</text>
<circle class="kafka" cx="66" cy="86" r="26"/><use class="ic" href="#i-camera" x="48" y="68" width="36" height="36"/>
<circle class="box" cx="136" cy="86" r="26" opacity=".45"/><use class="ic" href="#i-book" x="118" y="68" width="36" height="36" opacity=".45"/>
<text class="chip" x="66" y="128">RDB</text><text class="chip" x="136" y="128">AOF 끔</text>
<text class="small" x="101" y="160">사진 뒤 변경은 잃어도 될 때</text>
<rect class="line" x="206" y="7" width="186" height="180" rx="12"/>
<text class="label center" x="299" y="32">둘 다 켜기</text>
<circle class="kafka" cx="264" cy="86" r="26"/><use class="ic" href="#i-camera" x="246" y="68" width="36" height="36"/>
<circle class="kafka" cx="334" cy="86" r="26"/><use class="ic" href="#i-book" x="316" y="68" width="36" height="36"/>
<text class="chip" x="264" y="128">RDB</text><text class="chip" x="334" y="128">AOF</text>
<text class="small" x="299" y="160">DB만큼 안전해야 할 때</text>
</svg>
<ol class="steps">
<li>둘 다 켜면 재시작 때 AOF로 되살려요</li>
<li>공식 문서는 AOF만 쓰는 것을 권하지 않아요</li>
<li>RDB는 백업과 AOF 오류 대비에도 좋아요</li>
</ol>
<p class="more">캐시로만 쓸 때는 <a href="{{ '/2026/11/16/why-cache/' | relative_url }}">1편</a>에서 봐요 · 참고: <a href="https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/#ok-so-what-should-i-use">Redis 공식 문서: 영속성 · 무엇을 써야 할까</a></p>
</section>

<section class="slide">
<h3>실수로 지운 기록은 다른 곳에 둔 사본에서 찾아요</h3>
<svg class="dg" viewBox="0 0 400 195" role="img" aria-label="왼쪽 Redis 안의 일지와 사진에는 삭제까지 반영돼서 해님 책의 대출 기록이 없어요. 오른쪽 삭제 전에 개발자가 정한 작업으로 하루 한 번 이상 다른 컴퓨터에 복사해 둔 사진 파일 사본에는 대출 중 기록이 남아 있어요.">
<rect class="line" x="8" y="7" width="186" height="180" rx="12"/>
<text class="label center" x="101" y="32">Redis 안의 일지·사진</text>
<circle class="bad" cx="101" cy="86" r="34"/><use class="ic" href="#i-trash" x="79" y="64" width="44" height="44"/>
<text class="big" x="101" y="147">기록 없음</text><text class="small" x="101" y="172">삭제도 반영</text>
<rect class="line" x="206" y="7" width="186" height="180" rx="12"/>
<text class="label center" x="299" y="32">다른 컴퓨터의 사본</text>
<circle class="new" cx="299" cy="86" r="34"/><use class="ic" href="#i-copy" x="277" y="64" width="44" height="44"/>
<text class="big" x="299" y="147">대출 중</text><text class="small" x="299" y="172">하루 한 번 이상 복사</text>
</svg>
<ol class="steps">
<li>일지는 곧바로, 사진은 다음 촬영 때 삭제를 따라가요</li>
<li>개발자가 예약해 둔 작업이 사진 파일을 복사해요 (백업)</li>
<li>백업으로 되살리면 복사한 뒤 바뀐 내용은 빠져요</li>
</ol>
<p class="more">참고: <a href="https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/#backing-up-redis-data">Redis 공식 문서: 영속성 · 백업</a></p>
</section>
</div>
</div>
