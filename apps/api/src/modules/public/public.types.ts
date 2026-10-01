import type { PublicReminderInput, PublicRsvpInput } from "./public.schema";

export type PublicReminderCommand = PublicReminderInput;
export type PublicRsvpCommand = PublicRsvpInput;

export type PublicReminderDto = {
  id: string;
  eventId: string;
  guestId: string;
  channel: "email";
  status: "scheduled" | "sent" | "failed" | "cancelled";
  scheduledAt: string;
  guestName: string;
  createdAt: string;
};

export type PublicRsvpDto = {
  id: string;
  eventId: string;
  guestId: string;
  status: "yes" | "no" | "maybe";
  partySize: number;
  guestName: string;
  createdAt: string;
};
