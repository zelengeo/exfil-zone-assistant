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
The organisation half of a vendor: ARK, N.T.G, TRUPIK'S, REGIMENT, BOULDER FORGE, NEUMANN. Carries
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
Three distinct things share this word, so it is never used alone. The **vendor** is NEUMANN, fronted
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
A task that unlocks a good in a vendor's store by turning in materials. Issued by NEUMANN.
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

### Identity

**Game id**:
The identifier the game's own files use for a task, such as `task.marc.part2.01`. What external data
joins on.
_Avoid_: Internal id, real id, source id

**Id**:
The identifier this wiki routes on, such as `ark_63`. Its prefix is part of the id and carries no
meaning: a task whose id begins `research_` is issued by NEUMANN, not by anything called research.
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
