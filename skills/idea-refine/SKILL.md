---
name: idea-refine
description: Open a half-formed idea into options and converge on one — variations to react to, what each bets on, an explicit Not Doing list. Run it to ideate, to stress-test an idea, or before a spec gets written off the first thing said. Refines intent.md in place. Not interview-me's extraction, not spec-grilling's how.
---

# Idea Refine

## Purpose

**Stage: Ideate.** Principles 1, 5, 6, 10.

Widens a soft idea into options and converges on one: variations to react to, what each bets on, an
explicit Not Doing list. Refines `docs/features/<slug>/intent.md` in place, so Spec reads one sharper
artifact rather than two. The first direction named is rarely the best.

## When to use / when to skip

- An idea is real but still soft: one direction named, nothing ruled out, no second ever drawn.
- The idea has a know-it-when-I-see-it surface nobody settles in prose.
- Skip a mechanical change, where refining costs more than the change.
- Near-miss, nobody has said who it is for or why now: `interview-me`, which writes this `intent.md` first.
- Near-miss, the idea is already sharp and agreed, or only the how is open: `spec-grilling`.
- Near-miss, a decision already taken, to be cross-examined rather than widened: `doubt-driven-development`.

## Inputs

- `docs/features/<slug>/intent.md` — helps: sections a person already confirmed · without it: build them
  from the raw idea and the repository, each unread section marked `derived`
- **A person reacting to options** — helps: their pick makes a direction confirmed, not recommended ·
  without it: grade on paper, write `status: derived`, and name under `## Success` the reaction that
  would settle it
- **The raw idea in the prompt** — helps: it is the material · without it: nothing to refine — say so
  and route to `interview-me`, which extracts the idea first
- The repository, prior art and `CONTEXT.md` — helps: variations grounded in what exists, under fixed
  terms · without it: the domain and the person's own words

## Process

1. **Read any existing `intent.md` first and sharpen it in place.** Gauge domain fluency — ask, or read
   it off the prompt's vocabulary — then compress where it is fluent and invest where the ignorance is.

2. **Restate the idea as one "How might we…" line** that names the problem, not a solution.

3. **At most three questions, and only where the answer changes the shape** — who this is for, what
   success looks like. With nobody answering, both come off the prompt and the repository marked
   `derived`.

4. **Diverge to five to eight variations, each with a reason it exists** — lenses in
   [frameworks](references/frameworks.md); take the ones that fit. Inside a codebase, grep and read
   before inventing.

5. **Render what taste decides; describe what argument decides.** Where the surface is one people know
   on sight, build three or four deliberately unalike throwaway probes ([reactable
   options](../../references/finding-unknowns.md)) and delete them before the handoff.

6. **Cluster, grade, and name the bet.** Fold what resonated into two or three directions differing in
   kind, not degree, and rank them by the rubric in
   [refinement criteria](references/refinement-criteria.md). Per direction name the bet, what would kill
   it, and what you are ignoring; say which is weak, and why.

7. **Scope the recommendation to one job**, riskiest assumption first, and write down what got cut and
   why.

8. **Write `intent.md` in place, then hand it to Spec** — once the person picks, or on the derived path
   with the recommendation and `status: derived`. The handoff carries the chosen direction and its open
   assumptions, not the options that lost.

## Rationalizations

- *"Twenty options is more thorough."* → twenty shallow variations are one idea in twenty costumes.
- *"I can describe the layout."* → a paragraph about a clean layout surfaces nothing a mock-up draws in one line.
- *"They liked all three."* → a partner who likes every direction has told you nothing.
- *"The assumptions are obvious."* → an unnamed bet is the one that kills the idea after code exists.
- *"Who it's for is obvious."* → an idea dissolves on a user nobody named.
- *"Nobody is here to react, so I'll wait."* → an unattended pass is the ordinary case; it ends `derived`.

## Red flags

- Twenty shallow variations, or a single direction.
- A taste-bearing surface argued in prose.
- A recommendation with no bet named.
- An empty Not Doing list.
- A second one-pager, or a surviving probe file.
- "Everyone" where a nameable person belongs.

## Verification

- [ ] `intent.md` holds its six headings in order, sharpened rather than replaced, out-of-scope filled.
- [ ] A "How might we" line names the problem, and the user is a nameable person or segment.
- [ ] Five to eight variations were folded into two or more graded directions, the recommended one
      stating its bet, its killer and what it ignores.
- [ ] Every taste-bearing variation was rendered and reacted to, or its absence is an open question
      under `## Constraints`; no probe file survived.
- [ ] `status:` reads `signed` behind an explicit pick, or `derived` with each unread section marked.
- [ ] No `STATE.md` row was written, and the measured count is reported against the cap.

## Outputs & handoff

- `docs/features/<slug>/intent.md` — cap **600 words**. `# Intent — <slug>`, a `status:` line, then
  `## Outcome` · `## User` · `## Why` · `## Success` · `## Constraints` · `## Out-of-scope` — the
  "Not Doing" list, glossed here and never in the heading — in that order; `## Success` carries the
  observable signal and the must-be-true assumptions with a test each, `## Constraints` the real limits
  and the open questions. Refine it in place, never a second one-pager, opening a materially changed
  file with a `refined: <what moved>` line; cut an over-cap draft rather than hand it on.
- The step-5 probes are throwaway; `intent.md` is the only durable file this skill leaves.
- No `STATE.md` row and no feature block — a skill called by hand opens no board
  ([state schema](../../references/state-schema.md)).
- Returns: the how-might-we line, the variations with their reasons, the graded directions with their
  bets, and the measured length against the cap. No verdict — Ideate ends at a sharper intent.
