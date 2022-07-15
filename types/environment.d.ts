import { FitbitDatabases } from '../src/database/init';
import User from '../src/database/models/User';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_HOST: string;
      DB_USER: string;
      DB_PASSWORD: string;
      DB_NAME: string;
      DB_PORT: string;
      NODE_DOCKER_PORT: string;
      CLIENT_ORIGIN_ALLOW_LIST: string;
      FORCE_DB_RESET: string;
      APP_USERS: string;
    }
  }

  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export {};
