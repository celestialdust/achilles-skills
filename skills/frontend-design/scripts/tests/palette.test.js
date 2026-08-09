/**
 * Tests for palette.mjs — the brand-seed picker ported from Impeccable.
 *
 * Three things are worth proving about a ported script, and only the first is
 * about colour:
 *
 *  1. It behaves — deterministic under a key, random without one, and the
 *     documented flags do what the docstring says.
 *  2. Every invocation printed in its own Usage block actually runs. The suite
 *     already shipped one script documented with a command that fails, and the
 *     seed id in this file's upstream docstring did not exist. A docstring
 *     nobody executes is a comment, not documentation.
 *  3. It opens no socket. Its upstream sibling (concept-seed.mjs) POSTs
 *     telemetry, so "this one doesn't" is a claim that has to be proved
 *     behaviourally rather than by reading the source — same standard as the
 *     A12 egress proof in egress.test.js, and with the same positive control.
 */

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync, spawnSync } = require("child_process");

const PALETTE = path.join(__dirname, "../palette.mjs");
const GUARD = path.join(__dirname, "egress-guard.cjs");

let passed = 0,
  failed = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL: ${name}`);
    console.log(`    ${e.message}`);
    failed++;
  }
}

/** Run palette.mjs and return { status, stdout, stderr }. Never throws on a bad exit. */
function run(args = [], env = {}) {
  const r = spawnSync(process.execPath, [PALETTE, ...args], {
    encoding: "utf-8",
    env: { ...process.env, ...env },
  });
  return { status: r.status, stdout: r.stdout || "", stderr: r.stderr || "" };
}

/** The `seed-NNN` id from a run's output. */
function seedId(stdout) {
  const m = stdout.match(/BRAND SEED · (seed-\d+)/);
  assert.ok(m, `no seed id in output: ${stdout.slice(0, 120)}`);
  return m[1];
}

console.log("\n--- Selection behaviour ---");

test("a key picks the same seed every time", () => {
  const a = seedId(run(["--from", "achilles"]).stdout);
  const b = seedId(run(["--from", "achilles"]).stdout);
  assert.strictEqual(a, b, "same key must yield the same seed");
});

test("different keys spread across the seed set", () => {
  const ids = new Set();
  for (let i = 0; i < 24; i++)
    ids.add(seedId(run(["--from", `key-${i}`]).stdout));
  assert.ok(
    ids.size > 1,
    `24 distinct keys collapsed to one seed (${[...ids]})`,
  );
});

test("BRAINSTORM_PALETTE_SEED is equivalent to --from", () => {
  const viaFlag = seedId(run(["--from", "same-key"]).stdout);
  const viaEnv = seedId(
    run([], { BRAINSTORM_PALETTE_SEED: "same-key" }).stdout,
  );
  assert.strictEqual(
    viaEnv,
    viaFlag,
    "env var and flag must resolve identically",
  );
});

test("--id returns exactly the seed asked for", () => {
  assert.strictEqual(seedId(run(["--id", "seed-000"]).stdout), "seed-000");
});

test("an unknown --id exits 2 and says so", () => {
  const r = run(["--id", "seed-does-not-exist"]);
  assert.strictEqual(r.status, 2, `expected exit 2, got ${r.status}`);
  assert.match(r.stderr, /no seed with id/);
});

console.log("\n--- The docstring is executable ---");

test("every invocation in the Usage block runs and exits 0", () => {
  const src = fs.readFileSync(PALETTE, "utf-8");
  const usage = [
    ...src.matchAll(
      /^\s*\*\s+node scripts\/palette\.mjs\s*(.*?)\s*(?:#.*)?$/gm,
    ),
  ]
    .map((m) => m[1].trim())
    .filter(Boolean);
  assert.ok(
    usage.length >= 2,
    `expected documented flag invocations, found ${usage.length}`,
  );
  for (const line of usage) {
    const r = run(line.split(/\s+/));
    assert.strictEqual(
      r.status,
      0,
      `documented invocation failed: "palette.mjs ${line}" -> exit ${r.status} ${r.stderr}`,
    );
  }
});

test("the port left no Impeccable-specific paths or env vars behind", () => {
  const src = fs.readFileSync(PALETTE, "utf-8");
  for (const needle of ["IMPECCABLE_", "impeccable.style", ".impeccable/"]) {
    assert.ok(
      !src.includes(needle),
      `ported file still references "${needle}"`,
    );
  }
});

console.log("\n--- Egress silence ---");

/** Run a node program under the egress guard; return the recorded connects. */
function connectsUnderGuard(nodeArgs) {
  const log = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), "palette-egress-")),
    "egress.log",
  );
  spawnSync(process.execPath, ["-r", GUARD, ...nodeArgs], {
    encoding: "utf-8",
    env: { ...process.env, EGRESS_LOG: log },
  });
  if (!fs.existsSync(log)) return [];
  return fs
    .readFileSync(log, "utf-8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map(JSON.parse);
}

const LOOPBACK = /^(127\.|::1$|localhost$)/;

test("positive control: the guard does record an outbound connect", () => {
  const recorded = connectsUnderGuard([
    "-e",
    "require('net').connect(80, 'example.com').on('error', () => {}).destroy()",
  ]);
  const external = recorded.filter((c) => c.host && !LOOPBACK.test(c.host));
  assert.ok(
    external.length > 0,
    "guard recorded nothing — the egress assertion below would be vacuous",
  );
});

test("palette.mjs opens zero outbound sockets", () => {
  const recorded = connectsUnderGuard([PALETTE, "--from", "egress-check"]);
  const external = recorded.filter((c) => c.host && !LOOPBACK.test(c.host));
  assert.deepStrictEqual(
    external,
    [],
    `palette.mjs attempted egress: ${JSON.stringify(external)}`,
  );
});

console.log(`\n--- Results: ${passed} passed, ${failed} failed ---`);
if (failed > 0) process.exit(1);
