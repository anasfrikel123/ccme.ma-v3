# auth.md — Agent Authentication & Registration (CCME)

This document describes how AI agents and LLM tools can authenticate and interact with the CCME (Consulting Maghreb Expertise) platform services.

## Registration

```yaml
registration_required: false
register_uri: null      # no registration — APIs are open, read-only
auth_type: none         # no OAuth/OIDC; no API key or token needed
protected_resources: [] # none exposed to agents
```

Currently, the CCME agent-facing APIs and tools are **publicly accessible** for discovery and informational queries (read-only). No API key or registration is required for:
- `/api/services.json`
- `/api/blog.json`
- `/api/cabinet.json`

## Interaction Constraints

- **Rate Limiting**: Standard Cloudflare edge rate limits apply. Excessive crawling or tool execution may result in temporary IP blocks.
- **Honeypots**: The `/contact` and newsletter forms use honeypot fields. Agents should identify these via `aria-hidden="true"` or `tabindex="-1"` and leave them empty to avoid submission rejection.

## Discovery Metadata

- **OAuth/OIDC**: Not applicable (public access).
- **Protected Resources**: None currently exposed to agents.

## AI Policy

See [/.well-known/ai.txt](https://ccme.ma/.well-known/ai.txt) for the full policy on training and attribution.
