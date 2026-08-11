---
name: incremental-implementation
description: Builds one assigned slice as thin, individually-tested vertical increments — skeleton-first (stub→mock→wire→fill), simplicity-first, test-first. Use the moment you start writing code for a planned slice, and ESPECIALLY when you're tempted to write more than ~100 lines before running a test, land a whole feature in one pass, "clean up" code outside the slice, or weaken a test to get green. Runs inside the worktree the orchestrator hands you; it is not the place to plan or re-slice.
---

# Incremental Implementation

## Purpose

**Stage: Implement (agent — per slice, inside a worktree).** THE implementer workhorse. It *applies*
`test-driven-development` as its rigid core loop and `source-driven-development` as a referenced discipline; the `worktree` isolation
mechanism is owned by the orchestrator — implement runs in the worktree it is handed, it does not make
its own.

Build in thin vertical slices — implement one piece, test it, verify it, then expand. Avoid implementing an
entire feature in one pass. Each increment should leave the system in a working, testable state. This is the
execution discipline that makes large features manageable.

## When to use / when to skip

- Implementing any multi-file change
- Building a new feature from a task breakdown
- Refactoring existing code
- Any time you're tempted to write more than ~100 lines before testing

**When NOT to use:** Single-file, single-function changes where the scope is already minimal.

## Inputs

Implement runs **per slice, inside the worktree the orchestrator hands it** (it does not create its own
isolation; that is `worktree`, owned upstream). It consumes the Plan-stage contract cold and **refuses to run**
if a load-bearing input is missing.

| Input | Source (skill) | Stable sections it reads | Refuse-to-run if absent |
|---|---|---|---|
| `plan.md` + slices | `plan-breakdown` | the assigned slice's row keyed by **Slice id** — its **Story-ref · Design ref · Files (owned) · Regression surface · Checkpoint · Blocked-by** columns — plus the line-level steps and exact tests in the plan body | no `plan.md`, or no concrete steps for the assigned slice |
| `Design ref` | the slice row, delivered in the dispatch brief | for a UI slice, the signed `design-contract.md` and the committed prototype it names — **open the prototype before you write the skeleton.** Fidelity to it is what Verify grades, and `acceptance.md` is contractually design-free, so the design floor lives nowhere else: in the prototype, in the contract, and — for any axis the contract marks `inherits: docs/design.md` — in that file, which the contract does not restate. Building first and reconciling later is where the rework comes from. A `Design ref` of `—` means this slice builds no UI — proceed; the `—` is the planner's recorded answer, not a blank | the slice touches UI and the brief carried no `Design ref` at all — ask for it rather than guessing the design |
| assigned slice id | `STATE.md` (orchestrator) | the PRD-namespaced slice row in state `impl`, gate `agent` | no slice assigned, or it is not in `impl`/`agent` |
| `acceptance.md` | `acceptance-criteria` (Spec, signed) | the behavioral Given/When/Then scenario ids (e.g. `PWR-A2`) this slice realizes — the **frozen oracle** `test-driven-development` turns RED | the slice references an acceptance id that does not exist |
| clean worktree | `worktree` (orchestrator) | a provisioned, preflight-green baseline branch for this slice | not running inside the handed worktree |

Two further inputs are read rather than required — both when the repo has them, and an absent one means
the repo was never set up for it. Carry on in that case, and do not create either here; `project-setup`
scaffolds both.

- **`docs/progress.md`**, the run record. It is where this slice's entry goes on the hand-run path (see
  *The run record*), and where a previous attempt at the same slice said what it ran and what came back.
- **`docs/lessons.md`**, the lessons record — **read before you write the skeleton**, not after the code
  is written. Each entry is a defect somebody root-caused, with the guard that would catch it coming back.
  The skeleton is where the decisions those entries are about get made, so a lesson read afterwards can
  only tell you what the rework is. You are reading for the entries that touch the area this slice
  builds in; a file with no entry near it costs one read and settles the question.

**Disciplines it applies** (consulted, not stages it consumes): `test-driven-development` (RED-GREEN-REFACTOR; test-first order is
hook-enforced), `source-driven-development` (ground any framework/library decision in fetched official docs, as needed),
`debugging-and-error-recovery` (five-step triage when a slice's tests break). It does **not** re-derive the
plan, re-open the spec, or re-slice — the plan handed to it is already vertical.

## The Increment Cycle

```
┌──────────────────────────────────────┐
│                                      │
│   Implement ──→ Test ──→ Verify ──┐  │
│       ▲                           │  │
│       └───── Commit ◄─────────────┘  │
│              │                       │
│              ▼                       │
│          Next slice                  │
│                                      │
└──────────────────────────────────────┘
```

For each slice:

1. **Implement** the smallest complete piece of functionality
2. **Test** — run the test suite (or write a test if none exists)
3. **Verify** — confirm the slice works as expected (tests pass, build succeeds, manual check)
4. **Commit** -- save your progress with a descriptive message (see the **git-workflow** skill for atomic commit guidance)
5. **Move to the next slice** — carry forward, don't restart

## Slicing Strategies

### Vertical Slices (Preferred)

Build one complete path through the stack:

```
Slice 1: Create a task (DB + API + basic UI)
    → Tests pass, user can create a task via the UI

Slice 2: List tasks (query + API + UI)
    → Tests pass, user can see their tasks

Slice 3: Edit a task (update + API + UI)
    → Tests pass, user can modify tasks

Slice 4: Delete a task (delete + API + UI + confirmation)
    → Tests pass, full CRUD complete
```

Each slice delivers working end-to-end functionality.

### Skeleton-First (stub → mock → wire → fill)

Within a vertical slice, build the skeleton end-to-end first, then fill it in — absorbed from cr-structure's
build-order. Each step is independently observable:

- **Read `docs/lessons.md` first, every slice.** Before the stub, open the lessons record and look for
  entries touching the area this slice builds in. Every entry there is a defect this project already paid
  for once, and each names the guard that would catch it again — which is a decision about how to build,
  not a note to file afterwards. This is the only moment reading it changes anything: after the skeleton,
  the same entry costs a rewrite instead of a choice. A repo with no such file, or none near this area,
  costs one read.
- **Read the design ref first (UI slices).** Before the stub, open the prototype and contract named in the
  slice's `Design ref`. The skeleton is where layout, hierarchy and component boundaries get decided, and
  those are exactly what the prototype already decided — start from it and the fidelity check at Verify is
  a formality; start from a guess and it is a rewrite. A `Design ref` of `—` means no UI: skip straight to
  Stub.
- **Stub** — every layer the slice touches returns a hardcoded value; the end-to-end path already runs.
- **Mock** — swap stubs for mocks at the real boundaries; the shape of the data flows through.
- **Wire** — replace mocks with the real calls, one boundary at a time.
- **Fill** — handle the edge cases and error paths.

This is the antidote to horizontal building (all DB, then all API, then all UI), which yields code that does
not work end-to-end until the last step and gives you nothing to debug from in between. The plan you were
handed is already sliced vertically; skeleton-first is how you build *each* slice without silently
re-horizontalizing it. The Increment Cycle's "Verify" step is the slice's **checkpoint** — a specific
observable fact ("submitting the form shows the inline error"), never "it compiles".

### Contract-First Slicing

When backend and frontend need to develop in parallel:

```
Slice 0: Define the API contract (types, interfaces, OpenAPI spec)
Slice 1a: Implement backend against the contract + API tests
Slice 1b: Implement frontend against mock data matching the contract
Slice 2: Integrate and test end-to-end
```

### Risk-First Slicing

Tackle the riskiest or most uncertain piece first:

```
Slice 1: Prove the WebSocket connection works (highest risk)
Slice 2: Build real-time task updates on the proven connection
Slice 3: Add offline support and reconnection
```

If Slice 1 fails, you discover it before investing in Slices 2 and 3.

## Implementation Rules

### Rule 0: Simplicity First

Before writing any code, ask: "What is the simplest thing that could work?"

After writing code, review it against these checks:
- Can this be done in fewer lines?
- Are these abstractions earning their complexity?
- Would a staff engineer look at this and say "why didn't you just..."?
- Am I building for hypothetical future requirements, or the current task?

```
SIMPLICITY CHECK:
✗ Generic EventBus with middleware pipeline for one notification
✓ Simple function call

✗ Abstract factory pattern for two similar components
✓ Two straightforward components with shared utilities

✗ Config-driven form builder for three forms
✓ Three form components
```

Three similar lines of code is better than a premature abstraction. Implement the naive, obviously-correct version first. Optimize only after correctness is proven with tests.

### Rule 0.5: Scope Discipline

Touch only what the task requires.

Do NOT:
- "Clean up" code adjacent to your change
- Refactor imports in files you're not modifying
- Remove comments you don't fully understand
- Add features not in the spec because they "seem useful"
- Modernize syntax in files you're only reading

If you notice something worth improving outside your task scope, note it — don't fix it:

```
NOTICED BUT NOT TOUCHING:
- src/utils/format.ts has an unused import (unrelated to this task)
- The auth middleware could use better error messages (separate task)
→ Want me to create tasks for these?
```

### Rule 1: One Thing at a Time

Each increment changes one logical thing. Don't mix concerns:

**Bad:** One commit that adds a new component, refactors an existing one, and updates the build config.

**Good:** Three separate commits — one for each change.

### Rule 2: Keep It Compilable

After each increment, the project must build and existing tests must pass. Don't leave the codebase in a broken state between slices.

### Rule 3: Feature Flags for Incomplete Features

If a feature isn't ready for users but you need to merge increments:

```typescript
// Feature flag for work-in-progress
const ENABLE_TASK_SHARING = process.env.FEATURE_TASK_SHARING === 'true';

if (ENABLE_TASK_SHARING) {
  // New sharing UI
}
```

This lets you merge small increments to the main branch without exposing incomplete work.

### Rule 4: Safe Defaults

New code should default to safe, conservative behavior:

```typescript
// Safe: disabled by default, opt-in
export function createTask(data: TaskInput, options?: { notify?: boolean }) {
  const shouldNotify = options?.notify ?? false;
  // ...
}
```

### Rule 5: Rollback-Friendly

Each increment should be independently revertable:

- Additive changes (new files, new functions) are easy to revert
- Modifications to existing code should be minimal and focused
- Database migrations should have corresponding rollback migrations
- Avoid deleting something in one commit and replacing it in the same commit — separate them

## Working with Agents

When directing an agent to implement incrementally:

```
"Let's implement Task 3 from the plan.

Start with just the database schema change and the API endpoint.
Don't touch the UI yet — we'll do that in the next increment.

After implementing, run `npm test` and `npm run build` to verify
nothing is broken."
```

Be explicit about what's in scope and what's NOT in scope for each increment.

## Increment Checklist

After each increment, verify:

- [ ] The change does one thing and does it completely
- [ ] All existing tests still pass (`npm test`)
- [ ] The build succeeds (`npm run build`)
- [ ] Type checking passes (`npx tsc --noEmit`)
- [ ] Linting passes (`npm run lint`)
- [ ] The new functionality works as expected
- [ ] The change is committed with a descriptive message

**Note:** Run each verification command after a change that could affect it. After a successful run, don't repeat the same command unless the code has changed since — re-running on unchanged code adds no information.

## The run record

When a slice is run by hand — no orchestrator dispatched it, and you are working in the repository
itself rather than in a worktree handed to you — **append that slice's entry to `docs/progress.md`**
when the attempt finishes. One entry, in the shape the file's `## Entry shape` section holds: the
commands you ran in the form you ran them, their real output, the files that changed, what was **not**
run and why, and any follow-ups.

**Inside an orchestrated run you are not the writer.** The orchestrator opened a stub for this slice
before dispatching you and completes it at the TERMINAL barrier, in the checkout it holds. You are inside a
worktree, and a worktree is a branch that may never be merged — an entry appended there succeeds,
reports success, and reaches no reader on the main line. Hand your commands and their output back
instead; the orchestrator writes them into the entry it already owns. **The two cases are told apart by
one fact you already have: were you handed a worktree?** Handed one → return the evidence. Working in
the repository → append.

Three things about the entry, each of which someone gets wrong:

- **One entry for the attempt, not one per increment.** A thin slice is many increments by design, and
  an entry per increment buries the slice it was meant to describe. If a Verify pass ran on this attempt,
  its commands and output belong in this same entry — `quality-verification` never writes its own.
- **Append only.** An earlier entry is never edited, re-worded, re-dated, re-ordered, or removed, not
  even the one recording the failure this attempt fixed. A second attempt writes a second entry. An
  attempt to change an existing one is a **STOP**: the work ends there, and the violation is reported
  naming the entry and what would have changed. Refusing quietly reads as a silent success, and the
  previously recorded text stays readable in full either way.
- **No state, no gate, no owner.** `STATE.md` says which stage the slice is at and who acts next. This
  file says what ran. One question with two answers is one answer too many.

Two lines nothing enforces, and they are the reason the file is worth keeping. Never write that a
command was run when it was not — put it under "Not run" with the reason, and write that line even when
nothing was skipped. And withhold any credential that appears in output, saying that you withheld it
rather than dropping the line silently. No hook and no CI checks either one.

## The lesson a slice hands back

`docs/lessons.md` is the defect record. You read it before the skeleton and you never write it — and you
are still the middle of that record's chain, because you are the slice's terminal. Whatever leaves this
slice leaves on the hand-back you make to the orchestrator.

`debugging-and-error-recovery` is the discipline you reach for when a slice's tests break, and
root-causing a defect is what obliges an entry. That skill authors one — every field filled, the guard
named — and then meets the wall *The run record* above describes, for the same reason and told apart by
the same fact: it is running in the worktree you were handed, so an append there lands on a branch that
may never merge. It hands the finished entry back to you instead, and says it is still owed.

**Carry it out, and name it as still owed**, alongside the commands and their output you return for the
run record. The orchestrator carries it into `docs/lessons.md` at the **TERMINAL barrier**, in the
checkout it holds — the one place a handed-back entry reaches the main line. Its guard against a dropped
one fires on a slice *that handed an entry back*, so an entry you never name creates no condition for
that guard to test. Handed back silently it reads as done, and nothing downstream re-reports it.

**Carrying is not authoring, and the red flag against appending still holds exactly as written.** You do
not open that file, fill a field, or turn a defect you fixed into an entry of your own — the record has
two authors and you are neither. Carrying touches no file at all: the entry arrives finished and rides
out on your return value, the way a command's output does. One author, one courier, one append.

Handed a worktree → return the entry. Working in the repository itself → there is nothing to carry,
because `debugging-and-error-recovery` appends it where a reader will find it. A repository that keeps
no `docs/lessons.md` was never set up for one; say so and carry on.

## Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll test it all at the end" | Bugs compound. A bug in Slice 1 makes Slices 2-5 wrong. Test each slice. |
| "It's faster to do it all at once" | It *feels* faster until something breaks and you can't find which of 500 changed lines caused it. |
| "These changes are too small to commit separately" | Small commits are free. Large commits hide bugs and make rollbacks painful. |
| "I'll add the feature flag later" | If the feature isn't complete, it shouldn't be user-visible. Add the flag now. |
| "I'll read `docs/lessons.md` if something breaks" | By then the lesson costs a rewrite. Its entries are decisions about how to build, and the skeleton is where those decisions get made — which is why it is read before the stub, not after the failure. |
| "This refactor is small enough to include" | Refactors mixed with features make both harder to review and debug. Separate them. |
| "Let me run the build command again just to be sure" | After a successful run, repeating the same command adds nothing unless the code has changed since. Run it again after subsequent edits, not as reassurance. |
| "I'm in a worktree, but the record is a repo file — I'll append my entry there anyway." | A worktree is a branch that may never merge. The write succeeds and reaches nobody. Hand the evidence back; the orchestrator owns that slice's entry. |
| "The lesson is written and the fix is committed — the record will pick it up from there." | Nothing reads a diff, or a worktree, for lessons. The entry reaches `docs/lessons.md` only if you name it as still owed on the way out, and the orchestrator's guard against a dropped one is conditioned on your having named it. Unnamed, it reads as done and is gone. |
| "Carrying that entry out *is* writing the record, and this skill is forbidden to write it." | Carrying touches no file. The entry arrives finished from whoever root-caused the defect, you return it, and the orchestrator appends it once. The refusal is about authorship — writing an entry, or filling a field of one — and returning what you were handed is neither. |
| "The tests passed; I'll write 'tests green' and skip pasting the output." | An entry asserting a pass with nothing behind it is exactly the claim the record exists to make checkable. Paste what came back, or say the check was not run. |
| "Nothing was skipped, so the 'Not run' line has nothing to say." | Write it and say nothing was skipped. A missing line and a deliberate silence look identical to the reader. |
| "The retry fixed it, so the entry describing the failure is now misleading." | It described that attempt correctly and still does. Append a second entry. Editing the first is a **STOP**: the work ends there and the violation is reported by name. |
| "I'll add the slice's state to the entry so the record is readable on its own." | The board already answers that, and two answers diverge the moment one is updated. The record says what ran. |

## Red flags

- More than 100 lines of code written without running tests
- Multiple unrelated changes in a single increment
- "Let me just quickly add this too" scope expansion
- Skipping the test/verify step to move faster
- Build or tests broken between increments
- Large uncommitted changes accumulating
- Building abstractions before the third use case demands it
- Touching files outside the task scope "while I'm here"
- Creating new utility files for one-time operations
- Running the same build/test command twice in a row without any intervening code change
- Writing a skeleton without having opened `docs/lessons.md` — the entries there are decisions about how
  to build, and read after the skeleton they are a post-mortem of your own work
- Appending to `docs/lessons.md` — you read that record and never write it, including when a `Critical:`
  review finding was routed back here and you fixed it without invoking `debugging-and-error-recovery`.
  Fixing a defect decides who fixed it, not who records it: a defect you root-caused is
  `debugging-and-error-recovery`'s entry, and a Critical review finding is recorded by the re-review round
  that finds it closed. This flag is about **authorship** and reaches nothing else. Returning an entry
  that skill handed you finished is carrying, not writing — it opens no file — and *The lesson a slice
  hands back* is where that is required of you
- Returning from a slice without naming an entry `debugging-and-error-recovery` handed you as still owed
  — the orchestrator's guard fires on a slice *that handed one back*, so an unnamed entry leaves it
  nothing to catch. The lesson dies at the slice boundary, and no later stage re-reports it
- Writing UI in a slice whose `Design ref` names a prototype you never opened — Verify grades fidelity to
  that file, so a first look at it after the code is written is a rewrite waiting to happen
- Editing `docs/design.md` so the built surface matches it — the decided look is an oracle Verify grades
  inherited axes against, and it carries no signature of its own to protect it. Moving it to clear a
  design gate is gate-erosion → HALT. A slice reads that file; it never writes it.
- Appending to `docs/progress.md` from inside a worktree the orchestrator handed you — that write lands on
  a branch that may never merge and reaches no reader, while reporting success.
- Finishing a hand-run slice without an entry, or writing one that asserts a check passed with neither its
  output nor a "Not run" line behind it.
- Editing, re-wording, re-dating, re-ordering, or removing an entry already in `docs/progress.md` → STOP,
  and report the violation naming the entry and what would have changed. Append a new entry instead.
- Pasting a token, key, or password into an entry — withhold the value and say you withheld it.

## Verification (ending criteria)

After completing all increments for a task:

- [ ] Each increment was individually tested and committed
- [ ] The full test suite passes
- [ ] The build is clean
- [ ] The feature works end-to-end as specified
- [ ] No uncommitted changes remain

## See Also

Per-increment verification is the local check. Before declaring a task done, apply the project-wide Definition of Done as the final gate, the standing bar every increment clears regardless of the task. See `../../references/definition-of-done.md`.

## Outputs & handoff contract

- **Emits:** a **`diff`** on the slice's worktree branch — the implemented slice as a sequence of atomic,
  individually-tested commits (code + the tests that prove it). This is the artifact `quality-verification` (Verify) consumes
  cold, alongside the running app and `acceptance.md`.
- **Stable guarantees the consumer depends on:**
  - The diff stays **inside the slice's declared `Regression surface`** (from `plan.md`). Narrowing or
    widening that surface to pass is a **gate-erosion HALT**, not a fix.
  - Tests land **test-first** (the `test-driven-development` order hook enforces it) and assert **observable behavior**, never
    mock calls (testing-strategy AP1).
  - The worktree is **compilable and green at every increment checkpoint** — never left broken between slices.
  - The slice diff stays within the **≤400 LOC** cluster cap; if it cannot, the
    slice was mis-sliced — stop and surface, do not stretch the cap.
- **Frozen-under-retry (silent-false-green defense — non-negotiable):** during this slice's bounded retry
  rounds, `acceptance.md`, the RED tests, and the declared `Regression surface` are **immutable**. A retry
  diff that weakens an assertion, deletes a test, or narrows the surface = **HALT** (gate-erosion + reward-hack
  tripwire: the failure signature must not move only because a test/acceptance was edited while impl is
  materially unchanged). The way to green is to fix the impl (via `debugging-and-error-recovery`), never to
  move the goalposts. No `--no-verify`, no hook edits, no `SKIP_HOOKS` (security.md / CLAUDE.md).
  Those three thaw between runs — a person can change them by a signed Spec change, outside the run.
- **Read-only rather than frozen — `docs/design.md`, the repository's decided look.** It is not a fourth
  frozen artifact; it is a file a slice reads and never writes. Verify grades every contract axis marked
  `inherits: docs/design.md` against it, and it carries no `status:` of its own, so nothing else catches
  an edit. Moving the decided look so the built surface matches the code is weakening a check to clear a
  gate — the same gate-erosion **HALT**, retry or not. Only `frontend-design` writes that file, under the
  sign-off of a surface that means to move the whole look.
- **Appends to `docs/progress.md`** — this slice's entry, **only on the hand-run path**: no orchestrator
  dispatched it and no worktree was handed over, so the append lands in the repository itself, where a
  reader will find it. Inside a run the orchestrator owns the entry and this skill returns its commands
  and their output instead — an entry appended from a worktree lands on a branch that may never merge and
  reaches nobody, which is the failure this split exists to avoid. One entry per attempt, carrying the
  commands as run, their real output, the files changed, and what was not run and why; append only, and
  no stage, state, gate, or owner in it. Full rule in *The run record* above.
- **Hands back, on the same return and for the same reason, any lesson this slice owes:** the finished
  entry `debugging-and-error-recovery` authored when it root-caused a defect here, returned unchanged and
  named as still owed. This skill is that entry's courier out of the worktree and nothing more — the
  orchestrator carries it into `docs/lessons.md` at the TERMINAL barrier, and this skill touches that file
  nowhere. On the hand-run path there is nothing to carry: the author already appended it in the
  repository itself. Full rule in *The lesson a slice hands back* above.
- **`STATE.md` update:** on a green slice checkpoint, flip the slice **`impl → verify`** (gate stays `agent`)
  and hand off to `quality-verification`. If the slice cannot pass after the bounded rounds (3 implement→verify→review cycles),
  flip it **`impl → halted`** and **flip its gate `agent → you`** — the failure-escalation path is the only
  place a human gate survives the autonomous run.
- **Consumer:** `quality-verification` (Verify). Change the shape of what you emit → update `quality-verification` in the same commit.
