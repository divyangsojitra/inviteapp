import { Hono } from "hono";
import type { AppContext } from "../../app-env";
import { createDatabase } from "../../db/client";
import { EventRepository } from "../events/event.repository";
import { EventService } from "../events/event.service";
import { PublicRepository } from "./public.repository";
import {
  publicEventSlugParamSchema,
  publicReminderSchema,
  publicRsvpSchema
} from "./public.schema";
import { PublicService } from "./public.service";

export const publicRoutes = new Hono<AppContext>();

function createPublicService(c: { env: AppContext["Bindings"] }) {
  const db = createDatabase(c.env);
  const eventService = new EventService(new EventRepository(db));

  return new PublicService(eventService, new PublicRepository(db));
}

publicRoutes.get("/events/:slug", async (c) => {
  const params = publicEventSlugParamSchema.safeParse({
    slug: c.req.param("slug")
  });

  if (!params.success) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Please provide a valid event link.",
          issues: params.error.flatten()
        }
      },
      400
    );
  }

  const publicService = createPublicService(c);
  const event = await publicService.getPublishedEvent(params.data.slug);

  if (!event) {
    return c.json(
      {
        error: {
          code: "EVENT_NOT_FOUND",
          message: "Invitation was not found or is not published yet."
        }
      },
      404
    );
  }

  return c.json({ data: event });
});

publicRoutes.post("/events/:slug/rsvp", async (c) => {
  const params = publicEventSlugParamSchema.safeParse({
    slug: c.req.param("slug")
  });

  if (!params.success) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Please provide a valid event link.",
          issues: params.error.flatten()
        }
      },
      400
    );
  }

  const body = await c.req.json();
  const parsed = publicRsvpSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Please check the RSVP details.",
          issues: parsed.error.flatten()
        }
      },
      400
    );
  }

  const publicService = createPublicService(c);
  const rsvp = await publicService.createRsvp(params.data.slug, parsed.data);

  if (!rsvp) {
    return c.json(
      {
        error: {
          code: "EVENT_NOT_FOUND",
          message: "Invitation was not found or is not published yet."
        }
      },
      404
    );
  }

  return c.json({ data: rsvp }, 201);
});

publicRoutes.post("/events/:slug/reminders", async (c) => {
  const params = publicEventSlugParamSchema.safeParse({
    slug: c.req.param("slug")
  });

  if (!params.success) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Please provide a valid event link.",
          issues: params.error.flatten()
        }
      },
      400
    );
  }

  const body = await c.req.json();
  const parsed = publicReminderSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Please check the reminder details.",
          issues: parsed.error.flatten()
        }
      },
      400
    );
  }

  const publicService = createPublicService(c);
  const result = await publicService.createReminder(
    params.data.slug,
    parsed.data
  );

  if (!result.ok && result.reason === "not_found") {
    return c.json(
      {
        error: {
          code: "EVENT_NOT_FOUND",
          message: "Invitation was not found or is not published yet."
        }
      },
      404
    );
  }

  if (!result.ok) {
    return c.json(
      {
        error: {
          code: "INVALID_REMINDER_TIME",
          message: "Choose a reminder time before the event and after now."
        }
      },
      400
    );
  }

  return c.json({ data: result.data }, 201);
});

publicRoutes.get("/events/:slug/calendar.ics", async (c) => {
  const params = publicEventSlugParamSchema.safeParse({
    slug: c.req.param("slug")
  });

  if (!params.success) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Please provide a valid event link.",
          issues: params.error.flatten()
        }
      },
      400
    );
  }

  const publicService = createPublicService(c);
  const calendar = await publicService.createCalendar(params.data.slug);

  if (!calendar) {
    return c.json(
      {
        error: {
          code: "EVENT_NOT_FOUND",
          message: "Invitation was not found or is not published yet."
        }
      },
      404
    );
  }

  c.header("Content-Type", "text/calendar; charset=utf-8");
  c.header(
    "Content-Disposition",
    `attachment; filename="${params.data.slug}.ics"`
  );

  return c.text(calendar);
});
