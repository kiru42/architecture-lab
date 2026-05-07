export class AssignTaskDto {
  taskId: string;
  assigneeId: string;
  userId: string; // for authorization
}

export class AssignTaskResultDto {
  success: boolean;
}
