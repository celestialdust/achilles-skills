---
name: gauntlet-loop
description: 'Grinds a throwaway prototype until it beats a real outside reference — name one fetchable bar, split the goal into independently judgeable pieces, and run a builder against a separate blind critic on each until the critic picks ours. Emits a paste-ready prompt for a fresh session, and runs the loop here when asked. The fast path for a proof of concept; anything that will ship uses the lifecycle skills. Use when someone types /gauntlet-loop or says "gauntlet this", "loop until it beats X", "run the gauntlet", or asks for a gauntlet prompt. An ask that merely sounds fast never selects it — quick is a tone, not a scope, so using-agent-skills offers this path beside the full loop and the human picks. Needs a person in the session: fetching a bar can mean running code from outside the repository, and every fetch waits for your yes. Standalone — no lifecycle gates, nothing blocks, /orchestrate untouched.'
---

# Gauntlet loop — grind a throwaway prototype until it beats a real reference

## Purpose

The **fast path for a proof of concept** (POC). A gauntlet loop names one real artifact from outside this
repository that the work has to beat — the **bar** — splits the goal into the smallest pieces that can be
judged on their own, and on each piece runs a **builder** against a separate **critic** that puts the two
side by side without being told which is which. The loop ends when the critic picks ours.

**Production work uses the lifecycle skills.** This one is for the throwaway: a spike, a demo, the thing you
build to find out whether the idea is worth specifying at all.

**Standalone — not a lifecycle stage.** No gate waits on it, it blocks nothing, `/orchestrate` is untouched,
and it takes no place in the artifact chain — it reads no `intent.md` and writes no `prd.md`,
`acceptance.md`, `plan.md`, or `qa.md`.

**Everything it produces lands in `.gauntlet/<slug>/`, a directory the repository ignores.** The fetched bar,
the per-piece work, the progress page, the output. `src/` is not touched and there is nothing to commit.

**What that ignore line does, exactly: it stops a commit.** An ordinary `git add` cannot sweep a POC into the
tracked tree, and that much holds whether or not anyone reads this file. It is also the whole of what it does.
It does not stop someone copying a file out — nothing does — so the prohibition is written down too, under
*Rationalizations*. And it is not a sandbox: a bar you install and run is ordinary code with ordinary reach,
and git declining to track a directory confines none of it. Step 6 is where that is gated, and the gate is you.

The ignore line is not assumed. Nothing is written until `.gauntlet/` is in the target repository's
`.gitignore` — the Process says where that check sits, and the prompt this skill emits carries the same
requirement into whatever session runs it. Where the line is absent, say so and **ask** before adding it:
`.gitignore` belongs to the human, as `project-setup` also holds. A human who declines it has declined the
loop, so say that and stop rather than running a throwaway build into a tracked tree.
`frontend-design` gets its throwaway screens ignored the same way.

**Loop-until-win is legal here, and only here.** `doubt-driven-development` and the orchestrator each bound
their cycles, each states its own bound, and this skill does not lift either. Those bounds exist because a
production run has a retry budget, a frozen `acceptance.md`, and a wave of other slices waiting on it. A
gauntlet loop has none of the three, so its exit can be the outcome itself: the critic picks ours.

## When to use / when to skip

**Use** when the output is meant to be thrown away and the point is to find out how good the idea can get: a
spike, a demo, a prototype, a bake-off against something that already exists. Use it when someone says
"gauntlet this", "loop until it beats X", "run the gauntlet", or asks for a gauntlet prompt to paste into a
fresh session.

**Skip** when any part of the output will ship. What decides is whether the result gets thrown away, and the
human decides it — by naming the gauntlet outright, or by picking this path when `using-agent-skills` sets
the two side by side. An ask that merely *sounds* fast decides nothing; the *Offering the fast path* section
of `using-agent-skills` says why, and that is where to read it rather than re-deriving it here.

| You want… | Reach for | Where the work lands | What ends it |
|---|---|---|---|
| a throwaway build pushed until it beats a named outside reference | **gauntlet-loop** (this skill) | `.gauntlet/<slug>/`, ignored by the repository | the critic picks ours, blind |
| anything that will ship | the lifecycle, `/ideate` through `/ship` | the repository | the signed contracts, the gates, a human merge |
| a confident in-flight decision cross-examined during a run | `doubt-driven-development` | the run's own artifacts | that skill's own stop conditions |

## Inputs

- **The goal**, in one line — what to build, write, or measure.
- **The bar**, when the human named one. When they did not, you offer two or three candidates and stop; the
  human picks. Never pick for them: the bar decides everything the loop is worth.
- **The measurable half** — the part of the goal a number settles instead of a judgement, where the goal has
  one: load time, token cost, benchmark score, word count, pass rate. Name it beside the bar; taste plus a
  number beats taste alone.
- **A slug** for the run, which names its scratch directory `.gauntlet/<slug>/`. Create it on first use.
- **Optional:** tool names the goal genuinely needs (image or video generation, a browser, a deploy target),
  and a budget ceiling — only when the human named one. There is no default cap.

No upstream artifact is required. An empty repository is a valid input.

## Process

Two modes share the first two steps. The default output is **the prompt** — one block the human pastes into a
fresh session — because a loop that may grind for hours belongs in a session of its own. Running it here is
the offer, not the assumption.

1. **Read the goal.** Restate it in one line to yourself. Do not put the restatement on screen.
2. **Set the bar.** Supplied → use it. Not supplied → offer **two or three** candidates, one line each, and
   **stop**. Wait for the pick. That is where the turn ends: candidates and nothing else. Never write a prompt
   with `[BAR]` still in it, and never pick for the human. Put whichever they choose through the three tests
   below; a candidate that fails one is not a bar, and you say so rather than proceeding with it.
3. **Write the prompt.** One paste-ready block: no preamble, no headings inside it, no narration after it.
   Its shape and fill rules are below.
4. **Offer to run it.** One flat line under the block — "I can run this here." Not a question. If the human
   says run it, this session runs the loop itself: you follow the prompt you just wrote, and steps 5 to 12 are
   what that means.
5. **Clear the scratch directory before writing.** `.gauntlet/` in the target repository's `.gitignore` is the
   precondition for every write that follows. Present → carry on. Absent → say so and ask; the human's yes
   adds the one line, and their no ends the run here.
6. **Show what you are about to fetch, and wait for a yes.** Before anything is cloned, installed, or run,
   put the thing itself on screen — the URL, the package name and version, the repository — and say which of
   the three you intend, because downloading a file, installing a package, and executing it are three
   different asks. Then stop and wait. A bar is code and content from outside this repository, picked for
   being good rather than for being safe, and running it gives it whatever this session can already reach.
   The human's yes is the only thing between those two facts, so it is asked for by name and **per bar**: a
   yes for this bar is not a yes for the next one, and a yes to downloading is not a yes to executing. A no
   ends the run here — say so and stop, rather than quietly substituting a bar nobody agreed to or falling
   back to comparing against a description.

   **What it does not get, whatever the answer.** No credentials and no environment secrets — this session's
   API keys, tokens, and `.env` contents go nowhere near the install, the build, or the run, and nothing
   under `.gauntlet/` is a place to copy them to. No repository contents beyond what the comparison needs:
   the bar is judged beside our output for one piece, so it gets that output, not the tree. No network reach
   the comparison does not need, and a build step that wants to authenticate somewhere is a stop rather than
   a prompt to go find it a credential. Where the goal genuinely needs one of these — a private repository,
   a licensed dataset — name it to the human at this step and let them decide it along with the rest.

7. **Get the real thing.** With the yes in hand, fetch the bar into `.gauntlet/<slug>/bar/` — the screenshot
   at the stated viewport, the published piece, the cloned repository, the footage. Compare against
   the artifact, never against a description of it: a critic handed a description invents the comparison. If
   it cannot be obtained on this machine it was never fetchable and it is not a bar — say what failed and go
   back to step 2.
8. **Split into pieces small enough to judge alone.** A piece is something one critic can look at and call
   better or worse — the hero, the motion, the type, the opening paragraph, the flag parsing, the benchmark
   run. A piece that needs two judgements is two pieces, and the first critic to hedge is how you find that
   out; split then rather than arguing the sizing up front.
9. **Fan out a builder and a separate critic per piece**, in parallel, each with fresh context. The critic is
   **code-cold**: it never sees the builder's reasoning, and it must not know how hard the builder tried.
10. **Judge blind and loop.** Blind is something you build, not something you ask for. Produce both sides under
    the same conditions — same fixture, same viewport, same width, same length — hand them over as `a` and `b`
    in an order chosen at random, with no filename, path, or caption saying which is ours, and give the critic
    one job: **pick one**, then name the **single biggest remaining gap**. Where the piece has a measurable
    half, the two numbers go over with the pair and count toward the pick. Where the reference is recognizable
    on sight — a house style, a signature border, a byline — say so to the human instead of calling the
    comparison blind when it was not. The gap goes back to that piece's builder. Repeat per piece until the
    critic picks ours. No round count, and no score standing in for the pick; the failure modes are in
    *Rationalizations*.
11. **Surface a stall.** A piece whose critic keeps returning the same gap is not converging, and a fresh
    critic carries no memory of that — so you keep the count. Say it on the progress page and tell the human.
    You still do not invent a round cap: stopping the run is the human's move.
12. **Stop and report.** Say where the POC lives and what the last critic said about each piece. The next
    action is the human's.

## The bar is the whole trick

Everything else is scaffolding. The loop only produces quality when the thing it compares against is real and
already better. A bar passes three tests or it is not a bar:

- **Named.** A specific artifact, not a category. "Stripe's pricing page" is a bar. "Award-winning SaaS
  sites" is not.
- **Fetchable.** The critic can actually obtain it — screenshot the live page, read the published piece, run
  the binary, open the repository, watch the footage. What cannot be obtained gets invented. A bar the human
  will not let you run is not fetchable for this purpose, which step 6 settles.
- **Comparable.** Both can sit side by side and a judge can pick one. If you cannot picture the A/B, there is
  nothing to judge.

| Goal | A bar that works |
|---|---|
| Website, app, UI | the live site of a named best-in-class product, screenshotted at the same viewport |
| Game, 3D, visual | real footage or screenshots from a named shipped title |
| Writing | a specific published piece by a named author or publication, same length and format |
| Code, tooling | a named repository's implementation, plus its benchmark or test suite as the measurable half |
| Research, analysis | a named analyst report, or a paper's methods section, judged on rigour and coverage |
| Deck, document, deliverable | a real artifact from a firm known for it, same page count |

Offer the hardest bar the agent can genuinely reach. A bar set low enough to clear exits on round one and
proves nothing.

## The paste-ready prompt

Adapt the wording every time. Fill the brackets, keep it short, keep the last lines. The block closes on two
Claude Code features — `/loop`, which reruns a prompt on an interval or lets the model pace itself, and
`ultracode`, which opts the turn into multi-agent orchestration. *Portability* below says what to write in
their place on any other agent.

```
Run a gauntlet loop on this: build [GOAL].

The bar is [BAR]. Get the real thing first and compare against it directly, not against a description of it.
Before you clone, install, or run anything to get it, show me exactly what you are about to fetch and wait for
my yes, and ask again for every new one. Do not hand it my credentials or environment secrets, and do not give
it more of the repository than the comparison needs.

All work goes in .gauntlet/[SLUG]/ and nothing is written outside it. This is a throwaway proof of concept,
so put .gauntlet/ in .gitignore before you write anything, and ask me first if it is not already there.

Break this into the smallest pieces that can be improved and judged on their own. For each piece, fan out a
builder and a separate critic with fresh context. The critic inspects the actual output, puts it next to the
bar blind with the labels stripped, says which one is better, and names the single biggest remaining gap.
Then it goes back to the builder.

The critic should be a harsh critic. Praise is not useful. If ours does not win, it keeps going.

/loop on each piece until the critic picks ours blind. Do not stop before that.

Keep a live progress page in .gauntlet/[SLUG]/ updating as the work evolves so I can watch it.

Fan out subagents and ultracode.
```

What you fill in, and what stays out:

- Bake the bar in as a concrete, fetchable thing — a URL, a product name, a repository, a title.
- Name the measurable half beside the reference when the goal has one.
- Add a budget or cost ceiling **only when the human named one**. No default cap.
- Add tool names only when the goal needs them.
- Everything else stays out: no architecture, no file layout, no decomposition, no round count, no stack
  choice the human did not demand. The agent decides those after it has seen the bar; a specification written
  before the work started was written without it.

**Length and voice.** Short. The template above runs 239 words unfilled, and a filled one lands near two
hundred and fifty. The count is not the test: if it needs a heading to stay readable, it is too long. Plain
sentences, no bullets inside the block. It should read like someone naming the standard and refusing anything
under it.

**Portability.** On any agent without `/loop` and `ultracode`, swap the last two lines for: "Keep looping
until the critic picks ours. Run the builders and critics as parallel subagents." The structure carries over
unchanged.

## Rationalizations

Stop signals disguised as good reasons:

- *"'Award-winning SaaS sites' is close enough to a bar."* → It is the most common way a gauntlet loop fails.
  A category cannot be fetched, so the critic invents the comparison and approves everything.
- *"I will describe the reference to the critic instead of fetching it."* → The same failure one step later.
  The critic judges the artifact, or it judges its own imagination.
- *"The builder can grade its own piece — it knows it best."* → Knowing how hard it tried is exactly what
  disqualifies it. The critic is a separate agent with fresh context.
- *"A score out of ten shows progress better than a pick."* → Scores drift upward every round; that drift is
  the thing bars exist to replace. A binary pick, or nothing.
- *"Three rounds is plenty, I will call it done."* → The exit is winning the comparison, or the human stopping
  the run. A round count is another skill's bound and it stays there.
- *"An easier bar would let us finish."* → A bar set low enough to clear proves nothing. Raise the work, not
  the floor.
- *"I will specify the layout and the stack so the builder does not wander."* → Every extra instruction is one
  fewer decision made with the agent's own judgement, after it has seen the bar.
- *"They said yes to the last bar, so this one is covered."* → The yes was about a named thing. A new URL, a
  new package, or a move from downloading to executing is a new ask. Treating one yes as standing permission
  is how a consent step decays into a formality.
- *"This piece came out well — I will move it into `src/`."* → Nothing leaves `.gauntlet/`. One critic's blind
  pick is not a signed contract, a code-cold review, or a Verify pass, and code nobody else has to maintain is
  held to a different standard than code they do.
- *"The tree has unrelated changes in it, so I will stash them to get a clean check."* → Never. Those changes
  are somebody's work in progress and none of this run's business. The check is over the files this run wrote,
  not over the whole tree.

## Red flags

Stop and fix before continuing if any are true:

- The bar is a category, a style, or an adjective rather than one named artifact.
- The reference was never obtained, so the critic is comparing against a description.
- One agent both built and judged a piece, or the critic saw the builder's reasoning or its effort.
- The pair reached the critic under names, paths, an order, or conditions that said which one was ours.
- A judgement came back as a score, a percentage, or a rubric instead of a pick plus one gap.
- An exit was taken on a round count rather than on the critic's pick.
- A clone, an install, or an execution happened before the human saw what was being fetched; or one yes was
  stretched to cover a second bar, or a yes to downloading was read as a yes to running; or credentials,
  environment secrets, or repository contents beyond the piece under comparison reached the fetched bar, or a
  build that asked to authenticate got a credential instead of a stop.
- A write happened while `.gauntlet/` was not in the target repository's `.gitignore`, or the line was added
  without asking, or any file landed outside `.gauntlet/<slug>/`.
- The `.gitignore` line was treated as though it confined what the fetched bar could run, read, or reach.
- The prompt carries headings, or specifies architecture, stack, or decomposition the human never asked for.
- A piece is big enough to need two judgements.

## Verification (ending criteria)

**Prompt mode** is done when one paste-ready block exists — short, no headings inside it, the bar baked in as
a named fetchable thing, the gauntlet named in its first line, and both the scratch-directory requirement
and the ask-before-you-fetch requirement carried inside the block, because the session that runs it is the
one that does the fetching and a gate left behind in this file gates nothing there — and the offer to run it
sits under the block on one flat line. A turn that offered candidate bars and stopped is not an unfinished
prompt mode; it is step 2 ending correctly, and the block comes after the pick.

**Run mode** is done when ALL hold:

- Every piece's final critic picked ours, blind — or the human stopped the run, and the report says that
  rather than claiming a win.
- Every bar was named on screen — the URL, the package, the repository — and agreed to before it was cloned,
  installed, or run, with a fresh yes for each one. No credential, no environment secret, and no repository
  content beyond the piece under comparison was handed to it. A run the human declined stopped there and
  said so.
- The bar was obtained as an artifact and sat beside ours for every judgement.
- Each piece had a builder and a separate code-cold critic; no agent judged what it built.
- Each pair went out under neutral names in a random order, produced under the same conditions. Where the
  reference was recognizable on sight, the report says so.
- Every judgement was a pick plus the single biggest remaining gap; no critic returned a score in place of a
  pick.
- No exit was taken on a round count, and any piece that stalled was named to the human.
- `.gauntlet/` was in the target repository's `.gitignore` before the first write — already there, or added
  after the human said yes. `git status --short` lists nothing this run created, and at most that one-line
  `.gitignore` change. Everything else already in the tree stays exactly as it was.
- The report says where the POC lives and what the last critic said for each piece.

## Outputs & handoff contract

- **Emits:** in prompt mode, one paste-ready prompt block, in-conversation. In run mode, the proof of concept
  itself under `.gauntlet/<slug>/` — the fetched bar, the per-piece work, the live progress page, the output —
  plus an in-conversation report of where it lives and what the last critic said.
- **Writes nowhere else.** Not `src/`, not `docs/features/<slug>/`, not `STATE.md`, not `CONTEXT.md` — the one
  exception is the `.gauntlet/` line in `.gitignore`, added with the human's yes before the first write where
  the repository lacks it. A finished run leaves the tracked tree otherwise untouched.
- **Reads no upstream artifact.** It holds no place in the chain `intent.md → research.md → prd.md →
  acceptance.md → environment.md → architecture.md → plan.md → qa.md`, and nothing downstream consumes it.
- **Next action:** the human's. The run reports and stops.
- **Standalone:** no lifecycle gates, nothing blocks, `/orchestrate` untouched.
