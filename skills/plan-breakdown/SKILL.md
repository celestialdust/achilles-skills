---
name: plan-breakdown
description: THE planner — turns a signed prd.md + research.md into a concrete, agent-executable plan.md. Reach for it the moment Plan starts and someone says "plan this", "break it into tasks", "write the implementation plan", or is tempted to hand the build agent a prose sketch. Produces vertical tracer-bullet slices (each demoable, cross-layer, with an observable checkpoint) where every non-trivial step names its file, line range, code snippet, and test, plus a Blocked-by dependency DAG written into STATE.md. Refuses horizontal layer-by-layer plans and placeholder steps; references codebase-design + api-design, and escalates hard-to-reverse decisions to an ADR.
---

# plan-breakdown — THE planner (Plan stage)

## Purpose

Decompose work into small, verifiable tasks with explicit acceptance criteria. Good task breakdown is the difference between an agent that completes work reliably and one that produces a tangled mess. Every task should be small enough to implement, test, and verify in a single focused session.

**Stage: Plan** — the last human-owned stage (D29); the human signs the plan before the orchestrator runs.
plan-breakdown is **THE planner**: the single skill that turns `prd.md` + `research.md` into a concrete,
vertically-sliced, agent-executable `plan.md`. `codebase-design` (deep modules) and `api-design`
(contract-first) are **referenced disciplines applied here**, not separate stages (D23); the dropped
`structure` stage folds in as the vertical-slice + horizontal-plan-rejection discipline below, while its
stub→mock→wire→fill build-order folds into `incremental-implementation`. The plan IS the slices + the DAG.

## When to use / when to skip

- You have a spec and need to break it into implementable units
- A task feels too large or vague to start
- Work needs to be parallelized across multiple agents or sessions
- You need to communicate scope to a human
- The implementation order isn't obvious

**When NOT to use:** Single-file changes with obvious scope, or when the spec already contains well-defined tasks.

## Inputs

Resolve each required input in order — (1) inline in the invocation prompt, (2) a file path in the prompt,
(3) the canonical file at `docs/features/<slug>/`. **Refuse to run** (naming the missing input) if either
required input cannot be resolved — a plan invented without the PRD or the codebase map is fiction.

**Required:**
1. `prd.md` — sections `## Problem` · `## Solution` · `## User Stories` · `## Implementation Decisions` ·
   `## Testing Decisions` · `## Out of Scope`. The PRD is product-altitude and carries **no file paths or
   signatures** (D18) — plan-breakdown is exactly where that product intent gets pinned to concrete files,
   line ranges, and snippets. Every slice back-references a `## User Stories` id.
2. `research.md` — `## Codebase map` · `## Dependency facts` · `## External APIs` · `## Prior art in the
   codebase` · `## Open items for Plan`. This is the goal-blind as-is map; every `file`/`lines` your steps
   name must be real per this map, and your steps must follow the existing patterns it records.

**Referenced disciplines (invoked, not file inputs):** `codebase-design` and `api-design` — see
`## Referenced disciplines & the ADR trigger`. **Optional context:** `acceptance.md` if present — align each
step's `test:` tactics to the behavioral scenario ids it realizes (the binding is finalized at Verify by `quality-verification`).

## The Planning Process

### Step 1: Enter Plan Mode

Before writing any code, operate in read-only mode:

- Read the spec and relevant codebase sections
- Identify existing patterns and conventions
- Map dependencies between components
- Note risks and unknowns

**Do NOT write code during planning.** The output is a plan document, not implementation.

### Step 2: Identify the Dependency Graph

Map what depends on what:

```
Database schema
    │
    ├── API models/types
    │       │
    │       ├── API endpoints
    │       │       │
    │       │       └── Frontend API client
    │       │               │
    │       │               └── UI components
    │       │
    │       └── Validation logic
    │
    └── Seed data / migrations
```

Implementation order follows the dependency graph bottom-up: build foundations first.

### Step 3: Slice Vertically

Instead of building all the database, then all the API, then all the UI — build one complete feature path at a time:

**Bad (horizontal slicing):**
```
Task 1: Build entire database schema
Task 2: Build all API endpoints
Task 3: Build all UI components
Task 4: Connect everything
```

**Good (vertical slicing):**
```
Task 1: User can create an account (schema + API + UI for registration)
Task 2: User can log in (auth schema + API + UI for login)
Task 3: User can create a task (task schema + API + UI for creation)
Task 4: User can view task list (query + API + UI for list view)
```

Each vertical slice delivers working, testable functionality.

### Step 4: Write Concrete Steps (file · lines · snippet · test)

Group steps under the vertical slice they belong to (Step 3). Within a slice, write ordered steps; every
**non-trivial** step names four fields so `incremental-implementation` can land it without inventing code that bypasses the
PRD or the design disciplines:

- **file:** `exact/path.ts` | `new file` — no globs, no "the signup module", no "wherever it fits".
- **lines:** `12–28` | `new file`.
- **snippet:** a fenced code block with the **actual code that will appear in the diff** (in the codebase's
  language/style, grounded in `research.md`'s conventions).
- **test:** `tactics: tests/path.test.ts — <case names>`; name the behavioral acceptance scenario id it
  realizes when one applies.

Trivial edits (rename, import add, single-line change) may use a one-line prose body. `Add validation` is
**not** trivial — show the snippet, or the implementer invents code that silently bypasses the spec.

Carry each step's acceptance idea via its `test` field (the test IS the per-step acceptance check); the
project-wide bar every step also clears is the Definition of Done (see `## See Also`).

### Step 5: Order and Checkpoint

Arrange tasks so that:

1. Dependencies are satisfied (build foundation first)
2. Each task leaves the system in a working state
3. Verification checkpoints occur after every 2-3 tasks
4. High-risk tasks are early (fail fast)

Add explicit checkpoints:

```markdown
## Checkpoint: After Tasks 1-3
- [ ] All tests pass
- [ ] Application builds without errors
- [ ] Core user flow works end-to-end
- [ ] Review with human before proceeding
```

## No placeholders (plan failures — never write them)

These force the implementer to invent code, and invented code bypasses the spec. Grep your own plan and fix
every hit before handoff: `TBD`, `TODO`, `implement later`, `fill in details`, `Add appropriate error
handling`, `add validation`, `handle edge cases`, `Write tests for the above` (without the test code),
`Similar to Step N` (repeat the code — steps may be read out of order), any reference to a type/function not
defined in some step, and any code step missing its `snippet`.

## Vertical slices & the dependency DAG (→ STATE.md)

The plan IS a list of **vertical tracer-bullet slices** (D23). Each slice is a thin end-to-end cut that:
- is **independently demoable** and touches **≥2 layers** (a slice whose files are all one layer is a
  horizontal phase — rewrite it, see `## Horizontal-plan rejection`);
- has a **PRD-namespaced id** (e.g. `PWR-1`, `PWR-2`) back-referencing a `prd.md` user-story id;
- ends at an **observable Checkpoint** — a fact a human or test can verify ("submit a bad email → inline
  error shows"), NOT "compiles" / "builds" / "no type errors";
- names a **`Blocked-by`** list of the sibling slice ids it depends on.

The `Blocked-by` edges form the **dependency DAG** the orchestrator wave-schedules from. **Verify the DAG is
acyclic** before handing off. Write one row per slice into `STATE.md` under the feature's block (§4.1):
initial slice state `impl`, gate `you` (the human signs the plan first), `Blocked-by` = the DAG edges,
Artifacts = `—`. Slices are **born here** — a feature still in spec/plan has no slice rows until now.

## Referenced disciplines & the ADR trigger

plan-breakdown **applies** two design disciplines while planning — it does not spawn them as separate stages
(D23):
- **`codebase-design`** (deep modules / deletion test) — shape each module so depth > surface; the concrete
  interfaces land **inline in plan.md** (File Structure + step snippets).
- **`api-design`** (contract-first) — define the interface contract before the implementation; the contract
  lands **inline in plan.md**.

Both remain standalone-invokable skills (for a pure refactor). Any **hard-to-reverse** interface/boundary
decision — one that is hard to reverse ∧ surprising ∧ a real trade-off — is drafted as an ADR at
`docs/adr/ADR-<NNN>-<slug>.md` (using the `documentation-and-adrs` standard) and **referenced by id** from
plan.md; never restate its rationale in the plan (D18). Load-bearing decisions stay durable + visible at the
gate; reversible detail stays ordinary inline in plan.md.

## Horizontal-plan rejection (self-check — run it, it is not optional)

Models, left alone, plan **by layer** (all DB, then all API, then all UI) — a plan that does not work
end-to-end until the last slice, with no checkpoint to debug from in between. This is the single failure mode
this stage inherits cr-structure to prevent. Before handoff, grep your own plan and **rewrite** any hit:
- slice/phase labels naming one layer: `Slice 1: Database`, `Phase 2: Frontend`, `## All API changes`;
- a slice whose Files-touched column lists files from only one directory/layer (unless it is genuine
  scaffolding with a real cross-layer checkpoint);
- a slice with no Checkpoint, or a checkpoint that only says "compiles" / "builds" / "no type errors".

No amount of prompting makes models slice vertically on their own; the explicit grep-and-rewrite is what
catches the slippage.

## Task Sizing Guidelines

| Size | Files | Scope | Example |
|------|-------|-------|---------|
| **XS** | 1 | Single function or config change | Add a validation rule |
| **S** | 1-2 | One component or endpoint | Add a new API endpoint |
| **M** | 3-5 | One feature slice | User registration flow |
| **L** | 5-8 | Multi-component feature | Search with filtering and pagination |
| **XL** | 8+ | **Too large — break it down further** | — |

If a task is L or larger, it should be broken into smaller tasks. An agent performs best on S and M tasks.

**When to break a task down further:**
- It would take more than one focused session (roughly 2+ hours of agent work)
- You cannot describe the acceptance criteria in 3 or fewer bullet points
- It touches two or more independent subsystems (e.g., auth and billing)
- You find yourself writing "and" in the task title (a sign it is two tasks)

## Plan Document Template

```markdown
# Implementation Plan: [Feature/Project Name]

## Goal
[One paragraph: the product outcome, traced to prd.md `## User Stories`]

## Architecture
- [Key decision 1 and rationale — reference a hard-to-reverse decision by ADR id, never restate it]
- [Key decision 2 and rationale]

## Tech Stack
[Languages/frameworks/libraries, grounded in research.md's conventions]

## File Structure
- `exact/path.ts` — one-line responsibility
- `new file` — one-line responsibility

## Vertical slices

| Slice id | Story-ref | Files (owned, disjoint) | Regression surface | Checkpoint (observable) | Blocked-by |
|---|---|---|---|---|---|
| PWR-1 | US-1 | `schema/user.ts`, `api/reset.ts`, `ui/ResetForm.tsx` | `auth/session.ts` | Submit a bad email → inline error shows | — |
| PWR-2 | US-2 | `api/verify.ts`, `ui/VerifyPage.tsx` | `auth/token.ts` | Valid token → password updates, user redirected to login | PWR-1 |

Each slice is cross-layer (≥2 layers) + independently demoable; the Checkpoint is a fact a human or test
verifies, never "compiles" / "builds" / "no type errors". The `Blocked-by` edges form the acyclic DAG written
one-row-per-slice into STATE.md.

### Slice PWR-1 — [user-facing capability]
**Step 1 — [what this step does]**
- **file:** `schema/user.ts`
- **lines:** `new file`
- **snippet:**
  ```ts
  // the actual code that will appear in the diff, in the codebase's style
  export const resetTokenTable = pgTable("reset_token", { /* ... */ });
  ```
- **test:** `tactics: tests/reset.test.ts — rejects expired token, accepts fresh token` (realizes acceptance `PWR-A1`)

(Repeat one block per non-trivial step. Trivial edits — rename, import add, single-line change — may use a
one-line prose body. No `TBD`/`TODO`/`add validation`/`handle edge cases` placeholders.)

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk] | [High/Med/Low] | [Strategy] |

## Open Questions
- [Question needing human input]
```

## Parallelization Opportunities

When multiple agents or sessions are available:

- **Safe to parallelize:** Independent feature slices, tests for already-implemented features, documentation
- **Must be sequential:** Database migrations, shared state changes, dependency chains
- **Needs coordination:** Features that share an API contract (define the contract first, then parallelize)

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll figure it out as I go" | That's how you end up with a tangled mess and rework. 10 minutes of planning saves hours. |
| "The tasks are obvious" | Write them down anyway. Explicit tasks surface hidden dependencies and forgotten edge cases. |
| "Planning is overhead" | Planning is the task. Implementation without a plan is just typing. |
| "I can hold it all in my head" | Context windows are finite. Written plans survive session boundaries and compaction. |

## Red Flags

- Starting implementation without a written task list
- Tasks that say "implement the feature" without acceptance criteria
- No verification steps in the plan
- All tasks are XL-sized
- No checkpoints between tasks
- Dependency order isn't considered

## Verification

Before starting implementation, confirm:

- [ ] Every task has acceptance criteria
- [ ] Every task has a verification step
- [ ] Task dependencies are identified and ordered correctly
- [ ] No task touches more than ~5 files
- [ ] Checkpoints exist between major phases
- [ ] The human has reviewed and approved the plan
- [ ] Every **non-trivial** step names all four fields: `file` · `lines` · `snippet` · `test`.
- [ ] No-placeholder grep is clean (`## No placeholders` patterns return zero hits).
- [ ] Every slice spans ≥2 layers and ends at an **observable** Checkpoint (not "compiles").
- [ ] Slice ids are PRD-namespaced, the `Blocked-by` DAG is **acyclic**, and one row per slice is written to `STATE.md`.
- [ ] Each hard-to-reverse interface/boundary decision is captured as an ADR and referenced by id from plan.md.

## See Also

Acceptance criteria are per-task and answer "did we build the right thing?". They sit on top of the project-wide Definition of Done, the standing bar every task clears before it counts as done. See `../../references/definition-of-done.md`.

## Outputs & handoff contract

**Emits:** `docs/features/<slug>/plan.md` — the concrete plan — plus the vertical-slice list and the
dependency DAG materialized as slice rows in `STATE.md`. Any hard-to-reverse decision also emits an ADR at
`docs/adr/ADR-<NNN>-<slug>.md`, referenced by id from plan.md.

**Stable sections the consumer (`incremental-implementation`, driven by the orchestrator) reads cold — change the shape,
update the consumer in the same commit (D10a):**
- **Plan header** — Goal · Architecture · Tech Stack · File Structure (one-line responsibility per file).
  Sets `incremental-implementation`'s working context.
- **`## Vertical slices`** table — columns (canonical, per registry): Slice id (PRD-namespaced) · Story-ref ·
  **Files (owned, disjoint)** (cross-layer; the disjoint-file guard the orchestrator parallelizes on) ·
  **Regression surface** (blast-radius set, frozen under retry per D29) · Checkpoint (observable) · Blocked-by.
  The orchestrator reads `Blocked-by` as the wave DAG, `Files (owned)` for the disjoint-file guard, and
  `Regression surface` as the immutable-under-retry contract `incremental-implementation`/`test-driven-development`/`quality-verification`/`git-workflow` consume.
- **Per-step `file` · `lines` · `snippet` · `test`** on every non-trivial step. `incremental-implementation` pulls these
  step-by-step and treats a missing field as **refuse-to-run**.
- **Referenced interfaces** — `codebase-design` deep-module interfaces + `api-design` contracts, inline in
  plan.md (no standalone file).

**STATE.md update (§4.1):** under `## <PRD-id> · <feature title>`, write one row per slice — initial state
`impl`, gate `you` (the human signs the plan; on sign-off the orchestrator flips the feature to `building`
and the gates to `agent`, then runs incremental-implementation → quality-verification → review → pull-request per slice, wave-parallel along the
`Blocked-by` DAG, **fully autonomously**, D29). Slices are born here; record `plan.md` under the feature's
`origin:`.

**Handoff:** Plan is the last human-owned stage. Hand the signed plan + DAG to the orchestrator.
