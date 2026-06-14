declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    MONGO_URI: string;
    JWT_SECRET: string;
    NODE_ENV?: "development" | "production" | "test";
  }
}

export {};
