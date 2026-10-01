import type { EventService } from "../events/event.service";
import type { PublicRepository } from "./public.repository";
import type {
  PublicReminderCommand,
  PublicReminderDto,
  PublicRsvpCommand,
  PublicRsvpDto
} from "./public.types";
import { createEventCalendar } from "./calendar";

export class PublicService {
  constructor(
    private readonly eventService: EventService,
    private readonly publicRepository: PublicRepository
  ) {}

  async getPublishedEvent(slug: string) {
    return this.eventService.getPublicEvent(slug);
  }

  async createReminder(slug: string, command: PublicReminderCommand) {
    const event = await this.getPublishedEvent(slug);

    if (!event) {
      return {
        ok: false as const,
        reason: "not_found" as const
      };
    }

    const scheduledAt = new Date(command.scheduledAt);
    const eventStartsAt = new Date(event.startsAt);

    if (
      Number.isNaN(scheduledAt.getTime()) ||
      scheduledAt <= new Date() ||
      scheduledAt > eventStartsAt
    ) {
      return {
        ok: false as const,
        reason: "invalid_schedule" as const
      };
    }

    const { guest, reminder } = await this.publicRepository.createReminder(
      event.id,
      command
    );

    return {
      ok: true as const,
      data: {
        id: reminder.id,
        eventId: reminder.eventId,
        guestId: guest.id,
        channel: "email",
        status: reminder.status,
        scheduledAt: reminder.scheduledAt.toISOString(),
        guestName: guest.name,
        createdAt: reminder.createdAt.toISOString()
      } satisfies PublicReminderDto
    };
  }

  async createRsvp(slug: string, command: PublicRsvpCommand) {
    const event = await this.getPublishedEvent(slug);

    if (!event) {
      return null;
    }

    const { guest, rsvp } = await this.publicRepository.createRsvp(
      event.id,
      command
    );

    return {
      id: rsvp.id,
      eventId: rsvp.eventId,
      guestId: guest.id,
      status: command.status,
      partySize: rsvp.partySize,
      guestName: guest.name,
      createdAt: rsvp.createdAt.toISOString()
    } satisfies PublicRsvpDto;
  }

  async createCalendar(slug: string) {
    const event = await this.getPublishedEvent(slug);

    return event ? createEventCalendar(event) : null;
  }
}
