---
name: preflight-readiness
description: Probe every environment.md row before a run goes AFK, and again when slices fail like the environment moved — value-blind, side-effect-free, a `pass · concerns · block` verdict naming what each unreachable row holds. Writing the rows is `environment-manifest`'s; installing them, `project-setup`'s.
---

# Preflight readiness

## Purpose

**Stage: cross-cutting.** Principles 1, 6, 7, 8, 9.

Probes every row of a feature's `environment.md` against the machine that will build it — value-blind,
side-effect-free — returning a `pass · concerns · block` verdict per row and one for the run. An
unprovisioned environment fails every slice the same way, hours after the person left; this pass grades
what `environment-manifest` authored, on evidence its author lacked.

## When to use / when to skip

- A run is about to go AFK, someone asks whether this machine can build the thing, or a row was just
  provisioned — nothing else has checked that what the manifest names is there.
- Mid-run, where slices fail in ways no code change fixes — a probe changes nothing, so re-fire it freely.
- A feature declaring no external dependency: probe the emptiness rather than assume it.
- Skip writing or amending rows (`environment-manifest`), and skip installing, exporting, seeding or
  scaffolding (`project-setup`, `ci-cd`) — this pass reports and provisions nothing.
- Nothing lighter sits beside it — no lite path before an AFK run.

## Inputs

- `docs/features/<slug>/environment.md` — helps: the typed rows are what to probe, and `required-by` names
  the slices each holds · without it: reconstruct the rows from the code's own environment reads, imports,
  `scripts` block, lockfile and compose or CI files, marked `derived`
- `STATE.md` — helps: which slices are about to dispatch, so an unreachable row can name what it holds ·
  without it: take the feature from the prompt or the one `docs/features/<slug>/` present, ids `derived`
- The machine itself — PATH, the process environment, connected MCP servers, the endpoints the rows name.
- With a person there, ask a row's `manual:` question, at most three, and answer none yourself.

## Process

1. **Take the rows before probing.** Read `environment.md`, or where there is none reconstruct it as
   Inputs says and mark every row `derived`. Derive nothing the code does not evidence — an invented row
   holds a wave over a dependency the feature never had.

2. **Read no cell as a command.** A `value`, `command` or `verify` cell is a column that does not exist:
   leave it unread and unrun and hand the column back to `environment-manifest`. An
   unreviewed shell line run while nobody watches is what the absent columns prevent.

3. **Probe each row by its kind, value-blind.** Presence and reachability answer the question; a probe
   needing the value is mis-scoped, so narrow it back to presence
   ([`safety-rails.md`](../../references/safety-rails.md)).

| kind | value-blind probe |
|---|---|
| `env-var` | the name is set and non-empty |
| `mcp` | connected, and a read-only call answers |
| `service` | TCP connect or unauthenticated liveness path |
| `runtime-dep` | on PATH, at or above the declared floor |
| `fixture` | present where the row says, contents unread |
| `account` | a free no-spend signal, else un-probeable |

   Predicates, statuses, gotchas, and how a new kind is added:
   [`references/probers.md`](references/probers.md). A row whose kind is outside the table is probed for
   presence only, graded `concerns`, and handed back to `environment-manifest` with the misfit named. A
   change to the manifest's shape — a new kind, a renamed column — lands in the table above and in that
   file in the same commit as the manifest's, since a kind with no prober is a row nothing can answer.

4. **Probe every row before grading any, and change nothing while probing** — no install, upgrade, export,
   seed or mutating call.

5. **Grade every row `pass · concerns · block`,** naming what each non-pass row holds from its `required-by`.
   `block` is a stop-list item and nothing else
   ([`safety-rails.md`](../../references/safety-rails.md)). Unreachable for any other reason — a service
   down, a tool missing, a version under its floor — is `concerns`.

6. **Return the worst row's grade as the verdict** — `pass` where there are no rows to probe — with a
   remediation line under every non-pass row. Where some slices are runnable and others held, name which are
   which and take the default: proceed with what no held row names, logged once and carried as a
   Decided-for-you row in the pull request.

## The `manual: <question>` escape hatch

A row nothing reaches without spending money or taking a human-only step carries `manual: <question>` from
the manifest. Put it to a person where one is there; the attestation is theirs, never fabricated here. Where
nobody is, grade it by what answering would cost — money or a credential is `block`, anything else
`concerns`, the question still open. Where the row carries none — a `derived` or pasted manifest — write the
yes/no question a person would answer, mark it `derived`, and leave it open.

## Rationalizations

- "The key is probably set — just start the wave." → An unprobed row is not a passing row.
- "Reading the value would confirm its format." → Presence is the question; a wrong value surfaces in the
  slice's own test.
- "The manifest ships a `verify:` command, so running it is thorough." → That column does not exist.
- "One `npm i -g` and the wave is unblocked." → A probe that provisions cannot report what it found.
- "This service checks differently — an `if`-branch covers it." → A new primitive is a new section and kind.
- "Nobody is here to answer the `manual:` question, so it is fine." → An unanswered question is a grade, not
  an assumption.

## Red flags

- A command string from the manifest in the shell history.
- An environment variable's value in the report, the log or the terminal.
- A package installed, a service started or a variable exported during the pass.
- A row graded from what the manifest says rather than what the machine answered.
- A `manual:` question the pass answered itself.
- A missing `environment.md` treated as a reason not to run.

## Verification

- [ ] Every row was probed by its kind, or carries an open `manual:` question and why nobody answered it.
- [ ] The verdict is one of `pass · concerns · block`, equals the worst row, and a `block` names the
      stop-list condition behind it.
- [ ] Every non-pass row carries a remediation line and the slice ids it holds; every reconstructed row is
      marked `derived`.
- [ ] No value appears in the output, nothing on the machine changed, and re-firing returns the same verdict.
- [ ] A wave starts on `pass` or `concerns`, with every held slice named and the default logged; on
      `block` the slices that row holds do not start, whatever else does.

## Outputs & handoff

No artifact — a verdict is cheaper to re-derive than to store, and a stored one goes stale. Returned in
conversation: the verdict line, then one line per manifest row in its order, keyed by row name as
`kind · name · status · holds · remediation`.

```
verdict: block — 3 probed · 1 pass · 1 concerns · 1 block
env-var · API_BASE · pass · — · —
runtime-dep · tsc (derived) · concerns · holds OFD-2 · install the compiler `build` names
account · postmark-prod · block · holds OFD-3 · the person funds the tenant — money
```

`holds` is the slice ids from `required-by`, or `—`; `remediation` is the one thing a person would do, and
never names a value.

At most one `docs/session-log.md` entry, cap 60 words, only where something was settled here rather than
merely found. No `STATE.md` cell — the run is the board's only writer
([`state-schema.md`](../../references/state-schema.md)), so a hand-called pass hands its verdict to whoever
owns the transition.
