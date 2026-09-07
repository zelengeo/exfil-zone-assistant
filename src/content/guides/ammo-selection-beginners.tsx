import React from 'react';
import Link from 'next/link';
import { ArrowRight, CircleDollarSign, Crosshair, Gauge, Shield } from 'lucide-react';

const DECISIONS = [
    {
        situation: 'You can challenge the protected zone',
        choice: 'Prioritise penetration, then damage',
        reason: 'The round still needs enough surviving damage to finish the target after it gets through.',
    },
    {
        situation: 'The expected armour outclasses the round',
        choice: 'Choose an uncovered zone plan',
        reason: 'Damage and controllability matter more when the shot is not asking the vest or helmet for permission.',
    },
    {
        situation: 'You do not know what they will wear',
        choice: 'Compare both plans',
        reason: 'Test an aimed protected-zone result and a repeatable uncovered-zone result before paying for the round.',
    },
] as const;

function RouteLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} className="inline-flex min-h-11 items-center gap-1 text-sm text-ember hover:underline">
            {children}
            <ArrowRight size={14} aria-hidden="true" />
        </Link>
    );
}

export default function AmmoSelectionBeginners() {
    return (
        <div className="space-y-10">
            <section className="space-y-3">
                <p className="text-lg leading-relaxed text-ink-200">
                    Pick ammunition for the shot you expect to take, not for one headline stat. Start
                    with what your build chambers, decide whether you are challenging protection or
                    avoiding it, then compare the result at the range you actually fight.
                </p>
                <p className="text-sm text-ink-500">
                    This is the beginner decision guide. Exact penetration probabilities and damage
                    formulas live in the{' '}
                    <Link href="/guides/damage-model" className="text-ember hover:underline">
                        Damage Model
                    </Link>; coverage and armour wear live in the{' '}
                    <Link href="/guides/armor-penetration-guide" className="text-ember hover:underline">
                        Armour Penetration guide
                    </Link>.
                </p>
            </section>

            <section className="border border-line-700 bg-steel-800 p-5 sm:p-6">
                <h2 className="text-2xl text-ink-100">A four-step choice</h2>
                <ol className="mt-5 space-y-5">
                    {[
                        ['Start with the build', 'A loadout is a build and the round it fires. Filter to the calibre it chambers; a strong round you cannot load is not an option.'],
                        ['Choose the target plan', 'Challenge the helmet or vest when the round is competitive there. Otherwise plan for a zone the gear does not cover.'],
                        ['Check the range', 'Damage and penetration can change with distance. Compare at the distance you expect, not only at point blank.'],
                        ['Check the whole result', 'Shots, time, cost and the spray estimate answer different questions. Pick the trade-off you can execute and afford.'],
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
                <h2 className="text-2xl text-ink-100">Read the round as a trade-off</h2>
                <div className="grid gap-px border border-line-800 bg-line-800 sm:grid-cols-2">
                    {[
                        {
                            icon: <Shield size={20} />,
                            title: 'Penetration',
                            body: 'How well the round challenges effective armour class. Compare it with the zone and its current condition, not only the gear badge.',
                        },
                        {
                            icon: <Crosshair size={20} />,
                            title: 'Damage',
                            body: 'What the hit can take from the target before protection and zone scaling. It matters directly when you aim around armour.',
                        },
                        {
                            icon: <Gauge size={20} />,
                            title: 'Blunt and range',
                            body: 'A stopped round may still deal damage and wear gear, while ballistic curves can change the matchup with distance. Let the simulator calculate both.',
                        },
                        {
                            icon: <CircleDollarSign size={20} />,
                            title: 'Price and availability',
                            body: 'A theoretical improvement is only useful when you can buy enough to load and replace it. Compare cost to kill, not price per round alone.',
                        },
                    ].map((item) => (
                        <div key={item.title} className="bg-steel-900 p-4">
                            <span className="text-info">{item.icon}</span>
                            <h3 className="mt-3 font-semibold text-ink-100">{item.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-ink-400">{item.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="border border-line-700 bg-steel-850 p-5 sm:p-6">
                <h2 className="text-2xl text-ink-100">Decide by situation</h2>
                <div className="mt-5 overflow-x-auto">
                    <table className="w-full min-w-[40rem] text-sm">
                        <thead>
                            <tr className="border-b border-line-700 text-left text-ink-600">
                                <th className="py-2 pr-4 font-medium">Situation</th>
                                <th className="py-2 pr-4 font-medium">Choice</th>
                                <th className="py-2 font-medium">Why</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line-800">
                            {DECISIONS.map((row) => (
                                <tr key={row.situation}>
                                    <td className="py-3 pr-4 text-ink-300">{row.situation}</td>
                                    <td className="py-3 pr-4 font-semibold text-ink-100">{row.choice}</td>
                                    <td className="py-3 text-ink-500">{row.reason}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl text-ink-100">Verify before you buy a stack</h2>
                <p className="text-ink-300">
                    Put the build and round into the simulator, equip the target you care about, set
                    its condition and facing, then compare a protected zone with an uncovered one.
                    Add alternatives as extra loadouts so range and target stay fixed while the round
                    changes.
                </p>
                <div className="border border-line-800 bg-steel-800 p-4 text-sm text-ink-400">
                    <strong className="text-ink-100">Example:</strong> compare an{' '}
                    <Link href="/items/weapon-ak74n-factory" className="text-ember hover:underline">
                        AK-74N (Factory)
                    </Link>{' '}
                    firing{' '}
                    <Link href="/items/ammo-545x39-fmj" className="text-ember hover:underline">
                        5.45x39mm FMJ
                    </Link>{' '}
                    against a fresh{' '}
                    <Link href="/items/armor-6b17-upgrade" className="text-ember hover:underline">
                        6B17 Upgraded Body Armor
                    </Link>{' '}
                    and{' '}
                    <Link href="/items/helmet-ach-green" className="text-ember hover:underline">
                        ACH Helmet
                    </Link>{' '}
                    at 60 m. The link restores that exact build, round, target, condition, facing and view.
                    <span className="mt-2 block">
                        <RouteLink href="/combat-sim?a0w=weapon-ak74n-factory&amp;a0a=ammo-545x39-fmj&amp;da=armor-6b17-upgrade&amp;dad=100&amp;dh=helmet-ach-green&amp;dhd=100&amp;r=60&amp;f=front&amp;v=read">
                            Open the example
                        </RouteLink>
                    </span>
                </div>
                <div className="flex flex-wrap gap-x-6">
                    <RouteLink href="/items?category=ammo">Browse ammunition</RouteLink>
                    <RouteLink href="/combat-sim">Open Combat Simulator</RouteLink>
                    <RouteLink href="/guides/combat-sim-usage">Follow the simulator workflow</RouteLink>
                </div>
            </section>
        </div>
    );
}
