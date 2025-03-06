const appConfig = () => ({
    // NODE_ENV: getEnv("NODE_ENV", "development"),
    // APP_ORIGIN: getEnv("APP_ORIGIN", "localhost"),
    PORT: Number(process.env.PORT) ?? 5000,
    // BASE_PATH: getEnv("BASE_PATH", "/api/v1"),
    // MONGO_URI: getEnv("MONGO_URI"),
    // JWT: {
    //   SECRET: getEnv("JWT_SECRET"),
    //   EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "15m"),
    //   REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
    //   REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "30d"),
    // },
    // MAILER_SENDER: getEnv("MAILER_SENDER"),
    // RESEND_API_KEY: getEnv("RESEND_API_KEY"),
    MAIL_SERVICE: process.env.MAIL_SERVICE,
    MAIL_USERNAME: process.env.MAIL_USERNAME,
    MAIL_PASSWORD: process.env.MAIL_PASSWORD,
    FROM_EMAIL: process.env.FROM_EMAIL,
    FROM_NAME: process.env.FROM_NAME,

    API_PREFIX: "/api/v1"
});

export const config = appConfig();