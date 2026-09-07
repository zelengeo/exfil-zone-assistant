# Wipe guide research for issue #13

Research date: 2026-09-06. Scope: first-party Caveman Studio/Contractors Showdown sources that are publicly accessible without joining the Discord server. Issue: [#13](https://github.com/zelengeo/exfil-zone-assistant/issues/13).

The repository had no existing research-notes directory or filename convention. This note therefore establishes `docs/research/` for focused implementation research; it is not product copy.

## Confirmed findings

### Numbering and dates

The first-party record supports **four wipe updates**, with the Alpha launch as a separate pre-wipe period. It does not support the guide's current `Season 1` through `Season 5` numbering.

| Period | Confirmed date | What the source establishes |
| --- | --- | --- |
| Alpha launch | 2024-12-19 | The official Steam announcement says the ExfilZone Alpha was live; this is a launch, not a numbered wipe. [Official Steam announcement](https://steamcommunity.com/ogg/2719160/announcements/detail/524204130710847498) |
| First wipe | 2025-04-24 | Caveman calls it “the first wipe update since the launch of Alpha” and published the update on April 24. [Caveman Studio](https://www.contractorsvr.com/single-post/situation-report-exfilzone-wipe-update) |
| Second wipe | 2025-09-25 | Caveman announced the **2nd Wipe Update** with an initial September 4 target, then released the full wipe on September 25. [Target and numbering](https://www.contractorsvr.com/single-post/sitrep-exfilzone-wipe-date-battle-royale-update); [actual release](https://www.contractorsvr.com/single-post/sitrep-showdown-massive-update) |
| Third wipe | 2025-12-22 | Caveman says the **3rd wipe update** went live that day. [Caveman Studio](https://www.contractorsvr.com/single-post/sitrep-exfilzone-3rd-wipe-update) |
| Fourth wipe | 2026-04-21 | Caveman calls this the **4th Wipe Update** and says it moved from the planned April 23 date to April 21 on launch day. [Caveman Studio](https://www.contractorsvr.com/single-post/sitrep-exfilzone-4th-wipe-update-live) |

The guide should therefore describe the current period as **after the fourth wipe**, not `Season 5`. Its April 23 start date is wrong: the confirmed release was April 21. The old April 24/25 discrepancy should resolve to April 24, the first wipe's published date. [First wipe](https://www.contractorsvr.com/single-post/situation-report-exfilzone-wipe-update); [fourth wipe](https://www.contractorsvr.com/single-post/sitrep-exfilzone-4th-wipe-update-live)

Using the confirmed calendar dates above, the completed post-wipe periods lasted 154 days (April 24 to September 25), 88 days (September 25 to December 22), and 120 days (December 22 to April 21). The Alpha-to-first-wipe period was 126 days if the official December 19 Steam launch post is used. These are computed intervals, not durations stated by Caveman. The longest confirmed completed wipe-to-wipe interval is therefore **154 days**, not the configured 153.

### PvP versus PvE scope

Caveman explicitly says PvE has its own progression, separate from PvP, and that wipes do not affect the PvE experience. The guide must scope preparation and reset language to **PvP progression** and must not say “everything resets” without that qualifier. [Fourth wipe announcement](https://www.contractorsvr.com/single-post/sitrep-exfilzone-4th-wipe-update-live)

The public first-party pages reviewed do not enumerate every individual PvP field that is cleared. They support a progression/economy reset generally, but not the guide's uncited exhaustive list of character level, skills, inventory, and “faction reputation.” Use the repository's canonical terms **Vendor** and **Reputation** if individual fields are retained, and only retain fields that can be linked to a direct official source. The third-wipe post calls the release a “major balance reset,” while the fourth-wipe post describes an economy overhaul; neither is a complete reset schema. [Third wipe](https://www.contractorsvr.com/single-post/sitrep-exfilzone-3rd-wipe-update); [fourth wipe](https://www.contractorsvr.com/single-post/sitrep-exfilzone-4th-wipe-update-live)

### Announcement reliability and the current next milestone

The statement that Caveman “always” announces an exact date several weeks in advance is contradicted by the official history. The second wipe missed its initial September 4 target and shipped September 25; the fourth wipe moved from April 23 to April 21 on launch day. Replace the statement with: official dates can change, and the guide only treats a dated first-party announcement as confirmed. [Second-wipe target](https://www.contractorsvr.com/single-post/sitrep-exfilzone-wipe-date-battle-royale-update); [second-wipe release](https://www.contractorsvr.com/single-post/sitrep-showdown-massive-update); [fourth wipe](https://www.contractorsvr.com/single-post/sitrep-exfilzone-4th-wipe-update-live)

As of 2026-09-06, no publicly indexed Caveman Studio site or official Steam announcement reviewed here confirms a fifth wipe date or a future wipe milestone. The official Steam news feed's newest first-party entries are the July 17 event and July 24 patch notes; the July 2 mid-wipe post only hoped for more community and creator events later in July, a date already past. [Official Steam news feed](https://steamcommunity.com/app/2719160/allnews/); [July 2 Caveman post](https://www.contractorsvr.com/single-post/sitrep-mid-wipe-update-release)

Consequently, the guide's August 15 “Dev Peek,” late-September estimate, claimed 16–43 day pattern, and “next milestone” pre-wipe timing are **not confirmed by the publicly accessible first-party sources reviewed**. Do not publish them as facts. If a direct official Discord announcement link is obtained during implementation, it can supersede this finding; otherwise the current status should read **No official fifth-wipe date announced** with no predicted window. Any forecast retained for editorial reasons must be in a visually separate `Estimate` block and described as site analysis, not official information.

### Official Discord link

Use `https://discord.com/invite/contractorsshowdown` everywhere. Caveman uses that stable vanity invite in the first-wipe, second-wipe, September 2025 release, and fourth-wipe posts. [First wipe](https://www.contractorsvr.com/single-post/situation-report-exfilzone-wipe-update); [second wipe](https://www.contractorsvr.com/single-post/sitrep-exfilzone-wipe-date-battle-royale-update); [fourth wipe](https://www.contractorsvr.com/single-post/sitrep-exfilzone-4th-wipe-update-live)

The current `https://discord.gg/KyPzc7GRfe` link is noncanonical even if it still resolves. The vanity invite visibly identifies the server as **Contractors Showdown**; it does not establish that Discord announcements themselves are publicly readable without accepting the invite.

## Supported historical summaries

These short labels and summaries stay within what the linked official release posts actually say:

- **Alpha launch — December 19, 2024.** Initial ExfilZone Alpha availability. Do not label this the first wipe. [Official Steam announcement](https://steamcommunity.com/ogg/2719160/announcements/detail/524204130710847498)
- **First wipe: Resort — April 24, 2025.** Resort, Safe Containers, Hideout overhaul, G3-family weapons and PSG-1, expanded tasks, and a revamped medical system. [Caveman Studio](https://www.contractorsvr.com/single-post/situation-report-exfilzone-wipe-update)
- **Second wipe: Gunsmith — September 25, 2025.** Gunsmith, Smuggling Tunnel, the revamped Hideout/Workshop, Unreal Engine 5, new weapons, and the full wipe. [Caveman Studio](https://www.contractorsvr.com/single-post/sitrep-showdown-massive-update)
- **Third wipe: Balance and weapons — December 22, 2025.** SVD, VSS, AS Val, SR-3M and M1928; physical gunstock calibration; task/map UI changes; taskline and Vendor-offer balance changes; Dam fixes. [Caveman Studio](https://www.contractorsvr.com/single-post/sitrep-exfilzone-3rd-wipe-update)
- **Fourth wipe: PvE and economy — April 21, 2026.** Separate non-wiping PvE progression, upgraded Scav and PMC AI, economy overhaul, dynamic weather, dog tags, kiosk direct selling, and new protective gear. [Caveman Studio](https://www.contractorsvr.com/single-post/sitrep-exfilzone-4th-wipe-update-live)

Avoid unsupported marketing-style names such as `Season 4: Placeholder` or `Season 5: PVE`. The official posts consistently identify updates by ordinal wipe number; their feature headings are safer compact subtitles.

## Repository behavior and implementation brief

Current behavior in `src/content/guides/when-is-the-wipe.tsx`:

- `MAX_DURATION_DAYS` is 153, while the tooltip calls it an “average wipe length.” It is neither the confirmed maximum (154) nor the computed average.
- The bar width and tooltip percentage clamp at 100%, but the displayed day count continues increasing. After the configured maximum, a reader sees an undifferentiated full green bar and no indication that the threshold was exceeded.
- `new Date("YYYY-MM-DD")` is mixed with the current timestamp and floored. Move calendar-day arithmetic into a pure UTC-normalized helper so time of day and host timezone cannot shift results.
- The guide is statically generated. Its ongoing duration is evaluated at build/render time and changes only after another deployment; preserve static generation and treat that as an explicit freshness constraint.

Recommended implementation:

1. Model the history as one typed constant array with `kind: "launch" | "wipe"`, ordinal only for wipes, ISO start/end dates, compact source-backed title, additions, and official URL. Render dates, duration, and cards from that array so constants and prose cannot diverge.
2. Set the reference maximum to the longest **completed wipe-to-wipe** interval derived from the same history (currently 154 days), or name a standalone constant `LONGEST_COMPLETED_WIPE_DAYS = 154`. Never label it an average.
3. Keep the meter width clamped to 100%, but expose three semantic states from a pure helper: `within-reference`, `at-reference`, and `past-reference`. After the threshold, retain the real day count and render `N days · X days past the longest completed wipe` with a distinct warning color. A bar over 100% has no useful scale; a clamped bar plus explicit overflow communicates the state without implying a probability or deadline.
4. Give the meter accessible progress semantics (`aria-valuemin=0`, `aria-valuemax=154`, clamped `aria-valuenow`) and a textual description that preserves the overflow count.
5. Add focused Vitest coverage for UTC calendar-day calculation, every historical boundary, exact threshold, threshold + 1, and a far-overdue ongoing date. A natural location is a pure `src/app/guides/utils/wipeTimeline.ts` plus `wipeTimeline.test.ts`, imported by the guide content component.
6. Replace the current wipe-watch section with two explicitly styled states: `Confirmed` only when a dated direct Caveman/official Steam announcement exists; otherwise `Unconfirmed` with “No official fifth-wipe date announced.” Omit the current late-September estimate unless a separate `Estimate` presentation is intentionally kept.
7. Scope all preparation copy to PvP. Replace `faction reputation` with `Vendor Reputation`, and avoid claiming a complete reset-field list without a direct official source.
8. Standardize both Discord links to the vanity URL above, update guide metadata's `updatedAt` to the implementation date, and recalculate `readTime` from the rewritten copy.

## Confirmed versus inferred summary

**Confirmed:** four wipe updates; dates April 24, September 25, December 22, and April 21; April 2026 moved forward from April 23; PvE progression is separate and unaffected by wipes; the stable official Discord vanity link; the historical feature summaries above.

**Computed from confirmed dates:** completed wipe-to-wipe durations of 154, 88, and 120 days; 154 days as the current historical maximum.

**Not confirmed from accessible first-party sources:** a fifth-wipe date, a late-September 2026 window, an August 15 Dev Peek, a reliable Dev Peek-to-wipe cadence, a reliable pre-wipe-event lead time, or a complete list of every PvP field cleared by a wipe.
