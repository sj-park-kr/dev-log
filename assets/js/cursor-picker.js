(() => {
  const picker = document.getElementById('cursor-picker');
  if (!picker || !picker.showPopover) return;

  const options = [...picker.querySelectorAll('[data-cursor]')];
  const search = picker.querySelector('.cursor-search');
  const storageKey = 'dev-log-cursor';

  function filterOptions() {
    const query = search.value.trim().toLocaleLowerCase();
    options.forEach(option => {
      const keywords = `${option.textContent} ${option.dataset.keywords || ''}`.toLocaleLowerCase();
      option.hidden = !keywords.includes(query);
    });
    picker.querySelector('.cursor-empty').hidden = options.some(option => !option.hidden);
  }

  search.addEventListener('input', filterOptions);

  function selectCursor(name) {
    const selected = options.find(option => option.dataset.cursor === name) || options[0];
    const image = selected.querySelector('img');
    document.documentElement.style.setProperty('--developer-cursor', image ? `url("${image.src}") 16 16, auto` : 'auto');
    options.forEach(option => option.setAttribute('aria-pressed', String(option === selected)));
    return selected.dataset.cursor;
  }

  try {
    selectCursor(localStorage.getItem(storageKey));
  } catch {
    selectCursor('vscode');
  }

  document.addEventListener('contextmenu', event => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches || event.shiftKey ||
        event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])') ||
        window.getSelection().toString()) return;

    event.preventDefault();
    search.value = '';
    filterOptions();
    picker.showPopover();
    const bounds = picker.getBoundingClientRect();
    picker.style.left = `${Math.max(8, Math.min(event.clientX, innerWidth - bounds.width - 8))}px`;
    picker.style.top = `${Math.max(8, Math.min(event.clientY, innerHeight - bounds.height - 8))}px`;
    search.focus({ preventScroll: true });
  });

  picker.addEventListener('click', event => {
    const option = event.target.closest('[data-cursor]');
    if (!option) return;
    const name = selectCursor(option.dataset.cursor);
    try {
      localStorage.setItem(storageKey, name);
    } catch {
      // The selected cursor still works when browser storage is unavailable.
    }
    picker.hidePopover();
  });
})();
