---
name: using-agent-skills
description: Route a task to the skill that owns it — read the state files, locate the stage on the board, then hand over one skill and the artifact it reads or writes. Reach for it first in a session and again whenever the stage changes. Scheduling a signed slice DAG unattended is `orchestrator`'s; cutting a plan into slices, `plan-breakdown`'s.
---

# Using Agent Skills

## Purpose

**Stage: cross-cutting.** Principles 1, 3, 5, 6.

The router. Each skill encodes one method and emits the artifact the next stage reads cold, so a
wrong dispatch is quiet and expensive: a stage gets skipped, and the hole shows up when Verify has
nothing to grade against. This skill maps a task to one skill, one stage, and the artifact that skill
opens; it writes nothing.

## When to use / when to skip

- At the start of a session, and again whenever the stage changes — a signed plan moving into
  Implement, a `Gate` flipping between `you` and `agent`.
- Whenever the stage is not obvious, including a task spanning several: a feature walks the whole loop;
  a bug fix may need only debugging-and-error-recovery → test-driven-development → code-review.
- Skip it mid-stage: once a named skill is running you do not re-dispatch each turn.
- Near-miss — scheduling a signed slice DAG across waves: `orchestrator`.
- Near-miss — cutting a signed spec into slices: `plan-breakdown`.

## Inputs

- `STATE.md` — helps: the feature `state:` and each slice's `State` and `Gate` — the stage in flight
  and who owns the next action · without it: there is no board, so `project-setup` comes first —
  except in this repository, whose `CLAUDE.md` says why it keeps none.
- `docs/session-state.md` — helps: five fields saying where the work stands · without it: read the
  board and the feature's artifacts, marking what you infer `derived`.
- `docs/session-log.md` — helps: which questions are settled, so none is re-opened for free · without
  it: nothing is on record, every question open.
- `docs/lessons.md` — helps: nothing here; no routing decision turns on it, and
  `incremental-implementation` reads it before a skeleton. Named so a cold agent learns the record
  exists rather than opening it now.
- The task as asked — helps: the stage · without it: with a person there ask at most three questions,
  otherwise classify from the board and mark that `derived`.
- The roster below — the destinations.

## Process

1. Read `STATE.md`, `docs/session-state.md` and `docs/session-log.md` first. A question the log answers
   is settled; reversing a logged decision is a new entry carrying a reason.
2. Put the throwaway question before the stage branches (*Offering the fast path*) — a throwaway ask
   matches those too, and once you have routed the offer never gets made.
3. Locate the stage from the feature `state:` and the slice `Gate`
   ([state-schema](../../references/state-schema.md)); with no `STATE.md`, `project-setup` comes first.
4. Walk the tree to one destination, then read that skill's `Inputs`. Where the artifact it consumes
   is absent, route upstream to its emitter rather than run against a gap.
5. Hold the ownership line: a slice gated `you` is not an agent-owned skill's to advance, nor an
   agent-owned slice the person's to hand-run.
6. Hand over one skill, its stage, and the artifact it reads or writes.

```
Task arrives
    │
    ├── No STATE.md? ────────────────→ project-setup        (once per repo)
    ├── Throwaway when done? ────────→ OFFER gauntlet-loop and the full loop; the person picks
    │
    ├── Don't know what you want? ───→ interview-me
    ├── An idea, want variants? ─────→ idea-refine
    ├── New feature, need a design? ─→ codebase-research, then spec-grilling  (in that order)
    │   ├── A module behind a seam? →  codebase-design      (a variant for the sitting)
    │   ├── A consumer's surface? ──→  api-design           (a variant for the sitting)
    │   ├── The product spec? ──────→  to-prd
    │   ├── The behaviour contract? →  acceptance-criteria
    │   ├── Needs from outside? ────→  environment-manifest
    │   ├── A component or edge? ───→  architecture-design
    │   └── Fix the draft cold? ────→  spec-review          (last, before the signature)
    ├── Signed spec, need a plan? ───→ plan-breakdown
    │   └── Facts about the code? ──→  codebase-research    (Plan's pass, on the decisions)
    ├── Building a slice? ───────────→ incremental-implementation
    │   ├── The test first? ────────→  test-driven-development
    │   ├── A framework or version? →  source-driven-development
    │   ├── A test or build broke? ─→  debugging-and-error-recovery
    │   └── Slice isolation? ───────→  worktree
    ├── Proving a slice works? ──────→ quality-verification
    │   ├── Only the page can say? ─→  browser-testing-with-devtools
    │   └── Something broke? ───────→  debugging-and-error-recovery
    ├── Reviewing a slice? ──────────→ code-review          (five axes)
    │   ├── Green but reads heavy? ─→  code-simplification
    │   ├── Input, auth, secrets? ──→  security-and-hardening
    │   ├── A hot path or budget? ──→  performance-optimization
    │   ├── A caller outside it? ───→  api-design
    │   └── Doubting a live call? ──→  doubt-driven-development   (not a merge gate)
    ├── Closing a slice? ────────────→ pull-request
    │   ├── Commits or branches? ───→  git-workflow
    │   ├── The pipeline? ──────────→  ci-cd
    │   ├── Logs, metrics, traces? ─→  observability-and-instrumentation
    │   ├── Retiring something? ────→  deprecation-and-migration
    │   ├── Recording the why? ─────→  documentation-and-adrs
    │   └── Merged, now release? ───→  shipping-and-launch  (after the person merges)
    │
    ├── Environment ready? ──────────→ preflight-readiness  (before a run goes unattended)
    ├── Context filling? ────────────→ handoff
    ├── Code you didn't write? ──────→ literate-explainer   (standalone)
    ├── Somebody's grasp of it? ─────→ comprehension-quiz   (standalone)
    └── The whole signed DAG, AFK? ──→ orchestrator         (waves → draft pull requests)
```

Review is a fan-out: those skills run in parallel over one diff, each dispatched code-cold as the
skill itself ([safety-rails](../../references/safety-rails.md)).

### Offering the fast path, never routing to it

`gauntlet-loop` is the one destination here you do not select. Where an ask reads like a throwaway
proof of concept — a spike, a demo, anything the person will delete — name both paths in one
message, a line each, and wait for the pick: `/gauntlet-loop`, whose work stays in the ignored
`.gauntlet/` scratch and ships nothing, or the full loop, which anything shippable walks. "Quick" is a
tone, not a scope: "quick, add auth to the login page" is production work said in a hurry, and on the
fast path it gets no `acceptance.md`, no audit, no code-cold grade. So the permissive path is opt-in —
an unanswered offer, a non-answer, anything short of the person choosing it, all mean the full loop.
The one case that skips the offer is the person naming the gauntlet themselves.

## Core operating behaviors

These hold whichever skill runs.

- **Surface assumptions.** Before anything non-trivial, print them numbered under `ASSUMPTIONS I'M
  MAKING:`, closing with "Correct me now or I'll proceed with these." A wrong assumption run
  unchecked is the commonest failure, and surfacing one costs less than the rework.
- **Manage confusion.** Where two documents disagree, name both files and the claim, then rank them by
  the source-of-truth order below. With a person there, present the tradeoff and wait — the cheapest
  correction available. With nobody there, take the higher-consequence reading with a reason, append
  one `docs/session-log.md` entry, and carry a Decided-for-you row: a question asked into a run has
  nobody to answer it, and the graph stalls behind the slice that asked. A slice ends for a stop-list
  item and nothing else ([safety-rails](../../references/safety-rails.md)).
- **Push back.** Give the concrete downside with a number where one exists, propose the alternative,
  accept an informed override. Sycophancy is a failure mode.
- **Keep it small.** Write the least code that solves the problem — no speculative abstraction,
  flexibility or error handling nothing asked for. Touch what the task names; clear only the orphans
  your change made.
- **Produce evidence.** Follow a matched skill's steps in order, verification included, and finish on
  passing tests, build output or runtime data. "Seems right" settles nothing.

## Lifecycle & ownership

The loop is **Ideate → Spec → Plan → Implement → Verify → Review → Ship**, each stage emitting what the
next reads cold:

```
intent.md → research.md → ADRs + CONTEXT.md → prd.md → acceptance.md + environment.md
          → architecture.md → plan.md + one file per slice + the DAG
          → the diff → qa.md → findings → an open draft pull request
```

The person owns Ideate, Spec and Plan, closing at one signature over the Spec bundle. The agent runs
Implement → Verify → Review → Ship without checking in between waves, terminating at risk-banded open
draft pull requests a person merges. Keep two claims apart: a run never *waits*, though six named
conditions do *end* a slice early ([safety-rails](../../references/safety-rails.md)); a stopped slice
flips its `Gate` to `you` and reports rather than sitting idle. High-risk work is not among the six —
authentication, payments, migrations and deletions raise the risk band instead, since nobody is there
mid-run to sign off. Not every task walks the whole loop.

### What an edit un-signs

A signature is against a version, not a filename: editing anything upstream of a signed artifact
returns it to `draft`.

| Editing this | Returns to `draft` | Because |
|---|---|---|
| `intent.md` | `prd.md`, and all downstream of it | the chain hangs off the intent |
| `research.md` | nothing | the survey records the code and decides nothing |
| `prd.md` | `acceptance.md`, `environment.md` | behaviour and external needs answer to it |
| `acceptance.md` | `architecture.md` | it traces every scenario, by set equality on ids |
| a decision record it cites | `architecture.md` | a citation to a changed decision is not one |

Nothing an agent does turns `draft` back to `signed` — that is the person's act at the gate. An agent
finding a signed artifact on a moved upstream names it and routes to the signer, rather than
re-signing or editing the mismatch away. This table is the rule's one statement.

### Source-of-truth order

Most authoritative first; a repository lacking one skips its rank.

1. `CLAUDE.md` / `AGENTS.md` — this repository's rules
2. `docs/adr/` — the decisions taken, and what each ruled out
3. `prd.md` — one feature's product spec
4. `acceptance.md` — its signed behavioural contract
5. `plan.md` — its slices
6. `docs/lessons.md` — a past defect, and the guard against its return

`docs/session-log.md` sits under all six and overrides no decision record and no signed contract.
`STATE.md`, `CONTEXT.md`, and a feature's `intent.md`, `research.md`, `environment.md` and `qa.md` hold
no rank; `architecture.md` decides its own feature's structure, and any layer order beneath it is an
ADR it cites. Where two unranked documents disagree this order settles nothing; *Manage confusion*
does.

## Quick reference

| Stage | Skill | Emits |
|---|---|---|
| cross-cutting | using-agent-skills | a routing decision |
| cross-cutting | project-setup | the repo substrate |
| cross-cutting | orchestrator | `STATE.md` flips · run report |
| cross-cutting | preflight-readiness | a verdict |
| cross-cutting | handoff | `docs/session-state.md` · log entries |
| Ideate | interview-me | `intent.md` |
| Ideate | idea-refine | `intent.md`, refined |
| Spec · Plan | codebase-research | `research/<axis>.md` · `research.md` |
| Spec | spec-grilling | ADRs · `CONTEXT.md` · the bundle |
| Spec | to-prd | `prd.md` |
| Spec | acceptance-criteria | `acceptance.md` |
| Spec | environment-manifest | `environment.md` |
| Spec | architecture-design | `architecture.md` |
| Spec | spec-review | fixes in place · inline flags |
| Spec · Plan | api-design | a contract, in the caller's file |
| Spec · Plan | codebase-design | an interface, in the caller's file |
| Plan | plan-breakdown | `plan.md` · a file per slice · the DAG |
| Implement | incremental-implementation | the slice's diff |
| Implement | test-driven-development | tests, and passing code |
| Implement | source-driven-development | cited docs in the diff |
| Implement | worktree | the isolated workspace |
| Verify | quality-verification | `qa.md` |
| Verify | browser-testing-with-devtools | runtime evidence |
| cross-cutting | debugging-and-error-recovery | a fix, its guard, a lesson |
| Review | code-review | a verdict · severity-labelled findings |
| Review | code-simplification | findings |
| Review | security-and-hardening | `security-findings.md` |
| Review | performance-optimization | `<SLICE-ID>-perf.md` |
| cross-cutting | doubt-driven-development | classified findings |
| Ship | pull-request | the draft pull request body |
| cross-cutting | git-workflow | commits |
| Ship | ci-cd | the pipeline |
| cross-cutting | observability-and-instrumentation | telemetry in the diff |
| Ship | deprecation-and-migration | `migration.md` |
| cross-cutting | documentation-and-adrs | `ADR-<NNN>` · README · CHANGELOG |
| Ship | shipping-and-launch | `release.md` |
| standalone | literate-explainer | a teaching artifact |
| standalone | comprehension-quiz | a ledger line |
| standalone | gauntlet-loop | `.gauntlet/<slug>/` — offered, never selected |

## Rationalizations

- *"This is obvious, I'll just start coding."* → no spec means no `acceptance.md`, so Verify has
  nothing to grade against.
- *"I know which skill, so the board can wait."* → the `Gate` column is who owns the next action;
  running an agent-owned skill on a person-owned slice is the commonest dispatch error.
- *"They said quick, so the gauntlet it is."* → that path is offered, and the person picks it.
- *"I'll fold Verify into Implement to save a step."* → a maker grading its own work is the silent
  false green the suite exists to catch.
- *"The plan is close enough, skip plan-breakdown."* → with no slices and no DAG there are no waves
  and nothing to resume from.
- *"The spec contradicts itself, so I'll ask and wait."* → mid-run nobody answers; name both sides,
  decide with a reason, log it.

## Red flags

- A dispatch made without the board open.
- A stage skill running against an artifact that does not exist.
- An agent-owned skill advancing a slice gated `you`.
- A throwaway-shaped ask sent down a path nobody offered.
- A question asked into a run nobody is watching.
- An artifact still reading `signed` over an upstream that moved.

## Verification

- [ ] `STATE.md`, `docs/session-state.md` and `docs/session-log.md` were read before the route, where
      the repo has them, and no question the log settles got re-opened.
- [ ] One skill and its stage are named, and the artifact it consumes exists — or the route went
      upstream to its emitter.
- [ ] The `Gate` column and the dispatched skill's owner agree.
- [ ] A throwaway-shaped ask had both paths named and the person answered.
- [ ] The standing bar still governs every change that skill will make
      ([definition-of-done](../../references/definition-of-done.md)).

## Outputs & handoff

- **A routing decision, in conversation rather than a file** — one next skill, its stage, and the
  artifact that skill reads or writes: enough to start cold. No cap, since nothing is written.
- **Writes nothing.** `STATE.md`, `docs/session-state.md`, `docs/session-log.md` and `docs/lessons.md`
  are read here; the dispatched skill or the run records the transition
  ([state-schema](../../references/state-schema.md)).
- **No verdict.** This skill grades nothing; `pass · concerns · block` belongs to the Verify and Review
  skills ([safety-rails](../../references/safety-rails.md)).
- **Re-entry** — on a stage change or a `Gate` flip, consult this again.
