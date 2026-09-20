export class CreateCommentDto {
  content: string;
  taskId: string;
  userId: string;
}

export class DeleteCommentDto {
  commentId: string;
  userId: string;
}

export class ListCommentsDto {
  taskId: string;
  userId: string;
}
