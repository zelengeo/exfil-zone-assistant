import Link from 'next/link';
import { ReactNode } from 'react';

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-blue-800 text-white p-4 shadow-md">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                    <Link href="/" className="text-2xl font-bold mb-4 md:mb-0">
                        Exfil Zone Assistant
                    </Link>

                    {/* Search bar - optimized for VR with larger clickable area */}
                    <div className="w-full md:w-1/3 mb-4 md:mb-0">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="p-4 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none w-full"
                            aria-label="Search the assistant"
                        />
                    </div>
                </div>
            </header>

            {/* Navigation - VR optimized with large touch targets */}
            <nav className="bg-blue-700 text-white py-3 shadow-md">
                <div className="container mx-auto">
                    <ul className="flex flex-wrap justify-center space-x-1 md:space-x-4">
                        <li className="p-2">
                            <Link href="/" className="bg-blue-600 inline-block px-6 py-3 rounded-lg hover:bg-blue-500 text-white text-lg transition-colors">
                                Home
                            </Link>
                        </li>
                        <li className="p-2">
                            <Link href="/items" className="bg-blue-600 inline-block px-6 py-3 rounded-lg hover:bg-blue-500 text-white text-lg transition-colors">
                                Items
                            </Link>
                        </li>
                        <li className="p-2">
                            <Link href="/maps" className="bg-blue-600 inline-block px-6 py-3 rounded-lg hover:bg-blue-500 text-white text-lg transition-colors">
                                Maps
                            </Link>
                        </li>
                        <li className="p-2">
                            <Link href="/quests" className="bg-blue-600 inline-block px-6 py-3 rounded-lg hover:bg-blue-500 text-white text-lg transition-colors">
                                Quests
                            </Link>
                        </li>
                        <li className="p-2">
                            <Link href="/guides" className="bg-blue-600 inline-block px-6 py-3 rounded-lg hover:bg-blue-500 text-white text-lg transition-colors">
                                Guides
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow container mx-auto p-4 md:p-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white p-8">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">Exfil Zone Assistant</h3>
                            <p className="text-base">Your comprehensive resource for game information, optimized for VR viewing.</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li><Link href="/about" className="hover:text-blue-300 text-base">About</Link></li>
                                <li><Link href="/contact" className="hover:text-blue-300 text-base">Contact</Link></li>
                                <li><Link href="/vr-settings" className="hover:text-blue-300 text-base">VR Comfort Settings</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">Community</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="hover:text-blue-300 text-base">Official Game Site</a></li>
                                <li><a href="#" className="hover:text-blue-300 text-base">Forums</a></li>
                                <li><a href="#" className="hover:text-blue-300 text-base">Discord</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 pt-4 border-t border-gray-600 text-center text-base">
                        <p>&copy; {new Date().getFullYear()} Exfil Zone Assistant. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}