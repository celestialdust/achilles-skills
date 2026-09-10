# Comprehension workspace format

The on-disk shape of a **comprehension workspace**, the per-target-repo home for a learner's state.
`literate-explainer` writes the manifest and glossary, `comprehension-quiz` the ledger; measures are
derived by joining them at read time.

## Layout

State lives under `~/.achilles/comprehension/`, outside every target repo: a root `index.md` routing
table, then one directory per **repo key** (`github.com__example-org__widget-store/`) holding
`ledger.jsonl` (learning ledger), `manifest.jsonl` (explainer manifest), `glossary.md` (learner
glossary), and that repo's teaching artifacts, named date-prefixed kebab-case and unique per emission —
the filename is the `artifact` join key below. `index.md` holds one `key → origin` line per key, appended
by either skill on first creation and nothing when the key is present — append-only and idempotent by
key, so both may touch it.

## Repo-key derivation

Deterministic, so any clone or worktree resolves the same workspace. From `git remote get-url origin`:
(1) for an scp-like URL (`[user@]host:path`, no `://`) take host before the first `:` and path after,
else strip the scheme; (2) strip `user[:pass]@` and any `:port`; (3) lowercase the host; (4) strip
trailing `.git` and `/`; (5) split host and path on `/`, drop empty segments, join with `__`. So both
URL forms for `example-org/widget-store` give `github.com__example-org__widget-store`.

With no `origin`: take the absolute path of the repo's **main** working tree (the parent of git's common
dir, so linked worktrees share it), lowercase, replace runs of non-`[a-z0-9]` with `-`, trim, prefix
`local__` — `/home/dev/projects/notes-cli` → `local__home-dev-projects-notes-cli`.

## The three surfaces

Append-only. None holds a question's text or answer — only concepts and grades, so state never leaks what
a quiz asks. Grades: `pass` | `partial` | `fail`.

`ledger.jsonl` — one line per quiz session; `mode` is `diff`, `codebase` or `requiz`, and `artifact`
names the manifest entry followed, omitted for a requiz:

```json
{"date":"2026-07-18","mode":"diff","subject":"feat/checkout-tax","artifact":"2026-07-18-checkout-tax.html","questions":[{"concept":"idempotency key","grade":"pass"}],"outcome":"completed"}
```

`manifest.jsonl` — one line per explainer: the same first four fields plus `"concepts":[…]`.
`glossary.md` — one `## <durable concept>` heading and a plain definition per term; append new terms,
preserve existing entries verbatim.

## Single writer per surface

`comprehension-quiz` owns `ledger.jsonl` and writes nothing else; `literate-explainer` owns
`manifest.jsonl` and `glossary.md` and never the ledger; `index.md` is shared. Writing a surface you do
not own is a violation; nothing is rewritten in place.

## Derive every measure at read time

Store no counter, rate or mastery flag — a stored record drifts from the facts justifying it. A concept's
"latest" grade is in the newest ledger line whose `questions` include it.

- **Quiz-completion rate** — manifest entries with a matching ledger session (same `artifact`, `outcome`
  `completed`) ÷ total entries. Requiz lines match none.
- **Proven-known** — latest grade `pass`; the next explainer may skip that background.
- **Worth-revisiting** — a glossary term whose latest grade is `fail`/`partial`, whose latest `pass` is
  older than the staleness horizon (default 30 days), or which has none. Advisory only.

## Never

Never write into the target repo, including on a run that fails midway. Never promote ephemeral diff
detail to the glossary or a requiz: only durable concepts reach `glossary.md`, which a requiz draws on.
