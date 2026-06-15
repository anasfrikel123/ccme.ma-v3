/** Footer newsletter signup — fetch + inline status. */

export function initNewsletterForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-newsletter-form]');
  const status = document.querySelector<HTMLElement>('[data-newsletter-status]');
  const btn = document.querySelector<HTMLButtonElement>('[data-newsletter-btn]');

  if (!form || !status || !btn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const hp = (form.elements.namedItem('company') as HTMLInputElement | null)?.value;
    if (hp) return;

    const email = (form.elements.namedItem('email') as HTMLInputElement | null)?.value?.trim();
    if (!email) return;

    status.textContent = 'Envoi en cours…';
    status.dataset.kind = 'sending';
    btn.setAttribute('aria-busy', 'true');
    btn.setAttribute('disabled', 'true');

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({} as Record<string, unknown>));
      if (res.ok) {
        status.textContent =
          (typeof data?.message === 'string' && data.message) ||
          'Merci ! Vérifiez votre boîte mail pour confirmer.';
        status.dataset.kind = 'ok';
        form.reset();
      } else {
        status.textContent =
          (typeof data?.message === 'string' && data.message) ||
          'Erreur. Réessayez ou écrivez à info@ccme.ma.';
        status.dataset.kind = 'err';
      }
    } catch {
      status.textContent = 'Connexion impossible. Réessayez plus tard.';
      status.dataset.kind = 'err';
    } finally {
      btn.removeAttribute('aria-busy');
      btn.removeAttribute('disabled');
    }
  });
}
