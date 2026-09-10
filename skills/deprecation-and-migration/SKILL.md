---
name: deprecation-and-migration
description: Deprecate, sunset or retire a legacy system, API, feature, duplicate, or zombie code nobody owns — before anything is deleted: inventory its consumers, size the migration from real usage, write migration.md (notice, guide, per-consumer ledger, removal checklist). A schema or data migration is not this; the post-merge release is `shipping-and-launch`'s.
---

# Deprecation and Migration

## Purpose

**Stage: Ship.** Principles 5, 6, 7.

Retires a system, API, feature or duplicate without stranding what still uses it, and sequences removal
behind a replacement that runs. Emits `migration.md`, no code. Teams build well and remove badly; the
codebase pays rent on both.

## When to use / when to skip

- An old system, API, library or duplicate is being replaced, two implementations folded into one, or a
  feature sunset.
- Something nobody owns still has live consumers.
- A diff deletes or renames a file, symbol, config key or persisted field that something outside names.
- A new system is on the table: its exit is decided now, while the surface is small and a flag is cheap.
- Nothing in the loop calls this by default: it runs when a sunset, replacement or migration is in
  scope, and no artifact waits on it.
- Near-miss — a dead line in a diff: `code-simplification`. A surface nothing consumes yet: `api-design`.
  The release after merging: `shipping-and-launch`.

## Inputs

From the prompt where given, the canonical path otherwise. At most three questions with a person
present, only where the gap changes the retirement's shape.

- **the sunset decision** — `docs/features/<slug>/prd.md` `## Implementation Decisions`, its
  out-of-scope half, or the prompt · without it: read it from the code, successor `derived`.
- **`docs/features/<slug>/research.md`** — the as-is map the inventory starts from · without it: scan
  the repository yourself, inventory `derived`.
- **live usage signals** — metrics, logs, request or dependency counts · without them: the static scan,
  `derived`.
- **the replacement** — running code, or the plan section where it will exist · without it: unbuilt,
  `derived`.
- **`docs/features/<slug>/plan.md` and `STATE.md`** — the slices this migration's code attaches to ·
  without them: describe the slices `plan-breakdown` needs, `derived`.

## The Deprecation Decision

Answer five questions in the file before anything is declared dead: does it still provide unique value;
how many consumers depend on it; does a replacement exist; what one consumer's migration costs; what
*not* retiring it costs in security exposure, engineer time and carried complexity. A yes to the first
ends the pass — maintain it, and report the answer that stopped it.

## Compulsory vs Advisory Deprecation

Advisory by default: warnings and docs, each consumer moving on its own timeline. Compulsory — a dated
removal — earns its cost only when the old system carries a security problem, blocks the work or costs
more than it returns, and only with migration tooling, documentation and support behind the date.

## The Migration Process

Write it into `docs/features/<slug>/migration.md` as you go; shape in Outputs & handoff.

1. **Inventory every consumer and touchpoint before sizing the work** — imports, call sites, config and
   cache keys, persisted data, env vars, docs, tests, dashboards, alerts. Grep the concept and its
   vocabulary, not the filename. Past enough consumers, every observable behaviour — error text and
   timing included — is depended on by someone.

2. **Give usage a number and its source.** With no metric or log, use the static scan, mark the figure
   `derived`, and name what that scan cannot see.

3. **Sequence removal behind a replacement proven in production** — critical use cases covered,
   documented, running. While it is on paper, write the notice and ledger anyway, leave the Removal
   Checklist unticked, and put its slices first.

4. **Name the route (below) and the advisory-or-compulsory call (above) in the notice.**

5. **Migrate consumers one at a time, ticking a ledger row each:** touchpoints found, consumer moved,
   behaviour verified, old references deleted, no regressions. The **Churn Rule** — whoever owns the
   retired thing owns the migration off it, or ships a backward-compatible change needing none.

6. **Remove only once every ledger row reads migrated-and-verified and usage reads zero** — code, tests,
   docs, config and the notices themselves, in one pass.

7. **Decide the rest and leave a trace.** Removal date, advisory or compulsory, the old system's data:
   default, reason, one `docs/session-log.md` entry, a Decided-for-you row in the PR. A removal with no
   way back, or one crossing the Not-Doing list, is a stop-list item
   ([`safety-rails.md`](../../references/safety-rails.md)) — hand it back.

## Migration Patterns

| Route | Shape | Fits |
|---|---|---|
| Strangler | run both, route 0 → 10 → 50 → 100%, retire the old at 0% | traffic-bearing systems |
| Adapter | keep the old interface, delegate to the new implementation | consumers you do not own |
| Feature flag | move consumers across one at a time behind a flag | many consumers, one codebase |
| In place | change every touchpoint in one commit | few consumers, all yours |

## Zombie Code

No maintainer, live consumers, stale dependencies with open vulnerabilities, failing tests nobody fixes.
It gets an owner or a dated plan out; limbo is not a third option.

## Rationalizations

- "It still works, why remove it?" → unmaintained code accrues security debt in silence.
- "Nothing imports it, so nobody uses it" → a scan misses a persisted key already in browsers, a client
  in the field, a cron nobody grepped.
- "They'll migrate on their own" → they have their own backlog; the retiring owner owns the migration.
- "A hard date will make them move" → a deadline with no tooling or guide is an announcement.
- "Someone might need it later" → rebuilding it then costs less than carrying it until then.
- "We'll plan the exit once the new system ships" → by then there are new priorities; the exit is
  decided while the surface is small.

## Red flags

- A dated deprecation notice with no tooling, guide or support behind it.
- "Nothing imports it" standing in for a usage number, on something with persisted data or field clients.
- A blank verification cell, or a ticked Removal Checklist box with no evidence.
- A system advisory-deprecated for years, still taking new features.
- Zombie code left in limbo rather than owned or dated out.
- A removal leaving orphaned consumers, reported as a ship.

## Verification

- [ ] The five questions are answered in the file, or the report names the answer that stopped the pass.
- [ ] The inventory names every touchpoint and the scan that found it; usage carries a number, its
      source, and — where `derived` — what that scan cannot see.
- [ ] Removal sits behind a replacement running in production, or the Removal Checklist is unticked and
      the replacement's slices come first.
- [ ] The notice is filled out and names the route; the guide's steps paste.
- [ ] The ledger holds one row per consumer with no cell blank, every ticked Removal Checklist box has
      its evidence beside it, and nothing reads removed while a ledger row is unmigrated.

## Outputs & handoff

**`docs/features/<slug>/migration.md`** — cap 600 words, four stable sections, written for a cold reader
holding one consumer. An over-cap file is trimmed, not handed on as if it fit.

```markdown
# Migration — <what is being retired>

## Deprecation Notice   Status · Replacement · Removal date (advisory, or a date) · Reason · route
## Migration Guide      copy-pasteable steps and a worked example, per kind of consumer
## Migration Ledger     | Consumer | Touchpoints | Migrated? | Verified (tests/metrics) |
## Removal Checklist    zero usage proven with the evidence · code, tests, docs, config removed ·
                        no reference left anywhere · the deprecation notices themselves gone
```

The Migration Ledger is the source of truth for "every consumer has moved".

**Appended to `docs/session-log.md`**: one entry per default taken, cap 60 words; shape in
[`state-schema.md`](../../references/state-schema.md).

**Returned in conversation**: path, the measured word count against the cap, the route chosen, and what
removal waits on.

**Nothing else.** No `STATE.md` row — a code-changing migration is cut into slices by `plan-breakdown`,
whose rows and tokens are the run's ([`state-schema.md`](../../references/state-schema.md)); no code,
test, commit or pull request. The removal and replacement commits go out through `git-workflow` and
`pull-request`, citing this file and any ADR it supersedes.
