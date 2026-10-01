"use client";

import { FormEvent, useState } from "react";
import {
  createPublicRsvp,
  getPublicCalendarUrl,
  type PublicRsvpDto,
  type SupportedLanguage
} from "../../../lib/invieasy-api";

type PublicEventActionsProps = {
  slug: string;
  primaryLanguage: SupportedLanguage;
};

type RsvpForm = {
  name: string;
  phone: string;
  email: string;
  status: PublicRsvpDto["status"];
  partySize: number;
};

const initialForm: RsvpForm = {
  name: "",
  phone: "",
  email: "",
  status: "yes",
  partySize: 1
};

export function PublicEventActions({
  slug,
  primaryLanguage
}: PublicEventActionsProps) {
  const [form, setForm] = useState<RsvpForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        <h2>Add this event to your calendar</h2>
        <p className="muted">
          Download a calendar invite so your phone can remind you before the
          event.
        </p>
        <a className="button primary" href={getPublicCalendarUrl(slug)}>
          Add to Calendar
        </a>
      </section>
    </>
  );
}
