export class CreateTaskDto {
  title: string;
  description?: string;
  projectId: string;
  userId: string; // for authorization
}

export class CreateTaskResultDto {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  dueDate: Date | null;
  projectId: string;
  assigneeId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
