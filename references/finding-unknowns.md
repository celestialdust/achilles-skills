# Finding Unknowns Reference

Quick reference for surfacing what a prompt, intent, or spec leaves unsaid. Used by the
discovery-stage skills (`interview-me`, `idea-refine`, `spec-grilling`); useful anywhere a
human's map is about to be handed to an agent.

## The map and the territory

A prompt, an intent, or a spec is a *map*. The codebase, the domain, and the real world are the
*territory*. Every place the territory diverges from the map is an **unknown** — a decision point
nobody specified, which the agent resolves alone, silently. Modern models traverse enormous
territory per prompt, so output quality is bottlenecked less by model capability than by how many
unknowns the human found *before* the run.

## The four quadrants

| Quadrant | Definition | What surfaces it | Interaction shape |
|---|---|---|---|
| **Known knowns** | stated requirements — what's written in the prompt/intent | restating; concrete references | human → agent |
| **Known unknowns** | gaps the human knows about but hasn't resolved | interview: one question at a time, highest-leverage first | agent asks, human answers |
| **Unknown knowns** | so obvious the human would never write it down — but they'd *know it when they see it* (taste, implicit domain knowledge) | reactable options: wildly different throwaway artifacts | agent shows, human reacts |
| **Unknown unknowns** | never considered at all; would change the ask if known | blind-spot pass: scan the territory, brief the human | agent scans, human learns |

**The key asymmetry:** asking questions only works the known-unknowns quadrant. Unknown knowns
can't be articulated on request — the human needs something to react to. Unknown unknowns aren't
on the human's map by definition — no question aimed at the map will find them; only a territory
scan will.

## Technique: the blind-spot pass

Scan the territory the human is about to work in — the modules the change touches, prior art,
existing decisions, the domain itself — hunting specifically for things that would change the ask
if the human knew them. Present a **blind-spot brief**: 3–5 concrete items, each one line of
"what it is" plus "why it changes your ask." Then let the human fold them into the conversation.

- Works pre-code too: when no codebase exists, the territory is the domain, the market, and prior art.
- Have the human disclose their experience level first ("I know nothing about the auth modules
  here") — concentrate the scan where their ignorance is.
- The brief is context, not questions. It grows the map; the interview then covers the grown map.

## Technique: reactable options

When the ask has any "know it when I see it" surface — UI, UX flows, report formats, CLI/API
ergonomics, naming — render 3–4 **wildly different** throwaway artifacts (rough HTML mock-ups,
sample outputs, fake-data sketches) and ask the human to react. Reacting is fast and accurate;
describing taste from scratch is slow and wrong.

- Deliberately different beats safely similar — the goal is to triangulate taste, not to win round one.
- Label the artifacts disposable and delete them after. They are probes, not prototypes.

## Technique: leverage-ordered questions

Spend interview questions where the answer changes the architecture or scope of what gets built.
If a recommended answer is an uncontested default, state it as the default inline and move on —
one line, not a round. A question whose every answer leads to the same build was never a question.

## Technique: the sign-off quiz

An explicit "yes" to a restate is a weak signal — reading-and-nodding is easy. Before a
consequential signature (an intent, a set of design decisions), flip the interview: ask the human
2–3 scenario questions derived from what they are about to sign ("per what we agreed, what should
happen when X?").

- Answers match → the map is genuinely shared; sign.
- A miss → the artifact and the human's mental model diverge; reopen at that point. It is the
  cheapest bug you will ever catch.

## Calibration: effort follows ignorance

Novel territory → run everything: scan, reactable options, full interview, quiz. Familiar
territory → compress: skip the scan, fewer questions, no quiz. Ask what the human knows nothing
about at the start — that answer decides where discovery effort goes. Discovery is a dial, not a
ritual.
