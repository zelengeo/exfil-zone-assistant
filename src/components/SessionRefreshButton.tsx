// src/components/auth/SessionRefreshButton.tsx
"use client";

import { useSessionRefresh } from "@/hooks/useSessionRefresh";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface SessionRefreshButtonProps {
    variant?: "default" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    showLabel?: boolean;
}

export function SessionRefreshButton({
                                         variant = "outline",
                                         size = "sm",
                                         showLabel = true
                                     }: SessionRefreshButtonProps) {
    const { refreshSession, isRefreshing } = useSessionRefresh();

    const button = (
        <Button
            onClick={refreshSession}
            disabled={isRefreshing}
            variant={variant}
            size={size}
        >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''} ${showLabel ? 'mr-2' : ''}`} />
            {showLabel && (isRefreshing ? 'Refreshing...' : 'Refresh Session')}
        </Button>
    );

    if (!showLabel) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {button}
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Refresh session to get latest user data</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return button;
}