'use client';

import {useEffect} from "react";
import {useRouter} from "next/navigation";

export default function GoodbyePage() {
    const router = useRouter();

    useEffect(() => {
        // Home after 5 seconds. `replace`, so Back does not return to a page that only says the
        // account is gone. The sign-out that lands here already reloaded the app, so the session
        // is cleared by the time this renders and a soft navigation is enough.
        const timer = setTimeout(() => router.replace('/'), 5000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-steel-950 text-ink-300 flex items-center justify-center p-4">
            <div className="text-center space-y-3">
                <p className="eyebrow">Account</p>
                <h1 className="font-display font-extrabold uppercase tracking-tight text-2xl text-ink-100">Account Deleted</h1>
                <p className="text-ink-400 max-w-sm mx-auto">
                    We&#39;re sorry to see you go. Your account has been successfully deleted.
                </p>
                <p className="text-sm text-ink-600 font-mono tabular">
                    Redirecting to homepage&hellip;
                </p>
            </div>
        </div>
    );
}
