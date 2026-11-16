// 직접 해 보기: Kafka Java 프로듀서의 기본 파티셔너(문자열 키)와 같은 계산이에요.
// Utils.toPositive(Utils.murmur2(keyBytes)) % numPartitions
function murmur2(d) {
  const m = 0x5bd1e995;
  let h = 0x9747b28c ^ d.length;
  const n = d.length & ~3;
  for (let i = 0; i < n; i += 4) {
    let k = d[i] | d[i + 1] << 8 | d[i + 2] << 16 | d[i + 3] << 24;
    k = Math.imul(k, m);
    k ^= k >>> 24;
    k = Math.imul(k, m);
    h = Math.imul(h, m) ^ k;
  }
  switch (d.length & 3) { // Kafka 원본처럼 일부러 case를 이어서 실행해요
    case 3: h ^= d[n + 2] << 16;
    case 2: h ^= d[n + 1] << 8;
    case 1: h ^= d[n]; h = Math.imul(h, m);
  }
  h ^= h >>> 13;
  h = Math.imul(h, m);
  return h ^ (h >>> 15);
}

(() => {
  const root = document.getElementById('pp');
  if (!root) return;
  const PRESETS = ['송파', '판교', '신촌', '용산', '잠실'];
  const partOf = (key, n) => (murmur2(new TextEncoder().encode(key)) & 0x7fffffff) % n;
  const el = (tag, cls, text) => Object.assign(document.createElement(tag), { className: cls, textContent: text ?? '' });

  root.querySelector('.pp-body').innerHTML =
    '<label class="pp-field">키 <input type="text" value="user-42" maxlength="30" autocomplete="off"></label>' +
    '<label class="pp-field">칸 수 <input type="range" min="1" max="8" value="3"> <span class="pp-n">3</span></label>' +
    '<div class="pp-rows"></div><p class="pp-sum" aria-live="polite"></p>';
  const [keyIn, nIn] = root.querySelectorAll('input');
  const rows = root.querySelector('.pp-rows');
  const sum = root.querySelector('.pp-sum');
  let prev = 3, cur = 3;

  function render() {
    root.querySelector('.pp-n').textContent = cur;
    const keys = (keyIn.value ? [keyIn.value] : []).concat(PRESETS.filter(k => k !== keyIn.value));
    let moved = 0;
    rows.replaceChildren(...keys.map(key => {
      const was = partOf(key, prev), now = partOf(key, cur);
      const row = el('div', 'pp-row');
      const cells = el('div', 'pp-cells');
      for (let i = 0; i < cur; i++) cells.append(el('span', 'pp-cell' + (i === now ? (was === now ? ' hit' : ' moved') : ''), i));
      row.append(el('span', 'pp-key', key), cells);
      if (was !== now) { moved++; row.append(el('span', 'pp-note', `옮겨 가요: 칸 ${was} → 칸 ${now}`)); }
      return row;
    }));
    sum.textContent = (keyIn.value ? `‘${keyIn.value}’은 칸 ${partOf(keyIn.value, cur)}로 가요. ` : '') +
      (prev === cur ? `칸 ${cur}개일 때예요.` : `칸 ${prev}개에서 ${cur}개로 바꾸자 키 ${keys.length}개 중 ${moved}개가 다른 칸으로 가요.`);
  }

  keyIn.addEventListener('input', render);
  nIn.addEventListener('input', () => { prev = cur; cur = +nIn.value; render(); });
  render();
  root.hidden = false;
})();
