(() => {
  const carousel = document.querySelector('.series-carousel');
  if (!carousel) return;
  const track = carousel.querySelector('.series-grid');
  const cards = [...track.querySelectorAll('.series-card')];
  if (cards.length < 2) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const count = cards.length;
  const wrap = value => ((value % count) + count) % count;
  let position = 0;
  let target = 0;
  let frame = 0;
  let drag = null;
  let suppressClick = false;
  let lastWheel = -Infinity;
  let radius = 0;

  function measure() {
    // Radius where neighbouring cards sit side by side with an 18px gap.
    radius = (cards[0].offsetWidth + 18) / (2 * Math.tan(Math.PI / count));
    track.style.perspective = `${radius * 2.4}px`;
    render();
  }

  function render() {
    const active = wrap(Math.round(position));
    cards.forEach((card, index) => {
      const angle = (index - position) / count * 360;
      const facing = Math.cos(angle * Math.PI / 180);
      card.style.transform = `translate(-50%, -50%) translateZ(${-radius}px) rotateY(${angle}deg) translateZ(${radius}px)`;
      card.style.zIndex = String(Math.round(1000 + facing * 1000));
      // Full until ~45°, gone by ~63°: farther cards sit past the clip edge and show as thin strips.
      const opacity = Math.min(1, Math.max(0, (facing - .45) / .25));
      card.style.opacity = String(opacity);
      card.style.visibility = opacity ? '' : 'hidden';
      card.tabIndex = index === active ? 0 : -1;
    });
  }

  function settle(next) {
    cancelAnimationFrame(frame);
    target = Math.round(next);
    const start = position;
    const started = performance.now();
    function animate(now) {
      const progress = reducedMotion.matches ? 1 : Math.min((now - started) / 420, 1);
      position = start + (target - start) * (1 - Math.pow(1 - progress, 3));
      render();
      if (progress < 1) frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
  }

  carousel.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const moveFocus = cards.includes(document.activeElement);
    settle(target + (event.key === 'ArrowRight' ? 1 : -1));
    if (moveFocus) cards[wrap(target)].focus({ preventScroll: true });
  });
  track.addEventListener('wheel', event => {
    if (event.ctrlKey || drag) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;
    event.preventDefault();
    const now = performance.now();
    if (now - lastWheel < 180) return;
    lastWheel = now;
    settle(target + Math.sign(delta));
  }, { passive: false });
  track.addEventListener('dragstart', event => event.preventDefault());
  track.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    cancelAnimationFrame(frame);
    suppressClick = false;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, position, lastX: event.clientX, time: performance.now(), velocity: 0, moved: false };
  });
  track.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    if (!drag.moved) {
      if (Math.abs(event.clientY - drag.y) > Math.abs(dx) && Math.abs(event.clientY - drag.y) > 8) { drag = null; settle(position); return; }
      if (Math.abs(dx) < 8) return;
      drag.moved = true;
      track.setPointerCapture(event.pointerId);
      carousel.classList.add('is-dragging');
    }
    const now = performance.now();
    drag.velocity = (event.clientX - drag.lastX) / Math.max(now - drag.time, 1);
    drag.lastX = event.clientX;
    drag.time = now;
    position = drag.position - dx / (cards[0].offsetWidth * .8);
    render();
  });
  function release(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const momentum = event.type === 'pointerup' && performance.now() - drag.time < 100 ? Math.max(-1.5, Math.min(1.5, -drag.velocity * .35)) : 0;
    suppressClick = drag.moved;
    drag = null;
    carousel.classList.remove('is-dragging');
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
    settle(position + momentum);
  }
  track.addEventListener('pointerup', release);
  track.addEventListener('pointercancel', release);
  track.addEventListener('lostpointercapture', release);
  track.addEventListener('click', event => {
    const card = event.target.closest('.series-card');
    if (suppressClick && event.detail !== 0) { event.preventDefault(); return; }
    if (!card || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const index = cards.indexOf(card);
    if (index !== wrap(Math.round(position))) {
      event.preventDefault();
      settle(position + wrap(index - position + count / 2) - count / 2);
    }
  });
  carousel.classList.add('is-ready');
  const observer = new ResizeObserver(measure);
  cards.forEach(card => observer.observe(card));
  measure();
})();
