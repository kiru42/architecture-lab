# Backend #7 : Modular Monolith

**Modules métier fortement cloisonnés dans un seul déployable. Les frontières du microservice, sans la complexité opérationnelle du distribué.**

---

## 📐 Architecture Overview

Chaque **capacité métier** est isolée dans un module autonome (contrôleur + service + repository + DTO). Un **shared kernel** global porte les préoccupations transverses (Prisma, guards, decorators).

```
src/
├── modules/
│   ├── auth/                    # Authentification (signup / signin / me)
│   │   ├── auth.module.ts       # imports: [PassportModule, JwtModule, UsersModule]
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts      # bcrypt + émission JWT
│   │   ├── jwt.strategy.ts
│   │   └── dto/                 # SignUpDto, SignInDto
│   │
│   ├── users/                   # Gestion utilisateurs — module INTERNE
│   │   ├── users.module.ts      # exports: [UsersService]  (aucun controller)
│   │   ├── users.service.ts
│   │   └── users.repository.ts
│   │
│   ├── projects/                # CRUD projets + ownership
│   │   ├── projects.module.ts
│   │   ├── projects.controller.ts
│   │   ├── projects.service.ts  # invariant: owner uniquement
│   │   ├── projects.repository.ts
│   │   └── dto/
│   │
│   ├── tasks/                   # Gestion tâches + complétion
│   │   ├── tasks.module.ts
│   │   ├── tasks.controller.ts
│   │   ├── tasks.service.ts
│   │   ├── tasks.repository.ts
│   │   └── dto/
│   │
│   └── comments/                # Commentaires de tâches
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
├── app.module.ts                # Root module (imports des 6 modules)
└── main.ts                      # Bootstrap — ValidationPipe global, port 3007

test/                            # 4 suites unitaires (23 tests)
├── auth.service.spec.ts
├── projects.service.spec.ts
├── tasks.service.spec.ts
└── comments.service.spec.ts
```

---

## 🧩 Principes du Modular Monolith

### 1. **Modules > Layers**
Contrairement à Layered/Clean/Hexagonal qui découpent **techniquement** (controller/service/data), le Modular Monolith découpe **par capacité métier**. Un module `tasks` est un mini-app vertical : il possède son HTTP, sa logique et sa persistance.

### 2. **Chaque module possède son repository**
Le repository est **privé au module** — pas de repository global partagé :

```typescript
@Injectable()
export class ProjectsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<Project[]> {
    return this.prisma.project.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }
}
```

### 3. **Shared Kernel global**
`shared/` est déclaré `@Global()` : Prisma + guards + decorators sont injectables partout sans import explicite.

```typescript
@Global()
@Module({ providers: [PrismaService], exports: [PrismaService] })
export class SharedModule {}
```

### 4. **Communication inter-modules explicite (DI)**
L'unique lien inter-module est **`AuthModule` → `UsersModule`**, via le système de modules NestJS (pas d'événement, pas d'accès direct à la DB d'un autre module) :

```typescript
@Module({
  imports: [PassportModule, JwtModule.registerAsync({ /* ... */ }), UsersModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
```

`UsersModule` reste **interne** (aucun controller) et n'expose que son `UsersService` :

```typescript
@Module({ providers: [UsersRepository, UsersService], exports: [UsersService] })
export class UsersModule {}
```

### 5. **Base de données unique partagée**
Tous les modules partagent le même schéma Prisma (`prisma/schema.prisma`, PostgreSQL) et le même historique de migrations : transactions ACID natives entre modules, mais migrations coordonnées.

---

## 📊 Metrics

| Métrique | Valeur |
|----------|--------|
| **Fichiers (src)** | 32 |
| **Lignes de code (src)** | ~675 LOC |
| **Modules métier** | 5 (auth, users, projects, tasks, comments) |
| **Shared kernel** | 4 fichiers (prisma, guard, decorator, module) |
| **Repository par module** | 4 (users, projects, tasks, comments) |
| **Tests** | **23** (auth 6, comments 6, projects 5, tasks 6) |
| **LOC / feature** | ~130 |
| **Port** | 3007 |
| **Dépendances** | NestJS (common/core/jwt/passport) + Prisma + bcrypt — **aucun event bus** |

---

## ⚡ Quick Start

```bash
# Dépendances
npm install

# Client Prisma + migrations
npm run prisma:generate
npm run prisma:migrate

# Build
npm run build

# Tests (23)
npm test

# Serveur (port 3007)
npm run start
```

---

## 🧪 Testing Strategy

`jest` + `ts-jest`, une suite par module, exécutée contre le **repository mocké** :

```typescript
const makeRepository = () => ({
  findByUserId: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
});

// ProjectsService n'a qu'un seul collaborateur : la surface de mock est minuscule.
const service = new ProjectsService(repository as unknown as ProjectsRepository);
```

| Suite | Tests | Couvre |
|-------|-------|--------|
| `auth.service.spec.ts` | 6 | signup (conflit email), signin (mauvais mot de passe), getMe, hashage |
| `projects.service.spec.ts` | 5 | listing par user, création, ownership (404 / 403) |
| `tasks.service.spec.ts` | 6 | listing par projet, création, complétion, suppression |
| `comments.service.spec.ts` | 6 | listing par tâche, création et suppression |
| **Total** | **23** | |

**Philosophie** : le service détient les règles (ownership, not-found) et n'a que son repository comme dépendance → on teste le comportement sans toucher Prisma. La surface de mock reste faible (un objet de 4 méthodes), ce qui est précisément l'intérêt du découpage par module.

---

## 🔍 Comparison with Sibling Backends

| Aspect | Layered (#1) | Clean (#2) | Hexagonal (#3) | DDD (#5) | **Modular Monolith (#7)** |
|--------|--------------|------------|----------------|----------|---------------------------|
| **Axe de découpage** | Couches techniques | Couches | Ports/Adapters | Bounded Contexts | **Modules métier** |
| **Ownership du repository** | Global | Port + adapter | Port + adapter | Par context | **Par module** |
| **Ids typés** | ❌ `string` | ❌ `string` | ❌ `string` | ✅ VOs | ❌ primitives |
| **Domain events** | ❌ | ❌ | ❌ | ✅ | ❌ (DI explicite) |
| **LOC / feature** | ~100 | ~167 | ~167 | ~250 | **~130** |
| **Fichiers** | 26 | 53 | 61 | 78 | **32** |
| **Tests** | 28 | 14 | 17 | 24 | **23** |
| **Migration microservices** | ❌ | ⚠️ | ⚠️ | ✅ | ✅ **extraction directe** |
| **Complexité** | Faible | Moyenne | Moyenne | Élevée | **Faible-Moyenne** |

> **À noter** : DDD et Modular Monolith découpent tous deux *par le métier*, mais différemment — DDD isole des **Bounded Contexts** avec un modèle riche (Aggregates, VOs, events), le Modular Monolith isole des **modules** avec un modèle anémique classique mais une frontière de déploiement prête pour l'extraction.

---

## ✅ Pros

1. **Meilleur ratio valeur/complexité** : ~130 LOC/feature pour des frontières de module strictes
2. **Opérations simples** : un seul déployable, pas de réseau, pas de sagas distribuées
3. **Frontières qui préparent le futur** : chaque module peut devenir un microservice (les dépendances sont déjà explicites)
4. **Transactions ACID** inter-modules natives (DB unique)
5. **Latence minimale** : communication in-process (DI), pas de HTTP/gRPC interne
6. **Testabilité** : surface de mock faible (un repository par service) — 23 tests sans Prisma
7. **DX** : debug, tests d'intégration et dev local triviaux

---

## ❌ Cons

1. **Couplage de déploiement** : tout scale ensemble (pas de scaling par module)
2. **Schéma DB partagé** : migrations à coordonner entre modules
3. **Discipline requise** : rien n'empêche *techniquement* un import cross-module sauvage si l'équipe ne fait pas attention
4. **Scaling horizontal grossier** : on réplique l'app entière
5. **Pas de modèle riche** : contrairement à DDD, les entités restent anémiques (pas de VOs/events)
6. **Risque de dérive** : sans garde-fous (lint de frontières), un modular monolith peut redevenir un big ball of mud

---

## 📖 When to Use a Modular Monolith

### ✅ **USE** si :
- Domaine multi-capacités (auth, projets, tâches, …) sur une équipe **unique à taille moyenne**
- Besoin de **frontières claires** mais pas encore de scaling indépendant
- Candidat à une extraction future en microservices (Monolith First)
- Time-to-market important (plus rapide que microservices, mieux structuré que le Layered)
- Petite équipe sans équipe SRE dédiée

### ❌ **AVOID** si :
- Besoin de scaling **indépendant par module** (pic de charge sur un seul domaine)
- Équipes multiples autonomes qui déploient réellement à des rythmes différents → microservices
- Stack polyglotte par domaine (chaque module a besoin d'un langage/framework différent)
- Domaine trivial → un Layered simple suffit

---

## 📚 References

- **Martin Fowler** : [MonolithFirst](https://martinfowler.com/bliki/MonolithFirst.html)
- **Shopify** : [Shopify's Modular Monolith Journey](https://shopify.engineering/shopify-monolith)
- **NestJS** : [Modules](https://docs.nestjs.com/modules)
- **Kamil Grzybek** : *Modular Monolith with DDD* (référence du pattern)

---

## 🎓 Key Learnings

1. **Découper par métier, pas par technique** : le module `tasks` contient *tout* ce dont "task" a besoin — HTTP, logique, persistance
2. **Le repository appartient au module** : pas de repository global partagé ; chaque module pose ses propres requêtes
3. **Communication explicite** : un seul lien inter-module (Auth → Users) via DI — visible et traçable
4. **Global shared kernel** : Prisma/guards injectables partout via `@Global()`, sans polluer les signatures d'import
5. **La frontière = la future couture du microservice** : extraire un module devient mécanique (in-process → HTTP)
6. **Le meilleur compromis pragmatique** de la série : ~130 LOC/feature pour des garanties structurelles là où Layered en donne ~100 sans frontières et DDD en demande ~250

---

**Next Steps** :
- Voir le [comparison matrix](../../docs/comparison-matrix.md) pour le verdict global sur les 7 backends + 4 fronts.
- Piste d'amélioration : ajouter un test de frontière (ESLint `no-cross-module-import`) pour empêcher mécaniquement les imports cross-module non déclarés.
