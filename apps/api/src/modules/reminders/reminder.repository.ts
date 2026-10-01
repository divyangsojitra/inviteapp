import { and, eq, lte, sql } from "drizzle-orm";
import type { Database } from "../../db/client";
import { events, guests, reminders } from "../../db/schema";
import type { DueReminder } from "./reminder.types";

export class ReminderRepository {
  constructor(private readonly db: Database) {}

  async listDueEmailReminders(now: Date, limit: number): Promise<DueReminder[]> {
    if (!this.db) {
      return [];
    }

    return this.db
      .select({
        id: reminders.id,
        eventId: reminders.eventId,
        guestId: reminders.guestId,
        scheduledAt: reminders.scheduledAt,
        guestName: guests.name,
        guestEmail: guests.email,
        eventTitle: events.title,
        eventSlug: events.slug,
        eventStartsAt: events.startsAt,
        eventVenueName: events.venueName,
        eventAddress: events.address
      })
      .from(reminders)
      .innerJoin(events, eq(reminders.eventId, events.id))
      .leftJoin(guests, eq(reminders.guestId, guests.id))
      .where(
        and(
          eq(reminders.channel, "email"),
          eq(reminders.status, "scheduled"),
          eq(events.status, "published"),
          lte(reminders.scheduledAt, now)
        )
      )
      .limit(limit);
  }

  async markSent(reminderId: string, sentAt: Date) {
    if (!this.db) {
      return;
    }

    await this.db
      .update(reminders)
      .set({
        status: "sent",
        sentAt,
        updatedAt: sentAt
      })
      .where(
        and(eq(reminders.id, reminderId), eq(reminders.status, "scheduled"))
      );
  }

  async markFailed(reminderId: string, reason: string) {
    if (!this.db) {
      return;
    }

    await this.db
      .update(reminders)
      .set({
        status: "failed",
        retryCount: sql`${reminders.retryCount} + 1`,
        metadata: {
          failureReason: reason
        },
        updatedAt: new Date()
      })
      .where(
        and(eq(reminders.id, reminderId), eq(reminders.status, "scheduled"))
      );
  }
}
