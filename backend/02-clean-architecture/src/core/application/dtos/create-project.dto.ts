export class CreateProjectDto {
  name: string;
  userId: string;
}

export class CreateProjectResultDto {
  id: string;
  name: string;
  archived: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
