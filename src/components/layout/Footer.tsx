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
import {SiDiscord, SiGithub, SiKofi, SiX} from '@icons-pack/react-simple-icons';

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
                            <span className="text-xs text-tan-500">Powered by</span>
                            <a
                                href="https://ko-fi.com/J3J41GATK0"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm bg-olive-900/30 hover:bg-olive-900/50 transition-colors"
                            >
                                <SiKofi className="h-4 w-4 text-[#FF5E5B]" />
                                <span className="text-xs font-medium text-tan-300">Ko-fi</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
        /*<footer className="bg-military-900 text-tan-300 py-8 px-6 border-t border-olive-900">
            <div className="max-w-7xl mx-auto">
                <div className="text-center space-y-6">
                    {/!* Logo *!/}
                    <div>
                        <Link href="/" className="inline-flex items-center gap-2">
                            <span className="font-bold text-xl text-olive-500 military-stencil">EXFILZONE</span>
                            <span className="text-lg text-tan-400 military-stencil">ASSISTANT</span>
                        </Link>
                        <p className="mt-2 text-sm max-w-md mx-auto">
                            Your ultimate tactical companion for the VR extraction shooter experience.
                        </p>
                    </div>

                    {/!* Quick Links - Horizontal *!/}
                    <div className="flex flex-wrap justify-center gap-6 text-sm">
                        <Link href="/items" className="hover:text-olive-500 transition-colors">Items</Link>
                        <span className="text-military-700">•</span>
                        <Link href="/tasks" className="hover:text-olive-500 transition-colors">Tasks</Link>
                        <span className="text-military-700">•</span>
                        <Link href="/hideout-upgrades" className="hover:text-olive-500 transition-colors">Hideout Upgrades</Link>
                        <span className="text-military-700">•</span>
                        <Link href="/combat-sim" className="hover:text-olive-500 transition-colors">Combat Sim</Link>
                        <span className="text-military-700">•</span>
                        <Link href="/guides" className="hover:text-olive-500 transition-colors">Guides</Link>
                    </div>

                    {/!* Social Links *!/}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <div className="flex gap-4">
                            <a href={"https://github.com/zelengeo/exfil-zone-assistant"}
                               className="p-2 rounded-sm hover:bg-military-800 transition-colors border border-transparent hover:border-olive-700"
                               target="_blank"
                               rel="noopener noreferrer"
                               aria-label="GitHub">
                                <SiGithub size={20} />
                            </a>
                            <a href={"https://x.com/pogapwnz"}
                               className="p-2 rounded-sm hover:bg-military-800 transition-colors border border-transparent hover:border-olive-700"
                               target="_blank"
                               rel="noopener noreferrer"
                               aria-label="X (Twitter)">
                                <SiX size={20} />
                            </a>
                            <a href={"https://discord.gg/2FCDZK6C25"}
                               className="p-2 rounded-sm hover:bg-military-800 transition-colors border border-transparent hover:border-olive-700"
                               target="_blank"
                               rel="noopener noreferrer"
                               aria-label="Discord">
                                <SiDiscord size={20} />
                            </a>
                        </div>

                        {/!* Ko-fi Button *!/}
                        <a href={"https://ko-fi.com/J3J41GATK0"}
                           className="inline-flex items-center gap-2 px-4 py-2 bg-olive-600 hover:bg-olive-500 text-military-900 font-medium rounded-sm transition-colors"
                           target="_blank"
                           rel="noopener noreferrer">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current">
                                <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z"/>
                            </svg>
                            Support on Ko-fi
                        </a>
                    </div>

                    {/!*TODO - fix style for Legal stuff *!/}
                    <div className="flex gap-4 text-sm">
                        <Link href="/terms" className="hover:text-olive-500 transition-colors">
                            Terms
                        </Link>
                        <Link href="/privacy" className="hover:text-olive-500 transition-colors">
                            Privacy
                        </Link>
                    </div>

                    {/!* Copyright & Disclaimer *!/}
                    <div className="text-xs text-tan-400 space-y-1">
                        <p>Unofficial fan-made assistant for Contractors Showdown.</p>
                        <p>© {currentYear} ExfilZone Assistant. Game content and materials are trademarks of Caveman Studios.</p>
                    </div>
                </div>
            </div>
        </footer>*/
