import { APIRequestContext, Page, expect } from '@playwright/test';

/** Any password the contract accepts: 8+ characters, one digit. */
export const PASSWORD = 'SecurePass123';

/** The backend is talked to directly — the frontend proxy is exercised by the UI itself. */
const API_URL = process.env.API_URL ?? 'http://localhost:3000';

export interface SignedUpUser {
  id: string;
  email: string;
  name: string;
}

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

/**
 * Creates a user through the API. Registration is not what most tests are
 * about, and doing it out of band keeps the UI assertions focused on the page
 * under test.
 */
export async function signUp(
  request: APIRequestContext,
  email: string,
  name: string,
): Promise<{ user: SignedUpUser; token: string }> {
  const response = await request.post(`${API_URL}/auth/signup`, {
    data: { email, name, password: PASSWORD },
  });
  expect(response.ok(), `signup failed: ${response.status()} ${await response.text()}`).toBeTruthy();
  return response.json();
}

/** Signs in through the actual form, and waits for the dashboard to be rendered. */
export async function signInViaUi(page: Page, email: string): Promise<void> {
  await page.goto('/signin');
  await page.getByTestId('signin-email').fill(email);
  await page.getByTestId('signin-password').fill(PASSWORD);
  await page.getByTestId('signin-submit').click();
  await expect(page.getByTestId('header-user')).toBeVisible();
}

/** Registers a user out of band, then opens their session through the UI. */
export async function registerAndSignIn(
  page: Page,
  request: APIRequestContext,
  prefix: string,
): Promise<SignedUpUser> {
  const email = uniqueEmail(prefix);
  const { user } = await signUp(request, email, 'Kiru');
  await signInViaUi(page, email);
  return user;
}

export async function createProjectApi(
  request: APIRequestContext,
  token: string,
  name: string,
): Promise<{ id: string; name: string }> {
  const response = await request.post(`${API_URL}/projects`, {
    headers: auth(token),
    data: { name },
  });
  expect(response.ok(), `create project failed: ${response.status()}`).toBeTruthy();
  return response.json();
}

export async function createTaskApi(
  request: APIRequestContext,
  token: string,
  projectId: string,
  title: string,
): Promise<{ id: string; title: string }> {
  const response = await request.post(`${API_URL}/projects/${projectId}/tasks`, {
    headers: auth(token),
    data: { title },
  });
  expect(response.ok(), `create task failed: ${response.status()}`).toBeTruthy();
  return response.json();
}

export async function assignTaskApi(
  request: APIRequestContext,
  token: string,
  taskId: string,
  assigneeId: string,
): Promise<void> {
  const response = await request.patch(`${API_URL}/tasks/${taskId}`, {
    headers: auth(token),
    data: { assigneeId },
  });
  expect(response.ok(), `assign task failed: ${response.status()}`).toBeTruthy();
}
