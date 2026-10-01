import type { Database } from "../../db/client";
import { guests, reminders, rsvps } from "../../db/schema";
import type {
  PublicReminderCommand,
  PublicRsvpCommand
} from "./public.types";

export class PublicRepository {
  constructor(private readonly db: Database) {}

  async createReminder(eventId: string, command: PublicReminderCommand) {
    const now = new Date();
    const scheduledAt = new Date(command.scheduledAt);
    const fallbackGuest = {
      id: crypto.randomUUID(),
      eventId,
      name: command.name,
      phone: null,
      email: command.email,
      guestToken: crypto.randomUUID(),
      preferredLanguage: command.preferredLanguage ?? null,
      maxPartySize: 1,
      createdAt: now,
      updatedAt: now,
      deletedAt: null
    };
    const fallbackReminder = {
      id: crypto.randomUUID(),
      eventId,
      guestId: fallbackGuest.id,
      channel: "email" as const,
      status: "scheduled" as const,
      scheduledAt,
      sentAt: null,
      retryCount: 0,
      metadata: {
        source: "public_invite"
      },
      createdAt: now,
      updatedAt: now
    };

    if (!this.db) {
      return {
        guest: fallbackGuest,
        reminder: fallbackReminder
      };
    }

    const [guest] = await this.db
      .insert(guests)
      .values({
        eventId,
        name: command.name,
        email: command.email,
        guestToken: fallbackGuest.guestToken,
        preferredLanguage: command.preferredLanguage,
        maxPartySize: 1
      })
      .returning();

    if (!guest) {
      throw new Error("Failed to save reminder guest.");
    }

    const [reminder] = await this.db
      .insert(reminders)
      .values({
        eventId,
        guestId: guest.id,
        channel: "email",
        status: "scheduled",
        scheduledAt,
        metadata: {
          source: "public_invite"
        }
      })
      .returning();

    if (!reminder) {
      throw new Error("Failed to save reminder.");
    }

    return {
      guest,
      reminder
    };
  }

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
