---
name: pull-request
description: Open a design-anchored DRAFT pull request that ENDS a slice — turn green, reviewed code into it, then STOP. Reach for this the moment a slice's three internal gates are green (qa.md pass · review fan-out clear · evaluator floors met). It anchors the Summary to prd.md + ADRs (NEVER a commit-log dump), names the 3-5 highest-risk files as a mandatory reviewer code-reading checklist, builds the test plan from qa.md's ledger with a REQUIRED human-ack line for every not-reachable scenario, attaches an inverted risk band, and opens an OPEN draft PR on the slice branch for async human merge. It NEVER merges to main, marks the PR ready, or triggers a deploy — the human owns the merge (D29). If you are tempted to skip the read-the-code checklist, open a PR without a passing verify gate, or "just merge it to move on", use this instead.
---

## Purpose

Stage: **Ship — per-slice workhorse.** The autonomous span ends here.

Source: QRSPI p.2/p.7 — after six months of "don't read the code," Dex's team had to rip out and
replace large parts of their system. The PR is the enforcement point for the **read-the-code**
principle, and — under the D29 autonomy model — the **last thing the agent does before handing the
slice to a human**. With the per-wave Verify gate gone, the **async human merge is the suite's sole
independent oracle**, so the PR is not a formality: it is the curated, design-anchored, risk-banded
brief that decides whether a human can merge safely *without re-reading the entire diff cold*.

Three reasons this is its own skill, not a cleanup step inside implement/review:
1. **The code-reading gate is skipped under pressure if it's a footnote.** A dedicated skill with
   fresh focus makes the reviewer checklist non-optional.
2. **The PR body's job is human communication, not step-execution.** It anchors the diff to upstream
   design (`prd.md` + ADRs), narrates the slice end-to-end, and lists the highest-risk files to read.
3. **The internal gates are already closed.** `quality-verification` + the Review fan-out + the evaluator floors ran
   before this skill; `pull-request` is the handoff to humans, not a second evaluation pass.

## When to use / when to skip

**Use** to close a slice: its code is committed on the slice branch and all **three agent-internal
gates are green** — `qa.md` `## Verdict` = pass · the Review fan-out is clear · the evaluator floors
are met (correctness≥8, testing_strategy≥7, plan_adherence≥8, regression_surface≥9).

**Skip / refuse:**
- Any internal gate is not green → **no PR** (route back per `qa.md` / Review findings).
- A security **CRITICAL/HIGH** or a **secret in the diff** → **hard halt, no PR ever** (D29 /
  security.md); top the report, and for a committed secret fire **PushNotification** + freeze the
  next barrier.
- `depth: lite` — a docs-only or config-only slice still gets a PR, but the code-reading checklist may
  name **fewer than 3** files: name what is actually risky, do not pad.

**Never** `gh pr merge`, push to `main`, or trigger a deploy — those are fenced behind the human
(D29; branch-naming.md).

## Inputs

Resolve each in order: (1) inline in the prompt, (2) a path in the prompt, (3) the canonical
per-feature/repo path. **Refuse to run, naming the missing input**, if any required value cannot be
resolved from any source.

| Input | Source artifact (path) | Used for |
|---|---|---|
| Verify ledger | `qa.md` (`docs/features/<slug>/qa.md`): `## Behavioral ledger` · `## Verdict` | the **Test plan** + the human-ack lines; `## Verdict` = pass is a hard gate |
| Product anchor | `prd.md` (`## Solution` / `## User Stories`) + referenced **ADRs** by id | the **Summary** "why" — never from commit messages (D18) |
| Plan + slice | `plan.md` + the slice row (id · Story-ref · Blocked by; the human title lives in `STATE.md`, not `plan.md`) | the **Diff narration** + the slice id in the title |
| Behavioral contract | `acceptance.md` (scenario ids, e.g. `PWR-A1`) | cross-check the ledger; each `not-reachable` id ⇒ a human-ack line |
| The slice diff | `git diff <base>..HEAD` + `git log --oneline <base>..HEAD` (base = the slice branch's base; `--base <ref>` overrides) | highest-risk-file selection + secret scan |
| Evaluator floors (a gate, **not** a `pull-request` input) | **orchestrator-enforced agent-internal gate** (D29) — there is no `evaluator` skill in the roster; the orchestrator checks correctness≥8 · testing_strategy≥7 · plan_adherence≥8 · regression_surface≥9 *before* dispatching `pull-request` | the hard refuse-to-run gate below — `pull-request` reads the verdict, it does not compute the floors |

**Refuse-to-run gate (hard):** the resolved `qa.md` `## Verdict` records **pass**, the Review fan-out
is clear, and the evaluator floors are met. Without a passing internal-gate set, `pull-request` opens no PR.
Recovery message names the missing/failing gate and points at `qa.md` / the Review findings.

## Process

### Step 1 — Identify the highest-risk files
Read the diff. Pick the **3-5 files** most likely to hide a subtle correctness defect: new
abstractions, complex logic, side effects, or the largest line-count changes. These become the
reviewer code-reading checklist. "All changed files" is **not** a checklist.

### Step 2 — Compute the risk band (inverted risk report, D29)
The load-bearing addition over cr-pr. For this slice, collect from `qa.md` `## Verdict` and the
evaluator result:
- which evaluator floors landed **at the line** (e.g. `regression_surface = 9` exactly);
- qa coverage **derived from the ledger** as exercised ÷ total scenarios (`qa.md` emits no coverage %, only the `## Behavioral ledger`), plus any scenario id classified **not-reachable** there;
- rounds consumed (of the 3 implement→verify→review cycles);
- whether any test or `acceptance.md` line was touched during retries (must be **none** — the
  frozen-artifact invariant);
- whether the declared `regression_surface` narrowed (must be **none**).

A clean slice → **LOW**. Floors at the line / a not-reachable scenario / 3-of-3 rounds / a non-empty
"tests touched" → **MEDIUM**. Surface narrowing or a frozen-artifact edit should already have HALTED
upstream — **if seen here, HALT and open no PR** (gate-erosion).

### Step 3 — Push the slice branch
```bash
git push -u origin <slice-branch>   # e.g. cluster/C-007 or feat/<slug>; NEVER push to main
```

### Step 4 — Open the DRAFT PR (fail-closed)
The terminal state of a passing slice is a **DRAFT** PR (D29). `pull-request` itself **never** marks it ready;
promotion to ready-to-merge is done by a separate fresh **code-cold verifier with no test-write
access** (see *Outputs & handoff*).
```bash
gh pr create --draft \
  --title "<type>(<scope>): <slice-id> <description under 70 chars>" \
  --body "$(cat <<'EOF'
## Summary
- <why this slice exists — drawn from prd.md ## Solution / a referenced ADR, NOT commit messages>

## Upstream artifacts
- PRD: [prd.md](<path>)  ·  ADRs: <ADR-007, …>  ·  Plan/slice: [plan.md](<path>) (<slice id>)
- Acceptance: [acceptance.md](<path>)  ·  Verify ledger: [qa.md](<path>)

## Diff narration
**<slice-id> — <title>:** <what this slice does end-to-end, layer to layer — not a file list>

## Test plan
**Exercised (from qa.md ## Behavioral ledger):**
- <PWR-A1>: <the behavior this test proves>

**Not reachable — REQUIRED human ack, do not leave blank (D29):**
- [ ] <PWR-A3>: <why unreachable in this slice> — human must acknowledge before merge

## Code-reading checklist
**Reviewers: check each file before approving.**
- [ ] `<file 1>` — <one sentence: why highest-risk>
- [ ] `<file 2>` — <one sentence>

## Risk band: <LOW|MEDIUM>
- floors at the line: <none | regression_surface=9, …>
- qa coverage (exercised/total from qa.md ## Behavioral ledger): <e>/<t>  ·  rounds consumed: <n/3>  ·  tests/acceptance touched: <none | …>  ·  surface narrowed: <none>
EOF
)"
```
Return the PR URL.

## PR body anatomy (the design-anchored contract)
Each section earns its place; none is decorative:
- **Summary** = the *why*, traced to `prd.md`/ADRs. A commit-message restatement is a failure.
- **Upstream artifacts** = the links that let a reviewer open the design behind the diff (D18: the PR
  references ADRs by id; it never restates their rationale).
- **Diff narration** = end-to-end prose ("this slice wires the token endpoint and persists the 1-hour
  TTL"), never "changed auth.ts, added test".
- **Test plan** = the `qa.md` ledger, made human-legible — exercised behaviors + the not-reachable
  acks. The agent does **not** invent a scenario↔test map here (D12); it transcribes the ledger.
- **Code-reading checklist** = the 3-5 highest-risk files with a one-line rationale each. This is the
  proof a human read the code — the gate whose absence cost Dex's team a rip-and-replace (QRSPI p.7).
- **Risk band** = the inverted risk report (D29): draws the human's scarce attention to the *quiet
  greens* where unattended defects actually ship, surfaced alongside (not buried under) the halts.

## Rationalizations
- "The commit messages already explain it." → No. Summary bullets come from `prd.md`/ADRs (the
  *why*), not a `git log` dump (D18).
- "Reviewers can just open the files tab." → The curated 3-5 highest-risk checklist *is* the
  deliverable; an unfiltered diff is exactly what made Dex's team rip-and-replace (QRSPI p.7).
- "`quality-verification` marked one scenario not-reachable; I'll just omit it." → Every `not-reachable` id is a
  **REQUIRED human-ack line** in the body (D29); silently absorbing it defeats the sole human oracle.
- "All gates passed, I'll open it ready-to-merge to save a step." → Fail-closed: the terminal state is
  **DRAFT**; only the fresh code-cold verifier promotes (D29). Marking it ready yourself is gate-erosion.
- "A retry tweaked a test to make it pass." → That is a frozen-artifact violation; **HALT**, open no PR.

## Red flags (STOP)
- A security CRITICAL/HIGH or a secret in the diff → **no PR, hard halt**, top the report; a committed
  secret → **PushNotification** + freeze the next barrier (security.md's literal STOP).
- An internal gate (`quality-verification` / Review / an evaluator floor) is not green → **no PR**.
- The `regression_surface` narrowed, or a frozen test / `acceptance.md` line changed during retries →
  **HALT** (gate-erosion); do not ship.
- You are about to `gh pr merge`, push to `main`, or trigger a deploy → **STOP**; the human owns the
  merge (D29).
- The code-reading checklist is empty, generic, or says "all files" → rewrite before opening.

## Verification (ending criteria)
Done when ALL hold:
- [ ] A **DRAFT** PR is open on the slice branch (never on `main`); URL returned.
- [ ] Summary bullets trace to `prd.md`/ADRs; no commit-log dump.
- [ ] Code-reading checklist names 3-5 (or fewer, if `lite`) highest-risk files, each with a one-line
      rationale.
- [ ] Test plan reflects `qa.md` `## Behavioral ledger`; **every** `not-reachable` scenario id has a
      REQUIRED human-ack checkbox.
- [ ] Risk band computed and attached (LOW/MEDIUM, with floors-at-line · qa % · rounds · touched-tests
      · surface-narrowed).
- [ ] Secret scan clean; build + tests green; diff ≤ 400 LOC.

## Outputs & handoff contract
**Emits: PR** (open, **draft**, risk-banded) — stable body sections `## Summary` · `## Upstream
artifacts` · `## Diff narration` · `## Test plan` (with human-ack lines) · `## Code-reading checklist`
· `## Risk band`. Anchored to `prd.md`/ADRs (D18); risk band per D29. Change a stable section's shape
→ update the consumer (the human merge gate + any release skill) in the same commit.

**STATE.md update:** the slice row → `State: ship` then `done`; `Gate: you` (the async human merge is
the surviving final gate, N1/D29); `Artifacts:` += `PR #<n>`.

**Handoff (D29 fail-closed promotion):** `pull-request` stops at the DRAFT PR. A separate fresh **code-cold
verifier with no test-write access** (a NEW checker each round, seeing only `acceptance.md`) promotes
draft → ready-to-merge after the **integration gate** on the connected DAG component passes.
**Cohesion:** loose feature → promoted greens become individual ready PRs (partial delivery); tight
feature → if any sibling slice halted, hold this PR **DRAFT** (atomic; never hand a human half a
feature).

**Merge is the human's** — never auto-merge to `main`; auto-deploy is OUT of v1 (branch-naming.md;
D27 `ci-cd`/`shipping-and-launch` deploy actions are fenced behind the human merge).

## Neighbor skills
- Curating the reviewer's focused context: the `code-review` Review fan-out, whose findings must be
  clear before `pull-request` runs.
- Branch-push / worktree-cleanup lifecycle is owned by the `orchestrator` (D15/D24); `pull-request` executes the
  push, the orchestrator reclaims the worktree.
