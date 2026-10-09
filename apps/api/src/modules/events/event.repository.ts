import { and, asc, desc, eq, inArray } from "drizzle-orm";
import type { Database } from "../../db/client";
import { eventFunctions, events, guests, rsvps } from "../../db/schema";
import { createEventSlug } from "./event.slug";
import type { CreateEventCommand, UpdateEventCommand } from "./event.types";

type EventRow = typeof events.$inferSelect;
type EventFunctionRow = typeof eventFunctions.$inferSelect;
type EventWithFunctions = EventRow & { functions: EventFunctionRow[] };

export class EventRepository {
  constructor(private readonly db: Database) {}

  async create(ownerUserId: string, command: CreateEventCommand) {
    const now = new Date();
    const fallbackEventId = crypto.randomUUID();
    const fallback = {
      id: fallbackEventId,
      createdBy: ownerUserId,
      title: command.title,
      category: command.category,
      status: "draft" as const,
      primaryLanguage: command.primaryLanguage,
      timezone: command.timezone,
      startsAt: new Date(command.startsAt),
      endsAt: null,
      venueName: command.venueName ?? null,
      address: command.address ?? null,
      mapUrl: command.mapUrl ?? null,
      slug: createEventSlug(command.title),
      isPublic: false,
      functions: command.functions
        ? command.functions.map((item, index) => ({
            id: crypto.randomUUID(),
            eventId: fallbackEventId,
            title: item.title,
            description: item.description ?? null,
            startsAt: new Date(item.startsAt),
            endsAt: item.endsAt ? new Date(item.endsAt) : null,
            venueName: item.venueName ?? null,
            address: item.address ?? null,
            mapUrl: item.mapUrl ?? null,
            sortOrder: index,
            createdAt: now,
            updatedAt: now
          }))
        : [],
      settings: {},
      createdAt: now,
      updatedAt: now,
      deletedAt: null
    };

    if (!this.db) {
      return fallback;
    }

    const [created] = await this.db
      .insert(events)
      .values({
        title: command.title,
        category: command.category,
        createdBy: ownerUserId,
        primaryLanguage: command.primaryLanguage,
        timezone: command.timezone,
        startsAt: new Date(command.startsAt),
        venueName: command.venueName,
        address: command.address,
        mapUrl: command.mapUrl,
        slug: fallback.slug
      })
      .returning();

    if (!created) {
      throw new Error("Failed to create event.");
    }

    const functions = command.functions?.length
      ? await this.db
          .insert(eventFunctions)
          .values(
            command.functions.map((item, index) => ({
              eventId: created.id,
              title: item.title,
              description: item.description,
              startsAt: new Date(item.startsAt),
              endsAt: item.endsAt ? new Date(item.endsAt) : undefined,
              venueName: item.venueName,
              address: item.address,
              mapUrl: item.mapUrl,
              sortOrder: index
            }))
          )
          .returning()
      : [];

    return {
      ...created,
      functions
    };
  }

  async list(ownerUserId: string, limit: number, offset: number) {
    if (!this.db) {
      return [];
    }

    const ownerEvents = await this.db
      .select()
      .from(events)
      .where(eq(events.createdBy, ownerUserId))
      .orderBy(desc(events.createdAt))
      .limit(limit)
      .offset(offset);

    return this.withFunctions(ownerEvents);
  }

  async findById(ownerUserId: string, id: string) {
    if (!this.db) {
      return null;
    }

    const [event] = await this.db
      .select()
      .from(events)
      .where(and(eq(events.id, id), eq(events.createdBy, ownerUserId)))
      .limit(1);

    return event ? this.withFunctionsForEvent(event) : null;
  }

  async findPublishedBySlug(slug: string) {
    if (!this.db) {
      return null;
    }

    const [event] = await this.db
      .select()
      .from(events)
      .where(
        and(
          eq(events.slug, slug),
          eq(events.status, "published"),
          eq(events.isPublic, true)
        )
      )
      .limit(1);

    return event ? this.withFunctionsForEvent(event) : null;
  }

  async update(ownerUserId: string, id: string, command: UpdateEventCommand) {
    if (!this.db) {
      return null;
    }

    const { functions: _functions, ...eventCommand } = command;
    const [updated] = await this.db
      .update(events)
      .set({
        ...eventCommand,
        startsAt: eventCommand.startsAt
          ? new Date(eventCommand.startsAt)
          : undefined,
        updatedAt: new Date()
      })
      .where(and(eq(events.id, id), eq(events.createdBy, ownerUserId)))
      .returning();

    return updated ? this.withFunctionsForEvent(updated) : null;
  }

  async listRsvps(ownerUserId: string, eventId: string) {
    if (!this.db) {
      return [];
    }

    const event = await this.findById(ownerUserId, eventId);

    if (!event) {
      return null;
    }

    return this.db
      .select({
        id: rsvps.id,
        guestId: rsvps.guestId,
        guestName: guests.name,
        guestPhone: guests.phone,
        guestEmail: guests.email,
        status: rsvps.status,
        partySize: rsvps.partySize,
        createdAt: rsvps.createdAt
      })
      .from(rsvps)
      .leftJoin(guests, eq(rsvps.guestId, guests.id))
      .where(eq(rsvps.eventId, eventId))
      .orderBy(desc(rsvps.createdAt));
  }

  private async withFunctionsForEvent(
    event: EventRow
  ): Promise<EventWithFunctions> {
    if (!this.db) {
      return {
        ...event,
        functions: []
      };
    }

    const functions = await this.db
      .select()
      .from(eventFunctions)
      .where(eq(eventFunctions.eventId, event.id))
      .orderBy(asc(eventFunctions.sortOrder), asc(eventFunctions.startsAt));

    return {
      ...event,
      functions
    };
  }

  private async withFunctions(eventsToHydrate: EventRow[]) {
    if (!this.db) {
      return eventsToHydrate.map((event) => ({
        ...event,
        functions: []
      }));
    }

    if (!eventsToHydrate.length) {
      return [];
    }

    const functions = await this.db
      .select()
      .from(eventFunctions)
      .where(
        inArray(
          eventFunctions.eventId,
          eventsToHydrate.map((event) => event.id)
        )
      )
      .orderBy(asc(eventFunctions.sortOrder), asc(eventFunctions.startsAt));
    const functionsByEventId = functions.reduce<Record<string, EventFunctionRow[]>>(
      (result, item) => {
        result[item.eventId] = [...(result[item.eventId] ?? []), item];

        return result;
      },
      {}
    );

    return eventsToHydrate.map((event) => ({
      ...event,
      functions: functionsByEventId[event.id] ?? []
    }));
  }
}
