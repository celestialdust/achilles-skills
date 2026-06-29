# Using achilles-skills with Gemini CLI

achilles-skills ships **36 lifecycle skills**, **5 reusable agent personas** (`agents/`), and **9 slash
commands** (`commands/`) covering the full **Ideate → Spec → Plan → Implement → Verify → Review → Ship**
loop. This guide explains how to wire them into Gemini CLI.

## Setup

### Option 1: Install as Skills (Recommended)

Gemini CLI has a native skills system that auto-discovers `SKILL.md` files in `.gemini/skills/` or
`.agents/skills/` directories. Each skill activates on demand when it matches your task.

**Install from the repo:**

```bash
gemini skills install https://github.com/celestialdust/achilles-skills.git --path skills
```

**Or install from a local clone:**

```bash
git clone https://github.com/celestialdust/achilles-skills.git
gemini skills install /path/to/achilles-skills/skills/
```

**Install for a specific workspace only:**

```bash
gemini skills install /path/to/achilles-skills/skills/ --scope workspace
```

Skills installed at workspace scope go into `.gemini/skills/` (or `.agents/skills/`). User-level skills go
into `~/.gemini/skills/`.

Once installed, verify with:

```
/skills list
```

Gemini CLI injects skill names and descriptions into the prompt automatically. When it recognizes a matching
task, it asks permission to activate the skill before loading its full instructions.

### Option 2: GEMINI.md (Persistent Context)

For skills you want always loaded as persistent project context (rather than on-demand activation), add them
to your project's `GEMINI.md`:

```bash
# Create GEMINI.md with core skills as persistent context
cat /path/to/achilles-skills/skills/incremental-implementation/SKILL.md > GEMINI.md
echo -e "\n---\n" >> GEMINI.md
cat /path/to/achilles-skills/skills/code-review/SKILL.md >> GEMINI.md
```

You can also modularize by importing from separate files:

```markdown
# Project Instructions

@skills/test-driven-development/SKILL.md
@skills/incremental-implementation/SKILL.md
```

Use `/memory show` to verify loaded context, and `/memory reload` to refresh after changes.

> **Skills vs GEMINI.md:** Skills are on-demand expertise that activate only when relevant, keeping your
> context window clean. GEMINI.md provides persistent context loaded for every prompt. Use skills for
> phase-specific workflows and GEMINI.md for always-on project conventions.

## Recommended Configuration

### Always-On (GEMINI.md)

Add these as persistent context for every session:

- `incremental-implementation` — Build in small verifiable slices
- `code-review` — Five-axis review before merge

### On-Demand (Skills)

Install these as skills so they activate only when relevant:

- `test-driven-development` — Activates when implementing logic or fixing bugs
- `spec-grilling` — Activates when designing a new product or feature
- `frontend-design` — Activates when building UI
- `security-and-hardening` — Activates during security reviews
- `performance-optimization` — Activates during performance work

## Advanced Configuration

### MCP Integration

Many skills in this pack leverage [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) tools to
interact with the environment. For example:

- `browser-testing-with-devtools` uses the `chrome-devtools` MCP extension.
- `performance-optimization` can benefit from performance-related MCP tools.

To enable these, ensure you have the relevant MCP extensions installed in your Gemini CLI configuration
(`~/.gemini/config.json`).

### Session Hooks

Gemini CLI supports session lifecycle hooks. You can use these to automatically inject context or run
validation scripts at the start of a session.

To replicate the always-on achilles-skills experience from other tools, configure a `SessionStart` hook that
reminds you of the available skills or loads the `using-agent-skills` meta-dispatcher.

### Explicit Context Loading

You can explicitly load any skill into your current session by referencing it with the `@` symbol in your
prompt:

```markdown
Use the @skills/test-driven-development/SKILL.md skill to implement this fix.
```

This is useful when you want to ensure a specific workflow is followed without waiting for auto-discovery.

## Slash Commands

The repo ships **9 lifecycle slash commands** under `commands/` as Markdown definitions (Claude Code's native
format). Gemini CLI uses its own **TOML** command format under `.gemini/commands/`, so wrap each command's
body in a Gemini TOML file — Gemini's `prompt` is the achilles command file's Markdown body (everything below
its frontmatter):

```bash
mkdir -p .gemini/commands
# For each commands/<name>.md, create .gemini/commands/<name>.toml containing:
#   prompt = """<paste the command file's body, below its --- frontmatter --- >"""
```

Each command is a thin wrapper that invokes its mapped skill(s) automatically — no manual skill loading
required.

| Command | Invokes | What it does |
|---------|---------|--------------|
| `/ideate` | interview-me, then idea-refine | Front door for a fresh idea → `intent.md` |
| `/spec` | spec-grilling (+ to-prd, acceptance-criteria, environment-manifest, frontend-design, spec-review) | Design the product → ADRs + `CONTEXT.md` |
| `/plan` | plan-breakdown (+ codebase-research first) | Concrete plan → vertical slices + dependency DAG |
| `/implement` | incremental-implementation (applies test-driven-development) | Build one thin vertical slice |
| `/verify` | quality-verification | Fresh code-cold proof a slice works |
| `/review` | code-review (+ code-simplification, security-and-hardening, performance-optimization as fan-out) | Quality gate before merge |
| `/ship` | shipping-and-launch (+ pull-request) | Release: checklist · staged rollout · rollback |
| `/orchestrate` | orchestrator | Autonomous wave-parallel DAG runner to open draft PRs |
| `/setup` | project-setup | One-time repo ecosystem: `STATE.md` · `CONTEXT.md` · `docs/adr/` |

> **Note on `/plan`:** Gemini CLI reserves `plan` for an internal command, so the bundled `/plan` may not be
> reachable from the prompt. If it collides, rename the copied file (e.g. `.gemini/commands/planning.toml`)
> and invoke it as `/planning` instead — the mapped `plan-breakdown` skill is unchanged.

## Agent Personas

achilles-skills bundles **5 reusable agent personas** under `agents/`. Each is a fresh-context, code-cold
role that applies a review skill with no prior context, preserving the maker≠checker boundary. Copy a
persona's content into your prompt (or load it with `@agents/<name>.md`) when you want that specialist pass:

| Persona | Applies skill | Role |
|---------|---------------|------|
| `code-reviewer` | code-review | Staff-engineer five-axis review before merge |
| `security-auditor` | security-and-hardening | Code-cold OWASP / secrets / dependency audit of a diff |
| `test-engineer` | test-driven-development + quality-verification | Designs honest tests; proves a slice behaviorally |
| `performance-auditor` | performance-optimization | Measure-first profiler; Core Web Vitals; hot paths |
| `adversarial-reviewer` | doubt-driven-development | Independent skeptic for confident, high-stakes in-flight decisions |

```markdown
Act as the @agents/security-auditor.md persona and audit the current diff.
```

## Usage Tips

1. **Prefer skills over GEMINI.md** — Skills activate on demand and keep your context window focused. Only
   put skills in GEMINI.md if you want them always loaded.
2. **Skill descriptions matter** — Each `SKILL.md` has a `description` field in its frontmatter that tells
   agents when to activate it. The descriptions in this repo are written to state both *what* the skill does
   and *when* it should trigger, so auto-discovery works across tools (Claude Code, Gemini CLI, etc.).
3. **Use personas for review** — Load `agents/code-reviewer.md` (and the other four personas) when you want a
   structured, code-cold review pass.
4. **Combine with references** — Reference the supplementary checklists in `references/` when working on
   specific quality areas like testing, performance, or security.
5. **Let `using-agent-skills` route you** — When unsure which skill fits, load the `using-agent-skills`
   meta-dispatcher; it maps a task to the right skill and lifecycle stage.
</content>
</invoke>
