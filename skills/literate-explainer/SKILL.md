---
name: literate-explainer
description: 'Turn a diff (the daily case) or a whole unfamiliar target repo (onboarding) into a self-contained teaching artifact so you stay a participant in code you didn''t write — background before the change, intuition before details, a literate tour in reading order, plain enough to re-teach (the Feynman test). Reach for this whenever an agent just landed a large diff you cannot yet explain, when you clone or inherit an unfamiliar repo and a skim will not build a mental model, or when someone says "explain this diff/PR/branch/codebase", "walk me through what changed", or "help me understand this code". Standalone — no lifecycle gates, nothing blocks, /orchestrate untouched. Pairs with comprehension-quiz — suggest running /quiz next. NOT code-review (which judges a diff for merge) and NOT codebase-research (the goal-blind survey written at the head of Spec and reused by the planner).'
---

# Literate explainer — understand code you didn't write

## Purpose

Turn a **diff** (the daily case — an agent just landed a change to your **target repo** and "looks
right" is not understanding) or a whole **target repo** (the onboarding case — you cloned or inherited
it and need a real mental model) into a **teaching artifact**: background before the change, intuition
before details in what → why → how order, a literate code tour in reading order, explained plainly
enough to re-teach. The goal is participation — that you can pass a quiz on the code and make the next
change yourself.

This is a **standalone suite**, not a lifecycle stage. It wires into no gate, it never blocks, and it
leaves `/orchestrate` untouched. It owns two of the three comprehension-workspace surfaces (the
**explainer manifest** and the **learner glossary**); `comprehension-quiz` owns the third (the
**learning ledger**) and is your next step.

## When to use / when to skip

**Use** the moment you need the *human* to understand code they didn't write — a landed diff, a PR, a
branch, or an unfamiliar repo. **Skip** when your goal is to judge a diff for merge (that is
`code-review`) or to gather goal-blind facts for the design and the plan (that is `codebase-research`,
run at the head of Spec). The boundary is
behavioral, not a naming rule:

| You want… | Reach for | Its object | It emits |
|---|---|---|---|
| the **human** to *understand* code they didn't write | **literate-explainer** (this skill) | a diff, or a whole target repo | a teaching artifact you read (+ manifest & glossary growth) |
| a **diff** *judged* for merge-worthiness — correctness, security, performance | **code-review** | one slice diff | severity-labeled findings |
| **Spec and Plan** to get *goal-blind facts* about the code as it is today | **codebase-research** | the target codebase | `research.md`, written at the head of Spec and reused by the planner |

Read it as: **explain = the human understands · review = the diff is judged · research = the design and
the plan get facts**. Explanation and judgment are different jobs; do not reach for one by trigger-name
accident.

## Inputs

- **A resolvable target repo** — normally the current working directory. Its **repo key** and
  **comprehension workspace** are derived per `references/comprehension-workspace-format.md`; the
  workspace is created on first use, so an empty workspace is a valid, first-class input.
- **A diff in view** (uncommitted changes, a named branch, or a PR reference) for diff mode; **none**
  for codebase mode. An explicit mode argument overrides detection.
- **A current machine survey** for codebase mode — `codebase-research`'s output. If none is fresh,
  invoke `codebase-research` to produce it; never survey the repo yourself.
- **The workspace surfaces, read-only for derivation** — the learning ledger and the learner glossary,
  joined at read time to find proven-known and worth-revisiting concepts. You write the manifest and the
  glossary; you never write the ledger.
- **Optional:** a request for markdown output instead of HTML.

The artifact's internal structure is fixed by `references/teaching-artifact-format.md`; the workspace
layout, key derivation, surface formats, and join rules by
`references/comprehension-workspace-format.md`. This file points at both; it does not restate them.

## Process

1. **Resolve the workspace.** Derive the repo key and open (or create) the comprehension workspace under
   `~/.achilles/comprehension/<repo-key>/`, appending the `key → origin` index line on first creation.
   Origin-derived key normally; path-fallback `local__…` key when the repo has no remote.
   All state lives here — **never write anything into the target repo**.
2. **Detect the mode.** A diff in view → **diff mode**; no diff → **codebase mode**. An explicit
   argument overrides detection either way.
3. **Codebase mode: quarry, never re-survey.** Obtain facts by invoking `codebase-research` (or reusing
   its fresh output), then **pedagogically reorder** them — load-bearing idea first, then what depends on
   it, in the order that builds a mental model fastest. The boundary is one-way: the explainer may quarry
   survey output; the survey never reads teaching artifacts. No second survey of the repo.
4. **Derive personalization from the ledger.** Join the learning ledger and learner glossary at read
   time. **Proven-known** background (latest ledger grade passes) is *not re-taught* — at most a one-line
   pointer acknowledges it. **Worth-revisiting** durable concepts (latest grade failed/partial,
   or a stale/absent pass) become an advisory note that names them and blocks nothing. On a
   cold start the note is omitted whole and background teaches everything from scratch.
5. **Emit the artifact** per the teaching-artifact format: section order (Header → Background → literate
   tour → worth-revisiting note), what → why → how at every stop, a tour ordered by the logic of the
   change and never by file name, the Feynman-plain bar throughout. Escalate to an
   interactive figure only under the anti-slop refuse rule — **if a static figure teaches the same thing,
   emit the static figure**. Primary output is **one self-contained HTML file** (all CSS/JS/
   assets inline, renders from disk with no network and no build); markdown on request, same
   structure contract. **No quiz answer appears anywhere in the source** — prose, comments,
   hidden elements, `data-*`, inline JS, or embedded JSON.
6. **Register the run.** Append **exactly one** explainer manifest line (date, mode, subject, artifact
   filename, concepts taught). Add each newly taught **durable concept** to the learner glossary
   with a plain definition; **existing entries are preserved verbatim**. Ephemeral diff
   mechanics are walked but never promoted to the glossary. Store **no** counter, rate,
   or mastery flag — every measure is derived, never stored.
7. **Hand off.** Tell the learner where the artifact lives, then suggest **running the quiz next**
   (`/quiz`) to make the understanding honest — the quiz records the session that later feeds step 4.

## Rationalizations

Stop signals disguised as good reasons:

- *"I'll drop the artifact in the repo so it's next to the code."* No — the target repo stays
  byte-clean; all state lives in the comprehension workspace.
- *"I already understand this repo, I'll just survey it again quickly."* No re-survey in codebase mode —
  quarry `codebase-research`'s facts and reorder them.
- *"A tiny answer key in an HTML comment saves the quiz some work."* No — an artifact teaches, it never
  quizzes; viewing source must confer no advantage.
- *"I'll re-teach the background to be safe."* Proven-known background is skipped to a one-line pointer;
  re-teaching it makes repeat sessions repetitive instead of denser.
- *"An interactive widget would look impressive here."* Interactivity is earned only when prose and a
  static figure genuinely cannot teach the idea; otherwise it is decoration — emit the figure.
- *"I'll cache proven-known as a flag so I don't recompute it."* No stored measures — derive by join at
  read time so a record can never drift from the facts.

## Red flags

Stop and fix before emitting if any are true:

- Any file was written under the target repo's tree, or its working tree / git state changed.
- Codebase mode ran a fresh survey of the repo instead of quarrying `codebase-research`.
- A quiz question's answer is discoverable anywhere in the artifact source.
- Background re-teaches a proven-known concept in full.
- The tour is ordered by file name or directory order rather than the logic of the change.
- A concept a static figure could teach was escalated to an interactive widget.
- More than one manifest line was appended, or a counter / rate / mastery flag was written anywhere.
- A worth-revisiting note was emitted on a cold-start workspace with nothing to surface.

## Verification (ending criteria)

Done when ALL hold:

- A teaching artifact exists **in the comprehension workspace** (never the target repo), and the target
  repo's working tree and git state are byte-identical to before the run.
- **Exactly one** new explainer manifest entry records the session; the learner was told where the
  artifact lives.
- The artifact honors the section order: background before any changed/surveyed code, what → why → how at
  each concept, Feynman-plain throughout; the literate tour follows reading order, not file
  order.
- Proven-known background is reduced to at most a one-line pointer; a worth-revisiting note is
  present when the ledger supports one and **omitted whole** on a cold start.
- The artifact is a self-contained HTML file that renders with no network and no build step, **or** plain
  markdown honoring the same structure contract when markdown was requested.
- **No quiz answer** appears anywhere in the artifact source.
- Every newly taught durable concept was added to the learner glossary; existing entries are preserved. No counter, rate, or mastery flag was stored anywhere.
- In codebase mode, the artifact's facts trace to `codebase-research`'s findings and no second survey ran. The workspace was keyed by repo key and created if absent.
- The when-to-use table states the boundary with `code-review` and `codebase-research` as behavior.

## Outputs & handoff contract

- **Emits:** one teaching artifact (self-contained HTML, or markdown on request) in the comprehension
  workspace; **exactly one** new line in the explainer manifest (`manifest.jsonl`); new durable-concept
  entries appended to the learner glossary (`glossary.md`).
- **Owns (single writer):** the explainer manifest and the learner glossary. **Never
  writes** the learning ledger (`comprehension-quiz` is its sole writer) and never writes into the target
  repo.
- **Reads (for derivation only):** the learning ledger and learner glossary, joined at read time to
  derive proven-known and worth-revisiting — never stored.
- **Consumer:** `comprehension-quiz` reads the fresh manifest entry and the glossary to build a session,
  then writes the ledger the next explainer's step 4 will read. Hand off by suggesting **/quiz**.
- **References (agree with these; do not restate them):**
  `references/teaching-artifact-format.md` (what is inside the artifact) and
  `references/comprehension-workspace-format.md` (workspace layout, repo-key derivation, surface formats,
  join rules).
- **Standalone:** no lifecycle gates, nothing blocks, `/orchestrate` untouched.
