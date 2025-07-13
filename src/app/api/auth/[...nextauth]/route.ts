
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise, {connectDB} from "@/lib/mongodb";
import { User } from "@/models/User";
import {ensureUniqueUsername, generateUsername} from "@/lib/auth/username";

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
            },
        }
    }

    interface User {
        username?: string;
        rank?: string;
        roles?: string[];
        stats?: {
            contributionPoints?: number;
        }
    }
}

function isAdminEmail(email: string): boolean {
    const adminEmails = [
        process.env.ADMIN_EMAIL_1,
        process.env.ADMIN_EMAIL_2,
    ].filter(Boolean).map(email => email?.toLowerCase());

    return adminEmails.includes(email.toLowerCase());
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

    events: {
        async createUser({ user }) {
            await connectDB();
            // This fires AFTER the user is created by the adapter
            const baseUsername = generateUsername(user);
            const username = await ensureUniqueUsername(baseUsername);
            console.log(`User ${user.id} created with username ${username}`, user);

            // Update the just-created user with custom fields
            await User.findByIdAndUpdate(user.id, {
                username: username,
                // Profile
                vrHeadset: null,
                // Gamification
                level: 1,
                rank: 'recruit',
                badges: [],
                // Contribution Stats
                stats: {
                    contributionPoints: 0,
                    feedbackSubmitted: 0,
                    bugsReported: 0,
                    featuresProposed: 0,
                    dataCorrections: 0,
                    correctionsAccepted: 0,
                },
                // Permissions
                roles: ['user'],
                // Preferences
                preferences: {
                    emailNotifications: false,
                    publicProfile: true,
                    showContributions: true,
                },
                // Metadata
                isActive: true,
                isBanned: false,
            });
        }
    },

    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'discord' || account?.provider === 'google') {
                try {
                    await connectDB();

                    const dbUser = await User.findOne({ email: user.email?.toLowerCase() });

                    if (!dbUser) {
                        // This shouldn't happen if createUser works properly
                        console.log('User not found during signIn:', user.email);
                        return true;
                    }

                    let needsUpdate = false;

                    // Check for admin promotion
                    if (user.email && isAdminEmail(user.email)) {
                        if (!dbUser.roles?.includes('admin')) {
                            dbUser.roles = [...(dbUser.roles || []), 'admin'];
                            dbUser.rank = 'elite'; // Promote rank
                            needsUpdate = true;
                            console.log(`🔐 Auto-promoted ${user.email} to admin`);
                        }
                    }

                    // Update last login
                    dbUser.lastLoginAt = new Date();
                    needsUpdate = true;

                    if (needsUpdate) {
                        await dbUser.save();
                    }

                    return true;
                } catch (error) {
                    console.error('Sign in error:', error);
                    return false;
                }
            }
            return true;
        },


        async session({ session, user, token }) {
            console.log("Session callback:", { session, user });
            if (session?.user) {
                if (user) {
                    session.user.id = user.id;
                    // Fetch additional fields from your User model
                    const dbUser = await User.findById(user.id);
                    if (dbUser) {
                        session.user.username = dbUser.username;
                        session.user.rank = dbUser.rank;
                        session.user.roles = dbUser.roles;
                        if(dbUser.stats) {
                            session.user.stats = {
                                contributionPoints: dbUser.stats.contributionPoints,
                            }
                        }
                    }
                }
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
                                    contributionPoints: dbUser.stats.contributionPoints,
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
        newUser: '/dashboard'
    },

    debug: true, // Enable debug mode to see logs

    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };