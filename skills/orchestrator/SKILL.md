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
at `feature: building` with slice rows whose `Blocked by` column forms a DAG — and you want
the build run autonomously to open PRs. This is the default executor; sequential execution
is just the degenerate case (a wave of one).

**Skip when:** you are still in Spec or Plan (the human owns those — there are no slice rows
yet, the feature sits at `spec`/`plan`); you are doing a single one-off edit with no DAG; or
`preflight-readiness` is red/amber (fix the environment first — the wave must not start).

**Escape hatch (`depth: lite`):** a single ready slice with no siblings still runs the full
Implement → Verify → (aggregate) Review loop and the barriers — do not "just do it inline." For a
wave of one the aggregate review is simply that one slice's diff, so it costs the same as the old
per-slice review; the barriers, the worktree, and the three gates are the point even here.

## Inputs

Refuse to run (CRISPY refuse-to-run) unless ALL are present:

- **`STATE.md`** (repo root, created by `project-setup`) — the two-level board. The `Blocked by`
  column IS the slice DAG. There must be a feature at `feature: building` with at least one
  slice row in `impl`. Absent / no building feature → refuse.
- **`preflight-readiness` verdict = GREEN** — every `environment.md` row provisioned. Red or
  un-attested amber → refuse to start the wave.
- **`plan.md` + slices** (`docs/features/<slug>/`) — each slice's concrete steps, exact
  tests, declared `Regression surface`, `Design ref`, and `Files (owned)` ownership. Missing
  file-ownership on a slice that shares a wave → refuse (the disjoint-file guard cannot run blind).
- **`acceptance.md` (status: signed)** — the frozen behavioral oracle. The orchestrator
  FREEZES `acceptance.md` + the RED tests + each slice's `Regression surface` for that
  slice's retry loop; it never edits them. Editing any of the three is a **loosening**: one rule,
  *Changing what judges the work*, governs this and every other prohibition below.

Not a refuse-to-run input, but frozen harder than any of them: **`docs/test-contract.md`**, when the
repo has one. Every **ACTIVE** row under its `## Rows` heading binds every feature and every run
**permanently** — activation is one-way and only a person performs it, so there is no retry loop and no
between-runs Spec change that thaws it. The orchestrator hands the file's path to implementers and
verifiers, reads it, and never edits it in either direction. An absent file, or one with no ACTIVE rows,
is the normal case and changes nothing.

One more input is required per slice rather than per run, so it gates a slice instead of the run:
**the design contract each slice's `Design ref` names, at `status: signed`**, for every slice whose
`Design ref` is not `—`. It is read at dispatch, before that slice's implementer runs; absent or
`status: draft` halts **that slice**, with the halt reason naming the contract by path, while the rest
of the wave dispatches normally. Fully specified in *Design-ref gate at dispatch* below.

Bulk artifacts move as **files**, never pasted into a dispatch prompt (subagent-driven-
development §File Handoffs): a slice dispatch carries the slice brief path + its frozen
contract paths, not the session history.

## Process

1. **Resume cold.** Read `STATE.md` and the progress ledger first. Any slice marked
   `done`/`ship` is DONE — never re-dispatch it (subagent-driven-development §Durable
   Progress: re-dispatching completed work is the single most expensive failure). Trust the
   ledger + `git log` over recollection after compaction.
2. **Build the DAG.** Parse every slice's `Blocked by` into edges; topologically sort into
   **waves** (each wave = one topological level). Verify no cycles — a cycle blocks the run;
   surface it and stop (the human must reorder dependencies).
3. **Select the ready wave, then order it.** A slice is ready when every blocker is `done`. Apply
   the **disjoint-file guard** (below) to the ready set, then put what survives into the order
   *Dispatch order* (below) defines — deepest downstream chain first, transitive dependent count as
   the second key, `plan.md` order last. Selection decides *which* slices run; the order decides *which one starts first*,
   and that is what sets the run's wall clock the moment the guard splits the wave into sub-waves.
4. **Provision isolation, then run the design-ref gate.** Each ready slice gets its own clean
   worktree (the `worktree` mechanism this skill owns). Platform-adaptive (below). While assembling
   the brief, read the slice row's **`Design ref`** — it travels with the slice from here on. If it
   is not `—`, open the `design-contract.md` it names and read `status:` **before dispatching
   anything for that slice** (see *Design-ref gate at dispatch*). Absent or `status: draft` → that
   slice is **`halted` here**, its halt reason naming the unsigned contract by path; no implementer
   runs, so no partially built interface exists to reach Verify or Review.
5. **Run Implement + Verify per slice** for every ready slice — in parallel (one dispatch call
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
6. **Verify barrier.** Wait for every ready slice to reach `verify` green **or** a terminal state
   (a slice that halts at Verify never enters the review). This barrier is what lets the next step
   review the wave as one changeset instead of N.
7. **Aggregate Review over the whole wave.** Run the four floor axes (`code-review` +
   `code-simplification` + `security-and-hardening` + `performance-optimization`) — plus any reviewer
   the trigger table below adds — as fresh code-cold
   subagents (one axis each, in parallel), **once over the union of the verify-green slices' diffs**
   — **4+k subagents per wave, not 4 × N**, where k is however many reviewers the trigger table added
   (usually zero). The win is in the *per-wave* denominator, not in the roster: never budget off the
   literal 4 and drop a triggered reviewer to hit it — that is a loosening. Attribute every finding to its
   **owning slice by file**: the disjoint-file guard guarantees each file belongs to exactly one
   slice, so attribution is unambiguous. A finding routes *only its owning slice* back to
   `incremental-implementation` (bounded retries); after that slice re-passes Verify, **re-review
   only its diff**, never the whole wave again.
8. **Evaluator floors + DRAFT PR per slice** — still per-slice (each slice owns its plan steps and
   regression surface). A slice whose attributed review findings are clear and whose floors are met
   opens its own DRAFT PR. Bounded retries: **2 per gate, 3 implement→verify→review cycles per
   slice**.
9. **TERMINAL barrier.** Wait for EVERY slice in the wave to reach a **TERMINAL** state
   (`done | halted | blocked`) — **never `success`**. Write every transition + gate flip to
   `STATE.md` as it happens. Then advance to the next wave.
10. **Integration gate.** After a connected DAG component's slices are all green, run the
    merged-union suite once in an integration worktree before presenting. Union-fail →
    the component's PRs go DRAFT + a blocker is recorded.
11. **Terminate** on exactly one predicate (see Verification). Append the inverted risk
    report; leave risk-banded OPEN PRs for the human.

## Wave executor & the TERMINAL barrier

The DAG → topological-wave structure is the whole point: independent branches drain in
parallel, dependent branches serialize, and the barrier between waves is what makes the run
resumable from `STATE.md` alone. The barrier waits for **TERMINAL, not SUCCESS**
(parallelism.md mech-f): a `halted` or `blocked` slice still satisfies the barrier — the run
does not stall waiting for a slice that will never pass. Its dependents transitively flip to
`blocked`; every *other* independent branch keeps draining.

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
no such journal exists yet. Until a run journal records, wave by wave, which axis produced findings
that changed a diff, dropping an axis is a loosening with no measurement behind it and is refused on
exactly those grounds (*Changing what judges the work*). The deferral ends when that journal holds
enough waves to compute the rate — not when the fan-out starts to feel expensive.

## Disjoint-file guard

Same-wave slices parallelize **only if their declared file ownership is disjoint** — never
two write subagents on one file (dispatching-parallel-agents §Shared state;
parallelism.md mech-e). On overlap: **serialize** them into sub-waves (or merge them into one
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
1. **Frozen artifacts under retry** — `acceptance.md` + the RED tests + the declared
   `Regression surface` are immutable during a slice's retry loop. A retry diff that weakens
   an assertion or narrows the surface = gate-erosion **HALT**. (An instance of *Changing what judges
   the work*: a loosening, so it needs a measurement and a human — and mid-retry it has neither.)
   These three thaw *between* runs, by a Spec change a person signs.

   **ACTIVE test-contract rows, frozen permanently** — an **ACTIVE** row in `docs/test-contract.md`
   never thaws: it binds every run, forever, because activation is one-way and only a person performs
   it. Skipping, deleting, weakening, or narrowing one is the same HALT at any moment, retry or not,
   and the halt **names the row id** (`TC-1`) — "gate erosion" alone leaves the person reading it
   unable to tell which guarantee was about to be traded away. Setting a row's state, in either
   direction, is the same stop.

   **The decided look, read-only rather than frozen** — `docs/design.md` is not a fifth frozen artifact;
   it is a file every run reads and only `frontend-design` writes. Verify grades each contract axis
   marked `inherits: docs/design.md` against it, and it carries no `status:` of its own, so nothing else
   catches an edit. Moving the decided look so a built surface matches it is the same **HALT**, retry or
   not.
2. **Reward-hack tripwire** — failure signature moved only because a test/acceptance was
   edited while impl is materially unchanged → **HALT**. (Same rule: the edit loosened the check, so
   the burden was evidence plus a human, not a passing run.)
3. **Fail-closed ship + code-cold promotion** — a passing slice's terminal state is a
   **DRAFT PR**. Promotion to ready-to-merge is by a **fresh code-cold verifier with NO
   test-write access** (maker≠checker); a NEW checker each round sees only what the brief hands it —
   the human-anchored oracles (`acceptance.md`, and the ACTIVE rows of `docs/test-contract.md` when the
   repo has one) plus the running build — and never the implementer's reasoning, so the oracles never
   drift.
4. **Integration gate** — the merged-union suite on a connected DAG component (above).
5. **Inverted risk report** — every SHIPPED slice carries a risk band (which floors landed
   at the line, qa coverage %, rounds consumed, any test/acceptance touched, surface
   narrowing), surfaced ALONGSIDE the halts — to draw the human's scarce attention to the
   quiet greens where unattended defects actually ship.

## Changing what judges the work

Changes to the checking apparatus are governed by their **direction**, not their size:

| Direction | What it looks like | Rule |
|---|---|---|
| **Tightening** | add a reviewer, add a guard, **propose** activating a test-contract scenario, add a halt category | Proceeds. No measurement needed first. A few tightenings still need a *person* to perform them — see directly below. |
| **Loosening** | drop a reviewer, delete a guard, deactivate a scenario (remove it from the contract, or flip an ACTIVE row back to `PENDING`), weaken a check | **Refused** until a measurement supporting it exists *and* a human approves it. |

**"No measurement needed" is not "no person needed" — those are two different gates.** Tightening
lifts the evidence requirement. It does not lift the human one, and the table would be misread as
licence if you collapsed them. Activation is the case where they come apart:

- **Proposing** that a scenario become permanent is the tightening. Write the row into
  `docs/test-contract.md` as `PENDING`, say why it should hold forever, and move on. No measurement,
  no approval, no halt — proposals are free and you should make them freely.
- **Performing** the activation — moving a row to `ACTIVE` — is a person's act, and it is one-way.
  The agent never does it. An ACTIVE row binds every run after it, permanently, and an agent that
  could flip one would be deciding alone what every future run owes.

So: propose freely, never set the state yourself. Neither half licenses the other — "it's a
tightening" does not make it yours to perform, and "only a person activates" does not make proposing
one something to hold back on. Deactivation is the mirror image and is already covered by the
Loosening row above: it needs both the measurement and the human, and mid-run it has neither.

**Deactivating a scenario is not the same act as reporting one `not-reachable`, and only the first is
a loosening.** Deactivating removes the scenario from the contract: nothing has to prove it, now or
ever, and no one is told. Reporting `not-reachable` at Verify leaves the scenario where it was —
in `acceptance.md`, or as an ACTIVE row in `docs/test-contract.md` — unproven, and escalates it to a
human through the required PR ack line; the scenario still has to be settled, just not by this slice.
The test is whether the scenario survives the act. Still in its contract with a human named → honest
reporting; gone from its contract, or an ACTIVE row flipped back to `PENDING` → a loosening, gated as
above. Verify's `not-reachable` path is the suite's mandated reporting channel and is never refused,
never a halt, and never needs a measurement — and that holds for a contract row exactly as it holds
for an `acceptance.md` scenario.

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

## Autonomy boundaries

- **No mid-run human halt.** The human owns Spec+Plan upstream; do not check in or summarize
  progress between waves (subagent-driven-development §Continuous execution). The only stops
  are the three termination predicates.
- **Never auto-merge to main** (branch-naming.md). The autonomous span ends at the `pull-request`
  workhorse; the terminal state is an OPEN, gates-green, risk-banded PR on the cluster branch
  for **async human merge**. Auto-deploy is OUT of v1 (ci-cd/shipping deploy actions are
  fenced behind the human merge).
- **Failure → DAG-aware partial completion**, never a whole-run halt. A slice exhausting its
  retries → `halted`, gate flips `agent → you`, dependents → `blocked` transitively, every
  other branch drains. The human gate survives on the **failure-escalation path only**.
- **Security** — localized CRITICAL/HIGH or secret-in-diff = hard halt of that slice, no
  retry, never a PR, tops the report; an exposed/committed secret (repo-wide blast radius)
  fires an immediate `PushNotification`, freezes the next barrier, opens no further PRs.
- **The human-anchored oracles are `acceptance.md` and the repo's ACTIVE `docs/test-contract.md`
  rows — nothing else.** A person signed the first and a person activated the second; the run
  invents neither and edits neither. Any `not-reachable` classification during the run, against
  either of them → a **required human-ack line in the PR body**, never silently absorbed. This
  classification is **not** a loosening and never halts a slice: the scenario stays where it was,
  unproven, with a human named to settle it. A slice that depends on an unbuilt sibling, or that
  cannot reach a given state, is *expected* to report one — that is the honest path, and refusing it
  would stall most early slices in any DAG. Removing a scenario from its contract, or flipping an
  ACTIVE row back to `PENDING`, is the loosening, and that stays gated (*Changing what judges the
  work*).

## Rationalizations

| You catch yourself thinking… | Reality |
|---|---|
| "This wave has one ready slice — I'll just run it inline." | A wave of one still gets a worktree, the three gates, and the TERMINAL barrier. Run the loop. |
| "The test is flaky; I'll relax that assertion so the gate passes." | That is gate-erosion — a loosening, so it needs a measurement and a human. Frozen artifacts → HALT. Fix the code or escalate. |
| "I'll dispatch a senior-reviewer persona to gut-check this." | No role-play. Dispatch the real `code-review`/`code-simplification`/`security-and-hardening`/`performance-optimization` skills as fresh code-cold subagents. |
| "I'll review each slice on its own — that's more thorough." | Review is wave-scoped: one fan-out over the union, findings attributed by file. Per-slice review was the token sink this change removed. |
| "The review flagged slice C — I'll re-review the whole wave to be safe." | Re-review only the changed slice. Disjoint files mean C's fix can't affect A's or B's already-clean review. |
| "Both ready slices touch `utils.ts`, but it's a tiny edit — parallel is faster." | Disjoint-file guard: overlap → serialize. Never two writers on one file. |
| "The design contract is still `draft` — dispatch now, it'll be signed by the time Verify runs." | Verify grades a **built** interface. Dispatching means an unsigned contract gets built against, and a partially built UI reaches review. Halt the slice at dispatch; name the contract. |
| "The contract is missing, but Verify refuses on that anyway — let it catch it." | That refusal fires *after* the UI exists. The dispatch gate is what prevents the build; Verify's refusal is the backstop for a slice that got past it. |
| "qa failed twice; `acceptance.md` must be wrong — I'll reinterpret it." | `acceptance.md` is a human-anchored oracle, and reinterpreting it is a loosening. Never edit mid-run. Not-reachable → human-ack line + escalate. |
| "Verify reported a scenario `not-reachable` — deactivating a scenario is a loosening, so I have to halt this slice." | No. The scenario is still in its contract — `acceptance.md`, or an ACTIVE `docs/test-contract.md` row — and a human has been handed it via the PR ack line, so nothing stopped being checked and there is nothing to refuse. Deactivation (removing it, or flipping an ACTIVE row back to `PENDING`) is the loosening. Record the id, add the ack line, carry on. Halting here would stall nearly every early slice in a DAG, since depending on an unbuilt sibling is the normal case. |
| "This scenario obviously has to hold forever — I'll set the row to `ACTIVE` in `docs/test-contract.md`." | Proposing it is a tightening and costs nothing: write the row as `PENDING` with your reasoning. Performing the activation is a person's act and one-way — an agent that can flip a row decides alone what binds every run after it. Propose, never flip. |
| "This ACTIVE contract row predates the feature and no longer fits — I'll narrow it to this slice." | Gate-erosion HALT, and this freeze never thaws: an ACTIVE row binds every run. A row that is genuinely wrong is fixed by a person outside the run. Halt with the row id named. |
| "Two sub-waves are ready — I'll start whichever brief finished assembling first." | Dispatch order is deepest downstream chain first, then dependent count, then `plan.md` order. An arbitrary pick can park the critical path behind a leaf slice. |
| "This slice unblocks five others and that one unblocks four — five wins." | Only if the chains are the same depth. Count is the *second* key. Five leaf dependents is a one-step chain; four dependents in a row is a four-step chain, and the four-step chain is what the wall clock is waiting on. |
| "This axis has never found anything on this repo — I'll cut it from the fan-out." | Dropping a reviewer is a loosening: measurement plus a human. Name the number you don't have (that axis's finding rate over the last N waves) and go get it. |
| "The run is too slow — I'll trim the fan-out to two axes." | Fewer checks is not where speed comes from; it is where silent gaps come from. Speed is dispatch order and parallelism. The four axes are a floor. |
| "Replacing these three narrow checks with one broad one is a simplification, not a weakening." | Ambiguous direction defaults to loosening. Measurement plus a human, or it does not ship. |
| "This diff only touches the CI workflow — the review fan-out is overkill." | A pipeline edit changes what judges every later run, and removing a step there is a loosening. It also fires a trigger row: `ci-cd` joins the fan-out. |
| "I should check in before the next wave." | No mid-run halt. The human gets the open PRs at the end. |
| "This PR is green — I'll merge it to save the human a click." | Never auto-merge to main. Terminal state is an OPEN PR. |
| "I'll promote my own DRAFT PR to ready — I wrote it, I know it's good." | Promotion needs a fresh code-cold verifier with no test-write access (maker≠checker). |

## Red flags — STOP

- About to weaken/edit `acceptance.md`, a RED test, or `Regression surface` during a retry → HALT (gate-erosion; a loosening, and a retry loop has neither the measurement nor the human). Those three are frozen for the retry loop; between runs a person can change them by a signed Spec change.
- About to edit `docs/design.md` so a built surface matches it → HALT (same gate-erosion). Verify grades every contract axis marked `inherits: docs/design.md` against that file, and it carries no `status:` of its own, so moving it is the one way to clear a design gate that nothing else catches.
- About to skip, delete, weaken, or narrow an **ACTIVE `docs/test-contract.md` row** — at any moment, retry or not → HALT, naming the row id (`TC-1`). That freeze is permanent and in every run, not scoped to a loop.
- About to set a `docs/test-contract.md` row's state yourself, in either direction → STOP. Activation is a person's act and one-way; you read that file and do not edit it. Proposing a new `PENDING` row is free and encouraged — that is the tightening, and it needs no measurement and no approval.
- About to drop a reviewer, delete a guard, deactivate a scenario (remove it from its contract, or flip an ACTIVE row back to `PENDING`), or weaken any check — at any time, including at plan time or by editing these skill files → STOP. Refuse, and name the measurement that is missing.
  - **Not this:** Verify classifying a scenario `not-reachable`. That leaves the scenario where it was — in `acceptance.md`, or as an ACTIVE `docs/test-contract.md` row — and escalates it to a human via the required PR ack line, so nothing stopped being checked. It is the reporting path this suite mandates — record it, add the ack line, keep going. Never a halt, never a refusal, no measurement needed.
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
- Re-dispatching a slice the ledger marks `done` → STOP (read the ledger + `git log` after any compaction).
- Pasting prior-wave summaries / session history into a slice dispatch → STOP (hand the brief + frozen-contract paths as files).

## Verification (ending criteria)

The run terminates on **exactly one** predicate:
- **DONE:** DAG complete ∧ every slice passed `quality-verification` ∧ its attributed findings from the
  wave-aggregate Review fan-out are clear ∧ evaluator floors met → all PRs OPEN and risk-banded.
- **BLOCKED:** no agent-actionable slice remains (every not-done slice is `blocked`/`halted`).
- **DIVERGENCE / security STOP:** rising internal-gate failure rate, or a security trigger.

Runaway guard: **no-progress N=2** (identical failure signature or identical diff twice → early
halt of that slice). Per shipped slice, the done-predicate is the full SHIP conjunction above,
AND the slice sits as an OPEN risk-banded PR (a DRAFT promoted by a code-cold verifier).

Also true of every terminated run: **nothing that judges the work got looser during it.** Every wave
ran all four floor axes plus every reviewer its trigger rows fired; no reviewer, guard, scenario, or
check was dropped or weakened; **no ACTIVE `docs/test-contract.md` row was skipped, weakened, narrowed,
or moved in either direction**; any loosening that was proposed was refused with the missing
measurement named. A scenario Verify reported `not-reachable` was **not** dropped — it is still in its
contract (`acceptance.md`, or the ACTIVE row it came from) and its ack line is in the PR, which is what
"not dropped" means here. And **the dispatch order is reproducible**: replaying the run against the same
plan and the same `git` state would start the same slice first.

Also true of every terminated run: **no slice entered `impl` without passing the design-ref gate** —
its `Design ref` was `—`, or the contract that ref names read `status: signed` at the moment the
implementer was dispatched. Any slice failing that check is `halted` with the contract named, and
carries no diff, no worktree changes, and no PR.

## Outputs & handoff contract

- **Emits → `STATE.md` state transitions** (registry artifact). Stable surface the next reader
  depends on: the **slice table** (per-slice `State` column moving `impl→verify→review→ship→
  done|blocked|halted`) and the **`gate` column** (`you|agent|done`). Every transition is
  written as it happens — `STATE.md` is the resume spine; a fresh agent resumes the run cold
  from it. Change the table's shape → update every reader in the same commit.
- **Dispatch briefs** — each slice's brief carries the slice id; its frozen contract paths, including
  `docs/test-contract.md` when the repo has one, since a code-cold verifier cannot grade an ACTIVE row
  it was never handed; `docs/design.md` when the repo has one and the slice builds UI, for the same
  reason rather than because it is frozen — an axis the contract marks `inherits: docs/design.md` is
  graded against that file, and a verifier that may not read outside its brief cannot grade what it was
  never handed; and the slice row's **`Design ref`** verbatim, to **both** the implementer and the
  code-cold verifier. `—`
  is emitted as `—`, never dropped; a dropped `—` reads as "unknown" and puts the UI judgement back
  in the verifier's hands. A brief is only ever assembled for a slice that **passed the design-ref
  gate**, so every path a brief carries points at a contract that read `status: signed` at dispatch;
  a slice halted by the gate produces no brief at all, and its STATE row carries the halt reason with
  the unsigned contract's path.
- **Progress ledger** updated per terminal slice (`Slice <id>: terminal=<state> (commits
  <base7>..<head7>, PR #<n>)`), so a compacted controller never re-dispatches completed work.
- **Inverted risk report** appended at run terminal, alongside the halts.
- **Terminal hand-off:** risk-banded OPEN PRs on cluster branches for async human merge — the
  surviving downstream gate. No `session-state.md` 5-field handoff needed unless context fills
  mid-run (then `handoff` compacts; the artifacts let a fresh agent resume cold).
