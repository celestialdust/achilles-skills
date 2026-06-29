'use strict';

/**
 * Egress guard (test-only). Preloaded into the companion's Node process via
 *   node -r ./egress-guard.cjs ../server.cjs
 * It records every OUTBOUND TCP client connection the process attempts and
 * appends one JSON line per attempt to the file named by process.env.EGRESS_LOG.
 *
 * Why net.Socket.prototype.connect is the right chokepoint: every Node TCP
 * client connection funnels through it — http.request, https.request (the TLS
 * socket wraps an underlying net.Socket that calls connect), and the `ws` client.
 * A hidden telemetry/brand beacon (fetch / sendBeacon equivalent / http.request)
 * therefore cannot leave the process without being recorded here. Inbound sockets
 * the server ACCEPTS are created from the listen handle, not via connect(), so
 * they are not recorded — exactly what we want for an egress-silence proof (A12).
 */

const net = require('net');
const fs = require('fs');

const LOG = process.env.EGRESS_LOG;

function record(entry) {
  if (!LOG) return;
  try {
    fs.appendFileSync(LOG, JSON.stringify(entry) + '\n');
  } catch (e) {
    /* best effort — never let the guard crash the process under test */
  }
}

function extractTarget(args) {
  let a0 = args[0];
  // net.connect/createConnection funnel into socket.connect(normalizeArgs(...)),
  // which passes a single [options, cb] ARRAY. Unwrap it to find the options.
  if (Array.isArray(a0)) a0 = a0[0];
  if (a0 && typeof a0 === 'object') {
    return { host: a0.host || a0.hostname || a0.path, port: a0.port };
  }
  // connect(port[, host][, connectListener])
  return { host: typeof args[1] === 'string' ? args[1] : undefined, port: a0 };
}

const origConnect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function patchedConnect(...args) {
  const { host, port } = extractTarget(args);
  record({ host: host === undefined ? null : String(host), port: port === undefined ? null : port });
  return origConnect.apply(this, args);
};
