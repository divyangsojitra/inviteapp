export type AppBindings = {
  APP_ENV: string;
  DATABASE_URL?: string;
  DB?: Hyperdrive;
};

export type AppContext = {
  Bindings: AppBindings;
};
