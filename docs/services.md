# Service Inventory

## Core

- Cloudflare DNS/CDN/WAF/Turnstile/Rate Limiting.
- Cloudflare Workers for API execution.
- Cloudflare Hyperdrive for PostgreSQL connectivity.
- Neon PostgreSQL as transactional source of truth.
- Cloudflare R2 for object storage.
- Cloudflare Queues for async jobs.
- Cloudflare Workflows for reminders and multi-step flows.
- Firebase Authentication for identity.

## Product Integrations

- Firebase Cloud Messaging for push notifications.
- Google Maps Platform for venue search and directions.
- Calendar links and `.ics` files for Google, Apple, and Outlook.
- Razorpay for India payments.
- Stripe for international payments.
- Meta WhatsApp Cloud API for WhatsApp notifications.
- MSG91 for India SMS.
- Twilio as international SMS fallback.
- Email provider: SES, Postmark, or Resend.

## AI Providers

Use an internal `AIProvider` abstraction. Initial candidates:

- Workers AI for low-cost generation/classification/translation where quality is acceptable.
- OpenAI or Gemini for premium-quality copy, complex language handling, and future multimodal work.

## Observability

- Cloudflare Workers Observability.
- Sentry for app and frontend errors.
- Product analytics provider such as PostHog.
