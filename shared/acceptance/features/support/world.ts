import { setWorldConstructor, World } from '@cucumber/cucumber';
import { io, Socket } from 'socket.io-client';

export const API_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export interface User {
  id: string;
  email: string;
  name: string;
}

/**
 * Shared per-scenario state. Using a World (rather than module-level variables)
 * means scenarios cannot leak state into each other.
 */
export class TaskFlowWorld extends World {
  token: string | null = null;
  currentUser: User | null = null;
  signInSucceeded = true;
  deniedStatus: number | null = null;

  users: Record<string, User> = {};
  projects: Record<string, any> = {};
  tasks: Record<string, any> = {};
  viewedComments: any[] = [];
  lastTask: any = null;

  socket: Socket | null = null;
  notifications: any[] = [];

  async request(method: string, path: string, body?: unknown): Promise<any> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (response.status === 204) return null;
    if (!response.ok) {
      const text = await response.text();
      const error: any = new Error(
        `HTTP ${response.status} ${method} ${path} — ${text}`,
      );
      error.status = response.status;
      throw error;
    }
    return response.json();
  }

  async signUp(email: string, name: string, password: string) {
    const result = await this.request('POST', '/auth/signup', { email, name, password });
    this.token = result.token;
    this.currentUser = result.user;
    this.users[email] = result.user;
    return result;
  }

  /** Sign in, falling back to signup so a scenario can start on a clean database. */
  async signInOrSignUp(email: string, password = 'password123', name = 'Test User') {
    try {
      return await this.signIn(email, password);
    } catch {
      return this.signUp(email, name, password);
    }
  }

  async signIn(email: string, password = 'password123') {
    const result = await this.request('POST', '/auth/signin', { email, password });
    this.token = result.token;
    this.currentUser = result.user;
    this.users[email] = result.user;
    return result;
  }

  taskByTitle(title: string) {
    const task = this.tasks[title];
    if (!task) throw new Error(`No task named "${title}" was created in this scenario`);
    return task;
  }

  /** Opens a socket for `email` using an explicit token, recording task.assigned events. */
  connectSocketWithToken(email: string, token: string): Promise<void> {
    const user = this.users[email];
    return new Promise<void>((resolve, reject) => {
      const socket: Socket = io(API_URL, {
        transports: ['websocket'],
        auth: { token },
        reconnection: false,
      });
      this.socket = socket;
      this.notifications = [];

      const timer = setTimeout(
        () => reject(new Error(`WebSocket connection timed out for ${user?.email ?? email}`)),
        5000,
      );

      socket.on('connect', () => {
        clearTimeout(timer);
        resolve();
      });
      socket.on('connect_error', (error: Error) => {
        clearTimeout(timer);
        reject(new Error(`WebSocket connection failed for ${user?.email ?? email}: ${error.message}`));
      });
      socket.on('task.assigned', (payload: unknown) => {
        this.notifications.push(payload);
      });
    });
  }
}

setWorldConstructor(TaskFlowWorld);