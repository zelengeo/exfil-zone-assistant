import React from 'react';
import { CheckCircle, Clock, Sparkles, Target, Package, Map, Home, ScrollText, HelpCircle, Users, Shuffle, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function AppRoadmapGuide() {
    return (
        <div className="space-y-8">
            {/* Introduction */}
            <section>
                <p className="text-lg text-tan-200 leading-relaxed">
                    ExfilZone Assistant is constantly evolving. This guide shows you what&#39;s currently available,
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
                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                                Multi-weapon comparison
                            </span>
                            <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                                Body part targeting
                            </span>
                            <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                                Range calculations
                            </span>
                            <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                                Armor penetration
                            </span>
                        </div>
                        <Link href="/combat-sim" className="inline-block mt-3 text-olive-400 hover:text-olive-300 text-sm">
                            Try Combat Simulator →
                        </Link>
                    </div>

                    {/* Item Database */}
                    <div className="bg-military-800 border border-military-600 rounded-sm p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Package className="text-olive-400" size={24} />
                            <h3 className="text-lg font-semibold text-tan-100">Comprehensive Item Database</h3>
                        </div>
                        <p className="text-tan-300 mb-4">
                            Extensive database covering weapons, armor, consumables, and tactical equipment.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs px-2 py-1 bg-green-700/30 text-green-400 rounded-sm">
                                ✓ Weapons & Ammo
                            </span>
                            <span className="text-xs px-2 py-1 bg-green-700/30 text-green-400 rounded-sm">
                                ✓ Armor & Gear
                            </span>
                            <span className="text-xs px-2 py-1 bg-green-700/30 text-green-400 rounded-sm">
                                ✓ Provisions
                            </span>
                            <span className="text-xs px-2 py-1 bg-green-700/30 text-green-400 rounded-sm">
                                ✓ Medical Items
                            </span>
                            <span className="text-xs px-2 py-1 bg-green-700/30 text-green-400 rounded-sm">
                                ✓ Task Items
                            </span>
                            <span className="text-xs px-2 py-1 bg-green-700/30 text-green-400 rounded-sm">
                                ✓ Attachments
                            </span>
                            <span className="text-xs px-2 py-1 bg-green-700/30 text-green-400 rounded-sm">
                                ✓ Throwables
                            </span>
                            <span className="text-xs px-2 py-1 bg-green-700/30 text-green-400 rounded-sm">
                                ✓ Misc Items
                            </span>
                        </div>
                        <div className="mt-3 space-y-1">
                            <p className="text-xs text-yellow-400">Missing: Keys, Safe Containers, Backpacks, Holsters</p>
                        </div>
                        <Link href="/items" className="inline-block mt-3 text-olive-400 hover:text-olive-300 text-sm">
                            Browse Items →
                        </Link>
                    </div>

                    {/* Hideout Upgrades */}
                    <div className="bg-military-800 border border-military-600 rounded-sm p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Home className="text-olive-400" size={24} />
                            <h3 className="text-lg font-semibold text-tan-100">Hideout Upgrades Calculator</h3>
                        </div>
                        <p className="text-tan-300 mb-4">
                            Plan your hideout upgrades with detailed cost calculations and requirement tracking.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                                Upgrade planning
                            </span>
                            <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                                Cost calculator
                            </span>
                            <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                                Progress tracking
                            </span>
                            <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                                Dependency chains
                            </span>
                        </div>
                        <Link href="/hideout-upgrades" className="inline-block mt-3 text-olive-400 hover:text-olive-300 text-sm">
                            Plan Upgrades →
                        </Link>
                    </div>

                    {/* Tasks Database */}
                    <div className="bg-military-800 border border-military-600 rounded-sm p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <ScrollText className="text-olive-400" size={24} />
                            <h3 className="text-lg font-semibold text-tan-100">Tasks & Quests Database</h3>
                        </div>
                        <p className="text-tan-300 mb-4">
                            Complete task tracking with objectives, rewards, and community video guides.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                                Progress tracking
                            </span>
                            <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                                Merchant organization
                            </span>
                            <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                                Video guides
                            </span>
                            <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                                Reward calculator
                            </span>
                        </div>
                        <Link href="/tasks" className="inline-block mt-3 text-olive-400 hover:text-olive-300 text-sm">
                            View Tasks →
                        </Link>
                    </div>
                </div>
            </section>


            {/* In Development */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-6">
                    <div className="p-2 bg-yellow-900/30 rounded-sm border border-yellow-800">
                        <Clock size={20} className="text-yellow-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-tan-100">In Development</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {/* Missing Item Categories */}
                    <div className="bg-military-800 border-l-4 border-yellow-600 p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="font-semibold text-tan-100 mb-2">Remaining Item Categories</h3>
                                <p className="text-tan-300 text-sm mb-3">
                                    Completing the item database with remaining categories and their full functionality.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                                        Keys database
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                                        Safe containers
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                                        Backpacks
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                                        Holsters
                                    </span>
                                </div>
                            </div>
                            <div className="ml-4 text-yellow-400">
                                <Clock size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Weapon Recoil System */}
                    <div className="bg-military-800 border-l-4 border-yellow-600 p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="font-semibold text-tan-100 mb-2">Weapon Recoil Analysis</h3>
                                <p className="text-tan-300 text-sm mb-3">
                                    Visual recoil pattern analysis and combat simulator integration for complete weapon evaluation.
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
                                <Clock size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Community Features */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-6">
                    <div className="p-2 bg-blue-900/30 rounded-sm border border-blue-800">
                        <Users size={20} className="text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-tan-100">Features Suggested by Community</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Loadout Builder */}
                    <div className="bg-military-800 border border-military-600 rounded-sm p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Shuffle className="text-blue-400" size={24} />
                            <h3 className="text-lg font-semibold text-tan-100">Loadout Builder</h3>
                        </div>
                        <p className="text-tan-300 mb-4">
                            Create custom loadouts or randomize them for varied gameplay experiences.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                                Custom builds
                            </span>
                            <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                                Random generation
                            </span>
                            <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                                Role-based presets
                            </span>
                            <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                                Share builds
                            </span>
                        </div>
                    </div>

                    {/* Community Challenges */}
                    <div className="bg-military-800 border border-military-600 rounded-sm p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Trophy className="text-blue-400" size={24} />
                            <h3 className="text-lg font-semibold text-tan-100">Community Challenges</h3>
                        </div>
                        <p className="text-tan-300 mb-4">
                            Player-driven challenges including bounties on specific players and skill-based contests.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                                Player bounties
                            </span>
                            <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                                Skill challenges
                            </span>
                            <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                                Leaderboards
                            </span>
                            <span className="text-xs px-2 py-1 bg-military-700 text-tan-400 rounded-sm">
                                Reward tracking
                            </span>
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
                            icon: Map,
                            title: "Interactive Maps",
                            description: "Detailed maps with loot spawns, extracts, and tactical positioning"
                        },
                        {
                            icon: Sparkles,
                            title: "Advanced Analytics",
                            description: "Player statistics tracking, performance analysis, and improvement suggestions"
                        },
                        {
                            icon: Package,
                            title: "Inventory Manager",
                            description: "Virtual stash management and optimization tools"
                        },
                        {
                            icon: Users,
                            title: "Team Coordination",
                            description: "Squad planning tools and communication aids for team play"
                        }
                    ].map((feature, index) => (
                        <div key={index} className="bg-military-800 border border-military-600 rounded-sm p-4">
                            <div className="flex items-start gap-3">
                                <feature.icon className="text-blue-400 mt-1" size={20} />
                                <div>
                                    <h3 className="font-medium text-tan-100 mb-1">{feature.title}</h3>
                                    <p className="text-tan-300 text-sm">{feature.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Changelog */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-6">
                    <div className="p-2 bg-green-900/30 rounded-sm border border-green-800">
                        <Sparkles size={20} className="text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-tan-100">Recent Updates</h2>
                </div>

                <div className="space-y-4">
                    <div className="border-l-4 border-green-600 pl-4">
                        <h3 className="font-semibold text-green-400 mb-2">Major Feature Additions</h3>
                        <ul className="space-y-1 text-tan-300 text-sm">
                            <li>• Added comprehensive item database with Provisions, Task Items, Medical supplies</li>
                            <li>• Implemented Hideout Upgrades calculator with full cost tracking</li>
                            <li>• Created Tasks database with progress tracking and video guides</li>
                            <li>• Added Attachments and Throwables to item database</li>
                            <li>• Introduced Loadout Builder with randomization features</li>
                            <li>• Launched Community Challenges system with player bounties</li>
                        </ul>
                    </div>

                    <div className="border-l-4 border-blue-600 pl-4">
                        <h3 className="font-semibold text-blue-400 mb-2">Combat Simulator Stable</h3>
                        <p className="text-tan-300 text-sm">
                            Combat Simulator remains our most mature feature with ongoing refinements to damage calculations
                            and armor penetration mechanics. No major changes planned - focus on stability and accuracy.
                        </p>
                    </div>
                </div>
            </section>

            {/* Community Contribution */}
            <section className="bg-purple-900/20 border border-purple-700/50 rounded-sm p-6">
                <h2 className="text-xl font-bold text-purple-300 mb-3">Join the Development</h2>
                <p className="text-purple-200 mb-4">
                    Our GitHub repository is public, and we welcome contributions from the community. Whether it&#39;s
                    fixing bugs, adding features, or improving documentation, your help makes this project better for everyone.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-purple-900/30 p-4 rounded-sm text-center">
                        <p className="text-purple-400 font-semibold mb-1">⭐ Star the Repo</p>
                        <p className="text-sm text-purple-300">Show your support and help others find the project</p>
                    </div>
                    <div className="bg-purple-900/30 p-4 rounded-sm text-center">
                        <p className="text-purple-400 font-semibold mb-1">🐛 Report Issues</p>
                        <p className="text-sm text-purple-300">Found a bug? Let us know on GitHub</p>
                    </div>
                    <div className="bg-purple-900/30 p-4 rounded-sm text-center">
                        <p className="text-purple-400 font-semibold mb-1">🔧 Submit PRs</p>
                        <p className="text-sm text-purple-300">Contribute code, fixes, or new features</p>
                    </div>
                </div>
                <a
                    href={"https://github.com/zelengeo/exfil-zone-assistant"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-800 hover:bg-purple-700
                   text-purple-100 rounded-sm transition-colors font-medium"
                >
                    View on GitHub
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                </a>
            </section>

            {/* Call to Action */}
            <section className="bg-green-900/20 border border-green-700/50 rounded-sm p-6">
                <h2 className="text-xl font-bold text-green-300 mb-3">Stay Updated & Support Development</h2>
                <p className="text-green-200 mb-6">
                    Don&#39;t miss out on new features! Follow our development progress, join the community, and help fuel continued development.
                </p>

                {/* Support Section */}
                <div className="bg-green-800/30 border border-green-600/50 rounded-sm p-4 mb-6">
                    <h3 className="text-lg font-semibold text-green-300 mb-3">💖 Support Development on Ko-fi</h3>
                    <p className="text-green-200 text-sm mb-4">
                        Help keep ExfilZone Assistant free and accelerate new feature development. Supporters get exclusive perks!
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-green-900/40 p-3 rounded-sm">
                            <h4 className="font-medium text-green-300 mb-2">✨ Supporter Benefits</h4>
                            <ul className="text-green-200 text-xs space-y-1">
                                <li>• Priority feature requests</li>
                                <li>• Exclusive Discord supporter role</li>
                                <li>• Behind-the-scenes development updates</li>
                                <li>• Special mention in the community section</li>
                            </ul>
                        </div>
                        <div className="bg-green-900/40 p-3 rounded-sm">
                            <h4 className="font-medium text-green-300 mb-2">🚀 What Your Support Enables</h4>
                            <ul className="text-green-200 text-xs space-y-1">
                                <li>• Faster feature development</li>
                                <li>• Server costs & hosting</li>
                                <li>• Data acquisition & processing</li>
                                <li>• Community tools & integrations</li>
                            </ul>
                        </div>
                    </div>

                    <a
                        href="https://ko-fi.com/pogapwnz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600
                       hover:from-orange-500 hover:to-red-500 text-white rounded-sm transition-all transform hover:scale-105 font-medium"
                    >
                        <span>☕</span>
                        Support on Ko-fi
                        <span className="text-xs opacity-75">→</span>
                    </a>
                </div>
            </section>

            {/* Call to Action */}
            <section className="bg-green-900/20 border border-green-700/50 rounded-sm p-6">
                <h2 className="text-xl font-bold text-green-300 mb-3">Stay Updated</h2>
                <p className="text-green-200 mb-4">
                    Don&#39;t miss out on new features! Follow our development progress and join the community.
                </p>
                <div className="flex flex-wrap gap-3">
                    <a
                        href="https://discord.gg/2FCDZK6C25"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-800 hover:bg-green-700
                       text-green-100 rounded-sm transition-colors"
                    >
                        Join Discord
                    </a>
                    <a
                        href="https://x.com/pogapwnz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-800 hover:bg-green-700
                       text-green-100 rounded-sm transition-colors"
                    >
                        Follow on X
                    </a>
                </div>
            </section>
        </div>
    );
}