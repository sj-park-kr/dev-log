(() => {
  const make = (tag, cls, text) => Object.assign(document.createElement(tag), { className: cls, textContent: text ?? '' });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-retention-playground]').forEach(root => {
    const kind = root.dataset.retentionPlayground;
    const choice = root.querySelector('select');
    const stage = make('div', 'pp-stage rc-stage');
    const source = make('span', 'pp-src', kind === 'retention' ? '주문 서비스' : '안내 서비스');
    const arrival = make('p', 'rc-arrival');
    const shelf = make('div', 'rc-shelf');
    const status = make('p', 'pp-sum');
    status.setAttribute('aria-live', 'polite');
    stage.append(source, shelf);
    root.querySelector('.pp-body').append(stage, arrival, status);
    let tick = 0, offset = 0, records = [], busy = false;
    let tombSent = false;
    const record = (key, value) => ({ key, value, offset: offset++, time: tick });
    // 세 건마다 새 단을 열고, 세 번의 도착마다 정리해요. 실제 시간과 크기가 아닌 설명용 단위예요.
    function clean() {
      const before = records.length;
      const isDelete = kind === 'retention' || (kind === 'compact' && choice.value === 'delete');
      if (isDelete) {
        const limit = kind === 'retention' ? Number(choice.value) : 6;
        const active = Math.floor((offset - 1) / 3);
        records = records.filter(r => Math.floor(r.offset / 3) === active || tick - (Math.floor(r.offset / 3) * 3 + 2) < limit);
      } else {
        const latest = new Map(records.map(r => [r.key, r.offset]));
        const active = Math.floor((offset - 1) / 3);
        records = records.filter(r => Math.floor(r.offset / 3) === active || latest.get(r.key) === r.offset);
        // 옛 값을 제거한 뒤 별도의 보관 시간을 두고 표지 자체를 치워요.
        records = records.filter(r => Math.floor(r.offset / 3) === active || r.value !== null || tick - r.time < 6);
      }
      return before - records.length;
    }
    function draw() {
      const groups = new Map();
      records.forEach(r => {
        const segment = Math.floor(r.offset / 3);
        if (!groups.has(segment)) groups.set(segment, []);
        groups.get(segment).push(r);
      });
      const active = Math.floor((offset - 1) / 3);
      shelf.replaceChildren(...Array.from(groups, ([n, rows]) => {
        const col = make('div', 'pp-col rc-col');
        col.append(make('span', 'pp-col-name', '단 ' + n + (n === active ? ' · 쓰는 중' : ' · 닫힘')));
        rows.forEach(r => {
          const box = make('span', 'pp-box rc-record' + (r.value === null ? ' rc-tomb' : ''));
          const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          icon.setAttribute('viewBox', '0 0 24 24');
          icon.setAttribute('aria-hidden', 'true');
          const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
          use.setAttribute('href', r.value === null ? '#i-trash-2' : (kind === 'retention' ? '#i-package' : '#i-file-text'));
          icon.append(use);
          box.append(icon, make('span', '', '번호 ' + r.offset + ' · ' + r.key + (r.value === null ? ' 안내 폐기' : ' 안내 v' + r.value)));
          if (kind === 'retention') box.append(make('span', 'rc-unread', '못 읽음'));
          col.append(box);
        });
        return col;
      }));
    }
    function next() {
      if (busy || document.hidden) return;
      // 한 번만 등장하는 용산은 기간 정리와 키 기준 정리의 차이도 드러내요.
      let key = tick < 4 ? (tick % 2 ? '강남' : '용산') : '강남';
      let value = tick + 1;
      if (kind === 'tombstone' && tick >= 4 && !tombSent && choice.value === 'on') {
        key = '용산'; value = null; tombSent = true;
      }
      const r = record(key, value);
      busy = true;
      const arrive = () => {
        records.push(r);
        tick++;
        const removed = tick % 3 === 0 ? clean() : 0;
        draw();
        arrival.textContent = '번호 ' + r.offset + '의 ' + key + (value === null ? ' 빈 안내문이 도착했어요.' : ' 안내 v' + value + '가 도착했어요.');
        status.textContent = tick % 3 === 0
          ? (removed === 0 ? '이번 정리에서는 치울 것이 없어요.' : '이번 정리에서 ' + (kind === 'retention' ? '못 읽은 소식 ' : '기록 ') + removed + '건을 치웠어요.')
          : '다음 정리까지 ' + (kind === 'retention' ? '못 읽은 소식이 쌓여요.' : '옛 기록도 남아요.');
        busy = false;
      };
      if (reduced.matches) return arrive();
      const parcel = make('span', 'pp-box pp-fly', key + (value === null ? ' 폐기' : ''));
      stage.append(parcel);
      const a = source.getBoundingClientRect(), b = shelf.getBoundingClientRect(), s = stage.getBoundingClientRect();
      parcel.animate([
        { transform: 'translate(' + (a.left - s.left) + 'px, ' + (a.bottom - s.top) + 'px)' },
        { transform: 'translate(' + (b.left - s.left + b.width / 2 - 30) + 'px, ' + (b.top - s.top) + 'px)' }
      ], { duration: 1200, easing: 'ease-in' }).finished.then(() => { parcel.remove(); arrive(); });
    }
    choice.addEventListener('change', () => {
      if (kind === 'tombstone') {
        if (choice.value === 'on') tombSent = false;
      }
      status.textContent = '조건을 바꾸어 새 소식과 다음 정리부터 반영하며 이미 지운 기록은 돌아오지 않아요.';
    });
    draw();
    root.hidden = false;
    next();
    setInterval(next, 4000);
  });
})();
