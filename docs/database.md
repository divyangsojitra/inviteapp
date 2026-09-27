# Database Strategy

PostgreSQL is the transactional source of truth.

Recommended provider:

```text
Neon PostgreSQL -> Cloudflare Hyperdrive -> Cloudflare Workers
```

## Initial Tables

```text
users
events
event_functions
invitations
templates
guests
guest_groups
guest_group_members
rsvps
rsvp_answers
reminders
notifications
media
payments
donations
event_updates
audit_logs
```

Later phases add:

```text
vendors
vendor_categories
vendor_leads
gallery_items
video_jobs
ai_jobs
subscriptions
```

## Shared Columns

Most primary entities should include:

```text
id uuid primary key
created_at timestamptz not null
updated_at timestamptz not null
created_by uuid
status text not null
deleted_at timestamptz
```

## Public Links

Do not expose sequential database IDs.

Use:

- UUIDs internally.
- Public event slugs for invite pages.
- Random guest tokens for personalized RSVP links.

Example:

```text
/e/rohan-priya-X7Q9
/e/rohan-priya-X7Q9?g=random-guest-token
```

Guest tokens must be random, unguessable, revocable, and safe to invalidate.
