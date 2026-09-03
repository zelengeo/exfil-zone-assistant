declare namespace NodeJS {
    interface ProcessEnv {
        /* Required. NEXTAUTH_URL is read by NextAuth itself, so it appears in no source file. */
        NEXTAUTH_URL: string;
        NEXTAUTH_SECRET: string;
        DISCORD_CLIENT_ID: string;
        DISCORD_CLIENT_SECRET: string;
        GOOGLE_CLIENT_ID: string;
        GOOGLE_CLIENT_SECRET: string;
        MONGODB_URI: string;

        /* Optional: running without these is a supported configuration. Admin emails seed the
         * first admin; the KV pair moves rate limiting off the in-memory fallback. */
        ADMIN_EMAIL_1?: string;
        ADMIN_EMAIL_2?: string;
        ADMIN_EMAIL_3?: string;
        KV_REST_API_URL?: string;
        KV_REST_API_TOKEN?: string;
    }
}
