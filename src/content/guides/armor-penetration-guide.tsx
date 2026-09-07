import React from 'react';
import Link from 'next/link';
import { ArrowRight, Crosshair, Shield, ShieldCheck, TrendingDown } from 'lucide-react';

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

export default function ArmorPenetrationGuide() {
    return (
        <div className="space-y-10">
            <section className="space-y-3">
                <p className="text-lg leading-relaxed text-ink-200">
                    Armour is three separate questions: did it cover the hit, how worn was it, and
                    was the round strong enough when it arrived? Answer them in that order. A class
                    badge alone cannot tell you whether a shot was protected.
                </p>
                <p className="text-sm text-ink-500">
                    This guide owns the tactical reading of coverage, durability and wear. For the
                    exact curves, formulas and current simulator assumptions, use the{' '}
                    <Link href="/guides/damage-model" className="text-ember hover:underline">
                        Damage Model
                    </Link>.
                </p>
            </section>

            <section className="border border-line-700 bg-steel-800 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                    <Crosshair className="mt-0.5 shrink-0 text-ember" size={22} />
                    <div className="space-y-3">
                        <h2 className="text-2xl text-ink-100">Coverage comes first</h2>
                        <p className="text-ink-300">
                            Gear only changes a shot when its protection geometry reaches the zone
                            that was hit from the shot&rsquo;s facing. If it does not, the round meets bare
                            flesh and the gear loses no durability.
                        </p>
                    </div>
                </div>

                <div className="mt-5 grid gap-px border border-line-800 bg-line-800 sm:grid-cols-2">
                    <div className="bg-steel-900 p-4">
                        <h3 className="font-semibold text-ink-100">Body armour</h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink-400">
                            Vests protect named zones, and some of those zones only within a wedge.
                            Front and rear share the same two-sided wedge test; flank is the facing
                            that can change the answer. Arms and legs are often outside the vest,
                            but the selected piece &mdash; not a generic rule &mdash; decides.
                        </p>
                    </div>
                    <div className="bg-steel-900 p-4">
                        <h3 className="font-semibold text-ink-100">Helmet and face shield</h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink-400">
                            The helmet shell, a shield filling its holes, and uncovered head are
                            separate readings. Helmet and shield protection never stack on one hit;
                            one piece covers the point or it does not.
                        </p>
                    </div>
                </div>

                <p className="mt-4 text-sm text-ink-500">
                    In the simulator, use the Body and Head views rather than inferring coverage
                    from an item&rsquo;s headline class. The selected zone&rsquo;s Reading names the gear that
                    actually intercepted it and how much of that zone it reaches.
                </p>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <TrendingDown className="shrink-0 text-warn" size={22} />
                    <h2 className="text-2xl text-ink-100">Durability changes the matchup</h2>
                </div>
                <p className="text-ink-300">
                    Durability is not only a countdown until armour breaks. Wear lowers the class
                    the piece is effectively rating at, so a matchup can move from mostly stopped
                    to mostly through before the durability display reaches zero. The exact shape
                    belongs to each piece&rsquo;s curve; there is no safe universal conversion table.
                </p>
                <p className="text-sm text-ink-500">
                    Range and wear move the matchup in opposite directions. When range reduces the
                    round&rsquo;s penetration, the armour-minus-penetration gap grows against the shooter.
                    When wear lowers the effective class, that gap shrinks.
                </p>

                <div className="grid gap-4 sm:grid-cols-3">
                    {[
                        {
                            title: 'Fresh',
                            body: 'Plan against the zone class the piece actually carries. Do not substitute the item-card badge for a zone reading.',
                        },
                        {
                            title: 'Worn',
                            body: 'Expect the effective class to fall during a string of covered hits. Re-check the shot ladder instead of treating every round as the first.',
                        },
                        {
                            title: 'Broken',
                            body: 'Penetration is unconditional. The hit still follows the covered, penetrating damage path, so it can differ from the same shot on naked flesh.',
                        },
                    ].map((item) => (
                        <div key={item.title} className="border border-line-800 bg-steel-800 p-4">
                            <h3 className="font-semibold text-ink-100">{item.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-ink-400">{item.body}</p>
                        </div>
                    ))}
                </div>

                <p className="text-sm text-ink-500">
                    Every covered hit spends durability whether the round is stopped or goes through.
                    How much it spends is part of the shot arithmetic; inspect it in the{' '}
                    <Link href="/guides/damage-model" className="text-ember hover:underline">
                        single-shot calculator
                    </Link>{' '}
                    instead of relying on a fixed rule of thumb.
                </p>
            </section>

            <section className="border border-line-700 bg-steel-850 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="shrink-0 text-good" size={22} />
                    <h2 className="text-2xl text-ink-100">Turn the reading into a decision</h2>
                </div>
                <ol className="mt-5 space-y-4 text-ink-300">
                    {[
                        ['Check the zone', 'If the chosen point is uncovered from this facing, penetration is irrelevant. Keep aiming there if you can hit it consistently.'],
                        ['Check the worn class', 'Use the effective class shown for that shot, not the pristine badge. A plate can cross into a different matchup during the burst.'],
                        ['Check the outcome', 'A stopped hit can still wear the piece down, but feeding a strong plate is costly. Compare that route with an uncovered zone.'],
                        ['Check repeatability', 'The quickest possible head reading is not automatically the shot you can repeat. Compare it with the aimed and spray verdicts.'],
                    ].map(([title, body], index) => (
                        <li key={title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
                            <span className="font-mono text-lg text-ember">{index + 1}</span>
                            <span>
                                <strong className="block text-ink-100">{title}</strong>
                                <span className="mt-1 block text-sm leading-relaxed text-ink-400">{body}</span>
                            </span>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
                <div className="border border-line-800 bg-steel-800 p-4">
                    <Shield className="text-info" size={20} />
                    <h2 className="mt-3 text-lg text-ink-100">Need the arithmetic?</h2>
                    <p className="mt-2 text-sm text-ink-500">
                        Curves, branch behavior, damage and model limitations live in one place.
                    </p>
                    <GuideLink href="/guides/damage-model">Open Damage Model</GuideLink>
                </div>
                <div className="border border-line-800 bg-steel-800 p-4">
                    <Crosshair className="text-info" size={20} />
                    <h2 className="mt-3 text-lg text-ink-100">Choosing a round?</h2>
                    <p className="mt-2 text-sm text-ink-500">
                        Use the beginner decision guide without memorising probability tables.
                    </p>
                    <GuideLink href="/guides/ammo-selection-beginners">Choose ammunition</GuideLink>
                </div>
                <div className="border border-line-800 bg-steel-800 p-4">
                    <TrendingDown className="text-info" size={20} />
                    <h2 className="mt-3 text-lg text-ink-100">Testing a loadout?</h2>
                    <p className="mt-2 text-sm text-ink-500">
                        Set the target&rsquo;s gear, condition and facing in the simulator.
                    </p>
                    <GuideLink href="/guides/combat-sim-usage">Use the simulator</GuideLink>
                </div>
            </section>
        </div>
    );
}
