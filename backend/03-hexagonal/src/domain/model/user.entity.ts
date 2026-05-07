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

  // Domain method to get user without password
  toPublic() {
    const { password, ...publicUser } = this;
    return publicUser;
  }
}
