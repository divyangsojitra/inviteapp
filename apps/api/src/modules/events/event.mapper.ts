import type { events } from "../../db/schema";
import type { EventDto } from "./event.types";

type EventRow = typeof events.$inferSelect;

export function toEventDto(row: EventRow): EventDto {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    status: row.status,
    primaryLanguage: row.primaryLanguage,
    timezone: row.timezone,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt?.toISOString() ?? null,
    venueName: row.venueName,
    address: row.address,
    mapUrl: row.mapUrl,
    slug: row.slug,
    isPublic: row.isPublic,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}
