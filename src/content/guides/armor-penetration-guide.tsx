import React from 'react';
import { Shield, Target, TrendingDown, Percent, AlertTriangle, Info, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function ArmorPenetrationGuide() {
    return (
        <div className="space-y-8">
            {/* Introduction */}
            <section>
                <p className="text-lg text-tan-200 leading-relaxed">
                    Understanding armor penetration is crucial for winning firefights. This guide breaks down the complex
                    mechanics of how bullets interact with armor, when to aim for protected areas versus limbs, and how
                    armor degradation affects combat outcomes.
                </p>
            </section>

            {/* TL;DR Section */}
            <section className="bg-yellow-900/20 border border-yellow-700/50 rounded-sm p-6">
                <div className="flex items-start gap-3 mb-4">
                    <Zap className="text-yellow-400 flex-shrink-0" size={24} />
                    <h2 className="text-2xl font-bold text-yellow-300">Quick Combat Decision Guide</h2>
                </div>

                <div className="space-y-4 text-yellow-200">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-yellow-900/30 p-4 rounded-sm">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Target size={18} />
                                High Penetration Ammo
                            </h3>
                            <p className="text-sm">
                                If your ammo&#39;s penetration value <strong>exceeds</strong> enemy armor class:
                            </p>
                            <ul className="mt-2 space-y-1 text-sm">
                                <li>→ Aim for <strong>chest and head</strong></li>
                                <li>→ Damage reduction is minimal</li>
                                <li>→ Quick kills possible</li>
                            </ul>
                        </div>

                        <div className="bg-yellow-900/30 p-4 rounded-sm">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Shield size={18} />
                                Low Penetration Ammo
                            </h3>
                            <p className="text-sm">
                                If your ammo&#39;s penetration value is <strong>below</strong> enemy armor class:
                            </p>
                            <ul className="mt-2 space-y-1 text-sm">
                                <li>→ Target <strong>unarmored limbs</strong></li>
                                <li>→ Avoid shots to the armor</li>
                                <li>→ More shots needed</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 mt-4">
                        <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                        <p className="text-sm">
                            <strong>Remember:</strong> Range affects penetration power! Your effective penetration decreases with distance,
                            so adjust your tactics accordingly.
                        </p>
                    </div>
                </div>
            </section>

            {/* Penetration Chance Mechanics */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-military-700 rounded-sm border border-olive-700">
                        <Percent size={20} className="text-olive-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-tan-100">Penetration Chance Mechanics</h2>
                </div>

                <div className="space-y-4 text-tan-200">
                    <p>
                        Penetration isn&#39;t binary - it&#39;s a probability calculation based on multiple factors:
                    </p>

                    {/* Penetration Chance Curve */}
                    <div className="bg-military-800 border border-military-600 rounded-sm p-5">
                        <h3 className="font-semibold text-olive-400 mb-3">Base Penetration Chance</h3>
                        <div className="space-y-3">
                            <p className="text-sm">
                                Each armor piece has a <code className="text-olive-400 bg-military-900 px-1 py-0.5 rounded">Penetration Chance Curve</code> that
                                determines penetration probability:
                            </p>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-bold text-red-400">2-8%</p>
                                    <p className="text-xs text-tan-400">Minimum chance</p>
                                    <p className="text-xs text-tan-500">(Low pen ammo)</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-yellow-400">~30%</p>
                                    <p className="text-xs text-tan-400">Equal values</p>
                                    <p className="text-xs text-tan-500">(Pen ≈ Armor)</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-400">92%</p>
                                    <p className="text-xs text-tan-400">Maximum chance</p>
                                    <p className="text-xs text-tan-500">(High pen ammo)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Durability Effect */}
                    <div className="bg-military-800 border border-military-600 rounded-sm p-5">
                        <h3 className="font-semibold text-olive-400 mb-3 flex items-center gap-2">
                            <TrendingDown size={18} />
                            Armor Durability Impact
                        </h3>
                        <div className="space-y-3 text-sm">
                            <p>
                                As armor takes damage, its effective armor class decreases based on
                                the <code className="text-olive-400 bg-military-900 px-1 py-0.5 rounded">antiPenetrationDurabilityScalarCurve</code>:
                            </p>
                            <div className="bg-military-900 p-4 rounded-sm">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span>100% Durability:</span>
                                        <span className="text-green-400 font-semibold">Full armor class</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>50% Durability:</span>
                                        <span className="text-yellow-400 font-semibold">~70% effective armor class</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>0% Durability:</span>
                                        <span className="text-red-400 font-semibold">Minimal protection</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-tan-300 italic">
                                Even the lowest penetration ammo can eventually penetrate the strongest armor once it&#39;s damaged enough!
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Weapon Firing Power Impact */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-military-700 rounded-sm border border-olive-700">
                        <Zap size={20} className="text-olive-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-tan-100">Weapon Impact To Penetration Chance</h2>
                </div>

                <div className="space-y-4 text-tan-200">
                    <p>
                        Your weapon&#39;s <strong>Firing Power</strong> stat directly affects ammunition penetration effectiveness.
                        This hidden modifier can make the difference between penetrating armor or bouncing off.
                    </p>

                    {/* Firing Power Formula */}
                    <div className="bg-military-800 border border-military-600 rounded-sm p-5">
                        <h3 className="font-semibold text-olive-400 mb-3">Penetration Power Calculation</h3>
                        <div className="space-y-3">
                            <div className="bg-military-900 p-4 rounded-sm">
                                <p className="text-sm font-medium text-tan-300 mb-3">The Formula:</p>
                                <div className="flex items-center gap-3 justify-center py-2 text-lg">
                                    <span className="text-tan-400">Ammo Penetration</span>
                                    <span className="text-tan-500">+</span>
                                    <span className="text-olive-400 font-mono">(0.5 - Firing Power)</span>
                                    <span className="text-tan-500">=</span>
                                    <span className="text-yellow-400 font-semibold">Effective Penetration</span>
                                </div>
                            </div>

                            <div className="text-sm text-tan-300">
                                <p className="mb-2">This means:</p>
                                <ul className="space-y-1 ml-4">
                                    <li>• Weapons with <strong className="text-gray-200">low</strong> firing power <span className="text-red-400">reduce</span> ammo penetration</li>
                                    <li>• Weapons with <strong className="text-purple-400">high</strong> firing power <span className="text-green-400">improve</span> ammo penetration</li>
                                    <li>• The modifier ranges from <code className="text-yellow-400 bg-military-900 px-1 py-0.5 rounded">0.05</code> (worst) to <code className="text-yellow-400 bg-military-900 px-1 py-0.5 rounded">0.75</code> (best)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Damage Calculation - Penetration */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-green-900/30 rounded-sm border border-green-700">
                        <Target size={20} className="text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-tan-100">When Penetration Occurs</h2>
                </div>

                <div className="space-y-4 text-tan-200">
                    {/* Body Damage */}
                    <div className="bg-military-800 border border-military-600 rounded-sm p-5">
                        <h3 className="font-semibold text-green-400 mb-3">Body Damage Calculation</h3>
                        <div className="space-y-3">
                            <p className="text-sm">
                                Penetrating shots have their damage reduced by the armor&#39;s <code className="text-olive-400 bg-military-900 px-1 py-0.5 rounded">penetrationDamageScalarCurve</code>:
                            </p>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-military-900 p-4 rounded-sm">
                                    <h4 className="text-sm font-medium text-tan-300 mb-2">Standard Case</h4>
                                    <p className="text-sm text-tan-400">
                                        When ammo penetration <strong>significantly exceeds</strong> armor class:
                                    </p>
                                    <p className="text-lg font-semibold text-green-400 mt-2">
                                        Damage reduction = Listed value
                                    </p>
                                    <p className="text-xs text-tan-500 mt-1">
                                        (e.g., 20% reduction as shown in-game)
                                    </p>
                                </div>

                                <div className="bg-military-900 p-4 rounded-sm">
                                    <h4 className="text-sm font-medium text-tan-300 mb-2">Edge Case</h4>
                                    <p className="text-sm text-tan-400">
                                        When ammo penetration <strong>barely exceeds</strong> armor class:
                                    </p>
                                    <p className="text-lg font-semibold text-yellow-400 mt-2">
                                        Damage reduction &gt; Listed value
                                    </p>
                                    <p className="text-xs text-tan-500 mt-1">
                                        (Can be 40%+ even if armor shows 20%)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Armor Damage */}
                    <div className="bg-military-800 border border-military-600 rounded-sm p-5">
                        <h3 className="font-semibold text-orange-400 mb-3">Armor Durability Loss</h3>
                        <p className="text-sm mb-3">
                            When penetrated, armor takes damage based on:
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <div className="bg-military-900 px-3 py-2 rounded-sm">
                                <p className="text-xs text-tan-400">Ammo&#39;s</p>
                                <p className="text-sm font-medium text-orange-400">Armor Penetration Damage</p>
                            </div>
                            <div className="text-tan-500 self-center">×</div>
                            <div className="bg-military-900 px-3 py-2 rounded-sm">
                                <p className="text-xs text-tan-400">Armor&#39;s</p>
                                <p className="text-sm font-medium text-orange-400">Fragility Value</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Damage Calculation - No Penetration */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-red-900/30 rounded-sm border border-red-700">
                        <Shield size={20} className="text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-tan-100">When Penetration Fails</h2>
                </div>

                <div className="space-y-4 text-tan-200">
                    <p>
                        Non-penetrating shots deal blunt damage through the armor:
                    </p>

                    {/* Blunt Damage */}
                    <div className="bg-military-800 border border-military-600 rounded-sm p-5">
                        <h3 className="font-semibold text-red-400 mb-3">Blunt Damage Calculation</h3>
                        <div className="space-y-3">
                            <div className="bg-military-900 p-4 rounded-sm">
                                <p className="text-sm font-medium text-tan-300 mb-2">Simple Formula:</p>
                                <div className="flex items-center gap-3 justify-center py-2">
                                    <span className="text-tan-400">Ammo Blunt Damage</span>
                                    <span className="text-tan-500">×</span>
                                    <span className="text-tan-400">Armor Blunt Reduction</span>
                                    <span className="text-tan-500">=</span>
                                    <span className="text-red-400 font-semibold">Final Damage</span>
                                </div>
                            </div>

                            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-sm p-4">
                                <div className="flex items-start gap-2">
                                    <Info className="text-yellow-400 flex-shrink-0 mt-0.5" size={16} />
                                    <div className="text-sm">
                                        <p className="font-medium text-yellow-300 mb-1">Zone-Specific Reduction</p>
                                        <p className="text-yellow-200">
                                            Some armor pieces have different blunt reduction on specific zones. For example,
                                            the <strong>SD Protector&#39;s thigh protection</strong> has lower blunt reduction than the main armor piece.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Armor Damage from Blunt */}
                    <div className="bg-military-800 border border-military-600 rounded-sm p-5">
                        <h3 className="font-semibold text-orange-400 mb-3">Armor Durability Loss (Blunt)</h3>
                        <p className="text-sm mb-3">
                            Non-penetrating shots still damage armor:
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <div className="bg-military-900 px-3 py-2 rounded-sm">
                                <p className="text-xs text-tan-400">Ammo&#39;s</p>
                                <p className="text-sm font-medium text-orange-400">Armor Blunt Damage</p>
                            </div>
                            <div className="text-tan-500 self-center">×</div>
                            <div className="bg-military-900 px-3 py-2 rounded-sm">
                                <p className="text-xs text-tan-400">Armor&#39;s</p>
                                <p className="text-sm font-medium text-orange-400">Fragility Value</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Practical Examples */}
            <section className="bg-green-900/20 border border-green-700/50 rounded-sm p-6">
                <h2 className="text-xl font-bold text-green-300 mb-4">Practical Application</h2>

                <div className="space-y-4">
                    <div className="text-green-200">
                        <p className="font-medium mb-2">Example Scenarios:</p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <ArrowRight size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                                <span>
                  <strong>M993 vs Fresh Class 6:</strong> High penetration chance (~90%), minimal damage reduction,
                  aim vital zones for quick kills.
                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <ArrowRight size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                                <span>
                  <strong>SP vs Class 4:</strong> Low penetration chance (8%), low armor damage, aim for unprotected areas.
                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <ArrowRight size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                                <span>
                  <strong>Any ammo vs 0% durability armor:</strong> Even buckshot rounds can penetrate, but there&#39;s still
                  an 8% chance to bounce!
                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="mt-4 pt-4 border-t border-green-700/50">
                        <Link
                            href="/combat-sim"
                            className="inline-flex items-center gap-2 text-green-300 hover:text-green-200 transition-colors"
                        >
                            Test these scenarios in our Combat Simulator
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Key Takeaways */}
            <section className="military-box p-6 rounded-sm">
                <h2 className="text-xl font-bold text-tan-100 mb-4">Key Takeaways</h2>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-olive-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-olive-300 font-bold text-sm">1</span>
                        </div>
                        <p className="text-tan-200">
                            Penetration chance ranges from ~2% to ~92% based on ammo vs armor matchup
                        </p>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-olive-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-olive-300 font-bold text-sm">2</span>
                        </div>
                        <p className="text-tan-200">
                            Damaged armor becomes progressively easier to penetrate
                        </p>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-olive-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-olive-300 font-bold text-sm">3</span>
                        </div>
                        <p className="text-tan-200">
                            Edge-case penetrations (barely exceeding armor class) suffer additional damage reduction
                        </p>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-olive-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-olive-300 font-bold text-sm">4</span>
                        </div>
                        <p className="text-tan-200">
                            Know your ammo&#39;s capabilities and adjust your aim accordingly
                        </p>
                    </li>
                </ul>
            </section>
        </div>
    );
}