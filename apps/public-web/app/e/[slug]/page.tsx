import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicEvent, type EventDto } from "../../../lib/invieasy-api";
import { PublicEventActions } from "./public-event-actions";

export const dynamic = "force-dynamic";

type EventPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatEventDate(event: EventDto) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: event.timezone
  }).format(new Date(event.startsAt));
}

async function loadPublicEvent(slug: string) {
  try {
    return await getPublicEvent(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params
}: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await loadPublicEvent(slug);

  if (!event) {
    return {
      title: "Invitation not found | Invieasy",
      description: "This invitation is not available.",
      robots: {
        index: false,
        follow: false
      }
    };
  }

  const description = `${formatEventDate(event)}${
    event.venueName ? ` at ${event.venueName}` : ""
  }`;

  return {
    title: `${event.title} | Invieasy`,
    description,
    robots: {
      index: false,
      follow: false
    },
    openGraph: {
      title: event.title,
      description,
      type: "website"
    }
  };
}

export default async function PublicEventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await loadPublicEvent(slug);

  if (!event) {
    notFound();
  }

  const directionsUrl =
    event.mapUrl ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      [event.venueName, event.address].filter(Boolean).join(", ")
    )}`;

  return (
    <main className="invite-page">
      <section className="invite-hero" aria-labelledby="event-title">
        <p className="eyebrow">You are invited</p>
        <h1 id="event-title">{event.title}</h1>
        <p className="lead">{formatEventDate(event)}</p>
        <div className="event-detail-stack">
          {event.venueName ? (
            <div>
              <span>Venue</span>
              <strong>{event.venueName}</strong>
            </div>
          ) : null}
          {event.address ? (
            <div>
              <span>Address</span>
              <strong>{event.address}</strong>
            </div>
          ) : null}
          <div>
            <span>Language</span>
            <strong>{event.primaryLanguage.toUpperCase()}</strong>
          </div>
        </div>
        <div className="action-row" aria-label="Primary event actions">
          <a className="button primary" href="#rsvp">
            RSVP
          </a>
          <a className="button secondary" href="#reminder">
            Remind Me
          </a>
          <a
            className="button secondary"
            href={directionsUrl}
            rel="noreferrer"
            target="_blank"
          >
            Directions
          </a>
        </div>
      </section>

      <PublicEventActions
        primaryLanguage={event.primaryLanguage}
        slug={event.slug}
      />
    </main>
  );
}
