---
name: code-simplification
description: 'Reduce code complexity without changing behavior — the Review-stage QUALITY axis. Use the moment a slice''s code is green but reads heavier than it should: deep nesting, nested ternaries, dead code, generic names, copy-paste duplication, speculative abstractions. Apply Chesterton''s Fence (understand before you cut) and stay scoped to what changed. Quality only — it does NOT hunt for bugs (that is `code-review`/`security-and-hardening`). It REPORTS findings and edits nothing — not the code, not the tests; a simplification that cannot be had without moving behavior, a frozen test, or the repo''s decided look is a HALT, not a finding.'
---

# Code Simplification

> Inspired by the [Claude Code Simplifier plugin](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-simplifier/agents/code-simplifier.md). Adapted here as a model-agnostic, process-driven skill for any AI coding agent.

## Overview

Find the complexity in a change and name the simpler version, without changing what the code does. The goal is not fewer lines — it's code that is easier to read, understand, modify, and debug. Every simplification you report must pass a simple test: "Would a new team member understand this faster than the original?"

## When to Use

- After a feature is working and tests pass, but the implementation feels heavier than it needs to be
- During code review when readability or complexity issues are flagged
- When you encounter deeply nested logic, long functions, or unclear names
- When refactoring code written under time pressure
- When consolidating related logic scattered across files
- After merging changes that introduced duplication or inconsistency

**When NOT to use:**

- Code is already clean and readable — don't simplify for the sake of it
- You don't understand what the code does yet — comprehend before you simplify
- The code is performance-critical and the "simpler" version would be measurably slower
- You're about to rewrite the module entirely — simplifying throwaway code wastes effort

## Inputs

**Stage:** Review — one axis of the parallel fan-out. The orchestrator dispatches this as a fresh,
code-cold subagent on the *simplification* axis (maker≠checker; `parallelism.md` mech f). It reports
findings; it does not edit the code it grades. Sibling axes are reading those same files at the
same moment, so a write here lands under a reviewer mid-read — and a checker that rewrites what it
just graded has stopped being a checker. The slice's own implementer applies the fix on the
route-back.

Refuse to run unless ALL of these resolve:

- **The slice diff** — the changed code for the slice under review (the working-tree diff / the files
  the slice touched). This is the only material in scope. *No diff → nothing to simplify → return `pass`.*
- **A green test suite for those files** — the behavior oracle. Behavior-preservation is the entire
  contract (Principle 1), and the tests are what make a finding safe to act on: with nothing pinning
  the changed code, "this preserves behavior" is a guess you are asking the implementer to take on
  faith → refuse rather than guess.
- **The slice's declared `Regression surface`** — the file set you are allowed to report on. A finding
  cited outside it belongs to a slice that is not under review (Principle 5: Scope to What Changed).
- **Project conventions** — `CLAUDE.md` / `CONTEXT.md` and the neighboring code, so simplification
  converges on the house style instead of imposing a foreign one (Principle 2).

**Frozen under this skill (silent-false-green invariant):** `acceptance.md`, the RED/passing tests,
and the declared `Regression surface` are IMMUTABLE here. So is any **ACTIVE** row under the `## Rows`
heading of `docs/test-contract.md` when the repo has one — and that one is frozen on stronger terms: the
first three thaw between runs by a signed Spec change, an ACTIVE row is frozen in every run, forever,
because activation is one-way and only a person performs it. A simplification you cannot recommend without
a test being edited, an assertion weakened, the surface widened or narrowed, or an ACTIVE row losing its
coverage is **gate-erosion → HALT**: stop, return `block`, and surface it — naming the row id (`TC-1`) when
it was a contract row, since "gate erosion" alone does not tell the reader which guarantee was nearly
traded away. The orchestrator owns the board: it flips the slice's gate column to `you`, and a person
decides. Never set a row's state yourself in either direction; you read that file and do not edit it. An
absent file, or one with no ACTIVE rows, changes nothing here.
`docs/design.md` is **read-only** here rather than frozen — a different constraint for a different
reason: Verify grades every contract axis marked `inherits: docs/design.md` against it, and only
`frontend-design` moves it. It is not a fifth frozen artifact, and this skill never writes it. Reading
rather than writing removes the authority to move that file, not the duty to report a collision with
it — so a simplification that cannot be had unless the decided look moves is **gate-erosion → HALT**
on the same terms: return `block`, and a person decides.

## The Five Principles

### 1. Preserve Behavior Exactly

Don't change what the code does — only how it expresses it. All inputs, outputs, side effects, error behavior, and edge cases must remain identical. If you're not sure a simplification preserves behavior, don't make it.

```
ASK BEFORE EVERY CHANGE:
→ Does this produce the same output for every input?
→ Does this maintain the same error behavior?
→ Does this preserve the same side effects and ordering?
→ Do all existing tests still pass without modification?
```

### 2. Follow Project Conventions

Simplification means making code more consistent with the codebase, not imposing external preferences. Before simplifying:

```
1. Read CLAUDE.md / project conventions
2. Study how neighboring code handles similar patterns
3. Match the project's style for:
   - Import ordering and module system
   - Function declaration style
   - Naming conventions
   - Error handling patterns
   - Type annotation depth
```

Simplification that breaks project consistency is not simplification — it's churn.

### 3. Prefer Clarity Over Cleverness

Explicit code is better than compact code when the compact version requires a mental pause to parse.

```typescript
// UNCLEAR: Dense ternary chain
const label = isNew ? 'New' : isUpdated ? 'Updated' : isArchived ? 'Archived' : 'Active';

// CLEAR: Readable mapping
function getStatusLabel(item: Item): string {
  if (item.isNew) return 'New';
  if (item.isUpdated) return 'Updated';
  if (item.isArchived) return 'Archived';
  return 'Active';
}
```

```typescript
// UNCLEAR: Chained reduces with inline logic
const result = items.reduce((acc, item) => ({
  ...acc,
  [item.id]: { ...acc[item.id], count: (acc[item.id]?.count ?? 0) + 1 }
}), {});

// CLEAR: Named intermediate step
const countById = new Map<string, number>();
for (const item of items) {
  countById.set(item.id, (countById.get(item.id) ?? 0) + 1);
}
```

### 4. Maintain Balance

Simplification has a failure mode: over-simplification. Watch for these traps:

- **Inlining too aggressively** — removing a helper that gave a concept a name makes the call site harder to read
- **Combining unrelated logic** — two simple functions merged into one complex function is not simpler
- **Removing "unnecessary" abstraction** — some abstractions exist for extensibility or testability, not complexity
- **Optimizing for line count** — fewer lines is not the goal; easier comprehension is

### 5. Scope to What Changed

Default to simplifying recently modified code. Avoid drive-by refactors of unrelated code unless explicitly asked to broaden scope. Unscoped simplification creates noise in diffs and risks unintended regressions.

## The Simplification Process

### Step 1: Understand Before Touching (Chesterton's Fence)

Before changing or removing anything, understand why it exists. This is Chesterton's Fence: if you see a fence across a road and don't understand why it's there, don't tear it down. First understand the reason, then decide if the reason still applies.

```
BEFORE SIMPLIFYING, ANSWER:
- What is this code's responsibility?
- What calls it? What does it call?
- What are the edge cases and error paths?
- Are there tests that define the expected behavior?
- Why might it have been written this way? (Performance? Platform constraint? Historical reason?)
- Check git blame: what was the original context for this code?
```

If you can't answer these, you're not ready to simplify. Read more context first.

### Step 2: Identify Simplification Opportunities

Scan for these patterns — each one is a concrete signal, not a vague smell:

**Structural complexity:**

| Pattern | Signal | Simplification |
|---------|--------|----------------|
| Deep nesting (3+ levels) | Hard to follow control flow | Extract conditions into guard clauses or helper functions |
| Long functions (50+ lines) | Multiple responsibilities | Split into focused functions with descriptive names |
| Nested ternaries | Requires mental stack to parse | Replace with if/else chains, switch, or lookup objects |
| Boolean parameter flags | `doThing(true, false, true)` | Replace with options objects or separate functions |
| Repeated conditionals | Same `if` check in multiple places | Extract to a well-named predicate function |

**Naming and readability:**

| Pattern | Signal | Simplification |
|---------|--------|----------------|
| Generic names | `data`, `result`, `temp`, `val`, `item` | Rename to describe the content: `userProfile`, `validationErrors` |
| Abbreviated names | `usr`, `cfg`, `btn`, `evt` | Use full words unless the abbreviation is universal (`id`, `url`, `api`) |
| Misleading names | Function named `get` that also mutates state | Rename to reflect actual behavior |
| Comments explaining "what" | `// increment counter` above `count++` | Delete the comment — the code is clear enough |
| Comments explaining "why" | `// Retry because the API is flaky under load` | Keep these — they carry intent the code can't express |

**Redundancy:**

| Pattern | Signal | Simplification |
|---------|--------|----------------|
| Duplicated logic | Same 5+ lines in multiple places | Extract to a shared function |
| Dead code | Unreachable branches, unused variables, commented-out blocks | Remove (after confirming it's truly dead) |
| Unnecessary abstractions | Wrapper that adds no value | Inline the wrapper, call the underlying function directly |
| Over-engineered patterns | Factory-for-a-factory, strategy-with-one-strategy | Replace with the simple direct approach |
| Redundant type assertions | Casting to a type that's already inferred | Remove the assertion |

### Step 3: One Finding per Simplification

Each finding names exactly one simplification, and each has to stand on its own: the implementer applies it, runs the suite against that change alone, and knows which change broke something when something breaks. A finding that bundles four rewrites into "clean this up" costs them that. The finding says so too — **refactoring lands separately from feature or bug fix work**; a PR that refactors and adds a feature is two PRs.

```
FOR EACH SIMPLIFICATION YOU REPORT:
1. Name one change, cited at file:line
2. Show the before and the proposed after
3. Name the tests that pin the behavior it touches — that is what makes it safe to take
4. Say what the reader gains, not how many lines go away
```

**The Rule of 500:** if a simplification would touch more than 500 lines, say so in the finding and recommend automation (codemods, sed scripts, AST transforms) over hand edits. Manual edits at that scale are error-prone and exhausting to review, and a finding that omits the size hands someone a week of work described as a cleanup.

### Step 4: Test the Finding Before You Report It

Write the proposed version out — it is the "after" the finding carries — and hold it against the original:

```
COMPARE BEFORE AND AFTER:
- Is the proposed version genuinely easier to understand?
- Does it introduce a pattern inconsistent with the codebase?
- Is it a small, reviewable change on its own?
- Would a teammate approve it?
```

If the "simplified" version is harder to understand or review, drop the finding. Not every simplification attempt survives being written down — and an attempt dropped here costs nobody anything, while a reported one costs the slice a route-back.

## Language-Specific Guidance

### TypeScript / JavaScript

```typescript
// SIMPLIFY: Unnecessary async wrapper
// Before
async function getUser(id: string): Promise<User> {
  return await userService.findById(id);
}
// After
function getUser(id: string): Promise<User> {
  return userService.findById(id);
}

// SIMPLIFY: Verbose conditional assignment
// Before
let displayName: string;
if (user.nickname) {
  displayName = user.nickname;
} else {
  displayName = user.fullName;
}
// After
const displayName = user.nickname || user.fullName;

// SIMPLIFY: Manual array building
// Before
const activeUsers: User[] = [];
for (const user of users) {
  if (user.isActive) {
    activeUsers.push(user);
  }
}
// After
const activeUsers = users.filter((user) => user.isActive);

// SIMPLIFY: Redundant boolean return
// Before
function isValid(input: string): boolean {
  if (input.length > 0 && input.length < 100) {
    return true;
  }
  return false;
}
// After
function isValid(input: string): boolean {
  return input.length > 0 && input.length < 100;
}
```

### Python

```python
# SIMPLIFY: Verbose dictionary building
# Before
result = {}
for item in items:
    result[item.id] = item.name
# After
result = {item.id: item.name for item in items}

# SIMPLIFY: Nested conditionals with early return
# Before
def process(data):
    if data is not None:
        if data.is_valid():
            if data.has_permission():
                return do_work(data)
            else:
                raise PermissionError("No permission")
        else:
            raise ValueError("Invalid data")
    else:
        raise TypeError("Data is None")
# After
def process(data):
    if data is None:
        raise TypeError("Data is None")
    if not data.is_valid():
        raise ValueError("Invalid data")
    if not data.has_permission():
        raise PermissionError("No permission")
    return do_work(data)
```

### React / JSX

```tsx
// SIMPLIFY: Verbose conditional rendering
// Before
function UserBadge({ user }: Props) {
  if (user.isAdmin) {
    return <Badge variant="admin">Admin</Badge>;
  } else {
    return <Badge variant="default">User</Badge>;
  }
}
// After
function UserBadge({ user }: Props) {
  const variant = user.isAdmin ? 'admin' : 'default';
  const label = user.isAdmin ? 'Admin' : 'User';
  return <Badge variant={variant}>{label}</Badge>;
}

// SIMPLIFY: Prop drilling through intermediate components
// Before — consider whether context or composition solves this better.
// This is a judgment call — flag it, don't auto-refactor.
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "It's working, no need to touch it" | Working code that's hard to read will be hard to fix when it breaks. Simplifying now saves time on every future change. |
| "Fewer lines is always simpler" | A 1-line nested ternary is not simpler than a 5-line if/else. Simplicity is about comprehension speed, not line count. |
| "I'll just quickly simplify this unrelated code too" | Unscoped simplification creates noisy diffs and risks regressions in code you didn't intend to change. Stay focused. |
| "The types make it self-documenting" | Types document structure, not intent. A well-named function explains *why* better than a type signature explains *what*. |
| "This abstraction might be useful later" | Don't preserve speculative abstractions. If it's not used now, it's complexity without value. Remove it and re-add when needed. |
| "The original author must have had a reason" | Maybe. Check git blame — apply Chesterton's Fence. But accumulated complexity often has no reason; it's just the residue of iteration under pressure. |
| "I'll refactor while adding this feature" | Separate refactoring from feature work. Mixed changes are harder to review, revert, and understand in history. |

## Red Flags

- Simplification that requires modifying tests to pass (you likely changed behavior)
- "Simplified" code that is longer and harder to follow than the original
- Renaming things to match your preferences rather than project conventions
- Removing error handling because "it makes the code cleaner"
- Simplifying code you don't fully understand
- Batching many simplifications into one finding nobody can review
- Reaching outside the scope of the current task without being asked

## Verification

Before this pass returns, every finding it carries clears this bar:

- [ ] The existing tests pin the behavior it touches, and they pass as they stand — unmodified
- [ ] Taking it needs no test edited, no assertion weakened, no `Regression surface` moved
- [ ] It is one reviewable, incremental change, not a bundle
- [ ] It cites a `file:line` inside the slice's declared `Regression surface`
- [ ] It follows project conventions (checked against `CLAUDE.md` or equivalent), not imported taste
- [ ] It removes and weakens no error handling
- [ ] It leaves no dead code behind (unused imports, unreachable branches)
- [ ] A teammate reading the before and the after would call it a net improvement

## Outputs & handoff contract

**Emits: `findings`** — the simplification axis, returned to the orchestrator for the Review fan-out's
one ranked, de-duplicated list. This skill writes no file and changes no code; **Inputs** gives the
reason.

**Return to the orchestrator (Review fan-out aggregation)** exactly one verdict token — the same three
`performance-optimization` returns. The gate AND-combines the axes' verdicts without translating
between vocabularies:
- `pass` — nothing here warrants simplifying, or only `Optional` / `Nit` findings.
- `concerns` — findings the owning slice should take. It goes back to `incremental-implementation`
  (bounded rounds) to apply them.
- `block` — gate-erosion: the simplification worth having cannot be reached without an artifact frozen
  under **Inputs**, or the read-only `docs/design.md`, moving. Name the `file:line` and why, and do
  **not** also report it as a routine finding: an implementer acting on it would erode the gate.

**STATE.md:** this skill writes **no** `STATE.md` row and flips no gate of its own. The orchestrator
owns the slice's `review` state and advances it only when every review axis returns non-blocking.
Stable sections other skills depend on: none beyond the `## Verification` checklist above, which is
the bar every finding clears.
