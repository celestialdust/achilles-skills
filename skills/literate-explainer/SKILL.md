---
name: literate-explainer
description: Use when you must understand code you did not write — a landed diff, a PR, an unfamiliar repo. Emits a teaching artifact outside the repo: background before mechanics, a tour in reading order, plain enough to re-teach. Not `code-review` (judging a diff) or `codebase-research` (surveying one).
---

# Literate explainer

## Purpose

**Stage: standalone.** Principles 4, 5, 6, 8.

Turn a landed diff, or a whole unfamiliar repo, into a teaching artifact — background before mechanics,
a tour in reading order, plain enough to re-teach with the source closed. It writes into a comprehension
workspace outside the target repo, grows the learner glossary, and hands off to `comprehension-quiz`,
because "looks right" is not understanding.

## When to use / when to skip

- An agent landed a diff you cannot yet explain, or you inherited a repo a skim will not make sense of.
- Someone says "explain this diff/PR/branch", "walk me through what changed", "help me understand this
  code".
- Not this: judging a diff for merge — `code-review`; goal-blind facts for the design and the plan —
  `codebase-research`; testing whether the understanding is real rather than building it —
  `comprehension-quiz`, the pass after this one. The boundary is behavioural, not a naming rule.
- Standalone: no gate waits on it, it blocks nothing, `orchestrator` is untouched, no chain artifact.

## Inputs

- **A target repo** — helps: the subject and the repo key · without it: the working directory; with no
  `origin` the key falls back to the main working tree's path.
- **A diff in view** — helps: picks diff mode, names the subject · without it: codebase mode, unless an
  explicit mode argument says otherwise.
- **`docs/features/<slug>/research.md`** — helps: codebase mode reorders a goal-blind survey's facts ·
  without it: read the repo read-only yourself and mark those facts `derived`.
- **The learning ledger and the learner glossary** — helps: joined, they give proven-known and
  worth-revisiting · without them: a cold start teaches everything, with no hint history is missing.
- **A request for markdown** — helps: swaps the output mode · without it: self-contained HTML.

An empty workspace is a first-class input, not a missing one. With a person there, ask at most three
questions, only where the answer changes the shape — subject, mode, format.

## Process

1. **Resolve the workspace.** Derive the repo key, open or create
   `~/.achilles/comprehension/<repo-key>/`, append its `key → origin` line to `index.md` on first
   creation only — derivation and the `local__` fallback are in
   [comprehension-workspace-format](../../references/comprehension-workspace-format.md). One key per
   repo lands every clone and worktree in one workspace.

2. **Write every byte there and nothing into the target repo** — not the artifact, not a scratch file,
   not on a run that fails midway.

3. **Detect the mode**: a diff in view is diff mode, none is codebase mode, an explicit argument
   overrides either way. In diff mode take the first source in view — uncommitted changes, then a named
   branch, then a PR reference — and name the `subject` after that branch or PR, falling back to the
   diff's dominant path; the subject is what the manifest line and the filename carry.

4. **In codebase mode quarry the survey instead of gathering facts twice**, and reorder them
   pedagogically — load-bearing idea first, then what rests on it. The boundary is one-way: an explainer
   reads survey output, a survey never reads an artifact. Reading the repo is fine; writing
   `research.md` into it is not.

5. **Join the ledger and the glossary at read time**
   ([comprehension-workspace-format](../../references/comprehension-workspace-format.md)) for what is
   proven-known — a one-line pointer at most — and what is worth revisiting. Store no counter, rate or
   mastery flag, so no record can drift from the facts.

6. **Emit the artifact in the section order
   [teaching-artifact-format](references/teaching-artifact-format.md) fixes**, omitting an empty
   section whole rather than stubbing it. Carry the worth-revisiting note only where the ledger surfaces
   something; it lists rather than re-teaches and gates nothing; on a cold start omit it whole.

7. **Lead every concept what → why → how**, so each layer has a hook. Order the tour by the logic of the
   change, cause into effect and definition into use, never by filename or directory. Hold it to the
   Feynman bar, re-teachable with the source closed — a gap in the explanation is a gap in the grasp.

8. **Prose first, then a static figure, then an interactive one only where neither can teach the
   thing.** Ship one self-contained HTML file, everything inline, rendering from disk with no network
   and no build; markdown on request, same order and pedagogy. Keep every quiz answer out of the
   source — prose, comments, hidden elements, `data-*`, inline JS, embedded JSON — since reading it
   must confer no advantage on the quiz that follows.

9. **Register the run and hand off.** Append exactly one manifest line; add each new durable concept to
   the glossary, existing entries verbatim, promoting no ephemeral diff mechanic (a merged diff is stale
   by Friday). Leave `ledger.jsonl` alone. Say where the artifact lives and what it measured, then
   suggest `/quiz`, whose session lets the next explainer skip what is proven known.

## Rationalizations

- *"I'll drop it next to the code."* → that is how an employer repo or an OSS clone stops being
  byte-clean.
- *"A quick re-survey is faster."* → a second survey produces a survey, not a lesson.
- *"An answer key in a comment saves the quiz work."* → a source that answers the quiz makes the grade
  meaningless.
- *"I'll re-teach the background to be safe."* → re-teaching proven-known material makes a repeat
  session repetitive, not denser.
- *"A widget would look impressive here."* → a figure teaching the same thing has already earned the
  place.
- *"I'll cache proven-known, not recompute it."* → a stored measure drifts from the ledger behind it,
  and the join is cheap.

## Red flags

- Anything written under the target repo's tree, or its git state changed.
- Codebase mode re-surveying a repo whose survey is already on disk.
- A tour walking the files in directory order.
- Background re-teaching in full a concept the ledger grades `pass`.
- A widget where a static figure would teach the same thing.
- Quiz content drafted into the artifact, or a worth-revisiting note with nothing to surface.

## Verification

- [ ] The artifact is in the workspace, `git status --short` in the target repo lists nothing this run
      created, and the learner knows its path and measured size.
- [ ] Exactly one new manifest line records the run; `ledger.jsonl` is unchanged; no counter, rate or
      mastery flag was written.
- [ ] Sections run in the fixed order with empty ones omitted whole, every concept leads
      what → why → how, the explanation is re-teachable with the source closed, and the tour follows
      the logic of the change.
- [ ] Proven-known background is a one-line pointer at most; the note is present where the ledger
      supports one, absent whole on a cold start.
- [ ] The artifact opens from disk with no network and no build, or is markdown under the same
      contract, and its source holds no quiz answer.
- [ ] Every new durable concept is in the glossary, existing entries untouched; in codebase mode the
      facts trace to a quarried survey, or are marked `derived`.

## Outputs & handoff

`<workspace>` is `~/.achilles/comprehension/<repo-key>/`, and this skill is the sole writer of its
manifest and glossary.

| Path | Cap | Shape |
|---|---|---|
| `<workspace>/<date>-<subject>.html` | 2,000 words | Header · Background · tour · worth-revisiting note, an empty one omitted whole; one file, everything inline. `.md` on request, same contract |
| `<workspace>/manifest.jsonl` | one line per run | `date`, `mode`, `subject`, `artifact`, `concepts`; appended, never rewritten |
| `<workspace>/glossary.md` | 60 words per term | one `## <durable concept>` and a plain definition; new terms appended, existing verbatim |
| `~/.achilles/comprehension/index.md` | one line per repo key | `key → origin`, first creation only; shared with `comprehension-quiz` |

Depth for all four is in
[comprehension-workspace-format](../../references/comprehension-workspace-format.md), the artifact's
insides in [teaching-artifact-format](references/teaching-artifact-format.md). Report the
artifact's measured word count against its cap, and cut an over-cap draft rather than hand it on as
though it fits.

Nothing else is written: not the target repo, not `ledger.jsonl` (`comprehension-quiz` owns it), not
`STATE.md`, not `docs/session-log.md`. No board row and no gate flips
([state-schema.md](../../references/state-schema.md)), and no verdict — this skill is standalone. The
path, the measured size and the `/quiz` pointer come back in conversation.
