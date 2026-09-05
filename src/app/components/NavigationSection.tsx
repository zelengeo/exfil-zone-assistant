import React from "react";
import Link from "next/link";
import {Briefcase, FileText, Hammer, House, MapPin, Package, Target, type LucideIcon} from "lucide-react";
import {cn} from "@/lib/utils";

interface Operation {
    name: string;
    href: string;
    icon: LucideIcon;
    blurb: string;
    soon?: boolean;
}

const operations: Operation[] = [
    {name: "Combat Simulator", href: "/combat-sim", icon: Target, blurb: "Test weapon damage against armor configurations"},
    {name: "Items Database", href: "/items", icon: Package, blurb: "Browse every in-game item, its stats and locations"},
    {name: "Gunsmith", href: "/gunsmith", icon: Hammer, blurb: "Build a weapon and read the consequence of each part"},
    {name: "Hideout", href: "/hideout-upgrades", icon: House, blurb: "Plan base upgrades and track what each one needs"},
    {name: "Tasks", href: "/tasks", icon: Briefcase, blurb: "227 contracts as vendor chains, with progress tracking"},
    {name: "Guides", href: "/guides", icon: FileText, blurb: "Detailed explanations of the game's core systems"},
    {name: "Maps", href: "#", icon: MapPin, blurb: "Interactive maps with loot spots and extracts", soon: true},
];

export default function NavigationSection() {
    return (
        <section className="py-16 bg-steel-900 border-y border-line-900">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-center gap-4 mb-10">
                    <span className="h-px w-16 bg-line-700"/>
                    <h2 className="eyebrow text-ink-500">Operations</h2>
                    <span className="h-px w-16 bg-line-700"/>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                    {operations.map((op) => {
                        const body = (
                            <>
                                <div className={cn(
                                    "flex-none w-11 h-11 flex items-center justify-center border",
                                    op.soon ? "border-line-700 text-ink-600" : "border-line-600 text-info"
                                )}>
                                    <op.icon size={22} strokeWidth={1.6}/>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className={cn(
                                            "font-display font-bold uppercase tracking-tight text-lg leading-tight",
                                            op.soon ? "text-ink-400" : "text-ink-100 group-hover:text-ember transition-colors"
                                        )}>
                                            {op.name}
                                        </h3>
                                        {op.soon && (
                                            <span className="flex-none font-mono text-[9px] tracking-micro uppercase text-ink-600 border border-line-700 px-1.5 py-0.5">
                                                Soon
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-ink-500 mt-1 leading-relaxed">{op.blurb}</p>
                                </div>
                            </>
                        );

                        if (op.soon) {
                            return (
                                <div key={op.name} className="flex items-start gap-4 p-6 bg-steel-800 border border-dashed border-line-700 opacity-70">
                                    {body}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={op.name}
                                href={op.href}
                                className="group flex items-start gap-4 p-6 bg-steel-800 border border-line-800 hover:bg-steel-700 hover:border-line-600 transition-colors"
                            >
                                {body}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
