import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'contact', path: '/contact' },
  { name: 'conseil-fiscal', path: '/services/conseil-fiscal' },
  { name: 'blog-reforme-is', path: '/blog/reforme-is-2026-pme-tanger' },
] as const;

for (const { name, path } of PAGES) {
  test(`a11y: ${name} has no serious/critical axe violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .disableRules(['color-contrast'])
      .analyze();

    const blocking = results.violations.filter((v) =>
      ['serious', 'critical'].includes(v.impact ?? ''),
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
}

test('blog carousel exposes pause control when present', async ({ page }) => {
  await page.goto('/');
  const pauseBtn = page.locator('[data-rotator-pause]');
  if ((await pauseBtn.count()) === 0) return;
  await expect(pauseBtn).toBeVisible();
  await expect(pauseBtn).toHaveAttribute('aria-pressed');
});
