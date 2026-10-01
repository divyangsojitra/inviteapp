export type DueReminder = {
  id: string;
  eventId: string;
  guestId: string | null;
  scheduledAt: Date;
  guestName: string | null;
  guestEmail: string | null;
  eventTitle: string;
  eventSlug: string;
  eventStartsAt: Date;
  eventVenueName: string | null;
  eventAddress: string | null;
};

export type ReminderDeliverySummary = {
  due: number;
  sent: number;
  failed: number;
  skipped: number;
};
