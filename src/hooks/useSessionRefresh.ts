import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useSessionRefresh() {
    const { update } = useSession();
    const router = useRouter();

    const refreshSession = async () => {
        // This will trigger the JWT callback with trigger="update"
        await update();
        router.refresh();
    };

    return { refreshSession };
}