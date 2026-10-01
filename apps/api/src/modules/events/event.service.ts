import type { EventRepository } from "./event.repository";
import { toEventDto } from "./event.mapper";
import type {
  CreateEventCommand,
  EventRsvpListDto,
  UpdateEventCommand
} from "./event.types";

export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async createEvent(ownerUserId: string, command: CreateEventCommand) {
    const event = await this.eventRepository.create(ownerUserId, command);

    return toEventDto(event);
  }

  async listEvents(ownerUserId: string, limit: number, offset: number) {
    const events = await this.eventRepository.list(ownerUserId, limit, offset);

    return events.map(toEventDto);
  }

  async getEvent(ownerUserId: string, id: string) {
    const event = await this.eventRepository.findById(ownerUserId, id);

    return event ? toEventDto(event) : null;
  }

  async getPublicEvent(slug: string) {
    const event = await this.eventRepository.findPublishedBySlug(slug);

    return event ? toEventDto(event) : null;
  }

  async updateEvent(ownerUserId: string, id: string, command: UpdateEventCommand) {
    const event = await this.eventRepository.update(ownerUserId, id, command);

    return event ? toEventDto(event) : null;
  }

  async listEventRsvps(ownerUserId: string, eventId: string) {
    const rsvps = await this.eventRepository.listRsvps(ownerUserId, eventId);

    if (!rsvps) {
      return null;
    }

    return rsvps.reduce<EventRsvpListDto>(
      (result, rsvp) => {
        result.summary.total += 1;
        result.summary[rsvp.status] += 1;
        result.summary.partySize += rsvp.partySize;
        result.guests.push({
          id: rsvp.id,
          guestId: rsvp.guestId,
          guestName: rsvp.guestName ?? "Guest",
          guestPhone: rsvp.guestPhone,
          guestEmail: rsvp.guestEmail,
          status: rsvp.status,
          partySize: rsvp.partySize,
          createdAt: rsvp.createdAt.toISOString()
        });

        return result;
      },
      {
        summary: {
          total: 0,
          yes: 0,
          no: 0,
          maybe: 0,
          pending: 0,
          partySize: 0
        },
        guests: []
      }
    );
  }
}
