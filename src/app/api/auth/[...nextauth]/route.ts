
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise, {connectDB} from "@/lib/mongodb";
import { User } from "@/models/User";

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
            stats?: {
                contributionPoints?: number;
            }
        }
    }

    interface User {
        username?: string;
        rank?: string;
        stats?: {
            contributionPoints?: number;
        }
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
            //FIXME REMOVE
            console.log("SignIn callback:", { user, account, profile });

            //TODO what is newUser
            // if (isNewUser) {
            //     // Will be handled by creating user in DB
            //     return true;
            // }

            // Check if user has username
            try {
                await connectDB();
                const dbUser = await User.findOne({ email: user.email });

                // If no username, they'll be redirected to welcome page
                return true;
            } catch (error) {
                console.error('SignIn callback error:', error);
                //TODO wtf?
                return true; // Allow sign in anyway
            }
            return true;
        },

        async session({ session, user, token }) {
            console.log("Session callback:", { session, user });
            if (session?.user) {
                // For JWT strategy
                if (token) {
                    session.user.id = token.sub!;
                    // Fetch latest user data
                    try {
                        await connectDB();
                        const dbUser = await User.findById(token.sub);
                        if (dbUser) {
                            session.user.username = dbUser.username;
                            session.user.rank = dbUser.rank;
                            session.user.roles = dbUser.roles;
                            if(dbUser.stats) {
                                session.user.stats = {
                                    contributionPoints: dbUser.stats.contributionPoints
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Session callback error:', error);
                    }
                }
            }
            return session;
        },

        async redirect({ url, baseUrl }) {

            //TODO revision
            // Always redirect to home after sign in
            return baseUrl;
        }

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