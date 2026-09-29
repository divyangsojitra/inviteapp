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

export async function listEvents(token: string) {
  return request<EventDto[]>("/v1/events", token);
}

export async function createEvent(token: string, payload: CreateEventPayload) {
  return request<EventDto>("/v1/events", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
