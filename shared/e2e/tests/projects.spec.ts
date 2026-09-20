import { expect, test } from '@playwright/test';
import { registerAndSignIn } from './helpers';

test.describe('Projects', () => {
  test('a signed-in user can create a project and see it listed', async ({ page, request }) => {
    await registerAndSignIn(page, request, 'projects');

    await page.getByTestId('project-create-toggle').click();
    await page.getByTestId('project-name').fill('Roadmap');
    await page.getByTestId('project-submit').click();

    await expect(page.getByTestId('project-item').filter({ hasText: 'Roadmap' })).toBeVisible();
  });

  test('a fresh account starts with no project, and other accounts are not visible', async ({
    page,
    request,
  }) => {
    await registerAndSignIn(page, request, 'isolation');

    await expect(page.getByTestId('project-item')).toHaveCount(0);
  });
});
