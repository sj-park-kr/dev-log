// 흐름은 자동으로 반복되고 독자는 응답 기준 또는 모으기 여부 하나만 바꿔요.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const el = (tag, cls, text = '') => Object.assign(document.createElement(tag), { className: cls, textContent: text });
  function setup(id, caption, options) {
    const root = document.getElementById(id);
    if (!root) return null;
    const body = root.querySelector('.pp-body');
    const label = el('label', '', caption);
    const select = el('select', 'pp-btn');
    select.style.color = 'var(--ink)';
    select.style.backgroundColor = 'var(--surface)';
    select.id = `${id}-choice`;
    label.htmlFor = select.id;
    options.forEach(([value, name]) => { const option = el('option', '', name); option.value = value; select.append(option); });
    const stage = el('div', 'pp-stage');
    const source = el('span', 'pp-src', '주문 서비스');
    const shelf = el('div', 'pp-shelf');
    stage.append(source, shelf);
    const status = el('p', 'pp-sum');
    status.setAttribute('aria-live', 'polite');
    const progress = el('p', 'pp-sum');
    body.append(label, select, stage, status, progress);
    root.hidden = false;
    function node(name) {
      const box = el('div', 'pp-col');
      const last = el('span', 'pp-last', '대기');
      box.append(el('span', 'pp-col-name', name), last);
      shelf.append(box);
      return { box, last };
    }
    function fly(from, to, name) {
      if (reduced.matches) return;
      const packet = el('span', 'pp-box pp-fly', name);
      stage.append(packet);
      const area = stage.getBoundingClientRect(), a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
      const pos = r => `translate(${r.left-area.left+r.width/2-packet.offsetWidth/2}px, ${r.top-area.top+r.height/2-packet.offsetHeight/2}px)`;
      const animation = packet.animate([{ transform: pos(a) }, { transform: pos(b) }], { duration: 750, easing: 'ease-in-out' });
      animation.finished.then(() => packet.remove(), () => packet.remove());
    }
    function reset() {
      stage.querySelectorAll('.pp-fly').forEach(packet => { packet.getAnimations().forEach(a => a.cancel()); packet.remove(); });
    }
    return { select, source, status, progress, node, fly, reset };
  }
  const ack = setup('producer-acks', '저장 확인 기준 ', [['1', '리더만 확인 (acks=1)'], ['all', '사본까지 확인 (acks=all)'], ['0', '응답 기다리지 않기 (acks=0)']]);
  if (ack) {
    const leader = ack.node('리더'), replica = ack.node('최신 사본을 가진 건물');
    let step = 0, count = 0, timer;
    function tick() {
      if (document.hidden) return;
      const all = ack.select.value === 'all';
      const none = ack.select.value === '0';
      if (step === 0) {
        count++;
        leader.last.textContent = '수신 중'; replica.last.textContent = '복사 전';
        ack.fly(ack.source, leader.box, `소식 ${count}`);
        ack.progress.textContent = none
          ? `${count}번 소식을 보내고 응답은 기다리지 않아요. 리더에 도착하지 않아도 알 수 없어요.`
          : `${count}번 소식을 리더로 보내요. 아직 저장 응답은 없어요.`;
      } else if (step === 1) {
        leader.last.textContent = '저장됨'; replica.last.textContent = '복사 중';
        ack.fly(leader.box, replica.box, `사본 ${count}`);
        if (!all && !none) ack.fly(leader.box, ack.source, '접수증');
        ack.progress.textContent = all
          ? '사본이 아직 복사 중이라 접수증은 없어요. 지금 리더가 멈추면 이 소식은 잃을 수 있어요.'
          : none
            ? '리더에 도착했어도 확인을 받지 않아요. 지금 리더가 멈추면 아직 복사되지 않은 소식을 잃을 수 있어요.'
            : '리더가 접수증을 돌려줘요. 지금 리더가 멈추면 아직 복사되지 않은 소식을 잃을 수 있어요.';
      } else if (step === 2) {
        replica.last.textContent = '저장됨';
        if (all) ack.fly(leader.box, ack.source, '접수증');
        ack.progress.textContent = all
          ? '사본도 확인해 접수증이 돌아와요. 이 예에서는 이제 리더가 멈춰도 다른 건물에 같은 소식이 있어요.'
          : none
            ? '이 예에서는 사본까지 저장했지만 보내는 쪽은 응답을 받지 않으므로 그 사실을 확인할 수 없어요.'
            : '사본도 이제 저장했어요. 접수증을 받은 때부터 이 순간까지는 리더가 멈추면 잃을 위험이 있었어요.';
      }
      step = (step + 1) % 4;
    }
    function restart() {
      clearInterval(timer);
      ack.reset(); step = 0;
      ack.status.textContent = ack.select.value === 'all'
        ? '사본까지 확인해요. 접수증을 받으면 이 예에서는 리더가 멈춰도 다른 건물에 소식이 남아요.'
        : ack.select.value === '0'
          ? '응답을 기다리지 않아요. 도착 여부를 확인하지 못하고 사본 복사 전에 리더가 멈추면 소식을 잃을 수 있어요.'
          : '리더만 확인해요. 접수증을 받아도 사본 복사 전에 리더가 멈추면 소식을 잃을 수 있어요.';
      tick(); timer = setInterval(tick, 1500);
    }
    ack.select.addEventListener('change', restart);
    restart();
  }
  const batch = setup('producer-batch', '보내는 방식 ', [['single', '한 건씩 보내기'], ['batch', '세 건 모아 보내기']]);
  if (batch) {
    const destination = batch.node('센터의 같은 칸');
    let step = 0, requests = 0, timer;
    function tick() {
      if (document.hidden) return;
      const grouped = batch.select.value === 'batch';
      if (step === 0) { requests = 0; destination.last.textContent = '아직 도착 전'; }
      if (step < 3) {
        if (grouped && step < 2) {
          batch.source.textContent = `주문 서비스 · ${step + 1}건 모으는 중`;
          batch.progress.textContent = `${step + 1}건이 모였어요. 함께 보낼 다음 소식을 기다려요. 전송 요청은 아직 0번이에요.`;
        } else {
          requests++;
          const amount = grouped ? 3 : 1;
          batch.source.textContent = '주문 서비스 · 전송';
          batch.fly(batch.source, destination.box, `${amount}건`);
          destination.last.textContent = `${grouped ? 3 : step + 1}건 전송 중`;
          batch.progress.textContent = `${grouped ? '세 건을 한꺼번에' : '한 건을'} 보내요. 세 건을 보내는 이번 묶음의 전송 요청은 ${requests}번이에요.`;
        }
      } else {
        destination.last.textContent = '세 건 도착';
        batch.source.textContent = '주문 서비스';
        batch.progress.textContent = `같은 세 건을 ${requests}번의 요청으로 보냈어요. 곧 다음 세 건이 들어와요.`;
      }
      step = (step + 1) % 4;
    }
    function restart() {
      clearInterval(timer);
      batch.reset(); step = 0;
      batch.status.textContent = batch.select.value === 'batch'
        ? '세 건을 모아 보내요. 오가는 요청이 한 번으로 줄어 통신에 드는 시간과 부담을 줄여요.'
        : '한 건씩 보내요. 소식마다 바로 출발하며 세 건에 전송 요청이 세 번 필요해요.';
      tick(); timer = setInterval(tick, 1500);
    }
    batch.select.addEventListener('change', restart);
    restart();
  }
})();
