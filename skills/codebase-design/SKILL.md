---
name: codebase-design
description: Shared vocabulary and method for designing deep modules — a lot of behaviour behind a small interface, at a clean seam, testable through it. Use when planning a module's interface during plan-breakdown, when the user wants to design or improve an interface, find deepening opportunities, decide where a seam goes, make code more testable or AI-navigable, or when another skill needs the deep-module vocabulary. Reach for it BEFORE you write interface signatures into plan.md — designing the seam after the code exists is too late.
---

## Purpose

**Stage: Plan — referenced discipline (D23), not a sequential stage.** `plan-breakdown` owns the plan;
this skill is the design language and method it (or a standalone refactor) applies when shaping a module's
interface.

Design **deep modules**: a lot of behaviour behind a small interface, placed at a clean seam, testable
through that interface. Depth buys three things — **leverage** for callers (more capability per unit of
interface they must learn), **locality** for maintainers (change/bugs/knowledge concentrate in one place),
and **testability** for everyone (callers and tests cross the same seam). The exact, shared vocabulary
below *is* the point: inconsistent words ("component", "service", "boundary") are how design conversations
quietly go wrong.

## When to use / when to skip

Use during `plan-breakdown` when you're deciding a module's interface or where a seam goes, or standalone
for a pure refactor (deepening a cluster of shallow modules). Use it whenever another skill needs the
deep-module vocabulary so everyone names things the same way.

Skip when there's no real module to shape — a one-line config change, a pure data migration, trivial
glue. Escape hatch: do **not** introduce a seam for a single adapter ("one adapter = hypothetical seam;
two = real") — that's just indirection, and this skill will tell you so.

## Inputs

- **The deepening candidate** — a named module, a cluster of shallow modules, or the interface you're
  about to write into `plan.md`, plus a sketch of the behaviour that sits behind it.
- **Its dependencies** — so you can classify them (in-process / local-substitutable / remote-but-owned /
  true-external) per `references/DEEPENING.md`.
- **`CONTEXT.md`** (repo-root glossary — its **`## Glossary`** section) for ubiquitous-language names, and
  **`docs/adr/`** for prior boundary decisions, so the interface you name is consistent with the project.

**Refuse to run if** there is no concrete candidate. You cannot design depth in the abstract — ask
`plan-breakdown` or the user to name the module and what sits behind it first.

## Process

1. **Name it in the vocabulary.** Write the module and its candidate interface using the Glossary terms
   below. The **interface** is everything a caller must know — signature *plus* invariants, ordering
   constraints, error modes, required config, performance characteristics — not just the type.
2. **Apply the deletion test.** Imagine deleting the module. If complexity vanishes, it was a pass-through;
   don't build it. If complexity reappears across N callers, it earns its keep. Write down what reappears.
3. **Push for depth.** Can I cut methods? Simplify params? Hide more behind the seam? (See *Deep vs
   shallow*.)
4. **Place the seam, classify dependencies.** Decide where the seam lives, then classify each dependency
   (in-process / local-substitutable / remote-but-owned / true-external) — `references/DEEPENING.md` gives
   the testing approach for each. Only define a port when **two** adapters are justified (prod + test).
5. **Design it twice for load-bearing interfaces.** For a high-stakes interface, spin up parallel
   sub-agents to produce radically different designs, then compare on depth / locality / seam placement —
   see `references/DESIGN-IT-TWICE.md`. Your first idea is unlikely to be the best.
6. **Land it in plan.md; promote durable boundaries to ADRs.** Write the resulting interface into
   `plan.md` under the slice that owns the module. If the boundary is **hard-to-reverse ∧ surprising ∧ a
   real trade-off**, record it as an ADR via `documentation-and-adrs` and reference it by id from
   `plan.md` — don't bury a durable decision in plan prose where the gate rubber-stamps it unseen.

## Glossary

Use these terms exactly — don't substitute "component," "service," "API," or "boundary." Consistent language is the whole point.

**Module** — anything with an interface and an implementation. Deliberately scale-agnostic: a function, class, package, or tier-spanning slice. _Avoid_: unit, component, service.

**Interface** — everything a caller must know to use the module correctly: the type signature, but also invariants, ordering constraints, error modes, required configuration, and performance characteristics. _Avoid_: API, signature (too narrow — they refer only to the type-level surface).

**Implementation** — what's inside a module, its body of code. Distinct from **Adapter**: a thing can be a small adapter with a large implementation (a Postgres repo) or a large adapter with a small implementation (an in-memory fake). Reach for "adapter" when the seam is the topic; "implementation" otherwise.

**Depth** — leverage at the interface: the amount of behaviour a caller (or test) can exercise per unit of interface they have to learn. A module is **deep** when a large amount of behaviour sits behind a small interface, **shallow** when the interface is nearly as complex as the implementation.

**Seam** _(Michael Feathers)_ — a place where you can alter behaviour without editing in that place; the *location* at which a module's interface lives. Where to put the seam is its own design decision, distinct from what goes behind it. _Avoid_: boundary (overloaded with DDD's bounded context).

**Adapter** — a concrete thing that satisfies an interface at a seam. Describes *role* (what slot it fills), not substance (what's inside).

**Leverage** — what callers get from depth: more capability per unit of interface they learn. One implementation pays back across N call sites and M tests.

**Locality** — what maintainers get from depth: change, bugs, knowledge, and verification concentrate in one place rather than spreading across callers. Fix once, fixed everywhere.

## Deep vs shallow

**Deep module** = small interface + lots of implementation:

```
┌─────────────────────┐
│   Small Interface   │  ← Few methods, simple params
├─────────────────────┤
│                     │
│  Deep Implementation│  ← Complex logic hidden
│                     │
└─────────────────────┘
```

**Shallow module** = large interface + little implementation (avoid):

```
┌─────────────────────────────────┐
│       Large Interface           │  ← Many methods, complex params
├─────────────────────────────────┤
│  Thin Implementation            │  ← Just passes through
└─────────────────────────────────┘
```

When designing an interface, ask:

- Can I reduce the number of methods?
- Can I simplify the parameters?
- Can I hide more complexity inside?

## Principles

- **Depth is a property of the interface, not the implementation.** A deep module can be internally composed of small, mockable, swappable parts — they just aren't part of the interface. A module can have **internal seams** (private to its implementation, used by its own tests) as well as the **external seam** at its interface.
- **The deletion test.** Imagine deleting the module. If complexity vanishes, it was a pass-through. If complexity reappears across N callers, it was earning its keep.
- **The interface is the test surface.** Callers and tests cross the same seam. If you want to test *past* the interface, the module is probably the wrong shape.
- **One adapter means a hypothetical seam. Two adapters means a real one.** Don't introduce a seam unless something actually varies across it.

## Designing for testability

Good interfaces make testing natural:

1. **Accept dependencies, don't create them.**

   ```typescript
   // Testable
   function processOrder(order, paymentGateway) {}

   // Hard to test
   function processOrder(order) {
     const gateway = new StripeGateway();
   }
   ```

2. **Return results, don't produce side effects.**

   ```typescript
   // Testable
   function calculateDiscount(cart): Discount {}

   // Hard to test
   function applyDiscount(cart): void {
     cart.total -= discount;
   }
   ```

3. **Small surface area.** Fewer methods = fewer tests needed. Fewer params = simpler test setup.

## Relationships

- A **Module** has exactly one **Interface** (the surface it presents to callers and tests).
- **Depth** is a property of a **Module**, measured against its **Interface**.
- A **Seam** is where a **Module**'s **Interface** lives.
- An **Adapter** sits at a **Seam** and satisfies the **Interface**.
- **Depth** produces **Leverage** for callers and **Locality** for maintainers.

## Rejected framings

- **Depth as ratio of implementation-lines to interface-lines** (Ousterhout): rewards padding the implementation. We use depth-as-leverage instead.
- **"Interface" as the TypeScript `interface` keyword or a class's public methods**: too narrow — interface here includes every fact a caller must know.
- **"Boundary"**: overloaded with DDD's bounded context. Say **seam** or **interface**.

## Rationalizations

- *"I'll design the interface once the code exists."* → The interface **is** the test surface. Designing
  it after the code means the tests already cross the wrong seam.
- *"Add the port now, we might need a second adapter later."* → One adapter = hypothetical seam =
  indirection. Wait for the second to actually exist.
- *"It's a small module, depth doesn't matter."* → Depth is leverage per unit of interface, independent of
  size. A small module with a needlessly large interface is still shallow.
- *"This boundary decision is fine left in plan.md prose."* → If it's hard-to-reverse, it belongs in an
  ADR, or it gets rubber-stamped unseen at the single Spec/Plan gate (D18).
- *"I'll just call it a component / service / boundary."* → Inconsistent vocabulary is the exact failure
  mode this skill exists to prevent. Use the Glossary words.

## Red flags — STOP

- You're **testing past the interface** (reaching into internal state) → the module is the wrong shape;
  reshape the seam, don't add a back door.
- The **interface is nearly as complex as the implementation** → shallow module. Deepen it or delete it.
- You introduced a **seam/port with exactly one adapter** → remove the indirection until a second adapter
  is real.
- You're measuring **depth as impl-lines ÷ interface-lines** → rejected framing (rewards padding the
  implementation); use depth-as-leverage.
- A **hard-to-reverse boundary** is sitting only in `plan.md` prose → promote it to an ADR before the gate.

## Verification (ending criteria)

- Each module's interface is written into `plan.md` in the suite vocabulary, as the **full contract**
  (signature + invariants + ordering + error modes + performance), not just a type signature.
- Every candidate passed the **deletion test**, with the reappearing complexity documented.
- Every seam has **≥2 justified adapters**, or it isn't a seam (the indirection was removed).
- Dependencies are **classified** and the cross-seam testing approach is stated (replace, don't layer).
- **Hard-to-reverse boundaries** are captured as ADRs via `documentation-and-adrs` and referenced by id
  from `plan.md`.

## Outputs & handoff contract

- **Emits:** deep-module **interfaces in `plan.md`** (under the slice/step that owns the module) — the
  registry artifact for this discipline. There is **no standalone artifact** and **no `STATE.md` row
  transition**: this is a referenced discipline (D23), not a slice.
- **Stable surface `plan-breakdown` consumes:** for each module, the interface description (signature +
  invariants + ordering + error modes + performance) and its seam/adapter plan (dependency category +
  prod/test adapters).
- **Hard-to-reverse decisions** → `docs/adr/ADR-<NNN>-<slug>.md` via `documentation-and-adrs`; `plan.md`
  references them by id. "Change the shape → update the referrer in the same commit" extends to ADRs.
- **Going deeper (carried references, D28):** deepening a cluster given its dependencies →
  `references/DEEPENING.md`; exploring alternative interfaces with parallel sub-agents →
  `references/DESIGN-IT-TWICE.md`. `SKILL.md` points to both.
