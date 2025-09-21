import React from 'react';
import {ExternalLink, Info, Megaphone, History, BookOpen} from 'lucide-react';


const AVERAGE_DURATION_DAYS = 136;

const WipeDurationTracker = ({ startDate, endDate }: { startDate: string, endDate?: string}) => {
    const start = new Date(startDate);
    const now = endDate ? new Date(endDate) : new Date();
    const diff = now.getTime() - start.getTime();
    const daysPassed = Math.floor(diff / (1000 * 60 * 60 * 24));
    const progressPercentage = Math.min((daysPassed / AVERAGE_DURATION_DAYS) * 100, 100);

    return (
        <>
            <p className="text-xs text-tan-400">Duration</p>
            <p className="font-semibold text-tan-200">{daysPassed} days {endDate ? null :"(Ongoing)"}</p>
            <div className="w-full bg-military-700 rounded-full h-2.5 mt-2" title={`${Math.round(progressPercentage)}% of average wipe length`}>
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
        </>
    );
};

export default function WhenIsTheWipeGuide() {
    return (
        <div className="space-y-8">
            {/* Official Information Section uncomment when 3rd wipe progresses*/}
            {/* <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-4">
                    <Megaphone className="text-blue-400 mt-1" size={24} />
                    <h2 className="text-2xl font-bold text-tan-100">Official Wipe Announcements</h2>
                </div>

                <div className="space-y-4 text-tan-200">
                    <p className="text-lg">
                        The developers, <strong>Caveman Studios</strong>, are the only reliable source for wipe information.
                        They always announce the official wipe date several weeks in advance to give players time to prepare.
                    </p>

                    <div className="bg-blue-900/20 border-l-4 border-blue-600 p-4">
                        <div className="flex items-start gap-3">
                            <Info className="text-blue-400 mt-1" size={20} />
                            <div>
                                <p className="text-blue-200">
                                    <strong>Rule of thumb:</strong> If you haven&#39;t seen an announcement on the official ExfilZone Discord or  <a
                                    href="https://x.com/ContractorsBR" target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    Twitter
                                </a>,
                                    any wipe date you hear is just a rumor.
                                </p>
                                <a
                                    href="https://discord.gg/KyPzc7GRfe"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    Join the Official Discord <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    </div>

                    <p>
                        Announcements are typically made through their official channels to ensure everyone gets the same information at the same time.
                        Avoid trusting second-hand information or unverified sources.
                    </p>
                </div>
            </section>*/}

            {/* Upcoming Wipe Announcement Section */}
            <section className="military-box p-6 rounded-sm border-2 border-green-600 bg-green-900/10">
                <div className="flex items-start gap-3 mb-4">
                    <Megaphone className="text-green-400 mt-1 animate-pulse" size={24} />
                    <h2 className="text-2xl font-bold text-green-400">2nd Wipe Announced!</h2>
                </div>

                <div className="space-y-4 text-tan-200">
                    <div className="bg-green-900/20 border-l-4 border-green-500 p-4">
                        <p className="text-xl font-bold text-green-300 mb-2">
                            Wipe Date: September 24th, 2025
                        </p>
                        <p className="text-lg text-tan-200">
                            Pre-wipe event starts: Weekend of August 23rd, 2025
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-olive-400">Major Features Coming:</h3>
                        <ul className="space-y-2 ml-4">
                            <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">•</span>
                                <div>
                                    <strong className="text-tan-100">Gunsmith System:</strong>
                                    <span className="text-tan-300"> Revolutionary VR weapon customization with hundreds of unique variants through extensive part combinations</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">•</span>
                                <div>
                                    <strong className="text-tan-100">New Map - Smuggling Tunnel:</strong>
                                    <span className="text-tan-300"> Tight corridors and high-stakes loot opportunities</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">•</span>
                                <div>
                                    <strong className="text-tan-100">50% More Missions:</strong>
                                    <span className="text-tan-300"> New objectives including photo tasks and loadout-specific challenges</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">•</span>
                                <div>
                                    <strong className="text-tan-100">Unreal Engine 5 Upgrade:</strong>
                                    <span className="text-tan-300"> Enhanced graphics and performance</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="flex gap-4 mt-4">
                        <a
                        href="https://discord.com/invite/contractorsshowdown"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-sm text-white transition-colors"
                        >
                        Join Discord for Updates <ExternalLink size={16} />
                    </a>
<a
                    href="https://x.com/contractorsbr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-military-700 hover:bg-military-600 rounded-sm text-tan-200 transition-colors border border-military-500"
                    >
                    Follow on X <ExternalLink size={16} />
                </a>
        </div>
</div>
</section>

            {/* Wipe History Section */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-4">
                    <History className="text-olive-400 mt-1" size={24} />
                    <h2 className="text-2xl font-bold text-tan-100">Wipe History</h2>
                </div>

                <div className="space-y-6 text-tan-200">
                    {/* Season 2 */}
                    <div className="bg-military-800 border border-military-600 rounded-sm p-4">
                        <h3 className="font-semibold text-olive-400 mb-3 text-lg">Season 2: The Resort</h3>
                        <div className="grid md:grid-cols-3 gap-4 text-sm mb-3">
                            <div className="bg-military-900 p-3 rounded-sm">
                                <p className="text-xs text-tan-400">Start Date</p>
                                <p className="font-semibold text-tan-200">April 24th, 2025</p>
                            </div>
                            <div className="bg-military-900 p-3 rounded-sm">
                                <p className="text-xs text-tan-400">End Date</p>
                                <p className="font-semibold text-tan-200">Expected September 24th, 2025</p>
                            </div>
                            <div className="bg-military-900 p-3 rounded-sm">
                                <WipeDurationTracker startDate="2025-04-24" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-tan-300 font-medium">Major Additions:</p>
                            <ul className="list-disc list-inside ml-4 text-sm text-tan-400 mt-2">
                                <li>Revised hideout</li>
                                <li>Expanded medical system (3 levels of bandages, pills, and suture kits)</li>
                                <li>New G3-based weapons</li>
                                <li>Secure containers</li>
                                <li>The Resort map</li>
                            </ul>
                        </div>
                    </div>
                    {/* Season 1 */}
                    <div className="bg-military-800 border border-military-600 rounded-sm p-4">
                        <h3 className="font-semibold text-olive-400 mb-3 text-lg">Season 1: Early Access</h3>
                        <div className="grid md:grid-cols-3 gap-4 text-sm mb-3">
                            <div className="bg-military-900 p-3 rounded-sm">
                                <p className="text-xs text-tan-400">Start Date</p>
                                <p className="font-semibold text-tan-200">December 9th, 2024</p>
                            </div>
                            <div className="bg-military-900 p-3 rounded-sm">
                                <p className="text-xs text-tan-400">End Date</p>
                                <p className="font-semibold text-tan-200">April 24th, 2025</p>
                            </div>
                            <div className="bg-military-900 p-3 rounded-sm">
                                <div className="bg-military-900 p-3 rounded-sm">
                                    <WipeDurationTracker startDate="2024-12-09" endDate={"2025-04-24"} />
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-tan-300 font-medium">Major Additions:</p>
                            <ul className="list-disc list-inside ml-4 text-sm text-tan-400 mt-2">
                                <li>Initial early access release</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* What is a Wipe Section */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-4">
                    <BookOpen className="text-green-400 mt-1" size={24} />
                    <h2 className="text-2xl font-bold text-tan-100">What is a Wipe?</h2>
                </div>

                <div className="space-y-4 text-tan-200">
                    <p className="text-lg">
                        In extraction shooters like ExfilZone, a &#34;wipe&#34; is a complete reset of all player progression. This includes your character level, skills, inventory, and faction reputation.
                    </p>

                    <div className="bg-green-900/20 border-l-4 border-green-600 p-4">
                        <p className="mb-2"><strong>Why are wipes necessary?</strong></p>
                        <ul className="space-y-1 list-disc list-inside ml-4">
                            <li><strong>Fair Play:</strong> Wipes create a level playing field, allowing new players to compete with veterans.</li>
                            <li><strong>Economic Reset:</strong> They reset the in-game economy, preventing inflation and making all items valuable again.</li>
                            <li><strong>Fresh Experience:</strong> Wipes provide a fresh start, encouraging players to try new strategies and content.</li>
                        </ul>
                    </div>

                    <div className="bg-blue-900/20 border border-blue-700/50 rounded-sm p-4">
                        <div className="flex items-start gap-3">
                            <Info className="text-blue-400 mt-1" size={20} />
                            <div>
                                <p className="text-blue-200">
                                    <strong>DLC and Bonuses:</strong> Any bonuses from DLCs or special editions of the game are reapplied to your account after each wipe. You will not lose your purchased benefits.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}