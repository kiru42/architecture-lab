import { Given, Then, When } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import { TaskFlowWorld } from '../support/world';

Given('I am a new user with email {string}', function (this: TaskFlowWorld, email: string) {
  this.tasks['__pendingEmail'] = email;
});

When(
  'I sign up with name {string} and password {string}',
  async function (this: TaskFlowWorld, name: string, password: string) {
    await this.signUp(this.tasks['__pendingEmail'], name, password);
  },
);

Then('I should be authenticated', function (this: TaskFlowWorld) {
  assert.ok(this.token, 'expected an auth token');
  assert.ok(this.currentUser, 'expected a current user');
  assert.ok(this.currentUser!.id, 'expected the user to have an id');
});

Then('I should see an empty project list', async function (this: TaskFlowWorld) {
  const projects = await this.request('GET', '/projects');
  assert.deepEqual(projects, [], 'expected a brand new user to have no projects');
});

Given(
  'a user exists with email {string} and password {string}',
  async function (this: TaskFlowWorld, email: string, password: string) {
    await this.signUp(email, 'Test User', password);
    // Drop the session so the next step starts unauthenticated.
    this.token = null;
    this.currentUser = null;
  },
);

When(
  'I try to sign in with email {string} and password {string}',
  async function (this: TaskFlowWorld, email: string, password: string) {
    try {
      await this.signIn(email, password);
      this.signInSucceeded = true;
    } catch (error: any) {
      this.signInSucceeded = false;
      assert.equal(error.status, 401, `expected 401, got ${error.status}: ${error.message}`);
    }
  },
);

Then('I should see an authentication error', function (this: TaskFlowWorld) {
  assert.equal(this.signInSucceeded, false, 'sign in should have been rejected');
});

Then('I should not be authenticated', function (this: TaskFlowWorld) {
  assert.equal(this.token, null, 'no token should have been issued');
});
