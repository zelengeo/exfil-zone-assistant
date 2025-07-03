import React from 'react';
import { AlertTriangle, Wifi, Activity, Shuffle, Calculator, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CombatSimUsageGuide() {
    return (
        <div className="space-y-8">
            {/* Introduction */}
            <section>
                <p className="text-lg text-tan-200 leading-relaxed">
                    Welcome to ExfilZone Assistant ! This guide will help you understand how to use our Combat Simulator effectively
                    and what to expect from it. Most importantly, we&#39;ll explain why in-game results
                    may sometimes differ from our calculations.
                </p>
            </section>

            {/* Section 1: Understanding Simulation Accuracy */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-yellow-900/30 rounded-sm border border-yellow-800">
                        <AlertTriangle size={20} className="text-yellow-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-tan-100">Understanding Our 95% Accuracy</h2>
                </div>

                <div className="space-y-4 text-tan-200">
                    <p>
                        Our simulators and calculations are designed to closely match the game&#39;s mechanics, with results that align with
                        actual gameplay in most scenarios. However, <span className="text-yellow-400 font-semibold">real matches are inherently unpredictable</span> due
                        to various factors that can&#39;t be perfectly simulated:
                    </p>

                    <div className="grid md:grid-cols-3 gap-4 mt-6">
                        {/* Network Conditions Card */}
                        <div className="bg-military-800 border border-military-600 rounded-sm p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Wifi className="text-red-400" size={20} />
                                <h3 className="font-semibold text-tan-100">Network Issues</h3>
                            </div>
                            <p className="text-sm text-tan-300">
                                High ping, packet loss, or network instability affects hit registration and damage timing.
                            </p>
                        </div>

                        {/* Server Performance Card */}
                        <div className="bg-military-800 border border-military-600 rounded-sm p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Activity className="text-orange-400" size={20} />
                                <h3 className="font-semibold text-tan-100">Server Load</h3>
                            </div>
                            <p className="text-sm text-tan-300">
                                Peak hours and events can cause server lag affecting damage calculations.
                            </p>
                        </div>

                        {/* RNG Elements Card */}
                        <div className="bg-military-800 border border-military-600 rounded-sm p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Shuffle className="text-blue-400" size={20} />
                                <h3 className="font-semibold text-tan-100">RNG Factors</h3>
                            </div>
                            <p className="text-sm text-tan-300">
                                Random damage variance, critical chances, enemy player state, and penetration probability.
                            </p>
                        </div>
                    </div>

                    {/* Accuracy Verification Card */}
                    <div className="bg-military-800 border border-military-600 rounded-sm p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Activity className="text-green-400" size={20} />
                            <h3 className="font-semibold text-tan-100">Simulation Accuracy</h3>
                        </div>
                        <p className="text-sm text-tan-300 mb-3">
                            Our testing shows ~95% accuracy when comparing simulator results to in-game damage values.
                        </p>
                        <Link
                            href="/combat-sim/debug"
                            className="text-sm text-olive-400 hover:text-olive-300 transition-colors inline-flex items-center gap-1"
                        >
                            View accuracy testing data
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="bg-blue-900/20 border border-blue-700/50 rounded-sm p-4 mt-6">
                        <p className="text-blue-200">
                            <span className="font-semibold">Pro Tip:</span> Use our calculations as a baseline for decision-making,
                            but always account for these variables in actual gameplay. Our simulator shows expected outcomes under
                            optimal conditions.
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 2: Using the Combat Simulator */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-military-700 rounded-sm border border-olive-700">
                        <Calculator size={20} className="text-olive-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-tan-100">Using the Combat Simulator</h2>
                </div>

                <div className="space-y-4 text-tan-200">
                    <p>
                        Our combat simulator helps you understand weapon effectiveness and time-to-kill (TTK) calculations:
                    </p>

                    {/* Step-by-step visual guide */}
                    <div className="space-y-3">
                        {[
                            { step: 1, title: "Select Your Weapon", desc: "Choose from our comprehensive weapon database" },
                            { step: 2, title: "Pick Your Ammunition", desc: "Different ammo types have varying penetration and damage values" },
                            { step: 3, title: "Select Target Armor", desc: "Choose the armor class and condition of your target" },
                            { step: 4, title: "Review Results", desc: "See shots to kill, TTK, and penetration chances" },
                            { step: 5, title: "Stats For Nerds", desc: "Display all simulated values shot by shot" }
                        ].map((item) => (
                            <div key={item.step} className="flex gap-4 items-start">
                                <div className="flex-shrink-0 w-8 h-8 bg-olive-800 rounded-full flex items-center justify-center">
                                    <span className="text-olive-300 font-bold text-sm">{item.step}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-tan-100">{item.title}</h3>
                                    <p className="text-sm text-tan-300">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-sm p-4 mt-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-yellow-400 mt-1 flex-shrink-0" size={18} />
                            <p className="text-yellow-200 text-sm">
                                <span className="font-semibold">Remember:</span> These calculations assume perfect accuracy and
                                ideal conditions. In-game factors like recoil, movement, and the variables mentioned above will
                                affect actual performance.
                            </p>
                        </div>
                    </div>
                </div>
            </section>


            {/* Section 3: Best Practices */}
            <section className="military-box p-6 rounded-sm">
                <h2 className="text-2xl font-bold text-tan-100 mb-4">Best Practices</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Do's */}
                    <div>
                        <h3 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                            <CheckCircle size={20} />
                            Do&#39;s
                        </h3>
                        <ul className="space-y-2">
                            {[
                                "Use data as a general guide",
                                "Test loadouts in practice mode",
                                "Consider multiple scenarios",
                                "Cross-reference with experience"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-tan-200">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Don'ts */}
                    <div>
                        <h3 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                            <XCircle size={20} />
                            Don&#39;ts
                        </h3>
                        <ul className="space-y-2">
                            {[
                                "Expect exact in-game replication",
                                "Ignore environmental factors",
                                "Forget about player skill impact",
                                "Dismiss server conditions"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-tan-200">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Conclusion */}
            <section className="bg-green-900/20 border border-green-700/50 rounded-sm p-6">
                <h2 className="text-xl font-bold text-green-300 mb-3">Ready to Dive In!</h2>
                <p className="text-green-200 mb-4">
                    You now understand how to use ExfilZone Assistant effectively. Remember that our tools provide
                    valuable insights, but actual gameplay involves many variables. Use this knowledge to make better
                    decisions and improve your game sense!
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link
                        href="/items"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-800 hover:bg-green-700 
                     text-green-100 rounded-sm transition-colors font-medium"
                    >
                        Explore Items
                        <ArrowRight size={16} />
                    </Link>
                    <Link
                        href="/combat-sim"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-military-700 hover:bg-military-600 
                     text-tan-100 rounded-sm transition-colors font-medium"
                    >
                        Try Combat Simulator
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </section>
        </div>
    );
}