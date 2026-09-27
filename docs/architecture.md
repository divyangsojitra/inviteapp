# Architecture

## High-level System

```text
Flutter Mobile / Host Web
        |
        v
Cloudflare DNS/WAF/Turnstile
        |
        v
Cloudflare Workers API
        |
  ------------------------------
  |        |        |          |
Hyperdrive R2      Queues     Workflows
  |        |        |          |
Neon      Media    Jobs       Reminders
Postgres
```

Public invitation pages use Next.js and are optimized for mobile, SEO, Open Graph previews, and fast WhatsApp link loading.

## Applications

- `apps/api`: Cloudflare Worker API, TypeScript.
- `apps/public-web`: Next.js public invitation website.
- `apps/mobile`: Flutter mobile app.

## Packages

- `packages/shared`: shared API contracts and domain types.
- `packages/ui-tokens`: design tokens for colors, spacing, radii, typography, and breakpoints.

## Backend Module Boundaries

- Authentication
- Users
- Events
- Event Functions
- Invitations
- Templates
- Guests
- RSVP
- Reminders
- Notifications
- Media
- Payments
- Donations
- AI
- Video Rendering
- Vendors
- Analytics
- Admin

Each module should keep controllers, services, repositories, validation, types, and tests separate.

## Public vs Private APIs

Use separate response contracts:

- `/v1/public/*` for guest-facing invite pages.
- `/v1/*` for authenticated host/admin APIs.

Public responses must never expose guest lists, phone numbers, emails, payment details, or internal host notes.
