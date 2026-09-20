import { expect, test } from '@playwright/test';
import {
  assignTaskApi,
  createProjectApi,
  createTaskApi,
  signUp,
  signInViaUi,
  uniqueEmail,
} from './helpers';

/**
 * The contract has no user directory (no GET /users), so the UI has nothing to
 * pick an assignee from: assigning is an out-of-band action here, performed by
 * the owner through the API. What the browser is responsible for is the other
 * half — being connected as the assignee and surfacing the event.
 */
test.describe('Real-time notifications', () => {
  test('the assignee sees the assignment without reloading', async ({ page, request }) => {
    const ownerEmail = uniqueEmail('owner');
    const assigneeEmail = uniqueEmail('assignee');

    const { token: ownerToken } = await signUp(request, ownerEmail, 'Dave');
    const { user: assignee } = await signUp(request, assigneeEmail, 'Eve');

    await signInViaUi(page, assigneeEmail);
    await expect(page.getByTestId('notification-status')).toHaveAttribute('data-connected', 'yes');

    const project = await createProjectApi(request, ownerToken, 'Shared Project');
    const task = await createTaskApi(request, ownerToken, project.id, 'Urgent Task');
    await assignTaskApi(request, ownerToken, task.id, assignee.id);

    await expect(page.getByTestId('notification-item')).toBeVisible();
  });

  test('an unauthenticated visitor opens no socket', async ({ page }) => {
    await page.goto('/signin');

    await expect(page.getByTestId('notification-status')).toHaveCount(0);
  });
});
