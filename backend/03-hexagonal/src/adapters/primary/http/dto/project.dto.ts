import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name: string;
}

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  archived?: boolean;
}
