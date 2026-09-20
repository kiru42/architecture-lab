import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateProjectRequestDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsBoolean()
  archived?: boolean;
}
