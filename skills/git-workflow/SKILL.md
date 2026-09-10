---
name: git-workflow
description: Reach for this before a commit, a branch, a revert or a history question — a repository to initialise, a working tree to cut into atomic commits, a staged diff to scan for credentials. Never merges, never commits to `main`. The pull request body is `pull-request`; per-slice isolation `worktree`; grading a diff `code-review`.
---

# Git Workflow and Versioning

## Purpose

**Stage: cross-cutting.** Principles 1, 7, 9.

The save-point substrate every other stage commits through: a repository to initialise, a working tree
cut into atomic commits, a staged diff scanned for credentials before any of it becomes history. It
writes no artifact-chain file of its own. History is the one account of a change that outlives the conversation
that produced it.

## When to use / when to skip

- Any commit, branch, revert or history question: every code change lands through git, and the only
  pass with nothing to do is one where no file changed.
- A directory that is not a repository yet; a failure mid-slice asking which save point to return to or
  which commit turned a test red; a tree of unrelated edits that has to become reviewable history.
- Near-miss — the pull request body and its risk band: `pull-request`. Per-slice isolation: `worktree`.
  Grading a diff: `code-review`. The release after a merge: `shipping-and-launch`. Server-side gates:
  `ci-cd`.
- Not here: merging. A person merges ([`safety-rails.md`](../../references/safety-rails.md)).

## Inputs

- **the working tree** (`git status`, `git diff --staged`) — helps: what every step below reads ·
  without it: the directory is no repository — `git init` first and mark the baseline `derived`,
  rather than commit into a non-repo.
- **`docs/features/<slug>/plan/<slice-id>.md` and `STATE.md`** — helps: the slice id the branch carries and the why its
  messages state · without them: take both from the prompt and the diff, marked `derived`.
- **the repository's conventions** (recent `git log`, `.gitignore`, the hooks there) — helps: match the
  house style rather than impose one · without them: use the shapes below, marked `derived`.

With a person present, ask at most three questions, only where the gap changes the history's shape.

## Core Principles

1. **Commit each green increment as its own save point** — one logical, self-contained change, roughly
   100 lines, its test in the same commit or already committed earlier on the branch, which is what keeps
   the test-first order legible in the history.

2. **Keep concerns apart.** A reflow, a refactor and a behaviour change are three commits — stage per
   commit by path, and `git add -p` where a reflow and a behaviour change share a file. Split anything
   past ~1,000 lines before review (`code-review` has the strategies).

3. **Give the message the why, since the diff carries the what**: `<type>: <summary>` — `feat` `fix`
   `refactor` `test` `docs` `chore` — plus a body stating the reason, since the log is what
   reconstructs a decision or a changed oracle when the session log is thin, and what `git log -S`
   searches.

4. **Rewrite no pushed history** — no amend, rebase or force-push on a branch anyone else may hold.
   Nothing is frozen: a test the plan moved past may change, disclosed in the pull request body and the
   log (`pull-request`), never folded quietly into a rewritten commit.

5. **Hand over on a clean tree** — every increment committed, nothing staged or stray — with the change
   summary Outputs & handoff shapes.

## Branching Strategy

Branch before the first commit and commit to `main` never: the run ends at an open pull request
([`safety-rails.md`](../../references/safety-rails.md)), and the default branch stays deployable. Name
it `feat/<slug>` · `fix/<slug>` · `refactor/<slug>` · `chore/<slug>`, lowercase and hyphenated, a slice
branch carrying its id (`feat/OFD-2-draft-buffer`). Merge inside a couple of days and delete it after —
a branch outliving the week compounds merge risk daily, and unfinished work belongs behind an
off-by-default flag. Two agents at once take a worktree each, one branch per directory (`worktree`).

## The Save Point Pattern

On a failing test or a broken build, reset to the last green commit and diagnose from there rather than
build on top of it (`debugging-and-error-recovery`) — `git reset --hard HEAD` then costs one increment.
That holds only where each save point left a clean tree, so nothing a neighbouring slice owns rides on
the reset.

## Pre-Commit Hygiene

Run the pass every time, in order — read the staged diff, scan it for a credential, then tests, lint,
type check:

```bash
git diff --staged
git diff --staged | grep -inE 'password|secret|api[_-]?key|token|BEGIN [A-Z ]*PRIVATE KEY|AKIA[0-9A-Z]{16}'
```

A hit is a stop-list item ([`safety-rails.md`](../../references/safety-rails.md)): the commit does not
happen, and the report says a credential is present without echoing its value. Move the pass into a
hook (`lint-staged` + `husky`, or `.git/hooks/pre-commit`) so it runs whether anyone remembers or not;
`ci-cd` owns the same gates server-side.

## Handling Generated Files

Write the `.gitignore` before the first commit — build output, `.env*`, `node_modules/`, keys, private
editor state; afterwards the remedy is a rotation, not a revert. Commit a generated file only where the
project expects one: a lockfile, a migration.

## Using Git for Debugging

`git bisect` for the commit that turned a test red, `git log -S` or `--grep` for when a line arrived,
`git blame` for what carried it. A root-caused defect cites its commit in `docs/lessons.md`
(`debugging-and-error-recovery`).

## Rationalizations

- "I'll commit once the feature is done" → one commit for an afternoon is one nobody can bisect or revert.
- "The message doesn't matter, the diff is there" → the diff carries the what; later the why exists
  only in the message.
- "It's really all one change" → a reflow and a behaviour change in one diff hide each other.
- "I'll squash and force-push to tidy it up" → a rewrite of pushed history hides a changed test from
  the review reading the diff.
- "It's only a dev token" → history keeps a credential long after the file holding it is deleted.
- "I'll add the `.gitignore` later" → between now and then is where `.env` and `dist/` enter history.

## Red flags

- A working tree carrying an afternoon of unrelated edits, uncommitted.
- Subjects reading `wip`, `updates`, `fix stuff`, `misc`.
- A reflow sitting in the same commit as a behaviour change.
- `.env`, `dist/` or `node_modules/` staged, or a repository with no `.gitignore`.
- A branch alive for weeks, or a commit landing on `main` itself.
- An amend, rebase or force-push proposed on a branch already pushed.

## Verification

- [ ] The work sits on a named branch off the default one, `main` neither committed to nor pushed.
- [ ] One logical change per commit, each with its test, and `git status --porcelain` is empty.
- [ ] Every message carries a type and its why; no commit mixes a reflow with behaviour.
- [ ] The staged-diff scan ran clean before each commit — or a hit ended the pass as a stop-list item,
      naming where the credential was and printing no value.
- [ ] The `.gitignore` was in place before the first commit.
- [ ] The change summary came back, naming what was left alone on purpose.
- [ ] Every derived value — slice id, base branch, initialised repository — reads `derived`.

## Outputs & handoff

- **Commits on the feature or slice branch**, shaped as Core Principles states — the range
  `pull-request` bands and `code-review` grades.
- **`.gitignore`** at the repository root when there is none, covering what Handling Generated Files lists.
- **`docs/session-log.md`** — one appended entry, cap 60 words, where this pass settled something
  itself: an initialised repository, a chosen base branch, a split nobody asked for. Shape in
  [`state-schema.md`](../../references/state-schema.md).
- **No `STATE.md` row** — the caller owns the slice's transition
  ([`state-schema.md`](../../references/state-schema.md)).
- **Returned in conversation rather than written** — the change summary, cap 200 words:

  ```
  CHANGES MADE   <file>: what changed there
  NOT TOUCHED    <file or area>: why it was left alone, deliberately
  CONCERNS       what a reviewer should look at first, or "none"
  ```

  NOT TOUCHED is the block that earns its keep — where an unsolicited renovation would have shown.
- **Nothing else** — no merge, no pull request, no `qa.md`, no release.

Report each capped write — the change summary, the log entry — at its measured size against its cap;
an over-cap draft is reported at that size, never handed on as though it fit.
