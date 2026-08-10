---
name: codebase-research
description: Map the codebase/DB exactly as it is today — a goal-blind, fact-only survey produced by parallel read sub-agents that never see the design — BEFORE any design decision is made. Use this the moment Spec starts, after intent.md is signed and before spec-grilling opens the decision tree; also whenever someone says "research the codebase," "do the codebase dive," or is tempted to decide against a guess about how the code works. Run it again in Plan only against a gap you can name. Skip it and the ADRs get decided against recollection.
---

# research — Spec stage (goal-blind codebase map)

## Purpose

Stage: **Spec** (first skill; runs after intent is signed, before `spec-grilling`). Produce one file —
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
   the map stays objective. At the head of Spec that fence has nothing to hold back — none of those
   documents exist yet — so the blindness comes from the ordering rather than from discipline.

## When to use / when to skip

**Use** at the head of Spec, after `intent.md` is signed and before `spec-grilling` opens the decision
tree or writes a single ADR. Trigger words: "research the codebase," "do the codebase dive," or moving a
feature from Ideate into Spec.

**Also in Plan — but only against a named gap.** Say what you are looking for and why the Spec-stage
survey did not cover it, and keep that statement with the work. Plan legitimately needs ground Spec had no
reason to record: the exact prior art a slice will extend, the line ranges a step will edit — a real
gap names itself in one sentence. A repeat survey that names no gap is refused; `plan-breakdown` reads the
`research.md` that already exists. Without that clause "run it again" quietly becomes the default and the
suite is back to surveying the same repository twice.

**Skip** only a true greenfield repo with no relevant prior code — write `## Prior art in the codebase`
as `_none_ — greenfield` and let `spec-grilling` proceed. Do **not** skip because the change "looks
small": shallow research that stops at the first matching file is the named failure mode that sinks plans.

## Inputs

Resolve the one required input in this order; refuse-to-run (naming the missing input) if none resolve:

1. **Sanitized problem statement** — one paragraph describing the user-facing outcome with implementation
   direction stripped. "Users need to reset their password via email" is fine; "Add a `/reset` route that
   calls `sendResetEmail()` via SendGrid" is not — it leaks design.
   - **(a)** inline in the invocation prompt, OR
   - **(b)** derived from `docs/features/<slug>/intent.md` by reading **Outcome · User · Success ·
     Out-of-scope** *only*, then compressing them into one user-facing paragraph with any solution verbs,
     package names, route names, and file paths stripped. This is the head-of-Spec default: `intent.md` is
     the WHAT, which is already the shape a sanitized problem statement wants, and at that point it is the
     only thing written. OR
   - **(c)** on a Plan-stage second pass, **the named gap itself** — what you are looking for and why the
     Spec-stage survey did not cover it. No gap, no second pass.

**Objectivity fence — disallowed in the research context** (the house equivalent of cr's "read only the
goal line"): the prd's `## Solution` / `## Implementation Decisions` / `## Testing Decisions` sections;
ADRs and `design.md`; `acceptance.md`; any `plan.md` or slices; prior conversation history. The **parent
context must not read these before dispatch** — reading them here contaminates every sub-agent prompt you
assemble, and the goal-contamination you split this stage out to prevent comes right back.

**At the head of Spec that fence is empty by construction.** There is no ADR, no prd `## Solution`, no
signed acceptance contract to fence off — they have not been written yet — so goal-blindness here is
structural rather than maintained. The fence earns its keep on a Plan-stage second pass, when all of that
substrate is real and you are working next to it.

## Process

1. Resolve the sanitized problem statement per `## Inputs`. Refuse-to-run if it cannot be resolved. If this
   is a second pass in Plan, the **named gap is** the statement — refuse-to-run if the invocation cannot say
   what the Spec-stage survey missed, and write the gap into the doc so the reason survives the run.
2. **Dispatch research sub-agents in parallel** (`## Research sub-agents`) — one turn, parallel tool calls.
   Each gets the sanitized problem statement embedded directly; none read prd Solution/Implementation,
   ADRs, acceptance, plan, or tickets.
3. **Wait for all sub-agents to return** — no partial synthesis (whichever finishes first would bias the
   doc).
4. Run the **objectivity self-check** (`## Objectivity self-check`) over every sub-agent output.
5. Synthesize into `docs/features/<slug>/research.md` using the template in `## Output template`.
6. Announce: `Research complete for <slug>: <N> files mapped, <M> open items. Ready for spec-grilling.`
   On a Plan-stage second pass, name the gap in the line and end it `Ready for plan-breakdown.`

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
5. **Structural-facts agent** — Count the adapters behind each seam (an interface with more than one
   implementation under it); note the boundaries the module layout already draws; read two or three
   shipped handlers for the error envelope, pagination and versioning in use.

**Model:** default each sub-agent to `sonnet` — research is searching-and-summarizing, not reasoning-heavy,
and sonnet keeps the parallel fan-out cheap without degrading fact quality. Escalate a single agent to the
most capable model only when its domain is genuinely novel (e.g., an unfamiliar API with a complex state
machine).

## Objectivity self-check

Before synthesizing, scan every sub-agent output for recommendation verbs: `should`, `recommend`,
`prefer`, `we could`, `the best option`, `ideal`. Rewrite or delete any sentence that contains one. If a
sub-agent produced a comparison or a pros/cons list, drop it and surface the raw facts underneath.
Alternatives are weighed downstream, not here.

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

## Structural facts
- Seams: <name — what it abstracts; <N> adapters today>
- Module boundaries: <what the code already separates, and where>
- Conventions in use: <error envelope · pagination · versioning — at <file:line>>

## Open items for Plan
- <item Research could not answer — spec-grilling, plan-breakdown or the human resolves it>
```

Sections with nothing in them go in as `_none_` — don't delete them; the shape is part of the contract.

`## Structural facts` records conventions **in use**, never what a new surface would match or fork:
naming a surface that does not exist yet is exactly what would make the survey goal-aware. It is what a
**proposed** structural variant stands on during `spec-grilling` — without it, `api-design`'s promise that
a new interface matches the conventions in use rather than forking a second style has nothing to read.

`research.md`'s `## Open items for Plan` keeps its name. A structural item it raises belongs to
`spec-grilling`'s structural branch, not to Plan — the section is named for the consumer that has always
read it, and renaming a stable section means updating every consumer in the same commit for no gain.

## Rationalizations

- *"Reading the prd's Solution section will help the sub-agents focus."* No — that is exactly the
  goal-contamination this stage exists to prevent. Focus comes from the sanitized problem statement, which
  was written to be the only thing research needs.
- *"Let the design settle first, then survey what it actually touches."* That is the ordering this skill
  moved to fix. A survey scoped by a decision can only confirm it; the decision points nobody thought of
  are exactly what a survey run *before* the design is for, and ADRs are the costliest artifact to revise.
- *"Plan needs facts, so re-run the whole survey."* A second pass is permitted, not automatic. Name the
  gap or read the `research.md` you already have — an unnamed re-run is how one survey becomes two.
- *"This change is small, I can skip the deep dive."* Shallow research that stops at the first matching
  file is a named failure (a real codebase attempt failed precisely because research never followed the
  dependency tree). Chase the slice until it bottoms out.
- *"I'll just note which library is better while I'm here."* A single recommendation pre-commits the plan
  to a direction. Record what exists; `spec-grilling` and `plan-breakdown` decide.
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
- A second pass running in Plan with no gap stated, or a gap so broad ("get more context") that it would
  justify re-surveying anything.
- The survey being reached for *after* `spec-grilling` has started writing ADRs.

## Verification (ending criteria)

Done when ALL hold:

- `docs/features/<slug>/research.md` exists with all six stable sections present (empty → `_none_`).
- Objectivity self-check passed: zero recommendation verbs, zero comparisons.
- Every claim is verifiable against the codebase or external docs — no opinion, no design.
- The announce line was emitted.

## Outputs & handoff contract

- **Output path:** `docs/features/<slug>/research.md`.
- **Consumers, in order:** `spec-grilling` reads it before it opens the decision tree — it refuses to run
  without this file, because the blind-spot pass can only scan territory somebody has surveyed. Then
  `plan-breakdown` (THE planner) grounds its concrete plan (real files, line-steps, exact tests) on the
  same map, without re-surveying. The `codebase-design` / `api-design` referenced disciplines read it in
  both stages — to propose a structural variant in Spec, to pin the interface into `plan.md` in Plan.
- **Stable sections the consumers depend on:** `## Codebase map`, `## Dependency facts`, `## External
  APIs`, `## Prior art in the codebase`, `## Structural facts`, `## Open items for Plan`. Empty sections
  stay as `_none_` — the shape is the contract. **If you change
  the output shape, update `spec-grilling` and `plan-breakdown` in the same commit.**
- **STATE.md:** the feature stays in `spec` (Spec is human-led and in progress); record `research.md`
  under the feature's `origin:` / artifacts. **No slice rows yet** — slices are born from `plan-breakdown`.
  A Plan-stage second pass leaves the feature in `plan` and records the named gap next to the file.

## References

- Parallel-dispatch discipline (one turn, parallel calls; READ sub-agents parallelize freely; one writer
  per file): the `orchestrator` skill + `~/.claude/rules/parallelism.md` (mech b/f).
- Fresh-subagent-per-task discipline (the controller curates exactly what each sub-agent needs; the
  sub-agent inherits nothing): `superpowers:subagent-driven-development`.
