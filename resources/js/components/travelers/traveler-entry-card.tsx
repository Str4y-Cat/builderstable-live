import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { itemTypeBadgeClass, itemTypeLabel } from '@/lib/itemTypeStyles';
import { getResponse, isRecentlyUpdated } from '@/lib/tripHelpers';
import { respond } from '@/routes/trips';
import type { ItineraryItem, ResponseStatus, Traveler, Trip } from '@/types/trip';

export function TravelerEntryCard({
    trip,
    item,
    traveler,
}: {
    trip: Trip;
    item: ItineraryItem;
    traveler: Traveler;
}) {
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        setEditing(false);
    }, [item.id]);

    const response = getResponse(trip, item.id, traveler.id);
    const responseStatus: ResponseStatus | null = response?.status ?? null;
    const updated = isRecentlyUpdated(item, response);
    const hasSettledResponse =
        responseStatus === 'confirmed' || responseStatus === 'declined';
    const needsResponse =
        responseStatus === 'pending' || (!response && updated);
    const showActions = editing || needsResponse;
    const metaLine = [item.time, item.location].filter(Boolean).join(' · ');

    function respondTo(status: Exclude<ResponseStatus, 'pending'>) {
        router.post(respond.url(traveler.shareCode), {
            itinerary_item_id: item.id,
            status,
        });
        setEditing(false);
    }

    return (
        <article className="space-y-3 px-4 py-4">
            <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge className={itemTypeBadgeClass(item.type)}>
                        {itemTypeLabel(item.type)}
                    </Badge>
                    {updated ? <Badge variant="outline">Updated</Badge> : null}
                    {responseStatus === 'confirmed' ? (
                        <Badge className="border-transparent bg-green-100 text-green-800">
                            Confirmed
                        </Badge>
                    ) : null}
                    {responseStatus === 'declined' ? (
                        <Badge variant="destructive">Declined</Badge>
                    ) : null}
                </div>
                <h3 className="leading-snug font-medium">{item.title}</h3>
                {metaLine ? (
                    <p className="text-sm text-muted-foreground">{metaLine}</p>
                ) : null}
                {item.description ? (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                ) : null}
            </div>
            {showActions ? (
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => respondTo('confirmed')}>
                        Confirm
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => respondTo('declined')}
                    >
                        Decline
                    </Button>
                </div>
            ) : hasSettledResponse ? (
                <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                        Change response
                    </Button>
                </div>
            ) : null}
        </article>
    );
}
