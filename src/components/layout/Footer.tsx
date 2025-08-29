import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    Package,
    Goal,
    Wrench,
    Target,
    FileText,
    Heart,
    MessageCircle,
    Coffee,
    ExternalLink
} from 'lucide-react';
import {SiDiscord, SiGithub, SiX} from '@icons-pack/react-simple-icons';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    const navigation = {
        main: [
            { name: 'Items', href: '/items', icon: Package },
            { name: 'Tasks', href: '/tasks', icon: Goal },
            { name: 'Hideout', href: '/hideout-upgrades', icon: Wrench },
            { name: 'Combat Sim', href: '/combat-sim', icon: Target },
            { name: 'Guides', href: '/guides', icon: FileText },
        ],
        support: [
            { name: 'Feedback', href: '/feedback', icon: MessageCircle },
            { name: 'X', href: 'https://x.com/pogapwnz', icon: SiX, external: true },
            { name: 'Discord', href: 'https://discord.gg/2FCDZK6C25', icon: SiDiscord, external: true },
            { name: 'GitHub', href: 'https://github.com/zelengeo/exfil-zone-assistant', icon: SiGithub, external: true },
        ],
        legal: [
            { name: 'Terms of Service', href: '/terms' },
            { name: 'Privacy Policy', href: '/privacy' },
            { name: 'Cookie Policy', href: '/cookies' },
        ],
    };

    return (
        <footer className="relative mt-auto bg-military-900 border-t border-olive-800">
            {/* Texture overlay */}
            <div className="absolute inset-0 texture-overlay pointer-events-none opacity-30"></div>

            <div className="relative z-10">
                {/* Main footer content */}
                <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                        {/* Brand section */}
                        <div className="space-y-4">
                            <Link href="/" className="inline-block">
                                <span className="text-2xl text-olive-500 military-stencil">
                                    <strong>EXFIL</strong>ZONE
                                </span>
                                <Badge variant="outline" className="ml-2 text-xs">
                                    v1.14.4
                                </Badge>
                            </Link>
                            <p className="text-sm text-tan-400 leading-relaxed">
                                Your tactical companion for Contractors Showdown ExfilZone.
                                Providing accurate combat simulations and comprehensive game data.
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-olive-700 hover:bg-olive-900/20"
                                    asChild
                                >
                                    <a
                                        href="https://ko-fi.com/J3J41GATK0"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2"
                                    >
                                        <Coffee className="h-4 w-4" />
                                        Support
                                    </a>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-olive-700 hover:bg-olive-900/20"
                                    asChild
                                >
                                    <Link href="/feedback" aria-disabled={true} className="flex items-center gap-2">
                                        <Heart className="h-4 w-4" />
                                        Feedback
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-sm font-semibold text-tan-100 uppercase tracking-wider mb-4">
                                Resources
                            </h3>
                            <nav className="space-y-3">
                                {navigation.main.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="flex items-center gap-2 text-sm text-tan-400 hover:text-olive-400 transition-colors"
                                    >
                                        <item.icon className="h-4 w-4 text-olive-600" />
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Community */}
                        <div>
                            <h3 className="text-sm font-semibold text-tan-100 uppercase tracking-wider mb-4">
                                Community
                            </h3>
                            <nav className="space-y-3">
                                {navigation.support.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        target={item.external ? "_blank" : undefined}
                                        rel={item.external ? "noopener noreferrer" : undefined}
                                        className="flex items-center gap-2 text-sm text-tan-400 hover:text-olive-400 transition-colors"
                                    >
                                        <item.icon className="h-4 w-4 text-olive-600" />
                                        {item.name}
                                        {item.external && (
                                            <ExternalLink className="h-3 w-3 ml-1" />
                                        )}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Legal */}
                        <div>
                            <h3 className="text-sm font-semibold text-tan-100 uppercase tracking-wider mb-4">
                                Legal
                            </h3>
                            <nav className="space-y-3">
                                {navigation.legal.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="block text-sm text-tan-400 hover:text-olive-400 transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <Separator className="bg-olive-800" />
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-xs text-tan-500 text-center sm:text-left space-y-1">
                            <p>© {currentYear} ExfilZone Assistant. All rights reserved.</p>
                            <p>
                                Unofficial fan-made tool for Contractors Showdown.
                                Game content © Caveman Studios.
                            </p>
                        </div>

                        {/* Ko-fi supporter badge */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-tan-500">Built with ☕ by </span>
                            <a
                                href="https://x.com/pogapwnz"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 py-1 rounded-sm bg-olive-900/30 hover:bg-olive-900/50 transition-colors"
                            >
                                <span className="text-xs font-medium text-tan-300">pogapwnz</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;