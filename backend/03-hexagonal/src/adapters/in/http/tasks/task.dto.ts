import { IsString, IsOptional, IsEnum, IsDateString, MinLength } from 'class-validator';
import { TaskPriority } from '../../../../domain';

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @IsString()
  projectId: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class AssignTaskDto {
  @IsString()
  assignedToId: string;
}
