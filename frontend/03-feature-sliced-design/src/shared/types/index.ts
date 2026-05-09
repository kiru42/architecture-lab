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
  description: string;
  projectId: string;
  assigneeId?: string;
  dueDate?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: string;
}

export interface CreateCommentDto {
  content: string;
  taskId: string;
}
