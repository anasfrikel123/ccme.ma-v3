/** Homepage-only scripts: hero cursor glow + testimonial rotator. */

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initHeroCursorGlow(): void {
  if (prefersReducedMotion()) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1180px)').matches) return;

  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const glow = hero?.querySelector<HTMLElement>('.cursor-glow');
  if (!hero || !glow) return;

  let raf = 0;
  hero.addEventListener('mousemove', (e) => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = hero.getBoundingClientRect();
      glow.style.left = `${e.clientX - r.left}px`;
      glow.style.top = `${e.clientY - r.top}px`;
      glow.style.opacity = '1';
    });
  });
  hero.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });
}

export function initTestimonialRotator(): void {
  const rotator = document.querySelector<HTMLElement>('.proof-rotator');
  if (!rotator) return;

  const slides = Array.from(rotator.querySelectorAll<HTMLElement>('[data-rotator-slide]'));
  const dots = Array.from(rotator.querySelectorAll<HTMLButtonElement>('[data-rotator-dot]'));
  const pauseBtn = rotator.querySelector<HTMLButtonElement>('[data-rotator-pause]');
  const interval = parseInt(rotator.dataset.rotateInterval || '3500', 10);
  const reduce = prefersReducedMotion();

  let active = 0;
  let timer: number | null = null;
  let userPaused = reduce;
  let hoverPaused = false;
  let visible = true;

  const setActive = (i: number) => {
    active = (i + slides.length) % slides.length;
    slides.forEach((s, k) => {
      const isActive = k === active;
      s.classList.toggle('is-active', isActive);
      s.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      s.tabIndex = isActive ? 0 : -1;
    });
    dots.forEach((d, k) => {
      const isActive = k === active;
      d.classList.toggle('is-active', isActive);
      d.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  };

  const advance = () => setActive(active + 1);

  const syncPauseBtn = () => {
    if (!pauseBtn) return;
    pauseBtn.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
    pauseBtn.setAttribute(
      'aria-label',
      userPaused
        ? 'Reprendre la rotation des témoignages'
        : 'Mettre en pause la rotation des témoignages',
    );
  };

  const start = () => {
    if (timer !== null || reduce || userPaused || hoverPaused || !visible) return;
    timer = window.setInterval(advance, interval);
  };
  const stop = () => {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  pauseBtn?.addEventListener('click', () => {
    userPaused = !userPaused;
    syncPauseBtn();
    if (userPaused) stop();
    else start();
  });

  rotator.addEventListener('mouseenter', () => {
    hoverPaused = true;
    stop();
  });
  rotator.addEventListener('mouseleave', () => {
    hoverPaused = false;
    if (!userPaused && visible) start();
  });
  rotator.addEventListener('focusin', () => {
    hoverPaused = true;
    stop();
  });
  rotator.addEventListener('focusout', (e) => {
    if (!rotator.contains(e.relatedTarget as Node)) {
      hoverPaused = false;
      if (!userPaused && visible) start();
    }
  });

  dots.forEach((d, i) => {
    d.addEventListener('click', () => {
      setActive(i);
      stop();
      start();
    });
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          visible = e.isIntersecting;
          if (visible && !userPaused && !hoverPaused) start();
          else stop();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(rotator);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (!userPaused && !hoverPaused && visible) start();
  });

  syncPauseBtn();
  if (!reduce) start();
}

export function initHomeScripts(): void {
  initHeroCursorGlow();
  initTestimonialRotator();
}
