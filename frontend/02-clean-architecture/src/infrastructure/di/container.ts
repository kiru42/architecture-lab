import {
  HttpAuthRepository,
  HttpProjectRepository,
  HttpTaskRepository,
  HttpCommentRepository,
} from '@infrastructure/repositories';

import {
  SignUpUseCase,
  SignInUseCase,
  GetProfileUseCase,
  SignOutUseCase,
  IsAuthenticatedUseCase,
  ListProjectsUseCase,
  CreateProjectUseCase,
  UpdateProjectUseCase,
  ListTasksUseCase,
  CreateTaskUseCase,
  UpdateTaskUseCase,
  ToggleTaskCompletionUseCase,
  ListCommentsUseCase,
  CreateCommentUseCase,
  DeleteCommentUseCase,
} from '@application/use-cases';

// Singleton repositories
const authRepository = new HttpAuthRepository();
const projectRepository = new HttpProjectRepository();
const taskRepository = new HttpTaskRepository();
const commentRepository = new HttpCommentRepository();

// DI container factory
export const container = {
  // Auth use cases
  signUpUseCase: () => new SignUpUseCase(authRepository),
  signInUseCase: () => new SignInUseCase(authRepository),
  getProfileUseCase: () => new GetProfileUseCase(authRepository),
  signOutUseCase: () => new SignOutUseCase(authRepository),
  isAuthenticatedUseCase: () => new IsAuthenticatedUseCase(authRepository),

  // Project use cases
  listProjectsUseCase: () => new ListProjectsUseCase(projectRepository),
  createProjectUseCase: () => new CreateProjectUseCase(projectRepository),
  updateProjectUseCase: () => new UpdateProjectUseCase(projectRepository),

  // Task use cases
  listTasksUseCase: () => new ListTasksUseCase(taskRepository),
  createTaskUseCase: () => new CreateTaskUseCase(taskRepository),
  updateTaskUseCase: () => new UpdateTaskUseCase(taskRepository),
  toggleTaskCompletionUseCase: () => new ToggleTaskCompletionUseCase(taskRepository),

  // Comment use cases
  listCommentsUseCase: () => new ListCommentsUseCase(commentRepository),
  createCommentUseCase: () => new CreateCommentUseCase(commentRepository),
  deleteCommentUseCase: () => new DeleteCommentUseCase(commentRepository),
};
