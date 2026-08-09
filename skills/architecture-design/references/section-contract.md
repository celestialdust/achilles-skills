# The structure artifact — section contract

The shape of what `architecture-design` writes. Read this before writing one; `SKILL.md` carries the
method, this file carries the format.

**The eight headings and their order are fixed**, unlike the `SKILL.md` envelope where only the order is.
A person signing reads them in this order, and `spec-review` finds a section by name. Number them as
below.

Two files share the shape. `ARCHITECTURE.md` states the repository — every module, every edge, the layer
order if one was decided. A feature's `docs/features/<slug>/architecture.md` states only its **delta**:
what this feature changes about the structure, against the repository map that already exists. The
sections are the same; the scope is not.

## The header block

Open the file with a fenced block, before §1:

```
feature:  <slug>
inherits: ARCHITECTURE.md
status:   unsigned
reads:    acceptance.md · research.md · prd.md · docs/adr/
```

`inherits:` reads `ARCHITECTURE.md — not yet written; this feature writes it` when this is the first
structure pass in the repository. `status:` is `unsigned` until a person flips it, and nothing an agent
does flips it — the signature is the whole point of the artifact.

`ARCHITECTURE.md` carries the same block without `feature:` and without `inherits:`.

## The eight sections

### `## 1. Scope`

Prose. What this feature changes about the structure, what it removes, and what it leaves alone. Name the
structural question the feature answers — everything below is placed by that answer rather than by topic,
and a reader who cannot see the question cannot tell whether a module is in the right place.

State plainly when the feature changes no structure. A short §1 that says so is a signable answer; an
inflated one is not.

### `## 2. Modules`

| Module | Responsibility — its one reason to change | Layer | New |
|---|---|---|---|

One row per unit with a single reason to change. `Layer` is the tier from §3, or `—` where the repository
has decided no order. `New` is a column rather than a sentence because "which parts of the system are
new" is the first thing the person at the gate has to answer, and a column answers it without reading.

Follow the table with a **`Not modules.`** paragraph naming what a reader would expect to find here and
why it is absent — an existing component this feature only calls, a discipline that emits into another
artifact. A reader cannot derive an omission from a list.

### `## 3. Layers and edges`

The dependency edges this feature adds between parts that already exist.

| From | To | Why this edge exists | Decision |
|---|---|---|---|

Every edge cites the recorded decision it rests on — an id from §6, or an `ADR-NNN` under `docs/adr/`. An
edge with an empty `Decision` cell is an edge nobody chose, which is the thing this artifact exists to
surface rather than to carry.

Then **`Edges a reader might expect and that do not exist:`** — a short list, each with its reason. An
absent edge is invisible in a table of present ones, and "the rules never read the memory" is exactly the
kind of constraint a later diff breaks by accident.

Where the repository has decided a layer order, state it above the table and say which edges the order
permits. Where it has not, see [Where no layer order is decided](#where-no-layer-order-is-decided) below,
which is the harder case and the one most repositories are in.

### `## 4. Seams`

Where an implementation can be swapped without its callers knowing.

| Adapter | When | Who does the work |
|---|---|---|

**A seam with one adapter is indirection, not a seam.** Name the second adapter or drop the row — a
single-implementation interface adds a hop and buys nothing, and calling it a seam hides that.

Say which seams already existed and which this feature introduces. A seam usually exists because
something went wrong once; when it does, say what, because the next reader will otherwise remove it.

### `## 5. Data flow, per signed scenario`

| Scenario | Behaviour | Path |
|---|---|---|

One row per **signed scenario in `acceptance.md`, keyed by its id**. `Path` names the §2 modules in the
order they act, joined with `→`.

**Set equality is the check:** every signed scenario id appears exactly once here, and every row here
names a signed scenario. Not a read-through — take the ids out of both files and compare the sets.

This section is why the skill runs after `acceptance-criteria` and not before. A path traced against
scenarios that can still move traces a contract that may not survive, and the person signing the
structure would be signing against a moving target.

### `## 6. Decisions`

| # | Chosen | Rejected | Why | ADR |
|---|---|---|---|---|

Every decision that shaped §2, §3, or §4. **`Rejected` is not optional** — a decision with no rejected
alternative was not a decision, and a reader who cannot see what was ruled out cannot tell a choice from
a default. `Why` gives the reason, not the restatement.

`ADR` points at the record under `docs/adr/` when the decision is hard to reverse. `documentation-and-adrs`
owns that format; do not invent a second one here.

### `## 7. Invariants`

Rules a diff can violate.

| # | Invariant | Checked today by | Would be enforced by |
|---|---|---|---|

Two columns, deliberately. Most invariants are checked today by a person reading a diff, and writing that
down is honest where naming a hypothetical test is not. `Would be enforced by` is what a later pass would
promote, and it is filled at write time — an invariant that does not name its own guard cannot be promoted
later without re-deriving it.

**An invariant checked by nothing says `nothing`** and stays in the table. That row is the one a reader
most needs, and deleting it to make the column look complete removes the only warning there was.

### `## 8. Open questions for the human`

Numbered. Each states the question, then a **recommended** answer with one sentence of reasoning.

These are what the person answers at the gate, so each has to be answerable without opening a skill. A
first structure pass with an empty §8 usually means the questions were answered silently — which is the
failure this artifact exists to stop, one indirection removed.

## Where no layer order is decided

Most repositories the suite installs into have never decided a layer order. §3 then has one job: **record
what the code does today, and say that nothing has been decided.**

- Write `layer order: not decided` above the table, in those words, so the phrase is greppable.
- Fill the table from `research.md` only. Every edge is one the survey found in the code as it stands,
  and `Why this edge exists` says where it was found rather than why it ought to.
- Set `Layer` in §2 to `—` for every module. Numbering modules into tiers is deciding the order.
- **Propose nothing.** No "should", no "target state", no diagram with tiers, no row ordering that implies
  one.
- If the feature cannot proceed without an answer, that is a §8 question for the person at the gate.

A reader has to be able to tell **what the code does** from **what a diff is permitted to do**. Where no
order is decided, the second is empty, and §3 says so rather than leaving the first to be read as both.

An architecture document that quietly invents a layering is worse than none, because the next feature
inherits an order nobody chose and nobody can point at who chose it.

### What a later feature does with those rows

When `ARCHITECTURE.md` says `layer order: not decided`, its §3 rows are **observations, not permission.**

- A later feature's `architecture.md` records its own edges the same way, from its own `research.md`.
- It does not read the recorded set as the set it may add to, and it does not read an absent edge as
  forbidden. Neither reading is available from an observation.
- Deciding the order is its own decision. It goes through `spec-grilling` into a record under `docs/adr/`,
  and a person signs it. A feature that settles the order while writing its own structure has made the
  repository's constitution a side effect of one feature's spec.
- Until someone decides, every feature's §3 carries the same `layer order: not decided` line.

## The page

`docs/features/<slug>/architecture.html` is hand-authored, committed next to the markdown, and read by the
person at the gate.

**Self-contained, with no external requests.** Inline the CSS and any script, embed images as `data:` URIs,
use system font stacks. A colleague who clones the repository months later and opens the file with the
network off sees the same page. One remote font makes the artifact depend on a host nobody in the
repository controls.

**Theme-aware.** Define the light palette on bare `:root`, redefine the same tokens under
`@media (prefers-color-scheme: dark)` guarded as `:root:not([data-theme="light"])`, and again under
`:root[data-theme="dark"]`. Give `body` an explicit background token.

**It embeds `architecture.md` verbatim**, in a collapsed source block:

```html
<details>
  <summary>Source — <code>architecture.md</code>, embedded verbatim</summary>
  <div><pre id="src-out"></pre></div>
</details>

<script id="src-md" type="text/markdown">…the file's bytes…</script>
<script>
  document.getElementById('src-out').textContent =
    document.getElementById('src-md').textContent.replace(/^\n/, '');
</script>
```

**Splice the block from the file. Do not retype it.** Read `architecture.md` and place its bytes between
the tags: the opening tag is immediately followed by the file's first byte, and the closing tag
immediately follows its last. Do not reflow, do not re-wrap a long line, do not fix a typo on the way
through — correct the typo in `architecture.md` and splice again.

Retyping is the whole reason the block exists. Two hand-authored copies of one fact drift, and an embedded
copy that was typed rather than spliced drifts on its first character while looking exactly like one that
was not.

One constraint the embedding puts on the markdown: `architecture.md` must not contain the literal string
`</script>`, which would end the block early and make the comparison below report drift that is not drift.
If a code fence needs it, split the token.

## The comparison check

The page cannot silently disagree with its source, and the way that is known is a **comparison, not an
inspection** — reading a page and its markdown side by side is how "38 skills" and "39 skills" both looked
right at the same byte count.

Compare the embedded block to the file byte for byte. Three outcomes, and the third has to be
distinguishable from the second, because "the page is stale" and "the page has no source block" are
different defects with different fixes:

| Exit | Means | Fix |
|---|---|---|
| `0` | the block is byte-identical to the file | nothing |
| `1` | the block is present and drifted | re-splice from `architecture.md` |
| `2` | there is no block at all | the page is not conforming; add it |

```bash
python3 - docs/features/<slug>/architecture.md docs/features/<slug>/architecture.html <<'PY'
import pathlib, re, sys
md = pathlib.Path(sys.argv[1]).read_text()
html = pathlib.Path(sys.argv[2]).read_text()
m = re.search(r'<script id="src-md" type="text/markdown">(.*?)</script>', html, re.S)
if not m:
    print("FAIL: no embedded source block"); sys.exit(2)
if m.group(1) != md:
    print(f"FAIL: drift — embedded {len(m.group(1))} B vs file {len(md)} B"); sys.exit(1)
print("PASS: embedded block byte-identical"); sys.exit(0)
PY
```

Run it against a deliberately drifted copy once before you trust it. A check you have only ever watched
pass is not known to work, and this repository has shipped one that passed over the exact condition it
existed to prevent.
