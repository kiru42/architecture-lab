import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';
import { TaskPriority } from '../../../core/domain/entities/task.entity';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

export class AssignTaskDto {
  @IsUUID()
  assignedToId: string;
}
