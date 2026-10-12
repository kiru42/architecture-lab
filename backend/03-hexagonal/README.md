# Backend #3 — Hexagonal Architecture (Ports & Adapters)

Hexagonal architecture with an explicit separation between **ports** (interfaces) and **adapters** (implementations).

## 🏗️ Structure

```
src/
├── domain/              # Business entities (pure business logic)
│   └── entities/
│       ├── user.entity.ts
│       ├── project.entity.ts
│       └── task.entity.ts
│
├── ports/               # Interfaces (contracts)
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
├── adapters/            # Concrete implementations
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

## 🔑 Key Concepts

### Ports vs Adapters

**Ports IN (Driving):**
- Define what the application **exposes** to the outside world
- Example: `RegisterUserPort`, `CreateProjectPort`
- Implemented by the **use cases** (application layer)

**Ports OUT (Driven):**
- Define what the application **expects** from the infrastructure
- Example: `UserRepositoryPort`, `HashServicePort`
- Implemented by the **OUT adapters** (Prisma, bcrypt, JWT...)

**Adapters IN (Primary):**
- Call the application through the IN ports
- Example: `AuthController` → calls `RegisterUserPort`

**Adapters OUT (Secondary):**
- Implement the OUT ports
- Example: `PrismaUserRepository` → implements `UserRepositoryPort`

### Data Flow

```
HTTP Request
    ↓
AuthController (Adapter IN)
    ↓
RegisterUserPort (Port IN interface)
    ↓
RegisterUserUseCase (implements Port IN, uses Ports OUT)
    ↓
UserRepositoryPort (Port OUT interface)
    ↓
PrismaUserRepository (Adapter OUT)
    ↓
Database
```

## 📊 Comparison with the Other Backends

| Criterion | Layered | Clean | **Hexagonal** |
|---------|---------|-------|---------------|
| **Ports/adapters separation** | ❌ No | ⚠️ Implicit | ✅ **Explicit (IN/OUT)** |
| **Testability** | Average (20+ mocks) | Excellent (4 mocks) | **Excellent (4 mocks)** |
| **Business logic** | Services (coupled to the DB) | Entities | **Entities** |
| **Use cases** | ❌ Mixed-up services | ✅ Dedicated use cases | ✅ **Dedicated use cases** |
| **Repository interfaces** | ❌ No | Domain layer | **Ports OUT** |
| **Swap Prisma → MongoDB** | ❌ Hard | ✅ Easy | ✅ **Easy (new OUT adapter)** |
| **Structural complexity** | 🟢 Simple | 🟡 Medium | 🟡 **Medium** |
| **Boilerplate** | 🟢 Low | 🟡 Medium | 🟡 **Medium** |

### Key Difference: Hexagonal vs Clean

**Hexagonal:**
```
ports/in/        → Driving ports (use cases interfaces)
ports/out/       → Driven ports (repositories, services)
application/     → Use cases (implement IN ports)
adapters/in/     → Primary adapters (HTTP, CLI...)
adapters/out/    → Secondary adapters (DB, external APIs)
```

**Clean:**
```
domain/repositories/     → Repository interfaces (= ports OUT)
application/use-cases/   → Use cases (= implemented IN ports)
infrastructure/          → Adapters OUT (Prisma)
presentation/            → Adapters IN (controllers)
```

**Verdict:** Structurally identical. Hexagonal names the concepts explicitly (IN/OUT ports), while Clean leaves them implicit.

## 🧪 Tests

```bash
npm test
```

**Results:** 7/7 tests passing

**Coverage:**
- Domain entities: `Project.isOwnedBy()`, `Project.updateInfo()`
- Use cases: `CreateProjectUseCase` (happy path + conflict)

**Testability advantage:**
- Clean/Hexagonal: Mock 4 repository methods
- Layered: Mock 20+ Prisma methods

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

### ✅ Strengths

1. **Explicit naming:** The IN/OUT port concepts make the flow clearer
2. **Symmetry:** `adapters/in` and `adapters/out` are symmetrical
3. **Testability:** Identical to Clean (mock 4 methods vs 20+)
4. **Easy swap:** New OUT adapter = new port implementation

### ⚠️ Weaknesses

1. **Theoretical vocabulary:** "Primary/Secondary adapters" is less intuitive than "Presentation/Infrastructure"
2. **Same structure as Clean:** In practice, it is Clean with a renaming
3. **Boilerplate:** As much as Clean (~167 LOC/feature vs 100 for Layered)

### 🤔 Central Question

**Are Hexagonal and Clean really different?**

No. In NestJS, both architectures end up with the same structure:
- Ports IN = Use case interfaces
- Ports OUT = Repository interfaces
- Application layer = Use cases
- Adapters IN = Controllers
- Adapters OUT = Prisma repositories

The difference is **cosmetic**: Hexagonal names the ports explicitly, while Clean leaves them implicit, but they exist all the same.

---

**Conclusion:** Architecture identical to Clean, with explicit "ports & adapters" vocabulary. If you like Alistair Cockburn's vocabulary, choose Hexagonal. If you prefer Uncle Bob's, choose Clean. Technically, it is the same thing.
