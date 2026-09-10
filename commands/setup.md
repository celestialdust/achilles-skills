---
description: One-time repo bootstrap — scaffold the substrate every skill reads cold: the STATE.md board, the CONTEXT.md glossary, docs/adr/, docs/features/, and the session-state, session-log and lessons files.
---

Setup — the one-time repo scaffold, before the first feature.

Run `project-setup`. It explores the repo, shows what exists against what is missing, confirms the
drafts with you, then writes — adopting whatever is already there instead of overwriting it.

Emits five seeded files and two directories:

- `STATE.md` — the board's title and legend, no feature block.
- `CONTEXT.md` — one `## Glossary`, the entry shape, no terms.
- `docs/session-state.md` — the five headings, blank.
- `docs/session-log.md` and `docs/lessons.md` — each with its entry shape and no entries.
- `docs/adr/` and `docs/features/`.

It also writes the `## Agent skills` block into one of `CLAUDE.md` / `AGENTS.md` and a short pointer to
it in the other, never the block into both.

Run once per repo, or again to repair a missing file. The per-wave environment gate is
`preflight-readiness`, not this.
