// 설명용 파티션: 복제 계수 3, acks=all, min.insync.replicas=2.
// 장애 감지와 따라잡기는 축약해요. 접수된 마지막 소식을 가진 건물만 리더가 될 수 있고(ELR과 비슷한 축약) unclean 선출은 재현하지 않아요.
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const make = (tag, cls, content) => Object.assign(document.createElement(tag), { className: cls, textContent: content ?? '' });
  document.querySelectorAll('.rp-widget').forEach((root, widgetIndex) => {
    const leaderMode = root.dataset.mode === 'leader';
    const online = [true, true, true], ready = [true, true, true];
    const logs = [[], [], []];
    const lastSeq = [0, 0, 0];
    let leader = 0, sequence = 0, lastAccepted = 0;
    const timers = [null, null, null];
    const stage = document.createElementNS(NS, 'svg');
    stage.setAttribute('viewBox', '0 0 400 285');
    stage.setAttribute('class', 'dg rp-stage');
    stage.setAttribute('role', 'img');
    stage.setAttribute('aria-label', '가게가 현재 리더에 소식을 맡기고 팔로워가 리더에게 가져오기를 요청하는 흐름');
    const points = [[70, 170], [200, 170], [330, 170]];
    stage.innerHTML = `<defs><marker id="rp-arrow-${widgetIndex}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z"/></marker></defs><circle class="box" cx="200" cy="40" r="25"/><use class="ic" href="#i-store" x="182" y="22" width="36" height="36"/><text class="chip" x="200" y="85">주문 가게 · 계속 맡겨요</text><text class="small" x="200" y="275">건물 사이 화살표: 가져오기 요청</text>`;
    const paths = [], packets = [];
    for (let i = 0; i < 3; i++) {
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('class', 'line');
      path.setAttribute('marker-end', `url(#rp-arrow-${widgetIndex})`);
      stage.append(path);
      paths.push(path);
      const dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('class', 'packet');
      dot.setAttribute('r', '5');
      const motion = document.createElementNS(NS, 'animateMotion');
      motion.setAttribute('dur', '1.8s');
      motion.setAttribute('begin', `${i * 0.25}s`);
      motion.setAttribute('repeatCount', 'indefinite');
      dot.append(motion);
      stage.append(dot);
      packets.push([dot, motion]);
    }
    const badges = points.map(([x, y], i) => {
      const g = document.createElementNS(NS, 'g');
      g.innerHTML = `<circle cx="${x}" cy="${y}" r="28"/><use class="ic" href="#i-warehouse" x="${x - 20}" y="${y - 20}" width="40" height="40"/><text class="chip" x="${x}" y="217"></text><text class="small" x="${x}" y="248"></text>`;
      stage.append(g);
      return g;
    });
    const controls = make('div', 'rp-controls');
    const inputs = points.map((_, i) => {
      const label = make('label', 'rp-control');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = true;
      input.id = `rp-${widgetIndex}-broker-${i}`;
      label.htmlFor = input.id;
      label.append(input, document.createTextNode(leaderMode ? '처음 리더인 건물 B1 켜기' : `건물 B${i + 1} 켜기`));
      if (!leaderMode || i === 0) controls.append(label);
      return input;
    });
    const status = make('p', 'pp-sum');
    status.setAttribute('aria-live', 'polite');
    const stream = make('p', 'rp-stream');
    const caption = make('p', 'rp-caption', leaderMode ? '칸 A 하나 · 건물 B1만 끄고 켜요 · B2와 B3는 계속 켜져 있어요' : '칸 A 하나 · 사본 3개 · acks=all · 최소 ISR 2');
    root.append(stage, controls, caption, status, stream);
    function elect() {
      if (leader !== -1 && online[leader] && ready[leader]) return;
      leader = online.findIndex((on, i) => on && ready[i]);
    }
    function render(message) {
      const count = ready.filter((r, i) => r && online[i]).length;
      badges.forEach((g, i) => {
        g.querySelector('circle').setAttribute('class', !online[i] ? 'bad' : i === leader ? 'kafka' : 'box');
        const texts = g.querySelectorAll('text');
        texts[0].textContent = `B${i + 1} · ${!online[i] ? '꺼짐' : !ready[i] ? '따라잡기' : i === leader ? '리더' : '팔로워'}`;
        texts[1].textContent = logs[i].length ? logs[i].join(' · ') : '아직 소식 없음';
      });
      const target = leader === -1 ? [200, 120] : points[leader];
      const active = [true, count >= 2 && leader !== -1, count >= 2 && leader !== -1];
      const followers = points.filter((_, i) => i !== leader && online[i] && ready[i]);
      const routes = [`M200,95 L${target[0]},${target[1] - 32}`];
      for (let i = 0; i < 2; i++) {
        const dest = followers[i];
        const direction = dest && dest[0] > target[0] ? 1 : -1;
        // 먼 팔로워는 높고 바깥쪽으로, 가까운 팔로워는 낮게 그려 곡선이 서로 포개지게 해요.
        const far = dest && Math.abs(dest[0] - target[0]) > 150;
        routes.push(dest ? `M${dest[0] - 24 * direction},${dest[1] - 18} Q${(target[0] + dest[0]) / 2},${far ? 85 : 128} ${target[0] + (far ? 22 : 24) * direction},${target[1] - (far ? 24 : 18)}` : 'M0,0 L0,0');
        active[i + 1] = active[i + 1] && !!dest;
      }
      paths.forEach((path, i) => {
        path.setAttribute('d', routes[i]);
        path.style.display = active[i] ? '' : 'none';
        packets[i][0].style.display = active[i] ? '' : 'none';
        if (packets[i][1].getAttribute('path') !== routes[i]) packets[i][1].setAttribute('path', routes[i]);
      });
      if (message) status.textContent = message + (leader === -1 ? ` 이 모형은 접수된 마지막 소식을 가진 건물만 리더로 세워서 그런 건물이 돌아오기를 기다려요(자세한 건 4묶음).` : leaderMode ? ` 다음 소식은 현재 리더인 건물 B${leader + 1}로 가요.` : ` 명단(ISR) ${count}곳 · ` + (count < 2 ? '최소 두 곳이 안 되어 접수를 거절해요.' : `건물 B${leader + 1}이 명단 전체의 복제 뒤 접수증을 줘요.`));
    }
    function catchUp(i) {
      if (!online[i] || ready[i]) return;
      if (leader === -1) {
        // 모든 사본이 멈췄다면 접수된 마지막 소식까지 가진 건물만 리더가 될 수 있어요.
        if (lastSeq[i] !== lastAccepted) {
          render(`건물 B${i + 1}은 켜졌지만 최신 소식이 없어 리더가 될 수 없고 가져올 리더도 없어요.`);
          return;
        }
        ready[i] = true;
        elect();
      } else {
        logs[i] = [...logs[leader]];
        lastSeq[i] = lastSeq[leader];
        ready[i] = true;
      }
      render(`건물 B${i + 1}이 소식을 따라잡고 명단(ISR)에 돌아왔어요.`);
      online.forEach((on, j) => { if (on && !ready[j]) schedule(j); });
    }
    function schedule(i) {
      clearTimeout(timers[i]);
      timers[i] = setTimeout(() => catchUp(i), 900);
    }
    inputs.forEach((input, i) => input.addEventListener('change', () => {
      online[i] = input.checked;
      ready[i] = false;
      clearTimeout(timers[i]);
      const wasLeader = leader;
      elect();
      render(!online[i] ? `건물 B${i + 1}이 멈춰 명단(ISR)에서 빠졌어요.${wasLeader === i && leader !== -1 ? ` 건물 B${leader + 1}이 칸 A의 리더를 이어받았어요.` : ''}` : `건물 B${i + 1}이 켜졌어요.${leader !== -1 ? ' 리더에게서 소식을 가져와 따라잡아요.' : ''}`);
      if (online[i]) schedule(i);
    }));
    function send() {
      // 거절된 소식은 번호를 올리지 않고 같은 소식을 다시 보내요.
      const next = sequence + 1;
      const count = ready.filter((r, i) => r && online[i]).length;
      if (leader === -1) stream.textContent = `소식 ${next}: 리더가 없어 접수되지 않았어요. 같은 소식을 다시 보내기를 시도해요.`;
      else if (count < 2) stream.textContent = `소식 ${next}: 명단이 한 곳뿐이라 거절돼요. 가게는 같은 소식을 다시 보내기를 시도해요.`;
      else {
        sequence = lastAccepted = next;
        online.forEach((on, i) => {
          if (on && ready[i]) { logs[i].push(sequence); logs[i] = logs[i].slice(-3); lastSeq[i] = sequence; }
        });
        stream.textContent = leaderMode ? `직전 소식 ${sequence}: 가게가 건물 B${leader + 1}에 맡기면 팔로워들이 가져와요 → 접수증` : `직전 소식 ${sequence}: 리더 접수 → 명단 ${count}곳이 모두 보관 → 접수증`;
      }
      render();
    }
    render('세 건물이 모두 켜져 있어요.');
    root.closest('section').hidden = false;
    send();
    setInterval(send, 1800);
  });
})();

