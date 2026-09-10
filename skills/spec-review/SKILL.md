---
name: spec-review
description: Run last in Spec, after the sitting closes and before the signature — code-cold: fix the draft bundle in place rather than list complaints, facts silently, judgment applied and flagged inline to revert. Writes no report. Grilling and drafting are `spec-grilling`; a code diff is `code-review`.
---

# Spec review

## Purpose

**Stage: Spec.** Principles 6, 7, 8, 10.

A code-cold pass over the drafted Spec bundle, between the sitting and the signature. It fixes the bundle
in place — facts silently, contestable calls applied and flagged inline to revert — and emits no file.
Attention is scarcest at design; a stray path or a dangling ADR id spends it on what a grep settles.

## When to use / when to skip

- The sitting has closed, the bundle is draft, nobody has signed — a fix now costs no re-signature.
- Someone wants the spec read by something that did not write it.
- Skip: grilling or drafting an artifact — `spec-grilling` runs the sitting; this pass follows it.
- Skip: a code diff or a weakened oracle — `code-review`, in Review.
- Skip: writing one decision up — `documentation-and-adrs`.
- One artifact with nothing crossing to another is one inline pass; the relational grade against
  `intent.md` is the default, and padding a trivial one out to the full bundle read manufactures nothing.

## Inputs

- `docs/features/<slug>/intent.md` — helps: what everything else is graded against · without it: take it
  from the prompt and `prd.md`'s Problem, findings marked `derived`
- `docs/features/<slug>/prd.md` — helps: the stories, the scope, the design-reference pointer · without
  it: grade `acceptance.md` against the intent, marked `derived`
- `docs/features/<slug>/acceptance.md` — helps: the scenarios coverage is measured over · without it:
  name the behaviours nothing grades, flagged in `prd.md`
- `docs/features/<slug>/architecture.md` — helps: §2's flow a scenario traces, §6 what the person answers
  · without it: say both checks had nothing to run against
- `docs/features/<slug>/environment.md` — helps: the typed rows a value or a command hides in · without
  it: nothing to strip
- `docs/adr/` and `CONTEXT.md` — helps: each `see ADR-NNN` resolves, each term is the glossary's · without
  it: a dangling id becomes a flag rather than a fix

Ask nothing, even with the person there — the inline flag is the question, left where they are already
reading.

## Process

1. **Read `intent.md` first, then the rest**, grading each artifact relationally — does it deliver what
   the intent asked for? — across placeholders, internal consistency, scope and ambiguity. Run code-cold
   in a fresh subagent (`../../references/safety-rails.md`).

2. **Sort each issue into one of the three classes below.** Two classes would force the third kind into
   one of them.

3. **Fix a decidable fact in place, then re-run the check that found it** until it comes back empty, with
   no flag against it.

4. **Apply your best correction to a contestable call and flag it inline**, in the shape under *Outputs &
   handoff*. One pass, never a loop: the person is the convergence point.

5. **Hand back the bundle itself, never a punch-list**, and with it every `ADR-NNN` it references, so
   each is opened before a signature that names none.

6. **Measure each edited file against its cap** and report the number; say when one is over rather than
   cutting a table to fit.

7. **Return `pass · concerns · block` and append one `docs/session-log.md` entry** naming what was fixed
   and what was flagged. `block` means a stop-list item (`../../references/safety-rails.md`), nothing else.

## The three classes

| Issue | Class | What you do |
|---|---|---|
| A file path, signature or library internal in `prd.md` | decidable | Strip it, leaving the ADR id that holds it. Re-check: grep for extensions, `/`, `()`. |
| `see ADR-NNN` resolving to no file in `docs/adr/` | decidable | Correct the id, or write the pointer it wanted. Re-check: cross every `ADR-\d+` against `docs/adr/`. |
| A `CONTEXT.md` glossary term used in another word's place | decidable | Normalize to the glossary term, verbatim. Re-check: each `## Glossary` term against the bundle, term by term. |
| A placeholder, `TODO` or `TBD` | decidable | Fill it from the bundle, or cut it. `architecture.md` §6 is not one. Re-check: grep for `TODO`, `TBD`, `<`. |
| A value or a command in `environment.md` | decidable | Remove it. A real credential is a stop-list item: verdict `block`, never echoed. Re-check: grep the manifest for `=` and backticks. |
| A path, signature or table name inside an `acceptance.md` scenario | decidable | Rewrite it as an observable outcome. Re-check: grep the scenarios for extensions and `()`. |
| A story, or an `intent.md` success criterion, no scenario covers | contestable | Draft the scenario; flag it. |
| A hard-to-reverse, surprising decision buried in prd prose | contestable | Propose the ADR; flag it. |
| Two independent subsystems inside one `intent.md` | contestable | Propose the split; flag it. |
| `prd.md` contradicting an ADR or `acceptance.md` | contestable | Reconcile to one side; flag the side taken. |
| A scenario tracing through no component in `architecture.md` §2 | contestable | Structure missing: draft the trace, flag it. Scenario the intruder: flag it by id, delete nothing — a deleted scenario carries no flag and guards no behaviour. |
| A UI `prd.md` whose design reference names no states | contestable | Name the states its scenarios need; flag it. An absent reference is Verify's `not-reachable` and stops nothing. |
| `architecture.md` §6 rows, recommended answers included | not yours | Leave each as written; answering one removes the question being asked. |
| A `status:` line or a `STATE.md` cell | not yours | Leave it; a person flips it. |

## Rationalizations

- *"It reads clean, so a skim will do."* → clean prose and a spec that delivers the intent are two
  different readings.
- *"A list is what they asked for."* → a punch-list moves the work back onto the person it clears the
  way for.
- *"That call is too contestable to change."* → a flagged change is one keystroke from reverted; a
  withheld one is a defect the signature absorbs.
- *"One more pass and the judgment calls come out right."* → a second pass argues with the first.
- *"I drafted it, so I can review it."* → the context that missed a gap misses it again on the reread.

## Red flags

- A punch-list forming in the reply instead of edits in the files.
- A contestable section rewritten with no `<!-- spec-review: … -->` against the line.
- A second visit to a call the first pass already flagged.
- The agent that drafted an artifact grading it.
- An `architecture.md` §6 row coming back answered, or a `status:` line flipped.
- A credential in `environment.md` quoted into the handback.

## Verification

- [ ] Every decidable row above was re-checked and came back empty.
- [ ] Every contestable change is applied and carries its inline flag; nothing was corrected silently.
- [ ] Each story and each `intent.md` success criterion maps to a scenario, or the gap is flagged.
- [ ] `architecture.md` §6 and every `status:` line read as they did before the pass.
- [ ] The referenced ADR ids came back with the bundle.
- [ ] Each edited file's size is reported against its cap, flags excluded.
- [ ] The verdict is `pass`, `concerns` or `block`, and anything reconstructed from a missing input is
      marked `derived` where it is written.

## Outputs & handoff

No new file — the fixes land in the bundle, inside sections that already exist: this pass invents no
artifact and no stable section, and holds each edited file inside the cap its writer states:
`intent.md` 600 words · `prd.md` 800 · `acceptance.md` 1,200 · `architecture.md` 2,000 ·
`environment.md` 30 rows · `CONTEXT.md` 1,000 · each ADR 350. Measure with `wc -w`, flags excluded.

Each contestable change carries one comment against the line it changed:

```
<!-- spec-review: <what changed> — <why, naming the artifact or ADR that settles it>.
Revert if <the reading that would make this wrong>. -->
```

Appends one `docs/session-log.md` entry, cap 60 words (`../../references/state-schema.md`). Flips no
`STATE.md` cell and no `status:` line: the feature moves `spec → plan` on the person's signature.

Returns in conversation — the verdict, what was auto-fixed by file, what was flagged by file and line,
and the ADR ids to open.
