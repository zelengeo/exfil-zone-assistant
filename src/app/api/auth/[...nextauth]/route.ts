
import NextAuth, {DefaultSession} from "next-auth";
import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import {connectDB} from "@/lib/mongodb";
import { User } from "@/models/User";
import {IUser, IUserToken} from "@/lib/schemas/user";
import {ensureUniqueUsername, generateUsername} from "@/lib/auth/username";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            displayName: IUserToken['displayName'];
            username: IUserToken['username'];
            avatarUrl: IUserToken["avatarUrl"];
            rank: IUserToken["rank"];
            roles: IUserToken["roles"];
            isBanned: IUserToken["isBanned"];
        } & DefaultSession["user"];
    }

    interface User {
        displayName: IUserToken['displayName'];
        username: IUserToken['username'];
        avatarUrl: IUserToken["avatarUrl"];
        rank: IUserToken["rank"];
        roles: IUserToken["roles"];
        isBanned: IUserToken["isBanned"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        displayName: IUserToken['displayName'];
        username: IUserToken['username'];
        avatarUrl: IUserToken["avatarUrl"];
        rank: IUserToken["rank"];
        roles: IUserToken["roles"];
        isBanned: IUserToken["isBanned"];
    }
}

function isAdminEmail(email: string): boolean {
    const adminEmails = [
        process.env.ADMIN_EMAIL_1,
        process.env.ADMIN_EMAIL_2,
        process.env.ADMIN_EMAIL_3,
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

    session: {
        strategy: "jwt",  // Keep JWT strategy
        maxAge: 14 * 24 * 60 * 60, // 14 days
    },

    // adapter: MongoDBAdapter(clientPromise),

    events: {
        // async createUser({ user }) {
        //     await connectDB();
        //     // This fires AFTER the user is created by the adapter
        //     const baseUsername = generateUsername(user);
        //     const username = await ensureUniqueUsername(baseUsername);
        //     console.log(`User ${user.id} created with username ${username}`, user);
        //
        //     // Update the just-created user with custom fields
        //     await User.findByIdAndUpdate(user.id, {
        //         username: username,
        //         // Profile
        //         vrHeadset: null,
        //         // Gamification
        //         level: 1,
        //         rank: 'recruit',
        //         badges: [],
        //         // Contribution Stats
        //         stats: {
        //             contributionPoints: 0,
        //             feedbackSubmitted: 0,
        //             bugsReported: 0,
        //             featuresProposed: 0,
        //             dataCorrections: 0,
        //             correctionsAccepted: 0,
        //         },
        //         // Permissions
        //         roles: ['user'],
        //         // Preferences
        //         preferences: {
        //             emailNotifications: false,
        //             publicProfile: true,
        //             showContributions: true,
        //         },
        //         // Metadata
        //         isActive: true,
        //         isBanned: false,
        //     });
        // },
        async signIn({ user }) {
            // Log sign-in event
            console.log(`User signed in: ${user.email}`);
        }
    },


    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'discord' || account?.provider === 'google') {
                try {
                    await connectDB();

                    // CHANGE: Use email to find user, not the OAuth provider ID
                    const dbUser = await User.findOne({ email: user.email?.toLowerCase() });

                    if (!dbUser) {
                        // Create user since JWT doesn't auto-create them
                        const baseUsername = generateUsername(user);
                        const username = await ensureUniqueUsername(baseUsername);

                        const newUser = new User({
                            email: user.email?.toLowerCase(),
                            displayName: user.name,
                            username: username,
                            image: user.image,
                            vrHeadset: null,
                            level: 1,
                            rank: isAdminEmail(user.email || '') ? 'elite' : 'recruit',
                            badges: [],
                            stats: {
                                contributionPoints: 0,
                                feedbackSubmitted: 0,
                                bugsReported: 0,
                                featuresProposed: 0,
                                dataCorrections: 0,
                                correctionsAccepted: 0,
                            },
                            roles: isAdminEmail(user.email || '') ? ['user', 'admin'] : ['user'],
                            preferences: {
                                emailNotifications: false,
                                publicProfile: true,
                                showContributions: true,
                            },
                            isActive: true,
                            isBanned: false,
                            lastLoginAt: new Date(),
                        });

                        const savedUser = await newUser.save();

                        // Update the user object with the MongoDB _id for the JWT
                        user.id = savedUser._id.toString();

                        console.log(`✅ Created new user ${user.email} with ID ${user.id}`);
                        return true;
                    }

                    // User exists - update as before
                    let needsUpdate = false;

                    if (user.email && isAdminEmail(user.email)) {
                        if (!dbUser.roles?.includes('admin')) {
                            dbUser.roles = [...(dbUser.roles || []), 'admin'];
                            dbUser.rank = 'elite';
                            needsUpdate = true;
                            console.log(`🔐 Auto-promoted ${user.email} to admin`);
                        }
                    }


                    dbUser.lastLoginAt = new Date();
                    needsUpdate = true;

                    if (needsUpdate) {
                        await dbUser.save();
                    }

                    // IMPORTANT: Set user.id to the MongoDB _id for JWT
                    user.id = dbUser._id.toString();

                    return true;
                } catch (error) {
                    console.error('Sign in error:', error);
                    return false;
                }
            }
            return true;
        },

        async jwt({ token, user, account, trigger, session }) {
            // Initial sign in
            if (user && account) {
                await connectDB();
                // user.id is now the MongoDB _id from signIn callback
                const dbUser = await User.findById(user.id)
                    .select('displayName username avatarUrl rank roles isBanned')
                    .lean<IUserToken>();

                if (dbUser) {
                    token.id = user.id; // MongoDB _id as string
                    token.displayName = dbUser.displayName;
                    token.username = dbUser.username;
                    token.avatarUrl = dbUser.avatarUrl;
                    token.rank = dbUser.rank;
                    token.roles = dbUser.roles || ["user"];
                    token.isBanned = dbUser.isBanned;
                }
            }

            // Handle token refresh - fetch fresh data from DB
            if (trigger === "update") {
                await connectDB();
                const dbUser = await User.findById(token.id)
                    .select('displayName username avatarUrl rank roles isBanned')
                    .lean<IUser>();

                if (dbUser) {
                    // Update token with fresh data from database
                    token.displayName = dbUser.displayName;
                    token.username = dbUser.username;
                    token.avatarUrl = dbUser.avatarUrl;
                    token.rank = dbUser.rank;
                    token.roles = dbUser.roles || ["user"];
                    token.isBanned = dbUser.isBanned;
                }

                // Merge with session data if provided
                if (session) {
                    Object.assign(token, session);
                }
            }

            return token;
        },


        async session({ session, token }) {
            // Pass token data to session without DB queries
            if (session?.user && token) {
                session.user.id = token.id;
                session.user.username = token.username;
                session.user.displayName = token.displayName;
                session.user.avatarUrl = token.avatarUrl;
                session.user.rank = token.rank;
                session.user.roles = token.roles;
                session.user.isBanned = token.isBanned;
            }
            return session;
        },

        async redirect({ baseUrl }) {
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

    debug: process.env.NODE_ENV === 'development',

    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };