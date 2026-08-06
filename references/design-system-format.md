# Design system format

The shape of a repository's **decided look** and of the per-feature design contracts that inherit it. Two
skills use this shape — `frontend-design` writes both files, `quality-verification` grades against them —
so it is written here once. A shape stated inside two skills drifts, and nothing forces the two copies
back into agreement.

Two files. The split between them is lifetime:

| file | holds | written by |
|---|---|---|
| `docs/design.md` | the whole repository's look, for as long as the repository has one | the **first** user interface built in the repo |
| `docs/features/<slug>/design-contract.md` | one surface's look, as what differs from `docs/design.md` | every user interface, the first one included |

## `docs/design.md` — the decided look

Five things, and nothing that belongs to a single screen:

- **Palette** — 4–6 named colours with their values, and what each one is for.
- **Type** — the typefaces by role (display, body, and a utility face where one is needed), the scale, and
  the weights and spacing that go with them.
- **Layout language** — the grid, the spacing rhythm, the density, and how a page is built out of them.
- **Motion posture** — whether animation is used at all, where, and how much.
- **Signature vocabulary** — the recurring devices that make this repository's interfaces recognisable as
  one product.

What never goes in it: one feature's copy, one screen's layout, one surface's fidelity bar, one
prototype's path. Those belong to that surface's contract. The test is whether the sentence stays true
after the feature that prompted it is deleted — if it does not, it is not repository-level.

**The first UI surface creates it; nothing scaffolds it.** An empty `docs/design.md` would say exactly
what *no* `docs/design.md` already says — the look is not decided yet — while reading like a decision
somebody made. A repository with no user interface has none, and that is correct rather than a gap.

**It is anchored to a person, without a status field of its own.** `frontend-design` writes it in the same
act that produces the contract the human signs, so its content is what that person agreed to. It is edited
only by a later surface that deliberately moves the whole look, and that edit rides along with that
surface's own sign-off. Nothing else edits it — not a slice under retry, not `quality-verification`, which
reads it and never writes it.

## The per-feature contract records the delta

In a repository that has a `docs/design.md`, a contract records **only what differs from it**, and names
the axes it takes unchanged. Each of the seven rubric axes — `Distinctiveness · Typography ·
Structure-as-information · Motion · Quality floor · Restraint · Copy-as-design-material` — carries exactly
one of two lines:

```md
## Typography
inherits: docs/design.md

## Structure-as-information
delta: the release table numbers its rows 01–12 because a release is a sequence; nothing else on this
surface is numbered.
```

Exactly one line, never both and never neither, so a reader can tell *"the same as the rest of the repo"*
from *"nobody wrote this down"*. An inherited axis is **not** restated: a second copy of a decision is a
copy that can disagree with the first, and a reviewer then has no way to tell which one is lying.

`## Prototype` is never inherited. Every surface has its own prototype and its own fidelity bar, so that
section is filled in full on every contract.

**The first surface differs in what it decides, not in what it records.** It explores with nothing to
inherit, and once the direction is committed it writes `docs/design.md` from what was decided — then its
own contract marks those axes `inherits: docs/design.md` like any other. That is what keeps the repository
from opening with the palette written down twice on day one.

## A departure states what it moves away from, and why

A **delta** fills in something `docs/design.md` leaves to each surface. A **departure** contradicts
something `docs/design.md` already decided. They are graded differently, so they are written differently.

A departure gets its own heading in the contract, next to the axis it moves:

```md
## Departure — Motion
Decided look: animation is used only to mark a state change; no ambient motion anywhere.
This surface: the hero runs a continuous ambient loop.
Because: this is the public landing page, and its job is to hold a stranger for three seconds. The decided
posture was written for the signed-in application, where the same loop is a distraction.
```

Three rules, each with its reason:

- **The reason is required.** Without it a reviewer cannot tell a decision from a drift, and the only
  reading left is that somebody forgot.
- **It is never filed as a plain `delta:`.** A departure written on the axis line reads as though the
  decided look said this all along, which is the one thing a departure must not do.
- **It never edits `docs/design.md`.** Moving the whole repository's look is a separate, deliberate act
  by a surface that means to move it — not a side effect of one screen needing something else.

One block per axis moved. A surface departing on four axes is a surface that should probably be moving the
decided look instead; write the four blocks anyway and let a person read them together and decide.

## A repository with no decided look

Nothing above requires one. Where `docs/design.md` does not exist, a contract states all seven axes itself
and is graded against itself, exactly as contracts were graded before this file existed. `inherits:` has
nothing to point at, so it is not used.
