# ADR-0015: Backend #6 — CQRS + Event Sourcing

**Status:** Accepted
**Date**: 2026-05-07  
**Decision Makers**: Architecture Lab Team  
**Tags**: `backend`, `cqrs`, `event-sourcing`, `event-store`, `projections`

---

## Context

After implementing **DDD (#5)** with CQRS (Commands + Queries), we asked:

**Question** : What if we take CQRS to the extreme and **store events instead of state**?

**Event Sourcing** (Martin Fowler, 2005) proposes:
- Don't store current state → store **sequence of events**
- Aggregate state = **replay all events**
- Events = **immutable append-only log** (never updated/deleted)

**Benefits**:
- Complete audit trail
- Temporal queries ("state at time T")
- Event-driven architecture
- Separate read/write optimization

---

## Decision

Implement **full CQRS + Event Sourcing** :

### Write Side
1. **Commands** → append events to **Event Store**
2. **Aggregates** → reconstituted by replaying events
3. No traditional DB writes (event store = source of truth)

### Read Side
4. **Projections** → denormalized read models
5. **Event Handlers** → build projections from events
6. **Queries** → read from projections (not event store!)

### Infrastructure
7. **Event Store** : append-only log with optimistic locking
8. **Event Replayer** : rebuilds projections on startup

---

## Architecture

### Event Flow

```
┌──────────────────┐
│  POST /register  │
└────────┬─────────┘
         ↓
┌──────────────────────────┐
│  RegisterUserCommand     │
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│  RegisterUserHandler     │
│  - User.register()       │
│  - emit events           │
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│  Event Store             │
│  [UserRegisteredEvent]   │ ← Append-only log
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│  EventBus.publish()      │
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│  UserRegisteredHandler   │ ← Event Handler
│  (builds projection)     │
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│  UserReadRepository      │ ← Denormalized store
│  save(UserReadModel)     │
└──────────────────────────┘
```

### Read Flow

```
┌──────────────────┐
│  GET /users      │
└────────┬─────────┘
         ↓
┌──────────────────────────┐
│  GetUsersQuery           │
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│  GetUsersHandler         │
│  - readRepo.findAll()    │ ← NOT event store!
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│  UserReadModel[]         │
└──────────────────────────┘
```

**Key**: Queries **never read from event store** (too slow). They use projections.

---

## Implementation Details

### 1. Event Store

**Interface**:
```typescript
interface IEventStore {
  appendEvents(aggregateId, events, expectedVersion): Promise<void>
  getEvents(aggregateId): Promise<IEvent[]>
  getEventsFromVersion(aggregateId, fromVersion): Promise<IEvent[]>
  getEventsByType(eventType): Promise<IEvent[]>
}
```

**InMemoryEventStore**:
- `Map<aggregateId, IEvent[]>` : events per aggregate
- `IEvent[]` : all events (for projections)
- **Optimistic locking** : `expectedVersion` check

**Optimistic Locking Example**:
```typescript
// Thread 1
const events = await eventStore.getEvents('user-1');  // version = 5
// ... do work ...
await eventStore.appendEvents('user-1', [newEvent], 5);  // OK

// Thread 2 (concurrent)
const events = await eventStore.getEvents('user-1');  // version = 5
// ... do work ...
await eventStore.appendEvents('user-1', [newEvent], 5);  // ❌ ConflictException!
// → version is now 6, expected 5
```

### 2. Aggregate (Event-Sourced)

**AggregateRoot base**:
```typescript
abstract class AggregateRoot {
  private _version = 0;
  private _uncommittedEvents: IEvent[] = [];

  // Replay events to reconstitute state
  loadFromHistory(events: IEvent[]): void {
    events.forEach(event => {
      this.applyEvent(event, false);
      this._version = event.version;
    });
  }

  // Apply new event
  protected applyEvent(event: IEvent, isNew = true): void {
    const handler = this.getEventHandler(event.eventType);
    handler?.call(this, event);
    if (isNew) this._uncommittedEvents.push(event);
  }
}
```

**User Aggregate**:
```typescript
class User extends AggregateRoot {
  private email: string | null = null;
  private name: string | null = null;

  static register(id, email, hashedPassword, name): User {
    const user = new User(id);
    const event = new UserRegisteredEvent(id, email, hashedPassword, name, 1);
    user.applyEvent(event);  // Mutate state + store event
    return user;
  }

  static fromHistory(id, events): User {
    const user = new User(id);
    user.loadFromHistory(events);  // Replay events
    return user;
  }

  private onUserRegistered(event): void {
    this.email = event.data.email;
    this.name = event.data.name;
  }
}
```

**State is NEVER stored** → always reconstituted from events!

### 3. Command Handler

```typescript
@CommandHandler(RegisterUserCommand)
class RegisterUserHandler {
  async execute(cmd: RegisterUserCommand): Promise<void> {
    // Create aggregate
    const user = User.register(cmd.userId, cmd.email, hashedPassword, cmd.name);

    // Save events to event store
    const events = user.getUncommittedEvents();
    await this.eventStore.appendEvents(cmd.userId, events, 0);

    user.clearUncommittedEvents();
  }
}
```

**NO database write** → just append events!

### 4. Projection (Read Model)

**Event Handler**:
```typescript
@EventsHandler(UserRegisteredEvent)
class UserRegisteredHandler {
  handle(event: UserRegisteredEvent): void {
    const user = new UserReadModel(
      event.aggregateId,
      event.data.email,
      event.data.name,
      event.timestamp
    );
    this.readRepo.save(user);  // Build read model
  }
}
```

**Eventual Consistency**:
```
T=0   : POST /register
T=1ms : Event appended to store
T=2ms : Event published to EventBus
T=3ms : Projection updated
T=4ms : GET /users → sees new user
```

### 5. Query Handler

```typescript
@QueryHandler(GetUsersQuery)
class GetUsersHandler {
  async execute(query: GetUsersQuery): Promise<UserReadModel[]> {
    return this.readRepo.findAll();  // Read from projection
  }
}
```

**Fast** : no event replay, just read denormalized view.

### 6. Event Replayer

**On startup**, rebuild all projections:
```typescript
@Injectable()
class EventReplayer implements OnModuleInit {
  async onModuleInit() {
    const allEvents = this.eventStore.getAllEvents();
    for (const event of allEvents) {
      const domainEvent = this.toDomainEvent(event);
      this.eventBus.publish(domainEvent);
    }
  }
}
```

**Why?** If projection crashes, rebuild from events!

---

## Metrics

| Metric | Layered (#1) | DDD (#5) | **CQRS + ES (#6)** |
|----------|--------------|----------|--------------------|
| **Total LOC** | 900 | 2,100 | **1,100** |
| **Write LOC** | — | — | **350** |
| **Read LOC** | — | — | **250** |
| **Event Store LOC** | — | — | **150** |
| **Tests** | 28 | 10 | **9** |
| **Audit Trail** | ❌ Manual | ✅ Events (manual publish) | ✅ **Built-in** |
| **Temporal Queries** | ❌ | ❌ | ✅ **Replay to any time** |
| **Read/Write** | Same models | Separated (CQRS) | **Fully separated** (event store vs projections) |
| **Consistency** | Immediate | Immediate | **Eventual** |

---

## Trade-offs Analysis

### ✅ Advantages

#### 1. **Complete Audit Trail**
```typescript
// All events stored forever
[
  { eventType: 'UserRegistered', timestamp: '2024-01-01T10:00:00Z', data: { email: 'john@example.com' } },
  { eventType: 'UserNameUpdated', timestamp: '2024-01-05T14:00:00Z', data: { name: 'John Doe' } },
  { eventType: 'UserEmailChanged', timestamp: '2024-02-10T09:00:00Z', data: { email: 'john.doe@example.com' } }
]
```
**Use case**: Compliance (GDPR, SOX), forensics, debugging.

#### 2. **Temporal Queries**
```typescript
// State of user on 2024-01-01
const eventsUntil = await eventStore.getEventsUntil(userId, new Date('2024-01-01'));
const user = User.fromHistory(eventsUntil);
// → user.email = 'john@example.com' (before email change)
```

**Impossible** with traditional DB (current state only).

#### 3. **Event-Driven Architecture**
```typescript
// Other services listen to events (zero coupling)
@EventsHandler(UserRegisteredEvent)
class SendWelcomeEmailHandler {
  handle(event) {
    emailService.send(event.data.email, 'Welcome!');
  }
}
```

No need to call `emailService` from `UserService` → decoupled!

#### 4. **Separate Read/Write Optimization**
- **Write**: Append to event store (fast, append-only)
- **Read**: Query denormalized projections (Redis, ElasticSearch, Postgres)

Can scale independently:
- Event store: 100 writes/sec
- Projections: 10,000 reads/sec

#### 5. **Debugging Superpowers**
```typescript
// Bug: user created with wrong email
// → Replay events to find which event caused it
const events = await eventStore.getEvents(buggyUserId);
events.forEach(e => console.log(e));
// → Find: UserEmailChangedEvent had wrong validation
```

#### 6. **Event Replay = Free Recovery**
```typescript
// Projection crashed? Rebuild from events!
const allEvents = await eventStore.getAllEvents();
allEvents.forEach(e => eventBus.publish(e));
// → Projection rebuilt from scratch
```

### ❌ Disadvantages

#### 1. **Complexity**
- 3x more code than CRUD
- Need to understand Event Sourcing concepts
- **Very steep learning curve**

#### 2. **Eventual Consistency**
```typescript
// Write
await commandBus.execute(new RegisterUserCommand(...));

// Read (might NOT see new user yet!)
const users = await queryBus.execute(new GetUsersQuery());
```

**Problem**: Milliseconds delay between write and read.

**Solution**: Use **read-your-writes** pattern:
```typescript
const userId = await commandBus.execute(new RegisterUserCommand(...));
await sleep(10);  // Wait for projection
const user = await queryBus.execute(new GetUserByIdQuery(userId));
```

#### 3. **Event Schema Evolution**
```typescript
// Old event
UserRegisteredEvent { email, name }

// New requirement: add phoneNumber
UserRegisteredEvent { email, name, phoneNumber }

// Problem: old events don't have phoneNumber!
```

**Solution**: **Upcasting**:
```typescript
function upcastEvent(event) {
  if (event.version === 1) {
    return { ...event, data: { ...event.data, phoneNumber: null }, version: 2 };
  }
  return event;
}
```

**Complex** to manage at scale.

#### 4. **Storage Growth**
- Events **never deleted** → storage grows forever
- 1M users × 100 events/user = 100M events

**Solution**: **Snapshots**:
```typescript
// After 100 events, store a snapshot
if (events.length > 100) {
  const snapshot = { aggregateId, state: user, version: 100 };
  await snapshotStore.save(snapshot);
}

// Replay: load snapshot + events since snapshot
const snapshot = await snapshotStore.get(aggregateId);
const eventsSince = await eventStore.getEventsFromVersion(aggregateId, snapshot.version);
const user = User.fromSnapshot(snapshot);
user.loadFromHistory(eventsSince);
```

#### 5. **Queries are Hard**
```sql
-- Easy with SQL
SELECT * FROM users WHERE age > 30 AND city = 'Paris'

-- Hard with Event Sourcing
-- → Need to build a specific projection for this query
-- → OR scan all events (slow!)
```

**Solution**: Build projections for **common queries only**.

Ad-hoc queries → use traditional DB as read model.

#### 6. **No Mature Tooling**
- **EventStore DB** : production-ready but heavyweight
- **Marten** : .NET only
- **Axon** : Java only
- **Node.js** : no mature event store (need custom implementation)

---

## When to Use CQRS + Event Sourcing

### ✅ **USE CQRS + ES** IF:

1. **Audit trail is CRITICAL**
   - Banking (all transactions must be logged)
   - Healthcare (patient history)
   - Legal (compliance: GDPR, SOX, HIPAA)

2. **Temporal queries needed**
   - "What was portfolio value on 2024-01-01?"
   - "Replay user session to debug"

3. **Event-driven system**
   - Microservices communicate via events
   - Kafka / RabbitMQ already used

4. **High read/write ratio**
   - 10 writes/sec, 10,000 reads/sec
   - → Separate optimization essential

5. **Complex business logic**
   - DDD aggregates with many state transitions
   - Events capture intent (not just final state)

### ⚠️ **USE CQRS (without ES)** IF:

- Need read/write separation (performance)
- But **don't need** full event history
- **Backend #5 (DDD)** already does this

### ❌ **AVOID CQRS + ES** IF:

1. **Simple CRUD**
   - Admin panel, backoffice
   - No audit requirements

2. **Immediate consistency required**
   - Bank transfers (can't be eventual!)
   - → Use traditional ACID transactions

3. **Team lacks experience**
   - CQRS + ES is **extremely complex**
   - High risk of bugs

4. **Ad-hoc reporting**
   - 50+ dimensions
   - → Projections become nightmare

---

## Lessons Learned

### 1. **Event Sourcing ≠ CQRS**
Can use separately:
- **Event Sourcing only** : store events, no CQRS (queries replay events → slow)
- **CQRS only** : separate read/write models, no event store (Backend #5 DDD)

### 2. **Events = Source of Truth**
- DB is just a **cache** (projection)
- Can delete DB, rebuild from events
- **Event store must NEVER lose data**

### 3. **Aggregates are Ephemeral**
```typescript
// Aggregates are NOT stored
const user = User.fromHistory(events);  // Reconstituted
user.updateName('New Name');
const newEvents = user.getUncommittedEvents();
await eventStore.appendEvents(userId, newEvents, currentVersion);
// → user object discarded, not stored!
```

### 4. **Snapshots are Essential**
```typescript
// Without snapshots
const events = await eventStore.getEvents(userId);  // 10,000 events
const user = User.fromHistory(events);  // Replay 10,000 events → SLOW!

// With snapshots
const snapshot = await snapshotStore.get(userId);  // version 9,900
const events = await eventStore.getEventsFromVersion(userId, 9,900);  // 100 events
const user = User.fromSnapshot(snapshot);
user.loadFromHistory(events);  // Replay 100 events → FAST!
```

### 5. **Projections = Eventual Consistency**
```typescript
// Write-your-reads pattern
const userId = await commandBus.execute(new RegisterUserCommand(...));

// Retry until projection updated
let user = null;
while (!user) {
  user = await queryBus.execute(new GetUserByIdQuery(userId));
  if (!user) await sleep(10);
}
```

### 6. **Event Schema is Forever**
- Events **immutable** → can't change schema
- Need **upcasting** / **event versioning**
- Plan schema carefully upfront

---

## Next Steps

### Backend #7: Modular Monolith
- Bounded Contexts (like DDD)
- But **modules in same process** (not microservices)
- Shared event bus
- Avoid distributed complexity

---

## References

### Books
- **Greg Young** — "CQRS Documents" (2010)
- **Vaughn Vernon** — "Implementing Domain-Driven Design" (2013) — Chapter 8
- **Microsoft** — "CQRS Journey" (2013)

### Articles
- [CQRS by Martin Fowler](https://martinfowler.com/bliki/CQRS.html)
- [Event Sourcing by Martin Fowler](https://martinfowler.com/eaaDev/EventSourcing.html)
- [Event Store Introduction](https://www.eventstore.com/event-sourcing)

### Tools
- **EventStore DB** : https://www.eventstore.com/
- **Axon Framework** : Java CQRS/ES framework
- **Marten** : .NET event store on PostgreSQL

---

## Verdict

### ✅ **CQRS + ES is Worth It** IF:
- Audit trail critical (banking, healthcare, legal)
- Temporal queries needed
- Event-driven microservices
- High read/write ratio

### ❌ **CQRS + ES is Overkill** IF:
- Simple CRUD
- Immediate consistency required
- Team lacks experience
- Ad-hoc reporting

### 🎯 **Sweet Spot**:
- **Use CQRS** (Backend #5 DDD) for read/write separation
- **Add Event Sourcing** only for **aggregates that need audit trail**
- Hybrid approach: some aggregates event-sourced, others traditional

---

**Date**: 2026-05-07  
**Status**: ✅ Implemented — 9/9 tests passing  
**LOC**: ~1,100  
**Complexity**: Very High  
**Next**: Backend #7 (Modular Monolith)
