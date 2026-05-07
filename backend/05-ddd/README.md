# Backend #5 : Domain-Driven Design (DDD)

**Architecture tactique DDD avec Bounded Contexts, Aggregates, Value Objects et Domain Events.**

---

## 📐 Architecture Overview

Cette implémentation suit les **patterns tactiques de DDD** (Evans, 2003) :

```
src/
├── shared-kernel/              # Code partagé entre tous les contexts
│   └── domain/
│       ├── aggregate-root.ts   # Base class pour Aggregates
│       ├── events/
│       │   └── domain-event.ts # Base pour Domain Events
│       └── value-objects/
│           ├── email.vo.ts     # Email VO (partagé)
│           └── entity-id.vo.ts # Base pour tous les IDs
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

### 1. **Bounded Contexts** (Contextes Délimités)
Chaque context a son propre **langage ubiquitaire** et **modèle de domaine isolé** :
- `UserManagement` : gestion auth + profils utilisateurs
- `ProjectManagement` : gestion projets + ownership
- `TaskManagement` : gestion tâches + statuts

**Isolation forte** : chaque context peut évoluer indépendamment.

### 2. **Aggregates** (Racines d'Agrégats)
Les **Aggregates** garantissent la **cohérence transactionnelle** :
- `User` : seul point d'entrée pour modifier un utilisateur
- `Project` : seul point d'entrée pour modifier un projet
- `Task` : seul point d'entrée pour modifier une tâche

Toutes les modifications passent par des **méthodes d'aggregate** (pas de setters publics).

### 3. **Value Objects** (Objets-Valeur)
**Immutables** + **auto-validés** :
- `Email` : validation format email
- `UserId`, `ProjectId`, `TaskId` : type-safe IDs (pas de string brut)
- `UserName`, `ProjectName` : validation longueur
- `TaskStatus` : enum typé (TODO/IN_PROGRESS/DONE)
- `HashedPassword` : validation hash

**Avantage** : impossible de créer un état invalide.

### 4. **Domain Events** (Événements de Domaine)
Les aggregates **émettent des événements** pour notifier les changements importants :
- `UserRegisteredEvent` : nouveau user créé
- `ProjectCreatedEvent` : nouveau projet créé
- `TaskCompletedEvent` : tâche terminée

Les events sont **publiés via EventBus** après persistance (pattern Outbox simplifié).

### 5. **Repositories**
**Interfaces définies dans le Domain**, implémentées dans Infrastructure :
- `IUserRepository` → `PrismaUserRepository`
- `IProjectRepository` → `PrismaProjectRepository`
- `ITaskRepository` → `PrismaTaskRepository`

Le domain ne connaît **que les interfaces**, pas Prisma.

### 6. **CQRS** (Command Query Responsibility Segregation)
Séparation **Commands** (write) vs **Queries** (read) :
- **Commands** : `RegisterUser`, `CreateProject`, `CompleteTask` → modifient l'état
- **Queries** : `GetUser`, `GetProjects`, `GetTasks` → lecture seule

Implémentés via `@nestjs/cqrs` (CommandBus, QueryBus, EventBus).

---

## 📊 Metrics

| Métrique | Valeur |
|----------|--------|
| **Lignes de code (domain)** | ~800 LOC |
| **Lignes de code (total)** | ~2,100 LOC |
| **Fichiers** | 62 fichiers |
| **Tests** | 10 tests (100% aggregates + VOs) |
| **Contexts** | 3 Bounded Contexts |
| **Aggregates** | 3 (User, Project, Task) |
| **Value Objects** | 8 VOs |
| **Domain Events** | 3 events |
| **CQRS Handlers** | 8 (5 Commands, 3 Queries) |
| **Dépendances** | NestJS + CQRS + EventEmitter |

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

**Coverage** :
- ✅ User Aggregate : register + reconstitute + events
- ✅ Project Aggregate : create + update + ownership + events
- ✅ Task Aggregate : create + complete + events + idempotence
- ✅ Email VO : validation + equality

**Philosophy** : tester le **comportement métier** (aggregates + VOs), pas l'infra.

---

## 🎯 DDD Tactical Patterns Summary

| Pattern | Implémentation |
|---------|----------------|
| **Bounded Context** | 3 contexts isolés (User, Project, Task) |
| **Aggregate** | User, Project, Task avec invariants + factory methods |
| **Value Object** | Email, EntityId, UserId, ProjectName, TaskStatus (immutable + validated) |
| **Domain Event** | UserRegistered, ProjectCreated, TaskCompleted (EventBus) |
| **Repository** | Interfaces dans Domain, implémentations Prisma dans Infrastructure |
| **CQRS** | Commands (write) vs Queries (read) via @nestjs/cqrs |
| **Shared Kernel** | Email VO + EntityId VO + DomainEvent base |

---

## 🔍 Comparison with Previous Backends

| Aspect | Layered (#1) | Clean (#2) | Hexagonal (#3) | **DDD (#5)** |
|--------|--------------|------------|----------------|--------------|
| **Contexts** | ❌ Tout mélangé | ❌ Pas de contexts | ❌ Pas de contexts | ✅ 3 contexts isolés |
| **Value Objects** | ❌ Primitive types | ❌ Primitive types | ❌ Primitive types | ✅ 8 VOs typés |
| **Aggregates** | ❌ Entities anémiques | ❌ Entities anémiques | ❌ Entities anémiques | ✅ Aggregates riches |
| **Domain Events** | ❌ Aucun | ❌ Aucun | ❌ Aucun | ✅ 3 events |
| **CQRS** | ❌ Couplé read/write | ❌ Couplé read/write | ❌ Couplé read/write | ✅ Séparé Commands/Queries |
| **Type Safety IDs** | ❌ `string` partout | ❌ `string` partout | ❌ `string` partout | ✅ UserId, ProjectId, TaskId |
| **Validation** | ⚠️ Dans controllers | ⚠️ Dans use cases | ⚠️ Dans use cases | ✅ Dans Value Objects |
| **LOC/feature** | ~100 | ~167 | ~167 | **~250** |
| **Complexité** | Faible | Moyenne | Moyenne | **Élevée** |
| **Scalabilité** | ⚠️ Monolithe fragile | ✅ Bonne | ✅ Bonne | ✅ **Excellente** (contexts isolés) |

---

## ✅ Pros

1. **Isolation forte** : chaque Bounded Context peut évoluer indépendamment
2. **Type Safety** : impossible de passer un `ProjectId` à la place d'un `UserId`
3. **Validation automatique** : les VOs rejettent les données invalides à la construction
4. **Événements métier** : traçabilité + découplage (ex: envoyer un email quand `UserRegisteredEvent`)
5. **Testabilité** : domain layer 100% pur (pas de dépendances externes)
6. **Langage ubiquitaire** : le code reflète le vocabulaire métier
7. **Évolutivité** : facile d'extraire un context en microservice plus tard
8. **CQRS** : optimisation read/write indépendante (ex: read DB séparée)

---

## ❌ Cons

1. **Verbosité** : ~250 LOC par feature (vs ~100 en Layered)
2. **Over-engineering** : trop complexe pour une app CRUD simple
3. **Courbe d'apprentissage** : requiert une vraie compréhension de DDD
4. **Setup lent** : 3-4h pour la 1ère feature (vs 1.5h en Layered)
5. **Dépendances** : `@nestjs/cqrs` + `@nestjs/event-emitter` (frameworks spécifiques)
6. **Mapping overhead** : DTO → Command → Aggregate → Repository (4 couches)
7. **Pas adapté aux équipes juniors** : risque de DDD cargo-cult
8. **Synchronisation contexts** : complexité si User context doit connaître Project context

---

## 📖 When to Use DDD

### ✅ **USE DDD** si :
- Domaine métier **complexe** (pas un simple CRUD)
- Besoin de **scalabilité** (futurs microservices)
- Équipe **expérimentée** en DDD
- Événements métier importants (audit, notifications, workflows)
- Application **long-terme** (5+ ans)

### ❌ **AVOID DDD** si :
- CRUD simple (admin panel, backoffice)
- Équipe junior ou petite équipe
- Time-to-market critique (prototype, MVP)
- Domaine trivial (pas de règles métier complexes)

---

## 📚 DDD References

- **Eric Evans** : "Domain-Driven Design" (2003) — le livre fondateur
- **Vaughn Vernon** : "Implementing Domain-Driven Design" (2013) — guide pratique
- **Martin Fowler** : [BoundedContext](https://martinfowler.com/bliki/BoundedContext.html)
- **NestJS CQRS** : [docs.nestjs.com/recipes/cqrs](https://docs.nestjs.com/recipes/cqrs)

---

## 🎓 Key Learnings

1. **DDD ≠ Architecture** : DDD est une approche de modélisation du domaine, pas une archi technique
2. **Bounded Contexts > Layers** : l'isolation par context est plus forte que par couches
3. **Value Objects = Defensive Coding** : impossible de créer un état invalide
4. **Aggregates = Consistency Boundaries** : chaque aggregate garantit ses propres invariants
5. **Events = Decoupling** : les events découplent les contexts (ex: Task context écoute ProjectCreated)
6. **CQRS = Flexibility** : séparer read/write permet d'optimiser chacun indépendamment

---

**Next Steps** :
- Backend #6 (CQRS + Event Sourcing) : pousser CQRS à fond + event store
- Backend #7 (Modular Monolith) : modules découplés dans un même process
