---
name: interview-me
description: Extract what a person actually wants before any plan, spec, or code — one question at a time, each carrying your guess, until you can predict their answers. Run on an underspecified ask, or on "interview me", "grill me", "stress-test my thinking", "what am I missing". Writes intent.md. Not idea-refine's options, not spec-grilling's how.
---

# Interview Me

## Purpose

**Stage: Ideate.** Principles 1, 6, 10.

Extracts what a person actually wants, as against what they think they should want: one question at a
time, each carrying your own guess, until you can predict their answers. It writes
`docs/features/<slug>/intent.md`, the first link in the artifact chain, and interviews rather than reads
because nothing upstream of it exists — the gap between the ask and the want being cheapest to close
before code makes switching expensive.

## When to use / when to skip

- The ask leaves out who it is for, why now, what success looks like or the binding limit, and you are
  about to fill one in silently.
- It is conventional rather than specific — "build me a dashboard", "make it faster" — and the
  convention will not unpack without a guess.
- Two reasonable values are in tension (simplicity against flexibility, cost against speed) and nobody
  has said which wins.
- The person invokes it: "interview me", "grill me", "are we sure?", "what am I missing?"
- Skip a self-contained or mechanical ask (a rename, a typo, a file move), a question about how
  something works, or an ask where speed was chosen out loud.
- Near-miss — the intent is settled and you want options against it: `idea-refine`, refining this same
  `intent.md` in place.
- Near-miss — the what is settled and the question is how it gets built: `spec-grilling`, which takes a
  raw idea when this was skipped.
- Near-miss — a drafted plan to attack after the fact: `doubt-driven-development`.

## Inputs

- **A person answering** — helps: the interview is the work, and their yes is what makes an intent
  confirmed rather than guessed · without it: derive the six lines from the prompt, the repository and
  the domain, mark each unread line `derived`, and write `status: derived`.
- **The raw ask** — helps: the thing being unpacked, in their own wording · without it: there is nothing
  to interview about.
- The repository, prior art and the domain — helps: the territory the blind-spot scan reads · without
  it: the domain and prior art alone, which a greenfield ask still has.
- `CONTEXT.md` — helps: terms already fixed in one sense · without it: their own words; `spec-grilling`
  seeds the glossary.
- `docs/features/<slug>/intent.md` — helps: an intent being re-opened, edited in place · without it:
  create it.

Ideate is where a person's attention is worth most (principle 10), so the three-question ceiling on an
absent input does not bound the interview itself.

## The Process

1. **Calibrate depth, then scan the territory.** Compress where they are fluent, invest where the
   ignorance is. On unfamiliar ground read the codebase, prior art and the domain first, then present a
   blind-spot brief — three to five items, a line each on what it is and why it would change the ask.
   It is context rather than questions, so it costs no round, and an interview aimed at the person's own
   map returns only what was already on it ([finding-unknowns](../../references/finding-unknowns.md)).

2. **State a one-sentence `HYPOTHESIS` and an honest `CONFIDENCE` on 0–100% before asking anything.**
   Under ~70%, add a one-line reason naming what is missing — nobody closes a gap they cannot see.

3. **With nobody there to answer, derive rather than wait.** Build the six lines from the prompt, the
   repository and the domain, mark each line you could not read `derived` with the question that would
   have settled it, set `status: derived`, and go to step 8. A run with no person is the ordinary case,
   not a blocker to report.

4. **Ask one question per message, each carrying your guess, then wait for the reaction.**

   ```
   Q:     <one focused question>
   GUESS: <your hypothesis for the answer, and the reasoning behind it>
   ```

   Spend a question only where the answer changes what gets built — who it is for, what problem it
   solves, the binding limit; an uncontested guess goes inline in a larger question instead of costing a
   round. Guess sometimes against the grain, since agreement from a polite person is cheap. Three in one
   message is a survey: they skim, and the third's framing was fixed by an answer that never arrived.

5. **Probe an answer signalling sophistication or convention instead of want** — "scalable", "clean
   architecture", "I should probably…": *"If you didn't have to justify this to anyone, what would you
   actually want?"*

6. **Stop when you can predict their reaction to the next three questions you would ask.** A test rather
   than a feeling, with a floor: rounds passing and the number still flat means the questions are wrong,
   so name what you cannot predict and offer to step back.

7. **Restate in five to eight lines, in their words, then take an explicit yes.** Outcome · User ·
   Why now · Success · Constraint · Out of scope, a line each — the restate's labels, which map onto
   the six `intent.md` headings named in Outputs & handoff — corrected line by line; the out-of-scope
   line stays, since silent disagreement about non-goals is half of misalignment. "Whatever you think",
   "sounds good" and silence are delegation rather than decision — re-ask with two concrete options as a
   choice, fold in each correction, restate. Ahead of the yes there is no spec, plan, task list or
   `intent.md`; a saved file implies a yes nobody gave.

8. **Write `intent.md` in the shape Outputs & handoff names, then hand it on.** The handoff to
   `idea-refine` or `spec-grilling` carries what was confirmed — or, derived, what each line leaves
   open — rather than the ask you were first handed, which is the wording this skill exists to correct.

## Rationalizations

- *"The ask is clear enough."* → if the outcome will not go into one sentence right now, it is not.
- *"Questions waste their time."* → four to six cost minutes; the wrong thing built costs the project.
- *"I'll figure it out while building."* → discovery after code exists is rework at an order of magnitude more.
- *"They said whatever you think, so I decide."* → delegation is not decision; two options as a choice get a real answer.
- *"Better to offer options."* → options serve someone already choosing, and widen where the interview
  narrows (`idea-refine` owns them).
- *"Attaching my guess leads them."* → leading is the point; the risk is a polite yes, which guessing
  against the grain flushes out.

## Red flags

- Three questions in one message, or a question with no guess attached.
- "Whatever you think is best" taken as a terminal answer.
- A confidence number under ~70% with no reason beside it, or three rounds with the number flat.
- A restate missing its out-of-scope line.
- `intent.md`, a spec, a plan or a task list on disk ahead of the explicit yes.
- A novel ask interviewed with no territory scan — the person's own map, read back to them.

## Verification

- [ ] A blind-spot brief was presented on novel ground, and a hypothesis and its confidence number
      were stated ahead of the first question, with a reason beneath ~70%.
- [ ] `intent.md` carries the six headings in order, a line or two each, out-of-scope non-empty.
- [ ] `status:` reads `signed` behind an explicit yes, or `derived` with every unread line marked and its
      unasked question beside it.
- [ ] Each question went out one per message with a guess attached, the last still changing what gets built.
- [ ] A sophistication- or convention-signalling answer got the "what would you actually want?" probe.
- [ ] With a person answering, the next three questions' reactions are predictable, or the one that is
      not is named.
- [ ] No spec, plan, task list or `STATE.md` row was written, `intent.md` is measured against its cap,
      and the handoff names the confirmed or derived intent rather than the original ask.

## Outputs & handoff

- `docs/features/<slug>/intent.md` — cap 600 words. `# Intent — <slug>`, a `status:` line reading
  `signed` or `derived`, then `## Outcome` · `## User` · `## Why` · `## Success` · `## Constraints` ·
  `## Out-of-scope` — the "Not Doing" list, glossed here and never in the heading — in that order, a line
  or two each. Report the count against the cap, and cut an over-cap draft rather than hand it on as
  though it fit. `idea-refine` refines this same file in place, and `spec-grilling`, `to-prd` and
  `spec-review` read these headings cold, so renaming one means editing those skills in the same commit.
- No `STATE.md` row and no feature block: `plan-breakdown` opens the board
  ([state-schema](../../references/state-schema.md)).
- Returns in conversation: the blind-spot brief, the hypothesis and its number, the questions, the
  restate, and `intent.md`'s measured length against its cap. No verdict.
