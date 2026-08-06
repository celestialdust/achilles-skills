---
description: "One-time repo bootstrap — scaffold the shared substrate every achilles skill assumes: the STATE.md board, the CONTEXT.md glossary, docs/adr/, docs/features/, docs/test-contract.md, docs/workflow.md, docs/session-state.md, and the `## Agent skills` block."
---

Invoke the **project-setup** skill — the one-time bootstrap that creates the repo ecosystem the rest of the suite reads cold.

## Mode

Run-once and **human-confirmed** — this is NOT part of the autonomous Implement→Ship run. project-setup is prompt-driven: explore the repo, present what exists vs. what's missing, walk the user through the one surviving choice (single- vs. multi-context domain docs) one decision at a time, confirm the drafts, then write. Adopt-don't-overwrite: never clobber an existing `CONTEXT.md`, `STATE.md`, or `## Agent skills` block.

## Notes

- Run **once per repo**, before the first feature — before `/ideate` or `/spec`. Skip if `STATE.md` already exists and the substrate is intact (re-run only to repair).
- Distinct from `preflight-readiness`: that's the per-wave environment gate; this is the one-time repo scaffold.
- Scaffolds the substrate — `STATE.md` (empty two-level board), `CONTEXT.md` (`## Glossary` stub), `docs/adr/`, `docs/features/`, `docs/test-contract.md` (the repo's permanent scenarios, seeded with no rows — only a person ever activates one, and activation is one-way), `docs/workflow.md` (the process contract, copied verbatim from the bundled template), `docs/session-state.md` (where the work stands, plus an append-only log of decisions a resuming session reads first), and the `## Agent skills` block in `CLAUDE.md` or `AGENTS.md`. No values, secrets, or commands; no feature/slice rows, no test-contract rows, no log entries.
- One of those two files holds the rules; the other is then created as a short pointer naming it, so a contributor whose tool reads that filename lands in the right place instead of an empty file. The block is never copied into both — two copies drift, and a reader cannot tell which one is lying.
- If the repo has neither a `CLAUDE.md` nor an `AGENTS.md` and you choose to create `CLAUDE.md`, it's seeded with a small set of project-agnostic behavioral guidelines (a bundled template) above the `## Agent skills` wiring.
- Hands off to `/ideate` (fresh idea → intent.md) or `/spec`; downstream skills then read and append to these files.
