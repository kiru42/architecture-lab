import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateProjectDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  archived?: boolean;
}
