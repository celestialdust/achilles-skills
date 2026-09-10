---
name: performance-optimization
description: Judge a diff's cost on measurements — profile the changed path, cite before/after numbers, and name N+1 queries, unbounded fetches, oversized bundles and needless re-renders. Reach for it code-cold on a slice touching data fetching, rendering or bundle size, or a load-time budget. Complexity alone is `code-simplification`; the five-axis grade is `code-review`.
---

# Performance Optimization

## Purpose

**Stage: Review.** Principles 6, 7, 8, 9.

The measure-first performance lens of the Review fan-out, dispatched code-cold over a slice's diff. It
profiles the changed path, holds the numbers against the feature's budget, and writes
`reviews/<SLICE-ID>-perf.md`: findings that each carry a measurement, and one verdict. It judges on
evidence and applies nothing.

## When to use / when to skip

- The Review fan-out dispatches you code-cold over a wave's diffs, beside `code-review`,
  `code-simplification` and `security-and-hardening`
  ([`safety-rails.md`](../../references/safety-rails.md), *Code-cold dispatch*).
- The diff touches data fetching, a query, rendering, an image, a font or the initial bundle, or an
  acceptance scenario names LCP, INP, CLS, a p95 or a bundle ceiling.
- The app is reported slow, a vital dropped a band, or a feature is about to meet a dataset nothing here
  was measured against.
- **Skip** a diff nothing has slowed and no budget covers: optimizing with no evidence of a problem costs
  more than the performance it gains.
- **Near-miss.** Five-axis grade: `code-review`. Complexity in code believed correct:
  `code-simplification`. OWASP, secrets, dependencies: `security-and-hardening`. Driving the browser for a
  trace: `browser-testing-with-devtools`.

## Inputs

Nobody is present on a code-cold pass; what is absent gets derived and marked `derived` in the findings.

- **the diff** — helps: it is the change whose cost you measure · without it: read `git diff <base>..HEAD`
  or the working tree and name the range, `derived`.
- **a way to measure** — the running app, a build, a bundle report, a query log, Lighthouse, a trace —
  helps: numbers, and a finding without one is an opinion · without it: read the changed paths for the
  anti-patterns below, mark each finding `unmeasured` with the instrument that would settle it, and hold
  the verdict at `concerns`. An eyeballed pass is a guess dressed as evidence; a missing instrument names
  a gap rather than ending a slice.
- `docs/features/<slug>/acceptance.md` — helps: the scenarios naming a threshold, the numbers this diff
  owes · without it: take the defaults under *Performance Budget*, `derived`.
- `docs/features/<slug>/prd.md` — helps: the constraints and the Not-Doing list a recommended fix must
  not cross · without it: take the repo's existing conventions and say so, `derived`.
- `docs/features/<slug>/environment.md` — helps: what to profile against · without it: read the repo's run
  scripts and config, `derived`.
- `STATE.md` and `docs/features/<slug>/plan/<slice-id>.md` — helps: the slice id and its owned files, so a
  finding routes to its owner · without it: attribute by file path, `derived`.

## Core Web Vitals Targets

The good / needs-improvement / poor bands are in
[`performance-checklist.md`](../../references/performance-checklist.md), read on a mid-range Android or at
4×–6× CPU throttling. A vital dropping a band on a path this diff changed is a finding with the trace
behind it.

## The Optimization Workflow

Measure, find the real bottleneck, name the fix and the guard. Only what a measurement points at is worth
changing.

1. **Measure the changed path before reading it for faults** — the endpoint, the interaction, the bundle —
   and record the number with the conditions behind it. Take both kinds: a synthetic number (Lighthouse, a
   trace, a bundle report) catches a regression on demand; a field number (RUM, CrUX) is what says a real
   user got faster.

2. **Let the symptom pick the instrument.**

   | Symptom | What to open |
   |---|---|
   | First load | bundle report; Network waterfall — DNS, TCP-TLS, waiting |
   | A lagging interaction | Performance trace; tasks over 50ms; `onINP` attribution |
   | Content jumping | layout-shift attribution — images without dimensions, late content, a font swap |
   | A slow page after navigation | API timings and the request list — a fetch waterfall, a client N+1 |
   | One slow endpoint | slow-query log and query plan — N+1, a missing index, an unbounded scan |
   | Every endpoint slow | pool metrics, heap snapshot, CPU profile — exhaustion, a leak, GC pauses |
   | Slow only sometimes | lock waits, GC logs, external-dependency timings — contention, a pause, a dependency degrading |

3. **Name the anti-pattern the measurement points at, in the lines this diff changed.**

   | In the diff | The finding | What closes it |
   |---|---|---|
   | a read per row inside a loop | N+1 | one query with a join or an include |
   | a list read with no limit or order | unbounded fetch | `take`/`skip` or a cursor, plus an order |
   | an `<img>` with no `width`/`height`, no `srcset`, a legacy format | LCP and CLS cost | the checklist's image rules |
   | a fresh object or closure as a prop; an unmemoized expensive component; a per-keystroke computation | needless re-render | a hoisted reference, or memoization where the profile shows the gain |
   | a heavy or rarely-used module imported eagerly | bundle cost | `import()` at the route or the feature |
   | the same rarely-changing read every request | missing cache | a TTL on the read; the checklist's caching rules |

   [`performance-checklist.md`](../../references/performance-checklist.md) holds those image and caching
   rules in full, and fonts, critical CSS, yielding the main thread and infrastructure besides.

4. **Give every finding a number, a place, a fix and a guard** — severity `blocker · major · minor`, a
   `path:line` in the diff, the before against the after (or a projected after and what would confirm it),
   the change that closes it, and the check that keeps it out: `bundlesize` or `lhci autorun` in CI, a
   query-count assertion, a threshold in the acceptance scenarios. Findings rest on a measurement or a
   named anti-pattern, never on an adjective.

5. **Report, and edit nothing** — not the code, not the tests, not the build config; the slice's owner
   applies the fix, re-runs the suite and re-measures against your before-number.

6. **Decide the rest yourself and leave the trace.** An unstated budget, an anti-pattern acceptable at
   this scale, a fix deferred to a later slice: take the default, state the reason, append one
   `docs/session-log.md` entry, hand `pull-request` a Decided-for-you row. A regression past budget raises
   the risk band; it is a finding, not a question.

7. **Return one verdict — `pass · concerns · block`.** `pass` is measured, inside budget, no anti-pattern
   in the changed paths. `concerns` carries what should move before merge, a past-budget regression and a
   poor-band vital included. `block` is a stop-list item and nothing else
   ([`safety-rails.md`](../../references/safety-rails.md)).

## Performance Budget

Where the feature states thresholds they win; where it states none, these are the defaults, reported
`derived`: initial JavaScript under 200KB gzipped · CSS under 50KB · an above-the-fold image under 200KB ·
fonts under 100KB total · API p95 under 200ms · time-to-interactive under 3.5s on 4G · Lighthouse
performance 90 or better.

## Rationalizations

| Rationalization | Reality |
|---|---|
| "This optimization is obvious" | An unprofiled bottleneck is a guess, and the obvious candidate is rarely where the time sits. |
| "It's fast on my machine" | The user's machine is a mid-range phone on a worse network, where INP problems live. |
| "We'll optimize later" | These anti-patterns are cheap now and structural later; micro-optimizations are the ones worth deferring. |
| "Named imports are bloating the bundle" | A modern bundler tree-shakes them; the gains live in splitting and lazy loading. |
| "I'm in the file anyway, I'll just fix it" | A checker that edits what it graded has no independent evidence left, and a sibling axis is in that file. |

## Red flags

- A recommendation with no number behind it, or a number with no conditions beside it.
- A fix aimed where the profile never pointed.
- `React.memo` and `useMemo` sprayed across components nobody profiled.
- A list endpoint with no limit, or a loop issuing one read per row.
- A finding written into the code under review instead of the findings file.
- A bundle that grew in this diff with nobody reporting by how much.

## Verification

- [ ] Every changed path carries a before number and its conditions, or is marked `unmeasured` with the
      instrument that would settle it.
- [ ] Each finding cites a `path:line` in the diff and carries a severity, a measurement or a named
      anti-pattern, the fix, and the guard.
- [ ] The thresholds graded against are the feature's or the defaults marked `derived`, each reported
      cleared or not.
- [ ] No code, test or build configuration under review moved.
- [ ] Each call outside the stop list is a default with a reason, one log entry, and a Decided-for-you row.
- [ ] The verdict is one of `pass · concerns · block`, and a `block` names the condition that fired.

## Outputs & handoff

`docs/features/<slug>/reviews/<SLICE-ID>-perf.md` — cap 600 words, one file per owning slice, you its sole
writer. Called by hand with no slice and no feature, the same sections come back in conversation instead.

- `## Measurements` — per changed path: instrument, conditions, the before number and the projected
  after with what would confirm it, or `unmeasured` and what would settle it.
- `## Findings` — severity (`blocker|major|minor`) · `path:line` · the number or the named anti-pattern ·
  the fix · the guard, `derived` on anything reconstructed.
- `## Budget` — each threshold, its source, and whether the measurement clears it.
- `## Verdict` — `pass | concerns | block`; on a block, the stop-list condition that fired.

Measure the draft against that cap and report the count; an over-cap draft goes on as an over-run, never
as one that fit. Where this pass settled something itself, one `docs/session-log.md` entry of at most 60
words is appended, matching the pull request's **Decided for you** row.

No `STATE.md` row is written and no gate flipped — the caller owns the slice's transition
([`state-schema.md`](../../references/state-schema.md)).
