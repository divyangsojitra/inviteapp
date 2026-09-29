"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from "firebase/auth";
import { firebaseAuth } from "../../lib/firebase";
import {
  CreateEventPayload,
  EventCategory,
  EventDto,
  SupportedLanguage,
  createEvent,
  listEvents
} from "../../lib/invieasy-api";

const eventCategories: { label: string; value: EventCategory }[] = [
  { label: "Wedding", value: "wedding" },
  { label: "Birthday", value: "birthday" },
  { label: "Engagement", value: "engagement" },
  { label: "Anniversary", value: "anniversary" },
  { label: "Godh Bharai", value: "godh_bharai" },
  { label: "Housewarming", value: "housewarming" },
  { label: "Religious Event", value: "religious" },
  { label: "Corporate Event", value: "corporate" },
  { label: "Funeral / Memorial", value: "funeral_memorial" },
  { label: "Custom", value: "custom" }
];

const languages: { label: string; value: SupportedLanguage }[] = [
  { label: "English", value: "en" },
  { label: "हिंदी", value: "hi" },
  { label: "ગુજરાતી", value: "gu" }
];

type FormState = {
  title: string;
  category: EventCategory;
  primaryLanguage: SupportedLanguage;
  startsAt: string;
  venueName: string;
  address: string;
  mapUrl: string;
};

const initialFormState: FormState = {
  title: "",
  category: "wedding",
  primaryLanguage: "en",
  startsAt: "",
  venueName: "",
  address: "",
  mapUrl: ""
};

function toPayload(form: FormState): CreateEventPayload {
  return {
    title: form.title.trim(),
    category: form.category,
    primaryLanguage: form.primaryLanguage,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    startsAt: new Date(form.startsAt).toISOString(),
    venueName: form.venueName.trim() || undefined,
    address: form.address.trim() || undefined,
    mapUrl: form.mapUrl.trim() || undefined
  };
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function HostDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [events, setEvents] = useState<EventDto[]>([]);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const firstName = useMemo(() => {
    if (!user?.displayName) {
      return "Host";
    }

    return user.displayName.split(" ")[0];
  }, [user?.displayName]);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
      setIsAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setEvents([]);
      return;
    }

    let isMounted = true;
    const authUser = user;

    async function loadEvents() {
      setIsLoading(true);
      setError(null);

      try {
        const token = await authUser.getIdToken();
        const data = await listEvents(token);

        if (isMounted) {
          setEvents(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load events.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadEvents();

    return () => {
      isMounted = false;
    };
  }, [user]);

  async function handleGoogleSignIn() {
    setError(null);
    await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
  }

  async function handleSignOut() {
    await signOut(firebaseAuth);
    setMessage(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const token = await user.getIdToken();
      const created = await createEvent(token, toPayload(form));
      setEvents((current) => [created, ...current]);
      setForm(initialFormState);
      setMessage("Event saved as a draft.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create event.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!isAuthReady) {
    return (
      <main className="host-shell">
        <section className="host-panel">
          <p className="eyebrow">Invieasy Host</p>
          <h1>Loading your workspace</h1>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="host-shell">
        <section className="host-panel auth-panel">
          <p className="eyebrow">Invieasy Host</p>
          <h1>Create invitations that guests remember.</h1>
          <p className="lead">
            Sign in to create your first event, save it securely, and prepare it
            for WhatsApp sharing, RSVP, and reminders.
          </p>
          <button className="button primary wide-button" onClick={handleGoogleSignIn}>
            Continue with Google
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="host-shell">
      <header className="host-header">
        <div>
          <p className="eyebrow">Host Dashboard</p>
          <h1>Welcome, {firstName}</h1>
        </div>
        <button className="button secondary" onClick={handleSignOut}>
          Sign out
        </button>
      </header>

      <section className="host-grid">
        <form className="host-panel event-form" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">New Draft</p>
            <h2>Create Event</h2>
          </div>

          <label className="field">
            <span>Event Name</span>
            <input
              required
              minLength={2}
              maxLength={120}
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="Riya & Rohan's Wedding"
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Event Type</span>
              <select
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value as EventCategory
                  }))
                }
              >
                {eventCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Language</span>
              <select
                value={form.primaryLanguage}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    primaryLanguage: event.target.value as SupportedLanguage
                  }))
                }
              >
                {languages.map((language) => (
                  <option key={language.value} value={language.value}>
                    {language.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field">
            <span>Date & Time</span>
            <input
              required
              type="datetime-local"
              value={form.startsAt}
              onChange={(event) =>
                setForm((current) => ({ ...current, startsAt: event.target.value }))
              }
            />
          </label>

          <label className="field">
            <span>Venue</span>
            <input
              maxLength={160}
              value={form.venueName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  venueName: event.target.value
                }))
              }
              placeholder="The Grand Banquet"
            />
          </label>

          <label className="field">
            <span>Address</span>
            <textarea
              maxLength={500}
              value={form.address}
              onChange={(event) =>
                setForm((current) => ({ ...current, address: event.target.value }))
              }
              placeholder="Add venue address for guests"
            />
          </label>

          <label className="field">
            <span>Google Maps Link</span>
            <input
              type="url"
              value={form.mapUrl}
              onChange={(event) =>
                setForm((current) => ({ ...current, mapUrl: event.target.value }))
              }
              placeholder="https://maps.google.com/..."
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}
          {message ? <p className="form-success">{message}</p> : null}

          <button className="button primary wide-button" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Draft Event"}
          </button>
        </form>

        <section className="host-panel">
          <div>
            <p className="eyebrow">My Events</p>
            <h2>Drafts</h2>
          </div>

          {isLoading ? <p className="muted">Loading events...</p> : null}

          {!isLoading && events.length === 0 ? (
            <div className="empty-state">
              <strong>No events yet</strong>
              <span>Your first saved draft will appear here.</span>
            </div>
          ) : null}

          <div className="event-list">
            {events.map((event) => (
              <article className="event-card" key={event.id}>
                <div>
                  <strong>{event.title}</strong>
                  <span>{formatEventDate(event.startsAt)}</span>
                </div>
                <span className="status-chip">{event.status}</span>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
