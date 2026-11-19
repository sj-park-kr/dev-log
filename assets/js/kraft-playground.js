// 설명용 모형: C1만 끄고 켜며 선출 지연과 다음 대표를 단순화해요.
(() => {
  const root = document.getElementById('kraft-playground');
  if (!root) return;
  const body = root.querySelector('.pp-body');
  body.innerHTML = `<div class="pp-stage"><svg class="dg" viewBox="0 0 400 310" role="img" aria-label="컨트롤러 세 대와 안내판 변경을 가져오는 브로커 두 대">
    <text class="label center" x="200" y="22">안내판 변경 로그 · 컨트롤러 3대</text>
    <g data-controllers></g><g data-paths></g><g data-packets></g>
    <circle class="kafka" cx="110" cy="235" r="28"/><use class="ic" href="#i-warehouse" x="90" y="215" width="40" height="40"/>
    <circle class="kafka" cx="290" cy="235" r="28"/><use class="ic" href="#i-warehouse" x="270" y="215" width="40" height="40"/>
    <text class="chip" x="110" y="283">브로커 1</text><text class="chip" x="290" y="283">브로커 2</text>
    <text class="small" x="110" y="304" data-broker="0">변경 0까지 적용</text><text class="small" x="290" y="304" data-broker="1">변경 0까지 적용</text>
  </svg></div><button class="pp-btn" type="button">C1 끄기</button><p class="pp-sum" aria-live="polite"></p><p class="pp-sum" data-flow></p>`;
  const controllers = body.querySelector('[data-controllers]');
  const paths = body.querySelector('[data-paths]');
  const packets = body.querySelector('[data-packets]');
  const button = body.querySelector('button');
  const status = body.querySelector('[aria-live]');
  const flow = body.querySelector('[data-flow]');
  const xs = [70, 200, 330];
  const received = [0, 0, 0];
  let c1On = true, leader = 0, revision = 0, committed = 0, generation = 0, electing = false;
  function render() {
    controllers.innerHTML = xs.map((x, i) => {
      const off = i === 0 && !c1On;
      const label = off ? '마지막으로 받은' : received[i] < committed ? '따라잡는 중' : '받은 기록';
      return `<circle class="${off ? 'bad' : i === leader ? 'kafka' : 'box'}" cx="${x}" cy="78" r="28"/><use class="ic" href="#i-building-2" x="${x - 20}" y="58" width="40" height="40"/><text class="chip" x="${x}" y="126">C${i + 1} · ${off ? '꺼짐' : i === leader ? '활성' : '대기'}</text><text class="small" x="${x}" y="148">${label}</text><text class="small" x="${x}" y="167">변경 ${received[i]}</text>`;
    }).join('');
    paths.innerHTML = electing ? '' : [110, 290].map(x => `<path class="line" d="M${xs[leader]},178 L${x},204"/>`).join('');
  }
  function tick() {
    if (electing) return;
    const current = ++revision, sentGeneration = generation;
    received[leader] = current;
    render();
    const change = `변경 ${current}: A칸 리더 → 건물 ${current % 2 + 1}`;
    flow.textContent = `${change}. 대표 C${leader + 1}이 장부에 적었어요. 아직 확정 전이에요.`;
    setTimeout(() => {
      if (sentGeneration !== generation) return;
      // C2와 C3는 항상 켜져 있으므로 대표를 포함한 과반이 보관해요.
      received[1] = current;
      received[2] = current;
      committed = current;
      render();
      flow.textContent = `${change}. 대표를 포함한 과반에 복사돼 확정했어요. 이것이 합의이며 브로커가 가져와 적용해요.`;
      [110, 290].forEach((x, i) => {
        const arrive = () => {
          if (sentGeneration !== generation) return;
          body.querySelector(`[data-broker="${i}"]`).textContent = `변경 ${current}까지 적용`;
        };
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return arrive();
        const packet = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        packet.setAttribute('class', 'packet');
        packet.setAttribute('r', '5');
        const motion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
        motion.setAttribute('path', `M${xs[leader]},178 L${x},204`);
        motion.setAttribute('dur', '0.9s');
        motion.setAttribute('fill', 'freeze');
        packet.append(motion);
        packets.append(packet);
        motion.beginElement();
        setTimeout(() => { packet.remove(); arrive(); }, 900);
      });
    }, 650);
  }
  button.addEventListener('click', () => {
    c1On = !c1On;
    button.textContent = c1On ? 'C1 끄기' : 'C1 켜기';
    if (!c1On && leader === 0) {
      generation++;
      packets.replaceChildren();
      leader = -1;
      electing = true;
      status.textContent = 'C1이 멈췄어요. 남은 C2와 C3가 새 대표를 선출하는 동안 새 안내판 변경은 기다려요.';
      flow.textContent = '브로커는 이미 적용한 안내판을 보관하고 있어요.';
      setTimeout(() => {
        leader = 1;
        electing = false;
        status.textContent = c1On
          ? 'C2가 새 대표예요. 과반이 C2를 따르므로 돌아온 C1은 대기하며 기록을 따라잡아요.'
          : 'C2가 새 활성 컨트롤러가 됐어요. 남은 2대가 과반이라 변경을 이어 가요.';
        tick();
      }, 1600);
    } else if (electing) {
      status.textContent = c1On
        ? 'C1이 돌아왔어요. 아직 대표를 선출 중이며 C1은 기록을 따라잡으며 기다려요.'
        : 'C1이 다시 멈췄어요. C2와 C3가 새 대표를 선출하는 동안 새 안내판 변경은 기다려요.';
    } else {
      status.textContent = c1On
        ? 'C1이 돌아왔어요. 이미 새 대표 C2를 과반이 따르고 있으므로 C1은 대기하며 기록을 따라잡아요.'
        : '대기 중인 C1이 멈췄어요. C2와 C3가 계속 안내판을 관리해요.';
    }
    render();
  });
  status.textContent = 'C1이 활성 컨트롤러예요. C1 끄기로 대표가 바뀌는 과정을 보세요.';
  root.hidden = false;
  tick();
  setInterval(tick, 2200);
  setInterval(() => {
    if (!c1On || electing || leader === 0 || received[0] >= committed) return;
    received[0]++;
    render();
  }, 450);
})();
