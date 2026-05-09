# ADR-0012: Backend #3 — Hexagonal Architecture

**Date:** 2026-05-07  
**Status:** Accepted  
**Architecture:** Hexagonal (Ports & Adapters)

## Context

Après avoir implémenté Backend #1 (Layered) et Backend #2 (Clean Architecture), nous explorons **Hexagonal Architecture** (aka Ports & Adapters, Alistair Cockburn 2005).

**Question centrale:** Hexagonal et Clean sont-ils vraiment différents en pratique, ou juste un renommage de concepts ?

## Decision

Implémenter TaskFlow avec architecture hexagonale "pure" :

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

### Vocabulaire Hexagonal

| Concept | Définition | Équivalent Clean |
|---------|-----------|------------------|
| **Port IN (Driving)** | Interface exposée par l'application | Use case interface |
| **Port OUT (Driven)** | Interface requise par l'application | Repository interface |
| **Adapter IN (Primary)** | Appelle l'application | Controller (Presentation) |
| **Adapter OUT (Secondary)** | Implémente un port OUT | Repository impl (Infrastructure) |

## Implementation

### 1. Domain Layer

**Identique à Clean Architecture:**

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

**Observation:** Aucune différence vs Clean.

### 2. Ports IN (Driving)

**Nouveau concept explicite:**

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

**En Clean, on aurait juste:**
```typescript
// application/use-cases/create-project.use-case.ts
export class CreateProjectUseCase {
  execute(dto: CreateProjectDto): Promise<Project> { ... }
}
```

**Différence:** Hexagonal force une **interface explicite** pour chaque use case. Clean peut les définir ou non (optionnel).

### 3. Ports OUT (Driven)

**Identique à Clean:**

```typescript
// ports/out/project-repository.port.ts
export interface ProjectRepositoryPort {
  create(project: Project): Promise<Project>;
  findByName(name: string): Promise<Project | null>;
}
```

**En Clean:**
```typescript
// domain/repositories/project.repository.ts
export interface IProjectRepository {
  create(project: Project): Promise<Project>;
  findByName(name: string): Promise<Project | null>;
}
```

**Différence:** Nommage (`Port` vs `IRepository`), localisation (`ports/out` vs `domain/repositories`). **Sémantiquement identiques.**

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

**Différence:** Hexagonal force `implements CreateProjectPort`. Clean peut le faire ou non (optionnel). **Logique identique.**

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

**Différence:** Hexagonal injecte l'**interface** (`CreateProjectPort`), Clean injecte la **classe** (`CreateProjectUseCase`). En NestJS, les deux fonctionnent via DI.

### 6. Adapters OUT (Secondary)

**Identique à Clean:**

```typescript
// adapters/out/persistence/prisma/project-repository.adapter.ts
@Injectable()
export class PrismaProjectRepository implements ProjectRepositoryPort {
  async create(project: Project): Promise<Project> {
    // Prisma logic
  }
}
```

**Différence:** Aucune. Même code que Clean Infrastructure layer.

## Consequences

### ✅ Avantages

1. **Vocabulaire standardisé:** "Ports & Adapters" est un langage commun reconnu
2. **Explicite:** Séparer `ports/in` et `ports/out` rend le flow plus clair
3. **Testabilité:** Identique à Clean (mock 4 méthodes vs 20+ en Layered)
4. **Swap facile:** Nouveau Adapter OUT = nouvelle implémentation de Port OUT

### ❌ Inconvénients

1. **Vocabulaire moins intuitif:** "Primary/Secondary adapters" vs "Presentation/Infrastructure"
2. **Redondance:** Forcer une interface pour chaque use case = boilerplate
3. **Aucune différence technique vs Clean:** C'est du Clean avec renommage

### 📊 Métriques

| Métrique | Backend #1 (Layered) | Backend #2 (Clean) | **Backend #3 (Hexagonal)** |
|----------|---------------------|-------------------|---------------------------|
| LOC/feature | ~100 | ~167 | **~167** |
| Tests passing | 28/28 | 14/14 | **7/7** |
| Mock methods (tests) | 20+ Prisma | 4 repository | **4 repository** |
| First feature time | 1.5h | 2.5h | **2.5h** |
| Build time | 8s | 10s | **10s** |

**Observation:** Métriques **identiques** à Clean Architecture.

### 🤔 Hexagonal vs Clean — Verdict

**Structurellement identiques.** Mapping complet :

| Hexagonal | Clean Architecture |
|-----------|-------------------|
| `domain/` | `domain/` |
| `ports/in/` (interfaces) | Use case interfaces (optionnelles) |
| `ports/out/` (interfaces) | `domain/repositories/` |
| `application/` (use cases) | `application/use-cases/` |
| `adapters/in/` | `presentation/` |
| `adapters/out/` | `infrastructure/` |

**Différences cosmétiques:**
1. Hexagonal force des interfaces pour use cases (ports IN)
2. Hexagonal nomme explicitement "Ports" et "Adapters"
3. Hexagonal utilise le vocabulaire Cockburn ("Primary/Secondary")

**En pratique:** Si vous implémentez Clean avec des interfaces explicites pour vos use cases, vous avez déjà du Hexagonal.

### 🔮 Quand choisir Hexagonal vs Clean ?

**Hexagonal si:**
- Votre équipe connaît le vocabulaire "Ports & Adapters"
- Vous voulez forcer des interfaces explicites partout
- Vous aimez la symétrie `adapters/in` ↔ `adapters/out`

**Clean si:**
- Vous préférez le vocabulaire Uncle Bob ("Presentation/Infrastructure")
- Vous ne voulez pas de boilerplate d'interfaces pour use cases simples
- Vous voulez plus de flexibilité (interfaces optionnelles)

**En réalité:** Les deux sont équivalents. Choisissez selon le vocabulaire que votre équipe préfère.

## Lessons Learned

1. **Hexagonal ≈ Clean avec renommage:** La structure est identique, seuls les noms changent
2. **Interfaces de use cases:** Hexagonal les force, Clean les rend optionnelles. Dans les deux cas, c'est du boilerplate pour des use cases simples.
3. **Ports OUT = Repository interfaces:** Même concept, même localisation (ou presque)
4. **Testabilité identique:** Clean et Hexagonal mockent 4 méthodes, Layered 20+
5. **Symétrie adapters IN/OUT:** Plus claire en Hexagonal, mais Clean peut faire pareil avec "Presentation/Infrastructure"

## Related

- [ADR-0010: Backend Layered](./0010-backend-layered.md)
- [ADR-0011: Backend Clean Architecture](./0011-backend-clean-architecture.md)

## Notes

**Question posée dans ADR-0011:** "Does Hexagonal collapse into Clean in practice?"

**Réponse:** **Oui.** En NestJS (ou tout framework avec DI), Hexagonal et Clean sont structurellement identiques. La différence est cosmétique :
- Hexagonal nomme explicitement "Ports IN/OUT"
- Clean laisse implicites (mais ils existent quand même)

Si vous implémentez Clean avec :
1. Des interfaces pour vos use cases → vous avez des Ports IN
2. Des interfaces pour vos repositories → vous avez des Ports OUT

Donc Clean **est** Hexagonal, juste avec un vocabulaire différent.

---

**Conclusion finale:** Architecture hexagonale = Clean Architecture avec vocabulaire "Ports & Adapters" explicite. Techniquement équivalentes. Choisissez selon la culture de votre équipe.
