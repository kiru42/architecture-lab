# Backend #7: Modular Monolith

**Strictly isolated business modules in a single deployable unit. Microservice-grade boundaries, without the operational complexity of a distributed system.**

---

## 📐 Architecture Overview

Each **business capability** is isolated in a self-contained module (controller + service + repository + DTO). A global **shared kernel** carries the cross-cutting concerns (Prisma, guards, decorators).

```
src/
├── modules/
│   ├── auth/                    # Authentication (signup / signin / me)
│   │   ├── auth.module.ts       # imports: [PassportModule, JwtModule, UsersModule]
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts      # bcrypt + JWT issuance
│   │   ├── jwt.strategy.ts
│   │   └── dto/                 # SignUpDto, SignInDto
│   │
│   ├── users/                   # User management — INTERNAL module
│   │   ├── users.module.ts      # exports: [UsersService]  (no controller)
│   │   ├── users.service.ts
│   │   └── users.repository.ts
│   │
│   ├── projects/                # Project CRUD + ownership
│   │   ├── projects.module.ts
│   │   ├── projects.controller.ts
│   │   ├── projects.service.ts  # invariant: owner only
│   │   ├── projects.repository.ts
│   │   └── dto/
│   │
│   ├── tasks/                   # Task management + completion
│   │   ├── tasks.module.ts
│   │   ├── tasks.controller.ts
│   │   ├── tasks.service.ts
│   │   ├── tasks.repository.ts
│   │   └── dto/
│   │
│   └── comments/                # Task comments
│       ├── comments.module.ts
│       ├── comments.controller.ts
│       ├── comments.service.ts
│       ├── comments.repository.ts
│       └── dto/
│
├── shared/                      # Shared Kernel — @Global()
│   ├── prisma/prisma.service.ts
│   ├── guards/jwt-auth.guard.ts
│   ├── decorators/current-user.decorator.ts
│   └── shared.module.ts
│
├── app.module.ts                # Root module (imports the 6 modules)
└── main.ts                      # Bootstrap — global ValidationPipe, port 3007

test/                            # 4 unit test suites (23 tests)
├── auth.service.spec.ts
├── projects.service.spec.ts
├── tasks.service.spec.ts
└── comments.service.spec.ts
```

---

## 🧩 Modular Monolith Principles

### 1. **Modules > Layers**
Unlike Layered/Clean/Hexagonal, which split the code **technically** (controller/service/data), the Modular Monolith splits it **by business capability**. A `tasks` module is a vertical mini-app: it owns its HTTP layer, its logic, and its persistence.

### 2. **Each module owns its repository**
The repository is **private to the module** — there is no shared global repository:

```typescript
@Injectable()
export class ProjectsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<Project[]> {
    return this.prisma.project.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }
}
```

### 3. **Global Shared Kernel**
`shared/` is declared `@Global()`: Prisma + guards + decorators are injectable everywhere without an explicit import.

```typescript
@Global()
@Module({ providers: [PrismaService], exports: [PrismaService] })
export class SharedModule {}
```

### 4. **Explicit inter-module communication (DI)**
The only inter-module dependency is **`AuthModule` → `UsersModule`**, through the NestJS module system (no events, no direct access to another module's DB):

```typescript
@Module({
  imports: [PassportModule, JwtModule.registerAsync({ /* ... */ }), UsersModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
```

`UsersModule` stays **internal** (no controller) and exposes only its `UsersService` as its public API:

```typescript
@Module({ providers: [UsersRepository, UsersService], exports: [UsersService] })
export class UsersModule {}
```

### 5. **Single shared database**
All modules share the same Prisma schema (`prisma/schema.prisma`, PostgreSQL) and the same migration history: native ACID transactions across modules, but coordinated migrations.

---

## 📊 Metrics

| Metric | Value |
|----------|--------|
| **Files (src)** | 32 |
| **Lines of code (src)** | ~675 LOC |
| **Business modules** | 5 (auth, users, projects, tasks, comments) |
| **Shared kernel** | 4 files (prisma, guard, decorator, module) |
| **Repository per module** | 4 (users, projects, tasks, comments) |
| **Tests** | **23** (auth 6, comments 6, projects 5, tasks 6) |
| **LOC / feature** | ~130 |
| **Port** | 3007 |
| **Dependencies** | NestJS (common/core/jwt/passport) + Prisma + bcrypt — **no event bus** |

---

## ⚡ Quick Start

```bash
# Dependencies
npm install

# Prisma client + migrations
npm run prisma:generate
npm run prisma:migrate

# Build
npm run build

# Tests (23)
npm test

# Server (port 3007)
npm run start
```

---

## 🧪 Testing Strategy

`jest` + `ts-jest`, one suite per module, run against a **mocked repository**:

```typescript
const makeRepository = () => ({
  findByUserId: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
});

// ProjectsService has only one collaborator: the mock surface is tiny.
const service = new ProjectsService(repository as unknown as ProjectsRepository);
```

| Suite | Tests | Covers |
|-------|-------|--------|
| `auth.service.spec.ts` | 6 | signup (email conflict), signin (wrong password), getMe, hashing |
| `projects.service.spec.ts` | 5 | listing by user, creation, ownership (404 / 403) |
| `tasks.service.spec.ts` | 6 | listing by project, creation, completion, deletion |
| `comments.service.spec.ts` | 6 | listing by task, creation and deletion |
| **Total** | **23** | |

**Philosophy**: the service holds the rules (ownership, not-found) and has only its repository as a dependency → behavior can be tested without touching Prisma. The mock surface stays small (an object with 4 methods), which is precisely the point of splitting by module.

---

## 🔍 Comparison with Sibling Backends

| Aspect | Layered (#1) | Clean (#2) | Hexagonal (#3) | DDD (#5) | **Modular Monolith (#7)** |
|--------|--------------|------------|----------------|----------|---------------------------|
| **Partitioning axis** | Technical layers | Layers | Ports/Adapters | Bounded Contexts | **Business modules** |
| **Repository ownership** | Global | Port + adapter | Port + adapter | Per context | **Per module** |
| **Typed ids** | ❌ `string` | ❌ `string` | ❌ `string` | ✅ VOs | ❌ primitives |
| **Domain events** | ❌ | ❌ | ❌ | ✅ | ❌ (explicit DI) |
| **LOC / feature** | ~100 | ~167 | ~167 | ~250 | **~130** |
| **Files** | 26 | 53 | 61 | 78 | **32** |
| **Tests** | 28 | 14 | 17 | 24 | **23** |
| **Microservices migration** | ❌ | ⚠️ | ⚠️ | ✅ | ✅ **direct extraction** |
| **Complexity** | Low | Medium | Medium | High | **Low-Medium** |

> **Note**: DDD and the Modular Monolith both split *by business domain*, but in different ways — DDD isolates **Bounded Contexts** with a rich model (Aggregates, VOs, events), while the Modular Monolith isolates **modules** with a classic anemic model but a deployment boundary that is ready for extraction.

---

## ✅ Pros

1. **Best value/complexity ratio**: ~130 LOC/feature for strict module boundaries
2. **Simple operations**: a single deployable unit, no network, no distributed sagas
3. **Boundaries that prepare for the future**: each module can become a microservice (dependencies are already explicit)
4. **Native ACID transactions** across modules (single DB)
5. **Minimal latency**: in-process communication (DI), no internal HTTP/gRPC
6. **Testability**: small mock surface (one repository per service) — 23 tests without Prisma
7. **DX**: debugging, integration tests, and local development are trivial

---

## ❌ Cons

1. **Deployment coupling**: everything scales together (no per-module scaling)
2. **Shared DB schema**: migrations must be coordinated across modules
3. **Discipline required**: nothing *technically* prevents a rogue cross-module import if the team is not careful
4. **Coarse horizontal scaling**: the entire app is replicated
5. **No rich model**: unlike DDD, entities remain anemic (no VOs/events)
6. **Risk of drift**: without guardrails (boundary linting), a modular monolith can turn back into a big ball of mud

---

## 📖 When to Use a Modular Monolith

### ✅ **USE** if:
- Multi-capability domain (auth, projects, tasks, …) with a **single, medium-sized team**
- Need for **clear boundaries** but not yet for independent scaling
- Candidate for a future extraction into microservices (Monolith First)
- Time-to-market matters (faster than microservices, better structured than Layered)
- Small team without a dedicated SRE team

### ❌ **AVOID** if:
- Need for **independent scaling per module** (load spike on a single domain)
- Multiple autonomous teams that genuinely deploy at different cadences → microservices
- Polyglot stack per domain (each module needs a different language/framework)
- Trivial domain → a simple Layered architecture is enough

---

## 📚 References

- **Martin Fowler**: [MonolithFirst](https://martinfowler.com/bliki/MonolithFirst.html)
- **Shopify**: [Shopify's Modular Monolith Journey](https://shopify.engineering/shopify-monolith)
- **NestJS**: [Modules](https://docs.nestjs.com/modules)
- **Kamil Grzybek**: *Modular Monolith with DDD* (the reference for the pattern)

---

## 🎓 Key Learnings

1. **Split by business capability, not by technical concern**: the `tasks` module contains *everything* "task" needs — HTTP, logic, persistence
2. **The repository belongs to the module**: no shared global repository; each module defines its own queries
3. **Explicit communication**: a single inter-module link (Auth → Users) via DI — visible and traceable
4. **Global shared kernel**: Prisma/guards injectable everywhere via `@Global()`, without polluting import signatures
5. **The boundary = the future microservice seam**: extracting a module becomes mechanical (in-process → HTTP)
6. **The best pragmatic trade-off** of the series: ~130 LOC/feature for structural guarantees where Layered gives ~100 without boundaries and DDD demands ~250

---

**Next Steps**:
- See the [comparison matrix](../../docs/comparison-matrix.md) for the overall verdict across the 7 backends + 4 frontends.
- Improvement idea: add a boundary test (ESLint `no-cross-module-import`) to mechanically prevent undeclared cross-module imports.
