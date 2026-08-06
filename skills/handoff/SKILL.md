---
name: handoff
description: Compact the current session into a cold-start handoff the MOMENT context fills, the work pauses, or you are about to /clear — so a fresh agent resumes from durable state, not a lost conversation. Writes the 5-field handoff plus an append-only session log of decisions (the reason, what was ruled out, what is still open), references artifacts by path instead of duplicating them, and redacts every secret. Use BEFORE you lose context, not after — and whenever a decision was made that a later session would otherwise re-open.
---

## Purpose

Stage: **cross-cutting · per-session handoff layer.**

A context window fills, a session pauses, or you are about to `/clear` — and the live
conversation, the only place the working state lives, is about to vanish. This skill compacts
that conversation into a **cold-start document a fresh agent resumes from with zero prior
context**.

It is the **per-session** half of the two-layer handoff. The other half — the
per-stage artifact chain (`intent.md → research.md → prd.md → … → qa.md`) and `STATE.md` — carries *structural*
state turn-to-turn. This skill carries the *session's working state*: the decision just made, the
half-finished thought, the single next move that those durable artifacts do not yet hold. Written
in the **N14 5-field schema** so it pairs with (and can BE) `docs/session-state.md`.

`docs/session-state.md` holds **two zones, and they are different kinds of thing.** The five fields are
a *snapshot* — where the work stands right now, rewritten in place each time. Beneath them, `## Log` is
a *record* — why the work stands there, appended to and never edited. The snapshot is status; the log
is evidence. See "The session log" below.

## When to use / when to skip

**Use when:**
- Context budget is nearing the ceiling mid-session — finish the current step, then hand off.
- You are about to `/clear`, switch agents, or stop a long human-led session (Ideate / Spec / Plan).
- A teammate or a fresh agent will pick the work up cold.
- A decision was made this session that a later session would otherwise re-open. Append the log entry
  even when the rest of the handoff is not worth writing — an unrecorded reason is re-argued for free.

**Skip when:**
- `STATE.md` + the per-stage artifact chain already capture everything. An autonomous orchestrator
  run is resumable from `STATE.md` alone (auto-compaction + ~1M context — no handoff-resume
  loop). Do not write a handoff just to restate `STATE.md`.
- The work is one atomic step you will finish this turn.

**Escape hatch:** if you are mid-step, do NOT abandon it to write the handoff — finish the step
first (context-budget rule), then hand off. A handoff written mid-thought is worse than none.

## Inputs

- **The current conversation** — the primary source being compacted.
- **OPTIONAL argument**: a one-line description of what the next session will focus on. Treat it as
  the lens — tailor every field toward that focus.
- **Read-only, to reference (never restate):** `STATE.md`; the per-feature chain under
  `docs/features/<slug>/` (`intent.md`, `prd.md`, `acceptance.md`, `plan.md`, `qa.md`); `docs/adr/`;
  recent commits/diffs.

No refuse-to-run gate — a handoff can always be written from the conversation. But **read the
durable artifacts FIRST** so you reference them by path rather than copy their bodies in.

## Process

1. **Pick the destination.** Session-boundary handoff → write to `docs/session-state.md` (the N14
   home, committed). Throwaway mid-session compaction → write `handoff.md` to the OS temp dir, not
   the workspace. Same five fields either way. The `## Log` zone belongs only to the committed
   `docs/session-state.md` — an append-only record inside a file that gets deleted records nothing.
2. **Read what is already there.** If `docs/session-state.md` exists, read its `## Log` before you
   write a line. You are about to append to it, so you need to know which questions it already
   answers — and an entry of yours that reverses an earlier one has to say so.
3. **Write the five N14 fields — state, not narrative.** `## Current objective` (one sentence) ·
   `## Current state` (what is done; which files changed; last known-good commit) ·
   `## Remaining issues` (blockers, open questions, undecided calls) · `## Boundaries` (what is IN
   and OUT of scope for the next agent — do not let them over- or under-reach) · `## Next phase`
   (the single next action, specific enough to resume without asking a question). These five are
   overwritten in place; only the latest version is true.
4. **Append one `## Log` entry per decision this session made.** Decision · reason · what was ruled
   out · what is still open. Appended after the last existing entry; earlier entries untouched. See
   "The session log" below for the shape and the append-only rule.
5. **Reference, do not duplicate.** Anything already captured in `prd.md`, `plan.md`, an ADR, an
   issue, a commit, or a diff is named by path/URL — never pasted. Duplicated knowledge diverges.
6. **Add `## Suggested skills`** — name the skills the fresh agent should invoke next (e.g. resume
   Spec → `spec-review`, `to-prd`; resume Plan → `plan-breakdown`, `codebase-research`).
7. **Redact.** Replace every API key, token, password, and PII with `[REDACTED]`. For environment
   needs, point at `environment.md` (typed manifest, no value column) — never carry a value
   into the handoff. Redact *before* appending a log entry, never after: the log is append-only, so a
   token written into an entry cannot be quietly taken back out.
8. **Tailor to the argument** if one was passed — bias `Current state` / `Next phase` toward that
   next-session focus.

## The handoff document — structure

```markdown
## Current objective
[One sentence: what this work is trying to accomplish.]

## Current state
[Done so far; files changed; last known-good commit. Reference prd.md / plan.md by path.]

## Remaining issues
[Blockers, open questions, unresolved decisions.]

## Boundaries
[IN scope and OUT of scope for the next agent. Do not cross these.]

## Next phase
[The single next action — specific enough to resume without asking a question.]

## Suggested skills
[Skills the fresh agent should invoke next, and why.]

## Referenced artifacts
[Paths/URLs to prd.md, plan.md, ADRs, STATE.md, commits — NOT their contents.]

## Log
[Append-only. Oldest entry first, new entries added at the end. Committed copy only.]
```

Everything above `## Log` is the snapshot — rewritten in place. `## Log` is the record — only ever
grown. The two zones live in one file because a reader who wants to know where the work stands almost
always also wants to know why, and two files drift apart.

## The session log

### What an entry holds

One entry per decision, appended after the last existing entry:

```markdown
### 2026-03-14 — reset tokens live in Redis, not Postgres
Decided: reset tokens go in Redis with a one-hour expiry.
Because: they are written once, read once, and then expire; a durable table needs a sweeper nobody owns.
Ruled out: a Postgres table (the sweeper); in-memory (dies with the process, and there are two of them).
Still open: whether one hour is the right window — nobody has looked at real reset timings yet.
```

Four things, and nothing else: **the decision, the reason, what was ruled out, and what is still open.**

Never record which files changed, which functions were added, what the diff did, or how many tests
passed. The git history already holds all of that, exactly. A second copy of a fact you can derive is a
copy that can disagree with its source, and when it does, a reader has no way to tell which one is
lying. The log's job is the part git cannot show: why the code is shaped this way, and what was turned
down on the way there.

The snapshot above may name changed files; an entry may not. The difference is lifetime. The snapshot
is overwritten on the next write, so it cannot stay wrong for long. An entry is permanent, and a
permanent copy of a fact that keeps moving is guaranteed to go stale.

### Append-only — and the report when it is broken

A new entry goes **after** the existing ones. Every earlier entry stays byte-for-byte as it was written:
not reworded, not re-dated, not re-ordered, not removed.

An entry that turned out to be wrong is corrected by a **new** entry that names the earlier one and says
what was wrong with it. The earlier entry stays. That the call was once made that way is the fact worth
keeping — delete it and you get a repo whose reasoning has no history, which is the state this file
exists to end.

**If an earlier entry is about to change — or you find one that already has — report it as a violation.**
Refusing quietly is not enough. A silent refusal leaves whoever asked for the edit believing it
happened, and a silent repair hides that the record was ever unreliable. The report says four things:
which entry (quote its heading), what was going to change or what changed, that `## Log` is append-only
so the change is refused, and that the correction route is a new entry naming the old one. Then stop and
let a person decide. A changed earlier entry is altered evidence — treat it as seriously as any other.

**Secrets are the one place the two rules collide, and redaction wins.** Redact before you append, so
the collision never arises. If a live credential did land in an earlier entry, the standing rule still
holds — replace it with `[REDACTED]` — and then do the other three things: rotate the credential (the
earlier version is already in git, so editing the file un-leaks nothing), report the edit as the
append-only exception it is and name the entry, and append a new entry recording what happened. This
covers the secret and nothing else; "there was a secret in it" never licenses any other change to that
entry.

### Reading it back

A session resuming cold reads `docs/session-state.md` **before it does anything else** — before the
first plan, the first edit, the first question back to the person. The five fields say where the work
stands; `## Log` says why, and which questions are already settled. A question the log answers is not
re-opened. Reversing a logged decision is a new entry with a reason, not a debate restarted from zero.

A log nobody reads is worse than no log — a maintained file with no consumer. `handoff` writes the file;
it is not the skill that reads it back. Two things do:

- **`using-agent-skills`**, the dispatcher that runs first in every session. It reads
  `docs/session-state.md` alongside `STATE.md` before it routes anywhere — `STATE.md` for which stage
  the work is in, the session log for what has already been settled inside that stage.
- **The repo's own `CLAUDE.md` / `AGENTS.md`**, where `project-setup` writes a pointer to this file. That
  covers the case with nothing installed: an agent that loads the repo cold still finds the log.

### Where it sits, and what outranks it

The log is the **weakest source in the repo.** It never overrides a decision record under `docs/adr/`,
and it never overrides a signed `acceptance.md`. Where the log and one of those disagree, the committed
contract is right and the log entry is stale — it records what someone believed on a particular day,
not what the project agreed to.

**A decision that should outlive the session is promoted.** Write it up as a decision record under
`docs/adr/` (`documentation-and-adrs` owns that format), then append a **new** entry naming both the
original entry and the record it became. The original entry is not moved, edited, or deleted —
append-only holds here too, so the pointer lives in the new entry, not bolted onto the old one.
Promotion is what makes the weakest-source rule safe: anything that genuinely has to bind future work
has a way out of the log and into a file that can bind it.

### Kept, not compacted

Never trim, summarize, or roll up old entries to keep the file short. Entries grow with decisions, and
decisions are work: a long log is a project that decided a lot, not a file that needs cleaning. What
compaction is for is the stuff that grows with *elapsed time* — transcripts, chatter, turn counts.
What grows with *work* is kept.

Keep the file **committed, not gitignored.** Its whole purpose is to survive the session that wrote it.
Gitignored, it dies on the next fresh clone — which is exactly the case it exists for.

## Rationalizations

- *"I'll just summarize what we discussed."* → No. A conversation summary forces the next agent to
  reconstruct state. Write **state**, in the five fields (N14 anti-pattern).
- *"I'll paste the plan/PRD in so it's all in one place."* → No. Reference by path; duplicated
  knowledge diverges from its source (DRY-of-knowledge).
- *"The next agent can figure out the scope."* → No. Write `## Boundaries` explicitly, or it will
  over-reach or under-reach.
- *"`Continue where we left off` is enough for Next phase."* → No. That is not actionable; name the
  file and the step.
- *"The secret is internal, it's fine to keep."* → No. Redact always — a handoff outlives the
  session and may be shared or committed.
- *"That old entry was worded badly / turned out wrong — I'll tidy it."* → No. `## Log` is
  append-only. Correct it with a new entry that names the old one. Editing it destroys the evidence
  that the call was ever made that way, and it is a violation you report rather than a cleanup you do.
- *"I'll quietly skip the edit and move on."* → No. Refusing is only half of it. Say which entry, what
  would have changed, and why the change was refused; a silent refusal reads as a silent success.
- *"The log is getting long — I'll roll up the old entries."* → No. Entries grow with decisions, and
  decisions are work. Compaction is for what grows with elapsed time, not for what grows with work.
- *"I'll list the files I touched in the entry so it's complete."* → No. Git holds that, exactly. A
  stored copy of a derivable fact can disagree with its source. Record only what git cannot show.
- *"`session-state.md` is scratch — gitignore it."* → No. The log exists to survive the session that
  wrote it. Gitignored, it dies on a fresh clone, which is the one case it was written for.
- *"The log says we chose X, so X is settled."* → It is the weakest source here. A decision record
  under `docs/adr/` or a signed `acceptance.md` outranks it. If X must bind future work, promote it.
- *"I'll just re-decide this — the entry is old."* → Read it first. If you are reversing it, append an
  entry that says so and why. Re-opening a settled question without reading the log is how a project
  pays for the same decision twice.

## Red flags

- The doc reads as a narrative of "what we did" rather than the five state fields → rewrite.
- `## Next phase` says "keep working on X" with no file/step → not resumable.
- A literal API key, token, password, or PII appears anywhere → STOP, redact to `[REDACTED]`.
- A whole file body, full diff, or PRD/plan section is pasted in → replace with a path reference.
- No `## Boundaries` section → the next agent has no scope fence.
- An earlier `## Log` entry reads differently than it did — edited, re-dated, re-ordered, or gone →
  STOP, restore it, and report the violation naming the entry.
- A log entry that says which files changed or what was added → cut that line; git owns it.
- Work started in a resuming session before `docs/session-state.md` was read → stop and read it; a
  question the log already answers is about to be re-opened.
- Old log entries summarized, rolled up, or trimmed "for readability" → restore them.
- `docs/session-state.md` in `.gitignore` → the log cannot outlive the session; un-ignore it.
- A decision that will bind future work sitting only in the log → promote it to `docs/adr/`.

## Verification (ending criteria)

Done when ALL hold:
- All five N14 headings present and non-empty: Current objective, Current state, Remaining issues,
  Boundaries, Next phase.
- `## Suggested skills` and `## Referenced artifacts` present.
- `## Next phase` is a single concrete action (passes "resume without asking a question").
- No secret/PII literal in the doc (grep common patterns: `sk-`, `sk_live`, `AKIA`, `password=`,
  `token=`); any present → `[REDACTED]`.
- No duplicated artifact body — referenced artifacts appear as paths/URLs only.

For the committed `docs/session-state.md`, also:
- Every decision made this session has an entry under `## Log` carrying all four parts: decision,
  reason, ruled out, still open.
- No entry restates which files changed, what was added, or what the diff did.
- **Earlier entries are byte-for-byte unchanged.** Append-only has an exact mechanical form: the
  committed `## Log` must still be present, byte for byte, in the same order, at the **start** of the
  new one. New entries can only sit after it. Compare that prefix directly:

  ```sh
  git show HEAD:docs/session-state.md 2>/dev/null | sed -n '/^## Log$/,$p' > /tmp/log.was
  sed -n '/^## Log$/,$p' docs/session-state.md > /tmp/log.now
  head -c "$(wc -c < /tmp/log.was | tr -d ' ')" /tmp/log.now | cmp -s - /tmp/log.was \
    && echo "append-only: OK" || echo "append-only: VIOLATION — an earlier ## Log entry changed"
  ```

  Do **not** check this with a bare `git diff -- docs/session-state.md`. With no ref, `git diff`
  compares the working tree to the *index*, so once the change is staged — or committed — it prints
  nothing at all, and a check that prints nothing reads as a pass. A rewritten entry sails straight
  through it. The comparison above names the committed copy, so staging state cannot hide anything
  from it, and a reworded, re-dated, re-ordered, or deleted entry all break the prefix the same way.
  If `docs/session-state.md` is not in `HEAD` yet, there are no earlier entries and the check passes
  on an empty prefix — correct, not a miss. A `VIOLATION` is reported, naming the entry, never quietly
  repaired. The one exception is a redacted secret, which is still reported, and the credential
  rotated.
- If an edit to an earlier entry was attempted or found, it was refused **and reported**, naming the
  entry and what would have changed. A refusal nobody was told about does not satisfy this.
- The file is committed (not matched by `.gitignore`), and no old entries were trimmed or rolled up.
- On a resuming session: `docs/session-state.md` was read before the first action, and no question the
  log already answers was re-opened.

## Outputs & handoff contract

- **Emits** `handoff.md` (per-session compaction) in the N14 5-field schema + `## Suggested skills`
  + `## Referenced artifacts`. Operational twin of `docs/session-state.md`; write THERE when this is
  the durable session boundary, or to the OS temp dir for a throwaway compaction.
- **Emits `## Log`** in the committed `docs/session-state.md` only — one appended entry per decision
  (decision · reason · ruled out · still open), scaffolded by `project-setup`. Append-only: earlier
  entries never change, and an attempted or discovered change is reported as a violation naming the
  entry. Weakest source in the repo — never overrides a decision record under `docs/adr/` or a signed
  `acceptance.md`; a decision that must bind future work is promoted to `docs/adr/` and the entry stays
  behind pointing at it. Committed, never gitignored. Kept, never compacted.
- **Stable sections** a consumer depends on: the five N14 fields (exact headings) + `## Suggested
  skills` + `## Log`. A fresh agent reads these cold to resume — the five fields for where the work
  stands, `## Log` for why, **before it takes its first action**. The read is wired by
  `using-agent-skills` (runs first every session) and by the pointer `project-setup` writes into the
  repo's `CLAUDE.md` / `AGENTS.md`.
- **`STATE.md` update: none.** Handoff is the per-session layer and is orthogonal to `STATE.md`
  (the per-run resume index the orchestrator owns). It *references* `STATE.md`; it never writes it.
