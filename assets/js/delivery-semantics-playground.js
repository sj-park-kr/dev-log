// 설명용 흐름: 3건마다 처리와 커밋 사이에 장애를 내고 저장된 위치부터 복구해요.
(() => {
  const root = document.getElementById('delivery-playground');
  if (!root) return;
  const timing = root.querySelector('select');
  const body = root.querySelector('.pp-body');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const el = (tag, cls, text = '') => Object.assign(document.createElement(tag), { className: cls, textContent: text });
  const stage = el('div', 'pp-stage');
  const source = el('span', 'pp-src', '주문 토픽');
  const consumer = el('div', 'pp-col');
  const worker = el('span', 'pp-col-name', '컨슈머');
  const position = el('span', 'pp-last');
  consumer.append(worker, position);
  stage.append(source, consumer);
  const history = el('div', 'pp-shelf');
  const summary = el('p', 'pp-sum');
  summary.setAttribute('aria-live', 'polite');
  body.append(stage, history, summary);

  let current, saved, phase, attempts, recover, records;
  function say(message) {
    position.textContent = `저장된 다음 오프셋: ${saved}`;
    summary.textContent = message;
    history.replaceChildren(...records.map(record => {
      const col = el('div', 'pp-col');
      col.append(el('span', 'pp-col-name', `소식 ${record.id}`), el('span', 'pp-last', `${record.count}회 처리`));
      return col;
    }));
  }
  function reset() {
    stage.querySelectorAll('.pp-fly').forEach(box => { box.getAnimations().forEach(a => a.cancel()); box.remove(); });
    current = saved = phase = attempts = 0;
    recover = false;
    records = [];
    say(`${timing.value === 'before' ? '처리 전' : '처리 후'} 커밋으로 새 비교를 시작해요.`);
  }
  function fly() {
    if (reduce.matches) return;
    const box = el('span', 'pp-box pp-fly', `소식 ${current}`);
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
      fly();
      say(`컨슈머가 소식 ${current}을 꺼내 읽어요.`);
    } else if (phase === 1) {
      if (before) saved = current + 1;
      else records.find(record => record.id === current).count++;
      say(before ? `소식 ${current} 처리 전에 다음 오프셋 ${saved}를 커밋했어요.` : `소식 ${current}을 처리했지만 다음 오프셋은 아직 ${saved}예요.`);
    } else if (phase === 2) {
      recover = attempts % 3 === 0;
      if (recover) say(`장애가 났어요. ${before ? '처리하지 못한 소식을 건너뛰게 돼요.' : '처리한 소식을 다시 읽게 돼요.'}`);
      else {
        if (before) records.find(record => record.id === current).count++;
        else saved = current + 1;
        say(before ? `소식 ${current} 처리도 끝났어요.` : `처리 뒤 다음 오프셋 ${saved}를 커밋했어요.`);
      }
    } else {
      current = saved;
      say(`저장된 오프셋 ${saved}부터 ${recover ? '복구해서' : '계속'} 읽어요. 0회인 채 넘어간 소식은 처리 유실이고 2회인 소식은 중복이에요.`);
    }
    phase = (phase + 1) % 4;
  }
  timing.addEventListener('change', reset);
  reset();
  root.hidden = false;
  tick();
  setInterval(tick, 1400);
})();
