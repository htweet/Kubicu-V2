import { test, expect } from '@playwright/test';

// Release gate G-1 in a real browser. The prototype build (npm run build) keeps the prototype staff
// console for local demos; the deployable real-sign-in build (KUBICU_PREVIEW_DIR=dist-realauth) must not
// contain it: no staff sign-in on /admin addresses (any case), no staff shortcuts, no links to it.
const deployable = process.env.KUBICU_PREVIEW_DIR === 'dist-realauth';

test(deployable ? 'G-1: the deployable build has no staff console, shortcut or link' : 'G-1: the prototype build keeps the staff console for demos', async ({ page }) => {
  for (const path of ['/admin', '/admin/overview', '/Admin/staff', '/staff']) {
    await page.goto(path, { waitUntil: 'networkidle' });
    const staffSignIn = page.getByRole('heading', { name: /staff/i });
    if (deployable) {
      await expect(page.getByLabel(/password/i), path).toHaveCount(0);
      await expect(page.getByText(/staff account|two-step/i), path).toHaveCount(0);
      await expect(staffSignIn, path).toHaveCount(0);
    } else {
      await expect(page, path).toHaveURL(/\/admin(\/|$)/i);
      await expect(page.getByLabel(/password/i).first(), path).toBeVisible();
    }
  }
  await page.goto('/signin', { waitUntil: 'networkidle' });
  const link = page.getByRole('link', { name: 'Staff console' });
  if (deployable) await expect(link).toHaveCount(0);
  else await expect(link).toBeVisible();
});
