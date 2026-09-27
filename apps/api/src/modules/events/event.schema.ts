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
  address: z.string().max(500).optional()
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
