import { and, desc, eq } from "drizzle-orm";
import type { Database } from "../../db/client";
import { events } from "../../db/schema";
import { createEventSlug } from "./event.slug";
import type { CreateEventCommand, UpdateEventCommand } from "./event.types";

export class EventRepository {
  constructor(private readonly db: Database) {}

  async create(ownerUserId: string, command: CreateEventCommand) {
    const now = new Date();
    const fallback = {
      id: crypto.randomUUID(),
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

    return created;
  }

  async list(ownerUserId: string, limit: number, offset: number) {
    if (!this.db) {
      return [];
    }

    return this.db
      .select()
      .from(events)
      .where(eq(events.createdBy, ownerUserId))
      .orderBy(desc(events.createdAt))
      .limit(limit)
      .offset(offset);
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

    return event ?? null;
  }

  async update(ownerUserId: string, id: string, command: UpdateEventCommand) {
    if (!this.db) {
      return null;
    }

    const [updated] = await this.db
      .update(events)
      .set({
        ...command,
        startsAt: command.startsAt ? new Date(command.startsAt) : undefined,
        updatedAt: new Date()
      })
      .where(and(eq(events.id, id), eq(events.createdBy, ownerUserId)))
      .returning();

    return updated ?? null;
  }
}
