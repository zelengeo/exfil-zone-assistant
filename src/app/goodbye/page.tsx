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
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Account Deleted</h1>
                <p className="text-gray-600 mb-4">
                    We&#39;re sorry to see you go. Your account has been successfully deleted.
                </p>
                <p className="text-sm text-gray-500">
                    Redirecting to homepage...
                </p>
            </div>
        </div>
    );
}
