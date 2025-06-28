'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import {Coffee, FileText, Goal, Menu, Package, Target, Wrench, X} from 'lucide-react';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-military-900 text-tan-100 py-4 px-6 sticky top-0 z-50 shadow-lg border-b border-olive-900">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <span className="font-bold text-xl md:text-2xl text-olive-500 military-stencil">EXFIL ZONE</span>
                    <span className="hidden md:inline text-lg text-tan-300 military-stencil">ASSISTANT</span>
                </Link>

                {/* Desktop Navigation - Hidden on mobile */}
                <nav className="hidden md:flex items-center gap-8">

                    <Link href="/items" className="flex items-center gap-2 text-lg hover:text-olive-500 transition-colors group">
                        <Package size={20} className="text-olive-600 group-hover:text-olive-500" />
                        <span>Items</span>
                    </Link>
                    <Link href="/tasks" className="flex items-center gap-2 text-lg hover:text-olive-500 transition-colors group">
                        <Goal size={20} className="text-olive-600 group-hover:text-olive-500" />
                        <span>Tasks</span>
                    </Link>
                    <Link href="/hideout-upgrades" className="flex items-center gap-2 text-lg hover:text-olive-500 transition-colors group">
                        <Wrench size={20} className="text-olive-600 group-hover:text-olive-500" />
                        <span>Hideout Upgrades</span>
                    </Link>
                    <Link href="/combat-sim" className="flex items-center gap-2 text-lg hover:text-olive-500 transition-colors group">
                        <Target size={20} className="text-olive-600 group-hover:text-olive-500" />
                        <span>Combat Sim</span>
                    </Link>
                    <Link href="/guides" aria-disabled className="flex items-center gap-2 text-lg hover:text-olive-500 transition-colors group">
                        <FileText size={20} className="text-olive-600 group-hover:text-olive-500" />
                        <span>Guides</span>
                    </Link>
                </nav>

                {/* CTA Button (Desktop only) + Mobile Menu */}
                <div className="flex items-center gap-4">
                    <a href={"https://ko-fi.com/J3J41GATK0"}
                       className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-olive-600 hover:bg-olive-500 text-military-900 font-medium rounded-sm transition-colors"
                       target="_blank"
                       rel="noopener noreferrer">
                        <Coffee size={24}/>
                    </a>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 hover:bg-military-800 rounded-sm transition-colors border border-transparent hover:border-olive-700"
                        aria-label="Menu"
                    >
                        {isMenuOpen ? <X size={24} className="text-olive-400" /> : <Menu size={24} className="text-olive-400" />}
                    </button>
                </div>
            </div>



            {/* Mobile Menu - Shown when isMenuOpen is true */}
            {isMenuOpen && (
                <div className="md:hidden mt-4 py-4 px-4 bg-military-800 rounded-sm border border-olive-800">
                    <nav className="flex flex-col gap-4">
                        <Link
                            href="/items"
                            className="flex items-center gap-3 text-xl py-2 px-4 hover:bg-military-700 rounded-sm transition-all border border-transparent hover:border-olive-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <Package size={24} className="text-olive-600" />
                            <span>Items Database</span>
                        </Link>
                        <Link
                            href="/hideout-upgrades"
                            className="flex items-center gap-3 text-xl py-2 px-4 hover:bg-military-700 rounded-sm transition-all border border-transparent hover:border-olive-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <Target size={24} className="text-olive-600" />
                            <span>Hideout Upgrades</span>
                        </Link>
                        <Link
                            href="/combat-sim"
                            className="flex items-center gap-3 text-xl py-2 px-4 hover:bg-military-700 rounded-sm transition-all border border-transparent hover:border-olive-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <Target size={24} className="text-olive-600" />
                            <span>Combat Simulator</span>
                        </Link>
                        <Link
                            href="/guides"
                            className="flex items-center gap-3 text-xl py-2 px-4 hover:bg-military-700 rounded-sm transition-all border border-transparent hover:border-olive-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <FileText size={24} className="text-olive-600" />
                            <span>Guides</span>
                        </Link>

                        {/* KoFi CTA in mobile menu */}
                        <a
                            href={"https://ko-fi.com/J3J41GATK0"}
                            className="flex items-center justify-center gap-2 mt-2 py-3 px-4 bg-olive-600 hover:bg-olive-500 text-military-900 font-medium rounded-sm transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <Coffee size={24}/>
                            Buy me a coffee
                        </a>
                    </nav>
                </div>
            )}

        </header>
    );
};

export default Header;