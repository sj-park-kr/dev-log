// 직접 해 보기: 편지는 계속 브라우저 → 길목 → 서버로 가고 독자는 http/https만 바꿔 길목에서 보이는 것을 비교해요.
// 설명용 단순화: https일 때 길목에 보이는 뒤섞인 글자는 무작위 글자이며 실제 암호문이 아니에요.
(() => {
  const root = document.getElementById('hp');
  if (!root) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const el = (tag, cls, text = '') => Object.assign(document.createElement(tag), { className: cls, textContent: text });
  const LETTERS = ['아이디: minji · 비밀번호: 1234', 'Cookie: sid=a1b2c3', '주문: 책 2권 · 받는 곳: 꽃길 12'];
  const scramble = () => Array.from({ length: 10 }, () => '0123456789abcdef'[Math.random() * 16 | 0]).join('') + '…';

  const caption = el('p', 'pp-sum', '보내는 방식');
  caption.id = 'hp-choice-label';
  const choices = el('div', 'pp-choices');
  choices.setAttribute('role', 'group');
  choices.setAttribute('aria-labelledby', caption.id);
  let mode = 'http';
  const buttons = [['http', 'http로 보내기'], ['https', 'https로 보내기']].map(([value, name]) => {
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
  const browser = col('브라우저'), middle = col('길목에서 보이는 것'), server = col('서버');
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

  let step = 0, count = 0, letter = '', timer;
  function tick() {
    if (document.hidden) return;
    const safe = mode === 'https';
    if (step === 0) {
      letter = LETTERS[count++ % LETTERS.length];
      browser.text.textContent = letter;
      middle.text.textContent = '기다리는 중';
      server.text.textContent = '기다리는 중';
      fly(browser.box, middle.box, safe ? '잠근 편지' : '편지');
      progress.textContent = `${count}번째 편지가 브라우저에서 출발해요.`;
    } else if (step === 1) {
      middle.text.textContent = safe ? scramble() : letter;
      hit(middle);
      fly(middle.box, server.box, safe ? '잠근 편지' : '편지');
      progress.textContent = safe
        ? '길목에는 뒤섞인 글자만 보여요. 어느 주소로 가는지는 보여요.'
        : '길목에서 편지 내용이 그대로 보여요. 몰래 고쳐 보내도 서버는 알아채기 어려워요.';
    } else if (step === 2) {
      server.text.textContent = letter;
      hit(server);
      progress.textContent = safe
        ? '서버는 핸드셰이크로 맞춘 같은 열쇠로 상자를 열어 원래 내용을 읽어요.'
        : '서버도 같은 내용을 받지만 길목에서 이미 읽혔어요.';
    }
    step = (step + 1) % 4;
  }
  function restart() {
    clearInterval(timer);
    stage.querySelectorAll('.pp-fly').forEach(p => { p.getAnimations().forEach(a => a.cancel()); p.remove(); });
    step = 0;
    const safe = mode === 'https';
    browser.note.textContent = safe ? 'TLS로 잠가 보내요' : '그대로 보내요';
    middle.note.textContent = `받는 곳 203.0.113.10:${safe ? 443 : 80}`;
    server.note.textContent = safe ? '같은 열쇠로 열어요' : '그대로 받아요';
    status.textContent = safe
      ? 'https로 보내요. 길목에는 뒤섞인 글자만 보이고 서버만 같은 열쇠로 열어 읽어요.'
      : 'http로 보내요. 편지가 평문이라 길목에서 내용이 그대로 읽혀요.';
    count = 0;
    tick();
    timer = setInterval(tick, 1500);
  }
  restart();
})();
