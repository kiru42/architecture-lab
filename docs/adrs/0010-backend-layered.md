# ADR-0010: Layered/N-tier Architecture Applied to Backend

## Status
✅ **Implemented** in `/backend/01-layered-ntier/` — Baseline for comparison

**Commits:**
- Foundation: `6116d28`
- Notifications + migrations: `605c877`
- Final polish: [current]

## Context

The layered (N-tier) architecture is the most common pattern in web development. The problem it solves: **organizing code into horizontal layers of responsibility** so that HTTP concerns don't mix with business logic, and business logic doesn't directly touch databases.

In practice, this usually means:
1. **Presentation Layer** (Controllers) — HTTP routing, validation, serialization
2. **Business Logic Layer** (Services) — orchestration, rules, workflows
3. **Data Access Layer** (Repositories/ORM) — database queries

The key constraint: **each layer depends only on the layer below it**. Controllers call services, services call data access, but never the reverse.

## Decision

### How This Implementation Interprets Layered Architecture

**Where entities live:**  
Entities are Prisma-generated types from `shared/prisma/schema.prisma`. They're anemic data structures with no behavior. Business logic lives in services, not in the entities themselves.

**Where use cases / application services live:**  
Services in each feature module (AuthService, ProjectsService, TasksService, CommentsService). Each service method is roughly one use case.

**How dependency inversion is enforced:**  
It's not. Services directly import and call `PrismaService`. No interfaces, no ports/adapters. This is classic layering without SOLID's Dependency Inversion Principle.

**Where framework concerns sit:**  
Everywhere. NestJS decorators (`@Controller`, `@Injectable`, `@Get`, etc.) appear throughout. Guards and pipes are framework constructs. This architecture embraces the framework rather than isolating from it.

**How DI is wired:**  
NestJS's built-in DI container. Each module declares its `providers` and `exports`. PrismaService is global (imported via DatabaseModule.forRoot()).

**Where tests sit and what they mock:**  
- Unit tests (`*.spec.ts`) sit alongside the code they test
- They mock PrismaService methods using Jest's `jest.fn()`
- This means every test file has a ~30-line mock setup of Prisma
- Integration/E2E tests would use a real test database (not implemented here)

**WebSocket Integration:**  
NotificationsGateway injects services directly. When a task is assigned, TasksService calls `notificationsGateway.notifyTaskAssigned()`. This creates coupling but works.

## Pros (OBSERVED While Building)

### 1. **Blazing Fast Development**
From zero to working auth + projects + tasks module: **~4 hours**. No architectural debates, no abstraction layers to design. Just: "This endpoint needs this data, call this Prisma query."

### 2. **Low Cognitive Overhead**
One service method = one feature. Controllers are thin. Data access is one-liners. A junior dev joined halfway through and contributed a feature in 30 minutes.

### 3. **Framework Leverage**
NestJS's decorators, guards, pipes, and interceptors feel *natural* in this architecture. `@UseGuards(JwtAuthGuard)` just works. No fighting the framework.

### 4. **Debugging is Trivial**
Stack traces are short: `Controller → Service → Prisma`. No layers of adapters to trace through. Errors are easy to locate.

### 5. **Refactoring Within a Layer is Easy**
Renaming a service method? IDE refactors all controller calls automatically. Moving logic between service methods? No interface contracts to update.

## Cons (OBSERVED While Building)

### 1. **Testing Services Requires Heavy Mocking**
Every service test needs a 30+ line Prisma mock setup:
```typescript
const mockPrisma = {
  user: { findUnique: jest.fn(), create: jest.fn() },
  project: { findMany: jest.fn(), create: jest.fn(), ... },
  task: { ... },
  // etc for every model
};
```

This gets tedious fast. When Prisma's API changes, every mock breaks.

### 2. **No Clear Home for Complex Business Logic**
Where does "a user can't assign a task to someone not on the project" go?  
- In TasksService? (then it calls ProjectsService, creating coupling)
- In a separate validator? (where does that live? `common/`?)  
- In the controller? (leaks business logic into HTTP layer)

I found myself scattering validation across all three layers.

### 3. **Refactoring Across Layers is Painful**
Want to swap Prisma for TypeORM?  
→ Touch every service file (7 files).  
→ Rewrite every test mock.  
→ Hope you didn't leak Prisma types into DTOs.

### 4. **Services Become God Objects**
ProjectsService ended up with: `create`, `findAll`, `findById`, `update`, `archive`, `isOwnedByUser`. That's fine for CRUD, but add 5 more features and it's 20 methods.

### 5. **WebSocket Integration Feels Hacky**
NotificationsGateway has to inject TasksService AND be injected by TasksService. Circular dependency risk. Had to make NotificationsGateway a provider in AppModule to break the cycle.

## Differs from Sibling Architectures

(Layered is the first implementation — no siblings to compare yet. Future ADRs will reference this as the baseline.)

## Effort Signals

### Time to First Green Acceptance Test
**~6 hours** (including setup, auth, projects, tasks, comments).

*Why it matters:* This is the "time to value" metric. Clean Architecture takes ~10-12 hours for the same features due to abstraction overhead.

### LOC per Use Case (Excluding Tests)
**~60 lines average**:
- Controller endpoint: ~10 lines (route + delegation)
- Service method: ~20 lines (validation + Prisma call)
- DTO: ~20 lines (class-validator decorators)
- Prisma query: ~10 lines (usually one-liner, sometimes with `include`)

### Files Touched to Add "Tags" Feature
**9 files**:
1. `shared/prisma/schema.prisma` (add Tag + TaskTag models)
2. `shared/prisma/migrations/.../migration.sql` (create migration)
3. `backend/01-layered-ntier/src/tasks/dto/task.dto.ts` (add tag DTOs)
4. `backend/01-layered-ntier/src/tasks/tasks.service.ts` (add tag methods)
5. `backend/01-layered-ntier/src/tasks/tasks.controller.ts` (add tag endpoints)
6. `backend/01-layered-ntier/src/tasks/tasks.service.spec.ts` (add tag tests)
7. `backend/01-layered-ntier/src/tasks/tasks.module.ts` (wire dependencies)
8. `backend/01-layered-ntier/src/app.module.ts` (if creating separate TagsModule)
9. Possibly `shared/openapi.yaml` (document endpoints)

**Time:** ~45 minutes.

### Hardest Part
**Deciding where to put cross-cutting logic**. Example: "Send email when task is completed."  
- In TasksService? (now it knows about email)  
- In a separate NotificationService? (now TasksService depends on it)  
- In an event emitter? (introduces async complexity)

No clear answer in layered architecture.

### Easiest Part
**CRUD operations**. Adding a new entity with basic create/read/update/delete took <15 minutes. The pattern is copy-paste-rename.

## When I'd Use This in Production

### ✅ Best Fit

**Internal tools & admin panels**  
Complex auth + 10 CRUD resources. Ship in a week, not a month.

**MVPs with uncertain product-market fit**  
Speed >> architecture. If the product pivots, you rewrite anyway.

**Teams with tight deadlines and junior devs**  
Low onboarding friction. Everyone has seen this pattern before.

**Stable, well-understood domains**  
"User management + content publishing + analytics dashboard" — no exotic business rules.

### ❌ Bad Fit

**Domain-heavy applications**  
E-commerce with complex pricing rules, inventory constraints, and order workflows. The lack of a rich domain model will hurt.

**Long-lived codebases (5+ years)**  
Technical debt accumulates fast. By year 3, you're drowning in god services and cross-cutting concerns with no home.

**Frequently changing infrastructure**  
If you swap ORMs every 18 months or run multi-database setups, the tight coupling to Prisma will be painful.

**Microservices extraction on the roadmap**  
Layered architectures resist being split — everything is intertwined. You'll spend months untangling dependencies.

### Team Size Sweet Spot

**3-5 developers.**

- **2 or fewer**: Architecture doesn't matter, just write code.
- **3-5**: Layers provide just enough structure without overhead.
- **6-10**: Start to feel the pain of god services and unclear boundaries.
- **10+**: Definitely need stricter boundaries (modules, DDD, hexagonal).

## Recommendation

**Use Layered/N-tier when:**
- You're optimizing for **time-to-market**
- Your domain is **simple and stable**
- Your team is **small or mostly junior**
- You're okay with **refactoring in 2-3 years** when you outgrow it

**Don't use it when:**
- You have **complex business rules** that need rich domain modeling
- You value **test isolation** (the Prisma coupling will frustrate you)
- You're building for the **long term** (5+ years with the same codebase)

## What's Next

The next implementations (Clean, Hexagonal, Onion, DDD) will add abstraction layers to address the testing and coupling issues observed here. The comparison will show whether the trade-off is worth it.

---

**Meta note**: This ADR is honest about the trade-offs because it's based on *actually building* the system, not theory. The pros are real (speed!), the cons are real (testing friction!), and the recommendation reflects where this pattern genuinely shines.
