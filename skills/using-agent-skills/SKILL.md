---
name: using-agent-skills
description: The meta-dispatcher for the achilles-skills suite. Maps any task to the right stage skill and the artifact-chain lifecycle (Ideate → Spec → Plan → Implement → Verify → Review → Ship). Use this FIRST — at the start of every session and whenever you are unsure which skill applies — before writing any plan, spec, or code. Acting without consulting this index is how the wrong skill gets run and the artifact chain gets skipped.
---

# Using Agent Skills

## Purpose

**Stage: cross-cutting (meta-dispatcher).** achilles-skills is a suite of engineering-workflow skills
organized by lifecycle phase. Each skill encodes a process a senior engineer follows; each emits the
artifact the next stage consumes. This meta-skill exists because the wrong skill — or skipping a stage —
silently breaks the artifact chain that makes the autonomous run resumable. It helps you discover and
apply the right skill, in the right order, for the current task.

## When to use / when to skip

**Use** at the start of every session, and any time you are unsure which skill applies or which stage you
are in. Read `STATE.md`, `docs/session-state.md`, and `docs/progress.md` first, then route.

**Skip** only once you are already executing a named skill mid-stage — you do not re-dispatch on every turn.
You still re-consult this index when the stage changes (e.g. plan signed → moving to Implement) or when a
task spans phases (a feature flows Ideate → … → Ship; a bug fix may need only debug → test-driven-development → code-review).

## Inputs

- **`STATE.md`** (repo root) — the two-level board. Read the `feature state`, `slice state`, and `gate`
  columns to locate the current stage and who owns the next action. **If `STATE.md` is absent, route to
  `project-setup` before dispatching anything else.**
- **`docs/session-state.md`** (when the repo has one) — the session log. Its five fields say where the
  work stands; `## Log` beneath them says why, and which questions are already settled. Read both before
  you route, so a question the log already answers is not re-opened. Reversing a logged decision is a new
  entry with a reason, not a debate restarted from zero. No file → nothing to read; route on.
- **`docs/progress.md`** (when the repo has one) — the run record: what each slice actually executed, one
  entry per slice, with the commands as they were run and their real output. Read it with the two above
  before you route, and read it whenever you are resuming work you were not present for. The board says
  where things stand, the log says why, and this says what was actually done — the question a summary of a
  finished run is least reliable about. A heading with nothing under it is a slice that started and did not
  finish. It carries no stage and no owner, so never route off it; and nothing here writes it. No file →
  nothing to read; route on.
- **`docs/lessons.md`** (when the repo has one) — the lessons record: what a root-caused defect turned out
  to be, and the guard that would stop it coming back. **Read by a later stage, not by this one.** No
  routing decision turns on it, so opening it here spends context and settles nothing.
  `incremental-implementation` reads it before it writes a skeleton, because its entries are decisions
  about how to build rather than about which skill applies. It is named here so a cold agent learns the
  record exists and who owes it a read — a file this list never mentions is a file nobody goes looking for.
- **The full skill roster** (this file's Process tree + Quick reference) — the set of skills you may route to.
- **The task in the prompt** — classify it to a stage.

This skill is the entry point, so it does not refuse-to-run; its one hard rule is: no STATE.md ⇒ `project-setup` first.

## Process

This skill runs first. Read `docs/session-state.md` — both zones — and `docs/progress.md` before you
route, so the questions this project has already settled are in hand, along with what the last run
actually executed. Then identify the stage from `STATE.md`'s `gate` column
(or, if no STATE.md exists yet, run `project-setup`) and route the task to the stage skill below. The
Core Operating Behaviors (further down) apply at all times, regardless of which skill is active.

```
Task arrives
    │
    ├── No STATE.md yet? ──────────────────────→ project-setup            (one-time repo ecosystem)
    ├── Thrown away when it is done? ──────────→ OFFER gauntlet-loop AND the full loop — never pick one
    │                                            (Standalone · asked BEFORE the stage branches · see below)
    │
    ├── Don't know what you want yet? ─────────→ interview-me     (Ideate · optional front door → intent.md)
    ├── Have a rough idea, need variants? ─────→ idea-refine      (Ideate → intent.md)
    ├── New feature, need the design? ─────────→ codebase-research, then spec-grilling     (Spec · in that order)
    │   ├── Survey the code as it is today? ───→ codebase-research         (Spec · head → research.md · goal-blind)
    │   ├── Survey done, decide the design? ───→ spec-grilling    (Spec → ADRs + CONTEXT.md · refuses without research.md)
    │   ├── Need the product PRD? ─────────────→ to-prd           (Spec → prd.md)
    │   ├── UI work? ──────────────────────────→ frontend-design  (Spec → prototype + signed design contract)
    │   ├── Need the behavioral contract? ─────→ acceptance-criteria       (Spec → acceptance.md, behavioral-only)
    │   ├── Capture env needs? ────────────────→ environment-manifest      (Spec/Plan → environment.md)
    │   ├── Structure nobody wrote down? ──────→ architecture-design       (Spec → architecture.md + the
    │   │                                        committed architecture.html · after acceptance.md is
    │   │                                        signed, before spec-review · first pass also writes
    │   │                                        ARCHITECTURE.md · never scaffolded)
    │   └── Spec done, fix before review? ─────→ spec-review      (Spec → fixed spec + spec-review.md)
    ├── Signed spec, need a plan? ─────────────→ plan-breakdown   (Plan · THE planner → plan.md + slices + DAG)
    │   ├── Need codebase facts? ──────────────→ reuse Spec's research.md; re-run codebase-research only
    │   │                                        against a gap you can name in one sentence
    │   ├── Deep-module interfaces? ───────────→ codebase-design  (referenced during planning → plan.md)
    │   └── Contract-first API? ───────────────→ api-design       (referenced during planning → plan.md)
    ├── Implementing a slice? ─────────────────→ incremental-implementation        (Implement · THE implementer → diff)
    │   ├── Writing the test first? ───────────→ test-driven-development              (RED-GREEN-REFACTOR · hook-enforced)
    │   ├── Framework/library decision? ───────→ source-driven-development    (verify against fetched official docs)
    │   └── Need slice isolation? ─────────────→ worktree         (orchestrator-owned mechanism)
    ├── Proving it works? ─────────────────────→ quality-verification               (Verify · acceptance tests + design gate → qa.md)
    │   ├── Browser/runtime checks? ───────────→ browser-testing-with-devtools  (engine quality-verification drives)
    │   └── Something broke? ──────────────────→ debugging-and-error-recovery   (five-step triage)
    ├── Reviewing a slice? ────────────────────→ code-review      (Review · five-axis incl. test quality)
    │   ├── Too complex? ──────────────────────→ code-simplification
    │   ├── Security concerns? ────────────────→ security-and-hardening
    │   ├── Performance concerns? ─────────────→ performance-optimization
    │   └── In-flight decision doubt? ─────────→ doubt-driven-development            (during plan/implement · NOT a merge gate)
    ├── Ending a slice? ───────────────────────→ pull-request               (Ship · per-slice design-anchored DRAFT PR)
    │   ├── Committing/branching? ─────────────→ git-workflow
    │   ├── CI/CD pipeline work? ──────────────→ ci-cd
    │   ├── Logs/metrics/traces? ──────────────→ observability-and-instrumentation    (instrument as you build)
    │   ├── Release/launch? ───────────────────→ shipping-and-launch  (release-level · AFTER the human merges)
    │   ├── Deprecating/migrating? ────────────→ deprecation-and-migration
    │   └── Writing docs/ADRs? ────────────────→ documentation-and-adrs
    │
    ├── Is the env ready? ─────────────────────→ preflight-readiness        (Cross-cut · env-readiness gate)
    ├── Compact/handoff this session? ─────────→ handoff          (Cross-cut · per-session compaction)
    ├── Explain code you didn't write? ────────→ literate-explainer         (Standalone · teaching artifact for code you didn't write · no gate)
    ├── Quiz your understanding? ──────────────→ comprehension-quiz         (Standalone · retrieval practice, graded before reveal · no gate)
    └── Coordinating the whole loop? ──────────→ orchestrator     (wave-parallel DAG · preflight-readiness gate · handoff)

Review is a fan-out: the orchestrator runs code-review / code-simplification / security-and-hardening / performance-optimization as fresh, code-cold
subagents in parallel on independent axes (maker≠checker) — never as role-played personas.
```

### Offering the fast path, never routing to it

`gauntlet-loop` is the one destination in this tree you never select. Ask its question **before** you walk
the stage branches, because a throwaway ask matches them too — "prototype the dashboard" reads like a new
feature — and once you have routed to a stage the offer never gets made. When an ask reads like a throwaway
proof of concept (a spike, a demo, a bake-off, anything the human says they will delete), name **both** paths
in one message, one line each, and stop until the human picks:

- **`/gauntlet-loop`** — fast, throwaway, no gates; the work lands in the `.gauntlet/` scratch the repository
  ignores, and is not shippable.
- **the full loop** — Ideate → Spec → Plan → Implement → Verify → Review → Ship, which is what anything that
  will ship goes through.

Deciding this yourself is the failure the offer exists to stop: **"quick" is a tone, not a scope.** "Quick,
add auth to the login page" is production work said in a hurry, and sent to the fast path it gets no
`acceptance.md`, no security audit, and no maker≠checker pass. So the permissive path is opt-in: an offer
nobody answered, a non-answer, and anything short of the human choosing it all mean the full loop. The one
case that skips the offer is the human naming the gauntlet themselves — typing `/gauntlet-loop`, or using any
of the trigger phrases the skill's `description` lists. That is the pick already made.

## Skill Rules

1. **Check for an applicable skill before starting work.** Skills encode processes that prevent common mistakes.

2. **Skills are workflows, not suggestions.** Follow the steps in order. Don't skip verification steps.

3. **Multiple skills can apply.** A feature implementation might involve `idea-refine` → `codebase-research` → `spec-grilling` → `plan-breakdown` → `incremental-implementation` → `test-driven-development` → `code-review` → `code-simplification` → `pull-request` in sequence. The sequence ends at the open draft PR, because that is where the agent's span ends — `shipping-and-launch` picks up on the far side of the human's merge and is not part of the chain a slice walks.

4. **When in doubt, start with a spec — and a spec starts with the survey.** If the task is non-trivial and there's no spec, begin with `codebase-research`, then `spec-grilling`. Going straight to `spec-grilling` gets you refused: it will not decide a design against recollection, so it requires the `research.md` the survey writes.

## Core Operating Behaviors

These behaviors apply at all times, across all skills. They are non-negotiable.

### 1. Surface Assumptions

Before implementing anything non-trivial, explicitly state your assumptions:

```
ASSUMPTIONS I'M MAKING:
1. [assumption about requirements]
2. [assumption about architecture]
3. [assumption about scope]
→ Correct me now or I'll proceed with these.
```

Don't silently fill in ambiguous requirements. The most common failure mode is making wrong assumptions and running with them unchecked. Surface uncertainty early — it's cheaper than rework.

### 2. Manage Confusion Actively

When you encounter inconsistencies, conflicting requirements, or unclear specifications:

1. **STOP.** Do not proceed with a guess.
2. Name the specific confusion. Where two documents disagree, name both files and the claim.
3. Check whether it is already settled. Two documents disagreeing is often not a real conflict:
   `docs/workflow.md`'s **Source-of-truth order** ranks them, and if it names which one governs, you
   have your answer and you continue. A confusion that order does not cover, or does not settle,
   reaches step 4.
4. Hand it to whoever can settle it — and **who that is depends on whether anybody is there to ask.**

**Which situation you are in.** The question is not which stage you are in, it is whether a person is
present to answer:

- **Somebody is there** — a human-owned stage (Ideate, Spec, Plan), or a single-slice path a person
  invoked and is watching. Asking is the whole point: present the tradeoff or the clarifying question
  and **wait for the answer.** Guessing here throws away the cheapest correction you will ever get.
- **Nobody is there** — you were dispatched inside a run, the autonomous Implement → Verify → Review →
  Ship pass. A question has no one to answer it, so asking one is a deadlock: the slice sits open
  forever and the rest of the graph stops draining behind it. **End the slice instead.** Report what
  ended it, naming both sides of the inconsistency, and flip its `gate` column `agent → you`. The slice
  is over, the run keeps going, and the human settles it when they next look.

Ending a slice is not a quieter way of waiting — it is what keeps the rest of the graph moving, and it
is one of the named stop conditions rather than an exception to autonomy. `docs/workflow.md`'s *What
stops a run* carries the full list; read it there rather than counting from memory.

**Bad:** Silently picking one interpretation and hoping it's right.
**Bad:** Asking a clarifying question inside a run, then waiting. Nobody is at the keyboard, so the
answer never comes and the run never finishes.
**Good, with a person present:** "I see X in the spec but Y in the existing code. Which takes precedence?"
**Good, inside a run:** end the slice reporting "ADR-004 expires sessions at 24h, ADR-011 at 1h; both
are rank 4, so the source-of-truth order does not settle it" — the `gate` flips `agent → you`, and the
next ready slice starts.

### 3. Push Back When Warranted

You are not a yes-machine. When an approach has clear problems:

- Point out the issue directly
- Explain the concrete downside (quantify when possible — "this adds ~200ms latency" not "this might be slower")
- Propose an alternative
- Accept the human's decision if they override with full information

Sycophancy is a failure mode. "Of course!" followed by implementing a bad idea helps no one. Honest technical disagreement is more valuable than false agreement.

### 4. Enforce Simplicity

Your natural tendency is to overcomplicate. Actively resist it.

Before finishing any implementation, ask:
- Can this be done in fewer lines?
- Are these abstractions earning their complexity?
- Would a staff engineer look at this and say "why didn't you just..."?

If you build 1000 lines and 100 would suffice, you have failed. Prefer the boring, obvious solution. Cleverness is expensive.

### 5. Maintain Scope Discipline

Touch only what you're asked to touch.

Do NOT:
- Remove comments you don't understand
- "Clean up" code orthogonal to the task
- Refactor adjacent systems as a side effect
- Delete code that seems unused without explicit approval
- Add features not in the spec because they "seem useful"

Your job is surgical precision, not unsolicited renovation.

### 6. Verify, Don't Assume

Every skill includes a verification step. A task is not complete until verification passes. "Seems right" is never sufficient — there must be evidence (passing tests, build output, runtime data).

Per-skill verification is the local check. The project-wide bar that applies to *every* change, regardless of which skill is active, is the Definition of Done: tests pass, no regressions, behavior verified at runtime, docs updated. See `../../references/definition-of-done.md`. It complements each task's acceptance criteria rather than replacing them.

## Lifecycle & ownership

The loop is **Ideate → Spec → Plan → Implement → Verify → Review → Ship**. Ownership splits hard:

- **Human owns Ideate + Spec + Plan** (all the thinking). One upstream gate: the **Spec sign-off**
  (signs intent.md + prd.md + acceptance.md + environment.md + — when UI — frontend-design's design contract).
- **Agent runs Implement → Verify → Review → Ship autonomously — it never blocks waiting for input.** No
  "should I continue?" checkpoint sits between slices; nobody has to watch it. It terminates at
  **risk-banded OPEN draft PRs** on the cluster branch; the **async human merge is the surviving final gate**
  (never auto-merge to main; auto-deploy is out of v1).
- **A run can still stop.** Two different claims are easy to collapse into one, so keep them apart: a run
  never *waits*, but named conditions do *end* it early — a missing precondition, an absent or unsigned
  `acceptance.md`, an attempted edit to a frozen artifact, a security CRITICAL/HIGH or a secret in the
  diff, two sources of truth the source-of-truth order does not settle, exhausted retries. High-risk
  work is **not** one of them: nothing pauses mid-run for a sign-off
  nobody is there to give, so auth, payments, migrations, deletions, deploys, and secrets surface at the
  end instead — as the PR's **risk band**, which the human reads at the merge gate. A stopped slice flips
  its `gate` column `agent → you`, and the run reports what stopped it and where rather than sitting idle.
  `docs/workflow.md` in the repo carries the full list — read it there rather than counting from memory.

Artifact chain (each stage emits what the next consumes cold):
```
intent.md → research.md → prd.md (+ ADRs/CONTEXT.md) → acceptance.md → environment.md
          → architecture.md + architecture.html → plan.md + slices + DAG
          → [implement → qa.md → review → pr → draft PR]
```
`STATE.md` (root) is the two-level board (feature state · slice state · gate) indexing every feature under
`docs/features/<slug>/`. Read it first to find where you are. Not every task needs every skill — a bug fix
might only need `debugging-and-error-recovery` → `test-driven-development` → `code-review`.

## Quick reference

| Stage | Skill | One-line summary |
|-------|-------|------------------|
| Cross-cut | using-agent-skills | this meta-dispatcher: task → skill + lifecycle map |
| Cross-cut | project-setup | one-time repo ecosystem (STATE.md, CONTEXT.md, docs/adr/, docs/features/, docs/test-contract.md, docs/workflow.md, docs/session-state.md, docs/progress.md, docs/lessons.md, the `## Agent skills` block in one of CLAUDE.md / AGENTS.md + a short pointer to it in the other) |
| Cross-cut | orchestrator | wave-parallel DAG executor; platform-adaptive; runs to open draft PRs, never waits |
| Cross-cut | preflight-readiness | env-readiness gate; refuses the wave until provisioned |
| Cross-cut | handoff | per-session compaction to a fresh-agent doc |
| Ideate | interview-me | optional front door: surface what the user actually wants → intent.md |
| Ideate | idea-refine | divergent/convergent refinement + "Not Doing"; shares intent.md |
| Spec | codebase-research | goal-blind map of the codebase/DB as-is → research.md; runs at the head of Spec, and Plan reuses it |
| Spec | spec-grilling | how to design the product; ADRs + CONTEXT.md (no prd.md) — refuses without research.md |
| Spec | to-prd | light dual-audience PRD; references ADRs by id → prd.md |
| Spec | frontend-design | the one UI skill: throwaway variants → committed prototype + design contract; the repo's first UI surface also writes `docs/design.md` |
| Spec | acceptance-criteria | behavioral-only Given/When/Then contract → acceptance.md |
| Spec | environment-manifest | typed-kind manifest (no values, no commands) → environment.md |
| Spec | architecture-design | the structure a person signs before any code is planned → architecture.md + the committed architecture.html; the repo's first such pass also writes `ARCHITECTURE.md`. Refuses without a signed acceptance.md |
| Spec | spec-review | fresh code-cold agent fixes the spec before the human reviews |
| Plan | plan-breakdown | THE planner: concrete plan → vertical slices + dependency DAG; reads Spec's research.md |
| Plan | codebase-design | referenced discipline: deep-module interfaces (deletion test) |
| Plan | api-design | referenced discipline: contract-first interface |
| Implement | incremental-implementation | THE implementer: one thin vertical slice, skeleton-first |
| Implement | test-driven-development | rigid RED-GREEN-REFACTOR; realizes acceptance scenarios as tests |
| Implement | source-driven-development | ground framework decisions in fetched official docs |
| Implement | worktree | per-slice isolation mechanism (orchestrator-owned) |
| Verify | quality-verification | fresh code-cold: behavioral acceptance tests + design gate → qa.md |
| Verify | browser-testing-with-devtools | live-runtime engine quality-verification drives (any configured browser MCP) |
| Verify | debugging-and-error-recovery | five-step triage: reproduce · localize · reduce · fix · guard |
| Review | code-review | five-axis review incl. test quality; severity labels |
| Review | code-simplification | behavior-preserving reduction; Chesterton's Fence |
| Review | security-and-hardening | OWASP Top 10; auth; secrets; dependency audit |
| Review | performance-optimization | measure-first; Core Web Vitals; profiling |
| Review | doubt-driven-development | in-flight adversarial review (during plan/implement) |
| Ship | pull-request | the spine of Ship: per-slice design-anchored draft PR; read-the-code checklist; the stage ends here |
| Ship | shipping-and-launch | release workhorse, release-level and post-merge: checklist · flags · rollout · rollback. A slice still at an open draft PR belongs to `pull-request`. |
| Ship | git-workflow | trunk-based; atomic commits; secret hygiene |
| Ship | ci-cd | Shift Left; quality-gate pipeline |
| Ship | observability-and-instrumentation | structured logs; RED metrics; tracing; symptom alerts |
| Ship | deprecation-and-migration | code-as-liability; migration patterns; zombie-code removal |
| Ship | documentation-and-adrs | the ADR + doc standard: document the why |
| Comprehension | literate-explainer | standalone: turn a diff or whole repo into a self-contained teaching artifact; never a gate |
| Comprehension | comprehension-quiz | standalone: ~5-question retrieval practice, graded before reveal → learning ledger; never a gate |
| Standalone | gauntlet-loop | fast path for a throwaway POC: beat a named outside bar, blind builder/critic loop, work stays in the `.gauntlet/` scratch the repository ignores; **offered, never auto-selected** |

## Rationalizations

Excuses that talk you out of dispatching correctly — each is a failure mode:

- "This is obvious, I'll just start coding." → No spec ⇒ no acceptance.md ⇒ nothing for Verify to gate on.
  Non-trivial work with no spec starts at `codebase-research`, then `spec-grilling`.
- "spec-grilling refused for want of research.md, so I'm stuck." → You are one skill upstream of unstuck.
  The survey is the head of Spec, not a Plan chore: run `codebase-research` against the signed `intent.md`,
  then re-enter `spec-grilling`. A refusal names its missing artifact precisely so you can route to whoever
  emits it — that is the dispatch move, not a dead end.
- "I already know which skill, I won't check STATE.md." → You skip the gate column and may run an agent-owned
  skill on a slice the human still owns. Read STATE.md.
- "I'll fold Verify into Implement to save a step." → quality-verification is a fresh code-cold maker≠checker gate; collapsing
  it is exactly the silent-false-green the suite is built to prevent.
- "The plan is close enough, I'll skip plan-breakdown." → Without slices + the DAG, the orchestrator has no
  waves and the run can't parallelize or resume.
- "They said quick, so I'll send it to `gauntlet-loop`." → You do not select that path; you offer it and the
  human picks. See *Offering the fast path, never routing to it*.
- "The spec contradicts itself, so I'll ask and wait — *Manage Confusion Actively* says not to guess." →
  It says not to guess, and inside a run it says to end the slice. Waiting is not the cautious reading of
  that rule, it is the one failure the rule cannot survive: nobody is at the keyboard mid-run, so the
  slice never resumes and every slice behind it stalls too. Name both sides, end the slice, flip the
  `gate` to `you`, and let the next ready slice start.

## Red flags

These are the subtle errors that look like productivity but create problems:

1. Making wrong assumptions without checking
2. Not managing your own confusion — plowing ahead when lost
3. Not surfacing inconsistencies you notice
4. Not presenting tradeoffs on non-obvious decisions
5. Being sycophantic ("Of course!") to approaches with clear problems
6. Overcomplicating code and APIs
7. Modifying code or comments orthogonal to the task
8. Removing things you don't fully understand
9. Building without a spec because "it's obvious"
10. Skipping verification because "it looks right"
11. Waiting mid-run for an answer nobody is there to give, instead of ending the slice and flipping its gate

## Verification (ending criteria)

Dispatch is complete when ALL hold:
- `docs/session-state.md` was read before you routed — both the five fields and `## Log` — where the repo
  has one, and no question the log already answers was re-opened.
- `docs/progress.md` was read before you routed, where the repo has one, so what the last run actually
  executed is in hand rather than reconstructed from a summary of it. Nothing was routed off it: it says
  what ran, never who acts next.
- You named the applicable skill(s) AND its stage (Ideate/Spec/Plan/Implement/Verify/Review/Ship/cross-cut).
- You confirmed the skill's consuming artifact exists (per its `Inputs`); if it is missing, you routed
  upstream to the skill that emits it rather than running the downstream skill against a gap.
- You respected the ownership boundary: an agent-owned stage skill is not run on a slice whose `gate`
  column is `you`, and vice-versa.
- A throwaway-shaped ask got both paths named and no pick made for the human; `gauntlet-loop` was reached
  only because the human named it.
- The project-wide Definition of Done still governs every change the dispatched skill will make
  (`../../references/definition-of-done.md`).

## Outputs & handoff contract

- **Emits:** a routing decision (in-conversation, not a durable artifact) — `task → {skill, stage,
  consuming-artifact present?}`. This is the "task→skill+lifecycle map."
- **Stable hand-off:** names exactly one next skill and the artifact it will read/write, so the dispatched
  skill starts cold without re-deriving context.
- **STATE.md:** this skill **does not write** STATE.md — the dispatched stage skill (or the orchestrator)
  records the transition. The dispatcher only reads STATE.md to decide. The same holds for
  `docs/session-state.md` and `docs/progress.md`: it reads all three and writes none of them.
- **Re-entry:** on any stage change or a `gate` flip in STATE.md, re-consult this skill.
