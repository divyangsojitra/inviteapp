import type { EventRepository } from "./event.repository";
import { toEventDto } from "./event.mapper";
import type { CreateEventCommand, UpdateEventCommand } from "./event.types";

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

  async updateEvent(ownerUserId: string, id: string, command: UpdateEventCommand) {
    const event = await this.eventRepository.update(ownerUserId, id, command);

    return event ? toEventDto(event) : null;
  }
}
