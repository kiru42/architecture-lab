import { Given, Then, When } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import { TaskFlowWorld } from '../support/world';

Given('user {string} exists', async function (this: TaskFlowWorld, email: string) {
  const result = await this.signUp(email, 'User', 'password123');
  this.users[email] = result.user;
  this.token = null;
  this.currentUser = null;
});

Given(
  '{string} has a project {string} with task {string}',
  async function (this: TaskFlowWorld, email: string, projectName: string, taskTitle: string) {
    await this.signIn(email);
    const project = await this.request('POST', '/projects', { name: projectName });
    this.projects[projectName] = project;
    this.tasks[taskTitle] = await this.request('POST', `/projects/${project.id}/tasks`, {
      title: taskTitle,
    });
    this.token = null;
    this.currentUser = null;
  },
);

When(
  '{string} comments {string} on {string}',
  async function (this: TaskFlowWorld, email: string, content: string, taskTitle: string) {
    await this.signIn(email);
    const task = this.taskByTitle(taskTitle);
    await this.request('POST', `/tasks/${task.id}/comments`, { content });
  },
);

When(
  '{string} views the comments on {string}',
  async function (this: TaskFlowWorld, email: string, taskTitle: string) {
    await this.signIn(email);
    this.viewedComments = await this.request(
      'GET',
      `/tasks/${this.taskByTitle(taskTitle).id}/comments`,
    );
  },
);

When(
  '{string} tries to view the comments on {string}',
  async function (this: TaskFlowWorld, email: string, taskTitle: string) {
    await this.signIn(email);
    try {
      await this.request('GET', `/tasks/${this.taskByTitle(taskTitle).id}/comments`);
      this.deniedStatus = null;
    } catch (error: any) {
      this.deniedStatus = error.status;
    }
  },
);

Then(
  '{string} should see the comment {string}',
  function (this: TaskFlowWorld, _email: string, content: string) {
    const found = this.viewedComments.find((c: any) => c.content === content);
    assert.ok(found, `expected to see a comment "${content}"`);
    assert.ok(found.authorId, 'a comment should record its author');
  },
);

Then('access should be denied with a {int}', function (this: TaskFlowWorld, status: number) {
  assert.equal(
    this.deniedStatus,
    status,
    `expected the request to be denied with ${status}, got ${this.deniedStatus}`,
  );
});
