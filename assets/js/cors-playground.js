// 직접 해 보기: 요청은 계속 페이지 스크립트 → 브라우저 → API 서버로 가고 독자는 서버 답장에 허락 헤더를 넣을지만 바꿔요.
// 설명용 단순화: 할 일 목록과 서버 동작은 예시이며, 헤더 없이 답하면 서버가 처리해도 스크립트가 응답을 못 받는다는 점은 실제와 같아요.
(() => {
  const root = document.getElementById('cp');
  if (!root) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const el = (tag, cls, text = '') => Object.assign(document.createElement(tag), { className: cls, textContent: text });

  const caption = el('p', 'pp-sum', 'API 서버의 답장');
  caption.id = 'cp-choice-label';
  const choices = el('div', 'pp-choices');
  choices.setAttribute('role', 'group');
  choices.setAttribute('aria-labelledby', caption.id);
  let mode = 'none';
  const buttons = [['none', '허락 헤더 없이 답하기'], ['allow', '허락 헤더 넣어 답하기']].map(([value, name]) => {
    const button = el('button', 'pp-btn', name);
    button.type = 'button';
    button.setAttribute('aria-pressed', String(value === mode));
    button.addEventListener('click', () => {
      if (mode === value) return;
      mode = value;
      buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      restart();
    });
    choices.append(button);
    return button;
  });

  const stage = el('div', 'pp-stage pp-card');
  const shelf = el('div', 'pp-shelf');
  stage.append(shelf);
  function col(name) {
    const box = el('div', 'pp-col');
    const text = el('span', 'pp-last');
    const note = el('span', 'pp-col-name');
    box.append(el('span', 'pp-col-name', name), text, note);
    shelf.append(box);
    return { box, text, note };
  }
  const script = col('페이지 스크립트'), browser = col('브라우저'), server = col('API 서버');
  const status = el('p', 'pp-sum');
  status.setAttribute('aria-live', 'polite');
  const progress = el('p', 'pp-sum');
  root.querySelector('.pp-body').append(caption, choices, stage, status, progress);
  root.hidden = false;

  function fly(from, to, name) {
    if (reduced.matches) return;
    const packet = el('span', 'pp-box pp-fly', name);
    stage.append(packet);
    const area = stage.getBoundingClientRect(), a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    const pos = r => `translate(${r.left - area.left + r.width / 2 - packet.offsetWidth / 2}px, ${r.top - area.top + r.height / 2 - packet.offsetHeight / 2}px)`;
    packet.animate([{ transform: pos(a) }, { transform: pos(b) }], { duration: 750, easing: 'ease-in-out' })
      .finished.then(() => packet.remove(), () => packet.remove());
  }
  function hit(c) {
    c.box.classList.remove('hit');
    void c.box.offsetWidth; // 같은 칸에 연달아 와도 강조가 다시 보이게
    c.box.classList.add('hit');
  }

  let step = 0, count = 0, timer;
  function tick() {
    if (document.hidden) return;
    const allow = mode === 'allow';
    if (step === 0) {
      count++;
      script.text.textContent = 'GET /todos 요청';
      browser.text.textContent = '기다리는 중';
      server.text.textContent = '기다리는 중';
      fly(script.box, browser.box, '요청');
      progress.textContent = `${count}번째 요청: 스크립트가 브라우저에게 API 서버로 요청을 보내 달라고 해요.`;
    } else if (step === 1) {
      browser.text.textContent = 'Origin을 붙여요';
      hit(browser);
      fly(browser.box, server.box, '요청 + Origin');
      progress.textContent = '브라우저가 Origin 헤더에 페이지의 출처 http://localhost:5173을 적어 보내요.';
    } else if (step === 2) {
      server.text.textContent = '처리하고 답해요';
      hit(server);
      fly(server.box, browser.box, allow ? '답장 + 허락 헤더' : '답장');
      progress.textContent = allow
        ? '서버가 할 일 목록과 함께 Access-Control-Allow-Origin: http://localhost:5173을 보내요.'
        : '서버는 요청을 처리하고 할 일 목록을 보냈지만 허락 헤더는 넣지 않았어요.';
    } else if (step === 3) {
      browser.text.textContent = allow ? '출처가 맞아요' : '허락 헤더가 없어요';
      hit(browser);
      if (allow) fly(browser.box, script.box, '할 일 목록');
      progress.textContent = allow
        ? '허락 헤더에 적힌 출처가 페이지의 출처와 같아서 브라우저가 응답을 스크립트에 넘겨요.'
        : '허락 헤더가 없어서 브라우저가 응답을 감추고 이유는 콘솔에만 적어요.';
    } else if (step === 4) {
      script.text.textContent = allow ? '할 일 3개 받음' : '네트워크 오류';
      hit(script);
      progress.textContent = allow
        ? '스크립트가 할 일 목록을 받아 화면에 그려요.'
        : '스크립트는 이유 없이 실패만 알아요. 그래도 서버는 이미 요청을 처리했어요.';
    }
    step = (step + 1) % 6;
  }
  function restart() {
    clearInterval(timer);
    stage.querySelectorAll('.pp-fly').forEach(p => { p.getAnimations().forEach(a => a.cancel()); p.remove(); });
    step = 0;
    const allow = mode === 'allow';
    script.note.textContent = 'localhost:5173 페이지';
    browser.note.textContent = '출처를 확인해요';
    server.note.textContent = allow ? 'localhost:8000 · 허락 헤더 있음' : 'localhost:8000 · 허락 헤더 없음';
    status.textContent = allow
      ? '서버가 허락 헤더를 넣어 답해요. 브라우저는 출처가 맞는지 확인하고 응답을 스크립트에 넘겨요.'
      : '서버가 허락 헤더 없이 답해요. 요청은 서버까지 가지만 브라우저가 응답을 스크립트에 넘기지 않아요.';
    count = 0;
    tick();
    timer = setInterval(tick, 1500);
  }
  restart();
})();
