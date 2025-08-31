declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ACCESS_TOKEN_SECRET: string;
      BASE_API_URL: string;
      DB_CONNECTION_URI: string;
      NODE_ENV: 'development' | 'production';
      PORT: string;
      SALT: string;
    }
  }
}

export {};
