import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;
}
