import type { CreateEventInput, UpdateEventInput } from "./event.schema";

export type EventStatus = "draft" | "published" | "cancelled" | "archived";

export type EventDto = {
  id: string;
  title: string;
  category: CreateEventInput["category"];
  status: EventStatus;
  primaryLanguage: CreateEventInput["primaryLanguage"];
  timezone: string;
  startsAt: string;
  endsAt: string | null;
  venueName: string | null;
  address: string | null;
  mapUrl: string | null;
  slug: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateEventCommand = CreateEventInput;
export type UpdateEventCommand = UpdateEventInput;
