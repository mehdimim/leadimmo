import { test, expect } from '@playwright/test';

test('lead form submission redirects to thank you', async ({ page }) => {
  await page.route('**/api/leads', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ success: true })
    });
  });

  await page.goto('http://localhost:3000/en');
  await page.getByLabel('First name').fill('Playwright Tester');
  await page.getByLabel('Phone / WhatsApp').fill('+6600000000');
  await page.getByLabel('Budget').selectOption('500kto1m');
  await page.getByLabel('Property type').selectOption('villa');
  await page.getByLabel('Timeline').selectOption('soon');
  await page.getByLabel('Call preference').selectOption('phone');
  await page.getByLabel('Time zone').fill('Asia/Bangkok');
  await page.getByRole('checkbox').check({ force: true });

  await page.getByRole('button', { name: /Send my brief/i }).click();

  await expect(page).toHaveURL('http://localhost:3000/en/merci');
  await expect(page.getByRole('heading', { name: /Thank you/i })).toBeVisible();
});
