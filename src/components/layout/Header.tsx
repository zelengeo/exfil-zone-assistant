'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useSession, signIn, signOut} from "next-auth/react";
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {ScrollArea} from '@/components/ui/scroll-area';
import {cn} from '@/lib/utils';
import {
    Home,
    Package,
    Goal,
    Wrench,
    Hammer,
    Target,
    FileText,
    Menu,
    Coffee,
    Shield,
    User,
    LogOut,
    BarChart3,
    MessageCircle,
    ChevronRight,
    type LucideIcon,
} from 'lucide-react';

/**
 * COLD STEEL shell.
 *
 * One destination list, rendered two ways: horizontal tabs in the top chrome
 * at >=900px, a five-item bottom bar below it. Traffic is ~51% mobile /
 * ~39% desktop, so neither is the secondary case.
 *
 * Active state is always the same pair: ember icon + label, plus a 2px ember
 * bar on the edge nearest the content — the bottom edge of a top tab, the top
 * edge of a bottom-bar item.
 */

interface Destination {
    /** Full label — used in the mobile sheet, where there is room. */
    name: string;
    /** Short label — top tabs and the bottom bar. */
    short: string;
    href: string;
    icon: LucideIcon;
    description: string;
    /** Home is reachable through the wordmark on desktop, so it skips the tabs. */
    home?: boolean;
    /** Appears in the five-item bottom bar below 900px. */
    bar?: boolean;
}

const destinations: Destination[] = [
    {
        name: 'Base',
        short: 'Base',
        href: '/',
        icon: Home,
        description: 'What to do next',
        home: true,
        bar: true,
    },
    {
        name: 'Tasks',
        short: 'Tasks',
        href: '/tasks',
        icon: Goal,
        description: 'Quest guides and objectives',
        bar: true,
    },
    {
        name: 'Items Database',
        short: 'Items',
        href: '/items',
        icon: Package,
        description: 'Weapons, armor, consumables',
        bar: true,
    },
    {
        name: 'Combat Simulator',
        short: 'Sim',
        href: '/combat-sim',
        icon: Target,
        description: 'Calculate damage and TTK',
        bar: true,
    },
    {
        name: 'Hideout',
        short: 'Hideout',
        href: '/hideout-upgrades',
        icon: Wrench,
        description: 'Base upgrade requirements',
        bar: true,
    },
    {
        name: 'Gunsmith',
        short: 'Gunsmith',
        href: '/gunsmith',
        icon: Hammer,
        description: 'Build a gun and read its stats',
    },
    {
        name: 'Guides',
        short: 'Guides',
        href: '/guides',
        icon: FileText,
        description: 'Tips and strategies',
    },
];

const topTabs = destinations.filter((d) => !d.home);
const bottomBar = destinations.filter((d) => d.bar);

/** `/items/ak-74n` should light up Items; only `/` matches home. */
function useIsActive() {
    const pathname = usePathname();
    return (href: string) =>
        href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

function Wordmark({compact = false}: { compact?: boolean }) {
    return (
        <Link href="/" className="flex items-center gap-2 group shrink-0">
            <span className="flex items-baseline gap-1 sm:gap-2">
                <span className="military-stencil text-xl md:text-2xl text-ink-100 transition-colors group-hover:text-ember">
                    <span className="hidden sm:inline"><strong className="font-extrabold">EXFIL</strong>ZONE</span>
                    <span className="sm:hidden">EZ</span>
                </span>
                {!compact && (
                    <span className="military-stencil text-sm sm:text-lg font-semibold text-ink-500">
                        ASSISTANT
                    </span>
                )}
            </span>
        </Link>
    );
}

const Header: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const {data: session, status} = useSession();
    const isActive = useIsActive();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const userNavigation = [
        {name: 'Profile', href: `/user/${session?.user?.username || session?.user?.id}`, icon: User},
        {name: 'Dashboard', href: '/dashboard', icon: BarChart3},
    ];

    // Desktop user menu component
    const DesktopUserMenu = () => {
        if (status === "loading") {
            return (
                <div className="flex items-center gap-3 px-3 py-2 border border-line-800 bg-steel-800">
                    <div className="relative h-6 w-7 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-ink-700 animate-pulse"/>
                    </div>
                    <div className="hidden md:flex flex-col gap-1.5 justify-center">
                        <div className="h-2 w-12 bg-steel-600 animate-pulse [animation-duration:1s]"/>
                        <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-1.5 w-2 bg-steel-600 animate-pulse"
                                    style={{
                                        animationDelay: `${i * 120 + 200}ms`,
                                        animationDuration: '1.2s'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        if (!session) {
            return (
                <Button
                    onClick={() => signIn()}
                    size="sm"
                    variant="outline"
                    className="font-display font-bold uppercase tracking-nav border-line-500 text-ink-100 hover:bg-steel-700 hover:text-ink-100"
                >
                    <Shield className="mr-2 h-4 w-4"/>
                    Sign In
                </Button>
            );
        }

        const userInitial = session.user.displayName?.[0] || session.user.username?.[0] || "U";
        const displayName = session.user.displayName || session.user.username || "User";

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="flex items-center gap-3 px-3 py-2 hover:bg-steel-700 border border-transparent hover:border-line-700"
                    >
                        <Avatar className="h-8 w-8">
                            <AvatarImage
                                src={session.user?.avatarUrl || undefined}
                                alt={displayName}
                            />
                            <AvatarFallback className="bg-steel-600 text-ink-100 font-mono text-xs">
                                {userInitial.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-left pb-0.5">
                            <p className="text-sm font-medium text-ink-100">{displayName}</p>
                            <p className="micro-label text-info mt-0.5">
                                {session.user.rank || 'Recruit'}
                            </p>
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-64 bg-steel-800 border-line-700"
                    align="end"
                >
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage
                                    src={session.user?.avatarUrl || undefined}
                                    alt={displayName}
                                />
                                <AvatarFallback className="bg-steel-600 text-ink-100 font-mono text-xs">
                                    {userInitial.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none text-ink-100">{session.user?.displayName}</p>
                                <p className="text-xs leading-none font-mono text-ink-600">
                                    @{session.user?.username}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                            <Badge variant="secondary"
                                   className="bg-steel-600 text-info font-mono text-[10px] tracking-micro uppercase border-line-600">
                                {session.user.rank || 'Recruit'}
                            </Badge>
                            <Badge variant="secondary"
                                   className="bg-steel-600 text-info font-mono text-[10px] tracking-micro uppercase border-line-600">
                                {session.user.roles[session.user.roles.length - 1]}
                            </Badge>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-line-900"/>
                    <DropdownMenuItem asChild>
                        <Link
                            href={`/user/${session.user?.username || session.user?.id}`}
                            className="cursor-pointer"
                        >
                            <User className="mr-2 h-4 w-4"/>
                            <span>View Profile</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                            <BarChart3 className="mr-2 h-4 w-4"/>
                            <span>Dashboard</span>
                        </Link>
                    </DropdownMenuItem>
                    {session.user?.roles?.includes('admin') && (
                        <>
                            <DropdownMenuSeparator className="bg-line-900"/>
                            <DropdownMenuItem asChild>
                                <Link href="/admin" className="cursor-pointer">
                                    <Shield className="mr-2 h-4 w-4"/>
                                    <span>Admin Panel</span>
                                </Link>
                            </DropdownMenuItem>
                        </>
                    )}
                    <DropdownMenuSeparator className="bg-line-900"/>
                    <DropdownMenuItem
                        className="cursor-pointer text-bad focus:text-bad focus:bg-steel-700"
                        onSelect={(event) => {
                            event.preventDefault();
                            signOut();
                        }}
                    >
                        <LogOut className="mr-2 h-4 w-4"/>
                        <span>Sign out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-steel-880 border-b border-line-900">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex h-chrome items-center justify-between gap-4">
                        <Wordmark/>

                        {/* Top tabs — 900px and up */}
                        <nav className="hidden shell:flex items-center h-full" aria-label="Primary">
                            {topTabs.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        aria-current={active ? 'page' : undefined}
                                        className={cn(
                                            "relative flex items-center gap-2 h-full px-4",
                                            "font-display text-base font-semibold uppercase tracking-nav",
                                            "transition-colors",
                                            active
                                                ? "text-ember bg-ember/[0.06]"
                                                : "text-ink-400 hover:text-ink-100 hover:bg-steel-700"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4" strokeWidth={1.6}/>
                                        {item.short}
                                        {active && (
                                            <span
                                                aria-hidden="true"
                                                className="absolute inset-x-0 bottom-0 h-0.5 bg-ember"
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="flex items-center gap-3">
                            <div className="hidden shell:block">
                                <DesktopUserMenu/>
                            </div>

                            {/* Overflow sheet — everything the bottom bar cannot hold */}
                            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                                <SheetTrigger asChild className="shell:hidden">
                                    <Button variant="ghost" size="icon" className="hover:bg-steel-700">
                                        <Menu className="h-5 w-5"/>
                                        <span className="sr-only">Open menu</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right"
                                              className="w-full sm:w-80 p-0 bg-steel-900 border-line-800">
                                    <SheetHeader className="px-6 pt-6 pb-4 border-b border-line-900">
                                        <SheetTitle className="text-left">
                                            <Wordmark/>
                                        </SheetTitle>
                                    </SheetHeader>

                                    <ScrollArea className="h-[calc(100dvh-5rem)] pb-[env(safe-area-inset-bottom)]">
                                        <div className="px-6 py-4">
                                            {/* User section in mobile menu */}
                                            {status !== "loading" && (
                                                <>
                                                    {session ? (
                                                        <div className="space-y-4 mb-6">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-12 w-12">
                                                                    <AvatarImage
                                                                        src={session.user?.avatarUrl || undefined}
                                                                        alt={session.user.displayName || session.user.username}
                                                                    />
                                                                    <AvatarFallback
                                                                        className="bg-steel-600 text-ink-100 font-mono">
                                                                        {(session.user.displayName?.[0] || session.user.username?.[0] || "U").toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-medium text-ink-100">
                                                                        {session.user.displayName || session.user.username}
                                                                    </p>
                                                                    <p className="micro-label mt-1">
                                                                        {session.user.rank || 'Recruit'}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-1">
                                                                {userNavigation.map((item) => (
                                                                    <Link
                                                                        key={item.name}
                                                                        href={item.href}
                                                                        onClick={() => setIsOpen(false)}
                                                                        className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-steel-700 transition-colors"
                                                                    >
                                                                        <item.icon className="h-4 w-4 text-info"
                                                                                   strokeWidth={1.6}/>
                                                                        {item.name}
                                                                        <ChevronRight
                                                                            className="h-4 w-4 ml-auto text-ink-700"/>
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="mb-6">
                                                            <Button
                                                                onClick={() => {
                                                                    setIsOpen(false);
                                                                    signIn();
                                                                }}
                                                                className="w-full font-display font-bold uppercase tracking-nav bg-ember hover:bg-ember-hover text-ember-ink"
                                                            >
                                                                <Shield className="mr-2 h-4 w-4"/>
                                                                Sign In
                                                            </Button>
                                                        </div>
                                                    )}

                                                    <Separator className="bg-line-900 mb-6"/>
                                                </>
                                            )}

                                            {/* Full destination list */}
                                            <div className="space-y-1">
                                                <h3 className="eyebrow mb-3">Navigation</h3>
                                                {destinations.map((item) => {
                                                    const active = isActive(item.href);
                                                    return (
                                                        <Link
                                                            key={item.href}
                                                            href={item.href}
                                                            onClick={() => setIsOpen(false)}
                                                            aria-current={active ? 'page' : undefined}
                                                            className={cn(
                                                                "flex items-start gap-3 px-3 py-3 transition-colors",
                                                                active
                                                                    ? "bg-steel-650 border-l-2 border-ember"
                                                                    : "hover:bg-steel-700 border-l-2 border-transparent"
                                                            )}
                                                        >
                                                            <item.icon
                                                                className={cn(
                                                                    "h-5 w-5 mt-0.5",
                                                                    active ? "text-ember" : "text-info"
                                                                )}
                                                                strokeWidth={1.6}
                                                            />
                                                            <div className="flex-1">
                                                                <span
                                                                    className={cn(
                                                                        "font-display font-semibold uppercase tracking-nav",
                                                                        active ? "text-ember" : "text-ink-200"
                                                                    )}
                                                                >
                                                                    {item.name}
                                                                </span>
                                                                <p className="text-xs text-ink-600 mt-0.5">
                                                                    {item.description}
                                                                </p>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>

                                            {/* Community section */}
                                            <div className="mt-6 space-y-1">
                                                <h3 className="eyebrow mb-3">Community</h3>
                                                <Link
                                                    href="/feedback"
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-steel-700 transition-colors"
                                                >
                                                    <MessageCircle className="h-4 w-4 text-info" strokeWidth={1.6}/>
                                                    Feedback
                                                    <ChevronRight className="h-4 w-4 ml-auto text-ink-700"/>
                                                </Link>
                                            </div>

                                            {/* Support button */}
                                            <div className="mt-6">
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-line-500 hover:bg-steel-700 font-display font-bold uppercase tracking-nav"
                                                    asChild
                                                >
                                                    <a
                                                        href="https://ko-fi.com/J3J41GATK0"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() => setIsOpen(false)}
                                                    >
                                                        <Coffee className="h-4 w-4 mr-2"/>
                                                        Buy me a coffee
                                                    </a>
                                                </Button>
                                            </div>

                                            {/* Sign out (if logged in) */}
                                            {session && (
                                                <div className="mt-6 pt-6 border-t border-line-900">
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start text-bad hover:text-bad hover:bg-steel-700"
                                                        onClick={() => {
                                                            setIsOpen(false);
                                                            signOut();
                                                        }}
                                                    >
                                                        <LogOut className="h-4 w-4 mr-2"/>
                                                        Sign out
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </header>

            <BottomNav isActive={isActive}/>
        </>
    );
};

/**
 * Bottom bar — below 900px only. 66px tall so every target clears the 44px
 * minimum with room to spare, plus the iOS home-indicator inset.
 */
function BottomNav({isActive}: { isActive: (href: string) => boolean }) {
    return (
        <nav
            aria-label="Primary"
            className={cn(
                "shell:hidden fixed inset-x-0 bottom-0 z-50",
                "bg-steel-880 border-t border-line-900",
                "pb-[env(safe-area-inset-bottom)]"
            )}
        >
            <ul className="grid grid-cols-5">
                {bottomBar.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    "relative flex flex-col items-center justify-center gap-1.5 h-bottomnav",
                                    "transition-colors",
                                    active ? "text-ember" : "text-ink-500 hover:text-ink-200"
                                )}
                            >
                                {active && (
                                    <span
                                        aria-hidden="true"
                                        className="absolute inset-x-0 top-0 h-0.5 bg-ember"
                                    />
                                )}
                                <item.icon className="h-[22px] w-[22px]" strokeWidth={1.6}/>
                                <span className="font-display text-xs font-semibold uppercase tracking-nav leading-none">
                                    {item.short}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

export default Header;
