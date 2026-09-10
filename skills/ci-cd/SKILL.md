---
name: ci-cd
description: Stand up, fix or debug the quality-gate pipeline: wire the commands the repo really runs into CI, block the merge behind branch protection, keep secrets to names, build the deploy, flag and rollback paths but fire none. Also reviews a diff that changed CI or deploy config. Not the pull request (`pull-request`), nor the release past a merge (`shipping-and-launch`).
---

# CI/CD and Automation

## Purpose

**Stage: Ship.** Principles 1, 7, 9.

Stands up and hardens the quality-gate pipeline so nothing reaches the protected branch without passing
the gates the repo can actually run, and builds the deploy, flag and rollback paths a person fires. It
emits no chain artifact — `pull-request`, `git-workflow` and `shipping-and-launch` reach for it. The
pipeline is what checks every change, so a step removed here loosens what judges the work.

## When to use / when to skip

- A repository has no pipeline, or a gate, protection rule or scheduled job needs changing.
- A pipeline is red, flaky, or slow enough that people have started routing around it.
- A diff changed CI, build or deploy configuration and the Review fan-out reached you.
- A deploy, feature-flag or rollback shape has to be decided — you build it, a person fires it.
- Skip where a stop-list condition fired
  ([`safety-rails.md`](../../references/safety-rails.md)) — a secret in a workflow file is one.
- Near-miss — the pull request itself: `pull-request`. The release past a merge: `shipping-and-launch`.
  Branches and worktrees: `git-workflow`, `worktree`. A failing test a red pipeline surfaced:
  `debugging-and-error-recovery`. Naming the secrets and services: `environment-manifest`.

## Inputs

Take each from the prompt where it is given, from the repository otherwise. A person is present only when
this runs by hand: at most three questions, and only where the gap changes the pipeline's shape — the CI
host, the protected branch, whether a deploy target exists.

- the repo's task runner (`package.json` scripts, `Makefile`, `pyproject.toml`) — helps: the gates that can
  actually run · without it: run each candidate command once and mark every gate you inferred `derived`.
- the existing `.github/workflows/*.yml`, or the host's equivalent — helps: what already gates · without
  it: you are standing one up from nothing, not reading an ungated repo as a decision.
- the red run's log — helps: the first thing to read on a failing pipeline · without it: re-run the failing
  job locally on the same command and versions, and name the reproduction.
- `docs/features/<slug>/environment.md` — helps: the secrets and services to wire, by name and no value ·
  without it: take the names from the code that reads them, `derived`; a name neither source gives is not wired.
- `docs/features/<slug>/prd.md` and the ADRs it cites — helps: the deploy, flag or rollback shape where one
  was decided already · without it: take the smallest reversible shape, as a Decided-for-you row.

## The Quality Gate Pipeline

1. **List the gates this repo can actually run, and run each one yourself before writing it into a
   workflow.** A step invoking a script the repo does not define is a red pipeline, not a gate. Carry an
   absent gate as a Decided-for-you row rather than inventing its command.

2. **Order them cheapest signal first** — a bug caught in lint costs minutes, the same bug in production
   hours: lint, types, unit tests with coverage, build, integration against a service container, e2e where
   any exist with its report uploaded on failure, the dependency audit at high
   (`npm audit --audit-level=high`), bundle size against the project's budget. Each on the command the repo
   defines, never one named here.

3. **Fire on `pull_request` into the protected branch and on `push` to it.** Gate the pull request alone and
   the merge commit becomes the first thing nobody checked.

4. **Wire every secret by name and never by value**, the CI-only test database's password included. Names
   go in the host's secret store; CI's secrets stay separate from production's. Commit `.env.example` and
   `.env.test` holding no real values, and keep `.env` out of the repository. A literal reaching a workflow
   file is a stop-list item ([`safety-rails.md`](../../references/safety-rails.md)), not a config bug.

5. **Make the gates block the merge rather than report beside it** — required status checks naming every
   gate job, one approving review, no force-push to the protected branch, auto-merge off
   ([`safety-rails.md`](../../references/safety-rails.md)). A tick nobody has to satisfy is a notification.

6. **Fix a red pipeline at its cause: feed the real failure output back with the command that produced it,
   and reproduce it locally before the next push.**

   | Red gate | The move |
   |---|---|
   | lint | run the fixer, commit what it changed |
   | types or build | fix at the error site the message names |
   | test | root-cause it through `debugging-and-error-recovery` |
   | audit | upgrade it, or record the accepted risk with its reason and its expiry |

   Never disable the rule, skip the test, or re-run until it goes green. Disclose a test you changed on
   purpose in the pull request body, before and after; nothing is frozen, so the undisclosed change is the
   defect.

7. **Bring a pipeline over ten minutes down in this order, and stop the moment it is under**: cache
   dependencies, split the gates into parallel jobs, path-filter the jobs a change cannot affect, shard the
   slow suite across a matrix, prune the slowest tests or move them to a schedule, buy a larger runner.

## Deployment Strategies

8. **Configure the deploy path and never fire it.** A preview deployment per pull request, a staged rollout
   — staging, verified before anything promotes, then production, then a monitoring window whose length is
   named in the change, ending in rollback or done — and a manual `workflow_dispatch` rollback are
   scaffolding a person triggers. Never `gh pr merge`, never push to `main`, never run a deploy
   ([`safety-rails.md`](../../references/safety-rails.md)). Land the rollback in the same change as the
   deploy, while nothing yet needs rolling back.

9. **Give every feature flag an owner and a removal date in the change that creates it**, and delete the
   flag with its dead branch within two weeks of full rollout — create, enable for testing, canary, full,
   remove. A flag buys decoupling deploy from release; one with no removal date is a second code path
   nobody reads.

## Automation Beyond CI

10. **Schedule dependency updates weekly with an open-pull-request limit, and name who owns a red default
    branch.** That owner fixes or reverts, so a broken build stops being everybody's to assume someone else
    has noticed.

## Reviewing a CI diff

11. **Read a diff that changed CI, build or deploy configuration code-cold for what stopped being checked.**
    Return `pass · concerns · block`, where `block` is a stop-list item and nothing else. An undisclosed
    loosening is `concerns` with its file and line — the change may be right, the silence is still a defect.

    | In the diff | Reads as |
    |---|---|
    | a gate step deleted, or its job dropped from the required set | the oracle lost a check |
    | `continue-on-error: true`, `if: false`, a raised `--audit-level`, `--passWithNoTests` | a gate that can no longer fail |
    | branch protection relaxed, force-push re-enabled, auto-merge switched on | the merge stopped being gated |
    | `pull_request_target` running a fork's code, or a secret exposed to one | privilege reaching untrusted input |
    | a secret literal, or a value echoed into a log | the stop list |

## Rationalizations

| Rationalization | Reality |
|---|---|
| "CI is too slow, skip it this once" | People route around a pipeline they wait on; step 7 is the fix. |
| "This change is trivial" | Trivial changes break builds, and the pipeline is fast on them anyway. |
| "The test is flaky, just re-run it" | A flaky test is a bug reporting intermittently; a green re-run leaves it in the tree. |
| "We'll add CI once the code settles" | An ungated repo accumulates broken states nobody can date. |
| "It's only the CI-only test database" | A test credential reused in anger is still a credential. |
| "The PR body says no behaviour change" | A workflow diff changes what judges the work. |

## Red flags

- A workflow step naming a script the repo does not define.
- A green tick over `continue-on-error`, `if: false`, or a raised threshold.
- A gate job that runs but is not in the required set.
- A secret literal in a workflow file, or a value echoed to a log.
- A deploy path with no rollback, or a flag with no removal date.
- A re-run standing in for a fix on a suite everyone calls flaky.

## Verification

- [ ] Every gate ran locally on the command the workflow invokes, its real output reported — a red gate is
      the gate working — and none names a script the repo does not define.
- [ ] Each gate the repo lacks has a Decided-for-you row rather than an invented command.
- [ ] The pipeline fires on `pull_request` into the protected branch and on `push` to it, and a red gate
      blocks the merge through required status checks.
- [ ] Every secret appears by name only, CI's separate from production's, and a scan for literals came back
      clean.
- [ ] A configured deploy has its rollback in the same change, and nothing was triggered: no merge, no push
      to `main`, no deploy, no auto-merge.
- [ ] Every flag carries an owner and a removal date; the dependency schedule carries an open-PR limit.
- [ ] Every derived value reads `derived` where it is written, and nothing was refused.
- [ ] Reviewing a diff: one verdict of `pass · concerns · block`, each finding citing its file and line.

## Outputs & handoff

**`.github/workflows/*.yml`**, or the host's equivalent — no artifact cap; the ceiling is the gates that
actually run. Shape: one job per gate in step 2's order, cached dependencies, step 3's triggers, secrets
only as `${{ secrets.NAME }}`. Report the job count and the measured wall-clock against the ten-minute
target; a slower pipeline is handed on as slow, not done.

**`.github/dependabot.yml`**, or the Renovate config — weekly, with an open-pull-request limit.

**`.env.example` and `.env.test`** — committed, keys only and no values; `.env` stays out of the
repository. No cap; the ceiling is the names `environment.md` or the code gives.

**Branch protection**: required status checks naming every gate job, one approving review, force-push off,
auto-merge off.

**Appended to `docs/session-log.md`**: one entry per gate the repo lacks, per accepted audit finding, and
per deploy shape settled here; cap 60 words each, matching the pull request's Decided-for-you row. Shape
and append rules: [`state-schema.md`](../../references/state-schema.md). Report each entry's measured
length and trim rather than hand an over-cap one on.

**Returned in conversation**, reviewing a diff: the verdict and its findings, and no file written — the
workflow a finding names is the implementer's to change on the route-back.

**Nothing else is handed on.** No `STATE.md` row and no gate flip, the caller owning the slice's transition
([`state-schema.md`](../../references/state-schema.md)); no merge, no deploy, no release notes.
