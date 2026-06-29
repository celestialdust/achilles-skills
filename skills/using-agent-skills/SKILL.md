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
are in. Read `STATE.md` first, then route.

**Skip** only once you are already executing a named skill mid-stage — you do not re-dispatch on every turn.
You still re-consult this index when the stage changes (e.g. plan signed → moving to Implement) or when a
task spans phases (a feature flows Ideate → … → Ship; a bug fix may need only debug → test-driven-development → code-review).

## Inputs

- **`STATE.md`** (repo root) — the two-level board. Read the `feature state`, `slice state`, and `gate`
  columns to locate the current stage and who owns the next action. **If `STATE.md` is absent, route to
  `project-setup` before dispatching anything else.**
- **The full skill roster** (this file's Process tree + Quick reference) — the set of skills you may route to.
- **The task in the prompt** — classify it to a stage.

This skill is the entry point, so it does not refuse-to-run; its one hard rule is: no STATE.md ⇒ `project-setup` first.

## Process

This skill runs first. Identify the stage from `STATE.md`'s `gate` column (or, if no STATE.md
exists yet, run `project-setup`), then route the task to the stage skill below. The Core Operating Behaviors
(further down) apply at all times, regardless of which skill is active.

```
Task arrives
    │
    ├── No STATE.md yet? ──────────────────────→ project-setup            (one-time repo ecosystem)
    │
    ├── Don't know what you want yet? ─────────→ interview-me     (Ideate · optional front door → intent.md)
    ├── Have a rough idea, need variants? ─────→ idea-refine      (Ideate → intent.md)
    ├── New feature, need the design? ─────────→ spec-grilling    (Spec → ADRs + CONTEXT.md)
    │   ├── Need the product PRD? ─────────────→ to-prd           (Spec → prd.md)
    │   ├── UI work? ──────────────────────────→ frontend-design  (Spec → prototype + signed design contract)
    │   ├── Need the behavioral contract? ─────→ acceptance-criteria       (Spec → acceptance.md, behavioral-only)
    │   ├── Capture env needs? ────────────────→ environment-manifest      (Spec/Plan → environment.md)
    │   └── Spec done, fix before review? ─────→ spec-review      (Spec → fixed spec + spec-review.md)
    ├── Signed spec, need a plan? ─────────────→ plan-breakdown   (Plan · THE planner → plan.md + slices + DAG)
    │   ├── Map the codebase first? ───────────→ codebase-research         (Plan → research.md)
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
    │   ├── Release/launch? ───────────────────→ shipping-and-launch  (post-merge · release-level)
    │   ├── Deprecating/migrating? ────────────→ deprecation-and-migration
    │   └── Writing docs/ADRs? ────────────────→ documentation-and-adrs
    │
    ├── Is the env ready? ─────────────────────→ preflight-readiness        (Cross-cut · env-readiness gate)
    ├── Compact/handoff this session? ─────────→ handoff          (Cross-cut · per-session compaction)
    └── Coordinating the whole loop? ──────────→ orchestrator     (wave-parallel DAG · preflight-readiness gate · handoff)

Review is a fan-out: the orchestrator runs code-review / code-simplification / security-and-hardening / performance-optimization as fresh, code-cold
subagents in parallel on independent axes (maker≠checker) — never as role-played personas.
```

## Skill Rules

1. **Check for an applicable skill before starting work.** Skills encode processes that prevent common mistakes.

2. **Skills are workflows, not suggestions.** Follow the steps in order. Don't skip verification steps.

3. **Multiple skills can apply.** A feature implementation might involve `idea-refine` → `spec-grilling` → `plan-breakdown` → `incremental-implementation` → `test-driven-development` → `code-review` → `code-simplification` → `shipping-and-launch` in sequence.

4. **When in doubt, start with a spec.** If the task is non-trivial and there's no spec, begin with `spec-grilling`.

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
2. Name the specific confusion.
3. Present the tradeoff or ask the clarifying question.
4. Wait for resolution before continuing.

**Bad:** Silently picking one interpretation and hoping it's right.
**Good:** "I see X in the spec but Y in the existing code. Which takes precedence?"

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
- **Agent runs Implement → Verify → Review → Ship FULLY AUTONOMOUSLY, no mid-run halt.** It terminates at
  **risk-banded OPEN draft PRs** on the cluster branch; the **async human merge is the surviving final gate**
  (never auto-merge to main; auto-deploy is out of v1).
- A human gate re-appears ONLY on the failure-escalation path: a slice that exhausts its bounded retries
  flips its `gate` column `agent → you` and is surfaced.

Artifact chain (each stage emits what the next consumes cold):
```
intent.md → prd.md (+ ADRs/CONTEXT.md) → acceptance.md → environment.md → research.md
          → plan.md + slices + DAG → [implement → qa.md → review → pr → draft PR]
```
`STATE.md` (root) is the two-level board (feature state · slice state · gate) indexing every feature under
`docs/features/<slug>/`. Read it first to find where you are. Not every task needs every skill — a bug fix
might only need `debugging-and-error-recovery` → `test-driven-development` → `code-review`.

## Quick reference

| Stage | Skill | One-line summary |
|-------|-------|------------------|
| Cross-cut | using-agent-skills | this meta-dispatcher: task → skill + lifecycle map |
| Cross-cut | project-setup | one-time repo ecosystem (STATE.md, CONTEXT.md, docs/adr, docs/features) |
| Cross-cut | orchestrator | wave-parallel DAG executor; platform-adaptive; halts only at gates |
| Cross-cut | preflight-readiness | env-readiness gate; blocks the wave until provisioned |
| Cross-cut | handoff | per-session compaction to a fresh-agent doc |
| Ideate | interview-me | optional front door: surface what the user actually wants → intent.md |
| Ideate | idea-refine | divergent/convergent refinement + "Not Doing"; shares intent.md |
| Spec | spec-grilling | how to design the product; ADRs + CONTEXT.md (no prd.md) |
| Spec | to-prd | light dual-audience PRD; references ADRs by id → prd.md |
| Spec | frontend-design | the one UI skill: throwaway variants → committed prototype + design contract |
| Spec | acceptance-criteria | behavioral-only Given/When/Then contract → acceptance.md |
| Spec | environment-manifest | typed-kind manifest (no values, no commands) → environment.md |
| Spec | spec-review | fresh code-cold agent fixes the spec before the human reviews |
| Plan | codebase-research | goal-blind map of the codebase/DB as-is → research.md |
| Plan | plan-breakdown | THE planner: concrete plan → vertical slices + dependency DAG |
| Plan | codebase-design | referenced discipline: deep-module interfaces (deletion test) |
| Plan | api-design | referenced discipline: contract-first interface |
| Implement | incremental-implementation | THE implementer: one thin vertical slice, skeleton-first |
| Implement | test-driven-development | rigid RED-GREEN-REFACTOR; realizes acceptance scenarios as tests |
| Implement | source-driven-development | ground framework decisions in fetched official docs |
| Implement | worktree | per-slice isolation mechanism (orchestrator-owned) |
| Verify | quality-verification | fresh code-cold: behavioral acceptance tests + design gate → qa.md |
| Verify | browser-testing-with-devtools | live-runtime engine quality-verification drives (Chrome DevTools MCP) |
| Verify | debugging-and-error-recovery | five-step triage: reproduce · localize · reduce · fix · guard |
| Review | code-review | five-axis review incl. test quality; severity labels |
| Review | code-simplification | behavior-preserving reduction; Chesterton's Fence |
| Review | security-and-hardening | OWASP Top 10; auth; secrets; dependency audit |
| Review | performance-optimization | measure-first; Core Web Vitals; profiling |
| Review | doubt-driven-development | in-flight adversarial review (during plan/implement) |
| Ship | pull-request | per-slice design-anchored draft PR; read-the-code checklist |
| Ship | shipping-and-launch | release workhorse: checklist · flags · rollout · rollback |
| Ship | git-workflow | trunk-based; atomic commits; secret hygiene |
| Ship | ci-cd | Shift Left; quality-gate pipeline |
| Ship | observability-and-instrumentation | structured logs; RED metrics; tracing; symptom alerts |
| Ship | deprecation-and-migration | code-as-liability; migration patterns; zombie-code removal |
| Ship | documentation-and-adrs | the ADR + doc standard: document the why |

## Rationalizations

Excuses that talk you out of dispatching correctly — each is a failure mode:

- "This is obvious, I'll just start coding." → No spec ⇒ no acceptance.md ⇒ nothing for Verify to gate on.
  Non-trivial work with no spec starts at `spec-grilling`.
- "I already know which skill, I won't check STATE.md." → You skip the gate column and may run an agent-owned
  skill on a slice the human still owns. Read STATE.md.
- "I'll fold Verify into Implement to save a step." → quality-verification is a fresh code-cold maker≠checker gate; collapsing
  it is exactly the silent-false-green the suite is built to prevent.
- "The plan is close enough, I'll skip plan-breakdown." → Without slices + the DAG, the orchestrator has no
  waves and the run can't parallelize or resume.

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

## Verification (ending criteria)

Dispatch is complete when ALL hold:
- You named the applicable skill(s) AND its stage (Ideate/Spec/Plan/Implement/Verify/Review/Ship/cross-cut).
- You confirmed the skill's consuming artifact exists (per its `Inputs`); if it is missing, you routed
  upstream to the skill that emits it rather than running the downstream skill against a gap.
- You respected the ownership boundary: an agent-owned stage skill is not run on a slice whose `gate`
  column is `you`, and vice-versa.
- The project-wide Definition of Done still governs every change the dispatched skill will make
  (`../../references/definition-of-done.md`).

## Outputs & handoff contract

- **Emits:** a routing decision (in-conversation, not a durable artifact) — `task → {skill, stage,
  consuming-artifact present?}`. This is the "task→skill+lifecycle map."
- **Stable hand-off:** names exactly one next skill and the artifact it will read/write, so the dispatched
  skill starts cold without re-deriving context.
- **STATE.md:** this skill **does not write** STATE.md — the dispatched stage skill (or the orchestrator)
  records the transition. The dispatcher only reads STATE.md to decide.
- **Re-entry:** on any stage change or a `gate` flip in STATE.md, re-consult this skill.
