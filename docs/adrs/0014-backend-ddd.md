# ADR-0014: Backend #5 — Domain-Driven Design (DDD)

**Status:** Accepted
**Date**: 2026-05-07  
**Decision Makers**: Architecture Lab Team  
**Tags**: `backend`, `ddd`, `bounded-contexts`, `cqrs`, `event-driven`

---

## Context

After implementing **3 "clean" architectures** (Clean, Hexagonal, Onion), we found that they are **structurally identical** (ADR-0013).

**Question**: how do we manage **business complexity** beyond simple layer separation?

**Domain-Driven Design** (Evans, 2003) proposes a different approach:
- Focus on the **domain model** (not on technical layers)
- **Bounded Contexts** to isolate subdomains
- **Tactical Patterns**: Aggregates, Value Objects, Domain Events
- **Strategic Patterns**: Context Mapping, Anti-Corruption Layer

---

## Decision

Implement a **tactical DDD** architecture with:

1. **3 Bounded Contexts**: `UserManagement`, `ProjectManagement`, `TaskManagement`
2. **Shared Kernel**: shared Value Objects (`Email`, `EntityId`)
3. **Aggregates**: `User`, `Project`, `Task` (aggregate roots)
4. **Value Objects**: `UserId`, `ProjectId`, `TaskId`, `TaskStatus`, `ProjectName`, etc.
5. **Domain Events**: `UserRegisteredEvent`, `ProjectCreatedEvent`, `TaskCompletedEvent`
6. **CQRS**: Commands (write) + Queries (read) via `@nestjs/cqrs`
7. **Event-Driven**: events published via `EventBus` after persistence

---

## Architecture

### Structure (Bounded Contexts)

```
src/
├── shared-kernel/              # Code shared across all contexts
│   └── domain/
│       ├── aggregate-root.ts
│       ├── events/domain-event.ts
│       └── value-objects/
│           ├── email.vo.ts
│           └── entity-id.vo.ts
│
├── contexts/
│   ├── user-management/        # BC #1 : Auth + User profiles
│   │   ├── domain/             # Aggregates, VOs, Events, Repositories
│   │   ├── application/        # Commands + Queries (CQRS)
│   │   └── infrastructure/     # Prisma repos, Hash/JWT, Controllers
│   │
│   ├── project-management/     # BC #2 : Projects ownership
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   │
│   └── task-management/        # BC #3 : Task workflow
│       ├── domain/
│       ├── application/
│       └── infrastructure/
│
└── app.module.ts
```

### DDD Tactical Patterns

| Pattern | Implementation |
|---------|----------------|
| **Aggregate** | `User`, `Project`, `Task` — transactional consistency + factory methods |
| **Value Object** | `Email`, `UserId`, `TaskStatus` — immutable + self-validating |
| **Domain Event** | `UserRegisteredEvent`, `TaskCompletedEvent` — published via EventBus |
| **Repository** | Interfaces in Domain (`IUserRepository`), Prisma implementation in Infra |
| **CQRS** | Commands (write) vs Queries (read) — separate handlers |
| **Shared Kernel** | Shared VOs (`Email`, `EntityId`) + base classes (`AggregateRoot`, `DomainEvent`) |

### Example Flow (Register User)

```typescript
// 1. HTTP Controller receives RegisterDto
@Post('register')
async register(@Body() dto: RegisterDto) {
  const userId = await this.commandBus.execute(
    new RegisterUserCommand(dto.email, dto.password, dto.name)
  );
  return { userId };
}

// 2. RegisterUserHandler (Application Layer)
async execute(cmd: RegisterUserCommand): Promise<string> {
  const email = Email.create(cmd.email);            // VO validation
  const userId = UserId.generate();                 // Type-safe ID
  const hashedPwd = HashedPassword.fromHash(
    await this.hashService.hash(cmd.password)
  );
  const name = UserName.create(cmd.name);

  // 3. User Aggregate (Domain Layer)
  const user = User.register(userId, email, hashedPwd, name);
  // → Aggregate emits UserRegisteredEvent internally

  // 4. Save via Repository
  await this.userRepository.save(user);

  // 5. Publish Domain Events
  user.getDomainEvents().forEach((e) => this.eventBus.publish(e));
  user.clearDomainEvents();

  return userId.getValue();
}

// 6. PrismaUserRepository (Infrastructure Layer)
async save(user: User): Promise<void> {
  await this.prisma.user.upsert({
    where: { id: user.getId().getValue() },
    create: {
      id: user.getId().getValue(),
      email: user.getEmail().getValue(),
      hashedPassword: user.getHashedPassword().getValue(),
      name: user.getName().getValue(),
    },
    update: { ... }
  });
}
```

**Flow**:
1. DTO → Command
2. Command → Aggregate (domain logic)
3. Aggregate → Repository (persistence)
4. Events → EventBus (notification)

---

## Implementation Metrics

| Metric | Value | Comparison (#1 Layered) |
|----------|--------|--------------------------|
| **Total LOC** | ~2,100 | +130% |
| **Domain LOC** | ~800 | N/A (no pure domain in Layered) |
| **Files** | 62 | +110% (vs 29) |
| **Tests** | 10 (aggregates + VOs) | -64% (vs 28, but domain-focused) |
| **LOC/feature** | ~250 | +150% (vs 100) |
| **Time to first feature** | ~3.5h | +133% (vs 1.5h) |
| **Bounded Contexts** | 3 | 0 (Layered = unified monolith) |
| **Value Objects** | 8 | 0 (primitive types) |
| **Domain Events** | 3 | 0 |
| **CQRS Handlers** | 8 (5 Commands, 3 Queries) | 0 (mixed services) |

---

## Trade-offs Analysis

### ✅ Advantages

#### 1. **Isolation per Bounded Context**
- Each context has its **own model** + **ubiquitous language**
- **Independent evolution**: modify the User context without touching the Task context
- **Future microservices**: easy to extract a context into a separate service

#### 2. **Type Safety via Value Objects**
```typescript
// ❌ Before (primitive types)
function assignTask(userId: string, taskId: string) { ... }
assignTask(taskId, userId); // BUG: swapped params, compiles fine !!!

// ✅ After (Value Objects)
function assignTask(userId: UserId, taskId: TaskId) { ... }
assignTask(taskId, userId); // ❌ TypeScript error : incompatible types
```

#### 3. **Automatic Validation**
```typescript
// ❌ Before
const email = dto.email; // may be invalid!

// ✅ After
const email = Email.create(dto.email); // throws if invalid
```

#### 4. **Domain Events = Decoupling**
```typescript
// Example: send a welcome email on UserRegisteredEvent
@EventsHandler(UserRegisteredEvent)
export class SendWelcomeEmailHandler {
  async handle(event: UserRegisteredEvent) {
    await this.emailService.sendWelcome(event.email);
  }
}
```
**Advantage**: the `UserManagement` context does not know about `EmailService` → loose coupling.

#### 5. **Pure Domain Testability**
```typescript
// Tests without mocks, without a DB, without frameworks
it('should complete task and emit event', () => {
  const task = Task.create(...);
  task.complete();
  expect(task.getStatus().getValue()).toBe('DONE');
  expect(task.getDomainEvents()).toHaveLength(1);
});
```

#### 6. **CQRS = Read/Write Optimization**
- Commands: write to Postgres (ACID)
- Queries: can read from Redis/ElasticSearch (search-optimized)
- **Flexibility**: each side can evolve independently

#### 7. **Business Language**
```typescript
// ❌ Before (tech-centric)
userService.update({ status: 'active' });

// ✅ After (business-centric)
user.activate(); // explicit business method
```

### ❌ Disadvantages

#### 1. **Over-Engineering for simple CRUD**
- **250 LOC per feature** (vs 100 in Layered)
- Mapping layers: `DTO → Command → Aggregate → DB Model`
- **Negative ROI** if the domain is trivial

#### 2. **Learning Curve**
- Requires understanding DDD (Evans' book = 560 pages)
- Risque de **DDD Cargo Cult**: applying the patterns without understanding the "why"
- Junior team → confusion

#### 3. **Verbosity**
```typescript
// ❌ Simple case (Layered)
const user = await prisma.user.create({ data: dto });

// ✅ DDD (7+ steps)
const email = Email.create(dto.email);
const userId = UserId.generate();
const hashedPwd = HashedPassword.fromHash(...);
const name = UserName.create(dto.name);
const user = User.register(userId, email, hashedPwd, name);
await repository.save(user);
eventBus.publish(...);
```

#### 4. **Framework-Specific Dependencies**
- `@nestjs/cqrs`: lock-in NestJS
- `@nestjs/event-emitter`: not portable to Express/Fastify without refactoring

#### 5. **Context Synchronization Complexity**
**Problem**: what if `TaskManagement` needs to know whether a `Project` exists?

**Solutions**:
1. **Anti-Corruption Layer**: `TaskManagement` queries `ProjectManagement` via API
2. **Shared Events**: `TaskManagement` listens to `ProjectCreatedEvent`
3. **Duplication**: `TaskManagement` keeps a copy of `{ projectId, projectName }`

**Trade-off**: increased complexity.

#### 6. **Performance Overhead**
- Creation of many objects (VOs, Events, Commands)
- Heavier Garbage Collection load
- Real profiling needed (hypothesis: ~5-10% overhead vs Layered)

---

## Comparison: DDD vs Clean/Hexagonal/Onion

| Aspect | Clean/Hexagonal/Onion | **DDD** |
|--------|----------------------|---------|
| **Focus** | Separation by **technical layers** | Separation by **business domains** |
| **Isolation** | Layers (UI, Domain, Infra) | **Bounded Contexts** (User, Project, Task) |
| **Entities** | Anemic Entities (data bags) | **Rich Aggregates** (behavior + invariants) |
| **IDs** | `string` primitives | **Value Objects** (`UserId`, `ProjectId`) |
| **Validation** | In Use Cases | **In Value Objects** (impossible to create an invalid state) |
| **Events** | ❌ Absents | ✅ **Domain Events** (decoupling via pub/sub) |
| **CQRS** | ❌ No separation | ✅ **Commands vs Queries** |
| **Scalability** | Good (layers) | **Excellent** (isolated contexts → microservices) |
| **Complexity** | Medium | **High** |
| **Use Case** | Mid-size apps (10-50 features) | **Complex domains** (50+ features, multiple subdomains) |

**Conclusion**: DDD **complements** Clean/Hexagonal/Onion; it does not replace them.

---

## When to Use DDD

### ✅ **USE DDD** (Strategic + Tactical Patterns)

1. **Complex business domain**
   - Multiple interdependent business rules
   - Complex workflows (e.g. e-commerce, insurance, banking)
   - Domain expertise required

2. **Long-lived application**
   - 5+ year lifespan
   - Continuous evolution (regular feature additions)

3. **Organizational scalability**
   - Multiple teams (1 team = 1 context)
   - Future microservices envisaged

4. **Experienced team**
   - Senior devs who know DDD
   - Time for learning if the team is junior

### ⚠️ **USE DDD (Strategic) + Clean/Hexagonal (Tactical)**

If the domain is **moderately complex**:
- Bounded Contexts (DDD strategic)
- But **no VOs/Aggregates** (too verbose)
- Keep Clean Architecture inside each context

### ❌ **AVOID DDD** (Use Layered/Clean)

1. **CRUD simple**
   - Admin panel, backoffice
   - Forms → DB (no business logic)

2. **MVP / Prototype**
   - Time-to-market critique
   - Need for velocity (DDD = 2x slower at the start)

3. **Junior team without training**
   - Risk of misapplied DDD (worse than no DDD)

4. **Trivial domain**
   - No complex business rules
   - Logic = basic validation

---

## Lessons Learned

### 1. **DDD ≠ Technical Architecture**
- DDD is a **domain modeling approach**
- Can be combined with Clean/Hexagonal/Onion
- Does not replace good technical practices (SOLID, testing, etc.)

### 2. **Bounded Contexts > Layers**
- **Layers** = technical isolation (UI, Domain, DB)
- **Contexts** = **business** isolation (User, Project, Task)
- Contexts enable **independent evolution** (team scalability)

### 3. **Value Objects = Defensive Coding++**
```typescript
// ❌ Without VOs
function transfer(fromId: string, toId: string, amount: number) {
  if (amount < 0) throw ... // validation repeated everywhere
  if (!fromId) throw ...
  // ...
}

// ✅ With VOs
function transfer(from: AccountId, to: AccountId, amount: Money) {
  // Impossible to call with invalid values!
  // Validation centralized in VOs
}
```

### 4. **Aggregates = Consistency Boundaries**
- 1 Aggregate = 1 transaction
- **Anti-pattern**: loading several aggregates in 1 transaction
- **Correct**: events + eventual consistency

### 5. **Events = Decoupling Superpowers**
```typescript
// ❌ Tight coupling
class UserService {
  async register(dto) {
    await this.db.save(user);
    await this.emailService.send(...); // coupling!
    await this.analyticsService.track(...); // coupling!
  }
}

// ✅ Decoupling via events
class UserService {
  async register(dto) {
    const user = User.register(...);
    await this.repo.save(user);
    this.eventBus.publish(new UserRegisteredEvent(...));
    // EmailService + Analytics listen to the event → 0 coupling
  }
}
```

### 6. **CQRS ≠ Event Sourcing**
- **CQRS**: separate Commands (write) and Queries (read)
- **Event Sourcing**: store events instead of state
- **DDD #5**: CQRS **without** Event Sourcing (queries read the regular DB)
- **Backend #6**: CQRS **with** Event Sourcing (queries rebuild from events)

---

## Next Steps

### Backend #6: CQRS + Event Sourcing
- Event Store (events = source of truth)
- Read Models (projections depuis events)
- Temporal queries ("system state as of 01/01/2025")

### Backend #7: Modular Monolith
- Bounded Contexts (comme DDD)
- But **decoupled modules** within a single process
- No microservices (avoid a distributed monolith)

---

## References

### Books
- **Eric Evans** — "Domain-Driven Design" (2003): the foundational book (560 pages)
- **Vaughn Vernon** — "Implementing Domain-Driven Design" (2013): practical guide
- **Vaughn Vernon** — "Domain-Driven Design Distilled" (2016): concise version (176 pages)

### Articles
- **Martin Fowler**: [BoundedContext](https://martinfowler.com/bliki/BoundedContext.html)
- **Martin Fowler**: [AggregateRoot](https://martinfowler.com/bliki/DDD_Aggregate.html)
- **Khalil Stemmler**: [Domain-Driven Design w/ TypeScript](https://khalilstemmler.com/articles/categories/domain-driven-design/)

### NestJS
- [NestJS CQRS](https://docs.nestjs.com/recipes/cqrs)
- [NestJS EventEmitter](https://docs.nestjs.com/techniques/events)

---

## Verdict

### ✅ **DDD is Worth It** IF:
- Complex domain (e-commerce, fintech, healthcare)
- Long-term project (5+ years)
- Experienced team (or time to learn)
- Multiple teams (1 context = 1 team)

### ❌ **DDD is Overkill** IF:
- CRUD app (admin panel)
- MVP / prototype
- Junior team without DDD training
- Trivial domain (no complex rules)

### 🎯 **Sweet Spot**:
- Use **DDD Strategic** (Bounded Contexts) for organization
- Use **DDD Tactical** (Aggregates, VOs, Events) only in **complex contexts**
- Simpler contexts → Clean Architecture without full DDD

---

**Date**: 2026-05-07  
**Status**: ✅ Implemented — 10/10 tests passing, build successful  
**LOC**: 2,100 (domain: 800)  
**Next**: Backend #6 (CQRS + Event Sourcing)
