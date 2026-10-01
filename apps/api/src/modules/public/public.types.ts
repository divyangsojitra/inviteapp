import type { PublicRsvpInput } from "./public.schema";

export type PublicRsvpCommand = PublicRsvpInput;

export type PublicRsvpDto = {
  id: string;
  eventId: string;
  guestId: string;
  status: "yes" | "no" | "maybe";
  partySize: number;
  guestName: string;
  createdAt: string;
};
