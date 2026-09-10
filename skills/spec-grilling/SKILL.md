---
name: spec-grilling
description: Run the Spec sitting — grill the design one question at a time against the goal-blind survey, recording the ADRs and glossary terms as they resolve, then draft prd.md, acceptance.md, architecture.md and environment.md for one signature. Surveying the code is codebase-research's; the code-cold fix of the bundle, spec-review's.
---

# spec-grilling — the one design sitting

## Purpose

**Stage: Spec.** Principles 1, 5, 6, 7, 10.

The single Spec working session: it grills the design against the goal-blind survey, pins the terms into
`CONTEXT.md` and the durable trade-offs into `docs/adr/`, and drafts the four Spec files unsigned in the
same pass, for one signature over the bundle. One sitting rather than one skill per file, because
re-entering one design conversation from a fresh context each time is how a spec churns without deepening.

## When to use / when to skip

- A feature's design is open before any PRD exists — the terms, the mechanism, the shape of the code,
  what a consumer of its surface may depend on — or someone asks to be grilled, to stress-test a design,
  to pin the domain model, or to learn what has to be settled first.
- A hard-to-reverse decision is about to be taken in passing, with nothing written down.
- Not this: mapping the code as it stands (`codebase-research`, before the sitting opens), or fixing the
  drafted bundle code-cold (`spec-review`, once it closes).
- Not this: a refactor introducing no term and settling no trade-off (`plan-breakdown`); a framework
  question mid-build (`source-driven-development`).
- One existing term and nothing contested is a whole sitting in two questions and one glossary entry;
  padding it manufactures a record nobody can use.

## Inputs

- `docs/features/<slug>/research.md` — helps: `## Codebase map`, `## Structural facts` and `## Open items
  for Plan` are what the blind-spot pass scans and a variant stands on, and a structural item under the
  last is the sitting's, not Plan's · without it: run `codebase-research`, else walk the entry points, the
  imports and two shipped handlers, marking that `derived`.
- `docs/features/<slug>/intent.md` — helps: Outcome · User · Why · Success · Constraints · Out-of-scope
  are what the design serves · without it: read the prompt as the intent, marking what you
  reconstruct `derived`.
- `CONTEXT.md` and `docs/adr/` — helps: terms come back verbatim and no accepted decision is contradicted
  in silence · without it: coin only what this sitting pins.
- A design reference where the feature has a look — helps: a link or exported screens plus the states
  covered · without it: record that none exists (`to-prd` owns how `prd.md` names the states).

Fill a gap with at most three questions, and only where the answer changes the shape of the work — the
design questions below are the method, not a gap.

## Process

1. **Read the intent and the survey, then lay the open decisions out in dependency order** — settle the
   one others hang off first, or it gets answered twice.

2. **Grow that tree with a blind-spot pass read off the survey, not off recollection** — an invariant
   this feature would break, prior art settling a question you were about to ask, an open item somebody
   has to own. Present three to five, a line each. Ask which parts of the domain the person knows cold,
   and scan hardest where the ignorance is
   ([`finding-unknowns.md`](../../references/finding-unknowns.md)).

3. **Carry a structural branch** — an intent says what the product does, never how the code is arranged,
   so a tree grown from one is all mechanism and no shape. Three questions, each constraining the next:

   | Ask | What it tests |
   |---|---|
   | Which parts earn their existence? | `codebase-design`'s deletion test, part by part |
   | What has to be swappable, and what are the two things that swap? | a second that cannot be named is itself the answer |
   | What may a consumer of this surface depend on? | resource model, error envelope, pagination, versioning — `api-design`'s ground |

   A question is load-bearing when it is hard to reverse, surprising without context and the result of a
   real trade-off, all three cleared *before* it is answered. On one of those, dispatch `codebase-design`
   or `api-design` as fresh subagents in one message
   ([`safety-rails.md`](../../references/safety-rails.md), *One writer per file*), each producing a
   genuinely different design; present the set with your recommendation and reasoning, for the person to
   pick or amend. A set is one question, and the amendment ("C, but move the seam up") is what the record
   captures. State the rest as batched defaults, a line each, open to objection.

4. **Interview one question at a time, each carrying your recommended answer, and wait for the reply.**
   Spend a round only where the answer changes the design; an uncontested recommendation is one stated
   line. Where the codebase answers, read `research.md` and then the code rather than making the person
   recite it. With nobody there, take the recommendation as the default, give its reason in a line, land
   it where the person reviews — a record if it clears the three legs, else a row in `architecture.md`'s
   open questions — and log one `docs/session-log.md` entry
   ([`state-schema.md`](../../references/state-schema.md)).

5. **Sharpen the domain model as you grill**: challenge a term whose use has drifted from its
   `CONTEXT.md` entry, propose one canonical name for a word doing two jobs, invent the edge case forcing
   the boundary between two concepts, surface a claim the code contradicts and name the file.

6. **Capture each thing the moment it resolves, never in a batch.** Append a term to `CONTEXT.md` as it
   crystallises; write a record once the decision clears the same three legs, and none otherwise — a
   question worth three subagents is worth one, a question missing a leg is worth none. Take the template
   and the next number from `documentation-and-adrs`, hold the record to the decision, its reason and what
   it ruled out, and supersede an accepted one rather than editing it, linked both ways.

7. **Draft the four files in this same sitting**, applying each discipline in turn instead of handing the
   conversation on: `to-prd`, then `acceptance-criteria` and `environment-manifest`, then
   `architecture-design` last, whose scenario trace needs `acceptance.md`'s ids. Cite records by id, take
   glossary terms verbatim.

8. **Close the sitting** — every file unsigned, the bundle handed to `spec-review` (code-cold, fixes in
   place, writes no file), then one signature over all of it. Nothing else in Spec asks for a second.

## Rationalizations

- *"I'll put the questions in one message and save the round-trips."* A batch reads as a form and comes
  back shallow, and the dependency order goes with it.
- *"I know this codebase; I'll read as the questions come up."* That answers the questions you already
  have; the survey hands you the ones you have not thought of, before a record freezes an answer.
- *"This one is probably worth a record."* "Probably" is usually a leg missing, and a reversible or
  unsurprising choice is a batched default.
- *"Structure is `architecture-design`'s branch."* That skill reconciles decisions already taken; a
  structural question raised at its gate is answered cold, where "C, but move the seam up" has nowhere
  to go.
- *"I'll note the term once the sitting is over."* The rationale for a definition lives about ten minutes.
- *"The design belongs in the prd, all in one place."* The prd cites records by id; co-location is not
  cohesion.

## Red flags

- A second question asked before the first is answered.
- A blind-spot brief built from recollection rather than the survey's three sections.
- A tree with no structural branch on a feature that adds a part, a dependency or a surface.
- Variants fanned out on a question clearing none of the three legs, or a load-bearing one settled out of
  your own single answer.
- A record that fails a leg, or an accepted one edited in place instead of superseded.
- Implementation detail in `CONTEXT.md`, or a second `##` section holding terms.

## Verification

- [ ] `research.md` was read before the first question, and the blind-spot brief drew on it.
- [ ] Every decision in the tree is resolved, prerequisites first; each one nobody answered carries a
      default, its reason and a `docs/session-log.md` entry.
- [ ] The structural branch was carried (or the feature adds no part, dependency or surface); each
      load-bearing question went to variants, the rest to batched defaults.
- [ ] Every fuzzy or conflicting term is one canonical `CONTEXT.md` entry, or was left out as general
      programming vocabulary.
- [ ] Every decision clearing all three legs has a record in `docs/adr/`, and no record there misses a leg.
- [ ] The four drafts exist unsigned, each reported against its cap, every reconstructed value `derived`.
- [ ] `intent.md`'s Outcome and Success, re-read last, are satisfied by the design.

## Outputs & handoff

| Path | Cap | Shape |
|---|---|---|
| `docs/adr/ADR-<NNN>-<slug>.md` | 350 words | `documentation-and-adrs`' template, numbered on from the highest in `docs/adr/` |
| `CONTEXT.md` (repo root) | 1,000 words | `# <project>` above one `## Glossary` heading and its entries — below |
| `docs/features/<slug>/prd.md` | 800 words | `to-prd`'s `Outputs & handoff` |
| `docs/features/<slug>/acceptance.md` | 1,200 words | `acceptance-criteria`'s |
| `docs/features/<slug>/environment.md` | 30 rows | `environment-manifest`'s |
| `docs/features/<slug>/architecture.md` | 2,000 words | `architecture-design`'s |
| `docs/session-log.md` | 60 words an entry | [`state-schema.md`](../../references/state-schema.md) |

`CONTEXT.md` is a glossary and nothing else — no implementation detail, no decision log, no term that is
general programming vocabulary rather than this domain's. Entries sit under the single `## Glossary`
heading, clustered with `###` once clusters emerge; a second `##` holding terms leaves the next appender
no way to choose. Where no file exists, the first resolved term creates it, titled as above.

```markdown
**Draft**:
An edit the user has made that the server has not yet acknowledged.
_Avoid_: pending edit, unsaved change
```

Pick one word and demote its rivals under `_Avoid_`; say what a term **is**, never what it does; sharpen
an entry already there rather than defining it twice. Renaming a term or superseding a record means
updating its referrers in the same commit.

Returned in conversation: each file's measured size against its cap — an over-cap draft is handed on as
over cap, never as one that fit — and the unsigned bundle for `spec-review`. No `STATE.md` row: the board
is born from a sliced plan (`plan-breakdown`,
[`state-schema.md`](../../references/state-schema.md)).
