import React from 'react';
import { CheckCircle, Circle, Clock, Sparkles, Target, Package, Map, Home, ScrollText, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function AppRoadmapGuide() {
    return (
        <div className="space-y-8">
            {/* Introduction */}
            <section>
                <p className="text-lg text-tan-200 leading-relaxed">
                    Exfil Zone Assistant is constantly evolving. This guide shows you what&#39;s currently available,
                    what&#39;s coming soon, and our long-term vision. Your feedback shapes our priorities, so let us
                    know what features would help you most!
                </p>
            </section>

            {/* Current Features */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-6">
                    <div className="p-2 bg-green-900/30 rounded-sm border border-green-800">
                        <CheckCircle size={20} className="text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-tan-100">What&#39;s Available Now</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Combat Simulator */}
                    <div className="bg-military-800 border border-military-600 rounded-sm p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Target className="text-olive-400" size={24} />
                            <h3 className="text-lg font-semibold text-tan-100">Combat Simulator</h3>
                        </div>
                        <p className="text-tan-300 mb-4">
                            Our flagship feature providing detailed damage calculations and TTK analysis.
                        </p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-tan-200">Weapon vs Armor calculations</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-tan-200">Time-to-kill analysis</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-tan-200">Penetration probability</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-tan-200">Range-based damage falloff</span>
                            </li>
                        </ul>
                        <Link
                            href="/combat-sim"
                            className="inline-flex items-center gap-1 mt-4 text-sm text-olive-400 hover:text-olive-300 transition-colors"
                        >
                            Try it now →
                        </Link>
                    </div>

                    {/* Item Database */}
                    <div className="bg-military-800 border border-military-600 rounded-sm p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Package className="text-olive-400" size={24} />
                            <h3 className="text-lg font-semibold text-tan-100">Item Database (Partial)</h3>
                        </div>
                        <p className="text-tan-300 mb-4">
                            Growing database with detailed stats for key combat items.
                        </p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-tan-200">All weapons with hidden stats</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-tan-200">Complete ammunition data</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-tan-200">Body armor & helmets</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Circle size={14} className="text-tan-500 mt-0.5 flex-shrink-0" />
                                <span className="text-tan-400">Other items coming soon</span>
                            </li>
                        </ul>
                        <Link
                            href="/items"
                            className="inline-flex items-center gap-1 mt-4 text-sm text-olive-400 hover:text-olive-300 transition-colors"
                        >
                            Browse items →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Coming Soon */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-6">
                    <div className="p-2 bg-yellow-900/30 rounded-sm border border-yellow-800">
                        <Clock size={20} className="text-yellow-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-tan-100">Coming Soon</h2>
                </div>

                <div className="space-y-4">
                    {/* Recoil System */}
                    <div className="bg-military-800 border-l-4 border-yellow-600 p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="font-semibold text-tan-100 mb-2">Weapon Recoil Analysis</h3>
                                <p className="text-tan-300 text-sm mb-3">
                                    Visual recoil pattern plots for every weapon, showing spray patterns and control techniques.
                                </p>
                                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                    Recoil plots
                  </span>
                                    <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                    Pattern analysis
                  </span>
                                    <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                    Combat sim integration
                  </span>
                                </div>
                            </div>
                            <div className="ml-4 text-yellow-400">
                                <Sparkles size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Weapon Attachments */}
                    <div className="bg-military-800 border-l-4 border-yellow-600 p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="font-semibold text-tan-100 mb-2">Weapon Attachments System</h3>
                                <p className="text-tan-300 text-sm mb-3">
                                    Complete attachment database with hidden stats, compatibility, and a weapon builder tool.
                                </p>
                                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                    Hidden stats revealed
                  </span>
                                    <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                    Mounting system
                  </span>
                                    <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                    Build optimizer
                  </span>
                                </div>
                            </div>
                            <div className="ml-4 text-yellow-400">
                                <Sparkles size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Throwables */}
                    <div className="bg-military-800 border-l-4 border-yellow-600 p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="font-semibold text-tan-100 mb-2">Throwable Analysis</h3>
                                <p className="text-tan-300 text-sm mb-3">
                                    Grenade damage ranges, flash effectiveness, smoke coverage areas, and throwing mechanics.
                                </p>
                                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                    Damage ranges
                  </span>
                                    <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                    Effect duration
                  </span>
                                    <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                    Trajectory guides
                  </span>
                                </div>
                            </div>
                            <div className="ml-4 text-yellow-400">
                                <Sparkles size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Complete Item Database */}
                    <div className="bg-military-800 border-l-4 border-yellow-600 p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="font-semibold text-tan-100 mb-2">Complete Item Database</h3>
                                <p className="text-tan-300 text-sm mb-3">
                                    Every usable item with hidden stats revealed. <span className="italic">Who knows what secrets we&#39;ll uncover? 😉</span>
                                </p>
                                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                    Medical items
                  </span>
                                    <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                    Food & drinks
                  </span>
                                    <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                    All consumables
                  </span>
                                </div>
                            </div>
                            <div className="ml-4 text-yellow-400">
                                <Sparkles size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Future Possibilities */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-6">
                    <div className="p-2 bg-blue-900/30 rounded-sm border border-blue-800">
                        <HelpCircle size={20} className="text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-tan-100">Future Possibilities</h2>
                </div>

                <p className="text-tan-300 mb-6">
                    These features are under consideration based on community interest. Your feedback determines our priorities!
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                    {[
                        {
                            icon: ScrollText,
                            title: "Quest Database",
                            description: "Complete quest walkthroughs, requirements, and optimal completion paths"
                        },
                        {
                            icon: Home,
                            title: "Hideout Calculator",
                            description: "Resource planning, upgrade paths, and ROI analysis for hideout investments"
                        },
                        {
                            icon: Map,
                            title: "Interactive Maps",
                            description: "Detailed maps with loot spawns, extracts, and tactical positioning"
                        },
                        {
                            icon: Sparkles,
                            title: "Your Ideas",
                            description: "We're always open to community suggestions for new features!"
                        }
                    ].map((item, index) => (
                        <div key={index} className="bg-military-800 border border-military-600 rounded-sm p-4 hover:border-blue-700 transition-colors">
                            <div className="flex items-start gap-3">
                                <item.icon className="text-blue-400 flex-shrink-0" size={20} />
                                <div>
                                    <h3 className="font-medium text-tan-100 mb-1">{item.title}</h3>
                                    <p className="text-sm text-tan-300">{item.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-blue-900/20 border border-blue-700/50 rounded-sm p-4 mt-6">
                    <p className="text-blue-200">
                        <span className="font-semibold">Want to influence our roadmap?</span> Join our Discord community
                        or use the feedback form to vote on features and suggest new ideas. We build what the community needs most!
                    </p>
                </div>
            </section>

            {/* Development Philosophy */}
            <section className="bg-military-800 border border-olive-700 rounded-sm p-6">
                <h2 className="text-xl font-bold text-tan-100 mb-4">Our Development Philosophy</h2>
                <div className="space-y-3 text-tan-200">
                    <p>
                        <strong className="text-olive-400">Quality over Quantity:</strong> We&#39;d rather have fewer features
                        that work perfectly than many half-finished ones.
                    </p>
                    <p>
                        <strong className="text-olive-400">Community Driven:</strong> Your feedback directly shapes what
                        we build next. The most requested features get priority.
                    </p>
                    <p>
                        <strong className="text-olive-400">Accuracy First:</strong> Every feature is thoroughly tested
                        against in-game data to ensure reliability.
                    </p>
                </div>
            </section>

            {/* Call to Action */}
            <section className="bg-green-900/20 border border-green-700/50 rounded-sm p-6">
                <h2 className="text-xl font-bold text-green-300 mb-3">Stay Updated</h2>
                <p className="text-green-200 mb-4">
                    Don&#39;t miss out on new features! Check back regularly or join our community to get notified
                    when new tools and content are released.
                </p>
                <div className="flex flex-wrap gap-4">
                    <button
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-800 hover:bg-green-700 
                     text-green-100 rounded-sm transition-colors font-medium cursor-not-allowed opacity-75"
                        disabled
                    >
                        Join Discord (Coming Soon)
                    </button>
                    <button
                        className="inline-flex items-center gap-2 px-4 py-2 bg-military-700 hover:bg-military-600 
                     text-tan-100 rounded-sm transition-colors font-medium cursor-not-allowed opacity-75"
                        disabled
                    >
                        Feedback Form (Coming Soon)
                    </button>
                </div>
            </section>
        </div>
    );
}