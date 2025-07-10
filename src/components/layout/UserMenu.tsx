'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { User, LogOut, Settings } from "lucide-react";

export function UserMenu() {
    const { data: session, status } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    if (status === "loading") {
        return <div className="w-8 h-8 bg-military-700 rounded-full animate-pulse" />;
    }

    if (!session) {
        return (
            <button
                onClick={() => signIn()}
                className="px-4 py-2 bg-olive-600 hover:bg-olive-500 text-white
                   rounded-sm transition-colors font-medium"
            >
                Sign In
            </button>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-2 rounded-sm hover:bg-military-800
                   transition-colors"
            >
                <div className="w-8 h-8 bg-olive-600 rounded-full flex items-center
                        justify-center text-white font-bold">
                    {session.user?.name?.[0] || "U"}
                </div>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-military-900 border
                          border-olive-700 rounded-sm shadow-xl z-50">
                        <div className="p-4 border-b border-military-700">
                            <p className="font-medium text-tan-100">{session.user?.name}</p>
                            <p className="text-sm text-tan-400">{session.user?.email}</p>
                        </div>

                        <button
                            onClick={() => {
                                setIsOpen(false);
                                signOut();
                            }}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-military-800
                         transition-colors w-full text-left"
                        >
                            <LogOut size={16} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}