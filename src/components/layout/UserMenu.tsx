'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { User, LogOut, Settings, BarChart3, Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function UserMenu() {
    const { data: session, status } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Desktop loading state
    if (status === "loading") {
        return (
            <div className="flex items-center gap-4">
                <Skeleton className="hidden md:block h-10 w-32 rounded-sm" />
                <Skeleton className="md:hidden h-10 w-10 rounded-sm" />
            </div>
        );
    }

    // Mobile menu toggle button (always visible on mobile)
    const MobileMenuButton = () => (
        <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-military-800 rounded-sm transition-colors border border-transparent hover:border-olive-700"
            aria-label="Menu"
        >
            {isMobileMenuOpen ? (
                <X size={24} className="text-olive-400" />
            ) : (
                <Menu size={24} className="text-olive-400" />
            )}
        </button>
    );

    // Not signed in
    if (!session) {
        return (
            <>
                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => signIn()}
                        className="hidden md:flex bg-olive-600 hover:bg-olive-500 text-white"
                        size="sm"
                    >
                        <Shield className="mr-2 h-4 w-4" />
                        Sign In
                    </Button>
                    <MobileMenuButton />
                </div>

                {/* Mobile menu for non-authenticated users */}
                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-x-0 top-16 z-50 bg-military-800 border-b border-olive-800">
                        <div className="p-4">
                            <Button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    signIn();
                                }}
                                className="w-full bg-olive-600 hover:bg-olive-500 text-white"
                            >
                                <Shield className="mr-2 h-4 w-4" />
                                Sign In
                            </Button>
                        </div>
                    </div>
                )}
            </>
        );
    }

    const userInitial = session.user.username?.[0] || session.user.name?.[0] || "U";
    const displayName = session.user.username || session.user.name || "User";

    return (
        <>
            <div className="flex items-center gap-4">
                {/* Desktop User Menu */}
                <div className="hidden md:block">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex items-center gap-3 px-3 py-2 h-auto rounded-sm hover:bg-military-800 border border-transparent hover:border-olive-700"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage
                                        src={session.user?.image || undefined}
                                        alt={displayName}
                                    />
                                    <AvatarFallback className="bg-olive-600 text-white">
                                        {userInitial.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-tan-100">{displayName}</p>
                                    <p className="text-xs text-olive-500 capitalize">
                                        {session.user.rank || 'Recruit'}
                                    </p>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-64 bg-military-800 border-olive-700"
                            align="end"
                        >
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage
                                            src={session.user?.image || undefined}
                                            alt={displayName}
                                        />
                                        <AvatarFallback className="bg-olive-600 text-white">
                                            {userInitial.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            @{displayName}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                    <Badge variant="secondary" className="bg-olive-700/50 text-olive-300 border-olive-700">
                                        {session.user.rank || 'Recruit'}
                                    </Badge>
                                    {session.user.stats?.contributionPoints && (
                                        <Badge variant="outline" className="text-tan-400">
                                            {session.user.stats?.contributionPoints} pts
                                        </Badge>
                                    )}
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-military-700" />
                            <DropdownMenuItem asChild>
                                <Link
                                    href={`/user/${session.user?.username || session.user?.id}`}
                                    className="cursor-pointer"
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    <span>View Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard" className="cursor-pointer">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    <span>Dashboard</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/settings" className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            {session.user?.roles?.includes('admin') && (
                                <>
                                    <DropdownMenuSeparator className="bg-military-700" />
                                    <DropdownMenuItem asChild>
                                        <Link href="/admin" className="cursor-pointer">
                                            <Shield className="mr-2 h-4 w-4" />
                                            <span>Admin Panel</span>
                                        </Link>
                                    </DropdownMenuItem>
                                </>
                            )}
                            <DropdownMenuSeparator className="bg-military-700" />
                            <DropdownMenuItem
                                className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-900/20"
                                onSelect={(event) => {
                                    event.preventDefault();
                                    signOut();
                                }}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sign out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Mobile Menu Button */}
                <MobileMenuButton />
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-x-0 top-16 z-50 bg-military-800 border-b border-olive-800">
                    <div className="p-4">
                        {/* User info section */}
                        <div className="flex items-center gap-3 p-3 mb-3 bg-military-900/50 rounded-sm">
                            <Avatar className="h-10 w-10">
                                <AvatarImage
                                    src={session.user?.image || undefined}
                                    alt={displayName}
                                />
                                <AvatarFallback className="bg-olive-600 text-white">
                                    {userInitial.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-medium text-tan-100">{displayName}</p>
                                <p className="text-sm text-olive-500 capitalize">
                                    {session.user.rank || 'Recruit'}
                                </p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            <Link
                                href={`/user/${session.user?.username || session.user?.id}`}
                                className="flex items-center gap-3 p-3 hover:bg-military-700 rounded-sm transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <User size={20} />
                                <span>Profile</span>
                            </Link>

                            <Link
                                href="/dashboard"
                                className="flex items-center gap-3 p-3 hover:bg-military-700 rounded-sm transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <BarChart3 size={20} />
                                <span>Dashboard</span>
                            </Link>

                            <Link
                                href="/settings"
                                className="flex items-center gap-3 p-3 hover:bg-military-700 rounded-sm transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Settings size={20} />
                                <span>Settings</span>
                            </Link>

                            {session.user?.roles?.includes('admin') && (
                                <>
                                    <div className="my-2 border-t border-military-700" />
                                    <Link
                                        href="/admin"
                                        className="flex items-center gap-3 p-3 hover:bg-military-700 rounded-sm transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Shield size={20} />
                                        <span>Admin Panel</span>
                                    </Link>
                                </>
                            )}

                            <div className="my-2 border-t border-military-700" />

                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    signOut();
                                }}
                                className="flex items-center gap-3 p-3 hover:bg-military-700 rounded-sm transition-colors text-red-400 w-full text-left"
                            >
                                <LogOut size={20} />
                                <span>Sign Out</span>
                            </button>
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}