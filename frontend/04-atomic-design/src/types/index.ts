export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  archived: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  dueDate: string | null;
  projectId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload of the `task.assigned` event the backend gateway emits to the
 * assignee. It mirrors the contract in shared/openapi.yaml: the event carries
 * ids plus the assignee's display name, nothing more.
 */
export interface TaskAssignedNotification {
  taskId: string;
  assigneeId: string;
  assigneeName: string;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}