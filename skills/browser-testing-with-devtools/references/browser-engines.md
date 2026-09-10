# Browser engines

Which server to drive, what it is called there, and what to do when it cannot do the check. The skill id
keeps its `-with-devtools` suffix for the callers that name it; Chrome DevTools is one engine here, not a
requirement. Load this when picking an engine or when a tool name does not resolve.

## The roster

| Server | Tool prefix | Coverage | Profile exposure |
|---|---|---|---|
| Chrome DevTools | `chrome-devtools` | DOM, console, network, computed styles, a11y tree, script eval, and the only first-class **performance trace** | isolated by default; attaches to your real Chrome with `--autoConnect` |
| Claude-in-Chrome | `claude-in-chrome` | screenshot and click, page/DOM read, console, network, script eval | always your **real** Chrome — every open window, every logged-in session |
| Playwright | `playwright` | Chromium, Firefox and WebKit: a11y snapshot, screenshot, console, network, `evaluate`, click/type/fill; no performance trace | isolated context, fresh per run |
| agent-browser | `agent-browser` | navigate, snapshot/screenshot, console, network, script eval | per its own README |

Isolated engines are the right default for localhost; the order to pick in is the skill's *Choosing a
browser MCP*.

## Capability to tool

Typical names, not a contract: read the server's live tool list and map onto it, because servers rename
and add tools between releases.

| Capability | Chrome DevTools | Claude-in-Chrome | Playwright |
|---|---|---|---|
| Navigate | `navigate_page` | `navigate` | `browser_navigate` |
| Screenshot | `take_screenshot` | `computer` (screenshot) | `browser_take_screenshot` |
| DOM / snapshot | `take_snapshot` | `read_page` / `get_page_text` | `browser_snapshot` |
| Accessibility tree | `take_snapshot` | `read_page` | `browser_snapshot` |
| Console | `list_console_messages` | `read_console_messages` | `browser_console_messages` |
| Network | `list_network_requests` | `read_network_requests` | `browser_network_requests` |
| Script eval (read-only) | `evaluate_script` | `javascript_tool` | `browser_evaluate` |
| Performance trace | `performance_start_trace` / `performance_stop_trace` | — | — |

## When the engine cannot do the check

Approximate from the page's own APIs through a read-only script eval, and say in the finding that the
number is approximated — an approximated LCP compared against a budget is worth more than a blank row,
and a reader who is not told it was approximated will compare it against a traced one.

| Missing | Approximation |
|---|---|
| Performance trace | `performance.getEntriesByType('navigation' \| 'paint' \| 'largest-contentful-paint')` |
| Layout shift | a `PerformanceObserver` on `layout-shift`, summed while you drive the interaction |
| Long tasks | a `PerformanceObserver` on `longtask`, entries over 50ms |
| Computed styles | `getComputedStyle(el)` on the node in question |

Where nothing approximates it — a real cross-browser render, a screen-reader announcement — the check is
`not-reachable` with that reason.

## Setting one up, if none is configured

Chrome DevTools, in `.mcp.json`:

```json
{ "mcpServers": { "chrome-devtools": { "command": "npx", "args": ["-y", "chrome-devtools-mcp@latest", "--isolated"] } } }
```

`--isolated` uses a temporary profile wiped when the browser closes. `--autoConnect` attaches to your
running Chrome instead — for a test that genuinely needs your logged-in state, and only after reading the
profile step in the skill body.

Playwright, in `.mcp.json`:

```json
{ "mcpServers": { "playwright": { "command": "npx", "args": ["-y", "@playwright/mcp@latest"] } } }
```

Append `--browser chromium|firefox|webkit` to pick the engine.

Claude-in-Chrome arrives as the Claude for Chrome extension rather than through `.mcp.json`; grant it
per-site permissions and point it at localhost. agent-browser installs per its README.

Whichever is chosen, it belongs in `environment.md` as a row of kind `mcp`, so `preflight-readiness`
probes it before a wave starts rather than a slice discovering it mid-run.
