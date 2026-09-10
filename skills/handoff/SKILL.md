---
name: handoff
description: Compact a session into cold-start state — context filling, a `/clear` coming, work pausing, a decision a later session would re-open. Rewrites the five-field `docs/session-state.md`, appends to the append-only log. Not a run narrative (`pull-request`), not a State flip (`orchestrator`), not an ADR (`documentation-and-adrs`).
---

# Handoff

## Purpose

**Stage: cross-cutting.** Principles 3, 5, 7.

Compacts the live session into two files a cold agent resumes from: `docs/session-state.md`, the
five-field snapshot rewritten whole, and `docs/session-log.md`, the append-only record of what was
decided and why. Two files because only the latest snapshot is true, while every entry stays true about
the day it was written.

## When to use / when to skip

- Context is filling, the work is pausing, a `/clear` is coming, or a fresh agent picks this up cold.
- A decision was made a later session would re-open — append that entry even where no snapshot is worth
  rewriting; an unrecorded reason is re-argued for free.
- Skip it where `STATE.md` and the feature's artifacts hold everything, or the work is one step you
  finish this turn.
- Near-miss — a narrative of what a slice ran: the pull request body and `qa.md` carry that.
- Near-miss — a slice's `State` or `Gate` moving: the run owns the board.

## Inputs

- **The current conversation** — helps: the thing being compacted · without it: reconstruct from
  `STATE.md`, the artifacts and recent commits, marked `derived`.
- `docs/session-log.md` — helps: which questions are settled, so an entry reversing one says so ·
  without it: yours is the first.
- `docs/session-state.md` — helps: the snapshot you overwrite · without it: write the header and the
  five fields fresh.
- `STATE.md`, `docs/features/<slug>/`, `docs/adr/`, commits — helps: durable state you cite by path
  instead of copying in · without it: what the conversation holds, marked `derived`.
- **A next-session focus, when passed** — helps: the lens; bias `Current state` and `Next phase` toward
  it · without it: write for whoever arrives next.

## Process

1. Finish the step you are in first — a handoff written mid-thought is worse than none.
2. Resuming rather than ending? Read `docs/session-state.md` before your first plan, edit or question,
   and the log before re-opening anything it may answer; reversing a logged decision is a new entry
   with a reason.
3. Read the log and the artifacts you cite, then name each by path: what sits in `prd.md`, `plan.md`,
   an ADR or a commit diverges the moment a copy exists.
4. Rewrite `docs/session-state.md` whole, keeping the header that points at `docs/session-log.md`
   (seeded by `project-setup`; write it if absent) and the five fields in canonical order
   ([state-schema](../../references/state-schema.md)). A snapshot carries no history of what it last
   said.
5. Make `## Next phase` one concrete action somebody resumes from without asking a question — the file,
   the step, and the skill that owns it — and `## Boundaries` what is in and out of scope.
6. Route a throwaway mid-session compaction to the OS temp dir instead: same five fields, no entries.
7. Append one entry per decision — shape in [state-schema](../../references/state-schema.md) — to the
   committed log alone; an append-only record inside a file somebody deletes records nothing.
8. Redact before you append: every key, token, password and PII becomes `[REDACTED]`, and an
   environment need points at `environment.md`. A secret in the diff is a stop-list item
   ([safety-rails](../../references/safety-rails.md)).

## The session log

**What earns an entry.** Apply the re-open test first: would a later session, not knowing this, re-open
the question? If not, nothing was decided — delete the entry. Most sessions append zero or one; several
means the bar slipped, and the fix is the bar. Keep files, diffs, commands and test results out of every
entry.

**Append-only.** Prove it mechanically — the committed log must still be present, byte for byte, at the
head of the new one:

```sh
was=$(mktemp)
git show HEAD:docs/session-log.md 2>/dev/null > "$was"
n=$(wc -c < "$was" | tr -d ' ')
if [ "$n" -eq 0 ]; then echo "append-only: OK"          # not in HEAD yet — no earlier entries
else head -c "$n" docs/session-log.md | cmp -s - "$was" \
  && echo "append-only: OK" || echo "append-only: VIOLATION"; fi
```

A bare `git diff` cannot stand in: with no ref, a staged rewrite prints nothing and reads as a pass.
Report a violation as four things — which entry, what changed, that the file is append-only, and the
new-entry route — then restore the earlier bytes, append a new entry naming the old one, and carry it as
a Decided-for-you row. Old entries are never trimmed or rolled up; the one edit allowed is a live
credential already in an entry — redact it, rotate the credential, report the edit as the exception, and
append a new entry.

**What outranks it.** The log is the weakest source in the repo, under `docs/adr/` and a signed
`acceptance.md`; promote a decision that has to bind future work into `docs/adr/`
(`documentation-and-adrs` owns the shape), then append a new entry naming both. Keep both files
committed and out of `.gitignore`, or they die on the next fresh clone. Move a legacy `## Log` heading's
entries out of `docs/session-state.md` verbatim and whole, then delete the heading, restore the header,
and run the append-only check against `docs/session-log.md`'s first commit, where it fires correctly.

## Rationalizations

- *"I'll summarize what we discussed."* → a summary hands the next agent a reconstruction job.
- *"`Continue where we left off` is enough."* → it names no file and no step.
- *"That entry was worded badly, I'll tidy it."* → the edit destroys the evidence the call was once made
  that way; a new entry naming it is the route.
- *"A lot happened, so the record should be complete."* → the log holds decisions, not activity; a
  session that settled nothing appends nothing.
- *"The log is long, I'll roll up the old ones."* → compaction is for what grows with elapsed time, and
  a log grows with work.

## Red flags

- A `## Next phase` reading "keep working on X" — no file, no step, no skill.
- A file body, diff, or `prd.md` section pasted in place of its path.
- An earlier entry that reads differently than it did: reworded, re-dated, re-ordered, gone.
- An entry for work that merely happened — a slice landed, a test went green.
- Several entries from one session, or one against nearly every session on the board.
- A `## Log` heading inside `docs/session-state.md`, or either file in `.gitignore`.

## Verification

- [ ] Five fields present and non-empty, `## Next phase` naming a file, a step and the owning skill, so
      somebody resumes without a question.
- [ ] Every decision this session has an entry passing the re-open test, and no entry names a file,
      diff, command or test result.
- [ ] The append-only check printed OK, or a violation was reported naming the entry.
- [ ] Both files clean under `grep -nE 'sk-|sk_live|AKIA|password=|token='`, and both tracked by git.

## Outputs & handoff

- `docs/session-state.md` — cap 300 words. Rewritten whole: the header pointing at
  `docs/session-log.md` and the five `##` fields in canonical order
  ([state-schema](../../references/state-schema.md)), no `## Log` heading. Overflow moves to the file
  that owns it.
- `docs/session-log.md` — cap 60 words per entry; appended to, never rewritten; entry shape in
  [state-schema](../../references/state-schema.md).
- A throwaway compaction — `$TMPDIR/handoff.md`, the same five fields under the same 300-word cap,
  never committed.
- No `STATE.md` row: the caller owns the slice's transition
  ([state-schema](../../references/state-schema.md)).
- Returns in conversation: each file's measured length against its cap (an over-cap draft is reported,
  never handed on as if it fit), the entries appended or that none were, and any violation. No verdict.
