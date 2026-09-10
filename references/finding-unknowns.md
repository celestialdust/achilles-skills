# Finding unknowns

Surfacing what a prompt, an intent or a spec leaves unsaid. Used by `interview-me`, `idea-refine` and
`spec-grilling`, and wherever a person's map is handed to an agent.

## The map and the territory

A prompt is a *map*; the codebase, the domain and the real world are the *territory*. Every place they
diverge is an **unknown** — a decision nobody specified, which the agent resolves alone and silently.

## The four quadrants

- **Known knowns** — what is written down. Surface by restating it against concrete references.
- **Known unknowns** — gaps the person knows about. Surface by interview, one question at a time,
  highest leverage first.
- **Unknown knowns** — too obvious to write down, but known when seen: taste, implicit domain knowledge.
  Surface by giving them something to react to.
- **Unknown unknowns** — never considered, and would change the ask if known. Surface by scanning the
  territory, never by a question.

Questions only work the second quadrant. Unknown knowns cannot be articulated on request; unknown
unknowns are not on the map, so no question aimed at the map finds them.

## The blind-spot pass

Scan the territory the person is about to work in — the modules the change touches, prior art, existing
decisions, the domain — for what would change the ask if they knew it. Ask their experience level first
and concentrate the scan where the ignorance is: effort follows ignorance, and discovery is a dial rather
than a ritual. Present 3–5 items, each one line of what it is and why it changes the ask. The brief is
context, not questions: it grows the map, and the interview then covers the grown map. It works before
any code exists, where the territory is the domain and prior art.

## Reactable options

Where the ask has a know-it-when-I-see-it surface — interface, flow, report format, CLI or API
ergonomics, naming — render 3–4 wildly different throwaway artifacts and ask for a reaction. Deliberately
different beats safely similar: triangulate taste, do not win round one. Label them disposable and delete
them after — probes, not prototypes.

## Leverage-ordered questions

Spend questions where the answer changes the architecture or the scope. Where the recommended answer is
an uncontested default, state it inline and move on — one line, not a round. A question whose every
answer leads to the same build was never a question.
