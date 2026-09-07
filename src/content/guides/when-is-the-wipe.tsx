import { CalendarClock, ExternalLink, History, Info, Radio } from 'lucide-react';

import {
  LONGEST_COMPLETED_WIPE_DAYS,
  WIPE_PERIODS,
  getWipeDurationState,
  toUtcIsoCalendarDate,
  type WipePeriod,
} from '@/app/guides/utils/wipeTimeline';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const OFFICIAL_STATUS_CHECKED_AT = '2026-09-06';
const OFFICIAL_DISCORD_URL = 'https://discord.com/invite/contractorsshowdown';
const OFFICIAL_STEAM_URL =
  'https://store.steampowered.com/news/app/2719160?updates=true';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
});

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00.000Z`));
}

function getOrdinal(value: number) {
  const remainder = value % 100;

  if (remainder >= 11 && remainder <= 13) {
    return `${value}th`;
  }

  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

function getPeriodHeading(period: WipePeriod) {
  return period.kind === 'launch'
    ? 'Public alpha launch'
    : `${getOrdinal(period.ordinal)} wipe`;
}

function WipeDuration({ period, today }: { period: WipePeriod; today: string }) {
  const endDate = period.endDate ?? today;
  const state = getWipeDurationState(period.startDate, endDate);
  const isOverReference = state.status === 'past-reference';
  const durationLabel = period.endDate
    ? `${state.days} days until the next wipe`
    : `${state.days} days in the current wipe period`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-[0.14em] text-ink-muted">
        <span>{durationLabel}</span>
        <span className={cn('font-mono', isOverReference && 'text-warn')}>
          {state.days}d
        </span>
      </div>
      <Progress
        aria-label={durationLabel}
        aria-valuemax={state.referenceDays}
        aria-valuemin={0}
        aria-valuenow={Math.min(state.days, state.referenceDays)}
        className={cn(
          'h-2 rounded-none bg-track [&_[data-slot=progress-indicator]]:bg-info',
          isOverReference && '[&_[data-slot=progress-indicator]]:bg-warn',
        )}
        value={state.progressPercentage}
      />
      {!period.endDate && isOverReference ? (
        <p className="text-xs leading-relaxed text-warn">
          {state.overflowDays} days beyond the longest completed wipe-to-wipe period.
          This is context, not a forecast.
        </p>
      ) : null}
    </div>
  );
}

function WipeHistoryCard({ period, today }: { period: WipePeriod; today: string }) {
  return (
    <Card
      className={cn(
        'rounded-none border-line bg-steel-2',
        !period.endDate && 'border-warn/50 bg-warn/5',
      )}
    >
      <CardHeader className="gap-3 border-b border-line-subtle pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="font-display text-xl uppercase tracking-[0.06em] text-ink">
            {getPeriodHeading(period)}
          </CardTitle>
          <Badge
            className={cn(
              'rounded-none border-line bg-steel-3 text-ink-muted',
              !period.endDate && 'border-warn/50 bg-warn/10 text-warn',
            )}
            variant="outline"
          >
            {period.endDate ? 'Completed' : 'Current'}
          </Badge>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-muted">
          {formatDate(period.startDate)}
          {period.endDate ? ` — ${formatDate(period.endDate)}` : ' — present'}
        </p>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <ul className="space-y-2 text-sm leading-relaxed text-ink-muted">
          {period.additions.map((highlight) => (
            <li className="flex gap-3" key={highlight}>
              <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 bg-info" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>

        <WipeDuration period={period} today={today} />

        <div className="flex flex-wrap gap-2">
          {period.sources.map((source) => (
            <Button asChild className="min-h-11 rounded-none" key={source.url} variant="outline">
              <a href={source.url} rel="noreferrer" target="_blank">
                {source.label}
                <ExternalLink aria-hidden="true" />
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function WhenIsTheWipeGuide() {
  const today = toUtcIsoCalendarDate(new Date());
  const newestFirst = [...WIPE_PERIODS].reverse();

  return (
    <article className="mx-auto max-w-4xl space-y-12 text-ink">
      <section
        aria-labelledby="wipe-status-heading"
        className="clip-shoulder border border-warn/50 bg-steel-2 p-5 sm:p-7"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Badge className="rounded-none border-warn/50 bg-warn/10 text-warn" variant="outline">
            <Radio aria-hidden="true" />
            Unconfirmed
          </Badge>
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-ink-muted">
            Checked {formatDate(OFFICIAL_STATUS_CHECKED_AT)}
          </span>
        </div>

        <h2
          className="font-display text-3xl uppercase tracking-[0.04em] text-ink sm:text-4xl"
          id="wipe-status-heading"
        >
          No official fifth-wipe date
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-muted">
          Caveman Studio has not published a fifth-wipe date in the publicly accessible official
          announcements we could verify. We do not convert past timing into an estimate: announced
          targets have changed before, and a long-running period is not evidence of an imminent
          wipe.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="min-h-12 rounded-none bg-ember text-ink-inverse hover:bg-ember-bright">
            <a href={OFFICIAL_DISCORD_URL} rel="noreferrer" target="_blank">
              Official Discord
              <ExternalLink aria-hidden="true" />
            </a>
          </Button>
          <Button asChild className="min-h-12 rounded-none" variant="outline">
            <a href={OFFICIAL_STEAM_URL} rel="noreferrer" target="_blank">
              Official Steam news
              <ExternalLink aria-hidden="true" />
            </a>
          </Button>
        </div>
      </section>

      <section aria-labelledby="wipe-scope-heading" className="space-y-5">
        <div className="flex items-center gap-3">
          <Info aria-hidden="true" className="size-5 text-info" />
          <h2
            className="font-display text-2xl uppercase tracking-[0.06em] text-ink"
            id="wipe-scope-heading"
          >
            PvP and PvE do not share wipe scope
          </h2>
        </div>
        <Card className="rounded-none border-info/40 bg-info/5">
          <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-ink-muted">
            <p>
              The fourth-wipe announcement states that PvE progression is separate from PvP and is
              unaffected by wipes. That makes a PvP wipe announcement inapplicable to PvE
              progression unless Caveman Studio explicitly says otherwise.
            </p>
            <p>
              The public announcement does not provide a field-by-field list of every affected PvP
              value. Treat more specific claims about retained or cleared inventory, Tasks, Vendor
              Reputation, and Hideout progress as unconfirmed until an official announcement names
              them.
            </p>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="wipe-history-heading" className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <History aria-hidden="true" className="size-5 text-info" />
            <h2
              className="font-display text-2xl uppercase tracking-[0.06em] text-ink"
              id="wipe-history-heading"
            >
              Official wipe history
            </h2>
          </div>
          <p className="max-w-3xl text-sm leading-relaxed text-ink-muted">
            Four numbered wipes are documented in official announcements. The public alpha launch
            is included as the start of the first tracked progression period, not counted as a
            numbered wipe.
          </p>
        </div>

        <div className="grid gap-5">
          {newestFirst.map((period) => (
            <WipeHistoryCard key={period.id} period={period} today={today} />
          ))}
        </div>

        <div className="flex gap-3 border-l-2 border-info bg-steel-2 p-4 text-sm leading-relaxed text-ink-muted">
          <CalendarClock aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-info" />
          <p>
            The longest completed wipe-to-wipe period was {LONGEST_COMPLETED_WIPE_DAYS} days. The
            progress bars compare elapsed time with that historical maximum; they are not countdowns
            or predictions.
          </p>
        </div>
      </section>

      <section aria-labelledby="date-policy-heading" className="space-y-3 border-t border-line pt-8">
        <h2
          className="font-display text-xl uppercase tracking-[0.06em] text-ink"
          id="date-policy-heading"
        >
          How dates are reported
        </h2>
        <p className="text-sm leading-relaxed text-ink-muted">
          This guide records the date each wipe actually shipped. Announced targets stay in the
          source history when relevant, but they do not replace the release date: the second wipe
          moved from its initial September 4 target to September 25, and the fourth moved forward
          from April 23 to April 21.
        </p>
      </section>
    </article>
  );
}
