import { Given, Then, When } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import { TaskFlowWorld } from '../support/world';

Given('I am signed in as {string}', async function (this: TaskFlowWorld, email: string) {
  await this.signInOrSignUp(email);
});

When('I create a project named {string}', async function (this: TaskFlowWorld, name: string) {
  this.projects[name] = await this.request('POST', '/projects', { name });
});

When('I add a task {string} to the project', async function (this: TaskFlowWorld, title: string) {
  const project = Object.values(this.projects).pop() as any;
  assert.ok(project, 'a project must exist before adding tasks');
  this.tasks[title] = await this.request('POST', `/projects/${project.id}/tasks`, { title });
});

When('I mark {string} as complete', async function (this: TaskFlowWorld, title: string) {
  const task = this.taskByTitle(title);
  const updated = await this.request('PATCH', `/tasks/${task.id}`, { completed: true });
  this.tasks[title] = updated;
});

Then(
  'the project should have {int} tasks',
  async function (this: TaskFlowWorld, count: number) {
    const project = Object.values(this.projects).pop() as any;
    const tasks = await this.request('GET', `/projects/${project.id}/tasks`);
    assert.equal(tasks.length, count, `expected ${count} tasks, got ${tasks.length}`);
  },
);

Then('{string} should be marked as complete', async function (this: TaskFlowWorld, title: string) {
  const project = Object.values(this.projects).pop() as any;
  const tasks = await this.request('GET', `/projects/${project.id}/tasks`);
  const task = tasks.find((t: any) => t.title === title);
  assert.ok(task, `task "${title}" should exist`);
  assert.equal(task.completed, true, `task "${title}" should be complete`);
});

Then(
  '{string} should not be marked as complete',
  async function (this: TaskFlowWorld, title: string) {
    const project = Object.values(this.projects).pop() as any;
    const tasks = await this.request('GET', `/projects/${project.id}/tasks`);
    const task = tasks.find((t: any) => t.title === title);
    assert.ok(task, `task "${title}" should exist`);
    assert.equal(task.completed, false, `task "${title}" should not be complete`);
  },
);

Then('creating a project without a name is rejected', async function (this: TaskFlowWorld) {
  try {
    await this.request('POST', '/projects', {});
    assert.fail('expected the API to reject a nameless project');
  } catch (error: any) {
    assert.ok(error.status >= 400 && error.status < 500, `expected a 4xx, got ${error.status}`);
  }
});
