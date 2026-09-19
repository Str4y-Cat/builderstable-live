import { responseRollup } from '@/lib/tripHelpers';
import type { ItineraryItem, Trip } from '@/types/trip';

export function ResponseRollup({
    trip,
    item,
}: {
    trip: Trip;
    item: ItineraryItem;
}) {
    const rollup = responseRollup(trip, item);

    return (
        <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{rollup.confirmed}</span>{' '}
            confirmed
            <span className="mx-1.5 text-border">·</span>
            <span className="font-semibold text-foreground">{rollup.declined}</span>{' '}
            declined
            <span className="mx-1.5 text-border">·</span>
            <span className="font-semibold text-foreground">{rollup.pending}</span>{' '}
            pending
        </p>
    );
}
