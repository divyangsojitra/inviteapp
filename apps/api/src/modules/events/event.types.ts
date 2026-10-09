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
  functions: EventFunctionDto[];
  createdAt: string;
  updatedAt: string;
};

export type EventFunctionDto = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  venueName: string | null;
  address: string | null;
  mapUrl: string | null;
  sortOrder: number;
};

export type EventRsvpDto = {
  id: string;
  guestId: string | null;
  guestName: string;
  guestPhone: string | null;
  guestEmail: string | null;
  status: "pending" | "yes" | "no" | "maybe";
  partySize: number;
  createdAt: string;
};

export type EventRsvpSummaryDto = {
  total: number;
  yes: number;
  no: number;
  maybe: number;
  pending: number;
  partySize: number;
};

export type EventRsvpListDto = {
  summary: EventRsvpSummaryDto;
  guests: EventRsvpDto[];
};

export type CreateEventCommand = CreateEventInput;
export type UpdateEventCommand = UpdateEventInput;
