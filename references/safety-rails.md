# Safety rails

The stop list, the two dispatch rules and the verdict vocabulary, stated once. Outside them the model
decides.

## The stop list

A slice ends for these six and no others: `State` becomes `blocked`, `Gate` flips to `you`, the report
names which fired.

1. **A secret in the diff or its history.** Rotation is the person's; no care afterwards undoes it.
2. **A Critical or High security finding.** That severity is the audit's, not the pull request's risk
   band — a HIGH band stops nothing; a HIGH finding stops the slice on contact.
3. **A step needing a credential, money, or production data.** Supplying capability is an act of
   authorisation only the person can perform.
4. **An irreversible action with no rollback.** The run that gets it wrong is not what pays.
5. **A change crossing the feature's Not-Doing list.** That line is intent, not plan.
6. **The repair ladder exhausted** — retry-with-error, root-cause, change route, shrink, surface. When
   the last rung is spent, the failure is not one attempt away.

Never print, log, echo or write down a credential's value. Report that one is present, never what it is.

## Everything else is decided and flagged

Take a default, state the reason, build, append one `docs/session-log.md` entry, add a row to the pull
request's **Decided for you** table. High-risk work — authentication, payments, destructive migrations,
deletions — is not on the list: it raises the risk band, which is how a person triages. A stopped slice
terminates and reports; it never waits.

## A human merges

The autonomous span ends at an open, risk-banded draft pull request on a branch. Never `gh pr merge`,
never a push to `main`, never a deploy or release. What a run produces is reversible up to that merge and
little of it after; the band carries irreversibility to the person standing there.

## One writer per file

Two agents in parallel never own the same file. Read subagents parallelize freely; a write needs an owner
declared at dispatch. Where a wave's slices would overlap, serialize into sub-waves or merge into one —
an unowned overlap is a race whose loser's work vanishes with no error. A barrier waits for terminal
states, never success, so a blocked slice drains the wave.

## Code-cold dispatch

A code-cold pass dispatches **the skill itself** in a fresh subagent that never saw the maker's context,
inside a run and outside one alike; there is no persona to play on top of it. On a host with no skill
tool the `SKILL.md` is the subagent's prompt (`docs/setup.md`).

## Verdicts

Every Verify and Review output uses `pass · concerns · block`, where `block` means a stop-list item and
nothing else.

## How a skill cites this

Name the rail; do not restate it — *"a secret in the diff is a stop-list item
(`references/safety-rails.md`)"*. A copy in a skill body drifts from this one, leaving two versions of a
safety rule and no way to tell which is live.
