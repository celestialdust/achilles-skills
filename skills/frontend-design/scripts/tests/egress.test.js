/**
 * A12 egress-silence proof (the load-bearing telemetry-strip test).
 *
 * Drives a full launch -> serve -> click -> shutdown round-trip with the companion
 * running under egress-guard.cjs (records every outbound TCP client connect the
 * server process attempts), then asserts the server opened ZERO outbound
 * (non-loopback) sockets. This proves egress-silence BEHAVIORALLY — a hidden
 * beacon would have to open a socket, which the guard would record — rather than
 * by grepping the source for "primeradiant".
 *
 * A non-vacuous test needs proof the guard actually catches egress, so a positive
 * control opens a real non-loopback connect and asserts the guard recorded it.
 *
 * Uses the `ws` npm package as a test client (test-only dependency).
 */

const { spawn, execFileSync } = require("child_process");
const http = require("http");
const WebSocket = require("ws");
const fs = require("fs");
const os = require("os");
const path = require("path");
const assert = require("assert");

const SERVER_PATH = path.join(__dirname, "../server.cjs");
const GUARD_PATH = path.join(__dirname, "egress-guard.cjs");
const TEST_PORT = 3472;
const TOKEN = "testtoken-egress-0123456789abcdef";

// Hosts that are NOT egress: loopback + the unspecified bind address + "no host".
const LOOPBACK = new Set([
  "127.0.0.1",
  "::1",
  "localhost",
  "0.0.0.0",
  "::",
  "",
  "null",
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function get(pathname, key) {
  const url =
    `http://localhost:${TEST_PORT}${pathname}` +
    (key !== undefined ? `?key=${key}` : "");
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => resolve({ status: res.statusCode, body }));
      })
      .on("error", reject);
  });
}

function waitForServer(server) {
  let stdout = "",
    stderr = "";
  return new Promise((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error(`server did not start. stderr: ${stderr}`)),
      5000,
    );
    server.stdout.on("data", (d) => {
      stdout += d.toString();
      if (stdout.includes("server-started")) {
        clearTimeout(t);
        resolve();
      }
    });
    server.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    server.on("error", reject);
  });
}

function readLines(file) {
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, "utf-8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch (e) {
        return { raw: l };
      }
    });
}

function nonLoopback(entries) {
  return entries.filter((e) => !LOOPBACK.has(String(e.host)));
}

let passed = 0,
  failed = 0;
async function test(name, fn) {
  try {
    await fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL: ${name}`);
    console.log(`    ${e.message}`);
    failed++;
  }
}

async function main() {
  console.log("\n--- Egress silence (A12) ---");

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fd-egress-"));
  const egressLog = path.join(dir, "egress.log");
  const contentDir = path.join(dir, "content");
  const stateDir = path.join(dir, "state");
  fs.writeFileSync(egressLog, "");

  // Positive control FIRST: prove the guard actually records a non-loopback
  // connect. Without this, "server log is empty" could pass vacuously if the
  // guard silently failed to patch. RFC 5737 TEST-NET-1 (192.0.2.1) never
  // completes, but connect() is still invoked and must be recorded.
  await test("egress guard records a real outbound connect (positive control)", () => {
    const ctrlLog = path.join(dir, "ctrl.log");
    fs.writeFileSync(ctrlLog, "");
    execFileSync(
      "node",
      [
        "-r",
        GUARD_PATH,
        "-e",
        'const net=require("net");const s=net.connect(9,"192.0.2.1");s.on("error",()=>{});setTimeout(()=>{try{s.destroy()}catch(e){};process.exit(0)},200);',
      ],
      {
        env: { ...process.env, EGRESS_LOG: ctrlLog },
        timeout: 4000,
        stdio: "ignore",
      },
    );
    const ctrl = readLines(ctrlLog);
    assert(
      ctrl.some((e) => String(e.host) === "192.0.2.1"),
      `guard must record the non-loopback connect; recorded: ${JSON.stringify(ctrl)}`,
    );
  });

  // BRAINSTORM_OPEN intentionally unset -> no browser launch (headless-safe).
  const server = spawn("node", ["-r", GUARD_PATH, SERVER_PATH], {
    env: {
      ...process.env,
      BRAINSTORM_PORT: TEST_PORT,
      BRAINSTORM_DIR: dir,
      BRAINSTORM_TOKEN: TOKEN,
      EGRESS_LOG: egressLog,
      BRAINSTORM_LIFECYCLE_CHECK_MS: 100000,
    },
  });

  let exited = false,
    exitCode = null;
  server.on("exit", (c) => {
    exited = true;
    exitCode = c;
  });

  try {
    await waitForServer(server);

    // serve: write the newest screen, then fetch it.
    fs.mkdirSync(contentDir, { recursive: true });
    fs.writeFileSync(
      path.join(contentDir, "screen.html"),
      '<h2>Pick</h2><div class="option" data-choice="a">Option A</div>',
    );
    await sleep(300);

    await test("keyed GET serves the newest screen (200)", async () => {
      const res = await get("/", TOKEN);
      // The keyed root returns the bootstrap page that stores the key; the screen
      // itself is served once the cookie is set. Either way it must be 200 and the
      // unkeyed request below must be refused.
      assert.strictEqual(
        res.status,
        200,
        `keyed GET should be 200, got ${res.status}`,
      );
    });

    await test("unkeyed GET is refused (403) — no screen leaks", async () => {
      const res = await get("/");
      assert.strictEqual(
        res.status,
        403,
        `unkeyed GET must be 403, got ${res.status}`,
      );
      assert(
        !res.body.includes("Option A"),
        "unkeyed response must not contain screen content",
      );
    });

    // click: open a WS, send a choice, confirm it lands in state/events.
    await test("a click is recorded to state/events (A3)", async () => {
      const eventsFile = path.join(stateDir, "events");
      if (fs.existsSync(eventsFile)) fs.unlinkSync(eventsFile);
      const ws = new WebSocket(`ws://localhost:${TEST_PORT}/?key=${TOKEN}`);
      await new Promise((res, rej) => {
        ws.on("open", res);
        ws.on("error", rej);
      });
      ws.send(JSON.stringify({ type: "click", choice: "a", text: "Option A" }));
      await sleep(300);
      ws.close();
      assert(
        fs.existsSync(eventsFile),
        "state/events should exist after a click",
      );
      const lines = fs.readFileSync(eventsFile, "utf-8").trim().split("\n");
      const event = JSON.parse(lines[lines.length - 1]);
      assert.strictEqual(event.choice, "a", 'recorded choice should be "a"');
    });

    await sleep(200);
  } finally {
    if (!exited) {
      server.kill();
      await new Promise((res) => {
        server.once("exit", res);
        setTimeout(res, 2000);
      });
    }
  }

  // shutdown: the process must actually exit.
  await test("server shuts down cleanly on signal", async () => {
    assert(
      exited || server.exitCode !== null || server.signalCode !== null,
      "server process should have exited",
    );
  });

  // THE load-bearing assertion: across the whole session the server opened zero
  // outbound (non-loopback) sockets.
  await test("server opened ZERO outbound sockets during the session (A12)", () => {
    const entries = readLines(egressLog);
    const egress = nonLoopback(entries);
    assert.strictEqual(
      egress.length,
      0,
      `expected zero outbound sockets, got: ${JSON.stringify(egress)}`,
    );
  });

  fs.rmSync(dir, { recursive: true, force: true });

  console.log(`\n--- Results: ${passed} passed, ${failed} failed ---`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
