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
            {/* Official Information Section */}
            <section className="military-box p-6 rounded-sm">
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
                                <p className="font-semibold text-tan-200">TBD</p>
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