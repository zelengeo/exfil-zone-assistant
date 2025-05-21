import React from 'react';
import Link from 'next/link';
import { SiGithub, SiX, SiDiscord } from '@icons-pack/react-simple-icons';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-military-900 text-tan-300 py-8 px-6 border-t border-olive-900">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo and Description */}
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="font-bold text-xl text-olive-500 military-stencil">EXFIL ZONE</span>
                            <span className="text-lg text-tan-400 military-stencil">ASSISTANT</span>
                        </Link>
                        <p className="mt-4">
                            Your ultimate tactical companion for the VR extraction shooter experience.
                        </p>
                    </div>

                    {/* Navigation Links */}
                    <div className="col-span-1">
                        <h3 className="font-medium text-olive-400 text-lg mb-4 uppercase">Operations</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/items" className="hover:text-olive-500 transition-colors">
                                    Items
                                </Link>
                            </li>
                            <li>
                                <Link href="/hideout" className="hover:text-olive-500 transition-colors">
                                    Hideout
                                </Link>
                            </li>
                            <li>
                                <Link href="/maps" className="hover:text-olive-500 transition-colors">
                                    Maps
                                </Link>
                            </li>
                            <li>
                                <Link href="/quests" className="hover:text-olive-500 transition-colors">
                                    Quests
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="col-span-1">
                        <h3 className="font-medium text-olive-400 text-lg mb-4 uppercase">Intelligence</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/guides" className="hover:text-olive-500 transition-colors">
                                    Field Guides
                                </Link>
                            </li>
                            <li>
                                <Link href="/mechanics" className="hover:text-olive-500 transition-colors">
                                    Combat Systems
                                </Link>
                            </li>
                            <li>
                                <Link href="/vr-tips" className="hover:text-olive-500 transition-colors">
                                    VR Optimization
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="hover:text-olive-500 transition-colors">
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Community */}
                    <div className="col-span-1">
                        <h3 className="font-medium text-olive-400 text-lg mb-4 uppercase">Command</h3>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-olive-500 transition-colors" aria-label="Github">
                                <SiGithub size={24} />
                            </a>
                            <a href="#" className="hover:text-olive-500 transition-colors" aria-label="Twitter">
                                <SiX size={24} />
                            </a>
                            <a href="#" className="hover:text-olive-500 transition-colors" aria-label="Discord">
                                <SiDiscord size={24} />
                            </a>
                        </div>
                        <div className="mt-4 p-3 border border-olive-800 bg-military-800 rounded-sm">
                            <a href="#" className="text-olive-500 hover:text-olive-400 transition-colors">
                                Join Tactical Network
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-8 pt-6 border-t border-military-800 text-center md:text-left">
                    <p className="text-tan-400">© {currentYear} Exfil Zone Assistant. Not affiliated with the official game.</p>
                    <p className="mt-2">
                        <Link href="/privacy" className="hover:text-olive-500 transition-colors mr-4">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="hover:text-olive-500 transition-colors">
                            Terms of Use
                        </Link>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;