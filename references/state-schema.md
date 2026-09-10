# State schema

The four repo-wide state files — shapes, caps, writers — stated once. `project-setup` scaffolds them;
cite this file rather than restating a shape.

## `STATE.md` — the board

What is in flight and who owns the next action. Cells hold tokens, never sentences. One block per
feature:

```markdown
## PWR · Password reset            state: building   gate: agent

| Slice | Title              | State  | Gate  | Blocked by |
|-------|--------------------|--------|-------|------------|
| PWR-1 | request reset link | ship   | agent | —          |
| PWR-2 | expire stale tokens| impl   | agent | PWR-1      |
```

**Tokens** — use these words and no others.

- Feature `state:` — `spec` (sitting open) · `plan` (signed, slices being cut) · `building` · `done`.
- Slice `State` — `impl` · `verify` · `review` · `ship` (draft pull request open) · `done` (merged by a
  person) · `blocked` (a stop-list item ended it; the log names which).
- `Gate` — `you` · `agent` · `done`. `Blocked by` — the ids this slice waits on, or `—`; together they
  are the slice DAG.

**Who writes.** `plan-breakdown` adds the block and its rows; the run flips `State` and `Gate` and is its
only writer. A skill called by hand writes no row — the caller owns the transition.

## `docs/session-state.md` — where the work stands

Five `##` fields in order, canonical: `Current objective` · `Current state` · `Remaining issues` ·
`Boundaries` · `Next phase`. Rewritten whole each time, so only the latest is true; cap 300 words. No
history and no `## Log` heading — the record is its own file. `project-setup` seeds it with this header,
above the five empty fields:

```markdown
# Session state

Where the work stands right now. Every field is a snapshot, rewritten whole each time, so only the latest
is true and nothing here is history. Why it stands here is `docs/session-log.md` — read this file before
starting work, and read the log before re-opening any question.
```

## `docs/session-log.md` — why it stands there

Append-only, one entry per decision, cap 60 words. Never edit, re-word, re-date, re-order or remove one;
a correction or reversal is a new entry naming the old.

An entry is `### <date> — <what was decided>` and four lines: `Decided` · `Because` · `Ruled out` (and
why not) · `Still open` (or "nothing"). A decided-for-you entry carries decision · default taken · why ·
alternative · plan section, matching the pull request's **Decided for you** row. Record decisions, not
work: the test is whether a later session would re-open the question.

## `docs/lessons.md` — what a defect turned out to be

Append-only on the same terms, cap 80 words. One entry per root-caused defect, appended once the cause is
known and the fix in. Implement reads it before writing a skeleton.

An entry is `## <date> — <what the defect turned out to be>` and seven filled fields: `Tags` (the area, so a
later reader finds its siblings) · `Symptom` (as observed) · `Root cause` (why, not where it
surfaced) · `Fix` · `Prevention` · `Automated guard` (a lint, test, helper, checklist item, or
architecture invariant) · `References` (the commit, the failing command). An entry naming no guard is a
preference. Withhold any credential that appears in output and say so. The same defect twice is two
entries; the count is the signal the first guard did not hold.

## Gone

`docs/progress.md` — the pull request body and `qa.md` carry what a slice ran, to the same reader.
`docs/design.md` and the `Design ref` column — the design reference is an input `prd.md` points at. The
`Artifacts` column — artifacts sit at known paths. The `origin:` line — skills owning no slice wrote it.
`CONTEXT-MAP.md` and the per-context glossaries it indexed — one `CONTEXT.md` sits at the repo root.
