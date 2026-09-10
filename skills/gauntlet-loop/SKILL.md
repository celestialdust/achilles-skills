---
name: gauntlet-loop
description: Use for throwaway work where the point is how good an idea can get — a spike, a bake-off, a proof of concept: grind a prototype until a blind critic picks it over one named, fetchable outside reference. Emits a paste-ready prompt for a fresh session, or runs the loop here. Anything that ships uses the lifecycle skills; cross-examining one in-flight call is `doubt-driven-development`.
---

# Gauntlet loop — grind a throwaway prototype until it beats a real reference

## Purpose

**Stage: standalone.** Principles 1, 7, 8.

Proof of concept, fast: name one real outside artifact to beat — the **bar** — split the goal into pieces
one critic can judge alone, and run a **builder** against a separate **critic** blind to which side is
ours. The default output is a paste-ready prompt for a fresh session; taken up, or asked for outright,
the loop runs here instead, in an ignored scratch directory. Loop-until-win is legal here alone and lifts
no bound in `doubt-driven-development` or `orchestrator`: no gate waits on this, it blocks nothing, and
it reads and writes no chain artifact.

## When to use / when to skip

- Use when the output is meant to be thrown away and the point is how good the idea can get, or on
  "gauntlet this", "loop until it beats X", "run the gauntlet".
- Skip when any part of it will ship — the lifecycle, `/ideate` through `/ship`.
- Skip on an ask that merely sounds fast: quick is a tone, not a scope, so `using-agent-skills` offers this
  path beside the full loop and the person picks it.
- Skip for one in-flight decision cross-examined inside a run — `doubt-driven-development`.

## Inputs

- **The goal, in one line** — helps: what to build, write or measure · without it: reconstruct it from the
  request and the open files, marked `derived`.
- **The bar** — helps: the one named outside artifact to beat, which decides everything the loop is worth ·
  without it: offer two or three candidates and take the person's pick; alone, take the hardest
  reachable one, mark it `derived`, and name what you passed over so one edit swaps it.
- **The measurable half** — helps: a number counting toward the pick beside taste — load time, cost,
  benchmark score · without it: judge on the pick alone, marked `derived`.
- **A budget ceiling** — helps: a cost the person named · without it: no cap; the loop ends on the critic's
  pick or the person's word.
- **A slug** — helps: names the scratch directory `.gauntlet/<slug>/` · without it: derive it from the goal,
  marked `derived`.
- **Tool names** — helps: a generator, a browser, a deploy target the goal reaches for · without it: none.

Nothing upstream is needed; an empty repository is a valid input.

## Process

Steps 1–3 are prompt mode, the default; 4–13 are run mode, entered when the person takes the offer or
asks for the run outright.

1. Restate the goal in one line to yourself, off screen.
2. Set the bar against the three tests below; name the test a candidate fails and take another.
3. Write the prompt (below), the offer to run it here on one flat line beneath — not a question.
4. Put `.gauntlet/` in the target `.gitignore` before the first write. Absent, ask — the file is the
   person's — and a no ends the run; alone, write nothing and report the line you needed. The line stops a
   `git add` and confines nothing the bar can run, read or reach.
5. Show what you are about to fetch — URL, package and version, repository — and which of downloading,
   installing and running you intend; wait for a yes, per bar and per action. Where the yes is already given,
   go no further than it covered; where none was given and nobody is there to ask, report what the fetch
   would have been and hand back the prompt block instead. A no ends the run — never a substitute bar, never a
   description in its place.
6. Hand the bar no credentials, no environment secrets, no repository contents beyond the piece under
   comparison; a build step wanting to authenticate needs a credential, a stop-list item
   ([safety-rails](../../references/safety-rails.md)).
7. Fetch it into `.gauntlet/<slug>/bar/` and judge against the artifact; unobtainable here means it was
   never fetchable, so say what failed and return to step 2.
8. Split into pieces one critic can judge alone — a piece needing two judgements is two, and a hedging
   critic is how you find that out.
9. Fan out a builder and a separate critic per piece, in parallel, the critic code-cold
   ([safety-rails](../../references/safety-rails.md)) and never the agent that built the piece.
10. Produce both sides under one fixture, viewport, width and length; hand them over as `a` and `b` in
    random order, with no filename, path or caption saying which is ours. The measurable half travels with
    the pair; say when a reference is recognizable on sight rather than calling it blind.
11. Take back a pick plus the single biggest remaining gap — never a score, percentage or rubric — send it
    to that piece's builder, and repeat until the critic picks ours or the person ends the run, never on a
    round count.
12. Keep the stall count yourself: name a piece whose critic returns the same gap twice, on `status.md`
    and to the person, and invent no cap.
13. Stop and report where the POC lives and the last critic's word per piece; the next move is the person's.

## The bar is the whole trick

A bar passes three tests or it is not one: **named** — one specific artifact, not a category; **fetchable**
— obtainable here, which step 5 also gates; **comparable** — both sit side by side and a judge picks one.
Reach for the hardest you can genuinely obtain: one set low enough to clear exits on round one.

| Goal | A bar that works |
|---|---|
| Website, app, UI | a named product's live site, screenshotted at the same viewport |
| Code, tooling | a named repository's implementation, its benchmarks as the measurable half |
| Writing, analysis | a named author's or publication's published piece, same length and format |

## The paste-ready prompt

One block for a fresh session, because a loop that may grind for hours belongs in one of its own. No
preamble, no headings inside it, no narration after it.

```
Run a gauntlet loop on this: build [GOAL].

The bar is [BAR]. Get the real thing first and compare against it directly, not against a
description of it. Before you clone, install, or run anything to get it, show me exactly what you
are about to fetch and wait for my yes, and ask again for every new one. Do not hand it my
credentials or environment secrets, and do not give it more of the repository than the comparison
needs.

All work goes in .gauntlet/[SLUG]/ and nothing is written outside it. This is a throwaway proof of
concept, so put .gauntlet/ in .gitignore before you write anything, and ask me first if it is not
already there.

Break this into the smallest pieces that can be improved and judged on their own. For each piece,
fan out a builder and a separate critic with fresh context. The critic inspects the actual output,
puts it next to the bar blind with the labels stripped, says which one is better, and names the
single biggest remaining gap. Then it goes back to the builder.

The critic should be a harsh critic. Praise is not useful. If ours does not win, it keeps going.

/loop on each piece until the critic picks ours blind. Do not stop before that.

Keep a live progress page in .gauntlet/[SLUG]/ updating as the work evolves so I can watch.

Fan out subagents and ultracode.
```

- Bake the bar in concrete — a URL, a product name, a repository, a title; never leave `[BAR]` standing.
- Name the measurable half where the goal has one; a budget ceiling only where the person named one, tool
  names only where the goal needs them.
- Architecture, file layout, decomposition, round count and stack choice stay out — written before the work,
  they were written without the bar.
- Short: about 240 words unfilled, near 250 filled; a heading means it is too long. Plain sentences, no
  bullets inside it.
- Without `/loop` and `ultracode`, the last two lines become "Keep looping until the critic picks ours; run
  the builders and critics as parallel subagents."

## Rationalizations

- *"'Award-winning SaaS sites' is close enough."* → A category cannot be fetched, so the critic invents the
  comparison and approves everything.
- *"The builder can grade its own piece."* → Knowing how hard it tried is what disqualifies it.
- *"A score out of ten shows progress better than a pick."* → Scores drift upward every round; that drift is
  what a bar replaces.
- *"They said yes to the last bar, so this one is covered."* → That yes was about one named thing; a
  standing yes is consent decayed into a formality.
- *"This piece came out well, so I will move it into `src/`."* → One blind pick is not a signed
  `acceptance.md`, a code-cold review or a Verify pass.
- *"I will stash the tree's unrelated changes for a clean check."* → Those are somebody's work in progress;
  the check covers the files this run wrote.

## Red flags

- A bar that is a category, a style or an adjective rather than one named artifact.
- A critic comparing against a description, or judging a piece the same agent built.
- A pair that reached the critic under names, paths, an order or conditions saying which side is ours.
- A judgement returned as a score, a percentage or a rubric; an exit resting on a round count.
- A fetch, install or run that went ahead before the person saw it; one yes stretched to a second bar or
  action; credentials or repository contents travelling with the bar.
- A write outside the run's directory, or before the ignore line was there; the line read as a sandbox.

## Verification

- [ ] Prompt mode: one headingless block, a concrete fetchable bar where `[BAR]` was, the scratch-directory
      and ask-before-you-fetch lines inside it, the offer beneath on one flat line.
- [ ] Run mode: every piece's final critic picked ours blind — or the person ended the run and the report
      says so rather than claiming a win.
- [ ] A fresh yes stands behind every fetch, install and run; nothing beyond the compared piece travelled
      with the bar.
- [ ] Every judgement put ours beside the bar as an artifact; one recognizable on sight was reported so.
- [ ] Each piece had a builder and a separate code-cold critic, and each blind pair went out under identical
      conditions.
- [ ] Every judgement was a pick plus one gap, no exit rested on a round count, and any stalled piece was
      named to the person.
- [ ] `git status --short` lists nothing this run created beyond at most the one-line `.gitignore` change.
- [ ] The report names where the POC lives, the last critic's word per piece, and anything marked `derived`.

## Outputs & handoff

- **`.gauntlet/<slug>/`** — no cap; the ignored throwaway directory: `bar/` (the fetched reference), one
  directory per piece, `status.md`, the output.
- **`.gauntlet/<slug>/status.md`** — under 200 words; the live progress page, rewritten as the work evolves,
  one row per piece — its current gap, its round count, whether the critic has picked ours yet — and no prose
  beyond it.
- **`.gitignore`** — one line, `.gauntlet/`, added where absent and with the person's yes.
- **The prompt block** — in conversation, written to no file, about 250 words; report its measured count
  rather than handing on an over-length draft as if it fit.
- **Nothing else** — no `src/`, no chain artifact under `docs/features/<slug>/`, no `STATE.md`, `CONTEXT.md`
  or `docs/session-log.md`; nothing outside `.gauntlet/<slug>/` but that one `.gitignore` line.
- **Returns** where the POC lives and the last critic's word per piece. It moves no board row and owns no
  gate ([state-schema](../../references/state-schema.md)); the next action is the person's.
