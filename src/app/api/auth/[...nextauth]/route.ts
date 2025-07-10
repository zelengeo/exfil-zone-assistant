
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            image?: string;
            username?: string;
            rank?: string;
            roles?: string[];
        }
    }

    interface User {
        username?: string;
        rank?: string;
        roles?: string[];
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],

    adapter: MongoDBAdapter(clientPromise),

    callbacks: {
        async signIn({ user, account, profile }) {
            console.log("SignIn callback:", { user, account, profile });
            return true;
        },

        async redirect({ url, baseUrl }) {
            console.log("Redirect callback:", { url, baseUrl });
            // Always redirect to home after sign in
            return baseUrl;
        },

        async session({ session, user }) {
            console.log("Session callback:", { session, user });
            if (session?.user) {
                session.user.id = user.id;
                // We'll add more fields here after implementing the username generation
            }
            return session;
        },
    },

    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },

    debug: true, // Enable debug mode to see logs

    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };