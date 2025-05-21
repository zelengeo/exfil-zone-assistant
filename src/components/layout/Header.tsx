'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, Search, X } from 'lucide-react';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

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
                    <Link href="/items" className="text-lg hover:text-olive-500 transition-colors">
                        Items
                    </Link>
                    <Link href="/hideout" className="text-lg hover:text-olive-500 transition-colors">
                        Hideout
                    </Link>
                    <Link href="/maps" className="text-lg hover:text-olive-500 transition-colors">
                        Maps
                    </Link>
                    <Link href="/quests" className="text-lg hover:text-olive-500 transition-colors">
                        Quests
                    </Link>
                    <Link href="/guides" className="text-lg hover:text-olive-500 transition-colors">
                        Guides
                    </Link>
                </nav>

                {/* Search and Mobile Menu Buttons */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className="p-2 hover:bg-military-800 rounded-sm transition-colors border border-transparent hover:border-olive-700"
                        aria-label="Search"
                    >
                        <Search size={24} className="text-olive-400" />
                    </button>

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
                            className="text-xl py-2 px-4 hover:bg-military-700 rounded-sm transition-all border border-transparent hover:border-olive-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Items
                        </Link>
                        <Link
                            href="/hideout"
                            className="text-xl py-2 px-4 hover:bg-military-700 rounded-sm transition-all border border-transparent hover:border-olive-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Hideout
                        </Link>
                        <Link
                            href="/maps"
                            className="text-xl py-2 px-4 hover:bg-military-700 rounded-sm transition-all border border-transparent hover:border-olive-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Maps
                        </Link>
                        <Link
                            href="/quests"
                            className="text-xl py-2 px-4 hover:bg-military-700 rounded-sm transition-all border border-transparent hover:border-olive-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Quests
                        </Link>
                        <Link
                            href="/guides"
                            className="text-xl py-2 px-4 hover:bg-military-700 rounded-sm transition-all border border-transparent hover:border-olive-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Guides
                        </Link>
                    </nav>
                </div>
            )}

            {/* Search Bar - Shown when isSearchOpen is true */}
            {isSearchOpen && (
                <div className="mt-4 px-4 py-3 bg-military-800 rounded-sm border border-olive-800">
                    <div className="flex items-center gap-2">
                        <Search size={20} className="text-olive-400" />
                        <input
                            type="text"
                            placeholder="Search items, maps, guides..."
                            className="w-full bg-transparent border-none outline-none text-lg placeholder-military-400"
                            autoFocus
                        />
                        <button
                            onClick={() => setIsSearchOpen(false)}
                            className="p-1 hover:bg-military-700 rounded-sm transition-colors"
                        >
                            <X size={20} className="text-olive-400" />
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;