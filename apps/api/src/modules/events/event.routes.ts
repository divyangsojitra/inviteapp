import { Hono } from "hono";
import { createDatabase } from "../../db/client";
import type { AppContext } from "../../app-env";
import { requireAuth } from "../auth/auth.middleware";
import { EventRepository } from "./event.repository";
import {
  createEventSchema,
  eventIdParamSchema,
  listEventsQuerySchema,
  updateEventSchema
} from "./event.schema";
import { EventService } from "./event.service";

export const eventRoutes = new Hono<AppContext>();

function createEventService(c: { env: AppContext["Bindings"] }) {
  return new EventService(new EventRepository(createDatabase(c.env)));
}

eventRoutes.use("*", requireAuth);

eventRoutes.get("/", async (c) => {
  const parsed = listEventsQuerySchema.safeParse(c.req.query());

  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Please check the query parameters.",
          issues: parsed.error.flatten()
        }
      },
      400
    );
  }

  const currentUser = c.get("currentUser");
  const eventService = createEventService(c);
  const events = await eventService.listEvents(
    currentUser.id,
    parsed.data.limit,
    parsed.data.offset
  );

  return c.json({ data: events });
});

eventRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = createEventSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Please check the event details.",
          issues: parsed.error.flatten()
        }
      },
      400
    );
  }

  const eventService = createEventService(c);
  const currentUser = c.get("currentUser");
  const event = await eventService.createEvent(currentUser.id, parsed.data);

  return c.json({ data: event }, 201);
});

eventRoutes.get("/:id", async (c) => {
  const parsed = eventIdParamSchema.safeParse({ id: c.req.param("id") });

  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Please provide a valid event ID.",
          issues: parsed.error.flatten()
        }
      },
      400
    );
  }

  const eventService = createEventService(c);
  const currentUser = c.get("currentUser");
  const event = await eventService.getEvent(currentUser.id, parsed.data.id);

  if (!event) {
    return c.json(
      {
        error: {
          code: "EVENT_NOT_FOUND",
          message: "Event was not found."
        }
      },
      404
    );
  }

  return c.json({ data: event });
});

eventRoutes.patch("/:id", async (c) => {
  const params = eventIdParamSchema.safeParse({ id: c.req.param("id") });

  if (!params.success) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Please provide a valid event ID.",
          issues: params.error.flatten()
        }
      },
      400
    );
  }

  const body = await c.req.json();
  const parsed = updateEventSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Please check the event details.",
          issues: parsed.error.flatten()
        }
      },
      400
    );
  }

  const eventService = createEventService(c);
  const currentUser = c.get("currentUser");
  const event = await eventService.updateEvent(
    currentUser.id,
    params.data.id,
    parsed.data
  );

  if (!event) {
    return c.json(
      {
        error: {
          code: "EVENT_NOT_FOUND",
          message: "Event was not found."
        }
      },
      404
    );
  }

  return c.json({ data: event });
});
