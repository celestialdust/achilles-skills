---
description: Implement ONE thin vertical slice test-first — skeleton, RED, GREEN, refactor, verify. Single-slice by design; for the whole-plan autonomous run use /orchestrate.
---

Invoke the incremental-implementation skill, which applies test-driven-development. This command builds ONE thin vertical slice and stops — it is deliberately not the whole-plan runner.

## Mode

Single-slice (the only mode). The argument, if any, names which slice to build; otherwise pick the next pending slice from plan.md. There is no `auto` flag here: autonomous, wave-parallel execution of the whole dependency DAG to risk-banded open draft PRs is /orchestrate's job (it never auto-merges). If the user wants "build everything", route them to /orchestrate.

## The slice

1. Read the slice's behavioral scenarios in acceptance.md (the contract this slice must realize).
2. Load only the context this slice needs — existing code, patterns, types.
3. Skeleton-first: stub the slice end-to-end so it compiles, then drive it with test-driven-development — RED (a failing test for the next scenario), GREEN (minimum code to pass), refactor.
4. Run the full suite for regressions, then the build for compilation.
5. Commit the slice as one atomic, revertible unit, then stop. Hand off to /verify for the code-cold acceptance pass.

## Stop and ask (do not push through)

- A test can't be made to pass or the build breaks without an obvious fix -> follow debugging-and-error-recovery.
- The slice is high-risk or irreversible (auth/permissions, destructive migrations, payments, deletions, deploys, secrets) -> follow doubt-driven-development and get explicit sign-off before continuing.
