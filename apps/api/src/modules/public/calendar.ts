import type { EventDto } from "../events/event.types";

function formatIcsDate(value: string) {
  return value.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export function createEventCalendar(event: EventDto) {
  const functions = event.functions.length
    ? event.functions
    : [
        {
          id: event.id,
          title: event.title,
          description: null,
          startsAt: event.startsAt,
          endsAt: event.endsAt,
          venueName: event.venueName,
          address: event.address,
          mapUrl: event.mapUrl,
          sortOrder: 0
        }
      ];
  const eventBlocks = functions.flatMap((item) => {
    const startsAt = new Date(item.startsAt);
    const endsAt = item.endsAt
      ? new Date(item.endsAt)
      : new Date(startsAt.getTime() + 60 * 60 * 1000);
    const location = [item.venueName ?? event.venueName, item.address ?? event.address]
      .filter(Boolean)
      .join(", ");
    const directionsUrl = item.mapUrl ?? event.mapUrl;
    const description = [
      `Invitation: ${event.title}`,
      item.description,
      directionsUrl ? `Directions: ${directionsUrl}` : null
    ]
      .filter(Boolean)
      .join("\\n");

    return [
      "BEGIN:VEVENT",
      `UID:${item.id}@invieasy`,
      `DTSTAMP:${formatIcsDate(new Date().toISOString())}`,
      `DTSTART:${formatIcsDate(startsAt.toISOString())}`,
      `DTEND:${formatIcsDate(endsAt.toISOString())}`,
      `SUMMARY:${escapeIcsText(`${event.title} - ${item.title}`)}`,
      location ? `LOCATION:${escapeIcsText(location)}` : null,
      `DESCRIPTION:${escapeIcsText(description)}`,
      "END:VEVENT"
    ].filter(Boolean);
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Invieasy//Invitation Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...eventBlocks,
    "END:VCALENDAR"
  ]
    .filter(Boolean)
    .join("\r\n");
}
