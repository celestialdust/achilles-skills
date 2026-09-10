---
name: code-simplification
description: Cut a diff's complexity without moving behaviour — deep nesting, dead code, duplication, one-caller abstractions, generic names — one change per finding, one verdict, nothing edited. Reach for it code-cold when a slice is green but reads heavy. Five-axis defect hunting is `code-review`; vulnerabilities are `security-and-hardening`.
---

# Code simplification

> Adapted from the [Claude Code Simplifier plugin](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-simplifier/agents/code-simplifier.md), rewritten here as a model-agnostic process.

## Purpose

**Stage: Review.** Principles 1, 6, 7, 8.

Read a slice's diff for what carries more weight than it has to, and return a ranked findings list and
one verdict. It edits nothing: sibling axes are mid-read in those same files, and a checker that
rewrites what it graded has stopped being a checker.

## When to use / when to skip

- A slice is verify-green and its pull request opens next; the Review fan-out dispatches you code-cold
  beside `code-review`, `security-and-hardening` and `performance-optimization`
  (`references/safety-rails.md`, *Code-cold dispatch*).
- Working code reads heavier than it should — a long function, copy-paste, a wrapper that only
  forwards, two spellings of one rule after a rushed merge.
- Not this: defects across five axes — `code-review`. Secrets, OWASP, dependencies —
  `security-and-hardening`. A profiled hot path — `performance-optimization`. A seam before the code
  exists — `codebase-design`.
- Skip code you cannot yet explain, code about to be rewritten wholesale, and a hot path where the
  plainer version measurably costs more. Clean code needs no pass; returning nothing is a result.

## Inputs

On a code-cold pass nobody is present, so derive what is absent and name it in the findings; with a
person there, ask at most three questions, only where the gap changes the shape of the pass.

- the diff — helps: the material in scope, and its edge is where scope ends · without it: read
  `git diff <base>..HEAD` or the working tree and name the range, `derived`. An empty range is a `pass`.
- the slice's row in `docs/features/<slug>/plan.md` — helps: its `Regression surface`, the file set a
  finding may land in · without it: bound the findings by the diff's own paths, `derived`.
- the changed files' tests, passing — helps: the oracle that makes a finding safe to take · without
  them, or with them red: mark which findings rest on reading alone, `derived`.
- `CLAUDE.md`, `CONTEXT.md`, the neighbouring code — helps: the house style a finding converges on, so
  the report is this codebase's taste and not yours · without them: read the files around the diff,
  `derived`.

## The simplification process

1. **Understand a candidate before cutting it** — its responsibility, callers and callees, edge and
   error paths, the tests that pin it, what `git blame` says. Read further where an answer is missing (Chesterton's
   Fence: an odd branch is often a platform workaround, and cutting it ships a regression under a
   cleanup's name).

2. **Preserve behaviour exactly** — same output per input, same errors at the same points, same side
   effects in the same order. Drop a candidate you cannot say that about, and never trade error handling
   away for tidiness.

3. **Scan the changed lines for the concrete signals**, not for a feeling — and leave untouched code
   alone, since a drive-by refactor is diff noise and unowned regression risk.

   | Axis | The signal, and the shape it wants |
   |---|---|
   | Structure | nesting three deep, or a function past ~50 lines → guard clauses and focused functions · nested ternaries → if/else, a switch, a lookup · a boolean flag parameter → an options object, or two functions · one conditional repeated across call sites → a named predicate |
   | Naming | `data`, `tmp`, `val` → a name for the content · `usr`, `cfg`, `evt` → full words, keeping `id`, `url`, `api` · a `get` that also mutates → a name that admits the write · a comment restating the line under it → deleted, and every "why" comment kept |
   | Redundancy | the same five-plus lines twice → one shared function · unreachable branches, unused variables, commented-out blocks → deleted once confirmed dead · a forwarding wrapper, or a factory for one product → the direct call · a cast to an already-inferred type → nothing |

4. **Prefer the explicit version wherever the compact one costs the reader a pause** — if/else over a
   nested ternary, a named intermediate over a chained reduce. Watch the far end too: inlining a helper
   that named a concept, merging two simple functions into one complex one, cutting an abstraction that
   exists for testability. Comprehension, not line count, is the goal.

5. **Write the proposed version out and hold it against the original.** Drop it where it reads or
   reviews worse, or imports a pattern this codebase does not use — a dropped attempt costs nobody, a
   reported one costs a round.

6. **Give each finding exactly one change**: `path:line`, the before, an after that leaves no unused
   import or unreachable branch behind, the tests that pin the behaviour, and what the reader gains —
   never a line count, never four rewrites bundled as "clean this up", since the implementer runs the
   suite against one change and needs to know which one broke it.
   Say that the refactor lands apart from feature or bug-fix work, and recommend a codemod over hand
   edits where it would touch more than ~500 lines.

7. **Name what a finding would move.** Nothing here is frozen, so one wanting a test rewritten, an
   assertion re-shaped or a file outside the surface touched is still legitimate — report what it moves
   and the disclosure the pull request owes (`pull-request`).

8. **Rank structural first, cosmetic last, and return one verdict** — `pass · concerns · block`: `pass`
   where every finding is taste the author may ignore (`code-review`'s `Optional:` / `Nit:` band),
   `concerns` where one should be taken before merge, `block` for a stop-list item alone
   (`references/safety-rails.md`), a secret read in passing being the likeliest.

## Rationalizations

| The excuse | The reality |
|---|---|
| "Fewer lines is simpler." | A one-line nested ternary parses slower than a five-line if/else. |
| "The original author had a reason." | `git blame` says whether they did; accumulated complexity often has none. |
| "This abstraction might be useful later." | One caller is not a pattern — it is complexity carried without payment. |
| "I'll tidy the neighbouring file too." | It belongs to a slice nobody is reviewing, and its regression lands unowned. |
| "This one is small enough to just apply." | A sibling axis is mid-read in that file, and the fix is the implementer's. |

## Red flags

- A finding with no `path:line`, or one outside what the diff changed.
- A proposed "after" longer and harder to follow than the before.
- Renaming toward personal taste rather than the conventions around the file.
- Error handling gone in the name of cleanliness.
- Several rewrites bundled into one "clean this up" item.
- A working-tree edit made after this pass began.

## Verification

- [ ] Every finding cites a `path:line` inside the changed files, carries one change with its before
      and its after, and names the tests pinning the behaviour — or says it rests on reading alone.
- [ ] Every finding preserves behaviour exactly, or names what it moves and the disclosure the pull
      request owes.
- [ ] Proposals reading worse than the original were dropped rather than reported.
- [ ] The list runs structural first, cosmetic last, and the derived inputs are named.
- [ ] The verdict is one of `pass · concerns · block`, `block` a stop-list item alone.
- [ ] Code and tests are byte-identical to what arrived.

## Outputs & handoff

Writes nothing, so there is no cap to measure. The findings and the verdict come back in conversation
under `## Findings` and `## Verdict`, structural first, for the Review fan-out to merge with the sibling
axes' lists. No code and no test is edited, the ones a finding names included — the implementer applies
the fix on the route-back. No board row, no gate flip: the caller owns the transition
([state-schema.md](../../references/state-schema.md)).
