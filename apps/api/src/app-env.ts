export type AppBindings = {
  APP_ENV: string;
  DATABASE_URL?: string;
  DB?: Hyperdrive;
  FIREBASE_PROJECT_ID?: string;
  CORS_ORIGIN?: string;
  PUBLIC_WEB_BASE_URL?: string;
  REMINDER_BATCH_SIZE?: string;
  REMINDER_FROM_EMAIL?: string;
  RESEND_API_KEY?: string;
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
