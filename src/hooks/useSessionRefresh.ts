// src/hooks/useSessionRefresh.ts
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { toast } from "sonner"; // or your toast library

export function useSessionRefresh() {
    const { update, status } = useSession();
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshSession = useCallback(async () => {
        if (status !== "authenticated") return;

        setIsRefreshing(true);
        try {
            // This will trigger the JWT callback with trigger="update"
            const result = await update();

            if (result) {
                router.refresh();
                toast.success("Session refreshed successfully");
            }
        } catch (error) {
            console.error("Failed to refresh session:", error);
            toast.error("Failed to refresh session");
        } finally {
            setIsRefreshing(false);
        }
    }, [update, router, status]);

    return { refreshSession, isRefreshing };
}