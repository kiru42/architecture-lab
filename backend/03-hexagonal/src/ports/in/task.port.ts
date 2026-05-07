import { Task } from '@domain/index';

export interface CreateTaskCommand {
  title: string;
  description?: string;
  priority: string;
  projectId: string;
  createdById: string;
  dueDate?: Date;
}

export interface AssignTaskCommand {
  taskId: string;
  assignedToId: string;
  projectId: string;
}

export interface UpdateTaskStatusCommand {
  taskId: string;
  status: string;
  userId: string;
}

export interface CreateTaskPort {
  execute(command: CreateTaskCommand): Promise<Task>;
}

export interface AssignTaskPort {
  execute(command: AssignTaskCommand): Promise<Task>;
}

export interface UpdateTaskStatusPort {
  execute(command: UpdateTaskStatusCommand): Promise<Task>;
}

export interface ListTasksByProjectPort {
  execute(projectId: string): Promise<Task[]>;
}
