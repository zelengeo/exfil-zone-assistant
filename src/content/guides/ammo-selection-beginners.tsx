import React from 'react';
import Link from 'next/link';
import Image from "next/image";
import { Target, Zap, Shield, AlertTriangle, Info, ExternalLink } from 'lucide-react';

export default function AmmoSelectionBeginners() {
    return (
        <div className="space-y-8">
            {/* Introduction */}
            <section>
                <p className="text-lg text-tan-200 leading-relaxed">
                    Choosing the right ammunition is crucial for survival. This guide will teach you
                    the fundamentals of penetration mechanics, when to target armor versus limbs,
                    and how to make effective decisions in combat situations.
                </p>
            </section>

            {/* TLDR Section */}
            <section className="bg-green-900/20 border border-green-700/50 rounded-sm p-6">
                <div className="flex items-start gap-3 mb-4">
                    <Zap className="text-green-400 mt-1" size={24} />
                    <h2 className="text-2xl font-bold text-tan-100">TL;DR - Quick Guide</h2>
                </div>
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Target className="text-green-400 mt-1 flex-shrink-0" size={20} />
                        <p className="text-tan-200">
                            <strong className="text-green-300">Use the best ammo available</strong> and aim for the head whenever possible.
                            Memorize the better armor in the game and evaluate if your ammo can penetrate it.
                        </p>
                    </div>

                    <div className="flex items-start gap-3">
                        <Shield className="text-yellow-400 mt-1 flex-shrink-0" size={20} />
                        <p className="text-tan-200">
                            <strong className="text-yellow-300">If armor is too strong:</strong> Shoot unprotected body parts like arms and legs instead of wasting ammo on armor.
                        </p>
                    </div>

                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-blue-400 mt-1 flex-shrink-0" size={20} />
                        <p className="text-tan-200">
                            <strong className="text-blue-300">Alternative &#34;Leg Meta&#34;:</strong> Use lowest-tier ammo and focus only on
                            unprotected parts. Cheap, effective, but requires more shots than headshots.
                        </p>
                    </div>
                </div>
            </section>

            {/* Penetration Mechanics */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-4">
                    <Shield className="text-blue-400 mt-1" size={24} />
                    <h2 className="text-2xl font-bold text-tan-100">Penetration Mechanics</h2>
                </div>

                <div className="space-y-4 text-tan-200">
                    <p className="text-lg">
                        The penetration system is straightforward: if your <strong>ammo&#39;s penetration power</strong> is
                        greater than the enemy&#39;s <strong>armor class</strong>, you have a <strong>92% chance</strong>
                        ‎ to penetrate their armor.
                    </p>

                    <div className="bg-military-800 border-l-4 border-blue-600 p-4">
                        <p className="mb-2"><strong>What happens when you shoot:</strong></p>
                        <ul className="space-y-1 list-disc list-inside ml-4">
                            <li>If penetration succeeds: Damage applied to the body part is reduced by armor&#39;s penetration resistance (typically 20-40%)</li>
                            <li>If penetration fails: Only marginal blunt damage</li>
                            <li>In both cases: Armor durability is depleted</li>
                        </ul>
                    </div>

                    <p>
                        As armor durability decreases, its effective <strong>armor class</strong> drops.
                        At 0 durability, even the strongest armor can be penetrated with 92% chance.
                    </p>

                    <div className="bg-blue-900/20 border border-blue-700/50 rounded-sm p-4">
                        <div className="flex items-start gap-3">
                            <Info className="text-blue-400 mt-1" size={20} />
                            <div>
                                <p className="text-blue-200">
                                    <strong>Rule of thumb:</strong> Higher ammo tier = more armor damage and penetration power.
                                    When shooting protected areas, better ammo depletes enemy armor faster.
                                </p>
                                <Link
                                    href="/items/ammunition"
                                    className="inline-flex items-center gap-1 mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    View all ammunition stats <ExternalLink size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <p>
                        For detailed mechanics, check our comprehensive
                        <Link
                            href="/guides/armor-penetration-guide"
                            className="inline-flex items-center gap-1 ml-1 text-olive-400 hover:text-olive-300 transition-colors"
                        >
                            penetration guide <ExternalLink size={14} />
                        </Link>.
                    </p>
                </div>
            </section>

            {/* Combat Example */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-4">
                    <Target className="text-red-400 mt-1" size={24} />
                    <h2 className="text-2xl font-bold text-tan-100">Practical Combat Example</h2>
                </div>

                <div className="space-y-4 text-tan-200">

                    <div className="space-y-4 text-tan-200">
                        <div>
                            <span>Consider a starter kit with </span>
                            <Link
                                href="/items/weapon-m4a1-cqbr"
                                className="inline-flex gap-1 items-center text-olive-400 hover:text-olive-300 transition-colors"
                            >
                                <span className="text-sm font-medium">M4A1 CQBR</span><ExternalLink size={14} />
                            </Link>
                            <span> and </span>
                            <Link
                                href="/items/ammo-556x45-mk318"
                                className="inline-flex gap-1 items-center text-olive-400 hover:text-olive-300 transition-colors"
                            >
                                <span className="text-sm font-medium">Mk318</span><ExternalLink size={14} />
                            </Link>
                            <span> ammo versus a mid-game enemy wearing </span>
                            <Link
                                href="/items/helmet-ach-green"
                                className="inline-flex gap-1 items-center text-olive-400 hover:text-olive-300 transition-colors"
                            >
                                <span className="text-sm font-medium">ACH Helmet</span><ExternalLink size={14} />
                            </Link>
                            <span> and </span>
                            <Link
                                href="/items/armor-6b17-upgrade"
                                className="inline-flex gap-1 items-center text-olive-400 hover:text-olive-300 transition-colors"
                            >
                                <span className="text-sm font-medium">6B17 Upgraded Body Armor</span><ExternalLink size={14} />
                            </Link>
                            <span>.</span>
                        </div>

                        <Link
                            href="/combat-sim?a0w=weapon-m4a1-cqbr&a0a=ammo-556x45-mk318&da=armor-6b17-upgrade&dad=100&dh=helmet-ach-green&dhd=100&df=mask-ach-faceshield&r=0&d=stk"
                            className="inline-flex items-center gap-1 mt-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                        >
                            Try this setup in the Combat Simulator <ExternalLink size={14} />
                        </Link>
                    </div>

                    <div className="bg-military-800 p-4 rounded border-l-4 border-red-600">
                        <p className="mb-3"><strong>Combat Simulation Results:</strong></p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="text-center">
                                <div className="text-red-400 font-bold text-lg">5</div>
                                <div>Head shots</div>
                            </div>
                            <div className="text-center">
                                <div className="text-yellow-400 font-bold text-lg">8</div>
                                <div>Chest shots</div>
                            </div>
                            <div className="text-center">
                                <div className="text-orange-400 font-bold text-lg">18</div>
                                <div>Stomach shots</div>
                            </div>
                            <div className="text-center">
                                <div className="text-green-400 font-bold text-lg">9</div>
                                <div>Leg shots</div>
                            </div>
                        </div>
                    </div>

                    <p>
                        Depending on your aim confidence, either go for headshots (fastest kill) or
                        target legs (more reliable but requires more shots).
                    </p>

                    <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-sm p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-yellow-400 mt-1" size={20} />
                            <div>
                                <p className="text-yellow-200">
                                    <strong>Headshot Advantage:</strong> Enemy armor might already be damaged,
                                    or you might hit that lucky 2-8% penetration chance even when your ammo
                                    isn&#39;t strong enough.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Leg Meta Strategy */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-4">
                    <Target className="text-green-400 mt-1" size={24} />
                    <h2 className="text-2xl font-bold text-tan-100">The &#34;Leg Meta&#34; Approach</h2>
                </div>

                <div className="space-y-4 text-tan-200">
                    <p className="text-lg">
                        The leg meta strategy involves using the <strong>lowest tier ammo</strong> and
                        exclusively targeting unprotected body parts (arms and legs).
                    </p>

                    <div className="bg-green-900/20 border border-green-700/50 rounded-sm p-4">
                        <p className="mb-3 text-green-200"><strong>Advantages of Leg Meta:</strong></p>
                        <ul className="space-y-1 list-disc list-inside ml-4 text-green-200">
                            <li><strong>Cheap:</strong> Lowest tier ammo costs significantly less</li>
                            <li><strong>Universal:</strong> Works against any armor level</li>
                            <li><strong>Consistent:</strong> Same number of leg shots regardless of enemy gear</li>
                            <li><strong>Counter-intuitive effectiveness:</strong> Often surprising to enemies</li>
                        </ul>
                    </div>

                    <div className="bg-red-900/20 border border-red-700/50 rounded-sm p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-red-400 mt-1" size={20} />
                            <div className="text-red-200">
                                <p><strong>Leg Meta Weakness:</strong></p>
                                <p>
                                    Skilled enemies with good aim will always outplay you with a single headshot.
                                    You&#39;re trading firepower for cost-effectiveness and consistency.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Strategy Summary */}
            <section className="bg-military-800 border border-military-600 rounded-sm p-6">
                <h2 className="text-2xl font-bold text-tan-100 mb-4">Combat Strategy Summary</h2>

                <div className="space-y-4 text-tan-200">
                    <p className="text-lg">
                        <strong>Remember the better armor pieces</strong> in the game and mentally evaluate
                        whether your current ammo can penetrate them. When facing well-armored enemies:
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-olive-900/30 border border-olive-700 p-4 rounded">
                            <h3 className="font-bold text-olive-400 mb-2">High-Tier Ammo Strategy</h3>
                            <ul className="space-y-1 list-disc list-inside text-sm">
                                <li>Aim for head when confident</li>
                                <li>Target chest if head shots are difficult</li>
                                <li>Switch to limbs only if armor is too strong</li>
                                <li>Consider armor damage over time</li>
                            </ul>
                        </div>

                        <div className="bg-blue-900/30 border border-blue-700 p-4 rounded">
                            <h3 className="font-bold text-blue-400 mb-2">Leg Meta Strategy</h3>
                            <ul className="space-y-1 list-disc list-inside text-sm">
                                <li>Use cheapest ammo available</li>
                                <li>Focus exclusively on arms and legs</li>
                                <li>Maintain speed te be a harder target</li>
                                <li>Strike when least expected</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}