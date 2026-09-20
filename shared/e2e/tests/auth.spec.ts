import { expect, test } from '@playwright/test';
import { PASSWORD, signUp, signInViaUi, uniqueEmail } from './helpers';

test.describe('Authentication', () => {
  test('a visitor can sign up and lands on the dashboard', async ({ page }) => {
    const email = uniqueEmail('signup');

    await page.goto('/signup');
    await page.getByTestId('signup-name').fill('Kiru');
    await page.getByTestId('signup-email').fill(email);
    await page.getByTestId('signup-password').fill(PASSWORD);
    await page.getByTestId('signup-submit').click();

    await expect(page.getByTestId('header-user')).toHaveText('Kiru');
  });

  test('an existing user can sign in', async ({ page, request }) => {
    const email = uniqueEmail('signin');
    await signUp(request, email, 'Kiru');

    await signInViaUi(page, email);

    await expect(page.getByTestId('header-user')).toHaveText('Kiru');
  });

  test('a wrong password is reported and opens no session', async ({ page, request }) => {
    const email = uniqueEmail('wrongpass');
    await signUp(request, email, 'Kiru');

    await page.goto('/signin');
    await page.getByTestId('signin-email').fill(email);
    await page.getByTestId('signin-password').fill('NotThePassword9');
    await page.getByTestId('signin-submit').click();

    await expect(page.getByTestId('auth-error')).toBeVisible();
    await expect(page.getByTestId('header-user')).toHaveCount(0);
  });

  test('an anonymous visitor cannot reach the dashboard', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/signin$/);
  });
});
