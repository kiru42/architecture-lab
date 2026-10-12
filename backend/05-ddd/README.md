# Backend #5: Domain-Driven Design (DDD)

**Tactical DDD architecture with Bounded Contexts, Aggregates, Value Objects, and Domain Events.**

---

## 📐 Architecture Overview

This implementation follows the **DDD tactical patterns** (Evans, 2003):

```
src/
├── shared-kernel/              # Code shared across all contexts
│   └── domain/
│       ├── aggregate-root.ts   # Base class for Aggregates
│       ├── events/
│       │   └── domain-event.ts # Base for Domain Events
│       └── value-objects/
│           ├── email.vo.ts     # Email VO (shared)
│           └── entity-id.vo.ts # Base for all IDs
│
├── contexts/
│   ├── user-management/        # Bounded Context #1
│   │   ├── domain/
│   │   │   ├── aggregates/     # User Aggregate
│   │   │   ├── value-objects/  # UserId, UserName, HashedPassword
│   │   │   ├── events/         # UserRegisteredEvent
│   │   │   └── repositories/   # IUserRepository interface
│   │   ├── application/
│   │   │   ├── commands/       # RegisterUser, LoginUser
│   │   │   └── queries/        # GetUser
│   │   └── infrastructure/
│   │       ├── persistence/    # PrismaUserRepository, Hash/JWT services
│   │       └── http/           # AuthController
│   │
│   ├── project-management/     # Bounded Context #2
│   │   ├── domain/
│   │   │   ├── aggregates/     # Project Aggregate
│   │   │   ├── value-objects/  # ProjectId, ProjectName
│   │   │   ├── events/         # ProjectCreatedEvent
│   │   │   └── repositories/   # IProjectRepository
│   │   ├── application/
│   │   │   ├── commands/       # CreateProject
│   │   │   └── queries/        # GetProjects
│   │   └── infrastructure/
│   │       ├── persistence/    # PrismaProjectRepository
│   │       └── http/           # ProjectsController
│   │
│   └── task-management/        # Bounded Context #3
│       ├── domain/
│       │   ├── aggregates/     # Task Aggregate
│       │   ├── value-objects/  # TaskId, TaskStatus
│       │   ├── events/         # TaskCompletedEvent
│       │   └── repositories/   # ITaskRepository
│       ├── application/
│       │   ├── commands/       # CreateTask, CompleteTask
│       │   └── queries/        # GetTasks
│       └── infrastructure/
│           ├── persistence/    # PrismaTaskRepository
│           └── http/           # TasksController
│
└── app.module.ts               # NestJS root module
```

---

## 🏛️ DDD Concepts Implemented

### 1. **Bounded Contexts**
Each context has its own **ubiquitous language** and **isolated domain model**:
- `UserManagement`: authentication + user profiles management
- `ProjectManagement`: project management + ownership
- `TaskManagement`: task management + statuses

**Strong isolation**: each context can evolve independently.

### 2. **Aggregates** (Aggregate Roots)
Les **Aggregates** guarantee **transactional consistency**:
- `User`: single entry point for modifying a user
- `Project`: single entry point for modifying a project
- `Task`: single entry point for modifying a task

All modifications go through **aggregate methods** (no public setters).

### 3. **Value Objects** (Value Objects)
**Immutable** + **self-validating**:
- `Email`: email format validation
- `UserId`, `ProjectId`, `TaskId`: type-safe IDs (no raw strings)
- `UserName`, `ProjectName`: length validation
- `TaskStatus`: typed enum (TODO/IN_PROGRESS/DONE)
- `HashedPassword`: hash validation

**Benefit**: it is impossible to create an invalid state.

### 4. **Domain Events** (Domain Events)
Aggregates **emit events** to signal important changes:
- `UserRegisteredEvent`: new user created
- `ProjectCreatedEvent`: new project created
- `TaskCompletedEvent`: task completed

Events are **published via the EventBus** after persistence (simplified Outbox pattern).

### 5. **Repositories**
**Interfaces defined in the Domain**, implemented in Infrastructure:
- `IUserRepository` → `PrismaUserRepository`
- `IProjectRepository` → `PrismaProjectRepository`
- `ITaskRepository` → `PrismaTaskRepository`

The domain only knows **the interfaces**, not Prisma.

### 6. **CQRS** (Command Query Responsibility Segregation)
Separation of **Commands** (write) vs **Queries** (read):
- **Commands**: `RegisterUser`, `CreateProject`, `CompleteTask` → modify state
- **Queries**: `GetUser`, `GetProjects`, `GetTasks` → read-only

Implemented via `@nestjs/cqrs` (CommandBus, QueryBus, EventBus).

---

## 📊 Metrics

| Metric | Value |
|----------|--------|
| **Lines of code (domain)** | ~800 LOC |
| **Lines of code (total)** | ~2,100 LOC |
| **Files** | 62 files |
| **Tests** | 10 tests (100% aggregates + VOs) |
| **Contexts** | 3 Bounded Contexts |
| **Aggregates** | 3 (User, Project, Task) |
| **Value Objects** | 8 VOs |
| **Domain Events** | 3 events |
| **CQRS Handlers** | 8 (5 Commands, 3 Queries) |
| **Dependencies** | NestJS + CQRS + EventEmitter |

---

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Copy Prisma client from root
cp -r ../../node_modules/.prisma node_modules/.prisma

# Build
npm run build

# Run tests
npm test

# Start server (port 3005)
npm start
```

---

## 🧪 Testing Strategy

### Domain Layer (10/10 tests)
```bash
npm test
```

**Coverage**:
- ✅ User Aggregate: register + reconstitute + events
- ✅ Project Aggregate: create + update + ownership + events
- ✅ Task Aggregate: create + complete + events + idempotence
- ✅ Email VO: validation + equality

**Philosophy**: test the **business behavior** (aggregates + VOs), not the infrastructure.

---

## 🎯 DDD Tactical Patterns Summary

| Pattern | Implementation |
|---------|----------------|
| **Bounded Context** | 3 isolated contexts (User, Project, Task) |
| **Aggregate** | User, Project, Task with invariants + factory methods |
| **Value Object** | Email, EntityId, UserId, ProjectName, TaskStatus (immutable + validated) |
| **Domain Event** | UserRegistered, ProjectCreated, TaskCompleted (EventBus) |
| **Repository** | Interfaces in Domain, Prisma implementations in Infrastructure |
| **CQRS** | Commands (write) vs Queries (read) via @nestjs/cqrs |
| **Shared Kernel** | Email VO + EntityId VO + DomainEvent base |

---

## 🔍 Comparison with Previous Backends

| Aspect | Layered (#1) | Clean (#2) | Hexagonal (#3) | **DDD (#5)** |
|--------|--------------|------------|----------------|--------------|
| **Contexts** | ❌ Everything mixed together | ❌ No contexts | ❌ No contexts | ✅ 3 isolated contexts |
| **Value Objects** | ❌ Primitive types | ❌ Primitive types | ❌ Primitive types | ✅ 8 typed VOs |
| **Aggregates** | ❌ Anemic entities | ❌ Anemic entities | ❌ Anemic entities | ✅ Rich aggregates |
| **Domain Events** | ❌ None | ❌ None | ❌ None | ✅ 3 events |
| **CQRS** | ❌ Read/write coupled | ❌ Read/write coupled | ❌ Read/write coupled | ✅ Commands/Queries separated |
| **Type Safety IDs** | ❌ `string` everywhere | ❌ `string` everywhere | ❌ `string` everywhere | ✅ UserId, ProjectId, TaskId |
| **Validation** | ⚠️ In controllers | ⚠️ In use cases | ⚠️ In use cases | ✅ In Value Objects |
| **LOC/feature** | ~100 | ~167 | ~167 | **~250** |
| **Complexity** | Low | Medium | Medium | **High** |
| **Scalability** | ⚠️ Fragile monolith | ✅ Good | ✅ Good | ✅ **Excellent** (isolated contexts) |

---

## ✅ Pros

1. **Strong isolation**: each Bounded Context can evolve independently
2. **Type Safety**: it is impossible to pass a `ProjectId` where a `UserId` is expected
3. **Automatic validation**: VOs reject invalid data at construction
4. **Domain events**: traceability + decoupling (e.g. send an email on `UserRegisteredEvent`)
5. **Testability**: 100% pure domain layer (no external dependencies)
6. **Ubiquitous language**: the code reflects the business vocabulary
7. **Evolvability**: easy to extract a context into a microservice later
8. **CQRS**: independent read/write optimization (e.g. separate read DB)

---

## ❌ Cons

1. **Verbosity**: ~250 LOC per feature (vs ~100 in Layered)
2. **Over-engineering**: too complex for a simple CRUD app
3. **Learning curve**: requires a real understanding of DDD
4. **Slow setup**: 3-4h for the 1st feature (vs 1.5h in Layered)
5. **Dependencies**: `@nestjs/cqrs` + `@nestjs/event-emitter` (framework-specific)
6. **Mapping overhead**: DTO → Command → Aggregate → Repository (4 layers)
7. **Not suited to junior teams**: risk of DDD cargo-culting
8. **Context synchronization**: complexity if the User context needs to know about the Project context

---

## 📖 When to Use DDD

### ✅ **USE DDD** if:
- **Complex** business domain (not simple CRUD)
- Need for **scalability** (future microservices)
- Team **experienced** in DDD
- Important domain events (audit, notifications, workflows)
- **Long-term** application (5+ years)

### ❌ **AVOID DDD** if:
- Simple CRUD (admin panel, back office)
- Junior or small team
- Critical time-to-market (prototype, MVP)
- Trivial domain (no complex business rules)

---

## 📚 DDD References

- **Eric Evans**: "Domain-Driven Design" (2003) — the foundational book
- **Vaughn Vernon**: "Implementing Domain-Driven Design" (2013) — practical guide
- **Martin Fowler**: [BoundedContext](https://martinfowler.com/bliki/BoundedContext.html)
- **NestJS CQRS**: [docs.nestjs.com/recipes/cqrs](https://docs.nestjs.com/recipes/cqrs)

---

## 🎓 Key Learnings

1. **DDD ≠ Architecture**: DDD is a domain modeling approach, not a technical architecture
2. **Bounded Contexts > Layers**: isolation by context is stronger than isolation by layers
3. **Value Objects = Defensive Coding**: it is impossible to create an invalid state
4. **Aggregates = Consistency Boundaries**: each aggregate guarantees its own invariants
5. **Events = Decoupling**: events decouple contexts (e.g. the Task context listens to ProjectCreated)
6. **CQRS = Flexibility**: separating read/write allows optimizing each independently

---

**Next Steps**:
- Backend #6 (CQRS + Event Sourcing): push CQRS all the way + event store
- Backend #7 (Modular Monolith): decoupled modules within a single process
