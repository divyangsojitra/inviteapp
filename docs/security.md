# Security Standards

## Baseline

- HTTPS everywhere.
- Cloudflare WAF, DDoS protection, Turnstile, and rate limiting.
- Firebase Authentication for user identity.
- Application-level authorization for every private resource.
- UUIDs for internal IDs and random slugs/tokens for public links.
- No secrets in mobile apps, frontend bundles, or git.
- Separate development, staging, and production environments.

## Public Invitation Security

- Guests do not need app login.
- Public event endpoints return only public event data.
- Guest-specific RSVP links use random, unguessable, revocable tokens.
- Guest-specific links must be `noindex`.

## File Upload Security

- Upload files directly to R2 using short-lived signed upload URLs.
- Validate MIME type, extension, size, image dimensions, and video duration.
- Never execute uploaded files.
- Keep original media metadata in PostgreSQL.

## Validation

Validate all input server-side:

- event fields
- phone/email
- URLs
- RSVP counts
- reminder times
- payment amounts
- media metadata
- template IDs

Use shared schemas where practical.

## Audit Logging

Log important actions:

- event created/updated/deleted
- invite published
- guest imported
- RSVP submitted
- reminder scheduled/sent
- payment completed/refunded
- vendor approved
- admin changes

Audit records should include actor, action, entity, entity ID, timestamp, IP, and metadata.
