import { MockAvatar } from '@/components/landing/mock-avatar';
import { MockItineraryRow } from '@/components/landing/mock-itinerary-row';
import {
    AFFECTED_TRAVELERS,
    HERO_ROWS,
    TRIP_DATES,
    TRIP_DESTINATION,
    TRIP_NAME,
    UNAFFECTED_TRAVELERS,
} from '@/components/landing/mock-content';
import { Badge } from '@/components/ui/badge';
import { initials } from '@/lib/tripHelpers';
import { tripBadgeClass, tripBadgeLabel, tripTagLabel } from '@/lib/tripLabels';

const railTravelers = [...AFFECTED_TRAVELERS, ...UNAFFECTED_TRAVELERS];

/**
 * Static composition of the curator surface. Shows what the app *is*;
 * PropagationDemo further down the page shows what it *does*.
 */
export function HeroProductShot() {
    return (
        <div className="grid gap-0 sm:grid-cols-[1fr_240px]">
            <div className="min-w-0 space-y-4 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 space-y-1.5">
                        <Badge className={tripBadgeClass.locked}>
                            {tripBadgeLabel.locked}
                        </Badge>
                        <h3 className="truncate text-lg font-semibold tracking-tight">
                            {TRIP_NAME}
                        </h3>
                        <p className="text-muted-foreground truncate text-xs">
                            {TRIP_DESTINATION} · {TRIP_DATES}
                        </p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                        <Badge variant="outline" className="font-normal">
                            {tripTagLabel.festival}
                        </Badge>
                        <Badge variant="outline" className="font-normal">
                            {tripTagLabel['multi-city']}
                        </Badge>
                    </div>
                </div>

                <div className="border-border space-y-1 border-t pt-3">
                    <p className="text-muted-foreground px-3 pb-1 text-[11px] font-medium tracking-wide uppercase">
                        Friday, Jan 23
                    </p>
                    {HERO_ROWS.map((row) => (
                        <MockItineraryRow
                            key={row.id}
                            time={row.time}
                            title={row.title}
                            location={row.location}
                            type={row.type}
                            attendees={row.attendees}
                        />
                    ))}
                </div>
            </div>

            {/* Traveler rail */}
            <aside className="border-border space-y-3 p-4 sm:border-l sm:p-5">
                <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                    Travelers · {railTravelers.length}
                </p>
                <div className="space-y-2.5">
                    {railTravelers.map((person) => (
                        <div
                            key={person.id}
                            className="flex items-center gap-2.5"
                        >
                            <MockAvatar
                                label={initials(person.name)}
                                size="md"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium">
                                    {person.name}
                                </p>
                                <p className="text-muted-foreground truncate text-[11px]">
                                    {person.role}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
}
