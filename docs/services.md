# Service Inventory

## Core

- Cloudflare DNS/CDN/WAF/Turnstile/Rate Limiting.
- Cloudflare Workers for API execution.
- Cloudflare Hyperdrive for PostgreSQL connectivity.
- Neon PostgreSQL as transactional source of truth.
- Cloudflare R2 for object storage.
- Cloudflare Queues for async jobs.
- Cloudflare Workflows for reminders and multi-step flows.
- Cloudflare Email Service for transactional reminders and confirmations.
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
- Cloudflare Email Service for transactional email.

## Email

Use Cloudflare Email Service as the default transactional email provider.

The API Worker binds Email Service with:

```toml
[[send_email]]
name = "EMAIL"
remote = true
```

Runtime configuration:

- `EMAIL_FROM_ADDRESS`: verified sender address, for example `reminders@yourdomain.com`.
- `EMAIL_REPLY_TO`: optional reply-to address.

The application keeps email behind an internal provider abstraction. Reminder delivery stays disabled unless both the Cloudflare binding and `EMAIL_FROM_ADDRESS` are configured, which prevents accidental sends from local development or placeholder domains.

Before production:

- Onboard the sending domain in Cloudflare Email Service.
- Confirm SPF, DKIM, DMARC, and bounce routing records.
- Send deliverability tests to Gmail, Outlook, Yahoo, and common Indian mailbox providers.
- Keep SMS and WhatsApp reminder channels behind the notification provider abstraction.

## AI Providers

Use an internal `AIProvider` abstraction. Initial candidates:

- Workers AI for low-cost generation/classification/translation where quality is acceptable.
- OpenAI or Gemini for premium-quality copy, complex language handling, and future multimodal work.

## Observability

- Cloudflare Workers Observability.
- Sentry for app and frontend errors.
- Product analytics provider such as PostHog.
