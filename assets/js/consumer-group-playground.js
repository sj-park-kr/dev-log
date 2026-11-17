// 설명용: 단일 토픽의 파티션 세 개를 컨슈머 수에 따라 고르게 배정해요.
(() => {
  const root = document.getElementById('consumer-group-playground');
  if (!root) return;
  const count = root.querySelector('select');
  const stage = root.querySelector('svg');
  const summary = root.querySelector('.cg-summary');
  const step = root.querySelector('.cg-step');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const ns = 'http://www.w3.org/2000/svg';
  let readers = 2, sequence = 0, paths = [];
  const node = (tag, attrs, text) => {
    const item = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key, value]) => item.setAttribute(key, value));
    if (text) item.textContent = text;
    return item;
  };
  function badge(x, y, icon, text, kind) {
    stage.append(node('circle', { class: kind, cx: x, cy: y, r: 23 }),
      node('use', { class: 'ic', href: '#i-' + icon, x: x - 16, y: y - 16, width: 32, height: 32 }),
      node('text', { class: 'chip', x, y: y + 41 }, text));
  }
  function render(changed = false) {
    readers = Number(count.value);
    paths = [];
    stage.replaceChildren();
    stage.append(node('rect', { class: 'line', x: 258, y: 3, width: 136, height: 340, rx: 12 }),
      node('text', { class: 'label center', x: 326, y: 24 }, '재고 그룹'));
    const assigned = Array(readers).fill(0);
    for (let p = 0; p < 3; p++) {
      const owner = Math.floor(p * Math.min(readers, 3) / 3);
      assigned[owner]++;
      const y = 65 + p * 105;
      const dest = readers === 1 ? 160 : 55 + owner * 235 / (readers - 1);
      paths.push({ y, dest, owner });
      stage.append(node('path', { class: 'line', d: 'M85,' + y + ' L298,' + dest }));
      badge(55, y, 'shelving-unit', '파티션 ' + p, 'new');
    }
    for (let c = 0; c < readers; c++) {
      const y = readers === 1 ? 160 : 55 + c * 235 / (readers - 1);
      badge(326, y, 'user-round', 'C' + (c + 1) + (assigned[c] ? '' : ' 대기'), 'box');
    }
    summary.textContent = '컨슈머 ' + readers + (changed ? '명으로 담당을 다시 나눴어요: ' : '명이 담당을 나눠 맡고 있어요: ') +
      assigned.map((n, i) => 'C' + (i + 1) + (i === 0 ? '은 ' : '는 ') + '파티션 ' + n + '개').join(', ') + '.' + (readers === 4 ? ' C4는 맡을 칸이 없어 쉬어요(누가 나가면 이어받을 수 있어요).' : '');
    step.textContent = '각 파티션의 연결선은 같은 그룹의 컨슈머 한 명에게만 이어져요.';
  }
  function read() {
    if (document.hidden) return;
    const p = sequence++ % 3;
    const route = paths[p];
    step.textContent = '파티션 ' + p + '의 다음 메시지를 C' + (route.owner + 1) + (route.owner === 0 ? '이' : '가') + ' 꺼내 읽어요.';
    if (motion.matches) return;
    const dot = node('circle', { class: 'packet', r: 5, cx: 0, cy: 0 });
    stage.append(dot);
    dot.animate([
      { transform: 'translate(85px, ' + route.y + 'px)' },
      { transform: 'translate(298px, ' + route.dest + 'px)' }
    ], { duration: 1000, easing: 'linear' }).finished.then(() => dot.remove());
  }
  count.addEventListener('change', () => { render(true); read(); });
  render();
  root.hidden = false;
  read();
  setInterval(read, 1200);
})();
