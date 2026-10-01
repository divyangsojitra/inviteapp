import type { AppBindings } from "../../app-env";
import { createDatabase } from "../../db/client";
import {
  buildReminderEmail,
  createEmailProvider
} from "./email.provider";
import { ReminderRepository } from "./reminder.repository";
import type { ReminderDeliverySummary } from "./reminder.types";

const DEFAULT_BATCH_SIZE = 25;
const MAX_BATCH_SIZE = 100;

export async function processDueReminders(
  env: AppBindings,
  now = new Date()
): Promise<ReminderDeliverySummary> {
  const repository = new ReminderRepository(createDatabase(env));
  const emailProvider = createEmailProvider(env);
  const reminders = await repository.listDueEmailReminders(
    now,
    getBatchSize(env.REMINDER_BATCH_SIZE)
  );
  const summary: ReminderDeliverySummary = {
    due: reminders.length,
    sent: 0,
    failed: 0,
    skipped: 0
  };

  if (!emailProvider.isConfigured()) {
    if (reminders.length > 0) {
      console.warn(
        `Skipped ${reminders.length} due reminders because email is not configured.`
      );
    }

    return {
      ...summary,
      skipped: reminders.length
    };
  }

  for (const reminder of reminders) {
    const email = buildReminderEmail(
      reminder,
      env.PUBLIC_WEB_BASE_URL ?? "http://localhost:3000"
    );

    if (!email) {
      await repository.markFailed(reminder.id, "Guest email is missing.");
      summary.failed += 1;
      continue;
    }

    try {
      await emailProvider.send(email);
      await repository.markSent(reminder.id, now);
      summary.sent += 1;
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "Unknown email delivery error.";
      console.error(`Failed to send reminder ${reminder.id}: ${reason}`);
      await repository.markFailed(reminder.id, reason);
      summary.failed += 1;
    }
  }

  return summary;
}

function getBatchSize(value: string | undefined) {
  const parsed = Number(value ?? DEFAULT_BATCH_SIZE);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_BATCH_SIZE;
  }

  return Math.min(Math.floor(parsed), MAX_BATCH_SIZE);
}
