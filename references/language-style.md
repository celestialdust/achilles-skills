# Language style

How this suite writes. It governs every word the plugin ships: `SKILL.md` bodies, `references/`,
`commands/`, `agents/`, `docs/`, `README.md`, `CONTRIBUTING.md`, and the templates `project-setup`
copies into a consumer's repo.

**Scope, precisely.** This is contributor-facing material *inside the plugin*. It is not substrate:
`project-setup` does not scaffold it into a consumer's repo, and no skill loads it at runtime. It
says how *we* write. It says nothing about how a consumer's project writes.

**The reader we write for.** Someone who has never worked on this project, holding three things from
a real run: a slice that stopped and the reason the run gave for it, the board, and one session-log
entry. They must be able to say what happened, who owns the next action, and why. If they need a term
the repo's own files never define, we failed, however well the sentence reads.

## The rule: cut, do not rephrase

When a passage reads badly, the first move is deletion. Rewriting is the third move, and most bad
prose in this repo got that way because somebody skipped to it.

Before it was fixed, `CLAUDE.md` carried this line in its project-structure block:

```
plugin.json      → legacy root manifest; .claude-plugin/plugin.json is authoritative (version lives there)
```

That sentence is clear. It is also the wrong fix. It exists because the repo had two files that both
claimed to be the manifest, and a reader needed to be told which one to believe. Rewriting it — "the
root manifest is legacy; prefer the one under `.claude-plugin/`" — would have polished a description
of a defect. What shipped instead: the root file was deleted, the line went with it, and `CLAUDE.md`
now states a rule and its reason.

> There is exactly **one** plugin manifest: `.claude-plugin/plugin.json`. It is the only file that
> states the version, and the only path the plugin loader reads. Never add a second manifest at the
> repo root — two files that both claim to be the manifest drift apart silently, because nothing
> forces them to agree.

One line of description became three lines of rule, and one file left the repo. So cutting is not the
same as shortening. It means one fewer thing that has to be kept true.

Ask, in this order:

1. **Can this go?** If the reader would still be right about everything without it, delete it.
2. **Is it here because something else is wrong?** Fix that thing. The passage goes with it.
3. **Only now, rewrite.**

Question 2 is the one people skip. It is also the one no tool can ask for you.

### When cutting is the wrong move

Cutting is wrong when the sentence is *false*. `CLAUDE.md` once said:

> Autonomous runs terminate at an **open draft PR** with a risk band; they never halt mid-run and
> never block waiting for input.

Two claims share that clause. A run never blocks waiting for input — true. A run never stops —
false; several named conditions end one. Deleting the sentence would have left the reader with no
answer. Rewriting it in nicer words would have kept a false claim. The fix separated the two claims
and pointed at the list, and the prose grew. That is correct: adding is right when the reader would
otherwise be wrong.

The test was never length. It is whether every sentence still standing has to be there.

## Vocabulary discipline

Every term in a shipped file is one of three things:

- plain English,
- defined in `CONTEXT.md`,
- defined in the same file, at first use, in one clause.

Nothing else qualifies. In particular, a term whose meaning lives only in a skill file does not count
as defined for a reader who has not read that skill.

Check it with grep, not with judgement — and grep for the *definition*, not for the word:

```
grep -in '^- \*\*<term>\*\*' CONTEXT.md
```

Grepping the bare word returns a false pass. `grep -n "code-cold" CONTEXT.md` hits inside the `Persona`
entry, which *uses* the term — that tells you nothing about whether `code-cold` is defined anywhere. A
check that passes on an undefined term is worse than no check, because it is trusted. The `^- **` anchor
matches only a glossary entry's own headword, so it answers the question actually being asked.

No hit means define the term in `CONTEXT.md`, define it here at first use, or use the plain word
instead. Grep the headword, not an inflection — `slice`, not `slices`.

Three kinds go wrong, in rising order of damage:

- **Words invented here** — `code-cold`, `gate erosion`, `risk band`, `wave`, `substrate`. Each is
  load-bearing, and each is invisible to a first-time reader.
- **Words with a project meaning and a common meaning** — `slice`, `gate`, `run`, `board`, `frozen`,
  `signed`. Worse than an invented word, because the reader does not know they are missing something.
- **Tokens that only look defined** — a board legend lists `halted` and `blocked` side by side. Listing
  a token is not defining it: a reader looking at a stopped slice still cannot tell which one describes
  it, or whose move it implies. A legend enumerates; only a definition discriminates.

Every term named above is defined in `CONTEXT.md`, the two board tokens on exactly the axis the reader
needs: whose move it is. That is where a term with a project meaning goes — not into a parenthetical in
whichever file happened to need it first, which is invisible to everyone reading a different file.

Pick one word per thing and keep it. Varying the word for elegance costs the reader a lookup and
gains nothing; two words for one thing eventually become two things.

### Two audiences, two registers, one vocabulary

A file an agent loads may compress. `orchestrator/SKILL.md` says *"The run terminates on **exactly
one** predicate"*, and that is right for its reader. A file a person reads states the same fact as
*"A run is one pass over the slice graph, Implement through Ship. It has exactly two endings."*
(`docs/workflow.md`).

Both are correct. The split is by reader, not by taste: anything a person reads cold — `docs/`,
`README.md`, and every template scaffolded into a consumer's repo — takes the second register. The
vocabulary does not split. A term means the same thing in both.

### No word that grades our own work

*Production-grade. Battle-tested. Comprehensive. Powerful. Seamless. Robust.* These tell the reader
what to conclude instead of handing them the fact they would conclude it from. Replace each with the
fact. "Battle-tested" becomes "drawn from real workflows".

This suite already refuses these words when someone else uses them — `interview-me` lists *"Buzzwords
as goals — when 'modern', 'scalable', 'robust' are the answer instead of a specific outcome"* among
its red flags. The rule is not different when we are the ones writing.

## Name the owner of the next action

"The slice halts" is half a sentence. Whose move is it now?

Every halt, refusal, red flag, and stop condition names the party that acts next. The board makes
this structural — `STATE.md` has a `gate` column whose only values are `you`, `agent`, and `done`.
Prose has no column, so prose has to say it. `docs/workflow.md` does, for a slice that ran out of
retries:

> The slice stays at the stage that failed, its `gate` flips from the agent to you, and the failure
> surfaces with a record of what was tried.

State, owner, and evidence, in one sentence. Two failure modes to watch:

- **Passive voice hides the owner.** "is reported", "is escalated", "will be reviewed" — by whom, to
  whom? If the sentence survives with no name in it, the reader cannot act on it.
- **Three names for one party.** "the user", "the human", "a person", "you" — inside one file, pick
  one and keep it.

## One statement per fact

A fact written in two files is a fact that will eventually disagree with itself, and a reader has no
way to tell which copy is lying.

This suite has already paid for that. A pass that corrected the skill and command counts had to be
followed by a second commit whose entire job was to finish the sweep the first one started — the same
number, still wrong, in files the first pass never opened. The defect is not carelessness; it is
having written the number down more than once. And that instance is not fixed — the counts are still
written in more than one file. It is a cost the repo carries, not a shape to copy.

The fix to copy is next door. The conditions that stop a run are listed in `docs/workflow.md` and
nowhere else; `README.md` and `CLAUDE.md` each say a run can stop, then point at that list. Add a
condition and there is exactly one file to edit, and no second copy that can quietly disagree with it.
Resolving the counts means the same shape — one file states the number, every other site points at it.

So: prefer pointing at the one statement over restating it. When you do change a claim, grep the
whole repo for every other statement of it before you stop.

## Applying this to a paragraph

Answer six questions. Each "no" is a specific edit, not a feeling.

| # | Question | On a "no" |
|---|---|---|
| 1 | Would the reader be wrong about something if this paragraph were deleted? | Delete it. |
| 2 | Does it state a rule, rather than describe a defect somebody should fix? | Fix the defect; the paragraph goes with it. |
| 3 | Is every term plain English, in `CONTEXT.md`, or defined here at first use? | Grep `CONTEXT.md`. Define at first use, or use the plain word. |
| 4 | Does it name who acts next? | Name them. |
| 5 | Does it give the reason, not just the rule? | Add the because-clause. One sentence. |
| 6 | Is this the only place in the repo that states this fact? | Grep. Keep one statement; point at it from the other sites. |

Question 5 is the one that earns length. The manifest rule quoted above is worth its three lines
entirely because of "nothing forces them to agree" — a rule without its reason is a rule an agent
under pressure will route around, and a reader cannot tell a real constraint from a preference.

## Why there is no lint for this

No machine can check the rule this file is built on. Whether a sentence should have been *deleted*
rather than rewritten depends on what the reader already knows and on whether some defect elsewhere
is the real cause. A tool that counted words, symbols, or syllables would score a split sentence
better than the original while the reader's job stayed exactly the same — it would reward moving
complexity around.

Every threshold such a tool could use would also be invented. Nothing here measures that a paragraph
over *N* words, or a file over *N* undefined terms, costs a reader anything. Ship a number without a
derivation and every later edit gets argued against it, as though it meant something.

**This is deferred, not rejected.** The lint is reopened when a comparison gives a threshold a real
derivation — two versions of the same artifact put in front of readers, or graded cold-start agent
runs, producing a number that was measured rather than chosen. Until that exists, producing it is the
prerequisite, not the lint. Do not re-add a symbol-count check on the argument that some rule is
better than none.
