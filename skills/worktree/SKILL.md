---
name: worktree
description: Use the instant a slice is about to be implemented and needs its own isolated, clean-baseline workspace — BEFORE any code is written. Detects existing isolation first (never double-nests, never fights the harness), prefers a native worktree tool over raw `git worktree add`, installs deps, and proves the test baseline is green so new failures are distinguishable from old ones. If you are about to run `git worktree add` without checking whether you are already isolated or a native tool exists, or about to start implementing without a verified-clean baseline — STOP and use this.
---

# worktree — per-slice isolation mechanism (Implement stage, orchestrator-owned)

## Purpose

**Stage: Implement — the isolation MECHANISM the `orchestrator` owns (D15/D24).** Before a
slice is implemented it needs a workspace that (1) cannot corrupt the human's current branch and
(2) starts from a *known-clean* baseline. Without (1), two parallel slices in a wave clobber each
other's working tree; without (2), the agent cannot tell a bug it just introduced from one that was
already there — and silently ships on a red baseline. This skill establishes both, then hands the
workspace to `incremental-implementation`. **Core principle (from superpowers): detect existing isolation first, then
use native tools, then fall back to git — never fight the harness.**

**Announce at start:** "Using the worktree skill to set up an isolated, clean-baseline workspace."

## When to use / when to skip

**Use when** the orchestrator is about to dispatch a slice into `incremental-implementation` and hands you a branch
name (per `branch-naming.md`), or a human asks for "an isolated workspace / a worktree / a clean
branch to work on" before starting feature work.

**Skip when:** Step 0 detects you are ALREADY in a linked worktree on the intended branch (do not
nest a second one — skip to setup); you are doing a trivial read-only investigation with no commits;
or the user has explicitly declined isolation (then work in place and just run setup + baseline).

**Escape hatch (`depth: lite`):** even a single-slice wave gets its own worktree and a verified
baseline — do not "just edit in the main checkout because it's one small slice." The isolation and
the clean baseline are the point even for a wave of one (consistent with `parallelism.md`:
worktree-level parallelism; same-wave slices are isolated by construction).

## Inputs

Foundation-only — no upstream *artifact* is consumed. Resolve these before creating anything; refuse
only on the one hard-missing case noted:

- **Branch name** (REQUIRED) — per `branch-naming.md` (`cluster/C-<NNN>`, `feat/<slug>`, …), handed
  by the orchestrator at dispatch, or derivable from the slice's row in `STATE.md`. If none is
  supplied AND none is derivable → **ask; never invent a branch name** (a wrong branch is
  hard-to-reverse). This is the refuse-to-run guard.
- **Slice identity** (PRD-namespaced id, e.g. `PWR-2`) — for the report/handoff line; optional for a
  bare human invocation.
- **Worktree-directory preference** (OPTIONAL) — an explicit instruction beats observed filesystem
  state (Step 1b priority order).

## Process

### Step 0: Detect existing isolation (run this FIRST, always)

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

**Submodule guard:** `GIT_DIR != GIT_COMMON` is ALSO true inside a git submodule. Before concluding
"already in a worktree," verify you are not in a submodule:

```bash
# If this returns a path, you're in a submodule, not a worktree — treat as a normal repo.
git rev-parse --show-superproject-working-tree 2>/dev/null
```

- **`GIT_DIR != GIT_COMMON` (and not a submodule):** you are already in a linked worktree → skip to
  Step 2. Do NOT create another. Report: "Already in isolated workspace at `<path>` on branch
  `<name>`" (or, if detached HEAD, "externally managed; branch creation needed at finish time").
- **`GIT_DIR == GIT_COMMON` (or in a submodule):** normal checkout. If the orchestrator handed a
  branch (or the user declared a preference), honor it without asking. Otherwise ask consent: "Set up
  an isolated worktree? It protects your current branch from changes." Declined → work in place,
  skip to Step 2.

### Step 1: Create the isolated workspace (native → git, in that order)

**1a. Native worktree tool (preferred, D15).** Do you have a tool to create a worktree — e.g.
`EnterWorktree`, a `/worktree` command, or the **Claude Code Workflow feature** running with
`isolation: 'worktree'`? If so, USE IT and skip to Step 2. Native tools handle placement, branch
creation, and cleanup; running `git worktree add` on top of one creates phantom state the harness
can't see or manage. (When the orchestrator drives a wave via the Workflow `isolation:'worktree'`
substrate, isolation is already provisioned — Step 0 will detect it; on Codex / manual runs, use the
native tool or fall through to 1b.)

**1b. Git worktree fallback (only if 1a is unavailable).**

*Directory selection* — explicit instruction beats observed state:
1. A declared worktree-directory preference → use it without asking.
2. An existing project-local dir: `ls -d .worktrees 2>/dev/null` (preferred, hidden) /
   `ls -d worktrees 2>/dev/null`. Both exist → `.worktrees` wins.
3. Otherwise default to `.worktrees/` at the project root.

*Safety — MUST verify the directory is git-ignored before creating (project-local dirs):*
```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```
**If NOT ignored:** add it to `.gitignore`, commit that change, THEN proceed. (Prevents committing
worktree contents into the repo.)

*Create:*
```bash
path="$LOCATION/$BRANCH_NAME"
git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

**Sandbox fallback:** if `git worktree add` fails with a permission/sandbox-denial error, tell the
user the sandbox blocked worktree creation and you're working in the current directory instead, then
run setup + baseline in place.

### Step 2: Project setup

Auto-detect and install:
```bash
[ -f package.json ]      && npm install
[ -f Cargo.toml ]        && cargo build
[ -f requirements.txt ]  && pip install -r requirements.txt
[ -f pyproject.toml ]    && poetry install
[ -f go.mod ]            && go mod download
```
No manifest → skip dependency install.

### Step 3: Verify a clean baseline (the load-bearing guarantee)

Run the project-appropriate suite (`npm test` / `cargo test` / `pytest` / `go test ./...`) to prove
the workspace starts green:
- **Tests pass →** report ready (below); hand off to `incremental-implementation`.
- **Tests fail →** report the failures and ask whether to proceed or investigate. Do NOT start
  implementing on a red baseline — you would not be able to attribute later failures.

**Report:**
```
Worktree ready at <full-path> on <branch>
Baseline: <N> tests passing, 0 failures
Ready to implement <slice-id>
```

## Quick reference

| Situation | Action |
|---|---|
| Already in a linked worktree (Step 0) | Skip creation → Step 2 |
| In a submodule | Treat as normal repo (Step 0 guard) |
| Native tool / Workflow `isolation:'worktree'` available | Use it (Step 1a) |
| No native tool | Git fallback (Step 1b) |
| `.worktrees/` and `worktrees/` both exist | Use `.worktrees/` |
| Neither exists | Explicit pref → else default `.worktrees/` |
| Directory not git-ignored | Add to `.gitignore` + commit first |
| `git worktree add` permission error | Sandbox fallback: work in place |
| Baseline tests fail | Report + ask; do NOT implement |
| No `package.json`/`Cargo.toml`/… | Skip dependency install |

## Platform adaptivity (D15)

The mechanism is substrate-agnostic; only the *create* primitive changes — the detect/setup/baseline
discipline is identical:
- **Claude Code → the Workflow feature** with `isolation: 'worktree'` — the orchestrator provisions a
  worktree per slice automatically; Step 0 detects it, so this skill verifies + sets up baseline.
- **Codex / manual → native `EnterWorktree`** (Step 1a) or the **git fallback** (Step 1b).
Teardown is NOT this skill's job: after a slice reaches a terminal state the orchestrator retires the
worktree via `superpowers:finishing-a-development-branch` (verify tests → base branch → cleanup).

## Rationalizations

| You catch yourself thinking… | Reality |
|---|---|
| "I'll just `git worktree add` to be safe." | If you're already isolated (Step 0) or a native tool / Workflow isolation exists, that creates phantom nested state the harness can't manage. Detect first; prefer native. |
| "Setup's done, I'll start coding — baseline tests can wait." | Then you can't tell a bug you introduce from one already there, and may ship on red. Verify the baseline FIRST. |
| "`worktrees/` is obviously ignored, skip the check." | Assumption, not fact. One un-ignored worktree pollutes `git status` and can get committed. Always `git check-ignore`. |
| "I'll drop the worktree under `~/tmp` to keep the repo clean." | Directory priority is explicit-instruction > existing project-local dir > default `.worktrees/`. Don't improvise placement. |
| "Baseline's red but unrelated to my slice — I'll proceed." | A red baseline is unattributable. Report + ask; do not silently build on it. |

## Red flags — STOP

**Never:**
- Run `git worktree add` when Step 0 detected existing isolation, or when a native tool / Workflow
  `isolation:'worktree'` is available — this is the #1 mistake.
- Jump straight to Step 1b's git commands, skipping the Step 0 detection and Step 1a native check.
- Create a project-local worktree without `git check-ignore` confirming it's ignored.
- Start `incremental-implementation` without a verified-clean baseline.
- Proceed past a failing baseline without explicit permission.
- Invent a branch name when none was handed and none is derivable (ask instead).

**Always:**
- Run Step 0 detection (incl. the submodule guard) first.
- Prefer native tools / Workflow isolation over the git fallback.
- Follow directory priority: explicit instruction > existing project-local dir > default.
- Verify a project-local directory is ignored before creating.
- Auto-detect + run project setup; verify a clean test baseline before handing off.

## Verification (ending criteria)

Done when ALL hold:
- An isolated workspace exists on the intended branch (detected pre-existing, OR created via native
  tool / Workflow isolation, OR via the git fallback) — never a second nested worktree.
- For a git-fallback project-local directory: it is git-ignored (confirmed by `git check-ignore`).
- Project setup ran (or was correctly skipped — no manifest).
- The **baseline test suite was executed**; it is GREEN, or its failure was reported and explicit
  permission to proceed was obtained.
- The ready-report (path · branch · baseline result · slice id) was emitted to the orchestrator.

## Outputs & handoff contract

- **Emits → `worktree`** (registry artifact): a live isolated workspace = `{absolute path, branch,
  baseline: pass|fail}`. It is infrastructure, not a markdown file.
- **Consumers:** the **`orchestrator`** (owns the mechanism, D15/D24 — receives the ready-report and
  dispatches the slice into it) and **`incremental-implementation`** (runs *inside* the handed worktree; never creates
  its own).
- **STATE.md:** worktree provisioning adds **no new state token** — it is a sub-step of a slice
  entering `impl` (registry slice states: `impl·verify·review·ship·done·blocked·halted`). The slice
  sits at `impl` / gate `agent` while the worktree is live; record nothing extra. If the baseline is
  red and the human is asked, that is an escalation the orchestrator may reflect by flipping
  `gate: agent → you`.
- **Teardown** is out of scope here: deferred to `superpowers:finishing-a-development-branch` once the
  slice is terminal. **If you change the ready-report shape, update the `orchestrator` in the same
  commit** (it parses path/branch/baseline).
