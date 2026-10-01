export type EventCategory =
  | "wedding"
  | "birthday"
  | "engagement"
  | "anniversary"
  | "godh_bharai"
  | "housewarming"
  | "religious"
  | "corporate"
  | "funeral_memorial"
  | "custom";

export type SupportedLanguage = "en" | "hi" | "gu";

export type EventDto = {
  id: string;
  title: string;
  category: EventCategory;
  status: "draft" | "published" | "cancelled" | "archived";
  primaryLanguage: SupportedLanguage;
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

export type PublicRsvpDto = {
  id: string;
  eventId: string;
  guestId: string;
  status: "yes" | "no" | "maybe";
  partySize: number;
  guestName: string;
  createdAt: string;
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

export type EventRsvpListDto = {
  summary: {
    total: number;
    yes: number;
    no: number;
    maybe: number;
    pending: number;
    partySize: number;
  };
  guests: EventRsvpDto[];
};

export type CreateEventPayload = {
  title: string;
  category: EventCategory;
  primaryLanguage: SupportedLanguage;
  timezone: string;
  startsAt: string;
  venueName?: string;
  address?: string;
  mapUrl?: string;
};

export type UpdateEventPayload = Partial<CreateEventPayload> & {
  status?: EventDto["status"];
  isPublic?: boolean;
};

export type PublicRsvpPayload = {
  name: string;
  phone?: string;
  email?: string;
  status: PublicRsvpDto["status"];
  partySize: number;
  preferredLanguage?: SupportedLanguage;
};

type ApiResponse<T> = {
  data?: T;
  error?: {
    code: string;
    message: string;
    issues?: unknown;
  };
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:8787";

async function request<T>(
  path: string,
  token: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init.headers
    }
  });
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.data) {
    throw new Error(payload.error?.message ?? "Something went wrong.");
  }

  return payload.data;
}

async function publicRequest<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    next: {
      revalidate: 30
    }
  });
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.data) {
    throw new Error(payload.error?.message ?? "Something went wrong.");
  }

  return payload.data;
}

export async function listEvents(token: string) {
  return request<EventDto[]>("/v1/events", token);
}

export async function createEvent(token: string, payload: CreateEventPayload) {
  return request<EventDto>("/v1/events", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateEvent(
  token: string,
  eventId: string,
  payload: UpdateEventPayload
) {
  return request<EventDto>(`/v1/events/${eventId}`, token, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function listEventRsvps(token: string, eventId: string) {
  return request<EventRsvpListDto>(`/v1/events/${eventId}/rsvps`, token);
}

export async function getPublicEvent(slug: string) {
  return publicRequest<EventDto>(`/v1/public/events/${slug}`);
}

export async function createPublicRsvp(
  slug: string,
  payload: PublicRsvpPayload
) {
  const response = await fetch(`${apiBaseUrl}/v1/public/events/${slug}/rsvp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const body = (await response.json()) as ApiResponse<PublicRsvpDto>;

  if (!response.ok || !body.data) {
    throw new Error(body.error?.message ?? "Unable to save RSVP.");
  }

  return body.data;
}

export function getPublicCalendarUrl(slug: string) {
  return `${apiBaseUrl}/v1/public/events/${slug}/calendar.ics`;
}
