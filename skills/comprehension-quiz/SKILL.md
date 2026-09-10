---
name: comprehension-quiz
description: Use to test a person's grasp of code they did not write — after a literate-explainer artifact, as a requiz over stale concepts, or on "quiz me on this repo". Questions one per message, graded before the answer is revealed, then one ledger line. Not teaching it (literate-explainer), not judging a diff (code-review).
---

# Comprehension quiz

## Purpose

**Stage: standalone.** Principles 4, 5, 6, 9.

Retrieval practice over code a person did not write: about five questions, one per message, each answer
graded before the correct one is revealed, then one line in the learning ledger. Nothing waits on the
result — a self-check stops being honest the moment something does.

## When to use / when to skip

- Right after a `literate-explainer` artifact — quiz it while fresh, tied to that manifest entry.
- As a standalone requiz over durable glossary concepts whose latest grade is weak or stale.
- On a bare "quiz me on the store" — the pool comes from the code named.
- Skip where nothing is reachable: no subject, no explainer, nothing weak or stale. Say so, inventing no
  questions and appending no line.
- Near-misses: teaching the code is `literate-explainer`; grading the diff, `code-review`; eliciting
  what someone wants built, `interview-me`; goal-blind facts for a plan, `codebase-research`.

## Inputs

- **The comprehension workspace** — helps: the ledger and glossary this session joins · without it:
  create it under the repo key
  ([comprehension-workspace-format](../../references/comprehension-workspace-format.md) · *Repo-key
  derivation*); an empty ledger is a valid start.
- **A fresh explainer's manifest entry** — helps: its taught concepts are the pool, its `artifact` ties
  the session · without it: leave `artifact` off.
- **The learner glossary** — helps: the durable concepts a requiz joins against the ledger.
- **The target repo** — helps: the code a derived pool comes from, read-only · without it: quiz from
  the artifact and glossary alone.

With no manifest entry or glossary, the pool comes from the code named, marked `derived`.

## Process — the turn protocol

1. Resolve the workspace by repo key, creating it if absent; read the ledger, and
   `literate-explainer`'s manifest and glossary read-only.

2. Pick the pool: a fresh explainer's taught concepts plus its `artifact`; else durable glossary concepts
   whose latest grade is weak or stale, joined at read time, a merged diff's ephemeral mechanics left
   out; else the code named, marked `derived`.

3. Compose about five medium-difficulty questions up front, revealing none: aim each at what has to be
   understood rather than recalled, keep multiple-choice options at comparable length so length never
   hints at the answer, and hold every question and answer in working context alone — never a file
   the learner can open.

4. Run the turn loop: ask one question per message, then stop and wait; grade the answer `pass` ·
   `partial` · `fail` and state that grade before revealing the correct answer and why; advance only once
   it is resolved, until about five are done or the person leaves; a session that ends early reveals
   nothing of the questions never reached.

5. Append exactly one ledger line at close — `completed` with each asked question's `{concept, grade}`,
   or `abandoned` with the grades earned so far, in the shape at
   [comprehension-workspace-format](../../references/comprehension-workspace-format.md) · *The three
   surfaces*.

6. Store no count, rate or mastery flag — every measure is joined at read time
   ([comprehension-workspace-format](../../references/comprehension-workspace-format.md) · *Derive every
   measure at read time*).

## Rationalizations

- *"I'll list all five so they can pace themselves."* → a visible list is a peek.
- *"I'll show the answer alongside so they self-check."* → grading after the reveal is a self-marked
  reading exercise.
- *"I'll keep the questions in a scratch file."* → a file they can open before answering is that peek.
- *"This diff mechanic is worth re-testing."* → a merged diff is stale by Friday; a requiz over one
  drills an expired fact.
- *"I'll hold the line back until they retry."* → the ledger records what happened; a curated one
  measures nothing.
- *"The quiz should block the merge."* → an honest self-check outranks a gate; this one blocks nothing.

## Red flags

- Two questions in one message, or the next asked before the current is graded.
- The correct answer stated before the learner's answer has a grade.
- Multiple-choice options of visibly unequal length.
- Questions or answers in a scratch file, a to-do list, or the teaching artifact.
- A requiz question about a merged diff's mechanics.
- A write to `manifest.jsonl`, `glossary.md`, or anything in the target repo.

## Verification

- [ ] One question went out per message, about five in all, each graded before its answer was revealed.
- [ ] Options stood at comparable length, and no question or answer reached a file.
- [ ] Exactly one ledger line was appended, its outcome matching what happened, `artifact` present for
      a manifest entry and absent for a requiz over durable concepts alone.
- [ ] A session that ended early left every unasked question and its answer unsaid, its `abandoned`
      line carrying only the grades earned.
- [ ] The target repo is byte-identical under `git status --short`; `manifest.jsonl` and `glossary.md`
      are unchanged.
- [ ] The reply names that line, its path, and every input marked `derived`.

## Outputs & handoff

- `~/.achilles/comprehension/<repo-key>/ledger.jsonl` — one appended line per session, which is the cap.
  Its fields, grade domain and `artifact` rule live in
  [comprehension-workspace-format](../../references/comprehension-workspace-format.md) · *The three
  surfaces*, whose *Single writer per surface* names this skill its sole writer.
- `~/.achilles/comprehension/index.md` — one `key → origin` line, appended where the key is absent.
- Nothing else: not `manifest.jsonl`, not `glossary.md`, not a scratch file, and nothing in the target
  repo — including on a session that ends midway.
- In conversation: the questions asked, their grades and reveals; that line, its path and its size against
  the cap; every input marked `derived`.
