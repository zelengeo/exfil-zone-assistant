
import NextAuth, {DefaultSession} from "next-auth";
import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import {connectDB} from "@/lib/mongodb";
import { User } from "@/models/User";
import {IUserToken} from "@/lib/schemas/user";
import {authorizeOAuthSignIn} from '@/lib/auth/oauth-sign-in';
import { NextResponse, type NextRequest } from 'next/server';
import { getRateLimiter } from '@/lib/rate-limit/rate-limit-factory';
import { getIdentifier, isSignInInitiation, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit/rate-limit';

class SessionUserNotFoundError extends Error {
    constructor() {
        super('The user for this session no longer exists');
        this.name = 'SessionUserNotFoundError';
    }
}

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
        maxAge: 30 * 24 * 60 * 60, // 30 days (production standard)
    },

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
        async signIn({ user, account, profile }) {
            return authorizeOAuthSignIn({ user, account, profile });
        },

        async jwt({ token, user, account, trigger }) {
            // Initial sign in
            if (user && account) {
                await connectDB();
                // user.id is now the MongoDB _id from signIn callback
                const dbUser = await User.findById(user.id)
                    .select('displayName username avatarUrl rank roles isBanned')
                    .lean<IUserToken>();

                if (!dbUser) {
                    throw new SessionUserNotFoundError();
                }

                token.id = user.id; // MongoDB _id as string
                token.displayName = dbUser.displayName;
                token.username = dbUser.username;
                token.avatarUrl = dbUser.avatarUrl;
                token.rank = dbUser.rank;
                token.roles = dbUser.roles || ["user"];
                token.isBanned = dbUser.isBanned;
            }

            // Handle token refresh - fetch fresh data from DB
            if (trigger === "update") {
                const authenticatedUserId = token.id;
                if (typeof authenticatedUserId !== 'string' || authenticatedUserId.length === 0) {
                    throw new SessionUserNotFoundError();
                }

                await connectDB();
                const dbUser = await User.findById(authenticatedUserId)
                    .select('displayName username avatarUrl rank roles isBanned')
                    .lean<IUserToken>();

                if (!dbUser) {
                    throw new SessionUserNotFoundError();
                }

                // Session update payloads are client input. Refresh only server-owned claims while
                // preserving the authenticated subject already encoded in the token.
                token.displayName = dbUser.displayName;
                token.username = dbUser.username;
                token.avatarUrl = dbUser.avatarUrl;
                token.rank = dbUser.rank;
                token.roles = dbUser.roles || ["user"];
                token.isBanned = dbUser.isBanned;
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

    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

/**
 * The limit is applied by path rather than to the route as a whole — see `isSignInInitiation`.
 *
 * The limiter is reached directly rather than through `withRateLimit`, because middleware.ts
 * imports `authOptions` from this file and going the other way would close an import cycle.
 */
async function withAuthRateLimit(
    request: NextRequest,
    run: () => Promise<Response>,
): Promise<Response> {
    if (!isSignInInitiation(request.method, new URL(request.url).pathname)) {
        return run();
    }

    const config = RATE_LIMIT_CONFIGS.auth;
    // Sign-in initiation is anonymous by definition: there is no session to read yet.
    const identifier = await getIdentifier();
    const result = await getRateLimiter().check('auth', identifier, config);

    // Sign-in is failClosed: an unavailable limiter must not become an unlimited login endpoint.
    if (result.degraded && config.failClosed) {
        return NextResponse.json(
            {
                error: 'Service unavailable',
                message: 'Sign-in is temporarily unavailable. Please retry shortly.',
                retryAfter: 30,
            },
            { status: 503, headers: { 'Retry-After': '30' } },
        );
    }

    if (!result.success) {
        return NextResponse.json(
            {
                error: 'Too many requests',
                message: `Too many sign-in attempts. Please try again in ${result.retryAfter} seconds.`,
                retryAfter: result.retryAfter,
            },
            {
                status: 429,
                headers: { 'Retry-After': result.retryAfter!.toString() },
            },
        );
    }

    return run();
}

type RouteContext = { params: Promise<{ nextauth: string[] }> };

export async function GET(request: NextRequest, context: RouteContext): Promise<Response> {
    return withAuthRateLimit(request, () => handler(request, context));
}

export async function POST(request: NextRequest, context: RouteContext): Promise<Response> {
    return withAuthRateLimit(request, () => handler(request, context));
}
