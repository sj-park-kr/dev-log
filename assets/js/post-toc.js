(() => {
  const heads = [...document.querySelectorAll('.post-content .slide-group-title, .post-content .slide h3')];
  const groups = [];
  heads.forEach((el, i) => {
    if (!el.id) el.id = `sec-${i + 1}`;
    if (el.matches('.slide-group-title')) groups.push({ el, items: [] });
    else if (groups.length) groups[groups.length - 1].items.push({ el });
  });
  if (groups.length < 2) return;

  const makeItem = entry => {
    const li = document.createElement('li');
    entry.link = document.createElement('a');
    entry.link.href = `#${entry.el.id}`;
    // 묶음 제목은 "짧은 이름: 설명" 꼴이라 콜론 앞만 써서 좁은 목차에 맞춰요.
    entry.link.textContent = entry.items ? entry.el.textContent.split(':')[0] : entry.el.textContent;
    li.append(entry.link);
    return li;
  };
  const panel = document.createElement('ol');
  panel.className = 'toc-panel';
  groups.forEach(group => {
    group.li = makeItem(group);
    const sub = document.createElement('ol');
    group.items.forEach(item => { item.group = group; sub.append(makeItem(item)); });
    group.li.append(sub);
    panel.append(group.li);
  });
  const nav = document.createElement('nav');
  nav.className = 'toc';
  nav.setAttribute('aria-label', '이 글의 목차');
  nav.append(panel);
  document.body.append(nav);

  const all = groups.flatMap(group => [group, ...group.items]);
  let queued = false;
  function update() {
    queued = false;
    let active = null;
    for (const entry of all) {
      if (entry.el.getBoundingClientRect().top > 140) break;
      active = entry;
    }
    const current = active && (active.group || active);
    groups.forEach(group => group.li.classList.toggle('is-open', group === current));
    all.forEach(entry => {
      if (entry === active) entry.link.setAttribute('aria-current', 'location');
      else entry.link.removeAttribute('aria-current');
    });
  }
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
})();
