# Design it twice — the variant fan-out

Loaded at Step 5 of [SKILL.md](../SKILL.md) for an interface whose shape is hard to reverse. Uses that
file's vocabulary — **module**, **interface**, **seam**, **adapter**, **leverage**. A first idea is rarely
the best one, and one design plus a defence of it is not a comparison.

## 1. Frame the problem space first

Before any variant exists, write the problem space for the chosen candidate:

- the constraints any interface here would have to satisfy;
- the dependencies it rests on and which category each falls into
  ([seams-and-adapters.md](seams-and-adapters.md));
- a rough code sketch to make the constraints concrete — not a proposal, just something to argue with.

Show it, then start the variants immediately. Where a person is there, they read the framing while the
variants are being produced; where nobody is, the framing is what the comparison later gets graded
against.

## 2. Produce the variants in parallel

Three or more, dispatched in a single message as fresh subagents
([safety-rails.md](../../../references/safety-rails.md)). Each gets its own technical brief — the file
paths, the coupling, the dependency category, what sits behind the seam — and a **different** design
constraint, so what comes back differs in shape rather than in wording:

| Variant | Constraint |
|---|---|
| A | Minimise the interface — one to three entry points, maximum leverage per entry point |
| B | Maximise flexibility — many use cases, room to extend |
| C | Optimise for the most common caller — make the default case trivial |
| D | Ports and adapters — where a dependency crosses a network or a third party |

Every brief carries both this skill's vocabulary and `CONTEXT.md`'s glossary, so the variants name the
same things the same way and can be compared at all.

**What each variant returns:** the interface, with invariants, ordering and error modes; a usage example
showing a caller; what the implementation hides behind the seam; the dependency strategy and its adapters;
and the trade-offs — where leverage is high and where it is thin.

## 3. Compare, then recommend

Present the variants one at a time so each is absorbed before the next, then compare them in prose on
**depth** (leverage at the interface), **locality** (where change concentrates) and **seam placement**.

Close with your own recommendation and its reasoning — which is strongest, and a hybrid where pieces from
two combine well. A menu with no read on it hands the hardest judgement back to whoever asked, which is
the one thing the fan-out was for.
