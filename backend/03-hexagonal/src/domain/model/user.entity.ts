// Domain Entity: User
export class User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    email: string;
    password: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
    this.name = data.name;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * The only representation of a user allowed to leave the application.
   * The projection is built field by field, so the password hash is not merely
   * omitted from the JSON — it is not reachable here at all.
   */
  toPublic(): { id: string; email: string; name: string; createdAt: Date; updatedAt: Date } {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
