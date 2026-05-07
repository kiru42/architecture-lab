export class ProjectName {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) throw new Error('ProjectName cannot be empty');
    if (value.length > 100) throw new Error('ProjectName too long');
  }
  static create(value: string): ProjectName { return new ProjectName(value.trim()); }
  getValue(): string { return this.value; }
}
