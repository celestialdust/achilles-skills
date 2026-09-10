---
name: shipping-and-launch
description: Write the release runbook once a person has merged — pre-launch clearance with its evidence, the flag and staged-rollout plan, the thresholds deciding advance, hold or roll back, and the rollback path. Authors it, runs none of it. A slice at a draft pull request is `pull-request`; the pipeline that deploys is `ci-cd`.
---

# Shipping and Launch

## Purpose

**Stage: Ship.** Principles 1, 5, 6, 7.

Writes the release runbook for work a person has already merged: the pre-launch clearance and its
evidence, the flag and rollout plan, the thresholds deciding advance, hold or roll back, the way back, and
what the first hour watches. It emits `release.md` and fires none of it — release-level, past the end of
the autonomous span.

## When to use / when to skip

- A person has merged a feature's slices and it reaches production for the first time, or several merged
  changes are batched into one release, or a beta or early-access audience opens.
- A deploy that moves data or infrastructure, where the way back matters more than the way forward.
- Skip a docs- or config-only change with no user-visible runtime effect — nothing to stage, nothing to
  roll back.
- Near-miss — a slice still at an open draft pull request: `pull-request`. The deploy pipeline, its gates
  and the rollback workflow: `ci-cd`. Instrumenting the code this runbook watches:
  `observability-and-instrumentation`. Moving a schema or retiring an interface: `deprecation-and-migration`.

## Inputs

Take each from the prompt where it is given, the canonical path otherwise; with a person present, at most
three questions, and only where the gap changes the release's shape — usually whether a flag service exists.

- the merged change — the commits on the base branch since the last release, and their diff — helps: what
  ships, and what a rollback has to undo · without it: the last tag to `HEAD`, name the range you read,
  `derived`.
- `docs/features/<slug>/environment.md` — helps: the typed rows naming the production and staging targets
  and the flag, monitoring and error-reporting services · without it: the repo's CI and deploy
  configuration, `derived` — read either for *what* exists, never for a value or a command.
- `docs/features/<slug>/prd.md` and the ADRs it cites — helps: the success measure the thresholds bind to,
  and the Not-Doing list a rollout cannot cross · without it: `intent.md`, or what the feature changes for
  a user, `derived`.
- `docs/features/<slug>/qa.md` — helps: the verdict, the exercised ledger and the `not-reachable` ids,
  which say what the first hour watches by hand · without it: the tests the merged diff carries, `derived`.
- the merged pull request bodies — helps: each slice's risk band and Decided-for-you rows, what a person
  already flagged · without it: the diff and `docs/session-log.md`, `derived`.

## Process

1. **Name what this release covers before writing about it** — the merged commits or slices, and their
   diff. A change still at an open draft pull request is not in it; it goes back to `pull-request`.

2. **Clear each pre-launch area against its standing list, and write beside it what cleared it.**

   | Area | Cleared against |
   |---|---|
   | correctness · quality · integration · documentation | [`definition-of-done.md`](../../references/definition-of-done.md) |
   | security | [`security-checklist.md`](../../references/security-checklist.md) |
   | performance | [`performance-checklist.md`](../../references/performance-checklist.md) |
   | accessibility | [`accessibility-checklist.md`](../../references/accessibility-checklist.md) |
   | monitoring | [`observability-checklist.md`](../../references/observability-checklist.md) · *Pre-launch gate* |
   | infrastructure | production configuration set · migrations ready with their reverse · DNS, SSL and CDN answering · a health check that returns |

   An area that will not clear is written down as outstanding with what it needs; a `concerns` verdict or
   an open Required finding tops the first hour's watch list instead of holding the release, while a
   Critical or High security finding is a stop-list item ([`safety-rails.md`](../../references/safety-rails.md)).

3. **Plan the rollout as stages, each with an audience, a monitoring window, a named watcher and a way
   back** — staging with the full suite and a smoke pass, production with the flag off and a health check,
   the team, then 5% → 25% → 50% → 100%, stepping back a stage rather than forward whenever a window reads
   unclear.

4. **Give the flag an owner and a removal date in the line that names it.** Its life runs off in production
   → on for the team → canary → full → flag and dead path deleted, within two weeks of full rollout;
   nesting flags multiplies the states to test, and both states of each belong in CI. Where no flag service
   exists, say so and make every stage's way back a revert of the deploy — a stage with no way back is not
   a stage.

5. **Bind advance, hold and roll back to the measure `prd.md` calls success**, so the numbers are this
   feature's rather than a template's, and record the baseline each is read against.

   | Signal | Advance | Hold and investigate | Roll back |
   |---|---|---|---|
   | error rate | within 10% of baseline | 10–100% above | over 2× baseline |
   | p95 latency | within 20% of baseline | 20–50% above | over 50% above |
   | client-side errors | no new type | new, under 0.1% of sessions | new, over 0.1% of sessions |
   | the feature's success measure | flat or better | down under 5% | down over 5% |

   A data-integrity problem, a security finding or a spike in user reports rolls back on contact, without
   waiting for the window to close.

6. **Write the way back before the deploy that will need it** — triggers, steps, what becomes of data the
   new code wrote, a time-to-rollback per route (flag, redeploy, migration). An irreversible step with no
   rollback is a stop-list item ([`safety-rails.md`](../../references/safety-rails.md)) — name it in the
   runbook as that, and invent no reverse for it.

7. **Name what is watched, and what the first hour checks** — the application and infrastructure metric
   groups, depth in [`observability-checklist.md`](../../references/observability-checklist.md), and the
   client-side group: Core Web Vitals, depth in
   [`performance-checklist.md`](../../references/performance-checklist.md), client JS errors, client-side
   API error rate; then the health check, the error dashboard, latency, the critical flow driven by hand,
   logs arriving, the rollback route rehearsed.

8. **Write the runbook and run none of it.** Every deploy, flag enable, canary advance and rollback in it
   is a step a person takes later, so its `Deploy fence` reads `Executed by: human, post-merge` and this
   pass fires none of them, no `gh pr merge`, no push to `main`
   ([`safety-rails.md`](../../references/safety-rails.md) — a human merges).

9. **Take a default wherever the inputs are silent** — a baseline, a window length, an environment name —
   state the reason, mark the value `derived`, append one `docs/session-log.md` entry, so whoever deploys
   sees the choice rather than inheriting it.

## Rationalizations

| Rationalization | Reality |
|---|---|
| "It works in staging, so it works in production" | Production carries different data, traffic and edge cases; the first hour is where that shows. |
| "This change is too small to need a flag" | Without one the way back is a revert of the whole deploy — the stage's rollback, written down or not. |
| "Monitoring can go in after launch" | A signal with no pre-deploy baseline cannot tell a regression from a Tuesday. |
| "The migration is one-way, so plan around it" | An irreversible step with no rollback is a stop-list item ([`safety-rails.md`](../../references/safety-rails.md)) — a rollback written for a step that has none is fiction. |
| "Rolling back would admit the release failed" | A rehearsed way back is what makes shipping early affordable. |
| "Every gate came back green" | The gates graded the change; the deploy is a separate act, and nothing has graded that. |

## Red flags

- A ticked pre-launch box with nothing beside it saying what cleared it.
- A rollout stage with no audience, window or named watcher.
- A flag with no owner or removal date, or one nested inside another.
- Thresholds copied from a template, with no baseline named beside them.
- A runbook written around a step whose rollback nobody can describe.
- "It's Friday afternoon, let's ship it" — or a deploy or canary-advance fired by this pass rather than by
  the person at the console.

## Verification

- [ ] The runbook exists at its path with the six stable sections below, its word count measured against
      the cap.
- [ ] Every pre-launch area reads cleared-by-this-evidence or outstanding-and-needs-this; a blank one
      reads as cleared.
- [ ] Every rollout stage carries an audience, a window, a watcher and a way back; every rollback route
      its triggers, steps, data consequences and time to roll back.
- [ ] The thresholds name the baseline and the success measure they were read against, and the flag its
      owner and removal date — or the runbook says there is no flag service and what replaces it.
- [ ] Every derived value reads `derived`, and every default matches one `docs/session-log.md` entry.
- [ ] The `Deploy fence` reads `Executed by: human, post-merge`, and no deploy, rollout, canary or
      rollback command ran here — the work ends at the written runbook, not at the deploy.
- [ ] Any release step with no rollback reads as a stop-list item in the runbook, with no rollback
      invented for it.

## Outputs & handoff

**`docs/features/<slug>/release.md`**, or `docs/releases/<date>-<slug>.md` for a release batching several
features — cap 600 words, `derived` from the `qa.md` cap because this file has none of its own, these six
stable sections in this order. Report the measured count against the cap; an over-cap runbook is trimmed
before it is handed over, never passed on as if it fit.

```markdown
# Release — <feature or date>

## Pre-launch checklist   area → cleared by <evidence> | outstanding: <what it needs>
## Feature-flag plan      name · owner · removal date · off → team → canary → full → flag and dead path deleted
## Staged-rollout plan    stage · audience · window · who watches · the way back, then
                          | Signal | Advance | Hold | Roll back | — baseline named, bound to prd.md's success measure
## Rollback plan          per route: triggers · steps · what happens to data · time to roll back
## Monitoring setup       dashboards and alerts to watch · the first-hour checks
## Deploy fence           `Executed by: human, post-merge` — every deploy, flag enable, canary advance
                          and rollback above is a person's step
```

No skill reads `release.md`; its consumer is the person running the deploy. No pull request waits for it.

**Appended to `docs/session-log.md`**: one entry per default taken, cap 60 words; shape and append rules
in [`state-schema.md`](../../references/state-schema.md).

**Returned in conversation**: the runbook's path and its measured word count, and any step the runbook
names as a stop-list item.

**Nothing else.** No `STATE.md` row — release-level work owns no slice, the caller owning any transition
([`state-schema.md`](../../references/state-schema.md)); no code, no CI or deploy configuration (`ci-cd`),
no merge, no command that deploys, advances a rollout or rolls one back.
