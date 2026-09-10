---
name: to-prd
description: Draft prd.md in the Spec sitting — synthesize the grilled intent and the records into the product-altitude spec the rest of the chain reads: problem, solution, exhaustive user stories, the decisions and what is out. Opening the design is `spec-grilling`'s; the Given/When/Then, `acceptance-criteria`'s.
---

# To PRD

## Purpose

**Stage: Spec.** Principles 1, 5, 6, 9.

Turns the grilled intent and the sitting's records into `docs/features/<slug>/prd.md` — one document
at one altitude for two readers: the product reader (Problem · Solution · User Stories) and the
builder (Implementation · Testing · Out of Scope). Every later stage opens it. It synthesizes; the
deciding happened in the sitting.

## When to use / when to skip

- Someone asks for a PRD, a product spec, or the write-up the planner takes from here.
- Not this: opening the design — `spec-grilling` owns it, and re-entering it here is how one sitting
  becomes three.
- Not this: the Given/When/Then (`acceptance-criteria`), the component shape (`architecture-design`),
  what a run needs from outside (`environment-manifest`).
- Not this: slices, file names, signatures — `plan-breakdown` works an altitude below.
- Not this: a pure refactor with no product-observable change; there is nothing to spec.

## Inputs

- `docs/features/<slug>/intent.md` — helps: Outcome · User · Why · Success · Constraints ·
  Out-of-scope — these shape Problem, give each story its benefit clause, and fill Out of Scope ·
  without it: read the prompt and the repository as the intent, marking what you reconstruct `derived`
- `docs/adr/` — helps: each mechanism's reasoning, so a decision cites an id instead of re-arguing it
  · without it: put the decision plainly, say it rests on no record, mark it `derived`
- `CONTEXT.md`'s `## Glossary` — helps: the domain's one word per thing, verbatim · without it: take
  the words the codebase uses and coin none
- `docs/features/<slug>/research.md` — helps: the behaviour the user lives with today · without it:
  walk the entry points and one shipped path, marked `derived`
- a **design reference**, where the feature has a look — a link or exported screens plus their named
  states · helps: this file points at it, Verify grades each state · without it: name the states the
  stories need and record that none exists

Inside the sitting these are the conversation just had. Where a gap changes which stories exist, put
the question back into the sitting — with a person there, at most three.

## Process

1. **Read the intent, the records and the glossary; re-derive none of it.** Take every domain term
   verbatim. Ground today's behaviour in the codebase and go no further — a path harvested here
   cannot enter the file anyway.

2. **Write Problem and Solution from the user's side** — today as they experience it, then what
   changes for them, both in the glossary's words.

3. **Enumerate the user stories until the list is exhaustive**, numbered, each `As an <actor>, I want
   <feature>, so that <benefit>`. Cover every actor and every path: the error paths, the empty case,
   the administrator, the second time someone does it.

4. **State each decision at product altitude, its reasoning cited by id** — "email is the reset
   channel", "a link expires after an hour", the argument left in its record as `see ADR-007`. Point
   at the design reference and its states rather than describing a screen, and carry the intent's
   Not-Doing list into Out of Scope along with whatever else the sitting ruled out.

5. **Name the behavioural seams the feature will be proven at** — a public HTTP surface, a module's
   public interface, a command's contract — preferring an existing one and the highest that works,
   since one is ideal; prior art by description. With a person there, check the seams read as they
   expect; with nobody there, take the highest existing seam and log the reason
   ([`state-schema.md`](../../references/state-schema.md)).

6. **Run the altitude gate as a command** — a read-through check stops happening by the third draft
   (principle 9):

   ```bash
   grep -nE '(\b[a-zA-Z0-9_]+/[a-zA-Z0-9_]+|\.[tj]sx?\b|\.py\b|function |def |=> |: [A-Z][a-zA-Z]+<)' docs/features/<slug>/prd.md
   grep -oE 'ADR-[0-9]+' docs/features/<slug>/prd.md | sort -u   # each one a file in docs/adr/
   ```

   Empty output is the pass. Fix a hit by moving the detail into the record or the plan that owns it,
   never by rewording it past the grep.

7. **Measure with `wc -w` and report the number** against the 800-word cap. Over cap, cut prose
   rather than a story — a thinned list reads exactly like a full one.

8. **Leave it unsigned.** `acceptance-criteria` and `environment-manifest` draft next,
   `architecture-design` last; `spec-review` fixes the bundle code-cold, and the person signs it all
   in one act.

## Rationalizations

- "One quick question and I can write this properly." → the sitting is one pass; a question put back
  into the sitting costs a turn, and reopening the design costs a stage.
- "'Recovery code' reads better than the glossary's word." → one thing with two names, and no reader
  downstream can tell they are the same thing.
- "The ADR is terse — re-explaining it saves the builder a hop." → a second copy of one argument, and
  the two diverge with neither being edited.
- "The handler signature would help whoever implements it." → it goes stale where the code moves, and
  this copy is the one nobody updates.
- "The story list is long enough." → `acceptance-criteria` writes a scenario for a behaviour a story
  names and for no other; a thin list is where the feature silently narrows.

## Red flags

- A `/` path segment, a file extension, a signature or a fenced schema in the file.
- A `see ADR-NNN` that resolves to no file under `docs/adr/`.
- A domain term that appears nowhere in `CONTEXT.md`'s glossary.
- A record's reasoning re-argued beside its id.
- A question asked to settle a decision rather than to confirm a seam.
- A story list that stops at the happy path.

## Verification

- [ ] `docs/features/<slug>/prd.md` carries the six stable headings in order, unsigned.
- [ ] Every actor and path the intent names has a numbered story in `As an <actor>, I want <feature>,
      so that <benefit>` form.
- [ ] Both greps came back empty, and every `ADR-NNN` resolves to a file under `docs/adr/`.
- [ ] Every domain term matches `CONTEXT.md` verbatim, and no record's reasoning is restated.
- [ ] A feature with a look names its design reference and that reference's states, or records that
      none exists.
- [ ] The measured `wc -w` is reported against the cap, and every reconstructed value is marked
      `derived`.

## Outputs & handoff

`docs/features/<slug>/prd.md` — cap **800 words**, measured with `wc -w` and reported; an over-cap
draft is handed on as over cap, never as one that fit. These headings, in this order, since
downstream skills read the file by them:

```markdown
## Problem      — what the user lives with today, in their words and the glossary's
## Solution     — what changes for them, at that altitude
## User Stories — numbered, each `As an <actor>, I want <feature>, so that <benefit>`
## Implementation Decisions — product-observable behaviour plainly (the channel, the expiry, the
                thing the user watches happen); the capabilities by name, never a path; schema intent
                and API contract in prose; reasoning as `see ADR-007`; the design reference and its
                named states
## Testing Decisions — observable behaviour only, never an implementation detail; the seams
                this is proven at, and prior art by description
## Out of Scope — what is not being built, from the intent's Not-Doing list and from the sitting
## Further Notes — optional, and last
```

Rename a heading and its readers change in the same commit: `acceptance-criteria`,
`plan-breakdown`, `environment-manifest` and `pull-request` open this file by these names, as do the
skills that design and survey against it.

No file path, signature, schema-as-code, table or column name, or library internal: this file is the
narrow interface the chain shares, and the depth sits in the records and later in `plan.md`.

Publish it nowhere else — no tracker to mirror into, and no board row written here
([`state-schema.md`](../../references/state-schema.md): a skill called by hand writes no row).

`docs/session-log.md` — one appended entry, cap 60 words, for a seam or a decision taken here with
nobody in the sitting.

In conversation: the path written, the measured count against the cap, whatever is marked `derived`,
and the seams named.
