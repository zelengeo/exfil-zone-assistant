'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Shield,
    MessageSquare,
    Home,
    Menu,
    ChevronLeft, Users
} from 'lucide-react';

const navItems = [
    { href: '/admin', label: 'Overview', icon: Home },
    { href: '/admin/roles', label: 'User Roles', icon: Shield },
    { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
    { href: '/admin/users', label: 'Users', icon: Users },
    // { href: '/admin/content', label: 'Content', icon: FileText },
    // { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    // { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <TooltipProvider delayDuration={0}>
            <aside className={cn(
                "sticky top-20 h-fit transition-all duration-300",
                isCollapsed ? "w-16" : "w-64"
            )}>
                <div className="military-box p-4 rounded-sm">
                    <div className={cn(
                        "flex items-center",
                        isCollapsed ? "justify-center" : "justify-between"
                    )}>
                        {!isCollapsed && (
                            <h2 className="text-sm font-semibold text-tan-500 uppercase tracking-wider">
                                Admin Panel
                            </h2>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="h-8 w-8 hover:bg-military-800"
                        >
                            {isCollapsed ? (
                                <Menu className="h-4 w-4 text-tan-400" />
                            ) : (
                                <ChevronLeft className="h-4 w-4 text-tan-400" />
                            )}
                        </Button>
                    </div>

                    <nav className={cn("mt-4", isCollapsed ? "space-y-2" : "space-y-1")}>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const linkContent = (
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-sm text-sm font-medium transition-colors",
                                        "hover:bg-military-800 hover:text-tan-100",
                                        isCollapsed ? "justify-center p-2" : "px-3 py-2",
                                        isActive
                                            ? "bg-olive-900/20 text-olive-400"
                                            : "text-tan-300"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "flex-shrink-0",
                                        isCollapsed ? "h-5 w-5" : "h-4 w-4"
                                    )} />
                                    {!isCollapsed && <span>{item.label}</span>}
                                </Link>
                            );

                            if (isCollapsed) {
                                return (
                                    <Tooltip key={item.href}>
                                        <TooltipTrigger asChild>
                                            {linkContent}
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="bg-military-800 border-military-700">
                                            <p className="text-tan-100">{item.label}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            }

                            return <div key={item.href}>{linkContent}</div>;
                        })}
                    </nav>

                    {!isCollapsed && (
                        <div className="mt-6 pt-4 border-t border-military-700">
                            <p className="text-xs text-tan-500 text-center">
                                Admin Access Only
                            </p>
                        </div>
                    )}
                </div>
            </aside>
        </TooltipProvider>
    );
}