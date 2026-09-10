---
name: codebase-research
description: Map the codebase as it is today — the codebase dive, before any design decision — parallel read sub-agents that never see the goal, one axis file each, compressed into research.md. Run at the head of Spec, again at the head of Plan against the signed decisions. It records what exists; spec-grilling decides, and architecture still to be built is architecture-design.
---

# research — the codebase map (goal-blind)

## Purpose

**Stage: Spec (pass 1) + Plan (pass 2).** Principles 5, 6, 10.

A fact-only map of how the relevant code works today, cut into axes and produced by parallel read
sub-agents that never see the goal. Each writes one axis file under `docs/features/<slug>/research/`;
those compress into `research.md`, which every consumer reads first. A sentence that could be argued
with is a design, not a fact, and a wrong line here cascades furthest.

## When to use / when to skip

- At the head of Spec, before `spec-grilling` opens the sitting or writes an ADR.
- Again at the head of Plan, before `plan-breakdown` cuts a slice: pass 1 mapped what the intent
  implied, and the signed decisions point at code it had no reason to open.
- Not once the sitting is writing ADRs — reading as questions arise answers only the questions you
  have — and not as a second opinion: pass 2 takes a different aspect, and `plan-breakdown` reads
  `research.md` for what is in it.
- Greenfield with no relevant prior code is the one skip: write `research.md` with its six sections,
  `## Prior art in the codebase` as `_none_ — greenfield` and the rest as `_none_`, dispatch nobody,
  then hand over. A change that merely looks small is not a skip.

## Inputs

- A sanitized problem statement — helps: the invocation gives one · without it: derive it from
  `docs/features/<slug>/intent.md`'s Outcome · User · Success · Out-of-scope, or from the prompt and the
  repository, stripped of solution verbs, package names, routes and paths, and mark it `derived`.
- The signed decisions — `docs/adr/` and `prd.md`, pass 2 only — helps: they name the aspect this pass
  surveys · without it: derive the aspect from what `research.md` leaves uncovered, and mark it `derived`.

Fenced out of every sub-agent prompt always, and out of this context before dispatch on pass 1:
`prd.md`'s `## Solution`, `## Implementation Decisions` and `## Testing Decisions`; the ADRs;
`acceptance.md`; `architecture.md`; any plan; the conversation before this one. On pass 2 you read the
decisions — that and nothing else — to pick the aspect, then hand the sub-agents that aspect alone.

## Process

1. Resolve the sanitized problem statement — one paragraph, the user-facing outcome, implementation
   direction stripped.

   ```
   yes — "Users need to reset their password from an email link."
   no  — "Add a /reset route calling sendResetEmail()."
   ```

   On pass 2 the named aspect **is** the statement; scope it to what `research.md` does not already map,
   and write it into the file so the scope outlives the run.
2. Create `docs/features/<slug>/research/`, the folder each sub-agent writes into.
3. Dispatch four to eight axis sub-agents in one turn of parallel calls — below four is not a survey,
   above eight nobody reads it. One agent owns one file and no other writes it
   ([`safety-rails.md`](../../references/safety-rails.md), *One writer per file*). Default each to
   `sonnet`, escalating only for a novel domain.
   - `codebase-map.md` — subsystem files, entry points, call graph; chase imports and callers until the
     slice bottoms out.
   - `dependency-facts.md` — what `package.json` / `pyproject.toml` / `go.mod` installs here, with versions.
   - `external-apis.md` — auth, rate limits, error codes, webhook shapes, from the service's own docs.
   - `prior-art.md` — patterns in the tree solving a structurally similar problem, and where.
   - `structural-facts.md` — adapters behind each seam (an interface with more than one implementation
     under it), counted; module boundaries; the error envelope, pagination and versioning shipped
     handlers use.
   - a further axis where the task's facts warrant one — migration history, permissions, queue topology.
4. Give each its statement, the path of its one file, the axis shape quoted verbatim from `Outputs &
   handoff`, and this instruction — *write your findings to that file before you reply, return only your
   headline, read no prd Solution, ADR, acceptance, architecture or plan file, report what exists rather
   than what to do.*
5. Wait for every agent before synthesizing.
6. Run the objectivity self-check below across every axis file.
7. Synthesize `research.md` from the files, never the replies.
8. On pass 2 append `## Plan pass — <aspect>` and write there; pass 1's six sections stay as pass 1 left
   them, since a regenerated pass 1 erases what the sitting decided against while still looking
   complete. An aspect that already has a section replaces that one; pass 2 adds axis files and edits
   none of pass 1's.
9. Report: `Research complete for <slug>: <N> files mapped, <M> open items. Ready for spec-grilling.` On
   pass 2 name the aspect and end the line `Ready for plan-breakdown.`

## Objectivity self-check

Scan every axis file for `should` · `recommend` · `prefer` · `we could` · `best option` · `ideal`, and
rewrite or delete the sentence carrying it. Drop any pros-and-cons comparison and leave the raw facts
underneath — one recommendation pre-commits a design nobody has made.

## Rationalizations

- *"The prd's Solution will help the sub-agents focus."* Focus comes from the sanitized statement; an
  agent that knows which approach won finds support for it.
- *"This change is small, the deep dive can wait."* A map stopping at the first matching file is the
  shallow survey that sinks plans.
- *"The agents reported back, so the findings are captured."* A reply lives in one context that ends; the
  call chains, citations and dead ends are what synthesis drops.
- *"Nothing stops me synthesizing while the last agent finishes."* Whichever returned first sets the frame.

## Red flags

- A recommendation verb or an options comparison surviving in `research.md` or an axis file.
- Sub-agent prompts on pass 2 carrying the winning ADR or `prd.md`'s `## Solution`.
- A fact with nothing behind it a reader can open.
- Two sub-agents pointed at one path, or one that answered in its reply and wrote no file.
- Pass 2 re-walking ground `research.md` already maps.

## Verification

- [ ] This pass wrote four to eight axis files under `research/`, each carrying `## Headline`,
      `## Facts`, `## Walked` and `## Open`, an empty one held as `_none_`.
- [ ] Every fact cites where a reader can check it — `path:line`, or the service's own doc — and no
      `## Walked` is empty.
- [ ] `research.md` carries its six stable sections and names no axis file the folder lacks.
- [ ] No recommendation verb and no options comparison survives in either file.
- [ ] On pass 2, the six sections read as pass 1 left them, the new findings sit under
      `## Plan pass — <aspect>`, and pass 1's axis files are unedited.
- [ ] Anything derived rather than read is marked `derived`, and each file's measured size was
      reported against its cap.
- [ ] The report line was emitted.

## Outputs & handoff

| Path | Cap | Shape |
|---|---|---|
| `docs/features/<slug>/research/<axis>.md` | 1,000 words | `# <Axis> — <slug>`, the sanitized statement in italics, then `## Headline` (one sentence — the single fact that most changes how someone decides against this axis; the only thing the agent returns) · `## Facts` (`<claim> — path/to/file.ts:120-134`, or the doc URL for an external service) · `## Walked` (the paths, globs and call chains actually followed, the fruitless ones included) · `## Open`; a section with nothing in it stays, holding `_none_` |
| `docs/features/<slug>/research.md` | 1,500 words | `# Research — <slug>`, then `## Codebase map` (files in scope · entry points · call graph · invariants observed) · `## Dependency facts` (name@version · pins that matter) · `## External APIs` (auth · rate limit · error codes · webhook shape) · `## Prior art in the codebase` (pattern — where) · `## Structural facts` (seams and adapter counts · module boundaries · conventions in use) · `## Open items for Plan`, in that order, an empty section held as `_none_` because a missing heading reads as an axis nobody ran; pass 2 appends `## Plan pass — <aspect>` |

`## Structural facts` records conventions in use, never what a new surface would match or fork; `## Open
items for Plan` keeps its name, and a structural item in it belongs to the sitting. Report each file's
measured size against its cap; an over-cap draft gets cut, not handed on. Changing either shape means
editing `spec-grilling` and `plan-breakdown` in the same commit — they read these headings.

Consumers: `spec-grilling`, then `plan-breakdown`; `codebase-design` and `api-design` in either stage.
Returned in conversation: the report line. No `STATE.md` row — `plan-breakdown` opens the board
([`state-schema.md`](../../references/state-schema.md)).
