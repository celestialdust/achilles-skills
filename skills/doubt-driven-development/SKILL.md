---
name: doubt-driven-development
description: Cross-examine one non-trivial in-flight decision before it stands — name the claim, hand a fresh code-cold agent the artifact and its contract with your reasoning stripped, classify what comes back, stop at three cycles. Not the merge-gate diff pass (code-review) or a failure already in hand (debugging-and-error-recovery).
---

# Doubt-Driven Development

## Purpose

**Stage: cross-cutting.** Principles 6, 7, 8.

Cross-examines one non-trivial decision while it is still in flight: a fresh code-cold agent tries to
disprove it, and you classify what comes back. It writes no chain artifact — the findings are working data
the caller folds into its own artifact. A confident answer is not a correct one, and a long session
turns assumptions into facts quietly.

## When to use / when to skip

- About to commit non-trivial code, settle an architectural decision under uncertainty, or assert a
  non-obvious fact — "this is safe", "this scales", "this matches the spec".
- Non-trivial means it branches, crosses a module or service boundary, asserts a property no compiler
  checks (thread safety, idempotence, ordering), rests on context the next reader cannot see, or is
  irreversible.
- In flight during Plan and Implement, while reversing still costs little — not at the merge gate, and
  not one of the gates a slice passes on its way to a pull request.
- Working in code you do not fully understand, or feeling certain.
- Skip a mechanical edit, an unambiguous instruction, read-only work or a plainly correct one-liner:
  say which it is and hand it back.
- Near-miss — a finished diff at the merge gate: `code-review`. A failure already in hand:
  `debugging-and-error-recovery`. A framework fact against its docs: `source-driven-development`.
  Rerunning a throwaway until it wins: `gauntlet-loop`.

## Inputs

Two things come from the caller, no upstream artifact is owed, and one fact is about where you run:

- **the artifact** — helps: the diff, the function, the proposal in three to five sentences, or the
  claim plus its evidence · without it: take the smallest unit in flight and name which, marked
  `derived`
- **the contract** — helps: the invariants or the `acceptance.md` scenario the decision has to honour ·
  without it: rebuild it from `docs/features/<slug>/prd.md`, the ADRs and the surrounding conventions,
  marked `derived`
- **whether a person is present** — helps: a second model is theirs to authorise · without it: assume
  nobody is and stay single-model

With a person present, ask at most three questions, and only where the gap changes what gets examined.

## Loading Constraints

Run the cycle where a subagent can still be spawned. Nested spawn is blocked, so a cycle buried inside
one degrades quietly into self-questioning: surface that to the caller rather than press on. Going on
alone, re-read the artifact against the Step 3 prompt below from a clean slate and label the result
degraded — your own context travels with you.

## The Process

1. **Name the claim in two or three lines** — what stands, and what it costs if it is wrong. Where it
   will not compress that far you hold a vibe rather than a decision; surface it before scrutinising it.

2. **Extract the smallest reviewable unit** — the artifact and the contract, your reasoning taken out.
   Hand over conclusions and you get your conclusions validated back. An artifact too large to hold in
   one read is decomposed here; the bound in Step 6 does not move for it.

3. **Dispatch a fresh subagent that never saw your context** (maker ≠ checker — principle 8), carrying
   this, verbatim, and nothing else:

   ```
   Find what is wrong with this artifact. Assume the author is overconfident.
   Look for unstated assumptions, unhandled edge cases, hidden coupling or shared
   state, ways the contract could be violated, conventions this breaks, and
   failure modes under unexpected input. Do not validate, do not summarise:
   report issues, or state that you can find none after thorough examination.

   ARTIFACT: <the artifact>
   CONTRACT: <the contract>
   ```

   The artifact and the contract only — never the claim, never your reasoning, never the session: your
   conclusion pulls the reader toward agreement, and its untended instinct is a balanced verdict where
   this needs issues. Re-dispatching on an unchanged artifact returns the same findings, so change
   something or stop.

4. **A second model is the person's call.** With one present, offer it — Gemini CLI, Codex CLI, or a
   paste into whatever they use — and record the answer; skipping is fine, skipping in silence is not.
   Alone in a run, say "cross-model skipped, nobody present".

   - Each invocation is its own authorisation: confirm command, flags and auth every time, and check the
     binary runs — one that passes `which` can still fail on real input.
   - Pipe the prompt from a file on stdin; a backtick or `$(…)` in a quoted argument truncates it or
     executes inside it.
   - Run the tool read-only (`codex exec --sandbox read-only`, `gemini --approval-mode plan -p ""`,
     where the empty `-p` is what makes it read stdin) — an artifact can carry instructions of its own.
   - Name a missing or failing tool and offer manual or skip, rather than a cross-model pass nobody got.

5. **Classify every finding against the artifact text**, first match winning — you are still the one
   deciding.

   | Class | What it is | What you do |
   |---|---|---|
   | Contract misread | the contract you sent was unclear or incomplete | repair it, re-classify next cycle |
   | Valid + actionable | a real issue the artifact has to change for | change it, re-loop |
   | Valid trade-off | real, and costlier to fix than to accept | log it where the person reviews |
   | Noise | correct under context the reader lacked | note it, and ask whether the contract should have carried it |

6. **Stop on one of four conditions** — only trivial or already-considered findings come back, three
   cycles are done, the person says ship it, or two cycles of substantive findings have gone by with
   nothing classified actionable. That last one is doubt theater, and it goes back to the caller the
   same way a fourth cycle would. Three unresolved cycles is information about the artifact rather than
   an argument for a fourth: hand it back saying so.

7. **Fold the result back into the caller's work.** Every actionable finding is resolved before the
   slice reaches a gate — firing here rather than at the merge gate is the whole point. Route a real
   failure mode to `debugging-and-error-recovery`. A behavioural claim already has its cycle in the
   failing test `test-driven-development` writes first. Append an accepted trade-off yourself as one
   `docs/session-log.md` entry, matching the Decided-for-you row in the pull request.

## Rationalizations

| Rationalization | Reality |
|---|---|
| "I am confident — skip the cycle" | On a novel problem confidence tracks familiarity, not correctness. |
| "I will doubt it at the end, in review" | By pull-request time the wrong direction is built, tested and defended. |
| "Doubt every step and I never ship" | The scope is the non-trivial decision; a rename goes straight back. |
| "It disagreed, so I was wrong" | A fresh reader lacks your context: disagreement is data, and the classification is yours. |
| "They said yes to the CLI last time" | Each run carries a different artifact, prompt and flags; that yes covered none of them. |

## Red flags

- A cycle spent on a rename, a format run or an unambiguous instruction.
- The claim, or the author's reasoning, sitting inside the reviewer's prompt.
- A fresh pass re-dispatched on an artifact nothing changed in.
- Findings adopted or waved off wholesale, with no class decided against the artifact text.
- Doubt theater: two or more cycles of substantive findings, nothing classified actionable.
- A fourth cycle; an external CLI run on last cycle's yes; a failed CLI absorbed in silence.

## Verification

- [ ] The claim was named in two or three lines before anything was handed over.
- [ ] A code-cold pass read the artifact and the contract, and neither the claim nor your reasoning.
- [ ] Every finding carries one class from the precedence table, decided against the artifact text.
- [ ] A stop condition is named with the cycle count beside it, and no fourth cycle ran.
- [ ] A second model is accounted for: authorised and run, declined, or skipped with its reason.
- [ ] Every derived input is marked `derived` wherever it was written or handed back.
- [ ] Actionable findings are resolved in the caller's artifact before the slice reaches a gate, and an
      accepted trade-off is logged.

## Outputs & handoff

- **No file under `docs/features/<slug>/` and no `STATE.md` row.** Findings are working data the caller
  consumes at once, and the caller owns the slice's transition
  ([`state-schema.md`](../../references/state-schema.md)). Anything about the artifact that must outlive
  the cycle goes into the caller's own work — the plan section, the diff, the test. The log entry below
  is the one file this pass writes.
- **`docs/session-log.md`** — one appended entry per accepted trade-off, cap 60 words, shape and append
  rules in [`state-schema.md`](../../references/state-schema.md), matching the pull request's
  Decided-for-you row. Report the entry's measured word count against that cap; an over-cap entry is
  trimmed, never handed on as if it fit.
- **Returned in conversation** — the claim, the classified findings, the cycle count and the stop
  condition that ended the loop, whether a second model ran, and what each `derived` input came from.
- **Verdict** — only a finding landing on the stop list
  ([`safety-rails.md`](../../references/safety-rails.md)) returns `block`, and the caller ends the slice
  on it. This pass grades nothing, so it returns no `pass` and no `concerns`.
