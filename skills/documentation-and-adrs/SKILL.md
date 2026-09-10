---
name: documentation-and-adrs
description: Record the why — the next `ADR-<NNN>` carrying each rejected alternative and the reason it lost, plus the README, changelog, API docs, doc comments and inline gotchas around it. Reach for a hard-to-reverse decision, a public surface, or a shipped behaviour needing a durable record. Grilling the decision out is `spec-grilling`'s; `architecture.md`, `architecture-design`'s.
---

# Documentation and ADRs

## Purpose

**Stage: cross-cutting.** Principles 5, 6, 7, 9.

The repository's record standard — what earns an `ADR-<NNN>`, what that record carries, and how the
README, doc comments and gotchas around it stay true. The caller supplies the decision; this supplies
the form. Code shows what was built; the record is where the reasoning that produced it survives.

## When to use / when to skip

- A decision hard to reverse, surprising without its context, and a real trade-off — three legs
  together; a choice missing one earns no record.
- An accepted record overtaken, with `docs/adr/` still reading as though it holds.
- A public surface moved — an exported signature, an HTTP route, a shipped behaviour — or a gotcha that
  has cost two people an afternoon each.
- Someone asks for "the docs" and names nothing: the repository says what is undocumented (*Inputs*).
- The same thing explained three times, or an agent re-deciding something settled.
- **Skip** obvious code, a comment that would restate it, a throwaway prototype.
- Near-misses: grilling the decision out is `spec-grilling`'s, which takes the form from here;
  `architecture.md` is `architecture-design`'s; the runbook, `shipping-and-launch`'s; the PR body,
  `pull-request`'s.

## Inputs

- **The decision, surface or feature recorded** — helps: it is the content, and this supplies only the
  form · without it: read the diff, the commits and the code for what is concrete and undocumented,
  name what you took and why, mark it `derived`
- `docs/adr/` — helps: the highest number there is your `<NNN>`, and an overtaken record is the one you
  supersede · without it: begin at `ADR-001` from the template below
- `CONTEXT.md`'s `## Glossary` — helps: the domain's words come back verbatim · without it: use the
  words the code and `intent.md` use, and coin none
- `prd.md`, `intent.md`, the touched code — helps: the constraint the decision serves, and the
  Not-Doing line a record may not quietly cross · without it: read the commits and the code, marking
  reconstructed reasoning `derived`
- With a person present, at most three questions, each where the gap changes what gets recorded.

## Process

Ordered by leverage; one job rarely touches them all.

1. Name what is being recorded, then pick the instrument: a record for a decision, an inline `why` for
   a gotcha, a doc comment for a signature, the README for running the thing, the changelog for what
   shipped, `CLAUDE.md` / `AGENTS.md` for the conventions an agent reads cold.

2. Put the decision through the three legs — hard to reverse, surprising without its context, a real
   trade-off — before writing anything: a record for a reversible choice teaches the next reader to skip
   the directory, and the one that mattered goes unread with it.

3. Take the next number from the highest already in `docs/adr/`, and write the record to the template
   below; where `docs/adr/` already uses another shape, follow the template and say so in the return.
   Records are repo-wide and sequential; a per-feature one, or one pasted into `prd.md`, leaves two
   directories of truth.

4. Write to what a stranger needs: the constraints in force, the decision, each rejected alternative
   with what it cost and why that cost lost, and what the repository now lives with. Hold it at the
   altitude of the decision — no signature, no line number, nothing that moves when the code moves.

5. Supersede an accepted record instead of editing one: flip the old `## Status` to `Superseded by
   ADR-<NNN>`, link the two both ways, and move every referrer — `prd.md`, sibling records, a PR body —
   in the same commit.

6. Comment the why, never the what: a gotcha where it bites, pointing at the record for the whole
   reason. A `TODO` for work you can do now is the work; commented-out code is git's job.

7. Document a public surface where its types are — parameters, return, what it throws, one worked
   example — and an HTTP route as OpenAPI beside it: request schema, response schemas, error codes.

8. Keep the entry doors current: the README, the changelog, and the conventions in `CLAUDE.md` or
   `AGENTS.md`, each to the shape below.

9. Keep values out of what you write — a key or connection string in a record or a README is a secret
   in the diff ([`safety-rails.md`](../../references/safety-rails.md)); name the kind and point at
   `environment.md`. Take the domain's words from `CONTEXT.md` verbatim, coining one only where the
   decision does.

## Rationalizations

- "The code is self-documenting." → Code shows what. The constraint in force and the alternative that
  lost are nowhere in it.
- "Comments get outdated." → A comment on why is stable; the one that rots restates the line beneath it.
- "I'll correct the old record, it's tidier." → An edit erases the reasoning the record existed to
  hold, and the next reader cannot tell anything is gone.
- "ADRs are overhead." → Ten minutes now against the same argument re-run six months on, by people
  without the constraints in front of them.
- "Nobody reads docs." → Agents read them cold, and re-decide whatever nothing records.
- "Nothing concrete was named." → The diff, the commits and the public surfaces name it.

## Red flags

- An architectural decision with no written rationale and nobody left who can supply one
- `## Alternatives Considered` holding names without reasons
- An accepted record corrected in place, its earlier reasoning now unreadable
- A README that cannot get a new contributor to a passing test
- `TODO`s older than the branch they were written on; commented-out code kept "just in case"
- A comment restating the line beneath it; a record carrying a file path or a line number

## Verification

- [ ] Every record written clears all three legs; nothing that failed one got a file.
- [ ] Each record's number follows the highest in `docs/adr/`, its slug is lowercase-hyphenated, its
      sections are the template's, in that order.
- [ ] Each rejected alternative names why it lost, not merely that it was rejected.
- [ ] No accepted record's body was edited; a superseded one and its successor name each other, and
      every referrer moved in the same commit.
- [ ] Terms match `CONTEXT.md` verbatim; reasoning reconstructed rather than read is marked `derived`.
- [ ] Nothing written carries a secret value, and the README describes today's code.
- [ ] Nothing was left as a `TODO` for work now doable or as commented-out code, and each public
      surface touched carries its parameters, return, what it throws and one example.
- [ ] Each capped file written is reported against its cap, an over-cap draft as over cap.

## Outputs & handoff

| Path | Cap | Shape |
|---|---|---|
| `docs/adr/ADR-<NNN>-<slug>.md` | 350 words | below — repo-wide, sequential, `<slug>` lowercase-hyphenated |
| `CONTEXT.md` (repo root) | 1,000 words | the glossary entry `spec-grilling` states; a term appended only where a decision coins it |
| `README.md` | none | what this is · quick start · a commands table · the architecture in a paragraph pointing at `docs/adr/` · contributing |
| `CHANGELOG.md` | none | a section per release: `### Added` · `### Fixed` · `### Changed`, each line in a user's words |
| doc comments, OpenAPI, inline `why` | none | at the file they document, never in a parallel document that drifts |
| `CLAUDE.md` / `AGENTS.md` | none | conventions prose only; the `## Agent skills` block is `project-setup`'s |
| `docs/session-log.md` | 60 words | one entry where a default was taken with nobody there to confirm it ([`state-schema.md`](../../references/state-schema.md)) |

```markdown
# ADR-<NNN>: <the decision, as a sentence>

## Status
Accepted   <!-- Proposed → Accepted → Superseded by ADR-<MMM>, or Deprecated -->

## Date
<YYYY-MM-DD>

## Context
The constraints in force when it was taken.

## Decision
What was chosen, present tense.

## Alternatives Considered
### <the runner-up>
- Rejected: <what it cost, and why that cost lost>

## Consequences
What the repository now lives with — what it buys, what it charges.
```

`to-prd`, `spec-review` and `pull-request` cite a record by id and open it rather than restate its
reasoning, so a renamed section moves under them in the same commit or not at all.

Returned in conversation: which instrument each surface got, what was `derived`, and each file's
measured size against its cap. No verdict, and no `STATE.md` row — this skill moves no slice, and the caller owns the
transition ([`state-schema.md`](../../references/state-schema.md)).
