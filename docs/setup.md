# Setup

achilles-skills is a self-contained skill suite that automates one development loop:

```
IDEATE  →  SPEC  →  PLAN  →  IMPLEMENT  →  VERIFY  →  REVIEW  →  SHIP
   (a person owns these three)              (the agent runs these four)
```

A person owns Ideate, Spec and Plan — the thinking. The agent then runs Implement → Verify → Review →
Ship without waiting on anyone, and ends at open, risk-banded draft pull requests. It never merges to
`main`; what ends a run early is the stop list in
[safety-rails](../references/safety-rails.md).

## Install

**Claude Code** — the suite ships as a plugin, and `.claude-plugin/` is its whole manifest:

```
/plugin marketplace add celestialdust/achilles-skills
/plugin install achilles-skills@achilles-skills
```

That registers the skills in `skills/` and the slash commands in `commands/`. To work against a local
clone instead:

```bash
git clone https://github.com/celestialdust/achilles-skills.git
claude --plugin-dir /path/to/achilles-skills
```

**Any other agent** — clone the repository and point your host at `skills/`. Nothing in the suite is
Claude-specific: every skill is one `skills/<name>/SKILL.md` with two frontmatter keys, `name` and
`description`.

## How a host runs a skill

A skill's `description` says when to run it and what it does; its body is the method, written as
instructions to follow.

- **On a host with a skill tool** — Claude Code, Gemini CLI, Copilot — the description is what routes:
  the host matches the task against it and loads the body on demand. Install the whole roster and let it
  route; you do not pick the skill by hand.
- **On a host without one**, paste the `SKILL.md` body in as the prompt for the task at hand, or point
  the agent at the file by path. The body is written to be run that way — no wrapper, no preamble.

The same holds for a code-cold pass. Verify and Review run in a fresh subagent that never saw the
maker's context; where the host has no skill tool, the `SKILL.md` is that subagent's prompt.

Start any session by loading `using-agent-skills`. It is the dispatcher: it maps a task to the stage
skill that owns it and keeps the artifact chain in order.

| Host | Where the suite's files go | How a skill is invoked |
|---|---|---|
| Claude Code | installed from `.claude-plugin/`, or `--plugin-dir` on a clone | the description routes; commands as `/ideate` … `/ship` |
| Gemini CLI | `.gemini/skills/` in the repository, `~/.gemini/skills/` for user scope | native skill discovery; `/skills list` |
| Antigravity | `agy plugin install <repo-or-path>` | as Gemini CLI, plus the plugin's commands |
| GitHub Copilot | `.github/skills/`, one directory per skill | native skill discovery; repository instructions for the rest |
| Cursor | `.cursor/rules/*.md`, one copied `SKILL.md` per rule | the rule is read when it matches, or name the skill in chat |
| Windsurf | `.windsurf/rules/*.md`; commands as `.windsurf/workflows/*.md` | `/<name>` in Cascade |
| OpenCode | the clone plus `skills/`, with the rules in `CLAUDE.md` / `AGENTS.md` | paste or reference the `SKILL.md` body as the prompt |

## Scaffold the repository once

Run `/setup` (the `project-setup` skill) once in the repository you are building in, before the first
feature. It adopts whatever already exists and writes only what is missing:

- `STATE.md` — the board: title and legend, no feature block yet.
- `CONTEXT.md` — one `## Glossary` heading, the entry shape, no terms.
- `docs/session-state.md` — the five headings, blank.
- `docs/session-log.md` and `docs/lessons.md` — each with its entry shape and no entries.
- `docs/adr/` and `docs/features/` — the homes for decision records and per-feature artifacts.

It also puts the `## Agent skills` block into one of `CLAUDE.md` / `AGENTS.md` and a short pointer to it
in the other, so an agent whose tool reads that filename lands on the rules instead of an empty file.
Two copies of the block would drift, so it never writes both.

## The four state files

| File | Holds | Who reads it |
|---|---|---|
| `STATE.md` | one block per feature, one row per slice, with `State`, `Gate` and `Blocked by` | the run, to pick the next ready slice; you, to see who owns the next action |
| `docs/session-state.md` | where the work stands — five fields, rewritten whole, no history | any agent starting cold, before it does anything |
| `docs/session-log.md` | why it stands there — append-only, one entry per decision | anyone about to re-open a settled question |
| `docs/lessons.md` | what a root-caused defect turned out to be, and the guard against its return | Implement, before writing a skeleton |

Shapes, tokens and writers are stated once, in
[state-schema](../references/state-schema.md).

## One command per stage

| Stage | Command | What the stage leaves behind |
|---|---|---|
| Ideate | `/ideate` | `docs/features/<slug>/intent.md` |
| Spec | `/spec` | `research.md`, the ADRs and `CONTEXT.md` terms, then `prd.md`, `acceptance.md`, `environment.md`, `architecture.md` — signed in one act |
| Plan | `/plan` | `plan.md`, one `plan/<slice-id>.md` per slice, and the feature's rows on `STATE.md` |
| Implement | `/implement` | one slice's commits, test-first |
| Verify | `/verify` | `qa.md` — a ledger by scenario id and a `pass · concerns · block` verdict |
| Review | `/review` | one ranked list of findings, code-cold, and a verdict |
| Ship | `/ship` | an open, risk-banded draft pull request |

`/orchestrate` runs Implement through Ship over the whole slice DAG unattended. `/explain`, `/quiz` and
`/gauntlet-loop` sit outside the loop and gate nothing — run them whenever.

The rules for working inside this repository are in [CLAUDE.md](../CLAUDE.md); what a change to a skill
or command has to satisfy is in [CONTRIBUTING.md](../CONTRIBUTING.md).
