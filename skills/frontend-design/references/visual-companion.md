# Frontend Design — Visual Companion

The browser-based visual companion is `frontend-design`'s **default** Phase-1 exploration mechanism: a tiny
local server (vendored at `skills/frontend-design/scripts/`, Node stdlib only) that shows the human clickable
HTML mockups and records what they pick. It works **greenfield** — no running app, framework, or build step is
required — so it is the right tool the moment "what should this look like" is open. The in-app `?variant=`
switcher is the escalation for when a standalone mockup isn't enough (see `exploring-variants.md`).

## When to use it (decide per question)

Decide **per question, not per session**. The test: *would the human understand this better by seeing it than
by reading it?*

**Use the browser** when the content itself is visual: UI mockups, layouts, navigation structures, component
designs; side-by-side visual comparisons (two layouts, two color directions); look-and-feel / spacing /
hierarchy questions; spatial relationships rendered as diagrams.

**Use the terminal** when the content is words: scope and requirements ("what does X mean?", "which features
are in?"); conceptual A/B/C choices described in prose; tradeoff lists; technical decisions (API shape, data
model); any clarifying question whose answer is text, not a visual preference. A question *about* a UI topic is
not automatically a visual question — "what kind of wizard do you want?" is conceptual (terminal); "which of
these wizard layouts feels right?" is visual (browser).

Offer the companion **just-in-time** — start it the turn you have a visual question, not pre-emptively.

## How it works

The server watches the session's content directory and serves the **newest** HTML file to the browser. You
write HTML screens into that directory; the human sees them and can click to select options; their selections
are appended to `state/events` (JSON lines) for you to read on your next turn. Everything lives under a
per-session working dir.

### Working dir layout (`.frontend-design/`)

With `--project-dir .`, the server creates:

```
.frontend-design/
  .last-port            # persisted port  (same-port restart → open tab reconnects)
  .last-token           # persisted session key
  <session-id>/
    content/            # you write mockup screens here (the JSON `screen_dir`)
    state/
      events            # the human's clicks, JSON lines (the `state_dir` + /events)
      server-info       # the server-started JSON (URL + port); owner-only
      server-stopped    # written on shutdown
      server.pid
```

Without `--project-dir`, files go under `/tmp` and are cleaned up on stop. **Always pass `--project-dir`** so
mockups persist and a restart reuses the same port.

## Starting a session

Start the companion **only after** the human is in a visual question (and, for `--open`, comfortable with the
browser auto-opening):

```bash
# Auto-open the human's browser on the first screen; persist under .frontend-design/.
scripts/start-server.sh --project-dir . --open
```

It prints a single `server-started` JSON line (also written to `state/server-info`):

```json
{"type":"server-started","port":52341,"host":"127.0.0.1","url_host":"localhost",
 "url":"http://localhost:52341/?key=ab12cd34…",
 "screen_dir":"/abs/project/.frontend-design/8123-1706000000/content",
 "state_dir":"/abs/project/.frontend-design/8123-1706000000/state",
 "idle_timeout_ms":14400000}
```

Save `screen_dir` (the content dir — write screens here) and `state_dir` (read `state_dir/events` here). The
full launcher options: `--project-dir <path>`, `--open`, `--host <bind>`, `--url-host <display-host>`,
`--idle-timeout-minutes <n>` (default 240 = 4h), and `--foreground` / `--background`.

**The `url` carries a session key (`?key=…`).** The server 403s any request without it, so always hand the
human the **complete** `url` field — never strip the query string, never a bare `http://host:port`. After the
first load the browser mirrors the key into an `HttpOnly; SameSite=Strict` cookie, so reloads and `/files/*`
assets authenticate without repeating it.

If you launched in the background and didn't capture stdout, read `state/server-info` for the URL and port.

## The loop

1. **Confirm the server is alive, then write a new screen.** Check that `state/server-info` exists and
   `state/server-stopped` does not. Write an HTML file into the content dir (`screen_dir`):
   - **Use semantic filenames** (`layout.html`, `visual-style.html`) and **never reuse a filename** — each
     screen is a fresh file; the server serves the newest by mtime.
   - Use your file-creation tool — **never `cat`/heredoc** (it dumps noise into the terminal).
2. **End your turn with a text summary.** Remind the human of the URL, say what's on screen in one line
   ("Showing 3 homepage layouts"), and ask them to look and respond in the terminal (clicking an option is
   optional).
3. **On your next turn, read the clicks.** If `state_dir/events` exists, read it (one JSON object per line) and
   merge it with the human's terminal reply — the terminal message is primary; `events` adds structured
   interaction data. The file is cleared automatically when you push the next screen.
4. **Iterate or advance.** If feedback changes the current screen, write a new version (`layout-v2.html`). When
   the next question is textual, push a short "Continuing in terminal…" waiting screen to clear stale content,
   then return to the terminal.
5. **Stop when done** (see Cleaning up).

## Content fragments vs full documents

If your HTML starts with `<!DOCTYPE` or `<html`, the server serves it **as-is** (only injecting the client
helper). Otherwise it **wraps your content fragment** in the frame template — adding the header, theme CSS,
connection status, and all interactive infrastructure. **Write content fragments by default**; only write a
full document when you need complete control of the page. A minimal fragment:

```html
<h2>Which layout works better?</h2>
<p class="subtitle">Consider readability and visual hierarchy</p>
<div class="options">
  <div class="option" data-choice="a" onclick="toggleSelect(this)">
    <div class="letter">A</div>
    <div class="content"><h3>Single Column</h3><p>Focused reading</p></div>
  </div>
  <div class="option" data-choice="b" onclick="toggleSelect(this)">
    <div class="letter">B</div>
    <div class="content"><h3>Two Column</h3><p>Sidebar + main</p></div>
  </div>
</div>
```

No `<html>`, CSS, or `<script>` needed — the frame supplies them.

## Frame CSS helper classes

The frame supplies these via `scripts/frame-template.html` (the CSS) and the injected `scripts/helper.js`
(the `toggleSelect` / `data-choice` / `data-multiselect` click behavior):

- **`.options`** — vertical A/B/C list of `.option` rows, each with a `.letter` and a `.content` (`<h3>` +
  `<p>`); wire clicks with `onclick="toggleSelect(this)"` and tag the choice with `data-choice="a"`. Add
  `data-multiselect` on `.options` to allow multiple selections.
- **`.cards`** — grid of `.card` (`.card-image` + `.card-body`) for visual design options.
- **`.mockup`** — a framed preview (`.mockup-header` + `.mockup-body`) for a wireframe/layout.
- **`.split`** — two-column side-by-side (collapses to one column on narrow screens); put two `.mockup`s in it.
- **`.pros-cons`** — paired `.pros` / `.cons` blocks.
- **Wireframe blocks:** `.mock-nav`, `.mock-sidebar`, `.mock-content`, `.mock-button`, `.mock-input`,
  `.placeholder`.
- **Typography / structure:** `h2` (page title), `h3` (section heading), `.subtitle`, `.section`, `.label`.

## Browser events format (`state/events`)

Clicks are appended to `state_dir/events`, one JSON object per line, and the file is cleared when you push a
new screen:

```jsonl
{"type":"click","choice":"a","text":"Option A — Single Column","timestamp":1706000101}
{"type":"click","choice":"b","text":"Option B — Two Column","timestamp":1706000115}
```

The **`choice`** field is the option's `data-choice`. The last `choice` is usually the final selection, but the
sequence can reveal hesitation worth asking about. If `state/events` doesn't exist, the human didn't click —
use only their terminal reply.

## Clean shutdown and reconnect

The server auto-exits after **4 hours idle** (configurable via `--idle-timeout-minutes`) and shuts down with
its owner process. If it has stopped and you need it again, restart with the **same `--project-dir`**: it
reuses the persisted port and key, so the human's still-open tab reconnects on its own (it shows a "paused"
overlay while down) — no new URL needed.

## Remote / headless

The server **binds loopback-only by default** (`127.0.0.1`), and `--open` only auto-opens a browser on a
loopback bind — so remote/headless sessions always use the **manual-URL fallback** (share the printed `url`).
To reach the companion from another machine you can bind a non-loopback host:

```bash
scripts/start-server.sh --project-dir . --host 0.0.0.0 --url-host <reachable-host>
```

Treat a non-loopback bind as **plain-HTTP and unencrypted**: it serves the session key in the URL over the
wire and sets the auth cookie **without the `Secure` flag**, so the key can be observed on an untrusted
network. Do not bind a public interface directly — put remote access behind an **SSH tunnel or TLS
terminator** instead. Separately, `--open` shells out through an operator-overridable launcher
(`BRAINSTORM_OPEN_CMD`); that env var is **operator-trusted, opt-in input** — never populate it from
untrusted data.

## Gitignore reminder

The companion's working dir holds throwaway exploration screens (and `/tmp` is not used when `--project-dir` is
set), so the **target project must ignore it**. Add to the target project's `.gitignore`:

```
.frontend-design/
```

Only the one agreed mockup is later committed (as the reference-spec prototype); every throwaway screen stays
untracked under `.frontend-design/`.

## Cleaning up

```bash
scripts/stop-server.sh <session-dir>      # e.g. .frontend-design/<session-id>
```

Stopping a `--project-dir` session leaves its files in place under `.frontend-design/` for later reference;
only ephemeral `/tmp` sessions are deleted on stop.

## Reference

- Frame template (CSS reference): `skills/frontend-design/scripts/frame-template.html`
- Client helper (injected into every screen): `skills/frontend-design/scripts/helper.js`
- Vendoring baseline + telemetry audit: `skills/frontend-design/scripts/VENDORED.md`
