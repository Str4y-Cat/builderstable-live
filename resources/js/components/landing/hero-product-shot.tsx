import {
    ALL_TRAVELERS,
    HERO_DAY_LABEL,
    HERO_PROGRESS,
    HERO_ROWS,
    TRIP_DATES,
    TRIP_DESTINATION,
    TRIP_EVENT_COUNT,
    TRIP_NAME,
    TRIP_TRAVELER_COUNT,
    travelersByIds,
} from '@/components/landing/mock-content';
import {
    MockDayGroup,
    MockItineraryRow,
} from '@/components/landing/mock-itinerary-row';
import { MockProgressRail } from '@/components/landing/mock-progress-rail';
import { Badge } from '@/components/ui/badge';
import { tripTagLabel } from '@/lib/tripLabels';

/**
 * Static twin of the curator trip page (`pages/trips/show.tsx`): the trip
 * header, the 3/5 itinerary column with its sticky progress rail, and the 2/5
 * travelers sidebar. Shows what the app *is*; PropagationDemo further down the
 * page shows what it *does*.
 *
 * Mirrors `trip-header.tsx`, `itinerary-timeline.tsx` and `traveler-list.tsx`.
 * Keep it in step with them — a product shot that flatters is worse than none.
 */
export function HeroProductShot() {
    return (
        <div className="p-4 sm:p-6">
            {/* Trip header — trip-header.tsx */}
            <div className="mb-6 min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-normal">
                        {tripTagLabel.festival}
                    </Badge>
                    <Badge variant="outline" className="font-normal">
                        {tripTagLabel['multi-city']}
                    </Badge>
                </div>
                <h1 className="text-2xl font-bold tracking-tight">
                    {TRIP_NAME}
                </h1>
                <p className="text-muted-foreground">{TRIP_DESTINATION}</p>
                <p className="text-muted-foreground text-sm">{TRIP_DATES}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="secondary">
                        {TRIP_TRAVELER_COUNT} travelers
                    </Badge>
                    <Badge variant="secondary">{TRIP_EVENT_COUNT} events</Badge>
                    <Badge variant="secondary">
                        {HERO_PROGRESS.done}/{HERO_PROGRESS.total} tasks
                    </Badge>
                </div>
            </div>

            {/* Body — show.tsx's 3/5 : 2/5 split */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
                <section className="space-y-4 lg:col-span-3">
                    <div className="flex flex-wrap items-baseline gap-2">
                        <h2 className="text-lg font-semibold">Itinerary</h2>
                        <span className="text-muted-foreground text-sm">
                            {TRIP_EVENT_COUNT} events · {HERO_PROGRESS.done}/
                            {HERO_PROGRESS.total} tasks
                        </span>
                    </div>

                    {/* itinerary-timeline.tsx's two-column shell */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                        {/* The real timeline stacks this rail above the events
                            on small screens. Here that would fill the whole
                            crop with the rail and push the itinerary — the
                            subject of the shot — out of frame, so it only
                            appears once it can sit alongside. */}
                        <aside className="bg-muted/20 hidden shrink-0 rounded-xl border p-3 sm:block sm:w-44 lg:w-48">
                            <MockProgressRail />
                        </aside>
                        <div className="min-w-0 flex-1 space-y-6">
                            <MockDayGroup label={HERO_DAY_LABEL}>
                                {HERO_ROWS.map((row) => (
                                    <MockItineraryRow
                                        key={row.id}
                                        time={row.time}
                                        title={row.title}
                                        location={row.location}
                                        type={row.type}
                                        assigned={travelersByIds(
                                            row.assignedIds,
                                        )}
                                        tasks={row.tasks}
                                        rollup={row.rollup}
                                    />
                                ))}
                            </MockDayGroup>
                        </div>
                    </div>
                </section>

                {/* Travelers card — traveler-list.tsx */}
                <aside className="space-y-4 lg:col-span-2">
                    <section className="rounded-xl border">
                        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
                            <h2 className="text-lg font-semibold">Travelers</h2>
                            <span className="text-muted-foreground text-sm">
                                {TRIP_TRAVELER_COUNT}
                            </span>
                        </div>
                        <div className="space-y-3 border-t px-4 py-3">
                            <ul className="divide-y rounded-lg border">
                                {ALL_TRAVELERS.map((traveler) => (
                                    <li
                                        key={traveler.id}
                                        className="flex flex-wrap items-start justify-between gap-3 px-4 py-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-medium">
                                                {traveler.name}
                                            </p>
                                            <p className="text-muted-foreground text-sm">
                                                {traveler.role}
                                            </p>
                                            <p className="text-muted-foreground truncate text-sm">
                                                {traveler.email}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}
