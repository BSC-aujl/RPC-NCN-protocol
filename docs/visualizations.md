---
layout: default
title: Visualizations
---

# Visualizations

Click any diagram to open an interactive view with zoom and pan controls.

<div class="viz-grid">
  <button class="viz-card" data-viz-src="./specs/images/architecture-diagram.png" data-viz-title="System architecture">
    <img src="./specs/images/architecture-diagram.png" alt="RPC-NCN system architecture" />
    <span>System architecture</span>
  </button>

  <button class="viz-card" data-viz-src="./specs/images/component-diagrams.png" data-viz-title="POC component view">
    <img src="./specs/images/component-diagrams.png" alt="RPC-NCN POC component diagram" />
    <span>POC component view</span>
  </button>

  <button class="viz-card" data-viz-src="./specs/images/poc-implementation-status.png" data-viz-title="Implementation status view">
    <img src="./specs/images/poc-implementation-status.png" alt="RPC-NCN implementation status" />
    <span>Implementation status view</span>
  </button>
</div>

<div id="viz-modal" class="viz-modal" aria-hidden="true">
  <div class="viz-modal-backdrop" data-viz-close></div>
  <div class="viz-modal-panel" role="dialog" aria-modal="true" aria-label="Interactive visualization viewer">
    <div class="viz-toolbar">
      <strong id="viz-title">Visualization</strong>
      <div class="viz-controls">
        <button type="button" data-viz-action="zoom-in">+</button>
        <button type="button" data-viz-action="zoom-out">−</button>
        <button type="button" data-viz-action="left">←</button>
        <button type="button" data-viz-action="right">→</button>
        <button type="button" data-viz-action="up">↑</button>
        <button type="button" data-viz-action="down">↓</button>
        <button type="button" data-viz-action="reset">Reset</button>
        <button type="button" data-viz-close>Close</button>
      </div>
    </div>
    <div class="viz-canvas" id="viz-canvas">
      <img id="viz-image" alt="Interactive visualization" draggable="false" />
    </div>
  </div>
</div>

<script>
(() => {
  const modal = document.getElementById('viz-modal');
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

  document.querySelectorAll('.viz-card').forEach(card => {
    card.addEventListener('click', () => {
      openViewer(card.dataset.vizSrc, card.dataset.vizTitle);
    });
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
    if (!dragging) return;
    x = e.clientX - dragX;
    y = e.clientY - dragY;
    apply();
  });

  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeViewer();
  });
})();
</script>
