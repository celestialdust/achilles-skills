---
name: project-setup
description: Scaffold the repo substrate the suite reads cold: the STATE.md board, CONTEXT.md, the ADR and per-feature homes, the session snapshot, the append-only log and lessons record, and the `## Agent skills` block. Run it once per repo before the first feature, or to repair a missing one. Not the per-run environment gate — preflight-readiness owns that.
---

# Project setup

## Purpose

**Stage: cross-cutting.** Principles 5, 6, 9.

The one-time bootstrap. It writes what every other skill reads cold — the board, the glossary, the ADR
and per-feature homes, the three session records — plus the `## Agent skills` block in one rules file and
a pointer in the other. Without it each skill re-derives where the board is and where a decision gets
written down, and the answers disagree.

## When to use / when to skip

- **Use** once per repository, before the first feature — ahead of any Ideate, Spec or Plan work.
- **Re-run to repair** a missing substrate file, or a pointer naming a file no longer there — nothing
  watches for either between runs.
- **Skip** when `STATE.md` is there and the substrate is intact. Not per feature — `plan-breakdown`
  appends feature blocks to a board that already exists.
- **Not** the per-run environment gate that re-fires every wave; `preflight-readiness` owns that.
- **Not** the glossary or the ADRs themselves — `spec-grilling` fills what this run leaves empty.

## Inputs

Read as they are; nothing upstream feeds this.

- `CLAUDE.md` / `AGENTS.md` — helps: says which already holds the rules · without it: ask the person, or
  with nobody there create `CLAUDE.md` and mark it `derived`.
- The seven under Outputs — helps: says what to adopt · without it: create that one.
- `.gitignore` — helps: says whether a record would be ignored · without it: nothing is ignored.
- `git remote -v` — helps: names the project in the seeds · without it: the directory name, `derived`.

## Process

1. **Read the repo before writing to it** — both rules filenames, the seven, `.gitignore`,
   `git remote -v`. The tracker is always the local `STATE.md` board; where issues live is never asked.

2. **Ask at most two questions, and only with a person there** — which file holds the rules when neither
   exists, and whether the pointer may go into the other when it already carries content. One at a time,
   each with a one-line explainer. With nobody there create `CLAUDE.md`, add the pointer, mark both
   `derived`.

3. **Adopt every file that already exists, in place** — repair what is missing, clobber nothing: a
   `docs/session-log.md` or `docs/lessons.md` entry exists nowhere else.

4. **Write the seven, skipping any that exist**, from [`references/seeds.md`](references/seeds.md) — the
   two directories each with a `.gitkeep`. Seed no entry and fill no field: these are structure, not
   config, so no value, no shell command, and never a credential's value
   ([`safety-rails.md`](../../references/safety-rails.md)).

5. **Put the `## Agent skills` block from [`references/seeds.md`](references/seeds.md) in exactly one
   file** — `CLAUDE.md` if it exists, else `AGENTS.md`, else the choice from step 2. Update a block
   already there in place rather than appending a second; leave its neighbours alone. Check the seed's
   file list against what step 4 wrote, not against memory.

6. **Seed a fresh `CLAUDE.md` from [`assets/CLAUDE.template.md`](assets/CLAUDE.template.md)**, block
   beneath. Only for a `CLAUDE.md` this run creates — never into an `AGENTS.md`, never over an existing one.

7. **Write the pointer from [`references/seeds.md`](references/seeds.md) into the other filename**, its
   first sentence verbatim — the check below reads that line to find the file it names. If the person
   declines it, say what that leaves: a tool opening a file that routes nowhere.

8. **Surface a `.gitignore` pattern matching any record rather than editing that file yourself.**

9. **Report what landed** — which file holds the rules, which is the pointer, what each record is for and
   who writes it. Name what is theirs to hand-edit: `STATE.md`, `CONTEXT.md`, the five snapshot fields;
   never a log or lessons entry.

## Rationalizations

- "Issues already live on GitHub." → `STATE.md` is the only work surface here; nothing else has a gate.
- "The glossary can wait for terms." → the Spec sitting has nowhere to append if it is absent.
- "The pointer file may as well repeat the important rules." → that is the second copy, and a reader
  cannot tell which is stale.
- "This log is messy; a clean re-scaffold helps." → its entries exist nowhere else, and a tidy file that
  lost them proves nothing.
- "One seeded entry makes the shape obvious." → the shape is in the fenced block; a seeded entry claims
  work happened here.
- "These are run scratch files." → an ignored record dies on the next fresh clone, its one real reader.

## Red flags

- The `## Agent skills` block in both rules files, or a second copy beside one already there.
- A pointer naming a file that is not there, or reworded away from the seed's first sentence.
- A seeded entry in the log or the lessons record, or a filled field in the snapshot.
- `STATE.md` scaffolded with feature blocks or slice rows, or its cells holding sentences.
- The behavioural template written into an `AGENTS.md`, or over a `CLAUDE.md` that already existed.
- A record added to `.gitignore`, or a `.gitignore` match quietly edited away here.

## Verification

- [ ] The seven exist and this run created no eighth — no `docs/progress.md`, `docs/design.md`,
      `CONTEXT-MAP.md`.
- [ ] One rules file carries the block, naming all seven and sending a fresh agent to the snapshot before
      work, the log before re-opening a question, the lessons before a skeleton. The other holds the
      pointer alone.
- [ ] `docs/lessons.md` carries one `## Entry shape` heading outside any fence, the seven-field template
      in the first fenced block beneath it.
- [ ] Nothing this run created carries content — the counts below run only over a record this run created.

```bash
for f in STATE.md CONTEXT.md docs/session-state.md docs/session-log.md docs/lessons.md; do
  [ -s "$f" ] || echo "missing or empty: $f"          # -s: a missing file reports on stderr
  git check-ignore -q "$f" && echo "ignored by .gitignore: $f"
done
for d in docs/adr docs/features; do [ -f "$d/.gitkeep" ] || echo "missing: $d/.gitkeep"; done
grep -c '^## Glossary$' CONTEXT.md                                                       # 1
awk '/^## Log$/{print "pre-split ## Log — handoff migrates its entries"}
     /^## /{h++;next} h&&NF{print "filled: "FNR} END{print h+0}' docs/session-state.md   # 5, nothing else
awk '/<!--/{c=1} c{if(/-->/)c=0;next} /^### /{n++} END{print n+0}' docs/session-log.md    # 0
awk '/^```/{f=!f;next} !f&&/^## /{n++} END{print n+0}' docs/lessons.md                    # 1
for f in CLAUDE.md AGENTS.md; do
  [ -f "$f" ] || { echo "missing: $f"; continue; }
  n=$(sed -n 's/^The rules for this repository live in `\(.*\)`\..*/\1/p' "$f")
  [ -z "$n" ] || [ -f "$n" ] || echo "broken pointer: $f names $n"
done
```

- [ ] Each ran once against a scratch copy that should fail it — an entry pasted into the log, a filled
      snapshot field, the pointer's target renamed, a zero-length `CONTEXT.md` — and reported. A check
      nobody has watched fail reads like one that cannot.
- [ ] A `.gitignore` match, or a `## Log` heading in an adopted snapshot, was reported rather than fixed
      here — `handoff` migrates such entries into the log verbatim.

## Outputs & handoff

Five seeded files from [`references/seeds.md`](references/seeds.md) and two directories, each skipped if it
exists. Shape, tokens and writers for the four state files are stated once in
[`state-schema.md`](../../references/state-schema.md). Report what you wrote against its cap; nothing
over-cap is handed on as if it fit. No verdict — the scaffold is reported in conversation.

- `STATE.md` · the title and three legend lines, no feature block.
- `CONTEXT.md` · 1,000 words — one `## Glossary`, no terms, the comment stating the entry shape.
- `docs/adr/` · 350 words per record — the ADR home, `ADR-<NNN>-<slug>.md`, plus `.gitkeep`.
- `docs/features/` · cap per its writer — the root `docs/features/<slug>/`, plus `.gitkeep`.
- `docs/session-state.md` · 300 words — the five headings, blank.
- `docs/session-log.md` · 60 words per entry — the preamble and the entry shape in an HTML comment, no entry.
- `docs/lessons.md` · 80 words per entry — `## Entry shape`, the seven-field template fenced beneath it,
  no entry.

Plus the `## Agent skills` block in one rules file and the pointer in the other, both from
[`references/seeds.md`](references/seeds.md) — a block inside an existing file, never an eighth scaffolded
one. A fresh `CLAUDE.md` leads with `assets/CLAUDE.template.md`.
