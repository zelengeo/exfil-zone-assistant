'use client';

import React, {useState} from 'react';
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
    Package,
    Goal,
    Wrench,
    Target,
    FileText,
    Menu,
    Coffee,
    Shield,
    User,
    LogOut,
    Settings,
    BarChart3,
    MessageCircle,
    ChevronRight
} from 'lucide-react';
import {Skeleton} from "@/components/ui/skeleton";

const Header: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const {data: session, status} = useSession();

    const navigation = [
        {
            name: 'Items Database',
            href: '/items',
            icon: Package,
            description: 'Weapons, armor, consumables'
        },
        {
            name: 'Tasks',
            href: '/tasks',
            icon: Goal,
            description: 'Quest guides and objectives'
        },
        {
            name: 'Hideout',
            href: '/hideout-upgrades',
            icon: Wrench,
            description: 'Base upgrade requirements'
        },
        {
            name: 'Combat Simulator',
            href: '/combat-sim',
            icon: Target,
            description: 'Calculate damage and TTK',
            highlight: true
        },
        {
            name: 'Guides',
            href: '/guides',
            icon: FileText,
            description: 'Tips and strategies'
        },
    ];

    const userNavigation = [
        {name: 'Profile', href: `/user/${session?.user?.username || session?.user?.id}`, icon: User},
        {name: 'Dashboard', href: '/dashboard', icon: BarChart3},
        {name: 'Settings', href: '/settings', icon: Settings},
    ];

    const isActiveRoute = (href: string) => pathname === href;

    // Desktop user menu component
    const DesktopUserMenu = () => {
        if (status === "loading") {
            return (<div className="flex items-center gap-4">
                <Skeleton className="hidden md:block h-10 w-32 rounded-sm"/>
                <Skeleton className="md:hidden h-10 w-10 rounded-sm"/>
            </div>)
        }

        if (!session) {
            return (
                <Button
                    onClick={() => signIn()}
                    size="sm"
                    className="bg-olive-600 hover:bg-olive-500"
                >
                    <Shield className="mr-2 h-4 w-4"/>
                    Sign In
                </Button>
            );
        }

        const userInitial = session.user.username?.[0] || session.user.name?.[0] || "U";
        const displayName = session.user.username || session.user.name || "User";

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="flex items-center gap-3 px-3 py-2 rounded-sm hover:bg-military-800 border border-transparent hover:border-olive-700"
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
                    <DropdownMenuSeparator className="bg-military-700"/>
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
                    <DropdownMenuItem asChild>
                        <Link href="/settings" className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4"/>
                            <span>Settings</span>
                        </Link>
                    </DropdownMenuItem>
                    {session.user?.roles?.includes('admin') && (
                        <>
                            <DropdownMenuSeparator className="bg-military-700"/>
                            <DropdownMenuItem asChild>
                                <Link href="/admin" className="cursor-pointer">
                                    <Shield className="mr-2 h-4 w-4"/>
                                    <span>Admin Panel</span>
                                </Link>
                            </DropdownMenuItem>
                        </>
                    )}
                    <DropdownMenuSeparator className="bg-military-700"/>
                    <DropdownMenuItem
                        className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-900/20"
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
        <header className="sticky top-0 z-50 w-full bg-military-900/95 backdrop-blur-md border-b border-olive-800">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="flex items-center gap-1 sm:gap-2">
                            <span className="text-xl md:text-2xl text-olive-500 military-stencil transition-colors group-hover:text-olive-400">
                                <span className="hidden sm:inline"><strong>EXFIL</strong>ZONE</span>
                                <span className="sm:hidden">EZ</span>
                            </span>
                            <span className="text-sm sm:text-lg text-tan-300 military-stencil">ASSISTANT</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    "hover:bg-military-800 hover:text-tan-100",
                                    isActiveRoute(item.href)
                                        ? "bg-olive-900/30 text-olive-400"
                                        : "text-tan-300",
                                    item.highlight && "text-olive-400"
                                )}
                            >
                                <span className="flex items-center gap-2">
                                    <item.icon className="h-4 w-4"/>
                                    {item.name.split(' ')[0]}
                                </span>
                            </Link>
                        ))}
                    </nav>

                    {/* Right side actions */}
                    <div className="flex items-center gap-3">
                        {/* Desktop user menu */}
                        <div className="hidden lg:block">
                            <DesktopUserMenu/>
                        </div>

                        {/* Mobile menu - single hamburger for everything */}
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild className="lg:hidden">
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5"/>
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-full sm:w-80 p-0 bg-military-900 border-olive-700">
                                <SheetHeader className="px-6 pt-6 pb-4 border-b border-military-800">
                                    <SheetTitle className="text-left">
                                        <span className="text-xl text-olive-500 military-stencil">
                                            <strong>EXFIL</strong>ZONE
                                            <span className="text-sm text-tan-300">ASSISTANT</span>
                                        </span>
                                    </SheetTitle>
                                </SheetHeader>

                                <ScrollArea className="h-[calc(100vh-5rem)] pb-4">
                                    <div className="px-6 py-4">
                                        {/* User section in mobile menu */}
                                        {status !== "loading" && (
                                            <>
                                                {session ? (
                                                    <div className="space-y-4 mb-6">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-12 w-12">
                                                                <AvatarImage
                                                                    src={session.user?.image || undefined}
                                                                    alt={session.user.username || session.user.name}
                                                                />
                                                                <AvatarFallback className="bg-olive-600 text-white">
                                                                    {(session.user.username?.[0] || session.user.name?.[0] || "U").toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium text-tan-100">
                                                                    {session.user.username || session.user.name}
                                                                </p>
                                                                <p className="text-sm text-tan-400">
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
                                                                    className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-military-800 transition-colors"
                                                                >
                                                                    <item.icon className="h-4 w-4 text-olive-600"/>
                                                                    {item.name}
                                                                    <ChevronRight
                                                                        className="h-4 w-4 ml-auto text-military-600"/>
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
                                                            className="w-full bg-olive-600 hover:bg-olive-500"
                                                        >
                                                            <Shield className="mr-2 h-4 w-4"/>
                                                            Sign In
                                                        </Button>
                                                    </div>
                                                )}

                                                <Separator className="bg-military-800 mb-6"/>
                                            </>
                                        )}

                                        {/* Navigation */}
                                        <div className="space-y-1">
                                            <h3 className="text-xs font-semibold text-tan-500 uppercase tracking-wider mb-3">
                                                Navigation
                                            </h3>
                                            {navigation.map((item) => (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className={cn(
                                                        "flex items-start gap-3 px-3 py-3 rounded-md transition-colors",
                                                        "hover:bg-military-800",
                                                        isActiveRoute(item.href) && "bg-olive-900/20 text-olive-400"
                                                    )}
                                                >
                                                    <item.icon className={cn(
                                                        "h-5 w-5 mt-0.5",
                                                        isActiveRoute(item.href) ? "text-olive-400" : "text-olive-600"
                                                    )}/>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{item.name}</span>
                                                            {item.highlight && (
                                                                <Badge variant="default" className="text-xs">
                                                                    Popular
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-tan-500 mt-0.5">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>

                                        {/* Community section */}
                                        <div className="mt-6 space-y-1">
                                            <h3 className="text-xs font-semibold text-tan-500 uppercase tracking-wider mb-3">
                                                Community
                                            </h3>
                                            <Link
                                                href="/feedback"
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-military-800 transition-colors"
                                            >
                                                <MessageCircle className="h-4 w-4 text-olive-600"/>
                                                Feedback
                                                <ChevronRight className="h-4 w-4 ml-auto text-military-600"/>
                                            </Link>
                                        </div>

                                        {/* Support button */}
                                        <div className="mt-6">
                                            <Button
                                                variant="outline"
                                                className="w-full border-olive-700 hover:bg-olive-900/20"
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
                                            <div className="mt-6 pt-6 border-t border-military-800">
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
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
    );
};

export default Header;