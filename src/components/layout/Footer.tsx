import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Package,
    Goal,
    Wrench,
    Hammer,
    Target,
    FileText,
    MessageCircle,
    Coffee,
    ExternalLink
} from 'lucide-react';
import {SiDiscord, SiGithub, SiX} from '@icons-pack/react-simple-icons';
import {getVersion} from "@/config/gameVersion";

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    const navigation = {
        main: [
            { name: 'Items', href: '/items', icon: Package },
            { name: 'Tasks', href: '/tasks', icon: Goal },
            { name: 'Hideout', href: '/hideout-upgrades', icon: Wrench },
            { name: 'Combat Sim', href: '/combat-sim', icon: Target },
            { name: 'Gunsmith', href: '/gunsmith', icon: Hammer },
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
        <footer className="relative mt-auto bg-steel-880 border-t border-line-900">
            <div className="relative z-10">
                {/* Main footer content */}
                <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                        {/* Brand section */}
                        <div className="space-y-4">
                            <Link href="/" className="inline-flex items-baseline gap-2 group">
                                <span className="military-stencil text-2xl text-ink-100 transition-colors group-hover:text-ember">
                                    <strong className="font-extrabold">EXFIL</strong>ZONE
                                </span>
                                <span className="font-mono text-[10px] tracking-micro uppercase text-ink-600 border border-line-700 px-1.5 py-0.5">
                                    {getVersion()}
                                </span>
                            </Link>
                            <p className="text-sm text-ink-500 leading-relaxed">
                                Your tactical companion for Contractors Showdown ExfilZone.
                                Accurate combat simulations and comprehensive game data.
                            </p>
                            <div className="flex gap-2">
                                <Button variant="quiet" size="sm" asChild>
                                    <a
                                        href="https://ko-fi.com/J3J41GATK0"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Coffee className="h-4 w-4" />
                                        Support
                                    </a>
                                </Button>
                                <Button variant="quiet" size="sm" asChild>
                                    <Link href="/feedback">
                                        <MessageCircle className="h-4 w-4" />
                                        Feedback
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="eyebrow mb-4">Resources</h3>
                            <nav className="space-y-3">
                                {navigation.main.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="flex items-center gap-2 text-sm text-ink-400 hover:text-ink-100 transition-colors"
                                    >
                                        <item.icon className="h-4 w-4 text-info" strokeWidth={1.6} />
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Community */}
                        <div>
                            <h3 className="eyebrow mb-4">Community</h3>
                            <nav className="space-y-3">
                                {navigation.support.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        target={item.external ? "_blank" : undefined}
                                        rel={item.external ? "noopener noreferrer" : undefined}
                                        className="flex items-center gap-2 text-sm text-ink-400 hover:text-ink-100 transition-colors"
                                    >
                                        <item.icon className="h-4 w-4 text-info" strokeWidth={1.6} />
                                        {item.name}
                                        {item.external && (
                                            <ExternalLink className="h-3 w-3 ml-1 text-ink-700" />
                                        )}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Legal */}
                        <div>
                            <h3 className="eyebrow mb-4">Legal</h3>
                            <nav className="space-y-3">
                                {navigation.legal.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="block text-sm text-ink-400 hover:text-ink-100 transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-line-900">
                    <div className="max-w-7xl mx-auto px-6 py-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-xs text-ink-600 text-center sm:text-left space-y-1">
                                <p>© {currentYear} ExfilZone Assistant. All rights reserved.</p>
                                <p>
                                    Unofficial fan-made tool for Contractors Showdown.
                                    Game content © Caveman Studios.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs text-ink-600">Built with ☕ by</span>
                                <a
                                    href="https://x.com/pogapwnz"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-steel-700 hover:bg-steel-650 transition-colors"
                                >
                                    <span className="text-xs font-medium text-ink-300">pogapwnz</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
