import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

export const eventCategory = pgEnum("event_category", [
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
]);

export const eventStatus = pgEnum("event_status", [
  "draft",
  "published",
  "cancelled",
  "archived"
]);

export const supportedLanguage = pgEnum("supported_language", [
  "en",
  "hi",
  "gu"
]);

export const rsvpStatus = pgEnum("rsvp_status", [
  "pending",
  "yes",
  "no",
  "maybe"
]);

export const reminderChannel = pgEnum("reminder_channel", [
  "calendar",
  "push",
  "email",
  "sms",
  "whatsapp"
]);

export const reminderStatus = pgEnum("reminder_status", [
  "scheduled",
  "sent",
  "failed",
  "cancelled"
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firebaseUid: text("firebase_uid").notNull(),
    email: text("email"),
    phone: text("phone"),
    displayName: text("display_name"),
    preferredLanguage: supportedLanguage("preferred_language")
      .notNull()
      .default("en"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true })
  },
  (table) => ({
    firebaseUidIdx: uniqueIndex("users_firebase_uid_idx").on(table.firebaseUid),
    emailIdx: index("users_email_idx").on(table.email),
    phoneIdx: index("users_phone_idx").on(table.phone)
  })
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdBy: uuid("created_by").references(() => users.id),
    title: text("title").notNull(),
    category: eventCategory("category").notNull(),
    status: eventStatus("status").notNull().default("draft"),
    primaryLanguage: supportedLanguage("primary_language").notNull(),
    timezone: text("timezone").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    venueName: text("venue_name"),
    address: text("address"),
    mapUrl: text("map_url"),
    slug: text("slug").notNull(),
    isPublic: boolean("is_public").notNull().default(false),
    settings: jsonb("settings").notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true })
  },
  (table) => ({
    slugIdx: uniqueIndex("events_slug_idx").on(table.slug),
    createdByIdx: index("events_created_by_idx").on(table.createdBy),
    statusIdx: index("events_status_idx").on(table.status)
  })
);

export const eventFunctions = pgTable(
  "event_functions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id),
    title: text("title").notNull(),
    description: text("description"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    venueName: text("venue_name"),
    address: text("address"),
    mapUrl: text("map_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => ({
    eventIdx: index("event_functions_event_id_idx").on(table.eventId)
  })
);

export const guests = pgTable(
  "guests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id),
    name: text("name").notNull(),
    phone: text("phone"),
    email: text("email"),
    guestToken: text("guest_token").notNull(),
    preferredLanguage: supportedLanguage("preferred_language"),
    maxPartySize: integer("max_party_size").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true })
  },
  (table) => ({
    eventIdx: index("guests_event_id_idx").on(table.eventId),
    tokenIdx: uniqueIndex("guests_guest_token_idx").on(table.guestToken)
  })
);

export const rsvps = pgTable(
  "rsvps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id),
    guestId: uuid("guest_id").references(() => guests.id),
    status: rsvpStatus("status").notNull().default("pending"),
    partySize: integer("party_size").notNull().default(1),
    answers: jsonb("answers").notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => ({
    eventIdx: index("rsvps_event_id_idx").on(table.eventId),
    guestIdx: index("rsvps_guest_id_idx").on(table.guestId)
  })
);

export const reminders = pgTable(
  "reminders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id),
    guestId: uuid("guest_id").references(() => guests.id),
    channel: reminderChannel("channel").notNull(),
    status: reminderStatus("status").notNull().default("scheduled"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    retryCount: integer("retry_count").notNull().default(0),
    metadata: jsonb("metadata").notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => ({
    eventIdx: index("reminders_event_id_idx").on(table.eventId),
    scheduledAtIdx: index("reminders_scheduled_at_idx").on(table.scheduledAt)
  })
);

export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id").references(() => events.id),
    ownerId: uuid("owner_id").references(() => users.id),
    r2Key: text("r2_key").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    status: text("status").notNull().default("uploaded"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => ({
    eventIdx: index("media_event_id_idx").on(table.eventId),
    ownerIdx: index("media_owner_id_idx").on(table.ownerId)
  })
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => users.id),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id").notNull(),
    ipAddress: text("ip_address"),
    metadata: jsonb("metadata").notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => ({
    entityIdx: index("audit_logs_entity_idx").on(table.entity, table.entityId),
    actorIdx: index("audit_logs_actor_id_idx").on(table.actorId)
  })
);

export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  media: many(media),
  auditLogs: many(auditLogs)
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.createdBy],
    references: [users.id]
  }),
  functions: many(eventFunctions),
  guests: many(guests),
  rsvps: many(rsvps),
  reminders: many(reminders),
  media: many(media)
}));
