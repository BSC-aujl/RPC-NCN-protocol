(() => {
  const cards = document.querySelectorAll('.viz-card');
  const modal = document.getElementById('viz-modal');
  if (!cards.length || !modal) return;

  const img = document.getElementById('viz-image');
  const title = document.getElementById('viz-title');
  const canvas = document.getElementById('viz-canvas');

  let scale = 1;
  let x = 0;
  let y = 0;
  let dragging = false;
  let dragX = 0;
  let dragY = 0;

  function apply() {
    img.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  }

  function resetView() {
    scale = 1;
    x = 0;
    y = 0;
    apply();
  }

  function openViewer(src, label) {
    img.src = src;
    title.textContent = label || 'Visualization';
    resetView();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeViewer() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  cards.forEach(card => {
    card.addEventListener('click', () => openViewer(card.dataset.vizSrc, card.dataset.vizTitle));
  });

  modal.querySelectorAll('[data-viz-close]').forEach(el => el.addEventListener('click', closeViewer));

  modal.querySelectorAll('[data-viz-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = btn.dataset.vizAction;
      if (a === 'zoom-in') scale = Math.min(scale + 0.15, 4);
      if (a === 'zoom-out') scale = Math.max(scale - 0.15, 0.5);
      if (a === 'left') x -= 40;
      if (a === 'right') x += 40;
      if (a === 'up') y -= 40;
      if (a === 'down') y += 40;
      if (a === 'reset') resetView();
      apply();
    });
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    scale = Math.max(0.5, Math.min(4, scale + (e.deltaY < 0 ? 0.12 : -0.12)));
    apply();
  }, { passive: false });

  canvas.addEventListener('mousedown', (e) => {
    dragging = true;
    dragX = e.clientX - x;
    dragY = e.clientY - y;
    canvas.classList.add('dragging');
  });

  window.addEventListener('mouseup', () => {
    dragging = false;
    canvas.classList.remove('dragging');
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragging || !modal.classList.contains('open')) return;
    x = e.clientX - dragX;
    y = e.clientY - dragY;
    apply();
  });

  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeViewer();
  });
})();
