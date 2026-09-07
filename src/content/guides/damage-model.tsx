import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Crosshair, Dices, Shield, Wrench } from 'lucide-react';
import ShotInspector from '@/app/combat-sim/components/ShotInspector';

/**
 * Where one armoured hit is allowed its room.
 *
 * The simulator answers *what* a round did; its shot ladder deliberately refuses to answer *why*,
 * because the honest chain does not fit in a popover and a shortened one would be, in
 * `ZoneReadout`'s own words, "a simplification presented as a derivation". This is the other end of
 * that decision — tier 4 on the disclosure ladder, which is prose by design.
 *
 * The arithmetic is NOT restated here. Every figure the inspector prints comes from `explainShot`
 * in `combat-sim/utils/damage-calculations.ts`, which runs the same helpers the shot path does. A
 * guide that recomputed the model from published fields would be a second implementation: correct
 * the day it was written, and wrong *plausibly* the first time a rule moved. So the prose explains
 * and the code computes, and the two cannot disagree.
 */

const CHAIN = [
    ['damage', 'ammo damage, read off DamageOverDistance at the range'],
    ['base', 'damage × body-part multiplier × firing power'],
    ['pen', 'ammo penetration, read off PenetrationPowerOverDistance'],
    ['armour', 'zone class × effectiveness(1 − durability ÷ max)'],
    ['gap', 'armour − pen'],
    ['through', 'durability ≤ 0 ? always : PenetrationChanceCurve(gap) ≥ roll'],
    ['body', 'base × (through ? PenetrationDamageScalarCurve(max(gap, −2)) : blunt × zone blunt) × firing power'],
    ['plate', 'base × durability scalar × (through ? penetrated : blunt) durability scale'],
] as const;

function Formula({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-steel-900 border border-line-800 p-4 overflow-x-auto">
            <code className="font-mono text-sm text-ink-200 whitespace-pre">{children}</code>
        </div>
    );
}

function Rule({
    icon, title, children,
}: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-steel-800 border border-line-700 p-4">
            <h3 className="flex items-center gap-2 text-ink-100 font-semibold mb-2">
                <span className="text-ember shrink-0">{icon}</span>
                {title}
            </h3>
            <div className="text-sm text-ink-400 space-y-2">{children}</div>
        </div>
    );
}

export default function DamageModelGuide() {
    return (
        <div className="space-y-10">
            <section className="space-y-3">
                <p className="text-lg text-ink-200 leading-relaxed">
                    One bullet hitting one armoured body part passes through eight steps before the
                    game takes a number off your health. This page writes all eight out, and lets you
                    run any of them against any round, any plate and any body part.
                </p>
                <p className="text-sm text-ink-500">
                    None of this is fitted to testing. The rules are read out of the shipped binary
                    &mdash; <code className="text-ink-300">ProcessDamageReceived</code> and{' '}
                    <code className="text-ink-300">GetDamagePostGearProtection</code> &mdash; and the
                    single-shot arithmetic was checked against an in-game capture in September 2026:
                    53 recorded damage readings reproduced to within 0.0004 HP.
                </p>
                <div className="border-l-2 border-warn bg-steel-800 p-4 text-sm text-ink-400">
                    This is the canonical description of what the simulator currently calculates,
                    not a promise that every live-game outcome is deterministic. The per-shot roll
                    cannot be reproduced, the durability curve interpretation still needs wider
                    in-game spot checks, and the limits below remain outside the model.
                </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            <section className="space-y-4">
                <h2 className="text-2xl text-ink-100">The whole chain</h2>
                <p className="text-ink-300">
                    In the order the game works in. Everything after this section is one line of it,
                    explained.
                </p>
                <div className="bg-steel-900 border border-line-800 divide-y divide-line-800">
                    {CHAIN.map(([name, body]) => (
                        <div key={name} className="px-4 py-3 sm:flex sm:items-baseline sm:gap-4">
                            <code className="font-mono text-sm text-ember w-20 shrink-0 block">{name}</code>
                            <span className="font-mono text-xs sm:text-sm text-ink-300 break-words">{body}</span>
                        </div>
                    ))}
                </div>
                <p className="text-sm text-ink-500">
                    The two lines worth reading twice are the last two. <strong className="text-ink-300">
                    Firing power appears in <em>base</em> and again in <em>body</em></strong>, so a hit
                    the armour covers is scaled by it twice and a bare hit once. And the plate is billed
                    from the same <em>base</em> the body is &mdash; including the body-part multiplier
                    &mdash; using the durability it held <em>before</em> the bullet landed.
                </p>
            </section>

            {/* ---------------------------------------------------------------- */}
            <section className="space-y-4">
                <h2 className="text-2xl text-ink-100">Try it on one shot</h2>
                <p className="text-ink-300">
                    Pick a round, a plate, a body part and a range. Every intermediate value is printed,
                    and both outcomes are shown &mdash; because the game rolls, and the simulator&rsquo;s
                    ladder has to commit to one of them.
                </p>
                <ShotInspector />
                <p className="text-sm text-ink-500">
                    Arriving from a shot in the{' '}
                    <Link href="/combat-sim" className="text-ember hover:underline">combat simulator</Link>?
                    The link carries that shot&rsquo;s exact inputs, so the figures above are the ones
                    behind that row.
                </p>
            </section>

            {/* ---------------------------------------------------------------- */}
            <section className="space-y-4">
                <h2 className="text-2xl text-ink-100">Step by step</h2>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-xl text-ink-100">1. The round, at the range you fired it</h3>
                        <p className="text-ink-300">
                            Damage and penetration are both curves, not constants, and each round ships
                            its own. Past point blank the curve <em>supplies</em> the damage outright
                            rather than scaling the round&rsquo;s headline figure &mdash; so a round&rsquo;s
                            printed damage stops mattering the moment you step back from the muzzle.
                        </p>
                        <p className="text-sm text-ink-500">
                            Most rifle profiles are flat out to 70&ndash;200 m, so the curve rarely bites
                            indoors. The exception is 12 gauge buckshot, flat only to about 15 m.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl text-ink-100">2. The gun contributes exactly one number</h3>
                        <p className="text-ink-300">
                            Of the six figures the gunsmith screen shows, only <strong className="text-ink-100">
                            firing power</strong> reaches this model at all (fire rate turns shots into
                            seconds, but does not change any of them). Ergonomics, ADS speed, spread and
                            both recoil axes reach nothing here.
                        </p>
                        <Formula>factor = 0.9 + 0.2 × firing power</Formula>
                        <p className="text-sm text-ink-500">
                            The percentage on the bench is that factor, times 100: a gun reading 105% is
                            a factor of 1.05. Which is why the inspector asks for the percentage &mdash;
                            it is the number you can actually see in game.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl text-ink-100">3. Where it landed</h3>
                        <p className="text-ink-300">
                            Every bone carries one multiplier, and the game applies it before any armour
                            is consulted. There is no separate, lower multiplier for a limb already at
                            zero HP &mdash; a destroyed leg takes exactly what an intact one does.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                            {[
                                ['Head, upper chest', '1.0'],
                                ['Pelvis, lower chest', '0.8'],
                                ['Upper arm, thigh', '0.7'],
                                ['Forearm, calf', '0.5'],
                            ].map(([where, value]) => (
                                <div key={where} className="bg-steel-800 border border-line-700 p-3">
                                    <div className="font-mono tabular text-lg text-ink-100">{value}</div>
                                    <div className="micro-label text-ink-600 mt-1">{where}</div>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-ink-500">
                            Hands and feet have no entry of their own; a recorded foot hit behaves as a
                            calf hit. Only the head and the upper chest are fatal at zero &mdash;
                            everything else is a crippled limb, though the damage still comes out of one
                            shared 440 HP body.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl text-ink-100">4. The plate is worth less than its badge</h3>
                        <p className="text-ink-300">
                            Durability does not merely run out &mdash; it scales the armour class itself.
                            The game reads a curve at <em>how much durability is missing</em>, and
                            multiplies the zone&rsquo;s class by the result.
                        </p>
                        <Formula>{'effective class = zone class × curve(1 − durability ÷ max durability)'}</Formula>
                        <p className="text-ink-300">
                            A class 5 vest at 40% durability is not a class 5 vest. In a recorded
                            in-game sequence an IMTV walked from 5.0 down to 3.5 over sixteen rifle
                            hits, and the round that had been bouncing all along went through on the
                            sixteenth without anything about the round changing.
                        </p>
                        <div className="bg-steel-800 border-l-2 border-warn p-4 text-sm text-ink-300">
                            <strong className="text-ink-100">Zone class, not the badge.</strong> A piece
                            rates each body part separately and the headline number on the item card is a
                            display field. A 6B45 badged class 5 carries class 5 on the chest and class 4
                            on the pelvis &mdash; a full class of difference, on the same vest, decided by
                            where you aim.
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl text-ink-100">5. The gap, and the roll</h3>
                        <p className="text-ink-300">
                            Armour class and penetration are the same axis, so the game simply subtracts
                            them. That difference &mdash; not a ratio &mdash; is what both armour curves
                            are read on.
                        </p>
                        <Formula>gap = effective class − penetration</Formula>
                        <p className="text-ink-300">
                            The gap goes into the penetration chance curve, and the game draws a number:
                            it goes through when the chance is at least the roll. A gap of +1 or worse is
                            a hard zero on every shipped curve; a gap near 0 is around 85%; and a plate at
                            zero durability is bypassed outright, with no roll at all.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl text-ink-100">6. What survives, either way</h3>
                        <p className="text-ink-300">
                            <strong className="text-ink-100">Through:</strong> the same gap is read on a
                            second curve, clamped at &minus;2. Beating the armour by a full class already
                            gives full damage, and there is no reward past that.
                        </p>
                        <p className="text-ink-300">
                            <strong className="text-ink-100">Stopped:</strong> two multipliers, both small
                            &mdash; the round&rsquo;s own blunt scale, and the blunt scale of the zone it
                            hit. On a class 6 vest a 5.56 FMJ comes out at about 2 HP a shot. That is the
                            useful discriminator in game: on most vests a bounce is 1&ndash;7 damage and a
                            penetration is 18&ndash;60, an order of magnitude apart, so you never need a
                            precise reading to tell which happened.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl text-ink-100">7. The plate&rsquo;s own bill</h3>
                        <p className="text-ink-300">
                            The armour loses durability on <em>every</em> hit it covers, stopped or not,
                            and a penetrating hit costs it more. It is billed from the same base figure
                            the body is &mdash; body-part multiplier included, firing power counted once.
                        </p>
                        <p className="text-sm text-ink-500">
                            Which is the one free discriminator in game: full damage <em>and</em> zero
                            durability lost happens only when the gear did not cover the hit at all.
                            Every other way of taking a big hit still spends durability.
                        </p>
                    </div>
                </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            <section className="space-y-4">
                <h2 className="text-2xl text-ink-100">Four rules that are easy to get backwards</h2>
                <p className="text-ink-300">
                    Each of these was wrong in this app at some point, and each was wrong in a way that
                    still produced plausible numbers.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Rule icon={<Wrench size={18} />} title="Firing power lands twice — on covered hits">
                        <p>
                            Once before the gear sees the hit, once inside the armour code. A bare hit
                            gets it once, and the plate&rsquo;s durability loss only ever carries the
                            first. A single fitted factor cannot match both cases, which is exactly why
                            the old one never did.
                        </p>
                    </Rule>
                    <Rule icon={<Crosshair size={18} />} title="Firing power never touches penetration">
                        <p>
                            A 105% gun does not push a round through anything a 100% gun would not.
                            Nothing in the armour path applies it to penetration; the only thing
                            subtracted there is penetration already spent crossing an earlier surface.
                        </p>
                    </Rule>
                    <Rule icon={<Shield size={18} />} title="The damage curve clamps at −2, not 0">
                        <p>
                            Clamping the gap at zero throws away the whole region where good ammo beats
                            good armour, and under-reads every over-penetrating shot. Below &minus;1 the
                            curve is already flat at full damage.
                        </p>
                    </Rule>
                    <Rule icon={<Dices size={18} />} title="The simulator does not roll">
                        <p>
                            The per-shot seed travels with the shot so client and server agree, and
                            cannot be reproduced from published data. So the simulator takes the likelier
                            half of every roll. Near 50% the two branches are far apart and the true
                            expected damage sits between them &mdash; which is why the inspector above
                            always prints both.
                        </p>
                    </Rule>
                </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            <section className="space-y-3">
                <h2 className="text-2xl text-ink-100 flex items-center gap-2">
                    <AlertTriangle size={22} className="text-warn" />
                    What this model does not cover
                </h2>
                <ul className="space-y-2 text-ink-300">
                    <li>
                        <strong className="text-ink-100">Coverage.</strong> Whether a plate is between
                        the muzzle and the bone is geometry &mdash; a vest&rsquo;s protection wedge, a
                        helmet&rsquo;s cone regions. The{' '}
                        <Link href="/combat-sim" className="text-ember hover:underline">simulator</Link>{' '}
                        measures it per body part; this page assumes the piece you picked covers the hit.
                    </li>
                    <li>
                        <strong className="text-ink-100">Penetration already spent.</strong> A bullet
                        that crossed an outstretched forearm before reaching the chest arrives with less.
                        Not modelled, and not yet measured in game.
                    </li>
                    <li>
                        <strong className="text-ink-100">Bleeding.</strong> Every round publishes a
                        bleeding chance and nothing here reads it.
                    </li>
                    <li>
                        <strong className="text-ink-100">How a killing shot spills over.</strong> Damage
                        past a destroyed body part redistributes across the others; the simulator budgets
                        against one pooled 440 HP instead, which is close but is not the seven-pool rule.
                    </li>
                    <li>
                        <strong className="text-ink-100">Explosions.</strong> Whether grenade damage
                        reaches the armour path at all is an open question.
                    </li>
                </ul>
            </section>

            {/* ---------------------------------------------------------------- */}
            <section className="grid gap-4 sm:grid-cols-3">
                <div className="border border-line-800 bg-steel-800 p-4">
                    <h2 className="text-lg text-ink-100">Coverage and wear</h2>
                    <p className="mt-2 text-sm text-ink-500">
                        Turn zone coverage, facing and durability into a tactical choice.
                    </p>
                    <Link
                        href="/guides/armor-penetration-guide"
                        className="mt-2 inline-flex min-h-11 items-center text-sm text-ember hover:underline"
                    >
                        Read Armour Penetration &rarr;
                    </Link>
                </div>
                <div className="border border-line-800 bg-steel-800 p-4">
                    <h2 className="text-lg text-ink-100">Choosing a round</h2>
                    <p className="mt-2 text-sm text-ink-500">
                        Make the beginner decision without memorising these formulas.
                    </p>
                    <Link
                        href="/guides/ammo-selection-beginners"
                        className="mt-2 inline-flex min-h-11 items-center text-sm text-ember hover:underline"
                    >
                        Read Ammunition Selection &rarr;
                    </Link>
                </div>
                <div className="border border-line-800 bg-steel-800 p-4">
                    <h2 className="text-lg text-ink-100">Using the interface</h2>
                    <p className="mt-2 text-sm text-ink-500">
                        Follow the current Read, Compare and Numbers workflow.
                    </p>
                    <Link
                        href="/guides/combat-sim-usage"
                        className="mt-2 inline-flex min-h-11 items-center text-sm text-ember hover:underline"
                    >
                        Read Combat Simulator Usage &rarr;
                    </Link>
                </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            <section className="space-y-3">
                <h2 className="text-2xl text-ink-100">Think a number is wrong?</h2>
                <p className="text-ink-300">
                    Good &mdash; and now you can say which step you disagree with, which is worth far
                    more than a disagreement about the final figure. Note the round, the plate, the body
                    part, the durability before the shot, and the firing power your gun displayed, and
                    open an issue or use the{' '}
                    <Link href="/feedback" className="text-ember hover:underline">feedback form</Link>.
                </p>
                <p className="text-sm text-ink-500">
                    Durability before and after the shot is the single most valuable thing to record: it
                    is the only reading that separates a hit the armour never covered from one that got
                    lucky.
                </p>
            </section>
        </div>
    );
}
