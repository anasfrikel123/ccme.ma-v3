import { expect, test } from '@playwright/test';

test.describe('smoke', () => {
  test('home loads with CCME branding', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/CCME|Consulting Maghreb/i);
    await expect(page.locator('#main')).toBeVisible();
  });

  test('skip link moves focus to main content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.locator('.skip-link');
    await expect(skip).toBeFocused();
    await skip.click();
    await expect(page).toHaveURL(/#main$/);
    await expect(page.locator('#main')).toBeVisible();
  });

  test('mobile nav toggle opens primary navigation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const toggle = page.locator('[data-nav-toggle]');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#primary-nav')).toBeVisible();
  });

  test('IS simulator calculates 850k bénéfice → 170k IS', async ({ page }) => {
    await page.goto('/outils/simulateur-is');
    await page.locator('#ca').fill('5000000');
    await page.locator('#benefice').fill('850000');
    await page.locator('#calculate').click();
    await expect(page.locator('#result')).toBeVisible();
    await expect(page.locator('#isDue')).toContainText('170');
  });

  test('contact form submits with mocked Web3Forms API', async ({ page }) => {
    await page.route('https://api.web3forms.com/submit', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/contact');
    await page.locator('#nom').fill('Test Vitest');
    await page.locator('#email').fill('test@example.com');
    await page.locator('#message').fill('Message de test automatisé Playwright.');
    await page.locator('#consent').evaluate((el: HTMLInputElement) => {
      el.checked = true;
    });
    await page.locator('[data-contact-form]').evaluate((form: HTMLFormElement) => {
      form.requestSubmit();
    });

    const status = page.locator('#contact-status');
    await expect(status).toHaveAttribute('data-kind', 'ok', { timeout: 10_000 });
  });
});
