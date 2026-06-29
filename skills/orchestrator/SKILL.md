---
name: orchestrator
description: Drives the autonomous Implement→Verify→Review→Ship loop once the human-owned Spec+Plan is signed and STATE.md holds a slice DAG. Use it to run a build AFK — it sorts slices into topological waves, runs each wave's ready slices in parallel (one worktree per slice, disjoint files only), holds a barrier until every slice reaches a TERMINAL state (done/halted/blocked — never just "success"), and ends the run at risk-banded OPEN PRs for async human merge. If you are about to hand-run slices one at a time, check in with the human between waves, dispatch a "reviewer" persona, weaken a frozen test/acceptance to make a gate go green, or merge to main yourself — STOP and use this instead.
---

## Purpose

**Stage: cross-cutting engine (the autonomous span, D15/D29).** The human owns Ideate +
Spec + Plan — all the thinking. Once they sign the Spec and author the plan, *something*
has to actually build it: run every slice through Implement → Verify → Review → Ship with
no human babysitting, in parallel where the dependency graph allows, and stop at a state a
human can review async. That something is this skill. It exists because the alternative —
the controlling agent hand-running slices one at a time, checking in between each — throws
away the parallelism the slice DAG was designed for and reintroduces the human halt D29
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

**Escape hatch (`depth: lite`):** a single ready slice with no siblings still runs through
the full per-slice loop and the TERMINAL barrier — do not "just do it inline." The barrier,
the worktree, and the three gates are the point even for a wave of one.

## Inputs

Refuse to run (CRISPY refuse-to-run) unless ALL are present:

- **`STATE.md`** (repo root, created by `project-setup`) — the two-level board. The `Blocked by`
  column IS the slice DAG. There must be a feature at `feature: building` with at least one
  slice row in `impl`. Absent / no building feature → refuse.
- **`preflight-readiness` verdict = GREEN** — every `environment.md` row provisioned. Red or
  un-attested amber → refuse to start the wave (D16).
- **`plan.md` + slices** (`docs/features/<slug>/`) — each slice's concrete steps, exact
  tests, declared `Regression surface`, and `Files (owned)` ownership. Missing file-ownership
  on a slice that shares a wave → refuse (the disjoint-file guard cannot run blind).
- **`acceptance.md` (status: signed)** — the frozen behavioral oracle. The orchestrator
  FREEZES `acceptance.md` + the RED tests + each slice's `Regression surface` for that
  slice's retry loop; it never edits them.

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
3. **Select the ready wave.** A slice is ready when every blocker is `done`. Apply the
   **disjoint-file guard** (below) to the ready set before dispatching.
4. **Provision isolation.** Each ready slice gets its own clean worktree (the `worktree`
   mechanism this skill owns, D15). Platform-adaptive (below).
5. **Run the per-slice loop** for every ready slice — in parallel (one dispatch call per
   slice, all in one response = concurrent execution): `incremental-implementation` (applies `test-driven-development`) → `quality-verification`
   (Verify, fresh code-cold) → **Review fan-out** (`code-review` + `code-simplification` + `security-and-hardening` +
   `performance-optimization` as fresh code-cold subagents, parallel, one axis each) → evaluator floors → `pull-request`
   (DRAFT). Bounded retries: **2 per gate, 3 implement→verify→review cycles per slice**.
6. **Barrier.** Wait for EVERY slice in the wave to reach a **TERMINAL** state
   (`done | halted | blocked`) — **never `success`**. Write every transition + gate flip to
   `STATE.md` as it happens. Then advance to the next wave.
7. **Integration gate.** After a connected DAG component's slices are all green, run the
   merged-union suite once in an integration worktree before presenting. Union-fail →
   the component's PRs go DRAFT + a blocker is recorded.
8. **Terminate** on exactly one predicate (see Verification). Append the inverted risk
   report; leave risk-banded OPEN PRs for the human.

## Wave executor & the TERMINAL barrier

The DAG → topological-wave structure is the whole point: independent branches drain in
parallel, dependent branches serialize, and the barrier between waves is what makes the run
resumable from `STATE.md` alone. The barrier waits for **TERMINAL, not SUCCESS**
(parallelism.md mech-f): a `halted` or `blocked` slice still satisfies the barrier — the run
does not stall waiting for a slice that will never pass. Its dependents transitively flip to
`blocked`; every *other* independent branch keeps draining.

## Disjoint-file guard

Same-wave slices parallelize **only if their declared file ownership is disjoint** — never
two write subagents on one file (dispatching-parallel-agents §Shared state;
parallelism.md mech-e). On overlap: **serialize** them into sub-waves (or merge them into one
slice). This is consistent with worktree-level parallelism — same-level slices are
independent by construction, so serializing an overlap is not a cohesion violation, it is the
guard doing its job.

## Platform adaptivity

The wave model is substrate-agnostic; only the dispatch primitive changes:
- **Claude Code → the Workflow feature** (`pipeline`/`parallel` + `isolation: 'worktree'`).
- **Codex → parallel subagents** (each in its own worktree).
Pick the substrate at run start; the DAG, barrier, gates, and guard are identical either way.

## The three agent-internal gates (none human, D29)

Per slice, AND-combined — SHIP requires all three plus the circuit-breaker floors:
1. **`quality-verification` / Verify** (D14/D20) — behavioral acceptance tests + the design gate.
2. **Review fan-out** (D25) — `code-review` + `code-simplification` + `security-and-hardening` + `performance-optimization`, each a fresh
   code-cold subagent on an independent axis (maker≠checker; personas DISSOLVE into skills —
   no role-play).
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
   an assertion or narrows the surface = gate-erosion **HALT**.
2. **Reward-hack tripwire** — failure signature moved only because a test/acceptance was
   edited while impl is materially unchanged → **HALT**.
3. **Fail-closed ship + code-cold promotion** — a passing slice's terminal state is a
   **DRAFT PR**. Promotion to ready-to-merge is by a **fresh code-cold verifier with NO
   test-write access** (maker≠checker); a NEW checker each round sees only `acceptance.md`,
   so the human-signed oracle never drifts.
4. **Integration gate** — the merged-union suite on a connected DAG component (above).
5. **Inverted risk report** — every SHIPPED slice carries a risk band (which floors landed
   at the line, qa coverage %, rounds consumed, any test/acceptance touched, surface
   narrowing), surfaced ALONGSIDE the halts — to draw the human's scarce attention to the
   quiet greens where unattended defects actually ship.

## Autonomy boundaries (D29)

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
- **`acceptance.md` is the SOLE human-anchored oracle.** Any "not-reachable" scenario
  classification during the run → a **required human-ack line in the PR body**, never
  silently absorbed.

## Rationalizations

| You catch yourself thinking… | Reality |
|---|---|
| "This wave has one ready slice — I'll just run it inline." | A wave of one still gets a worktree, the three gates, and the TERMINAL barrier. Run the loop. |
| "The test is flaky; I'll relax that assertion so the gate passes." | That is gate-erosion. Frozen artifacts → HALT. Fix the code or escalate. |
| "I'll dispatch a senior-reviewer persona to gut-check this." | No role-play. Dispatch the real `code-review`/`code-simplification`/`security-and-hardening`/`performance-optimization` skills as fresh code-cold subagents. |
| "Both ready slices touch `utils.ts`, but it's a tiny edit — parallel is faster." | Disjoint-file guard: overlap → serialize. Never two writers on one file. |
| "qa failed twice; `acceptance.md` must be wrong — I'll reinterpret it." | `acceptance.md` is the sole human oracle. Never edit mid-run. Not-reachable → human-ack line + escalate. |
| "I should check in before the next wave." | No mid-run halt. The human gets the open PRs at the end. |
| "This PR is green — I'll merge it to save the human a click." | Never auto-merge to main. Terminal state is an OPEN PR. |
| "I'll promote my own DRAFT PR to ready — I wrote it, I know it's good." | Promotion needs a fresh code-cold verifier with no test-write access (maker≠checker). |

## Red flags — STOP

- About to weaken/edit `acceptance.md`, a RED test, or `Regression surface` during a retry → HALT (gate-erosion).
- Failure signature moved but impl materially unchanged → reward-hack → HALT.
- Two write subagents own the same file in one wave → STOP, serialize.
- Advancing the barrier on `success` instead of TERMINAL → STOP.
- About to promote a DRAFT PR from the same context that wrote the tests → STOP (need a code-cold verifier).
- Security CRITICAL/HIGH or secret-in-diff → hard halt that slice, no retry, never a PR; committed secret → PushNotification + freeze barrier.
- Re-dispatching a slice the ledger marks `done` → STOP (read the ledger + `git log` after any compaction).
- Pasting prior-wave summaries / session history into a slice dispatch → STOP (hand the brief + frozen-contract paths as files).

## Verification (ending criteria)

The run terminates on **exactly one** predicate (D29):
- **DONE:** DAG complete ∧ every slice passed `quality-verification` ∧ Review fan-out ∧ evaluator floors → all
  PRs OPEN and risk-banded.
- **BLOCKED:** no agent-actionable slice remains (every not-done slice is `blocked`/`halted`).
- **DIVERGENCE / security STOP:** rising internal-gate failure rate, or a security trigger.

Runaway guard: **no-progress N=2** (identical failure signature or identical diff twice → early
halt of that slice). Per shipped slice, the done-predicate is the full SHIP conjunction above,
AND the slice sits as an OPEN risk-banded PR (a DRAFT promoted by a code-cold verifier).

## Outputs & handoff contract

- **Emits → `STATE.md` state transitions** (registry artifact). Stable surface the next reader
  depends on: the **slice table** (per-slice `State` column moving `impl→verify→review→ship→
  done|blocked|halted`) and the **`gate` column** (`you|agent|done`). Every transition is
  written as it happens — `STATE.md` is the resume spine; a fresh agent resumes the run cold
  from it (D13). Change the table's shape → update every reader in the same commit.
- **Progress ledger** updated per terminal slice (`Slice <id>: terminal=<state> (commits
  <base7>..<head7>, PR #<n>)`), so a compacted controller never re-dispatches completed work.
- **Inverted risk report** appended at run terminal, alongside the halts.
- **Terminal hand-off:** risk-banded OPEN PRs on cluster branches for async human merge — the
  surviving downstream gate. No `session-state.md` 5-field handoff needed unless context fills
  mid-run (then `handoff` compacts; the artifacts let a fresh agent resume cold).
