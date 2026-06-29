/**
 * Telemetry-strip / neutral-rebrand assertion (repurposed from the upstream
 * superpowers branding test, which asserted the OPPOSITE: a remote primeradiant
 * brand <img> beacon was present).
 *
 * Here we assert the served HTML is network-free and neutrally branded:
 *   - the neutral brand text "Frontend Design — Visual Companion" is rendered,
 *   - NO "primeradiant" anywhere,
 *   - NO <img> beacon,
 *   - NO http(s):// absolute URL in the served document (ws:// to the local
 *     server is fine and is not an http(s) URL),
 *   - NO github.com/obra brand link.
 *
 * This is the string-level companion to egress.test.js, which proves the same
 * thing behaviorally (zero outbound sockets). Both realize A12.
 */

const { spawn } = require("child_process");
const http = require("http");
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const SERVER_PATH = path.join(__dirname, "../server.cjs");
const TOKEN = "testtoken-branding-0123456789abcdef";
const BRAND_TEXT = "Frontend Design — Visual Companion";

function cleanup(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function startServer({ port, dir }) {
  cleanup(dir);
  return spawn("node", [SERVER_PATH], {
    env: {
      ...process.env,
      BRAINSTORM_PORT: String(port),
      BRAINSTORM_DIR: dir,
      BRAINSTORM_TOKEN: TOKEN,
    },
  });
}

function waitForServer(server) {
  let stdout = "",
    stderr = "";
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error(`Server did not start. stderr: ${stderr}`)),
      5000,
    );
    server.stdout.on("data", (data) => {
      stdout += data.toString();
      if (stdout.includes("server-started")) {
        clearTimeout(timeout);
        resolve();
      }
    });
    server.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    server.on("error", reject);
  });
}

function fetchHtml(port) {
  return new Promise((resolve, reject) => {
    const headers = { Cookie: `brainstorm-key-${port}=${TOKEN}` };
    http
      .get(`http://localhost:${port}/`, { headers }, (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => resolve(body));
      })
      .on("error", reject);
  });
}

function writeFragment(dir) {
  const contentDir = path.join(dir, "content");
  fs.mkdirSync(contentDir, { recursive: true });
  fs.writeFileSync(
    path.join(contentDir, "screen.html"),
    "<h2>Pick a layout</h2>",
  );
}

async function withServer(options, fn) {
  const server = startServer(options);
  try {
    await waitForServer(server);
    await fn();
  } finally {
    if (server.exitCode === null && server.signalCode === null) {
      server.kill();
      await new Promise((resolve) => server.once("exit", resolve));
    }
    await sleep(100);
    cleanup(options.dir);
  }
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

// Asserts a served document is neutrally branded and network-free.
function assertNeutralAndNetworkFree(html, label) {
  assert(
    html.includes(BRAND_TEXT),
    `${label}: should render the neutral brand text "${BRAND_TEXT}"`,
  );
  assert(
    !/primeradiant/i.test(html),
    `${label}: must not reference the primeradiant brand endpoint`,
  );
  assert(!/<img\b/i.test(html), `${label}: must not contain any <img> beacon`);
  assert(
    !/https?:\/\//i.test(html),
    `${label}: must contain no absolute http(s):// URL (no remote asset/beacon)`,
  );
  assert(
    !/github\.com\/obra/i.test(html),
    `${label}: must not link to the upstream github brand`,
  );
}

async function main() {
  console.log("\n--- Telemetry strip / neutral rebrand (A12) ---");

  await test("framed screen is neutrally branded and network-free", async () => {
    const port = 3461;
    const dir = "/tmp/fd-branding-framed";
    await withServer({ port, dir }, async () => {
      writeFragment(dir);
      await sleep(300);
      const html = await fetchHtml(port);
      assert(
        html.includes("Pick a layout"),
        "framed screen should render the fragment",
      );
      assert(
        html.includes('<div class="header">'),
        "fragment should be wrapped in the frame",
      );
      assertNeutralAndNetworkFree(html, "framed screen");
    });
  });

  await test("waiting screen is neutrally branded and network-free", async () => {
    const port = 3462;
    const dir = "/tmp/fd-branding-waiting";
    await withServer({ port, dir }, async () => {
      const html = await fetchHtml(port);
      assert(
        html.includes("Waiting for the agent"),
        "waiting page should still render",
      );
      assertNeutralAndNetworkFree(html, "waiting screen");
    });
  });

  console.log(`\n--- Results: ${passed} passed, ${failed} failed ---`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
