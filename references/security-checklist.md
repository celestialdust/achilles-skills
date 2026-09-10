# Security checklist

The pre-PR security pass, behind `security-and-hardening`; `code-review` cites it for its security axis.
A Critical or High finding, or a secret in the diff, is a stop-list item (`references/safety-rails.md`).
The sections below cover the [OWASP Top 10](https://owasp.org/Top10/) and the
[GenAI](https://genai.owasp.org/llm-top-10/) ten for LLM features.

## Threat modelling — first

- Map trust boundaries: requests, uploads, webhooks, third-party APIs, LLM output
- Name the assets: credentials, PII, payment data, admin actions, money movement
- Run STRIDE per boundary, and write abuse cases beside the use cases

## Pre-commit

- `git diff --cached | grep -iE "password|secret|api_key|token"` clean; `.gitignore` covers `.env`,
  `*.pem`, `*.key`; `.env.example` holds placeholders only

## Authentication

- Passwords hashed with bcrypt (≥12 rounds), scrypt, or argon2
- Session cookies `httpOnly`, `secure`, `sameSite: 'lax'`, with an expiry
- Rate-limit the API, with a stricter limit on authentication endpoints (≤10 / 15 min); repeated
  failures lock out, with notification
- Reset tokens time-limited (≤1 hour), single-use; MFA for sensitive operations

## Authorization

- Every protected endpoint checks authentication
- Every resource access checks ownership or role (IDOR)
- Admin endpoints verify the role; API keys scoped to the minimum; JWTs validated on signature, expiry
  and issuer

## Input validation

- Schema-validate at the boundary (API routes, form handlers), by allowlist, never denylist, returning a
  typed validation error rather than a boolean
- Constrain string length and numeric range; parse email, URL and date with a library
- Restrict upload type, limit size, verify content
- Parameterize SQL, never concatenate; encode HTML output via framework auto-escaping, and sanitize
  anything rendered as HTML deliberately
- Validate redirect URLs; allowlist server-side fetches, blocking private and reserved IPs (SSRF)

## Headers and CORS

```
Content-Security-Policy: default-src 'self'; script-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff · X-Frame-Options: DENY · X-XSS-Protection: 0 (rely on CSP)
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Name CORS origins, methods and headers explicitly. Never `origin: '*'` in production.

## Data protection

- Exclude sensitive fields from responses (`passwordHash`, `resetToken`); never log passwords, tokens or
  full card numbers, and do log security events (auth, access denials)
- Source secrets from environment variables, failing at startup when one is absent
- Encrypt PII at rest where regulation requires it, and backups; HTTPS externally

## Dependencies

- `npm audit --audit-level=critical` clean, or the ecosystem's equivalent
- Lockfile committed; CI installs with `npm ci`, never `npm install`
- Review a new dependency's maintenance, downloads and `postinstall` scripts, and watch for typosquats
- Verify updates and build artifacts (signatures, checksums) before trusting them

## AI / LLM features

- Treat model output as untrusted — never into `eval`, SQL, shell, `innerHTML`, or a file path
- Assume prompt injection; enforce permissions in code, never in the system prompt
- Keep secrets, cross-tenant data and full system prompts out of the context window
- Scope tool permissions; validate every tool argument; confirm destructive actions; cap tokens, rate
  and recursion depth
- Vet models, datasets and plugins like any dependency, and the data behind fine-tuning and RAG
- Partition RAG embeddings per tenant; validate documents before indexing
- Ground answers with citations; keep a human in the loop where a wrong answer costs something

## Error handling

Production errors return a code and a generic message — never `err.message`, a stack, or the SQL.
