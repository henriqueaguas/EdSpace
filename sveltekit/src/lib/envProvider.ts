import dotenv from "dotenv";

dotenv.config({
  path: process.cwd() + "/" +
    (process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev"),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvVars { }
  }
}

interface EnvVars {
  NODE_ENV: string;

  DATABASE_URL: string;

  AUTHJS_SECRET: string;

  OAUTH_GOOGLE_ID: string;
  OAUTH_GOOGLE_SECRET: string;

  GOOGLE_STORAGE_SVCACC_EMAIL: string;
  GOOGLE_STORAGE_SVACC_KEY: string;

  SENDGRID_API: string;

  REDIS_PASSWORD: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
}

const envVars = {
  NODE_ENV: process.env.NODE_ENV,

  DATABASE_URL: process.env.DATABASE_URL,

  AUTHJS_SECRET: process.env.AUTHJS_SECRET,

  OAUTH_GOOGLE_ID: process.env.OAUTH_GOOGLE_ID,
  OAUTH_GOOGLE_SECRET: process.env.OAUTH_GOOGLE_SECRET,

  GOOGLE_STORAGE_SVCACC_EMAIL: process.env.GOOGLE_STORAGE_SVCACC_EMAIL,
  GOOGLE_STORAGE_SVACC_KEY: process.env.GOOGLE_STORAGE_SVACC_KEY,

  SENDGRID_API: process.env.SENDGRID_API,

  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
};

console.log("| Environment Variables |", envVars);

export const {
  NODE_ENV,

  DATABASE_URL,

  AUTHJS_SECRET,

  OAUTH_GOOGLE_ID,
  OAUTH_GOOGLE_SECRET,

  GOOGLE_STORAGE_SVCACC_EMAIL,
  GOOGLE_STORAGE_SVACC_KEY,

  SENDGRID_API,

  REDIS_PASSWORD,
  REDIS_HOST,
  REDIS_PORT
}: EnvVars = envVars;
