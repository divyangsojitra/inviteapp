import type { EventService } from "../events/event.service";
import type { PublicRepository } from "./public.repository";
import type { PublicRsvpCommand, PublicRsvpDto } from "./public.types";
import { createEventCalendar } from "./calendar";

export class PublicService {
  constructor(
    private readonly eventService: EventService,
    private readonly publicRepository: PublicRepository
  ) {}

  async getPublishedEvent(slug: string) {
    return this.eventService.getPublicEvent(slug);
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
