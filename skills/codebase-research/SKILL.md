---
name: codebase-research
description: Map the codebase/DB exactly as it is today — a goal-blind, fact-only survey produced by parallel read sub-agents that never see the design, each persisting its own findings to docs/features/<slug>/research/ — BEFORE any design decision is made. Use this the moment Spec starts, after intent.md is signed and before spec-grilling opens the decision tree; also whenever someone says "research the codebase," "do the codebase dive," or is tempted to decide against a guess about how the code works. Run it AGAIN at the head of Plan, before plan-breakdown cuts slices — the goal-blind Spec survey mapped what the intent implied, and the signed decisions now point at code it had no reason to open. Skip either pass and the ADRs or the slices get decided against recollection.
---

# research — the codebase map (goal-blind)

## Purpose

Stage: **Spec** (pass 1) + **Plan** (pass 2) — first skill in each. Pass 1 runs after intent is signed,
before `spec-grilling`; pass 2 runs before `plan-breakdown` cuts slices. Produce a **fact-only
description of how the relevant code works today** — call graphs, data shapes, external-API behavior,
installed packages, prior art already present — in two places: one file per sub-agent under
`docs/features/<slug>/research/`, holding what that agent actually found, and
`docs/features/<slug>/research.md`, the compression of them that every consumer reads first. It is NOT a design, a recommendation, or a comparison of options. If a sentence could be argued
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

**Use again at the head of Plan**, after the Spec gate and before `plan-breakdown` writes a slice. This
pass is expected, not exceptional. The reason is structural: pass 1 is goal-blind by construction, so it
maps the territory the *intent* implies — and then `spec-grilling` picks a direction, which points at code
the first survey had no reason to open. The adapter the chosen approach plugs into, the migration path the
ADR assumed, the line ranges a step will edit: Plan needs ground truth about the aspect the decisions
selected, and asking for it after the decisions exist is the only moment it can be asked.

**Scope pass 2 to that aspect, and say which one.** Name what the signed decisions now point at — one
sentence, kept with the work. Scoping is not permission-seeking; it is what keeps the pass from re-walking
ground `research.md` already maps. Re-surveying what pass 1 covered is refused: `plan-breakdown` reads the
file that exists for anything already in it. The rule is *a different aspect, not a second opinion* — and
the `## Walked` section of each pass-1 axis file is what makes that judgeable, because it records what was
searched rather than only what was found.

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
   - **(c)** on the Plan-stage pass, **the aspect the signed decisions point at** — stated as a
     user-facing outcome the same way, naming what pass 1 had no reason to cover. The ADRs supply the
     scope; they do not enter the sub-agent prompts.

**Objectivity fence — disallowed in the research context** (the house equivalent of cr's "read only the
goal line"): the prd's `## Solution` / `## Implementation Decisions` / `## Testing Decisions` sections;
ADRs and `design.md`; `acceptance.md`; any `plan.md` or slices; prior conversation history. The **parent
context must not read these before dispatch** — reading them here contaminates every sub-agent prompt you
assemble, and the goal-contamination you split this stage out to prevent comes right back.

**At the head of Spec that fence is empty by construction.** There is no ADR, no prd `## Solution`, no
signed acceptance contract to fence off — they have not been written yet — so goal-blindness here is
structural rather than maintained. **The fence earns its keep on the Plan-stage pass**, when all of that
substrate is real and you are standing next to it. That pass is scoped *by* the decisions and still
blind *to* them: you read the ADRs to choose which aspect to survey, then hand the sub-agents a sanitized
statement of that aspect and nothing else. A sub-agent that knows which approach won will find support
for it, which is the contamination the split exists to prevent — and it does not stop being contamination
because the decision is now signed.

## Process

1. Resolve the sanitized problem statement per `## Inputs`. Refuse-to-run if it cannot be resolved. On the
   Plan-stage pass, the **named aspect is** the statement — write it into the doc so the scope survives the
   run, and refuse-to-run if the invocation cannot say which aspect it is surveying.
2. **Create `docs/features/<slug>/research/`** — the folder each sub-agent writes its own findings into.
3. **Dispatch research sub-agents in parallel** (`## Research sub-agents`) — one turn, parallel tool calls.
   Each gets the sanitized problem statement embedded directly, plus **the path of the one file it owns**;
   none read prd Solution/Implementation, ADRs, acceptance, plan, or tickets. **One agent, one file, no
   shared writes** — the parallel-dispatch discipline in `## References` is the reason.
4. **Wait for all sub-agents to return** — no partial synthesis (whichever finishes first would bias the
   doc). Each returns only its headline; its findings are already on disk.
5. Run the **objectivity self-check** (`## Objectivity self-check`) over every file in the folder.
6. Synthesize into `docs/features/<slug>/research.md` using the template in `## Output template`, reading
   the axis files rather than the sub-agents' replies — the file is what survives a `/clear`. **The
   Plan pass appends `## Plan pass — <aspect>` and writes its findings there; it never rewrites the six
   stable sections above.** A re-plan appends a section for its own aspect, so a feature planned twice
   carries two; surveying an aspect that already has a section replaces that one section and nothing else. Pass 1's map is what `spec-grilling` decided against and what the Spec gate
   signed over. Regenerating it from one narrow aspect destroys it silently — the six sections would still
   all be present, so the Verification criterion below would pass on the file that just erased its own
   input, and `plan-breakdown` would plan against a survey of one adapter.
7. Announce: `Research complete for <slug>: <N> files mapped, <M> open items. Ready for spec-grilling.`
   On the Plan-stage pass, name the aspect in the line and end it `Ready for plan-breakdown.`

**The folder is the primary record; `research.md` is the compression of it.** A survey that exists only
as five sub-agent replies in one context is gone the moment that context ends, and what `research.md`
keeps is roughly a tenth of what the agents found — the chased call graph, the file-by-file citations and
the dead ends do not survive synthesis. Writing them down first costs nothing and is what lets the Plan
pass, a reviewer, or a fresh agent check a claim instead of re-running the survey.

## Research sub-agents (dispatch in parallel)

Dispatch one sub-agent per topic in a **single turn with parallel tool calls** (READ sub-agents may
parallelize freely; the orchestrator's parallel-dispatch discipline applies — see `## References`). Each
sub-agent's prompt embeds the sanitized problem statement, **the path of the file it owns**, the expected
output shape (`### The shape of an axis file`), and the explicit instruction: **"Write your findings to
that file before you reply. Return only your headline. Do not read prd Solution/Implementation, ADRs,
acceptance, or plan files. Do not make recommendations. Report only what exists."**

Typical topics for a production feature — one file each, under `docs/features/<slug>/research/`:

1. **Codebase-map agent** → `codebase-map.md`. Grep for files in the relevant subsystem; Read the top
   5–10; map the call graph; chase imports and callers until the slice bottoms out. A map that stops at
   the first matching file fails the depth bar.
2. **Dependency-facts agent** → `dependency-facts.md`. Read `package.json` / `pyproject.toml` / `go.mod`;
   list installed versions of in-domain packages. No recommendations; just what is installed today.
3. **External-API agent** → `external-apis.md`. If the domain touches an external service, fetch its docs;
   record auth mechanism, rate limits, error codes, webhook shapes. Raw facts only — not "how we would
   call it."
4. **Prior-art agent** → `prior-art.md`. Search the codebase (and, if warranted, widely-used OSS) for
   existing patterns that solve structurally similar problems; record what was found and where. Do not
   rank or compare.
5. **Structural-facts agent** → `structural-facts.md`. Count the adapters behind each seam (an interface
   with more than one implementation under it); note the boundaries the module layout already draws; read
   two or three shipped handlers for the error envelope, pagination and versioning in use.

A task's own facts may add an axis — a migration history, a permissions model, a message-queue topology.
Add the file, name it for the axis, and keep the shape. Below four files the survey is not a survey;
above eight nobody reads it.

**Model:** default each sub-agent to `sonnet` — research is searching-and-summarizing, not reasoning-heavy,
and sonnet keeps the parallel fan-out cheap without degrading fact quality. Escalate a single agent to the
most capable model only when its domain is genuinely novel (e.g., an unfamiliar API with a complex state
machine).

### The shape of an axis file

Every sub-agent writes exactly this, so eight of them stay readable and so the synthesis step has a
uniform thing to read:

```markdown
# <Axis> — <slug>

_Sanitized statement: <the one paragraph this agent was given>_

## Headline
One sentence: the single fact that most changes how someone decides against this axis. This is the
only thing the agent returns to the parent.

## Facts
- <claim> — `path/to/file.ts:120-134`
- <claim> — `path/to/other.py:44`

## Walked
- <the paths, globs and call chains actually followed, including the ones that turned up nothing>

## Open
- <question this axis could not answer>
```

Sections with nothing in them stay, holding `_none_` — the shape is the contract.

**`## Walked` is what makes the Plan pass cheap.** Scoping pass 2 to "a different aspect, not a second
opinion" is a judgement nobody can make from a synthesized summary, because the summary records what was
*found* and not what was *searched*. A dead end costs as much to walk the second time as the first.

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

## Plan pass — <aspect the signed decisions point at>   <!-- appended by pass 2; pass 1 omits it -->
- <finding — same factual register; the six sections above are pass 1's and stay as they were>
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
- *"Spec already surveyed the repo, so Plan can just read `research.md`."* Read it for what it covers —
  and it cannot cover the aspect the decisions selected, because it ran before they existed. That is the
  Plan pass's whole subject. The opposite error is re-running the same five agents over the same ground:
  scope the pass to the new aspect and the file you already have keeps its value.
- *"This change is small, I can skip the deep dive."* Shallow research that stops at the first matching
  file is a named failure (a real codebase attempt failed precisely because research never followed the
  dependency tree). Chase the slice until it bottoms out.
- *"I'll just note which library is better while I'm here."* A single recommendation pre-commits the plan
  to a direction. Record what exists; `spec-grilling` and `plan-breakdown` decide.
- *"I can start synthesizing while the last agent finishes."* Partial synthesis biases the doc toward
  whichever agent returned first.
- *"The agents reported back to me, so the findings are captured — writing files first is bookkeeping."*
  They are captured in one context, which ends. `research.md` keeps the compression, not the evidence:
  the chased call graph, the per-file citations and the dead ends are exactly what synthesis drops, and
  they are exactly what the Plan pass and any reviewer need. Write the file, then synthesize from it.
- *"Two agents both found things about the data layer, so let them share `codebase-map.md`."* One agent,
  one file. Two writers on one path is the race this suite refuses everywhere else, and it is not safer
  here for being read-only work.

## Red flags

- A sentence in `research.md` contains `should` / `recommend` / `prefer` / `we could` / `best option` /
  `ideal`.
- A pros/cons or "option A vs option B" comparison anywhere in the file.
- The parent context — or any sub-agent — has read prd Solution/Implementation, ADRs, `acceptance.md`, or
  any plan/slice.
- Sub-agents dispatched serially, or synthesis started before all returned.
- A sub-agent that returned its findings in its reply and wrote no file — or two sub-agents pointed at
  the same path.
- `research.md` written from the sub-agents' replies rather than from the files in `research/`.
- A fact in an axis file with no `path:line` behind it.
- A codebase map that stops at the first matching file (no import/caller chasing).
- The Plan pass running with no aspect stated, or one so broad ("get more context") that it would justify
  re-surveying anything.
- The Plan pass re-walking ground `research.md` already maps, instead of the aspect the decisions selected.
- Sub-agent prompts on the Plan pass carrying the chosen approach, the winning ADR, or the prd's
  `## Solution` — scoped by the decisions is not the same as told about them.
- The survey being reached for *after* `spec-grilling` has started writing ADRs.

## Verification (ending criteria)

Done when ALL hold:

- `docs/features/<slug>/research/` holds one file per sub-agent dispatched — between four and eight —
  each carrying all four headings, empty ones as `_none_`, and every fact citing a `path:line` a reader
  can open. Every `## Walked` is non-empty: an agent that recorded nothing it walked cannot tell a later
  pass what is covered.
- `docs/features/<slug>/research.md` exists with all six stable sections present (empty → `_none_`), and
  names no axis file that is not in the folder.
- On the Plan pass: those six sections are unchanged from what pass 1 left, and this pass's findings sit
  under their own `## Plan pass — <aspect>` heading. A pass that rewrote them destroyed its own input.
  Pass 1's axis files are likewise untouched — pass 2 adds files, it does not edit them.
- Objectivity self-check passed: zero recommendation verbs, zero comparisons.
- Every claim is verifiable against the codebase or external docs — no opinion, no design.
- The announce line was emitted.

## Outputs & handoff contract

- **Output paths:** `docs/features/<slug>/research/<axis>.md`, one per sub-agent — the primary record,
  each written by exactly one agent and edited by nothing afterwards — and
  `docs/features/<slug>/research.md`, the synthesis every consumer below reads first.
- **Consumers, in order:** `spec-grilling` reads pass 1 before it opens the decision tree — it refuses to
  run without this file, because the blind-spot pass can only scan territory somebody has surveyed. Then
  `plan-breakdown` (THE planner) grounds its concrete plan (real files, line-steps, exact tests) on the
  map as both passes leave it. The `codebase-design` / `api-design` referenced disciplines read it in
  both stages — to propose a structural variant in Spec, to pin the interface into `plan.md` in Plan.
- **Stable sections the consumers depend on:** `## Codebase map`, `## Dependency facts`, `## External
  APIs`, `## Prior art in the codebase`, `## Structural facts`, `## Open items for Plan`. Empty sections
  stay as `_none_` — the shape is the contract. The five standard axis filenames and the four headings
  inside each are equally stable: a consumer that wants the evidence behind a synthesized line opens the
  axis file. **If you change either shape, update `spec-grilling` and `plan-breakdown` in the same
  commit.**
- **STATE.md:** on pass 1 the feature stays in `spec` (Spec is human-led and in progress); record
  `research.md` under the feature's `origin:` / artifacts. **No slice rows yet** — slices are born from
  `plan-breakdown`. The Plan-stage pass leaves the feature in `plan` and records the named aspect next to
  the file.

## References

- Parallel-dispatch discipline (one turn, parallel calls; READ sub-agents parallelize freely; one writer
  per file): the `orchestrator` skill + safety rail 5, `references/safety-rails.md`.
- Fresh-subagent-per-task discipline (the controller curates exactly what each sub-agent needs; the
  sub-agent inherits nothing): `superpowers:subagent-driven-development`.
