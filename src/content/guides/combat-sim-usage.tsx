import React from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3, Crosshair, ListTree, ScanSearch, Share2 } from 'lucide-react';

function GuideLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} className="inline-flex min-h-11 items-center gap-1 text-sm text-ember hover:underline">
            {children}
            <ArrowRight size={14} aria-hidden="true" />
        </Link>
    );
}

export default function CombatSimUsageGuide() {
    return (
        <div className="space-y-10">
            <section className="space-y-3">
                <p className="text-lg leading-relaxed text-ink-200">
                    The Combat Simulator compares a build and its round against the gear a target is
                    wearing. Set up the fight once, read the recommendation, then move between Read,
                    Compare and Numbers without rebuilding the scenario.
                </p>
                <p className="text-sm text-ink-500">
                    This guide owns the current interface workflow. It does not restate the damage
                    model; use the{' '}
                    <Link href="/guides/damage-model" className="text-ember hover:underline">
                        Damage Model
                    </Link>{' '}
                    when you need the arithmetic behind one shot.
                </p>
            </section>

            <section className="border border-line-700 bg-steel-800 p-5 sm:p-6">
                <h2 className="text-2xl text-ink-100">Build the scenario</h2>
                <ol className="mt-5 space-y-5">
                    {[
                        ['Choose a loadout', 'Select the row in the Loadout rail, then use Gun & round to pick a preset or saved build and a compatible round. Add up to four loadouts when you want alternatives.'],
                        ['Dress the target', 'Under Target, choose body armour, helmet and a compatible face shield. Set vest and helmet durability with their sliders; the shield has no durability control.'],
                        ['Set facing', 'Front and Rear use the same two-sided vest-wedge result; Flank is the comparison that can expose different coverage.'],
                        ['Set range', 'Move the slider or use a preset range. The row beneath it previews the aimed result at each preset for the selected loadout.'],
                    ].map(([title, body], index) => (
                        <li key={title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
                            <span className="font-mono text-xl text-ember">{index + 1}</span>
                            <span>
                                <strong className="block text-ink-100">{title}</strong>
                                <span className="mt-1 block text-sm leading-relaxed text-ink-400">{body}</span>
                            </span>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl text-ink-100">Start with the verdict</h2>
                <p className="text-ink-300">
                    The bar above every view gives three answers for the selected loadout. Read them
                    as different levels of execution, not as three versions of the same statistic.
                </p>
                <div className="grid gap-px border border-line-800 bg-line-800 sm:grid-cols-3">
                    {[
                        ['Best case', 'The fewest rounds anywhere. It usually points to a head reading and opens the Head view.'],
                        ['Aimed', 'The fewest rounds off the head. This is the large recommendation because it is the repeatable aimed shot.'],
                        ['Spraying', 'An estimate for holding the trigger at centre mass. It includes the build’s recoil and spread, so compare it with Aimed to see what control is worth.'],
                    ].map(([title, body]) => (
                        <div key={title} className="bg-steel-900 p-4">
                            <h3 className="font-semibold text-ink-100">{title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-ink-400">{body}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
                <div className="border border-line-700 bg-steel-850 p-5">
                    <ScanSearch className="text-info" size={22} />
                    <h2 className="mt-3 text-xl text-ink-100">Read</h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink-400">
                        Inspect one loadout against the target. Switch Body or Head, select a zone on
                        the model or zone strip, and read its shots, time, cost, coverage and shot ladder.
                    </p>
                </div>
                <div className="border border-line-700 bg-steel-850 p-5">
                    <BarChart3 className="text-info" size={22} />
                    <h2 className="mt-3 text-xl text-ink-100">Compare</h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink-400">
                        Put every loadout beside the same target at the same range. Use the body maps
                        for overall differences and the reading table for Face, Shell, chest, pelvis
                        and limb comparisons.
                    </p>
                </div>
                <div className="border border-line-700 bg-steel-850 p-5">
                    <ListTree className="text-info" size={22} />
                    <h2 className="mt-3 text-xl text-ink-100">Numbers</h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink-400">
                        Audit every zone, every preset range and the spray estimate. Use this view when
                        the verdict answers what to do but you need to compare the evidence behind it.
                    </p>
                </div>
            </section>

            <section className="border border-line-700 bg-steel-800 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                    <Crosshair className="shrink-0 text-ember" size={22} />
                    <h2 className="text-2xl text-ink-100">Inspect one zone shot by shot</h2>
                </div>
                <p className="mt-4 text-ink-300">
                    In Read, selecting a zone opens its Reading. The ladder shows health damage,
                    durability damage and whether each modelled shot was stopped or went through.
                    Open a row for remaining body HP, remaining durability, effective class and the
                    penetration chance used for that shot.
                </p>
                <p className="mt-3 text-sm text-ink-500">
                    Use <strong className="text-ink-300">Where this number comes from</strong> in the
                    row to open the Damage Model with that shot&rsquo;s round, gear, zone, range, firing
                    power and pre-shot durability already selected.
                </p>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <Share2 className="shrink-0 text-info" size={22} />
                    <h2 className="text-2xl text-ink-100">Share the setup</h2>
                </div>
                <p className="text-ink-300">
                    Share setup copies the current loadouts, target gear, condition, facing, range and
                    selected view into a link. Use it when comparing notes so everyone is looking at
                    the same scenario rather than reconstructing it from a list of item names.
                </p>
            </section>

            <section className="border-l-2 border-warn bg-steel-800 p-5">
                <h2 className="text-xl text-ink-100">Read the limits before treating it as a prediction</h2>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-400">
                    <li>
                        The shot ladder does not reproduce the game&rsquo;s random seed. It selects one
                        branch for a stable comparison, so close penetration matchups can resolve
                        differently in a match.
                    </li>
                    <li>
                        The spray figure is a <strong className="text-ink-200">spray estimate</strong>:
                        it models a player holding centre mass, unlike the exact per-zone shot path.
                    </li>
                    <li>
                        Bleeding, a round crossing an earlier surface, explosions and some post-hit
                        behavior are outside the model. The canonical limitations list is in Damage Model.
                    </li>
                </ul>
            </section>

            <section className="flex flex-wrap gap-x-6">
                <GuideLink href="/combat-sim">Open Combat Simulator</GuideLink>
                <GuideLink href="/guides/armor-penetration-guide">Read armour tactics</GuideLink>
                <GuideLink href="/guides/ammo-selection-beginners">Choose ammunition</GuideLink>
            </section>
        </div>
    );
}
