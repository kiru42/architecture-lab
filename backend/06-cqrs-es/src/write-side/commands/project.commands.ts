export class CreateProjectCommand {
  constructor(
    public readonly projectId: string,
    public readonly name: string,
    public readonly userId: string,
  ) {}
}

export class UpdateProjectCommand {
  constructor(
    public readonly projectId: string,
    public readonly userId: string,
    public readonly changes: { name?: string; archived?: boolean },
  ) {}
}
