(async () => {
  const endpoint = document.currentScript.dataset.endpoint;
  const counter = document.querySelector('.visitor-stats');
  const labels = Array.from(counter.querySelectorAll('[data-visitor-count]'));
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - (now.getUTCDay() + 6) % 7);
  const starts = { today, week: monday.toISOString().slice(0, 10), month: `${today.slice(0, 7)}-01` };

  try {
    const counts = await Promise.all(labels.map(async label => {
      const url = new URL(endpoint);
      const start = starts[label.dataset.visitorCount];
      if (start) url.searchParams.set('start', start);
      const response = await fetch(url, { credentials: 'omit', referrerPolicy: 'no-referrer' });
      if (!response.ok) throw new Error(`GoatCounter returned ${response.status}`);
      return (await response.json()).count;
    }));
    if (!counts.every(count => typeof count === 'string' && count.length > 0)) return;

    labels.forEach((label, index) => { label.textContent = counts[index]; });
    counter.hidden = false;
  } catch {
    // 공개 카운터의 집계 값을 불러올 수 없으면 통계 영역을 숨긴다.
  }
})();
