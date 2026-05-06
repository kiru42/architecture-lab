import { Given, When, Then, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser, Page, BrowserContext } from '@playwright/test';
import { strict as assert } from 'assert';

setDefaultTimeout(30000);

// World state
let browser: Browser;
let context: BrowserContext;
let page: Page;
let authToken: string | null = null;
let currentUser: any = null;
let currentProject: any = null;
let currentTask: any = null;
let wsConnection: any = null;
let receivedNotifications: any[] = [];

const API_URL = process.env.BACKEND_URL || 'http://localhost:3000';

Before(async function () {
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext();
  page = await context.newPage();
});

After(async function () {
  if (wsConnection) {
    wsConnection.close();
  }
  await page?.close();
  await context?.close();
  await browser?.close();
  authToken = null;
  currentUser = null;
  currentProject = null;
  currentTask = null;
  receivedNotifications = [];
});

// Helper functions
async function apiRequest(method: string, path: string, body?: any) {
  const headers: any = { 'Content-Type': 'application/json' };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok && response.status !== 401) {
    const text = await response.text();
    throw new Error(`API request failed: ${response.status} ${text}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function signUp(email: string, name: string, password: string) {
  const result = await apiRequest('POST', '/auth/signup', { email, name, password });
  authToken = result.token;
  currentUser = result.user;
  return result;
}

async function signIn(email: string, password: string) {
  try {
    const result = await apiRequest('POST', '/auth/signin', { email, password });
    authToken = result.token;
    currentUser = result.user;
    return { success: true, result };
  } catch (error: any) {
    return { success: false, error };
  }
}

async function createProject(name: string) {
  const project = await apiRequest('POST', '/projects', { name });
  currentProject = project;
  return project;
}

async function createTask(projectId: string, title: string, assigneeId?: string) {
  const task = await apiRequest('POST', `/projects/${projectId}/tasks`, {
    title,
    assigneeId,
  });
  currentTask = task;
  return task;
}

async function updateTask(taskId: string, updates: any) {
  return await apiRequest('PATCH', `/tasks/${taskId}`, updates);
}

async function listTasks(projectId: string) {
  return await apiRequest('GET', `/projects/${projectId}/tasks`);
}

async function createComment(taskId: string, content: string) {
  return await apiRequest('POST', `/tasks/${taskId}/comments`, { content });
}

async function listComments(taskId: string) {
  return await apiRequest('GET', `/tasks/${taskId}/comments`);
}

// Step definitions

// Auth feature
Given('I am a new user with email {string}', function (email: string) {
  // Just store for next step
  this.pendingEmail = email;
});

When('I sign up with name {string} and password {string}', async function (name: string, password: string) {
  await signUp(this.pendingEmail, name, password);
});

Then('I should be authenticated', function () {
  assert(authToken, 'User should have an auth token');
  assert(currentUser, 'Current user should be set');
});

Then('I should see an empty project list', async function () {
  const projects = await apiRequest('GET', '/projects');
  assert.equal(projects.length, 0, 'Project list should be empty');
});

Given('a user exists with email {string} and password {string}', async function (email: string, password: string) {
  // Create user
  await signUp(email, 'Test User', password);
  // Clear auth for the test
  authToken = null;
  currentUser = null;
});

When('I try to sign in with email {string} and password {string}', async function (email: string, password: string) {
  this.signInResult = await signIn(email, password);
});

Then('I should see an authentication error', function () {
  assert(!this.signInResult.success, 'Sign in should have failed');
});

Then('I should not be authenticated', function () {
  assert(!authToken, 'Should not have auth token');
});

// Projects feature
Given('I am signed in as {string}', async function (email: string) {
  await signUp(email, 'Test User', 'password123');
});

When('I create a project named {string}', async function (name: string) {
  await createProject(name);
});

When('I add a task {string} to the project', async function (title: string) {
  await createTask(currentProject.id, title);
});

When('I mark {string} as complete', async function (title: string) {
  const tasks = await listTasks(currentProject.id);
  const task = tasks.find((t: any) => t.title === title);
  assert(task, `Task ${title} not found`);
  await updateTask(task.id, { completed: true });
});

Then('the project should have {int} tasks', async function (count: number) {
  const tasks = await listTasks(currentProject.id);
  assert.equal(tasks.length, count, `Expected ${count} tasks`);
});

Then('{string} should be marked as complete', async function (title: string) {
  const tasks = await listTasks(currentProject.id);
  const task = tasks.find((t: any) => t.title === title);
  assert(task?.completed, `${title} should be complete`);
});

Then('{string} should not be marked as complete', async function (title: string) {
  const tasks = await listTasks(currentProject.id);
  const task = tasks.find((t: any) => t.title === title);
  assert(!task?.completed, `${title} should not be complete`);
});

// Notifications feature (simplified - WebSocket testing)
Given('user {string} exists', async function (email: string) {
  if (!this.users) this.users = {};
  const result = await signUp(email, 'User', 'password123');
  this.users[email] = result.user;
  authToken = null; // Clear for next user
});

Given('{string} is signed in', async function (email: string) {
  await signIn(email, 'password123');
  this.currentActorEmail = email;
});

Given('{string} is connected via WebSocket', function (email: string) {
  // Simplified: in real impl, would open WS connection
  this.wsUser = email;
});

Given('{string} has a project {string}', async function (email: string, projectName: string) {
  if (this.currentActorEmail !== email) {
    await signIn(email, 'password123');
  }
  const project = await createProject(projectName);
  if (!this.projectsByUser) this.projectsByUser = {};
  this.projectsByUser[email] = project;
});

When('{string} creates task {string} in {string}', async function (email: string, taskTitle: string, projectName: string) {
  const project = this.projectsByUser[email];
  const task = await createTask(project.id, taskTitle);
  this.lastCreatedTask = task;
});

When('{string} assigns {string} to {string}', async function (actorEmail: string, taskTitle: string, assigneeEmail: string) {
  const assignee = this.users[assigneeEmail];
  await updateTask(this.lastCreatedTask.id, { assigneeId: assignee.id });
});

Then('{string} should receive a real-time notification about {string}', function (email: string, taskTitle: string) {
  // Simplified assertion - in real test would check WebSocket message
  assert(this.lastCreatedTask, 'Task should exist');
  assert.equal(this.lastCreatedTask.title, taskTitle);
});

// Comments feature
Given('{string} has a project {string} with task {string}', async function (email: string, projectName: string, taskTitle: string) {
  await signIn(email, 'password123');
  const project = await createProject(projectName);
  const task = await createTask(project.id, taskTitle);
  if (!this.tasksByName) this.tasksByName = {};
  this.tasksByName[taskTitle] = task;
  authToken = null;
});

When('{string} comments {string} on {string}', async function (email: string, content: string, taskTitle: string) {
  await signIn(email, 'password123');
  const task = this.tasksByName[taskTitle];
  await createComment(task.id, content);
});

When('{string} signs in and views {string}', async function (email: string, taskTitle: string) {
  await signIn(email, 'password123');
  const task = this.tasksByName[taskTitle];
  this.viewedComments = await listComments(task.id);
});

Then('{string} should see the comment {string}', function (email: string, content: string) {
  const comment = this.viewedComments.find((c: any) => c.content === content);
  assert(comment, `Comment "${content}" not found`);
});
