# ADR-0013: Backend #4 - Onion Architecture

**Status:** Accepted  
**Date:** 2026-05-07  
**Author:** Architecture Lab Experiment

## Context

After implementing **Layered** (#1), **Clean Architecture** (#2), and **Hexagonal** (#3), we build **Onion Architecture** (#4) to complete the architectural comparison. This ADR documents findings on whether Onion is fundamentally different from Clean/Hexagonal, or another naming variation.

## Decision

Implement Onion Architecture following **Jeffrey Palermo's 2008 pattern**:

1. **Core Domain:** Entities with business logic (innermost layer)
2. **Application Services:** Use cases + repository interfaces
3. **Infrastructure:** Prisma adapters + external services + HTTP controllers

### Key Characteristics

- **Concentric Layers:** Dependencies point **inward** toward Domain Core
- **Interface Ownership:** Application layer defines contracts, Infrastructure implements
- **No Framework Coupling:** Domain Core has zero external dependencies
- **DI via Strings:** Use `@Inject('IRepository')` for interface-based injection

## Structure

```
src/
├── core/
│   ├── domain/entities/           # Business entities (User, Project, Task)
│   └── application/
│       ├── interfaces/             # Repository contracts
│       └── services/               # Use cases (Auth, Project, Task)
└── infrastructure/
    ├── persistence/prisma/         # Database adapters
    ├── security/                   # Bcrypt, JWT adapters
    ├── web/                        # HTTP controllers + DTOs
    └── *.module.ts                 # NestJS DI wiring
```

### Dependency Graph

```
Infrastructure (Web) → Application Services → Domain Core
     ↓
Infrastructure (Persistence) → Application Interfaces → Domain Core
```

**Rule:** No layer can reference an outer layer.

## Comparison: Onion vs Clean vs Hexagonal

| Aspect | Clean Architecture | Hexagonal | **Onion** |
|--------|-------------------|-----------|-----------|
| **Metaphor** | Circles/Layers | Ports & Adapters | **Concentric Layers** |
| **Domain Location** | Entities | Domain | **Core/Domain** |
| **Use Cases Location** | Use Cases | Application | **Core/Application** |
| **Interface Location** | Use Cases | Ports OUT | **Core/Application** |
| **Adapter Location** | Infrastructure | Adapters | **Infrastructure** |
| **Dependency Rule** | Inward | Inward | **Inward** |
| **LOC/feature** | ~167 | ~167 | **~170** |
| **Mock Surface** | 4 interfaces | 4 ports | **3 interfaces** |
| **DI Tokens** | Class-based | Class-based | **String-based** |

### Structural Analysis

All three architectures produce **identical dependency graphs**:

```
Presentation → Application → Domain
     ↓
Infrastructure → Application → Domain
```

**Conclusion:** Onion, Clean, and Hexagonal are **the same pattern with different terminology**.

### Naming Differences

| Onion | Clean | Hexagonal |
|-------|-------|-----------|
| Core/Domain | Entities | Domain |
| Core/Application | Use Cases | Application + Ports IN |
| Infrastructure | Infrastructure | Adapters (Primary + Secondary) |
| Interfaces | Use Case Interfaces | Ports OUT |

## Implementation Specifics

### Challenge 1: TypeScript Interfaces as DI Tokens

**Problem:** TypeScript interfaces are erased at runtime, can't be used as DI tokens.

**Solution:** String tokens + manual injection:

```typescript
// Module
{ provide: 'IUserRepository', useClass: PrismaUserRepository }

// Service
constructor(@Inject('IUserRepository') private repo: IUserRepository) {}
```

**Trade-off:** Less type-safe than class-based tokens (Clean/Hexagonal use abstract classes).

### Challenge 2: Domain Core Purity

**Goal:** Domain has **zero framework dependencies**.

**Implementation:**
- Entities are **pure TypeScript classes** (no decorators)
- No `@nestjs`, no Prisma imports in `core/domain/`
- Business logic methods (`assignTo()`, `updateStatus()`) remain framework-agnostic

**Benefit:** Domain code can be extracted to shared library for multiple apps.

### Challenge 3: Application Services vs Domain Services

**Onion Ambiguity:** Where do "domain services" live if they need infrastructure?

**Resolution:**
- **Domain Services (pure):** Belong in `core/domain/services/` (if they exist)
- **Application Services:** Live in `core/application/services/` (orchestrate use cases)
- **Our Implementation:** No pure domain services needed (all logic fits in entities)

## Metrics

### Implementation Effort

| Metric | Backend #1 (Layered) | Backend #4 (Onion) | Difference |
|--------|---------------------|-------------------|-----------|
| LOC/feature | 100 | 170 | **+70%** |
| First feature time | 1.5h | 2.5h | **+67%** |
| Test mock methods | 20+ (Prisma) | 3 (interfaces) | **-85%** |
| Business logic files | 3 (services) | 3 (entities) | **Same** |

### Test Results

- **Domain Tests:** 8/8 passing (Project, Task entities)
- **Coverage:** 100% for tested entities
- **Mock Surface:** 3 interface methods (vs 4 in Clean/Hexagonal, 20+ in Layered)

### Code Quality

**Pros:**
- ✅ Domain logic isolated and testable
- ✅ Changing database = swap one adapter
- ✅ Zero framework coupling in domain core

**Cons:**
- ⚠️ String-based DI less type-safe than class tokens
- ⚠️ More boilerplate than Clean/Hexagonal (due to string tokens)
- ⚠️ Same indirection overhead as Clean/Hexagonal (+70% code)

## When to Use Onion Architecture

### ✅ Use When:

1. **Complex Domain Logic:** Business rules need isolation from framework
2. **Multiple Persistence Options:** Might swap PostgreSQL → MongoDB → Event Sourcing
3. **Long-Term Maintenance:** Team will maintain this for 3+ years
4. **Testing Priority:** High test coverage on business logic required
5. **Team Prefers "Layers":** Team already familiar with layered thinking

### ❌ Avoid When:

1. **MVP/Prototype:** Layered (#1) is 67% faster for first feature
2. **CRUD-Heavy:** No complex domain logic (Layered is sufficient)
3. **Small Team (<3):** Maintenance overhead of extra layers not justified
4. **TypeScript-Only:** Clean/Hexagonal with abstract classes are more type-safe

## Key Findings

### Finding #1: Onion ≈ Clean Architecture

**Evidence:**
- Same dependency rule (inward)
- Same layer structure (Domain → Application → Infrastructure)
- Same LOC/feature (~170)
- Same test surface (3-4 interface mocks)

**Only Difference:** Naming convention

**Verdict:** Onion and Clean are **structurally identical**.

### Finding #2: Onion ≈ Hexagonal Architecture

**Evidence:**
- Both use interfaces between layers
- Both allow swapping infrastructure
- Both isolate domain from framework
- LOC difference: 170 (Onion) vs 167 (Hexagonal) = **2% variance**

**Only Difference:** Hexagonal uses "Ports/Adapters" terminology, Onion uses "Layers"

**Verdict:** Onion and Hexagonal are **structurally identical**.

### Finding #3: String Tokens = Unnecessary Complexity

**Why String Tokens:**
- TypeScript interfaces can't be DI tokens
- NestJS requires runtime-available values

**Alternative (used in Clean/Hexagonal):**
- Use **abstract classes** instead of interfaces
- Class tokens work in DI without strings
- Same abstraction power, better type safety

**Verdict:** String tokens are a **workaround**, not inherent to Onion. Clean/Hexagonal implementations avoid this with abstract classes.

### Finding #4: All Three Architectures Are The Same

| Architecture | Metaphor | Practical Result |
|-------------|----------|-----------------|
| Clean | Concentric circles | Inward dependencies |
| Hexagonal | Ports & Adapters | Inward dependencies |
| Onion | Concentric layers | Inward dependencies |

**Conclusion:** All three produce **identical dependency graphs**. Choice between them is **cosmetic** (team preference for terminology).

## Recommendations

### For New Projects

1. **Start with Layered (#1)** if:
   - Building MVP/prototype
   - Domain logic is simple CRUD
   - Speed to market > long-term flexibility

2. **Use Onion/Clean/Hexagonal** if:
   - Domain complexity is high (complex business rules)
   - Need to swap infrastructure (database, auth providers)
   - Team size > 5 (benefits from clear boundaries)

### For Existing Projects

1. **Migrate from Layered → Onion** when:
   - Business logic scattered across services (hard to test)
   - Need to support multiple databases
   - Test coverage < 50% due to Prisma coupling

2. **Stay on Layered** if:
   - Current structure works well
   - No plans to change database/framework
   - Team < 3 people

### Onion vs Clean vs Hexagonal?

**Pick based on team culture:**
- **Onion:** Team likes "layers" thinking (familiar from OSI model, networking)
- **Clean:** Team follows Uncle Bob's books/talks
- **Hexagonal:** Team likes "ports & adapters" terminology (API-first thinking)

**Technical Difference:** None. All are the same pattern.

## Consequences

### Positive

- ✅ Domain logic completely isolated from framework
- ✅ Easy to swap Prisma → another ORM
- ✅ Testable with 85% fewer mocks vs Layered
- ✅ Same benefits as Clean/Hexagonal

### Negative

- ⚠️ +70% code overhead vs Layered
- ⚠️ String-based DI less type-safe than abstract classes
- ⚠️ Learning curve for junior developers
- ⚠️ No practical advantage over Clean/Hexagonal

### Neutral

- 📝 Architecture choice is cosmetic (Onion vs Clean vs Hexagonal)
- 📝 Real choice is **domain-centric** (Onion/Clean/Hexagonal) vs **data-centric** (Layered)

## References

- Jeffrey Palermo (2008): [The Onion Architecture](https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/)
- Backend #2 ADR: Clean Architecture (ADR-0011)
- Backend #3 ADR: Hexagonal Architecture (ADR-0012)
- Comparison Lab Root README

## Appendix: Migration Path from Layered

If migrating from **Layered** (#1) to **Onion** (#4):

1. **Extract business logic** from services → entities
2. **Create interfaces** for repositories in `application/`
3. **Move Prisma code** to `infrastructure/persistence/`
4. **Invert dependencies** (services depend on interfaces, not Prisma)
5. **Update DI** (use string tokens or abstract classes)

**Estimated effort:** 3-5 days for medium project (5-10 entities)

---

**Final Verdict:** Onion Architecture is a **solid choice** for domain-centric applications. However, it's **not different** from Clean or Hexagonal — pick the one whose naming your team prefers. For MVPs, Layered remains the pragmatic winner.
