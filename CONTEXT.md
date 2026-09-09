# ExfilZone Assistant

A companion wiki for *Contractors Showdown: ExfilZone*. It publishes the game's items, contracts and
upgrades; it does not track an individual player's account, so everything it knows about progress
was entered by the reader on their own device.

## Language

### Vendors

**Vendor**:
One of the six shop fronts a player trades and takes work from. Named by the same key the game's
goods data uses, which is why the key sometimes reads as a role rather than a name.
_Avoid_: Corp, corporation, trader, faction, shop, owner

**Org**:
The organisation half of a vendor: ARK, N.T.G, Trupik's, Regiment, Boulder Forge, Neumann. Carries
its own name and icon, and is written in its own casing rather than uppercased in data.
_Avoid_: Corp, company, brand

**Merchant**:
The named person who fronts a vendor, one per vendor: Tommy, Maggie, Johnny, Igor, Maximilian, Anna.
Carries their own name and portrait, distinct from the org's name and icon.
_Avoid_: NPC, trader, vendor, dealer

**Rail group**:
One column of the task rail: each of the six vendors, plus a seventh holding the dailies. A
presentation grouping, not a claim about who issues the work.
_Avoid_: Owner, chain owner, corp

**Gunsmith**:
Three distinct things share this word, so it is never used alone. The **vendor** is Neumann, fronted
by Anna. The **task kind** is bench work rather than a field objective. The **build feature** is the
weapon-assembly tool, and is the only one the bare word may refer to.

### Tasks

**Task**:
One contract issued by a vendor, or in the case of a daily, by nobody. The unit the tasks route
routes on.
_Avoid_: Quest, mission, contract, job

**Objective**:
One checkable line inside a task. A task is done when every objective is ticked.
_Avoid_: Step, requirement, goal

**Kind**:
What sort of task it is, independent of who issues it: standard, daily, or research.
_Avoid_: Type, category, class

**Daily**:
A task bound to no vendor, carrying no prerequisites, no reputation and no loyalty tiers. Refreshes
rather than being completed once.
_Avoid_: Repeatable, rotating task

**Research**:
A task that unlocks a good in a vendor's store by turning in materials. Issued by Neumann.
_Avoid_: Unlock, crafting task

**Chain**:
A vendor's tasks arranged as a prerequisite graph. Position in the chain is the information the
tasks route exists to show, which is why it has no completed or locked tabs.
_Avoid_: Tree, questline, path, sequence

**Trust**:
The loyalty level a player holds with one vendor, 0 to 4. A task may require a minimum.
_Avoid_: Loyalty, rank, tier, standing

**Reputation**:
Points earned with one vendor, which raise trust as they cross that vendor's caps. Trupik's
publishes no tiers, so reputation buys nothing there.
_Avoid_: Rep, favour, standing, XP

### Hideout

**Upgrade**:
One level of one zone, bought with money and materials. The unit the hideout route counts: 70 of
them. Identified as `<areaId>Lv<level>`.
_Avoid_: Improvement, build, node

**Zone**:
One upgradable place in the hideout — the generator, the toilet, the shooting range. Carries its own
ladder of levels and its own pin on the floor plate. `areaId` in the data.
_Avoid_: Area, facility, station, module

**Room**:
One screen of the hideout map, holding a set of zones: the main floor plus the lounge, medical,
kitchen and HQ pad. `categoryId` in the data. Two rooms are also zones, and two hold no upgrades of
their own.
_Avoid_: Category, floor, section, tab

**Perk**:
The buff one upgrade grants — the EXP boost, the reload speed, the carry weight. `perks` in the
data, where each carries the line the game's menu prints and the number the game applies. The two
are authored separately and often disagree, so neither is called the perk on its own.
_Avoid_: Buff, bonus, effect, stat

**Materials**:
The items an upgrade asks for, on top of its price. `exchange` in the data.
_Avoid_: Ingredients, components, requirements, costs

> **Perk** is also a medical term: the buff a stim or painkiller applies while it is up, `perk` in
> `medical.json`. Same word on purpose — both are a named effect the game switches on, and a reader
> who has met one understands the other.



**Built**:
An upgrade the player has recorded as done. The hideout's form of progress, and the only thing the
route stores.
_Avoid_: Completed, unlocked, owned, purchased

> The generated hideout data says `relatedQuests`, and the field name stays because the extraction
> writes it. Everything a reader sees says **task**.

### Confidence

**Unverified**:
A figure read out of the game's own files that nobody has confirmed in play. Testing it is what
removes the label, so it is a promise rather than a permanent disclaimer.
_Avoid_: Unconfirmed, untested, provisional, beta

**Estimate**:
A figure this app computes from a model of its own, which the game states nothing to check against.
Permanently labelled, because there is no test that would settle it.
_Avoid_: Approximation, guess, prediction, simulation

> A figure with neither word is read from the game and has been seen to hold. That is the floor and
> it is never labelled — see [the confidence vocabulary](src/components/ui/AGENTS.md).

### Quality

**Grade**:
How good one figure is, on a four-rung scale shared by every surface in the app: bottom quarter,
lower half, upper half, top quarter. Drawn as four segments lit up to the rung, always beside the
figure itself, never as colour alone. Lives in `src/lib/quality/grade.ts`.
_Avoid_: Rating, score, quality, star

**Band**:
A grade plus the evidence behind it — which peers it was ranked against and how many there were.
The gunsmith's word, kept because it predates the shared scale. Never used for a run of coloured
rectangles that is not a grade: the head capsule's horizontal colour divisions are **slabs**.
_Avoid_: Tier, bracket, quartile (as a noun for the thing itself)

**Peer set**:
The items one figure is ranked against — a round's own calibre, a vest's own shelf, a gun's own
class. Never the whole catalogue: nobody chooses between a pistol round and a rifle round, so
ranking them together would produce a number that reads as a judgement and is not one. Fewer than
six peers and nothing is graded.
_Avoid_: Comparison group, cohort, sample

**Slab**:
One horizontal division of a capsule in the body viewer, used where a single bone carries more than
one reading. A presentation device, unrelated to grades.
_Avoid_: Band, stripe, segment

### Combat

**Loadout**:
A build and the round it is firing, in one of the simulator's four slots. A build alone is not a
loadout — a build carries a magazine, never a round.
_Avoid_: Attacker, weapon, setup, gun

**Zone**:
One collision capsule of the target, or one of the head's readings. What a shot can land on. The
thirteen capsules are the game's own; nothing in this route authors zones of its own any more.
_Avoid_: Body part, hitbox, area, region

**Reading**:
One distinct armour answer on the head. A helmet's shell, the shield filling its holes and whatever
neither reaches are three readings, however many named head zones share each.
_Avoid_: Head zone, face zone, helmet slot

**Verdict**:
The three-tier answer above the page — best case, aimed, spraying.
_Avoid_: Summary, result, headline

**Spray estimate**:
The rounds a burst held on centre mass takes on average. Always named as an estimate: it is the one
figure on the page that models the player rather than the game.
_Avoid_: Average TTK, real TTK, practical TTK

**Facing**:
Where the shot comes from — front, flank or rear. The vest wedge test is two-sided, so front and
rear are the same answer and the flank is the whole question.
_Avoid_: Angle, azimuth, direction, stance

### Identity

**Game id**:
The identifier the game's own files use for a task, such as `task.marc.part2.01`. What external data
joins on.
_Avoid_: Internal id, real id, source id

**Id**:
The identifier this wiki routes on, such as `ark_63`. Its prefix is part of the id and carries no
meaning: a task whose id begins `research_` is issued by Neumann, not by anything called research.
_Avoid_: Slug, key, wiki id

### Trade

**Offer**:
One good a vendor will sell, at a price and behind whatever gates apply.
_Avoid_: Listing, product, item entry, deal

**Gate**:
What stands between a player and an offer. A task gate costs playtime, a DLC gate costs money, and
both are information rather than locks, since the wiki tracks neither progress nor purchases.
_Avoid_: Lock, requirement, barrier, paywall

### Progress

**Progress**:
What one reader has ticked off, held on their own device and never on a server. Distinct from
anything the game itself knows.
_Avoid_: Save, account, profile, sync

**Wipe**:
A game-version reset that clears progress while preserving player-authored content and preferences.
_Avoid_: Reset, clear, purge
