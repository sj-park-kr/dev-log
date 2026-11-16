// 직접 해 보기: 택배가 계속 도착하고, 독자는 칸 수만 바꿔 동네별로 가는 칸이 달라지는 모습을 봐요.
// 설명용 규칙: 칸이 2개면 첫 글자가 ㄱ인 동네는 칸 1, 나머지는 칸 0. 실제 카프카는 키 해시를 칸 수로 나눈 나머지를 써요.
(() => {
  const root = document.getElementById('pp');
  if (!root) return;
  const TOWNS = ['용산', '강남', '은평', '관악'];
  const isGiyeok = t => ((t.charCodeAt(0) - 0xac00) / 588 | 0) === 0; // 한글 초성 ㄱ
  const el = (tag, cls, text) => Object.assign(document.createElement(tag), { className: cls, textContent: text ?? '' });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const stage = el('div', 'pp-stage');
  const src = el('span', 'pp-src', '주문 서비스');
  const shelf = el('div', 'pp-shelf');
  stage.append(src, shelf);
  const btn = el('button', 'pp-btn');
  btn.type = 'button';
  const sum = el('p', 'pp-sum');
  sum.setAttribute('aria-live', 'polite');
  root.querySelector('.pp-body').append(stage, btn, sum);

  let n = 1, i = 0, cols = [];
  function setCols(count) {
    n = count;
    cols = Array.from({ length: n }, (_, k) => {
      const col = el('div', 'pp-col');
      col.append(el('span', 'pp-col-name', `칸 ${k}`), el('span', 'pp-last'));
      return col;
    });
    shelf.replaceChildren(...cols);
    btn.textContent = n === 1 ? '칸 하나 늘리기' : '처음처럼 칸 1개로 보기';
    sum.textContent = n === 1
      ? '칸이 1개라 어느 동네 택배든 칸 0으로 가요.'
      : '칸이 2개가 되자 ㄱ으로 시작하는 강남·관악은 칸 1로, 용산·은평은 칸 0으로 가요.';
  }

  function arrive(col, t) {
    col.querySelector('.pp-last').textContent = t;
    col.classList.remove('hit');
    void col.offsetWidth; // 같은 칸에 연달아 와도 강조가 다시 보이게
    col.classList.add('hit');
  }

  function send() {
    const t = TOWNS[i++ % TOWNS.length];
    const col = cols[n === 1 || !isGiyeok(t) ? 0 : 1];
    if (reduce) return arrive(col, t);
    const box = el('span', 'pp-box pp-fly', t);
    stage.append(box);
    const s = stage.getBoundingClientRect(), a = src.getBoundingClientRect(), b = col.getBoundingClientRect();
    const w = box.offsetWidth;
    const from = `translate(${a.left - s.left + a.width / 2 - w / 2}px, ${a.bottom - s.top}px)`;
    const to = `translate(${b.left - s.left + b.width / 2 - w / 2}px, ${b.top - s.top + 30}px)`;
    box.animate([{ transform: from }, { transform: to, opacity: 1 }, { transform: to, opacity: 0 }], { duration: 1100, easing: 'ease-in' })
      .finished.then(() => { box.remove(); arrive(col, t); });
  }

  btn.addEventListener('click', () => setCols(n === 1 ? 2 : 1));
  setCols(1);
  root.hidden = false;
  send();
  setInterval(send, 1300);
})();
