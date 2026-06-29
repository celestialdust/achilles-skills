---
name: codebase-research
description: Map the codebase/DB exactly as it is today — a goal-blind, fact-only survey produced by parallel read sub-agents that never see the design — BEFORE anyone writes plan.md. Use this the moment Plan starts, whenever someone says "research the codebase," "do the codebase dive," or is tempted to plan against a guess about how the code works. Skip it and plan-breakdown plans on fiction.
---

# research — Plan stage (goal-blind codebase map)

## Purpose

Stage: **Plan** (first skill; the human owns Plan per D29). Produce one file —
`docs/features/<slug>/research.md` — a **compressed, fact-only description of how the relevant code
works today**: call graphs, data shapes, external-API behavior, installed packages, prior art already
present. It is NOT a design, a recommendation, or a comparison of options. If a sentence could be argued
with, it does not belong. The test of a good `research.md`: a reader who has never seen the problem can
verify every claim against the actual codebase or external docs.

Why this is its own **goal-blind** stage (three first-principles reasons):

1. **Objectivity via goal-hiding.** Telling a research context *what you are building* contaminates it —
   it surfaces files that support the intended change and quietly ignores files that don't. The fix is
   structural, not disciplinary: research runs seeing only a *sanitized problem statement*, so objectivity
   is enforced by plumbing instead of willpower.
2. **Research is the most leveraged stage.** A bad line of code is one bad line. A bad line in the plan is
   ~100 bad lines of code. A bad line of research — a misunderstanding of how the codebase actually works —
   cascades into *thousands*. Errors here are the most expensive; that is why it gets its own context and
   its own artifact.
3. **Focus without contamination.** The sanitized problem statement supplies scope; the prd's Solution /
   Implementation sections and every design substrate (ADRs, design.md, acceptance.md) are fenced out so
   the map stays objective.

## When to use / when to skip

**Use** at the start of Plan, after the Spec gate signs `prd.md`, before `plan-breakdown` writes
`plan.md`. Trigger words: "research the codebase," "do the codebase dive," or moving a feature from Spec
into Plan.

**Skip** only a true greenfield repo with no relevant prior code — write `## Prior art in the codebase`
as `_none_ — greenfield` and let `plan-breakdown` proceed. Do **not** skip because the change "looks
small": shallow research that stops at the first matching file is the named failure mode that sinks plans.

## Inputs

Resolve the one required input in this order; refuse-to-run (naming the missing input) if none resolve:

1. **Sanitized problem statement** — one paragraph describing the user-facing outcome with implementation
   direction stripped. "Users need to reset their password via email" is fine; "Add a `/reset` route that
   calls `sendResetEmail()` via SendGrid" is not — it leaks design.
   - **(a)** inline in the invocation prompt, OR
   - **(b)** derived from `docs/features/<slug>/prd.md` by reading the **`## Problem`** section *only*,
     then rewriting it as a user-facing outcome with any solution verbs, package names, route names, and
     file paths stripped.

**Objectivity fence — disallowed in the research context** (the house equivalent of cr's "read only the
goal line"): the prd's `## Solution` / `## Implementation Decisions` / `## Testing Decisions` sections;
ADRs and `design.md`; `acceptance.md`; any `plan.md` or slices; prior conversation history. The **parent
context must not read these before dispatch** — reading them here contaminates every sub-agent prompt you
assemble, and the goal-contamination you split this stage out to prevent comes right back.

## Process

1. Resolve the sanitized problem statement per `## Inputs`. Refuse-to-run if it cannot be resolved.
2. **Dispatch research sub-agents in parallel** (`## Research sub-agents`) — one turn, parallel tool calls.
   Each gets the sanitized problem statement embedded directly; none read prd Solution/Implementation,
   ADRs, acceptance, plan, or tickets.
3. **Wait for all sub-agents to return** — no partial synthesis (whichever finishes first would bias the
   doc).
4. Run the **objectivity self-check** (`## Objectivity self-check`) over every sub-agent output.
5. Synthesize into `docs/features/<slug>/research.md` using the template in `## Output template`.
6. Announce: `Research complete for <slug>: <N> files mapped, <M> open items. Ready for plan-breakdown.`

## Research sub-agents (dispatch in parallel)

Dispatch one sub-agent per topic in a **single turn with parallel tool calls** (READ sub-agents may
parallelize freely; the orchestrator's parallel-dispatch discipline applies — see `## References`). Each
sub-agent's prompt embeds the sanitized problem statement, the expected output shape (its section of the
template), and the explicit instruction: **"Do not read prd Solution/Implementation, ADRs, acceptance, or
plan files. Do not make recommendations. Report only what exists."**

Typical topics for a production feature:

1. **Codebase-map agent** — Grep for files in the relevant subsystem; Read the top 5–10; map the call
   graph; chase imports and callers until the slice bottoms out. A map that stops at the first matching
   file fails the depth bar.
2. **Dependency-facts agent** — Read `package.json` / `pyproject.toml` / `go.mod`; list installed versions
   of in-domain packages. No recommendations; just what is installed today.
3. **External-API agent** — If the domain touches an external service, fetch its docs; record auth
   mechanism, rate limits, error codes, webhook shapes. Raw facts only — not "how we would call it."
4. **Prior-art agent** — Search the codebase (and, if warranted, widely-used OSS) for existing patterns
   that solve structurally similar problems; record what was found and where. Do not rank or compare.

**Model:** default each sub-agent to `sonnet` — research is searching-and-summarizing, not reasoning-heavy,
and sonnet keeps the parallel fan-out cheap without degrading fact quality. Escalate a single agent to the
most capable model only when its domain is genuinely novel (e.g., an unfamiliar API with a complex state
machine).

## Objectivity self-check

Before synthesizing, scan every sub-agent output for recommendation verbs: `should`, `recommend`,
`prefer`, `we could`, `the best option`, `ideal`. Rewrite or delete any sentence that contains one. If a
sub-agent produced a comparison or a pros/cons list, drop it and surface the raw facts underneath.
Alternatives live in the plan, not here.

## Output template

```markdown
# Research — <slug>

## Codebase map
- Files in scope: <list with paths>
- Entry points: <list>
- Call graph summary: <who calls whom, how deep>
- Existing invariants observed: <list — factual only>

## Dependency facts
- Installed packages in this domain: <name@version — what it is used for today>
- Transitive pins that matter: <list>

## External APIs
- <service>: auth=<method>, rate-limit=<N/s>, error-codes=<list>, webhook-shape=<if any>

## Prior art in the codebase
- <pattern>: used at <file:line>; shape: <one-sentence factual description>

## Open items for Plan
- <item Research could not answer — plan-breakdown or the human must resolve>
```

Sections with nothing in them go in as `_none_` — don't delete them; the shape is part of the contract.

## Rationalizations

- *"Reading the prd's Solution section will help the sub-agents focus."* No — that is exactly the
  goal-contamination this stage exists to prevent. Focus comes from the sanitized problem statement, which
  was written to be the only thing research needs.
- *"This change is small, I can skip the deep dive."* Shallow research that stops at the first matching
  file is a named failure (a real codebase attempt failed precisely because research never followed the
  dependency tree). Chase the slice until it bottoms out.
- *"I'll just note which library is better while I'm here."* A single recommendation pre-commits the plan
  to a direction. Record what exists; let `plan-breakdown` decide.
- *"I can start synthesizing while the last agent finishes."* Partial synthesis biases the doc toward
  whichever agent returned first.

## Red flags

- A sentence in `research.md` contains `should` / `recommend` / `prefer` / `we could` / `best option` /
  `ideal`.
- A pros/cons or "option A vs option B" comparison anywhere in the file.
- The parent context — or any sub-agent — has read prd Solution/Implementation, ADRs, `acceptance.md`, or
  any plan/slice.
- Sub-agents dispatched serially, or synthesis started before all returned.
- A codebase map that stops at the first matching file (no import/caller chasing).

## Verification (ending criteria)

Done when ALL hold:

- `docs/features/<slug>/research.md` exists with all five stable sections present (empty → `_none_`).
- Objectivity self-check passed: zero recommendation verbs, zero comparisons.
- Every claim is verifiable against the codebase or external docs — no opinion, no design.
- The announce line was emitted.

## Outputs & handoff contract

- **Output path:** `docs/features/<slug>/research.md`.
- **Consumer:** `plan-breakdown` (THE planner) grounds its concrete plan (real files, line-steps, exact
  tests) on this factual map; the `codebase-design` / `api-design` referenced disciplines read it too.
- **Stable sections the consumer depends on:** `## Codebase map`, `## Dependency facts`, `## External
  APIs`, `## Prior art in the codebase`, `## Open items for Plan`. Empty sections stay as `_none_` — the
  shape is the contract. **If you change the output shape, update `plan-breakdown` in the same commit.**
- **STATE.md:** the feature stays in `plan` (Plan is human-led and in progress); record `research.md`
  under the feature's `origin:` / artifacts. **No slice rows yet** — slices are born from `plan-breakdown`.

## References

- Parallel-dispatch discipline (one turn, parallel calls; READ sub-agents parallelize freely; one writer
  per file): the `orchestrator` skill + `~/.claude/rules/parallelism.md` (mech b/f).
- Fresh-subagent-per-task discipline (the controller curates exactly what each sub-agent needs; the
  sub-agent inherits nothing): `superpowers:subagent-driven-development`.
