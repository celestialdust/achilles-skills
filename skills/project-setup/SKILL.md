---
name: project-setup
description: Scaffolds the repo ecosystem every achilles skill assumes — a one-time bootstrap that creates the STATE.md board, the CONTEXT.md glossary, docs/adr/, docs/features/, docs/session-state.md (where the work stands, plus an append-only log of decisions a resuming session reads before it starts), docs/progress.md (the run record — what each slice actually executed, appended to and never rewritten, scaffolded with the entry shape and no entries), and docs/lessons.md (the lessons record — what a root-caused defect turned out to be and the guard that would catch it coming back, appended to and never rewritten, scaffolded with the field template and no entries), and the `## Agent skills` block in one of CLAUDE.md / AGENTS.md plus a short pointer to it in the other — and, when the repo has neither and you opt to create CLAUDE.md, seeds it from a bundled behavioral template. Run this ONCE before the first feature, before interview-me or spec-grilling. The pipeline skills read these files cold and will have nowhere to write without it, so do this first.
---

## Purpose

Stage: **cross-cutting / setup** (one-time). Every downstream skill reads and writes a *shared substrate*:
the `STATE.md` board (what's in flight + who owns the next action), the per-feature artifact directories,
the repo-wide design substrate (`CONTEXT.md` glossary + `docs/adr/`), the session state
(`docs/session-state.md` — where the work stands, plus the append-only log of decisions a resuming
session reads first), the run record
(`docs/progress.md` — what each slice actually executed, one entry per slice), the lessons record
(`docs/lessons.md` — what each root-caused defect turned out to be, and the guard that would catch it
coming back), and the rules file that carries the `## Agent skills` block, with a pointer to it in
whichever of `CLAUDE.md` / `AGENTS.md` does not hold it. If that substrate doesn't exist, each skill has to re-derive "where do issues live / where's
the glossary / where do ADRs go" — which is exactly the scattered-tracker problem this suite consolidates
away (one local board, not mp's several issue queues). `project-setup` makes the substrate exist **once**, so the rest of the suite consumes it cold.

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with
the user, then write. It is **distinct from `preflight-readiness`**: `preflight-readiness` is a per-run environment gate that
re-fires every wave; `project-setup` is the one-time repo bootstrap that runs before any feature exists.

## When to use / when to skip

- **Use** once per repo, before the first feature — before `interview-me`, `idea-refine`, or `spec-grilling`.
- **Skip** if `STATE.md` already exists at the repo root and the substrate is intact; you don't need to
  re-run per feature (the board is appended to by `plan-breakdown`, not re-scaffolded).
- **Re-run to repair** when a substrate file has gone missing or stopped resolving — including a
  `CLAUDE.md` / `AGENTS.md` pointer naming a file that is no longer there. Nothing watches for that
  between runs, so the pointer check under "Verification" is what catches it, and it only runs here.
- **Escape hatch — adopt, don't overwrite:** if the repo already has a `CONTEXT.md`,
  `docs/session-state.md`, `docs/progress.md`, `docs/lessons.md`, `docs/adr/`, or a
  `CLAUDE.md`/`AGENTS.md` with prior content, adopt them in place. Re-running `project-setup` repairs missing pieces;
  it never clobbers existing user content. The three append-only files matter most here: `docs/session-state.md`'s
  `## Log`, every entry in `docs/progress.md`, and every entry in `docs/lessons.md` exist nowhere else, so
  re-scaffolding over any of them deletes reasoning and evidence nobody can recover.

## Inputs

Foundation only — this is the bootstrap; it has no upstream artifact and no refuse-to-run dependency. It
reads the repo as-is to decide what already exists:

- `git remote -v` / `.git/config` — is there a remote? (informational only; the tracker is local regardless.)
- root `CLAUDE.md` and `AGENTS.md` — does either exist? Is there already an `## Agent skills` section?
- root `CONTEXT.md` / `CONTEXT-MAP.md` — single- or multi-context already?
- `docs/adr/`, `docs/features/`, `docs/session-state.md`, `docs/progress.md`, `docs/lessons.md`,
  `STATE.md` — does prior output already exist?
- `.gitignore` — does any pattern in it match `docs/session-state.md`, `docs/progress.md`, or
  `docs/lessons.md`? All three have to be committed.

## Process

### 1. Explore

Look at the current repo to understand its starting state. Read whatever exists; don't assume:

- `git remote -v` and `.git/config` — is this a remote-backed repo? (Informational — does not change the tracker.)
- `CLAUDE.md` and `AGENTS.md` at the repo root — does either exist? Is there already an `## Agent skills` section?
- `CONTEXT.md` and `CONTEXT-MAP.md` at the repo root — is a single- or multi-context layout already implied?
- `docs/adr/` and any `src/*/docs/adr/` directories.
- `docs/features/`, `docs/session-state.md`, `docs/progress.md`, `docs/lessons.md`, and `STATE.md`
  — does this skill's prior output already exist?
- `.gitignore` — is `docs/session-state.md`, `docs/progress.md`, or `docs/lessons.md` matched by anything
  in it? All three exist to survive the session that wrote them, so an ignored copy dies on the next fresh
  clone.

### 2. Present findings and ask

Summarise what's present and what's missing. Then walk the user through the decisions **one at a time** —
present a section, get the answer, then move on. Don't dump everything at once.

Assume the user does not know what these terms mean. Each section starts with a short explainer (what it is,
why these skills need it, what changes if they pick differently), then the choices and the default.

**There is no issue-tracker question.** In this suite the tracker is **always** the local `STATE.md` board:
a two-level board (features → slices) with a `gate` column that absorbs mp's
`ready-for-agent`/`ready-for-human` triage roles. So the source's GitHub/GitLab/local choice and its
five-label vocabulary are **already decided** — you scaffold `STATE.md`, you do not ask where issues live.
Mention this once so the user knows their GitHub Issues (if any) are intentionally not the work surface here.

**Section A — Domain doc layout** (the one surviving choice).

> Explainer: Several skills (`spec-grilling`, `code-review`, `quality-verification`, `incremental-implementation`) read `CONTEXT.md` for the
> project's domain language and `docs/adr/` for past architectural decisions. They need to know whether the
> repo has one global context or several (e.g. a monorepo with separate frontend/backend contexts) so they
> look in the right place.

- **Single-context** — one `CONTEXT.md` + `docs/adr/` at the repo root. Most repos are this. **(Default.)**
- **Multi-context** — `CONTEXT-MAP.md` at the root pointing to per-context `CONTEXT.md` files (a monorepo).

If **neither** `CLAUDE.md` nor `AGENTS.md` exists, also ask **which one holds the rules** — don't pick for
them. Both filenames end up existing either way: the one they pick gets the `## Agent skills` wiring, and
the other gets a short pointer to it, so a contributor whose tool reads that other name is not left
with nothing. Note that a fresh `CLAUDE.md` is seeded with a small set of project-agnostic behavioral
guidelines (the bundled `assets/CLAUDE.template.md`) above the `## Agent skills` wiring; a fresh
`AGENTS.md` gets the wiring only.

### 3. Confirm and edit

Show the user a draft of everything before writing, and let them edit:

- The `STATE.md` skeleton (the empty board with the legend; see "STATE.md seed" below).
- The `CONTEXT.md` stub (glossary-only).
- The `docs/session-state.md` stub (empty fields, empty log; see "session-state.md seed" below). Say what
  the two zones are for: the five fields are a snapshot of where the work stands, rewritten each time;
  `## Log` is an append-only record of decisions — the reason, what was ruled out, what is still open —
  that a resuming session reads before it starts. It is committed, so it survives the session that wrote it.
- The `docs/progress.md` stub (the entry shape, no entries; see "progress.md seed" below). Say what it is
  for while you show it: one entry per slice recording what that slice actually executed — the commands,
  their real output, the files that changed, and what was not run. A run's own summary is otherwise the
  only account of itself, and a summary is written by the party with the most reason to round up.
- The `docs/lessons.md` stub (the field template, no entries; see "lessons.md seed" below). Say what it is
  for while you show it: one entry per root-caused defect, and every entry names the guard that would catch
  that defect coming back. A slice reads the file before it writes its skeleton, which is the moment the
  knowledge is worth anything — read afterwards, a lesson is a post-mortem of work already done.
- The `## Agent skills` block to add to whichever of `CLAUDE.md` / `AGENTS.md` is being edited.
- The pointer that goes in the *other* filename (see "pointer seed" below) — it names the file that holds
  the rules, and says nothing else.
- If a fresh `CLAUDE.md` is being created, the bundled behavioral template (`assets/CLAUDE.template.md`) that
  seeds it — the user can edit it now or later (it's a starting point, not a fixed contract).

### 4. Write

**Pick the file that holds the rules (verbatim file-selection rules):**

- If `CLAUDE.md` exists, edit it.
- Else if `AGENTS.md` exists, edit it.
- If neither exists, create the one the user chose in Section A — never pick for them.
- **Never write the rules into both.** Exactly one file gets the `## Agent skills` block — the one already
  there, or the one the user chose. The other never gets a copy of it: two copies drift apart, and a reader
  has no way to tell which one is lying. If an `## Agent skills` block already exists, update it in place
  rather than appending a duplicate; don't overwrite the surrounding sections.
- **Then create the other filename as a pointer.** Once the `## Agent skills` block has landed, write the
  pointer (see "pointer seed" below) into whichever of `CLAUDE.md` / `AGENTS.md` does not hold it.
  The pointer names the file that does, and says nothing else. Without it, a contributor whose tool reads
  only that filename opens an empty file or none at all. If the file already exists with content of its own,
  do not overwrite it — show the user the pointer line, ask before adding it at the top, and either way say
  plainly which file holds the rules. If they decline it, say what that leaves: their tool opens a file
  that does not route anywhere, and finding the rules is now on whoever reads it. That is theirs to accept,
  and it is the one branch where the pointer does not exist.
- **Seeding a fresh `CLAUDE.md`:** only when neither file exists and the user chose `CLAUDE.md`, write the
  bundled behavioral template (`assets/CLAUDE.template.md`) first, then append the `## Agent skills` block
  below it (see "CLAUDE.md seed" below). A fresh `AGENTS.md` chosen as the rules file gets the
  `## Agent skills` block only — no behavioral template. Never seed over a `CLAUDE.md` that already exists;
  edit it in place.

Then create the substrate (skip anything that already exists; never clobber).

1. **`STATE.md`** at the repo root — the empty two-level board with the legend (see seed below).
2. **`CONTEXT.md`** at the repo root (or `CONTEXT-MAP.md` + per-context `CONTEXT.md` for multi-context) —
   the glossary stub with a `## Glossary` heading, devoid of implementation detail (see "CONTEXT.md
   seed" below). The `## Glossary` heading is mandatory — `spec-grilling` appends terms under it.
3. **`docs/adr/`** — repo-wide ADR home (seed a `.gitkeep`; ADRs are named `ADR-<NNN>-<slug>.md`).
4. **`docs/features/`** — per-feature artifact root (`docs/features/<slug>/` holds intent.md, prd.md,
   acceptance.md, environment.md, plan.md per feature; seed a `.gitkeep`).
5. The **`## Agent skills`** block in the chosen file (see below), pointing at `STATE.md`, `CONTEXT.md`,
   `docs/adr/`, `docs/session-state.md`, `docs/progress.md`,
   and `docs/lessons.md`, and **naming** `docs/design.md` and `ARCHITECTURE.md` — which setup does not
   create; the first UI surface writes the one, and the first feature to run `architecture-design` writes
   the other. The domain-doc consumer rules carry over from `references/domain-docs.md`. Then the **pointer** in the other filename
   (see "pointer seed" below), naming the file that holds the block.
6. **`docs/session-state.md`** — where the work stands and why, seeded with **empty fields and an empty
   log** (see "session-state.md seed" below). Skip it if it already exists — and here skipping is not a
   courtesy, it is the only safe move: `## Log` is append-only, so overwriting one destroys decisions
   that exist nowhere else. Seed no entries; entries are written by `handoff` as decisions get made.

   **Check `.gitignore` and make sure nothing matches it.** This file is committed on purpose. Its whole
   job is to outlive the session that wrote it, and an ignored copy dies on the next fresh clone — which
   is precisely the case it exists for. If a pattern does match it, say so and ask before changing
   `.gitignore`; that file is the user's.

7. **`docs/progress.md`** — the run record, seeded with the **entry shape and no entries** (see
   "progress.md seed" below). Skip it if it already exists, and here — as with the session log directly
   above — skipping is the only safe move rather than a courtesy: it is append-only, so overwriting one
   destroys the only account of what earlier runs actually did. Seed no entries; entries are written by
   the skill that runs a slice, one per slice, as slices run.

   **Check `.gitignore` here too.** A record nobody commits is a record nobody reads: the question it
   answers — what did the last run really do — is asked by someone who was not present, most often on a
   fresh clone. If a pattern matches it, say so and ask before changing `.gitignore`; that file is the
   user's.

   You are scaffolding this file in the repository itself, not in a worktree — `project-setup` runs once,
   before any feature exists, so there is no slice branch for a write to get stranded on.

8. **`docs/lessons.md`** — the lessons record, seeded with its `## Entry shape` heading, the fenced field
    template beneath it, and the prose that states the rules every writer of an entry reads there (see
    "lessons.md seed" below). Seed no entries: every `##` heading after `## Entry shape` is somebody
    else's, written by whoever root-causes a defect, by `code-review` for a `Critical:` finding it raised,
    and by the `orchestrator` carrying back an entry a slice handed it. Skip the file if it already
    exists, for the same reason as the two above and with the same force: it is
    append-only, so overwriting one destroys what earlier defects cost somebody to work out.

    **Check `.gitignore` here too.** A lesson is written for the next person to work in that area, who is
    usually not the person who wrote it and often arrives on a fresh clone. If a pattern matches it, say so
    and ask before changing `.gitignore`; that file is the user's.

The `## Agent skills` block:

```markdown
## Agent skills

This repo is configured for the achilles-skills pipeline (run once by `project-setup`).

### State board
Work-in-flight lives in `STATE.md` at the repo root — a local two-level board (features → slices) with a
`gate` column marking who owns the next action. This is the only work tracker; there is no GitHub/GitLab
issue queue. See `STATE.md`.

### Domain docs
Single-context: `CONTEXT.md` + `docs/adr/` at the root. (Multi-context: `CONTEXT-MAP.md` → per-context
`CONTEXT.md`.) Skills read these before exploring; consumer rules in the project-setup skill's
`references/domain-docs.md`.

### Per-feature artifacts
Each feature's intent.md / prd.md / acceptance.md / environment.md / architecture.md /
architecture.html / plan.md live under `docs/features/<slug>/`.

### Structure map
`ARCHITECTURE.md` holds this repo's structure once it is decided: the domains, the layer order, and the
dependency edges a diff may add. The **first** feature to run `architecture-design` here writes it; every
later one starts from it and records only what differs. Nothing scaffolds it — a repo whose layering
nobody has decided has none, and that is correct rather than missing.

### Decided look
`docs/design.md` holds this repo's look once it is decided: the palette, the type, the layout language,
the motion posture, and the signature vocabulary every interface here shares. The **first** user interface
built in this repo writes it; every later one starts from it and records only what differs. Nothing
scaffolds it — a repo with no user interface has none, and that is correct rather than missing.

### Session state and decision log
`docs/session-state.md` has two zones. The five fields at the top are a snapshot of where the work
stands, rewritten each time. `## Log` beneath them is an append-only record of decisions — the reason,
what was ruled out, what is still open.

**Read both before starting work**, at the top of every session, so a question the log already answers
is not re-opened. `## Log` is append-only: earlier entries are never edited, re-ordered, or deleted, a
wrong entry is corrected by a new entry naming it, and an attempt to change one is reported as a
violation rather than quietly refused. Entries hold only what the git history cannot show — never which
files changed. It is the weakest source here: a decision record under `docs/adr/` or a signed
`acceptance.md` outranks it, and a decision that must bind future work is promoted to `docs/adr/`.

### Run record
`docs/progress.md` records what each slice actually executed: one entry per slice, carrying the commands
in the form they were run, their real output, the files that changed, and what was **not** run and why.

**Read it when you resume work you were not present for**, alongside the two files above. The board says
where things stand, the log says why, and this says what was actually done — a claim that a check passed
either has the command's output under it or says the check was not run, and there is no third state.

It is append-only on the same terms as `## Log`, and it is evidence rather than a status page: no entry
carries a stage, a state, or an owner. `STATE.md` answers who owns the next action, and a second answer
here would eventually disagree with it.

### Lessons
`docs/lessons.md` holds what a root-caused defect turned out to be: one entry per defect, seven fields
each, naming the guard that would catch it coming back.

**Read it before building a slice**, so a pit somebody has already fallen into is not fallen into twice.
It is append-only on the same terms as `## Log`. The same defect recurring is a second entry, never an
edit to the first — the count is the signal that the first guard did not hold, and folding two entries
together destroys it.
```

### 5. Done

Tell the user setup is complete and which skills now read from these files (`spec-grilling` appends
`CONTEXT.md` and writes `docs/adr/`; `interview-me`/`idea-refine` write `docs/features/<slug>/intent.md`;
`plan-breakdown` adds feature blocks + slice rows to `STATE.md`; the orchestrator drives `STATE.md`;
`handoff` writes `docs/session-state.md` and appends to its log; whichever skill runs a slice —
`incremental-implementation` on its own, or the `orchestrator` when a run drives it — appends that slice's
entry to `docs/progress.md`; `debugging-and-error-recovery` appends a `docs/lessons.md` entry whenever a
defect is root-caused, `code-review` appends one for a Critical finding and for nothing lesser, and the
`orchestrator` appends the entries slices hand back, from the checkout it holds rather than from theirs).
Say which of `CLAUDE.md` / `AGENTS.md` holds the rules and that the other is a pointer to it, so a
contributor on the other tool lands in the right place. A rule change goes in the rules file; the pointer
never gets a copy of it.
Say what `docs/session-state.md` is for too: the fields are a snapshot, the log is a record, and the log
is append-only — nothing in it is ever edited or deleted, so it can be trusted as evidence rather than
read as a status page. It is committed so it survives a fresh clone; leaving it out of version control
defeats the file.
Say the same about `docs/progress.md`, and say what it is not: it records what each slice ran and what
came back, and it never says which stage a slice is at or who owns the next action — that is the board's
question, and one question with two answers is one answer too many. It is append-only and committed for
the same reasons.
Say what `docs/lessons.md` is for as well: one entry per root-caused defect, each naming the guard that
would catch it coming back, read before a slice is built rather than after. It is append-only and committed
on the same terms, and the same defect recurring is a second entry — the count is the signal that the first
guard did not hold, and folding the two together destroys it.
Mention that `STATE.md`, `CONTEXT.md`, the five fields of `docs/session-state.md`, and the per-feature
docs are theirs to hand-edit later — `## Log`, `docs/progress.md`, and `docs/lessons.md` being the
exceptions, since correcting an entry in any of them means appending a new one rather than changing the
old one. Re-running `project-setup` is only needed to repair or re-scaffold a substrate file that has
gone missing.

## STATE.md seed

Write this empty board — the legend header is the stable section downstream consumers depend on; no feature
blocks yet (those are born from an already-sliced plan, added by `plan-breakdown`):

```markdown
# Pipeline State — <project>

> Single source of truth for what's in flight. The orchestrator drives slice rows; the human reads the
> `gate` column to know what needs them. No emojis; text tokens only.

feature state:  spec · plan · building · done          ← the PRD's stage
slice state:    impl · verify · review · ship · done · blocked · halted
gate:           you · agent · done                     ← who owns the next action

<!-- Feature blocks are added by plan-breakdown. Slice ids are PRD-namespaced. Example shape:

## PWR · Password reset                          feature: building
origin:  prd.md · acceptance.md · plan.md
| Slice  | Title              | Design ref                     | State   | Gate  | Blocked by | Artifacts |
|--------|--------------------|--------------------------------|---------|-------|-----------|-----------|
| PWR-1  | request reset link | `docs/features/pwr/design-contract.md` | impl | agent | —      | —         |
| PWR-2  | expire stale tokens| —                              | impl    | agent | PWR-1     | —         |
-->
```

`Design ref` holds the signed design contract + prototype the slice builds against, or `—` for a slice that
builds no UI. The orchestrator copies it into both the implement and the verify dispatch brief, so a `—` has
to be recorded rather than left blank — blank reads as "nobody looked".

## CONTEXT.md seed

Write this glossary stub — the `## Glossary` heading is the stable section `spec-grilling` appends terms
under (canonical heading; do not rename); no terms yet (those emerge as the ubiquitous language is
sharpened). The seed comment states the entry shape rather than inventing one: `spec-grilling`'s
`references/CONTEXT-FORMAT.md` is what the appender writes to, so a seed describing a different shape
opens a file whose first entries disagree with every entry appended after them.

```markdown
# <project>

## Glossary

<!-- Domain terms are appended here by spec-grilling as the ubiquitous language emerges.
One entry per term: the term in bold on its own line, its one-or-two-sentence definition
beneath it. No implementation detail. Group with ### subheadings once clusters emerge —
never with a second ## section, which splits the glossary in two. -->
```

For multi-context, seed `CONTEXT-MAP.md` at the root plus one per-context `CONTEXT.md`, each carrying its
own `## Glossary` heading.

## session-state.md seed

Write this stub at `docs/session-state.md` — five empty fields and an empty log. The five field headings
and `## Log` are the stable sections consumers depend on (canonical headings; do not rename). The
explanation is part of the seed: an append-only file is only append-only if the next person to open it
can tell that from the file:

```markdown
# Session state

Where the work stands, and why. Two zones, and they are not the same kind of thing.

The five fields below are a **snapshot** — overwritten every time this file is written, so only the
latest version is true. `## Log` is a **record** — appended to, never edited, never deleted, so every
entry stays true about the moment it was written.

**Read both before starting work.** The fields say where things stand; the log says why, and which
questions are already settled. A question the log answers does not get re-opened from zero.

## Current objective

## Current state

## Remaining issues

## Boundaries

## Next phase

## Log

Append-only. A new entry goes after the last one. Earlier entries are never edited, re-worded, re-dated,
re-ordered, or removed. An entry that turned out to be wrong is corrected by a **new** entry naming the
old one — that the call was once made that way is the fact worth keeping. An attempt to change or remove
an earlier entry is **reported as a violation**, naming the entry and what would have changed; refusing
quietly is not enough, because a silent refusal reads as a silent success.

An entry holds only what the git history cannot show: the decision, the reason, what was ruled out, and
what is still open. Never which files changed or what was added — git holds that exactly, and a second
copy of a derivable fact can disagree with its source, leaving a reader no way to tell which one is
lying.

This is the weakest source in the repo. It never overrides a decision record under `docs/adr/` or a
signed `acceptance.md`; where they disagree, the committed contract is right and the entry is stale. A
decision that has to bind future work is **promoted** to a decision record under `docs/adr/`; the
original entry is left as it is, and a new entry names both it and the record it became.

Entries are kept, not compacted. They grow with decisions, and decisions are work; compaction is for
what grows with elapsed time. And this file is committed, not ignored — its whole purpose is to outlive
the session that wrote it.

<!-- Entry shape. Append below, oldest first:

### <date> — <one line: what was decided>
Decided: <the call>
Because: <the reason>
Ruled out: <the alternative, and why not>
Still open: <what this did not settle, or "nothing">
-->
```

Seed no entries and fill in none of the five fields — both are written by `handoff` when there is
actually a session to record. A seeded entry is a decision nobody made.

`handoff` also adds `## Suggested skills` and `## Referenced artifacts` between `## Next phase` and
`## Log` the first time it writes the file. The seed leaves them out because there is nothing to point
at yet; `## Log` stays last either way, so appending never has to step over anything.

## progress.md seed

Write this stub at `docs/progress.md` — the entry shape and no entries. `## Entry shape` is the one
heading the seed ships (canonical heading; do not rename); every other `##` heading in the file is an
entry, and entries are appended after it, oldest first. The shape itself sits inside a fenced block,
which is what keeps it from reading as the first entry. The explanation is part of the seed, for the
same reason it is part of `docs/session-state.md`: an append-only file is only append-only if the next
person to open it can tell that from the file.

`````markdown
# Run record

What each slice actually executed. One entry per slice, appended when the slice starts and completed
when it returns.

This file exists because a run's own summary is otherwise the only account of itself, and a summary is
written by the party with the most reason to round up. An entry is evidence: the commands in the form
they were run, and what came back from them.

**It never says where the work stands.** No entry carries a stage, a state, or an owner — `STATE.md`
answers who owns the next action, and a second answer here would eventually disagree with it. Reading
this file will not tell you which slice is waiting on a person, and that is deliberate rather than
missing.

**Append-only.** A new entry goes after the last one. Earlier entries are never edited, re-worded,
re-dated, re-ordered, or removed — including an entry that recorded a failure the next attempt fixed.
The same failure twice is two entries; the second never replaces the first. An entry that turned out to
be wrong is corrected by a **new** entry naming the old one. An attempt to change or remove an earlier
one is a **STOP**: the work ends there, and the violation is reported, naming the entry and what would
have changed. Refusing quietly is not enough — a silent refusal reads as a silent success, and the text
already recorded stays readable in full either way.

**A heading with nothing under it is a slice that started and did not finish.** It is written the moment
the slice starts, before anything can go wrong with it, so a slice that dies mid-flight still leaves a
mark. That is not the same as a slice that was never started, which has no heading at all. Leave it as
it is; the missing fields are the record.

## Entry shape

Append below, oldest first:

```
## <date> — <SLICE-ID> — <title>
- Summary:
- Commands run:            (verbatim, one per line)
- Results:                 (verbatim output or the failure signature)
- Files changed:
- Not run:                 (what was skipped, and why — never omit this line)
- Follow-ups:

Do not claim a command was run if it was not run. Write it under "Not run" and say why.
Withhold any credential that appears in output, and say that you withheld it.
```

Nothing checks those last two lines. They are written here, next to the shape, because this is what
the writer is looking at when the temptation arises.
`````

The last two lines of the shape are the whole point of the file and nothing mechanical enforces them, so
do not add a claim that something does. A "Not run" line that is present and honest is what separates a
check that passed from a check nobody performed; without it, the two read identically.

Seed no entries. An entry is a record of work somebody did, so a seeded one is fiction of exactly the
kind this file exists to prevent — the same reason `docs/session-state.md` ships with an empty `## Log`.

## lessons.md seed

Write this stub at `docs/lessons.md` — the field template and no entries. `## Entry shape` is the one
heading the seed ships (canonical heading; do not rename); every other `##` heading in the file is an
entry, and entries are appended after it, oldest first. The template sits inside a fenced block, which is
what keeps it from reading as the first entry. The explanation is part of the seed for the same reason it
is part of the other two append-only files: the rules are only followed if the next person to open the
file can read them there.

`````markdown
# Lessons

What a defect turned out to be, so the same pit is not fallen into twice. One entry per root-caused
defect, appended once the cause is known and the fix is in.

**Read it before you build.** A slice reads this file before it writes its skeleton. That is the moment
the knowledge is worth anything: the skeleton is where the decisions these entries are about get made,
and a lesson read after the code is written is a post-mortem of work already done.

**Every entry names a guard.** `Automated guard` says what would catch this defect coming back — a lint
rule, a test, a helper that makes the mistake unavailable, a checklist item, or an architecture
invariant. It is filled in as the entry is written, by whoever root-caused the defect and is the only
person who knows what would have caught it. An entry naming none is **refused**: a lesson nobody can name
a guard for is a preference, and preferences are what fill a file like this until nobody reads it.

**Append-only.** A new entry goes after the last one. Earlier entries are never edited, re-worded,
re-dated, re-ordered, or removed. An entry that turned out to be wrong is corrected by a **new** entry
naming the old one. An attempt to change or remove an earlier entry is a **STOP**: the work ends there,
and the violation is reported, naming the entry and what would have changed. Refusing quietly is not
enough — a silent refusal reads as a silent success.

**The same lesson twice is two entries.** A defect whose category is already in the file is recorded
again rather than folded into the entry already there. The count is the signal: a category appearing a
second time says the first guard did not hold, which is the one thing a reader most needs to know.
Merging the two destroys the only evidence of it.

**Three parties write here, and they write different entries.** Whoever root-causes a defect writes one.
A review writes one only for its most serious class of finding — a `Critical:` finding, once root-caused.
A Required or lesser finding is refused here and stays in that review's findings list, where it is
already tracked; admitting those would make this file a second copy of every review.

**The third is a courier, not an author.** An entry written from inside a slice's own checkout lands on a
branch that may never merge, so a slice hands its finished entry back and the run that drove it appends
the entry here, from the checkout the run itself holds. The courier carries what it was handed and infers
nothing from silence: a slice that hands back nothing has nothing appended for it.

## Entry shape

Append below, oldest first:

```
## <date> — <one line: what the defect turned out to be>
- Tags:              (the area, so a later reader finds the others like it — and can count them)
- Symptom:           (what was observed, in the form it was observed)
- Root cause:        (why it happened — the cause, not the place it surfaced)
- Fix:               (what changed to close it)
- Prevention:        (what to do differently next time)
- Automated guard:   (what would catch a recurrence — a lint, a test, a helper, a checklist item, or
                      an architecture invariant. Never empty: an entry without one is refused)
- References:        (where to look — the commit, the run-record entry, the failing command)

Withhold any credential that appears in output, and say that you withheld it. `Symptom` and
`References` are the two fields one arrives in, and no entry here is ever edited — a value written
into one cannot be taken back out.
```

All seven fields get filled in. `Automated guard` is the one that gets left for later, and later is
where a lesson dies: by then whoever knew what would have caught the defect has moved on, and working it
out again costs what the defect cost the first time.
`````

Seed no entries, for the same reason as the other two: an entry is a record of a defect somebody
actually hit, so a seeded one is a claim about work that never happened. And do not soften the
guard-missing rule into a warning while you write the seed. A warning about a missing field is how the
field ends up optional, and an entry with no guard cannot be acted on later without re-deriving the whole
lesson from scratch.

Nothing mechanical enforces any of this — no hook and no CI reads the file. The rules are in the seed
because the seed is what the writer is looking at when the temptation arises, which is the same reason
the run record carries its two invariant lines.

## CLAUDE.md seed (only when creating a fresh CLAUDE.md)

When the repo has **neither** `CLAUDE.md` nor `AGENTS.md` and the user chose to create `CLAUDE.md`, seed it
from the bundled template `assets/CLAUDE.template.md` **before** adding the `## Agent skills` block. The
template is a project-agnostic set of behavioral guidelines — *Think Before Coding · Simplicity First ·
Surgical Changes · Goal-Driven Execution* — adapted from Andrej Karpathy's notes on LLM coding pitfalls (via
`multica-ai/andrej-karpathy-skills`). Write the template verbatim, then append the achilles wiring beneath it.
Do **not** write the template into an `AGENTS.md`, and never seed over a `CLAUDE.md` that already exists — in
that case you edit the existing file and add only the `## Agent skills` block.

## Pointer seed (the file that does not hold the rules)

Write this into whichever of `CLAUDE.md` / `AGENTS.md` does **not** carry the `## Agent skills` block.
Both placeholders get replaced: `<this file's name>` with the file you are writing, `<rules file>` with
the one that carries the block.

```markdown
# <this file's name>

The rules for this repository live in `<rules file>`. Read that file before you act.

They are written once, there. A second copy here would eventually disagree with the first, and nothing
would force the two back into agreement — so this file only says where to look.
```

The first sentence is the stable line — canonical wording, do not reword it. The pointer check under
"Verification" reads that line to find the file the pointer names, so a pointer that says the same thing
in different words cannot be checked, and a broken one then goes unnoticed until a contributor hits it.

Nothing else goes in this file: not the `## Agent skills` block, not a summary of it, not a list of the
substrate files. A pointer's whole job is to route. The moment it restates a rule it becomes the second
copy that this arrangement exists to prevent.

## Rationalizations

- "This repo already tracks issues on GitHub — skip `STATE.md`." → No. The suite's board **is** `STATE.md`
  (consolidated local tracker). GitHub Issues are intentionally not the work surface.
- "I'll create `CONTEXT.md` later when there are terms." → No. The substrate must exist before `spec-grilling`
  has somewhere to append; scaffold the stub now (empty glossary is fine).
- "Multi-context looks more thorough — default to it." → No. Default is **single-context**; only a real
  monorepo with separate contexts warrants `CONTEXT-MAP.md`.
- "Neither CLAUDE.md nor AGENTS.md exists, I'll pick one." → No. Ask the user which one holds the rules.
  Both filenames end up existing — one carries the rules, the other a pointer — but which is which is theirs
  to choose.
- "The other file is only a pointer, so I'll copy the important parts across too, just in case." → No. That
  is the second copy. A pointer that restates a rule is a rule that can disagree with itself, and the reader
  cannot tell which side is stale.
- "I'll dump all the choices in one message to save turns." → No. One decision at a time; assume the user
  doesn't know the terms.
- "`docs/session-state.md` already exists but looks messy — I'll re-scaffold it clean." → No. Its `## Log`
  is append-only, and those entries exist nowhere else. Overwriting it deletes reasoning no commit can
  reconstruct. Skip it, exactly like `CONTEXT.md`.
- "`docs/session-state.md` is per-session scratch — I'll add it to `.gitignore`." → No. It is committed on
  purpose. Ignored, it dies on the next fresh clone, which is the one situation it was written for.
- "The session log duplicates `git log` — one of them should go." → No. They hold different things. Git
  holds what changed; the log holds why, and what was ruled out. Neither can produce the other.
- "I'll seed a first log entry so the file isn't empty." → No. An entry is a record of a decision someone
  made. Seed one and the repo's first piece of reasoning is fiction.
- "`docs/progress.md` duplicates `git log` and `STATE.md` — skip it." → No. Git holds the diff and the
  board holds the state; neither holds the commands a slice ran or what came back from them. That is the
  one question — what did the last run actually do — that today only the run's own summary answers.
- "`docs/progress.md` already exists but the entries look stale — I'll re-scaffold it clean." → No. It is
  append-only, exactly like `## Log`. Those entries are the only evidence of what earlier runs did;
  overwriting them leaves a file that looks tidy and proves nothing. Skip it.
- "I'll seed one entry so the shape is obvious." → No. The shape is in the fenced block, where the file
  says plainly that nothing in a fence is an entry. A seeded entry is a claim that work happened.
- "It's a run artifact — I'll add it to `.gitignore`." → No. The reader it is written for was not present
  and most often arrives on a fresh clone. Ignored, it is a record nobody can read.
- "I'll add a state or gate column to the entry shape so a reader can see progress at a glance." → No.
  `STATE.md` answers that, and a second answer diverges from the first the moment one of them is updated
  and the other is not. This file records what ran, and nothing else.
- "`docs/lessons.md` is what `docs/progress.md` is for — one record is enough." → No. The run record says
  what a slice executed; this says what a defect turned out to be and what would catch it coming back.
  Neither answers the other's question, and a reader looking for the second one in the first finds a
  command log.
- "`Automated guard` is hard to fill for some defects — I'll seed it as optional so entries still get
  written." → No. An entry with no guard is refused, and softening that in the seed is how the field
  becomes decorative. The whole value of the record is that each entry names the thing that makes the
  lesson stick without anybody remembering it.
- "The seed should carry one worked entry so the shape is obvious." → No. The shape is in the fenced
  block, and a seeded entry is a claim that somebody hit that defect here. The file opens empty, exactly
  like the session log and the run record.

## Red flags

- Overwriting an existing `CONTEXT.md`, `STATE.md`, or `## Agent skills` block without reading it first.
- Writing the `## Agent skills` block into both `CLAUDE.md` and `AGENTS.md` — one holds the rules, the
  other holds a pointer to it.
- Leaving the other filename absent, so a contributor whose tool reads it finds nothing.
- Writing a pointer that names a file which does not exist, or reaching for different words than the seed's
  first sentence, which is what the pointer check reads.
- Asking "where should issues live / GitHub or local?" — that decision is gone (tracker = local `STATE.md`).
- Writing any value, secret, or shell command into a scaffolded file (these files are structure, not config).
- Seeding `STATE.md` with feature/slice rows — `project-setup` leaves the board empty.
- Creating `docs/design.md` or `ARCHITECTURE.md`, or seeding either empty — the first UI surface writes
  the one and the first feature to run `architecture-design` writes the other, and an empty file says
  exactly what no file already says while reading like a decision somebody made.
- Writing the behavioral `CLAUDE.md` template into an `AGENTS.md`, or over a `CLAUDE.md` that already exists.
- Overwriting or re-scaffolding an existing `docs/session-state.md` — its `## Log` is append-only and the
  entries in it exist nowhere else.
- Seeding `docs/session-state.md` with a log entry, or filling in any of the five fields.
- Leaving `docs/session-state.md` matched by `.gitignore`, or adding it there — an ignored log dies on the
  next fresh clone.
- Writing the `## Agent skills` block without the session-log section, so nothing tells a fresh agent to
  read `docs/session-state.md` before it starts. A log nobody reads is a maintained file with no consumer.
- Overwriting or re-scaffolding an existing `docs/progress.md` — it is append-only and its entries are the
  only account of what earlier runs actually did.
- Seeding `docs/progress.md` with an entry, or writing the entry shape anywhere but inside the fenced
  block under `## Entry shape`.
- Dropping the "Not run" line or the credential line from the seeded shape — they are the two lines the
  file exists for, and the seed is what the writer is looking at when the temptation arises.
- Putting a stage, a state, a gate, or an owner into the entry shape — the board answers that, and a
  second answer is one that can disagree.
- Leaving `docs/progress.md` matched by `.gitignore`, or adding it there — its reader was not present and
  usually arrives on a fresh clone.
- Writing the `## Agent skills` block without the run-record section, so nothing tells a resuming agent to
  read `docs/progress.md`. A record with no declared reader is a record nobody reads.
- Overwriting or re-scaffolding an existing `docs/lessons.md` — it is append-only, and its entries are
  what earlier defects cost somebody to work out.
- Seeding `docs/lessons.md` with an entry, or writing the field template anywhere but inside the fenced
  block under `## Entry shape`.
- Dropping any of the seven fields from the seeded template, or seeding `Automated guard` as optional — a
  missing guard is a refusal, and a seed that hedges it is where the hedge becomes the rule.
- Dropping the credential line from the seeded template — `Symptom` and `References` carry output
  verbatim, and an entry here is never edited, so a token written into one cannot be taken back out.
- Leaving `docs/lessons.md` matched by `.gitignore`, or adding it there — the reader it is written for is
  usually not the writer, and often arrives on a fresh clone.

## Verification (ending criteria)

Done when **all** hold:

- `STATE.md` exists at the repo root and contains the three legend lines with the token sets exactly:
  `feature state: spec · plan · building · done`, `slice state: impl · verify · review · ship · done ·
  blocked · halted`, `gate: you · agent · done`. **On a board this run created, no feature blocks**; on a
  re-run over one that already existed and was skipped, every block `plan-breakdown` added is left where
  it is. The legend is what this criterion is about. Demand an empty board over any copy and a repair
  re-run reports a repository's real work as a defect — and the cheapest way to clear that is to delete
  the board this skill exists to create.
- The commented example slice header carries the full column list in order —
  `| Slice | Title | Design ref | State | Gate | Blocked by | Artifacts |` — so the rows `plan-breakdown`
  writes later land in a board shape the orchestrator can read.
- `CONTEXT.md` (or `CONTEXT-MAP.md` for multi-context) exists at the repo root.
- Every `CONTEXT.md` the repo declares — the root one, plus each per-context file `CONTEXT-MAP.md` names —
  exists, is non-empty, and carries **exactly one** `## Glossary` heading with **every term entry under
  it**; no sibling `##` section holds entries. Check the entries, not the heading: a file whose terms all
  live under a heading of their own still contains `## Glossary`, and `spec-grilling` goes on appending to
  a section the terms are not in. Entries take the shape `spec-grilling`'s `references/CONTEXT-FORMAT.md`
  prescribes — the term in bold at the start of its own line, bulleted or not — and clusters group under
  `###`; a cluster written as `##` is what this catches.

  ```bash
  set --
  [ -f CONTEXT.md ] && set -- CONTEXT.md
  [ -f CONTEXT-MAP.md ] && set -- "$@" $(sed -n 's|.*(\([^)]*CONTEXT\.md\)).*|\1|p' CONTEXT-MAP.md)
  [ "$#" -gt 0 ] || { echo "no CONTEXT.md to check"; exit 1; }
  b=0
  for f do
    [ -s "$f" ] || { echo "$f: missing or empty — no ## Glossary heading"; b=1; continue; }
    awk -v f="$f" '/^## Glossary$/ { g++ }
         /^## / { s=$0 }
         /^([-*+] )?\*\*/ && s!="## Glossary" { print f":"FNR": entry outside ## Glossary"; b=1 }
         END { if (g!=1) { print f": "(g?g" ## Glossary headings":"no ## Glossary heading"); b=1 }
               exit b }' "$f" || b=1
  done
  exit $b
  ```

  `awk` runs no rule at all over a zero-length file, which is why the loop is per file with a `[ -s ]`
  guard ahead of it: one `awk` over the whole list carries the previous file's counters into an empty one
  and never reports it, so a failed write or a bare `touch` would pass. The list is built rather than
  hardcoded because a multi-context repo has no root `CONTEXT.md`; `CONTEXT-MAP.md` stays off it because
  its `## Relationships` lines are bold headwords that are not terms. The check assumes a `CONTEXT.md`
  holds the glossary and nothing else, so it flags any bold-led line outside `## Glossary` — read a hit as
  right about the shape and wrong about the file.

  **Exercise it in all three directions**, on a scratch copy: entries parked under a sibling `##` heading →
  non-zero, naming their line numbers; entries back under `## Glossary` → 0; one declared per-context
  `CONTEXT.md` truncated to zero length → non-zero, naming that file. The third is the one that gets
  skipped, and the only one that reaches the empty-file case.
- `docs/adr/` and `docs/features/` directories exist.
- `docs/session-state.md` exists, carrying the five field headings — `## Current objective`,
  `## Current state`, `## Remaining issues`, `## Boundaries`, `## Next phase` — and a `## Log` heading.
  **On a copy this run created, no log entry under `## Log` and no field filled in**; on a re-run over one
  that already existed and was skipped, every entry and every field is theirs and stays exactly as it is.
  This is the criterion with the most to lose. `## Log` holds reasoning no commit can reconstruct, so a
  run that cleared an unscoped emptiness check by emptying the log would have destroyed the file to pass a
  check on it. The five headings and `## Log` are required either way — on an adopted copy a missing one
  is reported to the user, who adds it; nothing here rewrites their file to make a criterion read true.

  Its text states the append-only rule, that an attempt to change an earlier entry is reported as a
  violation, what an entry holds and what it never holds, that it is the weakest source, and the promotion
  route to `docs/adr/` — a reader who has never seen this project can add an entry, and correct a wrong
  one, from the file alone.

  ```bash
  fresh=1   # 0 on a re-run over a copy that already existed and was skipped
  [ -s docs/session-state.md ] || { echo "docs/session-state.md: missing or empty"; exit 1; }
  awk -v fresh="$fresh" '
    /<!--/ { c = 1 }
    c      { if (/-->/) c = 0; next }
    /^```/ { fence = !fence; next }
    fence  { next }
    /^## / { h[$0] = 1
             field = ($0 ~ /^## (Current objective|Current state|Remaining issues|Boundaries|Next phase)$/)
             inlog = ($0 == "## Log")
             next }
    /^[[:space:]]*$/          { next }
    fresh && field            { print FILENAME":"FNR": a field is filled in on a copy this run created"; b=1 }
    fresh && inlog && /^### / { print FILENAME":"FNR": a log entry on a copy this run created"; b=1 }
    END { split("## Current objective|## Current state|## Remaining issues|## Boundaries|## Next phase|## Log", want, "|")
          for (i = 1; i <= 6; i++) if (!(want[i] in h)) { print FILENAME": heading missing: "want[i]; b=1 }
          if (fence) { print FILENAME": a fenced block is left open — every line after it goes unread"; b=1 }
          if (c)     { print FILENAME": an HTML comment is left open — every line after it goes unread"; b=1 }
          exit b }' docs/session-state.md
  ```

  **`fresh` is the whole check, and it is set rather than detected.** Nothing in the file records which run
  wrote it, so the knob carries the scope: leave it at `1` for a copy this run created, set it to `0` for
  one that already existed and was skipped. At `0` the two emptiness rules drop and the headings stay,
  which is the right shape — on an adopted copy the entries *are* the file. What is never right is
  clearing a report by editing the file. The two records below draw the same line with a separate `fresh()`
  call because there are two of them; here there is one file, so the scope is a knob rather than a second
  snippet.

  **`log` is an `awk` built-in**, which is why the variable is `inlog`. That is not a style preference:
  `awk` refuses the assignment outright with `syntax error` and `illegal statement`, on a line that reads
  fine to a person. The HTML-comment skip is the other half — the entry template lives inside a comment,
  so a bare `^### ` scan hits it and reports an entry in a log that is empty.

  **Exercise it in five directions**, on a scratch copy: the seed as written with `fresh=1` → `0`; the seed
  with the fields filled in and entries appended, still `fresh=1` → non-zero, naming every line; that same
  populated file with `fresh=0` → `0`, because those entries are what the file is for; `## Log` deleted →
  non-zero naming that heading, under either value of `fresh`; and the file truncated to zero length →
  non-zero. The third is the one that gets skipped, and it is the one the repair re-run depends on.
- `docs/session-state.md` is not matched by any `.gitignore` pattern; if one matched it, that was surfaced
  to the user rather than silently changed.
- A pre-existing `docs/session-state.md` was left untouched — no entry under its `## Log` was reworded,
  re-ordered, or removed.
- `docs/progress.md` exists, carrying a `## Entry shape` heading with the entry shape in a fenced block
  beneath it — including the "Not run" line and the credential line. **On a copy this run created,
  `## Entry shape` is the only `##` heading**; on a re-run over one that already existed and was skipped,
  every other heading is an entry and is left where it is. Its text states that the file is
  append-only, that an attempt to change an earlier entry stops the work and is reported, that a heading
  with nothing under it is a slice that started and did not finish, and that no entry carries a stage, a
  state, or an owner. A reader who has never seen this project can add an entry from the file alone.
- Nothing in `docs/progress.md` is a stage, state, gate, or owner token — not in the shape, not in the
  prose that introduces it. This file records what ran; the board records who acts next.
- `docs/progress.md` is not matched by any `.gitignore` pattern; if one matched it, that was surfaced to
  the user rather than silently changed.
- A pre-existing `docs/progress.md` was left untouched — no entry in it was reworded, re-ordered, or
  removed.
- `docs/lessons.md` exists, carrying a `## Entry shape` heading with the seven-field template in a fenced
  block beneath it, including the credential line. **On a copy this run created, `## Entry shape` is the
  only `##` heading**; on a re-run over one that already existed and was skipped, every other heading is
  an entry and is left where it is. Its text states that the file is read before a slice
  writes its skeleton, that an entry naming no `Automated guard` is refused, that it is append-only and an
  attempt to change an earlier entry stops the work and is reported, that the same lesson twice is two
  entries, and every party that writes an entry, and on what terms. **Take that roster off
  `references/write-ownership.md`'s write table, not off this line.** As it stands, three parties append entries:
  whoever root-causes a defect, a review with a `Critical:` finding, and the run that carries back an
  entry a slice handed it. A count written here goes stale the moment the table grows a writer, and this
  one already did — the courier row was added while both this criterion and the seed it grades still said
  two, so the criterion passed only for as long as the text it was grading was wrong. A reader who has
  never seen this project can add an entry from the file alone.
- `docs/lessons.md` is not matched by any `.gitignore` pattern; if one matched it, that was surfaced to
  the user rather than silently changed.
- A pre-existing `docs/lessons.md` was left untouched — no entry in it was reworded, re-ordered, or
  removed.
- **Both append-only records carry their entry shape where a check can find it:** one `## Entry shape`
  heading outside any fenced block, and beneath it a fenced template naming every field of that record.
  *Beneath* is load-bearing and the check enforces it: the fields are read from the first fenced block
  that opens after the heading, and from nowhere else. What this criterion deliberately does **not** say,
  unconditionally, is "and no other `##` heading". Every other heading in either file is an entry; this
  skill re-runs over repositories that already hold entries, and the escape hatch under "When to use /
  when to skip" says so in as many words. A criterion that counted headings over any copy would report a
  populated record as a defect — and the cheapest way for an agent to clear that is to delete the entries
  the file exists to keep. The fresh-scaffold half is the second check below.

  ```bash
  shape() {
    f=$1
    [ -s "$f" ] || { echo "$f: missing or empty"; return 1; }
    awk -v f="$f" -v fields="$2" '
      /^```/                       { fence = !fence
                                     template = (fence && h == 1 && !seen && !past)
                                     if (template) seen = 1
                                     next }
      !fence && /^## Entry shape$/ { h++; next }
      !fence && /^## /             { past = 1 }
      template && /^- [A-Z]/       { k = $0; sub(/:.*/, "", k); sub(/^- /, "", k); got[k] = 1 }
      END { if (h != 1) { print f": expected one \"## Entry shape\" heading outside a fenced block, found "h+0; b=1 }
            if (fence)  { print f": a fenced block is left open — every line after it goes unread"; b=1 }
            n = split(fields, want, "|")
            for (i = 1; i <= n; i++) if (!(want[i] in got)) { print f": field missing from the template under the heading: "want[i]; b=1 }
            exit b }' "$f"
  }
  b=0
  shape docs/progress.md 'Summary|Commands run|Results|Files changed|Not run|Follow-ups' || b=1
  shape docs/lessons.md 'Tags|Symptom|Root cause|Fix|Prevention|Automated guard|References' || b=1
  exit $b
  ```

  **The fence handling is the whole check, not a detail**, and it does three jobs. Each template's own
  first line is `## <date> — …`, so a scan that does not skip fenced lines reports the file it just wrote
  — the same way a scan that ignores its own fenced template does. Fields are collected from
  **one** fenced block, the first to open after the heading: collect from every fence instead and any
  entry that quotes a field supplies it, so a record whose template lost a field starts passing the
  moment somebody writes an entry, and the check goes blind on exactly the file it was written for. And
  the open-fence line is that same defect from the other side — an entry that opens a fence and never
  closes it puts every line after it on the wrong side of the toggle. Running it before believing it is
  what catches all three; reading it does not.

  **Exercise it in all seven directions**, on scratch copies: the two seeds as written → `0`; either seed
  with real entries appended after the fenced block → `0`, because entries are the thing these files are
  for; a field line cut from a template, plus an entry whose body quotes that field inside a fence →
  non-zero, naming that field; a template gutted, plus an entry that opens a fence and never closes it →
  non-zero, naming every field and the open fence; a template moved **above** its heading → non-zero,
  naming every field, because a template the heading does not sit over is not the one this criterion
  asks for; a template moved out of its fenced block → non-zero, naming every field of that record,
  which is the red flag above made mechanical; and either file truncated to zero length → non-zero. Add an
  eighth: the template deleted outright, the heading left, and one entry quoting every field inside a
  fence → non-zero, naming every field. That is what the `past` flag is for — once a `##` heading other
  than `## Entry shape` has gone by outside a fence, no later fence can be read as the template, so an
  entry can no longer supply the fields a deleted template owed.

  **Why the `[ -s ]` guard is there** — and it is not the reason it looks like. Over an *empty* file
  `awk` does run: no rule matches, but `END` fires, prints every missing field, and exits non-zero. The
  guard is for a *missing* file, where `awk` exits `2` with `can't open file` on stderr — a failure that
  reports through a different channel than every other one here. The guard turns both into one
  `missing or empty` line on stdout. Keep it, and keep the reason straight: a right check with a wrong
  reason attached is one the next reader deletes.

  **A copy this run created ships no entries, and that is a separate check.** The one above deliberately
  accepts entries, because it also has to pass over a repository that already holds them. Run this one
  only over a record you created in this run, and drop the call for one you skipped — pointed at a file
  somebody else filled, it reports their entries as a defect, and the cheapest way for an agent to clear
  that is to delete them.

  ```bash
  fresh() {
    awk -v f="$1" '
      /^```/           { fence = !fence; next }
      !fence && /^## / { n++ }
      END { if (n != 1) { print f": a record this run created carries one \"## Entry shape\" heading and no entries; found "n+0; exit 1 } }' "$1"
  }
  fresh docs/progress.md && fresh docs/lessons.md
  ```

  It skips fenced lines for the reason above: each template's own first line is a `## <date> — …`
  heading, so a bare `grep -c '^## '` counts the template as an entry and reports every fresh scaffold as
  a defect. Exercise it both ways — the two seeds as written → `0`; either seed with one entry appended →
  non-zero, naming the count.
- Exactly one of `CLAUDE.md` / `AGENTS.md` contains an `## Agent skills` block referencing every substrate
  file this skill scaffolds — as it stands six: `STATE.md`, `CONTEXT.md`, `docs/adr/`,
  `docs/session-state.md`, `docs/progress.md`, and
  `docs/lessons.md`. **Take the list off item 5 of *Write* above, not off this line.** A hand-written list
  falls behind the substrate it describes without anything failing: this one named seven against a substrate of eight for as
  long as it took `docs/lessons.md` to reach that substrate, and in that state it passed over a block with no route to
  the record a slice is supposed to read before it builds. `grep -o` for the paths in both places answers
  it in one comparison. The other file holds no copy of that block.
- The other filename exists and is a pointer naming the file that holds the block — unless it already
  existed with the user's own content and they declined the pointer line, which was shown to them rather
  than silently skipped.
- **Both filenames exist, and every pointer resolves.** Run this from the repo root — it prints nothing
  when both files are there and each pointer names a file that is there, and says what is wrong otherwise:

  ```bash
  bad=0
  for f in CLAUDE.md AGENTS.md; do
    if [ ! -f "$f" ]; then
      echo "missing: $f — one of the two holds the rules, the other points at it"
      bad=1
      continue
    fi
    named=$(sed -n 's/^The rules for this repository live in `\(.*\)`\..*/\1/p' "$f")
    if [ -n "$named" ] && [ ! -f "$named" ]; then
      echo "broken pointer: $f names $named, which does not exist"
      bad=1
    fi
  done
  [ "$bad" -eq 0 ]
  ```

  Two failures, one check. A pointer to a file nobody kept is worse than no pointer, because it reads as
  an answer — and a filename that is simply absent is worse still, because a contributor whose tool reads
  only that name opens nothing at all and never learns the rules exist. The check finds the named file by
  reading the seed's first sentence, which is why that sentence is fixed wording.
- That `## Agent skills` block tells a fresh agent to read `docs/session-state.md` — both zones — **before
  starting work**, and states that `## Log` is append-only. Without that line the log has no reader.
- It also tells an agent resuming work it was not present for to read `docs/progress.md`, and says what
  that file does not answer. A record with no declared reader is a maintained file nobody opens.
- And it tells a slice to read `docs/lessons.md` **before it writes its skeleton** — the moment the
  knowledge is worth anything, since read afterwards a lesson is a post-mortem of work already done. Three
  append-only records, three declared readers: a record nobody is told to open is a maintained file with
  no consumer, and this is the third.
- That block also names `docs/design.md` and `ARCHITECTURE.md` — the first user interface built here writes
  the one, the first feature to run `architecture-design` writes the other — and **this run created
  neither**. Both halves are load-bearing, and they pull opposite ways: a cold agent that has to invent a
  path invents a different one, which is why both are named; and a file scaffolded empty reads like a
  decision somebody made, which is why neither is created. These two are also why the criterion above
  counts the *scaffolded* substrate rather than every path the block mentions — a completeness check that
  swept them in would be demanding the very files this one forbids.
- If a fresh `CLAUDE.md` was created (neither file existed and the user chose it), it leads with the bundled
  behavioral template and the `## Agent skills` block follows; no template was written into an `AGENTS.md` or
  over a pre-existing `CLAUDE.md`.
- No pre-existing user content was overwritten.

## Outputs & handoff contract

Emits the repo substrate the whole suite consumes:

| Artifact | Location | Stable section(s) downstream depend on |
|---|---|---|
| `STATE.md` | repo root | the header: `feature state` / `slice state` / `gate` legends, plus the slice-row column list `Slice · Title · Design ref · State · Gate · Blocked by · Artifacts` (empty board) |
| `CONTEXT.md` | repo root | `## Glossary` (terms only, no implementation detail) |
| `docs/adr/` | repo-wide | the ADR home (`ADR-<NNN>-<slug>.md`) |
| `docs/features/` | repo-wide | per-feature artifact root (`docs/features/<slug>/`) |
| `docs/session-state.md` | repo-wide | the five snapshot fields (`## Current objective` · `## Current state` · `## Remaining issues` · `## Boundaries` · `## Next phase`) plus `## Log`, append-only and scaffolded empty. Entries hold the decision, the reason, what was ruled out, and what is still open — never what git already shows. Earlier entries never change, and an attempt to change one is reported as a violation. Weakest source in the repo: outranked by `docs/adr/` and a signed `acceptance.md`, with promotion to `docs/adr/` as the way out. Committed, never ignored |
| `docs/progress.md` | repo-wide | `## Entry shape` plus the fenced entry shape beneath it, field for field as the *progress.md seed* section above writes it — scaffolded with no entries. Append-only: entries are never edited, re-ordered, or removed, and an attempt to change one stops the work and is reported. Every other `##` heading is an entry. Holds no stage, state, gate, or owner — that is the board's question. Committed, never ignored |
| `docs/lessons.md` | repo-wide | `## Entry shape` plus the fenced template beneath it, field for field as the *lessons.md seed* section above writes it — scaffolded with no entries. An entry naming no `Automated guard` is refused. Append-only: entries are never edited, re-ordered, or removed, and an attempt to change one stops the work and is reported. The same lesson twice is two entries, never a merge. Every other `##` heading is an entry. Committed, never ignored |
| `CLAUDE.md` / `AGENTS.md` | repo root | one carries the `## Agent skills` block, the other a pointer naming it — never two copies of the block, and never a missing file; a fresh `CLAUDE.md` also leads with the bundled behavioral template |

**Named in the substrate, created by nobody here: `docs/design.md` and `ARCHITECTURE.md`** — the repo's
decided look, which every later interface inherits and records only its differences from, and the repo's
structure, which every later feature inherits the same way. The **first** UI surface writes the one, via
`frontend-design`; the **first** feature to run `architecture-design` writes the other. This skill names
both paths so a cold agent reads one instead of inventing one, and scaffolds neither. Seeding either one
empty is the move to avoid: an empty look or an empty layering reads as a decision somebody made, when
nobody has.

Downstream consumers: `interview-me`/`idea-refine` → `docs/features/<slug>/intent.md`; `spec-grilling` →
appends `CONTEXT.md` + writes `docs/adr/`; `to-prd`/`acceptance-criteria`/`environment-manifest` → `docs/features/<slug>/`;
`plan-breakdown` → adds feature blocks + PRD-namespaced slice rows to `STATE.md`; `handoff` → writes the five fields of `docs/session-state.md` and appends to its `## Log`;
`incremental-implementation` and the `orchestrator` → append one entry per slice to `docs/progress.md`;
`debugging-and-error-recovery` → appends a `docs/lessons.md` entry per root-caused defect, `code-review` →
appends one for a Critical finding and nothing lesser, and the `orchestrator` → appends the entries slices
hand back; `incremental-implementation` reads `docs/lessons.md` before it writes a slice's skeleton;
`using-agent-skills` → reads `docs/session-state.md` and `docs/progress.md` at the start of every session,
before any work begins;
the orchestrator drives
the slice/gate columns. tracker = local. `STATE.md` update by `project-setup`: create the empty board only.
