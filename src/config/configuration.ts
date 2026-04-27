// Define the app config here

import { cleanEnv, num, port, str, url } from 'envalid';

// You can inject it to anywhere via ConfigService
export interface AppConfig {
  port: number;
  secret: string;
  database: DatabaseConfig;
  logger: LoggerConfig;
  mail: MailConfig;
  isDevEnv: boolean;
  corsMaxAge: number;
  redis: RedisConfig;
}

export interface MailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

export interface RedisConfig {
  host: string;
  port: number;
}

export interface DatabaseConfig {
  url: string;
  poolSize: number;
}

export enum LoggerFormat {
  Json = 'json',
  Pretty = 'pretty',
}

export interface LoggerConfig {
  level: string;
  format: LoggerFormat;
}

export default (): AppConfig => {
  // validate env vars
  const env = cleanEnv(process.env, {
    SECRET: str(),
    PORT: port({ default: 3000 }),
    MONGODB_URI: url(),
    POOL_SIZE: num({ default: 15 }),
    LOGGER_LEVEL: str({
      choices: ['info', 'debug', 'error', 'warn'],
      default: 'info',
    }),
    LOGGER_FORMAT: str({ choices: ['json', 'pretty'], default: 'json' }),
    CORS_MAX_AGE: num({ default: 86400 }),
    MAIL_HOST: str({ default: 'smtp.gmail.com' }),
    MAIL_PORT: num({ default: 587 }),
    MAIL_USER: str(),
    MAIL_PASS: str(),
    REDIS_HOST: str({ default: 'localhost' }),
    REDIS_PORT: num({ default: 6379 }),
  });

  const config: AppConfig = {
    port: env.PORT,
    secret: env.SECRET,
    isDevEnv: env.isDev,
    corsMaxAge: env.CORS_MAX_AGE,
    database: {
      url: env.MONGODB_URI,
      poolSize: env.POOL_SIZE,
    },
    logger: {
      level: env.LOGGER_LEVEL,
      format: env.LOGGER_FORMAT as LoggerFormat,
    },
    mail: {
      host: env.MAIL_HOST,
      port: env.MAIL_PORT,
      user: env.MAIL_USER,
      pass: env.MAIL_PASS,
    },
    redis: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    },
  };

  return config;
};
