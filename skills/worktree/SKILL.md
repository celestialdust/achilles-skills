---
name: worktree
description: Set up the isolated, clean-baseline workspace a slice gets built in — detect the isolation already there, prefer the host's worktree primitive over `git worktree add`, install what the manifest names, record the test baseline. Not what gets built in it (`incremental-implementation`), commits (`git-workflow`), or the wave (`orchestrator`).
---

# Worktree — per-slice isolation mechanism

## Purpose

**Stage: Implement.** Principles 6, 7, 9.

The workspace a slice gets built in: isolated from the checkout the person has open, and starting from
a test baseline somebody measured rather than assumed. It emits the workspace itself and no artifact of
its own. Two slices sharing one working tree overwrite each other's work, and an unrecorded baseline
leaves every later failure unattributable.

## When to use / when to skip

- A slice about to be implemented needs a workspace that cannot disturb the person's checkout — a wave
  of one included; isolation and a known baseline are the point at any size.
- Two pieces of work would otherwise share one working tree.
- Someone asks for a clean branch, an isolated workspace, or a worktree before feature work starts.
- Near-miss: a read-only investigation that commits nothing, or isolation the person declined — work in
  place, and still take the baseline.
- Not here: what gets built inside (`incremental-implementation`), branch naming and history
  (`git-workflow`), sorting slices into waves and dispatching them (`orchestrator`).

## Inputs

- **the branch name handed at dispatch** — helps: it is the branch the caller will look for · without
  it: build one from the slice id and title (`git-workflow` owns the shape) and mark it `derived`,
  rather than invent one in silence.
- **the slice id**, e.g. `OFD-2` — helps: names the branch, the directory and the hand-back · without
  it: read it off `STATE.md`, `docs/features/<slug>/plan.md` or the prompt, marked `derived`.
- **a worktree-directory preference** — helps: an explicit instruction outranks whatever the filesystem
  shows · without it: the priority in Process 2.
- **the repository** — `git status`, `git rev-parse` — helps: every step below reads it · without it,
  the directory being no repository: there is no worktree to cut, so say so, work in place, and leave
  `git init` to `git-workflow`.

In a person's own checkout, where no branch or directory was handed over, ask once before creating
anything in it; with a branch handed, or with nobody there, create it and log the call.

## Process

1. **Detect the isolation you already have before making any.** Compare `--git-dir` against
   `--git-common-dir` as absolute physical paths (`git rev-parse --path-format=absolute --git-dir
   --git-common-dir`, or `cd "$(git rev-parse --git-dir)" && pwd -P` on each): raw, they differ in any
   subdirectory of a plain checkout, so every checkout reads as isolated. Differing means you are
   already in a linked worktree — create nothing, go to step 3; detached there, the branch is the
   caller's to create at finish time, so say so and carry on. They also differ inside a submodule, which
   `git rev-parse --show-superproject-working-tree` answers with a path — a submodule is a plain
   checkout here.

2. **Prefer the host's own worktree primitive** — a worktree tool such as `EnterWorktree`, a
   `/worktree` command, a workflow already running `isolation: 'worktree'` — since it owns placement,
   branch creation and retirement together, and `git worktree add` on top of one makes state it cannot
   manage. Only where there is none, cut one with git:

   - Directory, in priority order: an explicit instruction, an existing project-local `.worktrees/` or
     `worktrees/` (`.worktrees` wins when both are there), else `.worktrees/` at the repository root.
   - `git check-ignore -q .worktrees` before creating a project-local one; not ignored, add the line to
     `.gitignore` and commit that first.
   - `git worktree add "$dir/$branch" -b "$branch"`, then work from that path.
   - A permission or sandbox denial ends nothing: say the sandbox refused, work in the current
     directory, carry on to setup.

3. **Install what the manifest names** — `package.json` → `npm install`, `Cargo.toml` → `cargo build`,
   `requirements.txt` → `pip install -r`, `pyproject.toml` → the installer its lock file names
   (`poetry.lock`, `uv.lock`, `pdm.lock`), else `pip install -e .`, `go.mod` → `go mod download`. No
   manifest: skip it and name the skip.

4. **Run the suite before a line is written, and record what it said.** Green is a clean baseline; red
   is a baseline too — name the failing tests as the known-before set, so a later failure is
   attributable to the slice. Nobody waits on that: a default with a reason, one `docs/session-log.md`
   entry, a Decided-for-you row; only the stop list
   ([`safety-rails.md`](../../references/safety-rails.md)) ends a slice.

5. **Hand back the workspace itself, not a summary of it** — the shape Outputs & handoff states, every
   `derived` value marked with its source.

## Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll just `git worktree add`, it's the safe move" | A worktree cut inside one already there is state the harness can neither see nor retire. |
| "The baseline can wait — the suite's red anyway" | A suite first run after the slice exists cannot separate its failures from the ones already there. |
| "`.worktrees/` is obviously ignored already" | An un-ignored worktree directory is the repository committed into itself. |
| "I'll drop it under `~/tmp` to keep the repo clean" | Placement improvised per run is placement the caller cannot find afterwards. |
| "Nobody handed me a branch name, so I'll choose a good one" | An unmarked invented name reads downstream as a name somebody signed. |

## Red flags

- A second worktree cut inside one that was already there.
- A project-local worktree directory that `git check-ignore` was never run against.
- A hand-back with no baseline in it, or a baseline reported from a suite nobody ran.
- A red suite repaired rather than recorded, or a slice held while somebody is asked about it.
- An invented branch name travelling without its `derived` mark.
- A `STATE.md` row or a gate flip written by this pass.

## Verification

- [ ] One isolated workspace — found there, host-provisioned, or cut with git — sits on the intended
      branch, or a detached one is reported as externally managed, and nothing is nested inside a
      worktree.
- [ ] A project-local worktree directory is git-ignored, and `git check-ignore` is what says so.
- [ ] Dependencies are installed, or the skip is named with its reason.
- [ ] The suite ran, and its result — the failing set included, where there is one — is in the
      hand-back by name.
- [ ] Every value the report carries that was reconstructed rather than handed over reads `derived`.

## Outputs & handoff

- **The workspace, returned in conversation** — absolute path · branch · baseline with its counts and
  any failing test names · slice id · each `derived` value and its source. Live infrastructure is no
  file to open later, so this report is the whole hand-off: `orchestrator` dispatches the slice into it,
  and `incremental-implementation` builds inside it rather than cutting isolation of its own. The run
  parses this shape, so a change to it changes `orchestrator` in the same commit.
- **`.gitignore`** — one line naming the worktree directory, committed before the worktree exists; only
  on the git fallback into a project-local directory.
- **`docs/session-log.md`** — one appended entry per decided-for-you call (a red baseline carried
  forward, isolation the sandbox refused, a derived branch name), cap 60 words, shaped as
  [`state-schema.md`](../../references/state-schema.md) states; report each entry's measured length
  against that cap, and trim an over-cap entry rather than hand it on.
- **No `STATE.md` row and no gate flip** — provisioning is a sub-step of a slice entering `impl`, and
  the caller owns the transition ([`state-schema.md`](../../references/state-schema.md)).
- **Retirement belongs to the caller**, once the slice is terminal: the tests verified, the work on its
  base branch, then the worktree removed and the branch deleted.
