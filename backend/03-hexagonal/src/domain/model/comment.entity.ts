// Domain Entity: Comment
export class Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    content: string;
    taskId: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.content = data.content;
    this.taskId = data.taskId;
    this.authorId = data.authorId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
