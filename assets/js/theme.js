(() => {
  const root = document.documentElement;
  const system = matchMedia('(prefers-color-scheme: dark)');
  const storageKey = 'dev-log-theme';
  let preference;

  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch {}

  function applyTheme() {
    const theme = preference || (system.matches ? 'dark' : 'light');
    root.dataset.theme = theme;
    document.querySelectorAll('.theme-switch button').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.theme === theme));
    });
  }

  applyTheme();
  system.addEventListener('change', applyTheme);

  document.addEventListener('DOMContentLoaded', () => {
    const control = document.querySelector('.theme-switch');
    applyTheme();
    control.hidden = false;
    control.addEventListener('click', event => {
      const button = event.target.closest('button[data-theme]');
      if (!button) return;
      preference = button.dataset.theme;
      applyTheme();
      try {
        localStorage.setItem(storageKey, preference);
      } catch {}
    });
  });
})();
