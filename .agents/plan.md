# Architecture Improvement: Planning Poker

## Exploration Findings

### Domain Context
- **Session**: A planning poker room identified by URL hash
- **User**: Participant in a session (stored per-session in localStorage, synced to Supabase)
- **Score**: A vote cast by a user (numeric or special card like "?" or "☕")
- **Round**: Historical snapshot of scores after reveal
- **Stage**: Current state (voting vs results/revealed)

---

## Deepening Opportunities

### 1. Split the `useSessionState` God Module

**Files**: `src/hooks/useSessionState.js`

**Problem**: This hook manages 5 independent concerns behind one 28-value interface: user identity, scoring, session options, presence tracking, and stage transitions. The interface *looks* simple (destructure what you need), but the implementation is 425 LOC with 10+ effects that cascade into each other. Testing requires mocking 3 Supabase channels + 15 API functions.

**Deletion test**: Catastrophic — 200+ LOC would scatter across 4+ screens. The hook *earns* its keep, but its **depth is fake**: the interface doesn't hide complexity, it just bundles it.

**Solution**: Extract into focused modules with smaller interfaces:
- `useUser(session)` → user creation, name, spectator/moderator status
- `useScoring(session, userId)` → score submission, reveal state, reset
- `useSessionOptions(session)` → confirm mode, sequence, stage
- `usePresence(session, userId)` → heartbeat, active user detection

**Benefits**: Each module would have **real depth** — smaller interface hiding concentrated implementation. Locality improves: a scoring bug stays in `useScoring`. Tests target specific seams instead of mocking the world.

---

### 2. Collapse Shallow API Modules into a Session Adapter

**Files**: `src/api/options.js`, `src/api/scores.js`, `src/api/users.js`, `src/api/client.js`

**Problem**: These modules are **shallow pass-throughs**. Their interfaces are nearly as complex as their implementations — each function just wraps a single Supabase call with no validation, error normalization, or business logic. Every function requires `session` as the first parameter (15+ signatures).

**Deletion test**: Positive signal — deleting them and calling Supabase directly would barely increase caller complexity. Only `src/api/rounds.js` has real depth (deduplication logic, graceful degradation).

**Solution**: Create a session-scoped adapter:
```js
const api = useSessionAPI(session);
await api.scores.submit(userId, score);  // session bound once
```
The adapter would add **leverage**: consistent error handling, request deduplication built-in, validation at the seam.

**Benefits**: Callers get more capability per unit of interface. Session parameter threading disappears. Error handling concentrates in one place (locality).

---

### 3. Introduce a Session Context Seam for Sidebar

**Files**: `src/components/VotingScreen/index.jsx`, `src/components/Sidebar/index.jsx`

**Problem**: VotingScreen destructures 20+ values from `useSessionState`, then passes 11+ as individual props to Sidebar. The Sidebar interface is very wide — it's effectively a window into the session state, but with no formal seam.

**Solution**: Create a `SessionContext` that provides session state at the tree level. Sidebar and its children consume context directly.

**Benefits**: Sidebar's interface shrinks dramatically. New child components don't require prop threading. The seam is explicit — behavior can be altered by providing a different context value (e.g., for testing or preview modes).

---

### 4. Consolidate User Identity Behind One Seam

**Files**: `pages/voting.jsx`, `src/hooks/useSessionState.js`, `src/hooks/useHashSession.js`, `src/components/ScoreCards/index.jsx`, `src/utils/userStorage.js`

**Problem**: User creation/retrieval happens in 4 places with different patterns:
- `voting.jsx` creates user locally, stores to localStorage
- `useHashSession` loads user from localStorage
- `useSessionState.getOrCreateUser` syncs to Supabase
- `ScoreCards` calls `getStoredUser(session)` directly

No single module owns "current user in this session." Who wins if localStorage and Supabase disagree? Unclear.

**Solution**: Create a `useCurrentUser(session)` module that owns the entire lifecycle: localStorage read → Supabase sync → updates → storage persistence. All consumers go through this seam.

**Benefits**: User identity bugs concentrate in one place (locality). Interface is simple: `{ user, setName, setSpectator, setModerator }`. Implementation handles sync complexity (depth).

---

### 5. Extract Request Deduplication as a Reusable Module

**Files**: `src/hooks/useSessionState.js`, `src/hooks/useRounds.js`

**Problem**: Both hooks implement identical request-deduplication logic using refs (pattern appears 6+ times).

**Solution**: Extract `useLatestRequest(fetchFn)` that returns a wrapped fetcher guaranteeing only the latest request's result is used.

**Benefits**: Pattern is named (leverage for understanding). Bug fixes concentrate in one place. Interface is tiny.

---

### 6. Deepen `rounds.js` — It's the Only Real Module

**Files**: `src/api/rounds.js`

**Problem**: This is already the *deepest* API module (hash-based deduplication, graceful degradation on missing table, combined save+reset). But `resetScoresWithRound` is a pseudo-transaction that can partially fail.

**Solution**: Either make the operation truly atomic (Supabase RPC), or handle partial failure explicitly at the interface level.

**Benefits**: The module already has depth; this deepens it further by making the seam's contract clearer.

---

## Prioritization

| # | Opportunity | Impact | Risk | Notes |
|---|-------------|--------|------|-------|
| 1 | Split useSessionState | 🔴 High | Medium | Fixes testability and locality for the core hook |
| 2 | Session Adapter | 🟡 Medium | Low | Removes boilerplate, enables consistent error handling |
| 3 | Session Context | 🟡 Medium | Low | Reduces prop drilling, explicit seam |
| 4 | User Identity Seam | 🟡 Medium | Medium | Clarifies truth source for user identity |
| 5 | Request Deduplication | 🟢 Low | Very Low | Removes duplication, quick win |
| 6 | Deepen rounds.js | 🟢 Low | Low | Incremental improvement to existing depth |

---

## Vocabulary

Using consistent terms from the architecture skill:

- **Module** — anything with an interface and an implementation
- **Interface** — everything a caller must know to use the module
- **Depth** — leverage at the interface; a lot of behavior behind a small interface
- **Seam** — where an interface lives; a place behavior can be altered without editing in place
- **Adapter** — a concrete thing satisfying an interface at a seam
- **Leverage** — what callers get from depth
- **Locality** — what maintainers get from depth: change, bugs, knowledge concentrated in one place
- **Deletion test** — imagine deleting the module; if complexity reappears across N callers, it was earning its keep
