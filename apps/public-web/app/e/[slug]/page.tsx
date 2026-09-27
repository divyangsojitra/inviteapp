import type { Metadata } from "next";

type EventPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params
}: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const title = `Invitation | ${slug}`;

  return {
    title,
    description: "View event details, RSVP, set a reminder, and get directions.",
    robots: {
      index: false,
      follow: false
    },
    openGraph: {
      title,
      description:
        "View event details, RSVP, set a reminder, and get directions.",
      type: "website"
    }
  };
}

export default async function PublicEventPage({ params }: EventPageProps) {
  const { slug } = await params;

  return (
    <main className="invite-page">
      <section className="invite-hero" aria-labelledby="event-title">
        <p className="eyebrow">You are invited</p>
        <h1 id="event-title">{slug.replaceAll("-", " ")}</h1>
        <p className="lead">Event details will appear here once published.</p>
        <div className="action-row" aria-label="Primary event actions">
          <a className="button primary" href="#rsvp">
            RSVP
          </a>
          <a className="button secondary" href="#reminder">
            Remind Me
          </a>
          <a className="button secondary" href="#directions">
            Directions
          </a>
        </div>
      </section>
    </main>
  );
}
