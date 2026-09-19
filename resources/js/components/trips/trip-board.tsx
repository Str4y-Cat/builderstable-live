import { TripCard } from '@/components/trips/trip-card';
import { Badge } from '@/components/ui/badge';
import { tripStatus } from '@/lib/tripHelpers';
import type { TripStatus, TripSummary } from '@/types/trip';

const COLUMN_META: { status: TripStatus; label: string }[] = [
    { status: 'upcoming', label: 'Upcoming' },
    { status: 'ongoing', label: 'Ongoing' },
    { status: 'past', label: 'Past' },
];

export function TripBoard({ trips }: { trips: TripSummary[] }) {
    const columns = COLUMN_META.map((meta) => ({
        ...meta,
        trips: trips.filter((trip) => tripStatus(trip) === meta.status),
    }));

    return (
        <div className="-mx-4 flex-1 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex min-h-full min-w-[48rem] gap-4 lg:min-w-0 lg:grid lg:grid-cols-3 lg:auto-rows-fr">
                {columns.map((column) => (
                    <section
                        key={column.status}
                        className="flex w-72 shrink-0 flex-col rounded-xl border bg-muted/30 lg:w-auto"
                    >
                        <header className="flex items-center justify-between gap-2 border-b px-3 py-3">
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-semibold">{column.label}</h2>
                                <Badge variant="secondary" className="tabular-nums">
                                    {column.trips.length}
                                </Badge>
                            </div>
                        </header>
                        <div className="flex flex-1 flex-col gap-3 p-3">
                            {column.trips.map((trip) => (
                                <TripCard key={trip.id} trip={trip} />
                            ))}
                            {column.trips.length === 0 ? (
                                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed px-3 py-8 text-center text-sm text-muted-foreground">
                                    No {column.label.toLowerCase()} trips
                                </div>
                            ) : null}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
