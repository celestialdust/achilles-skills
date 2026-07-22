# Comprehension workspace format

The single source of truth for the on-disk shape of a **comprehension workspace** — the per-target-repo
home where the comprehension toolkit keeps a learner's state. Both toolkit skills point here so they
interoperate without re-specifying anything: `literate-explainer` writes the **explainer manifest** and
the **learner glossary**; `comprehension-quiz` writes the **learning ledger**; every progress measure is
*derived by joining* those surfaces at read time. This file is the mechanical spec for all of it:
placement, key normalization, the single-writer surfaces, and the derive-never-store rule.

## Workspace home and layout

State lives at `~/.achilles/comprehension/` — outside every **target repo**, so employer repos and OSS
clones are never touched. One directory per **repo key**, plus a root `index.md` routing
table:

```
~/.achilles/comprehension/
├── index.md                               root routing table (key → origin)
├── github.com__example-org__widget-store/
│   ├── ledger.jsonl                       learning ledger    ← comprehension-quiz
│   ├── manifest.jsonl                     explainer manifest ← literate-explainer
│   ├── glossary.md                        learner glossary   ← literate-explainer
│   └── 2026-07-18-checkout-tax.html       a teaching artifact ← literate-explainer
└── local__home-dev-projects-notes-cli/
    └── …
```

Teaching artifacts sit beside the surfaces in the same key directory (explainer-owned); their filename is
`<date>-<subject-slug>.<html|md>`, unique per emission, and is the join key below.

## Root index.md — the routing table

Plain text, one line per key, hand-auditable and hand-repairable:

```
github.com__example-org__widget-store → https://github.com/example-org/widget-store
local__home-dev-projects-notes-cli → /home/dev/projects/notes-cli
```

Either skill appends a `key → origin` line the first time it creates a workspace; if the key is already
present it writes nothing. Append-only and idempotent-by-key, so it is the one file both skills may
touch safely (see Append-only discipline).

## Repo-key derivation

The key is deterministic, so any clone or worktree of the same target repo resolves the same workspace. From `git remote get-url origin`:

1. If the URL is scp-like (`[user@]host:path`, no `://`), read the part before the first `:` as the host
   and the part after as the path. Otherwise strip the scheme (`https://`, `http://`, `ssh://`,
   `git://`, `git+ssh://`).
2. Strip any `user[:pass]@` credentials before the host, and any `:port` after it.
3. Lowercase the host.
4. Strip a trailing `.git` and any trailing `/`.
5. Split host + path on `/`, drop empty segments, join all segments with `__`.

So both `https://github.com/example-org/widget-store.git` and `git@github.com:example-org/widget-store.git`
collapse to `github.com__example-org__widget-store`.

**Fallback — no `origin` remote**: take the absolute path of the repo's *main* working tree
(the parent of git's common dir, so linked worktrees of the same repo still share it), lowercase it,
replace each run of non-`[a-z0-9]` with `-`, trim, and prefix `local__`:
`/home/dev/projects/notes-cli` → `local__home-dev-projects-notes-cli`. The `local__` prefix keeps
remote-less keys visually distinct from origin-derived ones.

## The three surfaces

Each is append-only; a write adds one line (or, for the glossary, one block) and never rewrites existing
content. None of them stores a question's text or its answer — only concepts and grades — so state never
leaks what a quiz will ask. Grade domain: `pass` | `partial` | `fail`.

**`ledger.jsonl`** — learning ledger, one JSON line per quiz session. `mode` is `diff` or
`codebase` (matching the explainer session the quiz followed) or `requiz` for a standalone
requiz. `artifact` names the manifest entry this session followed, or is omitted for a
**requiz**:

```json
{"date":"2026-07-18","mode":"diff","subject":"feat/checkout-tax branch","artifact":"2026-07-18-checkout-tax.html","questions":[{"concept":"idempotency key","grade":"pass"},{"concept":"tax rounding rule","grade":"fail"}],"outcome":"completed"}
```

**`manifest.jsonl`** — explainer manifest, one JSON line per emitted explainer:

```json
{"date":"2026-07-18","mode":"diff","subject":"feat/checkout-tax branch","artifact":"2026-07-18-checkout-tax.html","concepts":["idempotency key","tax rounding rule","order state machine"]}
```

**`glossary.md`** — learner glossary, one `## <durable concept>` heading + a plain-language definition per
term. New terms are appended; existing entries are preserved verbatim:

```markdown
## idempotency key
A client-supplied token that makes a retried checkout collapse to one order instead of charging twice.
```

## Single-writer table

| Surface | Sole writer | Everyone else |
|---|---|---|
| `ledger.jsonl` (learning ledger) | `comprehension-quiz` | read-only |
| `manifest.jsonl` (explainer manifest) | `literate-explainer` | read-only |
| `glossary.md` (learner glossary) | `literate-explainer` | read-only |
| `index.md` (root routing table) | either skill, append-only + idempotent-by-key | — |

Writing a surface you do not own is a violation. Every write is append-only; nothing is ever rewritten in
place.

## Join rules — every measure derived at read time

No file stores a counter, a rate, a proven flag, or any mastery status; all three measures below are
recomputed from the ledger and manifest on every read, so a record can never drift from the facts that
justify it. "Latest" grade for a concept = the grade in the most recently appended ledger
line whose `questions` include it.

- **Quiz-completion rate** = manifest entries with a matching **completed** ledger session ÷ total
  manifest entries. A ledger line *matches* a manifest entry when both carry the same `artifact` and the
  line's `outcome` is `completed`. Three manifest entries, two matched → `2/3`. Requiz
  lines (no `artifact`) count toward no manifest entry.
- **Proven-known** = concepts whose latest ledger grade is `pass`; the next explainer may skip that
  background. Anything else is not proven.
- **Worth-revisiting** = a durable concept (a learner-glossary term) whose latest grade is `fail`/`partial`,
  or whose latest `pass` is older than the staleness horizon (shared default: **30 days**), or which has no
  ledger grade at all. Surfaced as an advisory note on the next explainer; it never blocks anything.

## What never happens

- **No write into the target repo, ever** — including runs that fail midway. All state is under
  `~/.achilles/comprehension/`.
- **Ephemeral diff detail never enters the glossary or a requiz.** Only durable concepts are written to
  `glossary.md`, and a requiz draws its concepts from the glossary — so a change that was stale by Friday
  is recorded in a ledger session but is never promoted to durable vocabulary and never re-tested.
