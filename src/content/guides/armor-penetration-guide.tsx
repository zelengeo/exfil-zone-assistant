import React from 'react';
import { Shield, Target, TrendingDown, Percent, AlertTriangle, Info, ArrowRight, Zap, Crosshair, Layers } from 'lucide-react';
import Link from 'next/link';

export default function ArmorPenetrationGuide() {
    return (
        <div className="space-y-8">
            {/* Introduction */}
            <section>
                <p className="text-lg text-tan-200 leading-relaxed">
                    Armor penetration decides most firefights before aim does. This guide covers how a bullet
                    actually interacts with armor: when it goes through, how much damage survives, what the armor
                    loses, and — the part most players get wrong — the large parts of a body that armor never
                    covered in the first place.
                </p>
                <p className="mt-3 text-sm text-tan-400">
                    Everything here is read out of the game&#39;s own code and data files rather than inferred from
                    testing, so the numbers are the ones the game uses.
                </p>
            </section>

            {/* TL;DR Section */}
            <section className="bg-yellow-900/20 border border-yellow-700/50 rounded-sm p-6">
                <div className="flex items-start gap-3 mb-4">
                    <Zap className="text-yellow-400 flex-shrink-0" size={24} />
                    <h2 className="text-2xl font-bold text-yellow-300">Quick Combat Decision Guide</h2>
                </div>

                <div className="space-y-4 text-yellow-200">
                    <p className="text-sm">
                        Everything turns on one number: <strong>armor class minus your ammo&#39;s penetration</strong>.
                        Call it the <em>gap</em>.
                    </p>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-green-900/30 p-4 rounded-sm border border-green-700/40">
                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-green-300">
                                <Target size={18} />
                                Gap of −1 or better
                            </h3>
                            <p className="text-sm text-green-200">
                                Your penetration beats the armor by a full class or more.
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-green-200">
                                <li>→ <strong>Always</strong> goes through</li>
                                <li>→ <strong>Full</strong> damage, no reduction</li>
                                <li>→ Aim chest and head</li>
                            </ul>
                        </div>

                        <div className="bg-yellow-900/30 p-4 rounded-sm">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Percent size={18} />
                                Gap near 0
                            </h3>
                            <p className="text-sm">
                                Penetration roughly equals armor class.
                            </p>
                            <ul className="mt-2 space-y-1 text-sm">
                                <li>→ ~85% to go through</li>
                                <li>→ But only 55–95% damage</li>
                                <li>→ Workable, not reliable</li>
                            </ul>
                        </div>

                        <div className="bg-red-900/30 p-4 rounded-sm border border-red-700/40">
                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-red-300">
                                <Shield size={18} />
                                Gap of +1 or worse
                            </h3>
                            <p className="text-sm text-red-200">
                                The armor outclasses your round by a full class.
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-red-200">
                                <li>→ <strong>Never</strong> goes through</li>
                                <li>→ Only weak blunt damage</li>
                                <li>→ Shoot something unarmored</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 mt-4">
                        <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                        <p className="text-sm">
                            <strong>Two things widen the gap in your favour:</strong> range shrinks your penetration
                            (check the ammo&#39;s curve), and damage shrinks the enemy&#39;s armor. A worn vest is a
                            much easier target than its class badge suggests — see below.
                        </p>
                    </div>
                </div>
            </section>

            {/* Coverage - the big one */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-military-700 rounded-sm border border-olive-700">
                        <Crosshair size={20} className="text-olive-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-tan-100">Armor Covers Less Than You Think</h2>
                </div>

                <div className="space-y-4 text-tan-200">
                    <p>
                        Before any of the penetration maths runs, the game asks a simpler question:{' '}
                        <strong>does this piece of gear cover the spot that was hit at all?</strong> If the answer
                        is no, the shot deals <strong>full, unreduced damage</strong> and the armor does not even
                        lose durability. No roll, no reduction, nothing.
                    </p>

                    <div className="bg-military-800 border border-military-600 rounded-sm p-5 space-y-3">
                        <h3 className="font-semibold text-olive-400">Where the gaps are</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <ArrowRight size={14} className="text-olive-400 mt-1 flex-shrink-0" />
                                <span>
                                    <strong>Most of the body.</strong> A typical vest protects only the three spine
                                    segments. Arms, forearms, thighs and calves are usually bare — only a handful of
                                    vests add shoulder or thigh plates, and those are rated lower than the chest.
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <ArrowRight size={14} className="text-olive-400 mt-1 flex-shrink-0" />
                                <span>
                                    <strong>The pelvis, on most vests.</strong> A low abdomen hit reads like a chest
                                    shot but usually lands on nothing. It also draws from a different health pool.
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <ArrowRight size={14} className="text-olive-400 mt-1 flex-shrink-0" />
                                <span>
                                    <strong>The flanks, on some vests.</strong> A protected zone can be a wedge rather
                                    than a full wrap. The TBAS V5&#39;s pelvis plate covers only about 25° either side
                                    of dead ahead; several vests protect their mid-back and stomach through an 80°
                                    wedge. Shots from the side miss the plate entirely.
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <ArrowRight size={14} className="text-olive-400 mt-1 flex-shrink-0" />
                                <span>
                                    <strong>The face.</strong> A helmet&#39;s face opening is a genuine hole in its
                                    protection, not a weak spot — a hit there is treated exactly like hitting an
                                    unhelmeted head.
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-military-800 border border-military-600 rounded-sm p-5">
                        <h3 className="font-semibold text-olive-400 mb-3 flex items-center gap-2">
                            <Layers size={18} />
                            Armor never stacks
                        </h3>
                        <p className="text-sm">
                            The game checks your gear in order and stops at the <strong>first piece that covers the
                            hit</strong>. Two overlapping pieces never both apply. A face shield is the one
                            deliberate exception: it exists to fill the helmet&#39;s face hole, and even then only
                            one of the two ever resolves a given hit. A face shield worn <em>without</em> a helmet
                            protects nothing, and a shield flipped up is not armor.
                        </p>
                    </div>

                    <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-sm p-4">
                        <div className="flex items-start gap-2">
                            <Info className="text-yellow-400 flex-shrink-0 mt-0.5" size={16} />
                            <div className="text-sm">
                                <p className="font-medium text-yellow-300 mb-1">&#34;Lucky penetration&#34; is usually a gap</p>
                                <p className="text-yellow-200">
                                    Players often report a shot punching through armor that should have stopped it,
                                    doing what looks like full damage. A genuine lucky roll cannot do that — it would
                                    deal only 20–30% damage, not 100%. Full damage through armor almost always means
                                    the shot found one of the gaps above, or that the target&#39;s armor was worn far
                                    enough that your round outclassed it.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Penetration Chance Mechanics */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-military-700 rounded-sm border border-olive-700">
                        <Percent size={20} className="text-olive-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-tan-100">Penetration Chance</h2>
                </div>

                <div className="space-y-4 text-tan-200">
                    <p>
                        Penetration is a <strong>dice roll made once per shot</strong>, not a threshold. Two
                        identical shots can land differently. The odds come from a curve indexed on the gap.
                    </p>

                    <div className="bg-military-800 border border-military-600 rounded-sm p-5">
                        <h3 className="font-semibold text-olive-400 mb-3">Body armor — every vest shares one curve</h3>
                        <p className="text-sm mb-3">
                            Vests differ in class, durability and blunt protection, but they all roll against the
                            same penetration curve:
                        </p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-tan-400 border-b border-military-600">
                                        <th className="text-left py-2 pr-4">Gap (armor − penetration)</th>
                                        <th className="text-right py-2">Chance to penetrate</th>
                                    </tr>
                                </thead>
                                <tbody className="text-tan-200">
                                    <tr><td className="py-1 pr-4">−1.0 or better</td><td className="text-right text-green-400 font-semibold">100%</td></tr>
                                    <tr><td className="py-1 pr-4">−0.5</td><td className="text-right">94%</td></tr>
                                    <tr><td className="py-1 pr-4">0 (equal)</td><td className="text-right text-yellow-400 font-semibold">85%</td></tr>
                                    <tr><td className="py-1 pr-4">+0.2</td><td className="text-right">10%</td></tr>
                                    <tr><td className="py-1 pr-4">+0.5</td><td className="text-right">4%</td></tr>
                                    <tr><td className="py-1 pr-4">+0.8 or worse</td><td className="text-right text-red-400 font-semibold">0%</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-tan-500 mt-3">
                            Note how sharp the cliff is between 0 and +0.2. Fractions of a class matter enormously
                            here, which is why armor wear is so decisive.
                        </p>
                    </div>

                    <div className="bg-military-800 border border-military-600 rounded-sm p-5">
                        <h3 className="font-semibold text-olive-400 mb-3">Helmets roll their own</h3>
                        <p className="text-sm">
                            Head gear each carries its own curve. At equal class they sit between{' '}
                            <strong>80% and 99%</strong> to penetrate, and at a full class of disadvantage they
                            drop to <strong>0–6%</strong>. Same shape, same conclusion: a full class either way
                            settles it.
                        </p>
                    </div>
                </div>
            </section>

            {/* Durability */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-military-700 rounded-sm border border-olive-700">
                        <TrendingDown size={20} className="text-olive-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-tan-100">Wear Changes Everything</h2>
                </div>

                <div className="space-y-4 text-tan-200">
                    <p>
                        Damaged armor loses effective class, which moves the gap — and because the chance curve is
                        so steep, a small loss of class can swing a matchup completely.
                    </p>

                    <div className="bg-military-800 border border-military-600 rounded-sm p-5">
                        <h3 className="font-semibold text-olive-400 mb-3">Typical effectiveness by condition</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-tan-400 border-b border-military-600">
                                        <th className="text-left py-2 pr-4">Durability remaining</th>
                                        <th className="text-right py-2">Effective class</th>
                                    </tr>
                                </thead>
                                <tbody className="text-tan-200">
                                    <tr><td className="py-1 pr-4">100% – 75%</td><td className="text-right text-green-400">100% — no loss at all</td></tr>
                                    <tr><td className="py-1 pr-4">50%</td><td className="text-right">~95%</td></tr>
                                    <tr><td className="py-1 pr-4">25%</td><td className="text-right text-yellow-400">~60–80%</td></tr>
                                    <tr><td className="py-1 pr-4">10%</td><td className="text-right">~40–65%</td></tr>
                                    <tr><td className="py-1 pr-4">0%</td><td className="text-right text-red-400 font-semibold">Bypassed entirely</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-sm text-tan-300 mt-3">
                            The important shape here: <strong>armor is at full strength until it is about a quarter
                            gone</strong>, then falls away quickly. Half-durability armor is nearly as good as new;
                            quarter-durability armor is a different item.
                        </p>
                    </div>

                    <div className="bg-red-900/20 border border-red-700/50 rounded-sm p-4">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                            <div className="text-sm">
                                <p className="font-medium text-red-300 mb-1">Broken armor stops nothing</p>
                                <p className="text-red-200">
                                    At zero durability the roll is skipped completely and <strong>every shot
                                    penetrates</strong> — there is no residual chance to bounce. The armor still
                                    applies its penetration damage reduction, so it is not quite naked, but it will
                                    never stop a round again.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Damage when penetrating */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-green-900/30 rounded-sm border border-green-700">
                        <Target size={20} className="text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-tan-100">When The Round Goes Through</h2>
                </div>

                <div className="space-y-4 text-tan-200">
                    <p>
                        Getting through is not the same as hurting. The armor takes a cut of the damage, and how
                        big that cut is depends on the same gap:
                    </p>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-military-900 p-4 rounded-sm">
                            <h4 className="text-sm font-medium text-green-300 mb-2">Gap −1 or better</h4>
                            <p className="text-2xl font-bold text-green-400">100%</p>
                            <p className="text-xs text-tan-500 mt-1">
                                Full damage. There is no reward for exceeding this — a wildly over-matched round
                                does the same damage as one that beats the armor by exactly one class.
                            </p>
                        </div>
                        <div className="bg-military-900 p-4 rounded-sm">
                            <h4 className="text-sm font-medium text-yellow-300 mb-2">Gap 0 (equal)</h4>
                            <p className="text-2xl font-bold text-yellow-400">55–95%</p>
                            <p className="text-xs text-tan-500 mt-1">
                                Varies by vest — the figure is on each item&#39;s page as
                                &#34;Damage at equal class&#34;. Heavier plates cut deeper.
                            </p>
                        </div>
                        <div className="bg-military-900 p-4 rounded-sm">
                            <h4 className="text-sm font-medium text-red-300 mb-2">Gap positive</h4>
                            <p className="text-2xl font-bold text-red-400">20–30%</p>
                            <p className="text-xs text-tan-500 mt-1">
                                A round that scrapes through armor that outclasses it barely hurts. This is the
                                &#34;lucky&#34; penetration — and it is not worth aiming for.
                            </p>
                        </div>
                    </div>

                    <div className="bg-military-800 border border-military-600 rounded-sm p-5">
                        <h3 className="font-semibold text-orange-400 mb-3">What the armor loses</h3>
                        <div className="bg-military-900 p-4 rounded-sm text-sm">
                            <p className="text-center text-tan-300">
                                <span className="text-orange-400 font-medium">damage that reached the armor</span>
                                <span className="text-tan-500"> × </span>
                                <span className="text-orange-400 font-medium">the armor&#39;s fragility</span>
                                <span className="text-tan-500"> × </span>
                                <span className="text-orange-400 font-medium">the round&#39;s durability multiplier</span>
                            </p>
                        </div>
                        <p className="text-sm mt-3">
                            Note the first term: durability loss scales with the <em>damage of the shot</em>, so a
                            big round wears armor down faster than a small one even when both fail to penetrate.
                            Penetrating and non-penetrating hits use different durability multipliers, both listed
                            on the ammo page.
                        </p>
                    </div>
                </div>
            </section>

            {/* Blunt */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-red-900/30 rounded-sm border border-red-700">
                        <Shield size={20} className="text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-tan-100">When It Fails: Blunt Damage</h2>
                </div>

                <div className="space-y-4 text-tan-200">
                    <p>
                        A stopped round still transfers force. Blunt damage is the product of two separate
                        multipliers — one on the round, one on the zone that was hit:
                    </p>

                    <div className="bg-military-900 p-4 rounded-sm text-sm">
                        <p className="text-center">
                            <span className="text-tan-300">damage at range</span>
                            <span className="text-tan-500"> × </span>
                            <span className="text-red-400 font-medium">round&#39;s blunt scale</span>
                            <span className="text-tan-500"> × </span>
                            <span className="text-red-400 font-medium">zone&#39;s blunt scale</span>
                        </p>
                    </div>

                    <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-sm p-4">
                        <div className="flex items-start gap-2">
                            <Info className="text-yellow-400 flex-shrink-0 mt-0.5" size={16} />
                            <div className="text-sm">
                                <p className="font-medium text-yellow-300 mb-1">The zone matters, not the item</p>
                                <p className="text-yellow-200">
                                    Blunt protection is set per zone, and the secondary plates are always worse than
                                    the chest. The SD Protector stops 80% of blunt force on the torso but only 30% on
                                    its arm and thigh plates. Two cheap vests are worse still: the Security Vest and
                                    Soft Armor pass <strong>90%</strong> of blunt damage straight through.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Firing power */}
            <section className="military-box p-6 rounded-sm">
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-military-700 rounded-sm border border-olive-700">
                        <Zap size={20} className="text-olive-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-tan-100">What Firing Power Actually Does</h2>
                </div>

                <div className="space-y-4 text-tan-200">
                    <div className="bg-red-900/20 border border-red-700/50 rounded-sm p-4">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                            <p className="text-sm text-red-200">
                                <strong>Correction to earlier versions of this guide:</strong> firing power does{' '}
                                <strong>not</strong> affect penetration. It never has. Nothing in the armor
                                interaction reads it as a penetration modifier.
                            </p>
                        </div>
                    </div>

                    <p>
                        What it does is scale <strong>damage</strong>, by{' '}
                        <code className="text-olive-400 bg-military-900 px-1 py-0.5 rounded">0.9 + 0.2 × firing power</code>.
                        Across the weapons in the game that runs from about <strong>0.92× to 1.04×</strong> — a few
                        percent either way.
                    </p>

                    <p className="text-sm text-tan-300">
                        One wrinkle worth knowing: that factor is applied <strong>twice</strong> when the shot hits
                        armor and only once when it hits bare flesh. So firing power matters slightly more against
                        armored targets — but it is still a small effect, and it will never turn a bounce into a
                        penetration.
                    </p>
                </div>
            </section>

            {/* Practical */}
            <section className="bg-green-900/20 border border-green-700/50 rounded-sm p-6">
                <h2 className="text-xl font-bold text-green-300 mb-4">Putting It Together</h2>

                <div className="space-y-4">
                    <div className="text-green-200">
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <ArrowRight size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                                <span>
                                    <strong>Check the gap, not the class.</strong> Class 6 armor against a class 6
                                    round is an 85% penetration — high-tier armor is not a wall, it is a tax on your
                                    damage.
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <ArrowRight size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                                <span>
                                    <strong>One full class under is a hard stop.</strong> If your round is a class
                                    below the plate, you will not get through it — switch targets to limbs or pelvis
                                    rather than feeding the vest free durability damage.
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <ArrowRight size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                                <span>
                                    <strong>Keep shooting a target you have already hit.</strong> Armor holds full
                                    strength for the first quarter of its durability and then degrades fast; the
                                    fourth shot is meaningfully better off than the first.
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <ArrowRight size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                                <span>
                                    <strong>Sideways is softer.</strong> Against vests with partial coverage, a flank
                                    angle can miss the plate entirely and deal full damage.
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="mt-4 pt-4 border-t border-green-700/50">
                        <Link
                            href="/combat-sim"
                            className="inline-flex items-center gap-2 text-green-300 hover:text-green-200 transition-colors"
                        >
                            Run your own matchups in the Combat Simulator
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Key Takeaways */}
            <section className="military-box p-6 rounded-sm">
                <h2 className="text-xl font-bold text-tan-100 mb-4">Key Takeaways</h2>
                <ul className="space-y-3">
                    {[
                        'Penetration is a per-shot dice roll on armor class minus your penetration — beat it by a full class and you always get through, fall a full class short and you never do.',
                        'Getting through is not full damage unless you beat the armor by a full class; a barely-successful penetration keeps only 20–30%.',
                        'Armor holds full effectiveness until roughly a quarter of its durability is gone, then falls off a cliff. At zero it stops nothing at all.',
                        'Most of a body is unarmored, some vests only cover a frontal wedge, and a helmet’s face opening is a real hole — all of these take full damage.',
                        'Only the first piece of gear covering a hit applies. Armor never stacks.',
                        'Firing power scales damage by a few percent and does nothing to penetration.',
                    ].map((text, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-olive-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-olive-300 font-bold text-sm">{i + 1}</span>
                            </div>
                            <p className="text-tan-200">{text}</p>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
