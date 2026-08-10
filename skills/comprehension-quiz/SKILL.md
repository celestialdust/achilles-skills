---
name: comprehension-quiz
description: 'Agent-administered retrieval practice that makes understanding of code you did not write honest — about five medium-difficulty questions asked ONE at a time, the learner''s answer graded BEFORE the correct answer is revealed, the session recorded as one line in the learning ledger. Reach for this right after a literate-explainer artifact (quiz that explainer) or standalone with no fresh explainer in view (the requiz over weak or stale durable concepts drawn from the ledger). It is the SOLE writer of the learning ledger; it is an honest self-check, never a gate — it blocks nothing. If you are about to dump every question at once, reveal an answer before grading it, or write a quiz''s questions or answers into any file the learner can open, stop and load this.'
---

## Purpose

**Stage: standalone · cross-cutting** — it belongs to no lifecycle stage and blocks nothing: no merge, no stage and no `/orchestrate` wave waits on a quiz result, because a self-check stops being honest the moment something gates on it.

`comprehension-quiz` administers retrieval practice that makes
understanding of code you didn't write **honest**: about five medium-difficulty questions, one at a time,
the learner's answer graded *before* the correct answer is revealed, the session recorded as one line in
the **learning ledger**.

Its stance is Litt's personal rule — the quiz is an *honest self-check, never a gate*. It is also the **sole writer
of the learning ledger**;
the ledger it appends is the fact base every progress measure is later *derived* from — never a scoreboard,
never a stored mastery flag.

## When to use / when to skip

**Use** in one of two entry cases:

- **Right after a `literate-explainer` artifact** — quiz that explainer while it is fresh.
- **Standalone, with no fresh explainer in view** — the **requiz** over weak or stale durable concepts
  drawn from the learning ledger and learner glossary.

**Skip** when there is nothing to test: no fresh explainer *and* no weak/stale durable concepts in the
learner glossary. Say so and stop — do not manufacture questions, and write no ledger line.

| Reach for… | when you want to… | not… |
|---|---|---|
| **comprehension-quiz** (this) | **test the human** — retrieve, grade, record what stuck | teach it in the first place |
| `literate-explainer` | **teach** — emit the explainer artifact the quiz then tests | quiz it (different interaction grain) |
| the review skills (`code-review`, …) | **judge the diff** — is the *code* correct/safe/fast | judge the human's understanding |
| `codebase-research` | **feed the design and the plan** — goal-blind facts about the code as it is, surveyed at the head of Spec and reused by the planner | teach or test a human |

The boundary is behavioral, not naming: the **quiz tests the HUMAN**, `literate-explainer` **teaches** them,
the **review skills judge the DIFF**, and `codebase-research` **feeds the DESIGN and the PLAN**. Different
subjects, different grain — reach deliberately.

## Inputs

- **The comprehension workspace** for the target repo — resolved by **repo key** per the
  key-derivation rules in `references/comprehension-workspace-format.md`.
  Create it if absent; an empty ledger is a valid start.
- **Case A — fresh explainer in view:** its **manifest entry** (subject + `artifact` filename) and the
  **concepts it taught** are the question pool; tie the session to that entry.
- **Case B — standalone requiz:** the **learner glossary** (durable concepts) joined against the ledger to
  find weak/stale ones per the workspace format's *worth-revisiting* rule.

Read-only for everything except the ledger. This skill never reads or writes the target repo.

## Process — the turn protocol

The honesty is **structural, not prose** — it lives in this loop, not in a promise to be fair.

1. **Resolve the workspace and pick the case.** Compute the repo key, locate (or create) the workspace.
   Fresh explainer → quiz its taught concepts, subject = that manifest entry. No fresh explainer → **requiz**
   drawing **only durable concepts** (learner-glossary terms) whose latest grade is weak/stale, by join.
   Nothing to test → say so and stop, writing no ledger line.

2. **Compose ~five medium-difficulty questions up front — reveal none.** Target durable concepts plus, in
   the fresh-explainer case, the specific change; a **requiz targets durable concepts ONLY — never the
   ephemeral mechanics of a merged diff**. Multiple-choice **options must be of comparable
   length**, so option length never signals the answer. Hold the questions and answers in working
   context only — never in a file the learner can open.

3. **Run the turn loop — EXACTLY ONE question per message**:
   - **a.** Ask **one** question. Stop. **Wait** for the learner's answer — do not ask the next question and
     do not reveal anything yet.
   - **b.** **Grade the learner's answer FIRST** (`pass` | `partial` | `fail`), state the grade, and *only
     then* reveal the correct answer and why.
   - **c.** Advance to the next question **only after** the current one is resolved. Repeat until ~five are
     done or the learner walks away.

4. **Close the session — append EXACTLY ONE ledger line**:
   - Finished → outcome **`completed`**, with each asked question's `{concept, grade}`.
   - Walked away mid-quiz → outcome **`abandoned`**, with only the grades earned **so far** — and **never
     reveal answers to questions that were never asked**.
   - The line shape, grade domain, and the `artifact` field (present when tied to a manifest entry, omitted
     for a requiz) follow the workspace format reference **exactly**. This is the **only write** this skill
     makes.

## Rationalizations

Stop signals disguised as good reasons:

- *"I'll list all five questions so the learner can pace themselves."* → No. One question per message, graded
  before reveal. A visible list lets them peek — it destroys the retrieval the quiz exists to force.
- *"I'll show the answer alongside the question so they can self-check."* → No. Grade the learner's answer
  **first**, then reveal. Reveal-before-grade is self-deception — the exact thing being prevented.
- *"This diff mechanic is worth re-testing next month."* → No. A merged diff is stale by Friday; a requiz
  tests **durable concepts only**. Ephemeral detail never enters a requiz.
- *"I'll stash the questions and answers in a scratch file / the artifact so I don't lose them."* → No.
  Answers never touch any file the learner can open; keep them in working context only.
- *"They failed three — I'll hold the ledger line until they retry."* → No. Record what actually happened,
  including abandonment. The ledger is facts, not a scoreboard you curate.
- *"The quiz should block the merge until they pass."* → No. Honest self-check, **never a gate** (Litt's
  rule) — it blocks nothing.

## Red flags

Stop and fix before continuing if any are true:

- More than one question in a single message, or the next question asked before the current one is graded
  and resolved.
- The correct answer revealed before the learner's answer is graded.
- Multiple-choice options of visibly unequal length, so length hints the answer.
- **Any write to the explainer manifest, the learner glossary, or the target repo** — the ledger line (and,
  on first-time workspace creation, the idempotent root index append) are this skill's only writes.
- Questions or answers embedded in the teaching artifact or **any** file the learner can open.
- A requiz question about ephemeral diff mechanics instead of a durable concept.
- The quiz framed as a gate that blocks work.

## Verification (ending criteria)

Done when ALL hold:

- **Exactly one** new line was appended to `ledger.jsonl`, and **no** other surface (manifest, glossary) and
  **not** the target repo were written.
- The session ran **one question per turn**, each **graded before** its answer was revealed.
- **About five** medium-difficulty questions, multiple-choice options of **comparable length**.
- Outcome matches reality: `completed` with every asked question's `{concept, grade}`, or `abandoned` with
  grades earned so far and **no** leaked answers to unasked questions.
- A fresh-explainer session carries the `artifact` tying it to its manifest entry; a requiz omits `artifact`
  and tests **durable concepts only**.
- The ledger line's shape and grade domain match the workspace format reference.

## Outputs & handoff contract

- **Emits:** exactly one appended line to the **learning ledger** (`ledger.jsonl`) in the comprehension
  workspace — the sole surface this skill writes. Line shape, grade domain (`pass` | `partial` |
  `fail`), and the `artifact`/requiz distinction are fixed by the workspace format reference
  (`references/comprehension-workspace-format.md`); **do not restate them here**.
- **Sole writer:** this skill owns the learning ledger and touches nothing else — never the explainer
  manifest or learner glossary (those belong to `literate-explainer`), never the target repo.
- **Downstream consumers — derived by join at read time, never stored:** the next
  `literate-explainer` joins ledger × glossary to compute **proven-known** (background it may skip) and
  **worth-revisiting** (its advisory note); the toolkit owner joins ledger × manifest to derive the
  **quiz-completion rate** (the lead metric gating any future spacing/ZPD work). The join formulas live in
  the workspace format reference — **see them there, don't restate them**.
- **Standalone:** no lifecycle gate, blocks nothing, `/orchestrate` untouched.
