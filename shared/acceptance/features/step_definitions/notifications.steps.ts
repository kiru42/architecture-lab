import { Given, Then, When } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import { TaskFlowWorld } from '../support/world';

Given('{string} is signed in', async function (this: TaskFlowWorld, email: string) {
  await this.signIn(email);
});

Given(
  '{string} is connected via WebSocket',
  async function (this: TaskFlowWorld, email: string) {
    // Authenticate as that user, open their socket, then restore the previous session.
    const previousToken = this.token;
    const { token } = await this.signIn(email);
    await this.connectSocketWithToken(email, token);
    this.token = previousToken;
  },
);

Given(
  '{string} has a project {string}',
  async function (this: TaskFlowWorld, email: string, name: string) {
    if (this.currentUser?.email !== email) {
      await this.signIn(email);
    }
    this.projects[name] = await this.request('POST', '/projects', { name });
  },
);

When(
  '{string} creates task {string} in {string}',
  async function (this: TaskFlowWorld, _email: string, taskTitle: string, projectName: string) {
    const project = this.projects[projectName];
    assert.ok(project, `project "${projectName}" should exist`);
    this.lastTask = await this.request('POST', `/projects/${project.id}/tasks`, {
      title: taskTitle,
    });
  },
);

When(
  '{string} assigns {string} to {string}',
  async function (
    this: TaskFlowWorld,
    _actor: string,
    _taskTitle: string,
    assigneeEmail: string,
  ) {
    const assignee = this.users[assigneeEmail];
    assert.ok(assignee, `user "${assigneeEmail}" should exist`);

    this.lastTask = await this.request('PATCH', `/tasks/${this.lastTask.id}`, {
      assigneeId: assignee.id,
    });
  },
);

Then(
  'the task should be assigned to {string}',
  function (this: TaskFlowWorld, assigneeEmail: string) {
    const expected = this.users[assigneeEmail];
    assert.equal(
      this.lastTask.assigneeId,
      expected.id,
      'the assignment should have been persisted',
    );
  },
);

Then(
  '{string} should receive a real-time notification about {string}',
  async function (this: TaskFlowWorld, _email: string, taskTitle: string) {
    const deadline = Date.now() + 5000;
    while (this.notifications.length === 0 && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const notification = this.notifications.find((n) => n.taskId === this.lastTask.id);
    assert.ok(
      notification,
      `expected a task.assigned event for task "${taskTitle}"; received ${JSON.stringify(
        this.notifications,
      )}`,
    );
  },
);
