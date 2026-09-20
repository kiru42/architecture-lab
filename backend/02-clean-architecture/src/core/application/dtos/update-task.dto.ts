export class UpdateTaskDto {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: Date;
  assigneeId?: string;
}
