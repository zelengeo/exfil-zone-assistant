'use client';

import {useEffect} from "react";

export default function GoodbyePage() {
    useEffect(() => {
        // Redirect to home after 5 seconds
        const timer = setTimeout(() => {
            window.location.href = '/';
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

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
