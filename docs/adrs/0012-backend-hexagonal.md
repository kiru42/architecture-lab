# ADR-0012: Backend #3 — Hexagonal Architecture

**Date:** 2026-05-07  
**Status:** Accepted  
**Architecture:** Hexagonal (Ports & Adapters)

## Context

After implementing Backend #1 (Layered) and Backend #2 (Clean Architecture), we are exploring **Hexagonal Architecture** (aka Ports & Adapters, Alistair Cockburn 2005).

**Central question:** Are Hexagonal and Clean really different in practice, or just a renaming of concepts?

## Decision

Implement TaskFlow with a "pure" hexagonal architecture:

```
src/
├── domain/              # Business entities (pure logic)
├── ports/
│   ├── in/             # Driving ports (use case interfaces)
│   └── out/            # Driven ports (repository/service interfaces)
├── application/         # Use cases (implement ports IN, use ports OUT)
└── adapters/
    ├── in/             # Primary adapters (HTTP, CLI...)
    └── out/            # Secondary adapters (Prisma, bcrypt...)
```

### Hexagonal Vocabulary

| Concept | Definition | Clean Equivalent |
|---------|-----------|------------------|
| **Port IN (Driving)** | Interface exposed by the application | Use case interface |
| **Port OUT (Driven)** | Interface required by the application | Repository interface |
| **Adapter IN (Primary)** | Calls the application | Controller (Presentation) |
| **Adapter OUT (Secondary)** | Implements a port OUT | Repository impl (Infrastructure) |

## Implementation

### 1. Domain Layer

**Identical to Clean Architecture:**

```typescript
// domain/entities/project.entity.ts
export class Project {
  constructor(
    public readonly id: string,
    public readonly name: string,
    // ...
  ) {}

  static create(...) { ... }
  isOwnedBy(userId: string): boolean { ... }
  updateInfo(...): Project { ... }
}
```

**Observation:** No difference vs Clean.

### 2. Ports IN (Driving)

**New explicit concept:**

```typescript
// ports/in/project.port.ts
export interface CreateProjectCommand {
  name: string;
  ownerId: string;
}

export interface CreateProjectPort {
  execute(command: CreateProjectCommand): Promise<Project>;
}
```

**In Clean, we would just have:**
```typescript
// application/use-cases/create-project.use-case.ts
export class CreateProjectUseCase {
  execute(dto: CreateProjectDto): Promise<Project> { ... }
}
```

**Difference:** Hexagonal forces an **explicit interface** for each use case. Clean may define them or not (optional).

### 3. Ports OUT (Driven)

**Identical to Clean:**

```typescript
// ports/out/project-repository.port.ts
export interface ProjectRepositoryPort {
  create(project: Project): Promise<Project>;
  findByName(name: string): Promise<Project | null>;
}
```

**In Clean:**
```typescript
// domain/repositories/project.repository.ts
export interface IProjectRepository {
  create(project: Project): Promise<Project>;
  findByName(name: string): Promise<Project | null>;
}
```

**Difference:** Naming (`Port` vs `IRepository`), location (`ports/out` vs `domain/repositories`). **Semantically identical.**

### 4. Application Layer (Use Cases)

**Hexagonal:**
```typescript
// application/use-cases/create-project.use-case.ts
@Injectable()
export class CreateProjectUseCase implements CreateProjectPort {
  constructor(
    private readonly projectRepository: ProjectRepositoryPort
  ) {}

  async execute(command: CreateProjectCommand): Promise<Project> {
    // ... business logic
  }
}
```

**Clean:**
```typescript
// application/use-cases/create-project.use-case.ts
@Injectable()
export class CreateProjectUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository
  ) {}

  async execute(dto: CreateProjectDto): Promise<Project> {
    // ... business logic
  }
}
```

**Difference:** Hexagonal forces `implements CreateProjectPort`. Clean may do it or not (optional). **Identical logic.**

### 5. Adapters IN (Primary)

**Hexagonal:**
```typescript
// adapters/in/http/projects/project.controller.ts
@Controller('projects')
export class ProjectController {
  constructor(
    private readonly createProjectUseCase: CreateProjectPort  // Port IN
  ) {}
}
```

**Clean:**
```typescript
// presentation/projects/projects.controller.ts
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase
  ) {}
}
```

**Difference:** Hexagonal injects the **interface** (`CreateProjectPort`), Clean injects the **class** (`CreateProjectUseCase`). In NestJS, both work via DI.

### 6. Adapters OUT (Secondary)

**Identical to Clean:**

```typescript
// adapters/out/persistence/prisma/project-repository.adapter.ts
@Injectable()
export class PrismaProjectRepository implements ProjectRepositoryPort {
  async create(project: Project): Promise<Project> {
    // Prisma logic
  }
}
```

**Difference:** None. Same code as the Clean Infrastructure layer.

## Consequences

### ✅ Advantages

1. **Standardized vocabulary:** "Ports & Adapters" is a widely recognized common language
2. **Explicit:** Separating `ports/in` and `ports/out` makes the flow clearer
3. **Testability:** Identical to Clean (mock 4 methods vs 20+ in Layered)
4. **Easy swapping:** A new Adapter OUT = a new implementation of a Port OUT

### ❌ Disadvantages

1. **Less intuitive vocabulary:** "Primary/Secondary adapters" vs "Presentation/Infrastructure"
2. **Redundancy:** Forcing an interface for every use case = boilerplate
3. **No technical difference vs Clean:** It's Clean with renaming

### 📊 Metrics

| Metric | Backend #1 (Layered) | Backend #2 (Clean) | **Backend #3 (Hexagonal)** |
|----------|---------------------|-------------------|---------------------------|
| LOC/feature | ~100 | ~167 | **~167** |
| Tests passing | 28/28 | 14/14 | **7/7** |
| Mock methods (tests) | 20+ Prisma | 4 repository | **4 repository** |
| First feature time | 1.5h | 2.5h | **2.5h** |
| Build time | 8s | 10s | **10s** |

**Observation:** **Identical** metrics to Clean Architecture.

### 🤔 Hexagonal vs Clean — Verdict

**Structurally identical.** Full mapping:

| Hexagonal | Clean Architecture |
|-----------|-------------------|
| `domain/` | `domain/` |
| `ports/in/` (interfaces) | Use case interfaces (optional) |
| `ports/out/` (interfaces) | `domain/repositories/` |
| `application/` (use cases) | `application/use-cases/` |
| `adapters/in/` | `presentation/` |
| `adapters/out/` | `infrastructure/` |

**Cosmetic differences:**
1. Hexagonal forces interfaces for use cases (ports IN)
2. Hexagonal explicitly names "Ports" and "Adapters"
3. Hexagonal uses Cockburn's vocabulary ("Primary/Secondary")

**In practice:** If you implement Clean with explicit interfaces for your use cases, you already have Hexagonal.

### 🔮 When to choose Hexagonal vs Clean?

**Hexagonal if:**
- Your team knows the "Ports & Adapters" vocabulary
- You want to force explicit interfaces everywhere
- You like the `adapters/in` ↔ `adapters/out` symmetry

**Clean if:**
- You prefer Uncle Bob's vocabulary ("Presentation/Infrastructure")
- You don't want interface boilerplate for simple use cases
- You want more flexibility (optional interfaces)

**In reality:** The two are equivalent. Choose based on the vocabulary your team prefers.

## Lessons Learned

1. **Hexagonal ≈ Clean with renaming:** The structure is identical, only the names change
2. **Use case interfaces:** Hexagonal forces them, Clean makes them optional. In both cases, it's boilerplate for simple use cases.
3. **Ports OUT = Repository interfaces:** Same concept, same location (or nearly)
4. **Identical testability:** Clean and Hexagonal mock 4 methods, Layered 20+
5. **Adapters IN/OUT symmetry:** Clearer in Hexagonal, but Clean can do the same with "Presentation/Infrastructure"

## Related

- [ADR-0010: Backend Layered](./0010-backend-layered.md)
- [ADR-0011: Backend Clean Architecture](./0011-backend-clean-architecture.md)

## Notes

**Question raised in ADR-0011:** "Does Hexagonal collapse into Clean in practice?"

**Answer:** **Yes.** In NestJS (or any framework with DI), Hexagonal and Clean are structurally identical. The difference is cosmetic:
- Hexagonal explicitly names "Ports IN/OUT"
- Clean leaves them implicit (but they exist all the same)

If you implement Clean with:
1. Interfaces for your use cases → you have Ports IN
2. Interfaces for your repositories → you have Ports OUT

So Clean **is** Hexagonal, just with a different vocabulary.

---

**Final conclusion:** Hexagonal architecture = Clean Architecture with explicit "Ports & Adapters" vocabulary. Technically equivalent. Choose based on your team's culture.
