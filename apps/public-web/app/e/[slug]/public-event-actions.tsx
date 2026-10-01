"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  createPublicReminder,
  createPublicRsvp,
  getPublicCalendarUrl,
  type PublicReminderDto,
  type PublicRsvpDto,
  type SupportedLanguage
} from "../../../lib/invieasy-api";

type PublicEventActionsProps = {
  slug: string;
  primaryLanguage: SupportedLanguage;
  startsAt: string;
};

type RsvpForm = {
  name: string;
  phone: string;
  email: string;
  status: PublicRsvpDto["status"];
  partySize: number;
};

type ReminderForm = {
  name: string;
  email: string;
  reminderOffset: ReminderOffset;
};

type ReminderOffset = "day_before" | "three_hours" | "one_hour";

type ReminderOption = {
  label: string;
  offset: ReminderOffset;
  scheduledAt: string;
};

const initialForm: RsvpForm = {
  name: "",
  phone: "",
  email: "",
  status: "yes",
  partySize: 1
};

const initialReminderForm: ReminderForm = {
  name: "",
  email: "",
  reminderOffset: "day_before"
};

const reminderOffsets: Array<{
  label: string;
  offset: ReminderOffset;
  millisecondsBeforeEvent: number;
}> = [
  {
    label: "1 day before",
    offset: "day_before",
    millisecondsBeforeEvent: 24 * 60 * 60 * 1000
  },
  {
    label: "3 hours before",
    offset: "three_hours",
    millisecondsBeforeEvent: 3 * 60 * 60 * 1000
  },
  {
    label: "1 hour before",
    offset: "one_hour",
    millisecondsBeforeEvent: 60 * 60 * 1000
  }
];

function buildReminderOptions(startsAt: string): ReminderOption[] {
  const eventStartsAt = new Date(startsAt).getTime();
  const now = Date.now();

  if (Number.isNaN(eventStartsAt)) {
    return [];
  }

  return reminderOffsets
    .map((option) => {
      const scheduledAt = new Date(
        eventStartsAt - option.millisecondsBeforeEvent
      );

      return {
        label: option.label,
        offset: option.offset,
        scheduledAt: scheduledAt.toISOString()
      };
    })
    .filter((option) => new Date(option.scheduledAt).getTime() > now);
}

function formatReminderDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function PublicEventActions({
  slug,
  primaryLanguage,
  startsAt
}: PublicEventActionsProps) {
  const [form, setForm] = useState<RsvpForm>(initialForm);
  const [reminderForm, setReminderForm] =
    useState<ReminderForm>(initialReminderForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSchedulingReminder, setIsSchedulingReminder] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);
  const [reminderError, setReminderError] = useState<string | null>(null);
  const reminderOptions = useMemo(
    () => buildReminderOptions(startsAt),
    [startsAt]
  );
  const selectedReminder =
    reminderOptions.find(
      (option) => option.offset === reminderForm.reminderOffset
    ) ?? reminderOptions[0];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const rsvp = await createPublicRsvp(slug, {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        status: form.status,
        partySize: form.partySize,
        preferredLanguage: primaryLanguage
      });

      setReminderForm((current) => ({
        ...current,
        name: form.name.trim(),
        email: form.email.trim() || current.email
      }));
      setForm(initialForm);
      setMessage(
        `Thanks, ${rsvp.guestName}. Your RSVP has been saved as ${rsvp.status}.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save RSVP.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReminderSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSchedulingReminder(true);
    setReminderMessage(null);
    setReminderError(null);

    if (!selectedReminder) {
      setReminderError("Email reminders are available before upcoming events.");
      setIsSchedulingReminder(false);
      return;
    }

    try {
      const reminder: PublicReminderDto = await createPublicReminder(slug, {
        name: reminderForm.name.trim(),
        email: reminderForm.email.trim(),
        scheduledAt: selectedReminder.scheduledAt,
        preferredLanguage: primaryLanguage
      });

      setReminderForm(initialReminderForm);
      setReminderMessage(
        `Reminder scheduled for ${reminder.guestName} on ${formatReminderDate(
          reminder.scheduledAt
        )}.`
      );
    } catch (err) {
      setReminderError(
        err instanceof Error ? err.message : "Unable to schedule reminder."
      );
    } finally {
      setIsSchedulingReminder(false);
    }
  }

  return (
    <>
      <section className="invite-section" id="rsvp">
        <p className="eyebrow">RSVP</p>
        <h2>Will you attend?</h2>
        <form className="rsvp-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Your Name</span>
            <input
              required
              maxLength={120}
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value
                }))
              }
              placeholder="Your full name"
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Phone</span>
              <input
                maxLength={32}
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    phone: event.target.value
                  }))
                }
                placeholder="Optional"
              />
            </label>

            <label className="field">
              <span>Email</span>
              <input
                type="email"
                maxLength={160}
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value
                  }))
                }
                placeholder="Optional"
              />
            </label>
          </div>

          <div className="segmented-actions" aria-label="RSVP response">
            {(["yes", "maybe", "no"] as const).map((status) => (
              <label
                className={`choice-card${
                  form.status === status ? " selected" : ""
                }`}
                key={status}
              >
                <input
                  checked={form.status === status}
                  name="status"
                  onChange={() =>
                    setForm((current) => ({
                      ...current,
                      status
                    }))
                  }
                  type="radio"
                  value={status}
                />
                <span>{status}</span>
              </label>
            ))}
          </div>

          <label className="field compact-field">
            <span>Guests Attending</span>
            <input
              min={1}
              max={20}
              type="number"
              value={form.partySize}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  partySize: Number(event.target.value)
                }))
              }
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}
          {message ? <p className="form-success">{message}</p> : null}

          <button className="button primary wide-button" disabled={isSubmitting}>
            {isSubmitting ? "Saving RSVP..." : "Submit RSVP"}
          </button>
        </form>
      </section>

      <section className="invite-section" id="reminder">
        <p className="eyebrow">Reminder</p>
        <h2>Remember this event</h2>
        <p className="muted">
          Download a calendar invite so your phone can remind you before the
          event, or schedule an email reminder for later.
        </p>
        <div className="reminder-actions">
          <a className="button primary" href={getPublicCalendarUrl(slug)}>
            Add to Calendar
          </a>
        </div>

        <form className="rsvp-form" onSubmit={handleReminderSubmit}>
          <label className="field">
            <span>Your Name</span>
            <input
              required
              maxLength={120}
              value={reminderForm.name}
              onChange={(event) =>
                setReminderForm((current) => ({
                  ...current,
                  name: event.target.value
                }))
              }
              placeholder="Your full name"
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              required
              type="email"
              maxLength={160}
              value={reminderForm.email}
              onChange={(event) =>
                setReminderForm((current) => ({
                  ...current,
                  email: event.target.value
                }))
              }
              placeholder="you@example.com"
            />
          </label>

          {reminderOptions.length > 0 ? (
            <label className="field">
              <span>Remind Me</span>
              <select
                value={selectedReminder?.offset}
                onChange={(event) =>
                  setReminderForm((current) => ({
                    ...current,
                    reminderOffset: event.target.value as ReminderOffset
                  }))
                }
              >
                {reminderOptions.map((option) => (
                  <option key={option.offset} value={option.offset}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="muted">
              Email reminders are available before upcoming events.
            </p>
          )}

          {reminderError ? (
            <p className="form-error">{reminderError}</p>
          ) : null}
          {reminderMessage ? (
            <p className="form-success">{reminderMessage}</p>
          ) : null}

          <button
            className="button secondary wide-button"
            disabled={isSchedulingReminder || reminderOptions.length === 0}
          >
            {isSchedulingReminder ? "Scheduling..." : "Schedule Email Reminder"}
          </button>
        </form>
      </section>
    </>
  );
}
