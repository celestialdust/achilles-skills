---
name: handoff
description: Compact the current session into a cold-start handoff the MOMENT context fills, the work pauses, or you are about to /clear — so a fresh agent resumes from durable state, not a lost conversation. Writes the 5-field handoff, references artifacts by path instead of duplicating them, and redacts every secret. Use BEFORE you lose context, not after.
---

## Purpose

Stage: **cross-cutting · per-session handoff layer (D10).**

A context window fills, a session pauses, or you are about to `/clear` — and the live
conversation, the only place the working state lives, is about to vanish. This skill compacts
that conversation into a **cold-start document a fresh agent resumes from with zero prior
context**.

It is the **per-session** half of the two-layer handoff (spec §4.2, D10). The other half — the
per-stage artifact chain (`intent.md → prd.md → … → qa.md`) and `STATE.md` — carries *structural*
state turn-to-turn. This skill carries the *session's working state*: the decision just made, the
half-finished thought, the single next move that those durable artifacts do not yet hold. Written
in the **N14 5-field schema** so it pairs with (and can BE) `docs/session-state.md`.

## When to use / when to skip

**Use when:**
- Context budget is nearing the ceiling mid-session — finish the current step, then hand off.
- You are about to `/clear`, switch agents, or stop a long human-led session (Ideate / Spec / Plan).
- A teammate or a fresh agent will pick the work up cold.

**Skip when:**
- `STATE.md` + the per-stage artifact chain already capture everything. An autonomous orchestrator
  run is resumable from `STATE.md` alone (D29: auto-compaction + ~1M context — no handoff-resume
  loop). Do not write a handoff just to restate `STATE.md`.
- The work is one atomic step you will finish this turn.

**Escape hatch:** if you are mid-step, do NOT abandon it to write the handoff — finish the step
first (context-budget rule), then hand off. A handoff written mid-thought is worse than none.

## Inputs

- **The current conversation** — the primary source being compacted.
- **OPTIONAL argument**: a one-line description of what the next session will focus on. Treat it as
  the lens — tailor every field toward that focus.
- **Read-only, to reference (never restate):** `STATE.md`; the per-feature chain under
  `docs/features/<slug>/` (`intent.md`, `prd.md`, `acceptance.md`, `plan.md`, `qa.md`); `docs/adr/`;
  recent commits/diffs.

No refuse-to-run gate — a handoff can always be written from the conversation. But **read the
durable artifacts FIRST** so you reference them by path rather than copy their bodies in.

## Process

1. **Pick the destination.** Session-boundary handoff → write to `docs/session-state.md` (the N14
   home, committed). Throwaway mid-session compaction → write `handoff.md` to the OS temp dir, not
   the workspace. Same schema either way.
2. **Write the five N14 fields — state, not narrative.** `## Current objective` (one sentence) ·
   `## Current state` (what is done; which files changed; last known-good commit) ·
   `## Remaining issues` (blockers, open questions, undecided calls) · `## Boundaries` (what is IN
   and OUT of scope for the next agent — do not let them over- or under-reach) · `## Next phase`
   (the single next action, specific enough to resume without asking a question).
3. **Reference, do not duplicate.** Anything already captured in `prd.md`, `plan.md`, an ADR, an
   issue, a commit, or a diff is named by path/URL — never pasted. Duplicated knowledge diverges.
4. **Add `## Suggested skills`** — name the skills the fresh agent should invoke next (e.g. resume
   Spec → `spec-review`, `to-prd`; resume Plan → `plan-breakdown`, `codebase-research`).
5. **Redact.** Replace every API key, token, password, and PII with `[REDACTED]`. For environment
   needs, point at `environment.md` (typed manifest, no value column, D21) — never carry a value
   into the handoff.
6. **Tailor to the argument** if one was passed — bias `Current state` / `Next phase` toward that
   next-session focus.

## The handoff document — structure

```markdown
## Current objective
[One sentence: what this work is trying to accomplish.]

## Current state
[Done so far; files changed; last known-good commit. Reference prd.md / plan.md by path.]

## Remaining issues
[Blockers, open questions, unresolved decisions.]

## Boundaries
[IN scope and OUT of scope for the next agent. Do not cross these.]

## Next phase
[The single next action — specific enough to resume without asking a question.]

## Suggested skills
[Skills the fresh agent should invoke next, and why.]

## Referenced artifacts
[Paths/URLs to prd.md, plan.md, ADRs, STATE.md, commits — NOT their contents.]
```

## Rationalizations

- *"I'll just summarize what we discussed."* → No. A conversation summary forces the next agent to
  reconstruct state. Write **state**, in the five fields (N14 anti-pattern).
- *"I'll paste the plan/PRD in so it's all in one place."* → No. Reference by path; duplicated
  knowledge diverges from its source (DRY-of-knowledge).
- *"The next agent can figure out the scope."* → No. Write `## Boundaries` explicitly, or it will
  over-reach or under-reach.
- *"`Continue where we left off` is enough for Next phase."* → No. That is not actionable; name the
  file and the step.
- *"The secret is internal, it's fine to keep."* → No. Redact always — a handoff outlives the
  session and may be shared or committed.

## Red flags

- The doc reads as a narrative of "what we did" rather than the five state fields → rewrite.
- `## Next phase` says "keep working on X" with no file/step → not resumable.
- A literal API key, token, password, or PII appears anywhere → STOP, redact to `[REDACTED]`.
- A whole file body, full diff, or PRD/plan section is pasted in → replace with a path reference.
- No `## Boundaries` section → the next agent has no scope fence.

## Verification (ending criteria)

Done when ALL hold:
- All five N14 headings present and non-empty: Current objective, Current state, Remaining issues,
  Boundaries, Next phase.
- `## Suggested skills` and `## Referenced artifacts` present.
- `## Next phase` is a single concrete action (passes "resume without asking a question").
- No secret/PII literal in the doc (grep common patterns: `sk-`, `sk_live`, `AKIA`, `password=`,
  `token=`); any present → `[REDACTED]`.
- No duplicated artifact body — referenced artifacts appear as paths/URLs only.

## Outputs & handoff contract

- **Emits** `handoff.md` (per-session compaction) in the N14 5-field schema + `## Suggested skills`
  + `## Referenced artifacts`. Operational twin of `docs/session-state.md`; write THERE when this is
  the durable session boundary, or to the OS temp dir for a throwaway compaction.
- **Stable sections** a consumer depends on: the five N14 fields (exact headings) + `## Suggested
  skills`. A fresh agent reads these cold to resume.
- **`STATE.md` update: none.** Handoff is the per-session layer and is orthogonal to `STATE.md`
  (the per-run resume index the orchestrator owns). It *references* `STATE.md`; it never writes it.
