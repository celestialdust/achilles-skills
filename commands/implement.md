---
description: Implement ONE thin vertical slice test-first — skeleton first, then red, green, refactor. Single-slice by design; for the whole-plan autonomous run use /orchestrate.
---

Implement — one thin vertical slice, test-first.

Run `incremental-implementation`, which applies `test-driven-development`. The argument names the
slice; with none, take the next ready row on `STATE.md`.

It reads `docs/lessons.md` and the slice's `plan/<slice-id>.md` first, stubs the slice end to end so it
compiles, then takes each scenario red, then green, then refactored, runs the suite and the build, commits the
slice as atomic revertible units, and stops.

Emits those commits — the diff Verify grades cold — one `docs/session-log.md` entry per call decided
for you, and this slice's `State` and `Gate` cells inside a run.

A failing test or a broken build goes to `debugging-and-error-recovery` before another attempt; a
confident, high-stakes call goes to `doubt-driven-development`.

One slice only. Hand off to `/verify`.
