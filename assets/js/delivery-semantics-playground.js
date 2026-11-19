// 설명용 흐름: 소식을 3번 꺼내 읽을 때마다 처리와 커밋 사이에 장애를 내요.
(() => {
  const root = document.getElementById('delivery-playground');
  if (!root) return;
  const timing = root.querySelector('select');
  const body = root.querySelector('.pp-body');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const el = (tag, cls, text = '') => Object.assign(document.createElement(tag), { className: cls, textContent: text });
  function icon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(svg.namespaceURI, 'use');
    use.setAttribute('href', `#i-${name}`);
    use.setAttribute('class', 'ic');
    svg.append(use);
    return svg;
  }
  const stage = el('div', 'pp-stage');
  const source = el('span', 'pp-src', '주문 토픽');
  source.prepend(icon('shelving-unit'));
  const consumer = el('div', 'pp-col');
  const worker = el('span', 'pp-col-name', '컨슈머');
  const position = el('span', 'pp-last delivery-saved');
  const readPosition = el('span', 'pp-col-name delivery-read');
  consumer.append(icon('user-round'), worker, readPosition, position);
  stage.append(source, consumer);
  const history = el('div', 'pp-shelf');
  history.setAttribute('role', 'log');
  history.setAttribute('aria-live', 'off');
  history.setAttribute('aria-label', '최근 소식의 처리 결과');
  const summary = el('p', 'pp-sum');
  summary.setAttribute('aria-live', 'polite');
  body.append(stage, history, summary);

  let current, read, saved, phase, attempts, recover, records;
  function say(message) {
    readPosition.textContent = `읽은 위치: 다음 ${read}`;
    position.textContent = `커밋한 위치: 다음 ${saved}`;
    summary.textContent = message;
    history.replaceChildren(...records.map(record => {
      const col = el('div', 'pp-col');
      const missed = record.count === 0 && record.id < current;
      const duplicate = record.count > 1;
      col.classList.toggle('delivery-missed', missed);
      const packages = el('span', 'delivery-packages');
      packages.append(icon('package'));
      packages.setAttribute('aria-label', '재고 반영 결과');
      if (duplicate) packages.append(icon('package'));
      col.append(packages, el('span', 'pp-col-name', `소식 ${record.id}`), el('span', 'pp-last', `재고 반영 ${record.count}회`), el('span', 'pp-col-name', missed ? '처리 누락' : duplicate ? '중복 처리' : record.count === 0 ? '처리 대기' : '처리 완료'));
      return col;
    }));
  }
  function reset() {
    stage.querySelectorAll('.pp-fly').forEach(box => { box.getAnimations().forEach(a => a.cancel()); box.remove(); });
    current = read = saved = 1;
    phase = attempts = 0;
    recover = false;
    records = [];
    say(`${timing.value === 'before' ? '처리 전' : '처리 후'} 커밋으로 새 비교를 시작해요.`);
  }
  function fly() {
    if (reduce.matches) return;
    const box = el('span', 'pp-box pp-fly', `소식 ${current}`);
    box.prepend(icon('package'));
    stage.append(box);
    const bounds = stage.getBoundingClientRect();
    const from = source.getBoundingClientRect();
    const to = consumer.getBoundingClientRect();
    const x = from.left - bounds.left + from.width / 2 - box.offsetWidth / 2;
    const y = from.bottom - bounds.top;
    const target = to.top - bounds.top + 12;
    const animation = box.animate([{ transform: `translate(${x}px, ${y}px)` }, { transform: `translate(${x}px, ${target}px)`, opacity: 0 }], { duration: 950 });
    animation.finished.then(() => box.remove(), () => box.remove());
  }
  function tick() {
    if (document.hidden) return;
    const before = timing.value === 'before';
    if (phase === 0) {
      if (!records.some(record => record.id === current)) records.push({ id: current, count: 0 });
      if (records.length > 6) records.shift();
      attempts++;
      read = current + 1;
      fly();
      say(`컨슈머가 소식 ${current}번을 꺼내 읽어요.`);
    } else if (phase === 1) {
      if (before) saved = current + 1;
      else records.find(record => record.id === current).count++;
      say(before ? `소식 ${current}번 처리 전에 커밋한 위치를 다음 ${saved}로 저장했어요.` : `소식 ${current}번을 처리했지만 커밋한 위치는 아직 다음 ${saved}예요.`);
    } else if (phase === 2) {
      recover = attempts % 3 === 0;
      if (recover) say(`컨슈머가 꺼졌다 다시 켜져요. ${before ? '처리하지 못한 소식을 건너뛰게 돼요.' : '처리한 소식을 다시 읽게 돼요.'}`);
      else {
        if (before) records.find(record => record.id === current).count++;
        else saved = current + 1;
        say(before ? `소식 ${current}번 처리도 끝났어요.` : `처리 뒤 커밋한 위치를 다음 ${saved}로 저장했어요.`);
      }
    } else {
      current = saved;
      read = current;
      say(recover ? `다시 켜진 컨슈머는 팀 장부부터 이어 읽으므로 읽은 위치가 커밋한 위치인 다음 ${saved}로 돌아와요. ${before ? '미처리 소식은 누락돼요.' : '이미 처리한 소식을 다시 꺼내 읽어요.'}` : `읽은 위치와 커밋한 위치가 다음 ${saved}예요. 계속 꺼내 읽어요.`);
    }
    phase = (phase + 1) % 4;
  }
  timing.addEventListener('change', reset);
  reset();
  root.hidden = false;
  tick();
  setInterval(tick, 1400);
})();
