import { describe, expect, it } from "vitest";
import type { AppBindings } from "../../app-env";
import { buildReminderEmail, createEmailProvider } from "./email.provider";
import type { DueReminder } from "./reminder.types";

const baseReminder: DueReminder = {
  id: "reminder-1",
  eventId: "event-1",
  guestId: "guest-1",
  scheduledAt: new Date("2026-11-20T10:00:00.000Z"),
  guestName: "Riya <Guest>",
  guestEmail: "riya@example.com",
  eventTitle: "Rohan & Priya <Wedding>",
  eventSlug: "rohan-priya",
  eventStartsAt: new Date("2026-11-21T18:30:00.000Z"),
  eventVenueName: "Grand <Hall>",
  eventAddress: "Surat & Beyond"
};

describe("buildReminderEmail", () => {
  it("builds escaped reminder email content", () => {
    const email = buildReminderEmail(baseReminder, "https://invieasy.com/");

    expect(email).not.toBeNull();
    expect(email?.to).toBe("riya@example.com");
    expect(email?.subject).toBe("Reminder: Rohan & Priya <Wedding>");
    expect(email?.text).toContain("Rohan & Priya <Wedding>");
    expect(email?.html).toContain("Rohan &amp; Priya &lt;Wedding&gt;");
    expect(email?.html).toContain("Riya &lt;Guest&gt;");
    expect(email?.html).toContain("https://invieasy.com/e/rohan-priya");
  });

  it("returns null when the reminder has no guest email", () => {
    const email = buildReminderEmail(
      {
        ...baseReminder,
        guestEmail: null
      },
      "https://invieasy.com"
    );

    expect(email).toBeNull();
  });
});

describe("createEmailProvider", () => {
  it("uses a disabled provider when Cloudflare Email is not configured", () => {
    const provider = createEmailProvider({ APP_ENV: "test" });

    expect(provider.isConfigured()).toBe(false);
  });

  it("sends reminder email through Cloudflare Email binding", async () => {
    const sentMessages: unknown[] = [];
    const provider = createEmailProvider({
      APP_ENV: "test",
      EMAIL_FROM_ADDRESS: "reminders@example.com",
      EMAIL_REPLY_TO: "support@example.com",
      EMAIL: {
        async send(message) {
          sentMessages.push(message);
          return { messageId: "email-1" };
        }
      }
    } satisfies AppBindings);

    expect(provider.isConfigured()).toBe(true);

    const email = buildReminderEmail(baseReminder, "https://invieasy.com");
    expect(email).not.toBeNull();

    await provider.send(email!);

    expect(sentMessages).toEqual([
      expect.objectContaining({
        to: "riya@example.com",
        from: "reminders@example.com",
        replyTo: "support@example.com",
        subject: "Reminder: Rohan & Priya <Wedding>",
        headers: {
          "X-Invieasy-Message-Type": "event-reminder"
        }
      })
    ]);
  });
});
