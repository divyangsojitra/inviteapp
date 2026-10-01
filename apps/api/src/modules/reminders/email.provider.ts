import type { AppBindings } from "../../app-env";
import type { DueReminder } from "./reminder.types";

type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export type EmailProvider = {
  isConfigured(): boolean;
  send(message: EmailMessage): Promise<void>;
};

export class DisabledEmailProvider implements EmailProvider {
  isConfigured() {
    return false;
  }

  async send(_message: EmailMessage) {
    throw new Error("Email provider is not configured.");
  }
}

export function createEmailProvider(_env: AppBindings): EmailProvider {
  return new DisabledEmailProvider();
}

export function buildReminderEmail(
  reminder: DueReminder,
  publicWebBaseUrl: string
): EmailMessage | null {
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
