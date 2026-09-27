import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(2).max(120),
  category: z.enum([
    "wedding",
    "birthday",
    "engagement",
    "anniversary",
    "godh_bharai",
    "housewarming",
    "religious",
    "corporate",
    "funeral_memorial",
    "custom"
  ]),
  primaryLanguage: z.enum(["en", "hi", "gu"]),
  timezone: z.string().min(1),
  startsAt: z.string().datetime(),
  venueName: z.string().max(160).optional(),
  address: z.string().max(500).optional(),
  mapUrl: z.string().url().optional()
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = createEventSchema
  .partial()
  .extend({
    status: z
      .enum(["draft", "published", "cancelled", "archived"])
      .optional(),
    isPublic: z.boolean().optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided."
  });

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const listEventsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0)
});

export const eventIdParamSchema = z.object({
  id: z.string().uuid()
});
