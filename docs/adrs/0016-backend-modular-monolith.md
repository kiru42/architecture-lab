# ADR 0016: Backend Architecture - Modular Monolith

**Date:** 2025-05-09  
**Status:** Accepted  
**Deciders:** Architecture Lab Team

## Context

The Modular Monolith pattern represents a pragmatic middle ground between traditional monolithic architectures and microservices. It organizes code into self-contained, loosely-coupled modules within a single deployable unit, enabling teams to achieve many benefits of microservices (clear boundaries, independent development) without the operational complexity of distributed systems.

This is the 7th and final backend architecture in the Architecture Lab comparison project.

## Decision

We implement a **Modular Monolith** architecture with the following characteristics:

### Module Structure

Each business capability is isolated into an independent module:

```
src/
├── modules/
│   ├── auth/              # Authentication & authorization
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   └── dto/
│   ├── users/             # User management
│   ├── projects/          # Project CRUD
│   ├── tasks/             # Task management
│   └── comments/          # Comment system
├── shared/                # Cross-cutting concerns
│   ├── prisma/            # Database access
│   ├── guards/            # Auth guards
│   └── decorators/        # Custom decorators
└── main.ts
```

### Key Principles

1. **Module Independence**: Each module encapsulates its domain logic, controllers, services, repositories, and DTOs
2. **Explicit Dependencies**: Modules communicate through well-defined interfaces (NestJS modules)
3. **Shared Kernel**: Common infrastructure (Prisma, guards, decorators) in `shared/`
4. **Single Database**: All modules share the same Prisma schema (monolithic deployment)
5. **Module Boundaries**: No direct cross-module imports (only through exported module APIs)

### Implementation Details

**Technology Stack:**
- NestJS 10+ (module system)
- Prisma ORM (shared database layer)
- PostgreSQL (single database)
- JWT authentication (shared guard)
- TypeScript 5+

**Module Pattern:**
```typescript
@Module({
  imports: [SharedModule],  // Access to Prisma, guards
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectsRepository],
  exports: [ProjectsService],  // For cross-module use
})
export class ProjectsModule {}
```

**Repository Pattern per Module:**
Each module owns its repository for database access:

```typescript
@Injectable()
export class ProjectsRepository {
  constructor(private prisma: PrismaService) {}
  
  findAll(userId: string) {
    return this.prisma.project.findMany({ where: { userId } });
  }
}
```

**Cross-Module Communication:**
Modules communicate via NestJS dependency injection:

```typescript
@Module({
  imports: [UsersModule],  // Import user functionality
  // ...
})
export class ProjectsModule {}
```

## Consequences

### Advantages

✅ **Simpler Operations**: Single deployment, no distributed system complexity  
✅ **Faster Development**: No network overhead for module communication  
✅ **Clear Boundaries**: Modules enforce separation of concerns  
✅ **Easy Refactoring**: Can extract modules to microservices later if needed  
✅ **ACID Transactions**: Single database enables cross-module transactions  
✅ **Lower Latency**: In-process communication is faster than HTTP/gRPC  
✅ **Better DX**: Easier debugging, testing, and local development

### Trade-offs

⚠️ **Deployment Coupling**: All modules deploy together (can't scale independently)  
⚠️ **Database Sharing**: All modules share one schema (migration coordination needed)  
⚠️ **Module Discipline**: Requires team discipline to respect module boundaries  
⚠️ **Scaling Limits**: Horizontal scaling is coarse-grained (entire app scales together)

### Comparison to Other Patterns

| Aspect | Modular Monolith | Microservices | Layered |
|--------|------------------|---------------|---------|
| **Deployment** | Single unit | Independent services | Single unit |
| **Module isolation** | High (enforced) | Very high (physical) | Low (logical) |
| **Operational complexity** | Low | High | Low |
| **Scalability** | Vertical + horizontal (coarse) | Independent scaling | Vertical only |
| **Transaction support** | Native ACID | Distributed sagas | Native ACID |
| **Development speed** | Fast | Slower (network/contracts) | Fastest |

## Migration Path

**To Microservices:**
1. Identify module boundaries (already defined)
2. Extract module to separate NestJS app
3. Replace in-process calls with HTTP/gRPC
4. Split database (if needed)
5. Deploy independently

**Example:**
```typescript
// Before (in-process)
constructor(private usersService: UsersService) {}

// After (HTTP)
constructor(private httpService: HttpService) {}
const user = await this.httpService.get('/users/...');
```

## Files Created

```
backend/07-modular-monolith/
├── src/
│   ├── modules/
│   │   ├── auth/          # Auth module
│   │   ├── users/         # User module
│   │   ├── projects/      # Projects module
│   │   ├── tasks/         # Tasks module
│   │   └── comments/      # Comments module
│   ├── shared/
│   │   ├── prisma/
│   │   ├── guards/
│   │   └── decorators/
│   └── main.ts
├── prisma/
│   └── schema.prisma
├── package.json
└── tsconfig.json
```

## References

- [NestJS Modules Documentation](https://docs.nestjs.com/modules)
- [Modular Monolith Pattern (Martin Fowler)](https://martinfowler.com/bliki/MonolithFirst.html)
- [Shopify's Modular Monolith Journey](https://shopify.engineering/shopify-monolith)
