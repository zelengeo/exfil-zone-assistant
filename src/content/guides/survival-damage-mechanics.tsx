import React from 'react';
import Link from 'next/link';
import {
    AlertTriangle,
    ArrowRight,
    Bandage,
    Bone,
    Crosshair,
    Droplets,
    HeartPulse,
    ShieldCheck,
    Utensils,
} from 'lucide-react';

import { PART_HP, TOTAL_HP } from '@/lib/protection/bodyModel';
import { cn } from '@/lib/utils';

const HP_POOLS = [
    { key: 'Head', label: 'Head', zones: 1, vital: true },
    { key: 'UpperChest', label: 'Upper chest', zones: 2, vital: true },
    { key: 'LowerChest', label: 'Lower chest', zones: 2, vital: false },
    { key: 'LeftArm', label: 'Left arm', zones: 2, vital: false },
    { key: 'RightArm', label: 'Right arm', zones: 2, vital: false },
    { key: 'LeftLeg', label: 'Left leg', zones: 2, vital: false },
    { key: 'RightLeg', label: 'Right leg', zones: 2, vital: false },
] as const;

function GuideLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="inline-flex min-h-11 items-center gap-1 text-sm text-ember hover:underline"
        >
            {children}
            <ArrowRight size={14} aria-hidden="true" />
        </Link>
    );
}

function ItemLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} className="font-semibold text-ink-100 hover:text-ember hover:underline">
            {children}
        </Link>
    );
}

export default function SurvivalDamageGuide() {
    return (
        <div className="space-y-10">
            <section className="space-y-3">
                <p className="text-lg leading-relaxed text-ink-200">
                    A bullet lands on one of 13 physical hit zones, but damage comes out of seven
                    larger health pools. Keeping those two layers separate makes injuries, fatal
                    hits and medical choices much easier to read.
                </p>
                <p className="text-sm text-ink-500">
                    This guide covers the survival decisions. The{' '}
                    <Link href="/guides/damage-model" className="text-ember hover:underline">
                        Damage Model
                    </Link>{' '}
                    owns the shot arithmetic, and the{' '}
                    <Link
                        href="/guides/armor-penetration-guide"
                        className="text-ember hover:underline"
                    >
                        Armour Penetration guide
                    </Link>{' '}
                    covers protection and wear.
                </p>
            </section>

            <section className="space-y-5">
                <div className="flex items-start gap-3">
                    <Crosshair className="mt-0.5 shrink-0 text-ember" size={22} />
                    <div className="space-y-2">
                        <h2 className="text-2xl text-ink-100">Thirteen zones feed seven HP pools</h2>
                        <p className="text-ink-300">
                            The collision model has one head zone, four torso zones, four arm zones
                            and four leg zones. Each zone maps to exactly one of the pools below.
                        </p>
                    </div>
                </div>

                <div className="grid gap-px border border-line-800 bg-line-800 md:grid-cols-[1fr_auto_1fr]">
                    <div className="bg-steel-800 p-5">
                        <div className="font-mono text-4xl tabular text-ink-hi">13</div>
                        <h3 className="mt-2 text-xl text-ink-100">Collision zones</h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink-500">
                            The physical capsules a round can hit. Hands, feet and the neck do not
                            have separate capsules.
                        </p>
                    </div>
                    <div className="flex items-center justify-center bg-steel-850 px-4 py-2">
                        <ArrowRight className="rotate-90 text-ink-600 md:rotate-0" aria-hidden="true" />
                    </div>
                    <div className="bg-steel-800 p-5">
                        <div className="font-mono text-4xl tabular text-ink-hi">7</div>
                        <h3 className="mt-2 text-xl text-ink-100">Health pools</h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink-500">
                            The shared bars those zones drain. Together they start at{' '}
                            <span className="font-mono tabular text-ink-300">{TOTAL_HP} HP</span>.
                        </p>
                    </div>
                </div>

                <div className="grid gap-px border border-line-800 bg-line-800 sm:grid-cols-2 lg:grid-cols-4">
                    {HP_POOLS.map((pool) => (
                        <div
                            key={pool.key}
                            className={cn(
                                'bg-steel-900 p-4',
                                pool.vital && 'border-l-2 border-bad'
                            )}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold text-ink-100">{pool.label}</h3>
                                    <p className="micro-label mt-1 text-ink-700">
                                        {pool.zones} {pool.zones === 1 ? 'zone' : 'zones'} feed this
                                        pool
                                    </p>
                                </div>
                                <span className="font-mono text-xl tabular text-ink-hi">
                                    {PART_HP[pool.key]}
                                </span>
                            </div>
                            <p
                                className={cn(
                                    'mt-3 text-xs',
                                    pool.vital ? 'text-bad' : 'text-ink-600'
                                )}
                            >
                                {pool.vital ? 'Fatal at zero' : 'Not directly fatal at zero'}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="border border-line-700 bg-steel-800 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                    <HeartPulse className="mt-0.5 shrink-0 text-bad" size={22} />
                    <div className="space-y-3">
                        <h2 className="text-2xl text-ink-100">What happens when a pool reaches zero</h2>
                        <p className="text-ink-300">
                            Head or upper chest at zero kills. A destroyed lower chest, arm or leg
                            does not kill by itself. Any damage that overflows that exhausted pool
                            drains all seven current pools proportionally; repeated hits on the same
                            destroyed limb therefore keep hurting the rest of the body.
                        </p>
                        <p className="text-sm text-ink-500">
                            The exact hit count is never universal. Round, range, build firing power,
                            landed zone, armour coverage and armour condition can all change it.
                        </p>
                    </div>
                </div>

                <div className="mt-5 border-l-2 border-warn bg-steel-900 p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 shrink-0 text-warn" size={20} />
                        <div className="space-y-2">
                            <h3 className="font-semibold text-ink-100">How to read the simulator</h3>
                            <p className="text-sm leading-relaxed text-ink-400">
                                For head and upper-chest shots, the simulator uses that vital
                                pool&rsquo;s real HP. For every non-vital zone, it subtracts damage
                                from one pooled{' '}
                                <span className="font-mono tabular text-ink-300">
                                    {TOTAL_HP} HP
                                </span>{' '}
                                budget instead. It does not reproduce the game&rsquo;s seven-pool
                                overflow redistribution or its final sub-0.5 HP snap, so a limb
                                result is a damage-budget estimate rather than an exact destroyed-limb
                                simulation.
                            </p>
                        </div>
                    </div>
                    <GuideLink href="/combat-sim">Build a scenario in Combat Sim</GuideLink>
                </div>
            </section>

            <section className="space-y-5">
                <div className="flex items-start gap-3">
                    <Droplets className="mt-0.5 shrink-0 text-bad" size={22} />
                    <div className="space-y-2">
                        <h2 className="text-2xl text-ink-100">Bleeding and Deep Wound</h2>
                        <p className="text-ink-300">
                            Shots can cause Bleeding, and every round publishes its own Bleeding
                            Chance value. Deep Wound is the more demanding status: while untreated,
                            it continues to drain health and hydration.
                        </p>
                    </div>
                </div>

                <div className="grid gap-px border border-line-800 bg-line-800 md:grid-cols-2">
                    <div className="bg-steel-900 p-5">
                        <h3 className="text-xl text-ink-100">Bleeding</h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink-400">
                            Treat it with Gauze or either advanced bandage. A round&rsquo;s catalogue
                            entry shows its Bleeding Chance; the exact runtime formula and damage
                            rate are not verified, so this guide does not invent either.
                        </p>
                        <GuideLink href="/items?category=ammo">Compare ammunition</GuideLink>
                    </div>
                    <div className="bg-steel-900 p-5">
                        <h3 className="text-xl text-ink-100">Deep Wound</h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink-400">
                            Treat it with an advanced Bandage, Military Bandage or H.C. stimulant.
                            Gauze does not treat Deep Wound. No verified per-second rate or stacking
                            rule is published here.
                        </p>
                        <GuideLink href="/items?category=medicine&subcategory=Bandages">
                            Browse bandages
                        </GuideLink>
                    </div>
                </div>
            </section>

            <section className="space-y-5">
                <div className="flex items-start gap-3">
                    <Bandage className="mt-0.5 shrink-0 text-good" size={22} />
                    <div className="space-y-2">
                        <h2 className="text-2xl text-ink-100">Choose treatment by status</h2>
                        <p className="text-ink-300">
                            Item name matters more than rarity shorthand. Match the status shown in
                            game to a medical item whose current description treats it.
                        </p>
                    </div>
                </div>

                <div className="divide-y divide-line-800 border border-line-800 bg-steel-900">
                    <div className="grid gap-2 p-4 sm:grid-cols-[10rem_1fr] sm:gap-5">
                        <h3 className="font-semibold text-ink-100">Bleeding only</h3>
                        <p className="text-sm leading-relaxed text-ink-400">
                            <ItemLink href="/items/med-bandage-lv1">Gauze</ItemLink> treats Bleeding,
                            but not Deep Wound.
                        </p>
                    </div>
                    <div className="grid gap-2 p-4 sm:grid-cols-[10rem_1fr] sm:gap-5">
                        <h3 className="font-semibold text-ink-100">Either wound</h3>
                        <p className="text-sm leading-relaxed text-ink-400">
                            <ItemLink href="/items/med-bandage-lv2">Bandage</ItemLink> and{' '}
                            <ItemLink href="/items/med-bandage-lv3">Military Bandage</ItemLink>{' '}
                            treat both Bleeding and Deep Wound. The{' '}
                            <ItemLink href="/items/med-stimul-hc">H.C. stimulant</ItemLink> also
                            describes healing and preventing both.
                        </p>
                    </div>
                    <div className="grid gap-2 p-4 sm:grid-cols-[10rem_1fr] sm:gap-5">
                        <h3 className="font-semibold text-ink-100">Destroyed limb</h3>
                        <p className="text-sm leading-relaxed text-ink-400">
                            <ItemLink href="/items?category=medicine&subcategory=Suturing%20Tools">
                                Suturing instruments
                            </ItemLink>{' '}
                            restore damaged limbs. Their tiers differ, but the exact post-use HP
                            behavior is not stated here because the runtime treatment path remains
                            unverified.
                        </p>
                    </div>
                    <div className="grid gap-2 p-4 sm:grid-cols-[10rem_1fr] sm:gap-5">
                        <h3 className="font-semibold text-ink-100">Pain</h3>
                        <p className="text-sm leading-relaxed text-ink-400">
                            <ItemLink href="/items?category=medicine&subcategory=Painkillers">
                                Painkillers
                            </ItemLink>{' '}
                            temporarily suppress pain and consume energy and hydration. Their item
                            pages carry the current doses, duration and side-effect data.
                        </p>
                    </div>
                </div>

                <GuideLink href="/items?category=medicine">Browse all medical items</GuideLink>
            </section>

            <section className="border border-line-700 bg-steel-800 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                    <Utensils className="mt-0.5 shrink-0 text-info" size={22} />
                    <div className="space-y-3">
                        <h2 className="text-2xl text-ink-100">Hydration and energy</h2>
                        <p className="text-ink-300">
                            Both meters drain during a raid, and the game ties staying hydrated and
                            fueled to stamina. Provisions restore energy, hydration or a mix of both;
                            painkillers consume some of each, and Deep Wound adds hydration loss while
                            it remains untreated.
                        </p>
                        <p className="text-sm text-ink-500">
                            This guide does not attach invented thresholds or debuffs to a low or empty
                            meter. Read each provision&rsquo;s current split before choosing what to
                            carry.
                        </p>
                        <GuideLink href="/items?category=provisions">Browse provisions</GuideLink>
                    </div>
                </div>
            </section>

            <section className="space-y-5">
                <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 shrink-0 text-good" size={22} />
                    <div className="space-y-2">
                        <h2 className="text-2xl text-ink-100">Make the next safe decision</h2>
                        <p className="text-ink-300">
                            There is no universal medication order. The useful sequence changes with
                            the status, remaining HP, cover and whether another fight is already on
                            you.
                        </p>
                    </div>
                </div>

                <ol className="grid gap-px border border-line-800 bg-line-800 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        ['1', 'Get behind cover', 'Treatment animations cost time and attention.'],
                        [
                            '2',
                            'Read the status',
                            'Bleeding, Deep Wound, a destroyed limb and pain need different items.',
                        ],
                        [
                            '3',
                            'Match the item',
                            'Use the current medical description instead of rarity as shorthand.',
                        ],
                        [
                            '4',
                            'Recheck the raid',
                            'Review HP, hydration and energy before moving or fighting again.',
                        ],
                    ].map(([step, title, body]) => (
                        <li key={step} className="bg-steel-900 p-4">
                            <span className="font-mono text-sm tabular text-ember">{step}</span>
                            <h3 className="mt-2 font-semibold text-ink-100">{title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-ink-500">{body}</p>
                        </li>
                    ))}
                </ol>

                <div className="flex flex-wrap gap-x-6 gap-y-1">
                    <GuideLink href="/guides/combat-sim-usage">
                        Learn the simulator workflow
                    </GuideLink>
                    <GuideLink href="/guides/damage-model">Read the exact damage path</GuideLink>
                </div>
            </section>

            <section className="border-l-2 border-info bg-steel-800 p-5">
                <div className="flex items-start gap-3">
                    <Bone className="mt-0.5 shrink-0 text-info" size={20} />
                    <p className="text-sm leading-relaxed text-ink-300">
                        Limb targeting is a scenario choice, not a four-shot rule. If the selected
                        armour leaves a limb open, compare that zone against the protected torso at
                        the range and durability you expect, then treat the simulator&rsquo;s non-vital
                        result as the pooled estimate described above.
                    </p>
                </div>
            </section>
        </div>
    );
}
