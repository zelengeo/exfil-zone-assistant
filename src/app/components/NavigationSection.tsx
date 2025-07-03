import React from "react";
import Link from "next/link";
import {Briefcase, FileText, House, MapPin, Package, Target} from "lucide-react";

export default function NavigationSection() {
    return <section className="py-16 bg-military-800 relative">
        <div className="absolute inset-0 texture-overlay"></div>
        <div className="container mx-auto px-6 relative z-10">
            <div className="flex items-center justify-center mb-10">
                <div className="h-px bg-olive-700 w-20"></div>
                <h2 className="text-3xl font-bold mx-4 text-center military-stencil text-olive-400">OPERATIONS</h2>
                <div className="h-px bg-olive-700 w-20"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                <Link href="/combat-sim" className="military-card hover:bg-military-700 rounded-sm p-8 transition-all hover:shadow-lg group">
                    <div className="flex items-start gap-4">
                        <div className="bg-olive-600 p-3 rounded-sm text-military-900 border border-olive-500">
                            <Target size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-olive-400 transition-colors">Combat Simulator</h3>
                            <p className="text-tan-300">Test weapon damage against armor configurations</p>
                        </div>
                    </div>
                </Link>

                <Link href="/items"
                      className="military-card hover:bg-military-700 rounded-sm p-8 transition-all hover:shadow-lg group">
                    <div className="flex items-start gap-4">
                        <div className="bg-olive-600 p-3 rounded-sm text-military-900 border border-olive-500">
                            <Package size={32}/>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-olive-400 transition-colors">Items
                                Database</h3>
                            <p className="text-tan-300">Browse all in-game items, stats, and locations</p>
                        </div>
                    </div>
                </Link>

                <Link href="/hideout-upgrades"
                    className="relative military-card rounded-sm p-8 bg-military-800 border border-military-700 opacity-75">
                    <div className="flex items-start gap-4">
                        <div className="bg-military-700 p-3 rounded-sm text-tan-300 border border-military-600">
                            <House size={32}/>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2 text-tan-300">Hideout</h3>
                            <p className="text-tan-300/70">Upgrade your base and track progression</p>
                        </div>
                    </div>
                </Link>

                <Link href="/guides"
                      className="military-card hover:bg-military-700 rounded-sm p-8 transition-all hover:shadow-lg group">
                    <div className="flex items-start gap-4">
                        <div className="bg-olive-600 p-3 rounded-sm text-military-900 border border-olive-500">
                            <FileText size={32}/>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-olive-400 transition-colors">Game
                                Mechanics</h3>
                            <p className="text-tan-300">Detailed explanations of core systems</p>
                        </div>
                    </div>
                </Link>

                <div
                    className="relative military-card rounded-sm p-8 bg-military-800 border border-military-700 opacity-75">
                    <div className="flex items-start gap-4">
                        <div className="bg-military-700 p-3 rounded-sm text-tan-300 border border-military-600">
                            <Briefcase size={32}/>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2 text-tan-300">Quests</h3>
                            <p className="text-tan-300/70">Mission guides and reward tracking</p>
                        </div>
                        <div
                            className="absolute top-4 right-4 bg-military-700 text-olive-400 px-3 py-1 rounded-sm text-sm font-medium border border-olive-600">
                            Coming Soon
                        </div>
                    </div>
                </div>

                <div
                    className="relative military-card rounded-sm p-8 bg-military-800 border border-military-700 opacity-75">
                    <div className="flex items-start gap-4">
                        <div className="bg-military-700 p-3 rounded-sm text-tan-300 border border-military-600">
                            <House size={32}/>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2 text-tan-300">Hideout</h3>
                            <p className="text-tan-300/70">Upgrade your base and track progression</p>
                        </div>
                        <div
                            className="absolute top-4 right-4 bg-military-700 text-olive-400 px-3 py-1 rounded-sm text-sm font-medium border border-olive-600">
                            Coming Soon
                        </div>
                    </div>
                </div>

                <div
                    className="relative military-card rounded-sm p-8 bg-military-800 border border-military-700 opacity-75">
                    <div className="flex items-start gap-4">
                        <div className="bg-military-700 p-3 rounded-sm text-tan-300 border border-military-600">
                            <MapPin size={32}/>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="text-xl font-bold text-tan-300">Maps</h3>
                                <span className="bg-military-700 text-olive-400 px-2 py-0.5 rounded-sm text-xs font-medium border border-olive-600 whitespace-nowrap">
                            Coming Soon
                        </span>
                            </div>
                            <p className="text-tan-300/70">Interactive maps with loot spots and extracts</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </section>
}