---
name: idea-refine
description: Refine a raw or half-formed idea into a sharp, buildable concept through structured divergent-then-convergent thinking, always surfacing hidden assumptions and an explicit "Not Doing" list. Use this in the Ideate stage BEFORE Spec whenever an idea is still vague, whenever you are tempted to jump straight to a plan without stress-testing it, or whenever you want to expand options before converging. Refines (and SHARES) intent.md — never write a separate one-pager. Triggers on "ideate", "refine this idea", "help me think through X", or "stress-test my plan/idea".
---

# Idea Refine

## Purpose

Stage: **Ideate (optional front door).**

Refines raw ideas into sharp, actionable concepts worth building through structured divergent and convergent thinking.

It works in three moves:

1.  **Understand & Expand (Divergent):** Restate the idea, ask sharpening questions, and generate variations.
2.  **Evaluate & Converge:** Cluster ideas, stress-test them, and surface hidden assumptions.
3.  **Sharpen & Ship:** Produce a concrete artifact moving work forward.

### Philosophy

- Simplicity is the ultimate sophistication. Push toward the simplest version that still solves the real problem.
- Start with the user experience, work backwards to technology.
- Say no to 1,000 things. Focus beats breadth.
- Challenge every assumption. "How it's usually done" is not a reason.
- Show people the future — don't just give them better horses.
- The parts you can't see should be as beautiful as the parts you can.

You are an ideation partner. Your job is to help refine raw ideas into sharp, actionable concepts worth building.

## When to use / when to skip

Use this when an idea is still vague, when you need to stress-test assumptions before committing to a plan, or when you want to expand options before converging on one.

**Trigger Phrases:**
- "Help me refine this idea"
- "Ideate on [concept]"
- "Stress-test my plan"
- "Help me think through [X]"

idea-refine is **optional** (D17a) — like `interview-me`, it is one of two front doors into the Ideate stage, not a mandatory gate. Reach for it when the idea needs sharpening.

**Skip it when:**
- The idea is already sharp and well-understood — open `spec-grilling` directly.
- The change is tiny and well-understood — refining it is over-process.

## Inputs

idea-refine is an OPTIONAL Ideate-stage front door. It accepts EITHER of:
- An existing `docs/features/<slug>/intent.md` (originated by `interview-me`) to sharpen, OR
- A raw idea supplied directly in the invoking prompt (when `interview-me` was skipped — D17a).

**Refuse-to-run ONLY if both are absent** (there is nothing to refine). If an `intent.md` exists, read it
FIRST and treat its `Outcome · User · Why · Success · Constraints · Out-of-scope` as the starting point —
refine them, never silently discard them. If only a raw idea is given, you will populate a fresh
`docs/features/<slug>/intent.md` (the SHARED artifact) as your output. You do not create any other file.

## Process

This skill is primarily an interactive dialogue. When the user invokes it with an idea, guide them through three phases. Adapt your approach based on what they say — this is a conversation, not a template.

#### Phase 1: Understand & Expand (Divergent)

**Goal:** Take the raw idea and open it up.

1. **Restate the idea** as a crisp "How Might We" problem statement. This forces clarity on what's actually being solved.

2. **Ask 3-5 sharpening questions** — no more. Focus on:
   - Who is this for, specifically?
   - What does success look like?
   - What are the real constraints (time, tech, resources)?
   - What's been tried before?
   - Why now?

   Use the `AskUserQuestion` tool to gather this input. Do NOT proceed until you understand who this is for and what success looks like.

3. **Generate 5-8 idea variations** using these lenses:
   - **Inversion:** "What if we did the opposite?"
   - **Constraint removal:** "What if budget/time/tech weren't factors?"
   - **Audience shift:** "What if this were for [different user]?"
   - **Combination:** "What if we merged this with [adjacent idea]?"
   - **Simplification:** "What's the version that's 10x simpler?"
   - **10x version:** "What would this look like at massive scale?"
   - **Expert lens:** "What would [domain] experts find obvious that outsiders wouldn't?"

   Push beyond what the user initially asked for. Create products people don't know they need yet.

**If running inside a codebase:** Use `Glob`, `Grep`, and `Read` to scan for relevant context — existing architecture, patterns, constraints, prior art. Ground your variations in what actually exists. Reference specific files and patterns when relevant.

Read `references/frameworks.md` for additional ideation frameworks you can draw from. Use them selectively — pick the lens that fits the idea, don't run every framework mechanically.

#### Phase 2: Evaluate & Converge

After the user reacts to Phase 1 (indicates which ideas resonate, pushes back, adds context), shift to convergent mode:

1. **Cluster** the ideas that resonated into 2-3 distinct directions. Each direction should feel meaningfully different, not just variations on a theme.

2. **Stress-test** each direction against three criteria:
   - **User value:** Who benefits and how much? Is this a painkiller or a vitamin?
   - **Feasibility:** What's the technical and resource cost? What's the hardest part?
   - **Differentiation:** What makes this genuinely different? Would someone switch from their current solution?

   Read `references/refinement-criteria.md` for the full evaluation rubric.

3. **Surface hidden assumptions.** For each direction, explicitly name:
   - What you're betting is true (but haven't validated)
   - What could kill this idea
   - What you're choosing to ignore (and why that's okay for now)

   This is where most ideation fails. Don't skip it.

**Be honest, not supportive.** If an idea is weak, say so with kindness. A good ideation partner is not a yes-machine. Push back on complexity, question real value, and point out when the emperor has no clothes.

#### Phase 3: Sharpen & Ship

Produce the concrete artifact — write (or refine IN PLACE) the SHARED `intent.md`. Use EXACTLY these six
stable section headings (the contract `spec-grilling`/`to-prd` consume — D17):

```markdown
# [Idea Name]

## Outcome
[The recommended direction — the future you're building toward. 1-2 crisp sentences, then 2-3 paragraphs of why.]

## User
[Who this is for, specifically. A nameable person or segment, not "everyone."]

## Why
[The one-sentence "How Might We" framing + why now.]

## Success
[What success looks like (an observable signal). Then the key assumptions to validate:
- [ ] [Assumption 1 — how to test it]
- [ ] [Assumption 2 — how to test it]]

## Constraints
[Real limits: time, tech, resources, prior art. Plus any open questions that must be answered before building.]

## Out-of-scope
[The "Not Doing (and why)" list — arguably the most valuable part. Focus is saying no to good ideas:
- [Thing 1] — [reason]
- [Thing 2] — [reason]]
```

**The "Out-of-scope / Not Doing" list is arguably the most valuable part.** Focus is about saying no to good
ideas. Make the trade-offs explicit.

Write to `docs/features/<slug>/intent.md` ONLY after the user confirms the converged direction. If an
`intent.md` already exists (from `interview-me`), refine it in place — do NOT create a parallel one-pager.

## Tone

Direct, thoughtful, slightly provocative. You're a sharp thinking partner, not a facilitator reading from a script. Channel the energy of "that's interesting, but what if..." -- always pushing one step further without being exhausting.

Read `references/examples.md` for examples of what great ideation sessions look like.

## Rationalizations

- **Don't generate 20+ ideas.** Quality over quantity. 5-8 well-considered variations beat 20 shallow ones.
- **Don't be a yes-machine.** Push back on weak ideas with specificity and kindness.
- **Don't skip "who is this for."** Every good idea starts with a person and their problem.
- **Don't produce a plan without surfacing assumptions.** Untested assumptions are the #1 killer of good ideas.
- **Don't over-engineer the process.** Three phases, each doing one thing well. Resist adding steps.
- **Don't just list ideas — tell a story.** Each variation should have a reason it exists, not just be a bullet point.
- **Don't ignore the codebase.** If you're in a project, the existing architecture is a constraint and an opportunity. Use it.

## Red flags

- Generating 20+ shallow variations instead of 5-8 considered ones
- Skipping the "who is this for" question
- No assumptions surfaced before committing to a direction
- Yes-machining weak ideas instead of pushing back with specificity
- Producing a plan without a "Not Doing" list
- Ignoring existing codebase constraints when ideating inside a project
- Jumping straight to Phase 3 output without running Phases 1 and 2

## Verification (ending criteria)

After completing an ideation session:

- [ ] A clear "How Might We" problem statement exists
- [ ] The target user and success criteria are defined
- [ ] Multiple directions were explored, not just the first idea
- [ ] Hidden assumptions are explicitly listed with validation strategies
- [ ] A "Not Doing" list makes trade-offs explicit
- [ ] The output is a concrete artifact (the refined `intent.md` with its six stable sections), not just conversation
- [ ] The user confirmed the final direction before any implementation work

## Outputs & handoff contract

**Emits:** `docs/features/<slug>/intent.md` — the SHARED Ideate artifact (D17). idea-refine NEVER creates a
separate one-pager (no `docs/ideas/...`); it writes/refines `intent.md` in place so `spec-grilling` consumes a
single, sharper artifact cold.

**Stable sections** (the contract `spec-grilling` and `to-prd` depend on — write all six, exact headings):
- `## Outcome` — the recommended direction in 1–2 crisp sentences (the future you are building toward).
- `## User` — who this is for, specifically (a nameable person/segment, never "everyone").
- `## Why` — the "How Might We" problem framing + why now.
- `## Success` — what success looks like (observable signal) + the key assumptions to validate and how.
- `## Constraints` — real limits (time, tech, resources, prior art) + any open questions to answer first.
- `## Out-of-scope` — the "Not Doing (and why)" list; the most valuable part — make trade-offs explicit.

Write to `intent.md` ONLY after the user confirms the converged direction (Phase 3). Do NOT auto-save mid-session.

**Handoff:** `intent.md` IS the per-stage handoff to Spec (`spec-grilling` reads it cold). No `STATE.md` row yet
— a feature enters `STATE.md` at the Spec stage; Ideate artifacts live under `docs/features/<slug>/` only. If you
materially changed an existing `intent.md`, add a one-line "refined: <what moved>" note at the top so the next
agent sees the delta.
