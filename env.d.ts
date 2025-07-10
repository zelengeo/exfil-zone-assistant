declare namespace NodeJS {
    interface ProcessEnv {
        NEXTAUTH_URL: string;
        NEXTAUTH_SECRET: string;
        DISCORD_CLIENT_ID: string;
        DISCORD_CLIENT_SECRET: string;
        GOOGLE_CLIENT_ID: string;
        GOOGLE_CLIENT_SECRET: string;
        MONGODB_URI: string;
    }
}