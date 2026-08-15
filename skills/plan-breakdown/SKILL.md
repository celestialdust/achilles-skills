---
name: plan-breakdown
description: THE planner — turns a signed prd.md + research.md + architecture.md into a concrete, agent-executable plan.md. Reach for it the moment Plan starts and someone says "plan this", "break it into tasks", "write the implementation plan", or is tempted to hand the build agent a prose sketch. It ELABORATES the structural decisions already recorded during Spec instead of reopening them, and supplies the depth they left: typed signatures, field lists, vertical tracer-bullet slices (each demoable, cross-layer, with an observable checkpoint) where every non-trivial step names its file, line range, code snippet, and test, plus a Blocked-by dependency DAG written into STATE.md. Refuses horizontal layer-by-layer plans and placeholder steps; references codebase-design + api-design.
---

# plan-breakdown — THE planner (Plan stage)

## Purpose

Decompose work into small, verifiable tasks with explicit acceptance criteria. Good task breakdown is the difference between an agent that completes work reliably and one that produces a tangled mess. Every task should be small enough to implement, test, and verify in a single focused session.

**Stage: Plan** — the last human-owned stage; the human signs the plan before the orchestrator runs.
plan-breakdown is **THE planner**: the single skill that turns `prd.md` + `research.md` +
`architecture.md` into a concrete, vertically-sliced, agent-executable `plan.md`. It **elaborates**
decisions rather than taking them — the structural ones arrive already made and recorded during
`spec-grilling` — and what it decides is depth: typed signatures, field lists, slices, the DAG. Build
order — stub→mock→wire→fill — is `incremental-implementation`'s. The plan IS the slices + the DAG.

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
   signatures** — plan-breakdown is exactly where that product intent gets pinned to concrete files,
   line ranges, and snippets. Every slice back-references a `## User Stories` id.
2. `research.md` — `## Codebase map` · `## Dependency facts` · `## External APIs` · `## Prior art in the
   codebase` · `## Structural facts` · `## Open items for Plan`, plus `## Plan pass — <aspect>` from the
   second `codebase-research` pass. That pass runs at the head of Plan and is expected, not exceptional —
   if the file carries no Plan-pass section, run `codebase-research` before you slice rather than planning
   against a survey taken before the decisions existed. This is the goal-blind as-is map; every
   `file`/`lines` your steps name must be real per this map, and your steps must follow the existing
   patterns it records. Where a step needs a line range the synthesis does not carry, open the axis file
   behind it under `docs/features/<slug>/research/` — each sub-agent's findings are there in full, cited
   to `path:line`, which is cheaper and more reliable than re-reading the source to re-derive them. `## Structural facts` is the one to read before pinning an interface: it records
   the seams and their adapter counts, the module boundaries, and the conventions in use, so a signature
   you write matches the style already there instead of forking a second one.

3. `architecture.md` — this feature's signed structure, and the ADRs it cites where the repository
   has one. A slice's files sit inside the modules and behind the seams these name, and the dependency
   edges they permit are the ones a slice may add. It tells you *where* the structure sits, not why:
   `architecture-design` reconciles, grades, and renders — traces every scenario, records the invariants,
   has the result graded code-cold, cites the decisions taken in `spec-grilling`; takes none itself. Its
   decisions section is a citation index, so read the reasoning behind a boundary from the record it
   cites in `docs/adr/`, by id. Where a feature
   ran no structure pass, say so in the plan and plan against `research.md` alone.

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

A checkpoint is a **done-condition, not a pause**. It is a fact the agent proves against the running build
while the run is going, and a fact a human reads afterwards on the pull request. Both readers get it; the
run never waits for either.

So do not write a checkpoint box that asks a person for permission to continue. The executor is not allowed
to honor it — it runs Implement → Verify → Review → Ship straight through to an open draft PR, and the
human's two decision points are the plan signature before the run and the PR after it. Keep two claims
apart here, because they are easy to collapse into one: a run never *waits* for an answer, but named
conditions do *end* work early. Most of them end only the affected **slice** — an unsigned contract, an
attempted edit to a frozen artifact, a check about to be weakened, a security Critical or High, exhausted
retries — and the rest of the graph keeps draining. A few end the whole **run**: a precondition missing at
run start, a cycle in the slice graph, gates failing at a rising rate across the run. `orchestrator`'s
*What stops a run* lists every condition with an `Ends` column saying which; read it there rather than
restating it here.
Stopping is something the run does on its own and reports; waiting is the thing it cannot do. So a "check
with the human first" line is either dead text or
an instruction to deadlock. Whatever you wanted a human to look at, write it as a fact in the checkpoint
instead: then it reaches the PR, where a human is actually reading.

Write each box as behavior. "Tests pass" and "builds without errors" are the floor under every slice — they
say nothing about whether *this* slice did the thing it existed to do.

```markdown
## Checkpoint: After Tasks 1-3
- [ ] Submitting a bad email shows the inline error (US-1)
- [ ] A valid reset link updates the password and redirects to login (US-2)
- [ ] An expired token is rejected and swept from the table (US-3)
```

## No placeholders (plan failures — never write them)

These force the implementer to invent code, and invented code bypasses the spec. Grep your own plan and fix
every hit before handoff: `TBD`, `TODO`, `implement later`, `fill in details`, `Add appropriate error
handling`, `add validation`, `handle edge cases`, `Write tests for the above` (without the test code),
`Similar to Step N` (repeat the code — steps may be read out of order), any reference to a type/function not
defined in some step, and any code step missing its `snippet`.

## Vertical slices & the dependency DAG (→ STATE.md)

The plan IS a list of **vertical tracer-bullet slices**. Each slice is a thin end-to-end cut that:
- is **independently demoable** and touches **≥2 layers** (a slice whose files are all one layer is a
  horizontal phase — rewrite it, see `## Horizontal-plan rejection`);
- has a **PRD-namespaced id** (e.g. `PWR-1`, `PWR-2`) back-referencing a `prd.md` user-story id;
- ends at an **observable Checkpoint** — a fact a human or test can verify ("submit a bad email → inline
  error shows"), NOT "compiles" / "builds" / "no type errors";
- names a **`Blocked-by`** list of the sibling slice ids it depends on.

The `Blocked-by` edges form the **dependency DAG** the orchestrator wave-schedules from. **Verify the DAG is
acyclic** before handing off. Write one row per slice into `STATE.md` under the feature's block:
initial slice state `impl`, gate `you` (the human signs the plan first), `Blocked-by` = the DAG edges,
Artifacts = `—`. Slices are **born here** — a feature still in spec/plan has no slice rows until now.

## Referenced disciplines & the ADR trigger

`codebase-design` and `api-design` are referenced disciplines, not sequential stages, and own no artifact
of their own — what they produce lands in a file another skill owns. Each states where it runs and who
dispatches it; there are more dispatch sites than this line could keep true.

So what reaches this stage is **depth, not direction**. The structural questions were settled with the
person during `spec-grilling` — as records in `docs/adr/`, or as rows in `architecture.md`'s decisions
section where the choice was approved but cheap to reverse. Read them the way you read a signed
`acceptance.md`: cite the decision and build to it. If planning shows one to be wrong, that is an entry in
`## Open Questions` the person answers before signing — not a boundary you quietly move, because the
record is the only trace that a person chose it rather than an agent.

- **`codebase-design`** (deep modules / deletion test) — give the chosen module its typed signatures and
  field lists so depth > surface; they land **inline in plan.md** (File Structure + step snippets).
- **`api-design`** (contract-first) — pin the chosen surface's contract before the implementation; it
  lands **inline in plan.md**.

Both remain standalone-invokable skills (for a pure refactor). An interface decision this stage is the
**first** to face — hard to reverse ∧ surprising ∧ a real trade-off — is drafted as an ADR at
`docs/adr/ADR-<NNN>-<slug>.md` (using the `documentation-and-adrs` standard) and **referenced by id** from
plan.md; never restate its rationale in the plan. Load-bearing decisions stay durable + visible at the
gate; reversible detail stays ordinary inline in plan.md.

## Horizontal-plan rejection (self-check — run it, it is not optional)

Models, left alone, plan **by layer** (all DB, then all API, then all UI) — a plan that does not work
end-to-end until the last slice, with no checkpoint to debug from in between. This is the single failure mode
this stage exists to prevent. Before handoff, grep your own plan and **rewrite** any hit:
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

| Slice id | Story-ref | Design ref | Files (owned, disjoint) | Regression surface | Checkpoint (observable) | Blocked-by |
|---|---|---|---|---|---|---|
| PWR-1 | US-1 | `docs/features/password-reset/design-contract.md` · `prototype/index.html` | `schema/user.ts`, `api/reset.ts`, `ui/ResetForm.tsx` | `auth/session.ts` | Submit a bad email → inline error shows | — |
| PWR-2 | US-2 | `docs/features/password-reset/design-contract.md` · `prototype/index.html` | `api/verify.ts`, `ui/VerifyPage.tsx` | `auth/token.ts` | Valid token → password updates, user redirected to login | PWR-1 |
| PWR-3 | US-3 | — | `jobs/expireTokens.ts`, `api/health.ts` | `auth/token.ts` | Expired token → sweep removes it, health endpoint reports the count | PWR-1 |

**`Design ref` — the pointer to the signed design contract and the prototype this slice builds against**
(`frontend-design`'s `design-contract.md` plus the committed prototype it names). Fill it once, here, while
you still have the feature in view: you are the only party who knows which slices carry UI, and the design
contract is per-feature while slices are per-slice, so one contract covers some slices and not others.
A `—` means **this slice builds no UI**. That `—` is a *recorded fact*, not an inference an agent makes later
about work it did not do — the builder is handed the artifact it will be graded against, and the verifier is
told which case it got instead of guessing from the diff.

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

`## Open Questions` is a **pre-signature** section: every entry is answered before the human signs, and the
section is empty at handoff. It is not a queue the run will drain. Once the run starts there is no channel
back to a person, so an unanswered question becomes a guess the implementer makes silently.

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
| "This slice is risky — I'll add a 'confirm with the human' checkpoint." | The run has no pause for that line to land in, so it buys no safety. Put the risk in `## Risks and Mitigations`, and put the thing you wanted checked into the checkpoint as a fact — that reaches the PR, where a human reads. |

## Red Flags

- Starting implementation without a written task list
- Tasks that say "implement the feature" without acceptance criteria
- No verification steps in the plan
- All tasks are XL-sized
- No checkpoints between tasks
- A checkpoint box that asks for human approval mid-run — the executor cannot wait for an answer, so the line is dead text or a deadlock
- Dependency order isn't considered

## Verification

Before starting implementation, confirm:

- [ ] Every task has acceptance criteria
- [ ] Every task has a verification step
- [ ] Task dependencies are identified and ordered correctly
- [ ] No task touches more than ~5 files
- [ ] Checkpoints exist between major phases
- [ ] No checkpoint asks a human to approve mid-run — every box is a fact the agent can prove against the
      running build and the PR can show
- [ ] The human has reviewed and approved the plan — this signature is the pre-run gate, and the open PR is
      the post-run one; the plan must not invent a third gate in between
- [ ] Every **non-trivial** step names all four fields: `file` · `lines` · `snippet` · `test`.
- [ ] No-placeholder grep is clean (`## No placeholders` patterns return zero hits).
- [ ] Every slice spans ≥2 layers and ends at an **observable** Checkpoint (not "compiles").
- [ ] Slice ids are PRD-namespaced, the `Blocked-by` DAG is **acyclic**, and one row per slice is written to `STATE.md`.
- [ ] Every slice row's `Design ref` is filled — a contract + prototype path, or a deliberate `—`. A blank cell
      is not the same as `—`: `—` says "no UI here, I checked", blank says nobody looked.
- [ ] Every hard-to-reverse decision is referenced by id: Spec's records cited, a new ADR written only
      where this stage was the first to face one.

## See Also

Acceptance criteria are per-task and answer "did we build the right thing?". They sit on top of the project-wide Definition of Done, the standing bar every task clears before it counts as done. See `references/definition-of-done.md`.

## Outputs & handoff contract

**Emits:** `docs/features/<slug>/plan.md` — the concrete plan — plus the vertical-slice list and the
dependency DAG materialized as slice rows in `STATE.md`. A hard-to-reverse decision this stage is the
first to face also emits an ADR at `docs/adr/ADR-<NNN>-<slug>.md`, referenced by id from plan.md.

**Stable sections the consumer (`incremental-implementation`, driven by the orchestrator) reads cold — change the shape,
update the consumer in the same commit:**
- **Plan header** — Goal · Architecture · Tech Stack · File Structure (one-line responsibility per file).
  Sets `incremental-implementation`'s working context.
- **`## Vertical slices`** table — columns (canonical, per registry): Slice id (PRD-namespaced) · Story-ref ·
  **Design ref** (the signed design contract + prototype this slice builds against; `—` = builds no UI) ·
  **Files (owned, disjoint)** (cross-layer; the disjoint-file guard the orchestrator parallelizes on) ·
  **Regression surface** (blast-radius set, frozen under retry) · Checkpoint (observable) · Blocked-by.
  The orchestrator reads `Blocked-by` as the wave DAG, `Files (owned)` for the disjoint-file guard,
  `Design ref` to carry into **both** the implement and verify dispatch briefs (the verifier is code-cold
  and may not open `plan.md`, so dispatch is the only channel that reaches it), and
  `Regression surface` as the immutable-under-retry contract `incremental-implementation`/`test-driven-development`/`quality-verification`/`git-workflow` consume.
- **Per-step `file` · `lines` · `snippet` · `test`** on every non-trivial step. `incremental-implementation` pulls these
  step-by-step and treats a missing field as **refuse-to-run**.
- **Referenced interfaces** — `codebase-design` deep-module interfaces + `api-design` contracts, inline in
  plan.md (no standalone file).

**STATE.md update:** under `## <PRD-id> · <feature title>`, write one row per slice — initial state
`impl`, gate `you` (the human signs the plan; on sign-off the orchestrator flips the feature to `building`
and the gates to `agent`, then runs incremental-implementation → quality-verification per slice, then one
wave-aggregate review, then pull-request per slice — wave-parallel along the
`Blocked-by` DAG, **fully autonomously**). Slices are born here; record `plan.md` under the feature's
`origin:`.

**Handoff:** Plan is the last human-owned stage. Hand the signed plan + DAG to the orchestrator.
