// 설명용 파티션: 복제 계수 3, acks=all, min.insync.replicas=2.
// 장애 감지와 따라잡기는 축약하며 ELR/unclean 선출은 재현하지 않아요.
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const make = (tag, cls, content) => Object.assign(document.createElement(tag), { className: cls, textContent: content ?? '' });
  document.querySelectorAll('.rp-widget').forEach((root, widgetIndex) => {
    const online = [true, true, true], ready = [true, true, true];
    const logs = [[], [], []];
    let leader = 0, lastLeader = 0, sequence = 0;
    const timers = [null, null, null];
    const stage = document.createElementNS(NS, 'svg');
    stage.setAttribute('viewBox', '0 0 400 285');
    stage.setAttribute('class', 'dg rp-stage');
    stage.setAttribute('role', 'img');
    stage.setAttribute('aria-label', '주문 서비스에서 현재 리더로 요청하고 ISR 사본에 복제하는 흐름');
    const points = [[70, 170], [200, 170], [330, 170]];
    stage.innerHTML = '<circle class="box" cx="200" cy="40" r="25"/><use class="ic" href="#i-store" x="182" y="22" width="36" height="36"/><text class="chip" x="200" y="85">주문 서비스 · 계속 요청</text>';
    const paths = [], packets = [];
    for (let i = 0; i < 3; i++) {
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('class', 'line');
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
      label.append(input, document.createTextNode(`건물 ${i + 1} 켜기`));
      controls.append(label);
      return input;
    });
    const status = make('p', 'pp-sum');
    status.setAttribute('aria-live', 'polite');
    const stream = make('p', 'rp-stream');
    const caption = make('p', 'rp-caption', '파티션 하나 · 복제 계수 3 · acks=all · 최소 ISR 2');
    root.append(stage, controls, caption, status, stream);
    function elect() {
      if (leader !== -1 && online[leader] && ready[leader]) return;
      leader = online.findIndex((on, i) => on && ready[i]);
      if (leader !== -1) lastLeader = leader;
    }
    function render(message) {
      const count = ready.filter((r, i) => r && online[i]).length;
      badges.forEach((g, i) => {
        g.querySelector('circle').setAttribute('class', !online[i] ? 'bad' : i === leader ? 'kafka' : 'box');
        const texts = g.querySelectorAll('text');
        texts[0].textContent = `B${i + 1} · ${!online[i] ? '꺼짐' : !ready[i] ? '따라잡기' : i === leader ? '리더' : '팔로워'}`;
        texts[1].textContent = logs[i].length ? logs[i].join(' · ') : '아직 기록 없음';
      });
      const target = leader === -1 ? [200, 120] : points[leader];
      const active = [true, count >= 2 && leader !== -1, count >= 2 && leader !== -1];
      const followers = points.filter((_, i) => i !== leader && online[i] && ready[i]);
      const routes = [`M200,95 L${target[0]},${target[1] - 32}`];
      for (let i = 0; i < 2; i++) {
        const dest = followers[i];
        routes.push(dest ? `M${target[0]},${target[1]} Q${(target[0] + dest[0]) / 2},110 ${dest[0]},${dest[1]}` : 'M0,0 L0,0');
        active[i + 1] = active[i + 1] && !!dest;
      }
      paths.forEach((path, i) => {
        path.setAttribute('d', routes[i]);
        path.style.display = active[i] ? '' : 'none';
        packets[i][0].style.display = active[i] ? '' : 'none';
        if (packets[i][1].getAttribute('path') !== routes[i]) packets[i][1].setAttribute('path', routes[i]);
      });
      if (message) status.textContent = message + ` ISR ${count}개 · ` + (leader === -1 ? '리더 복구 대기예요.' : count < 2 ? '최소 ISR 미달로 쓰기를 거절해요.' : `B${leader + 1} 브로커가 현재 ISR 전체의 복제 뒤 성공 응답을 보내요.`);
    }
    function catchUp(i) {
      if (!online[i] || ready[i]) return;
      if (leader === -1) {
        // 모든 사본이 멈췄다면 마지막 리더가 돌아올 때까지 기다려요.
        if (i !== lastLeader) return;
        ready[i] = true;
        elect();
      } else {
        logs[i] = [...logs[leader]];
        ready[i] = true;
      }
      render(`B${i + 1} 브로커가 기록을 따라잡고 ISR에 돌아왔어요.`);
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
      render(!online[i] ? `B${i + 1} 브로커가 멈춰 ISR에서 빠졌어요.${wasLeader === i && leader !== -1 ? ` B${leader + 1} 브로커가 리더를 이어받았어요.` : ''}` : `B${i + 1} 브로커가 켜져 기록을 따라잡아요.`);
      if (online[i]) schedule(i);
    }));
    function send() {
      sequence++;
      const count = ready.filter((r, i) => r && online[i]).length;
      if (leader === -1) stream.textContent = `직전 소식 ${sequence}: 요청을 시도하지만 리더가 없어 대기해요.`;
      else if (count < 2) stream.textContent = `직전 소식 ${sequence}: ISR이 1개라 새 기록을 받지 않고 거절해요.`;
      else {
        online.forEach((on, i) => {
          if (on && ready[i]) { logs[i].push(sequence); logs[i] = logs[i].slice(-3); }
        });
        stream.textContent = `직전 소식 ${sequence}: 리더 접수 → ISR ${count}곳 복제 → 성공 응답`;
      }
      render();
    }
    render('세 건물이 모두 켜져 있어요.');
    root.closest('section').hidden = false;
    send();
    setInterval(send, 1800);
  });
})();

