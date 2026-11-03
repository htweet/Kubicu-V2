import { test, expect, type Page } from '@playwright/test';

// Baseline of the eight existing user journeys that must keep working.
// Each test runs in a fresh browser context (empty localStorage), so it starts from the demo workspace.
// Do not weaken or skip these to make CI pass; fix the regression instead.

const pageErrors = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  pageErrors.set(page, errors);
  page.on('pageerror', (e) => errors.push(e.message));
});

test.afterEach(async ({ page }) => {
  expect(pageErrors.get(page), 'uncaught page errors').toEqual([]);
});

/** Waits for first render and dismisses the product tour / Ask bar overlays if they are open. */
async function settle(page: Page) {
  await page.waitForTimeout(1500);
  for (const name of ['Close tour', 'Minimise']) {
    const button = page.getByRole('button', { name });
    if ((await button.count()) && (await button.first().isVisible())) await button.first().click().catch(() => undefined);
  }
}

async function open(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'networkidle' });
  await settle(page);
}

test('a+c: sign up, onboard, publish and view the new public page', async ({ page }) => {
  await open(page, '/signup');
  await page.getByLabel('Your name').fill('Test Owner');
  await page.getByLabel('Email').fill('owner@example.com');
  await page.getByLabel('Password', { exact: true }).fill('correct-horse-9');
  const agree = page.locator('input[type=checkbox]').first();
  if (await agree.count()) await agree.check();
  await page.getByRole('button', { name: 'Create account' }).click();

  await page.waitForURL(/verify|start/);
  if (/verify/.test(page.url())) await page.getByRole('button', { name: /Start building my page/ }).click();
  await page.waitForURL(/start/);
  await settle(page);

  await page.getByRole('radio', { name: /Sell products/ }).check({ force: true });
  await page.getByRole('button', { name: 'Continue' }).click();

  const nameField = page.getByLabel('Name on your page');
  for (let i = 0; i < 4 && !(await nameField.count()); i++) {
    const next = page.getByRole('button', { name: 'Continue' });
    if (await next.isEnabled().catch(() => false)) await next.click();
    else await page.getByRole('button', { name: /Skip for now|Start blank/ }).first().click();
    await page.waitForTimeout(300);
  }
  await nameField.fill('E2E Shoes Lagos');

  // L-14 boundary: the demo workspace's link stays reserved for every other workspace.
  const link = page.getByLabel('Your link');
  await link.fill('adaeze');
  await expect(page.getByText('Someone already has that link.')).toBeVisible();
  await link.fill('e2eshoeslagos');
  await expect(page.getByText('kub.icu/e2eshoeslagos is available')).toBeVisible();

  const publish = page.getByRole('button', { name: /Publish my page/ });
  for (let i = 0; i < 6 && !(await publish.count()); i++) {
    const whatsapp = page.getByLabel('WhatsApp number');
    if ((await whatsapp.count()) && (await whatsapp.isVisible()) && !(await whatsapp.inputValue())) await whatsapp.fill('+234 803 123 4567');
    const next = page.getByRole('button', { name: 'Continue' });
    if ((await next.count()) && (await next.isEnabled())) await next.click();
    else await page.getByRole('button', { name: /Skip for now|Start blank/ }).first().click();
    await page.waitForTimeout(300);
  }
  await publish.click();

  await expect.poll(async () => page.evaluate(() =>
    JSON.parse(localStorage.getItem('kubicu.workspaces') || '[]').map((w: { name: string }) => w.name)
  )).toContain('E2E Shoes Lagos');

  await open(page, '/p/e2eshoeslagos');
  await expect(page.getByText('E2E Shoes Lagos').first()).toBeVisible();
});

test('b: canvas edit autosaves and the demo page publishes (L-14 fixed)', async ({ page }) => {
  await open(page, '/app/canvas');
  await page.locator('#block-search').fill('heading');
  await page.getByRole('button', { name: /^Add Heading$/ }).first().click({ force: true });
  await expect(page.getByText('Saved').first()).toBeVisible();

  await page.getByRole('button', { name: /^Publish$/ }).first().click();
  await expect(page.getByText('Publish your changes')).toBeVisible();
  await expect(page.getByText('is already taken')).toHaveCount(0);
  await page.getByRole('button', { name: /^Publish now$/ }).last().click();
  await expect(page.getByText('Published just now. Visitors see this version.')).toBeVisible();

  await open(page, '/p/adaeze');
  await expect(page.getByText('Adaeze Atelier').first()).toBeVisible();
  await expect(page.getByText('New section').first()).toBeVisible();
});

test('d: Copilot replies to a typed message without network calls', async ({ page }) => {
  const calls: string[] = [];
  page.on('request', (r) => { if (['fetch', 'xhr', 'eventsource'].includes(r.resourceType())) calls.push(r.url()); });
  await open(page, '/copilot/chat');
  await page.locator('#copilot-input').fill('I sell handmade shoes in Lagos');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByText('What name should visitors see', { exact: false })).toBeVisible();
  expect(calls).toEqual([]);
});

test('e: AI page assistant loads with credits', async ({ page }) => {
  await open(page, '/app/assistant');
  await expect(page.getByText(/AI credits left/).first()).toBeVisible();
});

test('f: products list shows samples and Add product is gated at the Free-plan limit', async ({ page }) => {
  await open(page, '/app/commerce/products');
  await expect(page.getByText('Adire silk scarf').first()).toBeVisible();
  await expect(page.getByRole('button', { name: /^Add product$/ }).first()).toBeDisabled();
});

test('g: team settings offer Invite people', async ({ page }) => {
  await open(page, '/app/settings');
  await expect(page.getByRole('button', { name: /Invite people/ }).first()).toBeVisible();
});

test('h: workspace switcher lists New workspace', async ({ page }) => {
  await open(page, '/app');
  await page.getByRole('button', { name: /Switch workspace/ }).first().click();
  await expect(page.getByText('New workspace').first()).toBeVisible();
});

test('k: workspace shell loads directly (prototype has no sign-in gate yet)', async ({ page }) => {
  await open(page, '/app');
  expect(page.url()).not.toMatch(/signin/);
  await expect(page.getByText('Overview').first()).toBeVisible();
});
