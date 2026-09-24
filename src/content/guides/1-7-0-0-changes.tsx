import React from 'react';
import Link from 'next/link';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Historical comparison from the September 24 extraction findings supplied for this guide.
// Keep these snapshot values fixed: live item data would rewrite the before/after comparison.
const PENETRATION_EXAMPLES = [
    { penetration: '6', gap: 'One tier above', before: '100%', after: '100%' },
    { penetration: '5', gap: 'Equal', before: '85%', after: '85%' },
    { penetration: '4.5', gap: 'Half a tier below', before: '4%', after: '20%' },
    { penetration: '4', gap: 'One tier below', before: '0%', after: '8%' },
    { penetration: '3.5', gap: 'One and a half tiers below', before: '0%', after: '0%' },
] as const;

export default function Version1700Changes() {
    return (
        <div className="space-y-10">
            <Alert role="note" className="rounded-none border-line-700 bg-steel-800">
                <AlertTitle className="line-clamp-none text-ink-100">
                    In-game testing is still in progress
                </AlertTitle>
                <AlertDescription className="text-ink-300">
                    <p>
                        This guide combines the combat balance patch notes with extracted game data.
                        The new values remain unverified in play, and the worked damage example is
                        an estimate from the documented model. The exact durability behavior of
                        high-tier body armor still needs checking.
                    </p>
                </AlertDescription>
            </Alert>

            <section className="space-y-4">
                <h2 className="text-2xl text-ink-100">What changes in a fight?</h2>
                <p className="text-lg leading-relaxed text-ink-200">
                    Stopping a bullet can now cost more health. Rounds just below a vest&rsquo;s
                    protection class have a better chance of getting through. The patch notes also
                    say high-tier body armor wears down faster when stopping bullets.
                </p>
                <p className="leading-relaxed text-ink-300">
                    These are three separate effects: <strong>blunt damage</strong> takes health
                    when armor stops a bullet, <strong>penetration</strong> decides whether it gets
                    through, and <strong>durability loss</strong> wears down the armor itself.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl text-ink-100">1. A stopped bullet can hurt more</h2>
                <p className="leading-relaxed text-ink-300">
                    A bullet does not have to penetrate to take health. How much blunt damage gets
                    through depends on both the ammunition and the armor zone it hits. This update
                    changes both sides of that calculation.
                </p>
                <p className="leading-relaxed text-ink-300">
                    For example, 12.7x55 FMJ&rsquo;s blunt damage factor rises from 0.060 to 0.185.
                    With everything else held fixed, that means about <strong>3.08 times the blunt
                    health damage</strong> from a stopped hit. It does not mean every hit deals
                    three times the damage, or that the round penetrates three times as often.
                </p>
                <div className="space-y-3 border border-line-700 bg-steel-800 p-5 sm:p-6">
                    <h3 className="text-lg text-ink-100">Example: 9x19 FMJ hits a 6B45 chest plate</h3>
                    <p className="text-sm leading-relaxed text-ink-300">
                        The round&rsquo;s own blunt factor increases by just 5%, but the
                        6B45&rsquo;s chest protection also lets through more blunt damage. Together,
                        the changes produce this estimate for one stopped upper-chest hit:
                    </p>
                    <dl className="grid grid-cols-2 gap-4 border-y border-line-700 py-4">
                        <div>
                            <dt className="text-sm text-ink-400">Before</dt>
                            <dd className="font-mono text-xl tabular-nums text-ink-100">1.62 HP</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-ink-400">After</dt>
                            <dd className="font-mono text-xl tabular-nums text-ink-100">4.69 HP</dd>
                        </div>
                    </dl>
                    <p className="text-sm leading-relaxed text-ink-300">
                        That is about <strong>2.89 times as much health lost</strong>, even though
                        the bullet is stopped in both cases. A small ammo change can have a much
                        larger effect when the armor changes too.
                    </p>
                    <p className="text-sm leading-relaxed text-ink-400">
                        This estimate uses 58 base damage, a range before damage falloff, and weapon,
                        body-zone and game-mode multipliers of 1. The calculation is
                        58 × 0.14 × 0.20 before, and 58 × 0.147 × 0.55 after.
                        Other weapons, ranges and hit zones can give different results.
                    </p>
                </div>
                <p className="leading-relaxed text-ink-300">
                    This is not a blanket ammo buff. Of 84 compared ammo profiles, 61 have higher
                    blunt factors, 8 have lower ones and 15 are unchanged. Base damage and base
                    penetration are unchanged in those profiles. Even zones on the same vest can
                    differ, so the chest example does not describe every hit on a 6B45.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl text-ink-100">2. Body armor has a wider chance of being penetrated</h2>
                <p className="leading-relaxed text-ink-300">
                    Previously, the body-armor penetration curve reached 0% when the bullet was
                    one tier below the armor. It now reaches 0% at a gap of one and a half tiers.
                    Rounds in between have a chance to get through, and some close matchups have
                    better odds than before.
                </p>
                <p className="leading-relaxed text-ink-300">
                    Here is what that means against <strong>effective class 5 body armor</strong>.
                    Effective class means its protection after durability wear; bullet penetration
                    means what remains when it reaches the armor, after range or earlier surfaces.
                </p>
                <Table>
                    <TableCaption className="text-left leading-relaxed text-ink-400">
                        Extracted body-armor curve values, unverified in play. Each percentage is
                        the chance for a single hit at the stated values.
                    </TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead scope="col" className="whitespace-normal">Bullet penetration</TableHead>
                            <TableHead scope="col">Before</TableHead>
                            <TableHead scope="col">After</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {PENETRATION_EXAMPLES.map((row) => (
                            <TableRow key={row.penetration}>
                                <TableCell className="whitespace-normal text-ink-200">
                                    <span className="font-mono tabular-nums">{row.penetration}</span>
                                    <span className="block text-xs text-ink-400">{row.gap}</span>
                                </TableCell>
                                <TableCell className="font-mono tabular-nums">{row.before}</TableCell>
                                <TableCell className="font-mono tabular-nums">{row.after}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <p className="leading-relaxed text-ink-300">
                    <strong>Example:</strong> penetration 4 against effective class 5 now has an
                    8% chance per hit. Imagine 100 separate shots at that exact same armor
                    condition: roughly 8 would penetrate on average, but any particular set could
                    have more or fewer. There is no guaranteed penetration every twelfth shot.
                    In a real burst, armor wear can change the odds between hits.
                </p>
                <p className="leading-relaxed text-ink-300">
                    Penetration 4.5 against that same armor goes from 4% to 20%: one chance in
                    five, with four chances in five of being stopped. Lower-penetration ammo has
                    a better opening, but a chance to penetrate is still not a reliable penetration.
                </p>
                <p className="text-sm leading-relaxed text-ink-400">
                    This penetration-curve change applies to body armor only. The helmet curve is
                    unchanged. Some helmet and face-shield blunt factors did change, so that does
                    not mean all head protection behaves exactly as before.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl text-ink-100">3. High-tier armor wear still needs testing</h2>
                <p className="leading-relaxed text-ink-300">
                    The patch notes say high-tier body armor loses more durability when absorbing
                    blunt damage. In player terms, a vest may stop the incoming bullets but lose
                    its protection sooner as those hits wear it down.
                </p>
                <p className="leading-relaxed text-ink-300">
                    The extracted data shows changes to how much armor wear some rounds cause:
                    37 of the 84 compared ammo profiles have higher blunt durability factors,
                    and 8 have lower ones. However, the vests&rsquo; maximum durability and their
                    own durability-damage factors are unchanged. These values alone do not explain
                    the full high-tier armor change described in the notes.
                </p>
                <div className="space-y-3 border border-line-700 bg-steel-800 p-5 sm:p-6">
                    <h3 className="text-lg text-ink-100">More health damage does not tell us how much armor wears</h3>
                    <p className="text-sm leading-relaxed text-ink-300">
                        In the 9x19 FMJ versus 6B45 example above, the old documented formula
                        estimates about <strong>4.02 durability lost both before and after</strong>,
                        provided enough durability remains. Health damage rises from 1.62 to
                        4.69 HP, but that formula calculates armor wear separately.
                    </p>
                    <p className="text-sm leading-relaxed text-ink-300">
                        This does not disprove the patch notes. It means the updated game&rsquo;s
                        calculation and controlled in-game shots still need checking. We cannot
                        yet give a verified percentage increase or a new number of hits a vest
                        will survive.
                    </p>
                </div>
            </section>

            <section className="space-y-3 border-t border-line-800 pt-6">
                <h2 className="text-2xl text-ink-100">What this comparison covers</h2>
                <p className="text-sm leading-relaxed text-ink-400">
                    The figures compare the September 24, 2026 extraction labeled 1.7.0.0 with
                    the 1.6.16.0 baseline. They show differences between those snapshots; they do
                    not prove that every difference first appeared in this single patch. Damage
                    examples use the previously documented model, not new in-game measurements,
                    and do not establish a shots-to-kill count.
                </p>
                <Link
                    href="/guides/armor-penetration-guide"
                    className="inline-flex min-h-11 items-center text-sm text-ember hover:underline"
                >
                    Read more about armor coverage and durability
                </Link>
            </section>
        </div>
    );
}
