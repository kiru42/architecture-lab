import { expect, test } from '@playwright/test';
import { registerAndSignIn } from './helpers';

test.describe('Tasks and comments', () => {
  test('a user can create a task, complete it and comment on it', async ({ page, request }) => {
    await registerAndSignIn(page, request, 'tasks');

    await page.getByTestId('project-create-toggle').click();
    await page.getByTestId('project-name').fill('Roadmap');
    await page.getByTestId('project-submit').click();
    await page.getByTestId('project-item').filter({ hasText: 'Roadmap' }).getByTestId('project-select').click();

    await page.getByTestId('task-create-toggle').click();
    await page.getByTestId('task-title').fill('Ship the E2E suite');
    await page.getByTestId('task-submit').click();

    const task = page.getByTestId('task-item').filter({ hasText: 'Ship the E2E suite' });
    await expect(task).toBeVisible();

    // click + toBeChecked, not check(): the checkbox is controlled, so its state
    // only flips once the PATCH comes back. check() asserts immediately and
    // would race the round-trip. toBeChecked() retries, and it is the assertion
    // that actually matters.
    await task.getByTestId('task-toggle').click();
    await expect(task.getByTestId('task-toggle')).toBeChecked();

    await task.getByTestId('task-select').click();
    await page.getByTestId('comment-content').fill('Looks good to me');
    await page.getByTestId('comment-submit').click();
    await expect(page.getByTestId('comment-item').filter({ hasText: 'Looks good to me' })).toBeVisible();

    // The completion has to survive a reload: the assertion above could be
    // satisfied by local state alone, and a UI that forgets the server is not
    // the UI we are claiming to test.
    // The selected project lives in component state, not in the URL, so it has
    // to be picked again before the task list exists at all.
    await page.reload();
    await page
      .getByTestId('project-item')
      .filter({ hasText: 'Roadmap' })
      .getByTestId('project-select')
      .click();

    const reloaded = page.getByTestId('task-item').filter({ hasText: 'Ship the E2E suite' });
    await expect(reloaded.getByTestId('task-toggle')).toBeChecked();
  });

  test('a task created in another session shows up after reload', async ({ page, request }) => {
    await registerAndSignIn(page, request, 'tasks-reload');

    await page.getByTestId('project-create-toggle').click();
    await page.getByTestId('project-name').fill('Roadmap');
    await page.getByTestId('project-submit').click();
    await page.getByTestId('project-item').filter({ hasText: 'Roadmap' }).getByTestId('project-select').click();

    await page.getByTestId('task-create-toggle').click();
    await page.getByTestId('task-title').fill('Persisted task');
    await page.getByTestId('task-submit').click();
    await expect(page.getByTestId('task-item').filter({ hasText: 'Persisted task' })).toBeVisible();

    await page.reload();

    await page.getByTestId('project-item').filter({ hasText: 'Roadmap' }).getByTestId('project-select').click();
    await expect(page.getByTestId('task-item').filter({ hasText: 'Persisted task' })).toBeVisible();
  });
});
