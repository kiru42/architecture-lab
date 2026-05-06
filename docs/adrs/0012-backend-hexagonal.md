# ADR 0012: Backend Implementation - Hexagonal Architecture

## Status
Accepted

## Context
We are implementing backend #3 using Hexagonal Architecture (Ports & Adapters pattern) to compare with:
- Backend #1: Traditional Layered/N-tier Architecture
- Backend #2: Clean Architecture

The goal is to understand the practical differences between these patterns in a real-world NestJS implementation.

## Decision

### Architecture: Hexagonal (Ports & Adapters)

The hexagonal architecture organizes code around:
1. **Domain Core (Hexagon)**: Business entities and port interfaces
2. **Primary Ports**: Interfaces for driving the app (use cases)
3. **Secondary Ports**: Interfaces for infrastructure dependencies
4. **Primary Adapters**: Implementations that call the app (HTTP, WebSocket)
5. **Secondary Adapters**: Implementations of infrastructure (databases, APIs)

### Structure

```
src/
├── domain/
│   ├── model/                    # Domain entities
│   └── ports/
│       ├── primary/              # Use case interfaces
│       └── secondary/            # Repository interfaces
├── application/
│   └── use-cases/                # Primary port implementations
├── adapters/
│   ├── primary/
│   │   ├── http/                 # Controllers
│   │   └── websocket/            # Gateways
│   └── secondary/
│       └── persistence/          # Repository implementations
└── main.ts
```

### Key Principles

1. **Dependency Inversion**: All dependencies point inward to domain
2. **Port Interfaces**: Explicit contracts at boundaries
3. **Adapter Pattern**: Swap implementations without changing core
4. **Separation of Concerns**: Clear distinction between driving and driven

## Implementation Details

### Domain Layer
- **Entities**: Pure business objects with domain logic
- **Primary Ports**: Interfaces defining what the app can do
- **Secondary Ports**: Interfaces defining what the app needs

Example:
```typescript
// domain/ports/primary/create-task.usecase.interface.ts
export interface ICreateTaskUseCase {
  execute(data: CreateTaskData): Promise<Task>;
}

// domain/ports/secondary/task.repository.interface.ts
export interface ITaskRepository {
  create(data: TaskData): Promise<Task>;
  findById(id: string): Promise<Task | null>;
}
```

### Application Layer
- **Use Cases**: Implement primary port interfaces
- Orchestrate domain entities and secondary ports
- Contain application-specific business rules

Example:
```typescript
@Injectable()
export class CreateTaskUseCase implements ICreateTaskUseCase {
  constructor(
    @Inject(ITaskRepository)
    private readonly taskRepository: ITaskRepository,
    @Inject(IProjectRepository)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(data: CreateTaskData): Promise<Task> {
    // Verify project exists and authorization
    const project = await this.projectRepository.findById(data.projectId);
    if (!project || project.userId !== data.userId) {
      throw new ForbiddenException();
    }
    
    return await this.taskRepository.create(data);
  }
}
```

### Adapters Layer

**Primary Adapters** (driving the app):
```typescript
@Controller()
export class TasksController {
  constructor(
    @Inject(ICreateTaskUseCase)
    private readonly createTaskUseCase: ICreateTaskUseCase,
  ) {}

  @Post('projects/:id/tasks')
  async create(@Body() dto: CreateTaskDto, @Param('id') projectId: string) {
    return await this.createTaskUseCase.execute({
      ...dto,
      projectId,
    });
  }
}
```

**Secondary Adapters** (driven by the app):
```typescript
@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaService) {}
  
  async create(data: TaskData): Promise<Task> {
    const task = await this.prisma.task.create({ data });
    return new Task(task);
  }
}
```

## Differs from Clean Architecture

### Honest Comparison

After implementing both, here are the **actual differences** in code:

#### 1. **Terminology & Mental Model**

**Hexagonal:**
- Thinks in terms of "ports" (interfaces) and "adapters" (implementations)
- Emphasizes the "hexagon" metaphor: domain at center, adapters plug in
- Explicitly names "primary" (driving) vs "secondary" (driven) ports

**Clean:**
- Thinks in terms of concentric circles with dependency rule
- Uses terms like "use cases", "entities", "gateways"
- Emphasizes layers: entities → use cases → interface adapters → frameworks

**In Practice**: Both are just different visualizations of the same dependency inversion principle. The actual code structure is nearly identical.

#### 2. **Use Case Interfaces (Primary Ports)**

**Hexagonal** ✅:
- Explicitly defines `ICreateTaskUseCase` interfaces
- Controllers depend on these interfaces
- Clear contract: "this is what you can ask the app to do"

```typescript
// Explicit interface
export interface ICreateTaskUseCase {
  execute(data: CreateTaskData): Promise<Task>;
}

// Controller depends on interface
constructor(@Inject(ICreateTaskUseCase) private useCase: ICreateTaskUseCase)
```

**Clean Architecture** ❌:
- Often skips use case interfaces
- Controllers directly inject concrete use case classes
- Justification: "use cases are already application-specific, so interfaces add little value"

```typescript
// No interface, direct dependency
constructor(private readonly createTaskUseCase: CreateTaskUseCase)
```

**Reality Check**: In our Clean Architecture implementation (backend #2), we also used interfaces for consistency. So this difference only exists in "pure" Clean Architecture interpretations.

#### 3. **Directory Organization**

**Hexagonal:**
```
src/
├── domain/
│   ├── model/
│   └── ports/
│       ├── primary/      # Use case interfaces
│       └── secondary/    # Repository interfaces
├── application/
│   └── use-cases/        # Use case implementations
└── adapters/
    ├── primary/          # HTTP, WebSocket
    └── secondary/        # Prisma, external APIs
```

**Clean:**
```
src/
├── domain/
│   ├── entities/
│   └── repositories/     # Repository interfaces (only secondary)
├── application/
│   └── use-cases/        # Use case implementations (no interfaces)
└── infrastructure/
    ├── http/
    ├── websocket/
    └── persistence/
```

**Difference**:
- Hexagonal explicitly separates primary/secondary ports
- Clean merges them or only focuses on secondary (repository) interfaces

**Honest Take**: This is mostly a naming/organization preference. Both enforce the same dependency rule.

#### 4. **Framework Independence**

Both patterns claim "framework independence," but in practice:

**Hexagonal:**
- Uses NestJS decorators (`@Injectable`, `@Controller`) in adapters
- Domain and use cases are "pure" TypeScript (no decorators)

**Clean:**
- Same! Uses NestJS in infrastructure, pure TypeScript in domain/use cases

**Verdict**: No practical difference. Both are "framework-independent" in the same way.

#### 5. **What Collapsed to the Same Thing**

In our implementation, these concepts are **identical**:

| Hexagonal | Clean Architecture | Actual Code |
|-----------|-------------------|-------------|
| Domain Model | Entities | Pure TypeScript classes |
| Primary Ports | Use Case Interfaces | TypeScript interfaces (if used) |
| Secondary Ports | Gateway Interfaces | TypeScript interfaces |
| Primary Adapters | Controllers | NestJS controllers |
| Secondary Adapters | Gateways/Repositories | Prisma repositories |
| Use Cases | Use Cases | Same class structure |

### The Honest Truth

**These patterns are ~95% the same in practice.**

The differences are:
1. **Terminology**: "Ports & Adapters" vs "Entities & Use Cases"
2. **Visualization**: Hexagon vs Concentric Circles
3. **Primary Port Interfaces**: Hexagonal makes them explicit, Clean often omits them

Both achieve:
- ✅ Dependency inversion (dependencies point inward)
- ✅ Testability (easy to mock dependencies)
- ✅ Separation of concerns (domain, application, infrastructure)
- ✅ Framework independence (in theory, same in practice)

**When to use Hexagonal over Clean:**
- You want explicit interfaces for ALL boundaries (primary + secondary)
- You like the "ports and adapters" mental model
- You're building a system with many different types of drivers (HTTP, CLI, message queue, etc.)

**When to use Clean over Hexagonal:**
- You prefer the "concentric circles" visualization
- You're okay with use cases being concrete classes (no interfaces)
- You like Uncle Bob's terminology

## Comparison to Layered Architecture

### vs. Backend #1 (Layered)

| Aspect | Layered | Hexagonal |
|--------|---------|-----------|
| **Structure** | Horizontal layers | Core + Adapters |
| **Dependencies** | Top-down (Controller → Service → Repository) | Inward to domain |
| **Interfaces** | Optional | Mandatory at boundaries |
| **Domain Logic** | Mixed in services | Isolated in domain |
| **Testability** | Requires database mocks | Easy to test in isolation |
| **Flexibility** | Tight coupling to framework | Adapters are swappable |

## Consequences

### Benefits
1. **Explicit Contracts**: Port interfaces make expectations clear
2. **Testability**: Domain logic easily tested without infrastructure
3. **Flexibility**: Can swap adapters (HTTP → gRPC, Prisma → TypeORM)
4. **Screaming Architecture**: Structure tells you what the app does

### Drawbacks
1. **More Boilerplate**: Every boundary needs an interface
2. **Indirection**: More files to navigate (interface → implementation)
3. **Overkill for Simple CRUD**: Extra layers may not add value
4. **Learning Curve**: Developers need to understand ports/adapters concept

### When to Use
- ✅ Complex domain logic that needs isolation
- ✅ Multiple types of clients (HTTP, CLI, message queue)
- ✅ High testability requirements
- ✅ Long-lived projects where flexibility matters

### When NOT to Use
- ❌ Simple CRUD applications
- ❌ Prototypes or MVPs
- ❌ Small teams unfamiliar with the pattern
- ❌ Time-constrained projects

## Notes

### Dependency Injection
NestJS providers wire adapters to ports:
```typescript
{
  provide: ITaskRepository,
  useClass: TaskRepository,
}
```

This allows:
- Testing with mocks
- Swapping implementations at runtime
- Clear separation of concerns

### Domain Events
Could be added as another secondary port:
```typescript
export interface IEventPublisher {
  publish(event: DomainEvent): Promise<void>;
}
```

### Validation
Handled at adapter layer (DTOs with class-validator) to keep domain pure.

## References
- [Hexagonal Architecture (Alistair Cockburn)](https://alistair.cockburn.us/hexagonal-architecture/)
- [Clean Architecture (Robert Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- Backend #1 ADR: `0010-backend-layered.md`
- Backend #2 ADR: `0011-backend-clean.md` (if exists)
