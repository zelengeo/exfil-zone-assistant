import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isWelcomePage = req.nextUrl.pathname === '/welcome';
        const isAuthPage = req.nextUrl.pathname.startsWith('/auth');

        // If user doesn't have username and not on welcome page, redirect
        if (!token?.username && !isWelcomePage && !isAuthPage) {
            return NextResponse.redirect(new URL('/welcome', req.url));
        }

        // If user has username and on welcome page, redirect to profile
        if (token?.username && isWelcomePage) {
            return NextResponse.redirect(new URL(`/user/${token.username}`, req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/settings/:path*',
        '/welcome',
        '/user/:path*',
    ],
};