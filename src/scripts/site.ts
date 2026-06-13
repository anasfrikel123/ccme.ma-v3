/** Site-wide progressive enhancement — bundled, cacheable via /_astro/*. */

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function canHoverFinePointer(): boolean {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/** Schedule DOM writes on rAF to avoid layout thrash during mousemove. */
function onRafMouseMove(el: HTMLElement, handler: (e: MouseEvent) => void): void {
  let raf = 0;
  let last: MouseEvent | null = null;
  el.addEventListener('mousemove', (e) => {
    last = e;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      if (last) handler(last);
    });
  });
}

export function initRevealOnScroll(): void {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.add('in'));
  }
}

export function initCounters(): void {
  document.querySelectorAll<HTMLElement>('[data-counter]').forEach((c) => {
    const raw = c.dataset.counter || '';
    const match = raw.match(/^([0-9.,]+)(.*)$/);
    if (!match) return;
    const target = parseFloat(match[1].replace(/[^\d.]/g, ''));
    const suffix = match[2] || '';
    if (Number.isNaN(target)) return;

    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        if (prefersReducedMotion()) {
          c.textContent = raw;
          obs.disconnect();
          return;
        }
        const start = performance.now();
        const dur = 1200;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - (1 - t) ** 3;
          const val = Math.round(target * eased * 10) / 10;
          c.textContent =
            (Number.isInteger(target) ? Math.round(target * eased) : val) + suffix;
          if (t < 1) requestAnimationFrame(tick);
          else c.textContent = raw;
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      },
      { threshold: 0.5 },
    );
    obs.observe(c);
  });
}

export function initScrollProgress(): void {
  if (prefersReducedMotion()) return;
  const progress = document.querySelector<HTMLElement>('.scroll-progress');
  if (!progress) return;
  const update = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    progress.style.transform = `scaleX(${max > 0 ? h.scrollTop / max : 0})`;
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

export function initMagneticButtons(): void {
  if (prefersReducedMotion() || !canHoverFinePointer()) return;
  if (window.matchMedia('(max-width: 1179px)').matches) return;

  document.querySelectorAll<HTMLElement>('.btn-primary, .btn-gold, .btn-magnetic').forEach((btn) => {
    btn.classList.add('btn-magnetic');
    onRafMouseMove(btn, (e) => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) * 0.18;
      const dy = (e.clientY - r.top - r.height / 2) * 0.18;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

export function initCardShine(): void {
  if (prefersReducedMotion() || !canHoverFinePointer()) return;

  document.querySelectorAll<HTMLElement>('.card-shine').forEach((shine) => {
    const parent = shine.parentElement;
    if (!parent) return;
    onRafMouseMove(parent, (e) => {
      const r = parent.getBoundingClientRect();
      parent.style.setProperty('--mx', `${e.clientX - r.left}px`);
      parent.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

export function initSiteScripts(): void {
  initRevealOnScroll();
  initCounters();
  initScrollProgress();
  initMagneticButtons();
  initCardShine();
}
