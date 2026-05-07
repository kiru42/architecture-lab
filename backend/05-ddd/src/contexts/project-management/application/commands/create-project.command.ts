export class CreateProjectCommand {
  constructor(public readonly name: string, public readonly description: string | null, public readonly ownerId: string) {}
}
