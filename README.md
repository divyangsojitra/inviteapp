# Invieasy

Invieasy is a WhatsApp-first digital invitation and event engagement platform.

Core lifecycle:

```text
Create -> Share -> Remind -> RSVP -> Attend -> Remember
```

## Product Principles

- Guests can open invitations without installing the app.
- Public invitation pages are mobile-first, responsive, accessible, and SEO-ready.
- English, Hindi, and Gujarati are first-version requirements.
- Reminders and calendar support are core product differentiators.
- The platform supports joyful and solemn events, including weddings, birthdays, baby showers, housewarming, religious events, funerals, and memorials.

## Planned Stack

- Flutter for iOS and Android.
- Next.js for public invitation pages.
- TypeScript on Cloudflare Workers for APIs.
- PostgreSQL via Neon and Cloudflare Hyperdrive.
- Cloudflare R2 for media storage.
- Cloudflare Queues and Workflows for async jobs and reminders.
- Firebase Authentication for user identity.

## Repository Layout

```text
apps/
  api/          Cloudflare Worker API
  public-web/   Next.js public invitation website
  mobile/       Flutter mobile app
packages/
  shared/       Shared contracts and utility types
  ui-tokens/    Brand/design tokens
docs/           Product, architecture, security, and roadmap docs
```

## Current Stage

Phase 0: architecture, security foundation, reusable design system, and project scaffolding.
