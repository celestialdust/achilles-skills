# Scaffold seeds

The literal text `project-setup` writes; replace `<project>` with the repository's name. Shape, tokens and
writers for the four state files are stated once in [`state-schema.md`](../../../references/state-schema.md);
these seeds are what lands in the repo, so its cold reader has the rules there. Every one ships no entries.

## `STATE.md`
```markdown
# Pipeline state — <project>

What is in flight and who owns the next action. Cells hold tokens and short phrases, never sentences: a
board is read across, not down. Why a slice is where it is goes in `docs/session-log.md`.

feature state:  spec · plan · building · done
slice state:    impl · verify · review · ship · done · blocked
gate:           you · agent · done

<!-- plan-breakdown adds one block per feature. Shape:
## PWR · Password reset            state: building   gate: agent
| Slice | Title              | State | Gate  | Blocked by |
|-------|--------------------|-------|-------|------------|
| PWR-1 | request reset link | impl  | agent | —          |
-->
```

## `CONTEXT.md`
```markdown
# <project>

## Glossary

<!-- Domain terms are appended here by the Spec sitting as the language is pinned. One entry per term: the
term in bold on its own line, its one-or-two-sentence definition beneath it, then an `_Avoid_:` line demoting
the rivals it beat, no implementation detail. A term already defined is sharpened in place, never defined
twice. Cluster with ### once clusters emerge — never a second ##, which splits the glossary in two. -->
```

## `docs/session-state.md`
```markdown
# Session state

Where the work stands right now. Every field is a snapshot, rewritten whole each time, so only the latest
is true and nothing here is history. Why it stands here is `docs/session-log.md` — read this file before
starting work, and read the log before re-opening any question.

## Current objective

## Current state

## Remaining issues

## Boundaries

## Next phase
```

## `docs/session-log.md`
```markdown
# Session log

Why the work stands where it does; where it stands now is the snapshot, `docs/session-state.md`.

One entry per decision, appended and never edited: never re-worded, re-dated, re-ordered or removed, and one
that turned out wrong is corrected by a new entry naming it. An entry holds what git cannot show, never which
files changed, and it is the weakest source here — `docs/adr/` or a signed `acceptance.md` outranks it, so a
decision that must bind future work is promoted to an ADR. A session deciding nothing appends nothing.

<!-- Append below, oldest first:
### <date> — <what was decided>
Decided: <the call>
Because: <the reason>
Ruled out: <the alternative, and why not>
Still open: <what this did not settle, or "nothing">
-->
```

## `docs/lessons.md`
`````markdown
# Lessons

What a defect turned out to be, so the same pit is not fallen into twice. One entry per root-caused defect,
written by whoever root-caused it — and by a review only for a Critical finding. Read it before you build: a
slice reads this file before it writes its skeleton, which is when the knowledge is worth something.
Append-only on the session log's terms — and the same defect twice is two entries, never a merge, because
the count is the signal that the first guard did not hold.

## Entry shape
Append below, oldest first:
```
## <date> — <what the defect turned out to be>
- Tags:              (the area, so a later reader finds its siblings — and can count them)
- Symptom:           (what was observed, in the form it was observed)
- Root cause:        (why it happened, not where it surfaced)
- Fix:               (what changed to close it)
- Prevention:        (what to do differently next time)
- Automated guard:   (a lint, a test, a helper, a checklist item or an architecture invariant.
                      Never empty: an entry naming none is a preference, not a lesson)
- References:        (the commit, the failing command)

Withhold any credential appearing in output and say that you withheld it. No entry here is ever edited, so
a value written into one cannot be taken back out.
```
`````

## The `## Agent skills` block
```markdown
## Agent skills

This repository runs the achilles-skills loop, scaffolded once by `project-setup`.

**State board** — `STATE.md` at the root is the only work tracker: features, their slices, and a `gate`
column saying who owns the next action. There is no issue queue.

**Domain docs** — read `CONTEXT.md` and the `docs/adr/` records touching your area before exploring, and
proceed silently when they are absent. Name a domain concept with the glossary's term; one missing from it is
a signal, not a licence to coin a synonym. Surface a contradiction with an ADR explicitly rather than
overriding it in silence.

**Per-feature artifacts** — `docs/features/<slug>/` holds that feature's intent, research, prd, acceptance,
environment, architecture, plan and qa.

**Docstrings explain the code** — write for the developer reading the file. A docstring reading `Implements
US-3` or `see prd.md` leaves the next reader no better off, and those files move as the feature moves while
the code stays. An immutable `docs/adr/` record may be cited after the explanation, never in place of it.

**Session state and decision log** — `docs/session-state.md` is the snapshot; `docs/session-log.md` is the
append-only record. Read the snapshot before starting work, and the log before re-opening any question. The
snapshot is rewritten whole; a log entry is never edited, and a correction is a new entry naming the old.

**Lessons** — `docs/lessons.md` says what a root-caused defect turned out to be and the guard that would
catch it coming back. Read it before you write a slice's skeleton. Append-only on the log's terms.

**Keeping these worth reading** — every file above is opened by somebody with none of your context, at the
moment they decide what to do next. A line earns its place by changing what that reader would do; one saying
merely that work happened changes nothing, and a second copy of a derivable fact can disagree with it.
```

## The pointer (the file that does not hold the rules)
```markdown
# <this file's name>

The rules for this repository live in `<rules file>`. Read that file before you act.

They are written once, there. A second copy here would eventually disagree with the first, and nothing would
force the two back into agreement — so this file only says where to look.
```
