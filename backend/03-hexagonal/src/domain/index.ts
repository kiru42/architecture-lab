// The centre of the hexagon.
// Nothing in this folder may import from application/ or adapters/.
export * from './model/user.entity';
export * from './model/project.entity';
export * from './model/task.entity';
export * from './model/comment.entity';

// Driving ports (primary) — what the outside world can ask the application to do
export * from './ports/primary/signup.usecase.interface';
export * from './ports/primary/signin.usecase.interface';
export * from './ports/primary/get-profile.usecase.interface';
export * from './ports/primary/create-project.usecase.interface';
export * from './ports/primary/list-projects.usecase.interface';
export * from './ports/primary/update-project.usecase.interface';
export * from './ports/primary/create-task.usecase.interface';
export * from './ports/primary/list-tasks.usecase.interface';
export * from './ports/primary/update-task.usecase.interface';
export * from './ports/primary/create-comment.usecase.interface';
export * from './ports/primary/list-comments.usecase.interface';
export * from './ports/primary/delete-comment.usecase.interface';

// Driven ports (secondary) — what the application needs from the outside world
export * from './ports/secondary/user.repository.interface';
export * from './ports/secondary/project.repository.interface';
export * from './ports/secondary/task.repository.interface';
export * from './ports/secondary/comment.repository.interface';
