# ADR-0014: Backend #5 — Domain-Driven Design (DDD)

**Status:** Accepted
**Date**: 2026-05-07  
**Decision Makers**: Architecture Lab Team  
**Tags**: `backend`, `ddd`, `bounded-contexts`, `cqrs`, `event-driven`

---

## Context

Après avoir implémenté **3 architectures "propres"** (Clean, Hexagonal, Onion), nous avons découvert qu'elles sont **structurellement identiques** (ADR-0013).

**Question** : comment gérer la **complexité métier** au-delà de la simple séparation par couches ?

**Domain-Driven Design** (Evans, 2003) propose une approche différente :
- Focus sur le **modèle de domaine** (pas sur les couches techniques)
- **Bounded Contexts** pour isoler les sous-domaines
- **Tactical Patterns** : Aggregates, Value Objects, Domain Events
- **Strategic Patterns** : Context Mapping, Anti-Corruption Layer

---

## Decision

Implémenter une architecture **DDD tactique** avec :

1. **3 Bounded Contexts** : `UserManagement`, `ProjectManagement`, `TaskManagement`
2. **Shared Kernel** : Value Objects communs (`Email`, `EntityId`)
3. **Aggregates** : `User`, `Project`, `Task` (racines d'agrégats)
4. **Value Objects** : `UserId`, `ProjectId`, `TaskId`, `TaskStatus`, `ProjectName`, etc.
5. **Domain Events** : `UserRegisteredEvent`, `ProjectCreatedEvent`, `TaskCompletedEvent`
6. **CQRS** : Commands (write) + Queries (read) via `@nestjs/cqrs`
7. **Event-Driven** : publication d'events via `EventBus` après persistance

---

## Architecture

### Structure (Bounded Contexts)

```
src/
├── shared-kernel/              # Code partagé entre tous les contexts
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

| Pattern | Implémentation |
|---------|----------------|
| **Aggregate** | `User`, `Project`, `Task` — cohérence transactionnelle + factory methods |
| **Value Object** | `Email`, `UserId`, `TaskStatus` — immutable + auto-validé |
| **Domain Event** | `UserRegisteredEvent`, `TaskCompletedEvent` — publié via EventBus |
| **Repository** | Interfaces dans Domain (`IUserRepository`), implémentation Prisma dans Infra |
| **CQRS** | Commands (write) vs Queries (read) — handlers séparés |
| **Shared Kernel** | VOs communs (`Email`, `EntityId`) + bases (`AggregateRoot`, `DomainEvent`) |

### Example Flow (Register User)

```typescript
// 1. HTTP Controller reçoit RegisterDto
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

**Flux** :
1. DTO → Command
2. Command → Aggregate (domain logic)
3. Aggregate → Repository (persistence)
4. Events → EventBus (notification)

---

## Implementation Metrics

| Métrique | Valeur | Comparaison (#1 Layered) |
|----------|--------|--------------------------|
| **Total LOC** | ~2,100 | +130% |
| **Domain LOC** | ~800 | N/A (pas de domain pur en Layered) |
| **Fichiers** | 62 | +110% (vs 29) |
| **Tests** | 10 (aggregates + VOs) | -64% (vs 28, mais focus domain) |
| **LOC/feature** | ~250 | +150% (vs 100) |
| **Temps 1ère feature** | ~3.5h | +133% (vs 1.5h) |
| **Bounded Contexts** | 3 | 0 (Layered = monolithe unifié) |
| **Value Objects** | 8 | 0 (primitive types) |
| **Domain Events** | 3 | 0 |
| **CQRS Handlers** | 8 (5 Commands, 3 Queries) | 0 (services mixtes) |

---

## Trade-offs Analysis

### ✅ Advantages

#### 1. **Isolation par Bounded Context**
- Chaque context a son **propre modèle** + **langage ubiquitaire**
- **Évolution indépendante** : modifier User context sans toucher Task context
- **Futurs microservices** : facile d'extraire un context en service séparé

#### 2. **Type Safety via Value Objects**
```typescript
// ❌ Avant (primitive types)
function assignTask(userId: string, taskId: string) { ... }
assignTask(taskId, userId); // BUG : params inversés, compile OK !!!

// ✅ Après (Value Objects)
function assignTask(userId: UserId, taskId: TaskId) { ... }
assignTask(taskId, userId); // ❌ TypeScript error : incompatible types
```

#### 3. **Validation Automatique**
```typescript
// ❌ Avant
const email = dto.email; // peut être invalide !

// ✅ Après
const email = Email.create(dto.email); // throw si invalide
```

#### 4. **Domain Events = Découplage**
```typescript
// Exemple : envoyer un email de bienvenue quand UserRegisteredEvent
@EventsHandler(UserRegisteredEvent)
export class SendWelcomeEmailHandler {
  async handle(event: UserRegisteredEvent) {
    await this.emailService.sendWelcome(event.email);
  }
}
```
**Avantage** : `UserManagement` context ne connaît pas `EmailService` → couplage faible.

#### 5. **Testabilité Domain Pure**
```typescript
// Tests sans mocks, sans DB, sans frameworks
it('should complete task and emit event', () => {
  const task = Task.create(...);
  task.complete();
  expect(task.getStatus().getValue()).toBe('DONE');
  expect(task.getDomainEvents()).toHaveLength(1);
});
```

#### 6. **CQRS = Optimisation Read/Write**
- Commands : écrivent dans Postgres (ACID)
- Queries : peuvent lire depuis Redis/ElasticSearch (optimisé search)
- **Flexibilité** : chaque side peut évoluer indépendamment

#### 7. **Langage Métier**
```typescript
// ❌ Avant (tech-centric)
userService.update({ status: 'active' });

// ✅ Après (business-centric)
user.activate(); // méthode métier explicite
```

### ❌ Disadvantages

#### 1. **Over-Engineering pour CRUD simple**
- **250 LOC par feature** (vs 100 en Layered)
- Mapping layers : `DTO → Command → Aggregate → DB Model`
- **ROI négatif** si domaine trivial

#### 2. **Courbe d'Apprentissage**
- Requiert compréhension DDD (livre Evans = 560 pages)
- Risque de **DDD Cargo Cult** : appliquer les patterns sans comprendre le "pourquoi"
- Équipe junior → confusion

#### 3. **Verbosité**
```typescript
// ❌ Simple case (Layered)
const user = await prisma.user.create({ data: dto });

// ✅ DDD (7+ étapes)
const email = Email.create(dto.email);
const userId = UserId.generate();
const hashedPwd = HashedPassword.fromHash(...);
const name = UserName.create(dto.name);
const user = User.register(userId, email, hashedPwd, name);
await repository.save(user);
eventBus.publish(...);
```

#### 4. **Dépendances Framework-Specific**
- `@nestjs/cqrs` : lock-in NestJS
- `@nestjs/event-emitter` : pas portable vers Express/Fastify sans refactor

#### 5. **Complexité Synchronisation Contexts**
**Problème** : si `TaskManagement` a besoin de savoir si un `Project` existe ?

**Solutions** :
1. **Anti-Corruption Layer** : `TaskManagement` interroge `ProjectManagement` via API
2. **Shared Events** : `TaskManagement` écoute `ProjectCreatedEvent`
3. **Duplication** : `TaskManagement` garde une copie `{ projectId, projectName }`

**Trade-off** : complexité accrue.

#### 6. **Performance Overhead**
- Création de nombreux objets (VOs, Events, Commands)
- Garbage Collection plus sollicitée
- Profiling réel nécessaire (hypothèse : ~5-10% overhead vs Layered)

---

## Comparison: DDD vs Clean/Hexagonal/Onion

| Aspect | Clean/Hexagonal/Onion | **DDD** |
|--------|----------------------|---------|
| **Focus** | Séparation par **couches techniques** | Séparation par **domaines métier** |
| **Isolation** | Layers (UI, Domain, Infra) | **Bounded Contexts** (User, Project, Task) |
| **Entities** | Entities anémiques (data bags) | **Aggregates riches** (behavior + invariants) |
| **IDs** | `string` primitives | **Value Objects** (`UserId`, `ProjectId`) |
| **Validation** | Dans Use Cases | **Dans Value Objects** (impossible de créer état invalide) |
| **Events** | ❌ Absents | ✅ **Domain Events** (découplage via pub/sub) |
| **CQRS** | ❌ Pas de séparation | ✅ **Commands vs Queries** |
| **Scalabilité** | Bonne (couches) | **Excellente** (contexts isolés → microservices) |
| **Complexité** | Moyenne | **Élevée** |
| **Use Case** | Apps moyennes (10-50 features) | **Domaines complexes** (50+ features, multiples sous-domaines) |

**Conclusion** : DDD **complète** Clean/Hexagonal/Onion, ne les remplace pas.

---

## When to Use DDD

### ✅ **USE DDD** (Strategic + Tactical Patterns)

1. **Domaine métier complexe**
   - Multiples règles business interdépendantes
   - Workflows complexes (ex: e-commerce, assurance, banque)
   - Expertise métier nécessaire

2. **Application long-terme**
   - Durée de vie 5+ ans
   - Évolution continue (ajout features régulier)

3. **Scalabilité organisationnelle**
   - Multiples équipes (1 équipe = 1 context)
   - Futurs microservices envisagés

4. **Équipe expérimentée**
   - Devs seniors connaissant DDD
   - Temps pour apprentissage si équipe junior

### ⚠️ **USE DDD (Strategic) + Clean/Hexagonal (Tactical)**

Si domaine **moyennement complexe** :
- Bounded Contexts (DDD strategic)
- Mais **pas de VOs/Aggregates** (trop verbeux)
- Garder Clean Architecture dans chaque context

### ❌ **AVOID DDD** (Use Layered/Clean)

1. **CRUD simple**
   - Admin panel, backoffice
   - Formulaires → DB (pas de logique métier)

2. **MVP / Prototype**
   - Time-to-market critique
   - Besoin de vélocité (DDD = 2x slower au début)

3. **Équipe junior sans formation**
   - Risque de DDD mal appliqué (pire que pas de DDD)

4. **Domaine trivial**
   - Pas de règles métier complexes
   - Logique = validation basique

---

## Lessons Learned

### 1. **DDD ≠ Architecture Technique**
- DDD est une **approche de modélisation du domaine**
- Peut être combiné avec Clean/Hexagonal/Onion
- Ne remplace pas les bonnes pratiques techniques (SOLID, testing, etc.)

### 2. **Bounded Contexts > Layers**
- **Layers** = isolation technique (UI, Domain, DB)
- **Contexts** = isolation **métier** (User, Project, Task)
- Contexts permettent l'**évolution indépendante** (team scalability)

### 3. **Value Objects = Defensive Coding++**
```typescript
// ❌ Sans VOs
function transfer(fromId: string, toId: string, amount: number) {
  if (amount < 0) throw ... // validation répétée partout
  if (!fromId) throw ...
  // ...
}

// ✅ Avec VOs
function transfer(from: AccountId, to: AccountId, amount: Money) {
  // Impossible d'appeler avec des valeurs invalides !
  // Validation centralisée dans VOs
}
```

### 4. **Aggregates = Consistency Boundaries**
- 1 Aggregate = 1 transaction
- **Anti-pattern** : charger plusieurs aggregates dans 1 transaction
- **Correct** : événements + eventual consistency

### 5. **Events = Decoupling Superpowers**
```typescript
// ❌ Couplage fort
class UserService {
  async register(dto) {
    await this.db.save(user);
    await this.emailService.send(...); // couplage !
    await this.analyticsService.track(...); // couplage !
  }
}

// ✅ Découplage via events
class UserService {
  async register(dto) {
    const user = User.register(...);
    await this.repo.save(user);
    this.eventBus.publish(new UserRegisteredEvent(...));
    // EmailService + Analytics écoutent l'event → 0 couplage
  }
}
```

### 6. **CQRS ≠ Event Sourcing**
- **CQRS** : séparer Commands (write) et Queries (read)
- **Event Sourcing** : stocker les events au lieu de l'état
- **DDD #5** : CQRS **sans** Event Sourcing (queries lisent la DB normale)
- **Backend #6** : CQRS **avec** Event Sourcing (queries reconstruisent depuis events)

---

## Next Steps

### Backend #6 : CQRS + Event Sourcing
- Event Store (events = source of truth)
- Read Models (projections depuis events)
- Temporal queries ("état du système au 01/01/2025")

### Backend #7 : Modular Monolith
- Bounded Contexts (comme DDD)
- Mais **modules découplés** dans 1 seul process
- Pas de microservices (éviter distributed monolith)

---

## References

### Books
- **Eric Evans** — "Domain-Driven Design" (2003) : le livre fondateur (560 pages)
- **Vaughn Vernon** — "Implementing Domain-Driven Design" (2013) : guide pratique
- **Vaughn Vernon** — "Domain-Driven Design Distilled" (2016) : version concise (176 pages)

### Articles
- **Martin Fowler** : [BoundedContext](https://martinfowler.com/bliki/BoundedContext.html)
- **Martin Fowler** : [AggregateRoot](https://martinfowler.com/bliki/DDD_Aggregate.html)
- **Khalil Stemmler** : [Domain-Driven Design w/ TypeScript](https://khalilstemmler.com/articles/categories/domain-driven-design/)

### NestJS
- [NestJS CQRS](https://docs.nestjs.com/recipes/cqrs)
- [NestJS EventEmitter](https://docs.nestjs.com/techniques/events)

---

## Verdict

### ✅ **DDD is Worth It** IF:
- Domaine complexe (e-commerce, fintech, healthcare)
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
