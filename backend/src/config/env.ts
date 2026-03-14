import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 3000,

  STORAGE_PATH: process.env.STORAGE_PATH,
  TMP_PATH: process.env.TMP_PATH,

  DB: {
    HOST: process.env.DB_HOST ?? "localhost",
    PORT: Number(process.env.DB_PORT) || 3306,
    USER: process.env.DB_USER ?? "",
    PASSWORD: process.env.DB_PASSWORD ?? "",
    NAME: process.env.DB_NAME ?? "",
  },

  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? ("" as string),
  },

  AUTH: {
    COOKIE_NAME: process.env.COOKIE_NAME ?? "auth_token",
    JWT_SECRET: process.env.JWT_SECRET ?? ("" as string),
    JWT_EXPIRES: (process.env.JWT_EXPIRES ??
      "4h") as `${number}${"s" | "m" | "h" | "d"}`,
  },
} as const;
