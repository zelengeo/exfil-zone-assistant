import React from 'react';
import Link from 'next/link';
import { SiGithub, SiX, SiDiscord } from '@icons-pack/react-simple-icons';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-military-900 text-tan-300 py-8 px-6 border-t border-olive-900">
            <div className="max-w-7xl mx-auto">
                <div className="text-center space-y-6">
                    {/* Logo */}
                    <div>
                        <Link href="/" className="inline-flex items-center gap-2">
                            <span className="font-bold text-xl text-olive-500 military-stencil">EXFIL ZONE</span>
                            <span className="text-lg text-tan-400 military-stencil">ASSISTANT</span>
                        </Link>
                        <p className="mt-2 text-sm max-w-md mx-auto">
                            Your ultimate tactical companion for the VR extraction shooter experience.
                        </p>
                    </div>

                    {/* Quick Links - Horizontal */}
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

                    {/* Social Links */}
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

                        {/* Ko-fi Button */}
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

                    {/* Copyright & Disclaimer */}
                    <div className="text-xs text-tan-400 space-y-1">
                        <p>Unofficial fan-made assistant for Contractors Showdown.</p>
                        <p>© {currentYear} Exfil Zone Assistant. Game content and materials are trademarks of Caveman Studios.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;