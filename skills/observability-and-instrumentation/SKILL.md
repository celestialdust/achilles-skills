---
name: observability-and-instrumentation
description: Instrument a diff so a production failure leaves evidence — on-call questions first, then structured logs, RED metrics, spans and symptom alerts, then exercise the telemetry. Reach for it on any error branch, retry, job or outbound call. Diagnosing a live failure is `debugging-and-error-recovery`; slowness, `performance-optimization`.
---

# Observability and Instrumentation

## Purpose

**Stage: cross-cutting.** Principles 6, 7, 8.

Instruments a slice's diff so a production failure leaves evidence: on-call questions first, then the
structured logs, RED metrics, spans and symptom alerts answering them, then a pass exercising what it
added. It emits no artifact — instrumentation ships inside the diff it observes, since code nobody can
observe is code nobody can operate.

## When to use / when to skip

- A slice adds an error branch, retry, background job, queue or outbound call, and
  `incremental-implementation` is about to commit it.
- The Review fan-out dispatches you code-cold over a wave's diffs for that same fact — a
  production-failure path emitting no log, metric or trace
  ([`safety-rails.md`](../../references/safety-rails.md), *Code-cold dispatch*).
- Someone asks by hand for logging, metrics or alerting, or an incident closed with "we could not tell
  what happened".
- The pre-launch gate `shipping-and-launch` works through before a release
  ([`observability-checklist.md`](../../references/observability-checklist.md), *Pre-launch gate*) —
  release-level, after a person merges: it blocks a release, not a slice's draft pull request, which is
  `pull-request`'s.
- Skip a diff touching no I/O, retry, queue, job or outbound call: record "no telemetry surface" with
  that reason and add nothing — signals nobody queries cost a budget and answer no question.
- Near-miss — a live failure is `debugging-and-error-recovery`'s, and this pass makes the next one fast;
  measured slowness `performance-optimization`'s, the five-axis grade `code-review`'s, a secret in the
  diff `security-and-hardening`'s.

## Inputs

- the diff, or the slice being built — helps: names the surface and which signals it needs · without it:
  read `git diff <base>..HEAD` or the working tree and name the range, `derived`
- `docs/features/<slug>/prd.md` — helps: what the feature is for, so the questions are product-level
  rather than framework-level · without it: take them from the routes, jobs and calls the diff adds,
  `derived`
- `docs/features/<slug>/acceptance.md` — helps: its `error/edge` and `security-observable` scenarios, the
  failure paths already promised observable · without it: derive them from the failure modes the code
  branches on, `derived`
- `docs/features/<slug>/plan/<slice-id>.md` — helps: the files this slice owns, so telemetry lands in its
  own commits · without it: attribute by file path, `derived`
- the repository's existing telemetry — helps: the logger, metrics client and tracing setup a second
  stack beside them would fragment · without it: grep for each and say what you found, `derived`

With a person present, ask at most three questions, and only where the gap changes which signals the
feature needs.

## Process

1. **Write the on-call questions before adding a signal** — two to four an on-call engineer will ask —
   and map every log line, metric and span to one, dropping any that answers none.

2. **Match each question to its signal**: metrics say *that* something is wrong, traces *where*, logs
   *why*. Then walk the changed files through
   [`observability-checklist.md`](../../references/observability-checklist.md) — logging, metrics,
   tracing, alerting, dashboards — hardest at what the diff introduced.

3. **Log events, not prose**: a stable event name and machine-readable fields, never interpolation. A
   correlation ID minted or accepted at the boundary rides every line, span and outbound call, or
   interleaved traffic buries the request. Allowlist logged fields rather than whole bodies — a
   credential's value in a log line, span attribute or metric label is a secret in the diff, a stop-list
   item ([`safety-rails.md`](../../references/safety-rails.md)), reported as present with the value
   unprinted. A client error boundary and a server error middleware are the last places an unhandled
   error becomes a correlated event; what reaches the user from either is that ID, not the stack
   ([`security-checklist.md`](../../references/security-checklist.md), *Error handling*).

4. **RED every endpoint and external dependency** — rate, errors, duration — and USE every resource:
   queues, pools, hosts. Draw labels from small fixed sets, never a user id, raw URL, request id or error
   string; that detail belongs in a log or a span. Record latency as a histogram whose p95 and p99 are
   readable.

5. **Trace across the gaps.** Start OpenTelemetry before the imports it patches, auto-instrument HTTP and
   the DB clients, add a manual span only around work someone would filter by. Propagate context
   outbound, extract it inbound, carry it through queue messages — a trace ends at the first boundary
   that drops it, and the hop you lose is usually the slow one.

6. **Alert on symptoms users feel** — error rate, latency, queue age — and route causes like CPU, disk
   and restarts to a dashboard. Each alert carries a three-line runbook (meaning, first query,
   escalation), a threshold argued from an SLO or from history rather than guessed, and one of two
   severities: `page` now, `ticket` this week. Delete any alert whose honest answer is "ignore it, it
   self-heals".

7. **Exercise the telemetry**: force the error path and find it by correlation ID with its fields intact,
   send traffic and read the series back with the labels you expected, follow one request end to end with
   no broken span, test-fire each alert to its real channel and runbook link. Return those commands with
   their real output, naming what you could not reach and why.

8. **Commit telemetry with the code it observes**, in the files the slice names — not a follow-up file,
   not a later slice.

9. **Decide the rest and leave the trace** — a signal not worth its cost, a vendor matching what the
   repository runs, a sampling rate: default, reason, build, one `docs/session-log.md` entry, a
   Decided-for-you row for `pull-request`. A code-cold pass returns `pass · concerns · block`: a missing
   signal is `concerns`, `block` is a stop-list item alone, and the band is `pull-request`'s to compute.

## Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll add the logging once it works" | "Once it works" arrives as "once it broke" — the hour instrumenting costs most. |
| "`console.log` is fine for now" | Interpolated output cannot be filtered, counted or alerted on; a structured logger costs five minutes once. |
| "We'll check the dashboard when it breaks" | A dashboard built without the on-call questions renders everything except the answer. |
| "`user_id` as a label makes debugging easier" | It multiplies series until the metrics backend falls over, taking the backend down rather than the app. |
| "Alert on everything, we'll tune it later" | A pager that cries wolf gets ignored, the tuning never happens, and the real page is the one missed. |
| "The logger is wired, so the telemetry works" | Instrumentation is code with no test behind it: `[object Object]`, a dropped span and a dead runbook link all compile. |

## Red flags

- A retry, queue or outbound call in the diff with no signal added beside it.
- A log line assembled by interpolation, or an orphan line carrying no correlation ID.
- A metric labelled with a user id, a raw URL or an error string.
- Latency reported as an average, with no percentile behind it.
- A pager firing daily and acknowledged without action, or paging on CPU while the user-facing error rate
  goes unwatched.
- A token, a session cookie or a whole request body in the log output.

## Verification

- [ ] The on-call questions are written down and every signal answers one — or the diff is recorded "no
      telemetry surface" with its reason.
- [ ] Every new log line is structured, names a stable event and carries the correlation ID, and no
      credential value or unredacted personal field reached a log, span attribute or metric label.
- [ ] Every new endpoint and dependency carries RED with bounded labels, and latency reads as p95/p99.
- [ ] The forced error was found by correlation ID, one request ran end to end with no broken span, and
      each new alert reached its channel with a working runbook link.
- [ ] An induced failure was diagnosed from telemetry alone, without reading the source — or what stopped
      that is named.
- [ ] Telemetry sits in the same commits as the code it observes, and each reconstructed input reads
      `derived`.
- [ ] On a code-cold pass the verdict is one of `pass · concerns · block`, and a `block` names the
      stop-list condition that fired.

## Outputs & handoff

**Writes instrumentation inside the slice's diff** — logger calls, metric definitions, tracing setup,
alert rules — committed with the code they observe, scoped to the files the slice names. There is no
telemetry artifact: the diff is the deliverable and its cap is the slice's.

**Appends** one `docs/session-log.md` entry per decided-for-you call, cap 60 words, shaped as
[`state-schema.md`](../../references/state-schema.md) states. Report each entry's measured length against
that cap; an over-cap draft goes on at its real size, never as one that fit.

**Returns in conversation** the on-call questions with the signal answering each, the commands that
exercised the telemetry and their real output, anything recorded "no telemetry surface" with its reason,
and on a code-cold pass `## Verdict` plus `## Findings` — each finding a `path:line`, the signal it wants,
the question that signal answers.

**Nothing on the board** — no `STATE.md` row, no gate flip; the caller owns the slice's transition
([`state-schema.md`](../../references/state-schema.md)).
