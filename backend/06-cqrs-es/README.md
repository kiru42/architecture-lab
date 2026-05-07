# Backend #6 : CQRS + Event Sourcing

**Complete CQRS + Event Sourcing implementation with event store, write/read separation, and event-driven projections.**

---

## 📐 Architecture Overview

```
src/
├── event-store/
│   └── event-store.interface.ts    # IEventStore contract
│
├── infrastructure/
│   ├── event-store/
│   │   ├── in-memory-event-store.ts   # Append-only event log
│   │   └── event-replayer.ts          # Rebuild projections on startup
│   ├── read-models/
│   │   └── in-memory-user-read-repository.ts  # Denormalized read store
│   └── http/
│       └── auth.controller.ts         # REST endpoints
│
├── write-side/                      # Command Side (CQRS)
│   ├── aggregates/
│   │   ├── aggregate-root.ts          # Base for event-sourced aggregates
│   │   └── user.aggregate.ts          # User aggregate (reconstituted from events)
│   ├── commands/
│   │   ├── register-user.command.ts
│   │   └── login-user.command.ts
│   └── command-handlers/
│       ├── register-user.handler.ts   # Appends events to event store
│       └── login-user.handler.ts
│
├── read-side/                       # Query Side (CQRS)
│   ├── projections/
│   │   └── user-read-model.ts         # Denormalized view
│   ├── queries/
│   │   ├── get-users.query.ts
│   │   └── get-user-by-id.query.ts
│   ├── query-handlers/
│   │   ├── get-users.handler.ts       # Reads from projection
│   │   └── get-user-by-id.handler.ts
│   └── event-handlers/
│       └── user-registered.handler.ts # Builds projection from events
│
└── shared/
    └── events/
        ├── event.interface.ts         # IEvent base
        └── user-registered.event.ts
```

---

## 🎯 Core Concepts

### 1. **Event Sourcing**

**Traditional approach** :
```
User { id, email, name } → stored in DB
```

**Event Sourcing** :
```
Events (append-only log):
  1. UserRegistered { email: "john@example.com", name: "John" }
  2. UserNameUpdated { name: "John Doe" }
  3. UserEmailChanged { email: "john.doe@example.com" }

→ Current state = replay all events
```

**Benefits** :
- ✅ **Complete audit trail** : every change is an event
- ✅ **Temporal queries** : "What was the state on 2024-01-01?"
- ✅ **Debugging** : replay events to understand bugs
- ✅ **Event-driven** : other services listen to events

### 2. **CQRS (Command Query Responsibility Segregation)**

**Write Side (Commands)** :
```typescript
RegisterUserCommand → RegisterUserHandler
  → User.register() → UserRegisteredEvent
  → EventStore.appendEvents()
```

**Read Side (Queries)** :
```typescript
GetUsersQuery → GetUsersHandler
  → UserReadRepository.findAll()
  → Return denormalized UserReadModel[]
```

**Separation** :
- Write: optimized for **consistency** (event store = single source of truth)
- Read: optimized for **performance** (denormalized views, indexes)

### 3. **Event Store**

**Interface** :
```typescript
interface IEventStore {
  appendEvents(aggregateId, events, expectedVersion)  // Write
  getEvents(aggregateId)                              // Read (for reconstitution)
  getEventsByType(eventType)                          // Read (for projections)
}
```

**Implementation** (InMemoryEventStore) :
- Append-only log (events never deleted/modified)
- **Optimistic locking** : `expectedVersion` prevents concurrent writes
- Stores events as `{ eventId, aggregateId, eventType, version, timestamp, data }`

### 4. **Aggregates (Event-Sourced)**

**Traditional aggregate** :
```typescript
class User {
  constructor(public id, public email, public name) {}
}
```

**Event-sourced aggregate** :
```typescript
class User extends AggregateRoot {
  static register(...): User {
    const user = new User(id);
    user.applyEvent(new UserRegisteredEvent(...));
    return user;
  }

  static fromHistory(events): User {
    const user = new User(id);
    user.loadFromHistory(events);  // Replay events
    return user;
  }

  private onUserRegistered(event) {
    this.email = event.data.email;
    this.name = event.data.name;
  }
}
```

**State is rebuilt by replaying events !**

### 5. **Projections (Read Models)**

**Event Handler** builds denormalized views :
```typescript
@EventsHandler(UserRegisteredEvent)
class UserRegisteredHandler {
  handle(event: UserRegisteredEvent) {
    const user = new UserReadModel(
      event.aggregateId,
      event.data.email,
      event.data.name,
      event.timestamp
    );
    this.readRepo.save(user);  // Denormalized store (can be Redis/Elastic/Postgres)
  }
}
```

**Projections are eventual consistent** : small delay between write and read.

---

## 📊 Metrics

| Métrique | Valeur |
|----------|--------|
| **Total LOC** | ~1,100 |
| **Write Side LOC** | ~350 |
| **Read Side LOC** | ~250 |
| **Event Store LOC** | ~150 |
| **Fichiers** | 33 |
| **Tests** | 9 (event store, aggregates, projections) |
| **Commands** | 2 (RegisterUser, LoginUser) |
| **Queries** | 2 (GetUsers, GetUserById) |
| **Events** | 1 (UserRegistered) |
| **Projections** | 1 (UserReadModel) |

---

## 🔄 Data Flow

### Write Flow (Command)
```
1. POST /auth/register { email, password, name }
   ↓
2. AuthController → CommandBus.execute(RegisterUserCommand)
   ↓
3. RegisterUserHandler:
   - User.register() → emits UserRegisteredEvent
   - EventStore.appendEvents([event])
   ↓
4. EventStore stores event in append-only log
   ↓
5. Event published to EventBus
   ↓
6. UserRegisteredHandler (projection):
   - Builds UserReadModel from event
   - Saves to InMemoryUserReadRepository
```

### Read Flow (Query)
```
1. GET /auth/users
   ↓
2. AuthController → QueryBus.execute(GetUsersQuery)
   ↓
3. GetUsersHandler:
   - Reads from UserReadRepository (NOT event store!)
   - Returns UserReadModel[]
   ↓
4. Response: [{ id, email, name, registeredAt }]
```

**Key insight** : Reads **never hit the event store** (too slow), they use projections.

---

## ⚡ Quick Start

```bash
# Install
npm install

# Build
npm run build

# Run tests
npm test

# Start server (port 3006)
npm start
```

**On startup** :
- EventReplayer rebuilds all projections from event store
- Ready to accept commands + queries

---

## 🧪 Testing Strategy

### Write Side (3/3 tests)
```bash
npm test test/write-side
```

**Coverage** :
- ✅ EventStore: append, optimistic locking, version conflict
- ✅ User Aggregate: register (emits event), reconstitute from history

### Read Side (3/3 tests)
```bash
npm test test/read-side
```

**Coverage** :
- ✅ Projection: build read model from events
- ✅ Queries: findById, findByEmail, findAll

### Integration (3/3 tests)
- ✅ Event Store + Aggregate integration
- ✅ Projection rebuild from events

---

## 🎯 CQRS + Event Sourcing Key Patterns

| Pattern | Implémentation |
|---------|----------------|
| **Event Store** | Append-only log with optimistic locking |
| **Aggregate (Event-Sourced)** | State reconstituted by replaying events |
| **Commands** | Append events to event store (write) |
| **Queries** | Read from projections (denormalized views) |
| **Projections** | Built by event handlers (eventual consistency) |
| **Temporal Queries** | Replay events to any point in time |
| **Audit Trail** | Every change is an immutable event |
| **Event Replayer** | Rebuilds projections from scratch |

---

## ✅ Pros

### 1. **Complete Audit Trail**
```typescript
// Every action is an event
UserRegisteredEvent { timestamp: "2024-01-01T10:00:00Z", email: "john@example.com" }
UserNameUpdatedEvent { timestamp: "2024-01-05T14:30:00Z", name: "John Doe" }
```
**Use case** : compliance, debugging, forensics.

### 2. **Temporal Queries**
```typescript
// Replay events to 2024-01-01
const events = await eventStore.getEventsUntil(userId, new Date('2024-01-01'));
const user = User.fromHistory(events);
// → State of user on 2024-01-01
```

### 3. **Event-Driven Architecture**
```typescript
// Other services listen to events
@EventsHandler(UserRegisteredEvent)
class SendWelcomeEmailHandler {
  handle(event) {
    emailService.sendWelcome(event.data.email);
  }
}
```
**Zero coupling** between User context and Email service.

### 4. **Separate Read/Write Optimization**
- **Write** : optimized for consistency (event store = ACID)
- **Read** : optimized for speed (denormalized, cached, indexed)

### 5. **Scalability**
- Event store : **write-optimized** (append-only)
- Projections : **read-optimized** (can use Redis, ElasticSearch, etc.)
- Scale independently

### 6. **Debugging Superpowers**
```typescript
// Replay events to reproduce bug
const events = await eventStore.getEvents(aggregateId);
const aggregate = Aggregate.fromHistory(events);
// Step through events to find where it broke
```

### 7. **Schema Evolution**
```typescript
// Old event
UserRegisteredEvent { email, name }

// New field added
UserRegisteredEvent { email, name, phoneNumber }

// Old events still work (upcasting pattern)
```

---

## ❌ Cons

### 1. **Complexity**
- **3x more code** than simple CRUD
- Need to understand CQRS + Event Sourcing concepts
- Learning curve steep

### 2. **Eventual Consistency**
```typescript
// Write
await commandBus.execute(new RegisterUserCommand(...));

// Read (might not see new user immediately!)
const users = await queryBus.execute(new GetUsersQuery());
```
**Problem** : projection rebuild takes time (milliseconds to seconds).

### 3. **Event Schema Management**
- Events are **immutable** → can't change schema
- Need **upcasting** / **event versioning** for evolution
- Complex migration strategy

### 4. **Storage Growth**
- Event store grows **forever** (append-only)
- Need **snapshots** for old aggregates
- Disk space can explode

### 5. **Queries are Hard**
```typescript
// Easy with SQL
SELECT * FROM users WHERE age > 30 AND city = 'Paris'

// Hard with Event Sourcing
// → Need to build a specific projection for this query
// → Or scan all events (slow!)
```

### 6. **Tooling**
- No mature event store for Node.js (EventStore DB exists but overkill)
- Need custom infrastructure
- Monitoring/debugging more complex

### 7. **Over-Engineering for Simple Apps**
- CRUD app → Event Sourcing is **overkill**
- 80% of apps don't need complete audit trail

---

## 🔍 Comparison with DDD (#5)

| Aspect | DDD (#5) | **CQRS + ES (#6)** |
|--------|----------|-------------------|
| **State Storage** | DB stores current state | **Event Store** stores events |
| **Aggregates** | Hold current state | **Reconstituted** from events |
| **Audit Trail** | ❌ Manual logging | ✅ **Built-in** (all events) |
| **Temporal Queries** | ❌ Not possible | ✅ **Replay to any point in time** |
| **Read/Write** | Same models | **Separate** (CQRS) |
| **Consistency** | Immediate | **Eventual** (projections) |
| **Complexity** | High | **Very High** |
| **Use Case** | Complex domain | **Audit-critical** + complex domain |

**CQRS + ES complements DDD** :
- DDD : tactical patterns (Aggregates, VOs, Events)
- CQRS + ES : **storage pattern** (event store + projections)

---

## 🎓 When to Use CQRS + Event Sourcing

### ✅ **USE CQRS + ES** IF:

1. **Audit trail is critical**
   - Banking (all transactions logged)
   - Healthcare (patient history)
   - Legal (compliance requirements)

2. **Temporal queries needed**
   - "What was the portfolio value on 2024-01-01?"
   - "Replay user session to understand bug"

3. **Event-driven system**
   - Microservices communicate via events
   - Need event replay (Kafka, RabbitMQ)

4. **High read/write ratio**
   - Writes : 10/sec
   - Reads : 10,000/sec
   - → Separate optimization makes sense

### ⚠️ **USE CQRS (without ES)** IF:

- Need read/write separation (performance)
- But **don't need** full event history
- **DDD #5** already does this (Commands + Queries)

### ❌ **AVOID CQRS + ES** IF:

1. **Simple CRUD**
   - Admin panel, backoffice
   - No audit requirements

2. **Immediate consistency required**
   - Bank transfers (can't be eventual!)
   - → Use traditional transactions

3. **Team lacks experience**
   - CQRS + ES is **very complex**
   - High risk of bugs

4. **Queries are complex/ad-hoc**
   - Reporting with 50+ dimensions
   - → Projections become nightmare

---

## 📚 References

### Books
- **Greg Young** — "Versioning in an Event Sourced System" (2011)
- **Vaughn Vernon** — "Implementing Domain-Driven Design" (2013) — Chapter 8 (CQRS/ES)
- **Martin Fowler** — [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- **CQRS Journey** (Microsoft Patterns & Practices, 2013)

### Articles
- [CQRS by Martin Fowler](https://martinfowler.com/bliki/CQRS.html)
- [Event Sourcing by Martin Fowler](https://martinfowler.com/eaaDev/EventSourcing.html)
- [Greg Young - CQRS & Event Sourcing](https://cqrs.files.wordpress.com/2010/11/cqrs_documents.pdf)

### Event Store Implementations
- **EventStore DB** : https://www.eventstore.com/ (production-ready)
- **Axon Framework** : Java-based CQRS/ES framework
- **Marten** : Event Store for .NET + PostgreSQL

---

## 🎯 Key Learnings

1. **Event Sourcing ≠ CQRS** : can use separately
2. **Events = Source of Truth** : DB is just a cache (projection)
3. **Aggregates are Ephemeral** : reconstituted from events, not stored
4. **Projections = Eventual Consistency** : delay between write and read
5. **Snapshots Required** : old aggregates have 1000s of events → snapshot every 100 events
6. **Event Schema is Forever** : events immutable → need upcasting for evolution
7. **Not a Silver Bullet** : only use when benefits outweigh complexity

---

## 🚀 Next Steps

### Backend #7 : Modular Monolith
- Bounded Contexts (like DDD)
- But **modules in same process** (not microservices)
- Shared event bus between modules
- Avoid distributed monolith

---

**Status**: ✅ Implemented — 9/9 tests passing  
**LOC**: ~1,100  
**Complexity**: Very High (but worth it for audit-critical apps)  
**Next**: Backend #7 (Modular Monolith)
