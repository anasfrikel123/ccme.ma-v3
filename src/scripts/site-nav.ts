/** Header navigation: scroll state, mobile drawer, sub-menus. */

export function initSiteNav(): void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const onScroll = () => {
    if (window.scrollY > 6) header?.classList.add('scrolled');
    else header?.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = document.querySelector<HTMLElement>('[data-nav-toggle]');
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  const backdrop = document.querySelector<HTMLElement>('[data-nav-backdrop]');
  const desktopMq = window.matchMedia('(min-width: 1181px)');

  const closeOtherSubs = (except?: HTMLLIElement) => {
    document.querySelectorAll<HTMLLIElement>('[data-has-sub]').forEach((li) => {
      if (li === except) return;
      li.classList.remove('sub-open');
      const t = li.querySelector<HTMLAnchorElement>('[data-sub-toggle]');
      t?.setAttribute('aria-expanded', 'false');
    });
  };

  const setOpen = (open: boolean) => {
    if (!nav || !toggle || !backdrop) return;
    nav.classList.toggle('open', open);
    backdrop.classList.toggle('show', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    document.body.classList.toggle('nav-open', open);
    if (open) {
      setTimeout(() => nav.querySelector<HTMLElement>('a, button')?.focus({ preventScroll: true }), 50);
    } else {
      closeOtherSubs();
      toggle.focus({ preventScroll: true });
    }
  };

  nav?.addEventListener('keydown', (e: KeyboardEvent) => {
    if (!nav.classList.contains('open') || e.key !== 'Tab') return;
    const focusable = Array.from(
      nav.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
    ).filter((el) => el.offsetParent !== null);
    if (focusable.length < 2) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  toggle?.addEventListener('click', () => {
    const isOpen = nav?.classList.contains('open');
    setOpen(!isOpen);
  });

  backdrop?.addEventListener('click', () => setOpen(false));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav?.classList.contains('open')) setOpen(false);
  });

  nav?.querySelectorAll('a:not([data-sub-toggle])').forEach((a) => {
    a.addEventListener('click', () => setOpen(false));
  });

  const subToggles = document.querySelectorAll<HTMLAnchorElement>('[data-sub-toggle]');
  subToggles.forEach((subToggle) => {
    subToggle.addEventListener('click', (e) => {
      const li = subToggle.closest<HTMLLIElement>('[data-has-sub]');
      if (!li) return;

      if (!desktopMq.matches) {
        e.preventDefault();
        e.stopPropagation();
        const opening = !li.classList.contains('sub-open');
        closeOtherSubs(opening ? li : undefined);
        li.classList.toggle('sub-open', opening);
        subToggle.setAttribute('aria-expanded', opening ? 'true' : 'false');
        return;
      }

      const alreadyOpen = li.classList.contains('sub-open');
      if (alreadyOpen) return;
      e.preventDefault();
      closeOtherSubs(li);
      li.classList.add('sub-open');
      subToggle.setAttribute('aria-expanded', 'true');
      const firstLink = li.querySelector<HTMLAnchorElement>('.sub a');
      firstLink?.focus({ preventScroll: true });
    });
  });

  const mq = window.matchMedia('(min-width: 1181px)');
  mq.addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });

  document.addEventListener('click', (e) => {
    if ((e.target as Element)?.closest('[data-nav]')) return;
    closeOtherSubs();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const open = document.querySelector<HTMLLIElement>('[data-has-sub].sub-open');
      if (open) {
        closeOtherSubs();
        open.querySelector<HTMLAnchorElement>('[data-sub-toggle]')?.focus();
      }
    }
  });
}
