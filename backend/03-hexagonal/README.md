# Backend #3 — Hexagonal Architecture (Ports & Adapters)

Architecture hexagonale avec séparation explicite des **ports** (interfaces) et **adapters** (implémentations).

## 🏗️ Structure

```
src/
├── domain/              # Entités métier (pure business logic)
│   └── entities/
│       ├── user.entity.ts
│       ├── project.entity.ts
│       └── task.entity.ts
│
├── ports/               # Interfaces (contrats)
│   ├── in/             # Driving ports (use cases)
│   │   ├── auth.port.ts
│   │   ├── project.port.ts
│   │   └── task.port.ts
│   └── out/            # Driven ports (repositories, services)
│       ├── user-repository.port.ts
│       ├── project-repository.port.ts
│       ├── task-repository.port.ts
│       ├── hash-service.port.ts
│       └── jwt-service.port.ts
│
├── application/         # Use cases (application logic)
│   └── use-cases/
│       ├── register-user.use-case.ts
│       ├── login-user.use-case.ts
│       ├── create-project.use-case.ts
│       ├── assign-task.use-case.ts
│       └── ...
│
├── adapters/            # Implémentations concrètes
│   ├── in/             # Primary adapters (HTTP, CLI, WS...)
│   │   └── http/
│   │       ├── auth/
│   │       ├── projects/
│   │       └── tasks/
│   └── out/            # Secondary adapters (DB, external APIs...)
│       ├── persistence/prisma/
│       └── auth/
│
└── modules/             # NestJS modules (wiring)
    ├── auth/
    ├── projects/
    ├── tasks/
    └── infrastructure/
```

## 🔑 Concepts clés

### Ports vs Adapters

**Ports IN (Driving):**
- Définissent ce que l'application **expose** au monde extérieur
- Exemple: `RegisterUserPort`, `CreateProjectPort`
- Implémentés par les **use cases** (application layer)

**Ports OUT (Driven):**
- Définissent ce que l'application **attend** de l'infrastructure
- Exemple: `UserRepositoryPort`, `HashServicePort`
- Implémentés par les **adapters OUT** (Prisma, bcrypt, JWT...)

**Adapters IN (Primary):**
- Appellent l'application via les ports IN
- Exemple: `AuthController` → appelle `RegisterUserPort`

**Adapters OUT (Secondary):**
- Implémentent les ports OUT
- Exemple: `PrismaUserRepository` → implémente `UserRepositoryPort`

### Flow de données

```
HTTP Request
    ↓
AuthController (Adapter IN)
    ↓
RegisterUserPort (Port IN interface)
    ↓
RegisterUserUseCase (implémente Port IN, utilise Ports OUT)
    ↓
UserRepositoryPort (Port OUT interface)
    ↓
PrismaUserRepository (Adapter OUT)
    ↓
Database
```

## 📊 Comparaison avec les autres backends

| Critère | Layered | Clean | **Hexagonal** |
|---------|---------|-------|---------------|
| **Séparation ports/adapters** | ❌ Non | ⚠️ Implicite | ✅ **Explicite (IN/OUT)** |
| **Testabilité** | Moyenne (20+ mocks) | Excellente (4 mocks) | **Excellente (4 mocks)** |
| **Business logic** | Services (couplée DB) | Entities | **Entities** |
| **Use cases** | ❌ Services mixés | ✅ Use cases dédiés | ✅ **Use cases dédiés** |
| **Repository interfaces** | ❌ Non | Domain layer | **Ports OUT** |
| **Swap Prisma → MongoDB** | ❌ Hard | ✅ Easy | ✅ **Easy (nouveau adapter OUT)** |
| **Complexité structure** | 🟢 Simple | 🟡 Moyenne | 🟡 **Moyenne** |
| **Boilerplate** | 🟢 Faible | 🟡 Moyen | 🟡 **Moyen** |

### Différence clé : Hexagonal vs Clean

**Hexagonal:**
```
ports/in/        → Driving ports (use cases interfaces)
ports/out/       → Driven ports (repositories, services)
application/     → Use cases (implémentent ports IN)
adapters/in/     → Primary adapters (HTTP, CLI...)
adapters/out/    → Secondary adapters (DB, external APIs)
```

**Clean:**
```
domain/repositories/     → Repository interfaces (= ports OUT)
application/use-cases/   → Use cases (= ports IN implémentés)
infrastructure/          → Adapters OUT (Prisma)
presentation/            → Adapters IN (controllers)
```

**Verdict:** Structurellement identiques. Hexagonal nomme explicitement les concepts (ports IN/OUT), Clean les laisse implicites.

## 🧪 Tests

```bash
npm test
```

**Résultats:** 7/7 tests passing

**Couverture:**
- Domain entities: `Project.isOwnedBy()`, `Project.updateInfo()`
- Use cases: `CreateProjectUseCase` (happy path + conflict)

**Avantage testabilité:**
- Clean/Hexagonal: Mock 4 méthodes repository
- Layered: Mock 20+ méthodes Prisma

## 🚀 Run

```bash
# 1. Install dependencies
npm install

# 2. Copy Prisma client (workaround)
cp -r ../../node_modules/.prisma ./node_modules/.prisma

# 3. Setup DB
cp .env.example .env
# Edit DATABASE_URL in .env

# 4. Build
npm run build

# 5. Run
npm start
```

Port: `3003`

## 📝 Observations

### ✅ Forces

1. **Nommage explicite:** Les concepts de ports IN/OUT rendent le flow plus clair
2. **Symétrie:** `adapters/in` et `adapters/out` sont symétriques
3. **Testabilité:** Identique à Clean (mock 4 méthodes vs 20+)
4. **Swap facile:** Nouveau adapter OUT = nouvelle implémentation de port

### ⚠️ Faiblesses

1. **Vocabulaire théorique:** "Primary/Secondary adapters" moins intuitif que "Presentation/Infrastructure"
2. **Même structure que Clean:** En pratique, c'est du Clean avec un renommage
3. **Boilerplate:** Autant que Clean (~167 LOC/feature vs 100 pour Layered)

### 🤔 Question centrale

**Hexagonal et Clean sont-ils vraiment différents ?**

Non. En NestJS, les deux architectures aboutissent à la même structure :
- Ports IN = Use case interfaces
- Ports OUT = Repository interfaces
- Application layer = Use cases
- Adapters IN = Controllers
- Adapters OUT = Prisma repositories

La différence est **cosmétique** : Hexagonal nomme explicitement les ports, Clean les laisse implicites mais ils existent quand même.

---

**Conclusion:** Architecture identique à Clean avec vocabulaire "ports & adapters" explicite. Si vous aimez le vocabulaire Alistair Cockburn, prenez Hexagonal. Si vous préférez Uncle Bob, prenez Clean. Techniquement, c'est la même chose.
