import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Shield, AlertTriangle, Droplets, Apple, Target, Activity, Volume2, Zap } from 'lucide-react';

export default function SurvivalDamageGuide() {
    return (
        <div className="space-y-8">
            {/* Introduction */}
            <section>
                <p className="text-lg text-tan-200 leading-relaxed">
                    Surviving in Exfil Zone isn&#39;t just about good aim - it&#39;s about understanding how your body takes damage,
                    managing your health status, and knowing when to fight or flee. This guide covers everything you need to
                    know about staying alive in the zone.
                </p>
            </section>

            {/* Quick Survival Tips */}
            <section className="bg-green-900/20 border border-green-700/50 rounded-sm p-6">
                <div className="flex items-start gap-3 mb-4">
                    <Zap className="text-green-400 flex-shrink-0" size={24} />
                    <h2 className="text-2xl font-bold text-green-300">Quick Survival Tips</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-green-200">
                    <div className="bg-green-900/30 p-4 rounded-sm">
                        <h3 className="font-semibold mb-2">🩹 Always Carry</h3>
                        <ul className="text-sm space-y-1">
                            <li>• 2+ bandages (heavy bleed capable)</li>
                            <li>• Painkillers (pre-use before fights)</li>
                            <li>• Suture kit for emergencies</li>
                            <li>• Food and water</li>
                        </ul>
                    </div>
                    <div className="bg-green-900/30 p-4 rounded-sm">
                        <h3 className="font-semibold mb-2">⚡ Combat Priority</h3>
                        <ul className="text-sm space-y-1">
                            <li>• Keep meds on quick-access slots</li>
                            <li>• Pop painkillers as soon as possible</li>
                            <li>• Fix bleeds immediately after fights</li>
                            <li>• Heal with off-hand while keeping gun ready</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Body Zones and HP */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-military-700 rounded-sm border border-olive-700">
                        <Heart size={20} className="text-olive-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-tan-100">Understanding Body Zones</h2>
                </div>

                <div className="space-y-4 text-tan-200">
                    <p>
                        Your body is divided into <strong>7 distinct zones</strong>, each with its own health pool.
                        Understanding these zones is crucial for both dealing and surviving damage.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Visual representation */}
                        <div className="flex justify-center items-center">
                            <div className="relative" style={{maxWidth: '250px'}}>
                                <Image
                                    src="/images/Img_BodyPartsMain.webp"
                                    alt="Body Zones"
                                    width={250}
                                    height={500}
                                />
                                {/* Optional: You could add HP overlays on the image if desired */}
                            </div>
                        </div>

                        {/* Zone details */}
                        <div className="space-y-3">
                            <h3 className="text-red-400 font-semibold flex items-center gap-2">
                                <AlertTriangle size={18} />
                                Vital Zones (Death if destroyed)
                            </h3>

                            <div className="space-y-2">
                                <div className="bg-red-900/20 border-l-4 border-red-600 p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-red-300">Head</span>
                                        <span className="text-xl font-bold text-red-400">35 HP</span>
                                    </div>
                                </div>

                                <div className="bg-red-900/20 border-l-4 border-red-600 p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-red-300">Chest</span>
                                        <span className="text-xl font-bold text-red-400">85 HP</span>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-yellow-400 font-semibold mt-4">
                                Non-Vital Zones (Debuffs if destroyed)
                            </h3>

                            <div className="space-y-2">
                                <div className="bg-military-800 border-l-4 border-yellow-600 p-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold">Stomach</span>
                                        <span className="text-xl font-bold text-olive-400">70 HP</span>
                                    </div>
                                    <p className="text-xs text-yellow-400">Rapid hydration/nutrition loss</p>
                                </div>

                                <div className="bg-military-800 border-l-4 border-military-600 p-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold">Arms (x2)</span>
                                        <span className="text-xl font-bold text-olive-400">60 HP</span>
                                    </div>
                                    <p className="text-xs text-tan-400">Severe aim wobble</p>
                                </div>

                                <div className="bg-military-800 border-l-4 border-military-600 p-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold">Legs (x2)</span>
                                        <span className="text-xl font-bold text-olive-400">65 HP</span>
                                    </div>
                                    <p className="text-xs text-tan-400">No sprint, reduced speed</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Damage Distribution warning stays the same */}
                    <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-sm p-4 mt-6">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" size={18} />
                            <div>
                                <h4 className="font-semibold text-yellow-300 mb-1">Blacked-Out Limb Damage</h4>
                                <p className="text-sm text-yellow-200">
                                    When a limb reaches 0 HP, further damage to it is <strong>distributed proportionally</strong> to
                                    all remaining body parts based on their max HP. This means you can kill someone by repeatedly
                                    shooting their legs!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bleeding Mechanics */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-red-900/30 rounded-sm border border-red-700">
                        <Droplets size={20} className="text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-tan-100">Bleeding System</h2>
                </div>

                <div className="space-y-4 text-tan-200">
                    <p>
                        Getting shot can cause bleeding - a dangerous status effect that continuously drains your health
                        and reveals your position through audio cues. Bleeding chance is determined by the ammunition type.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Light Bleeding */}
                        <div className="bg-military-800 border border-military-600 rounded-sm p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <Image src="/images/icon_bleed1.webp" alt="Light Bleeding" width={24} height={24} />
                                <h3 className="font-semibold text-tan-100">Light Bleeding</h3>
                            </div>
                            <ul className="space-y-2 text-sm">
                                <li className="text-red-400">• -0.5 HP per second</li>
                                <li>• Fixed with any bandage</li>
                                <li>• Common occurrence from most hits</li>
                                <li>• Causes heavy breathing sounds</li>
                            </ul>
                        </div>

                        {/* Deep Wound */}
                        <div className="bg-military-800 border border-red-600/50 rounded-sm p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <Image src="/images/icon_bleed2.webp" alt="Deep Wound" width={24} height={24} />
                                <h3 className="font-semibold text-red-400">Deep Wound</h3>
                            </div>
                            <ul className="space-y-2 text-sm">
                                <li className="text-red-400 font-semibold">• -2 HP per second</li>
                                <li>• Requires uncommon+ bandages</li>
                                <li>• Less common than light bleeding</li>
                                <li>• Often stacks on existing bleeds</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-red-900/20 border border-red-700/50 rounded-sm p-4">
                        <div className="flex items-start gap-2">
                            <Volume2 className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
                            <p className="text-sm text-red-200">
                                <strong>Audio Warning:</strong> Both bleeding types and blacked-out limbs cause the same heavy breathing sounds that
                                enemies can hear. This makes you easier to track and locate!
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Medical Items */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-military-700 rounded-sm border border-olive-700">
                        <Shield size={20} className="text-olive-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-tan-100">Medical Supplies & Usage</h2>
                </div>

                <div className="space-y-4 text-tan-200">
                    {/* Painkillers */}
                    <div className="bg-military-800 border border-military-600 rounded-sm p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <Link href="/items?category=medicine&subcategory=Painkillers">
                                <Image src="/images/items/medical/Icon_WarfarePainkillerLv1_cropped.webp" alt="Painkillers" width={48} height={48} />
                            </Link>
                            <div>
                                <h3 className="font-semibold text-olive-400">Painkillers</h3>
                                <p className="text-sm text-tan-400">Temporary symptom relief</p>
                            </div>
                        </div>
                        <ul className="space-y-1 text-sm">
                            <li className="text-green-400">✓ Removes heavy breathing sounds</li>
                            <li className="text-green-400">✓ Negates blacked limb debuffs</li>
                            <li className="text-green-400">✓ Can be used preemptively</li>
                            <li className="text-green-400">✓ Long duration effect</li>
                        </ul>
                        <div className="mt-3 p-2 bg-green-900/20 rounded-sm">
                            <p className="text-xs text-green-300">
                                <strong>Pro Tip:</strong> Pop painkillers before engaging enemies to avoid getting debuffs mid fight!
                            </p>
                        </div>
                    </div>

                    {/* Suture Kit */}
                    <div className="bg-military-800 border border-military-600 rounded-sm p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <Link href="/items?category=medicine&subcategory=Suturing%20Tools">
                                <Image src="/images/items/medical/icon_suturingdevice.webp" alt="Suture Instrument" width={48} height={48} />
                            </Link>
                            <div>
                                <h3 className="font-semibold text-olive-400">Suture Instrument</h3>
                                <p className="text-sm text-tan-400">Blacked out limb fix</p>
                            </div>
                        </div>
                        <ul className="space-y-1 text-sm">
                            <li>• Repairs blacked-out limbs to 1 HP</li>
                            <li>• Reduces maximum HP of the limb</li>
                            <li>• Essential</li>
                            <li className="text-yellow-400">⚠ Takes time to use - find cover!</li>
                        </ul>
                    </div>

                    {/* Bandages */}
                    <div className="bg-military-800 border border-military-600 rounded-sm p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <Link href={"/items?category=medicine&subcategory=Bandages"}>
                                <Image src="/images/items/medical/icon_Gauze_cropped.webp" alt="Bandage" width={48} height={48} />
                            </Link>
                            <div>
                                <h3 className="font-semibold text-olive-400">Bandages</h3>
                                <p className="text-sm text-tan-400">Crucial for survival</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <p><strong>Common:</strong> Stops light bleeding only</p>
                            <p><strong>Uncommon+:</strong> Stops both light and heavy bleeding</p>
                            <p className="text-green-400">✓ Can be applied to any body part</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Hydration and Nutrition */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-blue-900/30 rounded-sm border border-blue-700">
                        <Apple size={20} className="text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-tan-100">Hydration & Nutrition</h2>
                </div>

                <div className="space-y-4 text-tan-200">
                    <p>
                        Your survival isn&#39;t just about bullets - maintaining your body&#39;s basic needs is crucial for
                        extended operations in the zone.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Hydration */}
                        <div className="bg-blue-900/20 border border-blue-700/50 p-4 rounded-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <Droplets className="text-blue-400" size={20} />
                                <h3 className="font-semibold text-blue-300">Hydration</h3>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p>Depletes faster when:</p>
                                <ul className="ml-4 space-y-1">
                                    <li>• Stomach is blacked out</li>
                                    <li>• Natural depletion over time</li>
                                    <li>• Painkillers/stimulators used</li>
                                </ul>
                                <div className="mt-3 p-2 bg-red-900/20 rounded-sm">
                                    <p className="text-red-300">
                                        <strong>Low Hydration:</strong> Stamina regeneration penalty
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Nutrition */}
                        <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <Apple className="text-yellow-400" size={20} />
                                <h3 className="font-semibold text-yellow-300">Nutrition</h3>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p>Depletes when:</p>
                                <ul className="ml-4 space-y-1">
                                    <li>• Stomach is blacked out</li>
                                    <li>• Natural depletion over time</li>
                                    <li>• Stimulators used</li>
                                </ul>
                                <div className="mt-3 p-2 bg-red-900/20 rounded-sm">
                                    <p className="text-red-300">
                                        <strong>Low Nutrition:</strong> Carrying capacity penalty
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-900/20 border border-red-700/50 rounded-sm p-4">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
                            <p className="text-red-200">
                                <strong>Critical Warning:</strong> When either hydration or nutrition reaches 0, you begin
                                taking damage to all body parts. Death from dehydration/starvation is slow but inevitable!
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tactical Tips */}
            <section className="bg-green-900/20 border border-green-700/50 rounded-sm p-6">
                <h2 className="text-xl font-bold text-green-300 mb-4">Combat Tactics</h2>

                <div className="space-y-3 text-green-200">
                    <div className="flex items-start gap-2">
                        <Target className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                        <div>
                            <p className="font-medium mb-1">Leg Meta Strategy</p>
                            <p className="text-sm">
                                Against heavily armored opponents, targeting legs can be more effective than trying to
                                penetrate armor. 4-5 shots to one leg can kill via damage distribution.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <Activity className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                        <div>
                            <p className="font-medium mb-1">Listen for Audio Cues</p>
                            <p className="text-sm">
                                Heavy breathing from injured players is audible from significant distances. Use this to
                                track wounded enemies or know when to stay quiet.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <Shield className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                        <div>
                            <p className="font-medium mb-1">Medical Priority</p>
                            <p className="text-sm">
                                Order of operations: Pop painkillers → Stop heavy bleeds → Stop light bleeds → Heal/Suture → Eat/Drink. Always find cover first!
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Conclusion */}
            <section className="bg-military-800 border border-olive-700 rounded-sm p-6">
                <h2 className="text-xl font-bold text-tan-100 mb-3">Master Your Survival</h2>
                <p className="text-tan-200 mb-4">
                    Understanding these mechanics transforms you from prey to predator. Every decision - from where
                    you aim to when you heal - can mean the difference between extraction and elimination.
                </p>
                <Link
                    href="/combat-sim"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-olive-600 hover:bg-olive-500 
                             text-military-900 rounded-sm transition-colors font-medium"
                >
                    Test damage calculations in Combat Sim
                    <Target size={16} />
                </Link>
            </section>
        </div>
    );
}