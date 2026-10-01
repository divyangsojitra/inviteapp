import { z } from "zod";

export const publicEventSlugParamSchema = z.object({
  slug: z.string().min(1).max(180)
});

export const publicRsvpSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(32).optional(),
  email: z.string().trim().email().max(160).optional(),
  status: z.enum(["yes", "no", "maybe"]),
  partySize: z.coerce.number().int().min(1).max(20).default(1),
  preferredLanguage: z.enum(["en", "hi", "gu"]).optional()
});

export const publicReminderSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(160),
  scheduledAt: z.string().datetime(),
  preferredLanguage: z.enum(["en", "hi", "gu"]).optional()
});

export type PublicRsvpInput = z.infer<typeof publicRsvpSchema>;
export type PublicReminderInput = z.infer<typeof publicReminderSchema>;
