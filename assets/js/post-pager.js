(() => {
  const list = document.getElementById('latest-posts');
  if (!list) return;
  const items = [...list.querySelectorAll('.post-item')];
  const size = Number(list.dataset.pageSize) || 5;
  const pages = Math.ceil(items.length / size);
  if (pages < 2) return;

  const nav = document.createElement('nav');
  nav.className = 'post-pager';
  nav.setAttribute('aria-label', '글 목록 페이지');
  list.after(nav);

  const button = (label, page, current) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.disabled = page < 1 || page > pages;
    if (current) b.setAttribute('aria-current', 'page');
    b.addEventListener('click', () => {
      show(page);
      nav.querySelector('[aria-current]').focus({ preventScroll: true }); // 버튼을 새로 그려도 키보드 포커스 유지
    });
    return b;
  };

  const show = (page) => {
    items.forEach((item, i) => { item.hidden = Math.floor(i / size) + 1 !== page; });
    nav.replaceChildren(
      button('이전', page - 1),
      ...Array.from({ length: pages }, (_, i) => button(String(i + 1), i + 1, i + 1 === page)),
      button('다음', page + 1)
    );
  };

  // 각 페이지 첫 글도 1페이지 첫 글과 같은 위쪽 여백을 쓰게 한다
  items.forEach((item, i) => item.classList.toggle('is-page-first', i % size === 0));

  // 모든 글 칸을 가장 긴 글 높이에 맞추고 목록 높이도 고정해, 어느 페이지든 글과 버튼이 같은 자리에 오게 한다
  const lockHeight = () => {
    const current = Number(nav.querySelector('[aria-current]')?.textContent) || 1;
    list.style.minHeight = '';
    items.forEach((item) => { item.style.minHeight = ''; item.hidden = false; });
    const pad = (item) => { const s = getComputedStyle(item); return parseFloat(s.paddingTop) + parseFloat(s.paddingBottom); };
    const content = Math.max(...items.map((item) => item.offsetHeight - pad(item)));
    items.forEach((item) => { item.style.minHeight = content + pad(item) + 'px'; });
    show(1);
    list.style.minHeight = list.offsetHeight + 'px';
    show(current);
  };

  lockHeight();
  document.fonts?.ready.then(lockHeight); // 웹폰트가 늦게 적용되면 글 높이가 바뀌므로 다시 잰다
  window.addEventListener('resize', lockHeight);
})();
