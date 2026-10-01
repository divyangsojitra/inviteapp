import type { Database } from "../../db/client";
import { guests, rsvps } from "../../db/schema";
import type { PublicRsvpCommand } from "./public.types";

export class PublicRepository {
  constructor(private readonly db: Database) {}

  async createRsvp(eventId: string, command: PublicRsvpCommand) {
    const now = new Date();
    const fallbackGuest = {
      id: crypto.randomUUID(),
      eventId,
      name: command.name,
      phone: command.phone ?? null,
      email: command.email ?? null,
      guestToken: crypto.randomUUID(),
      preferredLanguage: command.preferredLanguage ?? null,
      maxPartySize: command.partySize,
      createdAt: now,
      updatedAt: now,
      deletedAt: null
    };
    const fallbackRsvp = {
      id: crypto.randomUUID(),
      eventId,
      guestId: fallbackGuest.id,
      status: command.status,
      partySize: command.partySize,
      answers: {},
      createdAt: now,
      updatedAt: now
    };

    if (!this.db) {
      return {
        guest: fallbackGuest,
        rsvp: fallbackRsvp
      };
    }

    const [guest] = await this.db
      .insert(guests)
      .values({
        eventId,
        name: command.name,
        phone: command.phone,
        email: command.email,
        guestToken: fallbackGuest.guestToken,
        preferredLanguage: command.preferredLanguage,
        maxPartySize: command.partySize
      })
      .returning();

    if (!guest) {
      throw new Error("Failed to save guest RSVP.");
    }

    const [rsvp] = await this.db
      .insert(rsvps)
      .values({
        eventId,
        guestId: guest.id,
        status: command.status,
        partySize: command.partySize,
        answers: {}
      })
      .returning();

    if (!rsvp) {
      throw new Error("Failed to save RSVP.");
    }

    return {
      guest,
      rsvp
    };
  }
}
