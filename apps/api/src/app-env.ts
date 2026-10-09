export type AppBindings = {
  APP_ENV: string;
  DATABASE_URL?: string;
  DEV_AUTH_BYPASS?: string;
  DB?: Hyperdrive;
  EMAIL?: SendEmailBinding;
  EMAIL_FROM_ADDRESS?: string;
  EMAIL_REPLY_TO?: string;
  FIREBASE_PROJECT_ID?: string;
  CORS_ORIGIN?: string;
  PUBLIC_WEB_BASE_URL?: string;
  REMINDER_BATCH_SIZE?: string;
};

type EmailAddress = {
  email: string;
  name?: string;
};

type EmailMessageBuilder = {
  to: string | EmailAddress | (string | EmailAddress)[];
  from: string | EmailAddress;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string | EmailAddress;
  headers?: Record<string, string>;
};

type SendEmailBinding = {
  send(message: EmailMessageBuilder): Promise<{ messageId: string }>;
};

export type CurrentUser = {
  id: string;
  firebaseUid: string;
  email: string | null;
  phone: string | null;
  displayName: string | null;
};

export type AppContext = {
  Bindings: AppBindings;
  Variables: {
    currentUser: CurrentUser;
  };
};
