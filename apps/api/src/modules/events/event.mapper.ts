import type { eventFunctions, events } from "../../db/schema";
import type { EventDto, EventFunctionDto } from "./event.types";

type EventRow = typeof events.$inferSelect;
type EventFunctionRow = typeof eventFunctions.$inferSelect;

export function toEventFunctionDto(row: EventFunctionRow): EventFunctionDto {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt?.toISOString() ?? null,
    venueName: row.venueName,
    address: row.address,
    mapUrl: row.mapUrl,
    sortOrder: row.sortOrder
  };
}

export function toEventDto(
  row: EventRow & { functions?: EventFunctionRow[] }
): EventDto {
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
    functions: (row.functions ?? []).map(toEventFunctionDto),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}
