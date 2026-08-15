---
name: orchestrator
description: Drives the autonomous Implement→Verify→Review→Ship loop once the human-owned Spec+Plan is signed and STATE.md holds a slice DAG. Use it to run a build AFK — it sorts slices into topological waves, runs each wave's ready slices in parallel (one worktree per slice, disjoint files only), holds a barrier until every slice reaches a TERMINAL state (done/halted/blocked — never just "success"), and ends the run at risk-banded OPEN PRs for async human merge. If you are about to hand-run slices one at a time, check in with the human between waves, dispatch a "reviewer" persona, weaken a frozen test/acceptance to make a gate go green, or merge to main yourself — STOP and use this instead.
---

## Purpose

**Stage: cross-cutting engine (the autonomous span).** The human owns Ideate +
Spec + Plan — all the thinking. Once they sign the Spec and author the plan, *something*
has to actually build it: run every slice through Implement → Verify → Review → Ship with
no human babysitting, in parallel where the dependency graph allows, and stop at a state a
human can review async. That something is this skill. It exists because the alternative —
the controlling agent hand-running slices one at a time, checking in between each — throws
away the parallelism the slice DAG was designed for and reintroduces the human halt
deliberately removed. The orchestrator is the only skill that reads the *whole* board and
moves slices across it.

## When to use / when to skip

**Use when:** the Spec gate is signed, `preflight-readiness` is green, and `STATE.md` holds a feature
carrying slice rows whose `Blocked by` column forms a DAG — and you want the build run autonomously to
open PRs. That feature reads **`feature: plan`** on a first run, which is where `plan-breakdown` leaves
it, or **`feature: building`** on a resumed one, which is where *you* left it. Being invoked is the
human's Plan sign-off: the rows are born at gate `you` precisely because a person has to read the plan
first, and a person starting the run is that reading. Flipping `plan → building` is this skill's own
first write — Process step 3. This is the default executor; sequential execution is just the degenerate
case (a wave of one).

**Skip when:** the feature has no slice rows yet — it sits at `feature: spec`, or at `feature: plan`
with nothing under it, and the human still owns Spec or Plan; you are doing a single one-off edit with
no DAG; or `preflight-readiness` is red/amber (fix the environment first — the wave must not start).
**Slice rows, not the feature token, are what say Plan is finished.** A board reading `feature: plan`
*with* rows under it is the normal starting board, not a skip: nothing writes `building` before you do,
so refusing that board refuses every board `plan-breakdown` has ever produced.

**Escape hatch (`depth: lite`):** a single ready slice with no siblings still runs the full
Implement → Verify → (aggregate) Review loop and the barriers — do not "just do it inline." For a
wave of one the aggregate review is simply that one slice's diff, so it costs the same as the old
per-slice review; the barriers, the worktree, and the three gates are the point even here.

## Inputs

Refuse to run (CRISPY refuse-to-run) unless ALL are present:

- **`STATE.md`** (repo root, created by `project-setup`) — the two-level board. The `Blocked by`
  column IS the slice DAG. There must be a feature at **`feature: plan`** with at least one slice row
  in `impl` — the board `plan-breakdown` hands over — or at **`feature: building`**, which is a run
  you already started and are resuming. Absent, no feature carrying slice rows, or a feature still at
  `feature: spec` → refuse. The `plan → building` flip is yours and happens in step 3; do not require
  the board to already say `building`, because nothing else writes that token.
- **`preflight-readiness` verdict = GREEN** — every `environment.md` row provisioned. Red or
  un-attested amber → refuse to start the wave.
- **`plan.md` + slices** (`docs/features/<slug>/`) — each slice's concrete steps, exact
  tests, declared `Regression surface`, `Design ref`, and `Files (owned)` ownership. Missing
  file-ownership on a slice that shares a wave → refuse (the disjoint-file guard cannot run blind).
- **`acceptance.md` (status: signed)** — the frozen behavioral oracle. The orchestrator
  FREEZES `acceptance.md` + the RED tests + each slice's `Regression surface` for that
  slice's retry loop; it never edits them. Editing any of the three is a **loosening**: one rule,
  *Changing what judges the work*, governs this and every other prohibition below.

One more input is required per slice rather than per run, so it gates a slice instead of the run:
**the design contract each slice's `Design ref` names, at `status: signed`**, for every slice whose
`Design ref` is not `—`. It is read at dispatch, before that slice's implementer runs; absent or
`status: draft` halts **that slice**, with the halt reason naming the contract by path, while the rest
of the wave dispatches normally. Fully specified in *Design-ref gate at dispatch* below.

Bulk artifacts move as **files**, never pasted into a dispatch prompt (subagent-driven-
development §File Handoffs): a slice dispatch carries the slice brief path + its frozen
contract paths, not the session history.

## Process

1. **Resume cold.** Read `STATE.md` and `docs/progress.md` first. The board says which slices are
   `done`/`ship` — never re-dispatch one (subagent-driven-development §Durable
   Progress: re-dispatching completed work is the single most expensive failure). The run record says
   what the last attempt actually executed and what came back, and a heading in it with nothing under it
   is a slice that was dispatched and died before returning. Trust those two plus `git log` over
   recollection after compaction: the board answers what state a slice is in, the record answers what was
   run, and neither answers the other's question.
2. **Build the DAG.** Parse every slice's `Blocked by` into edges; topologically sort into
   **waves** (each wave = one topological level). Verify no cycles — a cycle blocks the run;
   surface it and stop (the human must reorder dependencies).
3. **Open the run — flip the feature to `building`.** The board still reads `feature: plan`: that is
   where `plan-breakdown` leaves it, and this flip is yours and nobody else's (`references/write-ownership.md`,
   *Who writes what*: `a feature block's feature: state`, `orchestrator`, flip status). Do it once the three
   things that warrant it are true and not before — the feature carries slice rows whose `Blocked by`
   DAG steps 1–2 just read and found acyclic, the `preflight-readiness` verdict is green, and the signed
   `acceptance.md` plus the `plan.md` slices exist. Those three *are* the Run-start gate, which is the
   one gate in the lifecycle this skill owns; flipping the token is what opening it looks like on the
   board, and a run whose board never says `building` is a run no reader can tell started. In the same
   write, move each slice row's `Gate` from `you` to `agent`: the rows are born `you` because a person
   signs the plan, and the run is what takes them over.
   **Flip the state token only.** The feature block, its `origin:` line, its rows, their titles, and
   their `Design ref` cells belong to `plan-breakdown` and are not yours to rewrite — the write table
   grants you `flip status` there, which is one token and no more. A board already at `feature: building` is a
   resumed run: nothing to flip, and a row already past `you` keeps the gate it has.
4. **Select the ready wave, then order it.** A slice is ready when every blocker is `done`. Apply
   the **disjoint-file guard** (below) to the ready set, then put what survives into the order
   *Dispatch order* (below) defines — deepest downstream chain first, transitive dependent count as
   the second key, `plan.md` order last. Selection decides *which* slices run; the order decides *which one starts first*,
   and that is what sets the run's wall clock the moment the guard splits the wave into sub-waves.
5. **Open each slice's entry, provision isolation, then run the design-ref gate.** The moment a slice
   enters the wave — before its brief is assembled, before any gate can stop it — append its **stub** to
   `docs/progress.md`: the entry heading, and nothing under it (see *The run record*). Then each ready
   slice gets its own clean
   worktree (the `worktree` mechanism this skill owns). Platform-adaptive (below). While assembling
   the brief, read the slice row's **`Design ref`** — it travels with the slice from here on. If it
   is not `—`, open the `design-contract.md` it names and read `status:` **before dispatching
   anything for that slice** (see *Design-ref gate at dispatch*). Absent or `status: draft` → that
   slice is **`halted` here**, its halt reason naming the unsigned contract by path; no implementer
   runs, so no partially built interface exists to reach Verify or Review.
6. **Run Implement + Verify per slice** for every ready slice — in parallel (one dispatch call
   per slice, all in one response = concurrent execution): `incremental-implementation` (applies
   `test-driven-development`) → `quality-verification` (Verify, fresh code-cold). Verify stays
   **per-slice** — behavioral acceptance is a property of the individual slice, not the wave.

   **Carry the design ref into both briefs.** Copy `Design ref` from the slice row into the
   implementer's brief **and** the verifier's brief. Dispatch is the only channel that reaches both:
   the implementer must open the prototype before it builds, and the verifier is code-cold — it may
   not read `plan.md`, so anything left only in the plan never arrives. A `—` is delivered
   explicitly **as `—`**, not omitted: it tells the verifier this slice builds no UI, rather than
   leaving it to infer that from work it did not do. Where the ref names a path and the repo has a
   `docs/design.md`, carry that path in both briefs too: a contract axis marked
   `inherits: docs/design.md` is graded against that file, so a verifier handed only the contract is
   handed half its oracle.
7. **Verify barrier.** Wait for every ready slice to reach `verify` green **or** a terminal state
   (a slice that halts at Verify never enters the review). This barrier is what lets the next step
   review the wave as one changeset instead of N.
8. **Aggregate Review over the whole wave.** Run the four floor axes (`code-review` +
   `code-simplification` + `security-and-hardening` + `performance-optimization`) — plus any reviewer
   the trigger table below adds — as fresh code-cold
   subagents (one axis each, in parallel), **once over the union of the verify-green slices' diffs**
   — **4+k subagents per wave, not 4 × N**, where k is however many reviewers the trigger table added
   (usually zero). The win is in the *per-wave* denominator, not in the roster: never budget off the
   literal 4 and drop a triggered reviewer to hit it — that is a loosening. Attribute every finding to its
   **owning slice by file**: the disjoint-file guard guarantees each file belongs to exactly one
   slice, so attribution is unambiguous. A finding routes *only its owning slice* back to
   `incremental-implementation`, which climbs *The escalation ladder* against it; after that slice
   re-passes Verify, **re-review only its diff**, never the whole wave again.
9. **Evaluator floors + DRAFT PR per slice** — still per-slice (each slice owns its plan steps and
   regression surface). A slice whose attributed review findings are clear and whose floors are met
   opens its own DRAFT PR. A slice that fails instead climbs *The escalation ladder* — five rungs, each
   a different tactic, and it halts only when they are spent. Budget: **2 attempts per gate, 3
   implement→verify→review cycles per slice**, spent across the ladder rather than on repeating one
   approach.
10. **TERMINAL barrier.** Wait for EVERY slice in the wave to reach a **TERMINAL** state
   (`done | halted | blocked`) — **never `success`**. Write every transition + gate flip to
   `STATE.md` as it happens. **Complete each slice's entry** in `docs/progress.md` from what the slice
   returned — the commands, their real output, the files it changed, and what it did not run and why (see
   *The run record*). A slice that returned nothing keeps the stub it was given and is completed with
   that fact. In the same pass, carry over any lessons entry the slice handed back, into the same
   checkout (see *The lessons a slice hands back*). Then advance to the next wave.
11. **Integration gate.** After a connected DAG component's slices are all green, run the
    merged-union suite once in an integration worktree before presenting. Union-fail →
    the component's PRs go DRAFT + a blocker is recorded.
12. **Terminate** on exactly one predicate (see Verification). Append the inverted risk
    report; leave risk-banded OPEN PRs for the human.

## Wave executor & the TERMINAL barrier

The DAG → topological-wave structure is the whole point: independent branches drain in
parallel, dependent branches serialize, and the barrier between waves is what makes the run
resumable from `STATE.md` alone. The barrier waits for **TERMINAL, not SUCCESS**
(safety rail 5, `references/safety-rails.md`): a `halted` or `blocked` slice still satisfies the barrier — the run
does not stall waiting for a slice that will never pass. Its dependents transitively flip to
`blocked`; every *other* independent branch keeps draining.

## The run record

**Appends to `docs/progress.md`** — one entry per slice, per dispatch. An entry carries the commands that
were run in the form they were run, their real output, the files that changed, and what was **not** run
and why. It exists because the alternative account of a run is the run's own summary, and a summary is
written by the party with the most reason to round up.

**Where the write lands, and this is the part that has gone wrong before.** The entry is appended in the
checkout **you** hold — the branch the run was started from — never inside a slice's worktree. A worktree
is a separate branch that may never be merged: a write there succeeds, reports success, and reaches no
reader on the main line. Slices run in worktrees; the record does not. That is why the orchestrator holds
the pen for every slice in an orchestrated run rather than letting each slice write its own entry, and it
is the whole reason adapter B exists for the hand-run case (`incremental-implementation`, which has no
worktree to be stranded in).

**Two writes per slice, at two moments:**

1. **The stub, at dispatch.** The moment a slice enters the wave, append its heading —
   `## <date> — <SLICE-ID> — <title>` — with nothing under it. It carries the slice id and nothing else:
   no state, no gate, no owner. A stub is not a status; it is the fact that this slice started.
2. **The completion, at the TERMINAL barrier.** Fill the fields under that heading from what the slice
   returned.

Writing only at the barrier cannot record a slice that died on the way there, and a slice that dies has
to be distinguishable from one that was never dispatched. The stub is what makes the difference visible:
a heading with nothing under it started and did not finish; a slice never dispatched has no heading at
all. It also survives *you* — a run that ends between dispatch and barrier leaves the stubs behind, which
is the case a barrier-only write loses entirely.

**Completing a stub adds lines under it. It never rewrites the heading, and never touches an entry that
is already complete.** A retried slice is dispatched again, so it gets its own stub and its own entry —
the same failure twice is two entries, and the second never replaces the first. An attempt to edit,
re-order, re-date, or remove an existing entry is a **STOP**: the work ends there and the violation is
reported, naming the entry and what would have changed. Refusing quietly is not enough, because a silent
refusal reads as a silent success.

**Verify's result belongs to the slice's entry, not a second one.** `quality-verification` hands back its
commands and their output with `qa.md`; those go into the fields under that slice's heading. One slice,
one entry per dispatch — a second entry for the same attempt would let a reader count one slice twice.

**Two lines nothing checks, and they are the ones that matter.** Never write that a command was run when
it was not — put it under "Not run" with the reason. And withhold any credential appearing in output,
saying that you withheld it rather than dropping the line. No hook, no validator, and no CI enforces
either; the entry shape in `docs/progress.md` states them where the writer can see them, and that is the
whole mechanism.

**The record answers what ran. It never answers who acts next.** No entry carries a stage, a state, or an
owner — `STATE.md` is the board and this is the evidence. Two files answering one question is one answer
too many, and the one that goes stale is the one nobody is driving.

### The lessons a slice hands back

One other record reaches the main line through you, and for the same reason as the one above.

**Appends to `docs/lessons.md`** — one entry per lesson a slice hands back, at the **TERMINAL barrier**,
into the checkout you hold and at the moment you complete that slice's run-record entry. Whoever
root-causes a defect inside a worktree, and whoever closes a Critical review finding there, both owe the
lessons record an entry and neither can land one where a reader will find it. They hand the finished entry
back and say it is still owed. You are its courier, not its author — **append only**, and every entry
arrives complete. A handed-back entry you do not carry over is a lesson this repository never learned,
and nothing downstream notices it went missing.

The two records answer different questions and are not interchangeable. The run record says what this
slice executed; the lessons record says what a defect turned out to be and names the guard that would
catch it coming back, for whoever meets the same mistake in a repository this run will never touch. That
is why it outlives the slice, and why dropping one costs more than it looks like it costs. A repository
that keeps no `docs/lessons.md` was never set up for one: there is nothing to carry, and the slice saying
so is the whole of it.

## Verify barrier & wave-aggregate review

Verify and Review sit at **different granularities on purpose**. Verify is a property of an
individual slice — does *this* slice's behavior satisfy its signed acceptance scenarios? — so it
stays per-slice and runs inside each slice's worktree. Review asks cross-cutting questions
(correctness, simplicity, security, performance) that a reviewer answers better seeing the wave as
one changeset, and running it once per slice was the run's dominant token cost (4 code-cold
subagents × N slices). So the loop inserts a **verify barrier**: once every ready slice is
verify-green (or terminal), the review axes run **once over the union of those slices' diffs**
— **4+k per wave, not 4 × N**, where k is the reviewers the trigger table below adds. A wave that
fires two rows runs six passes once, rather than six per slice; the saving is the denominator, and it
survives intact however many reviewers the roster holds.

Attribution stays clean because the **disjoint-file guard already holds**: every file in the wave
belongs to exactly one slice, so every review finding (which cites a file) maps to exactly one
owning slice. A finding routes *only its owning slice* back to `incremental-implementation`; the
other slices, whose files it never touched, are unaffected and keep their clean review. After the
flagged slice re-passes Verify, **re-review only its diff** — re-running the whole-wave review on
every single-slice fix would hand the token cost right back. The wave advances when every slice's
attributed findings are clear (or the slice is terminal).

This preserves every safety property the per-slice fan-out had: four independent code-cold axes, no
role-play, and the security circuit-breaker — a CRITICAL/HIGH in the wave-scoped security pass
hard-halts *its owning slice* (never a PR), while a repo-wide committed secret still freezes the
next barrier for the whole run.

**The four axes are a floor, not a list.** Every wave gets all four. On top of that, check the wave's
changed paths and diff content against the table below; **every row that matches adds** a code-cold
reviewer to the fan-out. Nothing in the table can remove one, and a wave matching no row still gets
all four.

| The fact that fires the row | Adds |
|---|---|
| The diff changes a symbol, route, or schema that a file **outside** the wave imports or calls | `api-design` — is this addition rather than modification, and does any existing caller break? |
| The diff deletes or renames a file, exported symbol, or persisted field, and something outside the diff still names the old one | `deprecation-and-migration` — is there a replacement and a migration path, or are callers stranded? |
| The diff changes CI, build, or deploy configuration (workflow files, pipeline or container config) | `ci-cd` — the pipeline is itself part of what judges the work; a step removed here is a loosening (see *Changing what judges the work*) |
| The diff adds an error branch, retry, background job, or outbound call that emits no log, metric, or trace | `observability-and-instrumentation` — a production failure on that path leaves no evidence |

Each row's first column is a **fact about the diff you can check by reading it**: the caller exists or
it does not; the old name is still referenced or it is not; the new branch logs or it does not. That
is the point — a row you cannot check is a row that fires on impression, and a router built out of
impressions is not a router. If the fact cannot be established, the row does not fire and the floor
four still run.

UI is deliberately absent from the table. Fidelity to the signed design contract and the
accessibility pass belong to `quality-verification`, which grades a **running** interface; Review
reads a diff and cannot see one.

**The drop half is deferred, and this is the evidence it waits on.** The symmetric rule — removing an
axis from a wave that has nothing for it — needs a per-axis finding rate measured over real runs, and
no such journal exists yet. `docs/progress.md` is not it and does not become it: it records what each
slice executed, not which axis's finding changed which diff. Until a run journal records, wave by wave,
which axis produced findings
that changed a diff, dropping an axis is a loosening with no measurement behind it and is refused on
exactly those grounds (*Changing what judges the work*). The deferral ends when that journal holds
enough waves to compute the rate — not when the fan-out starts to feel expensive.

## Disjoint-file guard

Same-wave slices parallelize **only if their declared file ownership is disjoint** — never
two write subagents on one file (dispatching-parallel-agents §Shared state;
safety rail 5). On overlap: **serialize** them into sub-waves (or merge them into one
slice). This is consistent with worktree-level parallelism — same-level slices are
independent by construction, so serializing an overlap is not a cohesion violation, it is the
guard doing its job.

## Dispatch order

Among the ready slices, dispatch in this order:

1. **Longest downstream chain first.** For each ready slice, measure the **depth** of the longest
   chain hanging off it — the number of steps in the longest path of slices that cannot start until
   it is `done`. Greatest depth starts first. That depth is the slice's critical path.
2. **Transitive dependent count as the second key.** Equal depth → the slice whose whole transitive
   dependent set is larger. Among slices that free chains of the same length, the one that frees more
   work is the better first move.
3. **`plan.md` order as the last tie-break.** Equal on both keys → whichever slice appears first in
   `plan.md`.

**Depth, not volume — they come apart on any fan-out-versus-chain graph.** Say `C` is blocked by `A`,
`D` by `C`, `E` by `D`, `F` by `E` — one chain hanging off `A`. A's transitive dependent set is
`{C, D, E, F}`: count 4, depth 4. Now say `G`, `H`, `I`, `J`, `K` are each blocked by `B` and nothing
else — a fan of leaves. B's set is `{G, H, I, J, K}`: count 5, depth 1. Ordering by count starts B
and parks the four-deep chain behind leaves that could have run at any point; at unit cost the run
takes 6 steps where 5 was available. Volume tells you how much work a slice unblocks; only depth
tells you how much of the run is *waiting in line* behind it, and the wall clock is made of the line,
not the pile.

**Where the rule bites: the sub-waves the disjoint-file guard creates.** When every ready slice
dispatches at once, order is invisible — they all start together. The moment two ready slices
declare an overlapping file, the guard serializes them into sub-waves, and something has to choose
which sub-wave runs first. Unstated, that choice is arbitrary, and an arbitrary choice can park the
slice ten others are waiting on behind a leaf slice that unblocks nothing.

**Why chain length is the first key.** A run's wall clock is set by its longest dependency chain, so
starting the slice at the head of that chain is the one scheduling choice that actually shortens the
run — every step of the chain has to happen in sequence no matter what else is going on, so any delay
at its head moves the finish line by the same amount. Some ordering rule has to exist here
regardless; making it the critical-path rule costs nothing and buys the only speed available at this
layer.

**This outranks the planner's fail-fast ordering, and that is a real trade.** `plan.md` line order is
not arbitrary: the planner deliberately puts high-risk work early so a bad assumption fails while it
is still cheap to change. Demoting that to the last tie-break gives some of that up, so it is worth
saying what is actually lost. Not much, as it happens — every ready slice in the wave runs before the
barrier releases, so a risky slice is never skipped, only started later, and it still fails inside
the same wave. What the depth key protects against is different in kind: an arbitrary first pick can
park the run's entire critical path behind a leaf slice, and that cost lands on every wave after it,
not just this one. Risk ordering keeps its effect at the tie-break, where it costs nothing.

**Determinism.** All three keys are read off durable state: the chain depths and the dependent counts
are both computed from the `Blocked by` column, the last tie-break from `plan.md` line order. No
clock, no randomness, no "whichever brief finished assembling first". The same plan and the same
`git` state produce the same dispatch order, so a resumed run dispatches identically to the first
attempt — which is what makes a run reproducible, and a failure inside it reproducible with it.

Speed at this layer comes from ordering and parallelism. It never comes from running fewer checks —
see *Changing what judges the work*.

## Design-ref gate at dispatch

A slice whose `Design ref` names a contract builds UI, and that contract is the thing Verify grades
the built UI's fidelity against. So the signature has to exist *before* the UI does. While assembling
each brief, open the `design-contract.md` the ref names and read its `status:`; a slice whose contract
is absent or `status: draft` is **halted right there**, and the halt reason names the unsigned contract
by path — the human needs to know which signature is missing, not merely which slice failed.

Catching this at Verify instead is too late by construction. Verify runs on a **built** interface, so
by the time a design gate could refuse, an agent has already built a surface against a contract no
human signed, and the rework is the entire slice. Halting at dispatch is what keeps a partially built
interface from ever reaching Review. `quality-verification` keeps its own refusal on an unsigned or
absent contract, but that is the second line of defence for a slice that reached Verify some other
way — it is not this gate, and it cannot substitute for it.

The gate is **per-slice**: an unsigned contract halts only the slices referencing it (their dependents
flip to `blocked` transitively, as with any halt), and every other slice in the wave dispatches
normally. A `Design ref` of `—` has nothing to check — the planner already recorded that this slice
builds no UI — so it passes the gate untouched and is carried into both briefs verbatim as `—`.

## Platform adaptivity

The wave model is substrate-agnostic; only the dispatch primitive changes:
- **Claude Code → the Workflow feature** (`pipeline`/`parallel` + `isolation: 'worktree'`).
- **Codex → parallel subagents** (each in its own worktree).
Pick the substrate at run start; the DAG, barrier, gates, and guard are identical either way.

## The three agent-internal gates (none human)

Per slice, AND-combined — SHIP requires all three plus the circuit-breaker floors:
1. **`quality-verification` / Verify** — behavioral acceptance tests + the design gate.
2. **Review fan-out (wave-scoped)** — `code-review` + `code-simplification` + `security-and-hardening` +
   `performance-optimization` as the **floor**, plus whatever the trigger table adds, each a fresh
   code-cold subagent on an independent axis (maker≠checker;
   personas DISSOLVE into skills — no role-play). Runs **once over the whole wave's combined diff**,
   not per slice; each finding is attributed to its owning slice by file. A slice passes this gate
   only when its own attributed findings are clear.
3. **Evaluator floors** — correctness≥8, testing_strategy≥7, plan_adherence≥8,
   regression_surface≥9.
`SHIP = qa_green ∧ review_clean ∧ floors_met ∧ preflight_green ∧ tests_green ∧ build_clean ∧
diff ≤400 LOC`. Circuit-breakers override any averaging: **security CRITICAL / secret-in-diff
= hard STOP**; regression_surface < 9 = fail; qa-loop exhaustion ⇒ `halted`.

## Silent-false-green defenses (the core danger — the agent grades its own work)

With no mid-run human gate, bounded retries pressure the agent to *flip the gate* (weaken a
test, reinterpret acceptance) rather than fix the code (Goodhart; AP1–AP2). Defeated by
mechanical invariants, not a human halt:
1. **Frozen artifacts under retry, and the reward-hack tripwire** — safety rail 4
   (`references/safety-rails.md`), covering `acceptance.md`, the RED tests, the declared
   `Regression surface`, and the read-only `docs/design.md`. What the run adds: each of these is also
   an instance of *Changing what judges the work* — a loosening, so it needs a measurement and a
   human, and mid-retry it has neither. That is why the halt is immediate rather than a request.
2. **Fail-closed ship + code-cold promotion** — a passing slice's terminal state is a
   **DRAFT PR**. Promotion to ready-to-merge is by a **fresh code-cold verifier with NO
   test-write access** (maker≠checker); a NEW checker each round sees only what the brief hands it —
   the human-anchored oracle (the signed `acceptance.md`) plus the running build — and never the
   implementer's reasoning, so the oracle never drifts.
3. **Integration gate** — the merged-union suite on a connected DAG component (above).
4. **Inverted risk report** — every SHIPPED slice carries the risk band `pull-request` computed for
   it, reproduced here **alongside the halts and highest band first**, to draw the human's scarce
   attention both to what the wave's diffs *touched* and to the quiet greens where unattended defects
   actually ship. **The rule that produces a band is `pull-request` Step 2, and it is not restated
   here** — read it there, including which diffs raise a band and how high. Only two facts about it
   belong at this layer: a band has **two** inputs, the diff's blast radius and the slice's own record,
   and it is the higher of them — so a slice can band HIGH on a spotless first-round record, and a run
   report that sorts by how cleanly slices passed is sorting by the wrong input.
   Carry the bands over; never recompute or assign one yourself. Two parties computing one number is
   how the number stops meaning anything, and this is the number a person triages the merge queue by.
   A HIGH band is **not** a stop condition and never halts a slice — nothing in a run pauses for
   high-risk work (*High-risk work is not one of these*, below), which is precisely why the
   band has to reach the human unchanged.

## Changing what judges the work

Changes to the checking apparatus are governed by their **direction**, not their size:

| Direction | What it looks like | Rule |
|---|---|---|
| **Tightening** | add a reviewer, add a guard, add a halt category | Proceeds. No measurement needed first. |
| **Loosening** | drop a reviewer, delete a guard, deactivate a scenario (remove it from the contract), weaken a check | **Refused** until a measurement supporting it exists *and* a human approves it. |

Propose a tightening freely — it costs nothing and you should make the case whenever you see one.
Deactivation is the mirror image, already covered by the Loosening row above: it needs both the
measurement and the human, and mid-run it has neither.

**Deactivating a scenario is not the same act as reporting one `not-reachable`, and only the first is
a loosening.** Deactivating removes the scenario from the contract: nothing has to prove it, now or
ever, and no one is told. Reporting `not-reachable` at Verify leaves the scenario where it was — in
`acceptance.md` — unproven, and escalates it to a human through the required PR ack line; the scenario
still has to be settled, just not by this slice. The test is whether the scenario survives the act.
Still in its contract with a human named → honest reporting; gone from its contract → a loosening,
gated as above. Verify's `not-reachable` path is the suite's mandated reporting channel and is never
refused, never a halt, and never needs a measurement.

**Evidence means a measurement, not an argument.** "This reviewer never finds anything" is an
argument. "Across the last 20 waves this axis produced zero findings that changed a diff" is a
measurement. A loosening proposal carrying only reasoning is refused exactly as one carrying nothing.

**The refusal must name which measurement is missing.** Refusing with "needs evidence" gives the
proposer nothing to act on, so it turns into an argument about whether the evidence is really
necessary. Refuse with the specific number that would settle it — *"refused: dropping the performance
axis needs that axis's finding rate over the last 20 waves, and that number does not exist"* — so the
next move is to go measure, not to argue harder.

**Ambiguous direction defaults to loosening.** Replacing three narrow checks with one broad one,
merging two reviewers, generalizing a guard: if you cannot tell which way it moves, it is a loosening
and it needs the measurement and the human.

**Scope: any change, at any time, to anything that judges the work.** Not only a slice's retry loop —
also a plan-time edit to a `Regression surface`, a change to which reviewers run, and an edit to these
skill files themselves. A gate weakened at plan time is weakened for every run after it, so the retry
loop is the *narrowest* place this rule has to hold, not the only one.

**Refusing is not waiting.** Mid-run there is no human to approve anything, so a loosening proposed
during a run is refused on the spot and its slice halts with the missing measurement in the halt
reason. The run does not stall, does not check in, and does not park the slice pending an answer —
every other branch keeps draining, exactly as with any other halt.

**Why the asymmetry, given that it is not fair.** A guard added wrongly costs time, and you find out:
something fails that should not have. A guard dropped wrongly costs the property the whole system
exists to provide, and it costs it **silently** — nothing fails, work simply stops being checked, and
the run looks faster. The cheapest way to run faster is always to check less, so an agent that can
drop its own reviewers can hit any speed target by judging itself less. Dropping checks is the
shortest path to "make the run faster", which is why the structure forbids it outright instead of
trusting the agent to weigh the trade carefully each time. Speed lives in *Dispatch order*, not here.

**What the router may still do alone.** A trigger row that does not fire adds no reviewer — that is
the router reading the diff, not a skip. A **gate** is never skipped: the four floor axes run on
every wave even when the diff looks trivial, because "provably nothing to review" is a claim about a
diff nobody has reviewed yet.

## The escalation ladder — what a run does before it gives up

A run's job is to finish the graph, not to report that it could not. Most slice failures are ordinary:
an import that points at the wrong path, a fixture missing a row, an API whose shape the survey read
slightly wrong. The agent that hit those can fix them, and a run that halts on the first red test hands
a person work it was standing right next to.

What makes a retry worth spending is that it **changes tactic**. Three attempts at one approach is one
attempt and two extra bills — the model does not get luckier on the third pass. So a failure climbs a
ladder, and **a rung is only spent when the approach actually changed**:

| Rung | The move | Spend it when |
|---|---|---|
| 1 | **Retry with the failure in context.** Hand the implementer the command that ran, its real output, and the diff that produced it — not "the tests failed". | Always first. The commonest cause of a red slice is an agent that never saw the error text. |
| 2 | **Root-cause it.** Stop editing and route the slice into `debugging-and-error-recovery`: reproduce it, form one hypothesis, prove it before anything changes. | Rung 1 came back with the same failure, or traded it for a different one. |
| 3 | **Change the route, not the destination.** The plan step named one way there; the failure says that way does not work here. Hold the step's `done_when` and the signed contract exactly as they are, and reach them differently. | The root cause is the approach itself — a library that does not do what the survey read it as doing, a seam that will not take the adapter. |
| 4 | **Shrink the slice.** Split what passes from what does not: finish and ship the passing part, then halt on the remainder, naming in the halt the contract it still owes and the failure that stopped it. Cutting that remainder into a row of its own is `plan-breakdown`'s write, not the run's. | Part of the slice is green, the rest is not, and the two do not have to ship together. |
| 5 | **Surface it.** The slice halts, its gate flips to you, and the run report carries every rung that was tried and why each one did not work. | The ladder is exhausted, or the next rung needs something only a person has — a credential, a product call, a decision the ADRs do not contain. |

**The no-progress guard promotes; it does not halt.** An identical failure signature or an identical
diff twice means *that rung* is finished, not that the slice is. Advance and spend the next rung's
budget. Halting on rung 1's second identical failure throws away four rungs of repair the run was
allowed to attempt, and hands a person a slice nobody has actually debugged yet.

**Rungs 3 and 4 change how, never what.** The signed `acceptance.md` is the oracle and it is frozen on
every rung. An approach that reaches a *different* outcome is not a repair, it is a loosening, and
*Changing what judges the work* governs it exactly as it governs one proposed any other way. Rung 4's
remainder still owes the **same** contract: a slice cut small enough that the scenarios it was failing no
longer apply to it is that same loosening wearing a planner's hat.

**Some failures skip the ladder entirely.** A Critical or High security finding, a secret in a diff, an
attempt to edit a frozen artifact, or a check about to be weakened is not a defect to repair — it is the
gate doing its job. Those land on rung 5 on contact, with no rungs spent, per *What stops a run* below.

**Climbing is per slice, and the wave does not wait for it.** A slice on rung 3 holds up nothing: the
barrier waits for TERMINAL states, and a slice still climbing has not reached one, so its own wave
completes when it does. Every independent branch keeps draining throughout — the ladder buys repair
attempts, never a pause.

## What stops a run

A run is one pass over the slice graph, Implement through Ship, and it has exactly two endings. **It
finishes** — every slice reached Ship, and the result is one or more open, draft pull requests, each
carrying a risk band, which stay open until a person merges them. Or **it stops** — one of the conditions
below fired. Both endings are terminal: in neither case does a run sit idle waiting for an answer.

That distinction is worth keeping apart, because two claims collapse into one easily. **A run never blocks
waiting for input** — there is no "should I continue?" checkpoint between slices, and nobody has to watch
it. **A run can still stop** — the conditions below end one early. A run that hits one does not wait for
you; it terminates and reports, and you pick it up when you next look.

These conditions end work rather than pausing it. Some end the whole run, some end only the affected slice
and let the rest of the graph keep draining. The middle column says which.

| Condition | Ends | What you see when it fires |
|---|---|---|
| **The run's preconditions are not met.** Checked once, at run start. The board has no feature with a slice graph, or the environment verdict is not green, or a signed `acceptance.md` or the `plan.md` slices are missing. | the run | The run refuses to start and nothing is built. Finish Spec and Plan, provision the environment, then start again. |
| **The slice graph has a cycle.** Two slices each wait on the other, directly or through a chain. | the run | No wave can be ordered, so nothing is dispatched. The cycle is reported and a person reorders the dependencies. |
| **The behavioral contract is missing or unsigned.** The same fact, checked one layer down. Verify will not grade a slice against an `acceptance.md` that is absent or still marked draft. Inside a run the row above has already refused, so this row governs Verify run on its own — and backstops any slice that reached Verify some other way. | the slice | The slice never enters Verify. The feature goes back to the Spec sign-off gate. No scenarios are invented to fill the gap. |
| **A UI slice's design contract is missing or unsigned.** A slice that names a design contract is checked before anything is built for it. | the slice | The slice halts before any code is written for it, and the halt names the unsigned contract by path. Nothing gets built against a contract nobody signed. |
| **A frozen artifact was about to be edited to make a gate pass.** The signed `acceptance.md`, a failing test written before the code that passes it, or a slice's declared regression surface — see *Silent-false-green defenses*. | the slice | A stop, not a pass. The slice halts and the attempted edit is reported. |
| **A check was about to be weakened.** Dropping a review pass, deleting a guard, switching off a scenario, or merging two checks into one — at any point, including in the plan. | the slice | Refused on the spot rather than parked for approval. The slice halts, and the refusal names the specific measurement that would settle the case — the number that does not exist yet. |
| **A security finding is Critical or High, or a secret appears in the diff.** | the slice | A hard stop: no retry, no pull request for that slice. The finding is reported as it stands. |
| **A secret is already committed.** A live credential is in the repository's history, not only in a diff waiting to be committed, so its blast radius is the whole repository rather than one slice. | the run | You are told as soon as it is found. The run freezes at the next barrier — it lets the slices already in flight end, then dispatches nothing more and opens no further pull requests. It does not wait for you. Rotating the credential is yours, and the report names where the secret was found. |
| **Two sources of truth disagree.** Two documents state the same thing differently and `using-agent-skills`'s *Source-of-truth order* does not settle which one governs. | the slice | The slice ends. What ended it names both files and the claim they disagree on, and its `gate` flips from the agent to you. Nothing is picked on your behalf, and nothing waits for your answer — the rest of the graph keeps draining and you settle it when you next look. |
| **The ladder ran out.** A real failure climbs the five rungs of *The escalation ladder* — the error in context, root-cause, a different route, a smaller slice — and exhausting them is what stops the slice. A slice reaches here having been repaired four different ways, not retried four times. | the slice | The slice stays at the stage that failed, its `gate` flips from the agent to you, and the failure surfaces with **what each rung tried and why it did not work** — enough to pick up without re-deriving it. |
| **Gates are failing at a rising rate across the run.** Not one slice going wrong, but the run as a whole drifting. | the run | The run terminates instead of grinding on. What already passed still stands; the rest is reported unfinished. |

### High-risk work is not one of these

Authentication and permissions, destructive migrations, payments, deletions, deploys, secrets. This work
carries more blast radius than the rest, and where it gets caught depends on how the slice is built.

- **One slice at a time, with a person present.** The single-slice Implement path stops before the risky
  step and asks for explicit sign-off. Somebody is there to answer.
- **Inside a run.** Nothing stops. There is nobody to sign off mid-run, and a run does not wait for one.
  The risk surfaces at the end instead: the slice's draft pull request carries a **risk band**, and auth,
  payments, data, secrets, and irreversible operations raise it. A person triages the merge queue by that
  band.

So inside a run, high-risk work is caught by a person at the merge gate, not by the agent mid-flight. To
have it caught before the code is written, build that slice on the single-slice path instead.

## Autonomy boundaries

- **No mid-run human halt.** The human owns Spec+Plan upstream; do not check in or summarize
  progress between waves (subagent-driven-development §Continuous execution). The only stops
  are the three termination predicates.
- **Never auto-merge to main** (safety rail 1). The autonomous span ends at the `pull-request`
  workhorse; the terminal state is an OPEN, gates-green, risk-banded PR on the cluster branch
  for **async human merge**. Auto-deploy is OUT of v1 (ci-cd/shipping deploy actions are
  fenced behind the human merge).
- **Failure → repair first, then DAG-aware partial completion** — never a whole-run halt. A failing
  slice climbs *The escalation ladder* before anything is surfaced; only a slice that spends it →
  `halted`, gate flips `agent → you`, dependents → `blocked` transitively, every other branch drains.
  The human gate survives on the **failure-escalation path only**, and it is the last rung rather than
  the first move.
- **Security** — localized CRITICAL/HIGH or secret-in-diff = hard halt of that slice, no
  retry, never a PR, tops the report; an exposed/committed secret (repo-wide blast radius)
  fires an immediate `PushNotification`, freezes the next barrier, opens no further PRs.
- **The human-anchored oracle is `acceptance.md` — nothing else.** A person signed it; the run
  invents it and edits it never. Any `not-reachable` classification during the run → a **required
  human-ack line in the PR body**, never silently absorbed. This classification is **not** a loosening
  and never halts a slice: the scenario stays where it was, unproven, with a human named to settle it.
  A slice that depends on an unbuilt sibling, or that cannot reach a given state, is *expected* to
  report one — that is the honest path, and refusing it would stall most early slices in any DAG.
  Removing a scenario from its contract is the loosening, and that stays gated (*Changing what judges
  the work*).

## Rationalizations

| You catch yourself thinking… | Reality |
|---|---|
| "The board reads `feature: plan`, not `building` — the plan can't be signed, so I refuse." | Nothing writes `building` but you (step 3). `plan-breakdown` leaves the feature at `plan` with rows at gate `you`, and a person starting the run *is* the sign-off. Refusing that board refuses every board the planner has ever produced. Check for slice rows, not for the token. |
| "I'll flip to `building` first thing so the board shows I've started." | Not before steps 1–2 read the DAG and find it acyclic and preflight reads green. `building` claims a wave is dispatching; a run that stops on a cycle would leave that claim standing with nothing behind it. |
| "The feature block is stale in other ways — while I'm in there I'll tidy the row titles." | Your permission on that block is `flip status`: one token, and the `State`/`Gate` cells. The block, its `origin:`, its titles, and its `Design ref` cells are `plan-breakdown`'s. |
| "The slice handed back its PR url — let it write its own `Artifacts` cell." | Same failure as the run record. The slice is in a worktree, on a branch that may never merge; the write succeeds and reaches nobody. You hold the pen for that column too. |
| "This slice touches auth — I'll bump its band before I report it." | The band is `pull-request`'s, computed at its Step 2 from blast radius and the slice's record. Reproduce it; do not recompute it. Two parties computing one number is how the number stops meaning anything. |
| "This wave has one ready slice — I'll just run it inline." | A wave of one still gets a worktree, the three gates, and the TERMINAL barrier. Run the loop. |
| "The test is flaky; I'll relax that assertion so the gate passes." | That is gate-erosion — a loosening, so it needs a measurement and a human. Frozen artifacts → HALT. Fix the code or escalate. |
| "I'll dispatch a senior-reviewer persona to gut-check this." | No role-play. Dispatch the real `code-review`/`code-simplification`/`security-and-hardening`/`performance-optimization` skills as fresh code-cold subagents. |
| "I'll review each slice on its own — that's more thorough." | Review is wave-scoped: one fan-out over the union, findings attributed by file. Per-slice review was the token sink this change removed. |
| "The review flagged slice C — I'll re-review the whole wave to be safe." | Re-review only the changed slice. Disjoint files mean C's fix can't affect A's or B's already-clean review. |
| "Both ready slices touch `utils.ts`, but it's a tiny edit — parallel is faster." | Disjoint-file guard: overlap → serialize. Never two writers on one file. |
| "The design contract is still `draft` — dispatch now, it'll be signed by the time Verify runs." | Verify grades a **built** interface. Dispatching means an unsigned contract gets built against, and a partially built UI reaches review. Halt the slice at dispatch; name the contract. |
| "The contract is missing, but Verify refuses on that anyway — let it catch it." | That refusal fires *after* the UI exists. The dispatch gate is what prevents the build; Verify's refusal is the backstop for a slice that got past it. |
| "qa failed twice; `acceptance.md` must be wrong — I'll reinterpret it." | `acceptance.md` is a human-anchored oracle, and reinterpreting it is a loosening. Never edit mid-run. Not-reachable → human-ack line + escalate. |
| "Verify reported a scenario `not-reachable` — deactivating a scenario is a loosening, so I have to halt this slice." | No. The scenario is still in `acceptance.md` and a human has been handed it via the PR ack line, so nothing stopped being checked and there is nothing to refuse. Deactivation — removing it from the contract — is the loosening. Record the id, add the ack line, carry on. Halting here would stall nearly every early slice in a DAG, since depending on an unbuilt sibling is the normal case. |
| "Two sub-waves are ready — I'll start whichever brief finished assembling first." | Dispatch order is deepest downstream chain first, then dependent count, then `plan.md` order. An arbitrary pick can park the critical path behind a leaf slice. |
| "This slice unblocks five others and that one unblocks four — five wins." | Only if the chains are the same depth. Count is the *second* key. Five leaf dependents is a one-step chain; four dependents in a row is a four-step chain, and the four-step chain is what the wall clock is waiting on. |
| "This axis has never found anything on this repo — I'll cut it from the fan-out." | Dropping a reviewer is a loosening: measurement plus a human. Name the number you don't have (that axis's finding rate over the last N waves) and go get it. |
| "The run is too slow — I'll trim the fan-out to two axes." | Fewer checks is not where speed comes from; it is where silent gaps come from. Speed is dispatch order and parallelism. The four axes are a floor. |
| "Replacing these three narrow checks with one broad one is a simplification, not a weakening." | Ambiguous direction defaults to loosening. Measurement plus a human, or it does not ship. |
| "This diff only touches the CI workflow — the review fan-out is overkill." | A pipeline edit changes what judges every later run, and removing a step there is a loosening. It also fires a trigger row: `ci-cd` joins the fan-out. |
| "I'll write the run record at the barrier — one write per slice is cheaper than two." | Then a slice that dies between dispatch and barrier leaves no trace at all, and reads exactly like a slice that was never dispatched. The stub costs one line and is the only thing that survives a run ending mid-wave. |
| "The slice runs in its own worktree, so let it append its own entry there." | A worktree is a branch that may never be merged. The write succeeds, reports success, and reaches no reader on the main line. You hold the pen; the entry lands in your checkout. |
| "This slice failed the same way twice — I'll update the first entry rather than add a near-identical second." | Both failures are the record; that it failed twice the same way is the finding. Editing an existing entry is a **STOP**: the work ends there and the violation is reported by name, not quietly refused. |
| "I'll put the slice's state in its entry so the record reads on its own." | `STATE.md` is the board and this is the evidence. Two files answering "who acts next" disagree the moment one is updated and the other is not. |
| "Verify ran its own commands — it should get its own entry." | One slice, one entry per dispatch. Verify hands back its commands and output; they go into the fields under that slice's heading. A second entry lets a reader count one slice twice. |
| "The output has a token in it — I'll just drop those lines." | Withhold the value and say you withheld it. A silently dropped line reads as output that never existed, which is the thing the record exists to make impossible. |
| "Nothing was skipped on this slice, so I'll leave the 'Not run' line off." | The line is never omitted. "Nothing was skipped" is an answer; a missing line is indistinguishable from an author who did not want to say. |
| "I should check in before the next wave." | No mid-run halt. The human gets the open PRs at the end. |
| "This PR is green — I'll merge it to save the human a click." | Never auto-merge to main. Terminal state is an OPEN PR. |
| "I'll promote my own DRAFT PR to ready — I wrote it, I know it's good." | Promotion needs a fresh code-cold verifier with no test-write access (maker≠checker). |

## Red flags — STOP

- About to weaken/edit `acceptance.md`, a RED test, or `Regression surface` during a retry → HALT (safety rail 4; also a loosening, and a retry loop has neither the measurement nor the human).
- About to edit `docs/design.md` so a built surface matches it → HALT (same gate-erosion, safety rail 4). It carries no `status:` of its own, so this is the one way to clear a design gate that nothing else catches.
- About to drop a reviewer, delete a guard, deactivate a scenario (remove it from its contract), or weaken any check — at any time, including at plan time or by editing these skill files → STOP. Refuse, and name the measurement that is missing.
  - **Not this:** Verify classifying a scenario `not-reachable`. That leaves the scenario where it was, in `acceptance.md`, and escalates it to a human via the required PR ack line, so nothing stopped being checked. It is the reporting path this suite mandates — record it, add the ack line, keep going. Never a halt, never a refusal, no measurement needed.
- Treating a merge of several checks into one as a simplification → STOP (ambiguous direction defaults to loosening).
- Picking which sub-wave dispatches first by feel → STOP (deepest downstream chain, then dependent count, then `plan.md` order).
- Ordering sub-waves by how many slices a slice unblocks, without checking how deep the chain is → STOP (that is the second key standing in for the first; a fan of leaves outranks a long chain under it, which is backwards).
- Failure signature moved but impl materially unchanged → reward-hack → HALT.
- Two write subagents own the same file in one wave → STOP, serialize.
- About to dispatch a slice whose `Design ref` names a contract that is absent or `status: draft` → STOP, halt that slice at dispatch with the contract path in the reason. Leaving it for Verify means the interface gets built first.
- Running the Review fan-out per slice instead of once over the wave union → STOP (that's the token sink; review is wave-scoped, findings attributed by file).
- Re-reviewing the whole wave after a single slice's fix → STOP (re-review only the changed slice; disjoint files bound the blast radius).
- Advancing the barrier on `success` instead of TERMINAL → STOP.
- About to promote a DRAFT PR from the same context that wrote the tests → STOP (need a code-cold verifier).
- Security CRITICAL/HIGH or secret-in-diff → hard halt that slice, no retry, never a PR; committed secret → PushNotification + freeze barrier.
- Refusing to start on a feature that reads `feature: plan` and **carries slice rows** → STOP. That is
  the board `plan-breakdown` hands over; the `plan → building` flip is step 3 and it is yours. Refuse on
  a missing feature, missing rows, `feature: spec`, or a red/amber preflight — never on the token alone.
- Writing anything in a feature block beyond its `feature:` token, or in a slice row beyond its `State`
  and `Gate` → STOP. That permission is `flip status`; the rest of the block is `plan-breakdown`'s.
- Completing a slice at the barrier without carrying its handed-back `Artifacts` entry (`qa.md`,
  `PR #<n>`) into the row → STOP. It cannot land itself from a worktree, and nothing re-reports a
  dropped one — same failure as a dropped lesson.
- Computing, adjusting, or assigning a risk band yourself → STOP. `pull-request` Step 2 computes it;
  you carry it. Equally: treating a HIGH band as a reason to halt, hold, or hide a slice → STOP, a run
  never pauses for high-risk work.
- Re-dispatching a slice `STATE.md` marks `done` → STOP (read the board, `docs/progress.md`, and `git log`
  after any compaction).
- Appending to `docs/progress.md` from inside a slice's worktree → STOP. That write lands on a branch that
  may never merge and reaches no reader, while reporting success.
- Dispatching a slice without first appending its stub → STOP. A slice that then dies is indistinguishable
  from one that was never dispatched.
- Editing, re-wording, re-dating, re-ordering, or removing an entry already in `docs/progress.md` → STOP,
  and report the violation naming the entry and what would have changed.
- Closing the barrier on a slice that handed back a lessons entry without carrying it into
  `docs/lessons.md` → STOP. Nothing downstream re-reports a dropped one, so the lesson is simply lost.
- Re-wording, re-dating, re-ordering, or removing an entry already in `docs/lessons.md`, or writing one
  yourself rather than carrying back what a slice handed you → STOP, and report the violation. You are
  that record's courier; its authors are whoever root-caused the defect or closed the review finding.
- Writing a stage, state, gate, or owner into an entry → STOP. The board answers that question; the record
  answers what was executed.
- Recording that a check passed with neither its output nor a "Not run" line behind it → STOP. There is no
  third state, and a bare assertion of success is the one this file exists to make visible.
- Pasting prior-wave summaries / session history into a slice dispatch → STOP (hand the brief + frozen-contract paths as files). The `Critical:` findings that routed a slice back are **not** session history and are not covered by this: they are a named field of the re-review brief below, and a re-review that arrives without them reports a broken dispatch. Withholding them is the failure this rule is aimed at, not an instance of it.

## Verification (ending criteria)

The run terminates on **exactly one** predicate:
- **DONE:** DAG complete ∧ every slice passed `quality-verification` ∧ its attributed findings from the
  wave-aggregate Review fan-out are clear ∧ evaluator floors met → all PRs OPEN and risk-banded.
- **BLOCKED:** no agent-actionable slice remains (every not-done slice is `blocked`/`halted`).
- **DIVERGENCE / security STOP:** rising internal-gate failure rate, or a security trigger.

Runaway guard: **no-progress N=2** — an identical failure signature or an identical diff twice ends
*that rung* of *The escalation ladder* and promotes the slice to the next one. It halts the slice only
once the ladder is spent, because the same output twice is evidence that the tactic is wrong, not that
the slice is unfixable. Per shipped slice, the done-predicate is the full SHIP conjunction above,
AND the slice sits as an OPEN risk-banded PR (a DRAFT promoted by a code-cold verifier).

Also true of every terminated run: **nothing that judges the work got looser during it.** Every wave
ran all four floor axes plus every reviewer its trigger rows fired; no reviewer, guard, scenario, or
check was dropped or weakened; any loosening that was proposed was refused with the missing
measurement named. A scenario Verify reported `not-reachable` was **not** dropped — it is still in
`acceptance.md` and its ack line is in the PR, which is what
"not dropped" means here. And **the dispatch order is reproducible**: replaying the run against the same
plan and the same `git` state would start the same slice first.

Also true of every terminated run: **every slice the run touched has an entry in `docs/progress.md`, and
every entry was written outside the worktrees.** Each entry either carries the real output of the commands
it names or says under "Not run" that a check was not performed and why — there is no entry asserting a
pass with nothing behind it. A slice dispatched twice has two entries. No entry carries a stage, a state,
or an owner, so the record cannot be read as a second board. Check the last of these the direct way: a
`git log` over `docs/progress.md` shows commits on the run's branch and none on any slice branch. **Every
lesson a slice handed back is in `docs/lessons.md`**, carried over in that same checkout — none was left
behind in the worktree it was written in, and none was reworded on the way.

Also true of every terminated run: **the board records the run itself.** The feature read
`feature: building` from step 3 onward, and every artifact a slice handed back — its `qa.md`, its
`PR #<n>` — sits in that slice's `Artifacts` cell, appended in the checkout this skill holds. A board
still reading `feature: plan` describes a run that never started; a `done` slice with an empty
`Artifacts` cell lost something on the way back from a worktree, and nothing else will report it.

Also true of every terminated run: **no slice entered `impl` without passing the design-ref gate** —
its `Design ref` was `—`, or the contract that ref names read `status: signed` at the moment the
implementer was dispatched. Any slice failing that check is `halted` with the contract named, and
carries no diff, no worktree changes, and no PR.

## Outputs & handoff contract

- **Emits → `STATE.md` state transitions** (registry artifact). Stable surface the next reader
  depends on: the **feature block's `feature:` token** (flipped `plan → building` at step 3, the write
  that says this run started), the **slice table** (per-slice `State` column moving
  `impl→verify→review→ship→done|blocked|halted`) and the **`gate` column** (`you|agent|done`, moved off
  the `you` the rows are born at in that same step-3 write). Every transition is
  written as it happens — `STATE.md` is the resume spine; a fresh agent resumes the run cold
  from it. Every write named in this bullet is `flip status`: a token changes, and the block, its
  `origin:` line, and its rows stay as `plan-breakdown` left them. Change the table's shape → update
  every reader in the same commit.
- **Appends → the `Artifacts` column** of each slice row, as the artifacts land. Two entries there name
  their own writer — the security-findings entry (`security-and-hardening`) and the release-runbook
  entry (`shipping-and-launch`). **Every other entry in that column is yours**, and a slice cannot land
  its own for the same reason it cannot land its run-record entry: it is inside a worktree, on a branch
  that may never merge, so the write succeeds and reaches no reader. The Verify ledger a slice hands
  back, the `PR #<n>` its `pull-request` dispatch hands back, and any decision-record id it recorded all
  reach the board through you — in the checkout you hold, at the moment you complete that slice's
  run-record entry, which is the same courier run and needs no second pass. Append only: never reword or
  remove an entry already in a cell, and never author one no slice handed you.
- **Dispatch briefs** — each slice's brief carries the slice id; its frozen contract paths;
  `docs/design.md` when the repo has one and the slice builds UI, for a reason of reach rather than
  because it is frozen — an axis the contract marks `inherits: docs/design.md` is
  graded against that file, and a verifier that may not read outside its brief cannot grade what it was
  never handed; on a **re-review round**, the `Critical:` findings from the round that routed this slice
  back — a code-cold reviewer reading a diff whose Critical was fixed sees no sign one ever existed, so
  without them the round cannot tell a repaired slice from one that was never broken, and the
  `docs/lessons.md` entry that Critical is owed goes unwritten; and the slice row's **`Design ref`**
  verbatim, to **both** the implementer and the
  code-cold verifier. `—`
  is emitted as `—`, never dropped; a dropped `—` reads as "unknown" and puts the UI judgement back
  in the verifier's hands. A brief is only ever assembled for a slice that **passed the design-ref
  gate**, so every path a brief carries points at a contract that read `status: signed` at dispatch;
  a slice halted by the gate produces no brief at all, and its STATE row carries the halt reason with
  the unsigned contract's path.
- **Appends to `docs/progress.md`** — the run record. One entry per slice per dispatch: a stub carrying
  the slice id the moment the slice enters the wave, completed at the TERMINAL barrier with the commands
  that were run, their real output, the files changed, and what was not run and why. Appended in the
  checkout this skill holds, never inside a slice's worktree — a worktree is a branch that may never
  merge, so a write there reaches nobody while reporting success. Append only: an entry already written
  is never edited, and an attempt to change one is a **STOP**, reported by name. It carries no stage, state,
  gate, or owner; `STATE.md` above is where a resuming controller reads what is `done`.
- **Appends to `docs/lessons.md`** — the lessons slices handed back, one entry each, at the **TERMINAL barrier** and in the checkout this skill holds, for the same reason the run record lands there. Append only: each entry arrives finished from whoever root-caused the defect or closed the Critical review finding, and this skill carries it rather than authoring it. Where the repository keeps no such file there is nothing to carry, and the slice says so.
- **Inverted risk report** appended at run terminal, alongside the halts — each shipped slice's band
  exactly as `pull-request` computed it (that skill's Step 2 owns the rule), ordered highest band first
  so the merge queue reads in triage order. This skill reproduces bands; it does not compute them.
- **What could not be settled**, in the same report and read first, because it is the only part that
  asks anything of the reader. One entry per halted slice, and each says four things: the slice and the
  stage it stopped at, **the rung of *The escalation ladder* it reached**, what each rung tried and what
  came back, and the one thing a person has that the run did not — a credential, a product call, a
  decision the ADRs do not contain. Slices `blocked` behind a halt are listed under the halt that
  blocked them rather than as entries of their own: there is one thing to settle, not five. A run that
  halted nothing says so in a line, which is the report a person should be able to skim in a second.
- **Terminal hand-off:** risk-banded OPEN PRs on cluster branches for async human merge — the
  surviving downstream gate. No `session-state.md` 5-field handoff needed unless context fills
  mid-run (then `handoff` compacts; the artifacts let a fresh agent resume cold).
