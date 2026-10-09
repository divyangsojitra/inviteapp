import type { AppBindings } from "../../app-env";
import type { DueReminder } from "./reminder.types";

type AppEmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export type EmailProvider = {
  isConfigured(): boolean;
  send(message: AppEmailMessage): Promise<void>;
};

export class DisabledEmailProvider implements EmailProvider {
  isConfigured() {
    return false;
  }

  async send(_message: AppEmailMessage) {
    throw new Error("Email provider is not configured.");
  }
}

export class CloudflareEmailProvider implements EmailProvider {
  constructor(
    private readonly emailBinding: NonNullable<AppBindings["EMAIL"]>,
    private readonly fromAddress: string,
    private readonly replyTo?: string
  ) {}

  isConfigured() {
    return true;
  }

  async send(message: AppEmailMessage) {
    await this.emailBinding.send({
      to: message.to,
      from: this.fromAddress,
      replyTo: this.replyTo,
      subject: message.subject,
      text: message.text,
      html: message.html,
      headers: {
        "X-Invieasy-Message-Type": "event-reminder"
      }
    });
  }
}

export function createEmailProvider(env: AppBindings): EmailProvider {
  if (!env.EMAIL || !env.EMAIL_FROM_ADDRESS) {
    return new DisabledEmailProvider();
  }

  return new CloudflareEmailProvider(
    env.EMAIL,
    env.EMAIL_FROM_ADDRESS,
    env.EMAIL_REPLY_TO
  );
}

export function buildReminderEmail(
  reminder: DueReminder,
  publicWebBaseUrl: string
): AppEmailMessage | null {
  if (!reminder.guestEmail) {
    return null;
  }

  const eventUrl = `${publicWebBaseUrl.replace(/\/$/, "")}/e/${
    reminder.eventSlug
  }`;
  const eventDate = new Intl.DateTimeFormat("en", {
    dateStyle: "full",
    timeStyle: "short"
  }).format(reminder.eventStartsAt);
  const venueLine = [reminder.eventVenueName, reminder.eventAddress]
    .filter(Boolean)
    .join(", ");
  const greeting = reminder.guestName
    ? `Hi ${reminder.guestName},`
    : "Hi,";
  const locationText = venueLine ? `\nLocation: ${venueLine}` : "";
  const escapedTitle = escapeHtml(reminder.eventTitle);
  const escapedGreeting = escapeHtml(greeting);
  const escapedDate = escapeHtml(eventDate);
  const escapedVenue = escapeHtml(venueLine);
  const escapedUrl = escapeHtml(eventUrl);

  return {
    to: reminder.guestEmail,
    subject: `Reminder: ${reminder.eventTitle}`,
    text: `${greeting}\n\nThis is a reminder for ${reminder.eventTitle}.\nWhen: ${eventDate}${locationText}\n\nView invitation: ${eventUrl}`,
    html: `
      <p>${escapedGreeting}</p>
      <p>This is a reminder for <strong>${escapedTitle}</strong>.</p>
      <p><strong>When:</strong> ${escapedDate}</p>
      ${venueLine ? `<p><strong>Location:</strong> ${escapedVenue}</p>` : ""}
      <p><a href="${escapedUrl}">View invitation</a></p>
    `
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}
