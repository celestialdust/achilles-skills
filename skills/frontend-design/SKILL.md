---
name: frontend-design
description: Use whenever you build or reshape ANY UI surface — a page, screen, component, or flow. Explore throwaway variants, commit ONE high-fidelity prototype as the reference-spec build target, and write the signed design contract that Verify grades against. Invoke BEFORE any production UI; don't reach for a cream-serif-terracotta default.
---

# Frontend Design

## Purpose
**Stage: Spec (UI only).** This is the ONE skill that owns the UI. It does two things with a single
thesis: it **explores** throwaway variants to answer "what should this look like," then **commits ONE
high-fidelity prototype** = the reference-spec build target production re-implements — and writes the **design contract** that records the aesthetic
decisions in durable form. The same design thesis that authors the prototype here supplies the grading rubric
`quality-verification` uses in Verify: one mind writes the UI and checks the UI. Approach this as the design lead
at a small studio known for giving every client a visual identity that could not be mistaken for anyone
else's — make deliberate, opinionated choices about palette, typography, and layout specific to this brief,
and take one real aesthetic risk you can justify.

## When to use / when to skip
- **Use** when `prd.md` describes a feature with a **UI surface** (a page, screen, component, or flow) and
  the look is not already fully pinned. This runs in Spec, after `to-prd`, and **before
  `acceptance-criteria` and `environment-manifest` run** — not merely before they are signed. Exploring an
  interface surfaces behaviour a `prd.md` omits (the empty state, the failed save), and that has to reach
  `acceptance.md` while it is being written rather than after it exists.
- **Skip** when the feature has **no UI** (a pure API, a CLI, a data pipeline) — then there is no design
  contract and `quality-verification` runs no design gate. Skip the *exploration* phase (go straight to commit) when the brief
  already pins the visual direction exactly — the brief's own words always win, including when it asks for a
  look you'd otherwise call a default.
- **depth: lite** — a tiny, low-stakes surface (one isolated component, an internal tool) may collapse to a
  single committed prototype + a 3-line contract; say so at the top and keep the rubric axes, just terse.

## Inputs
- **`prd.md`** (from `to-prd`) — read `Solution` and `User Stories` for what the surface must do and for whom;
  read `Out of Scope` for what NOT to design. **Refuse to run** if `prd.md` is absent (nothing to design
  against). `prd.md` carries no file paths or signatures by contract, so design freely.
- **`intent.md`** (optional, from `interview-me`) — `Outcome · User · Why` ground the subject. If memory holds
  the human's preferences or prior designs, use them as a hint.
- **`docs/design.md`** (read it if the repo has one) — the repository's **decided look**, written by the
  first UI surface built here. Present, it is this surface's starting point and the contract records only
  what differs from it; absent, this is the first surface and it writes the file (Phase 0.5). Never a
  refuse-to-run: a repo with no user interface has none.
- If `prd.md` describes **no UI surface**, emit nothing and hand back "no UI — skip frontend-design."

## Process: explore throwaway variants → commit ONE prototype + write the contract

### Phase 0 — Ground it in the subject
If the brief doesn't pin down what the product/subject is, pin it yourself: name one concrete subject, its
audience, and the page's single job, and state your choice. The subject's own world — its materials,
instruments, artifacts, vernacular — is where distinctive choices come from. Build with the brief's real
content throughout.

### Phase 0.5 — Inherit the decided look
Read `docs/design.md` — the repository's **decided look**: palette, type, layout language, motion posture,
signature vocabulary. Its shape, and the contract's, are in `../../references/design-system-format.md`.

- **It exists** → the look is already decided and it is your starting point. Exploration runs *inside* it:
  variants differ in structure, information hierarchy, and the signature element — never in palette or
  type. Re-opening those on surface two is how a repo ends up with three looks that disagree and no way to
  say which one is right.
- **It does not exist** → this is the repository's first UI surface. Design it with nothing to inherit
  (Phases 1–3 as written), then, once the direction is committed in Phase 3, write `docs/design.md` from
  what was decided. Nothing scaffolds that file; a repo with no user interface simply has none, and that
  is correct rather than missing.

Either way this surface's contract records only what differs (Phase 4).

### Phase 1 — Explore with the visual companion (default)
When "what should this look like" is genuinely open, explore with the **visual companion** — the default
mechanism. Start it with `scripts/start-server.sh --project-dir . --open`; it prints a `server-started` JSON
line with a keyed `url`. Write **several structurally-different** mockup screens into its content dir, and the
human's **browser auto-opens** to the first one (it then shows the newest screen each time you write one).
When auto-open isn't possible — headless or remote — **share the printed URL** so the human opens it manually;
the companion works identically either way. It works **greenfield**, before any app or framework exists (no
running app needed). Default to **3** variants; cap at 5 (more stops being radically different). Variants must
be structurally different — different layout, information hierarchy, primary affordance — not three recolored
card grids.

Offer the companion **just-in-time and per-question**: a *visual* layout/look question goes to the browser; a
*textual* clarifying question (scope, terminology, a tradeoff) stays in the **terminal** — don't push the human
into the browser for words. The interesting feedback is usually "the header from B with the sidebar from C" —
that's the actual design; do most of this iteration in your own thinking and only surface ideas you have high
confidence will delight. **Exploration is scratch you discard** — throwaway screens stay in the gitignored
`.frontend-design/` working dir; only the agreed mockup survives (committed in Phase 3). See
`references/visual-companion.md` for the operating detail (start / loop / read-events / stop).

When the target app **already exists** and the design judgment depends on **real in-app data and density**,
escalate to the in-app `?variant=` switcher (see `references/exploring-variants.md`) so variants butt up
against the real header/sidebar/data rather than looking fine in a vacuum.

**Design evidence, when the repo already has some.** Some repos carry a **design evidence source** — a
local, queryable record of design material this project already trusts: a component inventory, a token
export, a screenshot library, a published style reference. Like the browser engine
`browser-testing-with-devtools` drives, this is a *capability*, not a product: whichever one the repo has
configured is the one you use.

**Present means already in front of you** — a server your tool has already connected for this session, or
a path this repository already holds. Reading what you already have is not probing; probing is going out
to find, install, or ask for one. There is no other way for a source to become available to you here, and
no step that establishes one.

Where one is present, draw the options you offer from it — candidate palettes, type pairings, component
precedents already in use — instead of inventing them, and carry the same evidence into the Phase 2 token
plan. **The brief still decides.** A suggestion that contradicts the brief is not taken, and it is not
evidence that the brief is wrong.

Where none is present, design the surface exactly as you would if such a thing had never existed. There is
nothing to check for, nothing to install, nothing to report, and no step here that can fail. Do not record
its absence in the contract, and do not raise it with the human: a repo that has never had one is the
ordinary case, not a gap. It is also **not an `environment.md` row** — `environment-manifest` files what
the run *needs*, and `preflight-readiness` refuses a wave over a missing row. This is something the run
uses when it happens to be there.

### Phase 2 — Plan the design (two-pass)
First, brainstorm a compact **token system** for the chosen direction:
- **Color** — the palette as 4–6 named hex values.
- **Type** — typefaces for 2+ roles (a characterful display face used with restraint, a complementary body
  face, a utility face for captions/data if needed); a clear type scale with intentional weights, widths,
  spacing.
- **Layout** — a layout concept in one-sentence prose + ASCII wireframes to compare.
- **Signature** — the single unique element this page will be remembered by, embodying the brief.

Then **review the plan against the brief before building**: if any part reads like the generic default you'd
produce for any similar page (work through a similar prompt to see if you land somewhere similar) rather than
a choice made for THIS brief — revise it, and say what you changed and why. Only after confirming relative
uniqueness do you write code, deriving every color and type decision from the revised plan.

### Phase 3 — Commit ONE high-fidelity prototype (the reference-spec mockup)
Build the chosen direction to a real quality floor — this committed prototype is the **reference-spec build
target that production re-implements**: the design source-of-truth Verify grades fidelity against, not a
throwaway, and not shipped code itself (production re-implements it in the target's real stack — the
degenerate exception is a target that genuinely is static HTML). It is the single mockup the human agreed on
in the **visual companion** (Phase 1), now promoted to the committed
`docs/features/<slug>/prototype/index.html`; the companion's throwaway *screens* are discarded, this one
mockup survives. When writing CSS, watch selector specificity: type-based (`.section`) vs
element-based (`.cta`) selectors easily cancel each other out, especially section paddings/margins. Critique
your own work as you build — take screenshots if your environment supports it (a picture is worth 1000
tokens). Apply Chanel's rule: before you ship it, remove one accessory.

### Phase 4 — Write the design contract
Record the locked decisions as the **design contract** (see the sections below), `status: draft` — the seven
rubric axes plus the **`## Prototype`** section that names the committed reference-spec mockup and its fidelity
bar. Design lives in two files, not one: this contract decides this surface, and for an axis it marks
inherited, `docs/design.md` decides it. None of it goes into `acceptance.md`. The human signs the contract
at the Spec gate (`status: signed`).

**In a repo with a decided look, the contract records only the delta.** Each of the seven axes carries
exactly one line — `inherits: docs/design.md`, a `delta:` saying what this surface fills in, or
`departs: docs/design.md` where it contradicts the decided look — never two, never none. That file decides
four of the seven, so `Quality floor`, `Restraint`, and `Copy-as-design-material` always carry a `delta:`.
An inherited axis is **not** restated: a second copy of a decision is a copy that can disagree with the
first, and a reviewer then has no way to tell which one is stale. `## Prototype` is always filled in full
(it is per-surface and never inherited). The exact shape is in
`../../references/design-system-format.md`. Where the repo has no `docs/design.md`, state all seven axes
here as before — there is nothing to inherit.

## Design rubric (= the design contract's seven rubric sections AND the Verify grading axes)
These seven axes are written here in Spec and **re-read by `quality-verification` in Verify**: quality-verification grades the built UI
against (i) fidelity to this committed prototype and (ii) these axes. Every one carries a line in the
contract — the single line Phase 4 describes, which for an inherited axis is the pointer, not a restatement.

1. **Distinctiveness / not-an-AI-default.** The hero is a thesis: open with the most characteristic thing in
   the subject's world (headline, image, animation, live demo, interactive moment). *Calibration:* AI-generated
   design right now clusters around three looks — (a) warm cream background (~#F4F1EA) + high-contrast serif
   display + terracotta accent; (b) near-black background + one bright acid-green/vermilion accent; (c)
   broadsheet layout with hairline rules, zero border-radius, dense newspaper columns. All are legitimate for
   *some* briefs, but they appear regardless of subject. Where the brief leaves an axis free, don't spend that
   freedom on a default. Name which (if any) you used and why it's a choice, not a reflex.
2. **Typography carries personality.** Pair display + body faces deliberately — not the families you'd reach
   for on any project. Make the type treatment a memorable part of the design, not a neutral delivery vehicle.
3. **Structure is information.** Numbering, eyebrows, dividers, labels must encode something true about the
   content, not decorate it. Numbered markers (01/02/03) are only right if the content actually is a sequence.
   Question every structural device before using it.
4. **Motion, deliberate.** Decide where/if animation serves the subject (page-load sequence, scroll reveal,
   hover micro-interactions, ambient atmosphere). An orchestrated moment lands harder than scattered effects;
   sometimes less is more — extra animation reads as AI-generated.
5. **Quality floor (the objective subset).** Responsive down to mobile · visible keyboard focus · reduced
   motion respected. Build to it without announcing it. (This trio is the accessibility floor `quality-verification` can check
   objectively.)
6. **Restraint / one signature.** Spend your boldness in one place; let the signature element be the one
   memorable thing and keep everything around it quiet. Match complexity to the vision — maximalist needs
   elaborate execution, minimal needs precision. Cut any decoration that doesn't serve the brief.
7. **Copy as design material.** Words exist to make the design easier to understand and use — design material,
   not decoration (see the writing section below).

## The contract's `## Prototype` section (the reference-spec mockup)
Alongside the seven rubric axes, the design contract carries one more stable section, **`## Prototype`**. It
names the committed **reference-spec mockup** and the bar Verify grades fidelity against:

```md
## Prototype
- path: `docs/features/<slug>/prototype/index.html` (committed in the TARGET project) — a reference spec, NOT shipped code
- meaning: production **re-implements** this mockup in the target's real stack; the HTML mockup itself never
  ships (degenerate exception: a target that genuinely is static HTML).
- fidelity bar: <what "looks like what we agreed" means for THIS surface — the concrete things the built UI
  must match>
```

The single mockup the human agreed on in the visual companion (Phase 1) is the one promoted here to the
committed `prototype/index.html`; the companion's throwaway *screens* are discarded. `quality-verification`
reads this section in Verify to locate the mockup and grade the built UI's fidelity against it.

## The contract's `## Departure` blocks (when a surface moves away from the decided look)

A **delta** fills in something `docs/design.md` leaves to each surface. A **departure** contradicts
something it already decided. The two are graded differently, so they are written differently: the axis
carries `departs: docs/design.md`, and the departure gets its own heading in the contract, next to the axis
it moves, naming what the decided look says, what this surface does instead, and why. The block's shape is
in `../../references/design-system-format.md`.

- **The reason is not optional.** Without it nobody can tell a decision from a drift, and
  `quality-verification` records a departure with no reason as a finding.
- **Never file a departure as a plain `delta:`.** That presents the move as though the decided look had
  said this all along — the one thing a departure must not do. `departs:` is the axis line that sends a
  reader to the block. A built surface that departs with nothing recorded is a `quality-verification`
  finding too.
- **A departure never edits `docs/design.md`.** Moving the whole repository's look is a deliberate act by a
  surface that means to move it, signed with that surface's contract — not a side effect of one screen
  needing something else.

## More on writing in design
Bring the same intentionality to copy as to spacing and color. Write from the end user's side of the screen:
name things by what people control and recognize, never by how the system is built (a person manages
notifications, not webhook config). Use active voice — a control says exactly what happens ("Save changes,"
not "Submit"); an action keeps its name through the whole flow (a "Publish" button produces a "Published"
toast). Treat failure and emptiness as direction, not mood: errors explain what went wrong and how to fix it,
in the interface's voice, never apologizing or vague; an empty screen is an invitation to act. Keep the
register conversational and tuned — plain verbs, sentence case, no filler. Let each element do exactly one job.

## Rationalizations
- *"The brief didn't pin a direction, so I'll go cream + serif + terracotta — it always looks clean."* → That
  is exactly an AI default (cluster a). Free axes are where you make a CHOICE for this brief, not where you
  spend the freedom on a reflex.
- *"Three variants is overkill, I'll just style the obvious card grid."* → Then you skipped exploration. If
  the look is genuinely open, structurally-different variants are how you find the non-obvious answer; "three
  tweaked card grids isn't a prototype, it's wallpaper."
- *"I'll put the accessibility/responsive requirements in acceptance.md so quality-verification tests them."* → No. Design
  floors live in this contract and, for an axis it marks inherited, in `docs/design.md`; `acceptance.md` is
  behavioral-only. quality-verification reads both for the design gate.
- *"The exploration variants are good code, I'll keep them around."* → Exploration is throwaway. The throwaway
  *screens* live in the gitignored `.frontend-design/` working dir and are discarded; only the one agreed
  mockup survives — promoted to the named, committed **reference-spec mockup**
  `docs/features/<slug>/prototype/index.html`, not rewritten from memory. (The `?variant=` switcher is the
  escalation path, not a committed artifact.)
- *"Not taking a risk is the safe move."* → Not taking a risk is itself a risk; the client already rejected
  templated proposals.
- *"The repo has a `docs/design.md`, but this surface deserves its own palette."* → Then it is a
  **departure**: name what you are moving away from and why, in its own block. A palette changed quietly is
  not a design decision, it is a repo with two looks and no record of which one won.
- *"`docs/design.md` already says it, but I'll restate it in the contract so the contract stands alone."* →
  That is the second copy. Mark the axis `inherits: docs/design.md`; `quality-verification` reads both
  files and grades the inherited axes from the one that decides them.
- *"No design evidence source is configured — I should flag that before designing."* → There is nothing to
  flag. It is optional by construction: design the surface as though such a source had never existed.

## Red flags
- Variants that differ only in color or copy (a tweak, not a prototype — real variants disagree about
  structure).
- Landing on one of the three AI-default clusters on a free axis without a stated reason.
- Numbered markers / eyebrows / dividers used as decoration on content that isn't actually a sequence.
- Design requirements written into `acceptance.md` instead of the contract.
- Shipping an exploration screen — or the committed reference-spec mockup HTML itself — straight to
  production. Throwaway screens are discarded; the committed mockup is a reference spec that production
  **re-implements** in the real stack (it is not itself shipped, except a genuinely static-HTML target).
- Two or more competing "signature" elements (boldness not spent in one place).
- A design contract missing any of the seven stable sections **or the `## Prototype` section**, or with the
  quality-floor trio unaddressed.
- Re-opening the palette or the type in a repo that already has a `docs/design.md` — that look is decided;
  variants differ in structure.
- A contract that restates an axis `docs/design.md` already decides, instead of marking it inherited.
- An `inherits:` or `departs:` line on `Quality floor`, `Restraint`, or `Copy-as-design-material` —
  `docs/design.md` decides none of the three, so that line sends Verify to a file holding nothing for
  the axis and the axis goes ungraded.
- A surface that moves away from the decided look with no `## Departure` block, or a block with no reason.
- Probing for a design evidence source, requiring one, or reporting that none is installed.

## Verification (ending criteria)
Done when ALL hold:
- Exactly **ONE** high-fidelity prototype is committed as the **reference-spec mockup** at
  `docs/features/<slug>/prototype/index.html` (the throwaway companion *screens* discarded from the gitignored
  `.frontend-design/` working dir; the `?variant=` switcher is the escalation path now, not a committed
  artifact); it runs and meets the quality floor (responsive · visible focus · reduced motion).
- A **design contract** exists addressing all seven stable sections (`Distinctiveness · Typography ·
  Structure-as-information · Motion · Quality floor · Restraint · Copy-as-design-material`) **plus the
  `## Prototype` section naming the committed reference-spec mockup**, `status: draft`, naming which AI-default
  cluster (if any) was used and why it's a choice. In a repo with a `docs/design.md`, every axis carries
  exactly one of `inherits: docs/design.md`, a `delta:` line, or `departs: docs/design.md`, and no
  inherited axis is restated — with `Quality floor`, `Restraint`, and `Copy-as-design-material` on a
  `delta:`, because that file decides none of the three, so `inherits:` there points at nothing and
  `departs:` has nothing to depart from. Without a `docs/design.md`, every axis is stated in full.
- Every axis this surface moves away from the decided look on reads `departs: docs/design.md` and has a
  `## Departure` block carrying its reason; none of those moves is filed as a plain `delta:`.
- If this was the repository's **first** UI surface, `docs/design.md` now exists and holds the
  repository-level decisions (palette · type · layout language · motion posture · signature vocabulary) and
  nothing that belongs to this one screen.
- **Neither the contract nor the handoff reports a design evidence source that is not there.** Its absence
  is the ordinary case, so there is nothing to record — a note saying one was missing is the defect this
  criterion catches.
- **No** design content leaked into `acceptance.md` (behavioral-only). Design lives in the contract and,
  for the axes it marks inherited, in `docs/design.md` — never in `acceptance.md`.
- The contract is a **separable artifact** `quality-verification` can re-read cold in Verify (where the design gate binds).
- Handed to the human for sign-off at the Spec gate; on sign-off `status: signed`. (`quality-verification`
  refuses an unsigned or absent contract.)

## Outputs & handoff contract
- **Emits:** (1) a committed high-fidelity prototype = the **reference-spec build target that production
  re-implements**, at `docs/features/<slug>/prototype/index.html`; (2) the **design contract** — the
  signed Spec artifact a UI feature adds to the bundle — written to `docs/features/<slug>/design-contract.md`;
  (3) `docs/design.md`, the repository's decided look, **when this is the repo's first UI surface** or when
  this surface deliberately moves the whole look. Shape: `../../references/design-system-format.md`. Every
  other surface reads that file and writes none of it.
- **Stable sections** (consumers depend on these names): `Distinctiveness · Typography ·
  Structure-as-information · Motion · Quality floor (responsive/visible-focus/reduced-motion) · Restraint ·
  Copy-as-design-material · Prototype (the committed reference-spec mockup + its fidelity bar)`; each of
  the seven carrying one of `inherits:` / `delta:` / `departs:` where the repo has a `docs/design.md`, and
  `Quality floor` · `Restraint` · `Copy-as-design-material` always a `delta:` because that file decides
  none of the three; plus `status: draft|signed`, and one `Departure — <axis>` block per axis reading
  `departs:`. Change a section's shape → update `quality-verification`'s design-gate reader in the same commit.
- **Consumed by:** `quality-verification` (Verify design gate: reads the `## Prototype` section to locate the
  committed reference-spec mockup and grades the built UI's fidelity against it, plus these seven axes —
  reading an axis marked `inherits:` from `docs/design.md`, and grading each `## Departure` block), and
  gating `quality-verification` (refuses to run against an unsigned/absent contract).
- **Re-invalidation rule:** what a later edit un-signs — including an edit to `docs/design.md`, which
  reaches every contract carrying an inherited axis it touched — is stated once, in `docs/workflow.md`'s
  *What an edit un-signs*. Name the affected contracts in this surface's handoff and flip each one.
- **STATE.md:** the feature stays in `spec`; set `gate: you` so the human signs prd + acceptance +
  environment + (this) design contract together at the single Spec sign-off — plus architecture where the
  feature added a module, added a dependency between parts that already exist, or introduced a seam, which
  is not every feature. `docs/workflow.md` states which artifacts the gate covers; read the bundle from
  there rather than from this list, which names only what this surface contributes to it. Intent was signed
  earlier, at the Ideate gate. No slice rows yet (slices are born in Plan).
