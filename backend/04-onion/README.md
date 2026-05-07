# Backend #4: Onion Architecture

**Status:** ✅ Implemented  
**Framework:** NestJS + TypeScript  
**ORM:** Prisma  
**Database:** PostgreSQL

## Architecture Overview

Onion Architecture (Jeffrey Palermo, 2008) organizes code in **concentric layers** with dependencies pointing **inward**:

```
┌─────────────────────────────────────┐
│  Infrastructure (Presentation)      │  ← Controllers, DTOs, HTTP
├─────────────────────────────────────┤
│  Infrastructure (Persistence)       │  ← Repositories, External Services
├─────────────────────────────────────┤
│  Application Services               │  ← Use Cases + Repository Interfaces
├─────────────────────────────────────┤
│  Domain Core                        │  ← Entities + Business Logic
└─────────────────────────────────────┘
        ↑ Dependencies point inward
```

### Structure

```
src/
├── core/                          # Inner layers (domain-centric)
│   ├── domain/
│   │   └── entities/              # Pure business entities
│   │       ├── user.entity.ts
│   │       ├── project.entity.ts
│   │       └── task.entity.ts
│   └── application/
│       ├── interfaces/            # Repository & service contracts
│       │   ├── *-repository.interface.ts
│       │   ├── hash-service.interface.ts
│       │   └── jwt-service.interface.ts
│       └── services/              # Application use cases
│           ├── auth.service.ts
│           ├── project.service.ts
│           └── task.service.ts
│
└── infrastructure/                # Outer layer (implementation details)
    ├── persistence/
    │   ├── prisma/                # Database adapters
    │   │   ├── user.repository.ts
    │   │   ├── project.repository.ts
    │   │   └── task.repository.ts
    │   └── prisma.module.ts
    ├── security/                  # External service adapters
    │   ├── bcrypt-hash.service.ts
    │   └── jwt-token.service.ts
    ├── web/                       # HTTP presentation layer
    │   ├── controllers/
    │   ├── dto/
    │   └── middleware/
    ├── auth.module.ts
    ├── project.module.ts
    ├── task.module.ts
    └── app.module.ts
```

### Dependency Flow

**Key Rule:** Inner layers **never depend** on outer layers.

- **Domain** → no dependencies (pure business logic)
- **Application** → depends on **Domain** only (interfaces live here)
- **Infrastructure** → implements interfaces from **Application**, calls **Domain**

### Dependency Injection Pattern

Uses **string tokens** for interface-based DI (TypeScript limitation):

```typescript
// Module registration
{ provide: 'IProjectRepository', useClass: PrismaProjectRepository }

// Service injection
constructor(@Inject('IProjectRepository') private readonly repo: IProjectRepository) {}
```

## Comparison with Backend #1-3

| Aspect | Layered (#1) | Clean (#2) | Hexagonal (#3) | **Onion (#4)** |
|--------|-------------|-----------|---------------|---------------|
| **Dependency Rule** | Top-down | Inward | Inward (ports) | **Inward (layers)** |
| **Business Logic** | Services | Entities | Entities | **Entities** |
| **Interface Location** | Infrastructure | Application | Ports (out) | **Application** |
| **Testability** | Hard | Easy | Easy | **Easy** |
| **Structure** | 3 layers | 4 layers | 4 layers | **3 concentric** |
| **DI Tokens** | Class | Class | Class | **Strings** |

### Key Differences

1. **vs Layered (#1):**
   - Onion: Dependencies point **inward** → domain is isolated
   - Layered: Dependencies flow **downward** → presentation depends on infrastructure

2. **vs Clean Architecture (#2):**
   - Onion: Interfaces in **Application** layer
   - Clean: Interfaces in **Use Cases** (same conceptual location)
   - **Conclusion:** Structurally **identical**, only naming differs

3. **vs Hexagonal (#3):**
   - Onion: Uses **concentric layers** metaphor
   - Hexagonal: Uses **ports & adapters** metaphor
   - **Conclusion:** Same pattern, different visualization

## Metrics

- **LOC/feature:** ~170 (similar to Clean/Hexagonal)
- **Implementation time:** 2.5h (same as Clean/Hexagonal)
- **Tests:** 8 domain tests (Project, Task entities)
- **Test coverage:** Domain entities only (100% for tested files)
- **Mock surface:** 3 interface methods (user, project, task repos)

## Key Learnings

### ✅ What Works

1. **Concentric Layers:** Visual metaphor helps understand dependency flow
2. **Domain-Centric:** Business logic isolated in innermost layer
3. **Easy Swap:** Changing Prisma → another DB = new adapter implementation
4. **Testing:** Mock 3 interfaces vs 20+ Prisma methods (Layered)

### ⚠️ Trade-offs

1. **Indirection:** More files than Layered (170 LOC vs 100)
2. **String Tokens:** TypeScript interfaces can't be DI tokens (needs workaround)
3. **Initial Overhead:** +67% code for first feature vs Layered
4. **Same as Clean/Hexagonal:** No structural difference beyond naming

## Verdict

**Onion Architecture = Clean Architecture = Hexagonal Architecture**

All three are **structurally identical**:
- Domain Core (entities) at center
- Application layer (use cases) wrapping domain
- Infrastructure layer (adapters) at edges
- Dependencies point inward

**Choose based on team preference:**
- **Onion** → If team likes "layers" metaphor
- **Clean** → If team follows Uncle Bob
- **Hexagonal** → If team likes "ports & adapters" terminology

For **pragmatic startups:** Layered (#1) is 67% faster for MVP. Refactor to Onion/Clean/Hexagonal when domain complexity justifies the investment.

## Running

```bash
# Install
npm install

# Copy Prisma client (if needed)
cp -r ../../node_modules/.prisma node_modules/

# Build
npm run build

# Test
npm test  # 8/8 tests passing

# Run (requires PostgreSQL)
npm start
```

**Environment:** See `.env.example`

**API:** Same endpoints as Backend #1-3 (register, login, projects, tasks)
