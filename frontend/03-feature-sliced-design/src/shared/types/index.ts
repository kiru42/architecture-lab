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
  description: string;
  completed: boolean;
  dueDate: string | null;
  projectId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SignUpDto {
  email: string;
  name: string;
  password: string;
}

export interface SignInDto {
  email: string;
  password: string;
}

export interface CreateProjectDto {
  name: string;
}

export interface UpdateProjectDto {
  name?: string;
  archived?: boolean;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  dueDate?: string;
  assigneeId?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: string;
  assigneeId?: string;
}

/**
 * `POST /tasks/{id}/comments` takes `content` and nothing else: the task is the
 * path parameter. The backend runs a forbidNonWhitelisted ValidationPipe, so an
 * extra `taskId` field is a 400 rather than an ignored key.
 */
export interface CreateCommentDto {
  content: string;
}

/**
 * Emitted by the gateway on the `task.assigned` channel (see the note at the
 * bottom of shared/openapi.yaml). It carries no task title, only the id.
 */
export interface TaskAssignedNotification {
  taskId: string;
  assigneeId: string;
  assigneeName: string;
}
