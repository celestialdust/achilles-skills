# Refinement criteria

The rubric behind step 6. Not every dimension matters for every idea — grade on the ones that decide
this one.

## User value

The dimension that dominates: if the value is unclear, nothing else counts.

A **painkiller** solves an acute, frequent problem. People describe it with emotion, have already built
a workaround, and will switch. A **vitamin** makes something marginally better; people nod, say "that's
cool", and change nothing.

Ask: can you name three specific people with this problem right now? What are they doing instead — the
real competitor is always the current workaround. What would make them switch? How often do they hit
it (daily beats monthly)? Are they asking for this, or do you think they should want it?

Weak signs: "everyone could use this" (no specific user means no clear value); "like X but better"
(marginal improvements rarely move anyone); a real problem that is also rare.

## Feasibility

**Technical** — does the core technology work reliably today? What is the hardest problem, and is it
known-hard or novel? What third parties, APIs or data do you not control?

**Resource** — the minimum effort to an MVP; expertise you do not have; regulatory or compliance load.

**Time-to-value** — how fast can something reach a user? Is there a version that delivers in days
rather than months? What is on the critical path?

Weak signs: "we just need to solve \<hard research problem\> first"; several dependencies that must all
land at once; an MVP still months out, which means it is not minimal.

## Differentiation

Not better — *different*. If a user described this to a friend, would the description be compelling?
What does it do that nothing else does? Could a competitor copy it in a week? Is the difference one
users care about, or one builders find interesting?

Strongest to weakest: a new capability (previously impossible) · a 10x improvement that changes
behaviour · a new audience previously excluded · a new context where existing solutions fail · the same
capability with dramatically simpler UX · cheaper, which is competed away fastest.

Weak signs: differentiation that is entirely technical; "faster, cheaper, prettier" with no structural
reason why; the differentiating feature is not the one users care most about.

## Assumption audit

Sort each direction's assumptions into three, and give every **must** a way to test it:

- **Must be true** — wrong kills the idea. "Users will share their data with us." Validate before building.
- **Should be true** — wrong changes the approach, not the product. "Users prefer self-serve to a call."
- **Might be true** — secondary features and optimizations. Do not validate until the core is proven.

## Choosing between directions

|                | High feasibility | Low feasibility |
|----------------|------------------|-----------------|
| **High value** | do this first    | worth the risk  |
| **Low value**  | only if trivial  | do not do this  |

Differentiation is the tiebreaker between directions in the same quadrant.

## Scoping the recommendation

1. **One job, done well** — not three jobs done partly.
2. **The riskiest assumption first** — the first version exists to test the thing most likely to be wrong.
3. **Time-box rather than feature-list** — "what can we build and test in two weeks?" beats "what
   features do we need?".
4. **Name what is cut, and why** — this is the Not Doing list, and it is what stops the scope creeping.
5. **If it is not a little embarrassing, it shipped late** — a first version that feels complete to its
   builder was over-built.
